import styles from "./PredictionPanel.module.css";

const STATE_COLOR = {
  ok:     "var(--teal-dark)",
  warn:   "var(--amber)",
  danger: "var(--red-dark)",
};

export default function PredictionPanel({ predictions }) {
  const { co2, gas, anomaly, risk, state } = predictions;
  const color = STATE_COLOR[state] ?? STATE_COLOR.ok;

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Prédictions ML · <span className={styles.model}>Isolation Forest</span></p>

      <ul className={styles.list}>
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
