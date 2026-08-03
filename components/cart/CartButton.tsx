"use client";

import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cartCount, useCart } from "@/lib/cart";
import { useCartReady } from "@/lib/hooks/useCartReady";

/**
 * Icono de carrito del navbar con su badge, y el panel que abre.
 *
 * Ocupa el mismo hueco de 34×34 que el spec §5 reserva para el carrito, así que
 * la fila de acciones no cambia de medidas.
 *
 * El conteo va en el `aria-label`, no sólo en el badge visual: un badge es un
 * número flotante sin contexto para un lector de pantalla.
 *
 * Hasta que el carrito rehidrate no se pinta el badge, para que el primer render
 * del cliente sea idéntico al del servidor.
 */
export function CartButton() {
  const ready = useCartReady();
  const lines = useCart((state) => state.lines);
  const [open, setOpen] = useState(false);

  const count = ready ? cartCount(lines) : 0;
  const label =
    count === 0
      ? "Carrito, vacío"
      : `Carrito, ${count} ${count === 1 ? "producto" : "productos"}`;

  return (
    <>
      <button
        type="button"
        className="cart-button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg
          className="cart-icon"
          viewBox="0 0 34 34"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M6 10h22l-2.2 15H8.2L6 10Z" />
          <path d="M12 10a5 5 0 0 1 10 0" />
        </svg>
        {count > 0 && (
          <span className="cart-badge" aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {/* Región viva aparte: anuncia el cambio sin que el foco salga del botón. */}
      <p className="sr-only" aria-live="polite">
        {ready && count > 0 ? `${count} en el carrito` : ""}
      </p>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
