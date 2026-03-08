"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { Users, LayoutTemplate, AtSign } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalPages: 0, totalLeads: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then(res => {
        if (!res.ok) throw new Error("Acceso denegado o error del servidor");
        return res.json();
      })
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentUsers) setUsers(data.recentUsers);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando panel de administrador...</div>;

  if (error) return (
    <div className={styles.errorState}>
      <h3>⚠️ No Autorizado</h3>
      <p>{error}</p>
      <p>Asegúrate de que tu cuenta tenga el rol de 'admin' en la base de datos.</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3>Panel de Administración Global</h3>
        <p>Vista exclusiva para administradores del sistema.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={24} /></div>
          <div>
            <h4>Usuarios Registrados</h4>
            <div className={styles.statValue}>{metrics.totalUsers}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><LayoutTemplate size={24} /></div>
          <div>
            <h4>Landing Pages Creadas</h4>
            <div className={styles.statValue}>{metrics.totalPages}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><AtSign size={24} /></div>
          <div>
            <h4>Leads Capturados</h4>
            <div className={styles.statValue}>{metrics.totalLeads}</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h4>Usuarios Recientes</h4>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Plan</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name || "-"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${u.plan === 'premium' ? styles.badgePremium : styles.badgeFree}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
