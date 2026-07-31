import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    // Alineados con los breakpoints del spec §2.4 para que los candidatos de srcset
    // coincidan con los anchos de render reales y no se genere un 2x inútil.
    deviceSizes: [390, 479, 640, 750, 828, 991, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [100, 200, 321, 493, 540, 585, 642],
    qualities: [78, 80, 82, 85],
    // remotePatterns para Vercel Blob se añade en la fase 3, cuando exista el store.
  },

  // El sitio es es-CR; no hay i18n en v1 (ver plan §8, fuera de alcance).
  poweredByHeader: false,
};

export default nextConfig;
