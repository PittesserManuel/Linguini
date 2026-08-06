/**
 * Eingabekomponenten der Leseaufgabe - eine Komponente je Aufgabentyp.
 *
 * Gemeinsame Regeln fuer alle sechs Komponenten (siehe Aufgabenstellung):
 * - Kontrolliert: `antwort` kommt von aussen, jede Aenderung geht ausschliesslich
 *   ueber `onChange` nach oben. Kein interner Zustand fuer die eigentliche Antwort.
 * - Liefern eine `Antwort` exakt im Format aus `@/grading/types` (wert / werte /
 *   zuordnung) - das ist der Vertrag der Korrektur-Engine.
 * - Kein Drag-and-Drop (weder bei Luecken noch bei Reihenfolge) - das ist auf
 *   Tablets und per Tastatur eine echte Barriere.
 * - `gesperrt` deaktiviert alle Eingabeelemente, sobald die Aufgabe abgeschlossen
 *   ist (siehe Aufgaben.tsx: das ist der Fall, wenn ergebnis.nochmal false ist).
 */

import { useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react'
import type {
  Aufgabe,
  AufgabeArtikel,
  AufgabeAuswahl,
  AufgabeFreitext,
  AufgabeHeft,
  AufgabeLuecken,
  AufgabeMenge,
  AufgabeReihenfolge,
  AufgabeWahrheit,
  Genus,
  Modul,
  WahrheitsWert,
} from '@/content/types'
import { findeWort, zahlwort } from '@/content/types'
import { ObjektBild } from '@/features/wortbild'
import type { Antwort } from '@/grading/types'

// ---------------------------------------------------------------------------
// Gemeinsame Kleinteile
// ---------------------------------------------------------------------------

/** Schlanke Inline-SVG-Pfeile fuer die Reihenfolge-Knoepfe - immer mit Textlabel daneben. */
function PfeilIcon(props: { richtung: 'oben' | 'unten' }): ReactElement {
  const pfad = props.richtung === 'oben' ? 'M4 11 L8 5 L12 11' : 'M4 5 L8 11 L12 5'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={pfad} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const WAHRHEIT_OPTIONEN: { wert: WahrheitsWert; label: string }[] = [
  { wert: 'richtig', label: 'richtig' },
  { wert: 'falsch', label: 'falsch' },
  { wert: 'unbekannt', label: 'steht nicht im Text' },
]

const ARTIKEL_OPTIONEN: Genus[] = ['der', 'die', 'das']

/**
 * Feste, deterministische Anfangsreihenfolge fuer die Reihenfolge-Aufgabe -
 * BEWUSST kein Math.random (siehe Aufgabenstellung): Eine feste Permutation ist
 * bei jedem Aufruf reproduzierbar (wichtig fuer Tests und fuer ein vorhersagbares
 * Erlebnis) und garantiert fuer jede sinnvolle Schrittzahl eine von der Loesung
 * verschiedene Startanordnung.
 */
export function deterministischGemischt<T>(elemente: T[]): T[] {
  return [...elemente].reverse()
}

// ---------------------------------------------------------------------------
// auswahl
// ---------------------------------------------------------------------------

function AuswahlEingabe(props: {
  aufgabe: AufgabeAuswahl
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt } = props

  return (
    <fieldset className="lesen__eingabe-feld">
      <legend className="visuell-versteckt">Antwortmöglichkeiten</legend>
      <div className="stapel">
        {aufgabe.optionen.map((option) => (
          <label key={option.id} className="lesen__option">
            <input
              type="radio"
              name={aufgabe.id}
              value={option.id}
              checked={antwort.wert === option.id}
              disabled={gesperrt}
              onChange={() => onChange({ wert: option.id })}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// wahrheit
// ---------------------------------------------------------------------------

function WahrheitEingabe(props: {
  aufgabe: AufgabeWahrheit
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt } = props
  const zuordnung = antwort.zuordnung ?? {}
  // Bei bildgestuetzten Aufgaben faellt die dritte Option weg: Was im Bild zu
  // sehen ist, ist entscheidbar - "steht nicht im Text" waere dort sinnlos.
  const optionen = aufgabe.nurRichtigFalsch
    ? WAHRHEIT_OPTIONEN.filter((o) => o.wert !== 'unbekannt')
    : WAHRHEIT_OPTIONEN

  function waehle(aussageId: string, wert: WahrheitsWert): void {
    onChange({ zuordnung: { ...zuordnung, [aussageId]: wert } })
  }

  return (
    <div className="stapel">
      {aufgabe.aussagen.map((aussage) => (
        <fieldset key={aussage.id} className="lesen__aussage">
          <legend>{aussage.text}</legend>
          <div className="reihe lesen__optionsreihe">
            {optionen.map((option) => (
              <label key={option.wert} className="lesen__option">
                <input
                  type="radio"
                  name={`wahrheit-${aussage.id}`}
                  value={option.wert}
                  checked={zuordnung[aussage.id] === option.wert}
                  disabled={gesperrt}
                  onChange={() => waehle(aussage.id, option.wert)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// freitext
// ---------------------------------------------------------------------------

function FreitextEingabe(props: {
  aufgabe: AufgabeFreitext
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
  onEnter: () => void
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt, onEnter } = props

  function behandleTaste(ereignis: ReactKeyboardEvent<HTMLInputElement>): void {
    if (ereignis.key === 'Enter') {
      ereignis.preventDefault()
      onEnter()
    }
  }

  return (
    <div className="lesen__eingabe-feld">
      <label className="lesen__feld-label" htmlFor={`freitext-${aufgabe.id}`}>
        Deine Antwort
      </label>
      <input
        id={`freitext-${aufgabe.id}`}
        className="feld"
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={aufgabe.platzhalter}
        value={antwort.wert ?? ''}
        disabled={gesperrt}
        onChange={(ereignis) => onChange({ wert: ereignis.target.value })}
        onKeyDown={behandleTaste}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// luecken
// ---------------------------------------------------------------------------

function LueckenEingabe(props: {
  aufgabe: AufgabeLuecken
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt } = props
  const anzahlLuecken = aufgabe.loesungen.length
  const werte = antwort.werte ?? new Array<string>(anzahlLuecken).fill('')
  const [aktiveLuecke, setAktiveLuecke] = useState<number | null>(null)

  function ersteLeereLuecke(): number | null {
    const index = werte.findIndex((wert) => wert.length === 0)
    return index === -1 ? null : index
  }

  /**
   * Bedienung ohne Drag-and-Drop: Der bevorzugte Weg ist "Luecke antippen,
   * dann Wort waehlen" (aktiveLuecke ist dann gesetzt). Ist keine Luecke aktiv
   * gewaehlt, faellt die Auswahl auf die erste leere Luecke zurueck - das
   * erlaubt Kindern auf Tablets auch das einfache Antippen der Woerter in
   * Reihenfolge, ohne dass eine Luecke vorher explizit angetippt werden muss.
   */
  function waehleWort(wort: string): void {
    if (gesperrt) return
    const ziel = aktiveLuecke ?? ersteLeereLuecke() ?? anzahlLuecken - 1
    const neueWerte = [...werte]
    neueWerte[ziel] = wort
    onChange({ werte: neueWerte })
    const naechsteLeere = neueWerte.findIndex((w, i) => i > ziel && w.length === 0)
    setAktiveLuecke(naechsteLeere === -1 ? null : naechsteLeere)
  }

  let gapZaehler = -1

  return (
    <div className="stapel">
      <div className="lesen__wortbank" role="group" aria-label="Wortbank">
        {aufgabe.wortbank.map((wort) => (
          <button
            key={wort}
            type="button"
            className="chip lesen__wortbank-chip"
            disabled={gesperrt}
            onClick={() => waehleWort(wort)}
          >
            {wort}
          </button>
        ))}
      </div>
      <p className="lesen__luecken-satz">
        {aufgabe.teile.map((teil, i) => {
          if (teil !== null) {
            return <span key={i}>{teil}</span>
          }
          gapZaehler += 1
          const index = gapZaehler
          const wert = werte[index] ?? ''
          const istAktiv = aktiveLuecke === index
          return (
            <button
              key={i}
              type="button"
              className={`lesen__luecke${istAktiv ? ' ist-aktiv' : ''}${wert ? ' ist-gefuellt' : ''}`}
              aria-pressed={istAktiv}
              aria-label={wert ? `Lücke, aktuell: ${wert}. Antippen, um sie auszuwählen.` : 'Leere Lücke auswählen'}
              disabled={gesperrt}
              onClick={() => setAktiveLuecke(index)}
            >
              {wert || 'Wort wählen'}
            </button>
          )
        })}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// reihenfolge
// ---------------------------------------------------------------------------

function ReihenfolgeEingabe(props: {
  aufgabe: AufgabeReihenfolge
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt } = props
  const werte = antwort.werte ?? aufgabe.schritte.map((schritt) => schritt.id)
  const [ansage, setAnsage] = useState('')

  function schrittText(id: string): string {
    return aufgabe.schritte.find((schritt) => schritt.id === id)?.text ?? ''
  }

  function verschieben(index: number, richtung: -1 | 1): void {
    if (gesperrt) return
    const ziel = index + richtung
    if (ziel < 0 || ziel >= werte.length) return
    const neu = [...werte]
    const verschoben = neu[index]!
    neu[index] = neu[ziel]!
    neu[ziel] = verschoben
    onChange({ werte: neu })
    setAnsage(`„${schrittText(verschoben)}“ ist jetzt an Position ${ziel + 1} von ${neu.length}.`)
  }

  return (
    <div className="stapel">
      <ol className="lesen__reihenfolge-liste">
        {werte.map((id, i) => (
          <li key={id} className="lesen__reihenfolge-eintrag">
            <span className="lesen__reihenfolge-text">{schrittText(id)}</span>
            <div className="reihe lesen__reihenfolge-knoepfe">
              <button
                type="button"
                className="knopf knopf--zweit lesen__pfeil-knopf"
                aria-label={`„${schrittText(id)}“ nach oben verschieben`}
                disabled={gesperrt || i === 0}
                onClick={() => verschieben(i, -1)}
              >
                <PfeilIcon richtung="oben" />
                nach oben
              </button>
              <button
                type="button"
                className="knopf knopf--zweit lesen__pfeil-knopf"
                aria-label={`„${schrittText(id)}“ nach unten verschieben`}
                disabled={gesperrt || i === werte.length - 1}
                onClick={() => verschieben(i, 1)}
              >
                <PfeilIcon richtung="unten" />
                nach unten
              </button>
            </div>
          </li>
        ))}
      </ol>
      <p className="visuell-versteckt" role="status" aria-live="polite">
        {ansage}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// artikel
// ---------------------------------------------------------------------------

function ArtikelEingabe(props: {
  aufgabe: AufgabeArtikel
  modul: Modul
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, modul, antwort, onChange, gesperrt } = props
  const zuordnung = antwort.zuordnung ?? {}

  return (
    <div className="stapel">
      {aufgabe.woerter.map((wortId) => {
        const wort = findeWort(modul, wortId)
        return (
          <fieldset key={wortId} className="lesen__aussage">
            <legend>{wort?.nomen ?? wortId}</legend>
            <div className="reihe lesen__optionsreihe">
              {ARTIKEL_OPTIONEN.map((artikel) => (
                <label key={artikel} className="lesen__option lesen__option--artikel">
                  <input
                    type="radio"
                    name={`artikel-${wortId}`}
                    value={artikel}
                    checked={zuordnung[wortId] === artikel}
                    disabled={gesperrt}
                    onChange={() => onChange({ zuordnung: { ...zuordnung, [wortId]: artikel } })}
                  />
                  <span className={`marke marke--${artikel}`}>{artikel}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// menge - Einzahl und Mehrzahl
// ---------------------------------------------------------------------------

/**
 * Das ausgearbeitete Beispiel steht VOR den Eingabefeldern und bleibt
 * waehrend der ganzen Aufgabe sichtbar (Worked Example Effect, Sweller):
 * Beim Erlernen einer neuen Regel ist ein vollstaendig geloestes Beispiel
 * wirksamer als der Versuch, sie aus Fehlversuchen zu rekonstruieren.
 */
function MengenBeispiel(props: { aufgabe: AufgabeMenge }): ReactElement {
  return (
    <div className="karte karte--ruhig lesen__beispiel">
      <p className="lesen__beispiel-titel">So geht das</p>
      <ul className="lesen__beispiel-liste">
        {props.aufgabe.beispiel.map((zeile, i) => (
          <li key={i} className="lesen__beispiel-zeile">
            <ObjektBild wortId={zeile.wortId} anzahl={zeile.anzahl} />
            <span className="lesen__beispiel-satz">{zeile.satz}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MengeEingabe(props: {
  aufgabe: AufgabeMenge
  modul: Modul
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, modul, antwort, onChange, gesperrt } = props
  const werte = antwort.werte ?? new Array<string>(aufgabe.runden.length).fill('')

  function setzeWert(index: number, wert: string): void {
    const neu = [...werte]
    neu[index] = wert
    onChange({ werte: neu })
  }

  return (
    <div className="stapel">
      <MengenBeispiel aufgabe={aufgabe} />

      <ol className="lesen__mengen-liste">
        {aufgabe.runden.map((runde, i) => {
          const wort = findeWort(modul, runde.wortId)
          const feldId = `menge-${aufgabe.id}-${runde.id}`
          return (
            <li key={runde.id} className="lesen__mengen-runde">
              <div className="lesen__mengen-bild">
                <ObjektBild
                  wortId={runde.wortId}
                  anzahl={runde.anzahl}
                  alt={`${zahlwort(runde.anzahl)} Stück`}
                />
              </div>
              <div className="lesen__mengen-eingabe">
                <label className="lesen__feld-label" htmlFor={feldId}>
                  {aufgabe.mitIstSind ? 'Schreibe den ganzen Satz' : 'Schreibe Anzahl und Wort'}
                  <span className="visuell-versteckt"> zu Bild {i + 1}</span>
                </label>
                <input
                  id={feldId}
                  className="feld"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={
                    aufgabe.mitIstSind ? 'zum Beispiel: Das sind drei Hefte.' : 'zum Beispiel: drei Hefte'
                  }
                  value={werte[i] ?? ''}
                  disabled={gesperrt}
                  onChange={(ereignis) => setzeWert(i, ereignis.target.value)}
                />
                {wort && <p className="lesen__mengen-hinweis">Gegenstand: {wort.nomen}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ---------------------------------------------------------------------------
// heft - Schreibauftrag auf Papier
//
// Die App nimmt hier bewusst keinen Text entgegen. Ein Eingabefeld waere eine
// stille Luege: Es wuerde suggerieren, die App koenne das Geschriebene
// beurteilen. Stattdessen zeigt sie den Auftrag, die noetigen Vorlagen - und
// ein Haekchen, mit dem das Kind meldet, dass es fertig ist.
// ---------------------------------------------------------------------------

const HEFT_NAME: Record<AufgabeHeft['heft'], string> = {
  vokabelheft: 'Vokabelheft',
  linguiniheft: 'Linguini-Heft',
}

function HeftEingabe(props: {
  aufgabe: AufgabeHeft
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
}): ReactElement {
  const { aufgabe, antwort, onChange, gesperrt } = props
  const erledigt = antwort.wert === 'erledigt'

  return (
    <div className="stapel lesen__heft">
      <p className="chip lesen__heft-marke">Für dein {HEFT_NAME[aufgabe.heft]}</p>

      {aufgabe.abschreiben && (
        <div className="karte karte--ruhig lesen__heft-vorlage">
          <p className="lesen__heft-vorlage-titel">Das schreibst du ab</p>
          <ul className="lesen__heft-zeilen">
            {aufgabe.abschreiben.map((zeile, i) => (
              <li key={i}>{zeile}</li>
            ))}
          </ul>
        </div>
      )}

      {aufgabe.musterSaetze && (
        <div className="karte karte--ruhig lesen__heft-vorlage">
          <p className="lesen__heft-vorlage-titel">So könnte ein Satz aussehen</p>
          <ul className="lesen__heft-zeilen lesen__heft-zeilen--muster">
            {aufgabe.musterSaetze.map((satz, i) => (
              <li key={i}>{satz}</li>
            ))}
          </ul>
          <p className="lesen__heft-hinweis">
            Das ist ein Beispiel, keine Lösung. Schreibe eigene Sätze über andere Sachen.
          </p>
        </div>
      )}

      {aufgabe.umfang && <p className="lesen__heft-umfang">Umfang: {aufgabe.umfang}</p>}

      <label className="lesen__option lesen__heft-haken">
        <input
          type="checkbox"
          checked={erledigt}
          disabled={gesperrt}
          onChange={(ereignis) => onChange({ wert: ereignis.target.checked ? 'erledigt' : '' })}
        />
        <span>Ich habe es in mein {HEFT_NAME[aufgabe.heft]} geschrieben.</span>
      </label>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Weiche: waehlt die passende Komponente nach aufgabe.typ
// ---------------------------------------------------------------------------

export interface EingabeProps {
  aufgabe: Aufgabe
  modul: Modul
  antwort: Antwort
  onChange: (antwort: Antwort) => void
  gesperrt: boolean
  /** Nur von freitext genutzt (Enter-Taste loest Pruefen aus). */
  onEnter: () => void
}

export function Eingabe(props: EingabeProps): ReactElement {
  const { aufgabe } = props

  switch (aufgabe.typ) {
    case 'auswahl':
      return <AuswahlEingabe {...props} aufgabe={aufgabe} />
    case 'wahrheit':
      return <WahrheitEingabe {...props} aufgabe={aufgabe} />
    case 'freitext':
      return <FreitextEingabe {...props} aufgabe={aufgabe} />
    case 'luecken':
      return <LueckenEingabe {...props} aufgabe={aufgabe} />
    case 'reihenfolge':
      return <ReihenfolgeEingabe {...props} aufgabe={aufgabe} />
    case 'artikel':
      return <ArtikelEingabe {...props} aufgabe={aufgabe} />
    case 'menge':
      return <MengeEingabe {...props} aufgabe={aufgabe} />
    case 'heft':
      return <HeftEingabe {...props} aufgabe={aufgabe} />
    default: {
      // Absicherung fuer neue Aufgabentypen: bricht sichtbar, statt still
      // eine leere Eingabe zu rendern (gleiche Haltung wie die Grader).
      const nieErreicht: never = aufgabe
      throw new Error(`Eingabe: unbekannter Aufgabentyp "${JSON.stringify(nieErreicht)}"`)
    }
  }
}

/** Liefert eine passende Startantwort fuer eine Aufgabe (siehe Aufgaben.tsx). */
export function anfangsAntwort(aufgabe: Aufgabe): Antwort {
  switch (aufgabe.typ) {
    case 'auswahl':
    case 'freitext':
    case 'heft':
      return { wert: '' }
    case 'wahrheit':
    case 'artikel':
      return { zuordnung: {} }
    case 'luecken':
      return { werte: new Array<string>(aufgabe.loesungen.length).fill('') }
    case 'menge':
      return { werte: new Array<string>(aufgabe.runden.length).fill('') }
    case 'reihenfolge':
      return { werte: deterministischGemischt(aufgabe.schritte.map((schritt) => schritt.id)) }
    default: {
      const nieErreicht: never = aufgabe
      throw new Error(`anfangsAntwort: unbekannter Aufgabentyp "${JSON.stringify(nieErreicht)}"`)
    }
  }
}
