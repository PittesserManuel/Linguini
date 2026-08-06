/**
 * Die Rueckmeldezeile - eine Stelle fuer alle vier Bewertungen.
 *
 * Warum Inline-SVG und keine Emojis (✅ ❌): Emojis werden auf jedem
 * Betriebssystem anders gezeichnet, sind auf Schulgeraeten teils gar nicht
 * vorhanden und werden von Screenreadern vorgelesen ("weisses schweres
 * Haekchen") - mitten in einem Satz, der ohnehin schon sagt, ob es richtig
 * war. Ein eigenes Icon erbt dagegen die Textfarbe, skaliert mit der
 * Schriftgroesse und bleibt fuer Hilfsmittel unsichtbar.
 *
 * Das Zeichen ist BEGLEITUNG, nicht Ersatz: Der Text bleibt immer stehen.
 * Farbe allein darf nie die einzige Information sein (WCAG 1.4.1) - genau
 * deshalb kommt zur Farbe die Form dazu.
 */

import type { ReactElement, ReactNode, Ref } from 'react'
import type { Bewertung } from '@/grading/types'

// ---------------------------------------------------------------------------
// Die vier Zeichen
// ---------------------------------------------------------------------------

function IconHaken(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M6.8 12.4 L10.4 16 L17.2 8.6"
        fill="none"
        stroke="var(--f-karte)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconKreuz(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M8 8 L16 16 M16 8 L8 16"
        fill="none"
        stroke="var(--f-karte)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** "fast" bekommt bewusst weder Haken noch Kreuz: Es ist keins von beidem. */
function IconFast(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M7.5 12.5 L10.8 15.4 L16.5 9.5"
        fill="none"
        stroke="var(--f-karte)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 2.4"
      />
    </svg>
  )
}

/** "offen" wartet auf eine Lehrperson - ein Heft, kein Urteil. */
function IconHeft(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <rect x="7" y="6.5" width="10" height="11" rx="1.4" fill="var(--f-karte)" />
      <path d="M9.4 9.6 h5.2 M9.4 12 h5.2 M9.4 14.4 h3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

const ZEICHEN: Record<Bewertung, () => ReactElement> = {
  richtig: IconHaken,
  fast: IconFast,
  falsch: IconKreuz,
  offen: IconHeft,
}

/**
 * Textliche Entsprechung des Zeichens fuer Screenreader. Steht VOR der
 * eigentlichen Rueckmeldung, damit die Einordnung zuerst kommt.
 */
const ANSAGE: Record<Bewertung, string> = {
  richtig: 'Richtig.',
  fast: 'Fast richtig.',
  falsch: 'Noch nicht richtig.',
  offen: 'Wartet auf Korrektur.',
}

export function MeldeZeichen({ bewertung }: { bewertung: Bewertung }): ReactElement {
  const Zeichen = ZEICHEN[bewertung]
  return (
    <span className={`melde__zeichen melde__zeichen--${bewertung}`}>
      <Zeichen />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Die Rueckmeldezeile
// ---------------------------------------------------------------------------

export interface MeldeProps {
  bewertung: Bewertung
  /** Der Rueckmeldetext. */
  children: ReactNode
  /** Zusatz unterhalb des Texts, z. B. die Musterloesung. */
  fuss?: ReactNode
  /** Fuer den Fokuswechsel nach dem Pruefen (siehe Aufgaben.tsx). */
  bereichRef?: Ref<HTMLDivElement>
  fokussierbar?: boolean
}

export function Melde({ bewertung, children, fuss, bereichRef, fokussierbar }: MeldeProps): ReactElement {
  return (
    <div
      ref={bereichRef}
      tabIndex={fokussierbar ? -1 : undefined}
      className={`melde melde--${bewertung}`}
    >
      <div className="melde__kopf">
        <MeldeZeichen bewertung={bewertung} />
        <p className="melde__text">
          <span className="visuell-versteckt">{ANSAGE[bewertung]} </span>
          {children}
        </p>
      </div>
      {fuss}
    </div>
  )
}
