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

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Laedt eine Datei ueber `curl` statt ueber `fetch`.
 *
 * Der Umweg hat einen konkreten Grund: In Node 22 ignoriert das eingebaute
 * `fetch` die Proxy-Umgebungsvariablen (HTTPS_PROXY, NO_PROXY). Hinter einem
 * Unternehmens- oder Agentenproxy scheitert es deshalb mit einem 403, das
 * aussieht, als waere die Domain gesperrt - obwohl sie erreichbar ist. `curl`
 * beachtet dieselben Variablen wie der Rest der Werkzeugkette und ist auf
 * jedem System vorhanden, auf dem dieses Repository sinnvoll laeuft.
 */
function laden(url, ziel) {
  execFileSync(
    'curl',
    ['--fail', '--location', '--silent', '--show-error', '--max-time', '120', '--output', ziel, url],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
}

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
    laden(url, ziel)
    const groesse = statSync(ziel).size
    if (groesse < 1024) throw new Error(`nur ${groesse} Byte - vermutlich eine Fehlerseite`)
    console.log(`✓ ${wortId}.png (${Math.round(groesse / 1024)} kB)`)
    geholt += 1
  } catch (ursache) {
    const meldung = (ursache.stderr?.toString() || ursache.message).trim()
    fehler.push({ wortId, grund: meldung })
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
