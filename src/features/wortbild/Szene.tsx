/**
 * Die illustrierte Klassenzimmer-Szene - handgezeichnetes Inline-SVG.
 *
 * Zeigt ein Klassenzimmer kurz vor Unterrichtsbeginn. Fuer jedes Wort aus
 * modulKlassenzimmer.wortschatz gibt es genau eine Gruppe <g id="obj-<id>">,
 * deren visuelles Zentrum exakt auf wort.punkt liegt (umgerechnet von
 * Prozent- in SVG-Koordinaten). Andere Komponenten positionieren ihre
 * Beschriftungen anhand derselben Prozentkoordinaten - das macht diese
 * Zuordnung zu einem harten Vertrag.
 *
 * AUFBAU: Die Zeichnungen liegen in DARSTELLUNGEN, getrennt von ihrer
 * Position in der Szene. Dadurch laesst sich derselbe Gegenstand auch
 * ausserhalb des Raums zeigen - als Ausschnitt neben einer Aufgabe oder als
 * Menge ("drei Scheren") in der Einzahl-/Mehrzahl-Uebung. Ohne diese Trennung
 * muesste jede Zeichnung ein zweites Mal existieren und koennte auseinander
 * laufen.
 *
 * Stil: flaechige Vektor-Illustration, keine Fotos, keine Emojis, keine
 * Menschen. Farben ausschliesslich ueber CSS-Variablen - die vorhandenen
 * Tokens aus tokens.css sowie eine kleine, am Wurzel-<svg> gesetzte Palette
 * fuer Farbtoene, die tokens.css nicht kennt (Holz, Metall, Himmel, ...).
 *
 * Zustaende (aktiv/gefunden) wirken NUR ueber CSS-Klassen; die Optik dazu
 * lebt in wortbild.css. Diese Datei setzt bewusst kein <style> und keine
 * Animationslogik.
 */

import { useId } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode } from 'react'
import { modulKlassenzimmer } from '@/content/modul-klassenzimmer'
import { wortMitArtikel } from '@/content/types'
import type { Wort } from '@/content/types'

export interface SzeneProps {
  /** id des gerade hervorgehobenen Objekts, oder null */
  aktiv: string | null
  /** ids bereits gefundener/gelernter Objekte */
  gefunden: ReadonlySet<string>
  /** Klick auf ein Objekt in der Szene */
  onObjektKlick?: (id: string) => void
  /** true = Uebungsmodus: Objekte sind klickbar */
  interaktiv: boolean
  /**
   * Bildausschnitt. 'raum' zeigt das ganze Klassenzimmer, 'tisch' faehrt auf
   * die Tischplatte mit den Schulsachen heran - das ist das zweite Bild fuer
   * die Schreibauftraege ("Das Geodreieck ist durchsichtig.").
   */
  ausschnitt?: 'raum' | 'tisch'
}

// ---------------------------------------------------------------------------
// Koordinaten-Vertrag: Prozent (aus der Inhaltsdatei) -> SVG-Pixel
// ---------------------------------------------------------------------------

const BREITE = 1600
const HOEHE = 900

/** Ausschnitte als viewBox. 'tisch' zeigt nur die Arbeitsflaeche. */
const AUSSCHNITTE: Record<'raum' | 'tisch', string> = {
  raum: `0 0 ${BREITE} ${HOEHE}`,
  tisch: '150 400 1280 340',
}

/** Wirft bewusst, statt still zu scheitern - fehlende Woerter sind ein Bug. */
function findeWortOderFehler(id: string): Wort {
  const wort = modulKlassenzimmer.wortschatz.find((w) => w.id === id)
  if (!wort) {
    throw new Error(`KlassenzimmerSzene: Wortschatz-Eintrag "${id}" fehlt im Modul "klassenzimmer".`)
  }
  return wort
}

/** cx = punkt.x / 100 * 1600, cy = punkt.y / 100 * 900 - siehe types.ts. */
function mittelpunkt(id: string): { cx: number; cy: number } {
  const { punkt } = findeWortOderFehler(id)
  return { cx: (punkt.x / 100) * BREITE, cy: (punkt.y / 100) * HOEHE }
}

/** Klassen: Basis + Zustand. Keine anderen Klassen als hier erlaubt. */
function objektKlasse(id: string, aktiv: string | null, gefunden: ReadonlySet<string>): string {
  const klassen = ['szene__objekt']
  if (aktiv === id) klassen.push('ist-aktiv')
  if (gefunden.has(id)) klassen.push('ist-gefunden')
  return klassen.join(' ')
}

// ---------------------------------------------------------------------------
// Die Zeichnungen
//
// Jede Zeichnung ist auf (0,0) zentriert und kennt ihre Position nicht. Das
// `praefix` dient nur dazu, SVG-interne ids (clipPath) eindeutig zu halten,
// wenn dieselbe Zeichnung mehrfach im Dokument steht - etwa dreimal
// nebeneinander in der Mehrzahl-Uebung.
// ---------------------------------------------------------------------------

interface Darstellung {
  /** Grosse, unsichtbare Trefferflaeche - Mindestgroesse fuer Tippziele. */
  ziel: { breite: number; hoehe: number }
  /** Leichte Drehung in Grad, fuer den handgemachten "hingelegt"-Look. */
  drehung?: number
  /**
   * Massstab des Objekts. Die Schulsachen sind in Wirklichkeit klein; im Bild
   * duerfen sie das nicht sein, sonst kann ein Kind sie nicht auseinanderhalten.
   * Erkennbarkeit schlaegt hier Massstabstreue.
   */
  skalierung?: number
  zeichnung: (praefix: string) => ReactNode
}

