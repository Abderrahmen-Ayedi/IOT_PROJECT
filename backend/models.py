# backend/models.py
# Pydantic models for data validation

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorData(BaseModel):
    sensor: str
    value: float
    unit: str
    timestamp: str
    anomaly: bool = False

class AlertModel(BaseModel):
    sensor: str
    value: float
    status: str        # WARNING or CRITICAL
    message: str
    timestamp: str

class SensorResponse(BaseModel):
    success: bool
    message: str
    data: Optional[SensorData] = None