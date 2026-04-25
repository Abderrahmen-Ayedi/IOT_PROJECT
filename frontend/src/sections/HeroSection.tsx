import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Cloud, Gauge } from 'lucide-react';

interface HeroSectionProps {
  floatingMetrics: {
    speed: number;
    noise: number;
    heartbeat: number;
  };
}

function AnimatedCounter({ value, duration = 500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevRef.current = value;
  }, [value, duration]);

  return <span className="font-mono-data">{display}</span>;
}

export default function HeroSection({ floatingMetrics }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-iot-primary/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-iot-primary animate-pulse-dot" />
            <span className="text-xs font-semibold text-iot-primary tracking-wider uppercase">
              Smart Industrial IoT
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-iot-textPrimary leading-tight tracking-tight">
            Monitor & Predict{' '}
            <span className="text-gradient-green">Air Pollution</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base text-iot-textSecondary leading-relaxed max-w-lg">
            Predicts industrial air pollution trends in real-time using an IoT-based machine learning
            system. Safeguard your environment proactively with intelligent sensor networks.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-iot-primary text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all hover:shadow-glow">
              Monitor Pollution
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-iot-textPrimary border border-iot-border rounded-lg text-sm font-medium hover:bg-iot-surfaceHighlight transition-all">
              Use IoT System
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* KPI Mini Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-xl p-4 border border-iot-border shadow-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-iot-primary" />
                <span className="text-xs text-iot-textTertiary">Status</span>
              </div>
              <p className="text-sm font-semibold text-iot-textPrimary">Excellent</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-iot-primary" />
                <span className="text-[10px] text-iot-primary">Normal</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl p-4 border border-iot-border shadow-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-iot-accent" />
                <span className="text-xs text-iot-textTertiary">Weather</span>
              </div>
              <p className="text-sm font-semibold text-iot-textPrimary">24°C</p>
              <span className="text-[10px] text-iot-textTertiary">Cloudy</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white rounded-xl p-4 border border-iot-border shadow-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-iot-warning" />
                <span className="text-xs text-iot-textTertiary">AQI</span>
              </div>
              <p className="text-sm font-semibold text-iot-textPrimary">78</p>
              <span className="text-[10px] text-iot-warning">Moderate</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Illustration + Floating Metrics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden bg-white border border-iot-border shadow-card p-6">
            <img
              src="/assets/hero-illustration.jpg"
              alt="IoT Dashboard System"
              className="w-full h-auto rounded-xl"
            />

            {/* Floating Metric Pills */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-iot-border shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-iot-primary" />
                <span className="text-xs text-iot-textTertiary">Speed</span>
                <span className="text-sm font-mono-data font-medium text-iot-textPrimary">
                  → <AnimatedCounter value={floatingMetrics.speed} />
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 right-6 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-iot-border shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-iot-accent" />
                <span className="text-xs text-iot-textTertiary">Noise</span>
                <span className="text-sm font-mono-data font-medium text-iot-textPrimary">
                  <AnimatedCounter value={floatingMetrics.noise} /> dB
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-iot-border shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-iot-danger" />
                <span className="text-xs text-iot-textTertiary">Heartbeat</span>
                <span className="text-sm font-mono-data font-medium text-iot-textPrimary">
                  → <AnimatedCounter value={floatingMetrics.heartbeat} />
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
