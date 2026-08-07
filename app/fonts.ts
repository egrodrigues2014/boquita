import { Cormorant_Infant, Libre_Franklin } from "next/font/google";

/**
 * Tipografías del spec §2.2.
 *
 * next/font autohospeda los woff2 en build: cero peticiones a
 * fonts.googleapis.com, cero render-block de terceros, cero FOUT de red.
 * Estrictamente mejor que el <link> que el spec da por supuesto.
 *
 * next/font NO permite fijar el nombre de familia, así que se exponen como
 * variables CSS y 01-tokens.css las envuelve en --ff-display / --ff-sans.
 * Es el desvío D-12 y la única sustitución textual en el CSS del spec.
 */

export const display = Cormorant_Infant({
  subsets: ["latin"], // cubre á é í ó ú ñ ü ¡ ¿ — latin-ext no hace falta para es-CR
  weight: ["400", "500", "700"], // sólo los pesos que alguna regla usa de verdad:
  // 400 h2/h3, 500 h5/h6, 700 h1/h4.
  // El spec declara 300 y 600 pero ningún selector los
  // referencia → no se cargan (desvío D-1).
  style: ["normal"],
  display: "swap", // nunca texto invisible; el LCP es la foto del hero, no el h1
  variable: "--font-display",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: true, // Next emite un Georgia con ascent/descent/size-adjust
  // ajustados → el swap no provoca CLS vertical.
  // Cormorant Infant es MUCHO más estrecha que Georgia,
  // así que el swap sí cambia anchos: ver la nota sobre
  // el h2 del statement en el plan §4.2.
});

export const sans = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // 400 p, 500 a/botones/.h6-sans, 600 ul.
  // El 300 del spec no lo usa nadie (desvío D-1).
  style: ["normal"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: true,
});

/**
 * Lato (spec §2.2) se usa en UN solo selector: blockquote. En la portada no hay
 * ningún blockquote, así que no se carga aquí — se importaría dentro del
 * componente que lo necesite (un post del blog, una cita destacada).
 *
 * Por eso `--font-quote` NO se declara, y por eso `--ff-quote` en 01-tokens.css
 * tiene que escribirse `var(--font-quote, Lato)`, CON el fallback dentro. Sin él
 * no degrada nada: una referencia a una variable inexistente invalida la
 * declaración en tiempo de cómputo y `font-family` acaba heredando la sans, que
 * es lo contrario de lo que se pretendía. Lo cubre tests/unit/css-vars.test.ts.
 */
