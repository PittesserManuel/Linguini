/**
 * Die illustrierte Klassenzimmer-Szene - handgezeichnetes Inline-SVG.
 *
 * Zeigt ein leeres Klassenzimmer kurz vor Unterrichtsbeginn. Fuer jedes der
 * 15 Woerter aus modulKlassenzimmer.wortschatz gibt es genau eine Gruppe
 * <g id="obj-<id>">, deren visuelles Zentrum exakt auf wort.punkt liegt
 * (umgerechnet von Prozent- in SVG-Koordinaten). Andere Komponenten
 * positionieren ihre Beschriftungen anhand derselben Prozentkoordinaten -
 * das macht diese Zuordnung zu einem harten Vertrag.
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
}

// ---------------------------------------------------------------------------
// Koordinaten-Vertrag: Prozent (aus der Inhaltsdatei) -> SVG-Pixel
// ---------------------------------------------------------------------------

const BREITE = 1600
const HOEHE = 900

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
// Wiederverwendbarer Objekt-Wrapper
// ---------------------------------------------------------------------------

interface ObjektGruppeProps {
  id: string
  interaktiv: boolean
  aktiv: string | null
  gefunden: ReadonlySet<string>
  onObjektKlick?: (id: string) => void
  /** Grosse, unsichtbare Trefferflaeche - Mindestgroesse fuer Tippziele. */
  ziel: { breite: number; hoehe: number }
  /** Leichte Drehung in Grad, fuer den handgemachten "hingelegt"-Look. */
  drehung?: number
  children: ReactNode
}

