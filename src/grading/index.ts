/**
 * Oeffentliche Schnittstelle der Korrektur-Engine.
 *
 * Andere Teile der App importieren AUSSCHLIESSLICH von hier - nie direkt aus
 * graders.ts, normalize.ts oder distance.ts. Das haelt genau eine stabile
 * Nahtstelle, gegen die auch ein spaeterer KiGrader (siehe grading/types.ts)
 * programmiert werden kann.
 */

import type { Aufgabe, AufgabenTyp } from '@/content/types'
import type { Antwort, Grader, GraderErgebnis, GraderKontext } from './types'
import {
  artikelGrader,
  auswahlGrader,
  freitextGrader,
  heftGrader,
  lueckenGrader,
  mengeGrader,
  reihenfolgeGrader,
  wahrheitGrader,
} from './graders'

const REGISTRY: Record<AufgabenTyp, Grader> = {
  auswahl: auswahlGrader,
  wahrheit: wahrheitGrader,
  freitext: freitextGrader,
  luecken: lueckenGrader,
  reihenfolge: reihenfolgeGrader,
  artikel: artikelGrader,
  menge: mengeGrader,
  heft: heftGrader,
}

/** Liefert den passenden Grader fuer einen Aufgabentyp. */
export function graderFuer(typ: AufgabenTyp): Grader {
  return REGISTRY[typ]
}

/**
 * Bewertet eine Antwort. Waehlt ueber `graderFuer` den passenden Grader und
 * ruft ihn auf - der einzige Einstiegspunkt, den UI-Komponenten brauchen.
 */
export async function bewerte(antwort: Antwort, aufgabe: Aufgabe, ctx: GraderKontext): Promise<GraderErgebnis> {
  const grader = graderFuer(aufgabe.typ)
  return grader.bewerte(antwort, aufgabe, ctx)
}

export { faltUmlaute, istNomenGross, normalisiere } from './normalize'
export { damerauLevenshtein, schwelleFuer } from './distance'
