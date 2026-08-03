"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types/shop";

/**
 * Carrito persistido en localStorage.
 *
 * La clave lleva versión (`boquita.cart.v1`) a propósito: si mañana cambia la
 * forma de `CartLine`, subir la versión DESCARTA el carrito viejo en vez de
 * intentar leerlo y corromperse. Un carrito perdido es un inconveniente; un
 * carrito con datos a medio migrar es un pedido mal enviado.
 *
 * `skipHydration: true` es imprescindible con SSR: sin él, Zustand lee
 * localStorage durante el primer render del cliente y el HTML del servidor
 * (carrito vacío) no coincide con el del cliente (carrito con cosas) → mismatch
 * de hidratación. Se rehidrata a mano en un efecto, y hasta entonces los
 * componentes usan `useCartReady()` para no mostrar nada.
 */

export const CART_STORAGE_KEY = "boquita.cart.v1";

/** Tope por línea. Más que esto es un pedido de catering: se habla por WhatsApp. */
export const MAX_QTY = 20;

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.slug === line.slug);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === line.slug ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, qty: Math.min(MAX_QTY, qty) }] };
        }),

      setQty: (slug, qty) =>
        set((state) => ({
          // Poner 0 equivale a quitar la línea: es lo que espera quien baja la
          // cantidad hasta el final con el stepper.
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.slug !== slug)
              : state.lines.map((l) =>
                  l.slug === slug ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
                ),
        })),

      remove: (slug) => set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/** Número total de unidades, para el badge del navbar. */
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.qty, 0);
}

/**
 * Subtotal en colones, contando SÓLO las líneas con precio fijo.
 * Los productos a convenir (el queque personalizado) no se pueden sumar, y
 * meterlos con su «desde» daría un total que no es el que se va a pagar.
 */
export function cartSubtotal(lines: CartLine[]): number {
  return lines
    .filter((line) => !line.priceOnRequest)
    .reduce((total, line) => total + line.price * line.qty, 0);
}

/** true si hay algo cuyo precio se cotiza aparte: el total es sólo estimado. */
export function cartHasQuoted(lines: CartLine[]): boolean {
  return lines.some((line) => line.priceOnRequest);
}
