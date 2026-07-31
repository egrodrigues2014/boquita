import type { Link as LinkRef } from "@/types/content";

/**
 * Botón del spec §3.1. Es un `<a>`, no un `<button>`: todos los CTA del layout
 * navegan (a una ancla o a wa.me).
 *
 * DESVÍO D-0: el spec pide etiqueta blanca sobre el relleno del acento, pero
 * blanco sobre el dorado de marca da 2.09:1. El relleno es dorado y la etiqueta
 * marrón (6.58:1), que es además como está construido el propio logo.
 */
export function Btn({
  link,
  variant,
  className = "",
}: {
  link: LinkRef;
  variant?: "ghost" | "nav" | "footer";
  className?: string;
}) {
  const classes = ["btn", variant ? `btn--${variant}` : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      className={classes}
      href={link.href}
      {...(link.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {link.label}
      {link.external && <span className="sr-only"> (abre en una pestaña nueva)</span>}
    </a>
  );
}
