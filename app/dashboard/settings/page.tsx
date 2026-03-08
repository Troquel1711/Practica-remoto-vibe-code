"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(async res => {
        if (!res.ok) return null;
        try { return await res.json(); } catch { return null; }
      })
      .then(data => {
        if (data && data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage("Configuración actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
    } catch(err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3>Configuración de la Cuenta</h3>
        <p>Actualiza tus datos personales y contraseña.</p>
      </header>

      {message && (
        <div className={message.startsWith("Error") ? styles.errorMsg : styles.successMsg}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className={styles.formCard}>
        <div className={styles.section}>
          <h4>Perfil</h4>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" value={email} disabled className={styles.disabledInput} />
              <small className={styles.helpText}>El email no se puede cambiar por seguridad.</small>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Cambiar Contraseña (Opcional)</h4>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Contraseña Actual</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                placeholder="Deja en blanco si no deseas cambiarla"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Nueva contraseña segura"
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
