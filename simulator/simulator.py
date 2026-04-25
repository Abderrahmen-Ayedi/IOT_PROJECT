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

# ── MQTT Callbacks ──────────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Simulator connected to Mosquitto broker")
    else:
        print(f"❌ Connection failed with code {rc}")

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
    base = 25 + 15 * get_time_factor()
    noise = random.gauss(0, 1.5)
    if anomaly:
        return round(base + noise + random.uniform(20, 35), 2)
    return round(base + noise, 2)

def generate_gas(anomaly=False):
    """Gas level normalized 0.0-1.0 — danger: >0.7"""
    base = 0.2 + 0.3 * get_time_factor()
    noise = random.gauss(0, 0.03)
    value = base + noise
    if anomaly:
        value += random.uniform(0.3, 0.5)
    return round(max(0.0, min(1.0, value)), 3)

def should_trigger_anomaly(anomaly_probability=0.05):
    """5% chance of anomaly at each cycle"""
    return random.random() < anomaly_probability

# ── Main Loop ───────────────────────────────────────────────────
def run_simulator():
    client = mqtt.Client(client_id="esp32_simulator")
    client.on_connect = on_connect
    client.on_publish = on_publish

    print("🔄 Connecting to broker...")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()

    time.sleep(1)  # wait for connection
    print(f"📡 Publishing every {PUBLISH_INTERVAL}s on topics:")
    print(f"   → {TOPIC_CO2}")
    print(f"   → {TOPIC_TEMPERATURE}")
    print(f"   → {TOPIC_GAS}")
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

            # Publish to MQTT
            client.publish(TOPIC_CO2, json.dumps(co2_payload))
            client.publish(TOPIC_TEMPERATURE, json.dumps(temp_payload))
            client.publish(TOPIC_GAS, json.dumps(gas_payload))

            # Console log
            status = "⚠️  ANOMALY" if anomaly else "✅ normal"
            print(f"[Cycle {cycle:04d}] {timestamp} | {status}")
            print(f"  CO₂: {co2_payload['value']} ppm | "
                  f"Temp: {temp_payload['value']} °C | "
                  f"Gas: {gas_payload['value']}")
            print()

            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print("\n🛑 Simulator stopped.")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_simulator()