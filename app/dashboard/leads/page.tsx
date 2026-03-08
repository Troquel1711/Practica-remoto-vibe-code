"use client";

import { useState, useEffect } from "react";
import styles from "./leads.module.css";
import { Search, Filter, MoreVertical } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  tags: string | null;
  source: string | null;
  createdAt: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => {
        if (data.leads) setLeads(data.leads);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h3>Gestión de Leads</h3>
          <p>Administra tus contactos y prospectos.</p>
        </div>
        <button className={styles.exportBtn}>Exportar CSV</button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Origen</th>
              <th>Etiquetas</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>Cargando leads...</td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No se encontraron leads.</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td className={styles.nameCell}>{lead.name || "-"}</td>
                  <td>{lead.email}</td>
                  <td>{lead.source || "Directo"}</td>
                  <td>
                    {lead.tags ? (
                      <span className={styles.tag}>{lead.tags}</span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>Sin etiqueta</span>
                    )}
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionCell}>
                    <button className={styles.iconBtn}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
