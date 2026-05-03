import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./AlertFeed.module.css";

const ICON = { ok: "✓", warn: "!", danger: "✕" };

export default function AlertFeed({ alerts }) {
  const activeCount = alerts.filter((a) => a.type !== "ok").length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Journal des alertes</span>
        <StatusBadge
          state={activeCount > 0 ? (alerts[0]?.type ?? "ok") : "ok"}
          size="sm"
        >
          {activeCount} alerte{activeCount !== 1 ? "s" : ""}
        </StatusBadge>
      </div>

      <ul className={styles.list} role="log" aria-live="polite" aria-label="Journal des alertes système">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} {...alert} />
        ))}
      </ul>
    </div>
  );
}

function AlertItem({ msg, type, time }) {
  return (
    <li className={`${styles.item} ${styles[type]} animate-slide-in`}>
      <div className={`${styles.icon} ${styles["icon_" + type]}`} aria-hidden="true">
        {ICON[type]}
      </div>
      <div className={styles.body}>
        <p className={styles.msg}>{msg}</p>
        <time className={styles.time}>{time}</time>
      </div>
    </li>
  );
}
