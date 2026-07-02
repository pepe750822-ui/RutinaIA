import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RutinaIA - Tu entrenador IA personal",
  description:
    "Genera rutinas de ejercicio personalizadas con inteligencia artificial. Más de 1300 ejercicios disponibles.",
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
