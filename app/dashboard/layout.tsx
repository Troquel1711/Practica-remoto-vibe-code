"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  Palette, 
  Users, 
  Zap, 
  Settings,
  LogOut,
  FormInput
} from "lucide-react";
import styles from "./dashboard.module.css";

const navItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Landing Pages", href: "/dashboard/pages", icon: MonitorSmartphone },
  { name: "Branding Kit", href: "/dashboard/branding", icon: Palette },
  { name: "Formularios", href: "/dashboard/forms", icon: FormInput },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Automatizaciones", href: "/dashboard/automations", icon: Zap },
  { name: "Facturación", href: "/dashboard/billing", icon: LayoutDashboard },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  { name: "Administrador", href: "/dashboard/admin", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    window.location.href = "/login";
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Launchify</div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.userMenu}>
          <div className={styles.avatar}>U</div>
          <div style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500 }}>Mi Cuenta</div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Panel de Control</h2>
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
