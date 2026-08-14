# Home Cinematica

Cambios vigentes del bloque de home solicitado el 6 de agosto de 2026.

- El hero usa la foto actual como imagen full-bleed con overlay calido, blur suave
  y copy centrado.
- El statement va sobre fondo BLANCO y fusiona el bloque "Del horno de Ale a tu
  mesa" con la foto a la IZQUIERDA. (Lo fija `tests/e2e/geometry.spec.ts`. Esta
  linea decia crema y a la derecha, y llevaba tiempo siendo falsa.)
- El texto ya no usa recortes inline. El color se revela PALABRA A PALABRA con
  `components/ui/ScrollColorText.tsx` — no en 6 segmentos: una palabra no puede
  envolver, y con trozos de frase el `clip-path` cortaba el parrafo en vertical.
  El titular termina antes de que el cuerpo empiece (`TITLE_SHARE`).
- El recorrido del teñido acaba 80px ANTES del borde inferior de la cabecera fija
  (`--header-h` + `HEADER_LEAD`), no en el borde superior del viewport: la cabecera
  es `position: fixed` y tapa 101-115px, asi que ahi el texto ya se metia debajo
  con el color a medias. Con la holgura el bloque se queda un momento entero y en
  su color final antes de salir por arriba.
- La foto y la columna de texto suben JUNTAS, con el mismo `<Reveal delay={100}>` y
  la misma transicion de 0.6s. Lo que sincroniza el disparo es la geometria: a ≥992
  las dos celdas tienen el mismo borde superior y la misma altura, asi que cruzan
  el umbral del observer compartido en el mismo tick. Antes el parrafo subia por su
  cuenta en 0.95s/120ms y el titular no subia en absoluto.
- A ≥992 el texto se reparte en la ALTURA DE LA FOTO (`space-between`): el alto de
  mayuscula del titular a ras del borde superior de la foto y la linea base de la
  ultima linea del cuerpo a ras del inferior, con el medio-espacio de linea
  recortado en `styles/12-statement.css`. Reveal simple, sin desenfoque ni enfoque
  progresivo.
- Y el parrafo **LLENA** esa banda, no se queda abajo. Con 18px eran 3 lineas (97px)
  contra una banda de 158-215px, asi que `space-between` dejaba un agujero de hasta
  133px entre titular y texto. Ahora el cuerpo va a `clamp(22px, 1.8vw, 26px)` y el
  interlineado lo calcula `fitBody()` en `ScrollColorText`, repartiendo la banda
  entre las lineas REALES. Medido: hueco de 28px exactos (el `margin-top`) y linea
  base a 0px del pie de la foto, de 992 a 1920. Apilado (≤991) no aplica: no hay
  banda, y el cuerpo se queda en los 18px del spec.
- La imagen ancha del catalogo vive sobre una banda blanca; el catalogo empieza
  debajo sobre crema para alternar fondos entre secciones.
- La seccion inferior de media ya no se renderiza, para evitar duplicar el mismo
  contenido. El play, iframe y lightbox de video siguen fuera de la home.
- El footer visible queda como cierre editorial de 4 columnas; la newsletter
  queda fuera del render mientras no tenga backend real.
- El lightbox de portada queda dedicado a la galeria.
