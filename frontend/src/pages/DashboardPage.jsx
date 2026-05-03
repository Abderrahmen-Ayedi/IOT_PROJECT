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
