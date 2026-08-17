/**
 * Blinda «Sobre nosotros»: el enlace que la hace alcanzable y el texto que dice.
 *
 * Los dos fallos que cubre ya ocurrieron:
 *
 * 1. El grupo «Sobre nosotros» del nav no llevaba `href`, y sin él `Dropdown`
 *    pinta la etiqueta como <button>: el clic abría el panel y nada más. La
 *    página respondía 200 y era inalcanzable desde su propia etiqueta del menú.
 * 2. El copy era de andamio y contaba un catálogo que ya no existe («cachitos
 *    de jamón», «asado negro»). Nada falla cuando el texto miente.
 */

import { describe, expect, it } from "vitest";
import { home } from "@/content/home";
import {
  about,
  isLeadParagraph,
  isListParagraph,
  legal,
  paragraphText,
  type FaqItem,
} from "@/content/pages";

const sobreNosotros = home.nav.dropdowns.find((d) => d.label === "Sobre nosotros");

describe("el aviso legal publica sólo el contenido aprobado", () => {
  it("retira el texto provisional y documenta la captura promocional", () => {
    const texto = JSON.stringify(legal);

    expect(texto).not.toContain("Los datos fiscales y de inscripción");
    expect(legal.sections.map((section) => section.id)).not.toContain("terceros");
    expect(legal.sections.map((section) => section.id)).toContain("promociones");
    expect(texto).toContain("24 meses");
    expect(texto).toContain("consentimiento");
    expect(legal.sections).toHaveLength(7);
  });

  /**
   * El sitio mide visitas con Vercel Web Analytics desde el 17 ago 2026, y hasta
   * ese día el aviso legal presumía de «ni analítica de terceros». Es la clase de
   * frase que sobrevive a un repaso de copy sin que nadie la mire: nada más en la
   * suite relaciona el texto legal con lo que `app/layout.tsx` monta de verdad.
   */
  it("cuenta la medición de visitas y no presume de no medir", () => {
    const cookies = legal.sections.find((section) => section.id === "cookies");
    const texto = cookies?.paragraphs.join(" ") ?? "";

    expect(texto).not.toContain("analítica de terceros");
    expect(texto).toContain("No usamos cookies");
    expect(texto).toContain("Vercel");
    expect(texto).toContain("sin cookies");
    // El carrito sigue siendo el único almacenamiento del dispositivo.
    expect(texto).toContain("almacenamiento");
  });
});

describe("el nav llega a «Sobre nosotros»", () => {
  it("el grupo del nav tiene destino propio", () => {
    expect(sobreNosotros).toBeDefined();
    expect(sobreNosotros!.href).toBe("/sobre-nosotros");
  });

  it("enumera todos los títulos en el mismo orden que la página", () => {
    expect(sobreNosotros!.items).toEqual([
      { label: "Sobre Boquita", href: "/sobre-nosotros#sobre-boquita" },
      { label: "Quién está detrás", href: "/sobre-nosotros#historia" },
      { label: "Cómo horneamos", href: "/sobre-nosotros#como-horneamos" },
      { label: "Qué hay en el catálogo", href: "/sobre-nosotros#catalogo" },
      { label: "Presentaciones", href: "/sobre-nosotros#presentaciones" },
      { label: "Para qué ocasiones", href: "/sobre-nosotros#ocasiones" },
      { label: "Pedidos y entregas", href: "/sobre-nosotros#entregas" },
      {
        label: "Preguntas frecuentes",
        href: "/sobre-nosotros#preguntas-frecuentes",
      },
      { label: "Escríbeme", href: "/sobre-nosotros#escribeme" },
    ]);
  });

  it("cada ancla que promete el nav existe en la página", () => {
    const anclas = about.sections.map((s) => s.id);
    // La cabecera, la FAQ y el cierre no salen de `sections`: la página pinta
    // sus ids de forma explícita.
    anclas.push("sobre-boquita", "preguntas-frecuentes", "escribeme");

    for (const item of sobreNosotros!.items) {
      const [ruta, ancla] = item.href.split("#");
      expect(ruta).toBe("/sobre-nosotros");
      expect(anclas, `el nav promete #${ancla} y no hay sección con ese id`).toContain(ancla);
    }
  });
});

