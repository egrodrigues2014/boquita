"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { formatCRCShort } from "@/lib/format";
import { MAX_QTY, cartHasQuoted, cartSubtotal, useCart } from "@/lib/cart";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { buildWhatsAppUrl, earliestDate } from "@/lib/whatsapp";
import { findProduct } from "@/content/products";
import {
  validateMarketingChoice,
  type MarketingValidation,
  type OrderSubmission,
} from "@/lib/orderSubmission";
import type { CheckoutFields } from "@/types/shop";

type SaveState = "idle" | "saving" | "saved" | "error";

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
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const attemptRef = useRef<{ id: string; fingerprint: string } | null>(null);
  const lastSubmissionRef = useRef<OrderSubmission | null>(null);
  const [fields, setFields] = useState<CheckoutFields>({});
  const [marketingEmail, setMarketingEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [marketingError, setMarketingError] = useState<
    Extract<MarketingValidation, { valid: false }> | undefined
  >();
  const [website, setWebsite] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
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

  async function persistSubmission(submission: OrderSubmission) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
        keepalive: true,
      });
      if (!response.ok) throw new Error(`order storage returned ${response.status}`);
      setSaveState("saved");
    } catch (error) {
      console.error("No se pudo guardar el intento de pedido", error);
      setSaveState("error");
    }
  }

  function submissionFor(marketing: OrderSubmission["marketing"]): OrderSubmission {
    const snapshot = {
      name: fields.name?.trim() || undefined,
      date: fields.date || undefined,
      zone: fields.zone?.trim() || undefined,
      notes: fields.notes?.trim() || undefined,
      marketing,
      items: lines.map((line) => ({
        slug: line.slug,
        name: line.name,
        unit: line.unit,
        price: line.price,
        qty: line.qty,
      })),
      website,
    };
    const fingerprint = JSON.stringify(snapshot);
    if (!attemptRef.current || attemptRef.current.fingerprint !== fingerprint) {
      attemptRef.current = { id: crypto.randomUUID(), fingerprint };
    }
    return { id: attemptRef.current.id, ...snapshot };
  }

  function handleFinalize(event: MouseEvent<HTMLAnchorElement>) {
    const marketing = validateMarketingChoice(marketingEmail, marketingConsent);
    if (!marketing.valid) {
      event.preventDefault();
      setMarketingError(marketing);
      requestAnimationFrame(() => {
        (marketing.field === "email" ? emailRef.current : consentRef.current)?.focus();
      });
      return;
    }

    setMarketingError(undefined);
    const submission = submissionFor(marketing.marketing);
    lastSubmissionRef.current = submission;
    setSent(true);
    void persistSubmission(submission);
  }

  function resetCompletedCart() {
    clear();
    setFields({});
    setMarketingEmail("");
    setMarketingConsent(false);
    setMarketingError(undefined);
    setWebsite("");
    setSaveState("idle");
    setSent(false);
    attemptRef.current = null;
    lastSubmissionRef.current = null;
    onClose();
  }

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
            <p>Todavía no has agregado productos.</p>
            <Link className="btn btn--ghost" href="/tienda" onClick={onClose}>
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-scroll">
              <ul className="cart-lines">
                {lines.map((line) => (
                  // La clave lleva la presentación: dos tamaños del mismo queque
                  // son dos líneas y con `key={line.slug}` React las confundiría.
                  <li className="cart-line" key={`${line.slug}·${line.unit}`}>
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
                          aria-label={`Quitar una unidad de ${line.name} (${line.unit})`}
                          onClick={() => setQty(line.slug, line.unit, line.qty - 1)}
                        >
                          −
                        </button>
                        <output className="qty-value" aria-live="polite">
                          {line.qty}
                        </output>
                        <button
                          type="button"
                          className="qty-button"
                          aria-label={`Agregar una unidad de ${line.name} (${line.unit})`}
                          aria-disabled={line.qty >= MAX_QTY}
                          onClick={() => setQty(line.slug, line.unit, line.qty + 1)}
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
                        aria-label={`Quitar ${line.name} (${line.unit}) del pedido`}
                        onClick={() => remove(line.slug, line.unit)}
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

                <label htmlFor="cart-date">Fecha en que lo quieres</label>
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

                <fieldset className="cart-marketing">
                  <legend>Promociones por correo</legend>
                  <p className="cart-marketing-intro" id="cart-email-hint">
                    Recibe novedades, productos de temporada y promociones de Boquita.
                  </p>

                  <label htmlFor="cart-email">Correo para recibir promociones (opcional)</label>
                  <input
                    ref={emailRef}
                    id="cart-email"
                    className="cart-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={254}
                    value={marketingEmail}
                    aria-invalid={marketingError?.field === "email" || undefined}
                    aria-describedby={`cart-email-hint${
                      marketingError?.field === "email" ? " cart-marketing-error" : ""
                    }`}
                    onChange={(event) => {
                      setMarketingEmail(event.target.value);
                      setMarketingError(undefined);
                    }}
                  />

                  <div className="cart-consent">
                    <input
                      ref={consentRef}
                      id="cart-marketing-consent"
                      type="checkbox"
                      checked={marketingConsent}
                      aria-invalid={marketingError?.field === "consent" || undefined}
                      aria-describedby={
                        marketingError?.field === "consent" ? "cart-marketing-error" : undefined
                      }
                      onChange={(event) => {
                        setMarketingConsent(event.target.checked);
                        setMarketingError(undefined);
                      }}
                    />
                    <span>
                      <label htmlFor="cart-marketing-consent">
                        Acepto recibir promociones por correo.
                      </label>{" "}
                      <Link href="/aviso-legal#promociones" onClick={onClose}>
                        Ver privacidad
                      </Link>
                      .
                    </span>
                  </div>

                  {marketingError && (
                    <p className="cart-marketing-error" id="cart-marketing-error" role="alert">
                      {marketingError.message}
                    </p>
                  )}

                  <div className="cart-honeypot" aria-hidden="true">
                    <label htmlFor="cart-website">Sitio web</label>
                    <input
                      id="cart-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </div>
                </fieldset>
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
                onClick={handleFinalize}
              >
                Finalizar por WhatsApp
                <span className="sr-only"> (abre una pestaña nueva)</span>
              </a>

              {sent && (
                <div className={`cart-sent cart-sent--${saveState}`} aria-live="polite">
                  {saveState === "saving" && <p>Guardando tu solicitud…</p>}
                  {saveState === "saved" && (
                    <>
                      <p>Solicitud guardada. ¿Ya enviaste el mensaje?</p>
                      <button type="button" className="btn btn--ghost" onClick={resetCompletedCart}>
                        Sí, vaciar el carrito
                      </button>
                    </>
                  )}
                  {saveState === "error" && (
                    <>
                      <p>
                         WhatsApp sigue funcionando, pero no pudimos guardar la solicitud en el sitio.
                      </p>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => {
                          if (lastSubmissionRef.current) {
                            void persistSubmission(lastSubmissionRef.current);
                          }
                        }}
                      >
                        Reintentar guardado
                      </button>
                      <button type="button" className="cart-discard" onClick={resetCompletedCart}>
                        Vaciar de todos modos
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
