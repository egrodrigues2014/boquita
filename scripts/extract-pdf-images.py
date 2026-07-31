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

Además empareja cada imagen con la anotación /Link que la acompaña, de modo que
cada foto queda trazada a su publicación de Instagram. Eso hace barata la
auditoría de derechos que exige docs/CONTENT_TODO.md.

Uso:
    npm run images:extract
    python scripts/extract-pdf-images.py [--pdf RUTA] [--out DIR] [--force]

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


def find_permalinks(data: bytes) -> list[tuple[int, str]]:
    """Devuelve (offset, url) de cada anotación /Link a una publicación de Instagram."""
    found: list[tuple[int, str]] = []
    for m in URI_RE.finditer(data):
        url = m.group(1).decode("ascii", errors="replace")
        if "instagram.com/p/" in url:
            found.append((m.start(), url))
    return found


def pair_permalink(image_offset: int, links: list[tuple[int, str]]) -> str | None:
    """
    Empareja una imagen con el permalink más cercano por offset de bytes.

    En un print de Chrome, la anotación de enlace de cada celda de la parrilla se
    escribe junto a su imagen, así que la proximidad en el archivo es un
    emparejamiento fiable. Se prefiere el enlace siguiente y, si no hay, el
    anterior más cercano.
    """
    after = [(off, url) for off, url in links if off >= image_offset]
    if after:
        return min(after, key=lambda t: t[0] - image_offset)[1]
    before = [(off, url) for off, url in links if off < image_offset]
    if before:
        return max(before, key=lambda t: t[0])[1]
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--force", action="store_true", help="sobrescribe la salida existente")
    args = parser.parse_args()

    if not args.pdf.is_file():
        print(f"✗ No se encontró el PDF: {args.pdf}", file=sys.stderr)
        return 1

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
    links = find_permalinks(data)
    print(f"Encontrados: {len(images)} XObjects /DCTDecode · {len(links)} enlaces a Instagram\n")

    if not images:
        print("✗ No se extrajo ninguna imagen. ¿Cambió la estructura del PDF?", file=sys.stderr)
        return 1

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
                permalink=pair_permalink(offset, links),
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
            "manual va en docs/IMAGE_MAP.md."
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
