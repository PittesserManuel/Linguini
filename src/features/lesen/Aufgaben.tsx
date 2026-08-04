/**
 * Der Aufgabenlauf - eine Aufgabe nach der anderen, mit Versuchslogik,
 * gestuften Hilfen und einer ruhigen Abschlussansicht.
 *
 * Die eigentliche Bewertung passiert ausschliesslich ueber `bewerte()` aus
 * `@/grading` (der oeffentlichen Schnittstelle der Korrektur-Engine) - diese
 * Datei trifft selbst keine inhaltliche Entscheidung darueber, was richtig
 * oder falsch ist, sondern orchestriert nur Versuch, Hilfe und Uebergabe.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { Aufgabe, Modul, Niveaustufe, Verstehensebene } from '@/content/types'
import { aufgabeSichtbar } from '@/content/types'
import { bewerte } from '@/grading'
import type { Antwort, GraderErgebnis, GraderKontext } from '@/grading/types'
import { anfangsAntwort, Eingabe } from './aufgabentypen'

// ---------------------------------------------------------------------------
// Oeffentliche Schnittstelle
// ---------------------------------------------------------------------------

export interface AufgabenProps {
  modul: Modul
  stufe: Niveaustufe
  onErgebnis: (aufgabeId: string, ergebnis: GraderErgebnis, versuch: number, hilfeGenutzt: boolean) => void
  /** Absatz-ID hervorheben (Musterloesung), oder null zum Entfernen der Markierung. */
  onBelegZeigen: (absatzId: string | null) => void
}

interface VerlaufEintrag {
  aufgabe: Aufgabe
  ergebnis: GraderErgebnis
}

export function Aufgaben(props: AufgabenProps): ReactElement {
  const { modul, stufe, onErgebnis, onBelegZeigen } = props
  const sichtbar = useMemo(
    () => modul.aufgaben.filter((aufgabe) => aufgabeSichtbar(aufgabe, stufe)),
    [modul, stufe],
  )
  const [index, setIndex] = useState(0)
  const [verlauf, setVerlauf] = useState<VerlaufEintrag[]>([])

  if (sichtbar.length === 0) {
    return <p className="karte karte--ruhig">Für diese Niveaustufe sind keine Aufgaben hinterlegt.</p>
  }

  if (index >= sichtbar.length) {
    return <Abschluss sichtbar={sichtbar} verlauf={verlauf} />
  }

  const aktuelleAufgabe = sichtbar[index]!

  function weiterZurNaechsten(eintrag: VerlaufEintrag): void {
    setVerlauf((stand) => [...stand, eintrag])
    onBelegZeigen(null)
    setIndex((i) => i + 1)
  }

  return (
    <AufgabeLauf
      key={aktuelleAufgabe.id}
      aufgabe={aktuelleAufgabe}
      modul={modul}
      stufe={stufe}
      nummer={index + 1}
      gesamt={sichtbar.length}
      onErgebnis={onErgebnis}
      onBelegZeigen={onBelegZeigen}
      onWeiter={weiterZurNaechsten}
    />
  )
}

// ---------------------------------------------------------------------------
// Eine einzelne Aufgabe: Eingabe, Pruefen, Hilfe, Rueckmeldung
//
// Bekommt ueber `key={aufgabe.id}` (siehe oben) fuer jede neue Aufgabe eine
// frische Instanz - der gesamte Versuchs-/Hilfe-Zustand faengt dadurch bei
// jeder Aufgabe automatisch bei null an, ohne manuelles Zuruecksetzen.
// ---------------------------------------------------------------------------

interface AufgabeLaufProps {
  aufgabe: Aufgabe
  modul: Modul
  stufe: Niveaustufe
  nummer: number
  gesamt: number
  onErgebnis: AufgabenProps['onErgebnis']
  onBelegZeigen: AufgabenProps['onBelegZeigen']
  onWeiter: (eintrag: VerlaufEintrag) => void
}

const MAX_VERSUCHE = 3

