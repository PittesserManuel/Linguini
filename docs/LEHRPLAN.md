# Lehrplan und Lernarchitektur

Dieses Dokument beschreibt den vollständigen Lernweg von der 1. bis zur 4. Klasse
Mittelschule und wie er sich in der Software abbildet. Es ist ein **Planungsdokument**,
kein Zustandsbericht: Das meiste davon ist noch nicht gebaut. Was gebaut ist, steht
in Abschnitt 21.

`DIDAKTIK.md` begründet die Entscheidungen im bestehenden Modul.
Dieses Dokument plant die 35 weiteren.

> **Hinweis:** `DIDAKTIK.md` nennt in Abschnitt 1 noch „9–11 Jahre, Klasse 3/4".
> Das stammt aus der Zeit vor der Umstellung auf die Mittelschule und ist zu
> korrigieren, wenn dieser Lehrplan beschlossen ist.

---

## Teil I — Grundlagen

### 1. Was dieses Dokument entscheidet

Vier Fragen, die vor jeder Zeile Code beantwortet sein müssen:

1. **Wie viele Module braucht ein Lernweg über vier Jahre?** → 36, neun pro Jahrgang
2. **In welcher Reihenfolge?** → Abschnitt 10 bis 13
3. **Wie ist ein Modul aufgebaut?** → fünf Phasen, Abschnitt 6
4. **Was muss die Software dafür können, das sie heute nicht kann?** → Abschnitt 8 und 9

### 2. Die sieben Grundsätze

| | Grundsatz | Stand |
|---|---|---|
| G1 | **Rezeptiv vor produktiv, mündlich vor schriftlich.** Kein Wort wird geschrieben, bevor es gehört und gesagt wurde. | fehlt |
| G2 | **Portionieren.** Höchstens fünf neue Wörter am Stück. | gebaut (Wortpakete) |
| G3 | **Wort im Satz, nie allein.** Jedes Wort mit Bild und Beispielsatz. | gebaut |
| G4 | **Erstsprache als Werkzeug.** Übersetzung erlaubt und erwünscht, nie als Defizit. | teilweise |
| G5 | **Gerüst statt leeres Blatt.** Freies Schreiben beginnt mit Satzanfängen. | teilweise |
| G6 | **Wiederholung planbar machen.** Was einmal gelernt wurde, kommt in Abständen wieder. | fehlt |
| G7 | **Die Lehrkraft bewertet, die App liefert zu.** Freie Texte sieht die App nie. | gebaut |

G1 ist der teuerste und der wichtigste. Er kehrt die Reihenfolge um, in der die App
heute arbeitet.

### 3. Was der Rechtsrahmen vorgibt — und was nicht

**Lehrplan der Mittelschule, „Deutsch in der Deutschförderklasse"** (BGBl. II Nr. 1/2023):

- Vier Lernbereiche: Sprachhandlungs- und Textkompetenz über die vier Fertigkeiten ·
  Linguistische Kompetenzen (Wortschatz, Strukturen, Aussprache, Schrift, Rechtschreibung) ·
  Sprachlernkompetenz · Selbst-, Sozial- und interkulturelle Kompetenz
- Progression **wörtlich vorgeschrieben:** „Im Mittelpunkt steht deshalb zunächst die
  Ausbildung der mündlichen und erst in weiterer Folge der schriftlichen kommunikativen
  Handlungsfähigkeit."
- Themenkanon nur **illustrativ**: persönliche Daten, Familie, Schule, Essen, Wohnen,
  Freizeit, Natur und Umwelt
- Bildungssprache ausdrücklich anhand von Mathematik, Geschichte und Politischer
  Bildung, Geografie und wirtschaftlicher Bildung

**Lehrplanzusatz Deutsch als Zweitsprache:**

> „beinhaltet der Lehrplan **keine eigens ausgewiesenen Anwendungsbereiche**, sondern
> orientiert sich an den **Anwendungsbereichen des Deutsch-Lehrplans**."

Daraus folgen zwei Dinge, die den Zuschnitt des Produkts bestimmen:

- **Die Themenfolge ist frei.** Der Lehrplan schreibt Kompetenzen vor, keine Lektionen.
  Unsere 36 Themen sind ein Vorschlag, kein Gesetzesvollzug.
- **DaZ und Regelunterricht sind rechtlich verbunden.** Wer nach dem DaZ-Zusatz baut,
  baut nach dem Deutsch-Lehrplan mit. Die Trennung existiert im Gesetz nicht.

### 4. Vier Einsatzsituationen

Dieselben 36 Module bedienen vier Räume mit sehr unterschiedlichem Verbrauch.

| Situation | Wochenstunden | Module/Jahr | Schüler (AT, Sek I) | Rolle |
|---|---|---|---|---|
| DaZ-Förderkurs | 2–5 | 5–14 | ~75.000 | **Kern** |
| Regelunterricht Deutsch | 3–4 | 7–9 | ~344.000 | die Breite |
| Nachhilfe | 1–2 | 3–6 | ~95.000 | schnellstes Geld |
| Deutschförderklasse | 15–20 | 28–42 | ~6.500 | Zugabe, kein Ziel |

Die letzte Zeile ist eine Warnung: Eine Deutschförderklasse spielt den gesamten
Vierjahreskatalog in zwölf Monaten leer. Als Zielgruppe ist sie eine Falle.

**Positionierung: DaZ-geführt, nicht DaZ-only.** Nicht weil DaZ größer wäre, sondern
weil „DaZ für 10- bis 14-Jährige mit österreichischem Lehrplanbezug" die unbesetzte
Position ist. „Deutsch für die Mittelschule" haben ANTON, SchuBu, eSquirrel und alle
Verlage.

---

## Teil II — Das System

### 5. Die zwei Achsen

Jedes Modul liegt in **vier Jahrgangsfassungen × drei Niveaustufen = 12 Kombinationen** vor.

**Achse 1 · Jahrgang** — wie alt das Kind ist. Steuert den Lesetext: gleiche Geschichte,
steigende Satzkomplexität, mitwachsender Inhalt.

| Fassung | Sprachprofil | Ø Wörter/Satz |
|---|---|---|
| ms1 | nur Präsens, nur Hauptsätze | ~4,3 |
| ms2 | Präsens, erste Konnektoren | ~6,3 |
| ms3 | Perfekt, Nebensätze weil/dass | ~7,7 |
| ms4 | Präteritum, Relativsätze, indirekte Rede | ~9,6 |

**Achse 2 · Niveau** — wie schwer die Aufgaben sind. Und hier liegt die Doppeldeutigkeit,
die das Produkt für den Regelunterricht öffnet:

