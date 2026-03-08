"use client";

import { useState, useEffect } from "react";
import styles from "./automations.module.css";
import { Plus, Zap, Mail, MessageCircle, Tag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Action = {
  id: string;
  type: string;
  config: string;
};

type Automation = {
  id: string;
  name: string;
  trigger: string;
  status: string;
  actions: Action[];
};

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAutoName, setNewAutoName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/automations")
      .then(async res => {
        if (!res.ok) return null;
        try { return await res.json(); } catch { return null; }
      })
      .then(data => {
        if (data && data.automations) setAutomations(data.automations);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutoName) return;

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAutoName,
          trigger: "form_submit",
          actions: [] // Empezar con un canvas en blanco
        })
      });
      
      let data;
      try {
        data = await res.json();
      } catch {
        alert("Error del servidor, intenta de nuevo.");
        return;
      }

      if (data && data.automation) {
        setShowModal(false);
        setNewAutoName("");
        router.push(`/dashboard/automations/builder/${data.automation.id}`);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const getActionIcon = (type: string) => {
    if (type === "email") return <Mail size={16} />;
    if (type === "whatsapp") return <MessageCircle size={16} />;
    if (type === "tag") return <Tag size={16} />;
    return <Zap size={16} />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h3>Automatizaciones</h3>
          <p>Configura flujos para reaccionar a nuevos leads.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nueva Regla
        </button>
      </header>

      {loading ? (
        <p>Cargando automatizaciones...</p>
      ) : automations.length === 0 ? (
        <div className={styles.emptyState}>
          <Zap size={48} className={styles.emptyIcon} />
          <h4>Sin automatizaciones</h4>
          <p>Crea tu primer flujo para comenzar a ahorrar tiempo.</p>
          <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
            Crear Flujo
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {automations.map(auto => (
            <div key={auto.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4>{auto.name}</h4>
                  <span className={`${styles.statusBadge} ${auto.status === 'active' ? styles.active : ''}`}>
                    {auto.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <button 
                  className={styles.primaryBtn} 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => router.push(`/dashboard/automations/builder/${auto.id}`)}
                >
                  <ArrowRight size={14} /> Editar
                </button>
              </div>
              
              <div className={styles.flow}>
                <div className={styles.step}>
                  <div className={styles.stepIcon}><Zap size={16} /></div>
                  <div className={styles.stepText}>
                    <strong>Trigger: </strong> {auto.trigger === 'form_submit' ? 'Nuevo lead en página' : auto.trigger}
                  </div>
                </div>
                
                <div className={styles.connector}></div>
                
                {auto.actions.map((action, idx) => (
                  <div key={action.id} className={styles.step}>
                    <div className={styles.stepIcon}>{getActionIcon(action.type)}</div>
                    <div className={styles.stepText}>
                      <strong>Acción: </strong> {action.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Nueva Automatización</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.inputGroup}>
                <label>Nombre del flujo</label>
                <input 
                  type="text" 
                  value={newAutoName}
                  onChange={(e) => setNewAutoName(e.target.value)}
                  placeholder="Ej. Bienvenida de leads"
                  autoFocus
                />
              </div>
              <p className={styles.helpText}>Nota: Se abrirá el constructor visual vacío para que diseñes el flujo paso a paso.</p>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancelar</button>
                <button type="submit" className={styles.primaryBtn}>Crear Flujo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
