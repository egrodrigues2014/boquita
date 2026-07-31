import NextLink from "next/link";
import type { Link as LinkRef } from "@/types/content";

/**
 * Elige la etiqueta correcta según el destino:
 *
 *  · rutas internas ("/", "/tienda")  → `next/link`, para navegación de cliente
 *    y prefetch. Es además lo que exige la regla `no-html-link-for-pages`.
 *  · anclas ("#catalogo"), `tel:`, `mailto:` y externos → `<a>` normal.
 *
 * Los enlaces externos llevan `rel="noopener noreferrer"` y un aviso oculto para
 * lectores de pantalla, porque abren una pestaña nueva.
 */
export function SmartLink({
  link,
  className,
  children,
  ...rest
}: {
  link: LinkRef;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  const content = children ?? link.label;
  const isInternalRoute = link.href.startsWith("/") && !link.external;

  if (isInternalRoute) {
    return (
      <NextLink className={className} href={link.href} {...rest}>
        {content}
      </NextLink>
    );
  }

  return (
    <a
      className={className}
      href={link.href}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {content}
      {link.external && <span className="sr-only"> (abre en una pestaña nueva)</span>}
    </a>
  );
}
