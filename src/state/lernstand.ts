/**
 * Lernstand-Verwaltung fuer eine Sitzung.
 *
 * useReducer haelt die eigentlichen Lerndaten (Versuche, geloeste Aufgaben,
 * Wortsicherheit) - eine einzige Stelle, an der sich diese Uebergaenge
 * vollziehen. Persistenz ist bewusst als Nebeneffekt (useEffect) daneben
 * gestellt, nicht in den Reducer verwoben: Sie greift NUR, wenn die Nutzerin
 * das Speichern aktiv eingeschaltet hat (Voreinstellung: AUS). Das ist
 * Datensparsamkeit als Voreinstellung, nicht als nachtraeglicher Schalter.
 */

import { useCallback, useEffect, useReducer, useState } from 'react'
import type { Jahrgangsstufe, Niveaustufe } from '@/content/types'
import type { GraderErgebnis } from '@/grading/types'
import type { AufgabenStand, Lernstand, Versuch, WortStand } from './types'
import { LEERER_LERNSTAND } from './types'

/** Die eigentlichen Lerndaten - keine Personendaten, siehe state/types.ts. */
const SCHLUESSEL_DATEN = 'linguini.lernstand.v1'

/**
 * Eigener, kleiner Schluessel nur fuer die Ein/Aus-Praeferenz des Schalters
 * selbst. Das sind keine Lerndaten, sondern eine reine UI-Einstellung -
 * deshalb bleibt sie unabhaengig vom Datensparsamkeits-Schalter erhalten:
 * Eine Nutzerin, die einmal "speichern" gewaehlt hat, muss das nicht bei
 * jedem Seitenaufruf erneut tun.
 */
const SCHLUESSEL_SCHALTER = 'linguini.lernstand.speichern.v1'

// ---------------------------------------------------------------------------
// localStorage-Zugriffe - immer in try/catch: Privatmodus wirft, und ein
// fehlschlagender Speicherzugriff darf die App niemals zum Absturz bringen.
// ---------------------------------------------------------------------------

function leseSpeichernPraeferenz(): boolean {
  try {
    return window.localStorage.getItem(SCHLUESSEL_SCHALTER) === 'true'
  } catch {
    return false
  }
}

function schreibeSpeichernPraeferenz(aktiv: boolean): void {
  try {
    window.localStorage.setItem(SCHLUESSEL_SCHALTER, String(aktiv))
  } catch {
    // Privatmodus o. Ae. - die Praeferenz gilt dann eben nur fuer diese Sitzung.
  }
}

/** Laedt gespeicherte Lerndaten, aber nur, wenn sie zum aktuellen Modul passen. */
function leseGespeichertenLernstand(modulId: string): Lernstand | null {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL_DATEN)
    if (!roh) return null
    const geparst = JSON.parse(roh) as Partial<Lernstand> | null
    if (!geparst || geparst.modulId !== modulId) return null
    // Sinnvolle Defaults, falls die gespeicherten Daten aus einer aelteren
    // Version stammen und einzelne Felder fehlen.
    return {
      modulId,
      stufe: geparst.stufe ?? 'standard',
      jahrgang: geparst.jahrgang ?? null,
      aufgaben: geparst.aufgaben ?? {},
      woerter: geparst.woerter ?? {},
      begonnen: geparst.begonnen ?? null,
    }
  } catch {
    return null
  }
}

function schreibeLernstand(lernstand: Lernstand): void {
  try {
    window.localStorage.setItem(SCHLUESSEL_DATEN, JSON.stringify(lernstand))
  } catch {
    // Speichern ist eine Zusatzfunktion - ein Fehlschlag darf die App nicht stoeren.
  }
}

