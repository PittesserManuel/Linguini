/**
 * Der Bewertungs-Vertrag.
 *
 * WICHTIG - hier liegt die Nahtstelle zur spaeteren KI:
 * Alle Bewertung laeuft ueber das `Grader`-Interface. Heute steckt dahinter
 * reine, deterministische Logik (Normalisierung + Damerau-Levenshtein).
 * Morgen kann ein `KiGrader` dasselbe Interface implementieren und per API
 * bewerten - ohne dass eine einzige UI-Komponente angefasst werden muss.
 *
 * Bewusste Entwurfsentscheidung: `bewerte` ist async. Deterministisch loesen
 * wir sofort auf (`Promise.resolve`), aber die Aufrufer sind damit von Tag 1
 * auf einen Netzwerk-Grader vorbereitet. Ein spaeterer Umbau von sync auf
 * async waere sonst ein Umbau durch die gesamte Komponentenschicht.
 */

import type { Aufgabe, AufgabenTyp, Niveaustufe } from '@/content/types'

// ---------------------------------------------------------------------------
// Ergebnis
// ---------------------------------------------------------------------------

/**
 * Dreistufig, nicht zweistufig. "fast" ist der paedagogisch wichtigste Zustand:
 * Das Kind hat die Sache verstanden und nur die Schreibung verfehlt. Das als
 * "falsch" zu werten waere fachlich falsch und demotivierend.
 */
export type Bewertung = 'richtig' | 'fast' | 'falsch'

/**
 * Fehlerarten. Das ist die diagnostische Waehrung der Plattform: Der
 * Lehrkraft-Bereich wertet NICHT "70 % richtig" aus, sondern
 * "haeufigster Fehler: Genus". Genau danach fragen Lehrkraefte.
 */
export type Fehlerart =
  | 'keine'
  /** Wort inhaltlich richtig, aber verschrieben (Levenshtein-Naehe). */
  | 'rechtschreibung'
  /** Nomen richtig, Artikel falsch - der DaZ-Kernfehler. */
  | 'genus'
  /** Nomen kleingeschrieben. Hinweis, nicht Fehler. */
  | 'grossschreibung'
  /** Ein anderes existierendes Wort aus der Wortbank gewaehlt. */
  | 'wortwahl'
  /** Inhaltlich am Text vorbei. */
  | 'verstaendnis'
  /** Reihenfolge/Zuordnung teilweise richtig. */
  | 'teilweise'
  /** Nichts eingegeben. */
  | 'leer'

/** Rueckmeldung zu einer einzelnen Teilantwort (Luecke, Aussage, Wortpaar). */
export interface TeilErgebnis {
  id: string
  bewertung: Bewertung
  fehlerart: Fehlerart
  /** Was das Kind geantwortet hat (normalisiert fuer die Anzeige). */
  gegeben: string
  /** Die Musterloesung - erst nach Aufloesung anzeigen. */
  erwartet: string
  rueckmeldung: string
}

export interface GraderErgebnis {
  bewertung: Bewertung
  /** Anteil korrekter Teilantworten, 0..1. Bei Einzelantworten 0 oder 1. */
  punkte: number
  /**
   * Kindgerechter Feedback-Text. Harte Regel aus der Forschung
   * (Shute 2008, Hattie & Timperley 2007): maximal 2-3 Saetze,
   * aufgabenbezogen - niemals personenbezogen ("Du machst zu viele Fehler").
   */
  rueckmeldung: string
  /** Naechste gestufte Hilfe, falls vorhanden. */
  hinweis?: string
  fehlerart: Fehlerart
  teile?: TeilErgebnis[]
  /** Soll das Kind es noch einmal versuchen duerfen? */
  nochmal: boolean
  /** Musterloesung wird jetzt aufgedeckt (nach Versuchslimit). */
  loesungZeigen: boolean
}

// ---------------------------------------------------------------------------
// Eingabe
// ---------------------------------------------------------------------------

/**
 * Die Antwort des Kindes, typunabhaengig.
 * - auswahl:     { wert: "opt-b" }
 * - wahrheit:    { zuordnung: { "a1": "richtig", "a2": "unbekannt" } }
 * - freitext:    { wert: "der Radiergummi" }
 * - luecken:     { werte: ["Kleber", "Schere"] }
 * - reihenfolge: { werte: ["s3", "s1", "s2"] }
 * - artikel:     { zuordnung: { "lineal": "das" } }
 */
export interface Antwort {
  wert?: string
  werte?: string[]
  zuordnung?: Record<string, string>
}

export interface GraderKontext {
  /** 1-basiert. Steuert Feedback-Tiefe und Hilfe-Freischaltung. */
  versuch: number
  /** Ab hier wird die Loesung aufgedeckt. */
  maxVersuche: number
  stufe: Niveaustufe
}

// ---------------------------------------------------------------------------
// Das Interface
// ---------------------------------------------------------------------------

export interface Grader {
  /** Stabile Kennung, erscheint im Lehrkraft-Bereich als Nachweis der Methode. */
  readonly id: string
  /** "deterministisch" heute, "ki" spaeter - fuer Transparenz im UI. */
  readonly art: 'deterministisch' | 'ki' | 'hybrid'
  readonly typ: AufgabenTyp
  bewerte(antwort: Antwort, aufgabe: Aufgabe, ctx: GraderKontext): Promise<GraderErgebnis>
}

export const STANDARD_KONTEXT: Omit<GraderKontext, 'stufe'> = {
  versuch: 1,
  maxVersuche: 3,
}
