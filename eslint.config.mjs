import { FlatCompat } from "@eslint/eslintrc";

/**
 * eslint-config-next 15.5.x todavía no expone un entry point de flat config
 * (su package.json no tiene campo `exports`), así que se adapta con FlatCompat.
 *
 * Se invoca `eslint .` directamente en vez de `next lint`, que está deprecado
 * en Next 15.5 y desaparece en Next 16.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  {
    ignores: [
      ".next/**",
      ".next-*/**",
      "node_modules/**",
      "assets/**",
      "public/**",
      "next-env.d.ts",
      "coverage/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Las secciones del spec reciben contenido ya validado con Zod desde el
      // servidor; no se usa `any` en ninguna parte, así que se mantiene estricto.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Desactivada a conciencia, no por comodidad (ver D-9 en docs/DEVIATIONS.md).
      //
      // Las 15 imágenes del layout son assets de marca FIJOS, con sus tamaños ya
      // pre-generados por scripts/build-images.mjs. Servirlas con `<img srcset>`
      // evita el optimizador de Next por completo: cero cuota de transformaciones,
      // CDN inmutable, comportamiento idéntico en preview y en producción, y el
      // hero conserva el `<img>` que el spec posiciona sin necesidad de un wrapper
      // que pelee con su `inset:0 0 0 auto; width:43.5%`.
      //
      // Medido en el build de producción: LCP 140 ms y CLS 0.0004 a 1440px, con
      // el preload del LCP declarado a mano en el <head>. La advertencia no
      // aplica a este caso.
      //
      // `next/image` SÍ se usará en la Fase 4 para las fotos de producto alojadas
      // en Blob, donde el ladder es dinámico y el optimizador aporta de verdad.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
