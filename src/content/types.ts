/**
 * Content-as-Data: Das Datenmodell fuer Linguini-Lernmodule.
 *
 * Grundsatz: Inhalte sind DATEN, keine Komponenten. Ein neues Modul ist eine
 * neue Datei in `src/content/` - kein React-Code. Das haelt die Plattform
 * redaktionell erweiterbar und macht die Inhalte spaeter exportierbar
 * (z. B. nach QTI oder als OER-Paket mit AMB-Metadaten).
 */

// ---------------------------------------------------------------------------
// Wortschatz
// ---------------------------------------------------------------------------

/** Grammatisches Geschlecht. Bestimmt die Farbkodierung im gesamten UI. */
export type Genus = 'der' | 'die' | 'das'

/**
 * Ein Wortschatzeintrag.
 *
 * `neu: true`  -> Lernwort dieser Einheit (wird abgefragt, max. 7 pro Modul,
 *                 Cognitive Load Theory / Miller).
 * `neu: false` -> Stuetzwort: im Bild beschriftet, aber nicht abgefragt.
 *                 Gibt dem Bild Kontext, ohne das Arbeitsgedaechtnis zu fluten.
 */
export interface Wort {
  /** Stabile ID, zugleich die id des <g>-Elements in der SVG-Szene. */
  id: string
  genus: Genus
  /** Nomen ohne Artikel, korrekt grossgeschrieben. */
  nomen: string
  /** Vollstaendige Pluralform inkl. Artikel, z. B. "die Lineale". `null` = kein Plural. */
  plural: string | null
  /** Ein A2-Beispielsatz, in dem das Wort natuerlich vorkommt. */
  beispiel: string
  /** Kurze, kindgerechte Bedeutungserklaerung in einfachem Deutsch. */
  erklaerung: string
  /** Lernwort dieser Einheit (true) oder bekanntes Stuetzwort (false). */
  neu: boolean
  /**
   * Pfad zu einem freigestellten Objektbild unterhalb von public/, z. B.
   * "objekte/radiergummi.png".
   *
   * Ist er gesetzt, zeigen ALLE Stellen, an denen der Gegenstand einzeln
   * erscheint (Bildstuetze zur Aufgabe, Mengenbild in der
   * Einzahl-/Mehrzahl-Uebung, Illustration im Hefteintrag) dieses Bild statt
   * der Vektorzeichnung. Fehlt er, bleibt die Vektorfassung - die Datei ist
   * damit optional und nichts bricht, solange die Bilder noch fehlen.
   *
   * Die Szene selbst nutzt weiterhin die Vektorfassung: Dort muss jeder
   * Gegenstand einzeln ansprechbar sein (Hervorheben, Einrahmen), und das
   * kann ein Rasterbild nicht leisten.
   */
  bildQuelle?: string
  /** Ankerpunkt der Beschriftung im Bild, in Prozent der Bildflaeche (0-100). */
  punkt: { x: number; y: number }
  /** Auf welche Seite des Ankerpunkts das Label gesetzt wird. */
  labelSeite: 'links' | 'rechts' | 'oben' | 'unten'
}

/**
 * Ein Lernpaket: eine Portion Wortschatz, die in EINEM Durchgang geuebt wird.
 *
 * Warum ueberhaupt Pakete? Ein Modul darf inzwischen mehr als sieben
 * Lernwoerter haben (das Klassenzimmer hat dreizehn - Schulsachen, Raum und
 * Geometrie gehoeren fachlich zusammen). Sie alle am Stueck abzufragen wuerde
 * das Arbeitsgedaechtnis ueberlaufen lassen (Miller 1956, Cognitive Load
 * Theory). Die Loesung ist nicht, Woerter wegzulassen, sondern sie zu
 * portionieren: Das Bild zeigt alles, geuebt wird paketweise mit maximal
 * sieben Woertern.
 */
export interface Wortpaket {
  id: string
  /** Kindgerechter Name der Portion, z. B. "Meine Schulsachen". */
  titel: string
  /** IDs aus dem Wortschatz des Moduls, in Lernreihenfolge. Hoechstens 7. */
  woerter: string[]
}

// ---------------------------------------------------------------------------
// Szene - woher kommt das Bild?
// ---------------------------------------------------------------------------

