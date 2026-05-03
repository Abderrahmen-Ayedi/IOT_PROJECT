// ─── Sensor Thresholds ───────────────────────────────────────────────────────
export const THRESHOLDS = {
  co2: {
    warn:   800,   // ppm
    danger: 1200,  // ppm
    max:    2000,
    min:    400,
    unit:   "ppm",
    sensor: "MQ-135",
  },
  gas: {
    warn:   200,   // ppm
    danger: 350,   // ppm
    max:    700,
    min:    0,
    unit:   "ppm",
    sensor: "MQ-series",
  },
  temp: {
    warn:   32,    // °C
    danger: 38,    // °C
    max:    60,
    min:    10,
    unit:   "°C",
    sensor: "DHT11",
  },
  hum: {
    warn:   80,    // %
    danger: 90,    // %
    max:    100,
    min:    0,
    unit:   "%",
    sensor: "DHT11",
  },
};

// ─── MQTT Config ─────────────────────────────────────────────────────────────
export const MQTT_CONFIG = {
  brokerUrl:  "ws://localhost:9001",
  topic:      "iot/air-quality",
  clientId:   `dashboard-${Math.random().toString(16).slice(2, 8)}`,
  options: {
    keepalive:      30,
    reconnectPeriod: 2000,
    connectTimeout:  5000,
  },
};

// ─── API Config ───────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Chart Config ─────────────────────────────────────────────────────────────
export const CHART_MAX_POINTS = 30;
export const POLL_INTERVAL_MS  = 2000;

// ─── AQI Breakpoints ──────────────────────────────────────────────────────────
export const AQI_LEVELS = [
  { max: 25,  label: "Bon",      color: "var(--teal-dark)",  bg: "var(--green-light)" },
  { max: 50,  label: "Modéré",   color: "var(--blue)",       bg: "var(--blue-light)"  },
  { max: 70,  label: "Mauvais",  color: "var(--amber)",      bg: "var(--amber-light)" },
  { max: 100, label: "Critique", color: "var(--red-dark)",   bg: "var(--red-light)"   },
];
