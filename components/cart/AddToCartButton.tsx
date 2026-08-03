"use client";

import { useState } from "react";
import { MAX_QTY, useCart } from "@/lib/cart";
import { useCartReady } from "@/lib/hooks/useCartReady";
import { waPlainLink } from "@/lib/whatsapp";
import type { ShopProduct } from "@/types/shop";

/**
 * Selector de cantidad + añadir al carrito, para la ficha de producto.
 *
 * Los productos con precio a convenir (el queque personalizado) NO se añaden al
 * carrito: no tienen importe que sumar, así que el CTA lleva directo a WhatsApp
 * con el producto ya mencionado. Meterlos al carrito con su «desde» daría un
 * total que no es el que se va a pagar.
 */
export function AddToCartButton({ product }: { product: ShopProduct }) {
  const ready = useCartReady();
  const add = useCart((state) => state.add);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (product.priceOnRequest) {
    return (
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
    );
  }

  return (
    <div className="add-to-cart">
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
        disabled={!ready}
        onClick={() => {
          add(
            {
              slug: product.slug,
              name: product.name,
              unit: product.unit,
              price: product.price,
              image: product.image.srcSet?.[0]?.src ?? product.image.src,
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
        {justAdded
          ? `Añadido: ${qty} × ${product.name}.`
          : `Se hornea por encargo, con ${product.leadTimeHours} horas de anticipación.`}
      </p>
    </div>
  );
}
