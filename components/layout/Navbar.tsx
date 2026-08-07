"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { CartButton } from "@/components/cart/CartButton";
import { Btn } from "@/components/ui/Btn";
import type { HomeContent, NavDropdown } from "@/types/content";

/**
 * Header / navbar (spec §5). Puntos 1 y 14 del checklist.
 *
 * A ≤991px el MISMO `.nav-menu` se convierte en un panel fijo de 320px: no hay
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
}: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onRequestClose: () => void;
  hoverEnabled: boolean;
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

  const hidden = !isOpen && !(dropdown.href && !hoverEnabled);

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
          aria-expanded={isOpen}
          aria-controls={id}
          onFocus={onOpen}
        >
          {dropdown.label}
        </a>
      ) : (
        <button
          type="button"
          className="nav-dropdown-toggle"
          aria-expanded={isOpen}
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
          {dropdown.label}
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
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ProductSearchForm() {
  return (
    <form className="nav-search" action="/tienda" method="get" role="search">
      <label className="sr-only" htmlFor="nav-product-search">
        Buscar productos
      </label>
      <input
        id="nav-product-search"
        className="nav-search-input"
        type="search"
        name="q"
        placeholder="Buscar productos"
        autoComplete="off"
      />
      <button className="nav-search-button" type="submit" aria-label="Buscar productos">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

export function Navbar({ nav }: { nav: HomeContent["nav"] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [hoverEnabled, setHoverEnabled] = useState(false);
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

  // Al pasar a escritorio hay que cerrar el drawer: si no, rotar una tablet deja
  // el body bloqueado con un panel invisible. Es el bug clásico de este patrón.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 992px)");
    const onChange = () => {
      if (query.matches) closeAll();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
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
            srcSet="/img/brand/logo-transparent-43x43.png 43w, /img/brand/logo-transparent-86x86.png 86w"
            sizes="(min-width: 1280px) 86px, 72px"
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
                <span aria-hidden="true" />
                <button
                  type="button"
                  className="close-button"
                  aria-label="Cerrar menú"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M2 2 L18 18 M18 2 L2 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>

              <Dropdown dropdown={d1} {...dropdownProps(1)} />
              <Dropdown dropdown={d2} {...dropdownProps(2)} />
              <a className="nav-link" href={nav.link.href} onClick={closeAll}>
                {nav.link.label}
              </a>
              <Dropdown dropdown={d3} {...dropdownProps(3)} />
            </div>
          </nav>
        </div>

        <div className="navbar-actions">
          <ProductSearchForm />

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

      {/* DESVÍO D-4: scrim. Un panel de 320px sobre contenido vivo no tiene
          afordancia de cierre ni separación visual. No está en el spec. */}
      {menuOpen && (
        <div className="nav-scrim" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