function ObjektGruppe({
  id,
  interaktiv,
  aktiv,
  gefunden,
  onObjektKlick,
  ziel,
  drehung,
  children,
}: ObjektGruppeProps): ReactElement {
  const { cx, cy } = mittelpunkt(id)
  const transform = drehung ? `translate(${cx} ${cy}) rotate(${drehung})` : `translate(${cx} ${cy})`
  const className = objektKlasse(id, aktiv, gefunden)

  if (!interaktiv) {
    return (
      <g id={`obj-${id}`} data-wort={id} className={className} transform={transform} aria-hidden="true">
        {children}
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
      <rect
        className="szene__ziel"
        x={-ziel.breite / 2}
        y={-ziel.hoehe / 2}
        width={ziel.breite}
        height={ziel.hoehe}
        fill="transparent"
      />
      {children}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

export function KlassenzimmerSzene(props: SzeneProps): ReactElement {
  const { aktiv, gefunden, onObjektKlick, interaktiv } = props
  const praefix = useId()
  const gradWand = `${praefix}-wand`
  const gradBoden = `${praefix}-boden`
  const clipRadiergummi = `${praefix}-radiergummi`
  const titelId = `${praefix}-titel`
  const beschreibungId = `${praefix}-beschreibung`

  const gemeinsam = { interaktiv, aktiv, gefunden, onObjektKlick }

  // Kleine, harmonische Zusatzpalette fuer Toene, die tokens.css nicht kennt
  // (Holz, Metall, Himmel, Laub, Radiergummi, Kunststoff). Alle anderen
  // Farben im Bild sind bestehende Tokens aus tokens.css.
  const szenenPalette = {
    '--szene-holz': '#c98f4e',
    '--szene-holz-dunkel': '#a06b34',
    '--szene-holz-hell': '#e0ab6e',
    '--szene-boden': '#d9b98a',
    '--szene-metall': '#8b8378',
    '--szene-metall-dunkel': '#5f5850',
    '--szene-himmel': '#bfe0e8',
    '--szene-blatt': '#5a9a6b',
    '--szene-radierer-a': '#e8917f',
    '--szene-radierer-b': '#8fb8d9',
    '--szene-lila': '#8b6fa8',
    /* Fixes Weiss fuer Papier/Kreide/Wolke - bleibt hell, auch im Dunkelmodus
       (anders als die Tokens f-karte & Co., die dort bewusst dunkel werden). */
    '--szene-papier': '#f5f1e4',
  } as CSSProperties

  return (
    <svg
      viewBox={`0 0 ${BREITE} ${HOEHE}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={szenenPalette}
      role={interaktiv ? undefined : 'img'}
      aria-labelledby={interaktiv ? undefined : `${titelId} ${beschreibungId}`}
    >
      <title id={titelId}>Illustration eines Klassenzimmers</title>
      <desc id={beschreibungId}>
        Ein aufgeräumtes Klassenzimmer kurz vor dem Unterricht. Links ein Fenster mit Blick auf einen
        Baum, mittig eine grüne Tafel mit der Kreideschrift Willkommen, rechts oben eine Wanduhr. Vorne
        ein großer Holztisch mit Buch, Heft, Lineal, Stift, Radiergummi, Spitzer, Schere und Kleber.
        Links steht ein Stuhl mit einer Schultasche davor, rechts ein Papierkorb mit einem zerknüllten
        Blatt Papier.
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
        <clipPath id={clipRadiergummi}>
          <rect x="-45" y="-24" width="90" height="48" rx="8" />
        </clipPath>
      </defs>

      {/* ----------------------------------------------------------------
          Kulisse ohne eigenes Lernwort: Wand, Boden, Tischkorpus.
          Immer aria-hidden - rein dekorativ.
      ----------------------------------------------------------------- */}
      <g aria-hidden="true">
        <rect x="0" y="0" width={BREITE} height="558" fill={`url(#${gradWand})`} />
        <rect x="0" y="550" width={BREITE} height="16" fill="var(--szene-holz-dunkel)" />
        <rect x="0" y="558" width={BREITE} height="342" fill={`url(#${gradBoden})`} />
        {[578, 602, 632, 668, 712, 766, 832].map((y) => (
          <line key={y} x1="0" y1={y} x2={BREITE} y2={y} stroke="var(--szene-holz-dunkel)" strokeWidth="2" opacity="0.4" />
        ))}

        {/* Tischplatte (heller, oben) und Schuerze (Vorderseite, dunkler) */}
        <rect x="176" y="478" width="1360" height="176" rx="4" fill="var(--szene-holz-hell)" />
        <rect x="176" y="644" width="1360" height="10" fill="var(--t-stark)" opacity="0.08" />
        <line x1="192" y1="654" x2="1520" y2="654" stroke="var(--szene-holz-dunkel)" strokeWidth="3" />
        <rect x="192" y="654" width="1328" height="206" fill="var(--szene-holz)" />
        <rect x="200" y="860" width="30" height="38" fill="var(--szene-holz-dunkel)" />
        <rect x="1490" y="860" width="30" height="38" fill="var(--szene-holz-dunkel)" />
      </g>

      {/* ----------------------------------------------------------------
          Die 15 Wortschatz-Objekte. Jede Gruppe zentriert exakt auf
          wort.punkt (umgerechnet: cx = x/100*1600, cy = y/100*900).
      ----------------------------------------------------------------- */}

      {/* wort.punkt (fenster): x=10 y=20 -> cx=160 cy=180 */}
      <ObjektGruppe id="fenster" {...gemeinsam} ziel={{ breite: 220, hoehe: 260 }}>
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
      </ObjektGruppe>

      {/* wort.punkt (tafel): x=46 y=21 -> cx=736 cy=189 */}
      <ObjektGruppe id="tafel" {...gemeinsam} ziel={{ breite: 600, hoehe: 340 }}>
        <rect x="-282" y="-158" width="564" height="306" rx="12" fill="var(--szene-holz-dunkel)" />
        <rect x="-262" y="-140" width="524" height="250" rx="6" fill="var(--m-petrol-tief)" />
        <rect x="-262" y="76" width="524" height="34" rx="4" fill="var(--f-dunkel)" opacity="0.25" />
        <text
          x="0"
          y="-4"
          textAnchor="middle"
          fontFamily="var(--schrift-anzeige)"
          fontStyle="italic"
          fontSize="58"
          fill="var(--t-invers)"
        >
          Willkommen
        </text>
        <path d="M -150 30 Q -40 42 60 26 T 150 22" fill="none" stroke="var(--t-invers)" strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        <rect x="-262" y="112" width="524" height="20" rx="4" fill="var(--szene-holz)" />
        <rect x="-42" y="104" width="46" height="12" rx="4" fill="var(--szene-papier)" />
        <rect x="26" y="104" width="40" height="12" rx="4" fill="var(--szene-papier)" opacity="0.85" />
      </ObjektGruppe>

      {/* wort.punkt (uhr): x=86 y=13 -> cx=1376 cy=117 */}
      <ObjektGruppe id="uhr" {...gemeinsam} ziel={{ breite: 140, hoehe: 140 }}>
        <circle r="56" fill="var(--f-karte)" stroke="var(--szene-holz-dunkel)" strokeWidth="6" />
        <path d="M -46 20 A 46 46 0 0 0 46 20" fill="none" stroke="var(--szene-metall-dunkel)" strokeWidth="4" opacity="0.35" />
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
        <line x1="0" y1="0" x2="0" y2="-26" stroke="var(--t-stark)" strokeWidth="5" strokeLinecap="round" transform="rotate(245)" />
        <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--t-stark)" strokeWidth="3.5" strokeLinecap="round" transform="rotate(60)" />
        <circle r="6" fill="var(--t-stark)" />
      </ObjektGruppe>

      {/* wort.punkt (stuhl): x=7 y=60 -> cx=112 cy=540 */}
      <ObjektGruppe id="stuhl" {...gemeinsam} ziel={{ breite: 160, hoehe: 300 }}>
        <rect x="-55" y="-135" width="110" height="85" rx="16" fill="var(--szene-holz)" />
        <rect x="-20" y="-118" width="8" height="60" rx="3" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="12" y="-118" width="8" height="60" rx="3" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="-65" y="-50" width="130" height="24" rx="8" fill="var(--szene-holz-hell)" />
        <rect x="-50" y="-26" width="16" height="161" fill="var(--szene-holz-dunkel)" />
        <rect x="34" y="-26" width="16" height="161" fill="var(--szene-holz-dunkel)" />
        <rect x="-50" y="68" width="100" height="10" fill="var(--szene-holz-dunkel)" opacity="0.9" />
      </ObjektGruppe>

      {/* wort.punkt (schultasche): x=15 y=77 -> cx=240 cy=693 */}
      <ObjektGruppe id="schultasche" {...gemeinsam} ziel={{ breite: 190, hoehe: 190 }}>
        <path d="M -28 -60 Q 0 -84 28 -60" fill="none" stroke="var(--szene-holz-dunkel)" strokeWidth="9" strokeLinecap="round" />
        <rect x="-80" y="-58" width="160" height="115" rx="24" fill="var(--m-petrol)" />
        <rect x="-80" y="37" width="160" height="20" rx="10" fill="var(--m-petrol-tief)" opacity="0.55" />
        <rect x="-58" y="-8" width="116" height="55" rx="14" fill="var(--m-petrol-tief)" />
        <rect x="-46" y="-50" width="10" height="95" fill="var(--m-ocker)" />
        <rect x="36" y="-50" width="10" height="95" fill="var(--m-ocker)" />
        <rect x="-49" y="6" width="16" height="10" rx="2" fill="var(--szene-metall)" />
        <rect x="33" y="6" width="16" height="10" rx="2" fill="var(--szene-metall)" />
      </ObjektGruppe>

      {/* wort.punkt (tisch): x=30 y=88 -> cx=480 cy=792
          Die "Tisch"-Gruppe zeigt die Schublade in der Tischfront - der
          Tisch als Ganzes ist Kulisse (siehe oben), dieser Ausschnitt ist
          das konkrete, klickbare Detail genau an diesem Punkt. */}
      <ObjektGruppe id="tisch" {...gemeinsam} ziel={{ breite: 190, hoehe: 130 }}>
        <rect x="-78" y="-46" width="156" height="92" rx="6" fill="var(--szene-holz-hell)" stroke="var(--szene-holz-dunkel)" strokeWidth="3" />
        <rect x="-78" y="30" width="156" height="16" rx="4" fill="var(--t-stark)" opacity="0.12" />
        <rect x="-22" y="6" width="44" height="14" rx="7" fill="var(--szene-metall-dunkel)" />
      </ObjektGruppe>

      {/* wort.punkt (papierkorb): x=91 y=66 -> cx=1456 cy=594 */}
      <ObjektGruppe id="papierkorb" {...gemeinsam} ziel={{ breite: 140, hoehe: 200 }}>
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
      </ObjektGruppe>

      {/* wort.punkt (buch): x=24 y=60 -> cx=384 cy=540 */}
      <ObjektGruppe id="buch" {...gemeinsam} ziel={{ breite: 150, hoehe: 110 }} drehung={-3}>
        <rect x="-58" y="-34" width="124" height="76" rx="6" fill="var(--szene-papier)" />
        <rect x="-65" y="-42" width="120" height="76" rx="6" fill="var(--m-ocker)" />
        <rect x="-65" y="-42" width="14" height="76" rx="6" fill="var(--szene-holz-dunkel)" opacity="0.7" />
        <rect x="-38" y="-14" width="70" height="6" rx="3" fill="var(--m-ocker-hell)" />
        <rect x="-38" y="2" width="50" height="6" rx="3" fill="var(--m-ocker-hell)" />
      </ObjektGruppe>

      {/* wort.punkt (heft): x=34 y=64 -> cx=544 cy=576 */}
      <ObjektGruppe id="heft" {...gemeinsam} ziel={{ breite: 130, hoehe: 110 }} drehung={4}>
        <rect x="-55" y="-40" width="110" height="80" rx="4" fill="var(--szene-papier)" stroke="var(--f-rand-stark)" strokeWidth="2" />
        <rect x="-55" y="28" width="110" height="12" fill="var(--f-rand-stark)" opacity="0.4" />
        <rect x="-55" y="-40" width="16" height="80" fill="var(--m-petrol)" />
        {[-16, 0, 16].map((y) => (
          <line key={y} x1="-28" y1={y} x2="44" y2={y} stroke="var(--f-rand)" strokeWidth="2" />
        ))}
        <rect x="-6" y="-30" width="50" height="18" rx="3" fill="none" stroke="var(--f-rand-stark)" strokeWidth="1.5" />
      </ObjektGruppe>

      {/* wort.punkt (lineal): x=44 y=57 -> cx=704 cy=513 */}
      <ObjektGruppe id="lineal" {...gemeinsam} ziel={{ breite: 200, hoehe: 70 }} drehung={-6}>
        <rect x="-85" y="-16" width="170" height="32" rx="4" fill="var(--szene-holz-hell)" stroke="var(--szene-holz-dunkel)" strokeWidth="2" />
        <rect x="-85" y="8" width="170" height="8" rx="2" fill="var(--szene-holz-dunkel)" opacity="0.45" />
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
      </ObjektGruppe>

      {/* wort.punkt (radiergummi): x=61 y=58 -> cx=976 cy=522 */}
      <ObjektGruppe id="radiergummi" {...gemeinsam} ziel={{ breite: 110, hoehe: 70 }} drehung={-8}>
        <g clipPath={`url(#${clipRadiergummi})`}>
          <rect x="-45" y="-24" width="45" height="48" fill="var(--szene-radierer-a)" />
          <rect x="0" y="-24" width="45" height="48" fill="var(--szene-radierer-b)" />
          <rect x="-45" y="12" width="90" height="12" fill="var(--szene-metall-dunkel)" opacity="0.25" />
        </g>
        <rect x="-45" y="-24" width="90" height="48" rx="8" fill="none" stroke="var(--szene-metall-dunkel)" strokeWidth="2" />
        <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--szene-metall-dunkel)" strokeWidth="1.5" opacity="0.6" />
      </ObjektGruppe>

      {/* wort.punkt (spitzer): x=68 y=66 -> cx=1088 cy=594 */}
      <ObjektGruppe id="spitzer" {...gemeinsam} ziel={{ breite: 100, hoehe: 80 }} drehung={5}>
        <rect x="-35" y="-26" width="70" height="52" rx="10" fill="var(--szene-lila)" />
        <rect x="-35" y="14" width="70" height="12" rx="6" fill="var(--t-stark)" opacity="0.16" />
        <circle cx="0" cy="-2" r="15" fill="var(--szene-metall-dunkel)" />
        <circle cx="0" cy="-2" r="9" fill="var(--f-dunkel)" />
        <path d="M 9 -11 L 20 -15 L 22 -6 L 11 -3 Z" fill="var(--szene-metall)" stroke="var(--szene-metall-dunkel)" strokeWidth="1" />
      </ObjektGruppe>

      {/* wort.punkt (schere): x=76 y=57 -> cx=1216 cy=513 */}
      <ObjektGruppe id="schere" {...gemeinsam} ziel={{ breite: 130, hoehe: 190 }} drehung={-8}>
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
      </ObjektGruppe>

      {/* wort.punkt (kleber): x=84 y=65 -> cx=1344 cy=585 */}
      <ObjektGruppe id="kleber" {...gemeinsam} ziel={{ breite: 90, hoehe: 150 }} drehung={-5}>
        <rect x="-20" y="-8" width="40" height="70" rx="8" fill="var(--szene-papier)" stroke="var(--f-rand-stark)" strokeWidth="2" />
        <rect x="-20" y="48" width="40" height="14" rx="6" fill="var(--t-stark)" opacity="0.12" />
        <rect x="-20" y="18" width="40" height="16" fill="var(--m-petrol)" />
        <rect x="-23" y="-62" width="46" height="56" rx="10" fill="var(--szene-lila)" />
        <line x1="-22" y1="-6" x2="22" y2="-6" stroke="var(--f-rand-stark)" strokeWidth="2" />
      </ObjektGruppe>

      {/* wort.punkt (stift): x=52 y=65 -> cx=832 cy=585 */}
      <ObjektGruppe id="stift" {...gemeinsam} ziel={{ breite: 200, hoehe: 60 }} drehung={28}>
        <rect x="-84" y="-11" width="16" height="22" rx="4" fill="var(--szene-radierer-a)" />
        <rect x="-68" y="-11" width="14" height="22" fill="var(--szene-metall)" />
        <rect x="-54" y="-11" width="108" height="22" fill="var(--m-ocker)" />
        <rect x="-54" y="5" width="108" height="6" fill="var(--szene-holz-dunkel)" opacity="0.4" />
        <path d="M 54 -11 L 80 0 L 54 11 Z" fill="var(--szene-holz-hell)" stroke="var(--szene-holz-dunkel)" strokeWidth="1" />
        <path d="M 74 -4 L 84 0 L 74 4 Z" fill="var(--f-dunkel)" />
      </ObjektGruppe>
    </svg>
  )
}
