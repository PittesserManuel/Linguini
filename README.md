# Linguini

Linguini ist die Demo einer Lernplattform für **Deutsch als Zweitsprache (DaZ)**.
Zielgruppe sind Kinder von 9 bis 11 Jahren (Klasse 3/4), die kein Deutsch als
Erstsprache sprechen, auf Niveau **A2**. Ein zweites, gleichrangiges Publikum
sind Lehrkräfte und Eltern: Die App soll als seriöses Lernmittel lesbar sein,
nicht als Spielzeug.

Diese Demo enthält ein Modul: **„Im Klassenzimmer“** – sieben Lernwörter mit
Artikel, ein kurzer Lesetext („Malas erster Tag“) und sieben dazu gestufte
Aufgaben. Inhalte sind in dieser Plattform **Daten**, keine Komponenten
(siehe `src/content/types.ts`): Ein zweites Modul wäre eine neue Datei in
`src/content/`, kein Umbau der Oberfläche.

Die Begründung jeder didaktischen Entscheidung im Detail steht in
[`docs/DIDAKTIK.md`](docs/DIDAKTIK.md), der Weg zu einer späteren
KI-Bewertung in [`docs/KI-ANBINDUNG.md`](docs/KI-ANBINDUNG.md). Dieses
Dokument fasst beides zusammen und ergänzt die technische Seite.

---

## Schnellstart

Voraussetzung: Node 22.

```bash
npm install
npm run dev      # Entwicklungsserver, http://localhost:5173
npm test         # Tests der Korrektur-Engine (Vitest)
```

Weitere Skripte: `npm run build` (Typprüfung + Produktionsbuild),
`npm run typecheck` (nur Typen), `npm run preview` (gebautes Ergebnis lokal
ansehen).

---

## Didaktische Entscheidungen – Kurzfassung

Jede Entscheidung hier ist bewusst und steht ausführlicher in
[`docs/DIDAKTIK.md`](docs/DIDAKTIK.md).

- **7 Lernwörter statt 15.** Das Bild zeigt 15 beschriftete Gegenstände,
  geprüft werden nur 7. Das Arbeitsgedächtnis von Kindern dieses Alters
  verarbeitet vier bis sieben neue Einheiten gleichzeitig (Miller 1956;
  Cognitive Load Theory). Die restlichen acht Wörter geben der Szene und dem
  Lesetext Kontext, ohne das Arbeitsgedächtnis zu belasten.
- **Artikel-Farbkodierung blau/rot/grün plus Formcodierung.** *der* = blau/Kreis,
  *die* = rot/Raute, *das* = grün/Quadrat. Der ausgeschriebene Artikel steht
  dabei immer zusätzlich als Text – Farbe ist nach WCAG 1.4.1 nie der einzige
  Informationsträger, und rund acht Prozent der Jungen haben eine
  Rot-Grün-Sehschwäche.
- **Kurze Sätze für A2** (Ø 6,9 Wörter/Satz, nur Präsens, wenige Konnektoren).
  Die Bildungsstandards nennen für Klasse 4 durchschnittlich 13–15 Wörter pro
  Satz – das gilt für Deutsch als Erstsprache. Für A2-Lernende ist das zu
  lang; die Anspruchssteigerung passiert über die Aufgaben, nicht über den
  Satzbau.
- **„Steht nicht im Text“ als dritte Option** bei der Richtig/Falsch-Aufgabe.
  Bei zwei Optionen liegt die Ratewahrscheinlichkeit bei 50 %. Die dritte
  Option trainiert zusätzlich eine Unterscheidung, die weit über den
  Deutschunterricht hinausreicht: Steht das wirklich da, oder nehme ich es
  nur an?
- **Bewusster Verzicht auf Punkte, Sterne und Streaks.** Belohnungssysteme für
  eine Tätigkeit, die aus sich heraus interessant ist, untergraben die
  intrinsische Motivation (Überrechtfertigungseffekt, Deci & Ryan).
  Ranglisten beschämen im Schulkontext zuverlässig die Kinder, die die
  Förderung am nötigsten haben. Rückmeldung erfolgt stattdessen über
  Fortschritt an der Sache („5 von 7 Wörtern gefunden“).

---

## Wie die deterministische Korrektur funktioniert

Alle Bewertung läuft über das `Grader`-Interface (`src/grading/types.ts`).
Heute steckt dahinter reine, nachvollziehbare Logik:

1. **Normalisierung** (`src/grading/normalize.ts`) – Leerraum, Groß-/Kleinschreibung
   je nach Vergleichsfall, Umlaute optional gefaltet.
