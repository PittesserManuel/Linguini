/**
 * Wortbild - der Bild-Wort-Lernteil, erster der beiden Modulteile.
 *
 * Zwei Modi ueber eine Reiterleiste:
 * - "Entdecken": alle 15 Woerter beschriftet, Klick auf Beschriftung oder
 *   Objekt oeffnet die Wortkarte.
 * - "Ueben": keine Beschriftungen, das Kind sucht die 7 Lernwoerter in
 *   deterministischer Reihenfolge (Reihenfolge im Wortschatz-Array).
 *
 * Die Szene (SVG) wird nie doppelt gemountet: jedes Reiter-Panel rendert
 * seinen Inhalt nur, wenn es das aktive Panel ist (siehe `Buehne`).
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react'
import { findeWort, istLernwort, wortMitArtikel } from '@/content/types'
import type { Modul, Wort } from '@/content/types'
import { KlassenzimmerSzene } from './Szene'
import { WortKarte } from './WortKarte'
import './wortbild.css'

export interface WortbildProps {
  modul: Modul
  /** Ein Wort wurde angesehen: Wortkarte geoeffnet oder vorgelesen. */
  onWortAngesehen?: (wortId: string) => void
  /** Antwort in der Mini-Uebung "Welcher Artikel?" innerhalb der Wortkarte. */
  onArtikelAntwort?: (wortId: string, richtig: boolean) => void
}

type Modus = 'entdecken' | 'ueben'

interface Rueckmeldung {
  id: number
  typ: 'richtig' | 'falsch'
  text: string
}

/** Stabile leere Menge - vermeidet unnoetige Neuzuweisungen pro Render. */
const LEERE_MENGE: ReadonlySet<string> = new Set()

// ---------------------------------------------------------------------------
// Legende: Farbe + Form + Beispielwort - macht die Artikelkodierung lernbar
// ---------------------------------------------------------------------------

interface LegendeEintrag {
  genus: 'der' | 'die' | 'das'
  form: string
  beispiel: Wort
}

/** Wirft bewusst, statt still zu scheitern - fehlende Genera sind ein Bug im Inhalt. */
function sucheBeispielwort(modul: Modul, genus: 'der' | 'die' | 'das'): Wort {
  const lernwort = modul.wortschatz.find((w) => w.genus === genus && istLernwort(w))
  if (lernwort) return lernwort
  const irgendeinWort = modul.wortschatz.find((w) => w.genus === genus)
  if (!irgendeinWort) {
    throw new Error(`Wortbild: kein Wort mit Genus "${genus}" im Modul "${modul.id}" gefunden.`)
  }
  return irgendeinWort
}

function ermittleLegendenBeispiele(modul: Modul): LegendeEintrag[] {
  return [
    { genus: 'der', form: 'Kreis', beispiel: sucheBeispielwort(modul, 'der') },
    { genus: 'die', form: 'Raute', beispiel: sucheBeispielwort(modul, 'die') },
    { genus: 'das', form: 'Quadrat', beispiel: sucheBeispielwort(modul, 'das') },
  ]
}

