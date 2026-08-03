"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

/**
 * Rehidrata el carrito desde localStorage y avisa cuándo ya se puede pintar.
 *
 * El store usa `skipHydration: true`, así que hay que rehidratarlo a mano. El
 * motivo: sin eso, Zustand lee localStorage durante el primer render del cliente
 * y el HTML del servidor (carrito vacío) no coincide con el del cliente (carrito
 * con cosas) → error de hidratación de React.
 *
 * Mientras `ready` sea false los componentes no deben mostrar cantidades: el
 * primer render tiene que ser idéntico al del servidor.
 *
 * El flag de módulo evita rehidratar una vez por cada componente que use el hook.
 */
let rehydrated = false;

export function useCartReady(): boolean {
  const [ready, setReady] = useState(rehydrated);

  useEffect(() => {
    if (rehydrated) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void Promise.resolve(useCart.persist.rehydrate()).then(() => {
      rehydrated = true;
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
