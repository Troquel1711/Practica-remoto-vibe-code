"use client";

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    nationality: '',
    company: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('https://services.leadconnectorhq.com/hooks/tyLcD5PsU0EFBHpBQXfM/webhook-trigger/81988049-8eb4-4216-9e62-7124ad5a4a65', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', whatsapp: '', nationality: '', company: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error submitting form", error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ background: '#f0fdf4', color: '#166534', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>¡Mensaje Enviado!</h3>
        <p>Nos pondremos en contacto contigo lo antes posible.</p>
        <button 
          onClick={() => setStatus('idle')}
          style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left', background: '#ffffff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Nombre Completo *</label>
          <input required type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Ángel Leovardo" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Correo Electrónico *</label>
          <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="hola@tuempresa.com" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="whatsapp" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>WhatsApp *</label>
          <input required type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+52 000 000 0000" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="nationality" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Nacionalidad</label>
          <input type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Ej: México" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="company" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Nombre de Empresa / Negocio</label>
        <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Mi Empresa S.A de C.V" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="message" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>¿En qué podemos ayudarte?</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Cuéntanos sobre tu proyecto..." rows={4} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
          Hubo un problema enviando el mensaje. Por favor intenta de nuevo.
        </div>
      )}

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        style={{ 
          background: 'var(--color-primary, #3A7BFF)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: 'none', 
          fontSize: '1rem', 
          fontWeight: 'bold', 
          cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: status === 'submitting' ? 0.7 : 1,
          marginTop: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        {status === 'submitting' ? 'Enviando Datos...' : 'Enviar Mensaje Ahora'}
      </button>
    </form>
  );
}
