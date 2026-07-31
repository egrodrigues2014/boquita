import type { ImageRef } from "@/types/content";

/**
 * Renderiza un `ImageRef` como `<img srcset>`, o como `<picture>` si además hay
 * fuentes AVIF.
 *
 * Por qué no `next/image` (desvío D-9, descartado): las 15 imágenes del layout
 * son assets de marca fijos, con los tamaños exactos ya pre-generados por
 * `scripts/build-images.mjs`. Servirlas así evita el optimizador por completo
 * —cero cuota de transformaciones, CDN inmutable, comportamiento idéntico en
 * preview y producción— y el hero conserva el `<img>` del spec sin necesidad de
 * un wrapper que pelee con su `inset:0 0 0 auto; width:43.5%`.
 *
 * `next/image` se reserva para las fotos de producto alojadas en Blob (Fase 4),
 * donde sí hace falta un ladder dinámico.
 *
 * `width`/`height` siempre presentes: sin ellos hay CLS y el checklist §9 no lo
 * permite.
 */
export function Picture({
  image,
  className,
  priority = false,
  ...rest
}: {
  image: ImageRef;
  className?: string;
  /** true sólo para el elemento LCP (la foto del hero). */
  priority?: boolean;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "alt">) {
  const srcSet = image.srcSet?.map((s) => `${s.src} ${s.width}w`).join(", ");

  const img = (
    <img
      className={className}
      src={image.src}
      srcSet={srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      // fetchPriority alto sólo en el LCP; el resto no compite con él.
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      {...rest}
    />
  );

  if (!image.avif?.length) return img;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={image.avif.map((s) => `${s.src} ${s.width}w`).join(", ")}
        sizes={image.sizes}
      />
      {img}
    </picture>
  );
}

/**
 * Preload del elemento LCP. Se emite en el `<head>` desde el layout para que el
 * navegador empiece a descargar la foto del hero antes de encontrar el `<img>`.
 *
 * `imageSrcSet` + `imageSizes` deben ser IDÉNTICOS a los del `<img>`, o el
 * navegador descargará dos archivos distintos en vez de reutilizar el preload.
 */
export function ImagePreload({ image }: { image: ImageRef }) {
  const set = image.avif?.length ? image.avif : image.srcSet;
  if (!set?.length) return null;
  return (
    <link
      rel="preload"
      as="image"
      href={image.src}
      imageSrcSet={set.map((s) => `${s.src} ${s.width}w`).join(", ")}
      imageSizes={image.sizes}
      type={image.avif?.length ? "image/avif" : undefined}
      fetchPriority="high"
    />
  );
}
