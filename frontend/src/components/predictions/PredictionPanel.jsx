import styles from "./PredictionPanel.module.css";

const STATE_COLOR = {
  ok:     "var(--teal-dark)",
  warn:   "var(--amber)",
  danger: "var(--red-dark)",
};

export default function PredictionPanel({ predictions }) {
  const { co2, gas, anomaly, risk, state, pm25 } = predictions;
  const color = STATE_COLOR[state] ?? STATE_COLOR.ok;

  let pm25Status = "";
  let pm25Color = color;
  if (pm25 != null) {
    if (pm25 <= 35) {
      pm25Status = " (Normal ✓)";
      pm25Color = "var(--teal-dark)";
    } else if (pm25 <= 55) {
      pm25Status = " (Moyen ⚠)";
      pm25Color = "var(--amber)";
    } else {
      pm25Status = " (Anomalie / Danger ❌)";
      pm25Color = "var(--red-dark)";
    }
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Prédictions ML · <span className={styles.model}>XGBoost / Isolation Forest</span></p>

      <ul className={styles.list}>
        <PredRow label="PM2.5 (Prédit par IA)"   value={pm25 != null ? `${pm25} µg/m³${pm25Status}` : "—"} color={pm25Color} />
        <PredRow label="CO₂ estimé dans 5 min"  value={co2  != null ? `${co2} ppm` : "—"} color={color} />
        <PredRow label="Gaz estimé dans 5 min"  value={gas  != null ? `${gas} ppm` : "—"} color={color} />
        <PredRow label="Anomalie détectée"       value={anomaly ? "Oui ⚠" : "Non ✓"}      color={color} />
        <PredRow label="Niveau de risque"        value={risk ?? "Faible"}                  color={color} />
      </ul>
    </div>
  );
}

function PredRow({ label, value, color }) {
  return (
    <li className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={{ color }}>{value}</span>
    </li>
  );
}
