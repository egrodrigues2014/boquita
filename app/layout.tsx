import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { ImagePreload } from "@/components/ui/Picture";
import { SkipLink } from "@/components/ui/SkipLink";
import { home } from "@/content/home";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { isSiteIndexable, SITE_URL } from "@/lib/seo";
import { display, sans, sidebar } from "./fonts";

// ⚠ EL ÚNICO import de CSS del proyecto. Ver la cabecera de styles/index.css:
// el orden de la cascada del spec depende de que sea una sola cadena de @import.
import "@/styles/index.css";

/** Preview y producción previa al lanzamiento permanecen fuera del índice. */
const shouldIndex = isSiteIndexable();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana",
    template: "%s · Boquita — Sweet & Salty",
  },
  description:
    "Repostería artesanal hecha en casa en Santa Ana, San José. " +
    "Queques, cupcakes, polvorones, galletas y brigadeiros horneados por encargo. " +
    "Pedidos por WhatsApp.",
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
    "tortilla española Costa Rica",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Boquita — Sweet & Salty",
    url: SITE_URL,
    title: "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana",
    // WhatsApp corta la descripción alrededor de los 100 caracteres: los 123 de
    // antes se partían en «…Pedidos por WhatsApp con 48». Mejor una frase que
    // cierra que una que se queda a medias.
    description:
      "Queques, cupcakes, galletas y dulces horneados por encargo en Santa Ana. " +
      "Pedidos por WhatsApp.",
  },
  twitter: { card: "summary_large_image" },
  robots: shouldIndex
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
 * redespliegue. Para no esperarla, `app/api/revalidate/route.ts` hace
 * `revalidatePath("/", "layout")` y tira de golpe el ISR de todo lo que cuelga
 * de aquí; `scripts/seed-catalog.ts` la llama al acabar. Este número es sólo la
 * red de seguridad para los cambios que se hagan por SQL sin pasar por ahí.
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
      className={`${display.variable} ${sans.variable} ${sidebar.variable}`}
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
        {/* Web Analytics de Vercel, sólo en producción: ver lib/analytics.ts, que
            explica por qué la puerta existe y por qué no es la de `lib/seo.ts`.
            El script se pide a `/_vercel/insights/script.js`, del mismo origen:
            no entra ningún dominio de terceros en el HTML. */}
        {isAnalyticsEnabled() && <Analytics />}
      </body>
    </html>
  );
}
