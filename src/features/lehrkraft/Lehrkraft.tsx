/**
 * Der Lehrkraft- und Elternbereich.
 *
 * Vier Reiter (WAI-ARIA "Tabs"-Muster: role="tablist"/"tab"/"tabpanel",
 * Pfeiltasten-Navigation mit roving tabindex). Dieser Bereich entscheidet
 * ueber Glaubwuerdigkeit: Er muss wie ein Lehrmittel wirken, das eine
 * Lehrkraft im Kollegium zeigen wuerde - nicht wie eine Spiele-App.
 *
 * Die Auswertungslogik selbst steckt bewusst NICHT hier, sondern in der
 * reinen Funktion `berechneAuswertung` (siehe auswertung.ts) - diese
 * Datei orchestriert nur Darstellung, Reiter-Zustand und Tastaturnavigation.
 */

import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import type { Modul, Niveaustufe, Verstehensebene } from '@/content/types'
import { findeWort, istLernwort, wortMitArtikel } from '@/content/types'
import type { Fehlerart } from '@/grading/types'
import type { Lernstand } from '@/state/types'
import { berechneAuswertung } from './auswertung'
import { Wortkarten } from './Wortkarten'
import './lehrkraft.css'

// ---------------------------------------------------------------------------
// Klartext-Uebersetzungen fachlicher Begriffe
// ---------------------------------------------------------------------------

const STUFE_LABEL: Record<Niveaustufe, string> = {
  einfach: 'Einfach',
  standard: 'Standard',
  anspruchsvoll: 'Anspruchsvoll',
}

const EBENEN_LABEL: Record<Verstehensebene, { titel: string; erklaerung: string }> = {
  literal: { titel: 'Literal', erklaerung: 'Die Antwort steht wörtlich im Text.' },
  inferentiell: { titel: 'Inferentiell', erklaerung: 'Die Antwort muss aus dem Text erschlossen werden.' },
  reorganisierend: {
    titel: 'Reorganisierend',
    erklaerung: 'Der Text muss neu geordnet oder zusammengefasst werden.',
  },
  wertend: { titel: 'Wertend', erklaerung: 'Eine eigene, textgestützte Bewertung wird verlangt.' },
  sprachbetrachtend: {
    titel: 'Sprachbetrachtung',
    erklaerung: 'Es geht um Grammatik, Artikel oder Rechtschreibung.',
  },
}

const FEHLERART_LABEL: Record<Fehlerart, string> = {
  keine: 'Kein Fehler',
  genus: 'Artikel (der/die/das)',
  rechtschreibung: 'Schreibweise',
  wortwahl: 'Wortwahl',
  verstaendnis: 'Textverständnis',
  teilweise: 'Reihenfolge',
  grossschreibung: 'Großschreibung',
  leer: 'Nicht beantwortet',
}

// ---------------------------------------------------------------------------
// Schlanke Inline-Icons - currentColor, rein dekorativ oder mit Textlabel
// im umgebenden Button (siehe Regel zu Icons).
// ---------------------------------------------------------------------------

function HaekchenIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4 10.5l4 4 8-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DruckenIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="5" y="2.5" width="10" height="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="7.5" width="14" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="12" width="8" height="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function SchildIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M10 2.5l6 2.2v5c0 4-2.6 6.6-6 7.8-3.4-1.2-6-3.8-6-7.8v-5l6-2.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SchlossIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.5 9V6.3a3.5 3.5 0 0 1 7 0V9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Reiter-Rahmen (WAI-ARIA APG "Tabs", automatische Aktivierung)
// ---------------------------------------------------------------------------

type ReiterId = 'lernziele' | 'differenzierung' | 'auswertung' | 'eltern'

const REITER: { id: ReiterId; label: string }[] = [
  { id: 'lernziele', label: 'Lernziele & Lehrplan' },
  { id: 'differenzierung', label: 'Differenzierung' },
  { id: 'auswertung', label: 'Auswertung' },
  { id: 'eltern', label: 'Für Eltern' },
]

