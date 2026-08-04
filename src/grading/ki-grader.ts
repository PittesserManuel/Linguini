import type { Aufgabe, AufgabenTyp } from '@/content/types'
import type { Antwort, Grader, GraderErgebnis, GraderKontext } from './types'
import { graderFuer } from './index'

/**
 * Die Nahtstelle zur KI - heute noch nicht aktiv.
 *
 * Diese Datei ist der Beweis, dass der Bewertungs-Vertrag traegt: Der KiGrader
 * implementiert exakt dasselbe `Grader`-Interface wie die deterministischen
 * Grader. Er laesst sich an jeder Stelle einsetzen, an der heute ein
 * deterministischer Grader steht - ohne dass eine einzige UI-Komponente
 * angefasst werden muss.
 *
 * WICHTIG - warum hier kein Anthropic-SDK importiert wird:
 * Der API-Schluessel darf NIEMALS in den Browser. Alles, was im Frontend-Bundle
 * landet, ist oeffentlich lesbar - auch aus einer .env-Datei heraus, denn Vite
 * inlined solche Werte beim Build. Der KiGrader spricht deshalb ausschliesslich
 * mit einem EIGENEN Endpunkt (`/api/bewerte`), der serverseitig laeuft und dort
 * den Schluessel haelt. Wie dieser Endpunkt aussieht, steht in
 * docs/KI-ANBINDUNG.md.
 *
 * Ausserdem paedagogisch begruendet: Wortschatz- und Artikelaufgaben bleiben
 * bewusst deterministisch. Bei "der/die/das" ist Nachvollziehbarkeit wichtiger
 * als Sprachgefuehl - eine Lehrkraft muss begruenden koennen, warum eine
 * Antwort als falsch gilt. Die KI ist fuer das gedacht, was Regeln nicht
 * leisten: freiere Schreibaufgaben, Begruendungen, eigene Formulierungen.
 */

export interface KiGraderOptionen {
  /** Eigener Endpunkt. NIEMALS direkt api.anthropic.com. */
  endpunkt: string
  /** Abbruch nach dieser Zeit; danach greift der deterministische Grader. */
  zeitlimitMs?: number
  /**
   * Faellt bei Fehler, Zeitueberschreitung oder unplausibler Antwort auf die
   * deterministische Bewertung zurueck. Standard: true.
   *
   * Das ist keine Bequemlichkeit, sondern Betriebssicherheit: Ein Kind darf nie
   * vor einer kaputten Aufgabe sitzen, weil ein Netzwerkaufruf gescheitert ist.
   */
  fallback?: boolean
}

/** Was der Server zurueckliefert. Absichtlich klein und streng geprueft. */
interface KiAntwort {
  bewertung: GraderErgebnis['bewertung']
  punkte: number
  rueckmeldung: string
  fehlerart: GraderErgebnis['fehlerart']
  hinweis?: string
}

function istPlausibel(x: unknown): x is KiAntwort {
  if (typeof x !== 'object' || x === null) return false
  const a = x as Record<string, unknown>
  const bewertungOk =
    a['bewertung'] === 'richtig' || a['bewertung'] === 'fast' || a['bewertung'] === 'falsch'
  const punkteOk = typeof a['punkte'] === 'number' && a['punkte'] >= 0 && a['punkte'] <= 1
  const textOk = typeof a['rueckmeldung'] === 'string' && a['rueckmeldung'].trim().length > 0
  return bewertungOk && punkteOk && textOk
}

export class KiGrader implements Grader {
  readonly id = 'ki-grader-v1'
  readonly art = 'ki' as const

  constructor(
    readonly typ: AufgabenTyp,
    private readonly optionen: KiGraderOptionen,
  ) {}

  async bewerte(
    antwort: Antwort,
    aufgabe: Aufgabe,
    ctx: GraderKontext,
  ): Promise<GraderErgebnis> {
    const fallbackAn = this.optionen.fallback !== false
    const abbruch = new AbortController()
    const uhr = setTimeout(() => abbruch.abort(), this.optionen.zeitlimitMs ?? 8000)

    try {
      const antwortRoh = await fetch(this.optionen.endpunkt, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: abbruch.signal,
        // Es werden ausschliesslich Aufgaben-ID und die Antwort uebertragen.
        // Kein Name, keine Geraete-Kennung, kein Sitzungsschluessel.
        body: JSON.stringify({
          aufgabeId: aufgabe.id,
          typ: aufgabe.typ,
          antwort,
          versuch: ctx.versuch,
        }),
      })

      if (!antwortRoh.ok) throw new Error(`Bewertungsdienst antwortete mit ${antwortRoh.status}`)

      const daten: unknown = await antwortRoh.json()
      if (!istPlausibel(daten)) throw new Error('Unplausible Antwort des Bewertungsdienstes')

      const letzterVersuch = ctx.versuch >= ctx.maxVersuche
      const richtig = daten.bewertung === 'richtig'

      return {
        bewertung: daten.bewertung,
        punkte: daten.punkte,
        rueckmeldung: daten.rueckmeldung,
        ...(daten.hinweis ? { hinweis: daten.hinweis } : {}),
        fehlerart: daten.fehlerart ?? 'keine',
        nochmal: !richtig && !letzterVersuch,
        loesungZeigen: !richtig && letzterVersuch,
      }
    } catch (fehler) {
      if (!fallbackAn) throw fehler
      // Stiller, verlaesslicher Rueckfall. Das Kind merkt nichts davon.
      return graderFuer(aufgabe.typ).bewerte(antwort, aufgabe, ctx)
    } finally {
      clearTimeout(uhr)
    }
  }
}

/**
 * Baut eine Grader-Auswahl, in der einzelne Aufgabentypen an die KI gehen und
 * alle uebrigen deterministisch bleiben.
 *
 * So sieht der Umbau spaeter aus - eine Zeile, kein Komponentenumbau:
 *   const grader = hybrideAuswahl(['freitext'], { endpunkt: '/api/bewerte' })
 */
export function hybrideAuswahl(
  kiTypen: readonly AufgabenTyp[],
  optionen: KiGraderOptionen,
): (typ: AufgabenTyp) => Grader {
  const kiGrader = new Map<AufgabenTyp, Grader>(
    kiTypen.map((typ) => [typ, new KiGrader(typ, optionen)]),
  )
  return (typ) => kiGrader.get(typ) ?? graderFuer(typ)
}
