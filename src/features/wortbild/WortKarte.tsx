/**
 * Die Wortkarte - Detailansicht zu einem einzelnen Wortschatz-Eintrag.
 *
 * Technisch ein natives <dialog>-Element im "Modal"-Betrieb (showModal()).
 * Das ist bewusst keine selbstgebaute Fokusfalle: der Browser fängt den
 * Fokus im Dialog automatisch ein, schliesst per Escape (Event "cancel")
 * und gibt den Fokus beim Schliessen automatisch an das Element zurueck,
 * das vor dem Oeffnen fokussiert war (HTML-Spezifikation, in allen
 * evergreen Browsern umgesetzt). Damit ist die Anforderung "Fokus einfangen,
 * mit Escape schliessen, Fokus zuruckgeben" ohne eigene Trap-Logik erfuellt.
 *
 * Das Element bleibt permanent im DOM (siehe Wortbild.tsx) - nur `offen`
 * steuert showModal()/close(). So bleibt die native Fokus-Rueckgabe beim
 * Schliessen zuverlaessig erhalten (sie greift nur, wenn der Dialog ueber
 * close() geschlossen wird, nicht beim abrupten Entfernen aus dem DOM).
 */

import { useEffect, useId, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react'
import type { Genus, Wort } from '@/content/types'
import { wortMitArtikel } from '@/content/types'

export interface WortKarteProps {
  /** Das anzuzeigende Wort. `null`, solange noch nie eines geoeffnet wurde. */
  wort: Wort | null
  offen: boolean
  onSchliessen: () => void
  /** Meldet einen Versuch der Mini-Uebung "Welcher Artikel?" (nur bei Lernwoertern). */
  onArtikelAntwort?: (wortId: string, richtig: boolean) => void
  /** Wird bei jedem erfolgreichen Vorlesen aufgerufen (fuer die Lernstand-Zaehlung). */
  onAngehoert?: (wortId: string) => void
}

// ---------------------------------------------------------------------------
// Vorlesen - Web Speech API, gekapselt in einem kleinen lokalen Hook
// ---------------------------------------------------------------------------

interface Sprachausgabe {
  /** true, wenn eine deutsche Stimme gefunden wurde und gesprochen werden kann. */
  verfuegbar: boolean
  /** true, wenn der Browser die Web Speech API ueberhaupt kennt. */
  unterstuetzt: boolean
  sprich: (text: string) => void
}

/** Liefert Deutsch-Praefix-Stimmen ("de", "de-DE", "de-AT", ...). */
function findeDeutscheStimme(stimmen: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return stimmen.find((stimme) => stimme.lang.toLowerCase().startsWith('de')) ?? null
}

function useSprachausgabe(): Sprachausgabe {
  const [stimme, setStimme] = useState<SpeechSynthesisVoice | null>(null)
  const [unterstuetzt, setUnterstuetzt] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setUnterstuetzt(false)
      return
    }
    setUnterstuetzt(true)
    const synth = window.speechSynthesis

    // Stimmen laden in manchen Browsern asynchron nach - deshalb sofort UND
    // bei "voiceschanged" pruefen (siehe MDN: SpeechSynthesis.getVoices()).
    function stimmenAktualisieren(): void {
      setStimme(findeDeutscheStimme(synth.getVoices()))
    }

    stimmenAktualisieren()
    synth.addEventListener('voiceschanged', stimmenAktualisieren)
    return () => synth.removeEventListener('voiceschanged', stimmenAktualisieren)
  }, [])

  function sprich(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    // Laufende Ausgabe abbrechen, damit sich Aeusserungen bei schnellem
    // Antippen nicht in der Warteschlange stauen.
    synth.cancel()
    const aeusserung = new SpeechSynthesisUtterance(text)
    aeusserung.lang = 'de-DE'
    aeusserung.rate = 0.9 // langsam und klar - fuer DaZ-Lernende
    if (stimme) aeusserung.voice = stimme
    synth.speak(aeusserung)
  }

  return { verfuegbar: unterstuetzt && stimme !== null, unterstuetzt, sprich }
}

// ---------------------------------------------------------------------------
// Schlanke Inline-Icons - currentColor, immer mit Textlabel im Aufruferknopf
// ---------------------------------------------------------------------------

function LautsprecherIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="M16 8.5a5 5 0 0 1 0 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.6 6a8.5 8.5 0 0 1 0 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SchliessenIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M5 5l14 14M19 5L5 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

const ARTIKEL_OPTIONEN: Genus[] = ['der', 'die', 'das']

/**
 * Ein Versuch der Mini-Uebung. `id` erhoeht sich bei jedem Klick - auch wenn
 * zweimal hintereinander dieselbe (falsche) Antwort gewaehlt wird, aendert
 * sich damit der DOM-Knoten der Rueckmeldung (per `key`), und aria-live
 * kuendigt sie zuverlaessig erneut an statt eine unveraenderte Textstelle
 * stillschweigend zu ueberschreiben.
 */
interface ArtikelVersuch {
  id: number
  artikel: Genus
}

