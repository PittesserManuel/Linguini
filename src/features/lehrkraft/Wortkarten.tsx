/**
 * Der Wortkarten-Bogen - alle Woerter des Moduls als ausdruckbare Karten.
 *
 * Zeigt bewusst den GESAMTEN Wortschatz (Lernwoerter UND Stuetzwoerter), nicht
 * nur die sieben abgefragten Lernwoerter: Fuer das Partnerspiel "Ich sehe was,
 * was du nicht siehst" (siehe modul.unterrichtshinweise) braucht es mehr als
 * sieben Karten, sonst ist die Runde nach einem Zug vorbei.
 */

import type { ReactElement } from 'react'
import type { Modul } from '@/content/types'

export function Wortkarten(props: { modul: Modul }): ReactElement {
  const { modul } = props

  return (
    <section className="wortkarten-bogen" aria-labelledby="wortkarten-bogen-titel">
      <h3 id="wortkarten-bogen-titel">Wortkarten zum Ausdrucken</h3>
      <p className="lehrkraft__einordnung">
        Alle {modul.wortschatz.length} Wörter aus diesem Modul als Karten zum Ausschneiden – zum Beispiel für
        das Partnerspiel „Ich sehe was, was du nicht siehst“ (siehe Reiter „Lernziele &amp; Lehrplan“,
        Hinweise für den Unterricht).
      </p>
      <ul className="wortkarten-bogen__raster">
        {modul.wortschatz.map((wort) => (
          <li key={wort.id} className="wortkarten-bogen__karte">
            <span className={`marke--${wort.genus} wortkarten-bogen__marke`}>{wort.genus}</span>
            <p className="wortkarten-bogen__nomen">{wort.nomen}</p>
            {wort.plural && <p className="wortkarten-bogen__plural">Mehrzahl: {wort.plural}</p>}
            <p className="wortkarten-bogen__beispiel">„{wort.beispiel}“</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
