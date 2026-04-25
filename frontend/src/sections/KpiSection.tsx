import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SensorReading } from '../hooks/useIoTData';

interface KpiSectionProps {
  latestReading: SensorReading;
}

interface KpiCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  threshold: { warning: number; critical: number };
  trend: 'up' | 'down' | 'stable';
  delay: number;
  decimals?: number;
}

function getStatusColor(value: number, threshold: { warning: number; critical: number }) {
  if (value >= threshold.critical) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' };
  if (value >= threshold.warning) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
  return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' };
}

function KpiCard({ title, value, unit, icon: Icon, color, bgColor, threshold, trend, delay, decimals = 0 }: KpiCardProps) {
  const [animatedValue, setAnimatedValue] = useState(value);
  const status = getStatusColor(value, threshold);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    const startTime = performance.now();
    const duration = 600;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const decimalsFactor = Math.pow(10, decimals);
      setAnimatedValue(Math.round((start + (end - start) * eased) * decimalsFactor) / decimalsFactor);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevValueRef.current = value;
  }, [value, decimals]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px -10px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl border border-iot-border p-5 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse-dot`} />
          <span className={`text-xs font-medium ${status.text}`}>
            {value >= threshold.critical ? 'Critical' : value >= threshold.warning ? 'Warning' : 'Normal'}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-iot-textTertiary font-medium uppercase tracking-wide">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-data text-iot-textPrimary">
            {decimals > 0 ? animatedValue.toFixed(decimals) : animatedValue}
          </span>
          <span className="text-sm text-iot-textSecondary">{unit}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-iot-border/60">
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>
            {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-iot-textTertiary">
          <AlertTriangle className="w-3 h-3" />
          <span>Limit: {threshold.warning}{unit}</span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 bg-iot-surfaceHighlight rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            value >= threshold.critical ? 'bg-red-500' : value >= threshold.warning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / (threshold.critical * 1.2)) * 100)}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </motion.div>
  );
}

export default function KpiSection({ latestReading }: KpiSectionProps) {
  const prevReadingRef = useRef(latestReading);

  const getTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const cards: Omit<KpiCardProps, 'delay'>[] = [
    {
      title: 'CO2 Level',
      value: Math.round(latestReading.co2),
      unit: 'ppm',
      icon: Cloud,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      threshold: { warning: 600, critical: 800 },
      trend: getTrend(latestReading.co2, prevReadingRef.current.co2),
    },
    {
      title: 'Toxic Gas',
      value: Math.round(latestReading.gas),
      unit: 'ppm',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      threshold: { warning: 250, critical: 350 },
      trend: getTrend(latestReading.gas, prevReadingRef.current.gas),
    },
    {
      title: 'Temperature',
      value: Math.round(latestReading.temperature * 10) / 10,
      unit: '°C',
      icon: Thermometer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      threshold: { warning: 35, critical: 40 },
      trend: getTrend(latestReading.temperature, prevReadingRef.current.temperature),
      decimals: 1,
    },
    {
      title: 'Humidity',
      value: Math.round(latestReading.humidity),
      unit: '%',
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      threshold: { warning: 75, critical: 85 },
      trend: getTrend(latestReading.humidity, prevReadingRef.current.humidity),
    },
  ];

  useEffect(() => {
    prevReadingRef.current = latestReading;
  }, [latestReading]);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-iot-textPrimary">Live Sensor Data</h2>
          <p className="text-sm text-iot-textSecondary mt-0.5">Real-time environmental monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-iot-primary animate-pulse-dot" />
          <span className="text-xs text-iot-textSecondary font-medium">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <KpiCard key={card.title} {...card} delay={index * 0.08} />
        ))}
      </div>
    </section>
  );
}