/**
 * Ein Modul bringt seine eigene Bildquelle mit. Zwei Arten, mit einem echten
 * fachlichen Unterschied:
 *
 * 'svg'  - handgezeichnete Vektorszene. Jeder Gegenstand ist eine eigene
 *          Gruppe und damit einzeln ansprechbar: Klickt das Kind ein Wort an,
 *          hebt sich der Gegenstand selbst hervor, alles andere wird gedimmt.
 *          Aufwaendig herzustellen, didaktisch am staerksten.
 *
 * 'bild' - Rasterbild (WebP). Schnell verfuegbar und optisch reicher, aber
 *          die Pixel sind nicht adressierbar. Statt echter Hervorhebung gibt
 *          es Trefferflaechen an den hinterlegten Koordinaten. Der Kompromiss
 *          ist bewusst und steht im Lehrkraft-Bereich transparent dabei.
 */
export type Szene =
  | { art: 'svg'; komponente: 'klassenzimmer' }
  | {
      art: 'bild'
      /** Pfad unterhalb von public/, z. B. "bilder/wochenmarkt-1600.webp". */
      quelle: string
      /** Schmalere Fassung fuer kleine Bildschirme. */
      quelleKlein?: string
      breite: number
      hoehe: number
      /** Bildbeschreibung fuer Screenreader - Pflicht, nicht optional. */
      alt: string
    }

// ---------------------------------------------------------------------------
// Lesetext
// ---------------------------------------------------------------------------

/**
 * Ein Absatz des Lesetexts, bereits in Saetze zerlegt.
 * Die Zerlegung passiert redaktionell, nicht per Regex - so bleibt die
 * Satz-fuer-Satz-Vorlesefunktion und die Zeilenfokus-Hilfe verlaesslich.
 */
export interface Absatz {
  id: string
  saetze: string[]
}

export interface Lesetext {
  titel: string
  absaetze: Absatz[]
  /** Redaktionell gepflegte Kennzahlen; werden im Lehrkraft-Bereich angezeigt. */
  kennzahlen: {
    woerter: number
    saetze: number
    woerterProSatzDurchschnitt: number
    langstesWort: string
  }
}

// ---------------------------------------------------------------------------
// Aufgaben
// ---------------------------------------------------------------------------

/** Verstehensebene nach Barrett - steuert die Auswertung im Lehrkraft-Bereich. */
export type Verstehensebene =
  /** Information steht woertlich im Text. */
  | 'literal'
  /** Information muss aus dem Text erschlossen werden. */
  | 'inferentiell'
  /** Text muss neu geordnet / zusammengefasst werden. */
  | 'reorganisierend'
  /** Eigene Bewertung, gestuetzt auf den Text. */
  | 'wertend'
  /** Sprachbetrachtung (Grammatik, Genus, Rechtschreibung). */
  | 'sprachbetrachtend'

export type Niveaustufe = 'einfach' | 'standard' | 'anspruchsvoll'

interface AufgabeBasis {
  id: string
  /** Arbeitsauftrag in kindgerechter Sprache. */
  frage: string
  ebene: Verstehensebene
  /** Ab welcher Niveaustufe die Aufgabe gestellt wird. */
  abStufe: Niveaustufe
  /** Gestufte Hilfen. Werden nach Fehlversuchen nacheinander freigeschaltet. */
  hilfen: string[]
  /** Erklaerung der Loesung, wird nach Abschluss gezeigt. */
  loesungserklaerung: string
  /** Verweis auf die Textstelle (Absatz-ID), an der die Antwort steht. */
  belegAbsatz?: string
  /**
   * Bildstuetze: ID eines Wortschatz-Objekts. Ist sie gesetzt, zeigt die
   * Aufgabe einen Ausschnitt der Szene mit genau diesem Gegenstand.
   *
   * Fuer Kinder mit wenig Deutschkontakt ist das der Unterschied zwischen
   * "Aufgabe nicht loesbar" und "Aufgabe loesbar": Sie muessen den Satz dann
   * nicht aus dem Gedaechtnis pruefen, sondern koennen hinsehen.
   */
  bildObjekt?: string
  /**
   * Bildstuetze als ganze Szene statt als Einzelgegenstand. 'tisch' zeigt die
   * Tischplatte mit allen Schulsachen - die Vorlage fuer Schreibauftraege, in
   * denen das Kind selbst auswaehlt, worueber es einen Satz schreibt.
   */
  bildSzene?: 'raum' | 'tisch'
  /**
   * Antwort in ein Heft schreiben statt in die App tippen.
   *
   * Gilt fuer individuelle Schreibleistungen (eigene Saetze, eigene Texte).
   * Die App deckt hier BEWUSST keine Musterloesung auf: Was das Kind
   * geschrieben hat, kann nur ein Mensch beurteilen - Rechtschreibung,
   * Satzbau und Inhalt zugleich. Eine automatische "Loesung" wuerde
   * vortaeuschen, es gaebe genau einen richtigen Satz.
   */
  imHeft?: boolean
}

