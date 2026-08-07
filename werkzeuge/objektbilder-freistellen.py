#!/usr/bin/env python3
"""Stellt die Objektbilder frei, beschneidet sie und rechnet sie klein.

Warum das noetig ist: Die Bilder werden mit einer flaechigen Hintergrundfarbe
erzeugt (#FFFDF9, die Kartenfarbe im Hellmodus). Die App hat aber einen
Dunkelmodus - dort staende jedes Bild als heller Kasten in der Karte. Es
braucht also einen echten Alphakanal.

Drei Schritte je Bild:

1. FREISTELLEN per Flutfuellung von den Bildraendern aus - nicht ueber
   "alle Pixel in Hintergrundfarbe". Der Unterschied ist wichtig: Der
   Heft-Umschlag ist fast weiss und die Geodreieck-Flaeche sehr blass. Eine
   reine Farbpruefung wuerde beide durchloechern. Die Flutfuellung erreicht
   nur, was von aussen zusammenhaengend erreichbar ist - also genau den
   Hintergrund.

2. BESCHNEIDEN auf das Objekt plus einen schmalen Rand. Die Generierung legt
   grosszuegig Luft um das Motiv; in einer 48-px-Anzeige bleibt vom Objekt
   sonst fast nichts uebrig.

3. VERKLEINERN auf hoechstens 512 px Kantenlaenge. Angezeigt werden die
   Bilder mit 50 bis 100 px - 1024 px waeren siebenmal so viel Datenmenge
   fuer nichts.

Einzige Abhaengigkeit: Pillow (`pip install Pillow`). Sie wird nur hier
gebraucht, nicht von der App - deshalb steht sie bewusst nicht in
package.json.

Aufruf:  python3 werkzeuge/objektbilder-freistellen.py
"""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow fehlt. Installieren mit:  pip install Pillow")

ORDNER = Path(__file__).resolve().parent.parent / "public" / "objekte"
TOLERANZ = 42          # Farbabstand, bis zu dem ein Pixel als Hintergrund gilt
RAND_ANTEIL = 0.04     # Luft um das beschnittene Objekt, als Anteil der Kantenlaenge
MAX_KANTE = 512


def ist_nah(a: tuple[int, int, int], b: tuple[int, int, int], toleranz: int) -> bool:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= toleranz


def freistellen(bild: Image.Image) -> Image.Image:
    """Macht den von aussen erreichbaren Hintergrund durchsichtig."""
    bild = bild.convert("RGBA")
    breite, hoehe = bild.size
    pixel = bild.load()

    # Referenzfarbe ist die tatsaechliche Eckfarbe, nicht die erwartete:
    # Der Generator trifft #FFFDF9 nicht immer exakt.
    hintergrund = pixel[0, 0][:3]

    besucht = bytearray(breite * hoehe)
    rand = deque()

    for x in range(breite):
        rand.append((x, 0))
        rand.append((x, hoehe - 1))
    for y in range(hoehe):
        rand.append((0, y))
        rand.append((breite - 1, y))

    while rand:
        x, y = rand.popleft()
        if not (0 <= x < breite and 0 <= y < hoehe):
            continue
        i = y * breite + x
        if besucht[i]:
            continue
        besucht[i] = 1
        if not ist_nah(pixel[x, y][:3], hintergrund, TOLERANZ):
            continue
        pixel[x, y] = (255, 255, 255, 0)
        rand.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return bild


def beschneiden(bild: Image.Image) -> Image.Image:
    kasten = bild.getbbox()
    if kasten is None:
        return bild
    links, oben, rechts, unten = kasten
    luft = round(max(rechts - links, unten - oben) * RAND_ANTEIL)
    return bild.crop(
        (
            max(0, links - luft),
            max(0, oben - luft),
            min(bild.width, rechts + luft),
            min(bild.height, unten + luft),
        )
    )


def verkleinern(bild: Image.Image) -> Image.Image:
    lang = max(bild.size)
    if lang <= MAX_KANTE:
        return bild
    faktor = MAX_KANTE / lang
    return bild.resize((round(bild.width * faktor), round(bild.height * faktor)), Image.LANCZOS)


def main() -> int:
    dateien = sorted(p for p in ORDNER.glob("*.png"))
    if not dateien:
        sys.exit(f"Keine PNG-Dateien in {ORDNER}. Erst `node werkzeuge/objektbilder-holen.mjs` laufen lassen.")

    gesamt_vorher = gesamt_nachher = 0

    for datei in dateien:
        vorher = datei.stat().st_size
        with Image.open(datei) as roh:
            bild = verkleinern(beschneiden(freistellen(roh)))
            bild.save(datei, "PNG", optimize=True)
        nachher = datei.stat().st_size
        gesamt_vorher += vorher
        gesamt_nachher += nachher
        print(
            f"✓ {datei.name:18} {bild.width:>4}×{bild.height:<4} "
            f"{vorher // 1024:>4} kB → {nachher // 1024:>3} kB"
        )

    print(
        f"\n{len(dateien)} Bilder: {gesamt_vorher // 1024} kB → {gesamt_nachher // 1024} kB "
        f"({100 - round(gesamt_nachher / gesamt_vorher * 100)} % kleiner)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
