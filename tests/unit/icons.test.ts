import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Los SVG de `public/icons/` son documentos XML autónomos: se cargan como
 * `background-image`, no se incrustan en el HTML.
 *
 * Y ahí un SVG mal formado NO da error: el servidor responde 200, el
 * `background-image` computado sigue trayendo su URL, y lo único que pasa es que
 * el navegador no decodifica la imagen y el fondo se queda en blanco. Ninguna
 * herramienta lo dice; hay que verlo con los ojos en la página.
 *
 * Los dos iconos del proyecto estuvieron así **desde siempre**, y no se notó
 * porque el bullet de `li` sólo se ve en `/dev/tokens` y el `blockquote` tampoco
 * se usa en producción. Salió al estrenar el bullet en la lista de «Pedidos y
 * entregas»: el punto no aparecía. La causa era un `--` dentro de un comentario
 * XML —el nombre de un token, `--gold-line`—, que la especificación de XML
 * prohíbe expresamente.
 */

const CARPETA = join(process.cwd(), "public", "icons");
const iconos = readdirSync(CARPETA).filter((f) => f.endsWith(".svg"));

describe("los iconos SVG son documentos que el navegador puede decodificar", () => {
  it("hay iconos que comprobar", () => {
    expect(iconos.length).toBeGreaterThan(0);
  });

  for (const icono of iconos) {
    const fuente = readFileSync(join(CARPETA, icono), "utf8");

    it(`${icono} no lleva dobles guiones dentro de un comentario`, () => {
      for (const comentario of fuente.match(/<!--[\s\S]*?-->/g) ?? []) {
        const dentro = comentario.slice(4, -3);
        expect(
          dentro,
          `«--» dentro de un comentario de ${icono}: XML queda mal formado y el ` +
            "navegador deja de pintar el fondo, sin decir nada",
        ).not.toContain("--");
      }
    });

    it(`${icono} está bien formado y declara tamaño intrínseco`, () => {
      // Sin `width`/`height` propios, un SVG usado como `background-image` con
      // `background-size: auto` no tiene tamaño con el que pintarse.
      expect(fuente, `${icono} no declara ancho`).toMatch(/<svg[^>]*\swidth="/);
      expect(fuente, `${icono} no declara alto`).toMatch(/<svg[^>]*\sheight="/);
      expect(fuente.trimStart().startsWith("<"), `${icono} arranca con basura o BOM`).toBe(true);
      expect(fuente.trimEnd().endsWith("</svg>"), `${icono} está truncado`).toBe(true);

      // Etiquetas abiertas y cerradas casan: es lo que rompe el parseo cuando
      // alguien edita un `path` a mano.
      const abiertas = (fuente.match(/<(?!\/|!|\?)/g) ?? []).length;
      const cierres = (fuente.match(/<\//g) ?? []).length + (fuente.match(/\/>/g) ?? []).length;
      expect(abiertas, `etiquetas descuadradas en ${icono}`).toBe(cierres);
    });
  }
});
