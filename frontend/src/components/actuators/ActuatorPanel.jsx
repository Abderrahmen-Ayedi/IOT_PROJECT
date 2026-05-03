import styles from "./ActuatorPanel.module.css";

export default function ActuatorPanel({ vent, alarm, onToggleVent, onToggleAlarm }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Actionneurs</p>
      <div className={styles.grid}>
        <ActuatorBtn
          label="Ventilateur"
          icon="🌀"
          active={vent}
          activeClass={styles.activeTeal}
          onClick={onToggleVent}
          aria-pressed={vent}
        />
        <ActuatorBtn
          label="Alarme"
          icon="🔔"
          active={alarm}
          activeClass={styles.activeRed}
          onClick={onToggleAlarm}
          aria-pressed={alarm}
        />
      </div>
    </div>
  );
}

function ActuatorBtn({ label, icon, active, activeClass, onClick }) {
  return (
    <button
      className={`${styles.btn} ${active ? activeClass : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.btnIcon}>{icon}</span>
      <span className={styles.btnLabel}>{label}</span>
      <span className={`${styles.state} ${active ? styles.stateOn : styles.stateOff}`}>
        {active ? "ON" : "OFF"}
      </span>
    </button>
  );
}
