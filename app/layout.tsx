import type { Metadata, Viewport } from "next"
import "./globals.css"

export const viewport: Viewport = {
  themeColor: "#00ff88",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "RutinaIA - Tu entrenador IA personal",
  description:
    "Genera rutinas de ejercicio personalizadas con inteligencia artificial. Más de 1300 ejercicios disponibles.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RutinaIA",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
