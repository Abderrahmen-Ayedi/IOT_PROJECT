import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Layers } from 'lucide-react';
import type { SensorReading } from '../hooks/useIoTData';

interface ChartsSectionProps {
  readings: SensorReading[];
}

type TimeRange = '1m' | '5m' | '15m' | '1h';
type ChartType = 'line' | 'area' | 'bar';

const timeRangeMap: Record<TimeRange, number> = {
  '1m': 30,
  '5m': 50,
  '15m': 100,
  '1h': 200,
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-lg border border-iot-border shadow-lg p-3 min-w-[160px]">
      <p className="text-xs text-iot-textTertiary mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-iot-textSecondary">{entry.name}</span>
          </div>
          <span className="text-xs font-mono-data font-semibold text-iot-textPrimary">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChartsSection({ readings }: ChartsSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const [activeSensors, setActiveSensors] = useState({
    co2: true,
    gas: true,
    temperature: true,
    humidity: true,
  });
  const [chartType, setChartType] = useState<ChartType>('area');

  const filteredData = useMemo(() => {
    const count = timeRangeMap[timeRange];
    return readings.slice(-count).map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      CO2: Math.round(r.co2),
      'Toxic Gas': Math.round(r.gas),
      'Temperature (°C)': Math.round(r.temperature * 10) / 10,
      'Humidity (%)': Math.round(r.humidity),
    }));
  }, [readings, timeRange]);

  const stats = useMemo(() => {
    const recent = readings.slice(-20);
    const co2Values = recent.map((r) => r.co2);
    const gasValues = recent.map((r) => r.gas);
    return {
      co2Avg: Math.round(co2Values.reduce((a, b) => a + b, 0) / co2Values.length),
      gasAvg: Math.round(gasValues.reduce((a, b) => a + b, 0) / gasValues.length),
      co2Trend: co2Values[co2Values.length - 1] > co2Values[0] ? 'up' : 'down',
      gasTrend: gasValues[gasValues.length - 1] > gasValues[0] ? 'up' : 'down',
    };
  }, [readings]);

  const sensorConfig = [
    { key: 'co2', label: 'CO2', dataKey: 'CO2', color: '#10B981', unit: 'ppm' },
    { key: 'gas', label: 'Toxic Gas', dataKey: 'Toxic Gas', color: '#F59E0B', unit: 'ppm' },
    { key: 'temperature', label: 'Temperature', dataKey: 'Temperature (°C)', color: '#3B82F6', unit: '°C' },
    { key: 'humidity', label: 'Humidity', dataKey: 'Humidity (%)', color: '#06B6D4', unit: '%' },
  ];

  const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

  return (
    <section className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-iot-textPrimary">Sensor Analytics</h2>
          <p className="text-sm text-iot-textSecondary mt-0.5">Historical data visualization</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-iot-surfaceHighlight rounded-lg p-0.5 border border-iot-border">
            {[
              { type: 'area' as ChartType, icon: Activity },
              { type: 'line' as ChartType, icon: TrendingUp },
              { type: 'bar' as ChartType, icon: BarChart3 },
            ].map(({ type, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === type ? 'bg-white shadow-sm text-iot-primary' : 'text-iot-textTertiary hover:text-iot-textSecondary'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-iot-surfaceHighlight rounded-lg p-0.5 border border-iot-border">
            {(['1m', '5m', '15m', '1h'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white shadow-sm text-iot-primary'
                    : 'text-iot-textTertiary hover:text-iot-textSecondary'
                }`}
              >
                {range === '1m' ? '1 min' : range === '5m' ? '5 min' : range === '15m' ? '15 min' : '1 hour'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl border border-iot-border p-5 shadow-card"
        >
          {/* Sensor Toggles */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Layers className="w-4 h-4 text-iot-textTertiary mr-1" />
            {sensorConfig.map((sensor) => (
              <button
                key={sensor.key}
                onClick={() =>
                  setActiveSensors((prev) => ({ ...prev, [sensor.key]: !prev[sensor.key as keyof typeof prev] }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  activeSensors[sensor.key as keyof typeof activeSensors]
                    ? 'bg-white border-iot-border shadow-sm'
                    : 'bg-iot-surfaceHighlight border-transparent opacity-50'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sensor.color }}
                />
                <span className="text-iot-textSecondary">{sensor.label}</span>
              </button>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={350}>
            <ChartComponent data={filteredData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {sensorConfig.map(
                (sensor) =>
                  activeSensors[sensor.key as keyof typeof activeSensors] && (
                    chartType === 'bar' ? (
                      <Bar
                        key={sensor.key}
                        dataKey={sensor.dataKey}
                        fill={sensor.color}
                        radius={[2, 2, 0, 0]}
                        opacity={0.8}
                      />
                    ) : chartType === 'area' ? (
                      <Area
                        key={sensor.key}
                        type="monotone"
                        dataKey={sensor.dataKey}
                        stroke={sensor.color}
                        fill={sensor.color}
                        fillOpacity={0.08}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ) : (
                      <Line
                        key={sensor.key}
                        type="monotone"
                        dataKey={sensor.dataKey}
                        stroke={sensor.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    )
                  )
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </motion.div>

        {/* Side Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {/* CO2 Mini Card */}
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-iot-textTertiary font-medium">CO2 Average</span>
              <div className={`flex items-center gap-1 ${stats.co2Trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats.co2Trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span className="text-xs font-medium">{stats.co2Trend === 'up' ? '+' : '-'}2.4%</span>
              </div>
            </div>
            <p className="text-2xl font-bold font-mono-data text-iot-textPrimary">{stats.co2Avg} <span className="text-sm font-normal text-iot-textSecondary">ppm</span></p>
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.slice(-15)}>
                  <Area
                    type="monotone"
                    dataKey="CO2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gas Mini Card */}
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-iot-textTertiary font-medium">Gas Average</span>
              <div className={`flex items-center gap-1 ${stats.gasTrend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats.gasTrend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span className="text-xs font-medium">{stats.gasTrend === 'up' ? '+' : '-'}1.8%</span>
              </div>
            </div>
            <p className="text-2xl font-bold font-mono-data text-iot-textPrimary">{stats.gasAvg} <span className="text-sm font-normal text-iot-textSecondary">ppm</span></p>
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.slice(-15)}>
                  <Area
                    type="monotone"
                    dataKey="Toxic Gas"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Ring */}
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <span className="text-xs text-iot-textTertiary font-medium">System Efficiency</span>
            <div className="flex items-center justify-center py-3">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.86) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono-data text-iot-textPrimary">86%</span>
                  <span className="text-[10px] text-iot-textTertiary">Efficiency</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs font-mono-data font-semibold text-iot-textPrimary">54.2k</p>
                <p className="text-[10px] text-iot-textTertiary">Readings</p>
              </div>
              <div>
                <p className="text-xs font-mono-data font-semibold text-iot-textPrimary">4m 50s</p>
                <p className="text-[10px] text-iot-textTertiary">Latency</p>
              </div>
              <div>
                <p className="text-xs font-mono-data font-semibold text-iot-textPrimary">48%</p>
                <p className="text-[10px] text-iot-textTertiary">Uptime</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