2. **Damerau-Levenshtein-Distanz** (`src/grading/distance.ts`) für die
   Rechtschreibtoleranz. Damerau- statt reines Levenshtein, weil der
   häufigste Kinder-Tippfehler ein Buchstabendreher ist („Shcere“ statt
   „Schere“) – das zählt hier als eine Operation, nicht als zwei.
3. Eine **längenabhängige Schwelle**, absichtlich streng bei kurzen Wörtern:
   Bei drei Buchstaben würde Distanz 1 sonst „der“ mit „die“ verwechseln –
   fachlich fatal, weil ein Genusfehler dann fälschlich als „fast richtig“
   durchgehen würde.

| Wortlänge   | Erlaubte Distanz |
| ----------- | ----------------- |
| ≤ 3 Zeichen | 0 |
| 4–6 Zeichen | 1 |
| 7–10 Zeichen | 1 |
| > 10 Zeichen | 2 |

Zusätzlich gilt eine Plausibilitätsregel: Eine eingefügte, zusätzliche
Buchstabe wird nur toleriert, wenn sie einen Nachbarn verdoppelt (z. B. das
zweite „e“ in „Scheere“) – eine beliebige eingefügte Buchstabe wird nicht
toleriert, weil daraus zufällig ein anderes echtes Wort entstehen kann
(„Schwere“ statt „Schere“). Im Zweifel lieber ein „fast“ zu wenig als ein
falsches „richtig“.

Jede Bewertung ist dreistufig (`richtig` / `fast` / `falsch`) statt
zweistufig: „fast“ ist der pädagogisch wichtigste Zustand – das Kind hat die
Sache verstanden und nur die Schreibung oder den Artikel verfehlt. Jede
Fehlantwort trägt zusätzlich eine **Fehlerart** (Genus, Rechtschreibung,
Wortwahl, Textverständnis, …) – das ist die eigentliche diagnostische Währung
für den Lehrkraft-Bereich, nicht eine Prozentzahl.

---

## Wo die KI später andockt

Ausführlich in [`docs/KI-ANBINDUNG.md`](docs/KI-ANBINDUNG.md). Kurzfassung:

Das `Grader`-Interface (`src/grading/types.ts`) ist die einzige Nahtstelle,
über die jede Bewertung läuft. `bewerte()` ist **bewusst bereits async**,
obwohl die deterministischen Grader sofort auflösen (`Promise.resolve`).
Der Grund: Ein späterer Umbau von synchron auf asynchron wäre ein Umbau durch
die gesamte Komponentenschicht gewesen. Weil die Schnittstelle das von Tag 1
vorwegnimmt, kann ein `KiGrader` (Entwurf in `src/grading/ki-grader.ts`)
dasselbe Interface implementieren und über einen eigenen Server-Endpunkt
bewerten – ohne dass eine einzige UI-Komponente angefasst werden muss.

Was eine KI sinnvoll ergänzen würde: freie Schreibaufgaben und Begründungen,
für die es keine Musterlösung gibt – genau deshalb fehlen solche Aufgaben in
dieser Demo noch. Was bewusst deterministisch bleibt: Wortschatz und Artikel
(`der`/`die`/`das`). Das Genus ist ein Faktum, kein Ermessen, und es ist der
Wert, auf dem die gesamte Fehlerdiagnostik für die Lehrkraft aufbaut. Eine
Lehrkraft muss einem Kind und dessen Eltern erklären können, warum eine
Antwort als falsch gewertet wurde – „das Modell hat es so eingeschätzt“ ist
keine Erklärung. Deshalb bleibt die KI-Bewertung, sobald sie kommt, hinter
einem Schalter, der standardmäßig aus ist: Freitext, der an eine externe
Schnittstelle geht, ist Auftragsverarbeitung personenbezogener Daten von
Minderjährigen.

---

## Barrierefreiheit

Seit dem 28. Juni 2025 gilt das Barrierefreiheitsstärkungsgesetz; für
Schulsoftware sind BITV 2.0 und EN 301 549 damit verbindlich. Umgesetzt:

- Vollständige Tastaturbedienung, sichtbarer Fokusring (`var(--fokus-breite)`),
  kein Drag-and-Drop.
- Farbe ist nie der einzige Informationsträger – siehe Artikel-Farbkodierung
  oben.
- Tippziele mindestens 48 × 48 px (`var(--ziel-min)`).
- Rückmeldungen in `aria-live="polite"`-Regionen; nach dem Auswerten wird der
  Fokus sinnvoll gesetzt.