function Legende({ modul }: { modul: Modul }): ReactElement {
  const titelId = useId()
  const eintraege = useMemo(() => ermittleLegendenBeispiele(modul), [modul])

  return (
    <section className="karte karte--ruhig wortbild__legende" aria-labelledby={titelId}>
      <h3 id={titelId} className="wortbild__legende-titel">
        So sind die Artikel markiert
      </h3>
      <ul className="wortbild__legende-liste">
        {eintraege.map((eintrag) => (
          <li key={eintrag.genus} className="wortbild__legende-eintrag">
            <span className={`marke--${eintrag.genus}`}>{eintrag.genus}</span>
            <span className="wortbild__legende-form">{eintrag.form}</span>
            <span className="wortbild__legende-beispiel">– {wortMitArtikel(eintrag.beispiel)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Die Buehne: Szene + optionale Beschriftungsebene, nie doppelt gemountet
// ---------------------------------------------------------------------------

interface BuehneProps {
  modus: Modus
  aktiv: string | null
  gefunden: ReadonlySet<string>
  onObjektKlick: (id: string) => void
  children?: ReactNode
}

function Buehne({ modus, aktiv, gefunden, onObjektKlick, children }: BuehneProps): ReactElement {
  return (
    <div className="wortbild__buehne">
      <div className="wortbild__rahmen" data-modus={modus}>
        <KlassenzimmerSzene aktiv={aktiv} gefunden={gefunden} onObjektKlick={onObjektKlick} interaktiv />
        {/* Die Beschriftungsebene MUSS hier drin liegen: ihre Prozentkoordinaten
            beziehen sich auf das Bild, nicht auf die Buehne drumherum. */}
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Entdecken: Beschriftungsebene
// ---------------------------------------------------------------------------

interface BeschriftungsEbeneProps {
  modul: Modul
  offenesWortId: string | null
  onLabelKlick: (id: string) => void
}

function BeschriftungsEbene({ modul, offenesWortId, onLabelKlick }: BeschriftungsEbeneProps): ReactElement {
  return (
    <ol className="wortbild__beschriftungen" aria-label="Wörter im Bild">
      {modul.wortschatz.map((wort) => {
        const klassen = [
          'wortbild__label',
          `wortbild__label--${wort.labelSeite}`,
          wort.neu ? 'wortbild__label--lernwort' : 'wortbild__label--stuetzwort',
        ]
        if (offenesWortId === wort.id) klassen.push('wortbild__label--aktiv')
        const positionsVariablen = {
          '--x': wort.punkt.x,
          '--y': wort.punkt.y,
        } as CSSProperties

        return (
          <li key={wort.id} className={klassen.join(' ')} style={positionsVariablen}>
            <span className={`wortbild__anker wortbild__anker--${wort.genus}`} aria-hidden="true" />
            <button type="button" className="wortbild__label-knopf" onClick={() => onLabelKlick(wort.id)}>
              <span className={`marke--${wort.genus} wortbild__label-marke`}>{wort.genus}</span>
              <span className="wortbild__label-nomen">{wort.nomen}</span>
              <span className="visuell-versteckt"> – Wortkarte öffnen</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Ueben: Aufgabenkopf mit Zielwort, Fortschritt und Rueckmeldung
// ---------------------------------------------------------------------------

interface UebenKopfProps {
  ziel: Wort | null
  gefundenAnzahl: number
  gesamtAnzahl: number
  rueckmeldung: Rueckmeldung | null
  fertigRef: RefObject<HTMLHeadingElement | null>
  onNeuStarten: () => void
}

function UebenKopf({
  ziel,
  gefundenAnzahl,
  gesamtAnzahl,
  rueckmeldung,
  fertigRef,
  onNeuStarten,
}: UebenKopfProps): ReactElement {
  const fortschrittProzent = gesamtAnzahl > 0 ? (gefundenAnzahl / gesamtAnzahl) * 100 : 0

  return (
    <div className="karte wortbild__ueben-kopf stapel">
      <div aria-live="polite">
        {rueckmeldung && (
          <p key={rueckmeldung.id} className={`melde melde--${rueckmeldung.typ}`}>
            {rueckmeldung.text}
          </p>
        )}
      </div>

      {ziel ? (
        <h3 aria-live="polite" className="wortbild__ueben-frage">
          Finde: <span className={`marke--${ziel.genus}`}>{ziel.genus}</span>{' '}
          <span className="wortbild__ueben-nomen">{ziel.nomen}</span>
        </h3>
      ) : (
        <h3 ref={fertigRef} tabIndex={-1} className="wortbild__ueben-frage">
          Fertig! Du hast alle {gesamtAnzahl} Wörter gefunden.
        </h3>
      )}

      <div className="wortbild__ueben-fortschritt">
        <div
          className="fortschritt"
          role="progressbar"
          aria-label="Fortschritt der Übung"
          aria-valuemin={0}
          aria-valuemax={gesamtAnzahl}
          aria-valuenow={gefundenAnzahl}
          aria-valuetext={`${gefundenAnzahl} von ${gesamtAnzahl} Wörtern gefunden`}
        >
          <div className="fortschritt__balken" style={{ width: `${fortschrittProzent}%` }} />
        </div>
        <p className="wortbild__ueben-fortschritt-text" aria-hidden="true">
          {gefundenAnzahl} von {gesamtAnzahl}
        </p>
      </div>

      {!ziel && (
        <button type="button" className="knopf knopf--zweit" onClick={onNeuStarten}>
          Übung neu starten
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

export function Wortbild(props: WortbildProps): ReactElement {
  const { modul, onWortAngesehen, onArtikelAntwort } = props
  const ueberschriftId = useId()
  const tabEntdeckenId = useId()
  const tabUebenId = useId()
  const panelEntdeckenId = useId()
  const panelUebenId = useId()
  const fertigRef = useRef<HTMLHeadingElement | null>(null)

  const [modus, setModus] = useState<Modus>('entdecken')
  const [offenesWortId, setOffenesWortId] = useState<string | null>(null)
  const letztesWortRef = useRef<Wort | null>(null)

  const [uebenIndex, setUebenIndex] = useState(0)
  const [uebenGefunden, setUebenGefunden] = useState<ReadonlySet<string>>(LEERE_MENGE)
  const [falschesObjekt, setFalschesObjekt] = useState<string | null>(null)
  const [rueckmeldung, setRueckmeldung] = useState<Rueckmeldung | null>(null)

  const lernwoerter = useMemo(() => modul.wortschatz.filter(istLernwort), [modul])
  const uebenZiel = lernwoerter[uebenIndex] ?? null

  if (offenesWortId) {
    const gefundenesWort = findeWort(modul, offenesWortId)
    if (gefundenesWort) letztesWortRef.current = gefundenesWort
  }

  useEffect(() => {
    if (!uebenZiel) fertigRef.current?.focus()
  }, [uebenZiel])

  function wechsleModus(neu: Modus): void {
    setModus(neu)
    setOffenesWortId(null)
    // Transiente Ueben-Rueckmeldung nicht ueber einen Reiterwechsel hinweg
    // stehen lassen - der Fortschritt (uebenIndex/uebenGefunden) bleibt aber
    // erhalten, das Kind soll nicht von vorn anfangen muessen.
    setFalschesObjekt(null)
    setRueckmeldung(null)
  }

  function oeffneWortkarte(id: string): void {
    setOffenesWortId(id)
    onWortAngesehen?.(id)
  }

  function meldeRueckmeldung(typ: Rueckmeldung['typ'], text: string): void {
    setRueckmeldung((vorherige) => ({ id: (vorherige?.id ?? 0) + 1, typ, text }))
  }

  function behandleUebenKlick(id: string): void {
    if (!uebenZiel) return
    const geklickt = findeWort(modul, id)
    if (!geklickt) return

    if (id === uebenZiel.id) {
      setFalschesObjekt(null)
      setUebenGefunden((vorherige) => {
        const naechste = new Set(vorherige)
        naechste.add(id)
        return naechste
      })
      meldeRueckmeldung('richtig', `Richtig! Das ist ${wortMitArtikel(uebenZiel)}.`)
      setUebenIndex((i) => i + 1)
    } else {
      setFalschesObjekt(id)
      meldeRueckmeldung(
        'falsch',
        `Noch nicht ganz. Das ist ${wortMitArtikel(geklickt)}. Suche ${wortMitArtikel(uebenZiel)}.`,
      )
    }
  }

  function starteUebungNeu(): void {
    setUebenIndex(0)
    setUebenGefunden(LEERE_MENGE)
    setFalschesObjekt(null)
    setRueckmeldung(null)
  }

  function handleObjektKlick(id: string): void {
    if (modus === 'entdecken') {
      oeffneWortkarte(id)
    } else {
      behandleUebenKlick(id)
    }
  }

  return (
    <section className="wortbild stapel" aria-labelledby={ueberschriftId}>
      <h2 id={ueberschriftId}>Wortschatz im Bild</h2>

      <Legende modul={modul} />

      <div className="reiter" role="tablist" aria-label="Ansicht wählen">
        <button
          type="button"
          role="tab"
          id={tabEntdeckenId}
          aria-selected={modus === 'entdecken'}
          aria-controls={panelEntdeckenId}
          className="reiter__knopf"
          onClick={() => wechsleModus('entdecken')}
        >
          Entdecken
        </button>
        <button
          type="button"
          role="tab"
          id={tabUebenId}
          aria-selected={modus === 'ueben'}
          aria-controls={panelUebenId}
          className="reiter__knopf"
          onClick={() => wechsleModus('ueben')}
        >
          Üben
        </button>
      </div>

      <div id={panelEntdeckenId} role="tabpanel" aria-labelledby={tabEntdeckenId} hidden={modus !== 'entdecken'}>
        {modus === 'entdecken' && (
          <>
            <p className="wortbild__anleitung">
              Klicke auf ein Wort oder auf einen Gegenstand im Bild. Große Wörter sind neu, kleine
              Wörter kennst du schon.
            </p>
            <Buehne modus="entdecken" aktiv={offenesWortId} gefunden={LEERE_MENGE} onObjektKlick={handleObjektKlick}>
              <BeschriftungsEbene modul={modul} offenesWortId={offenesWortId} onLabelKlick={oeffneWortkarte} />
            </Buehne>
          </>
        )}
      </div>

      <div id={panelUebenId} role="tabpanel" aria-labelledby={tabUebenId} hidden={modus !== 'ueben'}>
        {modus === 'ueben' && (
          <div className="stapel">
            <UebenKopf
              ziel={uebenZiel}
              gefundenAnzahl={uebenGefunden.size}
              gesamtAnzahl={lernwoerter.length}
              rueckmeldung={rueckmeldung}
              fertigRef={fertigRef}
              onNeuStarten={starteUebungNeu}
            />
            <Buehne modus="ueben" aktiv={falschesObjekt} gefunden={uebenGefunden} onObjektKlick={handleObjektKlick} />
          </div>
        )}
      </div>

      <WortKarte
        wort={letztesWortRef.current}
        offen={offenesWortId !== null}
        onSchliessen={() => setOffenesWortId(null)}
        onArtikelAntwort={onArtikelAntwort}
        onAngehoert={onWortAngesehen}
      />
    </section>
  )
}
