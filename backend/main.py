# backend/main.py
from fastapi import FastAPI, Depends, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from contextlib import asynccontextmanager
from datetime import datetime
import sys, os, json
import paho.mqtt.publish as mqtt_publish

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import *
from backend.database import get_db, init_db, SensorReading, Alert
from backend.mqtt_subscriber import start_mqtt_subscriber
import backend.mqtt_subscriber as mqtt_sub

# ── WebSocket Connection Manager ─────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 New WebSocket client — total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"🔌 Client disconnected — total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send data to ALL connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        # Clean up disconnected clients
        for conn in disconnected:
            self.active_connections.remove(conn)

# Global manager instance
manager = ConnectionManager()

# ── Startup / Shutdown ───────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting FastAPI...")
    init_db()
    start_mqtt_subscriber(manager)   # pass manager so MQTT can broadcast
    yield
    print("🛑 Shutting down...")

# ── App ──────────────────────────────────────────────────────────
app = FastAPI(
    title="IoT Pollution Monitor API",
    description="Real-time industrial pollution monitoring",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WebSocket Endpoint ───────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ── REST Endpoints ───────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "IoT Pollution Monitor API",
        "status" : "running",
        "websocket": "ws://localhost:8000/ws"
    }

@app.get("/readings")
def get_readings(
    sensor: Optional[str] = Query(None),
    limit : int = Query(50),
    db    : Session = Depends(get_db)
):
    query = db.query(SensorReading).order_by(SensorReading.id.desc())
    if sensor:
        query = query.filter(SensorReading.sensor == sensor)
    return query.limit(limit).all()

@app.get("/readings/latest")
def get_latest(db: Session = Depends(get_db)):
    result = {}
    for s in ["co2", "temperature", "gas"]:
        reading = (
            db.query(SensorReading)
            .filter(SensorReading.sensor == s)
            .order_by(SensorReading.id.desc())
            .first()
        )
        result[s] = reading
    return result

@app.get("/alerts")
def get_alerts(
    status: Optional[str] = Query(None),
    limit : int = Query(50),
    db    : Session = Depends(get_db)
):
    query = db.query(Alert).order_by(Alert.id.desc())
    if status:
        query = query.filter(Alert.status == status)
    return query.limit(limit).all()

@app.get("/alerts/stats")
def get_alert_stats(db: Session = Depends(get_db)):
    total    = db.query(Alert).count()
    critical = db.query(Alert).filter(Alert.status == "CRITICAL").count()
    warning  = db.query(Alert).filter(Alert.status == "WARNING").count()
    return {
        "total"   : total,
        "critical": critical,
        "warning" : warning,
        "by_sensor": {
            s: db.query(Alert).filter(Alert.sensor == s).count()
            for s in ["co2", "temperature", "gas"]
        }
    }

# ── Actuator Control Endpoints ───────────────────────────────
class ActuatorCommand(BaseModel):
    enabled: bool

@app.post("/actuators/vent")
async def control_vent(cmd: ActuatorCommand):
    """Control ventilation system"""
    enabled = cmd.enabled
    mqtt_sub.VENTILATION_ENABLED = enabled
    message = {
        "type": "actuator_command",
        "device": "vent",
        "enabled": enabled,
        "timestamp": datetime.now().isoformat()
    }
    await manager.broadcast(message)
    try:
        mqtt_publish.single("factory/actuators/vent", payload=json.dumps({"enabled": enabled}), hostname=BROKER_HOST, port=BROKER_PORT)
    except Exception as e:
        print(f"❌ Failed to publish MQTT actuator message: {e}")
    return {"status": "ok", "device": "vent", "enabled": enabled}

@app.post("/actuators/alarm")
async def control_alarm(cmd: ActuatorCommand):
    """Control alarm system"""
    enabled = cmd.enabled
    message = {
        "type": "actuator_command",
        "device": "alarm",
        "enabled": enabled,
        "timestamp": datetime.now().isoformat()
    }
    await manager.broadcast(message)
    try:
        mqtt_publish.single("factory/actuators/alarm", payload=json.dumps({"enabled": enabled}), hostname=BROKER_HOST, port=BROKER_PORT)
    except Exception as e:
        print(f"❌ Failed to publish MQTT actuator message: {e}")
    return {"status": "ok", "device": "alarm", "enabled": enabled}