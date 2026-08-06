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
import { MODULE, STANDARD_MODUL_ID, findeModul } from '@/content/module'
import type { Modul } from '@/content/types'
import { Wortbild } from '@/features/wortbild'
import { Grammatik } from '@/features/grammatik'
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

/**
 * Traegt den Lernstand EINES Moduls.
 *
 * Wird in App mit key={modul.id} eingehaengt. Der Modulwechsel montiert die
 * Komponente damit neu, und jedes Modul bekommt einen eigenen, frischen
 * Lernstand - der Artikelfehler aus dem Klassenzimmer taucht nicht in der
 * Auswertung des Wochenmarkts auf. Das ist billiger und weniger fehleranfaellig
 * als ein Reducer, der auf Modulwechsel selbst reagieren muesste.
 */
function ModulSitzung({
  modul,
  ansicht,
  onAnsichtWechseln,
}: {
  modul: Modul
  ansicht: ModulAnsicht
  onAnsichtWechseln: (a: Ansicht) => void
}): ReactElement {
  const {
    lernstand,
    meldeErgebnis,
    meldeWortAngesehen,
    meldeArtikelAntwort,
    setzeStufe,
    setzeJahrgang,
    zuruecksetzen,
    speichernAktiv,
    setzeSpeichernAktiv,
  } = useLernstand(modul.id, 'standard')

  return (
    <>
      <Kopfzeile
        ansicht={ansicht}
        onAnsichtWechseln={onAnsichtWechseln}
        stufe={lernstand.stufe}
        onStufeWechseln={setzeStufe}
        modulTitel={modul.titel}
        onLogoKlick={() => onAnsichtWechseln('start')}
      />

      <main id="inhalt" className="hauptbereich inhalt">
        <Fehlergrenze key={ansicht}>
          {ansicht === 'wortbild' && (
            <Wortbild
              modul={modul}
              stufe={lernstand.stufe}
              onWortAngesehen={meldeWortAngesehen}
              onArtikelAntwort={meldeArtikelAntwort}
            />
          )}
          {ansicht === 'grammatik' && (
            <Grammatik modul={modul} stufe={lernstand.stufe} onErgebnis={meldeErgebnis} />
          )}
          {ansicht === 'lesen' && (
            <Lesen
              modul={modul}
              stufe={lernstand.stufe}
              jahrgang={lernstand.jahrgang}
              onJahrgangWechseln={setzeJahrgang}
              onErgebnis={meldeErgebnis}
            />
          )}
          {ansicht === 'lehrkraft' && <Lehrkraft modul={modul} lernstand={lernstand} />}
        </Fehlergrenze>
      </main>

      <Fusszeile
        speichernAktiv={speichernAktiv}
        onSpeichernUmschalten={setzeSpeichernAktiv}
        onLernstandLoeschen={zuruecksetzen}
      />
    </>
  )
}

export default function App(): ReactElement {
  const [ansicht, setAnsicht] = useState<Ansicht>('start')
  const [modulId, setModulId] = useState<string>(STANDARD_MODUL_ID)
  const modul = findeModul(modulId)

  function starteModul(id: string): void {
    setModulId(id)
    setAnsicht('wortbild')
  }

  return (
    <>
      <a className="sprungmarke" href="#inhalt">
        Zum Inhalt springen
      </a>

      {ansicht === 'start' ? (
        <>
          <Kopfzeile
            onAnsichtWechseln={setAnsicht}
            stufe="standard"
            onStufeWechseln={() => undefined}
            modulTitel=""
            onLogoKlick={() => setAnsicht('start')}
          />
          <main id="inhalt" className="hauptbereich inhalt">
            <Start module={MODULE} onModulStarten={starteModul} />
          </main>
        </>
      ) : (
        <ModulSitzung key={modul.id} modul={modul} ansicht={ansicht} onAnsichtWechseln={setAnsicht} />
      )}
    </>
  )
}
