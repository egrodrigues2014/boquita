import type { MetadataRoute } from "next";

/**
 * Manifest de aplicación web.
 *
 * `display: "browser"` y no `"standalone"` a propósito: esto es un catálogo que
 * termina saliendo a WhatsApp, no una app. En modo standalone el salto al
 * handoff abandona la ventana sin barra de direcciones y el usuario se queda sin
 * forma obvia de volver.
 *
 * Los iconos apuntan a los derivados del pipeline (`npm run images:build`), que
 * los genera desde el mismo original de 816×816 que el resto de la marca. Los de
 * pestaña e iOS no se declaran aquí: los descubre Next por convención de fichero
 * en `app/icon.png` y `app/apple-icon.png`.
 *
 * `theme_color` debe coincidir con el `themeColor` del viewport de app/layout.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Boquita — Sweet & Salty",
    short_name: "Boquita",
    description:
      "Repostería artesanal hecha en casa en Santa Ana, San José. " +
      "Horneamos por encargo, en tandas pequeñas.",
    start_url: "/",
    display: "browser",
    lang: "es-CR",
    background_color: "#faf5ec",
    theme_color: "#3a2a1a",
    icons: [
      {
        src: "/img/brand/logo-transparent-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/img/brand/logo-transparent-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
