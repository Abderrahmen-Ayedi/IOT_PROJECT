# backend/mqtt_subscriber.py

import paho.mqtt.client as mqtt
import json, sys, os, asyncio
import pickle
import random
import pandas as pd

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config import *
from backend.database import SessionLocal, SensorReading, Alert

# ─────────────────────────────────────────────────────────────
# ML Model
# ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'xgb_industrial_model.pkl'))
try:
    with open(MODEL_PATH, 'rb') as f:
        ml_model = pickle.load(f)
    print("[OK] ML Model loaded successfully")
except Exception as e:
    print(f"[ERROR] Failed to load ML Model: {e}")
    ml_model = None

# ─────────────────────────────────────────────────────────────
# InfluxDB Configuration
# ─────────────────────────────────────────────────────────────

INFLUX_URL = "http://localhost:8086"

INFLUX_TOKEN = "20rV8hir6Wu_7hjfCunqztNMfUWNBdtqFECNK8aj1a005nRE2Zhqpl7vzSX0gvht0b5cNZvq_2klWfFktHVBlg=="

INFLUX_ORG = "iot"

INFLUX_BUCKET = "iot_data"

# Create client
influx_client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)

write_api = influx_client.write_api(write_options=SYNCHRONOUS)

# ─────────────────────────────────────────────────────────────
# Threshold check
# ─────────────────────────────────────────────────────────────

def check_thresholds(sensor, value):

    if sensor == "co2":
        if value > THRESHOLD_CO2:
            return "CRITICAL", f"CO₂ too high : {value} ppm"

        elif value > THRESHOLD_CO2 * 0.8:
            return "WARNING", f"CO₂ approaching limit : {value} ppm"

    elif sensor == "temperature":

        if value > THRESHOLD_TEMPERATURE:
            return "CRITICAL", f"Temperature too high : {value} °C"

        elif value > THRESHOLD_TEMPERATURE * 0.85:
            return "WARNING", f"Temperature approaching limit : {value} °C"

    elif sensor == "gas":

        if value > THRESHOLD_GAS:
            return "CRITICAL", f"Gas level dangerous : {value}"

        elif value > THRESHOLD_GAS * 0.8:
            return "WARNING", f"Gas level elevated : {value}"

    return None, None

# ─────────────────────────────────────────────────────────────
# Save to SQL + InfluxDB
# ─────────────────────────────────────────────────────────────

def save_reading(payload):

    db = SessionLocal()

    try:
        # =========================
        # Save into SQL database
        # =========================

        reading = SensorReading(
            sensor    = payload["sensor"],
            value     = payload["value"],
            unit      = payload["unit"],
            timestamp = payload["timestamp"],
            anomaly   = payload.get("anomaly", False)
        )

        db.add(reading)

        # =========================
        # Check alerts
        # =========================

        status, message = check_thresholds(
            payload["sensor"],
            payload["value"]
        )

        if status:

            alert = Alert(
                sensor    = payload["sensor"],
                value     = payload["value"],
                status    = status,
                message   = message,
                timestamp = payload["timestamp"]
            )

            db.add(alert)

        db.commit()

        # =========================
        # Save into InfluxDB
        # =========================

        point = (
            Point("sensor_data")
            .tag("sensor", payload["sensor"])
            .tag("unit", payload["unit"])
            .field("value", float(payload["value"]))
        )

        write_api.write(
            bucket=INFLUX_BUCKET,
            org=INFLUX_ORG,
            record=point
        )

        print(f"[DB] Written to InfluxDB -> {payload['sensor']} : {payload['value']}")

        return status

    except Exception as e:

        print(f"[DB ERROR] DB error : {e}")
        db.rollback()
        return None

    finally:
        db.close()

# ─────────────────────────────────────────────────────────────
# Consolidated data storage for WebSocket broadcast
# ─────────────────────────────────────────────────────────────

last_readings = {
    "co2": None,
    "temperature": None,
    "humidity": None,
    "gas": None,
    "pm10": None,
    "ch4": None,
    "vocs": None,
    "co": None,
    "wind_direction": None,
    "timestamp": None
}

