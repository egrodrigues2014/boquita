"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { CartButton } from "@/components/cart/CartButton";
import { ProductSearchAutocomplete } from "@/components/shop/ProductSearchAutocomplete";
import { Btn } from "@/components/ui/Btn";
import type { HomeContent, NavDropdown } from "@/types/content";
import type { ShopSearchSource } from "@/lib/shopSearch";

type NavIconName =
  | "menuBook"
  | "event"
  | "photoLibrary"
  | "storefront"
  | "cake"
  | "cookie"
  | "icecream"
  | "celebration"
  | "favorite"
  | "childFriendly"
  | "localCafe"
  | "cardGiftcard"
  | "park"
  | "info"
  | "person"
  | "localFireDepartment"
  | "listAlt"
  | "viewCarousel"
  | "eventAvailable"
  | "localShipping"
  | "help"
  | "mail"
  | "close"
  | "expandMore";

/** Paths equivalentes a Material Symbols Rounded, servidos inline y sin fuente de iconos externa. */
const NAV_ICON_PATHS: Record<NavIconName, string> = {
  menuBook:
    "M4 3h5.5A3.5 3.5 0 0 1 13 6.5V21a3.5 3.5 0 0 0-3.5-3.5H4V3Zm16 0h-5.5A3.5 3.5 0 0 0 11 6.5V21a3.5 3.5 0 0 1 3.5-3.5H20V3Z",
  event: "M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 7H5v9h14V9Zm-9 2h5v5h-5v-5Z",
  photoLibrary:
    "M8 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 14h12l-4-5-3 3.7L11 12l-3 4ZM2 6h2v14h14v2H4a2 2 0 0 1-2-2V6Z",
  storefront:
    "m4 4-2 5v2a3 3 0 0 0 2 2.83V21h16v-7.17A3 3 0 0 0 22 11V9l-2-5H4Zm2 11h12v4H6v-4Zm-1.65-9h15.3l1.2 3H3.15l1.2-3Z",
  cake: "M12 1c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 2-2 2-2ZM5 8h6V6h2v2h6a2 2 0 0 1 2 2v3c0 1.1-.9 2-2 2-.75 0-1.4-.42-1.74-1.03A2 2 0 0 1 15.5 15a2 2 0 0 1-1.76-1.03A2 2 0 0 1 12 15a2 2 0 0 1-1.74-1.03A2 2 0 0 1 8.5 15a2 2 0 0 1-1.76-1.03A2 2 0 0 1 5 15a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm-2 9h18v5H3v-5Z",
  cookie:
    "M21.95 11.02A5 5 0 0 1 16 5.05 5 5 0 0 1 10.03 2 10 10 0 1 0 22 13c0-.67-.02-1.33-.05-1.98ZM8 8.5A1.5 1.5 0 1 1 8 5a1.5 1.5 0 0 1 0 3.5Zm1 8A1.5 1.5 0 1 1 9 13a1.5 1.5 0 0 1 0 3.5Zm6 2a1.5 1.5 0 1 1 0-3.5 1.5 1.5 0 0 1 0 3.5Z",
  icecream: "M7 9a5 5 0 1 1 10 0c0 2.14-1.35 3.97-3.25 4.68L12 22l-1.75-8.32A5 5 0 0 1 7 9Zm2.2 0h5.6a2.8 2.8 0 1 0-5.6 0Z",
  celebration:
    "m3 21 3.7-10.8 7.1 7.1L3 21Zm5.35-8.45-1.7 4.95 4.95-1.7-3.25-3.25ZM14 4l1.4-2.8 1.4 2.8L20 5.4l-3.2 1.4-1.4 3.2L14 6.8l-3.2-1.4L14 4Zm5.5 6 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM8 2l.8 1.7L10.5 4.5 8.8 5.3 8 7l-.8-1.7-1.7-.8 1.7-.8L8 2Z",
  favorite:
    "M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z",
  childFriendly:
    "M13 2v8h7a7 7 0 0 0-7-8ZM5 11h14a2 2 0 0 1-2 2h-1a5 5 0 0 1-10 0H5v-2Zm3 2a3 3 0 0 0 6 0H8Zm-.5 4A2.5 2.5 0 1 1 5 19.5 2.5 2.5 0 0 1 7.5 17Zm9 0a2.5 2.5 0 1 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5Z",
  localCafe:
    "M3 3h15v3h3a3 3 0 0 1 0 6h-3v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V3Zm15 5v2h3a1 1 0 0 0 0-2h-3ZM2 21h18v2H2v-2Z",
  cardGiftcard:
    "M20 6h-2.18A3 3 0 0 0 12 5a3 3 0 0 0-5.82 1H4a2 2 0 0 0-2 2v3h9V8h2v3h9V8a2 2 0 0 0-2-2ZM9 6a1 1 0 1 1 1-1c0 .55-.45 1-1 1Zm6 0c-.55 0-1-.45-1-1a1 1 0 1 1 1 1ZM2 13h9v9H4a2 2 0 0 1-2-2v-7Zm11 0h9v7a2 2 0 0 1-2 2h-7v-9Z",
  park: "M12 2 6 11h3l-4 6h6v5h2v-5h6l-4-6h3l-6-9Z",
  info: "M11 10h2v7h-2v-7Zm0-4h2v2h-2V6Zm1-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z",
  person: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6Z",
  localFireDepartment:
    "M12.5 2s.5 3-2 5.5C8 10 8.5 13 10 14.5c-2.5-.5-4-2.5-4-5C3.5 12 3 14 3 16a9 9 0 0 0 18 0c0-5-3-9-8.5-14ZM12 20a4 4 0 0 1-4-4c0-1 .25-1.75.75-2.5.5 1 1.5 1.75 2.5 2 .5-1.5 1.5-2.5 1.5-4.5 2 1.5 3.25 3.25 3.25 5a4 4 0 0 1-4 4Z",
  listAlt: "M4 5h2v2H4V5Zm4 0h12v2H8V5ZM4 11h2v2H4v-2Zm4 0h12v2H8v-2ZM4 17h2v2H4v-2Zm4 0h12v2H8v-2Z",
  viewCarousel: "M3 6h3v12H3V6Zm5-2h8v16H8V4Zm10 2h3v12h-3V6Z",
  eventAvailable:
    "M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 7H5v11h14V9Zm-8.5 8.5-3-3 1.4-1.4 1.6 1.6 4.6-4.6 1.4 1.4-6 6Z",
  localShipping:
    "M3 4h11v10h2.5l2.5-3V8h-3V6h4l3 4v7h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V6a2 2 0 0 1 2-2Zm3 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 17h-2v-2h2v2Zm2.07-7.25-.9.92A3.5 3.5 0 0 0 13 15h-2v-.5c0-1 .4-1.96 1.1-2.66l1.24-1.26A2 2 0 1 0 10 9H8a4 4 0 1 1 7.07 2.75Z",
  mail: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
  close: "M18.3 5.7 16.9 4.3 12 9.2 7.1 4.3 5.7 5.7l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z",
  expandMore: "m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z",
};