export function WortKarte(props: WortKarteProps): ReactElement {
  const { wort, offen, onSchliessen, onArtikelAntwort, onAngehoert } = props
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titelId = useId()
  const [versuch, setVersuch] = useState<ArtikelVersuch | null>(null)
  const { verfuegbar, unterstuetzt, sprich } = useSprachausgabe()

  // Mini-Uebung pro Wort zuruecksetzen, sobald ein anderes Wort angezeigt wird.
  useEffect(() => {
    setVersuch(null)
  }, [wort?.id])

  // showModal()/close() synchron zur `offen`-Prop halten.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (offen && !dialog.open) {
      dialog.showModal()
    } else if (!offen && dialog.open) {
      dialog.close()
    }
  }, [offen])

  // Das "close"-Ereignis deckt sowohl Escape (ueber "cancel") als auch
  // programmatisches close() ab - ein einziger Meldeweg an die Eltern-Komponente.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function behandleClose(): void {
      onSchliessen()
    }
    dialog.addEventListener('close', behandleClose)
    return () => dialog.removeEventListener('close', behandleClose)
  }, [onSchliessen])

  function klickAufHintergrund(ereignis: ReactMouseEvent<HTMLDialogElement>): void {
    // Der native ::backdrop erzeugt keinen eigenen Klick-Handler - ein Klick,
    // der genau auf dem <dialog>-Element selbst landet (nicht auf einem
    // Kind), kam aus dem Randbereich und gilt als Wunsch zum Schliessen.
    if (ereignis.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }

  if (!wort) {
    // Noch nie geoeffnet - leerer, geschlossener Dialog ohne Inhalt.
    return <dialog ref={dialogRef} className="wortkarte" aria-hidden="true" />
  }

  const anhoerenTitel = !unterstuetzt
    ? 'Vorlesen wird von diesem Geraet nicht unterstuetzt.'
    : !verfuegbar
      ? 'Es wurde keine deutsche Sprachstimme gefunden.'
      : undefined

  function anhoerenKlick(): void {
    if (!wort) return
    sprich(`${wortMitArtikel(wort)}. ${wort.beispiel}`)
    onAngehoert?.(wort.id)
  }

  function artikelKlick(gewaehlt: Genus): void {
    if (!wort) return
    setVersuch((vorheriger) => ({ id: (vorheriger?.id ?? 0) + 1, artikel: gewaehlt }))
    onArtikelAntwort?.(wort.id, gewaehlt === wort.genus)
  }

  const gewaehlterArtikel = versuch?.artikel ?? null

  return (
    <dialog
      ref={dialogRef}
      className="wortkarte"
      aria-labelledby={titelId}
      onClick={klickAufHintergrund}
    >
      <div className="wortkarte__inhalt stapel">
        <header className="wortkarte__kopf">
          <span className={`marke--${wort.genus} wortkarte__marke`}>{wort.genus}</span>
          <button
            type="button"
            className="knopf knopf--leise wortkarte__schliessen"
            onClick={() => dialogRef.current?.close()}
          >
            <SchliessenIcon />
            Schließen
          </button>
        </header>

        <h2 id={titelId} className="wortkarte__nomen">
          {wort.nomen}
        </h2>

        {wort.plural && (
          <p className="wortkarte__plural">
            <span className="wortkarte__feldname">Mehrzahl:</span> {wort.plural}
          </p>
        )}

        <p className="wortkarte__erklaerung">{wort.erklaerung}</p>

        <p className="wortkarte__beispiel">„{wort.beispiel}“</p>

        <button
          type="button"
          className="knopf knopf--zweit wortkarte__anhoeren"
          disabled={!verfuegbar}
          title={anhoerenTitel}
          onClick={anhoerenKlick}
        >
          <LautsprecherIcon />
          Anhören
        </button>

        {wort.neu && (
          <fieldset className="wortkarte__uebung">
            <legend>Welcher Artikel?</legend>
            <div className="reihe">
              {ARTIKEL_OPTIONEN.map((option) => {
                const istGewaehlt = gewaehlterArtikel === option
                const istRichtig = option === wort.genus
                const zustand = istGewaehlt ? (istRichtig ? 'richtig' : 'falsch') : ''
                return (
                  <button
                    key={option}
                    type="button"
                    className={`knopf knopf--zweit wortkarte__artikel-knopf${
                      zustand ? ` wortkarte__artikel-knopf--${zustand}` : ''
                    }`}
                    onClick={() => artikelKlick(option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            <div aria-live="polite">
              {versuch && (
                <p
                  key={versuch.id}
                  className={`melde ${
                    gewaehlterArtikel === wort.genus ? 'melde--richtig' : 'melde--falsch'
                  }`}
                >
                  {gewaehlterArtikel === wort.genus
                    ? `Richtig! Es heißt ${wortMitArtikel(wort)}.`
                    : `Noch nicht ganz. Schau auf die Farbe und Form oben auf der Karte: Es heißt ${wortMitArtikel(wort)}.`}
                </p>
              )}
            </div>
          </fieldset>
        )}
      </div>
    </dialog>
  )
}
