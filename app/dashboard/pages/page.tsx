"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, ExternalLink, X, LayoutTemplate, Trash2 } from "lucide-react";
import styles from "./pageslist.module.css";

type PageData = {
  id: string;
  title: string;
  urlSlug: string;
  status: string;
  updatedAt: string;
};

export default function PagesList() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Definimos funciones separadas para evitar que una rompa la otra
    const fetchPages = fetch("/api/pages").then(res => res.ok ? res.json() : null);
    const fetchTemplates = fetch("/api/templates").then(res => res.ok ? res.json() : null);

    Promise.all([fetchPages, fetchTemplates])
      .then(([pagesData, templatesData]) => {
        if (pagesData && pagesData.pages) setPages(pagesData.pages);
        if (templatesData && templatesData.templates) setTemplates(templatesData.templates);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (templateId: string | null = null) => {
    const title = prompt("Nombre de la nueva Landing Page:");
    if (!title) return;
    setCreating(true);

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, templateId })
      });
      let data;
      try { data = await res.json(); } catch { return; }
      
      if (data && data.page) {
        window.location.href = `/dashboard/pages/builder/${data.page.id}`;
      }
    } catch(err) {
      console.error(err);
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar la landing "${title}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id));
      } else {
        alert("Hubo un error al intentar eliminar la página.");
      }
    } catch (e) {
      alert("Fallo de red al intentar eliminar.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h3>Mis Landing Pages</h3>
          <p>Crea y administra tus páginas públicas.</p>
        </div>
        <button onClick={() => setShowModal(true)} disabled={creating} className={styles.primaryBtn}>
          <Plus size={18} /> {creating ? "Creando..." : "Nueva Página"}
        </button>
      </header>

      {loading ? (
        <p>Cargando tus páginas...</p>
      ) : pages.length === 0 ? (
        <div className={styles.emptyState}>
          <h4>Aún no tienes Landing Pages</h4>
          <p>Crea tu primera página y empieza a capturar leads.</p>
          <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>
            Crear mi primera página
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {pages.map(page => (
            <div key={page.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>{page.title}</h4>
                <span className={`${styles.badge} ${page.status === 'published' ? styles.published : styles.draft}`}>
                  {page.status === 'published' ? 'Publicada' : 'Borrador'}
                </span>
              </div>
              <p className={styles.linkInfo}>
                <a href={`/${page.urlSlug}`} target="_blank" rel="noopener noreferrer">
                  /{page.urlSlug} <ExternalLink size={12} />
                </a>
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.date}>Actualizado: {new Date(page.updatedAt).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button onClick={() => handleDelete(page.id, page.title)} className={styles.deleteBtn} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                  <Link href={`/dashboard/pages/builder/${page.id}`} className={styles.editBtn}>
                    <Edit3 size={16} /> Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Gallery Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Galería de Plantillas</h3>
                <p>Elige una plantilla base o empieza desde cero (Total disponibles: {templates.length})</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.templateGrid}>
                <div className={`${styles.templateCard} ${styles.blank}`} onClick={() => handleCreate(null)}>
                  <Plus size={32} color="var(--color-primary)" />
                  <span className={styles.templateName}>Página en Blanco</span>
                </div>
                {templates.map(tpl => (
                  <div key={tpl.id} className={styles.templateCard} onClick={() => handleCreate(tpl.id)}>
                    <div className={styles.templateCategory}>{tpl.category}</div>
                    <div className={styles.templateName}>{tpl.name}</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {tpl.contentJson.length} secciones pre-armadas
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
