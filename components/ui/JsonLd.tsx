/**
 * Inserta datos estructurados como `<script type="application/ld+json">`.
 *
 * Server Component: el JSON se serializa en el HTML y no cuesta un byte de
 * JavaScript de cliente.
 *
 * Se escapa `<` para que un `</script>` que apareciera dentro de un texto no
 * pudiera cerrar la etiqueta antes de tiempo.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: es la única forma de emitir JSON-LD
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