/** Einfachauswahl aus mehreren Optionen. */
export interface AufgabeAuswahl extends AufgabeBasis {
  typ: 'auswahl'
  optionen: { id: string; text: string }[]
  richtig: string
}

/**
 * Richtig / Falsch / Steht nicht im Text.
 * Die dritte Option ist didaktisch zentral: sie verhindert Raten und
 * trainiert die Unterscheidung "im Text belegt" vs. "nur vermutet".
 */
export type WahrheitsWert = 'richtig' | 'falsch' | 'unbekannt'

export interface AufgabeWahrheit extends AufgabeBasis {
  typ: 'wahrheit'
  aussagen: { id: string; text: string; richtig: WahrheitsWert; begruendung: string }[]
  /**
   * Nur "richtig" und "falsch" anbieten, ohne die dritte Option.
   *
   * Die dritte Option ist bei Textarbeit didaktisch zentral - bei einer
   * BILDgestuetzten Aufgabe waere sie sinnlos: Was man sieht, sieht man.
   * "Der Radiergummi ist rosa und blau" ist am Bild entscheidbar, und ein
   * drittes Feld wuerde nur verwirren.
   */
  nurRichtigFalsch?: boolean
}

/** Kurze Freitextantwort - hier greift die Fuzzy-Korrektur. */
export interface AufgabeFreitext extends AufgabeBasis {
  typ: 'freitext'
  /** Alle akzeptierten Antworten. Die erste gilt als Musterloesung. */
  akzeptiert: string[]
  /** Erwartet die Antwort einen Artikel? Dann wird er getrennt bewertet. */
  artikelPflicht: boolean
  /** Platzhalter im Eingabefeld. */
  platzhalter: string
  /**
   * Wo das Kind die Antwort suchen soll, wenn es danebenliegt.
   *
   * Steuert nur den Verweis in der Rueckmeldung, nicht die Bewertung. Ohne
   * Angabe gilt 'text', weil die meisten Freitextaufgaben zum Lesetext
   * gehoeren. Im Bild-Wort-Bereich gibt es aber gar keinen Text - dort
   * stand "Schau noch einmal in den Text" ueber einem Bild.
   */
  stuetze?: 'text' | 'bild'
}

/** Lueckentext mit vorgegebener Wortbank. */
export interface AufgabeLuecken extends AufgabeBasis {
  typ: 'luecken'
  /** Textbausteine; `null` markiert eine Luecke. */
  teile: (string | null)[]
  /** Loesungen in der Reihenfolge der Luecken. */
  loesungen: string[]
  /** Auswahlwoerter inkl. Distraktoren. */
  wortbank: string[]
}

/** Ereignisse in die richtige Reihenfolge bringen. */
export interface AufgabeReihenfolge extends AufgabeBasis {
  typ: 'reihenfolge'
  /** Schritte in der KORREKTEN Reihenfolge; das UI mischt sie deterministisch. */
  schritte: { id: string; text: string }[]
}

/** Jedem Nomen den richtigen Artikel zuordnen. */
export interface AufgabeArtikel extends AufgabeBasis {
  typ: 'artikel'
  /** IDs aus dem Wortschatz des Moduls. */
  woerter: string[]
}

/**
 * Einzahl und Mehrzahl an einer Menge von Gegenstaenden.
 *
 * Das Bild zeigt n Stueck eines Gegenstands, das Kind schreibt die passende
 * Form: bei n = 1 "der Radiergummi", bei n > 1 "zwei Radiergummis" - die Zahl
 * ausgeschrieben, nicht als Ziffer. Genau daran haengt die Regel, die im
 * Hefteintrag steht: Nach Zahlen groesser als eins steht das Nomen im Plural.
 *
 * `mitIstSind` koppelt die Uebung an das Grammatikthema "ist / sind": Dann
 * lautet die erwartete Antwort "Das ist der Radiergummi." bzw. "Das sind zwei
 * Radiergummis." - Menge und Verbform werden zusammen geuebt, weil sie
 * zusammen gehoeren.
 */
