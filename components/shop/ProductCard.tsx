import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { formatCRCShort } from "@/lib/format";
import { variantsLabel } from "@/lib/variants";
import { CATEGORIAS, SUBCATEGORIAS, type ShopProduct } from "@/types/shop";

/**
 * La tarjeta de producto de la rejilla `.shop-grid`.
 *
 * Es un componente porque la pintan DOS páginas —`/tienda` y la 404— y hasta ahora
 * eran dos copias del mismo JSX que ya habían empezado a divergir: la 404 nunca
 * tuvo la línea de etiquetas. Con dos copias, rediseñar la tarjeta es rediseñarla
 * dos veces y acordarse las dos.
 *
 * Renderiza el `<li>` entero y no su contenido: la rejilla es un `<ul>` y es el
 * `<li>` el que lleva la clase que recorren los e2e (`.shop-card`). Un tercer
 * consumidor que no fuera un `<ul>` tendría que envolverlo.
 *
 * DOS enlaces al mismo destino, y es lo correcto:
 *  · `.shop-card-link` cubre foto y nombre; su nombre accesible es el del producto.
 *  · «Pedir» es el CTA explícito, con `aria-label`: 23 enlaces llamados «Pedir»
 *    son inservibles en la lista de enlaces de un lector de pantalla. La etiqueta
 *    visible va DELANTE del nombre accesible («Pedir Brigadeiros»), que es lo que
 *    pide el criterio 2.5.3 y lo que necesita quien navega por voz para poder
 *    decir «pulsá Pedir».
 *
 * No se anida un interactivo dentro de otro —eso sí sería una violación— ni se usa
 * el truco del `::after` estirado sobre la tarjeta: el envoltorio de la foto es
 * `overflow: hidden` y lo recortaría.
 */
export function ProductCard({
  product,
  showTag = true,
}: {
  product: ShopProduct;
  /**
   * La línea de categoría · subcategoría · presentaciones (desvío D-31). La 404 la
   * oculta: allí la tarjeta es una salida de emergencia y no una ficha que se
   * compara con las de al lado, así que la lista de presentaciones sólo compite
   * con el «Pedir».
   */
  showTag?: boolean;
}) {
  const href = `/tienda/${product.slug}`;

  return (
    <li className="shop-card">
      <Link className="shop-card-link" href={href}>
        {/* El envoltorio recorta la foto cuando se amplía al pasar el ratón. Va
            aquí y no dentro de `Picture`: ese componente emite `<img>` suelto o
            `<picture>` según si el producto tiene AVIF, y sólo pasa la clase al
            `<img>`. */}
        <span className="shop-card-media">
          <Picture image={product.image} className="shop-card-img" />
        </span>
        <span className="shop-card-name">{product.name}</span>
      </Link>

      <p className="shop-card-summary">{product.description[0]}</p>

      {/* Categoría, subcategoría si la hay, y TODAS las presentaciones
          disponibles: es lo que decide la compra antes de abrir la ficha. */}
      {showTag && (
        <p className="shop-card-tag">
          {[
            CATEGORIAS[product.categoria],
            product.subcategoria && SUBCATEGORIAS[product.subcategoria],
            variantsLabel(product.variants),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="shop-card-foot">
        <p className="shop-card-price">
          {/* Sin esto un lector encadena «desde ₡ 2.500 Pedir Brigadeiros» sin
              decir qué es la cifra. Mismo recurso que `OverlapMenu`. */}
          <span className="sr-only">Precio: </span>
          {product.priceFrom ? "desde " : ""}
          {formatCRCShort(product.price)}
        </p>
        {/* «Pedir» y no «Añadir al carrito»: el queque personalizado se cotiza y NO
            entra al carrito, así que el verbo tiene que nombrar la intención y no
            el mecanismo para servir a los 23 productos. Y esto no es UI-063: no
            añade nada, lleva a la ficha, que es donde se elige la presentación. */}
        <Link
          className="btn btn--sm shop-card-cta"
          href={href}
          aria-label={`Pedir ${product.name}`}
        >
          Pedir
        </Link>
      </div>
    </li>
  );
}