const NAV_ICON_BY_LABEL: Record<string, NavIconName> = {
  "Catálogo": "menuBook",
  Ocasiones: "event",
  Galería: "photoLibrary",
  "Sobre nosotros": "storefront",
  Queques: "cake",
  Galletas: "cookie",
  Dulces: "icecream",
  Cumpleaños: "celebration",
  "Bodas y bautizos": "favorite",
  "Baby shower": "childFriendly",
  "Oficinas y cafeterías": "localCafe",
  "Regalos corporativos": "cardGiftcard",
  Navidad: "park",
  "Sobre Boquita": "info",
  "Quién está detrás": "person",
  "Cómo horneamos": "localFireDepartment",
  "Qué hay en el catálogo": "listAlt",
  Presentaciones: "viewCarousel",
  "Para qué ocasiones": "eventAvailable",
  "Pedidos y entregas": "localShipping",
  "Preguntas frecuentes": "help",
  Escríbeme: "mail",
};

function NavIcon({ name, className }: { name: NavIconName; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d={NAV_ICON_PATHS[name]} />
    </svg>
  );
}

function LabelIcon({ label, className }: { label: string; className: string }) {
  const icon = NAV_ICON_BY_LABEL[label];
  return icon ? <NavIcon name={icon} className={className} /> : null;
}

/**
 * Header / navbar (spec §5). Puntos 1 y 14 del checklist.
 *
 * A ≤991px el MISMO `.nav-menu` se convierte en un panel fijo de hasta 325px: no hay
 * componente drawer aparte, sólo la clase de estado `.nav-menu--open`. El CSS ya
 * lo contempla.
 *
 * Patrón **disclosure** (`<button aria-expanded aria-controls>` con `<a>` dentro),
 * NO `role="menu"`: son enlaces de navegación, no un widget de menú. Usar
 * `role="menu"` obligaría a implementar navegación por flechas y cambiaría lo que
 * un lector de pantalla anuncia, para peor.
 */

