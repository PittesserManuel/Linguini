/**
 * Die Leseaufgabe - zweiter Modulteil.
 *
 * Zeigt den Lesetext mit vier zuschaltbaren Lesehilfen und darunter/daneben
 * den Aufgabenlauf (siehe Aufgaben.tsx). Der Text bleibt waehrend der
 * Aufgaben sichtbar: Leseverstehen bedeutet Nachschlagen duerfen, nicht
 * Auswendiglernen.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Jahrgangsstufe, Jahrgangstext, Lesetext, Modul, Niveaustufe, Wort } from '@/content/types'
import { istLernwort } from '@/content/types'
import type { GraderErgebnis } from '@/grading/types'
import { Aufgaben } from './Aufgaben'
import './lesen.css'

// ---------------------------------------------------------------------------
// Saetze des Lesetexts als flache, adressierbare Liste
//
// Dieselbe Liste bedient zwei Lesehilfen (Vorlesen und Zeilenlineal), die
// beide "eine Zeile" im Sinn von "ein Satz" verstehen - das haelt Hervorhebung,
// Fortschaltung und Tastaturnavigation an einer einzigen Quelle konsistent.
// ---------------------------------------------------------------------------

interface Satzzeile {
  absatzId: string
  satzIndex: number
  globalIndex: number
  text: string
}

function baueZeilen(lesetext: Lesetext): Satzzeile[] {
  const zeilen: Satzzeile[] = []
  let globalIndex = 0
  for (const absatz of lesetext.absaetze) {
    absatz.saetze.forEach((satz, satzIndex) => {
      zeilen.push({ absatzId: absatz.id, satzIndex, globalIndex, text: satz })
      globalIndex += 1
    })
  }
  return zeilen
}

/** Bewegt ein Element sanft in den sichtbaren Bereich - respektiert prefers-reduced-motion. */
function scrolleZuElement(element: HTMLElement | null): void {
  if (!element) return
  const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'center' })
}

// ---------------------------------------------------------------------------
// Lesehilfe 2: Silben trennen
//
// BEWUSST redaktionell gepflegt, nicht algorithmisch geloest (siehe
// docs/DIDAKTIK.md, Abschnitt 12): Ein automatischer Trennalgorithmus scheitert
// zuverlaessig an Komposita und Fremdwoertern - "Radiergummi" waere ein
// Kandidat fuer eine falsche Trennung ("Radi-ergummi" statt "Ra-dier-gum-mi").
// Fuer ein einzelnes Modul mit sieben Lernwoertern ist eine gepflegte Map die
// robustere Loesung. Nur Woerter mit MEHR ALS ZWEI Silben stehen hier - fuer
// kuerzere Woerter bringt eine Trennung keinen Lesevorteil, sie bleiben
// unveraendert (siehe silbenVonWort).
// ---------------------------------------------------------------------------

const SILBEN: Record<string, string[]> = {
  Lineal: ['Li', 'ne', 'al'],
  Radiergummi: ['Ra', 'dier', 'gum', 'mi'],
  Papierkorb: ['Pa', 'pier', 'korb'],
}

function silbenVonWort(nomen: string): string[] {
  return SILBEN[nomen] ?? [nomen]
}