export interface MengenRunde {
  id: string
  /** Wortschatz-ID des gezeigten Gegenstands. */
  wortId: string
  /** Wie viele Stueck im Bild liegen. 1 bis 5 - darueber wird Zaehlen zur Nebenaufgabe. */
  anzahl: number
}

export interface AufgabeMenge extends AufgabeBasis {
  typ: 'menge'
  /**
   * Ausgearbeitetes Beispiel, das VOR der ersten Runde steht (Worked Example
   * Effect, Sweller): Erst zeigen, wie es geht, dann selbst machen.
   */
  beispiel: { wortId: string; anzahl: number; satz: string }[]
  runden: MengenRunde[]
  mitIstSind: boolean
}

/**
 * Ein Schreibauftrag fuer das Heft - die App nimmt hier KEINE Antwort entgegen.
 *
 * Warum das ein eigener Aufgabentyp ist und keine Freitextaufgabe: Was ein
 * Kind selbst formuliert, kann nur ein Mensch beurteilen. Eine automatische
 * Musterloesung wuerde behaupten, es gaebe genau einen richtigen Satz - und
 * das Kind wuerde abschreiben statt schreiben. Die App fuehrt den Auftrag
 * daher nur, meldet ihn als "wartet auf Korrektur" an den Lehrkraft-Bereich
 * und deckt nichts auf.
 */
export type HeftArt = 'vokabelheft' | 'linguiniheft'

export interface AufgabeHeft extends AufgabeBasis {
  typ: 'heft'
  heft: HeftArt
  /**
   * Zeilen, die 1:1 ins Heft abgeschrieben werden (Merktexte, Regeln,
   * Vokabeln). Die duerfen sichtbar sein - Abschreiben IST hier die Aufgabe.
   */
  abschreiben?: string[]
  /**
   * Musterzeilen, die die FORM zeigen, aber nicht die Loesung: "Das Lineal ist
   * gelb." als Vorbild fuer eigene Saetze ueber andere Gegenstaende.
   */
  musterSaetze?: string[]
  /** Wie viele eigene Saetze/Zeilen erwartet werden. */
  umfang?: string
}

export type Aufgabe =
  | AufgabeAuswahl
  | AufgabeWahrheit
  | AufgabeFreitext
  | AufgabeLuecken
  | AufgabeReihenfolge
  | AufgabeArtikel
  | AufgabeMenge
  | AufgabeHeft

export type AufgabenTyp = Aufgabe['typ']

// ---------------------------------------------------------------------------
// Grammatik: erst der Hefteintrag, dann die Uebung
// ---------------------------------------------------------------------------

/**
 * Ein Grammatikthema laeuft in genau dieser Reihenfolge ab:
 * 1. Hefteintrag lesen und ins linierte Heft abschreiben,
 * 2. danach die Uebungen in der App.
 *
 * Diese Reihenfolge ist keine Deko: Die Regel steht dann in der eigenen
 * Handschrift im eigenen Heft und ist im Unterricht nachschlagbar - auch
 * ohne Geraet. Die App ist die Uebung, nicht der Merktext.
 *
 * Der Hefteintrag ist aus Bausteinen aufgebaut, weil die beiden Themen
 * unterschiedlich aussehen: "ist/sind" stellt Einzahl und Mehrzahl
 * gegenueber, "ein/eine" ordnet nach den drei Geschlechtern.
 */

/** n Stueck eines Gegenstands aus dem Wortschatz, als kleine Illustration. */
export interface HeftBild {
  wortId: string
  anzahl: number
}

