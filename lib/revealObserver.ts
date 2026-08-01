/**
 * Un ÚNICO IntersectionObserver compartido por los ~30 nodos que se revelan al
 * hacer scroll (spec §4.1).
 *
 * Un observer por componente serían 30 observers y 30 juegos de callbacks para
 * un efecto que sólo añade una clase. Uno compartido a nivel de módulo cuesta
 * lo mismo que uno solo.
 *
 * `threshold: 0.15` y disparo único, como pide el spec. El `rootMargin` negativo
 * abajo evita que un elemento se revele cuando apenas asoma un píxel por el
 * borde inferior.
 */

type Callback = (element: Element) => void;

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, Callback>();

function getObserver(): IntersectionObserver {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.(entry.target);
        // Disparo único: se deja de observar en cuanto se revela.
        observer?.unobserve(entry.target);
        callbacks.delete(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
  );

  return observer;
}

/**
 * Observa un elemento hasta que entre en pantalla, una sola vez.
 * Devuelve una función de limpieza.
 *
 * Si el navegador no tiene IntersectionObserver, revela de inmediato: mejor
 * contenido visible sin animación que contenido invisible.
 */
export function observeOnce(element: Element, callback: Callback): () => void {
  if (typeof IntersectionObserver === "undefined") {
    callback(element);
    return () => {};
  }

  callbacks.set(element, callback);
  getObserver().observe(element);

  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}