const DARSTELLUNGEN: Record<string, Darstellung> = {
  // --- Raum -----------------------------------------------------------------

  fenster: {
    ziel: { breite: 220, hoehe: 260 },
    zeichnung: () => (
      <>
        <rect x="-100" y="-120" width="200" height="240" rx="10" fill="var(--szene-holz-dunkel)" />
        <rect x="-88" y="-108" width="176" height="216" fill="var(--szene-himmel)" />
        <ellipse cx="-44" cy="-58" rx="26" ry="14" fill="var(--szene-papier)" opacity="0.9" />
        <ellipse cx="-26" cy="-63" rx="17" ry="11" fill="var(--szene-papier)" opacity="0.9" />
        <circle cx="41" cy="26" r="30" fill="var(--szene-blatt)" />
        <circle cx="20" cy="40" r="18" fill="var(--szene-blatt)" />
        <circle cx="48" cy="32" r="16" fill="var(--szene-holz-dunkel)" opacity="0.35" />
        <rect x="34" y="42" width="10" height="48" rx="3" fill="var(--szene-holz-dunkel)" />
        <rect x="-6" y="-108" width="12" height="216" fill="var(--szene-holz-dunkel)" />
        <rect x="-88" y="-6" width="176" height="12" fill="var(--szene-holz-dunkel)" />
        <rect x="-104" y="122" width="208" height="14" rx="4" fill="var(--szene-holz)" />
      </>
    ),
  },

  /* Steht auf der Fensterbank, links vom Baum - dort ist Platz, und dort
     stehen Klassenzimmerpflanzen tatsaechlich. */
  pflanze: {
    ziel: { breite: 130, hoehe: 170 },
    zeichnung: () => (
      <>
        <path
          d="M -4 8 C -34 -6 -46 -34 -34 -52 C -14 -50 -2 -30 -2 -6 Z"
          fill="var(--szene-blatt)"
          stroke="var(--szene-blatt-dunkel)"
          strokeWidth="1.5"
        />
        <path
          d="M 4 8 C 34 -6 46 -34 34 -52 C 14 -50 2 -30 2 -6 Z"
          fill="var(--szene-blatt)"
          stroke="var(--szene-blatt-dunkel)"
          strokeWidth="1.5"
        />
        <path
          d="M 0 6 C -16 -22 -14 -56 0 -72 C 14 -56 16 -22 0 6 Z"
          fill="var(--szene-blatt-hell)"
          stroke="var(--szene-blatt-dunkel)"
          strokeWidth="1.5"
        />
        <line x1="0" y1="4" x2="0" y2="-60" stroke="var(--szene-blatt-dunkel)" strokeWidth="2" opacity="0.7" />
        <rect x="-34" y="6" width="68" height="16" rx="4" fill="var(--szene-topf-hell)" />
        <path d="M -30 22 L 30 22 L 23 62 L -23 62 Z" fill="var(--szene-topf)" />
        <path d="M -23 48 L 23 48 L 21 62 L -21 62 Z" fill="var(--szene-topf-dunkel)" opacity="0.5" />
      </>
    ),
  },

  /* Die Tuer wird VOR dem Tischkorpus gezeichnet (siehe unten): Sie reicht bis
     zum Boden, und der Tisch steht davor. Zeichnet man sie wie die uebrigen
     Objekte zuletzt, schwebt sie sichtbar vor der Tischplatte. */
  tuer: {
    ziel: { breite: 230, hoehe: 460 },
    zeichnung: () => (
      <>
        <rect x="-104" y="-126" width="208" height="436" rx="6" fill="var(--szene-holz-dunkel)" />
        <rect x="-90" y="-112" width="180" height="422" rx="3" fill="var(--szene-holz)" />
        <rect x="-66" y="-92" width="132" height="96" rx="4" fill="var(--szene-himmel)" opacity="0.75" />
        <rect
          x="-66"
          y="-92"
          width="132"
          height="96"
          rx="4"
          fill="none"
          stroke="var(--szene-holz-dunkel)"
          strokeWidth="4"
        />
        <line x1="0" y1="-92" x2="0" y2="4" stroke="var(--szene-holz-dunkel)" strokeWidth="4" />
        <rect
          x="-64"
          y="30"
          width="128"
          height="150"
          rx="4"
          fill="none"
          stroke="var(--szene-holz-dunkel)"
          strokeWidth="3"
          opacity="0.6"
        />
        <rect x="46" y="24" width="34" height="12" rx="6" fill="var(--szene-metall-dunkel)" />
        <circle cx="52" cy="30" r="9" fill="var(--szene-metall)" />
      </>
    ),
  },

  tafel: {
    ziel: { breite: 600, hoehe: 340 },
    zeichnung: () => (
      <>
        <rect x="-282" y="-158" width="564" height="306" rx="12" fill="var(--szene-holz-dunkel)" />
        <rect x="-262" y="-140" width="524" height="250" rx="6" fill="var(--m-petrol-tief)" />
        <rect x="-262" y="76" width="524" height="34" rx="4" fill="var(--f-dunkel)" opacity="0.25" />
        <text
          x="0"
          y="52"
          textAnchor="middle"
          fontFamily="var(--schrift-anzeige)"
          fontStyle="italic"
          fontSize="58"
          fill="var(--t-invers)"
        >
          Willkommen
        </text>
        <path
          d="M -150 86 Q -40 98 60 82 T 150 78"
          fill="none"
          stroke="var(--t-invers)"
          strokeWidth="3"
          opacity="0.8"
          strokeLinecap="round"
        />
        <rect x="-262" y="112" width="524" height="20" rx="4" fill="var(--szene-holz)" />
        <rect x="-42" y="104" width="46" height="12" rx="4" fill="var(--szene-papier)" />
        <rect x="26" y="104" width="40" height="12" rx="4" fill="var(--szene-papier)" opacity="0.85" />
      </>
    ),
  },

  uhr: {
    ziel: { breite: 140, hoehe: 140 },
    zeichnung: () => (
      <>
        <circle r="56" fill="var(--f-karte)" stroke="var(--szene-holz-dunkel)" strokeWidth="6" />
        <path
          d="M -46 20 A 46 46 0 0 0 46 20"
          fill="none"
          stroke="var(--szene-metall-dunkel)"
          strokeWidth="4"
          opacity="0.35"
        />
        {[0, 90, 180, 270].map((winkel) => (
          <line
            key={winkel}
            x1="0"
            y1="-56"
            x2="0"
            y2="-46"
            stroke="var(--t-stark)"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${winkel})`}
          />
        ))}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-26"
          stroke="var(--t-stark)"
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(245)"
        />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-40"
          stroke="var(--t-stark)"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform="rotate(60)"
        />
        <circle r="6" fill="var(--t-stark)" />
      </>
    ),
  },

  stuhl: {
    ziel: { breite: 160, hoehe: 300 },
    zeichnung: () => (
      <>
        <rect x="-55" y="-135" width="110" height="85" rx="16" fill="var(--szene-holz)" />
        <rect x="-20" y="-118" width="8" height="60" rx="3" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="12" y="-118" width="8" height="60" rx="3" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="-65" y="-50" width="130" height="24" rx="8" fill="var(--szene-holz-hell)" />
        <rect x="-50" y="-26" width="16" height="161" fill="var(--szene-holz-dunkel)" />
        <rect x="34" y="-26" width="16" height="161" fill="var(--szene-holz-dunkel)" />
        <rect x="-50" y="68" width="100" height="10" fill="var(--szene-holz-dunkel)" opacity="0.9" />
      </>
    ),
  },

  schultasche: {
    ziel: { breite: 190, hoehe: 190 },
    skalierung: 1.15,
    zeichnung: () => (
      <>
        <path d="M -28 -60 Q 0 -84 28 -60" fill="none" stroke="var(--szene-holz-dunkel)" strokeWidth="9" strokeLinecap="round" />
        <rect x="-80" y="-58" width="160" height="115" rx="24" fill="var(--m-petrol)" />
        <rect x="-80" y="37" width="160" height="20" rx="10" fill="var(--m-petrol-tief)" opacity="0.55" />
        <rect x="-58" y="-8" width="116" height="55" rx="14" fill="var(--m-petrol-tief)" />
        <rect x="-46" y="-50" width="10" height="95" fill="var(--m-ocker)" />
        <rect x="36" y="-50" width="10" height="95" fill="var(--m-ocker)" />
        <rect x="-49" y="6" width="16" height="10" rx="2" fill="var(--szene-metall)" />
        <rect x="33" y="6" width="16" height="10" rx="2" fill="var(--szene-metall)" />
      </>
    ),
  },

  /* Der Tisch als Ganzes ist Kulisse; diese Gruppe zeigt die Schublade in der
     Front - das konkrete, klickbare Detail genau an diesem Punkt. */
  tisch: {
    ziel: { breite: 190, hoehe: 130 },
    zeichnung: () => (
      <>
        <rect
          x="-78"
          y="-46"
          width="156"
          height="92"
          rx="6"
          fill="var(--szene-holz-hell)"
          stroke="var(--szene-holz-dunkel)"
          strokeWidth="3"
        />
        <rect x="-78" y="30" width="156" height="16" rx="4" fill="var(--t-stark)" opacity="0.12" />
        <rect x="-22" y="6" width="44" height="14" rx="7" fill="var(--szene-metall-dunkel)" />
      </>
    ),
  },

  papierkorb: {
    ziel: { breite: 140, hoehe: 200 },
    skalierung: 1.25,
    zeichnung: () => (
      <>
        <path d="M -55 -55 L 55 -55 L 40 65 L -40 65 Z" fill="var(--m-petrol)" />
        <path d="M -40 30 L 40 30 L 32 65 L -32 65 Z" fill="var(--m-petrol-tief)" opacity="0.55" />
        <line x1="-30" y1="-50" x2="-22" y2="60" stroke="var(--m-petrol-tief)" strokeWidth="3" opacity="0.5" />
        <line x1="0" y1="-50" x2="0" y2="62" stroke="var(--m-petrol-tief)" strokeWidth="3" opacity="0.5" />
        <line x1="30" y1="-50" x2="22" y2="60" stroke="var(--m-petrol-tief)" strokeWidth="3" opacity="0.5" />
        <rect x="-60" y="-64" width="120" height="16" rx="6" fill="var(--m-petrol-tief)" />
        <path
          d="M -20 -64 C -26 -84 -10 -92 4 -82 C 18 -92 30 -78 22 -64 C 10 -70 -8 -70 -20 -64 Z"
          fill="var(--szene-papier)"
          stroke="var(--f-rand-stark)"
          strokeWidth="1.5"
        />
        <line x1="-10" y1="-76" x2="4" y2="-68" stroke="var(--f-rand-stark)" strokeWidth="1" />
        <line x1="10" y1="-80" x2="0" y2="-70" stroke="var(--f-rand-stark)" strokeWidth="1" />
      </>
    ),
  },

  // --- Schulsachen auf dem Tisch --------------------------------------------

  buch: {
    ziel: { breite: 150, hoehe: 110 },
    drehung: -3,
    skalierung: 1.25,
    zeichnung: () => (
      <>
        <rect x="-58" y="-34" width="124" height="76" rx="6" fill="var(--szene-papier)" />
        <rect x="-65" y="-42" width="120" height="76" rx="6" fill="var(--m-ocker)" />
        <rect x="-65" y="-42" width="14" height="76" rx="6" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="-38" y="-14" width="70" height="6" rx="3" fill="var(--m-ocker-hell)" />
        <rect x="-38" y="2" width="50" height="6" rx="3" fill="var(--m-ocker-hell)" />
      </>
    ),
  },

  heft: {
    ziel: { breite: 130, hoehe: 110 },
    drehung: 4,
    skalierung: 1.45,
    zeichnung: () => (
      <>
        <rect x="-55" y="-40" width="110" height="80" rx="4" fill="var(--szene-papier)" stroke="var(--f-rand-stark)" strokeWidth="2" />
        <rect x="-55" y="28" width="110" height="12" fill="var(--f-rand-stark)" opacity="0.4" />
        <rect x="-55" y="-40" width="16" height="80" fill="var(--m-petrol)" />
        {[-16, 0, 16].map((y) => (
          <line key={y} x1="-28" y1={y} x2="44" y2={y} stroke="var(--f-rand)" strokeWidth="2" />
        ))}
        <rect x="-6" y="-30" width="50" height="18" rx="3" fill="none" stroke="var(--f-rand-stark)" strokeWidth="1.5" />
      </>
    ),
  },

  lineal: {
    ziel: { breite: 200, hoehe: 70 },
    drehung: -6,
    skalierung: 1.1,
    zeichnung: () => (
      <>
        <rect x="-85" y="-16" width="170" height="32" rx="4" fill="var(--szene-gelb)" stroke="var(--szene-holz-dunkel)" strokeWidth="2" />
        <rect x="-85" y="8" width="170" height="8" rx="2" fill="var(--szene-holz-dunkel)" opacity="0.35" />
        {Array.from({ length: 13 }, (_, i) => -72 + i * 12).map((x, i) => (
          <line
            key={x}
            x1={x}
            y1="-16"
            x2={x}
            y2={i % 4 === 0 ? '-1' : '-8'}
            stroke="var(--szene-holz-dunkel)"
            strokeWidth={i % 4 === 0 ? '2' : '1.5'}
          />
        ))}
      </>
    ),
  },

  radiergummi: {
    ziel: { breite: 110, hoehe: 70 },
    drehung: -8,
    skalierung: 1.75,
    zeichnung: (praefix) => (
      <>
        <clipPath id={`${praefix}-radiergummi`}>
          <rect x="-45" y="-24" width="90" height="48" rx="8" />
        </clipPath>
        <g clipPath={`url(#${praefix}-radiergummi)`}>
          <rect x="-45" y="-24" width="45" height="48" fill="var(--szene-radierer-a)" />
          <rect x="0" y="-24" width="45" height="48" fill="var(--szene-radierer-b)" />
          <rect x="-45" y="12" width="90" height="12" fill="var(--szene-metall-dunkel)" opacity="0.25" />
        </g>
        <rect x="-45" y="-24" width="90" height="48" rx="8" fill="none" stroke="var(--szene-metall-dunkel)" strokeWidth="2" />
        <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--szene-metall-dunkel)" strokeWidth="1.5" opacity="0.6" />
      </>
    ),
  },

  spitzer: {
    ziel: { breite: 100, hoehe: 80 },
    drehung: 5,
    skalierung: 1.9,
    zeichnung: () => (
      <>
        <rect x="-35" y="-26" width="70" height="52" rx="10" fill="var(--szene-lila)" />
        <rect x="-35" y="14" width="70" height="12" rx="6" fill="var(--t-stark)" opacity="0.16" />
        <circle cx="0" cy="-2" r="15" fill="var(--szene-metall-dunkel)" />
        <circle cx="0" cy="-2" r="9" fill="var(--f-dunkel)" />
        <path d="M 9 -11 L 20 -15 L 22 -6 L 11 -3 Z" fill="var(--szene-metall)" stroke="var(--szene-metall-dunkel)" strokeWidth="1" />
      </>
    ),
  },

  schere: {
    ziel: { breite: 130, hoehe: 190 },
    drehung: -8,
    skalierung: 1.25,
    zeichnung: () => (
      <>
        <line x1="-4" y1="4" x2="-16" y2="34" stroke="var(--szene-metall-dunkel)" strokeWidth="8" strokeLinecap="round" />
        <line x1="4" y1="4" x2="16" y2="34" stroke="var(--szene-metall-dunkel)" strokeWidth="8" strokeLinecap="round" />
        <circle cx="-20" cy="50" r="22" fill="none" stroke="var(--szene-lila)" strokeWidth="14" />
        <circle cx="18" cy="48" r="22" fill="none" stroke="var(--m-ocker)" strokeWidth="14" />
        <path
          d="M 0 0 C -10 -18 -22 -40 -38 -66 C -42 -74 -38 -80 -30 -76 C -18 -54 -8 -30 -2 -6 Z"
          fill="var(--szene-metall)"
          stroke="var(--szene-metall-dunkel)"
          strokeWidth="1.5"
        />
        <path
          d="M 0 0 C 10 -18 22 -40 38 -66 C 42 -74 38 -80 30 -76 C 18 -54 8 -30 2 -6 Z"
          fill="var(--szene-metall)"
          stroke="var(--szene-metall-dunkel)"
          strokeWidth="1.5"
        />
        <circle r="7" fill="var(--szene-metall-dunkel)" />
      </>
    ),
  },

  kleber: {
    ziel: { breite: 90, hoehe: 150 },
    drehung: -5,
    skalierung: 1.4,
    zeichnung: () => (
      <>
        <rect x="-20" y="-8" width="40" height="70" rx="8" fill="var(--szene-papier)" stroke="var(--f-rand-stark)" strokeWidth="2" />
        <rect x="-20" y="48" width="40" height="14" rx="6" fill="var(--t-stark)" opacity="0.12" />
        <rect x="-20" y="18" width="40" height="16" fill="var(--m-petrol)" />
        <rect x="-23" y="-62" width="46" height="56" rx="10" fill="var(--szene-lila)" />
        <line x1="-22" y1="-6" x2="22" y2="-6" stroke="var(--f-rand-stark)" strokeWidth="2" />
      </>
    ),
  },

  /* Der Stift ist bewusst ein KUGELSCHREIBER, nicht noch ein Bleistift: Im
     Lesetext steht "Mein Stift schreibt blau." Und der Bleistift daneben
     braucht ein eigenes, klar unterscheidbares Bild - sonst zeigen zwei
     Beschriftungen auf dasselbe Ding. */
  stift: {
    ziel: { breite: 200, hoehe: 60 },
    drehung: 28,
    skalierung: 1.4,
    zeichnung: () => (
      <>
        <rect x="-84" y="-10" width="58" height="20" rx="9" fill="var(--a-der)" />
        <rect x="-70" y="-16" width="8" height="26" rx="3" fill="var(--a-der)" />
        <rect x="-28" y="-10" width="86" height="20" fill="var(--szene-papier)" stroke="var(--f-rand-stark)" strokeWidth="1.5" />
        <rect x="-28" y="2" width="86" height="8" fill="var(--f-rand-stark)" opacity="0.3" />
        <path d="M 58 -10 L 78 0 L 58 10 Z" fill="var(--a-der)" />
        <path d="M 74 -3 L 84 0 L 74 3 Z" fill="var(--szene-metall-dunkel)" />
      </>
    ),
  },

  /* Der klassische gelbe Bleistift: Sechskantkoerper, Metallzwinge, rosa
     Radierer, angespitzte Holzspitze mit grauer Mine. */
  bleistift: {
    ziel: { breite: 200, hoehe: 60 },
    drehung: -14,
    skalierung: 1.4,
    zeichnung: () => (
      <>
        <rect x="-84" y="-11" width="18" height="22" rx="5" fill="var(--szene-radierer-a)" />
        <rect x="-67" y="-11" width="13" height="22" fill="var(--szene-metall)" />
        <line x1="-63" y1="-11" x2="-63" y2="11" stroke="var(--szene-metall-dunkel)" strokeWidth="1.5" />
        <line x1="-58" y1="-11" x2="-58" y2="11" stroke="var(--szene-metall-dunkel)" strokeWidth="1.5" />
        <rect x="-54" y="-11" width="108" height="22" fill="var(--szene-gelb)" />
        <rect x="-54" y="-11" width="108" height="6" fill="var(--szene-gelb-hell)" />
        <rect x="-54" y="5" width="108" height="6" fill="var(--szene-holz-dunkel)" opacity="0.3" />
        <path d="M 54 -11 L 80 0 L 54 11 Z" fill="var(--szene-holz-hell)" stroke="var(--szene-holz-dunkel)" strokeWidth="1" />
        <path d="M 73 -3 L 82 0 L 73 3 Z" fill="var(--f-dunkel)" />
      </>
    ),
  },

  /* Der Buntstift: durchgefaerbter Koerper ohne Radierer - die Farbe des
     Koerpers ist dieselbe wie die der Mine. Genau daran erkennt man ihn. */
  buntstift: {
    ziel: { breite: 190, hoehe: 60 },
    drehung: 12,
    skalierung: 1.4,
    zeichnung: () => (
      <>
        <rect x="-78" y="-11" width="132" height="22" rx="3" fill="var(--a-die)" />
        <rect x="-78" y="-11" width="132" height="6" fill="var(--szene-rot-hell)" />
        <rect x="-78" y="5" width="132" height="6" fill="var(--f-dunkel)" opacity="0.2" />
        <path d="M 54 -11 L 80 0 L 54 11 Z" fill="var(--szene-holz-hell)" stroke="var(--szene-holz-dunkel)" strokeWidth="1" />
        <path d="M 72 -4 L 82 0 L 72 4 Z" fill="var(--a-die)" />
      </>
    ),
  },

  /* Das Geodreieck ist DURCHSICHTIG gezeichnet - halbtransparent, mit
     sichtbarem Untergrund. Das ist kein Effekt, sondern Inhalt: Genau diesen
     Satz ("Das Geodreieck ist durchsichtig.") sollen die Kinder darueber
     schreiben, also muss man es am Bild ablesen koennen. */
  geodreieck: {
    ziel: { breite: 210, hoehe: 120 },
    drehung: -4,
    skalierung: 0.95,
    zeichnung: () => (
      <>
        <path d="M -92 46 L 92 46 L 0 -46 Z" fill="var(--szene-glas)" opacity="0.55" />
        <path d="M -92 46 L 92 46 L 0 -46 Z" fill="none" stroke="var(--szene-glas-rand)" strokeWidth="2.5" />
        <line x1="0" y1="46" x2="0" y2="-36" stroke="var(--szene-glas-rand)" strokeWidth="1.5" opacity="0.8" />
        {[-70, -50, -30, -10, 10, 30, 50, 70].map((x) => (
          <line key={x} x1={x} y1="46" x2={x} y2="36" stroke="var(--szene-glas-rand)" strokeWidth="1.5" />
        ))}
        {[-60, -30, 30, 60].map((winkel) => (
          <line
            key={winkel}
            x1="0"
            y1="46"
            x2="0"
            y2="10"
            stroke="var(--szene-glas-rand)"
            strokeWidth="1.2"
            opacity="0.75"
            transform={`rotate(${winkel} 0 46)`}
          />
        ))}
        <path d="M -14 46 L -14 32 L 0 32" fill="none" stroke="var(--szene-glas-rand)" strokeWidth="1.5" />
      </>
    ),
  },

  /* Der Zirkel: zwei Schenkel an einem Gelenk, links die Nadel, rechts der
     Bleistift, oben der Griff. */
  zirkel: {
    ziel: { breite: 140, hoehe: 200 },
    drehung: 6,
    skalierung: 1,
    zeichnung: () => (
      <>
        <rect x="-5" y="-88" width="10" height="26" rx="5" fill="var(--szene-metall-dunkel)" />
        <circle cx="0" cy="-92" r="9" fill="var(--szene-metall)" stroke="var(--szene-metall-dunkel)" strokeWidth="2" />
        <path d="M -3 -62 L -34 62 L -22 66 L 3 -60 Z" fill="var(--szene-metall)" stroke="var(--szene-metall-dunkel)" strokeWidth="2" />
        <path d="M 3 -62 L 34 62 L 22 66 L -3 -60 Z" fill="var(--szene-metall)" stroke="var(--szene-metall-dunkel)" strokeWidth="2" />
        <circle cx="0" cy="-60" r="8" fill="var(--szene-metall-dunkel)" />
        <path d="M -34 62 L -22 66 L -30 88 Z" fill="var(--szene-metall-dunkel)" />
        <path d="M 22 66 L 34 62 L 32 82 L 24 80 Z" fill="var(--szene-gelb)" />
        <path d="M 24 80 L 32 82 L 29 92 Z" fill="var(--f-dunkel)" />
      </>
    ),
  },
}

// ---------------------------------------------------------------------------
// Farbpalette der Szene
//
// Kleine, harmonische Zusatzpalette fuer Toene, die tokens.css nicht kennt
// (Holz, Metall, Himmel, Laub, Radiergummi, Kunststoff, Glas). Alle anderen
// Farben im Bild sind bestehende Tokens aus tokens.css.
// ---------------------------------------------------------------------------

const SZENEN_PALETTE = {
  '--szene-holz': '#c98f4e',
  '--szene-holz-dunkel': '#a06b34',
  '--szene-holz-hell': '#e0ab6e',
  '--szene-boden': '#d9b98a',
  '--szene-metall': '#b6b0a6',
  '--szene-metall-dunkel': '#5f5850',
  '--szene-himmel': '#bfe0e8',
  '--szene-blatt': '#5a9a6b',
  '--szene-blatt-hell': '#79b487',
  '--szene-blatt-dunkel': '#3d7150',
  '--szene-topf': '#c2694a',
  '--szene-topf-hell': '#d98263',
  '--szene-topf-dunkel': '#9b4e33',
  '--szene-radierer-a': '#e8917f',
  '--szene-radierer-b': '#8fb8d9',
  '--szene-lila': '#8b6fa8',
  '--szene-gelb': '#e6b93d',
  '--szene-gelb-hell': '#f3d477',
  '--szene-rot-hell': '#dc7a72',
  /* Glas fuer das Geodreieck - bewusst sehr blass und halbtransparent. */
  '--szene-glas': '#cfe6df',
  '--szene-glas-rand': '#4f7f74',
  /* Fixes Weiss fuer Papier/Kreide/Wolke - bleibt hell, auch im Dunkelmodus
     (anders als die Tokens f-karte & Co., die dort bewusst dunkel werden). */
  '--szene-papier': '#f5f1e4',
} as CSSProperties

// ---------------------------------------------------------------------------
// Wiederverwendbarer Objekt-Wrapper
// ---------------------------------------------------------------------------

interface ObjektGruppeProps {
  id: string
  interaktiv: boolean
  aktiv: string | null
  gefunden: ReadonlySet<string>
  onObjektKlick?: (id: string) => void
  praefix: string
}

function darstellungOderFehler(id: string): Darstellung {
  const darstellung = DARSTELLUNGEN[id]
  if (!darstellung) {
    throw new Error(`KlassenzimmerSzene: Fuer "${id}" ist keine Zeichnung hinterlegt.`)
  }
  return darstellung
}

function ObjektGruppe({ id, interaktiv, aktiv, gefunden, onObjektKlick, praefix }: ObjektGruppeProps): ReactElement {
  const { cx, cy } = mittelpunkt(id)
  const { ziel, drehung, skalierung, zeichnung } = darstellungOderFehler(id)
  const transform = [
    `translate(${cx} ${cy})`,
    drehung ? `rotate(${drehung})` : '',
    skalierung && skalierung !== 1 ? `scale(${skalierung})` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const className = objektKlasse(id, aktiv, gefunden)
  const inhalt = zeichnung(`${praefix}-${id}`)

  // Die Zielflaeche wird IMMER gezeichnet, auch ohne Interaktion: Sie ist im
  // Schreiben-Modus der sichtbare Rahmen um den gesuchten Gegenstand (siehe
  // wortbild.css) und damit dort die eigentliche Aufgabenstellung. Ohne
  // Interaktion nimmt sie keine Klicks an - dafuer sorgt pointer-events: none.
  const zielflaeche = (
    <rect
      className="szene__ziel"
      x={-ziel.breite / 2}
      y={-ziel.hoehe / 2}
      width={ziel.breite}
      height={ziel.hoehe}
      fill="transparent"
    />
  )

  if (!interaktiv) {
    return (
      <g id={`obj-${id}`} data-wort={id} className={className} transform={transform} aria-hidden="true">
        {zielflaeche}
        {inhalt}
      </g>
    )
  }

  const nomenMitArtikel = wortMitArtikel(findeWortOderFehler(id))

  const behandleTaste = (ereignis: ReactKeyboardEvent<SVGGElement>): void => {
    if (ereignis.key === 'Enter' || ereignis.key === ' ') {
      ereignis.preventDefault()
      onObjektKlick?.(id)
    }
  }

  return (
    <g
      id={`obj-${id}`}
      data-wort={id}
      className={className}
      transform={transform}
      role="button"
      tabIndex={0}
      aria-label={nomenMitArtikel}
      onClick={() => onObjektKlick?.(id)}
      onKeyDown={behandleTaste}
    >
      {zielflaeche}
      {inhalt}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Die Szene
// ---------------------------------------------------------------------------

/** Reihenfolge = Zeichenreihenfolge. Die Tuer steht hinter dem Tisch. */
const OBJEKTE_HINTER_TISCH = ['tuer']
const OBJEKTE_VOR_TISCH = [
  'fenster',
  'pflanze',
  'tafel',
  'uhr',
  'stuhl',
  'schultasche',
  'tisch',
  'papierkorb',
  'buch',
  'lineal',
  'geodreieck',
  'radiergummi',
  'schere',
  'zirkel',
  'heft',
  'bleistift',
  'stift',
  'buntstift',
  'spitzer',
  'kleber',
]

export function KlassenzimmerSzene(props: SzeneProps): ReactElement {
  const { aktiv, gefunden, onObjektKlick, interaktiv, ausschnitt = 'raum' } = props
  const praefix = useId()
  const gradWand = `${praefix}-wand`
  const gradBoden = `${praefix}-boden`
  const gradPlatte = `${praefix}-platte`
  const titelId = `${praefix}-titel`
  const beschreibungId = `${praefix}-beschreibung`

  const gemeinsam = { interaktiv, aktiv, gefunden, onObjektKlick, praefix }

  return (
    <svg
      viewBox={AUSSCHNITTE[ausschnitt]}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={SZENEN_PALETTE}
      role={interaktiv ? undefined : 'img'}
      aria-labelledby={interaktiv ? undefined : `${titelId} ${beschreibungId}`}
    >
      <title id={titelId}>
        {ausschnitt === 'tisch' ? 'Schulsachen auf einem Tisch' : 'Illustration eines Klassenzimmers'}
      </title>
      <desc id={beschreibungId}>
        {ausschnitt === 'tisch'
          ? 'Nahaufnahme einer Tischplatte. In zwei Reihen liegen Buch, Lineal, ein durchsichtiges Geodreieck, Radiergummi, Schere und Zirkel sowie Heft, Bleistift, Stift, roter Buntstift, Spitzer und Kleber.'
          : 'Ein aufgeräumtes Klassenzimmer kurz vor dem Unterricht. Links ein Fenster mit Blick auf einen Baum, auf der Fensterbank eine Grünpflanze, daneben eine Pinnwand mit angehefteten Zetteln. In der Mitte eine grüne Tafel mit der Kreideschrift Willkommen, rechts eine Holztür und darüber eine Wanduhr. Vorne ein großer Holztisch, darauf in zwei Reihen Buch, Lineal, Geodreieck, Radiergummi, Schere und Zirkel sowie Heft, Bleistift, Stift, Buntstift, Spitzer und Kleber. Links steht ein Stuhl, davor eine Schultasche, rechts neben dem Tisch ein Papierkorb mit einem zerknüllten Blatt Papier.'}
      </desc>

      <defs>
        <linearGradient id={gradWand} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--f-papier)" />
          <stop offset="100%" stopColor="var(--f-karte-tief)" />
        </linearGradient>
        <linearGradient id={gradBoden} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--szene-boden)" />
          <stop offset="100%" stopColor="var(--szene-holz-dunkel)" />
        </linearGradient>
        {/* Die Tischplatte wird zum Fenster hin heller - das ist die einzige
            Lichtquelle im Bild und gibt der Flaeche Tiefe. */}
        <linearGradient id={gradPlatte} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="var(--szene-holz-hell)" />
          <stop offset="65%" stopColor="var(--szene-holz-hell)" />
          <stop offset="100%" stopColor="var(--szene-holz)" />
        </linearGradient>
      </defs>

      {/* ----------------------------------------------------------------
          Kulisse hinten: Wand und Boden. Immer aria-hidden - rein dekorativ.
      ----------------------------------------------------------------- */}
      <g aria-hidden="true">
        <rect x="0" y="0" width={BREITE} height="558" fill={`url(#${gradWand})`} />
        {/* Wandleiste auf Brusthoehe - bricht die grosse leere Flaeche. */}
        <line x1="0" y1="356" x2={BREITE} y2="356" stroke="var(--f-rand)" strokeWidth="3" />
        <line x1="0" y1="362" x2={BREITE} y2="362" stroke="var(--f-rand)" strokeWidth="1.5" opacity="0.6" />
        {/* Lichtkeil vom Fenster her - schraeg, sehr blass. */}
        <path d="M 60 300 L 470 300 L 700 558 L 130 558 Z" fill="var(--szene-papier)" opacity="0.22" />
        <rect x="0" y="550" width={BREITE} height="16" fill="var(--szene-holz-dunkel)" />
        <rect x="0" y="558" width={BREITE} height="342" fill={`url(#${gradBoden})`} />
        {[578, 602, 632, 668, 712, 766, 832].map((y) => (
          <line key={y} x1="0" y1={y} x2={BREITE} y2={y} stroke="var(--szene-holz-dunkel)" strokeWidth="2" opacity="0.4" />
        ))}
      </g>

      {/* Die Tuer reicht bis zum Boden und steht hinter dem Tisch. */}
      {OBJEKTE_HINTER_TISCH.map((id) => (
        <ObjektGruppe key={id} id={id} {...gemeinsam} />
      ))}

      {/* ----------------------------------------------------------------
          Kulisse vorne: Pinnwand und Tischkorpus.
      ----------------------------------------------------------------- */}
      <g aria-hidden="true">
        {/* Pinnwand - fuellt die Wandflaeche links neben der Tafel und macht
            den Raum bewohnt. Bewusst ohne lesbaren Text: sie traegt kein
            Lernwort und soll die Beschriftungen nicht konkurrenzieren. */}
        <g transform="translate(355 330)">
          <rect x="-96" y="-70" width="192" height="140" rx="6" fill="var(--szene-holz-dunkel)" />
          <rect x="-86" y="-60" width="172" height="120" rx="3" fill="#c4b49a" />
          <rect x="-66" y="-42" width="60" height="44" rx="2" fill="var(--szene-papier)" transform="rotate(-4)" />
          <rect x="8" y="-46" width="52" height="38" rx="2" fill="var(--m-petrol-hell)" transform="rotate(3)" />
          <rect x="-48" y="12" width="72" height="34" rx="2" fill="var(--m-ocker-hell)" transform="rotate(2)" />
          <circle cx="-36" cy="-44" r="4" fill="var(--m-ocker)" />
          <circle cx="34" cy="-48" r="4" fill="var(--a-die)" />
          <circle cx="-12" cy="10" r="4" fill="var(--a-der)" />
        </g>

        {/* Tischplatte (heller, oben) und Schuerze (Vorderseite, dunkler).
            Schmaler als die Bildbreite: rechts bleibt Boden frei, damit der
            Papierkorb dort STEHEN kann statt in der Luft zu schweben. */}
        <rect x="176" y="430" width="1216" height="264" rx="4" fill={`url(#${gradPlatte})`} />
        <rect x="176" y="430" width="1216" height="6" fill="var(--szene-papier)" opacity="0.5" />
        <rect x="176" y="684" width="1216" height="10" fill="var(--t-stark)" opacity="0.08" />
        <line x1="192" y1="694" x2="1376" y2="694" stroke="var(--szene-holz-dunkel)" strokeWidth="3" />
        <rect x="192" y="694" width="1184" height="168" fill="var(--szene-holz)" />
        <rect x="200" y="862" width="30" height="36" fill="var(--szene-holz-dunkel)" />
        <rect x="1346" y="862" width="30" height="36" fill="var(--szene-holz-dunkel)" />
      </g>

      {/* ----------------------------------------------------------------
          Die Wortschatz-Objekte. Jede Gruppe zentriert exakt auf wort.punkt
          (umgerechnet: cx = x/100*1600, cy = y/100*900).
      ----------------------------------------------------------------- */}
      {OBJEKTE_VOR_TISCH.map((id) => (
        <ObjektGruppe key={id} id={id} {...gemeinsam} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Einzelbild eines Gegenstands - ausserhalb der Szene
//
// Zwei Einsatzorte, ein Bauteil:
// - Bildstuetze neben einer Aufgabe ("Der Radiergummi ist rosa und blau.
//   Stimmt das?") - dann anzahl = 1.
// - Mengenbild in der Einzahl-/Mehrzahl-Uebung und im Hefteintrag - dann
//   anzahl = 2 bis 5, nebeneinander gelegt.
// ---------------------------------------------------------------------------

export interface ObjektBildProps {
  wortId: string
  /** Wie viele Stueck gezeigt werden. Voreinstellung 1. */
  anzahl?: number
  /** Alternativtext. Fehlt er, wird er aus Wort und Anzahl gebildet. */
  alt?: string
}

export function ObjektBild({ wortId, anzahl = 1, alt }: ObjektBildProps): ReactElement {
  const praefix = useId()
  const titelId = `${praefix}-titel`
  const wort = findeWortOderFehler(wortId)
  const { ziel, drehung, skalierung = 1, zeichnung } = darstellungOderFehler(wortId)

  // Die Zeichnung ist auf (0,0) zentriert; ihr Platzbedarf ergibt sich aus
  // Zielflaeche mal Massstab. Etwas Luft drumherum, damit nichts anschneidet.
  const feldBreite = ziel.breite * skalierung + 40
  const feldHoehe = ziel.hoehe * skalierung + 40
  const gesamtBreite = feldBreite * anzahl

  const beschreibung =
    alt ?? (anzahl === 1 ? wortMitArtikel(wort) : `${anzahl} Stück: ${wort.plural ?? wort.nomen}`)

  return (
    <svg
      className="objektbild"
      viewBox={`0 0 ${gesamtBreite} ${feldHoehe}`}
      preserveAspectRatio="xMidYMid meet"
      style={SZENEN_PALETTE}
      role="img"
      aria-labelledby={titelId}
    >
      <title id={titelId}>{beschreibung}</title>
      {Array.from({ length: anzahl }, (_, i) => {
        const transform = [
          `translate(${feldBreite * i + feldBreite / 2} ${feldHoehe / 2})`,
          drehung ? `rotate(${drehung})` : '',
          skalierung !== 1 ? `scale(${skalierung})` : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <g key={i} transform={transform}>
            {zeichnung(`${praefix}-${wortId}-${i}`)}
          </g>
        )
      })}
    </svg>
  )
}
