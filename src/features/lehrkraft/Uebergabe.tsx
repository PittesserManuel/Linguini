/**
 * Der Uebergabezettel - das fehlende Stueck zwischen Kind und Lehrkraft.
 *
 * Das Modell ist abgesprochen: Die App bewertet keine frei geschriebenen
 * Texte, die Lehrkraft korrigiert sie im Heft. Nur erfuhr die Lehrkraft
 * bisher nie, WAS zu korrigieren ist. Die Liste "wartet auf Ihre Korrektur"
 * steht im Browser des Kindes, ohne Namen, und das Speichern ist per
 * Voreinstellung aus. Real heisst das: vierundzwanzig Kinder, vierundzwanzig
 * Geraete, und die Lehrkraft sieht nichts davon.
 *
 * Dieser Zettel schliesst die Luecke auf dem einzigen Weg, der ohne Konto
 * und ohne Server funktioniert: Papier. Das Kind druckt ihn am Ende der
 * Sitzung, traegt seinen Namen HANDSCHRIFTLICH ein und klebt ihn ins Heft.
 * Die Lehrkraft korrigiert daneben.
 *
 * Der Name wird bewusst nicht abgefragt, sondern nur eine Linie gedruckt:
 * Sobald ein Namensfeld existierte, laege ein Personenbezug im Browser -
 * und das Datenschutzversprechen der Demo waere dahin. Ein Stift kann das
 * besser.
 */

import type { ReactElement } from 'react'
import type { Modul, Jahrgangsstufe, Niveaustufe } from '@/content/types'
import { findeWort, wortMitArtikel } from '@/content/types'
import type { Auswertung } from '@/state/types'
import { alleAufgaben } from './auswertung'

const STUFE_KLARTEXT: Record<Niveaustufe, string> = {
  einfach: 'Leicht',
  standard: 'Mittel',
  anspruchsvoll: 'Knifflig',
}

export interface UebergabeProps {
  modul: Modul
  auswertung: Auswertung
  stufe: Niveaustufe
  jahrgang: Jahrgangsstufe | null
}

/** Eine handschriftlich auszufuellende Zeile - Beschriftung plus Linie. */
function Schreiblinie({ beschriftung }: { beschriftung: string }): ReactElement {
  return (
    <p className="uebergabe__linie">
      <span className="uebergabe__linie-label">{beschriftung}</span>
      <span className="uebergabe__linie-strich" aria-hidden="true" />
    </p>
  )
}

export function Uebergabe(props: UebergabeProps): ReactElement {
  const { modul, auswertung, stufe, jahrgang } = props

  const aufgaben = alleAufgaben(modul)
  const heftauftraege = auswertung.offeneHeftauftraege.map((id) => {
    const aufgabe = aufgaben.find((a) => a.id === id)
    return {
      id,
      frage: aufgabe?.frage ?? id,
      heft: aufgabe?.typ === 'heft' ? aufgabe.heft : undefined,
    }
  })

  const unsichereWoerter = auswertung.genusUnsicher
    .map((id) => findeWort(modul, id))
    .filter((wort): wort is NonNullable<typeof wort> => wort !== undefined)

  const jahrgangstext = jahrgang
    ? (modul.jahrgangstexte?.find((t) => t.jahrgang === jahrgang)?.bezeichnung ?? null)
    : null

  const nichtsZuTun = heftauftraege.length === 0 && unsichereWoerter.length === 0

  return (
    <section className="uebergabe karte stapel" aria-labelledby="uebergabe-titel">
      <header className="uebergabe__kopf">
        <h3 id="uebergabe-titel">Übergabe ans Heft</h3>
        <p className="uebergabe__untertitel">
          Zum Ausdrucken, Ausfüllen und Einkleben. Die App hat die geschriebenen Texte nie gesehen –
          korrigiert wird im Heft.
        </p>
      </header>

      <div className="uebergabe__zeilen">
        <Schreiblinie beschriftung="Name" />
        <Schreiblinie beschriftung="Datum" />
      </div>

      {/*
        Bewusst OHNE "x von y Aufgaben bearbeitet".

        Der Zettel beantwortet eine einzige Frage: Was ist zu korrigieren?
        Eine Mengenangabe daneben laedt zum Vergleichen ein - unter Kindern
        und im Elterngespraech - und misst dabei das Falscheste, was man an
        einer Sprachstunde messen kann. Auf einem Blatt, das dem Kind
        gehoert, hat sie nichts verloren.
      */}
      <p className="uebergabe__modul">
        <strong>{modul.titel}</strong>
        {jahrgangstext && <> · {jahrgangstext}</>} · Stufe {STUFE_KLARTEXT[stufe]}
      </p>

      {nichtsZuTun ? (
        <p className="uebergabe__leer">
          Hier steht noch nichts. Der Zettel füllt sich, sobald ein Schreibauftrag als erledigt
          gemeldet ist oder bei einem Wort der Artikel unsicher war.
        </p>
      ) : (
        <>
          {heftauftraege.length > 0 && (
            <div className="uebergabe__block">
              <h4>Das habe ich ins Heft geschrieben</h4>
              <ul className="uebergabe__kaestchen-liste">
                {heftauftraege.map((auftrag) => (
                  <li key={auftrag.id}>
                    <span className="uebergabe__kaestchen" aria-hidden="true" />
                    <span>
                      {auftrag.heft && (
                        <span className="uebergabe__heftmarke">
                          {auftrag.heft === 'vokabelheft' ? 'Vokabelheft' : 'Linguini-Heft'}
                        </span>
                      )}{' '}
                      {auftrag.frage}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unsichereWoerter.length > 0 && (
            <div className="uebergabe__block">
              <h4>Diese Artikel waren noch unsicher</h4>
              <ul className="uebergabe__wortzeile">
                {unsichereWoerter.map((wort) => (
                  <li key={wort.id} className={`marke--${wort.genus} uebergabe__wort`}>
                    {wortMitArtikel(wort)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Der Platz fuer die Korrektur gehoert auf denselben Zettel. Sonst
          steht die Rueckmeldung irgendwo anders als die Aufgabe. */}
      <div className="uebergabe__korrektur">
        <p className="uebergabe__korrektur-titel">Rückmeldung der Lehrkraft</p>
        <span className="uebergabe__korrektur-feld" aria-hidden="true" />
      </div>
    </section>
  )
}
