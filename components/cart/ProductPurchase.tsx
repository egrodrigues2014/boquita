"use client";

import { useState, type ReactNode } from "react";
import { MAX_QTY, useCart } from "@/lib/cart";
import { formatCRCShort } from "@/lib/format";
import { useCartReady } from "@/lib/hooks/useCartReady";
import { entryVariant, findVariant } from "@/lib/variants";
import { waPlainLink } from "@/lib/whatsapp";
import type { ShopProduct } from "@/types/shop";

/**
 * Todo el bloque de compra de la ficha: precio, presentación, cantidad y botón.
 *
 * Antes eran dos piezas —el servidor pintaba el precio bajo el título y este
 * componente sólo el stepper y el botón—, y no se puede seguir así: el precio
 * depende de la presentación elegida, así que tiene que vivir en el mismo estado
 * que el selector.
 *
 * Pero el precio va ARRIBA de la descripción y el selector ABAJO, con el texto en
 * medio. De ahí el `children`: la descripción se sigue renderizando en el
 * servidor y se pasa como hijo, así que no entra en el bundle del cliente y el
 * orden visual de la ficha no cambia.
 *
 * Los productos con precio a convenir (el queque personalizado) NO se añaden al
 * carrito: no tienen importe que sumar, así que el CTA lleva directo a WhatsApp
 * con el producto ya mencionado. Meterlos al carrito con su «desde» daría un
 * total que no es el que se va a pagar.
 */
export function ProductPurchase({
  product,
  children,
}: {
  product: ShopProduct;
  children?: ReactNode;
}) {
  const ready = useCartReady();
  const add = useCart((state) => state.add);
  const entry = entryVariant(product);
  const [unit, setUnit] = useState(entry?.unit ?? "");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Con una sola presentación no hay nada que elegir y el selector no se dibuja.
  const choosable = product.variants.length > 1 && !product.priceOnRequest;
  const selected = findVariant(product, unit) ?? entry;
  const price = selected?.price ?? product.price;

  const leadTimeNote =
    product.leadTimeHours >= 168
      ? "Se hornea por encargo, con una semana de anticipación."
      : `Se hornea por encargo, con ${product.leadTimeHours} horas de anticipación.`;

  return (
    <>
      {/* A convenir: el importe es un «desde» y no el precio de nada concreto.
          Con presentación elegida, en cambio, el precio es exacto. */}
      <p className="product-price">
        {product.priceOnRequest ? "desde " : ""}
        {formatCRCShort(product.priceOnRequest ? product.price : price)}
      </p>
      {!choosable && selected && <p className="product-unit">{selected.unit}</p>}

      {children}

      {product.priceOnRequest ? (
        <div className="add-to-cart">
          <a
            className="btn"
            href={waPlainLink(
              `¡Hola Boquita! Quiero cotizar un ${product.name.toLowerCase()}. ` +
                "Les cuento la idea y me dicen si se puede.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir cotización por WhatsApp
            <span className="sr-only"> (abre en una pestaña nueva)</span>
          </a>
          <p className="add-to-cart-note">
            Este producto se cotiza según tamaño y diseño, así que no lleva precio fijo.
          </p>
        </div>
      ) : (
        <div className="add-to-cart">
          {choosable && (
            <fieldset className="variant-picker">
              <legend className="variant-picker-legend">Tamaño o presentación</legend>
              {product.variants.map((variant) => (
                <label className="variant-option" key={variant.unit}>
                  <input
                    type="radio"
                    // El name lleva el slug: es único aunque algún día haya dos
                    // fichas en la misma página.
                    name={`variante-${product.slug}`}
                    value={variant.unit}
                    checked={variant.unit === selected?.unit}
                    onChange={() => {
                      setUnit(variant.unit);
                      setJustAdded(false);
                    }}
                  />
                  <span className="variant-option-unit">{variant.unit}</span>
                  <span className="variant-option-price">{formatCRCShort(variant.price)}</span>
                </label>
              ))}
            </fieldset>
          )}

          <div className="qty-stepper">
            <button
              type="button"
              className="qty-button"
              aria-label={`Quitar una unidad de ${product.name}`}
              onClick={() => setQty((current) => Math.max(1, current - 1))}
              aria-disabled={qty <= 1}
            >
              −
            </button>
            {/* `output` con aria-live: quien usa lector de pantalla oye el cambio sin
                que el foco salga del botón que acaba de pulsar. */}
            <output className="qty-value" aria-live="polite" aria-label="Cantidad">
              {qty}
            </output>
            <button
              type="button"
              className="qty-button"
              aria-label={`Añadir una unidad de ${product.name}`}
              onClick={() => setQty((current) => Math.min(MAX_QTY, current + 1))}
              aria-disabled={qty >= MAX_QTY}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn"
            // Hasta que el carrito rehidrate, pulsar añadiría sobre un estado vacío
            // y se perdería lo que ya hubiera guardado.
            disabled={!ready || !selected}
            onClick={() => {
              if (!selected) return;
              add(
                {
                  slug: product.slug,
                  name: product.name,
                  // La presentación elegida: es la segunda mitad de la clave de la
                  // línea y lo que sale escrito en el mensaje de WhatsApp.
                  unit: selected.unit,
                  price: selected.price,
                  image: product.image.srcSet?.[0]?.src ?? product.image.src,
                  // Se guarda junto al precio: el drawer calcula la fecha mínima con
                  // él, y desde que el catálogo vive en Postgres el cliente no puede
                  // resolverlo por su cuenta.
                  leadTimeHours: product.leadTimeHours,
                },
                qty,
              );
              setJustAdded(true);
              window.setTimeout(() => setJustAdded(false), 2500);
            }}
          >
            Añadir al carrito
          </button>

          <p className="add-to-cart-note" role="status" aria-live="polite">
            {justAdded && selected
              ? `Añadido: ${qty} × ${product.name} (${selected.unit}).`
              : leadTimeNote}
          </p>
        </div>
      )}
    </>
  );
}
