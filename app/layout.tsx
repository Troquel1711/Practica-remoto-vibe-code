import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Launchify | Todo en uno para Emprendedores",
  description: "Crea tu landing page, gestiona leads y automatiza tu negocio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
