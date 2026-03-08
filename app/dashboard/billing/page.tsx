"use client";

import { useState, useEffect } from "react";
import styles from "./billing.module.css";
import { CheckCircle, Zap } from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(async res => {
        if (!res.ok) return null;
        try { return await res.json(); } catch { return null; }
      })
      .then(data => {
        if (data && data.user) {}
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || currentPlan === 'premium') return;

    let script = document.getElementById("paypal-js-script") as HTMLScriptElement;

    const renderPaypalButton = () => {
      // @ts-ignore
      if (window.paypal && document.getElementById("paypal-button-container")) {
        // @ts-ignore
        document.getElementById("paypal-button-container").innerHTML = ""; // Limpiar antes de re-renderizar
        // @ts-ignore
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: "Launchify Premium Plan",
                amount: { value: "19.99" }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            setUpgrading(true);
            try {
              const res = await fetch("/api/billing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
              });
              if (res.ok) {
                setCurrentPlan("premium");
                setSuccess(true);
              }
            } catch(err) {
              alert("Hubo un error verificando tu pago.");
            } finally {
              setUpgrading(false);
            }
          }
        }).render("#paypal-button-container").catch((err: any) => {
          console.error("PayPal failed to render", err);
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = "paypal-js-script";
      script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD";
      script.async = true;
      script.onload = renderPaypalButton;
      document.body.appendChild(script);
    } else {
      renderPaypalButton();
    }
  }, [loading, currentPlan]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3>Facturación y Planes</h3>
        <p>Gestiona tu suscripción de Launchify.</p>
      </header>

      {success && (
        <div className={styles.successAlert}>
          <CheckCircle size={20} />
          <span>¡Felicidades! Tu cuenta ahora es Premium. Disfruta de todos los beneficios.</span>
        </div>
      )}

      <div className={styles.grid}>
        <div className={`${styles.planCard} ${currentPlan === 'free' ? styles.activePlan : ''}`}>
          <div className={styles.planHeader}>
            <h4>Plan Gratuito</h4>
            <div className={styles.price}>$0<span>/mes</span></div>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> 1 Landing Page</div>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Hasta 100 Leads</div>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Branding Básico</div>
          </div>
          {currentPlan === 'free' && (
            <div className={styles.currentBadge}>Tu plan actual</div>
          )}
        </div>

        <div className={`${styles.planCard} ${styles.premiumCard} ${currentPlan === 'premium' ? styles.activePlan : ''}`}>
          <div className={styles.planHeader}>
            <h4><Zap size={20} className={styles.zapIcon}/> Launchify Premium</h4>
            <div className={styles.price}>$19.99<span>/mes</span></div>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Landing Pages Ilimitadas</div>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Leads Ilimitados</div>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Exportación de Bases de Datos</div>
            <div className={styles.feature}><CheckCircle size={16} className={styles.checkIcon} /> Eliminar marca de agua</div>
          </div>
          
          {currentPlan === 'free' ? (
            <div className={styles.paypalBox}>
              <p className={styles.paypalHelp}>Pagar usando PayPal de forma segura a <strong>angel.leovardo@gmail.com</strong></p>
              {upgrading ? (
                <div className={styles.upgradingMsg}>Procesando pago...</div>
              ) : (
                <div id="paypal-button-container" className={styles.paypalContainer}></div>
              )}
            </div>
          ) : (
             <div className={styles.currentBadge}>Tu plan actual</div>
          )}
        </div>
      </div>
    </div>
  );
}
