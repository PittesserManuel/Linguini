/**
 * Oeffentliche Schnittstelle des Bild-Wort-Lernteils.
 *
 * Andere Teile der App importieren AUSSCHLIESSLICH von hier - nicht direkt
 * aus Wortbild.tsx, WortKarte.tsx oder Szene.tsx.
 *
 * Die Szene und das Einzelbild sind mit exportiert, weil sie ueber den
 * Bildteil hinaus gebraucht werden: als Bildstuetze neben einer Leseaufgabe,
 * als Mengenbild in der Einzahl-/Mehrzahl-Uebung und als Illustration im
 * Hefteintrag. Es gibt bewusst nur EINE Zeichnung je Gegenstand.
 */

export { Wortbild } from './Wortbild'
export { KlassenzimmerSzene, ObjektBild } from './Szene'
