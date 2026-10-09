import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Rutas alias para los iconos referenciados en manifest.json
      { source: "/icon-192.png", destination: "/icon" },
      { source: "/icon-512.png", destination: "/icon" },
    ]
  },
}

export default nextConfig
