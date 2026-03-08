"use client";

import { useState, useEffect } from "react";
import styles from "./branding.module.css";

export default function BrandingPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3A7BFF");
  const [secondaryColor, setSecondaryColor] = useState("#6C4DFF");
  const [headingFont, setHeadingFont] = useState("Montserrat");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/branding")
      .then(async res => {
        if (!res.ok) return null;
        try {
          return await res.json();
        } catch {
          return null;
        }
      })
      .then(data => {
        if (data && data.branding) {
          setLogoUrl(data.branding.logoUrl || "");
          const colors = JSON.parse(data.branding.colors || "{}");
          const fonts = JSON.parse(data.branding.typography || "{}");
          
          if (colors.primary) setPrimaryColor(colors.primary);
          if (colors.secondary) setSecondaryColor(colors.secondary);
          if (fonts.heading) setHeadingFont(fonts.heading);
          if (fonts.body) setBodyFont(fonts.body);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const colors = JSON.stringify({ primary: primaryColor, secondary: secondaryColor });
    const typography = JSON.stringify({ heading: headingFont, body: bodyFont });

    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl, colors, typography })
      });

      if (!res.ok) throw new Error("Error al guardar");
      setMessage("Configuración guardada exitosamente.");
    } catch (err: any) {
      setMessage("Hubo un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3>Branding Kit</h3>
        <p>Configura la identidad visual de tus landing pages.</p>
      </header>

      {message && <div className={styles.message}>{message}</div>}

      <form onSubmit={handleSave} className={styles.formCard}>
        <div className={styles.section}>
          <h4>Logo</h4>
          <div className={styles.inputGroup}>
            <label>URL del Logo</label>
            <input 
              type="url" 
              value={logoUrl} 
              onChange={e => setLogoUrl(e.target.value)} 
              placeholder="https://ejemplo.com/logo.png" 
            />
          </div>
          {logoUrl && (
            <div className={styles.previewLogo}>
              <img src={logoUrl} alt="Logo preview" style={{maxHeight: 60}} />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h4>Colores</h4>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Color Principal</label>
              <div className={styles.colorPickerWrapper}>
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)} 
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)} 
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Color Secundario</label>
              <div className={styles.colorPickerWrapper}>
                <input 
                  type="color" 
                  value={secondaryColor} 
                  onChange={e => setSecondaryColor(e.target.value)} 
                />
                <input 
                  type="text" 
                  value={secondaryColor} 
                  onChange={e => setSecondaryColor(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Tipografía</h4>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Títulos</label>
              <select value={headingFont} onChange={e => setHeadingFont(e.target.value)}>
                <option value="Montserrat">Montserrat</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Párrafos</label>
              <select value={bodyFont} onChange={e => setBodyFont(e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
              </select>
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