function Dropdown({
  dropdown,
  isOpen,
  onOpen,
  onToggle,
  onRequestClose,
  hoverEnabled,
  isDrawer,
}: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onRequestClose: () => void;
  hoverEnabled: boolean;
  isDrawer: boolean;
}) {
  const id = useId();
  const closeTimer = useRef<number>(0);

  // Retardo al cerrar por hover: sin él, el recorrido diagonal del ratón desde
  // el toggle hasta el primer enlace cierra el panel a mitad de camino.
  const hoverProps = hoverEnabled
    ? {
        onMouseEnter: () => {
          clearTimeout(closeTimer.current);
          onOpen();
        },
        onMouseLeave: () => {
          closeTimer.current = window.setTimeout(onRequestClose, 120);
        },
      }
    : {};

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // En el drawer, un grupo con destino propio va SIEMPRE desplegado: su etiqueta
  // es un <a> que navega, así que no hay nada que alterne el panel.
  //
  // La condición es `isDrawer`, no `!hoverEnabled`: son cosas distintas y
  // confundirlas mandaba los dos paneles abiertos en el HTML del servidor.
  // `hoverEnabled` sólo puede medirse tras hidratar, así que en el servidor vale
  // `false` y `!hoverEnabled` daba `true` para todo el mundo — en escritorio los
  // paneles son `position:absolute` y se pintaban flotando sobre el hero hasta
  // que llegaba el bundle. `isDrawer` arranca igual de ciego, pero al revés: en
  // el peor caso el panel lateral está fuera de pantalla y nadie lo ve.
  const persistentOpen = Boolean(dropdown.href && isDrawer);
  const expanded = isOpen || persistentOpen;
  const hidden = !expanded;

  return (
    <div
      className="nav-dropdown"
      {...hoverProps}
      onBlur={(event) => {
        // Cierra al salir con el teclado, pero no al moverse dentro del panel.
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onRequestClose();
      }}
    >
      {dropdown.href ? (
        <a
          className="nav-dropdown-toggle nav-dropdown-toggle--link"
          href={dropdown.href}
          aria-expanded={expanded}
          aria-controls={id}
          onFocus={onOpen}
        >
          <LabelIcon label={dropdown.label} className="nav-item-icon" />
          {/* El <span> existe para que el drawer pueda animar SÓLO el texto:
              un transform sobre la fila arrastraría también el fondo y la barra
              de hover. No cambia el nombre accesible. */}
          <span className="nav-label">{dropdown.label}</span>
        </a>
      ) : (
        <button
          type="button"
          className="nav-dropdown-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onFocus={onOpen}
          // Con hover activo, el clic ABRE en vez de alternar. Si alternara, el
          // `mouseenter` que precede a todo clic de ratón abriría el panel y el
          // clic lo cerraría acto seguido: el usuario ve el menú colapsarse justo
          // al pulsar la etiqueta. Si el foco ya abrió el panel, el click no lo
          // cierra de inmediato: eso pasaba en el drawer al pasar de Catálogo a
          // Ocasiones. Cerrar es tarea de mouseleave, Escape o un clic fuera.
          onClick={hoverEnabled || isOpen ? onOpen : onToggle}
        >
          <LabelIcon label={dropdown.label} className="nav-item-icon" />
          <span className="nav-label">{dropdown.label}</span>
          <NavIcon name="expandMore" className="nav-chevron" />
        </button>
      )}
      <div
        id={id}
        className="nav-dropdown-list"
        hidden={hidden}
      >
        {dropdown.items.map((item) => (
          <a
            className="nav-dropdown-link"
            key={`${item.label}-${item.href}`}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <LabelIcon label={item.label} className="nav-subitem-icon" />
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Navbar({
  nav,
  searchProducts,
}: {
  nav: HomeContent["nav"];
  searchProducts: ShopSearchSource[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  // Arranca en `false` a propósito, y ese `false` es el arreglo: es el valor con
  // el que se genera el HTML del servidor, y el HTML del servidor es el mismo
  // para todos los anchos. Ante la duda, el estado inicial tiene que ser el que
  // no se vea mal en escritorio.
  const [isDrawer, setIsDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  // El hover sólo se engancha en punteros de verdad y en escritorio: en un
  // portátil táctil, el hover se queda "pegado" tras un toque.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (min-width: 992px)");
    const update = () => setHoverEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, []);

  // Mismo umbral que convierte `.nav-menu` en panel lateral (10-navbar.css), y
  // el único que decide si un grupo con destino propio va desplegado de entrada.
  //
  // Al pasar a escritorio hay que cerrar el drawer: si no, rotar una tablet deja
  // el body bloqueado con un panel invisible. Es el bug clásico de este patrón.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 992px)");
    const update = () => {
      setIsDrawer(!query.matches);
      if (query.matches) closeAll();
    };
    update(); // sin lectura inicial, `isDrawer` se quedaría en el valor del servidor
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [closeAll]);

  // Cierre al hacer clic fuera.
  useEffect(() => {
    if (openDropdown === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openDropdown]);

  /**
   * Estado `scrolled`: la cabecera se despega del top.
   *
   * Con `position: fixed` la cabecera flota sobre el contenido, y sin una
   * separación visual el texto que pasa por debajo se confunde con el del nav.
   * El realce sólo aparece cuando hay algo debajo, no en reposo.
   *
   * Listener pasivo + rAF: `scroll` dispara decenas de veces por gesto y aquí
   * sólo interesa cruzar un umbral. El `passive` evita que el navegador espere a
   * ver si alguien llama a preventDefault antes de desplazar.
   */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };

    read(); // el navegador puede restaurar la posición de scroll al volver atrás
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  useScrollLock(menuOpen);
  useFocusTrap(menuRef, menuOpen);

  /** Escape en dos etapas: primero el dropdown abierto, luego el drawer. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (openDropdown !== null) {
      event.stopPropagation();
      setOpenDropdown(null);
    } else if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const [d1, d2, d3] = nav.dropdowns;
  const dropdownProps = (position: number) => ({
    isOpen: openDropdown === position,
    onOpen: () => setOpenDropdown(position),
    onToggle: () => setOpenDropdown((current) => (current === position ? null : position)),
    onRequestClose: () => setOpenDropdown((current) => (current === position ? null : current)),
    hoverEnabled,
    isDrawer,
  });

  return (
    <header
      className={scrolled ? "navbar navbar--scrolled" : "navbar"}
      onKeyDown={onKeyDown}
    >
      <div className="nav-container">
        <Link className="brand" href="/" aria-label="Boquita — Sweet & Salty, inicio">
          <img
            className="logo"
            src="/img/brand/logo-transparent-43x43.png"
            srcSet="/img/brand/logo-transparent-43x43.png 43w, /img/brand/logo-transparent-86x86.png 86w, /img/brand/logo-transparent-192x192.png 192w"
            sizes="(min-width: 1280px) 86px, (min-width: 992px) 72px, 42px"
            width={86}
            height={86}
            alt="Boquita — Sweet & Salty"
          />
        </Link>

        <div className="nav-menu-wrapper">
          <nav
            className={`nav-menu${menuOpen ? " nav-menu--open" : ""}`}
            id="nav-menu"
            ref={menuRef}
            aria-label="Principal"
          >
            <div className="nav-overlay-mobile">
              {/* Sólo visible a ≤991: cabecera del drawer con el botón de cerrar. */}
              <div className="close-button-wrap">
                <button
                  type="button"
                  className="close-button"
                  aria-label="Cerrar menú"
                  onClick={() => setMenuOpen(false)}
                >
                  <NavIcon name="close" className="close-button-icon" />
                </button>
              </div>

              <Dropdown dropdown={d1} {...dropdownProps(1)} />
              <Dropdown dropdown={d2} {...dropdownProps(2)} />
              <a className="nav-link" href={nav.link.href} onClick={closeAll}>
                <LabelIcon label={nav.link.label} className="nav-item-icon" />
                <span className="nav-label">{nav.link.label}</span>
              </a>
              <Dropdown dropdown={d3} {...dropdownProps(3)} />
            </div>
          </nav>
        </div>

        {/* Un único buscador para todos los anchos. A ≤991 no se esconde: se
            queda en esta misma fila y absorbe el ancho sobrante (10-navbar.css).
            Montarlo dos veces —uno de escritorio y otro para una segunda fila
            móvil— dejaba siempre una copia en `display:none`, y con ella un
            `.nav-search-input` duplicado en el DOM que rompía por modo estricto
            cualquier localizador CSS de los tests. */}
        <div className="navbar-actions">
          <ProductSearchAutocomplete products={searchProducts} />

          <CartButton />

          <Btn link={nav.cta} variant="nav" />
        </div>

        <button
          type="button"
          className="menu-button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="27" height="16" viewBox="0 0 27 16" aria-hidden="true" fill="currentColor">
            <rect width="27" height="2" y="0" />
            <rect width="27" height="2" y="7" />
            <rect width="27" height="2" y="14" />
          </svg>
        </button>
      </div>

      {/* DESVÍO D-4: scrim. Un panel lateral sobre contenido vivo no tiene
          afordancia de cierre ni separación visual. No está en el spec. */}
      {menuOpen && (
        <div className="nav-scrim" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
