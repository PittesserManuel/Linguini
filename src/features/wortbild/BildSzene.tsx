/**
 * BildSzene - Szene auf Basis eines Rasterbildes.
 *
 * Gegenstueck zu Szene.tsx (handgezeichnetes SVG). Der Unterschied ist nicht
 * nur technisch, sondern didaktisch relevant und wird deshalb hier festgehalten:
 *
 * Bei der SVG-Szene ist jeder Gegenstand ein eigenes Element. Ein Klick auf ein
 * Wort kann den Gegenstand SELBST hervorheben und alles andere dimmen.
 *
 * Bei einem Rasterbild geht das nicht - Pixel sind nicht ansprechbar. Statt
 * dessen liegen unsichtbare Trefferflaechen an den im Modul hinterlegten
 * Koordinaten. Hervorhebung bedeutet hier: ein Ring an der Stelle, nicht der
 * Gegenstand selbst. Das ist schwaecher, aber ehrlich - und es macht das
 * Bild-Wort-Prinzip fuer beliebige Bilder verfuegbar, ohne dass jemand jedes
 * Modul von Hand zeichnen muesste.
 */

import type { CSSProperties, ReactElement } from 'react'
import { wortMitArtikel } from '@/content/types'
import type { Szene, Wort } from '@/content/types'

type BildQuelle = Extract<Szene, { art: 'bild' }>

export interface BildSzeneProps {
  szene: BildQuelle
  woerter: readonly Wort[]
  /** id des gerade hervorgehobenen Objekts, oder null */
  aktiv: string | null
  /** ids bereits gefundener/gelernter Objekte */
  gefunden: ReadonlySet<string>
  onObjektKlick?: (id: string) => void
  /** true = Trefferflaechen sind bedienbar */
  interaktiv: boolean
}

export function BildSzene({
  szene,
  woerter,
  aktiv,
  gefunden,
  onObjektKlick,
  interaktiv,
}: BildSzeneProps): ReactElement {
  return (
    <div className="bildszene">
      <picture>
        {szene.quelleKlein ? (
          <source media="(max-width: 700px)" srcSet={`${import.meta.env.BASE_URL}${szene.quelleKlein}`} />
        ) : null}
        <img
          className="bildszene__bild"
          src={`${import.meta.env.BASE_URL}${szene.quelle}`}
          width={szene.breite}
          height={szene.hoehe}
          alt={szene.alt}
          decoding="async"
          /* Das Bild ist der Einstieg der Seite - kein Lazy-Loading, sonst
             erscheint es sichtbar verspaetet. */
          fetchPriority="high"
        />
      </picture>

      {woerter.map((wort) => {
        const zustand = [
          'bildszene__treffer',
          aktiv === wort.id ? 'ist-aktiv' : '',
          gefunden.has(wort.id) ? 'ist-gefunden' : '',
        ]
          .filter(Boolean)
          .join(' ')

        const position = {
          '--x': wort.punkt.x,
          '--y': wort.punkt.y,
        } as CSSProperties

        if (!interaktiv) {
          // Nicht bedienbar: rein dekorativer Ring, fuer Hilfsmittel unsichtbar.
          return <span key={wort.id} className={zustand} style={position} aria-hidden="true" />
        }

        return (
          <button
            key={wort.id}
            type="button"
            className={zustand}
            style={position}
            onClick={() => onObjektKlick?.(wort.id)}
          >
            <span className="visuell-versteckt">{wortMitArtikel(wort)}</span>
          </button>
        )
      })}
    </div>
  )
}
