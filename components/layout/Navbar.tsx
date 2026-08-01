"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
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

  return (
    <div
      className="nav-dropdown"
      {...hoverProps}
      onBlur={(event) => {
        // Cierra al salir con el teclado, pero no al moverse dentro del panel.
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onRequestClose();
      }}
    >
      <button
        type="button"
        className="nav-dropdown-toggle"
        aria-expanded={isOpen}
        aria-controls={id}
        // Con hover activo, el clic ABRE en vez de alternar. Si alternara, el
        // `mouseenter` que precede a todo clic de ratón abriría el panel y el
        // clic lo cerraría acto seguido: el usuario ve el menú colapsarse justo
        // al pulsar la etiqueta. Con hover, cerrar es tarea de mouseleave,
        // Escape o un clic fuera. En táctil (sin hover) el clic sí alterna.
        onClick={hoverEnabled ? onOpen : onToggle}
      >
        {dropdown.label}
      </button>
      <div
        id={id}
        className={`nav-dropdown-list${dropdown.mega ? " nav-dropdown-list--mega" : ""}`}
        hidden={!isOpen}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [hoverEnabled, setHoverEnabled] = useState(false);
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

  const [d1, d2, d3, d4] = nav.dropdowns;
  const dropdownProps = (position: number) => ({
    isOpen: openDropdown === position,
    onOpen: () => setOpenDropdown(position),
    onToggle: () => setOpenDropdown((current) => (current === position ? null : position)),
    onRequestClose: () => setOpenDropdown((current) => (current === position ? null : current)),
    hoverEnabled,
  });

  return (
    <header className="navbar" onKeyDown={onKeyDown}>
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
              <Dropdown dropdown={d4} {...dropdownProps(4)} />
            </div>
          </nav>
        </div>

        <div className="navbar-actions">
          <a className="phone-link" href={nav.phone.href}>
            {nav.phone.display}
          </a>

          {/* El carrito llega en la Fase 4. Ocupa ya su sitio de 34×34 porque el
              punto 1 del checklist mide esta fila de acciones. */}
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
