# backend/mqtt_subscriber.py
import paho.mqtt.client as mqtt
import json, sys, os, asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import *
from backend.database import SessionLocal, SensorReading, Alert

# ── Threshold check ──────────────────────────────────────────────
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

# ── Save to DB ───────────────────────────────────────────────────
def save_reading(payload):
    db = SessionLocal()
    try:
        reading = SensorReading(
            sensor    = payload["sensor"],
            value     = payload["value"],
            unit      = payload["unit"],
            timestamp = payload["timestamp"],
            anomaly   = payload.get("anomaly", False)
        )
        db.add(reading)

        status, message = check_thresholds(payload["sensor"], payload["value"])
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
        return status  # return status so we know if alert was triggered

    except Exception as e:
        print(f"❌ DB error : {e}")
        db.rollback()
        return None
    finally:
        db.close()

# ── Build broadcast message ──────────────────────────────────────
def build_broadcast(payload, status):
    return {
        "type"     : "sensor_update",
        "sensor"   : payload["sensor"],
        "value"    : payload["value"],
        "unit"     : payload["unit"],
        "timestamp": payload["timestamp"],
        "anomaly"  : payload.get("anomaly", False),
        "alert"    : status   # None, WARNING, or CRITICAL
    }

# ── MQTT Callbacks ───────────────────────────────────────────────
def make_on_message(manager, loop):
    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            status  = save_reading(payload)

            # Broadcast to all WebSocket clients
            message = build_broadcast(payload, status)
            asyncio.run_coroutine_threadsafe(
                manager.broadcast(message),
                loop
            )
            print(f"💾 Saved + broadcast → {payload['sensor']} : {payload['value']}")

        except Exception as e:
            print(f"❌ Error : {e}")
    return on_message

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ MQTT Subscriber connected")
        client.subscribe(TOPIC_ALL)
    else:
        print(f"❌ Connection failed : {rc}")

# ── Start subscriber ─────────────────────────────────────────────
def start_mqtt_subscriber(manager):
    loop = asyncio.get_event_loop()   # get FastAPI's event loop

    client = mqtt.Client(client_id="fastapi_subscriber")
    client.on_connect = on_connect
    client.on_message = make_on_message(manager, loop)
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()
    print("📡 MQTT Subscriber running in background...")