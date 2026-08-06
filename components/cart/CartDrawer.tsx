"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatCRCShort } from "@/lib/format";
import { MAX_QTY, cartHasQuoted, cartSubtotal, useCart } from "@/lib/cart";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { buildWhatsAppUrl, earliestDate } from "@/lib/whatsapp";
import { findProduct } from "@/content/products";
import type { CheckoutFields } from "@/types/shop";

/**
 * Panel del carrito con el checkout dentro.
 *
 * El checkout **no vacía el carrito al pulsar**: WhatsApp puede no abrirse, el
 * cliente puede cerrarlo sin enviar, o puede querer revisar. Vaciarlo ahí
 * perdería el pedido sin que nadie lo haya recibido. Se vacía desde un botón
 * explícito de «ya hice mi pedido».
 *
 * El botón de finalizar es un `<a href>` real, no un `window.open`: así sobrevive
 * al bloqueo de popups de iOS y funciona con WhatsApp Web en escritorio.
 */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useCart((state) => state.lines);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);

  const panelRef = useRef<HTMLDivElement>(null);
  const [fields, setFields] = useState<CheckoutFields>({});
  const [sent, setSent] = useState(false);

  useScrollLock(open);
  useFocusTrap(panelRef, open);

  const subtotal = cartSubtotal(lines);
  const hasQuoted = cartHasQuoted(lines);

  /**
   * El lead time del carrito es el MÁS LARGO de sus productos: si hay un queque
   * personalizado (una semana), no sirve ofrecer pasado mañana.
   *
   * Se prefiere el valor guardado en la línea, que es el que tenía el catálogo
   * cuando se añadió. `findProduct` queda como respaldo para las líneas de
   * carritos anteriores a ese campo; es el catálogo estático, así que un lead
   * time cambiado en la base no se refleja ahí — pero es mejor que suponer 48h.
   */
  const leadTime = lines.reduce(
    (max, line) =>
      Math.max(max, line.leadTimeHours ?? findProduct(line.slug)?.leadTimeHours ?? 48),
    48,
  );
  const minDate = earliestDate(leadTime, new Date());

  const { url, truncated } = buildWhatsAppUrl(lines, fields);

  return (
    <>
      {open && <div className="cart-scrim" aria-hidden="true" onClick={onClose} />}

      <div
        className={`cart-drawer${open ? " cart-drawer--open" : ""}`}
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-labelledby="cart-title"
        // `inert` cuando está cerrado: sin esto, el contenido del panel oculto
        // sigue siendo tabulable y el foco desaparece de la página visible.
        inert={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="cart-head">
          <h2 id="cart-title" className="as-h4">
            Tu pedido
          </h2>
          <button type="button" className="cart-close" aria-label="Cerrar el carrito" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 2 L18 18 M18 2 L2 18" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p>Todavía no has añadido nada.</p>
            <Link className="btn btn--ghost" href="/tienda" onClick={onClose}>
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-scroll">
              <ul className="cart-lines">
                {lines.map((line) => (
                  <li className="cart-line" key={line.slug}>
                    {line.image && (
                      <img
                        className="cart-line-img"
                        src={line.image}
                        alt=""
                        width={60}
                        height={60}
                        loading="lazy"
                      />
                    )}
                    <div className="cart-line-body">
                      <Link
                        className="cart-line-name"
                        href={`/tienda/${line.slug}`}
                        onClick={onClose}
                      >
                        {line.name}
                      </Link>
                      <p className="cart-line-unit">{line.unit}</p>

                      <div className="qty-stepper qty-stepper--sm">
                        <button
                          type="button"
                          className="qty-button"
                          aria-label={`Quitar una unidad de ${line.name}`}
                          onClick={() => setQty(line.slug, line.qty - 1)}
                        >
                          −
                        </button>
                        <output className="qty-value" aria-live="polite">
                          {line.qty}
                        </output>
                        <button
                          type="button"
                          className="qty-button"
                          aria-label={`Añadir una unidad de ${line.name}`}
                          aria-disabled={line.qty >= MAX_QTY}
                          onClick={() => setQty(line.slug, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-line-end">
                      <span className="cart-line-price">
                        {line.priceOnRequest ? "a convenir" : formatCRCShort(line.price * line.qty)}
                      </span>
                      <button
                        type="button"
                        className="cart-line-remove"
                        aria-label={`Quitar ${line.name} del pedido`}
                        onClick={() => remove(line.slug)}
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-total">
                <span>{hasQuoted ? "Subtotal con precio fijo" : "Total"}</span>
                <strong>{formatCRCShort(subtotal)}</strong>
              </div>
              {hasQuoted && (
                <p className="cart-note">
                  Hay productos que se cotizan aparte: el total es aproximado y lo confirmamos por
                  WhatsApp.
                </p>
              )}

              <div className="cart-fields">
                <label htmlFor="cart-name">Tu nombre</label>
                <input
                  id="cart-name"
                  className="cart-input"
                  type="text"
                  autoComplete="name"
                  value={fields.name ?? ""}
                  onChange={(event) => setFields((f) => ({ ...f, name: event.target.value }))}
                />

                <label htmlFor="cart-date">Fecha en que lo querés</label>
                <input
                  id="cart-date"
                  className="cart-input"
                  type="date"
                  min={minDate}
                  value={fields.date ?? ""}
                  onChange={(event) => setFields((f) => ({ ...f, date: event.target.value }))}
                  aria-describedby="cart-date-hint"
                />
                <p className="cart-hint" id="cart-date-hint">
                  Se hornea por encargo: lo antes posible para este pedido es el {minDate}.
                </p>

                <label htmlFor="cart-zone">Zona de entrega o retiro</label>
                <input
                  id="cart-zone"
                  className="cart-input"
                  type="text"
                  placeholder="Santa Ana, Escazú, retiro en Condado del Río…"
                  value={fields.zone ?? ""}
                  onChange={(event) => setFields((f) => ({ ...f, zone: event.target.value }))}
                />

                <label htmlFor="cart-notes">Algo que debamos saber</label>
                <input
                  id="cart-notes"
                  className="cart-input"
                  type="text"
                  placeholder="Alergias, mensaje en el queque…"
                  value={fields.notes ?? ""}
                  onChange={(event) => setFields((f) => ({ ...f, notes: event.target.value }))}
                />
              </div>

              {truncated && (
                <p className="cart-note">
                  El pedido es largo, así que el mensaje irá resumido y te pediremos el detalle en el
                  chat.
                </p>
              )}
            </div>

            <div className="cart-actions">
              {/* <a> real y no window.open: sobrevive al bloqueo de popups de iOS. */}
              <a
                className="btn cart-submit"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSent(true)}
              >
                Finalizar por WhatsApp
                <span className="sr-only"> (abre una pestaña nueva)</span>
              </a>

              {sent && (
                <div className="cart-sent" role="status">
                  <p>¿Ya enviaste el mensaje?</p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      clear();
                      setSent(false);
                      onClose();
                    }}
                  >
                    Sí, vaciar el carrito
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
