import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Brain, TrendingUp, ShieldAlert, ShieldCheck, Gauge } from 'lucide-react';
import type { PredictionPoint, SensorReading } from '../hooks/useIoTData';

interface PredictionSectionProps {
  predictions: PredictionPoint[];
  readings: SensorReading[];
}

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

export default function PredictionSection({ predictions, readings }: PredictionSectionProps) {
  const chartData = useMemo(() => {
    // Combine historical and predicted data
    const historicalPoints = readings.slice(-15).map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      'Historical CO2': Math.round(r.co2),
      'Predicted CO2': null as number | null,
      'Historical Gas': Math.round(r.gas),
      'Predicted Gas': null as number | null,
      confidence: null as number | null,
    }));

    const predictionPoints = predictions.map((p, i) => ({
      time: `+${(i + 1) * 5}m`,
      'Historical CO2': null,
      'Predicted CO2': p.predictedCo2,
      'Historical Gas': null,
      'Predicted Gas': p.predictedGas,
      confidence: p.confidence,
    }));

    return [...historicalPoints, ...predictionPoints];
  }, [readings, predictions]);

  const riskAnalysis = useMemo(() => {
    if (!predictions.length) return { level: 'low' as const, probability: 0, message: 'No prediction data' };

    const highRiskCount = predictions.filter((p) => p.riskLevel === 'high').length;
    const mediumRiskCount = predictions.filter((p) => p.riskLevel === 'medium').length;
    const riskProbability = Math.round((highRiskCount * 2 + mediumRiskCount) / (predictions.length * 2) * 100);

    if (highRiskCount >= 4) {
      return {
        level: 'high' as const,
        probability: riskProbability,
        message: 'High probability of critical pollution event',
      };
    } else if (mediumRiskCount >= 4 || highRiskCount >= 2) {
      return {
        level: 'medium' as const,
        probability: riskProbability,
        message: 'Moderate risk detected - monitor closely',
      };
    }

    return {
      level: 'low' as const,
      probability: riskProbability,
      message: 'Low risk - conditions within normal range',
    };
  }, [predictions]);

  const latestPrediction = predictions[predictions.length - 1];

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-iot-textPrimary">ML Predictions</h2>
            <p className="text-sm text-iot-textSecondary mt-0.5">AI-powered pollution forecasting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Prediction Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl border border-iot-border p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-iot-textPrimary">Pollution Forecast</h3>
              <p className="text-xs text-iot-textTertiary mt-0.5">Next 60 minutes prediction</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-iot-primary/20 border border-iot-primary" />
                <span className="text-xs text-iot-textSecondary">Historical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-violet-500/20 border border-dashed border-violet-500" />
                <span className="text-xs text-iot-textSecondary">Predicted</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={chartData.findIndex((d) => d['Predicted CO2'] !== null)}
                stroke="#9CA3AF"
                strokeDasharray="6 4"
                label={{ value: 'Now', position: 'top', fill: '#9CA3AF', fontSize: 11 }}
              />
              <ReferenceLine y={800} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="Historical CO2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="Predicted CO2"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Confidence Legend */}
          <div className="mt-3 flex items-center gap-4 pt-3 border-t border-iot-border">
            <span className="text-xs text-iot-textTertiary">Prediction Confidence:</span>
            <div className="flex items-center gap-2">
              {predictions.slice(0, 6).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        p.confidence > 85
                          ? '#10B981'
                          : p.confidence > 70
                          ? '#F59E0B'
                          : '#EF4444',
                      opacity: 0.6 + i * 0.08,
                    }}
                  />
                  <span className="text-[9px] text-iot-textTertiary font-mono-data">{p.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Risk Analysis Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Risk Level Card */}
          <div
            className={`rounded-xl border p-5 shadow-card ${
              riskAnalysis.level === 'high'
                ? 'bg-red-50 border-red-200'
                : riskAnalysis.level === 'medium'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {riskAnalysis.level === 'high' ? (
                <ShieldAlert className="w-6 h-6 text-red-500" />
              ) : riskAnalysis.level === 'medium' ? (
                <ShieldAlert className="w-6 h-6 text-amber-500" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              )}
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    riskAnalysis.level === 'high'
                      ? 'text-red-700'
                      : riskAnalysis.level === 'medium'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  Risk Assessment
                </h4>
                <p
                  className={`text-xs ${
                    riskAnalysis.level === 'high'
                      ? 'text-red-500'
                      : riskAnalysis.level === 'medium'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {riskAnalysis.level.toUpperCase()} RISK
                </p>
              </div>
            </div>

            <p
              className={`text-sm ${
                riskAnalysis.level === 'high'
                  ? 'text-red-600'
                  : riskAnalysis.level === 'medium'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {riskAnalysis.message}
            </p>

            {/* Risk Probability Gauge */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-iot-textTertiary">Anomaly Probability</span>
                <span
                  className={`text-sm font-bold font-mono-data ${
                    riskAnalysis.probability > 60
                      ? 'text-red-600'
                      : riskAnalysis.probability > 30
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {riskAnalysis.probability}%
                </span>
              </div>
              <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    riskAnalysis.probability > 60
                      ? 'bg-red-500'
                      : riskAnalysis.probability > 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${riskAnalysis.probability}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            </div>
          </div>

          {/* Prediction Stats */}
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <h4 className="text-sm font-semibold text-iot-textPrimary mb-3">Prediction Metrics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-iot-textSecondary">Predicted CO2 (peak)</span>
                </div>
                <span className="text-sm font-mono-data font-semibold text-iot-textPrimary">
                  {latestPrediction ? Math.round(latestPrediction.predictedCo2) : '--'} ppm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-iot-accent" />
                  <span className="text-xs text-iot-textSecondary">Confidence Level</span>
                </div>
                <span className="text-sm font-mono-data font-semibold text-iot-textPrimary">
                  {latestPrediction ? latestPrediction.confidence : '--'}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-iot-primary" />
                  <span className="text-xs text-iot-textSecondary">Model Accuracy</span>
                </div>
                <span className="text-sm font-mono-data font-semibold text-iot-textPrimary">94.2%</span>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <h4 className="text-sm font-semibold text-iot-textPrimary mb-2">ML Model</h4>
            <p className="text-xs text-iot-textSecondary leading-relaxed">
              Using <span className="font-medium text-iot-textPrimary">Isolation Forest</span> algorithm 
              for anomaly detection combined with LSTM neural networks for time-series forecasting. 
              Trained on 6 months of historical industrial sensor data.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