describe("el texto es el de Ale, no el de andamio", () => {
  it("no queda rastro del catálogo salado que nunca existió", () => {
    const texto = JSON.stringify(about);
    expect(texto).not.toMatch(/asado negro|cachitos/i);
  });

  it("las secciones tienen id, titular y al menos un párrafo", () => {
    expect(about.sections.length).toBeGreaterThanOrEqual(6);
    for (const section of about.sections) {
      expect(section.id).toMatch(/^[a-z-]+$/);
      expect(section.title.length).toBeGreaterThan(3);
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it("dos párrafos de la misma sección no comparten los 30 primeros caracteres", () => {
    // La `key` de React es `paragraphText(p).slice(0, 30)`: dos iguales dan un
    // aviso de clave duplicada y un renderizado impredecible al reordenar.
    for (const section of about.sections) {
      const claves = section.paragraphs.map((p) => paragraphText(p).slice(0, 30));
      expect(new Set(claves).size, `claves duplicadas en #${section.id}`).toBe(claves.length);
    }
  });

  it("el catálogo marca sus cinco temas en negrita, cada uno con sus dos puntos", () => {
    const catalogo = about.sections.find((s) => s.id === "catalogo");
    const entradillas = catalogo!.paragraphs.filter(isLeadParagraph).map((p) => p.lead);

    // Dos puntos y no punto: la entradilla va en SU PROPIA línea (el CSS le pone
    // `display: block`) y ahí un punto se lee como frase terminada en vez de como
    // el rótulo del texto que viene debajo.
    //
    // `toEqual` y no `arrayContaining`: los temas del catálogo son estos cinco y
    // ninguno más, en este orden. Con `arrayContaining` se podía colar uno nuevo
    // —o perderse uno— sin que nada dijera una palabra. (Los rótulos de
    // #entregas son otros seis y tienen su propio test: el filtro por sección es
    // lo que mantiene los dos independientes.)
    //
    // «Salados:» va entre los postres y los personalizados: cierra lo que se
    // vende hecho antes de pasar a lo que se cotiza por encargo.
    expect(entradillas).toEqual([
      "Queques:",
      "Galletas:",
      "Postres:",
      "Salados:",
      "Queques personalizados:",
    ]);
  });

  it("la negrita y su texto casan con el único espacio que mete el render", () => {
    // El render pinta `<strong>{lead}</strong> {text}`: un solo espacio, y la
    // puntuación va en el `lead`. Hay dos formas válidas y este test las
    // distingue, porque la frontera es justo donde salen las erratas:
    //
    //   · entradilla  → «Queques.» + «Zanahoria con coco…»  (frase nueva)
    //   · frase suelta → «Puedes retirar el pedido» + «en Santa Ana…» (sigue)
    //
    // Lo que no vale: un `text` que empiece por coma o punto (sale « ,»), un
    // espacio colgando en cualquiera de los dos, o una entradilla sin punto
    // seguida de mayúscula, que son dos frases pegadas sin separación.
    for (const section of about.sections) {
      for (const paragraph of section.paragraphs) {
        // Las otras dos formas no pasan por el join de un solo espacio: el texto
        // suelto se pinta tal cual y la lista pinta un `<li>` por ítem.
        if (!isLeadParagraph(paragraph)) continue;
        const dónde = `#${section.id} · «${paragraph.lead}»`;

        expect(paragraph.lead.trim(), `espacio colgando en ${dónde}`).toBe(paragraph.lead);
        expect(paragraph.text.trim(), `espacio colgando en ${dónde}`).toBe(paragraph.text);
        expect(paragraph.text, `el texto empieza por signo en ${dónde}`).not.toMatch(/^[.,;:]/);

        const cierraFrase = /[.,:]$/.test(paragraph.lead);
        const sigueEnMinúscula = /^[a-záéíóúüñ]/.test(paragraph.text);
        expect(
          cierraFrase || sigueEnMinúscula,
          `${dónde}: la entradilla no cierra frase y el texto arranca en mayúscula`,
        ).toBe(true);
      }
    }
  });

  it("«Pedidos y entregas» va por rótulos, con los plazos como única lista", () => {
    // La sección se consulta, no se lee: quien entra busca UNA cosa —el plazo, la
    // zona, el pago— y la encuentra por el rótulo. Estuvo en viñetas de una frase
    // y el texto quedaba sangrado, desalineado del resto de la página.
    //
    // Los seis rótulos se afirman con `toEqual` y EN ORDEN porque el orden es el
    // del pedido: cómo se hace, cuánto hay que esperar, dónde se recoge, dónde se
    // lleva, cómo se paga y a qué hora llega.
    const entregas = about.sections.find((s) => s.id === "entregas");
    expect(entregas, "desapareció la sección #entregas").toBeDefined();

    const rótulos = entregas!.paragraphs.filter(isLeadParagraph).map((p) => p.lead);

    expect(rótulos).toEqual([
      "Cómo hacer tu pedido:",
      "Tiempo de anticipación:",
      "Retiro en punto de entrega:",
      "Entrega a domicilio:",
      "Formas de pago:",
      "Puntualidad:",
    ]);

    // Una sola lista, y son los dos plazos. Si aparece una segunda, alguien está
    // devolviendo la sección a viñetas por la puerta de atrás.
    const listas = entregas!.paragraphs.filter(isListParagraph);
    expect(listas, "#entregas tiene más de una lista, o ninguna").toHaveLength(1);
    expect(listas[0]!.items).toHaveLength(2);

    for (const item of listas[0]!.items) {
      expect(item.trim(), `espacio colgando en «${item}»`).toBe(item);
      // Los ítems salen del test de puntuación de arriba al no ser pares
      // `lead`/`text`, así que su forma se comprueba aquí: «tema: plazo.».
      expect(item, `el plazo no tiene la forma «tema: plazo.»: «${item}»`).toMatch(/^[^:]+: .+\.$/);
    }
  });

  it("todo el contenido editorial mantiene el tuteo y el cuerpo del cierre lo termina el enlace", () => {
    const { title, body, emailIntro } = about.closing;
    expect(title).toBe("Escríbeme");
    expect(emailIntro).toBe("También puedes escribirme a");
    expect(body).toContain("Cuéntame qué necesitas");

    // La página cierra la frase con «… está todo en @boquita_cr.»: el punto lo
    // pone el JSX DESPUÉS del enlace. Si el copy trae el suyo, sale «… en. @…».
    expect(body, "el cuerpo del cierre no puede terminar en punto").not.toMatch(/\.$/);

    const voseo = /\b(escribime|escribinos|contame|mandame|necesitás|querés|podés|mirá|sabés)\b/i;
    expect(
      [title, body, emailIntro].filter((cadena) => voseo.test(cadena)),
      "el bloque de cierre contiene formas de voseo",
    ).toEqual([]);

    const contenido = JSON.stringify({ home, about, legal });
    expect(contenido).not.toMatch(
      /\b(escribime|escribinos|contame|contanos|mandame|mandanos|necesitás|querés|podés|tenés|recibás|ingresá|marcá|avisanos|abrís|preparás|borrás|completás|solicités|suscribite|mirá|sabés)\b/i,
    );
  });

  it("ninguna respuesta de la FAQ queda pendiente de confirmar", () => {
    // Con `todo: true` el dato no está confirmado con Ale; en una FAQ eso es
    // peor que no responder, porque el JSON-LD lo publica como respuesta buena.
    const faq: FaqItem[] = about.faq;
    expect(faq.filter((item) => item.todo)).toHaveLength(0);
  });

  it("la FAQ cubre lo que la gente busca y da respuestas útiles", () => {
    expect(about.faq.length).toBeGreaterThanOrEqual(6);
    const preguntas = about.faq.map((f) => f.question).join(" ");
    expect(preguntas).toContain("anticipación");
    expect(preguntas).toContain("entregas");
    // El mismo umbral que comprueba el JSON-LD en `tests/e2e/paginas.spec.ts`.
    for (const item of about.faq) {
      expect(item.answer.length, item.question).toBeGreaterThan(40);
    }
  });

  it("la fecha de arranque es la misma que cuenta la portada", () => {
    const historia = about.sections.find((s) => s.id === "historia");
    expect(historia!.paragraphs.map(paragraphText).join(" ")).toContain("abril de 2022");
    expect(home.mediaText.body).toContain("desde 2022");
  });
});
