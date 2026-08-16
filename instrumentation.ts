/**
 * Diagnóstico temporal: qué falla de verdad en el render del servidor.
 *
 * React omite el mensaje en los builds de producción y sólo publica un `digest`
 * —`stringHash(message + stack)`—, que no se puede revertir. `onRequestError` es
 * el gancho de Next 15 que recibe el error ANTES de esa poda, así que aquí sí se
 * puede escribir el mensaje y la traza en los logs de la función.
 *
 * Motivo por el que existe: en Vercel **todo render en tiempo de petición**
 * falla —`/tienda`, que es dinámica, y las revalidaciones ISR de `/` y de las
 * fichas—, mientras que el mismo commit compilado y servido en local va bien.
 * Los digests observados el 17 ago 2026 fueron `3029784357` en `/tienda` y
 * `1120656995` en `/`.
 *
 * ⚠ Es andamio. Se retira en cuanto el fallo esté identificado: no escribe nada
 * sensible, pero un log de errores con traza completa no es sitio donde dejar
 * ruido permanente.
 */
export function register() {
  // Sin trabajo de arranque: este módulo existe sólo por `onRequestError`.
}

export const onRequestError: import("next").Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const err = error as Error & { digest?: string; cause?: unknown };

  console.error(
    "[diagnóstico] fallo de render en el servidor\n" +
      `  ruta      : ${request.path}\n` +
      `  routerKind: ${context.routerKind} · routePath: ${context.routePath} · routeType: ${context.routeType}\n` +
      `  renderMode: ${context.renderSource ?? "(sin renderSource)"}\n` +
      `  digest    : ${err.digest ?? "(sin digest)"}\n` +
      `  nombre    : ${err.name}\n` +
      `  mensaje   : ${err.message}\n` +
      `  causa     : ${err.cause ? String(err.cause) : "(sin causa)"}\n` +
      `  stack     :\n${err.stack ?? "(sin stack)"}`,
  );
};
