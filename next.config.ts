import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

  images: {
    formats: ["image/avif", "image/webp"],
    // Alineados con los breakpoints del spec §2.4 para que los candidatos de srcset
    // coincidan con los anchos de render reales y no se genere un 2x inútil.
    deviceSizes: [390, 479, 640, 750, 828, 991, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [100, 200, 321, 493, 540, 585, 642],
    qualities: [78, 80, 82, 85],
    // remotePatterns para Vercel Blob se añade en la fase 3, cuando exista el store.
  },

  // sharp recomprime la tarjeta OG a JPEG en app/opengraph-image.tsx. Es un
  // binario nativo: se marca externo para que no se intente empaquetar.
  serverExternalPackages: ["sharp"],

  // La foto de la tarjeta OG vive en app/ y la lee `readFileSync`. Hoy la ruta
  // se hornea en el build y no haría falta, pero si algún día pasa a ser
  // dinámica el bundle de la función no incluye app/ por su cuenta y la ruta
  // fallaría sólo en Vercel. Ver la cabecera de app/opengraph-image.tsx.
  outputFileTracingIncludes: {
    "/opengraph-image": [
      "./app/og-hero.jpg",
      "./public/img/brand/wordmark-boquita-white.svg",
    ],
  },

  // El sitio es es-CR; no hay i18n en v1 (ver plan §8, fuera de alcance).
  poweredByHeader: false,
};

export default nextConfig;
