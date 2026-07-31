import { Picture } from "@/components/ui/Picture";
import { formatCRCShort } from "@/lib/format";
import type { HomeContent } from "@/types/content";

/**
 * Imagen ancha + bloque crema del catálogo (spec §6.4).
 * Puntos 4 y 5 del checklist.
 *
 * Los dos van en un solo componente porque comparten el solape: el bloque crema
 * sube 200px con margin-top negativo y la imagen ancha queda flotando encima
 * gracias a su `z-index:1`. Separarlos escondería la relación.
 *
 * La rejilla es 2 columnas × 4 filas con `1.2fr 1fr`. Los 8 productos no son
 * negociables: con 7 o 9 la rejilla deja de cuadrar. Lo afirma
 * tests/unit/content.test.ts.
 *
 * El grid es sólo texto — nombre, precio y categoría. No lleva fotos de
 * producto; ésas son de la Fase 4, en las fichas de `/tienda`.
 */
export function OverlapMenu({
  wideImage,
  menu,
}: {
  wideImage: HomeContent["wideImage"];
  menu: HomeContent["menu"];
}) {
  return (
    <div className="overlap-wrapper" id="catalogo">
      <div className="wide-img-block">
        <div className="container">
          <Picture image={wideImage} className="wide-img" />
        </div>
      </div>

      <div className="cream-block">
        <div className="container">
          <div className="menu-layout">
            <div className="menu-intro">
              <p className="h6-sans">{menu.eyebrow}</p>
              <h2>{menu.title}</h2>
              <p className="mt-20">{menu.body}</p>
            </div>

            <div className="menu-list-wrap">
              <ul className="menu-grid">
                {menu.products.map((product) => (
                  <li className="menu-item" key={product.slug}>
                    <div className="menu-item-head">
                      {/* En la Fase 4 esto enlaza a /tienda/[slug]. */}
                      <a className="menu-item-name" href="#catalogo">
                        {product.name}
                      </a>
                      <div className="menu-item-price">
                        {/* Sin esto un lector de pantalla lee
                            "QUEQUE DE ZANAHORIA ₡ 14.000 CRC" como un bloque. */}
                        <span className="sr-only">Precio: </span>
                        {/* Sin el sufijo «CRC». El spec §8 pide adaptar el
                            formato a la moneda del proyecto, y en un sitio
                            costarricense el símbolo ₡ no deja lugar a dudas.
                            Con «CRC» el precio no cabía en la misma línea que el
                            nombre en ninguna columna, que es justo la firma
                            visual de esta rejilla. */}
                        {product.priceFrom
                          ? `desde ${formatCRCShort(product.price)}`
                          : formatCRCShort(product.price)}
                      </div>
                    </div>
                    <div className="menu-item-tag">{product.category}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
