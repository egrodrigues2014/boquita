"use client";

import { useEffect } from "react";

/**
 * Bloquea el scroll de la página mientras haya algún panel modal abierto.
 *
 * **El contador a nivel de módulo es el punto importante.** El drawer del nav, el
 * lightbox y (en la Fase 4) el carrito comparten este hook. Sin contador, cerrar
 * uno mientras otro sigue abierto desbloquearía la página y el modal restante
 * quedaría flotando sobre contenido que se mueve.
 */
let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

function lock() {
  if (lockCount++ > 0) return;

  const root = document.documentElement;
  savedOverflow = root.style.overflow;
  savedPaddingRight = document.body.style.paddingRight;

  // Compensa el ancho de la barra de scroll para que el layout no dé un salto
  // lateral al ocultarla.
  const scrollbarWidth = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlock() {
  if (--lockCount > 0) return;
  lockCount = 0;
  document.documentElement.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
}

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
