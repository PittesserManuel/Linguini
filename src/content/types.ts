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
  /** Ankerpunkt der Beschriftung im Bild, in Prozent der Bildflaeche (0-100). */
  punkt: { x: number; y: number }
  /** Auf welche Seite des Ankerpunkts das Label gesetzt wird. */
  labelSeite: 'links' | 'rechts' | 'oben' | 'unten'
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

export type Aufgabe =
  | AufgabeAuswahl
  | AufgabeWahrheit
  | AufgabeFreitext
  | AufgabeLuecken
  | AufgabeReihenfolge
  | AufgabeArtikel

export type AufgabenTyp = Aufgabe['typ']

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
  wortschatz: Wort[]
  lesetext: Lesetext
  aufgaben: Aufgabe[]
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
