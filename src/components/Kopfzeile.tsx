/**
 * Kopfzeile der App-Shell.
 *
 * Auf der Startseite zeigt sie nur die Marke "Linguini". Sobald ein Modul
 * laeuft (Prop `ansicht` gesetzt), kommen zwei Bedienelemente hinzu:
 * - die Reiterleiste zum Wechseln zwischen den drei Modulbereichen,
 * - die Niveaustufen-Wahl, sichtbar fuer das Kind, mit einem erklaerenden
 *   Zusatz fuer Erwachsene (details/summary - ohne eigenes JavaScript).
 */

import type { ReactElement } from 'react'
import type { Niveaustufe } from '@/content/types'
import { STUFEN_ORDNUNG } from '@/content/types'

export type ModulAnsicht = 'wortbild' | 'grammatik' | 'lesen' | 'lehrkraft'

interface ReiterEintrag {
  ansicht: ModulAnsicht
  label: string
}

const REITER: ReiterEintrag[] = [
  { ansicht: 'wortbild', label: 'Bilder & Wörter' },
  { ansicht: 'grammatik', label: 'Grammatik' },
  { ansicht: 'lesen', label: 'Lesen & Verstehen' },
  { ansicht: 'lehrkraft', label: 'Für Lehrkräfte' },
]

const STUFEN_LABEL: Record<Niveaustufe, string> = {
  einfach: 'Leicht',
  standard: 'Mittel',
  anspruchsvoll: 'Knifflig',
}

export interface KopfzeileProps {
  /** Aktuelle Modulansicht. `undefined` auf der Startseite - dort gibt es weder Reiter noch Stufenwahl. */
  ansicht?: ModulAnsicht
  onAnsichtWechseln: (ansicht: ModulAnsicht) => void
  stufe: Niveaustufe
  onStufeWechseln: (stufe: Niveaustufe) => void
  /** Titel des aktuell geladenen Moduls, als kleine Kontextzeile neben der Marke. */
  modulTitel: string
  /** Zurueck zur Startseite. */
  onLogoKlick: () => void
}

function IconInfo(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <line x1="7" y1="6.2" x2="7" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="3.8" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function Kopfzeile(props: KopfzeileProps): ReactElement {
  const { ansicht, onAnsichtWechseln, stufe, onStufeWechseln, modulTitel, onLogoKlick } = props

  return (
    <header className="kopf">
      <div className="kopf__marke-reihe inhalt">
        <button type="button" className="kopf__marke" onClick={onLogoKlick}>
          <span className="kopf__marke-titel">Linguini</span>
          {ansicht && <span className="kopf__marke-modul">Modul: {modulTitel}</span>}
        </button>
      </div>

      {ansicht && (
        <div className="kopf__navigation inhalt">
          <nav className="reiter" role="tablist" aria-label="Modulbereich wählen">
            {REITER.map((eintrag) => (
              <button
                key={eintrag.ansicht}
                type="button"
                role="tab"
                aria-selected={ansicht === eintrag.ansicht}
                className="reiter__knopf"
                onClick={() => onAnsichtWechseln(eintrag.ansicht)}
              >
                {eintrag.label}
              </button>
            ))}
          </nav>

          <fieldset className="kopf__stufenwahl">
            <legend className="kopf__stufenwahl-legende">Wie schwer?</legend>
            <div className="kopf__stufenwahl-optionen">
              {STUFEN_ORDNUNG.map((eintrag) => (
                <label
                  key={eintrag}
                  className={`kopf__stufe-option${stufe === eintrag ? ' ist-gewaehlt' : ''}`}
                >
                  <input
                    type="radio"
                    name="niveaustufe"
                    value={eintrag}
                    checked={stufe === eintrag}
                    onChange={() => onStufeWechseln(eintrag)}
                  />
                  {STUFEN_LABEL[eintrag]}
                </label>
              ))}
            </div>

            <details className="kopf__stufenwahl-hinweis">
              <summary>
                <IconInfo />
                Was bedeutet das?
              </summary>
              <p>
                „Leicht“ zeigt weniger Aufgaben und lässt alle Wörter im Bild dauerhaft beschriftet – gut für
                Kinder mit wenig Deutschkontakt. „Mittel“ ist die Zielstufe dieses Moduls auf Niveau A2. „Knifflig“
                ergänzt eine Aufgabe, die Rückschlüsse aus dem Text verlangt, für Kinder mit sicherem Wortschatz.
              </p>
            </details>
          </fieldset>
        </div>
      )}
    </header>
  )
}
