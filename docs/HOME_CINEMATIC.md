# Home Cinematica

Cambios vigentes del bloque de home solicitado el 6 de agosto de 2026.

- El hero usa la foto actual como imagen full-bleed con overlay calido, blur suave
  y copy centrado.
- El statement usa el fondo crema del catalogo y fusiona el bloque "Del horno
  de Ale a tu mesa" con foto a la derecha.
- El texto ya no usa recortes inline. El color se revela en 6 segmentos
  estrictamente secuenciales con `components/ui/ScrollColorText.tsx`: una linea
  termina antes de que empiece la siguiente, y el ultimo segmento llega a 100%
  cuando el texto toca el borde superior del viewport.
- La foto del statement aparece con reveal simple, sin desenfoque ni enfoque
  progresivo.
- La imagen ancha del catalogo vive sobre una banda blanca; el catalogo empieza
  debajo sobre crema para alternar fondos entre secciones.
- La seccion inferior de media ya no se renderiza, para evitar duplicar el mismo
  contenido. El play, iframe y lightbox de video siguen fuera de la home.
- El footer visible queda como cierre editorial de 4 columnas; la newsletter
  queda fuera del render mientras no tenga backend real.
- El lightbox de portada queda dedicado a la galeria.
