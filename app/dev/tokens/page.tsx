import type { Metadata } from "next";
import { THRESHOLD, contrastRatio, meetsAA, type TextSize } from "@/lib/color";
import { CONTACT } from "@/lib/contact";
import { formatCRC, formatCRCShort, formatFrom } from "@/lib/format";
import { footerBackground, getTokens } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Especímenes de tokens",
  robots: { index: false, follow: false },
};

/** Estático: la lectura de styles/01-tokens.css ocurre en build, no en runtime. */
export const dynamic = "force-static";

/**
 * Página de especímenes — el entregable verificable de la Fase 0.
 *
 * Se revisa a los 8 anchos del checklist (1920/1440/1280/1100/991/767/479/390)
 * para confirmar que la escala tipográfica, los tokens re-tematizados y los
 * componentes base del spec §2–§3 se comportan antes de construir una sola
 * sección del layout.
 *
 * Los ratios de contraste NO están escritos a mano: se leen de
 * styles/01-tokens.css y se recalculan con lib/color.ts, la misma
 * implementación que blinda tests/unit/contrast.test.ts.
 *
 * El "andamio" de esta página usa estilos inline a propósito, para no meter ni
 * un nombre de clase nuevo en el CSS global del spec.
 */

// ── Andamio (no forma parte del sistema de diseño) ─────────────────────────

const shell: React.CSSProperties = {
  maxWidth: 1170,
  marginInline: "auto",
  padding: "40px 15px 120px",
};

const rule: React.CSSProperties = {
  border: 0,
  borderTop: "1px solid var(--gray)",
  margin: "56px 0 28px",
};

const caption: React.CSSProperties = {
  fontFamily: "var(--ff-sans)",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--dark-gray)",
  margin: "0 0 14px",
};

const note: React.CSSProperties = {
  fontFamily: "var(--ff-sans)",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--body-text)",
  margin: "6px 0 0",
};

const table: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--ff-sans)",
  fontSize: 13,
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "2px solid var(--gray)",
  color: "var(--dark-gray)",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--gray)",
  color: "var(--text-dark)",
  verticalAlign: "middle",
};

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 3,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: ok ? "#14532d" : "#7f1d1d",
        background: ok ? "#dcfce7" : "#fee2e2",
      }}
    >
      {ok ? "PASA" : "FALLA"}
    </span>
  );
}

const SIZE_LABEL: Record<TextSize, string> = {
  normal: `texto <24px (≥${THRESHOLD.AA_NORMAL})`,
  large: `texto ≥24px (≥${THRESHOLD.AA_LARGE})`,
  "non-text": `no-texto (≥${THRESHOLD.NON_TEXT})`,
};

type Row = {
  token: string;
  on: string;
  onLabel: string;
  size: TextSize;
  usedFor: string;
  /** true cuando el par debe FALLAR — documenta un límite deliberado */
  expectFail?: boolean;
};

