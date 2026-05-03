import { getSensorState, getFillPercent, formatValue } from "@/utils/sensorHelpers";
import { THRESHOLDS } from "@/constants/thresholds";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./MetricCard.module.css";

const CARD_CONFIG = {
  co2:  { label: "CO₂ concentr.",  icon: "◎", iconBg: "var(--teal-light)",   iconColor: "var(--teal)",   fillOk: "var(--teal)"   },
  gas:  { label: "Gaz toxiques",   icon: "✦", iconBg: "var(--amber-light)",  iconColor: "var(--amber)",  fillOk: "var(--amber)"  },
  temp: { label: "Température",    icon: "⊕", iconBg: "var(--blue-light)",   iconColor: "var(--blue)",   fillOk: "var(--blue)"   },
  hum:  { label: "Humidité",       icon: "◈", iconBg: "var(--purple-light)", iconColor: "var(--purple)", fillOk: "var(--purple)" },
};

export default function MetricCard({ sensorKey, value }) {
  const cfg   = CARD_CONFIG[sensorKey];
  const t     = THRESHOLDS[sensorKey];
  const state = getSensorState(sensorKey, value);
  const pct   = getFillPercent(sensorKey, value);

  const fillColor =
    state === "danger" ? "var(--red)"   :
    state === "warn"   ? "var(--amber)" :
    cfg.fillOk;

  return (
    <div className={`${styles.card} ${styles[state]}`}>
      <div className={styles.top}>
        <div className={styles.icon} style={{ background: cfg.iconBg, color: cfg.iconColor }}>
          {cfg.icon}
        </div>
        <StatusBadge state={state} />
      </div>

      <p className={styles.label}>{cfg.label}</p>
      <p className={styles.value}>{formatValue(sensorKey, value)}</p>
      <p className={styles.unit}>{t.unit} · {t.sensor}</p>

      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>

      {state !== "ok" && (
        <p className={styles.threshold}>
          Seuil {state === "danger" ? "critique" : "d'alerte"} : {state === "danger" ? t.danger : t.warn} {t.unit}
        </p>
      )}
    </div>
  );
}