export function Lehrkraft(props: { modul: Modul; lernstand: Lernstand }): ReactElement {
  const { modul, lernstand } = props
  const [aktiv, setAktiv] = useState<ReiterId>('lernziele')
  const knopfRefs = useRef(new Map<ReiterId, HTMLButtonElement>())
  const basisId = useId()

  function reiterWaehlen(id: ReiterId, fokussieren: boolean): void {
    setAktiv(id)
    if (fokussieren) knopfRefs.current.get(id)?.focus()
  }

  // Roving Tabindex: Pfeiltasten bewegen sich zyklisch durch die Reiter und
  // aktivieren den jeweiligen Reiter sofort (automatische Aktivierung, siehe
  // WAI-ARIA Authoring Practices, Muster "Tabs").
  function tastaturNavigation(ereignis: KeyboardEvent<HTMLDivElement>): void {
    const aktuellerIndex = REITER.findIndex((r) => r.id === aktiv)
    if (aktuellerIndex === -1) return

    let naechsterIndex: number | null = null
    if (ereignis.key === 'ArrowRight') naechsterIndex = (aktuellerIndex + 1) % REITER.length
    else if (ereignis.key === 'ArrowLeft') naechsterIndex = (aktuellerIndex - 1 + REITER.length) % REITER.length
    else if (ereignis.key === 'Home') naechsterIndex = 0
    else if (ereignis.key === 'End') naechsterIndex = REITER.length - 1

    if (naechsterIndex === null) return
    ereignis.preventDefault()
    const naechsterReiter = REITER[naechsterIndex]
    if (naechsterReiter) reiterWaehlen(naechsterReiter.id, true)
  }

  return (
    <section className="lehrkraft" aria-labelledby={`${basisId}-titel`}>
      <h2 id={`${basisId}-titel`} className="lehrkraft__titel">
        Für Lehrkräfte und Eltern
      </h2>

      <div
        className="reiter lehrkraft__reiter"
        role="tablist"
        aria-label="Bereiche für Lehrkräfte und Eltern"
        onKeyDown={tastaturNavigation}
      >
        {REITER.map((reiter) => (
          <button
            key={reiter.id}
            ref={(el) => {
              if (el) knopfRefs.current.set(reiter.id, el)
              else knopfRefs.current.delete(reiter.id)
            }}
            type="button"
            role="tab"
            id={`${basisId}-reiter-${reiter.id}`}
            aria-selected={aktiv === reiter.id}
            aria-controls={`${basisId}-panel-${reiter.id}`}
            tabIndex={aktiv === reiter.id ? 0 : -1}
            className="reiter__knopf"
            onClick={() => reiterWaehlen(reiter.id, false)}
          >
            {reiter.label}
          </button>
        ))}
      </div>

      {aktiv === 'lernziele' && (
        <div
          id={`${basisId}-panel-lernziele`}
          role="tabpanel"
          aria-labelledby={`${basisId}-reiter-lernziele`}
          tabIndex={0}
          className="lehrkraft__panel"
        >
          <LernzieleUndLehrplan modul={modul} />
        </div>
      )}

      {aktiv === 'differenzierung' && (
        <div
          id={`${basisId}-panel-differenzierung`}
          role="tabpanel"
          aria-labelledby={`${basisId}-reiter-differenzierung`}
          tabIndex={0}
          className="lehrkraft__panel"
        >
          <Differenzierung modul={modul} />
        </div>
      )}

      {aktiv === 'auswertung' && (
        <div
          id={`${basisId}-panel-auswertung`}
          role="tabpanel"
          aria-labelledby={`${basisId}-reiter-auswertung`}
          tabIndex={0}
          className="lehrkraft__panel"
        >
          <AuswertungsAnsicht modul={modul} lernstand={lernstand} />
        </div>
      )}

      {aktiv === 'eltern' && (
        <div
          id={`${basisId}-panel-eltern`}
          role="tabpanel"
          aria-labelledby={`${basisId}-reiter-eltern`}
          tabIndex={0}
          className="lehrkraft__panel"
        >
          <FuerEltern modul={modul} lernstand={lernstand} />
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Reiter 1: Lernziele & Lehrplan
// ---------------------------------------------------------------------------

function LernzieleUndLehrplan(props: { modul: Modul }): ReactElement {
  const { modul } = props
  const { kennzahlen } = modul.lesetext

  return (
    <>
      <div className="karte stapel">
        <h3>Lernziele dieses Moduls</h3>
        <ul className="lehrkraft__lernziele-liste">
          {modul.lernziele.map((ziel, i) => (
            <li key={i} className="lehrkraft__lernziel-eintrag">
              <HaekchenIcon />
              <span>{ziel}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="karte stapel">
        <h3>Anschluss an Lehrplan und Bildungsstandards</h3>
        <div className="lehrkraft__tabelle-rahmen">
          <table className="lehrkraft__tabelle">
            <caption className="visuell-versteckt">
              Kompetenzen nach Quelle, Bereich und Formulierung
            </caption>
            <thead>
              <tr>
                <th scope="col">Quelle</th>
                <th scope="col">Bereich</th>
                <th scope="col">Formulierung</th>
              </tr>
            </thead>
            <tbody>
              {modul.kompetenzen.map((kompetenz, i) => (
                <tr key={i}>
                  <td>{kompetenz.quelle}</td>
                  <td>{kompetenz.bereich}</td>
                  <td>{kompetenz.formulierung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="karte stapel">
        <h3>Der Lesetext in Zahlen</h3>
        <dl className="lehrkraft__kennzahlen">
          <div className="lehrkraft__kennzahl">
            <dt>Wörter</dt>
            <dd>{kennzahlen.woerter}</dd>
          </div>
          <div className="lehrkraft__kennzahl">
            <dt>Sätze</dt>
            <dd>{kennzahlen.saetze}</dd>
          </div>
          <div className="lehrkraft__kennzahl">
            <dt>Wörter pro Satz</dt>
            <dd>{kennzahlen.woerterProSatzDurchschnitt}</dd>
          </div>
          <div className="lehrkraft__kennzahl">
            <dt>Längstes Wort</dt>
            <dd>{kennzahlen.langstesWort}</dd>
          </div>
        </dl>
        <p className="lehrkraft__einordnung">
          Der Text hat im Schnitt {kennzahlen.woerterProSatzDurchschnitt} Wörter pro Satz. Das liegt bewusst
          unter dem für Klasse 4 üblichen Richtwert von 13 bis 15 Wörtern pro Satz – dieser Richtwert gilt
          für Kinder mit Deutsch als Erstsprache. Die Zielgruppe dieses Moduls lernt Deutsch als Zweitsprache
          auf Niveau {modul.niveau}. Sprachliche Komplexität entsteht hier bewusst über die Aufgaben, nicht
          über die Satzlänge.
        </p>
      </div>

      <div className="karte stapel">
        <h3>Hinweise für den Unterricht</h3>
        <ol className="lehrkraft__hinweise-liste">
          {modul.unterrichtshinweise.map((hinweis, i) => (
            <li key={i}>{hinweis}</li>
          ))}
        </ol>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Reiter 2: Differenzierung
// ---------------------------------------------------------------------------

function Differenzierung(props: { modul: Modul }): ReactElement {
  const { modul } = props

  return (
    <>
      <p className="lehrkraft__einordnung">
        Alle drei Stufen verfolgen dasselbe Lernziel. Sie unterscheiden sich nur im Weg dorthin – nicht im
        Ziel.
      </p>

      <div className="lehrkraft__stufen-raster">
        {modul.differenzierung.map((stufe) => (
          <div key={stufe.stufe} className="karte lehrkraft__stufen-karte stapel">
            <p className="chip">{STUFE_LABEL[stufe.stufe]}</p>
            <p className="lehrkraft__stufen-fuerwen">{stufe.fuerWen}</p>
            <ul>
              {stufe.massnahmen.map((massnahme, i) => (
                <li key={i}>{massnahme}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="karte stapel">
        <h3>Welche Aufgabe erscheint auf welcher Stufe?</h3>
        <div className="lehrkraft__tabelle-rahmen">
          <table className="lehrkraft__tabelle">
            <caption className="visuell-versteckt">
              Aufgaben nach Niveaustufe und geprüfter Verstehensebene
            </caption>
            <thead>
              <tr>
                <th scope="col">Aufgabe</th>
                <th scope="col">Ab Stufe</th>
                <th scope="col">Verstehensebene</th>
              </tr>
            </thead>
            <tbody>
              {modul.aufgaben.map((aufgabe) => (
                <tr key={aufgabe.id}>
                  <td>{aufgabe.frage}</td>
                  <td>{STUFE_LABEL[aufgabe.abStufe]}</td>
                  <td>
                    <strong>{EBENEN_LABEL[aufgabe.ebene].titel}</strong> –{' '}
                    {EBENEN_LABEL[aufgabe.ebene].erklaerung}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Reiter 3: Auswertung
// ---------------------------------------------------------------------------

function AuswertungsAnsicht(props: { modul: Modul; lernstand: Lernstand }): ReactElement {
  const { modul, lernstand } = props
  const auswertung = useMemo(() => berechneAuswertung(lernstand, modul), [lernstand, modul])

  if (auswertung.bearbeitet === 0) {
    return (
      <div className="karte karte--ruhig lehrkraft__leerzustand">
        <h3>Noch keine Auswertung</h3>
        <p>
          Für dieses Modul liegen noch keine bearbeiteten Aufgaben vor. Die Auswertung erscheint hier
          automatisch, sobald die erste Aufgabe abgeschlossen ist.
        </p>
      </div>
    )
  }

  const maxFehler = auswertung.fehlerprofil[0]?.anzahl ?? 0
  const bearbeitungsAnteil = auswertung.gesamt > 0 ? (auswertung.bearbeitet / auswertung.gesamt) * 100 : 0
  const selbstkorrekturProzent =
    auswertung.selbstkorrekturQuote !== null ? Math.round(auswertung.selbstkorrekturQuote * 100) : null

  return (
    <>
      <div className="karte stapel">
        <h3>Bearbeitungsstand</h3>
        <p className="lehrkraft__fortschritt-text">
          Bearbeitet:{' '}
          <strong>
            {auswertung.bearbeitet} von {auswertung.gesamt}
          </strong>{' '}
          Aufgaben dieser Niveaustufe
        </p>
        <div
          className="fortschritt"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={auswertung.gesamt}
          aria-valuenow={auswertung.bearbeitet}
          aria-valuetext={`${auswertung.bearbeitet} von ${auswertung.gesamt} Aufgaben bearbeitet`}
        >
          <div className="fortschritt__balken" style={{ width: `${bearbeitungsAnteil}%` }} />
        </div>
      </div>

      <div className="lehrkraft__kennzahlen-reihe">
        <div className="karte lehrkraft__kennzahl-karte">
          <p className="lehrkraft__kennzahl-wert">
            {auswertung.ersterVersuchRichtig} von {auswertung.bearbeitet}
          </p>
          <p className="lehrkraft__kennzahl-label">Im ersten Anlauf richtig</p>
        </div>
        <div className="karte lehrkraft__kennzahl-karte">
          <p className="lehrkraft__kennzahl-wert">
            {selbstkorrekturProzent !== null ? `${selbstkorrekturProzent} %` : '–'}
          </p>
          <p className="lehrkraft__kennzahl-label">Nach einem Fehler selbst korrigiert</p>
        </div>
        <div className="karte lehrkraft__kennzahl-karte">
          <p className="lehrkraft__kennzahl-wert">{auswertung.versucheBisLoesungMedian ?? '–'}</p>
          <p className="lehrkraft__kennzahl-label">Versuche bis zur Lösung (Median)</p>
        </div>
        <div className="karte lehrkraft__kennzahl-karte">
          <p className="lehrkraft__kennzahl-wert">{auswertung.hilfenGenutzt}</p>
          <p className="lehrkraft__kennzahl-label">Hilfen genutzt</p>
        </div>
      </div>
      <p className="lehrkraft__einordnung">
        Die Selbstkorrekturquote ist der aussagekräftigste Wert auf dieser Seite: Sie zeigt, ob ein Kind
        einen eigenen Fehler erkennt und behebt – genau die Fähigkeit, die beim echten Sprechen und
        Schreiben zählt, nicht ein fehlerfreier erster Versuch.
      </p>

      <div className="karte stapel">
        <h3>Fehlerprofil</h3>
        {auswertung.fehlerprofil.length === 0 ? (
          <p>Bisher ist keine wiederkehrende Fehlerart aufgetreten.</p>
        ) : (
          <ul className="lehrkraft__balken-liste">
            {auswertung.fehlerprofil.map((eintrag) => (
              <li key={eintrag.art} className="lehrkraft__balken-zeile">
                <span className="lehrkraft__balken-label">{FEHLERART_LABEL[eintrag.art]}</span>
                <div className="fortschritt lehrkraft__fehler-spur" aria-hidden="true">
                  <div
                    className="fortschritt__balken lehrkraft__fehler-balken"
                    style={{ width: `${maxFehler > 0 ? (eintrag.anzahl / maxFehler) * 100 : 0}%` }}
                  />
                </div>
                <span className="lehrkraft__balken-wert">{eintrag.anzahl}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="karte stapel">
        <h3>Wortschatz mit Unsicherheit beim Artikel</h3>
        {auswertung.genusUnsicher.length === 0 ? (
          <p>Bisher ist bei keinem Lernwort eine Artikel-Unsicherheit erkennbar.</p>
        ) : (
          <ul className="lehrkraft__wort-liste">
            {auswertung.genusUnsicher.map((wortId) => {
              const wort = findeWort(modul, wortId)
              if (!wort) return null
              return (
                <li key={wortId} className="lehrkraft__wort-zeile">
                  <span className={`marke--${wort.genus}`}>{wort.genus}</span>
                  <span>{wort.nomen}</span>
                </li>
              )
            })}
          </ul>
        )}
        <p className="lehrkraft__einordnung">
          Diese Wörter eignen sich für gezieltes Nachüben des Artikels – zum Beispiel mit dem
          Wortkarten-Bogen im Reiter „Für Eltern“.
        </p>
      </div>

      <div className="karte stapel">
        <h3>Aufgaben, bei denen die Lösung gezeigt werden musste</h3>
        {auswertung.aufgeloest.length === 0 ? (
          <p>Bei keiner Aufgabe musste die Lösung aufgedeckt werden.</p>
        ) : (
          <ul>
            {auswertung.aufgeloest.map((aufgabeId) => {
              const aufgabe = modul.aufgaben.find((a) => a.id === aufgabeId)
              return <li key={aufgabeId}>{aufgabe?.frage ?? aufgabeId}</li>
            })}
          </ul>
        )}
      </div>

      <div className="lehrkraft__prinzip">
        <p className="lehrkraft__prinzip-kopf">
          <SchildIcon />
          <span>Was hier bewusst nicht steht</span>
        </p>
        <p>
          Keine Bearbeitungszeit, keine Punkte, keine Rangliste. Diese Werte sagen nichts über das
          Sprachverständnis eines Kindes aus und lenken leicht vom eigentlichen Lernziel ab – deshalb
          verzichten wir hier bewusst darauf. Das ist ein Qualitätsmerkmal, kein fehlendes Feature.
        </p>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Reiter 4: Für Eltern
// ---------------------------------------------------------------------------

function FuerEltern(props: { modul: Modul; lernstand: Lernstand }): ReactElement {
  const { modul, lernstand } = props
  const auswertung = useMemo(() => berechneAuswertung(lernstand, modul), [lernstand, modul])
  const lernwoerter = useMemo(() => modul.wortschatz.filter(istLernwort), [modul])

  function drucken(): void {
    window.print()
  }

  return (
    <>
      <div className="lehrkraft__eltern-kopf reihe reihe--gestapelt">
        <p className="lehrkraft__einordnung">
          Dieser Brief ist bereits fertig formuliert. Er kann direkt ausgedruckt werden.
        </p>
        <button type="button" className="knopf knopf--zweit lehrkraft__drucken-knopf" onClick={drucken}>
          <DruckenIcon />
          Diese Seite drucken
        </button>
      </div>

      <article className="karte lehrkraft__brief stapel" aria-label="Elternbrief">
        <p>Liebe Eltern,</p>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>Was Ihr Kind heute geübt hat</h3>
          <p>
            Ihr Kind hat zum Thema „{modul.titel}“ gearbeitet. Es hat diese neuen Wörter gelernt:{' '}
            {lernwoerter.map((wort) => wortMitArtikel(wort)).join(', ')}. Danach hat es einen kurzen Text
            gelesen und dazu Fragen beantwortet.
          </p>
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>Was schon gut klappt</h3>
          {auswertung.bearbeitet === 0 ? (
            <p>Ihr Kind steht noch am Anfang mit diesem Thema. Bald gibt es hier mehr zu berichten.</p>
          ) : (
            <p>
              Ihr Kind hat {auswertung.bearbeitet} Aufgaben bearbeitet. {auswertung.ersterVersuchRichtig}{' '}
              davon hat es gleich beim ersten Mal richtig gemacht.
              {auswertung.selbstkorrekturQuote !== null && auswertung.selbstkorrekturQuote > 0
                ? ' Wenn etwas nicht sofort richtig war, hat Ihr Kind oft selbst die richtige Antwort gefunden. Das ist eine sehr gute Fähigkeit.'
                : ''}
            </p>
          )}
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>Woran wir weiter arbeiten</h3>
          {auswertung.genusUnsicher.length > 0 ? (
            <p>
              Wir üben weiter, welches kleine Wort vor einem Nomen steht: der, die oder das. Das üben wir
              zum Beispiel bei diesen Wörtern:{' '}
              {auswertung.genusUnsicher
                .map((wortId) => findeWort(modul, wortId))
                .filter((wort): wort is NonNullable<typeof wort> => wort !== undefined)
                .map((wort) => wortMitArtikel(wort))
                .join(', ')}
              .
            </p>
          ) : (
            <p>Wir üben weiter das Lesen und Verstehen von kurzen Texten.</p>
          )}
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>Wie Sie zu Hause helfen können</h3>
          <ul>
            <li>
              Benennen Sie zusammen Dinge zu Hause auf Deutsch, zum Beispiel: der Tisch, die Tür, das
              Fenster.
            </li>
            <li>
              Lassen Sie Ihr Kind laut vorlesen. Das ist wichtig, auch wenn nicht jedes Wort verstanden
              wird.
            </li>
            <li>Fragen Sie nach der Schule: „Was hast du heute gelernt?“ Auch eine kurze Antwort hilft.</li>
          </ul>
        </section>

        <p>Vielen Dank für Ihre Unterstützung!</p>
        <p>Mit freundlichen Grüßen</p>
        <div className="lehrkraft__unterschrift-linie" aria-hidden="true" />
        <p className="lehrkraft__brief-signatur-label">Unterschrift der Lehrkraft</p>
      </article>

      <div className="karte">
        <Wortkarten modul={modul} />
      </div>

      <div className="karte karte--ruhig lehrkraft__datenschutz stapel">
        <p className="lehrkraft__datenschutz-kopf">
          <SchlossIcon />
          <span>Datenschutz</span>
        </p>
        <p>
          In dieser Demo werden keine personenbezogenen Daten erhoben, verarbeitet oder übertragen. Es gibt
          kein Konto, keinen Namen und keine Cookies. Es werden keine Analyse-Dienste eingesetzt, und
          Schriften sind selbst gehostet. Der Lernstand liegt ausschließlich im Browser dieses Geräts und
          lässt sich mit einem Klick löschen.
        </p>
      </div>
    </>
  )
}