function SilbenWort(props: { nomen: string }): ReactElement {
  const silben = silbenVonWort(props.nomen)
  return (
    <span className="lesen__silben-wort">
      {silben.map((silbe, i) => (
        <span key={i}>
          <span className={i % 2 === 0 ? 'ist-silbe-a' : 'ist-silbe-b'}>{silbe}</span>
          {i < silben.length - 1 ? '-' : ''}
        </span>
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Wortschatz-Markierung im Lesetext
//
// Nur die LERNWOERTER (neu: true) werden markiert - Stuetzwoerter sollen den
// Text lesbar machen, ohne zusaetzliche Aufmerksamkeit zu binden. Markiert
// wird die exakte, grossgeschriebene Nomen-Form als ganzes Wort; das trifft im
// Lesetext jede vorkommende Form ("die Tafel", "an die Tafel", "den
// Radiergummi"), weil das Nomen darin jeweils als eigenstaendiges Wort steht.
// ---------------------------------------------------------------------------

// Hinweis Tippziel: Diese Woerter sitzen inline im Fliesstext und sind daher
// kleiner als var(--ziel-min) - WCAG 2.5.5 nimmt Ziele, die Teil eines
// Satzes/Textblocks sind, ausdruecklich von der Mindestgroesse aus.
function WortMarkierung(props: { wort: Wort; children: ReactNode }): ReactElement {
  const [offen, setOffen] = useState(false)

  return (
    <button
      type="button"
      className={`lesen__wort${offen ? ' ist-offen' : ''}`}
      aria-expanded={offen}
      aria-label={`${props.wort.genus} ${props.wort.nomen}`}
      onClick={() => setOffen((stand) => !stand)}
      onBlur={() => setOffen(false)}
    >
      {props.children}
      <span className="lesen__wort-tooltip" aria-hidden="true">
        {props.wort.genus} {props.wort.nomen}
      </span>
    </button>
  )
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildeWortschatzRegex(woerter: Wort[]): RegExp | null {
  if (woerter.length === 0) return null
  const muster = woerter
    .map((wort) => wort.nomen)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')
  // \p{L} statt \b: \b kennt nur ASCII-Wortzeichen und wuerde vor/nach
  // Umlauten falsch trennen. Grossschreibung ist gewollt scharf (kein 'i'):
  // ein Nomen im Lesetext steht immer grossgeschrieben.
  return new RegExp(`(?<![\\p{L}])(${muster})(?![\\p{L}])`, 'gu')
}

function markiereWortschatz(satz: string, woerter: Wort[], regex: RegExp | null): ReactNode {
  if (!regex) return satz

  const teile: ReactNode[] = []
  let letztesEnde = 0
  let zaehler = 0
  regex.lastIndex = 0
  let treffer: RegExpExecArray | null

  while ((treffer = regex.exec(satz)) !== null) {
    const gefundenerText = treffer[0]
    const start = treffer.index
    if (start > letztesEnde) {
      teile.push(satz.slice(letztesEnde, start))
    }
    const wort = woerter.find((w) => w.nomen === gefundenerText)
    if (wort) {
      teile.push(
        <WortMarkierung key={`wort-${zaehler}`} wort={wort}>
          {gefundenerText}
        </WortMarkierung>,
      )
    } else {
      teile.push(gefundenerText)
    }
    zaehler += 1
    letztesEnde = start + gefundenerText.length
  }

  if (letztesEnde < satz.length) {
    teile.push(satz.slice(letztesEnde))
  }

  return teile
}

// ---------------------------------------------------------------------------
// Kleine Inline-SVG-Icons fuer die Werkzeugleiste - currentColor, immer mit
// sichtbarem Textlabel daneben (siehe Werkzeugleiste-Komponente unten).
// ---------------------------------------------------------------------------

function IconVorlesen(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M2 7v4h3l4 4V3L5 7H2Z" fill="currentColor" />
      <path
        d="M12.2 6c1.3 1 1.3 5 0 6M14.4 4.2c2.1 2.1 2.1 7.5 0 9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconStop(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  )
}

function IconSilben(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M2 9h4.5M11.5 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.7" fill="currentColor" />
    </svg>
  )
}

function IconLineal(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <rect x="2" y="6.5" width="14" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6.5v2.2M8 6.5v2.2M11 6.5v2.2M14 6.5v2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconGrosseSchrift(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <text x="1" y="10" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="var(--schrift-text)">
        A
      </text>
      <text x="7.5" y="15" fontSize="12" fontWeight="700" fill="currentColor" fontFamily="var(--schrift-text)">
        A
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Werkzeugleiste
// ---------------------------------------------------------------------------

interface WerkzeugStand {
  vorlesenAktiv: boolean
  silbenAktiv: boolean
  linealAktiv: boolean
  grosseSchriftAktiv: boolean
}

const WERKZEUGE_START: WerkzeugStand = {
  vorlesenAktiv: false,
  silbenAktiv: false,
  linealAktiv: false,
  grosseSchriftAktiv: false,
}

function Werkzeugleiste(props: {
  werkzeuge: WerkzeugStand
  sprachausgabeVerfuegbar: boolean
  onVorlesenStarten: () => void
  onVorlesenStoppen: () => void
  onSilbenUmschalten: () => void
  onLinealUmschalten: () => void
  onGrosseSchriftUmschalten: () => void
}): ReactElement {
  const { werkzeuge, sprachausgabeVerfuegbar } = props

  return (
    <div className="lesen__werkzeugleiste" role="group" aria-label="Lesehilfen">
      {werkzeuge.vorlesenAktiv ? (
        <button
          type="button"
          className="knopf knopf--zweit lesen__werkzeug-knopf"
          onClick={props.onVorlesenStoppen}
        >
          <IconStop />
          Vorlesen stoppen
        </button>
      ) : (
        <button
          type="button"
          className="knopf knopf--zweit lesen__werkzeug-knopf"
          onClick={props.onVorlesenStarten}
          disabled={!sprachausgabeVerfuegbar}
        >
          <IconVorlesen />
          Vorlesen
        </button>
      )}

      <button
        type="button"
        className="knopf knopf--zweit lesen__werkzeug-knopf"
        aria-pressed={werkzeuge.silbenAktiv}
        onClick={props.onSilbenUmschalten}
      >
        <IconSilben />
        Silben trennen
      </button>

      <button
        type="button"
        className="knopf knopf--zweit lesen__werkzeug-knopf"
        aria-pressed={werkzeuge.linealAktiv}
        onClick={props.onLinealUmschalten}
      >
        <IconLineal />
        Zeilenlineal
      </button>

      <button
        type="button"
        className="knopf knopf--zweit lesen__werkzeug-knopf"
        aria-pressed={werkzeuge.grosseSchriftAktiv}
        onClick={props.onGrosseSchriftUmschalten}
      >
        <IconGrosseSchrift />
        Große Schrift
      </button>

      {!sprachausgabeVerfuegbar && (
        <p className="chip lesen__werkzeug-hinweis">Vorlesen ist in diesem Browser nicht verfügbar.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

/**
 * Die Umschaltleiste der Jahrgangsfassungen.
 *
 * Steht bewusst UEBER dem Text und nicht in der Kopfzeile neben der
 * Niveaustufe: Die Niveaustufe waehlt das Kind (oder die Lehrkraft) einmal
 * pro Sitzung, die Jahrgangsfassung gehoert zum Text und wechselt mit ihm.
 * Zwei gleich aussehende Schalter nebeneinander wuerden nur verwechselt.
 */
function Jahrgangswahl(props: {
  texte: Jahrgangstext[]
  aktiv: Jahrgangstext
  onWaehlen: (jahrgang: Jahrgangsstufe) => void
}): ReactElement {
  const { texte, aktiv, onWaehlen } = props
  return (
    <fieldset className="lesen__jahrgangswahl">
      <legend className="lesen__jahrgangswahl-legende">Für welche Klasse?</legend>
      <div className="lesen__jahrgangswahl-optionen">
        {texte.map((text) => (
          <label
            key={text.jahrgang}
            className={`lesen__jahrgang-option${text.jahrgang === aktiv.jahrgang ? ' ist-gewaehlt' : ''}`}
            title={`${text.bezeichnung}, ${text.alter}`}
          >
            <input
              type="radio"
              name="jahrgang"
              value={text.jahrgang}
              checked={text.jahrgang === aktiv.jahrgang}
              onChange={() => onWaehlen(text.jahrgang)}
            />
            {text.kurz}
          </label>
        ))}
      </div>
      <p className="lesen__jahrgangswahl-hinweis">
        {aktiv.bezeichnung}, {aktiv.alter} – {aktiv.lesetext.kennzahlen.woerter} Wörter, Ø{' '}
        {aktiv.lesetext.kennzahlen.woerterProSatzDurchschnitt.toLocaleString('de-AT')} Wörter pro Satz
      </p>
    </fieldset>
  )
}

export function Lesen(props: {
  modul: Modul
  stufe: Niveaustufe
  /** Gewaehlte Jahrgangsfassung, oder null solange keine gewaehlt wurde. */
  jahrgang: Jahrgangsstufe | null
  onJahrgangWechseln: (jahrgang: Jahrgangsstufe) => void
  onErgebnis: (aufgabeId: string, ergebnis: GraderErgebnis, versuch: number, hilfeGenutzt: boolean) => void
}): ReactElement {
  const { modul, stufe, jahrgang, onJahrgangWechseln, onErgebnis } = props

  // Voreinstellung ist die mittlere Fassung: Sie passt fuer die meisten
  // Gruppen, und von dort ist der Weg in beide Richtungen gleich kurz.
  const jahrgangstexte = modul.jahrgangstexte ?? []
  const aktiveFassung =
    jahrgangstexte.find((t) => t.jahrgang === jahrgang) ?? jahrgangstexte[1] ?? jahrgangstexte[0] ?? null
  const lesetext = aktiveFassung?.lesetext ?? modul.lesetext
  const aufgaben = aktiveFassung?.aufgaben ?? modul.aufgaben

  const [werkzeuge, setWerkzeuge] = useState<WerkzeugStand>(WERKZEUGE_START)
  const [vorleseIndex, setVorleseIndex] = useState<number | null>(null)
  const [linealIndex, setLinealIndex] = useState(0)
  const [hervorgehobenerAbsatz, setHervorgehobenerAbsatz] = useState<string | null>(null)

  const zeilen = useMemo(() => baueZeilen(lesetext), [lesetext])
  const globalIndexKarte = useMemo(() => {
    const karte = new Map<string, number>()
    zeilen.forEach((zeile) => karte.set(`${zeile.absatzId}:${zeile.satzIndex}`, zeile.globalIndex))
    return karte
  }, [zeilen])
  const lernwoerter = useMemo(() => modul.wortschatz.filter(istLernwort), [modul])
  const wortschatzRegex = useMemo(() => buildeWortschatzRegex(lernwoerter), [lernwoerter])

  const satzRefs = useRef(new Map<number, HTMLSpanElement>())
  const absatzRefs = useRef(new Map<string, HTMLParagraphElement>())

  const sprachausgabeVerfuegbar = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Vorlesen: eine Utterance je Satz. Wir schalten ueber das end-Event weiter,
  // nicht ueber boundary - boundary liefert je nach Stimme/Plattform Wort- statt
  // Satzgrenzen und ist fuer deutsche Systemstimmen nicht zuverlaessig genug,
  // um darauf die sichtbare Hervorhebung zu stuetzen. end ist robuster.
  useEffect(() => {
    if (!werkzeuge.vorlesenAktiv || vorleseIndex === null) return undefined

    const zeile = zeilen[vorleseIndex]
    if (!zeile) {
      setWerkzeuge((stand) => ({ ...stand, vorlesenAktiv: false }))
      setVorleseIndex(null)
      return undefined
    }

    const utterance = new SpeechSynthesisUtterance(zeile.text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.85
    const weiterschalten = (): void => setVorleseIndex((i) => (i === null ? null : i + 1))
    utterance.addEventListener('end', weiterschalten)
    utterance.addEventListener('error', weiterschalten)
    window.speechSynthesis.speak(utterance)

    return () => {
      utterance.removeEventListener('end', weiterschalten)
      utterance.removeEventListener('error', weiterschalten)
      window.speechSynthesis.cancel()
    }
  }, [werkzeuge.vorlesenAktiv, vorleseIndex, zeilen])

  // Letzte Sicherheit beim Verlassen der Seite/Komponente: nie weitersprechen.
  useEffect(() => {
    return () => {
      if (sprachausgabeVerfuegbar) window.speechSynthesis.cancel()
    }
  }, [sprachausgabeVerfuegbar])

  useEffect(() => {
    if (vorleseIndex === null) return
    scrolleZuElement(satzRefs.current.get(vorleseIndex) ?? null)
  }, [vorleseIndex])

  useEffect(() => {
    if (!hervorgehobenerAbsatz) return
    scrolleZuElement(absatzRefs.current.get(hervorgehobenerAbsatz) ?? null)
  }, [hervorgehobenerAbsatz])

  function vorlesenStarten(): void {
    setWerkzeuge((stand) => ({ ...stand, vorlesenAktiv: true }))
    setVorleseIndex(0)
  }

  function vorlesenStoppen(): void {
    setWerkzeuge((stand) => ({ ...stand, vorlesenAktiv: false }))
    setVorleseIndex(null)
    if (sprachausgabeVerfuegbar) window.speechSynthesis.cancel()
  }

  function umschalten(schluessel: keyof WerkzeugStand): void {
    setWerkzeuge((stand) => ({ ...stand, [schluessel]: !stand[schluessel] }))
  }

  function satzKlasse(globalIndex: number): string {
    const klassen = ['lesen__satz']
    if (werkzeuge.vorlesenAktiv && vorleseIndex === globalIndex) klassen.push('ist-vorgelesen')
    if (werkzeuge.linealAktiv) {
      klassen.push(linealIndex === globalIndex ? 'ist-lineal-aktiv' : 'ist-abgedunkelt')
    }
    return klassen.join(' ')
  }

  return (
    <section className="lesen" aria-labelledby="lesen-titel">
      <div className="lesen__text-spalte stapel">
        {jahrgangstexte.length > 1 && aktiveFassung && (
          <Jahrgangswahl texte={jahrgangstexte} aktiv={aktiveFassung} onWaehlen={onJahrgangWechseln} />
        )}

        <h2 id="lesen-titel">{lesetext.titel}</h2>

        <Werkzeugleiste
          werkzeuge={werkzeuge}
          sprachausgabeVerfuegbar={sprachausgabeVerfuegbar}
          onVorlesenStarten={vorlesenStarten}
          onVorlesenStoppen={vorlesenStoppen}
          onSilbenUmschalten={() => umschalten('silbenAktiv')}
          onLinealUmschalten={() => umschalten('linealAktiv')}
          onGrosseSchriftUmschalten={() => umschalten('grosseSchriftAktiv')}
        />

        {werkzeuge.silbenAktiv && (
          <div className="karte karte--ruhig lesen__silben-panel">
            <p className="lesen__silben-titel">Die Lernwörter in Silben</p>
            <ul className="lesen__silben-liste">
              {lernwoerter.map((wort) => (
                <li key={wort.id}>
                  <span className={`marke marke--${wort.genus}`}>{wort.genus}</span>
                  <SilbenWort nomen={wort.nomen} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {werkzeuge.linealAktiv && (
          <div className="lesen__lineal-regler">
            <label htmlFor="lesen-lineal-eingabe" className="lesen__lineal-label">
              Zeilenlineal: Zeile {linealIndex + 1} von {zeilen.length}
            </label>
            {/* Natives <input type="range"> statt eines nachgebauten Reglers:
                Pfeiltasten hoch/runter/links/rechts funktionieren damit ohne
                eigene Tastaturlogik, und Screenreader kennen die Rolle bereits. */}
            <input
              id="lesen-lineal-eingabe"
              className="lesen__lineal-eingabe"
              type="range"
              min={1}
              max={Math.max(zeilen.length, 1)}
              step={1}
              value={linealIndex + 1}
              aria-valuetext={`Zeile ${linealIndex + 1} von ${zeilen.length}`}
              onChange={(ereignis) => setLinealIndex(Number(ereignis.target.value) - 1)}
            />
          </div>
        )}

        <div className={`lesen__text${werkzeuge.grosseSchriftAktiv ? ' lesen__text--gross' : ''}`} lang="de">
          {lesetext.absaetze.map((absatz) => (
            <p
              key={absatz.id}
              ref={(el) => {
                if (el) absatzRefs.current.set(absatz.id, el)
                else absatzRefs.current.delete(absatz.id)
              }}
              className={`lesen__absatz${hervorgehobenerAbsatz === absatz.id ? ' ist-beleg' : ''}`}
            >
              {hervorgehobenerAbsatz === absatz.id && (
                <span className="lesen__beleg-marke">Die Antwort steht hier</span>
              )}
              {absatz.saetze.map((satz, i) => {
                const globalIndex = globalIndexKarte.get(`${absatz.id}:${i}`) ?? -1
                return (
                  <span key={i}>
                    <span
                      ref={(el) => {
                        if (el) satzRefs.current.set(globalIndex, el)
                        else satzRefs.current.delete(globalIndex)
                      }}
                      className={satzKlasse(globalIndex)}
                      onMouseEnter={werkzeuge.linealAktiv ? () => setLinealIndex(globalIndex) : undefined}
                    >
                      {markiereWortschatz(satz, lernwoerter, wortschatzRegex)}
                    </span>
                    {i < absatz.saetze.length - 1 ? ' ' : ''}
                  </span>
                )
              })}
            </p>
          ))}
        </div>
      </div>

      <div className="lesen__aufgaben-spalte">
        <Aufgaben
          key={aktiveFassung?.jahrgang ?? 'standard'}
          modul={modul}
          stufe={stufe}
          aufgaben={aufgaben}
          onErgebnis={onErgebnis}
          onBelegZeigen={setHervorgehobenerAbsatz}
        />
      </div>
    </section>
  )
}
