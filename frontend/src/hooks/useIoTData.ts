import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  timestamp: string;
  co2: number;
  gas: number;
  temperature: number;
  humidity: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  sensor: string;
  value: number;
  threshold: number;
  timestamp: string;
  read: boolean;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  battery: number;
  sensors: string[];
}

export interface PredictionPoint {
  timestamp: string;
  predictedCo2: number;
  predictedGas: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const generateTimestamp = () => new Date().toISOString();

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
  });
};

// Generate realistic sensor data with some variation
const generateSensorReading = (prev?: SensorReading): SensorReading => {
  const baseCo2 = prev ? prev.co2 : 400;
  const baseGas = prev ? prev.gas : 150;
  const baseTemp = prev ? prev.temperature : 24;
  const baseHumidity = prev ? prev.humidity : 55;

  return {
    timestamp: generateTimestamp(),
    co2: Math.max(300, Math.min(1200, baseCo2 + (Math.random() - 0.5) * 30)),
    gas: Math.max(50, Math.min(500, baseGas + (Math.random() - 0.5) * 20)),
    temperature: Math.max(15, Math.min(45, baseTemp + (Math.random() - 0.5) * 1.5)),
    humidity: Math.max(20, Math.min(90, baseHumidity + (Math.random() - 0.5) * 3)),
  };
};

// Generate initial historical data
const generateHistoricalData = (points: number = 50): SensorReading[] => {
  const data: SensorReading[] = [];
  let prev: SensorReading | undefined;
  const now = Date.now();

  for (let i = points; i >= 0; i--) {
    const reading = generateSensorReading(prev);
    reading.timestamp = new Date(now - i * 2000).toISOString();
    data.push(reading);
    prev = reading;
  }
  return data;
};

// Generate alerts based on sensor readings
const generateAlerts = (readings: SensorReading[]): Alert[] => {
  const alerts: Alert[] = [];
  const latest = readings[readings.length - 1];

  if (latest.co2 > 800) {
    alerts.push({
      id: `alert-${Date.now()}-1`,
      type: 'critical',
      message: 'CO2 level exceeds critical threshold',
      sensor: 'CO2 Sensor',
      value: Math.round(latest.co2),
      threshold: 800,
      timestamp: latest.timestamp,
      read: false,
    });
  } else if (latest.co2 > 600) {
    alerts.push({
      id: `alert-${Date.now()}-1`,
      type: 'warning',
      message: 'CO2 level elevated',
      sensor: 'CO2 Sensor',
      value: Math.round(latest.co2),
      threshold: 600,
      timestamp: latest.timestamp,
      read: false,
    });
  }

  if (latest.gas > 350) {
    alerts.push({
      id: `alert-${Date.now()}-2`,
      type: 'critical',
      message: 'Toxic gas concentration critical',
      sensor: 'MQ Gas Sensor',
      value: Math.round(latest.gas),
      threshold: 350,
      timestamp: latest.timestamp,
      read: false,
    });
  } else if (latest.gas > 250) {
    alerts.push({
      id: `alert-${Date.now()}-2`,
      type: 'warning',
      message: 'Toxic gas level elevated',
      sensor: 'MQ Gas Sensor',
      value: Math.round(latest.gas),
      threshold: 250,
      timestamp: latest.timestamp,
      read: false,
    });
  }

  if (latest.temperature > 38) {
    alerts.push({
      id: `alert-${Date.now()}-3`,
      type: 'warning',
      message: 'Temperature above normal range',
      sensor: 'DHT11 Temperature',
      value: Math.round(latest.temperature * 10) / 10,
      threshold: 38,
      timestamp: latest.timestamp,
      read: false,
    });
  }

  return alerts;
};

