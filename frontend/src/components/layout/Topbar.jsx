import styles from "./Topbar.module.css";

export default function Topbar({ clock, connected }) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.dot} />
        <span className={styles.name}>Surveillance qualité de l'air</span>
        <span className={styles.sub}>· ENIS Sfax — Génie Informatique</span>
      </div>

      <div className={styles.right}>
        <div className={`${styles.pill} ${connected ? styles.pillConnected : styles.pillDisconnected}`}>
          <span className={connected ? styles.liveDot : styles.offlineDot} />
          {connected ? "En direct" : "Déconnecté"}
        </div>

        <div className={styles.pill}>
          <span className={styles.clockIcon}>🕐</span>
          <span className={styles.clock}>{clock}</span>
        </div>

        <div className={styles.pill}>
          <span className={styles.nodeLabel}>Node</span>
          <span className={styles.nodeId}>ESP32-01</span>
        </div>
      </div>
    </header>
  );
}
