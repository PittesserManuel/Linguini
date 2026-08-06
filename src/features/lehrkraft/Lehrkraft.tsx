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
import { AUSSAGEKRAEFTIG_AB, alleAufgaben, berechneAuswertung } from './auswertung'
import { ELTERNBRIEF_SPRACHEN, fuelle } from './elternbrief-sprachen'
import type { SprachCode } from './elternbrief-sprachen'
import { Uebergabe } from './Uebergabe'
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
  numerus: 'Einzahl / Mehrzahl',
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

type ReiterId = 'lernziele' | 'differenzierung' | 'auswertung' | 'uebergabe' | 'eltern'

const REITER: { id: ReiterId; label: string }[] = [
  { id: 'lernziele', label: 'Lernziele & Lehrplan' },
  { id: 'differenzierung', label: 'Differenzierung' },
  { id: 'auswertung', label: 'Auswertung' },
  { id: 'uebergabe', label: 'Übergabe ans Heft' },
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

      {aktiv === 'uebergabe' && (
        <div
          id={`${basisId}-panel-uebergabe`}
          role="tabpanel"
          aria-labelledby={`${basisId}-reiter-uebergabe`}
          tabIndex={0}
          className="lehrkraft__panel"
        >
          <UebergabeAnsicht modul={modul} lernstand={lernstand} />
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
          unter dem für die Sekundarstufe I üblichen Richtwert von 13 bis 16 Wörtern pro Satz – dieser
          Richtwert gilt für Jugendliche mit Deutsch als Erstsprache. Die Zielgruppe dieses Moduls lernt
          Deutsch als Zweitsprache auf Niveau {modul.niveau}. Sprachliche Komplexität entsteht hier bewusst
          über die Aufgaben, nicht über die Satzlänge.
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

  // Leerzustand: Statt nur zu melden, dass nichts da ist, sagt er, WAS hier
  // stehen wird. Wer diesen Bereich zum ersten Mal oeffnet - typischerweise
  // eine Lehrkraft, die die App bewertet -, sieht sonst eine leere Seite und
  // schliesst daraus, dass es nichts zu sehen gibt.
  if (auswertung.bearbeitet === 0) {
    return (
      <div className="karte lehrkraft__leerzustand stapel">
        <h3>Noch keine Auswertung</h3>
        <p>
          Für dieses Modul liegen noch keine bearbeiteten Aufgaben vor. Sobald die erste Aufgabe
          abgeschlossen ist, steht hier:
        </p>
        <ul className="lehrkraft__leerzustand-liste">
          <li>der Bearbeitungsstand über alle Aufgaben dieses Lernwegs,</li>
          <li>das Fehlerprofil – nicht „wie viel Prozent“, sondern welche Fehlerart überwiegt,</li>
          <li>die Selbstkorrekturquote: Was wurde nach einem Fehlversuch selbst richtiggestellt?</li>
          <li>die Lernwörter, bei denen der Artikel noch unsicher sitzt,</li>
          <li>die Schreibaufträge, die auf Ihre Korrektur im Heft warten.</li>
        </ul>
        <p className="lehrkraft__leerzustand-hinweis">
          Die Daten entstehen ausschließlich in diesem Browser und verlassen das Gerät nicht.
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

      {!auswertung.aussagekraeftig ? (
        /*
         * Unter fuenf bearbeiteten Aufgaben stand hier "0 von 1", "0 %" und
         * ein Fehlerbalken ueber die volle Breite. Das ist kein Befund, das
         * sieht nur aus wie einer - und zwar wie ein Alarm. Eine Quote aus
         * einem einzigen Versuch ist Rauschen; sie zu zeigen, laedt zu einem
         * Urteil ein, das die Daten nicht hergeben.
         *
         * Der Bearbeitungsstand darueber bleibt sichtbar, denn der stimmt ab
         * der ersten Aufgabe.
         */
        <div className="karte karte--ruhig stapel">
          <h3>Noch zu wenige Aufgaben für eine Aussage</h3>
          <p>
            Kennzahlen und Fehlerprofil erscheinen ab {AUSSAGEKRAEFTIG_AB} bearbeiteten Aufgaben.
            Bisher sind es {auswertung.bearbeitet}. Aus einzelnen Versuchen lässt sich keine Quote
            bilden, die etwas über das Kind aussagt – ein „0 %“ nach einer Aufgabe wäre nur eine Zahl,
            die falsch aussieht.
          </p>
          <p className="lehrkraft__einordnung">
            Was schon jetzt zählt, steht weiter unten: die Wörter mit unsicherem Artikel und die
            Schreibaufträge, die auf Ihre Korrektur im Heft warten.
          </p>
        </div>
      ) : (
        <>
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
            Die Selbstkorrekturquote ist der aussagekräftigste Wert auf dieser Seite: Sie zeigt, ob ein
            Kind einen eigenen Fehler erkennt und behebt – genau die Fähigkeit, die beim echten Sprechen
            und Schreiben zählt, nicht ein fehlerfreier erster Versuch.
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
        </>
      )}

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
              const aufgabe = alleAufgaben(modul).find((a) => a.id === aufgabeId)
              return <li key={aufgabeId}>{aufgabe?.frage ?? aufgabeId}</li>
            })}
          </ul>
        )}
      </div>

      {/* Die einzige Liste hier, die eine HANDLUNG verlangt: Diese Texte hat
          die App nie gesehen. Sie kann nur melden, dass sie geschrieben
          wurden - beurteilen muss sie ein Mensch. */}
      <div className="karte stapel">
        <h3>Wartet auf Ihre Korrektur im Heft</h3>
        {auswertung.offeneHeftauftraege.length === 0 ? (
          <p>Derzeit ist kein Schreibauftrag als erledigt gemeldet.</p>
        ) : (
          <>
            <ul className="lehrkraft__heftliste">
              {auswertung.offeneHeftauftraege.map((aufgabeId) => {
                const aufgabe = alleAufgaben(modul).find((a) => a.id === aufgabeId)
                const heft = aufgabe?.typ === 'heft' ? aufgabe.heft : undefined
                return (
                  <li key={aufgabeId}>
                    {heft && (
                      <span className="chip">
                        {heft === 'vokabelheft' ? 'Vokabelheft' : 'Linguini-Heft'}
                      </span>
                    )}{' '}
                    {aufgabe?.frage ?? aufgabeId}
                  </li>
                )
              })}
            </ul>
            <p className="lehrkraft__hinweis">
              Diese Aufträge werden absichtlich nicht automatisch bewertet. Es geht um selbst
              formulierte Sätze – dort zählt neben dem Inhalt die Schreibrichtigkeit, und beides
              zusammen kann nur eine Lehrperson beurteilen.
            </p>
          </>
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

// ---------------------------------------------------------------------------
// Uebergabe ans Heft - der Zettel, der die Sitzung mit der Korrektur verbindet
// ---------------------------------------------------------------------------

function UebergabeAnsicht(props: { modul: Modul; lernstand: Lernstand }): ReactElement {
  const { modul, lernstand } = props
  const auswertung = useMemo(() => berechneAuswertung(lernstand, modul), [lernstand, modul])

  return (
    <>
      <div className="lehrkraft__eltern-kopf reihe reihe--gestapelt">
        <p className="lehrkraft__einordnung">
          Am Ende der Stunde ausdrucken, Namen eintragen und ins Heft kleben. Es werden keine Daten
          übertragen – der Zettel entsteht in diesem Browser und geht auf Papier weiter.
        </p>
        <button
          type="button"
          className="knopf knopf--zweit lehrkraft__drucken-knopf"
          onClick={() => window.print()}
        >
          <DruckenIcon />
          Zettel drucken
        </button>
      </div>

      <Uebergabe
        modul={modul}
        auswertung={auswertung}
        stufe={lernstand.stufe}
        jahrgang={lernstand.jahrgang}
      />
    </>
  )
}

function FuerEltern(props: { modul: Modul; lernstand: Lernstand }): ReactElement {
  const { modul, lernstand } = props
  const auswertung = useMemo(() => berechneAuswertung(lernstand, modul), [lernstand, modul])
  const lernwoerter = useMemo(() => modul.wortschatz.filter(istLernwort), [modul])
  const [sprachCode, setSprachCode] = useState<SprachCode>('de')

  const texte = ELTERNBRIEF_SPRACHEN.find((s) => s.code === sprachCode) ?? ELTERNBRIEF_SPRACHEN[0]!

  // Die Wortlisten bleiben deutsch - sie sind der Gegenstand des Briefs.
  // "der Radiergummi" soll zu Hause auf Deutsch gesagt werden.
  const neueWoerter = lernwoerter.map((wort) => wortMitArtikel(wort)).join(', ')
  const unsichereWoerter = auswertung.genusUnsicher
    .map((wortId) => findeWort(modul, wortId))
    .filter((wort): wort is NonNullable<typeof wort> => wort !== undefined)
    .map((wort) => wortMitArtikel(wort))
    .join(', ')

  return (
    <>
      <div className="lehrkraft__eltern-kopf reihe reihe--gestapelt">
        <p className="lehrkraft__einordnung">
          Dieser Brief ist bereits fertig formuliert. Er kann direkt ausgedruckt werden.
        </p>
        <button
          type="button"
          className="knopf knopf--zweit lehrkraft__drucken-knopf"
          onClick={() => window.print()}
        >
          <DruckenIcon />
          Diese Seite drucken
        </button>
      </div>

      {/*
        Die Sprachwahl steht ueber dem Brief und wird nicht mitgedruckt.
        Der Eigenname zuerst ("Türkçe"), der deutsche Name klein darunter:
        Wer die Sprache braucht, erkennt sie am Eigennamen; die Lehrkraft
        beim Auswaehlen am deutschen.
      */}
      <fieldset className="lehrkraft__sprachwahl">
        <legend className="lehrkraft__sprachwahl-legende">Sprache des Briefs</legend>
        <div className="lehrkraft__sprachwahl-optionen">
          {ELTERNBRIEF_SPRACHEN.map((sprache) => (
            <label
              key={sprache.code}
              className={`lehrkraft__sprache${sprachCode === sprache.code ? ' ist-gewaehlt' : ''}`}
            >
              <input
                type="radio"
                name="elternbrief-sprache"
                value={sprache.code}
                checked={sprachCode === sprache.code}
                onChange={() => setSprachCode(sprache.code)}
              />
              <span lang={sprache.code === 'bks' ? 'bs' : sprache.code} dir={sprache.richtung}>
                {sprache.eigenname}
              </span>
              {sprache.code !== 'de' && (
                <span className="lehrkraft__sprache-deutsch">{sprache.deutsch}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <article
        className="karte lehrkraft__brief stapel"
        aria-label="Elternbrief"
        lang={texte.code === 'bks' ? 'bs' : texte.code}
        dir={texte.richtung}
      >
        <p>{texte.anrede}</p>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>{texte.titelGeuebt}</h3>
          <p>{fuelle(texte.satzGeuebt, { thema: modul.titel, woerter: neueWoerter })}</p>
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>{texte.titelKlappt}</h3>
          {/*
            Bewusst ohne Zahlen. Frueher stand hier "Ihr Kind hat 3 Aufgaben
            bearbeitet, 1 davon gleich richtig" - eine Quote aus einer
            Handvoll Versuchen, die im Elterngespraech ein Gewicht bekommt,
            das sie nicht tragen kann. Dieselbe Ueberlegung wie bei der
            Kennzahlenschwelle in der Auswertung. Wer Zahlen braucht, findet
            sie dort; dieser Brief soll etwas anderes leisten.
          */}
          {!auswertung.aussagekraeftig ? (
            <p>{texte.satzAnfang}</p>
          ) : (
            <p>
              {texte.satzArbeitet}
              {auswertung.selbstkorrekturQuote !== null && auswertung.selbstkorrekturQuote > 0
                ? ` ${texte.satzSelbstkorrektur}`
                : ''}
            </p>
          )}
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>{texte.titelWeiter}</h3>
          {unsichereWoerter.length > 0 ? (
            <p>{fuelle(texte.satzArtikel, { woerter: unsichereWoerter })}</p>
          ) : (
            <p>{texte.satzLesen}</p>
          )}
        </section>

        <section className="stapel lehrkraft__brief-abschnitt">
          <h3>{texte.titelHilfe}</h3>
          <ul>
            {texte.hilfen.map((hilfe, i) => (
              <li key={i}>{hilfe}</li>
            ))}
          </ul>
        </section>

        <p>{texte.dank}</p>
        <p>{texte.gruss}</p>
        <div className="lehrkraft__unterschrift-linie" aria-hidden="true" />
        <p className="lehrkraft__brief-signatur-label">{texte.unterschrift}</p>
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
