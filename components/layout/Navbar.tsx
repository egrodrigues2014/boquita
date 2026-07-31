import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import type { HomeContent, NavDropdown } from "@/types/content";

/**
 * Header / navbar (spec §5). Punto 1 del checklist: transparente y absoluto
 * sobre el hero.
 *
 * En esta fase es un Server Component estático: los paneles de dropdown se
 * renderizan con `hidden` y la hamburguesa no hace nada. En 4g pasa a cliente
 * con el drawer de 320px, el patrón disclosure y la trampa de foco.
 *
 * La estructura es 4 dropdowns + 1 enlace simple, en el orden del spec:
 * D1, D2, enlace, D3, D4 (megamenú). El megamenú es el que a ≤991px se
 * convierte en un panel de 270px con scroll, y son los 14 productos del
 * catálogo los que justifican esa medida.
 */
function Dropdown({ dropdown, index }: { dropdown: NavDropdown; index: number }) {
  const id = `nav-dd-${index}`;
  return (
    <div className="nav-dropdown">
      <button
        type="button"
        className="nav-dropdown-toggle"
        aria-expanded={false}
        aria-controls={id}
      >
        {dropdown.label}
      </button>
      <div
        id={id}
        className={`nav-dropdown-list${dropdown.mega ? " nav-dropdown-list--mega" : ""}`}
        hidden
      >
        {dropdown.items.map((item) => (
          <a
            className="nav-dropdown-link"
            key={`${item.label}-${item.href}`}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <span className="nav-dropdown-link-line" aria-hidden="true" />
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Navbar({ nav }: { nav: HomeContent["nav"] }) {
  const [d1, d2, d3, d4] = nav.dropdowns;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link className="brand" href="/" aria-label="Boquita — Sweet & Salty, inicio">
          <img
            className="logo"
            src="/img/brand/logo-43x43.webp"
            srcSet="/img/brand/logo-43x43.webp 43w, /img/brand/logo-86x86.webp 86w"
            sizes="43px"
            width={43}
            height={43}
            alt="Boquita — Sweet & Salty"
          />
        </Link>

        <div className="nav-menu-wrapper">
          <nav className="nav-menu" id="nav-menu" aria-label="Principal">
            <div className="nav-overlay-mobile">
              <Dropdown dropdown={d1} index={1} />
              <Dropdown dropdown={d2} index={2} />
              <a className="nav-link" href={nav.link.href}>
                {nav.link.label}
              </a>
              <Dropdown dropdown={d3} index={3} />
              <Dropdown dropdown={d4} index={4} />
            </div>
          </nav>
        </div>

        <div className="navbar-actions">
          {/* Sólo visible a ≥1280. */}
          <a className="phone-link" href={nav.phone.href}>
            {nav.phone.display}
          </a>

          {/* El carrito llega en la Fase 4; aquí ya ocupa su sitio de 34×34
              porque el punto 1 del checklist mide la fila de acciones. */}
          <button type="button" className="cart-button" aria-label="Carrito, vacío" disabled>
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
          </button>

          <Btn link={nav.cta} variant="nav" />
        </div>

        {/* Sólo visible a ≤991. */}
        <button
          type="button"
          className="menu-button"
          aria-label="Abrir menú"
          aria-expanded={false}
          aria-controls="nav-menu"
        >
          <svg width="27" height="16" viewBox="0 0 27 16" aria-hidden="true" fill="currentColor">
            <rect width="27" height="2" y="0" />
            <rect width="27" height="2" y="7" />
            <rect width="27" height="2" y="14" />
          </svg>
        </button>
      </div>
    </header>
  );
}
