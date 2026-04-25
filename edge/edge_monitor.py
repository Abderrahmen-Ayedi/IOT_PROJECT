# edge/edge_monitor.py
# Simulates the Edge Layer (Raspberry Pi)
# Listens to MQTT, detects threshold violations, triggers immediate alerts

import paho.mqtt.client as mqtt
import json
import sys
import os
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import *

# ── Alert Colors for Console ────────────────────────────────────
RED    = "\033[91m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
RESET  = "\033[0m"

# ── Alert Logic ─────────────────────────────────────────────────
def check_thresholds(sensor, value):
    """
    Returns (status, message) based on sensor value vs thresholds
    status : 'CRITICAL', 'WARNING', 'OK'
    """
    if sensor == "co2":
        if value > THRESHOLD_CO2:
            return "CRITICAL", f"CO₂ too high : {value} ppm (limit: {THRESHOLD_CO2})"
        elif value > THRESHOLD_CO2 * 0.8:
            return "WARNING", f"CO₂ approaching limit : {value} ppm"
        return "OK", f"CO₂ normal : {value} ppm"

    elif sensor == "temperature":
        if value > THRESHOLD_TEMPERATURE:
            return "CRITICAL", f"Temperature too high : {value} °C (limit: {THRESHOLD_TEMPERATURE})"
        elif value > THRESHOLD_TEMPERATURE * 0.85:
            return "WARNING", f"Temperature approaching limit : {value} °C"
        return "OK", f"Temperature normal : {value} °C"

    elif sensor == "gas":
        if value > THRESHOLD_GAS:
            return "CRITICAL", f"Gas level dangerous : {value} (limit: {THRESHOLD_GAS})"
        elif value > THRESHOLD_GAS * 0.8:
            return "WARNING", f"Gas level elevated : {value}"
        return "OK", f"Gas normal : {value}"

    return "UNKNOWN", f"Unknown sensor : {sensor}"

def print_alert(status, message, timestamp):
    """Prints colored alert to console"""
    if status == "CRITICAL":
        color = RED
        icon  = "🚨"
    elif status == "WARNING":
        color = YELLOW
        icon  = "⚠️ "
    else:
        color = GREEN
        icon  = "✅"

    print(f"{color}[{timestamp}] {icon} {status} — {message}{RESET}")

# ── MQTT Callbacks ───────────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Edge Monitor connected to broker")
        print(f"👂 Listening on : {TOPIC_ALL}")
        print(f"📊 Thresholds → CO₂: {THRESHOLD_CO2}ppm | "
              f"Temp: {THRESHOLD_TEMPERATURE}°C | "
              f"Gas: {THRESHOLD_GAS}")
        print("─" * 55)
        client.subscribe(TOPIC_ALL)
    else:
        print(f"❌ Connection failed : {rc}")

def on_message(client, userdata, msg):
    try:
        # Parse incoming MQTT message
        payload = json.loads(msg.payload.decode())
        sensor    = payload.get("sensor")
        value     = payload.get("value")
        timestamp = payload.get("timestamp", datetime.now().isoformat())

        # Check against thresholds
        status, message = check_thresholds(sensor, value)

        # Only print WARNING and CRITICAL to keep logs clean
        if status in ("CRITICAL", "WARNING"):
            print_alert(status, message, timestamp)

            # Log to file for persistence
            log_alert(status, sensor, value, timestamp)

    except json.JSONDecodeError:
        print(f"❌ Invalid JSON received on {msg.topic}")
    except Exception as e:
        print(f"❌ Error processing message : {e}")

# ── File Logging ─────────────────────────────────────────────────
def log_alert(status, sensor, value, timestamp):
    """Saves alerts to a local log file — simulates Edge persistence"""
    log_path = os.path.join(os.path.dirname(__file__), "alerts.log")
    with open(log_path, "a") as f:
        f.write(f"{timestamp} | {status} | {sensor} | {value}\n")

# ── Main ─────────────────────────────────────────────────────────
def run_edge_monitor():
    client = mqtt.Client(client_id="edge_monitor")
    client.on_connect = on_connect
    client.on_message = on_message

    print("🔄 Edge Monitor starting...")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)

    try:
        client.loop_forever()  # blocking — runs until Ctrl+C
    except KeyboardInterrupt:
        print("\n🛑 Edge Monitor stopped.")
        client.disconnect()

if __name__ == "__main__":
    run_edge_monitor()