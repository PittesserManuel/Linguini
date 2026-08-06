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
| Kantenlänge | 1024 px, Objekt zentriert mit etwas Luft am Rand |
| Dateiname | die Wortschatz-`id`, klein geschrieben: `radiergummi.png` |

Transparenz ist nicht optional: Die App hat einen Dunkelmodus. Ein Bild mit
eingebranntem hellem Hintergrund steht dort als weißer Kasten in der Karte.

## Farben sind Inhalt, nicht Geschmack

Mehrere Aufgaben fragen die Farbe ab. Diese Zuordnungen müssen stimmen,
sonst wird eine richtige Antwort als falsch angezeigt:

| Gegenstand | verbindlich | steht in |
|---|---|---|
| Radiergummi | eine Hälfte rosa, eine Hälfte blau | Aufgabe `f0` |
| Bleistift | gelb, eckig (nicht rund) | Aufgabe `m1-1` |
| Lineal | gelb | Musterzeile im Heftauftrag |
| Geodreieck | durchsichtig | Musterzeile im Heftauftrag, Wortkarte |

## Erzeugung

Die vorhandenen Entwürfe stammen aus Recraft V4.1 (`model_type: "utility"`,
1k, Hintergrund `#FFFDF9`) mit der Palette aus `src/styles/tokens.css`. Der
gemeinsame Stilzusatz am Ende jedes Prompts lautet:

> Clean flat illustration for a children's schoolbook, even solid fills, one
> subtle darker outline, no gradients, no shadow, no text, no lettering, no
> numerals. Single isolated object, centered, generous empty margin around it.

Danach Hintergrund entfernen (Freisteller) und als PNG hier ablegen.
