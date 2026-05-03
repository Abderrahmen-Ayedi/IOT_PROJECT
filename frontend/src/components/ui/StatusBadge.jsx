import styles from "./StatusBadge.module.css";

const CONFIG = {
  ok:     { label: "Normal",    cls: "ok"     },
  warn:   { label: "Attention", cls: "warn"   },
  danger: { label: "Critique",  cls: "danger" },
};

export default function StatusBadge({ state, size = "sm" }) {
  const { label, cls } = CONFIG[state] ?? CONFIG.ok;
  return (
    <span className={`${styles.badge} ${styles[cls]} ${styles[size]}`}>
      {label}
    </span>
  );
}
