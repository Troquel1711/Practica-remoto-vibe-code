"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, FileText } from "lucide-react";
import styles from "./formslist.module.css";

type FormData = {
  id: string;
  name: string;
  updatedAt: string;
};

export default function FormsList() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/forms")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.forms) setForms(data.forms);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const name = prompt("Nombre del nuevo formulario:");
    if (!name) return;
    setCreating(true);

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      let data;
      try { data = await res.json(); } catch { return; }
      
      if (data && data.form) {
        window.location.href = `/dashboard/forms/builder/${data.form.id}`;
      }
    } catch(err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar el formulario "${name}"?`)) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (res.ok) setForms(forms.filter(f => f.id !== id));
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h3>Mis Formularios</h3>
          <p>Crea formularios para incrustar en tus landing pages y capturar leads.</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className={styles.primaryBtn}>
          <Plus size={18} /> {creating ? "Creando..." : "Nuevo Formulario"}
        </button>
      </header>

      {loading ? (
        <p>Cargando formularios...</p>
      ) : forms.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} color="var(--color-border)" />
          <h4>Aún no tienes formularios</h4>
          <p>Crea tu primer formulario de captura.</p>
          <button onClick={handleCreate} className={styles.primaryBtn}>
            Crear ahora
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {forms.map(form => (
            <div key={form.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>{form.name}</h4>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.date}>Actualizado: {new Date(form.updatedAt).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleDelete(form.id, form.name)} className={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                  <Link href={`/dashboard/forms/builder/${form.id}`} className={styles.editBtn}>
                    <Edit3 size={16} /> Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
