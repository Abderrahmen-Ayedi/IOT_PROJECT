# backend/database.py
# SQLite database setup with SQLAlchemy

from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./pollution.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ── Database Tables ──────────────────────────────────────────────
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id        = Column(Integer, primary_key=True, index=True)
    sensor    = Column(String, index=True)
    value     = Column(Float)
    unit      = Column(String)
    timestamp = Column(String)
    anomaly   = Column(Boolean, default=False)

class Alert(Base):
    __tablename__ = "alerts"

    id        = Column(Integer, primary_key=True, index=True)
    sensor    = Column(String)
    value     = Column(Float)
    status    = Column(String)   # WARNING or CRITICAL
    message   = Column(String)
    timestamp = Column(String)

# ── Create tables ────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(bind=engine)

# ── DB Session dependency ────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()