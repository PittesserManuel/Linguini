/**
 * Wortbild - der Bild-Wort-Lernteil, erster der beiden Modulteile.
 *
 * Drei Modi ueber eine Reiterleiste, in aufsteigender Schwierigkeit:
 * - "Entdecken": alle Woerter beschriftet, Klick auf Beschriftung oder Objekt
 *   oeffnet die Wortkarte. Dazu die Auftraege fuer Vokabelheft und Linguini-Heft.
 * - "Zuordnen": keine Beschriftungen, das Kind SUCHT das genannte Wort im Bild.
 * - "Schreiben": ein Gegenstand ist im Bild eingerahmt, das Kind SCHREIBT das
 *   Wort mit Artikel. Wiedererkennen ist leichter als Abrufen - deshalb steht
 *   dieser Modus hinten.
 *
 * Geuebt wird immer PAKETWEISE (siehe content/types.ts, Wortpaket): Das Bild
 * zeigt einundzwanzig beschriftete Dinge, abgefragt werden hoechstens fuenf
 * am Stueck. Ohne diese Portionierung waere der reiche Bildinhalt eine
 * Ueberforderung statt eines Angebots.
 *
 * Die Szene (SVG) wird nie doppelt gemountet: jedes Reiter-Panel rendert
 * seinen Inhalt nur, wenn es das aktive Panel ist (siehe `Buehne`).
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react'
import { findeWort, wortMitArtikel, woerterVonPaket, wortpaketeVon } from '@/content/types'
import type { AufgabeFreitext, AufgabeHeft, Modul, Niveaustufe, Wort, Wortpaket } from '@/content/types'
import { bewerte } from '@/grading'
import type { Bewertung, GraderErgebnis } from '@/grading/types'
import { Melde } from '@/components/Melde'
import { KlassenzimmerSzene } from './Szene'
import { BildSzene } from './BildSzene'
import { WortKarte } from './WortKarte'
import './wortbild.css'

export interface WortbildProps {
  modul: Modul
  stufe: Niveaustufe
  /** Ein Wort wurde angesehen: Wortkarte geoeffnet oder vorgelesen. */
  onWortAngesehen?: (wortId: string) => void
  /** Antwort in der Mini-Uebung "Welcher Artikel?" innerhalb der Wortkarte. */
  onArtikelAntwort?: (wortId: string, richtig: boolean) => void
}

type Modus = 'entdecken' | 'zuordnen' | 'schreiben'

interface Rueckmeldung {
  id: number
  bewertung: Bewertung
  text: string
}

/** Stabile leere Menge - vermeidet unnoetige Neuzuweisungen pro Render. */
const LEERE_MENGE: ReadonlySet<string> = new Set()

const MODI: { modus: Modus; label: string }[] = [
  { modus: 'entdecken', label: 'Entdecken' },
  { modus: 'zuordnen', label: 'Zuordnen' },
  { modus: 'schreiben', label: 'Schreiben' },
]

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
  const lernwort = modul.wortschatz.find((w) => w.genus === genus && w.neu)
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
// Paketwahl - welche Portion Wortschatz wird gerade geuebt?
// ---------------------------------------------------------------------------