export type HeftBlock =
  /** Regelzeile mit farbiger Marke davor - im handschriftlichen Vorbild ein Pfeil. */
  | { art: 'regel'; schluesselwort: string; ton: 'einzahl' | 'mehrzahl'; text: string; bild?: HeftBild[] }
  /** Umrandeter Kasten mit Fliesstext. */
  | { art: 'kasten'; titel?: string; zeilen: string[] }
  /** Zweispaltig: links Einzahl, rechts Mehrzahl. */
  | {
      art: 'gegenueberstellung'
      titel: string
      zeilen: { links: string; linksBild: HeftBild; rechts: string; rechtsBild: HeftBild }[]
    }
  /** Drei Genus-Spalten nebeneinander. */
  | {
      art: 'genusspalten'
      spalten: {
        genus: Genus
        bezeichnung: string
        regel: string
        beispiele: { satz: string; bild: HeftBild }[]
      }[]
    }
  /** Der Merke-Kasten am Fuss des Eintrags. */
  | { art: 'merke'; zeilen: string[] }
  /** Die hervorgehobene Wichtig-Zeile. */
  | { art: 'wichtig'; text: string; beispiele?: string[] }

// ---------------------------------------------------------------------------
// Jahrgangsfassungen des Lesetexts
// ---------------------------------------------------------------------------

/**
 * Die vier Jahrgaenge der Mittelschule (10 bis 14 Jahre).
 *
 * Bewusst eine eigene Achse NEBEN der Niveaustufe, nicht statt ihr: Der
 * Jahrgang sagt, wie ALT das Kind ist, die Niveaustufe, wie sicher es im
 * Deutschen ist. Beides faellt bei DaZ-Lernenden regelmaessig auseinander -
 * eine Vierzehnjaehrige mit vier Monaten Deutschkontakt braucht einen
 * altersgerechten Inhalt in einfacher Sprache, keinen Text fuer Zehnjaehrige.
 */
export type Jahrgangsstufe = 'ms1' | 'ms2' | 'ms3' | 'ms4'

export const JAHRGANG_ORDNUNG: Jahrgangsstufe[] = ['ms1', 'ms2', 'ms3', 'ms4']

export interface Jahrgangstext {
  jahrgang: Jahrgangsstufe
  /** Kurzform fuer die Umschaltleiste, z. B. "1. Klasse". */
  kurz: string
  /** Ausgeschrieben fuer den Lehrkraft-Bereich. */
  bezeichnung: string
  /** Zielalter, z. B. "10 bis 11 Jahre". */
  alter: string
  /** Was diese Fassung sprachlich anders macht - fuer die Lehrkraft. */
  sprachprofil: string
  lesetext: Lesetext
  /** Eigene Aufgaben: Eine Frage zu Text A ergibt zu Text B keinen Sinn. */
  aufgaben: Aufgabe[]
}

export interface Grammatikthema {
  id: string
  /** Ueberschrift des Hefteintrags, z. B. "Ist / sind". */
  titel: string
  untertitel: string
  /** Der Hefteintrag - genau das, was ins linierte Heft kommt. */
  hefteintrag: HeftBlock[]
  /** Uebungen, die NACH dem Hefteintrag freigeschaltet werden. */
  aufgaben: Aufgabe[]
  /** Hinweise fuer die Lehrkraft zu diesem Thema. */
  hinweise: string[]
}

// ---------------------------------------------------------------------------
// Lehrkraft-Ebene
// ---------------------------------------------------------------------------

export interface Kompetenz {
  /** Quelle, z. B. "LehrplanPLUS Bayern, D 3/4" oder "KMK Bildungsstandards". */
  quelle: string
  /** Bereichsbezeichnung, z. B. "Lesen - mit Texten umgehen". */
  bereich: string
  /** Woertliche oder eng angelehnte Kompetenzformulierung. */
  formulierung: string
}

export interface Differenzierung {
  stufe: Niveaustufe
  fuerWen: string
  massnahmen: string[]
}

// ---------------------------------------------------------------------------
// Modul
// ---------------------------------------------------------------------------

