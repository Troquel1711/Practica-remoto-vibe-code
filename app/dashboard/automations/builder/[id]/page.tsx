"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./builder.module.css";
import { 
  Zap, Mail, MessageCircle, Tag, Clock, 
  Save, Play, X, Plus, Trash2, ArrowLeft,
  Globe, MessageSquare, Hash, Bot, GitBranch 
} from "lucide-react";

type ActionNode = {
  id: string; // Temporary UI id
  type: string;
  config: any;
};

export default function AutomationBuilder() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoName, setAutoName] = useState("");
  const [trigger, setTrigger] = useState("form_submit");
  const [status, setStatus] = useState("active");
  const [actions, setActions] = useState<ActionNode[]>([]);
  
  // Side panel state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertIndex, setInsertIndex] = useState(-1);

  useEffect(() => {
    fetch(`/api/automations/${params.id}`)
      .then(async res => {
        if (!res.ok) return null;
        try { return await res.json(); } catch { return null; }
      })
      .then(data => {
        if (data && data.automation) {
          setAutoName(data.automation.name);
          setTrigger(data.automation.trigger);
          setStatus(data.automation.status);
          
          const mappedActions = data.automation.actions.map((act: any) => ({
            id: act.id || Math.random().toString(36).substring(7),
            type: act.type,
            config: typeof act.config === 'string' ? JSON.parse(act.config || '{}') : act.config
          }));
          setActions(mappedActions);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/automations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: autoName,
          trigger,
          status,
          actions
        })
      });
      if (res.ok) {
        alert("Automatización guardada correctamente.");
      } else {
        alert("Error al guardar.");
      }
    } catch(err) {
      alert("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const addAction = (type: string) => {
    const defaultConfigs: Record<string, any> = {
      email: { subject: "", body: "" },
      whatsapp: { message: "" },
      tag: { tags: "" },
      wait: { duration: 1, unit: "days" },
      webhook: { url: "", method: "POST" },
      sms: { phoneField: "phone", message: "" },
      slack: { channel: "", message: "" },
      openai: { prompt: "", outputField: "" },
      condition: { field: "tags", operator: "contains", value: "" }
    };

    const newNode = {
      id: Math.random().toString(36).substring(7),
      type,
      config: defaultConfigs[type] || {}
    };

    const newActions = [...actions];
    if (insertIndex === -1 || insertIndex >= actions.length) {
      newActions.push(newNode);
    } else {
      newActions.splice(insertIndex, 0, newNode);
    }

    setActions(newActions);
    setShowAddModal(false);
    setSelectedNodeId(newNode.id);
  };

  const deleteAction = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActions(actions.filter(a => a.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateSelectedNode = (key: string, value: any) => {
    setActions(actions.map(act => {
      if (act.id === selectedNodeId) {
        return { ...act, config: { ...act.config, [key]: value } };
      }
      return act;
    }));
  };

  const getIcon = (type: string) => {
    if (type === "trigger") return <Zap size={20} />;
    if (type === "email") return <Mail size={20} />;
    if (type === "whatsapp") return <MessageCircle size={20} />;
    if (type === "tag") return <Tag size={20} />;
    if (type === "wait") return <Clock size={20} />;
    if (type === "webhook") return <Globe size={20} />;
    if (type === "sms") return <MessageSquare size={20} />;
    if (type === "slack") return <Hash size={20} />;
    if (type === "openai") return <Bot size={20} />;
    if (type === "condition") return <GitBranch size={20} />;
    return <Zap size={20} />;
  };

  const getNodeTitle = (type: string) => {
    if (type === "email") return "Enviar Email";
    if (type === "whatsapp") return "Enviar WhatsApp";
    if (type === "tag") return "Añadir Etiqueta";
    if (type === "wait") return "Esperar";
    if (type === "webhook") return "Llamar Webhook";
    if (type === "sms") return "Enviar SMS";
    if (type === "slack") return "Notificar en Slack";
    if (type === "openai") return "Generar con IA";
    if (type === "condition") return "Condición If/Else";
    return type;
  };

  const getNodeDesc = (node: ActionNode) => {
    if (node.type === "email") return node.config.subject ? `Asunto: ${node.config.subject}` : "Configurar email...";
    if (node.type === "whatsapp") return node.config.message ? `Msj: ${node.config.message.substring(0, 20)}...` : "Configurar msj...";
    if (node.type === "tag") return node.config.tags ? `Etiquetas: ${node.config.tags}` : "Añadir tags...";
    if (node.type === "wait") return `${node.config.duration || 1} ${node.config.unit || 'days'}`;
    if (node.type === "webhook") return node.config.url ? `POST: ${node.config.url.substring(0,20)}...` : "Configurar URL...";
    if (node.type === "sms") return node.config.message ? `SMS: ${node.config.message.substring(0,15)}...` : "Mensaje SMS...";
    if (node.type === "slack") return node.config.channel ? `#${node.config.channel}` : "Canal de Slack...";
    if (node.type === "openai") return node.config.prompt ? `Prompt configurado` : "Instrucción IA...";
    if (node.type === "condition") return node.config.field ? `Si ${node.config.field} ${node.config.operator} ${node.config.value}` : "Configurar lógica...";
    return "";
  };

  const selectedNode = actions.find(a => a.id === selectedNodeId);

  if (loading) return <div>Cargando constructor...</div>;

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerActions}>
           <button onClick={() => router.push("/dashboard/automations")} className={styles.closeBtn}>
             <ArrowLeft size={20} />
           </button>
           <div className={styles.titleArea}>
             <input 
                type="text" 
                value={autoName} 
                onChange={(e) => setAutoName(e.target.value)} 
                placeholder="Nombre del Flujo"
             />
             <span>Flujo guardado automáticamente (Borrador)</span>
           </div>
        </div>

        <div className={styles.headerActions}>
          <div 
            className={`${styles.statusToggle} ${status === 'active' ? styles.active : ''}`}
            onClick={() => setStatus(status === 'active' ? 'draft' : 'active')}
          >
            {status === 'active' ? 'Activo' : 'Borrador'}
            <div style={{
              width: 36, height: 20, background: status === 'active' ? '#10b981' : '#cbd5e1', 
              borderRadius: 20, position: 'relative', transition: 'all 0.3s'
            }}>
              <div style={{
                position: 'absolute', top: 2, left: status === 'active' ? 18 : 2, 
                width: 16, height: 16, background: 'white', borderRadius: '50%', transition: 'all 0.3s'
              }}/>
            </div>
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <div className={styles.canvas} onClick={() => setSelectedNodeId(null)}>
        
        {/* Trigger Node (Fixed) */}
        <div className={styles.nodeWrapper}>
          <div className={`${styles.node} ${selectedNodeId === 'trigger' ? styles.selected : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedNodeId('trigger'); }}>
            <div className={`${styles.nodeIcon} ${styles.triggerIcon}`}>
              {getIcon("trigger")}
            </div>
            <div className={styles.nodeContent}>
              <div className={styles.nodeTitle}>Nuevo Lead</div>
              <div className={styles.nodeDesc}>Cuando un lead se registra (Formulario)</div>
            </div>
          </div>
          
          <div className={styles.connectorLine}>
            <button className={styles.addActionBtn} onClick={(e) => { e.stopPropagation(); setInsertIndex(0); setShowAddModal(true); }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Action Nodes (Dynamic) */}
        {actions.map((node, index) => (
          <div key={node.id} className={styles.nodeWrapper}>
            <div className={`${styles.node} ${selectedNodeId === node.id ? styles.selected : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}>
              <button className={styles.deleteNodeBtn} onClick={(e) => deleteAction(e, node.id)}><X size={14}/></button>
              
              <div className={`${styles.nodeIcon} ${styles[`${node.type}Icon`] || styles.actionIcon}`}>
                {getIcon(node.type)}
              </div>
              <div className={styles.nodeContent}>
                <div className={styles.nodeTitle}>{getNodeTitle(node.type)}</div>
                <div className={styles.nodeDesc}>{getNodeDesc(node)}</div>
              </div>
            </div>

            <div className={styles.connectorLine}>
              <button className={styles.addActionBtn} onClick={(e) => { e.stopPropagation(); setInsertIndex(index + 1); setShowAddModal(true); }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}

        <div className={styles.endNode}>Fin del Flujo</div>
      </div>

      {/* Configuration Side Panel */}
      <div className={`${styles.sidePanel} ${selectedNodeId ? styles.open : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h4>
            {selectedNodeId === 'trigger' ? getIcon("trigger") : selectedNode ? getIcon(selectedNode.type) : null}
            {selectedNodeId === 'trigger' ? "Configurar Trigger" : selectedNode ? getNodeTitle(selectedNode.type) : ""}
          </h4>
          <button className={styles.closeBtn} onClick={() => setSelectedNodeId(null)}><X size={20} /></button>
        </div>
        
        <div className={styles.panelContent}>
          {selectedNodeId === 'trigger' ? (
            <div className={styles.formGroup}>
              <label>Origen (Trigger)</label>
              <select value={trigger} onChange={e => setTrigger(e.target.value)}>
                <option value="form_submit">Formulario Landing Page</option>
                <option value="webhook" disabled>Webhook (Próximamente)</option>
              </select>
            </div>
          ) : selectedNode ? (
            <>
              {selectedNode.type === "email" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Asunto del Correo</label>
                    <input type="text" value={selectedNode.config.subject || ""} onChange={e => updateSelectedNode("subject", e.target.value)} placeholder="Ej. ¡Gracias por registrarte!" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cuerpo del Correo</label>
                    <textarea value={selectedNode.config.body || ""} onChange={e => updateSelectedNode("body", e.target.value)} placeholder="Escribe el mensaje aquí..." />
                  </div>
                </>
              )}
              
              {selectedNode.type === "whatsapp" && (
                <div className={styles.formGroup}>
                  <label>Mensaje de WhatsApp</label>
                  <textarea value={selectedNode.config.message || ""} onChange={e => updateSelectedNode("message", e.target.value)} placeholder="Hola, vimos tu registro..." />
                </div>
              )}
              
              {selectedNode.type === "tag" && (
                <div className={styles.formGroup}>
                  <label>Etiquetas (Separadas por comas)</label>
                  <input type="text" value={selectedNode.config.tags || ""} onChange={e => updateSelectedNode("tags", e.target.value)} placeholder="Ej. lead-caliente, ebook-descargado" />
                </div>
              )}

              {selectedNode.type === "wait" && (
                <div className={styles.formGroup}>
                  <label>Tiempo de espera</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" min="1" value={selectedNode.config.duration || 1} onChange={e => updateSelectedNode("duration", Number(e.target.value))} />
                    <select value={selectedNode.config.unit || "days"} onChange={e => updateSelectedNode("unit", e.target.value)}>
                      <option value="minutes">Minutos</option>
                      <option value="hours">Horas</option>
                      <option value="days">Días</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedNode.type === "webhook" && (
                <>
                  <div className={styles.formGroup}>
                    <label>URL del Webhook</label>
                    <input type="url" value={selectedNode.config.url || ""} onChange={e => updateSelectedNode("url", e.target.value)} placeholder="https://api.tu-servidor.com/hook" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Método HTTP</label>
                    <select value={selectedNode.config.method || "POST"} onChange={e => updateSelectedNode("method", e.target.value)}>
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === "sms" && (
                <div className={styles.formGroup}>
                  <label>Cuerpo del SMS (Twilio)</label>
                  <textarea value={selectedNode.config.message || ""} onChange={e => updateSelectedNode("message", e.target.value)} placeholder="Hola, esta es una alerta SMS..." />
                </div>
              )}

              {selectedNode.type === "slack" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Canal de Slack</label>
                    <input type="text" value={selectedNode.config.channel || ""} onChange={e => updateSelectedNode("channel", e.target.value)} placeholder="Ej. leads-calientes" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mensaje Interno</label>
                    <textarea value={selectedNode.config.message || ""} onChange={e => updateSelectedNode("message", e.target.value)} placeholder="Nuevo lead detectado..." />
                  </div>
                </>
              )}

              {selectedNode.type === "openai" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Prompt (Instrucción IA)</label>
                    <textarea value={selectedNode.config.prompt || ""} onChange={e => updateSelectedNode("prompt", e.target.value)} placeholder="Ej. Redacta un asunto personalizado basado en este lead..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Guardar resultado en variable</label>
                    <input type="text" value={selectedNode.config.outputField || ""} onChange={e => updateSelectedNode("outputField", e.target.value)} placeholder="Ej. custom_subject" />
                  </div>
                </>
              )}

              {selectedNode.type === "condition" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Campo a evaluar</label>
                    <input type="text" value={selectedNode.config.field || "tags"} onChange={e => updateSelectedNode("field", e.target.value)} placeholder="Ej. tags, email, source" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Operador</label>
                    <select value={selectedNode.config.operator || "contains"} onChange={e => updateSelectedNode("operator", e.target.value)}>
                      <option value="contains">Contiene</option>
                      <option value="equals">Es igual a</option>
                      <option value="not_equals">No es igual a</option>
                      <option value="starts_with">Empieza con</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Valor</label>
                    <input type="text" value={selectedNode.config.value || ""} onChange={e => updateSelectedNode("value", e.target.value)} placeholder="Ej. premium" />
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Add Action Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.actionModal} onClick={e => e.stopPropagation()}>
            <h3>Añadir Acción</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Selecciona qué hacer a continuación.</p>
            
            <div className={styles.actionGrid}>
              <div className={styles.actionOption} onClick={() => addAction("email")}>
                <div className={`${styles.nodeIcon} ${styles.emailIcon}`}><Mail size={24}/></div>
                <span>Enviar Email</span>
                <p>Notifica a tus leads por correo</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("whatsapp")}>
                <div className={`${styles.nodeIcon} ${styles.whatsappIcon}`}><MessageCircle size={24}/></div>
                <span>WhatsApp</span>
                <p>Envía un mensaje directo</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("wait")}>
                <div className={`${styles.nodeIcon} ${styles.waitIcon}`}><Clock size={24}/></div>
                <span>Esperar</span>
                <p>Pausa temporalmente el flujo</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("tag")}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><Tag size={24}/></div>
                <span>Añadir Etiqueta</span>
                <p>Segmenta tus contactos</p>
              </div>
              
              {/* New Nodes */}
              <div className={styles.actionOption} onClick={() => addAction("webhook")}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><Globe size={24}/></div>
                <span>Webhook</span>
                <p>Conecta con otras APIs</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("sms")}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><MessageSquare size={24}/></div>
                <span>Enviar SMS</span>
                <p>Vía integración Twilio</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("slack")}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><Hash size={24}/></div>
                <span>Slack</span>
                <p>Notificación a tu equipo</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("openai")}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><Bot size={24}/></div>
                <span>OpenAI</span>
                <p>Generación con IA</p>
              </div>
              <div className={styles.actionOption} onClick={() => addAction("condition")} style={{ gridColumn: 'span 2' }}>
                <div className={`${styles.nodeIcon} ${styles.tagIcon}`}><GitBranch size={24}/></div>
                <span>Condición If/Else</span>
                <p>Divide el flujo basado en reglas lógicas</p>
              </div>
            </div>
            
            <div style={{ marginTop: "2rem", textAlign: "right" }}>
               <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