// Generate ML predictions
const generatePredictions = (readings: SensorReading[]): PredictionPoint[] => {
  const predictions: PredictionPoint[] = [];
  const lastReading = readings[readings.length - 1];
  const now = Date.now();

  for (let i = 1; i <= 12; i++) {
    const trendCo2 = lastReading.co2 + i * (Math.random() - 0.3) * 15;
    const trendGas = lastReading.gas + i * (Math.random() - 0.3) * 10;
    const confidence = Math.max(60, 95 - i * 3);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (trendCo2 > 900 || trendGas > 400) riskLevel = 'high';
    else if (trendCo2 > 700 || trendGas > 300) riskLevel = 'medium';

    predictions.push({
      timestamp: new Date(now + i * 5 * 60000).toISOString(),
      predictedCo2: Math.round(trendCo2 * 100) / 100,
      predictedGas: Math.round(trendGas * 100) / 100,
      confidence: Math.round(confidence),
      riskLevel,
    });
  }

  return predictions;
};

const DEVICES: Device[] = [
  {
    id: 'ESP32-001',
    name: 'Zone A Sensor Hub',
    location: 'Production Floor North',
    status: 'online',
    lastUpdate: generateTimestamp(),
    battery: 87,
    sensors: ['CO2', 'Gas', 'Temp', 'Humidity'],
  },
  {
    id: 'ESP32-002',
    name: 'Zone B Monitor',
    location: 'Assembly Line East',
    status: 'online',
    lastUpdate: generateTimestamp(),
    battery: 92,
    sensors: ['CO2', 'Temp', 'Humidity'],
  },
  {
    id: 'ESP32-003',
    name: 'Ventilation Controller',
    location: 'Exhaust Zone Central',
    status: 'warning',
    lastUpdate: generateTimestamp(),
    battery: 34,
    sensors: ['Gas', 'Temp'],
  },
  {
    id: 'ESP32-004',
    name: 'Quality Station',
    location: 'Packaging Area South',
    status: 'online',
    lastUpdate: generateTimestamp(),
    battery: 76,
    sensors: ['CO2', 'Humidity'],
  },
  {
    id: 'ESP32-005',
    name: 'External Monitor',
    location: 'Loading Dock',
    status: 'offline',
    lastUpdate: new Date(Date.now() - 3600000).toISOString(),
    battery: 12,
    sensors: ['Temp', 'Humidity'],
  },
];

export function useIoTData() {
  const [readings, setReadings] = useState<SensorReading[]>(() => generateHistoricalData(60));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices] = useState<Device[]>(DEVICES);
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [floatingMetrics, setFloatingMetrics] = useState({
    speed: 38,
    noise: 48,
    heartbeat: 130,
  });

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate new sensor readings
  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) => {
        const newReading = generateSensorReading(prev[prev.length - 1]);
        const updated = [...prev.slice(1), newReading];

        // Update alerts
        const newAlerts = generateAlerts(updated);
        setAlerts((prevAlerts) => {
          const combined = [...newAlerts, ...prevAlerts].slice(0, 20);
          return combined;
        });

        // Update predictions
        setPredictions(generatePredictions(updated));

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate floating metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingMetrics({
        speed: 38 + Math.floor((Math.random() - 0.5) * 4),
        noise: 48 + Math.floor((Math.random() - 0.5) * 6),
        heartbeat: 130 + Math.floor((Math.random() - 0.5) * 10),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initial predictions
  useEffect(() => {
    setPredictions(generatePredictions(readings));
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  }, []);

  const getLatestReading = useCallback(() => {
    return readings[readings.length - 1];
  }, [readings]);

  const getUnreadAlertsCount = useCallback(() => {
    return alerts.filter((a) => !a.read).length;
  }, [alerts]);

  const formattedTime = formatTime(currentTime);
  const formattedDate = formatDate(currentTime);

  return {
    readings,
    alerts,
    devices,
    predictions,
    floatingMetrics,
    currentTime: `${formattedTime}, ${formattedDate}`,
    latestReading: getLatestReading(),
    unreadAlertsCount: getUnreadAlertsCount(),
    markAlertAsRead,
  };
}
