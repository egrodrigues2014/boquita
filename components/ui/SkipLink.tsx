/**
 * Primer elemento enfocable del documento (checklist §9 punto 14).
 * Oculto hasta recibir foco; el estilo vive en 99-a11y.css.
 */
export function SkipLink() {
  return (
    <a className="skip-link" href="#contenido">
      Saltar al contenido
    </a>
  );
}
