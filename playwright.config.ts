import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Verificación de geometría a los 8 anchos del checklist §9 punto 11.
 *
 * Esto es lo que convierte «píxel-exacto» de una afirmación en una comprobación.
 * Está en esta fase a propósito: así las fases siguientes no pueden regresar el
 * layout en silencio.
 *
 * Los anchos NO son arbitrarios: son los breakpoints del spec §2.4 más los dos
 * puntos intermedios que el checklist pide (1100 y 390).
 */

const WIDTHS = [1920, 1440, 1280, 1100, 991, 767, 479, 390];

/* Un proyecto por ancho, y nada más.
   El punto 12 del checklist (prefers-reduced-motion) NO se modela como proyecto:
   `reducedMotion` no figura en el tipo `use` de esta versión de Playwright, y
   forzarlo con un cast escondería el problema. Los tests que lo necesitan llaman
   a `page.emulateMedia({ reducedMotion: "reduce" })`, que además deja explícito
   en el propio test qué se está emulando. */
const projects: PlaywrightTestConfig["projects"] = WIDTHS.map((width) => ({
  name: `w${width}`,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width, height: width <= 479 ? 844 : 900 },
    hasTouch: width <= 479,
  },
}));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],

  /**
   * Con los 8 proyectos de ancho son ~500 tests, y Playwright lanzaría por
   * defecto un worker por cada dos núcleos: 7 Chromium simultáneos contra UN
   * único proceso de `next start` sirviendo ~40 imágenes por página.
   *
   * A ese nivel de contención empezaron a expirar tests que aislados pasan en
   * segundos — y dos ejecuciones seguidas fallaban en tests distintos. Una suite
   * intermitente es peor que una lenta: entrena a reintentar en vez de mirar qué
   * pasa. 4 workers la dejan determinista.
   */
  workers: process.env.CI ? 2 : 4,

  /** 45s en vez de 30: margen para la carga de fuentes e imágenes, sin tapar
   *  lentitud real — un test que tarde eso de verdad hay que arreglarlo. */
  timeout: 45_000,

  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },

  // Se prueba contra el build de producción, no contra `next dev`: es lo que
  // realmente se despliega, y `dev` inyecta overlays que alteran el DOM.
  webServer: {
    command: "npx next start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },

  projects,
});