function Paketwahl(props: {
  pakete: Wortpaket[]
  aktivId: string
  onWaehlen: (id: string) => void
}): ReactElement | null {
  const { pakete, aktivId, onWaehlen } = props
  if (pakete.length < 2) return null

  return (
    <fieldset className="wortbild__paketwahl">
      <legend className="wortbild__paketwahl-legende">Was übst du gerade?</legend>
      <div className="wortbild__paketwahl-optionen">
        {pakete.map((paket) => (
          <label
            key={paket.id}
            className={`wortbild__paket-option${aktivId === paket.id ? ' ist-gewaehlt' : ''}`}
          >
            <input
              type="radio"
              name="wortpaket"
              value={paket.id}
              checked={aktivId === paket.id}
              onChange={() => onWaehlen(paket.id)}
            />
            {paket.titel}
            <span className="wortbild__paket-anzahl">{paket.woerter.length}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// Die Buehne: Szene + optionale Beschriftungsebene, nie doppelt gemountet
// ---------------------------------------------------------------------------

interface BuehneProps {
  modul: Modul
  modus: Modus
  aktiv: string | null
  gefunden: ReadonlySet<string>
  onObjektKlick: (id: string) => void
  /** Im Schreiben-Modus sind die Objekte nicht anklickbar - es wird getippt. */
  klickbar?: boolean
  children?: ReactNode
}

function Buehne({ modul, modus, aktiv, gefunden, onObjektKlick, klickbar = true, children }: BuehneProps): ReactElement {
  const szene = modul.szene
  return (
    <div className="wortbild__buehne">
      <div className="wortbild__rahmen" data-modus={modus} data-szene={szene.art}>
        {szene.art === 'svg' ? (
          <KlassenzimmerSzene aktiv={aktiv} gefunden={gefunden} onObjektKlick={onObjektKlick} interaktiv={klickbar} />
        ) : (
          <BildSzene
            szene={szene}
            woerter={modul.wortschatz}
            aktiv={aktiv}
            gefunden={gefunden}
            onObjektKlick={onObjektKlick}
            interaktiv={klickbar}
          />
        )}
      </div>
      {/* Die Beschriftungsebene liegt NEBEN dem Rahmen, nicht darin. Sie ist
          absolut auf die Buehne positioniert, deren Hoehe der Rahmen vorgibt -
          deckt sich also exakt mit dem Bild. Laege sie im Rahmen, wuerde
          overflow:hidden auf Mobilgeraeten die Liste abschneiden, zu der sie
          dort umbricht. */}
      {children}
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
// Heftauftraege im Entdecken-Bereich
//
// Der Platz ist bewusst gewaehlt: Hier sieht das Kind gerade alle Woerter
// beschriftet vor sich - genau der Moment, in dem sie ins Vokabelheft
// gehoeren. Die App bewertet hier nichts; sie stellt den Auftrag.
// ---------------------------------------------------------------------------

const HEFT_NAME: Record<AufgabeHeft['heft'], string> = {
  vokabelheft: 'Vokabelheft',
  linguiniheft: 'Linguini-Heft',
}

function Heftauftraege({ auftraege }: { auftraege: AufgabeHeft[] }): ReactElement | null {
  const titelId = useId()
  if (auftraege.length === 0) return null

  return (
    <section className="karte wortbild__heft stapel" aria-labelledby={titelId}>
      <h3 id={titelId} className="wortbild__heft-titel">
        Das schreibst du ins Heft
      </h3>
      <p className="wortbild__heft-vorspann">
        Diese Aufträge macht die App nicht für dich. Deine Lehrerin oder dein Lehrer schaut sie sich an.
      </p>
      <ul className="wortbild__heft-liste">
        {auftraege.map((auftrag) => (
          <li key={auftrag.id} className="wortbild__heft-eintrag">
            <p className="chip wortbild__heft-marke">{HEFT_NAME[auftrag.heft]}</p>
            <p className="wortbild__heft-auftrag">{auftrag.frage}</p>
            {auftrag.umfang && <p className="wortbild__heft-umfang">{auftrag.umfang}</p>}
            {auftrag.musterSaetze && (
              <p className="wortbild__heft-muster">
                Beispiel: <em>{auftrag.musterSaetze[0]}</em>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Uebungskopf mit Zielwort, Fortschritt und Rueckmeldung
// ---------------------------------------------------------------------------

interface UebenKopfProps {
  paketTitel: string
  gefundenAnzahl: number
  gesamtAnzahl: number
  rueckmeldung: Rueckmeldung | null
  fertigRef: RefObject<HTMLHeadingElement | null>
  onNeuStarten: () => void
  /** Die Aufgabenzeile - je nach Modus "Finde: …" oder das Eingabefeld. */
  frage: ReactNode
  fertig: boolean
}

function UebenKopf({
  paketTitel,
  gefundenAnzahl,
  gesamtAnzahl,
  rueckmeldung,
  fertigRef,
  onNeuStarten,
  frage,
  fertig,
}: UebenKopfProps): ReactElement {
  const fortschrittProzent = gesamtAnzahl > 0 ? (gefundenAnzahl / gesamtAnzahl) * 100 : 0

  return (
    <div className="karte wortbild__ueben-kopf stapel">
      <p className="chip wortbild__paket-marke">{paketTitel}</p>

      <div aria-live="polite">
        {rueckmeldung && (
          <Melde key={rueckmeldung.id} bewertung={rueckmeldung.bewertung}>
            {rueckmeldung.text}
          </Melde>
        )}
      </div>

      {fertig ? (
        <h3 ref={fertigRef} tabIndex={-1} className="wortbild__ueben-frage">
          Fertig! Du hast alle {gesamtAnzahl} Wörter geschafft.
        </h3>
      ) : (
        frage
      )}

      <div className="wortbild__ueben-fortschritt">
        <div
          className="fortschritt"
          role="progressbar"
          aria-label="Fortschritt der Übung"
          aria-valuemin={0}
          aria-valuemax={gesamtAnzahl}
          aria-valuenow={gefundenAnzahl}
          aria-valuetext={`${gefundenAnzahl} von ${gesamtAnzahl} Wörtern geschafft`}
        >
          <div className="fortschritt__balken" style={{ width: `${fortschrittProzent}%` }} />
        </div>
        <p className="wortbild__ueben-fortschritt-text" aria-hidden="true">
          {gefundenAnzahl} von {gesamtAnzahl}
        </p>
      </div>

      {fertig && (
        <button type="button" className="knopf knopf--zweit" onClick={onNeuStarten}>
          Übung neu starten
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Schreiben-Modus: aus einem Wort wird eine Freitextaufgabe
//
// Bewusst KEINE eigene Vergleichslogik: Die Korrektur-Engine kennt bereits
// Rechtschreibtoleranz, getrennte Artikelbewertung und die dreistufige
// Rueckmeldung. Sie hier nachzubauen hiesse, zwei Wahrheiten darueber zu
// haben, was "richtig" ist.
// ---------------------------------------------------------------------------

function schreibAufgabe(wort: Wort): AufgabeFreitext {
  return {
    id: `schreiben-${wort.id}`,
    typ: 'freitext',
    frage: 'Wie heißt dieser Gegenstand? Schreibe das Wort mit Artikel.',
    ebene: 'sprachbetrachtend',
    abStufe: 'einfach',
    // Nur die Form MIT Artikel, denn genau danach fragt die Aufgabe. Das
    // blosse Nomen stand hier frueher mit drin und hat die Artikelpflicht
    // ausgehebelt - siehe bewerteFreitext().
    akzeptiert: [wortMitArtikel(wort)],
    artikelPflicht: true,
    platzhalter: 'zum Beispiel: das Buch',
    hilfen: [
      'Schau dir den eingerahmten Gegenstand genau an.',
      `Das Wort beginnt mit „${wort.nomen.slice(0, 2)}…“`,
    ],
    loesungserklaerung: `Die Lösung ist „${wortMitArtikel(wort)}“. ${wort.erklaerung}`,
  }
}

const SCHREIBEN_MAX_VERSUCHE = 3

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

export function Wortbild(props: WortbildProps): ReactElement {
  const { modul, stufe, onWortAngesehen, onArtikelAntwort } = props
  const ueberschriftId = useId()
  const reiterId = useId()
  const fertigRef = useRef<HTMLHeadingElement | null>(null)
  const schreibfeldRef = useRef<HTMLInputElement | null>(null)

  const [modus, setModus] = useState<Modus>('entdecken')
  const [offenesWortId, setOffenesWortId] = useState<string | null>(null)
  const letztesWortRef = useRef<Wort | null>(null)

  const pakete = useMemo(() => wortpaketeVon(modul), [modul])
  const [paketId, setPaketId] = useState(pakete[0]?.id ?? 'alle')
  const aktivesPaket = pakete.find((p) => p.id === paketId) ?? pakete[0]!
  const paketWoerter = useMemo(() => woerterVonPaket(modul, aktivesPaket), [modul, aktivesPaket])

  const [index, setIndex] = useState(0)
  const [geschafft, setGeschafft] = useState<ReadonlySet<string>>(LEERE_MENGE)
  const [falschesObjekt, setFalschesObjekt] = useState<string | null>(null)
  const [rueckmeldung, setRueckmeldung] = useState<Rueckmeldung | null>(null)

  const [eingabe, setEingabe] = useState('')
  const [versuch, setVersuch] = useState(1)
  const [wirdGeprueft, setWirdGeprueft] = useState(false)
  const [aufgeloest, setAufgeloest] = useState(false)

  const ziel = paketWoerter[index] ?? null
  const fertig = ziel === null

  if (offenesWortId) {
    const gefundenesWort = findeWort(modul, offenesWortId)
    if (gefundenesWort) letztesWortRef.current = gefundenesWort
  }

  useEffect(() => {
    if (fertig) fertigRef.current?.focus()
  }, [fertig])

  function laufZuruecksetzen(): void {
    setIndex(0)
    setGeschafft(LEERE_MENGE)
    setFalschesObjekt(null)
    setRueckmeldung(null)
    setEingabe('')
    setVersuch(1)
    setAufgeloest(false)
  }

  function wechsleModus(neu: Modus): void {
    setModus(neu)
    setOffenesWortId(null)
    // Ein Moduswechsel ist ein Wechsel der Aufgabe, nicht nur der Ansicht:
    // "Finde das Lineal" und "Schreibe das Lineal" sind verschiedene Uebungen.
    // Der Lauf faengt daher von vorn an - aber im selben Paket.
    laufZuruecksetzen()
  }

  function wechslePaket(neu: string): void {
    setPaketId(neu)
    setOffenesWortId(null)
    laufZuruecksetzen()
  }

  function oeffneWortkarte(id: string): void {
    setOffenesWortId(id)
    onWortAngesehen?.(id)
  }

  function melde(bewertung: Bewertung, text: string): void {
    setRueckmeldung((vorherige) => ({ id: (vorherige?.id ?? 0) + 1, bewertung, text }))
  }

  function weiterZumNaechsten(id: string): void {
    setGeschafft((vorherige) => {
      const naechste = new Set(vorherige)
      naechste.add(id)
      return naechste
    })
    setIndex((i) => i + 1)
    setEingabe('')
    setVersuch(1)
    setAufgeloest(false)
  }

  // --- Zuordnen -------------------------------------------------------------

  function behandleZuordnenKlick(id: string): void {
    if (!ziel) return
    const geklickt = findeWort(modul, id)
    if (!geklickt) return

    if (id === ziel.id) {
      setFalschesObjekt(null)
      melde('richtig', `Richtig! Das ist ${wortMitArtikel(ziel)}.`)
      weiterZumNaechsten(id)
    } else {
      setFalschesObjekt(id)
      melde('falsch', `Noch nicht ganz. Das ist ${wortMitArtikel(geklickt)}. Suche ${wortMitArtikel(ziel)}.`)
    }
  }

  function handleObjektKlick(id: string): void {
    if (modus === 'entdecken') {
      oeffneWortkarte(id)
    } else if (modus === 'zuordnen') {
      behandleZuordnenKlick(id)
    }
    // Im Schreiben-Modus sind die Objekte nicht klickbar - ein Klick auf den
    // eingerahmten Gegenstand waere sonst ein Weg, die Antwort zu umgehen.
  }

  // --- Schreiben ------------------------------------------------------------

  async function schreibenPruefen(): Promise<void> {
    if (!ziel || wirdGeprueft || aufgeloest) return
    setWirdGeprueft(true)
    const aufgabe = schreibAufgabe(ziel)
    const ergebnis: GraderErgebnis = await bewerte({ wert: eingabe }, aufgabe, {
      versuch,
      maxVersuche: SCHREIBEN_MAX_VERSUCHE,
      stufe,
      modul,
    })
    setWirdGeprueft(false)

    // Genusfehler und richtige Antworten fliessen in die Wortsicherheit ein -
    // dieselbe Spur, die auch die Wortkarte und die Artikel-Aufgabe fuellen.
    if (ergebnis.bewertung === 'richtig') onArtikelAntwort?.(ziel.id, true)
    else if (ergebnis.fehlerart === 'genus') onArtikelAntwort?.(ziel.id, false)

    melde(ergebnis.bewertung, ergebnis.rueckmeldung)

    if (ergebnis.bewertung === 'richtig') {
      weiterZumNaechsten(ziel.id)
      requestAnimationFrame(() => schreibfeldRef.current?.focus())
      return
    }

    if (ergebnis.loesungZeigen) {
      setAufgeloest(true)
      return
    }

    setVersuch((v) => v + 1)
  }

  function schreibenWeiter(): void {
    if (!ziel) return
    // Nach einer aufgedeckten Loesung zaehlt das Wort als bearbeitet, aber
    // nicht als gekonnt - der Fortschrittsbalken zaehlt es trotzdem mit,
    // sonst haengt das Kind an einem Wort fest.
    weiterZumNaechsten(ziel.id)
    requestAnimationFrame(() => schreibfeldRef.current?.focus())
  }

  // --- Ansicht --------------------------------------------------------------

  const zuordnenFrage = ziel && (
    <h3 aria-live="polite" className="wortbild__ueben-frage">
      Finde: <span className={`marke--${ziel.genus}`}>{ziel.genus}</span>{' '}
      <span className="wortbild__ueben-nomen">{ziel.nomen}</span>
    </h3>
  )

  const schreibenFrage = ziel && (
    <div className="stapel wortbild__schreiben-frage">
      <h3 aria-live="polite" className="wortbild__ueben-frage">
        Wie heißt der eingerahmte Gegenstand? Schreibe ihn mit Artikel.
      </h3>
      <div className="wortbild__schreiben-reihe">
        <label className="visuell-versteckt" htmlFor="wortbild-schreibfeld">
          Wort mit Artikel
        </label>
        <input
          id="wortbild-schreibfeld"
          ref={schreibfeldRef}
          className="feld"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="zum Beispiel: das Buch"
          value={eingabe}
          disabled={aufgeloest}
          onChange={(ereignis) => setEingabe(ereignis.target.value)}
          onKeyDown={(ereignis) => {
            if (ereignis.key === 'Enter') {
              ereignis.preventDefault()
              void schreibenPruefen()
            }
          }}
        />
        {aufgeloest ? (
          <button type="button" className="knopf knopf--haupt" onClick={schreibenWeiter}>
            Weiter
          </button>
        ) : (
          <button
            type="button"
            className="knopf knopf--haupt"
            onClick={() => void schreibenPruefen()}
            disabled={wirdGeprueft}
          >
            {wirdGeprueft ? 'Wird geprüft …' : 'Prüfen'}
          </button>
        )}
      </div>
      {aufgeloest && (
        <p className="wortbild__schreiben-loesung">
          Die Lösung ist <strong>{wortMitArtikel(ziel)}</strong>.
        </p>
      )}
    </div>
  )

  return (
    <section className="wortbild stapel" aria-labelledby={ueberschriftId}>
      <h2 id={ueberschriftId}>Wortschatz im Bild</h2>

      <Legende modul={modul} />

      <div className="reiter" role="tablist" aria-label="Ansicht wählen">
        {MODI.map((eintrag) => (
          <button
            key={eintrag.modus}
            type="button"
            role="tab"
            id={`${reiterId}-tab-${eintrag.modus}`}
            aria-selected={modus === eintrag.modus}
            aria-controls={`${reiterId}-panel-${eintrag.modus}`}
            className="reiter__knopf"
            onClick={() => wechsleModus(eintrag.modus)}
          >
            {eintrag.label}
          </button>
        ))}
      </div>

      <div
        id={`${reiterId}-panel-entdecken`}
        role="tabpanel"
        aria-labelledby={`${reiterId}-tab-entdecken`}
        hidden={modus !== 'entdecken'}
      >
        {modus === 'entdecken' && (
          <div className="stapel">
            <p className="wortbild__anleitung">
              Klicke auf ein Wort oder auf einen Gegenstand im Bild. Große Wörter sind neu, kleine
              Wörter kennst du schon.
            </p>
            <Buehne modul={modul} modus="entdecken" aktiv={offenesWortId} gefunden={LEERE_MENGE} onObjektKlick={handleObjektKlick}>
              <BeschriftungsEbene modul={modul} offenesWortId={offenesWortId} onLabelKlick={oeffneWortkarte} />
            </Buehne>
            <Heftauftraege auftraege={modul.heftauftraege ?? []} />
          </div>
        )}
      </div>

      <div
        id={`${reiterId}-panel-zuordnen`}
        role="tabpanel"
        aria-labelledby={`${reiterId}-tab-zuordnen`}
        hidden={modus !== 'zuordnen'}
      >
        {modus === 'zuordnen' && (
          <div className="stapel">
            <Paketwahl pakete={pakete} aktivId={paketId} onWaehlen={wechslePaket} />
            <UebenKopf
              paketTitel={aktivesPaket.titel}
              gefundenAnzahl={geschafft.size}
              gesamtAnzahl={paketWoerter.length}
              rueckmeldung={rueckmeldung}
              fertigRef={fertigRef}
              onNeuStarten={laufZuruecksetzen}
              frage={zuordnenFrage}
              fertig={fertig}
            />
            <Buehne modul={modul} modus="zuordnen" aktiv={falschesObjekt} gefunden={geschafft} onObjektKlick={handleObjektKlick} />
          </div>
        )}
      </div>

      <div
        id={`${reiterId}-panel-schreiben`}
        role="tabpanel"
        aria-labelledby={`${reiterId}-tab-schreiben`}
        hidden={modus !== 'schreiben'}
      >
        {modus === 'schreiben' && (
          <div className="stapel">
            <Paketwahl pakete={pakete} aktivId={paketId} onWaehlen={wechslePaket} />
            <UebenKopf
              paketTitel={aktivesPaket.titel}
              gefundenAnzahl={geschafft.size}
              gesamtAnzahl={paketWoerter.length}
              rueckmeldung={rueckmeldung}
              fertigRef={fertigRef}
              onNeuStarten={laufZuruecksetzen}
              frage={schreibenFrage}
              fertig={fertig}
            />
            {/* Der Rahmen um den gesuchten Gegenstand ist die Aufgabenstellung:
                `aktiv` ist genau die Klasse, die ihn hervorhebt. */}
            <Buehne
              modul={modul}
              modus="schreiben"
              aktiv={ziel?.id ?? null}
              gefunden={geschafft}
              onObjektKlick={handleObjektKlick}
              klickbar={false}
            />
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
