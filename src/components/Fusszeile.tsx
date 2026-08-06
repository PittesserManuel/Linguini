/**
 * Fusszeile der App-Shell.
 *
 * Traegt die beiden Datenschutz-Bedienelemente, die per Vorgabe zusammen
 * gehoeren: der Speichern-Schalter (Voreinstellung: AUS) und der
 * Loeschen-Knopf. Beide wirken auf den Lernstand-Hook, den App.tsx haelt -
 * diese Komponente speichert selbst nichts, sie zeigt und meldet nur.
 */

import { useState } from 'react'
import type { ReactElement } from 'react'

export interface FusszeileProps {
  speichernAktiv: boolean
  onSpeichernUmschalten: (aktiv: boolean) => void
  onLernstandLoeschen: () => void
  /**
   * Nur den Datenschutzhinweis zeigen, ohne Schalter und Loeschknopf.
   *
   * Fuer die Startseite: Dort gibt es noch keinen Lernstand, den man
   * speichern oder loeschen koennte - der HINWEIS gehoert aber trotzdem
   * dorthin. "Keine Daten, kein Konto, keine Cookies" ist das erste
   * Argument, das eine Schule hoeren will, und es stand bisher ausgerechnet
   * auf der Seite nicht, auf der man zuerst landet.
   */
  nurHinweis?: boolean
}

export function Fusszeile(props: FusszeileProps): ReactElement {
  const { speichernAktiv, onSpeichernUmschalten, onLernstandLoeschen, nurHinweis } = props
  const [meldung, setMeldung] = useState<string | null>(null)

  function umschalten(aktiv: boolean): void {
    onSpeichernUmschalten(aktiv)
    setMeldung(
      aktiv
        ? 'Der Lernstand wird jetzt in diesem Browser gespeichert.'
        : 'Der Lernstand wird nicht mehr gespeichert und wurde entfernt.',
    )
  }

  function loeschen(): void {
    onLernstandLoeschen()
    setMeldung('Der Lernstand wurde gelöscht.')
  }

  return (
    <footer className="fuss">
      <div className="fuss__inhalt inhalt stapel">
        {!nurHinweis && (
          <div className="fuss__datenschutz reihe reihe--gestapelt">
            <label className="fuss__schalter">
              <input
                type="checkbox"
                checked={speichernAktiv}
                onChange={(ereignis) => umschalten(ereignis.target.checked)}
              />
              Fortschritt in diesem Browser speichern
            </label>

            <button type="button" className="knopf knopf--zweit" onClick={loeschen}>
              Lernstand löschen
            </button>
          </div>
        )}

        <p className="fuss__hinweis">
          Voreinstellung: aus. Es werden keine personenbezogenen Daten erhoben – kein Name, kein Konto, keine
          Cookies. Der Lernstand bleibt ausschließlich auf diesem Gerät und verlässt es nie.
        </p>

        <div aria-live="polite">{meldung && <p className="fuss__meldung">{meldung}</p>}</div>

        <p className="fuss__marke">Linguini – Demo einer Lernplattform für Deutsch als Zweitsprache.</p>
      </div>
    </footer>
  )
}
