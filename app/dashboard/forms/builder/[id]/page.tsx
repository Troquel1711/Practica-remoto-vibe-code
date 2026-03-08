"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Type, AlignLeft, Hash, Plus, Trash2, CheckSquare, Mail } from "lucide-react";
import Link from "next/link";
import styles from "./builder.module.css";
import { v4 as uuidv4 } from 'uuid';

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
};

export default function FormBuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [styleData, setStyleData] = useState({
    buttonText: 'Enviar Formulario',
    buttonColor: '#3A7BFF',
    buttonTextColor: '#ffffff',
    borderRadius: '8'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState<FormField | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.form) {
          setFormData(data.form);
          if (data.form.fieldsJson) {
            try { setFields(JSON.parse(data.form.fieldsJson)); } catch(e){}
          }
          if (data.form.styleJson) {
            try { setStyleData(JSON.parse(data.form.styleJson)); } catch(e){}
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveForm = async () => {
    setSaving(true);
    try {
      await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name,
          fieldsJson: JSON.stringify(fields),
          styleJson: JSON.stringify(styleData)
        })
      });
      alert('Formulario guardado con éxito');
    } catch(err) {
      alert('Error al guardar el formulario');
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: string) => {
    let label = "Campo";
    let placeholder = "";
    if (type === 'text') { label = "Texto Corto"; placeholder = "Escribe aquí..."; }
    if (type === 'name') { label = "Nombre"; placeholder = "Ej: Juan"; type = 'text'; }
    if (type === 'lastname') { label = "Apellido"; placeholder = "Ej: Pérez"; type = 'text'; }
    if (type === 'email') { label = "Correo Electrónico"; placeholder = "Ej: hola@email.com"; }
    if (type === 'textarea') { label = "Mensaje Largo"; placeholder = "Escribe tu duda aquí..."; }
    if (type === 'whatsapp') { label = "WhatsApp"; placeholder = "+52 000 000 0000"; type = 'text'; }
    if (type === 'number') { label = "Número"; placeholder = "000 000 000"; }
    if (type === 'nationality') { label = "Nacionalidad"; placeholder = "Ej: Mexicana"; type = 'text'; }
    if (type === 'company') { label = "Empresa / Negocio"; placeholder = "Ej: Mi Empresa SA de CV"; type = 'text'; }
    if (type === 'checkbox') { label = "Acepto los términos"; }

    const newField: FormField = { 
      id: uuidv4(), 
      type, 
      label,
      placeholder,
      required: false
    };
    
    setFields([...fields, newField]);
    setActiveField(newField);
  };

  const removeField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFields(fields.filter(f => f.id !== id));
    if (activeField?.id === id) setActiveField(null);
  };

  const updateActiveField = (updates: Partial<FormField>) => {
    if (!activeField) return;
    const updated = { ...activeField, ...updates };
    setActiveField(updated);
    setFields(fields.map(f => f.id === updated.id ? updated : f));
  };

  if (loading) return <div className={styles.loading}>Cargando editor...</div>;
  if (!formData) return <div className={styles.loading}>Formulario no encontrado</div>;

  return (
    <div className={styles.builderLayout}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link href="/dashboard/forms" className={styles.backBtn}>
            <ArrowLeft size={18} /> Volver
          </Link>
          <div className={styles.pageInfo}>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={styles.titleInput}
            />
          </div>
        </div>
        <div className={styles.topbarRight}>
          <button onClick={saveForm} disabled={saving} className={styles.primaryBtn}>
            <Save size={16} /> Guardar
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h4>Tipos de Campo</h4>
            <div className={styles.blockTypes}>
              <button onClick={() => addField('name')} className={styles.blockTypeBtn}>
                <Type size={20} /> Nombre
              </button>
              <button onClick={() => addField('lastname')} className={styles.blockTypeBtn}>
                <Type size={20} /> Apellido
              </button>
              <button onClick={() => addField('email')} className={styles.blockTypeBtn}>
                <Mail size={20} /> Correo Electrónico
              </button>
              <button onClick={() => addField('whatsapp')} className={styles.blockTypeBtn}>
                <Hash size={20} /> WhatsApp
              </button>
              <button onClick={() => addField('nationality')} className={styles.blockTypeBtn}>
                <Type size={20} /> Nacionalidad
              </button>
              <button onClick={() => addField('company')} className={styles.blockTypeBtn}>
                <Type size={20} /> Empresa
              </button>
              <button onClick={() => addField('text')} className={styles.blockTypeBtn}>
                <Type size={20} /> Otro Texto
              </button>
              <button onClick={() => addField('number')} className={styles.blockTypeBtn}>
                <Hash size={20} /> Número
              </button>
              <button onClick={() => addField('textarea')} className={styles.blockTypeBtn}>
                <AlignLeft size={20} /> Área de Texto
              </button>
              <button onClick={() => addField('checkbox')} className={styles.blockTypeBtn}>
                <CheckSquare size={20} /> Casilla (Checkbox)
              </button>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h4>Configurar Campo</h4>
            {!activeField ? (
              <p className={styles.helpText}>Haz clic en un campo del lienzo para configurarlo.</p>
            ) : (
              <div className={styles.editForm}>
                <div className={styles.inputGroup}>
                  <label>Etiqueta (Label) del campo</label>
                  <input 
                    type="text" 
                    value={activeField.label}
                    onChange={(e) => updateActiveField({ label: e.target.value })}
                  />
                </div>
                {activeField.type !== 'checkbox' && (
                  <div className={styles.inputGroup}>
                    <label>Texto de ejemplo (Placeholder)</label>
                    <input 
                      type="text" 
                      value={activeField.placeholder || ''}
                      onChange={(e) => updateActiveField({ placeholder: e.target.value })}
                    />
                  </div>
                )}
                <div className={styles.checkboxGroup}>
                  <input 
                    type="checkbox" 
                    id="requiredToggle"
                    checked={activeField.required}
                    onChange={(e) => updateActiveField({ required: e.target.checked })}
                  />
                  <label htmlFor="requiredToggle">¿Es obligatorio llenar este campo?</label>
                </div>
              </div>
            )}
          </div>

          <div className={styles.sidebarSection}>
            <h4>Diseño del Formulario</h4>
            <div className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label>Texto del Botón</label>
                <input 
                  type="text" 
                  value={styleData.buttonText}
                  onChange={(e) => setStyleData({...styleData, buttonText: e.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Color del Botón</label>
                <input 
                  type="color" 
                  value={styleData.buttonColor}
                  onChange={(e) => setStyleData({...styleData, buttonColor: e.target.value})}
                  style={{ padding: '0', height: '40px' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Color de Texto del Botón</label>
                <input 
                  type="color" 
                  value={styleData.buttonTextColor}
                  onChange={(e) => setStyleData({...styleData, buttonTextColor: e.target.value})}
                  style={{ padding: '0', height: '40px' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Bordes Redondeados (px)</label>
                <input 
                  type="number" 
                  value={styleData.borderRadius}
                  min="0"
                  max="50"
                  onChange={(e) => setStyleData({...styleData, borderRadius: e.target.value})}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.canvasContainer}>
          <div className={styles.canvas}>
            <div className={styles.formHeader}>
              <h2 style={{fontFamily: 'var(--font-heading)', color: 'var(--color-bg-dark)', marginBottom: '1rem'}}>{formData.name}</h2>
              <p style={{color: 'var(--color-text-muted)'}}>Previsualización de los campos</p>
            </div>
            {fields.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <Plus size={48} />
                <p>Agrega campos desde el panel izquierdo.</p>
              </div>
            ) : (
              <div className={styles.fieldsPreviewList}>
                {fields.map(field => (
                  <div 
                    key={field.id} 
                    className={`${styles.fieldPreview} ${activeField?.id === field.id ? styles.fieldPreviewActive : ''}`}
                    onClick={() => setActiveField(field)}
                  >
                    <button className={styles.deleteBlockBtn} onClick={(e) => removeField(field.id, e)}>
                      <Trash2 size={16} />
                    </button>
                    
                    <label className={styles.previewLabel}>
                      {field.label} {field.required && <span className={styles.requiredStar}>*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea className={styles.previewInput} placeholder={field.placeholder} disabled rows={3} />
                    ) : field.type === 'checkbox' ? (
                      <div className={styles.previewCheckboxRow}>
                        <input type="checkbox" disabled />
                        <span>(Casilla de verificación)</span>
                      </div>
                    ) : (
                      <input className={styles.previewInput} type="text" placeholder={field.placeholder} disabled />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className={styles.formFooterSubmit}>
              <button 
                disabled 
                style={{
                  background: styleData.buttonColor,
                  color: styleData.buttonTextColor,
                  borderRadius: `${styleData.borderRadius}px`,
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'not-allowed',
                  opacity: 0.9
                }}
              >
                {styleData.buttonText}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
