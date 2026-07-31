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
    },
  },
];

export default config;
