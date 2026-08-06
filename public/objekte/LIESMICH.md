# Objektbilder

Hier liegen freigestellte Einzelbilder der Gegenstände aus dem Wortschatz.

## Wofür sie gebraucht werden

Überall dort, wo ein Gegenstand **einzeln** erscheint:

- als Bildstütze neben einer Aufgabe („Der Radiergummi ist rosa und blau. Stimmt das?“),
- als Mengenbild in der Einzahl-/Mehrzahl-Übung (dasselbe Bild zwei-, drei-, viermal nebeneinander),
- als Illustration im Hefteintrag.

**Nicht** für die Klassenzimmer-Szene. Dort muss jeder Gegenstand einzeln
ansprechbar sein – anklickbar, hervorhebbar, einrahmbar. Das leistet nur das
Vektor-SVG in `src/features/wortbild/Szene.tsx`, und dabei bleibt es.

## Einhängen

Ein Bild wird wirksam, sobald der Wortschatz-Eintrag darauf zeigt:

```ts
{
  id: 'radiergummi',
  // …
  bildQuelle: 'objekte/radiergummi.png',
}
```

Ohne `bildQuelle` zeichnet die App weiterhin die Vektorfassung. Die Bilder sind
also **optional**: Es gibt keinen Zwischenzustand, in dem etwas fehlt oder
kaputt aussieht, und Wort für Wort umstellen ist ausdrücklich vorgesehen.

## Anforderungen an die Dateien

| | |
|---|---|
| Format | PNG mit **transparentem** Hintergrund |
| Kantenlänge | höchstens 512 px, Objekt formatfüllend mit schmalem Rand |
| Dateiname | die Wortschatz-`id`, klein geschrieben: `radiergummi.png` |

Transparenz ist nicht optional: Die App hat einen Dunkelmodus. Ein Bild mit
eingebranntem hellem Hintergrund steht dort als weißer Kasten in der Karte.

Angezeigt werden die Bilder mit 50 bis 100 px. 1024 px wären also die
siebenfache Datenmenge für nichts – deshalb der Deckel bei 512 px.

## Farben sind Inhalt, nicht Geschmack

Mehrere Aufgaben fragen die Farbe ab. Diese Zuordnungen müssen stimmen,
sonst wird eine richtige Antwort als falsch angezeigt:

| Gegenstand | verbindlich | steht in |
|---|---|---|
| Radiergummi | eine Hälfte rosa, eine Hälfte blau | Aufgabe `f0` |
| Bleistift | gelb, eckig (nicht rund) | Aufgabe `m1-1` |
| Lineal | gelb | Musterzeile im Heftauftrag |
| Geodreieck | durchsichtig | Musterzeile im Heftauftrag, Wortkarte |

## Abholen

Die Zuordnung „welcher Gegenstand hat welches Bild“ steht in
[`quellen.json`](quellen.json). Sie gehört ins Repository und nicht in einen
Chatverlauf – nur so lässt sich später nachvollziehen, woher ein Bild kommt.

```
node werkzeuge/objektbilder-holen.mjs        # holt, was noch fehlt
node werkzeuge/objektbilder-holen.mjs --neu  # lädt auch Vorhandenes neu
```

Vorhandene Dateien werden **nicht** überschrieben – von Hand freigestellte
Bilder überleben also jeden weiteren Lauf.

Schlägt alles mit `HTTP 403` fehl, ist die Auslieferungsdomain in der
laufenden Umgebung gesperrt. Freizugeben ist genau:

```
d8j0ntlcm91z4.cloudfront.net   (HTTPS, Port 443)
```

## Freistellen und Beschneiden

Die Generierung liefert Bilder mit flächigem Hintergrund und viel Luft
ringsum. Beides räumt ein Skript weg:

```
pip install Pillow                                  # einmalig
python3 werkzeuge/objektbilder-freistellen.py
```

Es arbeitet **in place** über alle PNG in diesem Ordner und macht drei Dinge:
Hintergrund transparent, auf das Objekt beschneiden, auf 512 px verkleinern.
Beim ersten Durchlauf hat das die sechzehn Bilder von 6,8 MB auf 1,2 MB
gebracht.

Freigestellt wird per **Flutfüllung von den Bildrändern aus**, nicht über
„alle Pixel in Hintergrundfarbe". Der Unterschied ist wichtig: Der
Heft-Umschlag ist fast weiß und die Geodreieck-Fläche sehr blass – eine reine
Farbprüfung würde beide durchlöchern.

Das Skript ist idempotent im praktischen Sinn: Ein zweiter Lauf über bereits
freigestellte Bilder findet nichts mehr zu tun (der Rand ist schon
transparent) und verkleinert nicht weiter.

## Erzeugung

Die vorhandenen Entwürfe stammen aus Recraft V4.1 (`model_type: "utility"`,
1k, Hintergrund `#FFFDF9`) mit der Palette aus `src/styles/tokens.css`. Der
gemeinsame Stilzusatz am Ende jedes Prompts lautet:

> Clean flat illustration for a children's schoolbook, even solid fills, one
> subtle darker outline, no gradients, no shadow, no text, no lettering, no
> numerals. Single isolated object, centered, generous empty margin around it.

„no text, no lettering, no numerals“ ist nicht kosmetisch: Bildgeneratoren
schreiben auf Lineale und Geodreiecke gern erfundene Zahlen. In einem
Lernmittel für Kinder, die gerade lesen lernen, ist Pseudoschrift schlimmer
als gar keine.

Danach Hintergrund entfernen (Freisteller) und als PNG hier ablegen.