function loescheGespeichertenLernstand(): void {
  try {
    window.localStorage.removeItem(SCHLUESSEL_DATEN)
  } catch {
    // Nichts zu tun - dann gibt es ohnehin nichts Gespeichertes.
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Aktion =
  | { typ: 'ERGEBNIS_GEMELDET'; aufgabeId: string; ergebnis: GraderErgebnis; versuch: number; hilfeGenutzt: boolean }
  | { typ: 'WORT_ANGESEHEN'; wortId: string }
  | { typ: 'ARTIKEL_ANTWORT'; wortId: string; richtig: boolean }
  | { typ: 'EIGENE_SPRACHE_GESETZT'; wortId: string; text: string }
  | { typ: 'STUFE_GESETZT'; stufe: Niveaustufe }
  | { typ: 'JAHRGANG_GESETZT'; jahrgang: Jahrgangsstufe }
  | { typ: 'ZURUECKGESETZT' }

function leererAufgabenStand(aufgabeId: string): AufgabenStand {
  return { aufgabeId, versuche: [], geloest: false, aufgeloest: false, abgeschlossen: false }
}

function leererWortStand(wortId: string): WortStand {
  return { wortId, angesehen: 0, artikelRichtig: 0, artikelFalsch: 0 }
}

/** Setzt den Sitzungsbeginn beim ersten protokollierten Ereignis, sonst unveraendert. */
function mitBegonnen(stand: Lernstand): string {
  return stand.begonnen ?? new Date().toISOString()
}

function reducer(stand: Lernstand, aktion: Aktion): Lernstand {
  switch (aktion.typ) {
    case 'ERGEBNIS_GEMELDET': {
      const { aufgabeId, ergebnis, versuch, hilfeGenutzt } = aktion
      const bisheriger = stand.aufgaben[aufgabeId] ?? leererAufgabenStand(aufgabeId)
      const neuerVersuch: Versuch = {
        nummer: versuch,
        bewertung: ergebnis.bewertung,
        fehlerart: ergebnis.fehlerart,
        hilfeGenutzt,
      }

      const aktualisierterStand: AufgabenStand = {
        aufgabeId,
        versuche: [...bisheriger.versuche, neuerVersuch],
        geloest: bisheriger.geloest || ergebnis.bewertung === 'richtig',
        aufgeloest: bisheriger.aufgeloest || ergebnis.loesungZeigen,
        abgeschlossen: bisheriger.abgeschlossen || !ergebnis.nochmal,
      }

      return {
        ...stand,
        begonnen: mitBegonnen(stand),
        aufgaben: { ...stand.aufgaben, [aufgabeId]: aktualisierterStand },
      }
    }

    case 'WORT_ANGESEHEN': {
      const bisheriger = stand.woerter[aktion.wortId] ?? leererWortStand(aktion.wortId)
      return {
        ...stand,
        begonnen: mitBegonnen(stand),
        woerter: {
          ...stand.woerter,
          [aktion.wortId]: { ...bisheriger, angesehen: bisheriger.angesehen + 1 },
        },
      }
    }

    case 'ARTIKEL_ANTWORT': {
      const bisheriger = stand.woerter[aktion.wortId] ?? leererWortStand(aktion.wortId)
      return {
        ...stand,
        begonnen: mitBegonnen(stand),
        woerter: {
          ...stand.woerter,
          [aktion.wortId]: {
            ...bisheriger,
            artikelRichtig: bisheriger.artikelRichtig + (aktion.richtig ? 1 : 0),
            artikelFalsch: bisheriger.artikelFalsch + (aktion.richtig ? 0 : 1),
          },
        },
      }
    }

    case 'EIGENE_SPRACHE_GESETZT': {
      const bisheriger = stand.woerter[aktion.wortId] ?? leererWortStand(aktion.wortId)
      const getrimmt = aktion.text.trim()
      return {
        ...stand,
        // Absichtlich OHNE mitBegonnen(): Eine Uebersetzung ist kein
        // Aufgabenereignis. Sie soll die Sitzungsdauer im Lehrkraft-Bereich
        // nicht starten und nicht verlaengern.
        woerter: {
          ...stand.woerter,
          [aktion.wortId]: { ...bisheriger, eigeneSprache: getrimmt.length > 0 ? getrimmt : undefined },
        },
      }
    }

    case 'STUFE_GESETZT':
      return { ...stand, stufe: aktion.stufe }

    case 'JAHRGANG_GESETZT':
      return { ...stand, jahrgang: aktion.jahrgang }

    case 'ZURUECKGESETZT':
      return LEERER_LERNSTAND(stand.modulId, stand.stufe)

    default:
      return stand
  }
}

function anfangszustand(modulId: string, anfangsStufe: Niveaustufe): Lernstand {
  if (leseSpeichernPraeferenz()) {
    return leseGespeichertenLernstand(modulId) ?? LEERER_LERNSTAND(modulId, anfangsStufe)
  }
  return LEERER_LERNSTAND(modulId, anfangsStufe)
}

// ---------------------------------------------------------------------------
// Der Hook
// ---------------------------------------------------------------------------

export function useLernstand(modulId: string, anfangsStufe: Niveaustufe) {
  const [speichernAktiv, setSpeichernAktivIntern] = useState<boolean>(leseSpeichernPraeferenz)

  const [lernstand, dispatch] = useReducer(reducer, { modulId, anfangsStufe }, (anfang) =>
    anfangszustand(anfang.modulId, anfang.anfangsStufe),
  )

  // Persistenz als reiner Nebeneffekt: greift nur, wenn aktiv eingeschaltet.
  useEffect(() => {
    if (speichernAktiv) schreibeLernstand(lernstand)
  }, [lernstand, speichernAktiv])

  const meldeErgebnis = useCallback(
    (aufgabeId: string, ergebnis: GraderErgebnis, versuch: number, hilfeGenutzt: boolean): void => {
      dispatch({ typ: 'ERGEBNIS_GEMELDET', aufgabeId, ergebnis, versuch, hilfeGenutzt })
    },
    [],
  )

  const meldeWortAngesehen = useCallback((wortId: string): void => {
    dispatch({ typ: 'WORT_ANGESEHEN', wortId })
  }, [])

  const meldeArtikelAntwort = useCallback((wortId: string, richtig: boolean): void => {
    dispatch({ typ: 'ARTIKEL_ANTWORT', wortId, richtig })
  }, [])

  const meldeEigeneSprache = useCallback((wortId: string, text: string): void => {
    dispatch({ typ: 'EIGENE_SPRACHE_GESETZT', wortId, text })
  }, [])

  const setzeStufe = useCallback((stufe: Niveaustufe): void => {
    dispatch({ typ: 'STUFE_GESETZT', stufe })
  }, [])

  const setzeJahrgang = useCallback((jahrgang: Jahrgangsstufe): void => {
    dispatch({ typ: 'JAHRGANG_GESETZT', jahrgang })
  }, [])

  /** Loescht den Lernstand - im Speicher UND, falls vorhanden, in localStorage. */
  const zuruecksetzen = useCallback((): void => {
    dispatch({ typ: 'ZURUECKGESETZT' })
    loescheGespeichertenLernstand()
  }, [])

  /** Schaltet die Persistenz um. Beim Ausschalten wird sofort geloescht (Datensparsamkeit). */
  const setzeSpeichernAktiv = useCallback((aktiv: boolean): void => {
    setSpeichernAktivIntern(aktiv)
    schreibeSpeichernPraeferenz(aktiv)
    if (!aktiv) loescheGespeichertenLernstand()
  }, [])

  return {
    lernstand,
    meldeErgebnis,
    meldeWortAngesehen,
    meldeArtikelAntwort,
    meldeEigeneSprache,
    setzeStufe,
    setzeJahrgang,
    zuruecksetzen,
    speichernAktiv,
    setzeSpeichernAktiv,
  }
}
