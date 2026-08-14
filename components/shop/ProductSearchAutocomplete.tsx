"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getShopSearchSuggestions,
  type ShopSearchSource,
} from "@/lib/shopSearch";

export function ProductSearchAutocomplete({ products }: { products: ShopSearchSource[] }) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = useId();
  const formRef = useRef<HTMLFormElement>(null);
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

  const chooseActive = () => {
    if (!activeSuggestion) return false;
    router.push(activeSuggestion.href);
    setOpen(false);
    return true;
  };

  return (
    <form
      ref={formRef}
      className="nav-search"
      action="/tienda"
      method="get"
      role="search"
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

            if (event.key === "Enter" && chooseActive()) {
              event.preventDefault();
            }
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