function ContrastTable({ rows, tokens }: { rows: Row[]; tokens: Record<string, string> }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Token</th>
            <th style={th}>Valor</th>
            <th style={th}>Sobre</th>
            <th style={th}>Ratio</th>
            <th style={th}>Umbral</th>
            <th style={th}>Estado</th>
            <th style={th}>Se usa en</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = tokens[row.token];
            if (!value) throw new Error(`Token ausente: ${row.token}`);
            const ratio = contrastRatio(value, row.on);
            const passes = meetsAA(ratio, row.size);
            const ok = row.expectFail ? !passes : passes;
            return (
              <tr key={`${row.token}-${row.onLabel}`}>
                <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>{row.token}</td>
                <td style={td}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 18,
                        height: 18,
                        background: value,
                        border: "1px solid var(--gray)",
                        borderRadius: 2,
                      }}
                    />
                    <code>{value}</code>
                  </span>
                </td>
                <td style={td}>{row.onLabel}</td>
                <td style={{ ...td, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  {ratio.toFixed(2)}
                </td>
                <td style={{ ...td, color: "var(--body-text)" }}>
                  {row.expectFail ? "debe fallar" : SIZE_LABEL[row.size]}
                </td>
                <td style={td}>
                  <Badge ok={ok} />
                </td>
                <td style={{ ...td, color: "var(--body-text)" }}>{row.usedFor}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function TokensSpecimenPage() {
  const tokens = getTokens();
  const { light, footer } = tokens;
  const BROWN = footerBackground(tokens);
  const WHITE = light["--white"]!;
  const CREAM = light["--primary-light"]!;

  const lightRows: Row[] = [
    {
      token: "--text-dark",
      on: WHITE,
      onLabel: "blanco",
      size: "normal",
      usedFor: "h1, h3, h5, h6, body, etiqueta de botón",
    },
    { token: "--text-dark", on: CREAM, onLabel: "crema", size: "normal", usedFor: "tarjetas crema" },
    { token: "--body-text", on: WHITE, onLabel: "blanco", size: "normal", usedFor: "todos los <p>" },
    {
      token: "--body-text",
      on: CREAM,
      onLabel: "crema",
      size: "normal",
      usedFor: "<p> sobre crema",
    },
    { token: "--link", on: WHITE, onLabel: "blanco", size: "normal", usedFor: "<a> en reposo" },
    {
      token: "--gold-display",
      on: WHITE,
      onLabel: "blanco",
      size: "large",
      usedFor: "h2, h4, .text-primary, .stat-num",
    },
    {
      token: "--gold-display",
      on: CREAM,
      onLabel: "crema",
      size: "large",
      usedFor: "h2 del bloque crema",
    },
    {
      token: "--gold-ink",
      on: WHITE,
      onLabel: "blanco",
      size: "normal",
      usedFor: "a:hover, li, nav/search/cart, flechas del slider",
    },
    {
      token: "--gold-ink",
      on: CREAM,
      onLabel: "crema",
      size: "normal",
      usedFor: "precios del catálogo (18/20px)",
    },
    {
      token: "--gold-line",
      on: WHITE,
      onLabel: "blanco",
      size: "non-text",
      usedFor: "borde de botón, raya 16×2, línea 160×1",
    },
    {
      token: "--focus",
      on: WHITE,
      onLabel: "blanco",
      size: "non-text",
      usedFor: "anillo de :focus-visible",
    },
    {
      token: "--text-dark",
      on: light["--gold"]!,
      onLabel: "--gold (relleno)",
      size: "normal",
      usedFor: "etiqueta del .btn sobre relleno dorado",
    },
    {
      token: "--white",
      on: light["--gold"]!,
      onLabel: "--gold (relleno)",
      size: "normal",
      usedFor: "lo que el spec pedía. Motivo del desvío D-0",
      expectFail: true,
    },
    {
      token: "--gold-bright",
      on: WHITE,
      onLabel: "blanco",
      size: "large",
      usedFor: "el amarillo del logo NO vale como tinta sobre claro",
      expectFail: true,
    },
  ];

  const footerRows: Row[] = [
    {
      token: "--gold-ink",
      on: BROWN,
      onLabel: "marrón",
      size: "normal",
      usedFor: "dirección, teléfonos, iconos sociales (18/20px)",
    },
    {
      token: "--gold-display",
      on: BROWN,
      onLabel: "marrón",
      size: "large",
      usedFor: "h4 de la newsletter (30/26px)",
    },
    {
      token: "--text-dark",
      on: BROWN,
      onLabel: "marrón",
      size: "normal",
      usedFor: "enlaces del pie y copyright (invertido a blanco)",
    },
    {
      token: "--body-text",
      on: BROWN,
      onLabel: "marrón",
      size: "normal",
      usedFor: "texto de marca (blanco al 86%, compuesto)",
    },
    {
      token: "--gold-line",
      on: BROWN,
      onLabel: "marrón",
      size: "non-text",
      usedFor: "trazos decorativos",
    },
    {
      token: "--focus",
      on: BROWN,
      onLabel: "marrón",
      size: "non-text",
      usedFor: "anillo de foco sobre el pie",
    },
    {
      token: "--gold-bright",
      on: BROWN,
      onLabel: "marrón",
      size: "non-text",
      usedFor: "acentos decorativos, sólo aquí",
    },
  ];

  return (
    <main id="contenido" style={shell}>
      <p style={caption}>Boquita · Fase 0</p>
      <h1 style={{ fontSize: 46, margin: "0 0 10px" }}>Especímenes de tokens</h1>
      <p style={note}>
        Página de desarrollo. Revisar a 1920 · 1440 · 1280 · 1100 · 991 · 767 · 479 · 390 px, y con{" "}
        <code>prefers-reduced-motion: reduce</code> activado. Los ratios se recalculan en build
        desde <code>styles/01-tokens.css</code> con <code>lib/color.ts</code>; no hay ni un número
        escrito a mano.
      </p>

      {/* ── Escala tipográfica ─────────────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>1 · Escala tipográfica (spec §2.3)</p>

      <h1>Heading 1 · queque de zanahoria</h1>
      <p style={note}>
        <code>h1</code> — 70px base · 52 ≤991 · 46 ≤767
      </p>

      <h1 className="h1-hero">
        Dulce y salado
        <br />
        <span className="text-primary">hecho en casa</span>
      </h1>
      <p style={note}>
        <code>.h1-hero</code> — 70 base · 72 ≥1440 · 86 ≥1920 · 52 ≤991 · 46 ≤767. Segunda línea en{" "}
        <code>--gold-display</code>. El salto de línea es un <code>&lt;br&gt;</code> duro: así el
        swap de fuente cambia anchos pero nunca el número de líneas.
      </p>

      <h2>Heading 2 · lo que sale del horno</h2>
      <p style={note}>
        <code>h2</code> — 50 base · 42 ≤991 · 34 ≤767. Color <code>--gold-display</code>.
      </p>

      <h3>Heading 3 · polvorones de almendra</h3>
      <p style={note}>
        <code>h3</code> — 32 base · 34 ≥1280 · 36 ≥1440 · 30 ≤767
      </p>

      <h4>Heading 4 · suscribite a la newsletter</h4>
      <p style={note}>
        <code>h4</code> — 30 base · 26 ≤767. Color <code>--gold-display</code>.
      </p>

      <h5>Heading 5 · galletas de granola</h5>
      <p style={note}>
        <code>h5</code> — 22px en todos los anchos
      </p>

      <h6>Heading 6 · cachitos de jamón</h6>
      <p style={note}>
        <code>h6</code> — 20 base · 18 ≤991. Fuente display.
      </p>

      <p className="h6-sans">Eyebrow neutro</p>
      <p className="h6-sans primary">Repostería artesanal en Santa Ana</p>
      <p style={note}>
        <code>.h6-sans</code> — cambia la fuente a Libre Franklin, 20px/500, letter-spacing .1em. Se
        renderiza como <code>&lt;p&gt;</code>, no como <code>h6</code>, para no romper el orden de
        encabezados (desvío D-6). La variante <code>.primary</code> usa{" "}
        <code>--gold-ink</code>, no <code>--gold-display</code>: son 20px sin negrita, así que
        necesita AA normal.
      </p>

      <p>
        Párrafo base a 18px. Horneamos por encargo en Santa Ana con ingredientes de
        verdad: mantequilla, zanahoria fresca, chocolate y almendra.
      </p>
      <p className="lead">
        Párrafo <code>.lead</code> a 20px, el que acompaña al titular del hero.
      </p>
      <p>
        Un enlace en reposo: <a href="#contenido">volver al contenido</a> — 20px/500, hover a{" "}
        <code>--gold-ink</code>.
      </p>

      <ul>
        <li>Sin gluten y bajas en azúcar</li>
        <li>Horneado en tandas pequeñas</li>
        <li>Pedidos con 48 horas de anticipación</li>
      </ul>
      <p style={note}>
        <code>ul</code> / <code>li</code> — bullet SVG en <code>/icons/list-bullet.svg</code>,
        posicionado a <code>0 7px</code>.
      </p>

      <blockquote>
        El mejor queque de zanahoria que he probado en el Valle Central.
      </blockquote>
      <p style={note}>
        <code>blockquote</code> — 36px base · 18 ≤767, icono en{" "}
        <code>/icons/quote-icon.svg</code>. Lato no se carga en la portada porque ningún selector de
        ella lo usa (desvío D-1); aquí cae al fallback.
      </p>

      {/* ── Precios ────────────────────────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>2 · Formato de moneda (spec §8, adaptado a colones)</p>
      <table style={{ ...table, maxWidth: 620 }}>
        <thead>
          <tr>
            <th style={th}>Función</th>
            <th style={th}>Salida</th>
            <th style={th}>Dónde</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["formatCRC(14000)", formatCRC(14000), "bloque de catálogo, páginas de producto"],
              ["formatFrom(22000)", formatFrom(22000), "queques personalizados"],
              ["formatCRCShort(6500)", formatCRCShort(6500), "carrito y mensaje de WhatsApp"],
              ["formatCRC(1234567)", formatCRC(1234567), "agrupación por encima del millón"],
            ] as const
          ).map(([fn, out, where]) => (
            <tr key={fn}>
              <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>{fn}</td>
              <td style={{ ...td, fontWeight: 600 }}>{out}</td>
              <td style={{ ...td, color: "var(--body-text)" }}>{where}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={note}>
        Sin <code>Intl</code>: <code>Intl.NumberFormat(&quot;es-CR&quot;)</code> devuelve{" "}
        <code>12 000</code> con espacio duro fino y sus separadores varían entre builds de ICU, lo
        que provocaría un mismatch de hidratación en un precio.
      </p>

      {/* ── Contraste, ámbito claro ────────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>3 · Contraste — ámbito claro (checklist §9 punto 13)</p>
      <ContrastTable rows={lightRows} tokens={light} />
      <p style={note}>
        Las dos filas marcadas <em>debe fallar</em> no son errores: documentan límites deliberados.
        Blanco sobre <code>--gold</code> da 2.09, y por eso la etiqueta del botón es marrón en vez
        de blanca como pedía el spec.
      </p>

      {/* ── Contraste, ámbito oscuro ───────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>4 · Contraste — dentro de .footer-dark</p>
      <ContrastTable rows={footerRows} tokens={footer} />
      <p style={note}>
        <code>.footer-dark</code> re-declara los tokens de tinta, así que toda regla que use{" "}
        <code>var(--gold-ink)</code> se invierte sola. El fondo es el{" "}
        <code>--text-dark</code> del ámbito claro (<code>{BROWN}</code>), no el ya invertido a
        blanco de dentro del bloque.
      </p>

      {/* ── Botones ────────────────────────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>5 · Botones (spec §3.1–3.2)</p>
      <div className="btn-group">
        <a className="btn" href="#contenido">
          Ver el catálogo
        </a>
        <a className="btn btn--ghost" href="#contenido">
          Pedir por WhatsApp
        </a>
      </div>
      <p style={note}>
        Altura ≈60px (14px de padding vertical + 20px/1.5em). Relleno{" "}
        <code>--gold</code> con etiqueta <code>--text-dark</code> (6.58) y borde{" "}
        <code>--gold-line</code> (4.00) para garantizar el límite del control sobre blanco. Pasar el
        ratón y tabular para ver hover y anillo de foco. <code>.btn-group</code> pasa a columna a
        ≤479px.
      </p>

      {/* ── Input + play, sobre oscuro ─────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>6 · Input y play button sobre fondo oscuro</p>
      <div className="footer-dark" style={{ background: "var(--text-dark)", padding: "50px 30px" }}>
        <h2 className="as-h4" style={{ textAlign: "center" }}>
          Suscribite a la newsletter
        </h2>
        <form
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            width: 560,
            maxWidth: "100%",
            marginInline: "auto",
            marginTop: 30,
          }}
          // Sólo especímenes: no envía nada.
          action="#"
        >
          <label className="sr-only" htmlFor="specimen-email">
            Tu correo electrónico
          </label>
          <input
            className="input"
            id="specimen-email"
            type="email"
            placeholder="Email"
            style={{ flex: 1 }}
          />
          <button className="btn" type="button">
            Enviar
          </button>
        </form>

        <p style={{ ...note, color: "var(--body-text)", textAlign: "center", marginTop: 24 }}>
          Texto de marca sobre el marrón, en <code>--body-text</code> invertido.
        </p>
        <p style={{ textAlign: "center", margin: 0 }}>
          <a href="#contenido" style={{ color: "var(--gold-ink)", fontSize: 18 }}>
            {CONTACT.whatsappDisplay}
          </a>
        </p>

        <div
          style={{
            position: "relative",
            height: 180,
            marginTop: 30,
            background: "#241a10",
          }}
        >
          <div className="play-wrap">
            <span className="play-ring" aria-hidden="true" />
            <span className="play-ring--h" aria-hidden="true" />
            <span className="play-icon" aria-hidden="true">
              ▶
            </span>
          </div>
        </div>
      </div>
      <p style={note}>
        El <code>h4</code> se renderiza como <code>&lt;h2 class=&quot;as-h4&quot;&gt;</code> para no
        saltar un nivel de encabezado (desvío D-7), y el input lleva un{" "}
        <code>&lt;label&gt;</code> oculto porque un placeholder no es una etiqueta (D-8). El anillo
        exterior del play escala de .85 a 1 al pasar el ratón, y queda quieto con reduced-motion.
      </p>

      {/* ── Reveal ─────────────────────────────────────────────────────── */}
      <hr style={rule} />
      <p style={caption}>7 · Reveal (spec §4.1)</p>
      <p style={note}>
        Sin JS, <code>.reveal</code> es plenamente visible: el estado oculto vive bajo{" "}
        <code>.js</code>, que sólo añade el script inline del <code>&lt;head&gt;</code>. Si el
        bundle falla, un failsafe de 2.5 s añade <code>.reveal-all</code> y revela todo igualmente.
        Con <code>prefers-reduced-motion: reduce</code>, el kill-switch de{" "}
        <code>99-a11y.css</code> lo desactiva por completo. El componente{" "}
        <code>&lt;Reveal&gt;</code> y su IntersectionObserver compartido llegan en la Fase 1.
      </p>
    </main>
  );
}
