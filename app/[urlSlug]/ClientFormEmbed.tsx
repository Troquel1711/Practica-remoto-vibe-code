"use client";

import { useState, useEffect } from "react";
import styles from "./published.module.css";

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
};

export default function ClientFormEmbed({ formId, btnStyle, buttonText }: { formId: string, btnStyle: any, buttonText: string }) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [customStyle, setCustomStyle] = useState<any>(null);

  useEffect(() => {
    // We need an unauthenticated endpoint to fetch public block forms
    fetch(`/api/public/forms/${formId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.form && data.form.fieldsJson) {
          try {
            setFields(JSON.parse(data.form.fieldsJson));
            if (data.form.styleJson) {
              setCustomStyle(JSON.parse(data.form.styleJson));
            }
          } catch(e) {
            setError("Error cargando los campos del formulario.");
          }
        } else {
          setError("Formulario no encontrado.");
        }
      })
      .catch(() => setError("Error de conexión."))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleChange = (id: string, value: any) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        setError(`El campo "${field.label}" es obligatorio.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // Endpoint to save leads coming from this form
      const res = await fetch(`/api/public/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData })
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({});
      } else {
        setError("Hubo un problema enviando el formulario.");
      }
    } catch(err) {
      setError("Fallo de red al enviar el formulario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando formulario...</div>;
  if (error && !fields.length) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>;

  if (success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f0fdf4', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>¡Gracias!</h3>
        <p>Tu información ha sido enviada correctamente.</p>
        <button onClick={() => setSuccess(false)} style={{ marginTop: '1rem', background: 'none', border: 'underline', color: '#16a34a', cursor: 'pointer', textDecoration: 'underline' }}>
          Enviar otra respuesta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
      {fields.map(field => (
        <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {field.type !== 'checkbox' && (
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
              {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
          )}

          {field.type === 'textarea' ? (
            <textarea 
              placeholder={field.placeholder} 
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '80px', width: '100%', fontFamily: 'inherit' }}
            />
          ) : field.type === 'checkbox' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                required={field.required}
                checked={formData[field.id] || false}
                onChange={(e) => handleChange(field.id, e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <label style={{ fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
                {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
            </div>
          ) : (
            <input 
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder} 
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          )}
        </div>
      ))}
      
      {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</div>}

      <button 
        type="submit" 
        disabled={submitting} 
        style={customStyle ? {
          background: customStyle.buttonColor,
          color: customStyle.buttonTextColor,
          borderRadius: `${customStyle.borderRadius}px`,
          marginTop: '1rem', width: '100%', padding: '1rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1
        } : { 
          ...btnStyle, marginTop: '1rem', width: '100%', padding: '1rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 
        }}
      >
        {submitting ? 'Enviando...' : (customStyle?.buttonText || buttonText || 'Enviar')}
      </button>
    </form>
  );
}