# ─────────────────────────────────────────────────────────────
# Build broadcast message
# ─────────────────────────────────────────────────────────────

def build_broadcast(payload, status):
    """Build a consolidated message for all connected WebSocket clients"""
    
    global last_readings
    
    # Map sensor names to expected field names
    sensor_map = {
        "co2": "co2",
        "temperature": "temperature",
        "humidity": "humidity",
        "gas": "gas",
        "pm10": "pm10",
        "ch4": "ch4",
        "vocs": "vocs",
        "co": "co",
        "wind_direction": "wind_direction"
    }
    
    sensor_name = payload["sensor"].lower()
    if sensor_name in sensor_map:
        last_readings[sensor_map[sensor_name]] = payload["value"]
    
    last_readings["timestamp"] = payload["timestamp"]

    # ML Prediction
    pm25_pred = None
    if ml_model is not None:
        feature_mapping = {
            'PM10': last_readings["pm10"],
            'CO2': last_readings["co2"],
            'CH4': last_readings["ch4"],
            'VOCs': last_readings["vocs"],
            'CO': last_readings["co"],
            'Temperature': last_readings["temperature"],
            'Humidity': last_readings["humidity"],
            'Wind_Direction': last_readings["wind_direction"]
        }
        
        if all(v is not None for v in feature_mapping.values()):
            try:
                df = pd.DataFrame([feature_mapping])
                pred = ml_model.predict(df)[0]
                pm25_pred = round(float(pred), 2)
            except Exception as e:
                print(f"[ERROR] ML Prediction error: {e}")

    # Return consolidated data with all latest readings
    return {
        "type": "sensor_update",
        "co2": last_readings["co2"],
        "temperature": last_readings["temperature"],
        "humidity": last_readings["humidity"],
        "gas": last_readings["gas"],
        "pm10": last_readings["pm10"],
        "ch4": last_readings["ch4"],
        "vocs": last_readings["vocs"],
        "co": last_readings["co"],
        "wind_direction": last_readings["wind_direction"],
        "pm25_prediction": pm25_pred,
        "timestamp": last_readings["timestamp"],
        "alert": status,
        "sensor": sensor_name,
        "value": payload["value"]
    }

# ─────────────────────────────────────────────────────────────
# MQTT Callbacks
# ─────────────────────────────────────────────────────────────

VENTILATION_ENABLED = False

def make_on_message(manager, loop):

    def on_message(client, userdata, msg):
        global VENTILATION_ENABLED
        try:

            payload = json.loads(msg.payload.decode())

            # ── SIMULATED COOLING OVERRIDE ──
            if payload.get("sensor", "").lower() == "temperature" and VENTILATION_ENABLED:
                if payload.get("value", 0) > 39.0:
                    old_val = payload["value"]
                    payload["value"] = round(random.uniform(38.0, 39.0), 2)
                    print(f"[VENT OVERRIDE] Dropped Temp from {old_val} to {payload['value']} C")

            status = save_reading(payload)

            # Broadcast to WebSocket clients
            message = build_broadcast(payload, status)

            asyncio.run_coroutine_threadsafe(
                manager.broadcast(message),
                loop
            )

            print(
                f"[SAVE] Saved + broadcast -> "
                f"{payload['sensor']} : {payload['value']}"
            )

        except Exception as e:

            print(f"[ERROR] Error : {e}")

    return on_message

def on_connect(client, userdata, flags, rc):

    if rc == 0:

        print("[MQTT] Subscriber connected")

        client.subscribe(TOPIC_ALL)

    else:

        print(f"[ERROR] Connection failed : {rc}")

# ─────────────────────────────────────────────────────────────
# Start subscriber
# ─────────────────────────────────────────────────────────────

def start_mqtt_subscriber(manager):

    loop = asyncio.get_event_loop()

    client = mqtt.Client(client_id="fastapi_subscriber")

    client.on_connect = on_connect

    client.on_message = make_on_message(manager, loop)

    client.connect(
        BROKER_HOST,
        BROKER_PORT,
        keepalive=60
    )

    client.loop_start()

    print("[MQTT] Subscriber running in background...")