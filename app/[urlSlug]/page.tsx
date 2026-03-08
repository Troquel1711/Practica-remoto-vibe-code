import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import styles from "./published.module.css";
import ClientFormEmbed from "./ClientFormEmbed";

export default async function PublishedPage({ params }: { params: Promise<{ urlSlug: string }> }) {
  const { urlSlug } = await params;
  
  const page = await prisma.page.findUnique({
    where: { urlSlug },
    include: {
      user: {
        include: { brandings: true }
      }
    }
  });

  if (!page) {
    notFound();
  }

  if (page.status !== "published") {
    return (
      <div style={{ textAlign: "center", padding: "10rem 2rem", fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Página en Construcción 🚧</h1>
        <p style={{ color: "#475569" }}>Esta landing page aún está en formato borrador. Si eres el dueño, publícala desde el editor para activarla.</p>
      </div>
    );
  }

  const blocks = JSON.parse(page.contentJson || "[]");
  const branding = page.user.brandings[0];
  
  let primaryColor = "#3A7BFF";
  let headingFont = "Montserrat";
  let bodyFont = "Inter";
  let logoUrl = "";

  if (branding) {
    if (branding.colors) {
      const c = JSON.parse(branding.colors);
      if (c.primary) primaryColor = c.primary;
    }
    if (branding.typography) {
      const t = JSON.parse(branding.typography);
      if (t.heading) headingFont = t.heading;
      if (t.body) bodyFont = t.body;
    }
    if (branding.logoUrl) logoUrl = branding.logoUrl;
  }

  const dynamicStyles = {
    "--brand-primary": primaryColor,
    "--brand-heading": `"${headingFont}", sans-serif`,
    "--brand-body": `"${bodyFont}", sans-serif`,
  } as React.CSSProperties;

  return (
    <div className={styles.pageWrapper} style={dynamicStyles}>
      {logoUrl && (
        <header className={styles.publicHeader}>
          <img src={logoUrl} alt="Logo" className={styles.logo} />
        </header>
      )}

      {blocks.map((block: any) => {
        const blockStyle = {
          marginTop: `${block.style?.marginTop || 0}px`,
          marginBottom: `${block.style?.marginBottom || 0}px`,
        };
        const btnStyle = {
          backgroundColor: block.style?.buttonColor || 'var(--brand-primary)',
          color: block.style?.buttonTextColor || '#ffffff'
        };

        return (
          <section key={block.id} className={`${styles.section} ${styles[block.type]}`} style={blockStyle}>
            <div className={styles.container}>
              {block.type === "hero" && (
                <div className={styles.heroContent}>
                  <h1>{block.data.title}</h1>
                  <p>{block.data.subtitle}</p>
                  <button className={styles.primaryBtn} style={btnStyle}>{block.data.buttonText}</button>
                </div>
              )}
              
              {block.type === "features" && (
                <div className={styles.featuresContent}>
                  <h2>{block.data.title}</h2>
                  <div className={styles.featuresList}>
                    {block.data.items?.split('\n').map((item: string, i: number) => (
                      <div key={i} className={styles.featureItem}>
                        <span className={styles.check}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {block.type === "cta" && (
                <div className={styles.ctaContent}>
                  <h2>{block.data.title}</h2>
                  <button className={styles.primaryBtn} style={btnStyle}>{block.data.buttonText}</button>
                </div>
              )}
              
              {block.type === "form" && (
                <div className={styles.heroContent} style={{ background: '#fff', borderRadius: '12px', padding: '3rem 1rem' }}>
                  <h2>{block.data.title}</h2>
                  {block.data.formId ? (
                    <ClientFormEmbed formId={block.data.formId} btnStyle={btnStyle} buttonText={block.data.buttonText} />
                  ) : (
                    <p style={{ color: '#64748b' }}>Formulario no configurado correctamente por el administrador.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}

      <footer className={styles.publicFooter}>
        <p>Creado con <strong>Launchify</strong></p>
      </footer>
    </div>
  );
}
