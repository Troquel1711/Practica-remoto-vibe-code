"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, LayoutTemplate, Type, Zap, Plus, Trash2, FormInput } from "lucide-react";
import styles from "./builder.module.css";
import { v4 as uuidv4 } from 'uuid';

type Block = {
  id: string;
  type: string;
  data: any;
  style?: {
    marginTop: number;
    marginBottom: number;
    buttonColor?: string;
    buttonTextColor?: string;
  };
};

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [pageData, setPageData] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pages/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.page) {
          setPageData(data.page);
          if (data.page.contentJson) {
            try {
              setBlocks(JSON.parse(data.page.contentJson));
            } catch (e) {
              setBlocks([]);
            }
          }
        }
      });

    fetch(`/api/forms`)
      .then(res => res.json())
      .then(data => {
        if (data && data.forms) {
          setAvailableForms(data.forms);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const savePage = async () => {
    setSaving(true);
    try {
      await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...pageData,
          contentJson: JSON.stringify(blocks) 
        })
      });
      alert('Cambios guardados');
    } catch(err) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const publishPage = async () => {
    setSaving(true);
    try {
      await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...pageData,
          contentJson: JSON.stringify(blocks),
          status: "published"
        })
      });
      setPageData({...pageData, status: "published"});
      alert('Página publicada');
    } catch(err) {
      alert('Error al publicar');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: string) => {
    let newData = {};
    if (type === 'hero') newData = { title: "Nuevo Título", subtitle: "Subtítulo", buttonText: "Comenzar" };
    if (type === 'features') newData = { title: "Beneficios", items: "1. Primer beneficio\n2. Segundo beneficio" };
    if (type === 'cta') newData = { title: "¿Listo para empezar?", buttonText: "Haz click aquí" };
    if (type === 'form') newData = { title: "Contáctanos", formId: "", buttonText: "Enviar" };

    const newBlock: Block = { 
      id: uuidv4(), 
      type, 
      data: newData,
      style: {
        marginTop: 0,
        marginBottom: 0,
        buttonColor: "#3A7BFF",
        buttonTextColor: "#FFFFFF"
      }
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlock(newBlock);
  };

  const removeBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlock?.id === id) setActiveBlock(null);
  };

  const updateActiveBlockData = (data: any) => {
    if (!activeBlock) return;
    const updated = { ...activeBlock, data: { ...activeBlock.data, ...data } };
    setActiveBlock(updated);
    setBlocks(blocks.map(b => b.id === updated.id ? updated : b));
  };

  const updateActiveBlockStyle = (styleProps: any) => {
    if (!activeBlock) return;
    const currentStyle = activeBlock.style || { marginTop: 0, marginBottom: 0 };
    const updated = { ...activeBlock, style: { ...currentStyle, ...styleProps } };
    setActiveBlock(updated);
    setBlocks(blocks.map(b => b.id === updated.id ? updated : b));
  };

  if (loading) return <div className={styles.loading}>Cargando editor...</div>;
  if (!pageData) return <div className={styles.loading}>Página no encontrada</div>;

  return (
    <div className={styles.builderLayout}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link href="/dashboard/pages" className={styles.backBtn}>
            <ArrowLeft size={18} /> Volver
          </Link>
          <div className={styles.pageInfo}>
            <input 
              type="text" 
              value={pageData.title}
              onChange={(e) => setPageData({...pageData, title: e.target.value})}
              className={styles.titleInput}
            />
            <span className={styles.slugEdit}>/{pageData.urlSlug}</span>
          </div>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.statusInfo}>{pageData.status === 'published' ? '🟢 Publicada' : '⚫ Borrador'}</span>
          <button onClick={savePage} disabled={saving} className={styles.secondaryBtn}>
            <Save size={16} /> Guardar
          </button>
          <button onClick={publishPage} disabled={saving || pageData.status === 'published'} className={styles.primaryBtn}>
            Publicar
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h4>Agregar Secciones</h4>
            <div className={styles.blockTypes}>
              <button onClick={() => addBlock('hero')} className={styles.blockTypeBtn}>
                <LayoutTemplate size={20} /> Hero Section
              </button>
              <button onClick={() => addBlock('features')} className={styles.blockTypeBtn}>
                <Type size={20} /> Bloque de Texto / Specs
              </button>
              <button onClick={() => addBlock('cta')} className={styles.blockTypeBtn}>
                <Zap size={20} /> Call to Action
              </button>
              <button onClick={() => addBlock('form')} className={styles.blockTypeBtn}>
                <FormInput size={20} /> Formulario
              </button>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h4>Editor de Sección</h4>
            {!activeBlock ? (
              <p className={styles.helpText}>Selecciona una sección en el lienzo para editar sus propiedades.</p>
            ) : (
              <div className={styles.editForm}>
                <h5 className={styles.subHeading}>Contenido</h5>
                {Object.keys(activeBlock.data).map(key => (
                  <div key={key} className={styles.inputGroup}>
                    <label>{key}</label>
                    {key === 'items' ? (
                      <textarea 
                        value={activeBlock.data[key]}
                        onChange={(e) => updateActiveBlockData({ [key]: e.target.value })}
                        rows={4}
                      />
                    ) : key === 'formId' ? (
                      <select 
                        value={activeBlock.data[key]}
                        onChange={(e) => updateActiveBlockData({ [key]: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                      >
                        <option value="">Selecciona un Formulario</option>
                        {availableForms.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={activeBlock.data[key]}
                        onChange={(e) => updateActiveBlockData({ [key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                <h5 className={styles.subHeading} style={{ marginTop: '1rem' }}>Diseño y Margen</h5>
                <div className={styles.inputGroupStyle}>
                  <label>Margen Superior (px)</label>
                  <input 
                    type="number" 
                    value={activeBlock.style?.marginTop || 0}
                    onChange={(e) => updateActiveBlockStyle({ marginTop: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className={styles.inputGroupStyle}>
                  <label>Margen Inferior (px)</label>
                  <input 
                    type="number" 
                    value={activeBlock.style?.marginBottom || 0}
                    onChange={(e) => updateActiveBlockStyle({ marginBottom: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {activeBlock.data.buttonText && (
                  <>
                    <div className={styles.inputGroupStyle}>
                      <label>Color Botón</label>
                      <div className={styles.colorPickerRow}>
                        <input 
                          type="color" 
                          value={activeBlock.style?.buttonColor || "#3A7BFF"}
                          onChange={(e) => updateActiveBlockStyle({ buttonColor: e.target.value })}
                        />
                        <span>{activeBlock.style?.buttonColor || "#3A7BFF"}</span>
                      </div>
                    </div>
                    <div className={styles.inputGroupStyle}>
                      <label>Texto Botón</label>
                      <div className={styles.colorPickerRow}>
                        <input 
                          type="color" 
                          value={activeBlock.style?.buttonTextColor || "#FFFFFF"}
                          onChange={(e) => updateActiveBlockStyle({ buttonTextColor: e.target.value })}
                        />
                        <span>{activeBlock.style?.buttonTextColor || "#FFFFFF"}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className={styles.canvasContainer}>
          <div className={styles.canvas}>
            {blocks.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <Plus size={48} />
                <p>Agrega secciones desde el panel izquierdo.</p>
              </div>
            ) : (
              blocks.map(block => {
                const blockStyle = {
                  marginTop: `${block.style?.marginTop || 0}px`,
                  marginBottom: `${block.style?.marginBottom || 0}px`,
                };
                const btnStyle = {
                  backgroundColor: block.style?.buttonColor || 'var(--color-primary)',
                  color: block.style?.buttonTextColor || '#ffffff'
                };

                return (
                  <div 
                    key={block.id} 
                    className={`${styles.blockPreview} ${activeBlock?.id === block.id ? styles.blockPreviewActive : ''}`}
                    onClick={() => setActiveBlock(block)}
                    style={blockStyle}
                  >
                    <button className={styles.deleteBlockBtn} onClick={(e) => removeBlock(block.id, e)}>
                      <Trash2 size={16} />
                    </button>
                    
                    {block.type === 'hero' && (
                      <div className={styles.previewHero}>
                        <h1>{block.data.title}</h1>
                        <p>{block.data.subtitle}</p>
                        <button style={btnStyle}>{block.data.buttonText}</button>
                      </div>
                    )}
                    {block.type === 'features' && (
                      <div className={styles.previewFeatures}>
                        <h2>{block.data.title}</h2>
                        <div className={styles.previewTextList}>
                          {block.data.items?.split('\n').map((item: string, i: number) => <p key={i}>{item}</p>)}
                        </div>
                      </div>
                    )}
                    {block.type === 'cta' && (
                      <div className={styles.previewCta}>
                        <h2>{block.data.title}</h2>
                        <button style={btnStyle}>{block.data.buttonText}</button>
                      </div>
                    )}
                    {block.type === 'form' && (
                      <div className={styles.previewHero} style={{ background: '#fff' }}>
                        <h2>{block.data.title}</h2>
                        <div style={{ padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', margin: '2rem auto', maxWidth: '400px' }}>
                          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {block.data.formId ? '📋 Formulario Enlazado' : '⚠️ Selecciona un formulario nativo en el panel'}
                          </p>
                          <button style={{...btnStyle, width: '100%'}}>{block.data.buttonText}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
