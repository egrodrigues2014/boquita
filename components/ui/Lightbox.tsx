"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import type { ImageRef } from "@/types/content";

/**
 * Lightbox para la imagen de vídeo y las fotos de la galería (spec §4.7).
 *
 * Usa el **`<dialog>` nativo** con `showModal()`, que trae gratis: capa
 * superior, trampa de foco, cierre con Escape, `::backdrop` y `aria-modal`
 * implícito. Reimplementar todo eso a mano sería más código y peor.
 *
 * Los disparadores se renderizan en el SERVIDOR como botones con atributos
 * `data-*`, y este componente escucha por **delegación** desde el documento. Así
 * no hace falta un provider de contexto envolviendo la página, ni convertir en
 * cliente las secciones que contienen las imágenes.
 *
 * Sólo se montan la imagen actual y sus vecinas: abrir la foto 1 no debe
 * descargar las 8.
 */

export type LightboxGroups = {
  /** Fotos de la galería, en su orden único (8). */
  gallery: ImageRef[];
  /** URL del vídeo a incrustar y su título accesible. */
  video: { url: string; title: string };
};

type OpenState = { kind: "gallery"; index: number } | { kind: "video" } | null;

export function Lightbox({ groups }: { groups: LightboxGroups }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<OpenState>(null);

  useScrollLock(open !== null);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Delegación: un solo listener para todos los disparadores de la página.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-lightbox]");
      if (!trigger) return;
      event.preventDefault();
      triggerRef.current = trigger;

      const kind = trigger.dataset.lightbox;
      if (kind === "video") {
        setOpen({ kind: "video" });
      } else if (kind === "gallery") {
        setOpen({ kind: "gallery", index: Number(trigger.dataset.lightboxIndex ?? 0) });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Abrir y cerrar el <dialog> siguiendo al estado.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const total = groups.gallery.length;

  const move = useCallback(
    (delta: number) => {
      setOpen((current) => {
        if (current?.kind !== "gallery") return current;
        // Aquí sí da la vuelta: en una galería es el comportamiento esperado.
        return { kind: "gallery", index: (current.index + delta + total) % total };
      });
    },
    [total],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (open?.kind !== "gallery") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  };

  const isGallery = open?.kind === "gallery";
  const current = isGallery ? groups.gallery[open.index] : undefined;

  return (
    <dialog
      className="lightbox"
      ref={dialogRef}
      aria-label={isGallery ? "Galería de fotos" : "Vídeo"}
      onKeyDown={onKeyDown}
      // `close` se dispara también con Escape, así que es el único sitio donde
      // hay que sincronizar el estado de vuelta.
      onClose={() => {
        setOpen(null);
        triggerRef.current?.focus();
        triggerRef.current = null;
      }}
      // Clic en el backdrop: el propio <dialog> es el target cuando se pincha fuera.
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div className="lightbox-inner">
        <button type="button" className="lightbox-close" aria-label="Cerrar" onClick={close}>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M3 3 L19 19 M19 3 L3 19" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        {open?.kind === "video" && (
          // El iframe se monta SÓLO mientras el lightbox está abierto: si viviera
          // en el shell de la página, cargaría scripts de terceros en cada visita.
          <div className="lightbox-video">
            <iframe
              src={groups.video.url}
              title={groups.video.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {isGallery && current && (
          <>
            <img
              className="lightbox-img"
              src={current.srcSet?.at(-1)?.src ?? current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
            />
            {/* Precarga silenciosa de las vecinas, para que navegar sea instantáneo
                sin descargar las 8 de golpe. */}
            {[-1, 1].map((delta) => {
              const neighbour = groups.gallery[(open.index + delta + total) % total];
              if (!neighbour) return null;
              return (
                <link
                  key={delta}
                  rel="preload"
                  as="image"
                  href={neighbour.srcSet?.at(-1)?.src ?? neighbour.src}
                />
              );
            })}

            <button
              type="button"
              className="lightbox-nav lightbox-nav--prev"
              aria-label="Foto anterior"
              onClick={() => move(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="lightbox-nav lightbox-nav--next"
              aria-label="Foto siguiente"
              onClick={() => move(1)}
            >
              ›
            </button>

            <p className="lightbox-counter" aria-live="polite">
              {open.index + 1} de {total}
            </p>
          </>
        )}
      </div>
    </dialog>
  );
}
