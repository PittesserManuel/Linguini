import type { Fehlerart, Bewertung } from '@/grading/types'
import type { Jahrgangsstufe, Niveaustufe } from '@/content/types'

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
  /**
   * Das Wort in der Erstsprache des Kindes, selbst eingetragen.
   *
   * In der DaZ-Wortschatzarbeit ist die Erstsprache kein Umweg, sondern der
   * kuerzeste Weg zur Bedeutung: Wer "Radiergummi" nicht kennt, dem hilft
   * eine Erklaerung aus fuenf weiteren deutschen Woertern wenig. Der
   * Heftauftrag verlangt diese Uebersetzung ohnehin ("uebersetze sie in
   * deine Sprache") - die App hatte dafuer nur keinen Platz.
   *
   * Bewusst ein freies Textfeld ohne Sprachauswahl und ohne
   * Uebersetzungsdienst: Es wird nichts erkannt, nichts gesendet, nichts
   * geprueft. Der Eintrag folgt exakt dem Speichern-Schalter (Voreinstellung
   * aus, dann nur fuer die Sitzung) und taucht in keiner Auswertung und in
   * keinem Elternbrief auf.
   */
  eigeneSprache?: string
}

export interface Lernstand {
  modulId: string
  stufe: Niveaustufe
  /**
   * Gewaehlte Jahrgangsfassung des Lesetexts, oder null bei Modulen ohne
   * Fassungen.
   *
   * Gehoert in den Lernstand und nicht in eine lokale Komponente, weil die
   * Auswertung ihn braucht: Ohne ihn wuesste sie nicht, WELCHE Aufgaben in
   * diesem Lernweg ueberhaupt erreichbar waren, und wuerde "bearbeitet 6 von
   * 25" melden, wo 6 von 9 richtig waere.
   */
  jahrgang: Jahrgangsstufe | null
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
  /**
   * Reichen die Daten fuer eine Aussage ueber das Kind?
   *
   * Unter einer Handvoll bearbeiteter Aufgaben sind Quoten Rauschen: "0 von
   * 1 richtig" und "0 %" mit einem Fehlerbalken ueber die volle Breite sieht
   * nach Alarm aus, obwohl nichts gemessen wurde. Der Lehrkraft-Bereich
   * blendet die Kennzahlen darunter aus und sagt stattdessen, dass es noch
   * zu frueh ist. Der Bearbeitungsstand bleibt sichtbar - der stimmt ab der
   * ersten Aufgabe.
   */
  aussagekraeftig: boolean
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
  /**
   * Schreibauftraege, die das Kind als erledigt gemeldet hat und die jetzt
   * eine Lehrperson im Heft ansehen muss.
   *
   * Bewusst KEINE Kennzahl, sondern eine Arbeitsliste: Die App hat diese
   * Texte nie gesehen: sie kann nicht sagen, ob sie stimmen, nur dass sie
   * geschrieben wurden.
   */
  offeneHeftauftraege: string[]
}

export const LEERER_LERNSTAND = (modulId: string, stufe: Niveaustufe): Lernstand => ({
  modulId,
  stufe,
  jahrgang: null,
  aufgaben: {},
  woerter: {},
  begonnen: null,
})