| | Leicht | Mittel | Knifflig |
|---|---|---|---|
| **DaZ** | Sprachstand A1 | A1+/A2 | A2+ |
| **Muttersprache** | unsichere Rechtschreibung | durchschnittlich | sicher |

> **Jahrgang identisch, Niveau individuell.** Die Vierzehnjährige mit vier Monaten
> Deutsch und der Vierzehnjährige mit schwacher Rechtschreibung arbeiten am selben
> Text — jeder auf seiner Stufe, und keiner bekommt Babykost.

Die Textlänge steigt über die vier Fassungen **nicht** wesentlich (68 / 151 / 139 / 153
Wörter im gebauten Modul). Das ist Absicht: Ein DaZ-Lernender in der 4. Klasse liest
nicht mehr Zeilen, er liest dichtere.

### 6. Der Modulaufbau in fünf Phasen

Jedes Modul, jedes Mal dieselbe Abfolge. Ab Modul drei weiß das Kind, was kommt, und
kann sich auf die Sprache statt auf die Bedienung konzentrieren.

| Phase | Fertigkeit | Was passiert | Zeitanteil |
|---|---|---|---|
| **1 Begegnen** | Hören | Bild und Stimme, kein Schriftbild. Das Kind zeigt, es antwortet noch nicht. | 15 % |
| **2 Verstehen** | Hören + Lesen | Schriftbild kommt dazu. Zuordnen und Auswählen, noch kein Tippen. | 20 % |
| **3 Sprechen** | Sprechen | Nachsprechen, Partnerspiel, Bild beschreiben. Die App hört nicht zu. | 20 % |
| **4 Lesen** | Lesen | Jahrgangstext, erst hören, dann mitlesen, dann allein. | 25 % |
| **5 Schreiben** | Schreiben | Gestützt in der App, frei ins Heft. | 20 % |

Phase 2, 4 und 5 laufen bereits. **Phase 1 und 3 fehlen komplett** — also genau der
mündliche Einstieg, den der Lehrplan an den Anfang stellt.

### 7. Die Wortschatz-Kartei

Die wichtigste fehlende Funktion — wichtiger als jedes einzelne Modul.

Ohne systematische Wiederholung ist der Wortschatz aus Modul 1 im Februar weg. 36 Module
hintereinander sind dann kein Lernweg, sondern 36 Einzelstunden, die einander vergessen.

**Mechanik:** Fünf Fächer, wachsende Abstände. Richtig → ein Fach weiter. Falsch →
zurück in Fach 1.

| Fach | Wiedervorlage nach |
|---|---|
| 1 | derselben Stunde |
| 2 | 2 Tagen |
| 3 | 1 Woche |
| 4 | 3 Wochen |
| 5 | 2 Monaten |

**Was hineinwandert:** Lernwörter mit Artikel · Pluralformen · Rechtschreibfälle
(`das/dass` übt man genauso in Abständen wie Vokabeln) · unregelmäßige Verbformen.

**Ohne Server:** Der Kartei-Stand steckt im Weiter-Code und in der Datei für die
Lehrkraft. Fünf Fächer × ~1.000 Wörter sind wenige Kilobyte.

**Speist die Diagnose:** Was dauerhaft in Fach 1 hängt, erscheint auf dem
Übergabezettel. Die Lehrkraft sieht ohne Statistik, woran es hakt.

### 8. Die Fertigkeiten und ihre Übungstypen

Heute kennt die Korrektur-Engine acht Typen. Für vier Fertigkeiten plus Rechtschreibung
über vier Jahre braucht es rund vierzig.

#### Hören — 0 vorhanden, 8 neu

| Typ | Was das Kind tut | Bewertung |
|---|---|---|
| Hörbild | Ton hören, richtiges Bild antippen | wie `auswahl` |
| Hörwort | Ton hören, Wort schreiben | wie `freitext` |
| Minimalpaare | Bär/Bier, Kirche/Kirsche unterscheiden | wie `auswahl` |
| Hörtext mit Fragen | Text hören, Fragen beantworten | bestehende Lesetypen |
| Zahlen und Uhrzeiten | Ansage hören, Zahl eintragen | wie `freitext` |
| Ansage verstehen | Durchsage, Antwort wählen | wie `auswahl` |
| Wortakzent | Betonte Silbe markieren | neu |
| Diktat | Satz hören, Satz schreiben | wie `freitext`, tolerant |

#### Sprechen — 0 vorhanden, 6 neu

| Typ | Was das Kind tut | Bewertung |
|---|---|---|
| Nachsprechen | Aufnehmen, mit Sprecherstimme vergleichen | **keine** — Selbstkontrolle |
| Partnerspiel | Wortkarte ziehen, Partner findet im Bild | Partner entscheidet |
| Bildbeschreibung | Mit Satzgerüst beschreiben | Lehrkraft |
| Dialog nachspielen | Rollen mit Textvorlage | Lehrkraft |
| Interview führen | Fragebogen, Partner antwortet | Lehrkraft |
| Kurzvortrag | Vorbereitet vortragen | Lehrkraft, Bewertungsbogen |

**Keine automatische Ausspracheprüfung.** Technisch möglich, didaktisch fragwürdig,
rechtlich heikel — Stimmaufnahmen von Kindern zu verarbeiten öffnet ein Fass, das wir
nicht brauchen. Die Aufnahme bleibt im Gerät und wird nicht gesendet.

#### Lesen — 5 vorhanden, 4 neu

Vorhanden: `auswahl` · `wahrheit` (richtig/falsch/steht nicht im Text) · `luecken` ·
`reihenfolge` · `freitext` (Antwort im Text finden)

