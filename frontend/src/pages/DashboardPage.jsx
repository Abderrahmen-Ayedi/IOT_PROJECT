import { useEffect, useRef } from "react";
import { useSensorData } from "@/hooks/useSensorData";
import Topbar          from "@/components/layout/Topbar";
import MetricCard      from "@/components/cards/MetricCard";
import HistoryChart    from "@/components/charts/HistoryChart";
import AqiGauge        from "@/components/charts/AqiGauge";
import AlertFeed       from "@/components/alerts/AlertFeed";
import PredictionPanel from "@/components/predictions/PredictionPanel";
import ActuatorPanel   from "@/components/actuators/ActuatorPanel";
import styles          from "./DashboardPage.module.css";

const SENSOR_KEYS = ["co2", "gas", "temp", "hum"];

export default function DashboardPage() {
  const {
    clock, readings, predictions, aqi,
    co2History, gasHistory, alerts,
    vent, alarm, connected,
    toggleVent, toggleAlarm,
  } = useSensorData();

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    if (alarm) {
      document.body.classList.add("alarm-active");
      
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        const lfo = audioCtxRef.current.createOscillator();
        const lfoGain = audioCtxRef.current.createGain();
        
        osc.type = "square";
        osc.frequency.value = 600;
        
        lfo.type = "square";
        lfo.frequency.value = 2; // 2 alternations per second
        lfoGain.gain.value = 200; // Pitch difference
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        gain.gain.value = 0.05; // Low volume
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        
        osc.start();
        lfo.start();
        
        oscillatorRef.current = { osc, lfo, gain };
      } catch (e) {
        console.warn("Audio playback failed", e);
      }
    } else {
      document.body.classList.remove("alarm-active");
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.osc.stop();
          oscillatorRef.current.lfo.stop();
          oscillatorRef.current.osc.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
    }

    return () => {
      document.body.classList.remove("alarm-active");
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.osc.stop();
          oscillatorRef.current.lfo.stop();
          oscillatorRef.current.osc.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
    };
  }, [alarm]);

  return (
    <div className={styles.page}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <Topbar clock={clock} connected={connected} />

      {/* ── Metric cards ─────────────────────────────────── */}
      <section className={styles.metricsGrid} aria-label="Mesures capteurs en temps réel">
        {SENSOR_KEYS.map((key) => (
          <MetricCard key={key} sensorKey={key} value={readings[key]} />
        ))}
      </section>

      {/* ── Charts row ───────────────────────────────────── */}
      <section className={styles.chartsRow} aria-label="Graphiques">
        <HistoryChart co2History={co2History} gasHistory={gasHistory} />
        <AqiGauge score={aqi} />
      </section>

      {/* ── Bottom row ───────────────────────────────────── */}
      <section className={styles.bottomRow} aria-label="Alertes et prédictions">
        <AlertFeed alerts={alerts} />

        <div className={styles.rightCol}>
          <PredictionPanel predictions={predictions} />
          <ActuatorPanel
            vent={vent}
            alarm={alarm}
            onToggleVent={toggleVent}
            onToggleAlarm={toggleAlarm}
          />
        </div>
      </section>

    </div>
  );
}
