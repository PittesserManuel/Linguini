/**
 * Startseite.
 *
 * Muss in zehn Sekunden erklaeren, was das ist und fuer wen - deshalb bewusst
 * knapp: ein ruhiger Titelbereich, drei kurze Karten, ein grosser Knopf.
 * Kein Hero-Bild, kein Verlauf, kein Marketing-Ton.
 */

import type { ReactElement } from 'react'
import type { Modul } from '@/content/types'

export interface StartProps {
  module: readonly Modul[]
  onModulStarten: (modulId: string) => void
}

export function Start(props: StartProps): ReactElement {
  const { module, onModulStarten } = props

  return (
    <div className="start stapel">
      <header className="start__kopf stapel">
        <h1>Linguini</h1>
        <p className="start__unterzeile">Deutsch lernen mit Bildern und Geschichten</p>
        <ul className="reihe start__chips" aria-label="Eckdaten der Module">
          <li>
            <span className="chip">Niveau A2</span>
          </li>
          <li>
            <span className="chip">Mittelschule, 10 bis 14 Jahre</span>
          </li>
          <li>
            <span className="chip">Deutsch als Zweitsprache</span>
          </li>
        </ul>
      </header>

      <div className="start__karten">
        <article className="karte stapel">
          <h2>So lernt das Kind</h2>
          <p>
            Das Kind entdeckt neue Wörter direkt im Bild – jedes mit Artikel und Farbe. Geübt wird portionsweise,
            höchstens fünf Wörter auf einmal. Danach liest es eine Geschichte in der Fassung seines Jahrgangs und
            löst dazu Aufgaben. Es gibt keine Punkte und keine Sternchen, nur ehrliches Feedback zur Aufgabe.
          </p>
        </article>

        <article className="karte stapel">
          <h2>Was Lehrkräfte bekommen</h2>
          <p>
            Jede Aufgabe ist einer Kompetenz aus den KMK-Bildungsstandards, dem LehrplanPLUS oder dem GER
            zugeordnet. Der Lehrkraft-Bereich zeigt nicht „wie viel Prozent richtig“, sondern woran es genau hängt –
            etwa bei welchen Wörtern der Artikel noch unsicher ist.
          </p>
        </article>

        <article className="karte stapel">
          <h2>Wie korrigiert wird</h2>
          <p>
            Antworten werden heute vollständig regelbasiert bewertet: Normalisierung plus
            Damerau-Levenshtein-Distanz mit einer Schwelle, die von der Wortlänge abhängt. Jede Bewertung lässt
            sich nachvollziehen. Die Schnittstelle ist so geschnitten, dass eine KI-Bewertung später ergänzt werden
            kann, ohne die Oberfläche zu verändern.
          </p>
        </article>
      </div>

      <section className="start__module stapel" aria-labelledby="module-titel">
        <h2 id="module-titel">Module</h2>
        <ul className="start__modulliste">
          {module.map((modul) => (
            <li key={modul.id}>
              <article className="karte stapel start__modulkarte">
                <h3>{modul.titel}</h3>
                <p className="start__modul-untertitel">{modul.untertitel}</p>
                <ul className="reihe start__chips" aria-label={`Eckdaten: ${modul.titel}`}>
                  <li>
                    <span className="chip">{modul.niveau}</span>
                  </li>
                  <li>
                    <span className="chip">{modul.dauerMinuten} Minuten</span>
                  </li>
                  <li>
                    <span className="chip">
                      {modul.wortschatz.filter((w) => w.neu).length} neue Wörter
                    </span>
                  </li>
                </ul>
                <p className="start__modul-bild">
                  {modul.szene.art === 'svg'
                    ? 'Gezeichnete Vektorszene – ein angeklicktes Wort hebt den Gegenstand selbst hervor.'
                    : 'Illustriertes Bild – Wörter werden über Trefferflächen im Bild angetippt.'}
                </p>
                <div>
                  <button
                    type="button"
                    className="knopf knopf--haupt"
                    onClick={() => onModulStarten(modul.id)}
                  >
                    {modul.titel} starten
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
