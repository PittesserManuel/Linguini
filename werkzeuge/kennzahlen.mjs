#!/usr/bin/env node
/**
 * Zaehlt die Kennzahlen der Lesetexte und schreibt sie in die Inhaltsdatei.
 *
 * Warum ein Werkzeug und keine Laufzeitberechnung: Die Kennzahlen stehen im
 * Lehrkraft-Bereich und sind eine redaktionelle Zusage - "Ø 6,9 Woerter pro
 * Satz" ist eine Aussage ueber den Text, die jemand verantwortet. Sie zur
 * Laufzeit auszurechnen waere bequemer, wuerde aber verschleiern, dass die
 * Textlaenge eine bewusste Entscheidung ist und nicht ein Nebenprodukt.
 *
 * Dieses Werkzeug macht das Zaehlen trotzdem verlaesslich: Es liest die
 * Saetze aus der Datei, zaehlt sie und traegt das Ergebnis ein. Was
 * redaktionell bleibt, ist die Entscheidung, ob die Zahl akzeptabel ist.
 *
 * Aufruf:  node werkzeuge/kennzahlen.mjs [--pruefen]
 *          --pruefen schreibt nichts, sondern meldet Abweichungen (fuer CI).
 */

import { readFileSync, writeFileSync } from 'node:fs'

const DATEIEN = ['src/content/klassenzimmer-jahrgaenge.ts', 'src/content/modul-wochenmarkt.ts']

/** Woerter eines Satzes - Satzzeichen und Anfuehrungszeichen zaehlen nicht mit. */
function woerterVon(satz) {
  return satz
    .replace(/[„“”"‚‘’'.,;:!?…()–—-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Zerlegt eine Datei in ihre Lesetext-Bloecke.
 *
 * Ein Block beginnt bei `titel:` und endet beim zugehoerigen `kennzahlen:` -
 * dazwischen liegen genau die Saetze, die zu diesem Text gehoeren. Das ist
 * robuster als ein Klammerzaehler und kommt ohne TypeScript-Parser aus.
 */
function findeTexte(inhalt) {
  const bloecke = []
  const muster = /titel: '([^']*)',([\s\S]*?)kennzahlen: \{([^}]*)\}/g
  let treffer
  while ((treffer = muster.exec(inhalt)) !== null) {
    const [ganz, titel, rumpf, kennzahlenRoh] = treffer
    // Nur Zeichenketten INNERHALB von `saetze: [...]` zaehlen - sonst wandern
    // Absatz-IDs und der Titel in die Wortzahl. Die Arrays stehen je nach
    // Formatierung ein- oder mehrzeilig da, deshalb wird der Array-Rumpf als
    // Ganzes gegriffen und erst darin nach Zeichenketten gesucht.
    const saetze = [...rumpf.matchAll(/saetze: \[([\s\S]*?)\]/g)].flatMap((array) =>
      [...array[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'")),
    )
    bloecke.push({
      titel,
      saetze,
      kennzahlenRoh,
      start: treffer.index,
      laenge: ganz.length,
    })
  }
  return bloecke
}

function berechne(saetze) {
  const woerter = saetze.flatMap(woerterVon)
  const langstesWort = woerter.reduce((a, b) => (b.length > a.length ? b : a), '')
  return {
    woerter: woerter.length,
    saetze: saetze.length,
    woerterProSatzDurchschnitt: Math.round((woerter.length / saetze.length) * 10) / 10,
    langstesWort,
  }
}

const nurPruefen = process.argv.includes('--pruefen')
let abweichungen = 0

for (const datei of DATEIEN) {
  let inhalt = readFileSync(datei, 'utf8')
  const texte = findeTexte(inhalt)
  if (texte.length === 0) {
    console.warn(`${datei}: kein Lesetext gefunden`)
    continue
  }

  // Von hinten nach vorne ersetzen, damit die Positionen gueltig bleiben.
  for (const text of [...texte].reverse()) {
    if (text.saetze.length === 0) continue
    const k = berechne(text.saetze)
    const neu =
      `woerter: ${k.woerter}, saetze: ${k.saetze}, ` +
      `woerterProSatzDurchschnitt: ${k.woerterProSatzDurchschnitt}, ` +
      `langstesWort: '${k.langstesWort}'`
    const alt = text.kennzahlenRoh.replace(/\s+/g, ' ').trim().replace(/,$/, '')

    if (alt === neu) {
      console.log(`  ${text.titel}: ${k.woerter} Wörter, ${k.saetze} Sätze, Ø ${k.woerterProSatzDurchschnitt}`)
      continue
    }

    abweichungen += 1
    console.log(
      `${nurPruefen ? '✗' : '→'} ${text.titel}: ${k.woerter} Wörter, ${k.saetze} Sätze, ` +
        `Ø ${k.woerterProSatzDurchschnitt}, längstes Wort „${k.langstesWort}“`,
    )
    if (!nurPruefen) {
      const vorher = inhalt.slice(0, text.start)
      const block = inhalt.slice(text.start, text.start + text.laenge)
      const nachher = inhalt.slice(text.start + text.laenge)
      inhalt = vorher + block.replace(/kennzahlen: \{[^}]*\}/, `kennzahlen: { ${neu} }`) + nachher
    }
  }

  if (!nurPruefen) writeFileSync(datei, inhalt)
}

if (nurPruefen && abweichungen > 0) {
  console.error(`\n${abweichungen} Lesetext(e) mit veralteten Kennzahlen. Lauf: node werkzeuge/kennzahlen.mjs`)
  process.exit(1)
}
