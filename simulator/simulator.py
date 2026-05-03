# simulator/simulator.py
# Simulates ESP32 + sensors (CO2, Temperature, Gas)
# Sends realistic data via MQTT

import paho.mqtt.client as mqtt
import json
import time
import math
import random
from datetime import datetime
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import *

# ── Global State ────────────────────────────────────────────────
VENTILATION_ACTIVE = False

# ── MQTT Callbacks ──────────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Simulator connected to Mosquitto broker")
        client.subscribe("factory/actuators/#")
    else:
        print(f"❌ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    global VENTILATION_ACTIVE
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        if topic == "factory/actuators/vent":
            VENTILATION_ACTIVE = payload.get("enabled", False)
            state_str = "ON 🌬️" if VENTILATION_ACTIVE else "OFF 🛑"
            print(f"\n[ACTUATOR] Ventilation is now {state_str}")
    except Exception as e:
        print(f"Error parsing actuator message: {e}")

def on_publish(client, userdata, mid):
    pass  # silent, we log manually below

# ── Realistic Data Generation ───────────────────────────────────
def get_time_factor():
    """Simulates industrial activity cycle (higher pollution during work hours)"""
    hour = datetime.now().hour
    # Peak hours : 8h-12h and 14h-18h
    return 1.0 + 0.5 * (math.sin(2 * math.pi * (hour - 8) / 16) + 1) / 2

def generate_co2(anomaly=False):
    """CO2 in ppm — normal: 400-600, danger: >800"""
    base = 400 + 150 * get_time_factor()
    noise = random.gauss(0, 20)
    if anomaly:
        return round(base + noise + random.uniform(300, 500), 2)
    return round(base + noise, 2)

def generate_temperature(anomaly=False):
    """Temperature in °C — normal: 20-45, danger: >60"""
    global VENTILATION_ACTIVE
    base = 25 + 15 * get_time_factor()
    noise = random.gauss(0, 1.5)
    temp = base + noise
    if anomaly:
        temp += random.uniform(20, 35)
        
    if VENTILATION_ACTIVE:
        return min(round(temp, 2), 39.0)
    return round(temp, 2)

def generate_gas(anomaly=False):
    """Gas level in ppm — normal: 0-200, danger: >350"""
    base = 50 + 100 * get_time_factor()
    noise = random.gauss(0, 15)
    value = base + noise
    if anomaly:
        value += random.uniform(150, 300)
    return round(max(0, min(700, value)), 2)

def generate_pm10(anomaly=False):
    """PM10 in µg/m³ — normal: 10-100, danger: >120"""
    base = 30 + 50 * get_time_factor()
    noise = random.gauss(0, 10)
    if anomaly:
        return round(base + noise + random.uniform(50, 100), 2)
    return round(max(0, base + noise), 2)

def generate_ch4(anomaly=False):
    """CH4 in ppm — normal: 0.5-2.5, danger: >3.0"""
    base = 1.0 + 1.0 * get_time_factor()
    noise = random.gauss(0, 0.2)
    if anomaly:
        return round(base + noise + random.uniform(1.0, 2.0), 2)
    return round(max(0, base + noise), 2)

def generate_vocs(anomaly=False):
    """VOCs in ppb — normal: 0-150, danger: >180"""
    base = 20 + 80 * get_time_factor()
    noise = random.gauss(0, 15)
    if anomaly:
        return round(base + noise + random.uniform(50, 100), 2)
    return round(max(0, base + noise), 2)

def generate_co(anomaly=False):
    """CO in ppm — normal: 0.1-3.0, danger: >4.0"""
    base = 0.5 + 1.5 * get_time_factor()
    noise = random.gauss(0, 0.3)
    if anomaly:
        return round(base + noise + random.uniform(1.5, 3.0), 2)
    return round(max(0, base + noise), 2)

def generate_humidity(anomaly=False):
    """Humidity in % — normal: 35-70"""
    base = 50 + 10 * math.sin(2 * math.pi * datetime.now().hour / 24)
    noise = random.gauss(0, 5)
    return round(max(0, min(100, base + noise)), 2)

def generate_wind_direction(anomaly=False):
    """Wind Direction in degrees — 0-360"""
    # Slowly drifting wind
    base = (datetime.now().minute * 6) % 360
    noise = random.gauss(0, 10)
    return round((base + noise) % 360, 2)

def should_trigger_anomaly(anomaly_probability=0.05):
    """5% chance of anomaly at each cycle"""
    return random.random() < anomaly_probability

# ── Main Loop ───────────────────────────────────────────────────
def run_simulator():
    client = mqtt.Client(client_id="esp32_simulator")
    client.on_connect = on_connect
    client.on_publish = on_publish
    client.on_message = on_message

    print("🔄 Connecting to broker...")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()

    time.sleep(1)  # wait for connection
    print(f"📡 Publishing every {PUBLISH_INTERVAL}s on topics:")
    print(f"   → {TOPIC_CO2}")
    print(f"   → {TOPIC_TEMPERATURE}")
    print(f"   → {TOPIC_GAS}")
    print(f"   → {TOPIC_PM10}")
    print(f"   → {TOPIC_CH4}")
    print(f"   → {TOPIC_VOCS}")
    print(f"   → {TOPIC_CO}")
    print(f"   → {TOPIC_HUMIDITY}")
    print(f"   → {TOPIC_WIND_DIR}")
    print("─" * 50)

    cycle = 0
    try:
        while True:
            cycle += 1
            anomaly = should_trigger_anomaly()
            timestamp = datetime.now().isoformat()

            # Generate sensor readings
            co2_payload = {
                "sensor": "co2",
                "value": generate_co2(anomaly),
                "unit": "ppm",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            temp_payload = {
                "sensor": "temperature",
                "value": generate_temperature(anomaly),
                "unit": "celsius",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            gas_payload = {
                "sensor": "gas",
                "value": generate_gas(anomaly),
                "unit": "normalized",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            pm10_payload = {
                "sensor": "pm10",
                "value": generate_pm10(anomaly),
                "unit": "ug/m3",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            ch4_payload = {
                "sensor": "ch4",
                "value": generate_ch4(anomaly),
                "unit": "ppm",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            vocs_payload = {
                "sensor": "vocs",
                "value": generate_vocs(anomaly),
                "unit": "ppb",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            co_payload = {
                "sensor": "co",
                "value": generate_co(anomaly),
                "unit": "ppm",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            humidity_payload = {
                "sensor": "humidity",
                "value": generate_humidity(anomaly),
                "unit": "%",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            wind_dir_payload = {
                "sensor": "wind_direction",
                "value": generate_wind_direction(anomaly),
                "unit": "degrees",
                "timestamp": timestamp,
                "anomaly": anomaly
            }

            # Publish to MQTT
            client.publish(TOPIC_CO2, json.dumps(co2_payload))
            client.publish(TOPIC_TEMPERATURE, json.dumps(temp_payload))
            client.publish(TOPIC_GAS, json.dumps(gas_payload))
            client.publish(TOPIC_PM10, json.dumps(pm10_payload))
            client.publish(TOPIC_CH4, json.dumps(ch4_payload))
            client.publish(TOPIC_VOCS, json.dumps(vocs_payload))
            client.publish(TOPIC_CO, json.dumps(co_payload))
            client.publish(TOPIC_HUMIDITY, json.dumps(humidity_payload))
            client.publish(TOPIC_WIND_DIR, json.dumps(wind_dir_payload))

            # Console log
            status = "⚠️  ANOMALY" if anomaly else "✅ normal"
            print(f"[Cycle {cycle:04d}] {timestamp} | {status}")
            print(f"  CO₂: {co2_payload['value']} ppm | "
                  f"Temp: {temp_payload['value']} °C | "
                  f"Gas: {gas_payload['value']} | "
                  f"PM10: {pm10_payload['value']} µg/m³")
            print()

            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print("\n🛑 Simulator stopped.")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_simulator()