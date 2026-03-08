import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Leads</h3>
          <p className={styles.statValue}>0</p>
        </div>
        <div className={styles.statCard}>
          <h3>Conversión</h3>
          <p className={styles.statValue}>0%</p>
        </div>
        <div className={styles.statCard}>
          <h3>Visitas</h3>
          <p className={styles.statValue}>0</p>
        </div>
        <div className={styles.statCard}>
          <h3>Automatizaciones Activas</h3>
          <p className={styles.statValue}>0</p>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h3>Actividad Reciente</h3>
        <div className={styles.emptyState}>
          <p>Aún no hay actividad reciente.</p>
        </div>
      </div>
    </div>
  );
}
