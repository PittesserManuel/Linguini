#!/usr/bin/env node
/**
 * Holt die Objektbilder aus public/objekte/quellen.json und legt sie als
 * <wortId>.png in public/objekte/ ab.
 *
 * Warum ueberhaupt ein Skript: Die Bilder werden bei einem externen Dienst
 * erzeugt, und dessen Auslieferungs-Domain ist nicht in jeder Umgebung
 * erreichbar. Die Zuordnung "welche Datei gehoert zu welchem Wort" ist aber
 * das eigentlich Wertvolle - sie gehoert ins Repository, nicht in einen
 * Chatverlauf. Das Skript macht daraus einen Befehl statt sechzehn
 * Rechtsklicks.
 *
 * Aufruf:  node werkzeuge/objektbilder-holen.mjs
 *          node werkzeuge/objektbilder-holen.mjs --neu   (auch vorhandene neu laden)
 *
 * Vorhandene Dateien werden NICHT ueberschrieben. Wer ein Bild von Hand
 * nachbearbeitet hat (Freisteller!), verliert es also nicht beim naechsten
 * Lauf.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..')
const ordner = join(wurzel, 'public', 'objekte')
const manifest = JSON.parse(readFileSync(join(ordner, 'quellen.json'), 'utf8'))
const neuLaden = process.argv.includes('--neu')

mkdirSync(ordner, { recursive: true })

let geholt = 0
let vorhanden = 0
const fehler = []

for (const [wortId, url] of Object.entries(manifest.bilder)) {
  const ziel = join(ordner, `${wortId}.png`)

  if (existsSync(ziel) && !neuLaden) {
    vorhanden += 1
    continue
  }

  try {
    const antwort = await fetch(url)
    if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`)
    writeFileSync(ziel, Buffer.from(await antwort.arrayBuffer()))
    console.log(`✓ ${wortId}.png`)
    geholt += 1
  } catch (ursache) {
    fehler.push({ wortId, grund: ursache.message })
  }
}

console.log(`\n${geholt} geholt, ${vorhanden} schon vorhanden, ${fehler.length} fehlgeschlagen`)

if (fehler.length > 0) {
  for (const { wortId, grund } of fehler) console.error(`✗ ${wortId}: ${grund}`)
  console.error(
    '\nSchlaegt ALLES fehl, ist vermutlich die Domain gesperrt. Freizugeben ist:\n' +
      '  d8j0ntlcm91z4.cloudfront.net (HTTPS)\n' +
      'Alternativ die Bilder von Hand herunterladen und als <wortId>.png hier ablegen.',
  )
  process.exit(1)
}

console.log(
  '\nNaechster Schritt: In src/content/modul-klassenzimmer.ts je Wort\n' +
    "  bildQuelle: 'objekte/<wortId>.png'\n" +
    'ergaenzen. Ohne diesen Eintrag bleibt die Vektorfassung stehen.',
)
