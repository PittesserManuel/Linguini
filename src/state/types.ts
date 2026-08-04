import type { Fehlerart, Bewertung } from '@/grading/types'
import type { Niveaustufe } from '@/content/types'

/**
 * Lernstand einer Sitzung.
 *
 * Datenschutz by Design: Hier stehen KEINE Personendaten. Kein Name, kein
 * Geburtsdatum, keine Klasse, keine Geraete-ID. Nur Aufgaben-IDs und
 * Fehlerarten. Die Daten verlassen das Geraet nicht und liegen ausschliesslich
 * im Arbeitsspeicher bzw. optional im localStorage des Browsers.
 *
 * Das ist kein Verzicht, sondern das Verkaufsargument: eine Schule kann die
 * Demo ohne Auftragsverarbeitungsvertrag und ohne Elterneinwilligung einsetzen.
 */

/** Ein einzelner Loesungsversuch - die Rohspur fuer die Diagnostik. */
export interface Versuch {
  nummer: number
  bewertung: Bewertung
  fehlerart: Fehlerart
  /** Hat das Kind vorher eine Hilfe geoeffnet? */
  hilfeGenutzt: boolean
}

export interface AufgabenStand {
  aufgabeId: string
  versuche: Versuch[]
  /** Am Ende erreicht - auch dann true, wenn es mehrere Anlaeufe brauchte. */
  geloest: boolean
  /** Loesung wurde nach Versuchslimit aufgedeckt. */
  aufgeloest: boolean
  abgeschlossen: boolean
}

/** Sicherheit pro Lernwort - speist die Wortschatz-Uebersicht der Lehrkraft. */
export interface WortStand {
  wortId: string
  /** Wie oft wurde das Wort angehoert / aufgedeckt? */
  angesehen: number
  /** Artikel richtig zugeordnet. */
  artikelRichtig: number
  artikelFalsch: number
}

export interface Lernstand {
  modulId: string
  stufe: Niveaustufe
  aufgaben: Record<string, AufgabenStand>
  woerter: Record<string, WortStand>
  /** Beginn der Sitzung als ISO-String - nur fuer die Dauer-Anzeige. */
  begonnen: string | null
}

// ---------------------------------------------------------------------------
// Abgeleitete Kennzahlen fuer den Lehrkraft-Bereich
// ---------------------------------------------------------------------------

/**
 * Bewusst NICHT "85 % richtig". Diese Kennzahlen beantworten die Frage, die
 * Lehrkraefte tatsaechlich stellen: Woran genau haengt es bei diesem Kind?
 */
export interface Auswertung {
  bearbeitet: number
  gesamt: number
  /** Im ersten Anlauf geloest. */
  ersterVersuchRichtig: number
  /** Nach einem Fehlversuch selbst korrigiert - starker Lernindikator. */
  selbstkorrekturQuote: number | null
  /** Median der Versuche bis zur Loesung. */
  versucheBisLoesungMedian: number | null
  /** Haeufigkeit je Fehlerart, absteigend sortiert. */
  fehlerprofil: { art: Fehlerart; anzahl: number }[]
  /** Wie oft wurden gestufte Hilfen genutzt? */
  hilfenGenutzt: number
  /** Aufgaben, bei denen die Loesung aufgedeckt werden musste. */
  aufgeloest: string[]
  /** Lernwoerter mit mindestens einem Genusfehler. */
  genusUnsicher: string[]
}

export const LEERER_LERNSTAND = (modulId: string, stufe: Niveaustufe): Lernstand => ({
  modulId,
  stufe,
  aufgaben: {},
  woerter: {},
  begonnen: null,
})
