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
    default: "Boquita — Sweet & Salty · Repostería artesanal en Río Oro, Santa Ana",
    template: "%s · Boquita — Sweet & Salty",
  },
  description:
    "Repostería artesanal hecha en casa en Río Oro de Santa Ana, San José. " +
    "Queques de zanahoria, galletas de granola sin gluten, polvorones españoles, " +
    "brigadeiros y bocaditos salados. Horneamos por encargo, en tandas pequeñas.",
  applicationName: "Boquita",
  authors: [{ name: "Boquita — Sweet & Salty" }],
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Boquita — Sweet & Salty",
    url: SITE_URL,
  },
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3a2a1a",
};

/**
 * Script inline bloqueante (~120 bytes) que hace posible el reveal sin flash ni
 * mismatch de hidratación. Corre antes del primer paint:
 *
 *  · añade `.js` a <html> → sólo entonces `.reveal` pasa a opacity:0.
 *    Sin JS, o si este script no corriera, todo el contenido es visible.
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
    <html lang="es-CR" className={`${display.variable} ${sans.variable}`}>
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
