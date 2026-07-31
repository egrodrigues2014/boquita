#!/usr/bin/env python3
"""
Extrae las fotos de producto del PDF del inventario de Instagram.

Por qué existe este script en vez de usar pdfimages/poppler:
  · poppler, PyMuPDF y pypdf NO están instalados y no se quiere añadir
    dependencias de sistema al proyecto.
  · No hace falta: el PDF es un "print to PDF" de Chrome (Skia/PDF m150), así
    que no tiene /Encrypt, ni /ObjStm, ni streams /XRef. Los objetos son dicts
    planos `N 0 obj` y las imágenes son XObjects con /Filter /DCTDecode.
  · Un stream DCTDecode *es* un JPEG baseline completo, byte a byte. No hay que
    decodificar nada: se recorta del PDF y ya es un .jpg válido.

Sólo necesita la stdlib. Pillow es opcional pero recomendable: si está, verifica
que el recorte fue exacto comparando las dimensiones decodificadas con las que
declara el diccionario del objeto. Ese assert es la prueba de integridad.

Además empareja cada imagen con su publicación de Instagram, de modo que la
auditoría de derechos que exige docs/CONTENT_TODO.md sea barata.

Cómo se empareja (y por qué NO por proximidad de bytes):
  La primera versión de este script buscaba el /URI más cercano en el archivo.
  Eso está mal: las imágenes viven en el diccionario de recursos de la página y
  las anotaciones en su array /Annots, así que la distancia en bytes no
  correlaciona. El resultado era que las 4 imágenes de una página recibían el
  mismo permalink (27 de 37 mal emparejadas).

  El método correcto es POSICIONAL, por página. Chrome emite una parrilla 2×2
  por página: 4 XObjects de imagen y 4 anotaciones /Link, y el array /Annots
  está en orden del DOM, que es el orden de lectura de la parrilla. Basta
  ordenar los objetos de imagen de la página por número y hacer zip con el
  array /Annots tal cual.

  Ojo: NO ordenar las anotaciones por su /Rect. El /Rect es del enlace del pie
  de foto, y su altura depende de en cuántas líneas envolvió el texto, no de la
  fila de la parrilla. Ordenar por geometría invierte pares (verificado: rompe
  5 de las 10 páginas).

  Validado contra la identificación visual de las 37 fotos: 37/37 exactas.

Uso:
    npm run images:extract
    python scripts/extract-pdf-images.py [--pdf RUTA] [--out DIR] [--force]
    python scripts/extract-pdf-images.py --verify     # sólo imprime el emparejamiento

Salida:
    assets/raw/ig-NN-objOBJ.jpg   (una por imagen, numeradas por orden de aparición)
    assets/raw/manifest.json      (dimensiones, ratio, bytes, permalink, slots sugeridos)

assets/ está en .gitignore: los originales no entran al repositorio. Sólo se
versionan los derivados que genera scripts/build-images.mjs.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = REPO_ROOT / "assets" / "instagram-boquitacostarica.pdf"
DEFAULT_OUT = REPO_ROOT / "assets" / "raw"

JPEG_SOI = b"\xff\xd8\xff"
JPEG_EOI = b"\xff\xd9"

# `N G obj <<...>> stream\r?\n` — el dict se limita a 600 bytes porque los
# diccionarios de imagen de Skia son cortos; así el regex no se desborda a
# streams de contenido enormes.
OBJ_RE = re.compile(rb"(\d+)\s+(\d+)\s+obj(.{0,600}?)stream\r?\n", re.DOTALL)

# Anotaciones de enlace: /URI (https://www.instagram.com/p/<id>/)
URI_RE = re.compile(rb"/URI\s*\(\s*(https?://[^)\s]+)\s*\)")

# Índice de objetos y estructura de página
OBJ_HEAD_RE = re.compile(rb"(\d+)\s+(\d+)\s+obj\b")
PAGE_TYPE_RE = re.compile(rb"/Type\s*/Page\b")
XOBJECT_RE = re.compile(rb"/XObject\s*<<(.*?)>>", re.DOTALL)
XOBJECT_REF_RE = re.compile(rb"/\w+\s+(\d+)\s+0\s+R")
ANNOTS_RE = re.compile(rb"/Annots\s*\[([^\]]*)\]")
INDIRECT_REF_RE = re.compile(rb"(\d+)\s+0\s+R")
IMAGE_SUBTYPE_RE = re.compile(rb"/Subtype\s*/Image")

INT_RE = {
    "width": re.compile(rb"/Width\s+(\d+)"),
    "height": re.compile(rb"/Height\s+(\d+)"),
}


@dataclass
class Extracted:
    """Una imagen recortada del PDF, con su procedencia."""

    file: str
    obj: int
    width: int
    height: int
    ratio: float
    bytes: int
    permalink: str | None
    suggested_slots: list[str]
    verified_with_pillow: bool


def suggest_slots(width: int, height: int) -> list[str]:
    """
    Qué slots del layout puede alimentar esta foto, según su proporción.

    Las medidas objetivo salen del inventario de assets del spec §7. Es una
    sugerencia para agilizar la curación manual, no una asignación: decidir cuál
    es el queque de zanahoria y cuál los cachitos requiere ojos, y el PDF no
    trae los textos de las publicaciones (verificado: los únicos streams de
    texto descomprimibles son programas de fuentes TrueType).
    """
    ratio = width / height
    slots: list[str] = []

    # hero: retrato 3:4 (0.75) o más alto, mínimo 1000px de alto
    if ratio <= 0.85 and height >= 1000:
        slots.append("hero")
    # service: retrato suave, ratio ≈0.87
    if 0.78 <= ratio <= 0.95:
        slots.append("service")
    # gallery: 4:3 (1.333)
    if 1.15 <= ratio <= 1.55:
        slots.append("gallery")
    # media: horizontal ≈5:3 (1.667)
    if 1.45 <= ratio <= 1.85:
        slots.append("media")
    # cta: 1.5:1
    if 1.35 <= ratio <= 1.70:
        slots.append("cta")
    # wide: panorámica 2.9:1 — ninguna fuente la cumple de forma nativa, hay que
    # recortar en vertical y se pierde densidad. Ver docs/CONTENT_TODO.md.
    if ratio >= 1.30:
        slots.append("wide(recorte)")
    # los recortes inline y las fichas de producto aceptan cualquier cosa
    slots.append("producto")

    return slots


def carve_images(data: bytes) -> list[tuple[int, int, bytes, int]]:
    """
    Devuelve (num_objeto, offset, jpeg_bytes, offset_fin) por cada XObject
    /DCTDecode del PDF.
    """
    out: list[tuple[int, int, bytes, int]] = []

    for match in OBJ_RE.finditer(data):
        obj_num = int(match.group(1))
        header = match.group(3)

        if b"/Subtype" not in header or b"/Image" not in header:
            continue
        if b"/DCTDecode" not in header:
            # JPXDecode (JPEG 2000) o Flate necesitarían decodificar de verdad.
            # Verificado: este PDF no tiene ninguno. Si algún día apareciera,
            # el resumen final lo delataría por descuadre de conteo.
            continue

        start = match.end()
        end = data.find(b"endstream", start)
        if end == -1:
            print(f"  ⚠ objeto {obj_num}: no se encontró endstream, se omite", file=sys.stderr)
            continue

        blob = data[start:end].rstrip(b"\r\n")
        out.append((obj_num, start, blob, end))

    return out


def index_objects(data: bytes) -> dict[int, tuple[int, int]]:
    """num_objeto -> (inicio del cuerpo, offset de su `endobj`)."""
    index: dict[int, tuple[int, int]] = {}
    for m in OBJ_HEAD_RE.finditer(data):
        index[int(m.group(1))] = (m.end(), data.find(b"endobj", m.end()))
    return index


def map_permalinks_by_page(
    data: bytes, index: dict[int, tuple[int, int]]
) -> tuple[dict[int, str], list[str]]:
    """
    Empareja cada objeto de imagen con su permalink de Instagram, por posición
    dentro de su página.

    Devuelve (mapa obj->url, avisos). Si en una página los conteos de imágenes y
    de anotaciones no coinciden, esa página se salta y se registra el aviso: es
    mejor no tener permalink que tener uno inventado.
    """
    def body(num: int) -> bytes:
        start, end = index[num]
        return data[start:end]

    image_objs = {
        num
        for num in index
        if IMAGE_SUBTYPE_RE.search(body(num)) and b"/DCTDecode" in body(num)
    }
    page_objs = sorted(num for num in index if PAGE_TYPE_RE.search(body(num)))

    mapping: dict[int, str] = {}
    warnings: list[str] = []

    for page in page_objs:
        page_body = body(page)

        # Imágenes de la página, ordenadas por número de objeto. Chrome las emite
        # en orden de lectura de la parrilla (X8, X9, X10, X11 → objetos 8..11).
        xobj = XOBJECT_RE.search(page_body)
        refs = (
            [int(r) for r in XOBJECT_REF_RE.findall(xobj.group(1))] if xobj else []
        )
        images = sorted(r for r in refs if r in image_objs)

        # Anotaciones EN EL ORDEN DEL ARRAY. No ordenar por /Rect (ver docstring).
        annots = ANNOTS_RE.search(page_body)
        urls: list[str] = []
        for ref in [int(r) for r in INDIRECT_REF_RE.findall(annots.group(1))] if annots else []:
            if ref not in index:
                continue
            uri = URI_RE.search(body(ref))
            if not uri:
                continue
            url = uri.group(1).decode("ascii", errors="replace")
            if "instagram.com/p/" in url:
                urls.append(url)

        if not images:
            continue
        if len(images) != len(urls):
            warnings.append(
                f"página obj {page}: {len(images)} imágenes vs {len(urls)} enlaces "
                f"→ sin permalink para {images}"
            )
            continue

        mapping.update(zip(images, urls))

    return mapping, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--force", action="store_true", help="sobrescribe la salida existente")
    parser.add_argument(
        "--verify",
        action="store_true",
        help="sólo imprime el emparejamiento imagen→permalink, sin escribir nada",
    )
    args = parser.parse_args()

    if not args.pdf.is_file():
        print(f"✗ No se encontró el PDF: {args.pdf}", file=sys.stderr)
        return 1

    if not args.verify:
        if args.out.exists() and any(args.out.iterdir()) and not args.force:
            print(f"✗ {args.out} ya tiene contenido. Usá --force para sobrescribir.", file=sys.stderr)
            return 1
        args.out.mkdir(parents=True, exist_ok=True)

    try:
        from PIL import Image  # type: ignore[import-not-found]

        have_pillow = True
    except ImportError:
        Image = None  # type: ignore[assignment]
        have_pillow = False
        print("⚠ Pillow no está instalado: no se verificarán las dimensiones.\n", file=sys.stderr)

    data = args.pdf.read_bytes()
    print(f"PDF: {args.pdf.name} ({len(data):,} bytes)")

    # Aviso temprano si el PDF no tiene la forma que este script asume.
    if b"/Encrypt" in data:
        print("✗ El PDF está cifrado; este script no lo soporta.", file=sys.stderr)
        return 1
    if b"/ObjStm" in data:
        print("⚠ El PDF tiene object streams: puede que falten imágenes.", file=sys.stderr)

    images = carve_images(data)
    obj_index = index_objects(data)
    permalinks, pairing_warnings = map_permalinks_by_page(data, obj_index)

    print(
        f"Encontrados: {len(images)} XObjects /DCTDecode · "
        f"{len(permalinks)} emparejados con su publicación\n"
    )
    for warning in pairing_warnings:
        print(f"  ⚠ {warning}", file=sys.stderr)

    if not images:
        print("✗ No se extrajo ninguna imagen. ¿Cambió la estructura del PDF?", file=sys.stderr)
        return 1

    if args.verify:
        print(f"{'#':>3}  {'obj':>4}  {'archivo':<20}  publicación")
        for i, (obj_num, _off, _blob, _end) in enumerate(images, start=1):
            url = permalinks.get(obj_num)
            post = url.rsplit("/p/", 1)[-1].strip("/") if url else "— sin emparejar —"
            print(f"{i:>3}  {obj_num:>4}  {f'ig-{i:02d}-obj{obj_num}.jpg':<20}  {post}")
        missing = sum(1 for o, *_ in ((i[0],) for i in images) if o not in permalinks)
        print(f"\n{len(images) - missing}/{len(images)} con permalink")
        return 0 if missing == 0 else 2

    records: list[Extracted] = []
    failures = 0

    for index, (obj_num, offset, blob, _end) in enumerate(images, start=1):
        name = f"ig-{index:02d}-obj{obj_num}.jpg"
        path = args.out / name

        if not blob.startswith(JPEG_SOI):
            print(f"  ✗ {name}: no empieza con SOI (FF D8 FF), se omite", file=sys.stderr)
            failures += 1
            continue
        if not blob.endswith(JPEG_EOI):
            print(f"  ⚠ {name}: no termina con EOI (FF D9); puede estar truncado", file=sys.stderr)

        declared_w = INT_RE["width"].search(data, offset - 600, offset)
        declared_h = INT_RE["height"].search(data, offset - 600, offset)
        width = int(declared_w.group(1)) if declared_w else 0
        height = int(declared_h.group(1)) if declared_h else 0

        verified = False
        if have_pillow:
            import io

            try:
                with Image.open(io.BytesIO(blob)) as im:  # type: ignore[union-attr]
                    im.load()
                    real_w, real_h = im.size
                # La prueba de integridad: si el recorte se pasó o se quedó corto,
                # las dimensiones decodificadas no coincidirían con las declaradas.
                if width and height and (real_w, real_h) != (width, height):
                    print(
                        f"  ✗ {name}: el dict declara {width}×{height} pero decodifica "
                        f"{real_w}×{real_h} — recorte incorrecto",
                        file=sys.stderr,
                    )
                    failures += 1
                    continue
                width, height = real_w, real_h
                verified = True
            except Exception as exc:  # noqa: BLE001 — cualquier fallo de decodificación es fatal aquí
                print(f"  ✗ {name}: Pillow no pudo decodificar ({exc})", file=sys.stderr)
                failures += 1
                continue

        if not width or not height:
            print(f"  ✗ {name}: sin dimensiones, se omite", file=sys.stderr)
            failures += 1
            continue

        path.write_bytes(blob)

        records.append(
            Extracted(
                file=name,
                obj=obj_num,
                width=width,
                height=height,
                ratio=round(width / height, 4),
                bytes=len(blob),
                permalink=permalinks.get(obj_num),
                suggested_slots=suggest_slots(width, height),
                verified_with_pillow=verified,
            )
        )

    manifest = {
        "source": args.pdf.name,
        "extracted": len(records),
        "failures": failures,
        "note": (
            "Fotos extraídas del PDF del inventario de Instagram de @boquitacostarica. "
            "El PDF NO contiene los textos de las publicaciones, así que el copy del sitio "
            "es placeholder (ver docs/CONTENT_TODO.md). Techo de resolución: 1440px de ancho. "
            "suggested_slots es una pista por proporción, no una asignación: la curación "
            "va en docs/IMAGE_MAP.md."
        ),
        "permalink_method": (
            "Posicional por página: los objetos de imagen de cada página, ordenados por "
            "número, se cruzan con su array /Annots en el orden del array. Validado contra "
            "la identificación visual de las 37 fotos: 37/37 exactas. NO se ordena por "
            "/Rect — es el rect del enlace del pie de foto y su altura depende del "
            "envolvimiento del texto, no de la fila de la parrilla."
        ),
        "images": [asdict(r) for r in records],
    }
    (args.out / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf8"
    )

    # ── Resumen ────────────────────────────────────────────────────────────
    print(f"✓ Extraídas {len(records)} imágenes en {args.out.relative_to(REPO_ROOT)}")
    if failures:
        print(f"⚠ {failures} fallos (ver arriba)")

    by_size: dict[tuple[int, int], int] = {}
    for r in records:
        by_size[(r.width, r.height)] = by_size.get((r.width, r.height), 0) + 1

    print("\nInventario de resoluciones:")
    print(f"  {'n':>3}  {'píxeles':>12}  {'ratio':>6}")
    for (w, h), count in sorted(by_size.items(), key=lambda kv: -kv[1]):
        print(f"  {count:>3}  {f'{w}×{h}':>12}  {w / h:>6.2f}")

    with_link = sum(1 for r in records if r.permalink)
    print(f"\nProcedencia: {with_link}/{len(records)} con permalink de Instagram")
    max_width = max((r.width for r in records), default=0)
    print(f"Ancho máximo disponible: {max_width}px", end="")
    if max_width < 2340:
        print(" → insuficiente para el slot panorámico a 2× (ver docs/CONTENT_TODO.md)")
    else:
        print()

    print("\nSiguiente paso: curar assets/raw/ a mano y escribir docs/IMAGE_MAP.md")
    return 0 if failures == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
