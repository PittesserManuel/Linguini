import type { Modul } from './types'
import { modulKlassenzimmer } from './modul-klassenzimmer'
import { modulWochenmarkt } from './modul-wochenmarkt'

/**
 * Das Modulverzeichnis.
 *
 * Ein neues Modul einzuhaengen heisst: Datendatei schreiben, hier eintragen,
 * fertig. Es gibt keinen Ort, an dem zusaetzlich React-Code noetig waere -
 * genau das ist mit "Inhalte sind Daten" gemeint.
 */
export const MODULE: readonly Modul[] = [modulKlassenzimmer, modulWochenmarkt]

export const STANDARD_MODUL_ID = modulKlassenzimmer.id

export function findeModul(id: string): Modul {
  const modul = MODULE.find((m) => m.id === id)
  if (!modul) {
    throw new Error(`Unbekanntes Modul "${id}". Bekannt sind: ${MODULE.map((m) => m.id).join(', ')}.`)
  }
  return modul
}