export interface Modul {
  id: string
  titel: string
  untertitel: string
  /** GER-Niveau, z. B. "A2". */
  niveau: string
  jahrgang: string
  /** Geschaetzte Bearbeitungsdauer in Minuten. */
  dauerMinuten: number
  /** Die Bildquelle des Bild-Wort-Teils. */
  szene: Szene
  wortschatz: Wort[]
  /**
   * Portionierung des Lernwortschatzes. Fehlt sie, bilden alle Lernwoerter
   * ein einziges Paket (siehe `wortpaketeVon`) - fuer kleine Module reicht das.
   */
  wortpakete?: Wortpaket[]
  /** Standardfassung des Lesetexts - bei Modulen mit Jahrgangsfassungen die mittlere. */
  lesetext: Lesetext
  aufgaben: Aufgabe[]
  /**
   * Fassungen desselben Themas fuer die vier Jahrgaenge der Mittelschule.
   * Fehlen sie, gibt es nur `lesetext`/`aufgaben` und keine Jahrgangswahl.
   */
  jahrgangstexte?: Jahrgangstext[]
  /** Grammatikthemen: je Thema erst der Hefteintrag, dann die Uebungen. */
  grammatik?: Grammatikthema[]
  /**
   * Auftraege fuer das Vokabelheft und das linierte Linguini-Heft, die
   * unabhaengig vom Lesetext gelten - sie stehen beim Bild-Wort-Teil.
   */
  heftauftraege?: AufgabeHeft[]
  lernziele: string[]
  kompetenzen: Kompetenz[]
  differenzierung: Differenzierung[]
  /** Hinweise fuer die Lehrkraft zur Vorentlastung im Unterricht. */
  unterrichtshinweise: string[]
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

export const istLernwort = (w: Wort): boolean => w.neu

export function wortMitArtikel(w: Wort): string {
  return `${w.genus} ${w.nomen}`
}

export function findeWort(modul: Modul, id: string): Wort | undefined {
  return modul.wortschatz.find((w) => w.id === id)
}

/** Reihenfolge der Niveaustufen, aufsteigend. */
export const STUFEN_ORDNUNG: Niveaustufe[] = ['einfach', 'standard', 'anspruchsvoll']

export function aufgabeSichtbar(aufgabe: Aufgabe, stufe: Niveaustufe): boolean {
  return STUFEN_ORDNUNG.indexOf(stufe) >= STUFEN_ORDNUNG.indexOf(aufgabe.abStufe)
}

/**
 * Die Lernpakete eines Moduls. Ohne gepflegte Pakete bilden alle Lernwoerter
 * eines - so bleiben aeltere Module ohne Aenderung lauffaehig.
 */
export function wortpaketeVon(modul: Modul): Wortpaket[] {
  if (modul.wortpakete && modul.wortpakete.length > 0) return modul.wortpakete
  return [
    {
      id: 'alle',
      titel: 'Alle Wörter',
      woerter: modul.wortschatz.filter(istLernwort).map((w) => w.id),
    },
  ]
}

/** Die Woerter eines Pakets, in gepflegter Reihenfolge und ohne Luecken. */
export function woerterVonPaket(modul: Modul, paket: Wortpaket): Wort[] {
  return paket.woerter
    .map((id) => findeWort(modul, id))
    .filter((w): w is Wort => w !== undefined)
}

/**
 * Zahlwoerter fuer die Einzahl-/Mehrzahl-Uebung. Ausgeschrieben, nicht als
 * Ziffer - genau das ist dort der Lerngegenstand.
 */
export const ZAHLWOERTER: readonly string[] = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf']

export function zahlwort(anzahl: number): string {
  return ZAHLWOERTER[anzahl] ?? String(anzahl)
}

/**
 * Die Pluralform ohne Artikel. `plural` ist redaktionell inklusive Artikel
 * gepflegt ("die Radiergummis"), fuer Mengenangaben braucht es nur das Nomen.
 */
export function pluralNomen(wort: Wort): string | null {
  if (!wort.plural) return null
  const teile = wort.plural.trim().split(/\s+/)
  if (teile.length > 1 && ['der', 'die', 'das'].includes(teile[0]!.toLocaleLowerCase('de-DE'))) {
    return teile.slice(1).join(' ')
  }
  return wort.plural.trim()
}

/**
 * Die erwartete Antwort einer Mengen-Runde.
 * n = 1  -> "der Radiergummi"        bzw. "Das ist der Radiergummi."
 * n > 1  -> "zwei Radiergummis"      bzw. "Das sind zwei Radiergummis."
 */
export function mengenLoesung(wort: Wort, anzahl: number, mitIstSind: boolean): string {
  const kern =
    anzahl === 1
      ? wortMitArtikel(wort)
      : `${zahlwort(anzahl)} ${pluralNomen(wort) ?? wort.nomen}`
  if (!mitIstSind) return kern
  return anzahl === 1 ? `Das ist ${kern}.` : `Das sind ${kern}.`
}
