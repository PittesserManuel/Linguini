/**
 * Die App-Shell.
 *
 * Haelt die einzige Navigationsentscheidung der Demo (welche Ansicht ist
 * aktiv) und den Lernstand-Hook, und reicht beides an die drei
 * Feature-Bereiche weiter. Bewusst kein Router: Fuer eine Demo mit vier
 * Ansichten ist das eine unnoetige Abhaengigkeit, und die Ansicht muss
 * ohnehin nirgends verlinkbar sein.
 */

import { Component } from 'react'
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { modulKlassenzimmer } from '@/content/modul-klassenzimmer'
import { Wortbild } from '@/features/wortbild'
import { Lesen } from '@/features/lesen'
import { Lehrkraft } from '@/features/lehrkraft'
import { useLernstand } from '@/state/lernstand'
import { Kopfzeile } from '@/components/Kopfzeile'
import type { ModulAnsicht } from '@/components/Kopfzeile'
import { Fusszeile } from '@/components/Fusszeile'
import { Start } from '@/components/Start'

type Ansicht = 'start' | ModulAnsicht

// ---------------------------------------------------------------------------
// Fehlergrenze - faengt Abstuerze einzelner Modulteile ab, statt die ganze
// App mit einem weissen Bildschirm zu beenden. Muss eine Klassenkomponente
// sein: getDerivedStateFromError gibt es fuer Function Components nicht.
// ---------------------------------------------------------------------------

interface FehlergrenzeProps {
  children: ReactNode
}

interface FehlergrenzeState {
  fehler: boolean
}

class Fehlergrenze extends Component<FehlergrenzeProps, FehlergrenzeState> {
  state: FehlergrenzeState = { fehler: false }

  static getDerivedStateFromError(): FehlergrenzeState {
    return { fehler: true }
  }

  componentDidCatch(fehler: unknown): void {
    // Nur zur Diagnose in der Konsole - keine Nutzeransprache hierueber.
    console.error('Linguini: Ein Modulteil ist abgestuerzt.', fehler)
  }

  render(): ReactNode {
    if (this.state.fehler) {
      return (
        <div className="karte melde melde--falsch stapel" role="alert">
          <h2>Hier ist etwas schiefgelaufen</h2>
          <p>
            Dieser Bereich kann gerade nicht angezeigt werden. Laden Sie die Seite neu oder wechseln Sie oben zu
            einem anderen Bereich.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

export default function App(): ReactElement {
  const [ansicht, setAnsicht] = useState<Ansicht>('start')

  const {
    lernstand,
    meldeErgebnis,
    meldeWortAngesehen,
    meldeArtikelAntwort,
    setzeStufe,
    zuruecksetzen,
    speichernAktiv,
    setzeSpeichernAktiv,
  } = useLernstand(modulKlassenzimmer.id, 'standard')

  return (
    <>
      <a className="sprungmarke" href="#inhalt">
        Zum Inhalt springen
      </a>

      <Kopfzeile
        ansicht={ansicht === 'start' ? undefined : ansicht}
        onAnsichtWechseln={setAnsicht}
        stufe={lernstand.stufe}
        onStufeWechseln={setzeStufe}
        modulTitel={modulKlassenzimmer.titel}
        onLogoKlick={() => setAnsicht('start')}
      />

      <main id="inhalt" className="hauptbereich inhalt">
        {ansicht === 'start' ? (
          <Start modul={modulKlassenzimmer} onModulStarten={() => setAnsicht('wortbild')} />
        ) : (
          <Fehlergrenze key={ansicht}>
            {ansicht === 'wortbild' && (
              <Wortbild
                modul={modulKlassenzimmer}
                onWortAngesehen={meldeWortAngesehen}
                onArtikelAntwort={meldeArtikelAntwort}
              />
            )}
            {ansicht === 'lesen' && (
              <Lesen modul={modulKlassenzimmer} stufe={lernstand.stufe} onErgebnis={meldeErgebnis} />
            )}
            {ansicht === 'lehrkraft' && <Lehrkraft modul={modulKlassenzimmer} lernstand={lernstand} />}
          </Fehlergrenze>
        )}
      </main>

      <Fusszeile
        speichernAktiv={speichernAktiv}
        onSpeichernUmschalten={setzeSpeichernAktiv}
        onLernstandLoeschen={zuruecksetzen}
      />
    </>
  )
}