Neu: Überschrift zuordnen · Textstelle markieren · Bezüge auflösen („wer ist *er*?") ·
Konnektoren einsetzen

#### Schreiben — 2 vorhanden, 4 neu

Vorhanden: Wort mit Artikel schreiben · `heft` (Auftrag ins Heft, nie bewertet)

Neu: Satzbaukasten (Wörter in die richtige Reihenfolge) · Bildergeschichte ·
Schreibrahmen mit Satzanfängen · Textsorte nachbauen

#### Wortschatz und Grammatik — 2 vorhanden, 8 neu

Vorhanden: `artikel` · `menge` (Zahlwort + Plural)

Neu: Karteikasten · Gegenteile · Oberbegriffe · Wortfamilien · zusammengesetzte Wörter ·
Verben beugen · Fälle üben · Wortstellung im Satz

#### Rechtschreibung und Zeichensetzung — 1 vorhanden, 7 neu

Vorhanden: Großschreibung (existiert als Fehlerart `grossschreibung`)

Neu: `das`/`dass` · Doppelkonsonant · s-Laute · Silbentrennung · Komma setzen ·
wörtliche Rede zeichnen · Fehlertext korrigieren

> **Dieser Strang kostet fast keinen neuen Inhalt.** Er benutzt die Wörter und Texte,
> die für den Wortschatz ohnehin entstehen: Das Komma übt man am Lesetext des Moduls,
> die Großschreibung an dessen Wortschatz. Ein Modul trägt damit beide Zielgruppen.

### 9. Wie sich das in der Software abbildet

Was am Datenmodell zu tun ist, damit der Lehrplan überhaupt abbildbar wird:

| Baustein | Änderung | Aufwand |
|---|---|---|
| `Wort` | Feld `audioQuelle` (analog zu `bildQuelle`) | klein |
| `Wort` | Felder für Wortfamilie, Oberbegriff, Gegenteil — Futter für die Generatoren | klein |
| `Modul` | Feld `phasen` — die fünf Phasen mit ihren Aufgaben | mittel |
| `Aufgabe` | neue Typen `hoeren`, `sprechen`, `rechtschreibung`, `satzbau` | mittel |
| `Lernstand` | `kartei: Record<wortId, {fach, faellig}>` | klein |
| neu | `generatoren.ts` — erzeugt Übungen aus dem Wortschatz | mittel |
| neu | Tabellen-Pipeline: CSV → geprüftes Modul | mittel |
| neu | Weiter-Code: Position + Kartei in sechs Zeichen | klein |
| neu | Audio-Abspieler mit Rückfall auf Sprachsynthese | klein |
| neu | Aufnahme im Browser (`MediaRecorder`), nur lokal | mittel |
| Szene | Rasterbild-Variante als Standard für neue Module | steht bereits |

**Die Generatoren sind der Hebel.** Aus einem Wortschatzeintrag entstehen automatisch
rund zehn Übungen — Artikel, Mehrzahl, Schreibweise, Lücke aus dem Beispielsatz,
Mengenaufgabe, Bild-Wort, Definitionsrätsel, Hörwort, Karteikarte, Großschreibung.
Bei 1.000 Wörtern sind das ~10.000 Übungen, von denen niemand eine einzeln schreibt.

Der Beweis, dass das Muster trägt, steht schon im Code: `schreibAufgabe(wort)` in
`Wortbild.tsx` macht heute aus einem `Wort` eine vollständige `AufgabeFreitext`.

---

## Teil III — Der Lehrplan

Aufbau jeder Modulspezifikation:

- **Wortfeld** — die inhaltlichen Gruppen der ~25 Lernwörter
- **Grammatik** — das Thema mit Hefteintrag
- **Rechtschreibung** — der parallele Strang für die Schriftsprache
- **Lesetext** — der Kern der Geschichte (in vier Fassungen)
- **Sprechen** — der Sprechanlass der Phase 3
- **Heft** — was ins Heft geschrieben und von der Lehrkraft korrigiert wird
- **Szene** — das Bild, auf dem die Wörter angetippt werden

### 10. Jahrgang 1 — A1.1, 5. Schulstufe

**Leitsatz:** „Ich kann sagen, was ich sehe und wer ich bin."
**Schwerpunkt:** Hören und Sprechen, rund 60 % mündlich. Schreiben nur abschreibend.
**Verstehensebene:** literal — die Antwort steht wörtlich im Text.

#### M01 · Begrüßen, sich vorstellen, Zahlen
- **Wortfeld:** Grußformeln · Name, Alter, Herkunft · Zahlen 0–20 · Wochentage
- **Grammatik:** `sein` im Singular · W-Fragen (wie, wer, woher) · Personalpronomen
- **Rechtschreibung:** Satzanfang groß · Punkt und Fragezeichen
- **Lesetext:** Der erste Tag — ein Kind kommt neu in die Klasse und stellt sich vor
- **Sprechen:** Vorstellungsrunde im Kreis · Partner-Interview mit Fragekarten
- **Heft:** Steckbrief über mich
- **Szene:** Schuleingang mit Kindern

#### M02 · Familie und ich
- **Wortfeld:** Mutter, Vater, Bruder, Schwester, Oma, Opa · Eltern, Geschwister, Kind
- **Grammatik:** Possessivartikel `mein`/`dein` · `haben`
- **Rechtschreibung:** Nomen großschreiben
- **Lesetext:** Ein Familienfoto wird beschrieben
- **Sprechen:** Eigenes Foto oder Zeichnung beschreiben
- **Heft:** Meine Familie — fünf Sätze
- **Szene:** Wohnzimmer mit Familie

#### M03 · Schule und Klassenzimmer ✅ **gebaut**
- **Wortfeld:** 13 Lernwörter + 8 Stützwörter (Bleistift, Buntstift, Radiergummi, Spitzer, Kleber, Lineal, Geodreieck, Zirkel, Schere, Tafel, Tür, Pflanze, Papierkorb …)
- **Grammatik:** `ist`/`sind` · `ein`/`eine` — beide mit Hefteintrag, gebaut
- **Rechtschreibung:** Großschreibung (Vertiefung)
- **Lesetext:** vier Fassungen gebaut — „Mala kommt in die Klasse" bis „Die Kiste"
- **Sprechen:** Partnerspiel „Zeig mir das Wort" — konzipiert, nicht gebaut
- **Heft:** Vokabelheft, fünf Sätze über den Tisch, Steckbrief Schultasche — gebaut
- **Szene:** Vektorszene Klassenzimmer, 21 Trefferflächen — gebaut

#### M04 · Essen und Trinken
- **Wortfeld:** Brot, Butter, Käse, Wurst, Apfel, Wasser, Milch · Teller, Glas, Messer, Gabel, Löffel · Jause
- **Grammatik:** Akkusativ · `mögen` · Verneinung mit `kein`
- **Rechtschreibung:** lange und kurze Vokale
- **Lesetext:** Die Jause — was jemand mithat und was nicht
- **Sprechen:** „Was isst du gern?" · Dialog am Schulbuffet
- **Heft:** Meine Lieblingsjause
- **Szene:** Jausentisch

#### M05 · Mein Tag, Uhrzeit
- **Wortfeld:** aufstehen, frühstücken, gehen, lernen, spielen, schlafen · Morgen, Mittag, Abend · Uhr, Stunde, Minute
- **Grammatik:** Präsens alle Personen · erste trennbare Verben · Zeitangaben `um`/`am`
- **Rechtschreibung:** Silben trennen
- **Lesetext:** Ein ganzer Tag von morgens bis abends
- **Sprechen:** Tagesablauf mit Bildkarten erzählen
- **Heft:** Mein Tagesablauf
- **Szene:** Bildstreifen Tagesablauf

#### M06 · Wohnen: Räume und Möbel
- **Wortfeld:** Zimmer, Küche, Bad · Bett, Tisch, Stuhl, Schrank, Sofa, Lampe · Fenster, Tür
- **Grammatik:** Ortspräpositionen mit Dativ (`in`, `auf`, `unter`) · `es gibt`
- **Rechtschreibung:** Nomen großschreiben (Vertiefung)
- **Lesetext:** Die neue Wohnung
- **Sprechen:** Zimmer beschreiben, Partner zeichnet mit
- **Heft:** Mein Zimmer
- **Szene:** Zimmer mit Möbeln

#### M07 · Freizeit, Hobbys, Sport
- **Wortfeld:** spielen, lesen, schwimmen, laufen · Fußball, Musik, Verein · Freund, Park
- **Grammatik:** `können` · `gern`/`nicht gern` · Verben mit Vokalwechsel (`fahren`, `lesen`)
- **Rechtschreibung:** `ä`/`äu` von `a`/`au` ableiten
- **Lesetext:** Nachmittag im Park
- **Sprechen:** Klassenumfrage „Was kannst du gut?"
- **Heft:** Mein Hobby
- **Szene:** Park und Sportplatz

#### M08 · In der Stadt: Wege
- **Wortfeld:** Straße, Platz, Haus, Geschäft, Bank, Post · Bus, Haltestelle · links, rechts, geradeaus
- **Grammatik:** Imperativ · Präpositionen `zu`/`nach` · Richtungsangaben
- **Rechtschreibung:** Dehnungs-h
- **Lesetext:** Der Weg zur Schule
- **Sprechen:** Weg beschreiben, Partner findet ihn auf dem Plan
- **Heft:** Mein Schulweg
- **Szene:** Stadtplan

#### M09 · Einkaufen, Kleidung, Preise 🟡 **halb gebaut**
- **Wortfeld:** vorhanden 15 Wörter Wochenmarkt (Obst, Gemüse, Korb …) · zu ergänzen: Hose, Jacke, Schuhe, T-Shirt · Euro, Cent, teuer, billig
- **Grammatik:** Akkusativ mit unbestimmtem Artikel · Zahlen bis 100
- **Rechtschreibung:** Zahlwörter
- **Lesetext:** Einkaufen mit wenig Geld
- **Sprechen:** Verkaufsgespräch nachspielen
- **Heft:** Mein Einkaufszettel
- **Szene:** Rasterbild Wochenmarkt — **gebaut**, Trefferflächen vorhanden

### 11. Jahrgang 2 — A1.2 → A2.1, 6. Schulstufe

**Leitsatz:** „Ich kann erzählen, was war, und mich verabreden."
**Schwerpunkt:** Sprechen und Lesen. Erste zusammenhängende Texte, gestütztes Schreiben.
**Verstehensebene:** literal plus reorganisierend — Reihenfolge, Zusammenfassen.

#### M10 · Gesundheit, Körper, beim Arzt
- **Wortfeld:** Kopf, Bauch, Arm, Bein, Hand, Fuß, Auge, Ohr · krank, gesund, Fieber, weh tun · Arzt, Apotheke
- **Grammatik:** Dativ (`mir tut … weh`) · `müssen`/`dürfen`
- **Rechtschreibung:** Doppelkonsonanten
- **Lesetext:** Beim Arzt
- **Sprechen:** Arztgespräch in Rollen
- **Heft:** Eine Krankmeldung schreiben

#### M11 · Gestern und letzte Woche
- **Wortfeld:** gestern, vorgestern, letzte Woche, Wochenende · Alltagsverben im Perfekt
- **Grammatik:** **Perfekt mit `haben`** · Partizip II regelmäßig
- **Rechtschreibung:** `ge-` am Wortanfang
- **Lesetext:** Was am Wochenende passiert ist
- **Sprechen:** Vom Wochenende erzählen
- **Heft:** Mein Wochenende

#### M12 · Wetter und Jahreszeiten
- **Wortfeld:** Sonne, Regen, Schnee, Wind, Wolke · warm, kalt, Grad · Frühling, Sommer, Herbst, Winter
- **Grammatik:** unpersönliches `es` · Perfekt mit `sein`
- **Rechtschreibung:** `ie`, `ih`, `i`
- **Lesetext:** Der erste Schnee
- **Sprechen:** Einen Wetterbericht vorlesen und erfinden
- **Heft:** Wetterbeobachtung über eine Woche

#### M13 · Feste feiern, Geburtstag
- **Wortfeld:** Geburtstag, Geschenk, Einladung, Kuchen, Kerze · feiern, gratulieren, einladen
- **Grammatik:** Dativ als Empfänger · Ordnungszahlen · Datum
- **Rechtschreibung:** **Komma bei Aufzählung**
- **Lesetext:** Die Einladung
- **Sprechen:** Einladen, annehmen, höflich ablehnen
- **Heft:** Eine Einladungskarte schreiben

#### M14 · Tiere und Natur
- **Wortfeld:** Hund, Katze, Vogel, Pferd · Baum, Blume, Wald, Wiese, See · füttern, wachsen
- **Grammatik:** Adjektive als Prädikat · Komparativ (`größer als`)
- **Rechtschreibung:** Umlaute ableiten
- **Lesetext:** Ein Tier wird beschrieben
- **Sprechen:** Tier raten durch Beschreiben
- **Heft:** Mein Lieblingstier

#### M15 · Sich verabreden, einladen
- **Wortfeld:** treffen, abholen, Zeit haben, Termin · später, vorher, leider, vielleicht
- **Grammatik:** Modalverben vollständig · Nebensatz mit `weil`
- **Rechtschreibung:** **wörtliche Rede zeichnen**
- **Lesetext:** Die Verabredung klappt nicht
- **Sprechen:** Telefonat nachspielen
- **Heft:** Eine Nachricht an einen Freund

#### M16 · Unterwegs: Bus, Zug, Fahrplan
- **Wortfeld:** Bus, Zug, Haltestelle, Fahrkarte, Fahrplan · einsteigen, aussteigen, umsteigen · Verspätung
- **Grammatik:** trennbare Verben systematisch · Wechselpräpositionen
- **Rechtschreibung:** Fugen-s in zusammengesetzten Wörtern
- **Lesetext:** Die verpasste Straßenbahn
- **Sprechen:** Fahrkarte kaufen, nach der Verbindung fragen
- **Heft:** Eine Fahrt beschreiben

#### M17 · Meine Umgebung, mein Ort
- **Wortfeld:** Dorf, Stadt, Nachbar, Gebäude, Kirche, Spielplatz · wohnen, liegen, sich befinden
- **Grammatik:** Ortspräpositionen vollständig · `es gibt` + Akkusativ
- **Rechtschreibung:** Groß- und Kleinschreibung bei Ortsnamen
- **Lesetext:** Mein Ort früher und heute
- **Sprechen:** Den eigenen Ort mit Fotos vorstellen
- **Heft:** Steckbrief meines Orts

#### M18 · Berufe und Hobbys
- **Wortfeld:** Beruf, Bäcker, Lehrer, Arzt, Friseur, Verkäufer · arbeiten, verdienen, Werkstatt
- **Grammatik:** Berufsbezeichnungen mit und ohne Artikel · `als` (er arbeitet als)
- **Rechtschreibung:** Endungen `-er` und `-in`
- **Lesetext:** Was meine Eltern arbeiten
- **Sprechen:** Berufe raten · Interview führen
- **Heft:** Mein Traumberuf

### 12. Jahrgang 3 — A2.1 → A2.2, 7. Schulstufe

**Leitsatz:** „Ich kann begründen, was ich denke, und im Fachunterricht mitkommen."
**Schwerpunkt:** Lesen und Schreiben. Einstieg in die Bildungssprache.
**Verstehensebene:** inferentiell — zwischen den Zeilen lesen, Ursachen erschließen.

#### M19 · Schulfächer und Lernen
- **Wortfeld:** Fach, Note, Hausübung, Stundenplan · lernen, verstehen, erklären, üben
- **Grammatik:** Nebensätze mit `dass` · Konjunktiv II höflich (`könntest du`)
- **Rechtschreibung:** **`das` oder `dass`**
- **Lesetext:** Warum ein Fach schwerfällt
- **Sprechen:** Um Hilfe bitten · jemandem etwas erklären
- **Heft:** Mein Stundenplan und meine Fächer

#### M20 · Prüfungen und Klassenarbeiten
- **Wortfeld:** Prüfung, Test, Ergebnis · üben, wiederholen, vorbereiten, verbessern · Angst, Druck
- **Grammatik:** Nebensätze mit `weil` und `wenn` · Futur mit `werden`
- **Rechtschreibung:** **Komma bei Nebensätzen**
- **Lesetext:** Der Tag vor der Schularbeit
- **Sprechen:** Tipps geben, Ratschläge formulieren
- **Heft:** Mein Lernplan

#### M21 · Gesund und fit bleiben
- **Wortfeld:** Bewegung, Ernährung, Schlaf · Obst, Gemüse, Zucker · sich fühlen, verzichten
- **Grammatik:** reflexive Verben · höflicher Imperativ
- **Rechtschreibung:** `s`, `ss` und `ß`
- **Lesetext:** Eine Woche ohne Zucker
- **Sprechen:** Diskussion „Was ist gesund?"
- **Heft:** Mein Gesundheitstipp

#### M22 · Medien und Handy
- **Wortfeld:** Handy, Nachricht, App, Bildschirm · teilen, posten, Zeit verbringen · Regel, Grenze
- **Grammatik:** Nebensätze mit `ob` · indirekte Frage
- **Rechtschreibung:** Fremdwörter aus dem Englischen
- **Lesetext:** Wie lange am Handy?
- **Sprechen:** Pro und Contra
- **Heft:** Meine Handyregeln

#### M23 · Gefühle und Freundschaft
- **Wortfeld:** froh, traurig, wütend, enttäuscht · sich freuen, sich ärgern · Vertrauen, Streit
- **Grammatik:** Verben mit Präposition (`sich freuen über`) · Adjektivendungen
- **Rechtschreibung:** Adjektivendungen richtig schreiben
- **Lesetext:** Der Streit
- **Sprechen:** Gefühle benennen · jemanden trösten
- **Heft:** Ein Brief an einen Freund

#### M24 · Meine Meinung sagen
- **Wortfeld:** meinen, finden, glauben · Meinung, Grund, Beispiel · zustimmen, widersprechen
- **Grammatik:** Nebensätze vollständig · `deshalb`, `darum`
- **Rechtschreibung:** Zeichensetzung bei Begründungen
- **Lesetext:** Zwei Meinungen zum selben Thema
- **Sprechen:** Meinung mit Begründung vortragen
- **Heft:** Meine Meinung in fünf Sätzen

#### M25 · Streit und Kompromiss
- **Wortfeld:** Konflikt, Regel, Lösung, Kompromiss · sich entschuldigen, zuhören, nachgeben · gerecht
- **Grammatik:** Konjunktiv II (`ich würde`, `könnte`) · Relativsätze im Nominativ
- **Rechtschreibung:** Zeitformen sicher schreiben
- **Lesetext:** Die Klassenregeln entstehen
- **Sprechen:** Einen Konflikt in Rollen lösen
- **Heft:** Unsere Klassenregeln

#### M26 · Zahlen, Größen, Diagramme — *Bildungssprache Mathematik*
- **Wortfeld:** Summe, Differenz, Anteil, Prozent · Diagramm, Achse, Spalte · steigen, sinken, ungefähr
- **Grammatik:** Passiv im Ansatz (`wird berechnet`) · Vergleichsformen
- **Rechtschreibung:** Zahlwörter und Maßeinheiten
- **Lesetext:** Eine Umfrage in der Klasse
- **Sprechen:** Ein Diagramm beschreiben
- **Heft:** Eigene Umfrage auswerten

#### M27 · Wo ich herkomme, wo ich bin
- **Wortfeld:** Heimat, Herkunft, Sprache, Grenze · umziehen, vermissen, sich gewöhnen · fremd, vertraut
- **Grammatik:** Präteritum von `sein` und `haben` · Relativsätze
- **Rechtschreibung:** Länder- und Sprachbezeichnungen
- **Lesetext:** Zwei Orte, ein Leben
- **Sprechen:** Von zu Hause erzählen — **ausdrücklich freiwillig**
- **Heft:** Meine zwei Sprachen

> **Zu M27:** Dieses Modul kann verletzen. Kein Kind darf zum Erzählen über Flucht,
> Familie oder Herkunft gedrängt werden. Der Sprechanlass hat immer eine Alternative
> („eine erfundene Person"), und der Heftauftrag ist ersetzbar. Das gehört in die
> Differenzierungshinweise für die Lehrkraft, nicht ins Kleingedruckte.

### 13. Jahrgang 4 — A2.2 → B1.1, 8. Schulstufe

**Leitsatz:** „Ich kann eine Meinung vertreten und mich um eine Stelle bewerben."
**Schwerpunkt:** Schreiben und Sprechen. Textsorten, Vorbereitung auf den Übertritt.
**Verstehensebene:** wertend — eine eigene, textgestützte Position beziehen.

#### M28 · Praktikum und Arbeitswelt
- **Wortfeld:** Praktikum, Betrieb, Chef, Kollege, Aufgabe · pünktlich, zuverlässig · Arbeitszeit, Pause
- **Grammatik:** Präteritum · Passiv Präsens
- **Rechtschreibung:** Nominalisierungen
- **Lesetext:** Eine Woche im Betrieb
- **Sprechen:** Sich im Betrieb vorstellen
- **Heft:** Praktikumsbericht

#### M29 · Bewerbung und Lebenslauf
- **Wortfeld:** Bewerbung, Lebenslauf, Stelle, Anschreiben · Qualifikation, Erfahrung, Interesse
- **Grammatik:** Konjunktiv II vollständig · Nebensätze mit `da`
- **Rechtschreibung:** Anrede, Grußformel, Briefkonventionen
- **Lesetext:** Eine Stellenanzeige verstehen
- **Sprechen:** Bewerbungsgespräch
- **Heft:** Eigener Lebenslauf

#### M30 · Ämter und Formulare
- **Wortfeld:** Formular, Antrag, Amt, Unterschrift, Frist, Bescheid · ausfüllen, beantragen, abgeben
- **Grammatik:** Passiv vollständig · Nominalstil verstehen
- **Rechtschreibung:** Abkürzungen
- **Lesetext:** Ein Brief vom Amt
- **Sprechen:** Am Schalter nachfragen
- **Heft:** Ein Formular ausfüllen

#### M31 · Nachrichten und Zeitung
- **Wortfeld:** Nachricht, Bericht, Quelle, Schlagzeile · berichten, melden, prüfen · Tatsache, Meinung
- **Grammatik:** indirekte Rede · Konjunktiv I erkennen
- **Rechtschreibung:** **Zitate zeichnen**
- **Lesetext:** Dieselbe Nachricht in zwei Zeitungen
- **Sprechen:** Eine Nachricht zusammenfassen
- **Heft:** Ein eigener kurzer Bericht

#### M32 · Umwelt und Verantwortung
- **Wortfeld:** Umwelt, Müll, Energie, Klima · trennen, sparen, vermeiden · Verantwortung, verändern
- **Grammatik:** `deshalb`, `trotzdem`, `obwohl` · Konditionalsätze
- **Rechtschreibung:** Komma bei Konnektoren
- **Lesetext:** Was eine Klasse verändert hat
- **Sprechen:** Vorschläge machen und begründen
- **Heft:** Ein Vorschlag für unsere Schule

#### M33 · Diskutieren und begründen
- **Wortfeld:** Argument, Gegenargument · einerseits, andererseits · überzeugen, einlenken, abwägen
- **Grammatik:** komplexe Satzgefüge · Partizipien als Adjektiv
- **Rechtschreibung:** **Komma bei Infinitiv- und Relativsätzen**
- **Lesetext:** Eine Diskussion mitlesen
- **Sprechen:** Strukturierte Debatte mit Rollen
- **Heft:** Stellungnahme

#### M34 · Geschichte und Zeitleisten — *Bildungssprache Geschichte und Politische Bildung*
- **Wortfeld:** Jahrhundert, Epoche, Ereignis · Ursache, Folge, Entwicklung · damals, Quelle
- **Grammatik:** Präteritum vollständig · Plusquamperfekt erkennen
- **Rechtschreibung:** Jahreszahlen und Datumsangaben
- **Lesetext:** Eine Zeitleiste lesen
- **Sprechen:** Ein Ereignis nacherzählen
- **Heft:** Eigene Zeitleiste

#### M35 · Karten, Länder, Wirtschaft — *Bildungssprache Geografie und wirtschaftliche Bildung*
- **Wortfeld:** Karte, Grenze, Hauptstadt, Bevölkerung · Import, Export, Landwirtschaft, Industrie
- **Grammatik:** Passiv im Sachtext · Relativsätze in allen Fällen
- **Rechtschreibung:** geografische Namen
- **Lesetext:** Ein Land in Zahlen
- **Sprechen:** Ein Land vorstellen
- **Heft:** Länderprofil

#### M36 · Ein Projekt vorstellen
- **Wortfeld:** Projekt, Plan, Ziel, Schritt, Ergebnis · präsentieren, gliedern, Publikum
- **Grammatik:** alles Bisherige im Zusammenspiel
- **Rechtschreibung:** einen eigenen Text überarbeiten
- **Lesetext:** Eine Projektbeschreibung
- **Sprechen:** Kurzvortrag mit Bewertungsbogen
- **Heft:** Projektmappe

### 14. Die Grammatikprogression im Überblick

| Jahrgang | Verbformen | Fälle | Satzbau |
|---|---|---|---|
| 1 | Präsens · `sein`/`haben` · `können` | Nominativ, Akkusativ | Hauptsatz · W-Frage · Ja/Nein-Frage |
| 2 | Perfekt · trennbare Verben · Modalverben | + Dativ | erste Nebensätze mit `weil` |
| 3 | Präteritum (Hilfs- und Modalverben) · reflexive Verben · Konjunktiv II höflich | + Genitiv im Ansatz | Nebensätze `dass`/`weil`/`wenn`/`ob` · Relativsatz Nominativ |
| 4 | Präteritum vollständig · Passiv · indirekte Rede · Konjunktiv II vollständig | alle Fälle sicher | komplexe Satzgefüge · Relativsätze alle Kasus |

Rund **32 Grammatikthemen**, jedes mit Hefteintrag. Das Muster steht: Hefteintrag
zuerst, App-Übungen danach — so gebaut in Modul 3.

### 15. Die Rechtschreibprogression im Überblick

| Jahrgang | Laut und Schrift | Zeichensetzung |
|---|---|---|
| 1 | Großschreibung · lange/kurze Vokale · Silben trennen · Dehnungs-h · Umlaute ableiten | Satzanfang, Punkt, Fragezeichen |
| 2 | Doppelkonsonanten · `ie`/`ih`/`i` · Fugen-s · Endungen | Komma bei Aufzählung · wörtliche Rede |
| 3 | **`das`/`dass`** · `s`/`ss`/`ß` · Adjektivendungen · Fremdwörter | Komma bei Nebensätzen |
| 4 | Nominalisierungen · Abkürzungen · Eigennamen | Komma bei Infinitiv- und Relativsätzen · Zitate |

**16 Rechtschreibthemen**, vier pro Jahrgang. Sie sind der Strang, der das Produkt für
muttersprachliche Kinder tragfähig macht — und sie kosten fast keinen neuen Inhalt,
weil sie an vorhandenem Wortschatz und vorhandenen Texten üben.

### 16. Der Wortschatzaufbau

| Jahrgang | Lernwörter neu | kumuliert | Niveau |
|---|---|---|---|
| 1 | ~225 (9 × 25) | 225 | A1.1 |
| 2 | ~225 | 450 | A1.2 → A2.1 |
| 3 | ~270 (9 × 30) | 720 | A2.1 → A2.2 |
| 4 | ~315 (9 × 35) | ~1.035 | A2.2 → B1.1 |

Dazu Stützwörter und Textwortschatz, die nicht einzeln geübt, aber verstanden werden.
Rezeptiv erreicht ein Kind damit rund 1.500 Wörter — solides A2, an der Schwelle zu B1.

**Ehrlich dazu:** Für ein sicheres B1 wären eher 2.400 Wörter nötig. Der Lernweg endet
also an der Schwelle, nicht darüber. Das ist für einen vierjährigen Förderweg neben dem
Regelunterricht realistisch und sollte auch so kommuniziert werden.

---

## Teil IV — Betrieb

### 17. Wie eine Stunde aussieht

Eine 50-Minuten-Einheit mit Geräten, typischer Verlauf:

| Minuten | Was | Wer |
|---|---|---|
| 0–5 | **Kartei**: fällige Wörter aus früheren Modulen | jedes Kind allein |
| 5–15 | Phase der laufenden Sequenz (Begegnen / Verstehen / …) | allein oder Partner |
| 15–30 | Kernarbeit: Lesetext oder Sprechanlass | Partner oder Gruppe |
| 30–45 | Heftarbeit — **ohne Gerät** | allein |
| 45–50 | Weiter-Code ins Heft, Übergabezettel bei offenen Aufträgen | jedes Kind |

Kein Gerätezwang: Die Kartei und die Kernarbeit gehen auch vom Arbeitsblatt (siehe
Abschnitt 9, Arbeitsblatt-Generator).

### 18. Wie ein Modul über die Woche läuft

Bei drei Wochenstunden, davon ein bis zwei am Gerät:

| Stunde | Phase |
|---|---|
| 1 | Begegnen + Verstehen |
| 2 | Sprechen |
| 3 | Lesen |
| 4 | Schreiben + Hefteintrag Grammatik |
| 5 | Rechtschreibung + Wiederholung, Abschluss |

Ein Modul dauert also **rund zwei Wochen**. Neun Module × zwei Wochen = 18 Wochen —
ein Halbjahr. Bei einer Gerätestunde pro Woche entsprechend das ganze Jahr.

### 19. Varianten nach Wochenstundenzahl

| Setting | UE/Jahr | Module/Jahr | Anpassung |
|---|---|---|---|
| Regelunterricht 2 WS | ~72 | 5–6 | Module auswählen, Rechtschreibstrang priorisieren |
| Regelunterricht 3 WS | ~108 | **7–9** | der Normalfall dieses Lehrplans |
| Förderkurs 5 WS | ~180 | 12–14 | zusätzliche Module aus dem Folgejahr vorziehen |
| Deutschförderklasse 15–20 WS | 540–720 | 28–42 | mehrere Jahrgänge in einem Jahr; Katalog reicht für ~1 Jahr |
| Nachhilfe 1 WS | ~36 | 3–6 | gezielt nach Diagnose, keine feste Reihenfolge |

### 20. Differenzierung in der Praxis

Drei Wege, die alle in der bestehenden Architektur schon angelegt sind:

1. **Über die Niveaustufe** — dieselbe Aufgabe, andere Schwierigkeit. Der Regler steht
   in der Kopfzeile und wirkt sofort.
2. **Über die Jahrgangsfassung** — derselbe Inhalt, andere Sprachdichte. Ein Kind mit
   wenig Deutsch bekommt nicht den Text für Jüngere, sondern die einfachere Fassung
   seines eigenen Jahrgangs.
3. **Über die Phase** — schnelle Kinder gehen weiter zur nächsten Phase, langsame
   bleiben länger bei Hören und Sprechen. Die Kartei sorgt dafür, dass niemand
   verliert, was er schon konnte.

Was **nicht** differenziert wird: der Heftauftrag. Den bekommen alle, weil das Heft die
gemeinsame Klasse zusammenhält.

---

## Teil V — Produktion

### 21. Was heute steht

Gemessen am Repository, Stand 7. August 2026:

| | |
|---|---|
| Module | 1 vollständig (M03), 1 halb (M09) |
| Lernwörter | 36, davon 16 mit Objektbild |
| Lesetexte | 4 (alle vier Jahrgangsfassungen von M03) |
| Redaktionelle Aufgaben | 46 |
| Grammatikthemen mit Hefteintrag | 2 |
| Aufgabentypen | 8, mit 8 Gradern und 9 Fehlerarten |
| Tests | 102, grün |
| Szenenarten | beide (Vektor und Rasterbild mit Trefferflächen) |

Die **Maschine** steht: Korrektur-Engine, Diagnostik, Druckausgaben, Lehrkraftbereich,
beide Szenentypen. Das **Produkt** fehlt zu rund vier Fünfteln.

### 22. Was pro Modul entsteht

| Artefakt | Menge | Wer |
|---|---|---|
| Wortschatz mit Artikel, Plural, Beispielsatz, Erklärung | 25–35 Einträge | Lehrkraft |
| Objektbilder | 25–35 | erzeugt + freigestellt |
| Bildszene mit Trefferflächen | 1 | erzeugt + eingemessen |
| Tonaufnahmen (Wörter, Sätze, Texte) | ~55 | Sprecher |
| Lesetexte in vier Jahrgangsfassungen | 4 | KI-Entwurf + Lehrkraft |
| Hörtexte | 2 | Lehrkraft + Sprecher |
| Sprechanlässe | 3 | Lehrkraft |
| Redaktionelle Aufgaben | ~20 | Lehrkraft |
| Erzeugte Übungen | ~250 | Generator |
| Rechtschreibübungen | ~15 | Generator |
| Hefteintrag Grammatik | ~1 | Lehrkraft |
| Heftaufträge | 3 | Lehrkraft |

### 23. Arbeitsteilung

**Lehrkraft:** Wortauswahl · Textredaktion · Aufgabenqualität · Hefteinträge ·
Lehrplanzuordnung · Pilotierung

**Entwicklung:** Generatoren · Pipeline · Szenen einmessen · Audio einbinden ·
Barrierefreiheit · Prüfung im Browser

**Erzeugt/automatisch:** Objektbilder · Szenenbilder · der Großteil der Übungen ·
Kennzahlen der Lesetexte

Der Engpass ist **nicht** die Entwicklung. Es ist die Autorenzeit der Lehrkraft.

### 24. Reihenfolge und Abhängigkeiten

```
Fundament (einmalig)
  Generatoren  ──┐
  Tabellen-Pipeline ──┼──> jedes weitere Modul wird billig
  Modulvorlage ──┘

Querschnitt (einmalig)
  Wortschatz-Kartei      <- Voraussetzung für Langzeitwirkung
  Weiter-Code            <- Voraussetzung für Gerätewechsel
  Audio-Abspieler        <- Voraussetzung für Phase 1
  Aufnahme im Browser    <- Voraussetzung für Phase 3
  Barrierefreiheit       <- Voraussetzung für die OeAD-Prüfung

Inhalt (je Modul, wiederholt)
  Wortschatz -> Bilder -> Szene -> Generatorlauf
             -> Lesetexte -> Aufgaben -> Audio -> Prüfung
```

**Kritischer Pfad:** Ohne Generatoren und Pipeline kostet jedes Modul das Vier- bis
Fünffache. Sie kommen zuerst, auch wenn sie nach außen nichts sichtbar machen.

### 25. Qualitätssicherung

| Prüfung | Werkzeug | Stand |
|---|---|---|
| Wortschatz vollständig und widerspruchsfrei | Pipeline-Prüfskript | zu bauen |
| Lesetext-Kennzahlen stimmen | `werkzeuge/kennzahlen.mjs --pruefen` | **gebaut** |
| Aufgabenmatrix ohne Löcher (min. 4 je Jahrgang × Stufe) | Prüfskript | zu bauen |
| Korrektur-Engine korrekt | 102 Tests | **gebaut** |
| Keine Konsolenfehler, kein Überlauf | Browserdurchlauf, 12 Ansichten × 2 Themes | **gebaut** |
| Barrierefreiheit | Tastatur- und Screenreader-Durchgang | zu bauen |
| Artikel- und Farbangaben stimmen mit den Bildern überein | `public/objekte/LIESMICH.md` | **dokumentiert** |

---

## Anhang

### A. Mengengerüst

| | je Modul | je Jahrgang | alle vier Jahre |
|---|---|---|---|
| Module | 1 | 9 | **36** |
| Lernwörter | 25–35 | ~250 | **~1.000** |
| Erzeugte Übungen | ~250 | ~2.250 | **~9.000** |
| Rechtschreibübungen | ~15 | ~150 | ~600 |
| Redaktionelle Aufgaben | ~20 | ~180 | ~720 |
| Lesetexte | 4 | 36 | **144** |
| Hörtexte | 2 | 18 | 72 |
| Sprechanlässe | 3 | 27 | 108 |
| Tonaufnahmen | ~55 | ~500 | **~2.000** |
| Heftaufträge | 3 | 27 | 108 |
| Grammatikthemen | ~1 | 7–9 | ~32 |
| Rechtschreibthemen | – | 4 | 16 |
| Bildszenen + Objektbilder | 1 + 25 | 9 + 250 | 36 + 1.000 |

**Rund 10.300 Übungen** am Ende — davon werden etwa **720 von Hand geschrieben**.

### B. Was bewusst fehlt

| | Warum |
|---|---|
| Automatische Ausspracheprüfung | Stimmaufnahmen von Kindern zu verarbeiten öffnet ein Fass, das wir nicht brauchen. Selbstvergleich genügt. |
| Klassenverwaltung und Zuweisung | Würde Konten erzwingen und den größten Wettbewerbsvorteil kosten. |
| Punkte, Abzeichen, Ranglisten | Messen Fleiß, nicht Sprachstand, und beschämen die Langsamen. |
| KI-Tutor im Dialog mit dem Kind | Fällt womöglich unter die Hochrisiko-Regeln der EU-KI-Verordnung. KI hilft der Lehrkraft, nicht dem Kind. |
| Automatische Bewertung freier Texte | Bleibt bei der Lehrkraft. Die Position, die kein Wettbewerber besetzen kann, ohne sich selbst zu widersprechen. |
| Server und Konten | Bis eine Schule dafür zahlt. Vorher: Weiter-Code und Datei-Export. |

### C. Offene Entscheidungen

1. **Themenfolge** — ist der Vorschlag in Teil III fachlich richtig? Vor allem: Gehört
   „Gesundheit und beim Arzt" wegen der Notfälle ins erste statt ins zweite Jahr?
2. **Wochenstunden am Gerät** — davon hängt ab, ob 9 Module pro Jahr reichen.
3. **Modulgröße** — 25 Wörter oder 35? Ab Jahrgang 3 steigt die Zahl; ist das machbar?
4. **Sprecherstimme** — wer spricht die ~2.000 Aufnahmen, und in welcher Varietät
   (österreichisches Standarddeutsch)?
5. **Erstsprachen** — welche vier bis sechs Sprachen bekommen Hörhilfen?

### D. Quellen

- Lehrplan der Mittelschule, „Deutsch in der Deutschförderklasse", BGBl. II Nr. 1/2023,
  Anlage 1, S. 143–150
- Lehrplanzusatz „Deutsch als Zweitsprache" (Österreich)
- vhs-Lernportal, Themen- und Grammatikübersichten A1/A2/B1 (Rahmencurriculum für
  Integrationskurse)
- Cornelsen, „Prima plus – Leben in Deutschland" (DaZ Sekundarstufe I), 14 Einheiten je Band
- Hueber, „Beste Freunde", 9 Lektionen je Band, ~90 UE je Band
- Deutschfuchs: Reihenaufbau, Einstufungstabelle (Praxisratgeber Sek I/II, S. 7),
  Katalog der Handlungskompetenzen
- Statistik Austria, Bildung in Zahlen 2024/25

Konvergenz der Quellen: **12–14 Themen und 180–200 Unterrichtseinheiten je GER-Stufe.**
Daraus die 36 Module dieses Lehrplans.

Recherchestand: 7. August 2026. Mengen und Zeiträume sind Planungsziele, keine Zusagen.