- Semantisches HTML durchgehend: `button`, `fieldset`/`legend`, `ol`/`ul`,
  `details`/`summary` statt eigens nachgebauter Steuerelemente – keine
  div-Buttons.
- `prefers-reduced-motion` wird respektiert (`var(--tempo)` fällt auf 1 ms).
- Kein Zoom-Sperre, kein Emoji, keine Icons ohne Textlabel.
- Kontrastwerte sind in `src/styles/tokens.css` einzeln gegen WCAG 2.2 AA
  (4,5:1) dokumentiert. Eine Ausnahme: Die dort für die Fußzeile
  vorgeschlagene Kombination `--f-dunkel`/`--t-invers` fällt im Dunkelmodus
  auf rund 1,1:1 – praktisch unlesbar. `src/app.css` verwendet für die
  Fußzeile deshalb bewusst die andernorts als AA-geprüft ausgewiesene
  Kombination `--f-karte-tief`/`--t-normal` statt dieses Tokenpaars.

---

## Datenschutz

Es werden keine personenbezogenen Daten erhoben: kein Konto, kein Name, keine
Cookies, keine Analysedienste. Der Lernstand (`src/state/types.ts`) enthält
ausschließlich Aufgaben-IDs, Fehlerarten und einen Sitzungsbeginn – keine
Namen, keine Geräte-ID, keine Zeitstempel je Antwort.

Er liegt ausschließlich im Browser und wird **nur nach ausdrücklicher
Aktivierung** in `localStorage` gespeichert (Schalter in der Fußzeile,
Voreinstellung: aus) und ist mit einem Klick löschbar. Das ist kein Verzicht,
sondern ein Verkaufsargument: Eine Schule kann die Demo ohne
Auftragsverarbeitungsvertrag und ohne Elterneinwilligung einsetzen.

---

## Projektstruktur

```
Linguini/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Shell: Ansichten, Fehlergrenze
│   ├── app.css                    # Layout der Shell (Tokens only)
│   ├── components/
│   │   ├── Kopfzeile.tsx          # Marke, Reiter, Niveaustufen-Wahl
│   │   ├── Fusszeile.tsx          # Speichern-Schalter, Lernstand löschen
│   │   └── Start.tsx              # Startseite
│   ├── content/
│   │   ├── types.ts               # Datenmodell der Lerninhalte
│   │   └── modul-klassenzimmer.ts # Das Demo-Modul (Wortschatz, Text, Aufgaben)
│   ├── features/
│   │   ├── wortbild/              # Bild-Wort-Lernteil
│   │   ├── lesen/                 # Lesetext + Aufgabenlauf
│   │   └── lehrkraft/             # Lehrkraft- und Elternbereich
│   ├── grading/
│   │   ├── types.ts               # Grader-Interface, GraderErgebnis
│   │   ├── graders.ts             # Die sechs deterministischen Grader
│   │   ├── normalize.ts, distance.ts
│   │   └── ki-grader.ts           # Entwurf einer spaeteren KI-Anbindung
│   ├── state/
│   │   ├── types.ts               # Lernstand, Auswertung
│   │   └── lernstand.ts           # useLernstand-Hook (useReducer + Persistenz)
│   └── styles/
│       ├── tokens.css             # Alle Design-Tokens
│       ├── base.css                # Reset, Grundschrift, Fokus, Skip-Link
│       └── komponenten.css        # Karte, Knopf, Marke, Melde, Reiter, …
├── docs/
│   ├── DIDAKTIK.md                # Ausfuehrliche didaktische Begruendung
│   └── KI-ANBINDUNG.md            # Ausfuehrlicher KI-Anbindungsplan
└── .github/workflows/ci.yml       # Typen, Tests, Build
```

---

## Bekannte Grenzen der Demo

- **Nur ein Modul.** Spaced Repetition über mehrere Tage – nach der Forschung
  entscheidend für Behalten – ist damit nicht abgebildet.
- **Kein Backend, kein Mehrbenutzerbetrieb, keine Klassenverwaltung.** Der
  Lernstand lebt ausschließlich im Browser einer einzelnen Sitzung.
- **Die Silbentrennung ist redaktionell gepflegt**, nicht algorithmisch. Für
  ein Modul mit sieben Lernwörtern ist eine gepflegte Zuordnung robuster als
  ein allgemeiner Trennalgorithmus, der an Komposita wie „Radiergummi“
  zuverlässig scheitert.
- **Die Sprachausgabe hängt an den Systemstimmen des Browsers.** Qualität und
  Verfügbarkeit schwanken je nach Gerät; produktiv wären vorgerenderte
  Audiodateien verlässlicher.