function AufgabeLauf(props: AufgabeLaufProps): ReactElement {
  const { aufgabe, modul, stufe, nummer, gesamt, onErgebnis, onBelegZeigen, onWeiter } = props

  const [antwort, setAntwort] = useState<Antwort>(() => anfangsAntwort(aufgabe))
  const [versuch, setVersuch] = useState(1)
  const [ergebnis, setErgebnis] = useState<GraderErgebnis | null>(null)
  const [wirdGeprueft, setWirdGeprueft] = useState(false)
  const [offeneHilfen, setOffeneHilfen] = useState<string[]>([])
  const [hilfeJemalsGenutzt, setHilfeJemalsGenutzt] = useState(false)

  const ueberschriftRef = useRef<HTMLHeadingElement>(null)
  const meldeRef = useRef<HTMLDivElement>(null)

  // Fokus auf die neue Aufgabe lenken, sobald sie erscheint - wichtig fuer
  // Tastatur- und Screenreader-Nutzung beim Wechsel zwischen Aufgaben.
  useEffect(() => {
    ueberschriftRef.current?.focus()
  }, [])

  // Musterloesung mit Textbeleg: Absatz im Lesetext hervorheben, sobald die
  // Loesung aufgedeckt wird (siehe abschliessen() in graders.ts).
  useEffect(() => {
    if (ergebnis?.loesungZeigen && aufgabe.belegAbsatz) {
      onBelegZeigen(aufgabe.belegAbsatz)
    }
  }, [ergebnis, aufgabe.belegAbsatz, onBelegZeigen])

  const abgeschlossen = ergebnis !== null && !ergebnis.nochmal
  const gesperrt = abgeschlossen
  const zeigeHilfeKnopf = !abgeschlossen && offeneHilfen.length < aufgabe.hilfen.length

  async function pruefen(): Promise<void> {
    if (wirdGeprueft || ergebnis !== null) return
    setWirdGeprueft(true)
    const kontext: GraderKontext = { versuch, maxVersuche: MAX_VERSUCHE, stufe }
    const resultat = await bewerte(antwort, aufgabe, kontext)
    setWirdGeprueft(false)
    setErgebnis(resultat)

    const hinweis = resultat.hinweis
    if (hinweis && !offeneHilfen.includes(hinweis)) {
      setOffeneHilfen((stand) => [...stand, hinweis])
    }

    onErgebnis(aufgabe.id, resultat, versuch, hilfeJemalsGenutzt)
    setVersuch((v) => v + 1)
    requestAnimationFrame(() => meldeRef.current?.focus())
  }

  function nochmalVersuchen(): void {
    setErgebnis(null)
  }

  function hilfeZeigen(): void {
    const naechsteHilfe = aufgabe.hilfen[offeneHilfen.length]
    if (naechsteHilfe === undefined) return
    setOffeneHilfen((stand) => [...stand, naechsteHilfe])
    setHilfeJemalsGenutzt(true)
  }

  function weiter(): void {
    if (!ergebnis) return
    onBelegZeigen(null)
    onWeiter({ aufgabe, ergebnis })
  }

  return (
    <div className="karte lesen__aufgabe stapel">
      <p className="chip lesen__fortschritt-text">
        Aufgabe {nummer} von {gesamt}
      </p>

      <h3 ref={ueberschriftRef} tabIndex={-1}>
        {aufgabe.frage}
      </h3>

      <Eingabe aufgabe={aufgabe} modul={modul} antwort={antwort} onChange={setAntwort} gesperrt={gesperrt} onEnter={pruefen} />

      {offeneHilfen.length > 0 && (
        <div className="lesen__hilfen">
          <p className="lesen__hilfen-titel">Hilfen</p>
          <ul>
            {offeneHilfen.map((hilfe, i) => (
              <li key={i}>{hilfe}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="reihe reihe--gestapelt">
        {ergebnis === null && (
          <button type="button" className="knopf knopf--haupt" onClick={pruefen} disabled={wirdGeprueft}>
            {wirdGeprueft ? 'Wird geprüft …' : 'Prüfen'}
          </button>
        )}
        {zeigeHilfeKnopf && (
          <button type="button" className="knopf knopf--leise" onClick={hilfeZeigen}>
            Hilfe
          </button>
        )}
        {ergebnis?.nochmal && (
          <button type="button" className="knopf knopf--zweit" onClick={nochmalVersuchen}>
            Nochmal versuchen
          </button>
        )}
        {abgeschlossen && (
          <button type="button" className="knopf knopf--haupt" onClick={weiter}>
            Weiter
          </button>
        )}
      </div>

      <div aria-live="polite">
        {ergebnis && (
          <div ref={meldeRef} tabIndex={-1} className={`melde melde--${ergebnis.bewertung}`}>
            <p>{ergebnis.rueckmeldung}</p>
            {ergebnis.loesungZeigen && <Musterloesung aufgabe={aufgabe} ergebnis={ergebnis} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Musterloesung
//
// Nutzt bewusst die Teilergebnisse der Korrektur-Engine (ergebnis.teile)
// statt eine eigene zweite Loesungslogik zu schreiben - die Grader sind die
// einzige Quelle dafuer, was richtig ist.
// ---------------------------------------------------------------------------

function einzelLoesungText(aufgabe: Aufgabe): string {
  if (aufgabe.typ === 'auswahl') {
    return aufgabe.optionen.find((option) => option.id === aufgabe.richtig)?.text ?? ''
  }
  if (aufgabe.typ === 'freitext') {
    return aufgabe.akzeptiert[0] ?? ''
  }
  return ''
}

function Musterloesung(props: { aufgabe: Aufgabe; ergebnis: GraderErgebnis }): ReactElement {
  const { aufgabe, ergebnis } = props

  return (
    <div className="stapel lesen__loesung">
      <p className="lesen__loesung-titel">Musterlösung</p>
      {ergebnis.teile ? (
        <ul className="lesen__loesung-liste">
          {ergebnis.teile.map((teil) => (
            <li key={teil.id}>
              <span className="lesen__loesung-erwartet">{teil.erwartet}</span>
              <span>{teil.rueckmeldung}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="lesen__loesung-erwartet">{einzelLoesungText(aufgabe)}</p>
      )}
      <p>{aufgabe.loesungserklaerung}</p>
      {aufgabe.belegAbsatz && <p className="lesen__beleg-hinweis">Die Antwort steht im Text weiter oben markiert.</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Abschlussansicht
//
// Bewusst ohne Punktzahl, Sterne oder Streaks (Overjustification-Effekt,
// siehe docs/DIDAKTIK.md Abschnitt 7) - stattdessen Ich-kann-Formulierungen
// je Verstehensebene (Barrett).
// ---------------------------------------------------------------------------

const ICH_KANN_TEXTE: Record<Verstehensebene, string> = {
  literal: 'Ich kann Informationen finden, die direkt im Text stehen.',
  inferentiell: 'Ich kann Dinge verstehen, die nicht wörtlich im Text stehen, sondern zwischen den Zeilen.',
  reorganisierend: 'Ich kann die Ereignisse einer Geschichte in die richtige Reihenfolge bringen.',
  wertend: 'Ich kann zu einem Text eine eigene Meinung äußern und sie begründen.',
  sprachbetrachtend: 'Ich kann Wörtern den passenden Artikel zuordnen.',
}

function Abschluss(props: { sichtbar: Aufgabe[]; verlauf: VerlaufEintrag[] }): ReactElement {
  const { sichtbar, verlauf } = props
  const ueberschriftRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    ueberschriftRef.current?.focus()
  }, [])

  const ebenenReihenfolge: Verstehensebene[] = []
  for (const aufgabe of sichtbar) {
    if (!ebenenReihenfolge.includes(aufgabe.ebene)) ebenenReihenfolge.push(aufgabe.ebene)
  }

  const gemeistert: Verstehensebene[] = []
  const imUeben: Verstehensebene[] = []

  for (const ebene of ebenenReihenfolge) {
    const eintraege = verlauf.filter((eintrag) => eintrag.aufgabe.ebene === ebene)
    const sicher =
      eintraege.length > 0 && eintraege.every((eintrag) => eintrag.ergebnis.bewertung === 'richtig' && !eintrag.ergebnis.loesungZeigen)
    if (sicher) gemeistert.push(ebene)
    else imUeben.push(ebene)
  }

  return (
    <div className="karte lesen__abschluss stapel">
      <h3 ref={ueberschriftRef} tabIndex={-1}>
        Das hast du bei diesem Text geschafft
      </h3>

      {gemeistert.length > 0 && (
        <div className="stapel">
          <p className="lesen__abschluss-zwischentitel">Das kannst du schon gut:</p>
          <ul>
            {gemeistert.map((ebene) => (
              <li key={ebene}>{ICH_KANN_TEXTE[ebene]}</li>
            ))}
          </ul>
        </div>
      )}

      {imUeben.length > 0 && (
        <div className="stapel">
          <p className="lesen__abschluss-zwischentitel">Das übst du am besten als Nächstes:</p>
          <ul>
            {imUeben.map((ebene) => (
              <li key={ebene}>{ICH_KANN_TEXTE[ebene]}</li>
            ))}
          </ul>
        </div>
      )}

      {imUeben.length === 0 && <p>Du hast alle Aufgaben zu diesem Text sicher gelöst.</p>}
    </div>
  )
}
