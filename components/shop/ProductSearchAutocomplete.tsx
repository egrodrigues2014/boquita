"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getShopSearchSuggestions,
  resolveShopSearchTarget,
  type ShopSearchSource,
} from "@/lib/shopSearch";

export function ProductSearchAutocomplete({ products }: { products: ShopSearchSource[] }) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(
    () => getShopSearchSuggestions(products, query),
    [products, query],
  );
  const showSuggestions = open && suggestions.length > 0;
  const activeSuggestion =
    activeIndex >= 0 && activeIndex < suggestions.length ? suggestions[activeIndex] : undefined;

  return (
    <form
      className="nav-search"
      action="/tienda"
      method="get"
      role="search"
      /**
       * Enter y la lupa desembocan los dos aquí, así que la decisión se toma una
       * sola vez: la sugerencia marcada con las flechas manda; si no hay ninguna,
       * lo escrito puede ser un término de la taxonomía («torta» → Queques) y
       * entonces se va al filtro; y si tampoco, se deja pasar el submit nativo a
       * `/tienda?q=`, que es la búsqueda de texto de siempre.
       */
      onSubmit={(event) => {
        const href = activeSuggestion?.href ?? resolveShopSearchTarget(query);
        if (!href) return;
        event.preventDefault();
        router.push(href);
        setOpen(false);
        setActiveIndex(-1);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <div
        className="nav-search-control"
        role="combobox"
        aria-label="Buscar productos"
        aria-haspopup="listbox"
        aria-expanded={showSuggestions}
        aria-controls={listboxId}
      >
        <label className="sr-only" htmlFor={inputId}>
          Buscar productos
        </label>
        <input
          id={inputId}
          className="nav-search-input"
          type="search"
          name="q"
          value={query}
          placeholder="Buscar productos"
          autoComplete="off"
          aria-autocomplete="list"
          aria-activedescendant={activeSuggestion ? `${listboxId}-${activeSuggestion.id}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }

            if (event.key === "ArrowDown") {
              if (suggestions.length === 0) return;
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => (current + 1) % suggestions.length);
              return;
            }

            if (event.key === "ArrowUp") {
              if (suggestions.length === 0) return;
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current <= 0 ? suggestions.length - 1 : current - 1,
              );
              return;
            }

            // Enter no se trata aquí: dispara el submit del formulario, y ahí
            // está la única decisión de a dónde se navega.
          }}
        />
        <button className="nav-search-button" type="submit" aria-label="Buscar productos">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showSuggestions && (
        <div
          id={listboxId}
          className="nav-search-suggestions"
          role="listbox"
          aria-label="Sugerencias de productos"
        >
          {suggestions.map((suggestion, index) => (
            <a
              key={suggestion.id}
              id={`${listboxId}-${suggestion.id}`}
              className={
                index === activeIndex
                  ? "nav-search-suggestion nav-search-suggestion--active"
                  : "nav-search-suggestion"
              }
              href={suggestion.href}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setOpen(false)}
            >
              {suggestion.label}
            </a>
          ))}
        </div>
      )}
    </form>
  );
}
