import Link from 'next/link';
import ContactForm from './components/ContactForm';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <div className={styles.logo}>Launchify</div>
          <nav className={styles.nav}>
            <Link href="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
            <Link href="/register" className={styles.registerBtn}>Empezar Gratis</Link>
          </nav>
        </header>
        
        <section className={styles.hero}>
          <h1 className={styles.title}>Lanza tu idea en minutos, no en meses.</h1>
          <p className={styles.subtitle}>
            La plataforma todo-en-uno para emprendedores. Crea tu landing page,
            gestiona tus leads y automatiza tu negocio sin tocar una línea de código.
          </p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primaryBtn}>Crear mi cuenta gratis</Link>
          </div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <h2>Hablemos de tu proyecto</h2>
            <p>Contáctanos directamente y nos comunicaremos contigo al instante.</p>
          </div>
          <div className={styles.formContainer}>
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}
