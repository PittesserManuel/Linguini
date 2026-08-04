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
  modul: Modul
  onModulStarten: () => void
}

export function Start(props: StartProps): ReactElement {
  const { modul, onModulStarten } = props

  return (
    <div className="start stapel">
      <header className="start__kopf stapel">
        <h1>Linguini</h1>
        <p className="start__unterzeile">Deutsch lernen mit Bildern und Geschichten</p>
        <ul className="reihe start__chips" aria-label="Eckdaten des Moduls">
          <li>
            <span className="chip">Niveau {modul.niveau}</span>
          </li>
          <li>
            <span className="chip">{modul.jahrgang}</span>
          </li>
          <li>
            <span className="chip">Dauer {modul.dauerMinuten} Minuten</span>
          </li>
        </ul>
      </header>

      <div className="start__karten">
        <article className="karte stapel">
          <h2>So lernt das Kind</h2>
          <p>
            Das Kind entdeckt sieben neue Wörter direkt im Bild – jedes mit Artikel und Farbe. Danach liest es eine
            kurze Geschichte und löst dazu Aufgaben, die mit der gewählten Stufe mitwachsen. Es gibt keine Punkte
            oder Sternchen, nur ehrliches Feedback zur Aufgabe.
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

      <div className="start__einstieg">
        <button type="button" className="knopf knopf--haupt" onClick={onModulStarten}>
          Modul starten
        </button>
        <p className="start__einstieg-hinweis">
          Modul: {modul.titel} – {modul.untertitel}
        </p>
      </div>
    </div>
  )
}
