import { motion } from 'framer-motion';
import {
  Cpu,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Wifi,
  WifiOff,
  MapPin,
  Radio,
} from 'lucide-react';
import type { Device } from '../hooks/useIoTData';

interface DeviceSectionProps {
  devices: Device[];
}

function BatteryIcon({ level }: { level: number }) {
  if (level > 70) return <BatteryFull className="w-4 h-4 text-emerald-500" />;
  if (level > 30) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
  return <BatteryLow className="w-4 h-4 text-red-500" />;
}

function StatusBadge({ status }: { status: Device['status'] }) {
  const styles = {
    online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    offline: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse-dot' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {status.toUpperCase()}
    </span>
  );
}

export default function DeviceSection({ devices }: DeviceSectionProps) {
  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-iot-textPrimary">Device Status</h2>
            <p className="text-sm text-iot-textSecondary mt-0.5">IoT sensor network overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-xs text-iot-textSecondary">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-iot-textSecondary">{warningCount} Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-iot-textSecondary">{offlineCount} Offline</span>
          </div>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ y: -3, boxShadow: '0 8px 30px -10px rgba(0,0,0,0.12)' }}
            className="bg-white rounded-xl border border-iot-border p-4 shadow-card"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  device.status === 'online'
                    ? 'bg-emerald-50'
                    : device.status === 'warning'
                    ? 'bg-amber-50'
                    : 'bg-red-50'
                }`}>
                  <Radio className={`w-4 h-4 ${
                    device.status === 'online'
                      ? 'text-emerald-600'
                      : device.status === 'warning'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-iot-textPrimary leading-tight">{device.name}</p>
                  <p className="text-[10px] text-iot-textTertiary font-mono-data">{device.id}</p>
                </div>
              </div>
              <StatusBadge status={device.status} />
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-3 h-3 text-iot-textTertiary" />
              <span className="text-xs text-iot-textSecondary">{device.location}</span>
            </div>

            {/* Sensors */}
            <div className="flex flex-wrap gap-1 mb-3">
              {device.sensors.map((sensor) => (
                <span
                  key={sensor}
                  className="px-1.5 py-0.5 bg-iot-surfaceHighlight rounded text-[10px] text-iot-textSecondary font-medium"
                >
                  {sensor}
                </span>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-iot-border/60">
              <div className="flex items-center gap-1">
                <BatteryIcon level={device.battery} />
                <span className="text-xs font-mono-data text-iot-textSecondary">{device.battery}%</span>
              </div>
              <div className="flex items-center gap-1">
                {device.status === 'online' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className="text-[10px] text-iot-textTertiary font-mono-data">
                  {new Date(device.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Architecture Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 bg-white rounded-xl border border-iot-border shadow-card overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-iot-textPrimary mb-2">Industrial IoT Architecture</h3>
            <p className="text-sm text-iot-textSecondary leading-relaxed mb-4">
              Our system combines Edge computing with Cloud analytics. ESP32 microcontrollers collect data from 
              MQ-135 (CO2), MQ-series (toxic gas), and DHT11 (temperature/humidity) sensors. Data flows via 
              MQTT to FastAPI backend, stored in InfluxDB, and visualized through React dashboards with 
              ML-powered predictions.
            </p>
            <div className="flex flex-wrap gap-2">
              {['ESP32', 'MQTT', 'FastAPI', 'InfluxDB', 'React', 'TensorFlow'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-iot-surfaceHighlight rounded-md text-xs font-medium text-iot-textSecondary border border-iot-border"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="relative bg-iot-surfaceHighlight flex items-center justify-center p-6">
            <img
              src="/assets/factory-illustration.jpg"
              alt="Industrial IoT Architecture"
              className="w-full h-auto max-h-[240px] object-contain rounded-lg"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
