/**
 * Der Grammatikbereich - dritter Modulteil.
 *
 * Ablauf je Thema, in genau dieser Reihenfolge:
 *   1. Hefteintrag lesen und ins linierte Heft abschreiben,
 *   2. bestaetigen,
 *   3. Uebungen in der App.
 *
 * Die Reihenfolge ist erzwungen, nicht empfohlen. Der Grund ist fachlich:
 * Eine Regel, die man abgeschrieben hat, steht danach in der eigenen
 * Handschrift im eigenen Heft und ist im Unterricht nachschlagbar - auch ohne
 * Geraet, auch in der Pruefung, auch naechstes Jahr. Wer direkt uebt, hat am
 * Ende richtige Antworten und keinen Merktext. Die App ist die Uebung, das
 * Heft ist das Gedaechtnis.
 *
 * Der Hefteintrag bleibt waehrend der Uebungen aufklappbar stehen: Nachschlagen
 * duerfen ist Teil des Lernens, Auswendigkoennen ist hier nicht das Ziel.
 */

import { useEffect, useId, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { Grammatikthema, Modul, Niveaustufe } from '@/content/types'
import type { GraderErgebnis } from '@/grading/types'
import { Aufgaben } from '@/features/lesen'
import { Hefteintrag } from './Hefteintrag'
import './grammatik.css'

export interface GrammatikProps {
  modul: Modul
  stufe: Niveaustufe
  onErgebnis: (aufgabeId: string, ergebnis: GraderErgebnis, versuch: number, hilfeGenutzt: boolean) => void
}

type Phase = 'hefteintrag' | 'uebungen'

// ---------------------------------------------------------------------------
// Ein einzelnes Thema
// ---------------------------------------------------------------------------

function Thema(props: {
  thema: Grammatikthema
  modul: Modul
  stufe: Niveaustufe
  onErgebnis: GrammatikProps['onErgebnis']
}): ReactElement {
  const { thema, modul, stufe, onErgebnis } = props
  const [phase, setPhase] = useState<Phase>('hefteintrag')
  const [eintragOffen, setEintragOffen] = useState(true)
  const uebungenRef = useRef<HTMLDivElement>(null)

  // Themenwechsel: wieder von vorne. Ohne das wuerde ein Kind, das Thema 1
  // abgeschlossen hat, bei Thema 2 direkt in den Uebungen landen - ohne den
  // Merktext gesehen zu haben.
  useEffect(() => {
    setPhase('hefteintrag')
    setEintragOffen(true)
  }, [thema.id])

  useEffect(() => {
    if (phase === 'uebungen') uebungenRef.current?.focus()
  }, [phase])

  return (
    <div className="stapel grammatik__thema">
      <ol className="grammatik__schritte" aria-label="Ablauf">
        <li className={`grammatik__schritt${phase === 'hefteintrag' ? ' ist-aktiv' : ' ist-erledigt'}`}>
          <span className="grammatik__schritt-nummer">1</span>
          Merktext ins Heft schreiben
        </li>
        <li className={`grammatik__schritt${phase === 'uebungen' ? ' ist-aktiv' : ''}`}>
          <span className="grammatik__schritt-nummer">2</span>
          Übungen in der App
        </li>
      </ol>

      {phase === 'hefteintrag' ? (
        <>
          <p className="grammatik__anleitung">
            Schreibe diesen Merktext in dein liniertes Linguini-Heft. Nimm das Lineal für die
            Überschrift. Erst danach geht es weiter zu den Übungen.
          </p>
          <Hefteintrag titel={thema.titel} untertitel={thema.untertitel} bloecke={thema.hefteintrag} />
          <button type="button" className="knopf knopf--haupt" onClick={() => setPhase('uebungen')}>
            Ich habe den Merktext ins Heft geschrieben
          </button>
        </>
      ) : (
        <>
          <details
            className="karte karte--ruhig grammatik__nachschlagen"
            open={eintragOffen}
            onToggle={(ereignis) => setEintragOffen((ereignis.target as HTMLDetailsElement).open)}
          >
            <summary className="grammatik__nachschlagen-titel">Merktext nachschlagen</summary>
            <Hefteintrag titel={thema.titel} untertitel={thema.untertitel} bloecke={thema.hefteintrag} />
          </details>

          <div ref={uebungenRef} tabIndex={-1} className="grammatik__uebungen">
            <Aufgaben
              key={thema.id}
              modul={modul}
              stufe={stufe}
              aufgaben={thema.aufgaben}
              onErgebnis={onErgebnis}
              onBelegZeigen={() => undefined}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

export function Grammatik({ modul, stufe, onErgebnis }: GrammatikProps): ReactElement {
  const ueberschriftId = useId()
  const reiterId = useId()
  const themen = modul.grammatik ?? []
  const [themaId, setThemaId] = useState(themen[0]?.id ?? '')
  const aktivesThema = themen.find((t) => t.id === themaId) ?? themen[0]

  if (!aktivesThema) {
    return (
      <section className="stapel" aria-labelledby={ueberschriftId}>
        <h2 id={ueberschriftId}>Grammatik</h2>
        <p className="karte karte--ruhig">Für dieses Modul sind noch keine Grammatikthemen hinterlegt.</p>
      </section>
    )
  }

  return (
    <section className="grammatik stapel" aria-labelledby={ueberschriftId}>
      <h2 id={ueberschriftId}>Grammatik</h2>
      <p className="grammatik__vorspann">
        Jedes Thema hat zwei Teile: zuerst den Merktext für dein Heft, dann die Übungen.
      </p>

      {themen.length > 1 && (
        <div className="reiter" role="tablist" aria-label="Grammatikthema wählen">
          {themen.map((thema) => (
            <button
              key={thema.id}
              type="button"
              role="tab"
              id={`${reiterId}-tab-${thema.id}`}
              aria-selected={thema.id === aktivesThema.id}
              aria-controls={`${reiterId}-panel`}
              className="reiter__knopf"
              onClick={() => setThemaId(thema.id)}
            >
              {thema.titel}
            </button>
          ))}
        </div>
      )}

      <div id={`${reiterId}-panel`} role="tabpanel" aria-labelledby={`${reiterId}-tab-${aktivesThema.id}`}>
        <Thema key={aktivesThema.id} thema={aktivesThema} modul={modul} stufe={stufe} onErgebnis={onErgebnis} />
      </div>
    </section>
  )
}
