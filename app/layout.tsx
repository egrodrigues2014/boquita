import type { Metadata, Viewport } from "next";
import { ImagePreload } from "@/components/ui/Picture";
import { SkipLink } from "@/components/ui/SkipLink";
import { home } from "@/content/home";
import { display, sans } from "./fonts";

// ⚠ EL ÚNICO import de CSS del proyecto. Ver la cabecera de styles/index.css:
// el orden de la cascada del spec depende de que sea una sola cadena de @import.
import "@/styles/index.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Los despliegues que no son producción no se indexan (plan, riesgo R6). */
const isProduction = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana",
    template: "%s · Boquita — Sweet & Salty",
  },
  description:
    "Repostería artesanal hecha en casa en Santa Ana, San José. " +
    "Queques de zanahoria, limón y chocolate, cupcakes, polvorones españoles, " +
    "galletas de granola, brigadeiros y pies. Horneamos por encargo, en tandas pequeñas.",
  applicationName: "Boquita",
  authors: [{ name: "Boquita — Sweet & Salty" }],
  keywords: [
    "repostería Santa Ana",
    "queque de zanahoria Costa Rica",
    "pastelería artesanal San José",
    "cupcakes Costa Rica",
    "polvorones Costa Rica",
    "brigadeiros San José",
    "queques por encargo Escazú",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Boquita — Sweet & Salty",
    url: SITE_URL,
    title: "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana",
    description:
      "Queques, cupcakes, galletas y dulces horneados por encargo en Santa Ana. " +
      "Pedidos por WhatsApp con 48 horas de anticipación.",
  },
  twitter: { card: "summary_large_image" },
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  // El sitio es sobre comida y se pide por WhatsApp: conviene que el teléfono sea
  // pulsable en iOS, pero no que Safari convierta cualquier número en un enlace.
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3a2a1a",
};

/**
 * ISR para TODO el sitio, declarado una sola vez.
 *
 * Va en el layout y no en cada página porque el nav y varias páginas derivan
 * datos del catálogo, así que cualquier página —incluidas `/aviso-legal` y la
 * 404— depende de la tabla `products`.
 *
 * Con esto las páginas siguen saliendo del CDN y no de una función que espera a
 * Postgres: se conservan los presupuestos medidos (LCP 140 ms, primera carga
 * 805 KB). Y el cómputo de Neon se autosuspende a los 5 minutos en el plan Free,
 * de modo que el arranque en frío lo paga una regeneración en segundo plano y
 * nunca una visita real.
 *
 * Una hora es el compromiso: un precio corregido en Neon aparece solo, sin
 * redespliegue. Cuando exista el panel de la fase 3 se añade `revalidatePath`
 * para que sea instantáneo y este número deje de importar.
 */
export const revalidate = 3600;

/**
 * Script inline bloqueante (~120 bytes) que hace posible el reveal sin flash.
 * Corre antes del primer paint:
 *
 *  · añade `.js` a <html> → sólo entonces `.reveal` pasa a opacity:0.
 *    Ese diff del <html> es intencional y se suprime con
 *    `suppressHydrationWarning`; sin JS, o si este script no corriera, todo el
 *    contenido es visible.
 *  · arma un failsafe de 2.5 s: si el bundle da 404 o la hidratación revienta,
 *    `.reveal-all` revela todo igualmente. El hook lo cancela al montarse.
 *
 * prefers-reduced-motion NO se toca aquí: se resuelve sólo en CSS
 * (99-a11y.css), para que aplique antes de que exista hidratación.
 */
const REVEAL_BOOTSTRAP =
  "document.documentElement.classList.add('js');" +
  "window.__revealFailsafe=setTimeout(function(){" +
  "document.documentElement.classList.add('reveal-all')},2500);";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CR"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
        {/* La foto del hero es el elemento LCP: se empieza a descargar antes de
            que el parser encuentre su <img>. El srcset y el sizes son idénticos
            a los del <img>, o el navegador bajaría dos archivos distintos. */}
        <ImagePreload image={home.hero.image} />
      </head>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
