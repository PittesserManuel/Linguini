/**
 * Reine Auswertungslogik: Lernstand + Modul -> Auswertung fuer den
 * Lehrkraft-Bereich.
 *
 * BEWUSST ohne React-Import: Diese Datei rechnet nur, sie rendert nichts.
 * Das macht sie unabhaengig testbar (siehe grading/grading.test.ts als
 * Vorbild) und spaeter wiederverwendbar, z. B. fuer einen Export als PDF
 * oder CSV, ohne dass die UI-Schicht angefasst werden muss.
 *
 * Grundsatzentscheidung (siehe state/types.ts): Wir werten NICHT
 * "X % richtig" aus, sondern diagnostische Kennzahlen, die eine Lehrkraft
 * tatsaechlich als Foerderfrage stellt. Die Rohspur dafuer ist
 * `AufgabenStand.versuche` - jede Kennzahl unten liest entweder direkt aus
 * dieser Spur oder aus den beiden abschliessenden Flags
 * `geloest`/`aufgeloest`, nie aus einer Punktzahl.
 */

import { aufgabeSichtbar, istLernwort } from '@/content/types'
import type { Aufgabe, Modul } from '@/content/types'
import type { Fehlerart } from '@/grading/types'
import type { AufgabenStand, Auswertung, Lernstand } from '@/state/types'

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/**
 * Median mit korrekter Behandlung gerader Anzahl (Mittel der beiden
 * mittleren Werte). `null` bei leerer Liste - es gibt schlicht keinen Median.
 */
function median(werte: number[]): number | null {
  if (werte.length === 0) return null
  const sortiert = [...werte].sort((a, b) => a - b)
  const mitte = Math.floor(sortiert.length / 2)
  if (sortiert.length % 2 === 1) {
    return sortiert[mitte]!
  }
  const untererWert = sortiert[mitte - 1]!
  const obererWert = sortiert[mitte]!
  return (untererWert + obererWert) / 2
}

/** Hat die Aufgabe mindestens einen Versuch, der nicht "richtig" bewertet wurde? */
function hatFehlversuch(stand: AufgabenStand): boolean {
  return stand.versuche.some((versuch) => versuch.bewertung !== 'richtig')
}

// ---------------------------------------------------------------------------
// Die Auswertung
// ---------------------------------------------------------------------------

/**
 * Alle Aufgaben eines Moduls - aus dem Leseweg, aus den Grammatikthemen und
 * die freistehenden Heftauftraege.
 *
 * Ohne diese Zusammenfuehrung wuerde die Auswertung nur den Lesetext kennen
 * und behaupten, ein Kind habe nichts gemacht, das eine Stunde lang Grammatik
 * geuebt hat.
 */
export function alleAufgaben(modul: Modul): Aufgabe[] {
  return [
    ...modul.aufgaben,
    ...(modul.grammatik ?? []).flatMap((thema) => thema.aufgaben),
    ...(modul.heftauftraege ?? []),
  ]
}

export function berechneAuswertung(lernstand: Lernstand, modul: Modul): Auswertung {
  // Nur Aufgaben, die auf der aktuellen Niveaustufe ueberhaupt gestellt
  // werden - alles andere waere fuer dieses Kind in dieser Sitzung nicht
  // erreichbar und wuerde "gesamt" verzerren (siehe aufgabeSichtbar in
  // content/types.ts).
  //
  // Heft-Auftraege bleiben aussen vor: Sie sind nie "richtig" oder "falsch",
  // sondern offen, bis eine Lehrperson hineingeschaut hat. Sie in Quoten
  // einzurechnen wuerde jede Kennzahl darunter verfaelschen - sie stehen
  // stattdessen als eigene Arbeitsliste (offeneHeftauftraege) daneben.
  const alle = alleAufgaben(modul)
  const sichtbareAufgaben = alle.filter(
    (aufgabe) => aufgabe.typ !== 'heft' && aufgabeSichtbar(aufgabe, lernstand.stufe),
  )

  // Nur Aufgaben mit mindestens einem Versuch zaehlen als "bearbeitet" -
  // eine leere AufgabenStand-Karteikarte (durch fruehere Anlage) ist kein
  // Bearbeitungsnachweis.
  const staende = sichtbareAufgaben
    .map((aufgabe) => lernstand.aufgaben[aufgabe.id])
    .filter((stand): stand is AufgabenStand => stand !== undefined && stand.versuche.length > 0)

  const bearbeitet = staende.length
  const gesamt = sichtbareAufgaben.length

  const ersterVersuchRichtig = staende.filter((stand) => stand.versuche[0]?.bewertung === 'richtig').length

  // Selbstkorrekturquote: von allen Aufgaben, bei denen mindestens EIN
  // Versuch nicht "richtig" war, wie viele wurden am Ende doch selbst
  // geloest - ohne dass die Loesung aufgedeckt werden musste?
  const mitFehlversuch = staende.filter(hatFehlversuch)
  const selbstKorrigiert = mitFehlversuch.filter((stand) => stand.geloest && !stand.aufgeloest)
  const selbstkorrekturQuote = mitFehlversuch.length > 0 ? selbstKorrigiert.length / mitFehlversuch.length : null

  const versucheBisLoesung = staende
    .filter((stand) => stand.geloest && !stand.aufgeloest)
    .map((stand) => stand.versuche.length)
  const versucheBisLoesungMedian = median(versucheBisLoesung)

  // Fehlerprofil: Haeufigkeit je Fehlerart ueber ALLE Versuche (nicht nur
  // den letzten) - ein Fehler, der zweimal auftritt, ist ein staerkeres
  // Signal als einer, der nur einmal auftrat.
  const fehlerZaehler = new Map<Fehlerart, number>()
  for (const stand of staende) {
    for (const versuch of stand.versuche) {
      if (versuch.fehlerart === 'keine') continue
      fehlerZaehler.set(versuch.fehlerart, (fehlerZaehler.get(versuch.fehlerart) ?? 0) + 1)
    }
  }
  const fehlerprofil = [...fehlerZaehler.entries()]
    .map(([art, anzahl]) => ({ art, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)

  const hilfenGenutzt = staende.reduce(
    (summe, stand) => summe + stand.versuche.filter((versuch) => versuch.hilfeGenutzt).length,
    0,
  )

  const aufgeloest = staende.filter((stand) => stand.aufgeloest).map((stand) => stand.aufgabeId)

  // Genus-Unsicherheit kommt bewusst aus `lernstand.woerter`, nicht aus dem
  // Fehlerprofil der Aufgaben: WortStand ist laut state/types.ts genau dafuer
  // angelegt ("speist die Wortschatz-Uebersicht der Lehrkraft") und fasst
  // Artikel-Versuche aus allen Quellen zusammen (Wortkarte UND Artikel-Aufgabe).
  const genusUnsicher = modul.wortschatz
    .filter(istLernwort)
    .filter((wort) => (lernstand.woerter[wort.id]?.artikelFalsch ?? 0) > 0)
    .map((wort) => wort.id)

  const offeneHeftauftraege = alle
    .filter((aufgabe) => aufgabe.typ === 'heft')
    .filter((aufgabe) => (lernstand.aufgaben[aufgabe.id]?.versuche.length ?? 0) > 0)
    .map((aufgabe) => aufgabe.id)

  return {
    bearbeitet,
    gesamt,
    ersterVersuchRichtig,
    selbstkorrekturQuote,
    versucheBisLoesungMedian,
    fehlerprofil,
    hilfenGenutzt,
    aufgeloest,
    genusUnsicher,
    offeneHeftauftraege,
  }
}
