import type { ImageRef } from "@/types/content";

/**
 * Construcción del `ImageRef` de un producto, a partir de su slug y de las
 * alturas de sus derivados.
 *
 * Vive en `lib/` y no en `content/` porque tiene DOS fuentes: el catálogo
 * estático de `content/products.ts` y las filas de la tabla `products`. La base
 * guarda sólo `image_heights` y `image_alt`, nunca el `srcSet` entero: ese
 * srcSet es un dato DERIVADO de lo que generó `scripts/build-images.mjs`, y
 * duplicarlo en Postgres es garantizar que algún día no coincida con lo que hay
 * en `public/img/`. Con una sola función, las dos fuentes producen exactamente
 * las mismas rutas.
 *
 * Las alturas son las reales de cada foto, calculadas por el script desde su
 * proporción natural — no están inventadas, y `tests/unit/shop.test.ts` afirma
 * que los archivos existen.
 */

/**
 * `sizes` de la tarjeta del catálogo, con los anchos de render MEDIDOS: la
 * tarjeta son 370px en escritorio (3 columnas de 1170px con huecos de 30), no
 * ~300 como se supuso al principio; en la ficha, ~540px.
 */
export const CARD_SIZES =
  "(min-width: 1200px) 360px, (min-width: 992px) 30vw, (min-width: 640px) 45vw, calc(100vw - 30px)";

/**
 * Alturas de los derivados de 400, 800 y 1200px de ancho.
 *
 * Sólo la primera es obligatoria. Dos fotos del catálogo de Ale son miniaturas de
 * ~400px de ancho (`QUE-03`, 403×268; `QUE-010`, 407×320) y el pipeline no hace
 * upscale nunca, así que emiten un único escalón. Es una verdad del material, no
 * un caso que convenga esconder: los dos productos van marcados `photoTodo`.
 */
export type ImageHeights = readonly [number, number?, number?];

export function productImage(slug: string, heights: ImageHeights, alt: string): ImageRef {
  const [h400, h800, h1200] = heights;
  const srcSet = [
    { src: `/img/producto/${slug}-400x${h400}.webp`, width: 400 },
    ...(h800 ? [{ src: `/img/producto/${slug}-800x${h800}.webp`, width: 800 }] : []),
    ...(h1200 ? [{ src: `/img/producto/${slug}-1200x${h1200}.webp`, width: 1200 }] : []),
  ];

  // El `src` de respaldo es el escalón mayor que exista: con una sola miniatura,
  // apuntar a un `-800x…` que nadie generó daría un 404 en los navegadores que
  // ignoran `srcset`.
  const fallbackWidth = h800 ? 800 : 400;
  const fallbackHeight = h800 ?? h400;

  return {
    src: `/img/producto/${slug}-${fallbackWidth}x${fallbackHeight}.webp`,
    srcSet,
    sizes: CARD_SIZES,
    width: fallbackWidth,
    height: fallbackHeight,
    alt,
  };
}

/**
 * Estrecha el `integer[]` que devuelve Postgres a la tupla que pide
 * `productImage`. Devuelve `undefined` si la fila no trae al menos los dos
 * escalones obligatorios, que es el caso que el fallback tiene que cubrir.
 *
 * Hace falta porque `noUncheckedIndexedAccess` está activo: indexar un
 * `number[]` da `number | undefined`, y aquí eso es una verdad útil, no un
 * estorbo — una fila con un solo escalón produciría un `srcSet` de un elemento
 * y el navegador se descargaría la foto grande en un móvil.
 */
/**
 * La inversa de `productImage`: recupera las alturas a partir de un `ImageRef`
 * ya construido.
 *
 * La usa `scripts/seed-catalog.ts` para sembrar `image_heights` desde
 * `content/products.ts`, donde las alturas son argumentos inline y no quedan
 * guardadas en ningún campo. Lanza si alguna ruta no sigue el patrón
 * `-{ancho}x{alto}.webp`, porque un fallo silencioso aquí sembraría alturas
 * inventadas y el `height` del `<img>` dejaría de coincidir con la foto: CLS.
 */
export function imageHeightsOf(image: ImageRef): number[] {
  const srcSet = image.srcSet ?? [];
  if (srcSet.length === 0) throw new Error(`ImageRef sin srcSet: ${image.src}`);

  return srcSet.map((entry) => {
    const match = /-\d+x(\d+)\.webp$/.exec(entry.src);
    const height = match?.[1];
    if (!height) throw new Error(`ruta de derivado inesperada: ${entry.src}`);
    return Number(height);
  });
}

export function toImageHeights(values: readonly number[]): ImageHeights | undefined {
  if (values.length < 1 || values.length > 3) return undefined;
  const [h400, h800, h1200] = values;
  if (h400 === undefined || h400 <= 0) return undefined;
  if (h800 !== undefined && h800 <= 0) return undefined;
  if (h1200 !== undefined && h1200 <= 0) return undefined;
  // Un 1200 sin 800 sería una escalera con un hueco: el navegador elegiría el de
  // 400 en pantalla normal y el de 1200 en retina, saltándose el tamaño útil.
  if (h1200 !== undefined && h800 === undefined) return undefined;
  if (h800 === undefined) return [h400];
  return h1200 === undefined ? [h400, h800] : [h400, h800, h1200];
}
