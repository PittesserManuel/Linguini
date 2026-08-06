/**
 * Die sechs deterministischen Grader - einer je Aufgabentyp.
 *
 * Gemeinsame Bausteine (Versuchslogik, Mehrheits-Fehlerart, Rechtschreib-
 * Toleranz) liegen oben in diesem Modul und werden von allen sechs Gradern
 * genutzt. Das haelt die Versuchslogik an GENAU EINER Stelle konsistent -
 * kein Grader baut sie sich selbst und driftet dabei ab.
 */

import type {
  Aufgabe,
  AufgabeArtikel,
  AufgabeAuswahl,
  AufgabeFreitext,
  AufgabeHeft,
  AufgabeLuecken,
  AufgabeMenge,
  AufgabeReihenfolge,
  AufgabeWahrheit,
  Genus,
  Wort,
} from '@/content/types'
import { findeWort, mengenLoesung, pluralNomen, wortMitArtikel, zahlwort } from '@/content/types'
import type { Antwort, Bewertung, Fehlerart, Grader, GraderErgebnis, GraderKontext, TeilErgebnis } from './types'
import { damerauLevenshtein, schwelleFuer } from './distance'
import { istNomenGross, normalisiere, teileArtikelNomen } from './normalize'

// ---------------------------------------------------------------------------
// Gemeinsame Bausteine
// ---------------------------------------------------------------------------

/**
 * Setzt aus einer Bewertung die Versuchslogik zusammen (siehe Aufgabenstellung
 * der Korrektur-Engine):
 * - 'richtig'                                -> nochmal: false, keine Aufloesung.
 * - nicht richtig, Versuche uebrig           -> nochmal: true, naechste Hilfe.
 * - nicht richtig, Versuchslimit erreicht    -> nochmal: false, Loesung zeigen.
 *
 * Das ist die EINZIGE Stelle, die diese Entscheidung trifft - alle sechs
 * Grader rufen sie auf, damit sich die Regel nie unbeabsichtigt unterscheidet.
 */
function abschliessen(params: {
  bewertung: Bewertung
  fehlerart: Fehlerart
  punkte: number
  teile?: TeilErgebnis[]
  /** Kurzes, aufgabenbezogenes Feedback fuer Versuch 1 und 2. */
  rueckmeldungKnapp: string
  /** Feedback inklusive Loesung/Erklaerung, nur beim Erreichen des Limits genutzt. */
  rueckmeldungReveal: string
  aufgabe: Aufgabe
  ctx: GraderKontext
}): GraderErgebnis {
  const { bewertung, fehlerart, punkte, teile, rueckmeldungKnapp, rueckmeldungReveal, aufgabe, ctx } = params

  if (bewertung === 'richtig') {
    return { bewertung, punkte, fehlerart, teile, rueckmeldung: rueckmeldungKnapp, nochmal: false, loesungZeigen: false }
  }

  if (ctx.versuch >= ctx.maxVersuche) {
    return { bewertung, punkte, fehlerart, teile, rueckmeldung: rueckmeldungReveal, nochmal: false, loesungZeigen: true }
  }

  const hinweis = aufgabe.hilfen[ctx.versuch - 1]
  return { bewertung, punkte, fehlerart, teile, rueckmeldung: rueckmeldungKnapp, hinweis, nochmal: true, loesungZeigen: false }
}

/**
 * Aggregiert die Fehlerart mehrteiliger Aufgaben (wahrheit, luecken,
 * reihenfolge, artikel): Ist jede falsche Teilantwort derselben Fehlerart
 * zuzuordnen, gilt diese fuer das Gesamtergebnis. Bei gemischten Fehlerarten
 * gilt 'teilweise' - das Gesamtbild ist dann nicht auf einen Fehlertyp
 * reduzierbar.
 */
function mehrheitsFehlerart(teile: TeilErgebnis[]): Fehlerart {
  const falsche = teile.filter((t) => t.bewertung !== 'richtig')
  if (falsche.length === 0) return 'keine'
  const erste = falsche[0]!.fehlerart
  const einheitlich = falsche.every((t) => t.fehlerart === erste)
  return einheitlich ? erste : 'teilweise'
}

function anteilRichtig(elemente: { bewertung: Bewertung }[]): number {
  if (elemente.length === 0) return 0
  const richtig = elemente.filter((e) => e.bewertung === 'richtig').length
  return richtig / elemente.length
}

function bewertungAusAnteil(anteil: number): Bewertung {
  if (anteil === 1) return 'richtig'
  if (anteil === 0) return 'falsch'
  return 'fast'
}

/**
 * Zusatzregel zur Rechtschreib-Toleranz, ueber die reine Editierdistanz
 * hinaus: Eine Verschreibung durch ERSETZUNG oder Buchstabendreher (gleiche
 * Wortlaenge) wird immer toleriert, wenn sie innerhalb der Schwelle liegt.
 * Eine Verschreibung durch eine zusaetzlich EINGEFUEGTE Buchstabe wird nur
 * toleriert, wenn diese Buchstabe einen bereits vorhandenen Nachbarn
 * verdoppelt (typischer Tippfehler, z. B. "Scheere" statt "Schere" - doppeltes
 * e). Eine eingefuegte, NICHT verdoppelte Buchstabe wird nicht toleriert,
 * weil daraus zufaellig ein anderes echtes Wort entstehen kann
 * (z. B. "Schwere" statt "Schere" - ein eingefuegtes w ist kein Doppellaut).
 * Lieber ein "fast" zu wenig als ein falsches "richtig".
 */
function istPlausibleVerschreibung(eingabe: string, erwartet: string): boolean {
  if (eingabe === erwartet) return true
  if (eingabe.length === erwartet.length) return true

  const laengendifferenz = eingabe.length - erwartet.length
  if (Math.abs(laengendifferenz) !== 1) return true

  const laenger = laengendifferenz > 0 ? eingabe : erwartet
  const kuerzer = laengendifferenz > 0 ? erwartet : eingabe

  for (let i = 0; i < laenger.length; i++) {
    const ohneZeichenI = laenger.slice(0, i) + laenger.slice(i + 1)
    if (ohneZeichenI !== kuerzer) continue
    const zeichen = laenger[i]
    const davor = laenger[i - 1]
    const danach = laenger[i + 1]
    if (zeichen === davor || zeichen === danach) {
      return true
    }
  }

  return false
}

/** Kombiniert Editierdistanz-Schwelle und Plausibilitaets-Zusatzregel. */
function istRechtschreibNah(eingabe: string, erwartet: string): boolean {
  if (eingabe.length === 0 || erwartet.length === 0) return false
  const distanz = damerauLevenshtein(eingabe, erwartet)
  if (distanz === 0 || distanz > schwelleFuer(erwartet.length)) return false
  return istPlausibleVerschreibung(eingabe, erwartet)
}

// ---------------------------------------------------------------------------
// auswahl
// ---------------------------------------------------------------------------

function bewerteAuswahl(antwort: Antwort, aufgabe: AufgabeAuswahl, ctx: GraderKontext): GraderErgebnis {
  const gewaehlteId = antwort.wert
  const korrekt = gewaehlteId === aufgabe.richtig
  const bewertung: Bewertung = korrekt ? 'richtig' : 'falsch'
  const fehlerart: Fehlerart = korrekt ? 'keine' : gewaehlteId === undefined || gewaehlteId === '' ? 'leer' : 'verstaendnis'

  const richtigeOption = aufgabe.optionen.find((o) => o.id === aufgabe.richtig)

  return abschliessen({
    bewertung,
    fehlerart,
    punkte: korrekt ? 1 : 0,
    rueckmeldungKnapp: korrekt
      ? `Richtig! „${richtigeOption?.text ?? ''}“ passt zu dieser Aufgabe.`
      : fehlerart === 'leer'
        ? 'Wähle zuerst eine Antwort aus.'
        : 'Noch nicht ganz. Schau dir die Aufgabe noch einmal genau an.',
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// wahrheit
// ---------------------------------------------------------------------------

function bewerteWahrheit(antwort: Antwort, aufgabe: AufgabeWahrheit, ctx: GraderKontext): GraderErgebnis {
  const zuordnung = antwort.zuordnung ?? {}

  const auswertungen = aufgabe.aussagen.map((aussage) => {
    const gegeben = zuordnung[aussage.id]
    const korrekt = gegeben === aussage.richtig
    const fehlerart: Fehlerart = korrekt ? 'keine' : gegeben === undefined ? 'leer' : 'verstaendnis'
    return { aussage, gegeben, korrekt, fehlerart }
  })

  const anteil = anteilRichtig(auswertungen.map((a) => ({ bewertung: a.korrekt ? 'richtig' : 'falsch' })))
  const bewertung = bewertungAusAnteil(anteil)
  // Begruendung wird bewusst erst aufgedeckt, wenn auch die Musterloesung
  // aufgedeckt wird - vorher wuerde sie das Selbst-Erschliessen aus dem Text
  // unterlaufen.
  const loesungZeigen = bewertung !== 'richtig' && ctx.versuch >= ctx.maxVersuche

  const teile: TeilErgebnis[] = auswertungen.map(({ aussage, gegeben, korrekt, fehlerart }) => ({
    id: aussage.id,
    bewertung: korrekt ? 'richtig' : 'falsch',
    fehlerart,
    gegeben: gegeben ?? '',
    erwartet: aussage.richtig,
    rueckmeldung: loesungZeigen
      ? aussage.begruendung
      : korrekt
        ? 'Richtig zugeordnet.'
        : 'Sieh dir diese Aussage im Text noch einmal an.',
  }))

  return abschliessen({
    bewertung,
    fehlerart: mehrheitsFehlerart(teile),
    punkte: anteil,
    teile,
    rueckmeldungKnapp:
      bewertung === 'richtig'
        ? 'Richtig! Du hast alle Aussagen korrekt zugeordnet.'
        : 'Noch nicht alle Zuordnungen passen. Vergleiche jede Aussage mit dem Text.',
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// freitext
// ---------------------------------------------------------------------------

/** Vergleichsform: kleingeschrieben und mit gefalteten Umlauten. */
function vergleichsform(text: string): string {
  return normalisiere(text, { kleinschreiben: true, umlauteFalten: true })
}

function abschliessenFreitextRichtig(getrimmt: string, aufgabe: AufgabeFreitext, ctx: GraderKontext): GraderErgebnis {
  const { nomen } = teileArtikelNomen(getrimmt)
  const grossOk = nomen.length === 0 || istNomenGross(nomen)

  return abschliessen({
    bewertung: 'richtig',
    fehlerart: grossOk ? 'keine' : 'grossschreibung',
    punkte: 1,
    rueckmeldungKnapp: grossOk
      ? 'Richtig! Das ist die passende Antwort.'
      : 'Richtig! Denk daran: Nomen schreiben wir groß.',
    rueckmeldungReveal: '',
    aufgabe,
    ctx,
  })
}

function bewerteFreitextMitArtikel(
  getrimmt: string,
  aufgabe: AufgabeFreitext,
  ctx: GraderKontext,
): GraderErgebnis {
  // Konvention: Wenn artikelPflicht gesetzt ist, traegt der erste Eintrag
  // von akzeptiert (die "Musterloesung") den korrekten Artikel - daraus wird
  // die erwartete Genus-/Nomen-Kombination abgeleitet.
  const kanonisch = teileArtikelNomen(aufgabe.akzeptiert[0] ?? '')
  const eingabeSplit = teileArtikelNomen(getrimmt)

  const nomenErwartetNorm = vergleichsform(kanonisch.nomen)
  const nomenEingabeNorm = vergleichsform(eingabeSplit.nomen)
  const artikelErwartetNorm = kanonisch.artikel ? kanonisch.artikel.toLocaleLowerCase('de-DE') : null
  const artikelEingabeNorm = eingabeSplit.artikel ? eingabeSplit.artikel.toLocaleLowerCase('de-DE') : null

  const nomenRichtig = nomenEingabeNorm.length > 0 && nomenEingabeNorm === nomenErwartetNorm
  const artikelRichtig = artikelEingabeNorm !== null && artikelEingabeNorm === artikelErwartetNorm

  if (nomenRichtig && artikelRichtig) {
    return abschliessenFreitextRichtig(getrimmt, aufgabe, ctx)
  }

  const loesungReveal = aufgabe.loesungserklaerung

  if (nomenRichtig) {
    const rueckmeldungKnapp =
      artikelEingabeNorm === null
        ? `Das Wort stimmt! Es fehlt aber noch der Artikel. Heißt es der, die oder das ${kanonisch.nomen}?`
        : `Das Wort stimmt! Aber der Artikel passt noch nicht. Heißt es der, die oder das ${kanonisch.nomen}?`

    return abschliessen({
      bewertung: 'fast',
      fehlerart: 'genus',
      punkte: 0,
      rueckmeldungKnapp,
      rueckmeldungReveal: loesungReveal,
      aufgabe,
      ctx,
    })
  }

  if (istRechtschreibNah(nomenEingabeNorm, nomenErwartetNorm)) {
    return abschliessen({
      bewertung: 'fast',
      fehlerart: 'rechtschreibung',
      punkte: 0,
      rueckmeldungKnapp: 'Fast! Du hast das richtige Wort gemeint. Schau dir die Schreibweise noch einmal an.',
      rueckmeldungReveal: loesungReveal,
      aufgabe,
      ctx,
    })
  }

  return abschliessen({
    bewertung: 'falsch',
    fehlerart: 'verstaendnis',
    punkte: 0,
    rueckmeldungKnapp: 'Noch nicht ganz. Schau noch einmal in den Text und suche das passende Wort.',
    rueckmeldungReveal: loesungReveal,
    aufgabe,
    ctx,
  })
}

function bewerteFreitextOhneArtikel(
  eingabeVergleich: string,
  aufgabe: AufgabeFreitext,
  ctx: GraderKontext,
): GraderErgebnis {
  let bestErwartet = aufgabe.akzeptiert[0] ?? ''
  let minDistanz = Infinity
  for (const kandidat of aufgabe.akzeptiert) {
    const distanz = damerauLevenshtein(eingabeVergleich, vergleichsform(kandidat))
    if (distanz < minDistanz) {
      minDistanz = distanz
      bestErwartet = kandidat
    }
  }

  const loesungReveal = aufgabe.loesungserklaerung

  if (istRechtschreibNah(eingabeVergleich, vergleichsform(bestErwartet))) {
    return abschliessen({
      bewertung: 'fast',
      fehlerart: 'rechtschreibung',
      punkte: 0,
      rueckmeldungKnapp: 'Fast! Du hast das richtige Wort gemeint. Schau dir die Schreibweise noch einmal an.',
      rueckmeldungReveal: loesungReveal,
      aufgabe,
      ctx,
    })
  }

  return abschliessen({
    bewertung: 'falsch',
    fehlerart: 'verstaendnis',
    punkte: 0,
    rueckmeldungKnapp: 'Noch nicht ganz. Schau noch einmal in den Text und suche das passende Wort.',
    rueckmeldungReveal: loesungReveal,
    aufgabe,
    ctx,
  })
}

function bewerteFreitext(antwort: Antwort, aufgabe: AufgabeFreitext, ctx: GraderKontext): GraderErgebnis {
  const rohtext = antwort.wert ?? ''
  const getrimmt = normalisiere(rohtext)

  if (getrimmt.length === 0) {
    return {
      bewertung: 'falsch',
      punkte: 0,
      fehlerart: 'leer',
      rueckmeldung: 'Schreib zuerst eine Antwort in das Eingabefeld.',
      nochmal: true,
      loesungZeigen: false,
    }
  }

  const eingabeVergleich = vergleichsform(rohtext)

  /*
   * Bei Artikelpflicht zaehlt ein Eintrag der Trefferliste nur, wenn er
   * SELBST einen Artikel traegt.
   *
   * Ohne diese Bedingung gewinnt die Trefferliste immer, weil sie vor der
   * Artikelpruefung steht. "Radiergummi" galt damit als vollstaendig
   * richtig auf einer Aufgabe, die woertlich "Schreibe das Wort mit
   * Artikel" verlangt - das Kind lernte ausgerechnet an der Artikeluebung,
   * dass der Artikel entbehrlich ist.
   *
   * Die Dativ- und Praepositionalformen bleiben gueltig: teileArtikelNomen
   * kennt auch den/dem/einen/einem und schneidet eine fuehrende
   * Praeposition vorher ab, "mit dem Radiergummi" traegt also einen
   * Artikel. Faellt eine artikellose Eingabe hier durch, landet sie in
   * bewerteFreitextMitArtikel und bekommt dort die Rueckmeldung, die es
   * laengst gibt: "Das Wort stimmt! Es fehlt aber noch der Artikel."
   */
  const treffer = aufgabe.akzeptiert.some(
    (a) =>
      vergleichsform(a) === eingabeVergleich &&
      (!aufgabe.artikelPflicht || teileArtikelNomen(a).artikel !== null),
  )

  if (treffer) {
    return abschliessenFreitextRichtig(getrimmt, aufgabe, ctx)
  }

  if (aufgabe.artikelPflicht) {
    return bewerteFreitextMitArtikel(getrimmt, aufgabe, ctx)
  }

  return bewerteFreitextOhneArtikel(eingabeVergleich, aufgabe, ctx)
}

// ---------------------------------------------------------------------------
// luecken
// ---------------------------------------------------------------------------

function bewerteLuecken(antwort: Antwort, aufgabe: AufgabeLuecken, ctx: GraderKontext): GraderErgebnis {
  const werte = antwort.werte ?? []

  const teile: TeilErgebnis[] = aufgabe.loesungen.map((loesung, i) => {
    const id = `luecke-${i}`
    const gegebenRoh = werte[i] ?? ''
    const gegebenGetrimmt = normalisiere(gegebenRoh)
    const gegebenVergleich = vergleichsform(gegebenRoh)
    const loesungVergleich = vergleichsform(loesung)

    if (gegebenGetrimmt.length === 0) {
      return {
        id,
        bewertung: 'falsch',
        fehlerart: 'leer',
        gegeben: '',
        erwartet: loesung,
        rueckmeldung: 'Hier fehlt noch ein Wort.',
      }
    }

    if (gegebenVergleich === loesungVergleich) {
      return {
        id,
        bewertung: 'richtig',
        fehlerart: 'keine',
        gegeben: gegebenGetrimmt,
        erwartet: loesung,
        rueckmeldung: 'Richtig eingesetzt.',
      }
    }

    const istAndereWortbank = aufgabe.wortbank.some((w) => {
      const wVergleich = vergleichsform(w)
      return wVergleich === gegebenVergleich && wVergleich !== loesungVergleich
    })

    if (istAndereWortbank) {
      return {
        id,
        bewertung: 'falsch',
        fehlerart: 'wortwahl',
        gegeben: gegebenGetrimmt,
        erwartet: loesung,
        rueckmeldung: 'Dieses Wort passt grammatisch nicht in diese Lücke. Schau dir den Satz noch einmal an.',
      }
    }

    if (istRechtschreibNah(gegebenVergleich, loesungVergleich)) {
      return {
        id,
        bewertung: 'fast',
        fehlerart: 'rechtschreibung',
        gegeben: gegebenGetrimmt,
        erwartet: loesung,
        rueckmeldung: 'Fast richtig! Schau dir die Schreibweise noch einmal an.',
      }
    }

    return {
      id,
      bewertung: 'falsch',
      fehlerart: 'verstaendnis',
      gegeben: gegebenGetrimmt,
      erwartet: loesung,
      rueckmeldung: 'Das passende Wort steht in der Wortbank.',
    }
  })

  const anteil = anteilRichtig(teile)
  const bewertung = bewertungAusAnteil(anteil)

  return abschliessen({
    bewertung,
    fehlerart: mehrheitsFehlerart(teile),
    punkte: anteil,
    teile,
    rueckmeldungKnapp:
      bewertung === 'richtig'
        ? 'Richtig! Alle Lücken passen.'
        : 'Noch nicht alle Lücken passen. Schau dir die markierten Wörter noch einmal an.',
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// reihenfolge
// ---------------------------------------------------------------------------

function bewerteReihenfolge(antwort: Antwort, aufgabe: AufgabeReihenfolge, ctx: GraderKontext): GraderErgebnis {
  const werte = antwort.werte ?? []

  const teile: TeilErgebnis[] = aufgabe.schritte.map((erwarteterSchritt, i) => {
    const gegebeneId = werte[i]
    const korrekt = gegebeneId === erwarteterSchritt.id
    const gegebenerSchritt = aufgabe.schritte.find((s) => s.id === gegebeneId)

    return {
      id: `position-${i}`,
      bewertung: korrekt ? 'richtig' : 'falsch',
      fehlerart: korrekt ? 'keine' : 'teilweise',
      gegeben: gegebenerSchritt?.text ?? '',
      erwartet: erwarteterSchritt.text,
      rueckmeldung: korrekt ? 'Richtige Position.' : 'Diese Position stimmt noch nicht.',
    }
  })

  const anteil = anteilRichtig(teile)
  const bewertung = bewertungAusAnteil(anteil)
  const ersterSchritt = aufgabe.schritte[0]

  return abschliessen({
    bewertung,
    fehlerart: mehrheitsFehlerart(teile),
    punkte: anteil,
    teile,
    rueckmeldungKnapp:
      bewertung === 'richtig'
        ? 'Richtig! Das ist die passende Reihenfolge.'
        : `Noch nicht ganz. Welches Ereignis passiert ganz am Anfang? „${ersterSchritt?.text ?? ''}“ gehört an den Anfang.`,
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// artikel
// ---------------------------------------------------------------------------

function bewerteArtikel(antwort: Antwort, aufgabe: AufgabeArtikel, ctx: GraderKontext): GraderErgebnis {
  const zuordnung = antwort.zuordnung ?? {}

  const teile: TeilErgebnis[] = aufgabe.woerter.map((wortId) => {
    // Nachschlagen im Modul aus dem Kontext, nicht in einem fest verdrahteten:
    // sonst bewertet jedes Modul ausser dem ersten gegen einen fremden
    // Wortschatz und zaehlt jede richtige Antwort als falsch.
    const wort = findeWort(ctx.modul, wortId)
    const erwarteterArtikel = wort?.genus ?? ''
    const gegebenerArtikel = zuordnung[wortId]
    const korrekt = gegebenerArtikel !== undefined && gegebenerArtikel === erwarteterArtikel

    return {
      id: wortId,
      bewertung: korrekt ? 'richtig' : 'falsch',
      fehlerart: korrekt ? 'keine' : 'genus',
      gegeben: gegebenerArtikel ?? '',
      erwartet: erwarteterArtikel,
      rueckmeldung: korrekt
        ? `Richtig, ${erwarteterArtikel} ${wort?.nomen ?? ''}.`
        : `Noch nicht richtig. Welcher Artikel passt zu „${wort?.nomen ?? wortId}“?`,
    }
  })

  const anteil = anteilRichtig(teile)
  const bewertung = bewertungAusAnteil(anteil)

  return abschliessen({
    bewertung,
    fehlerart: mehrheitsFehlerart(teile),
    punkte: anteil,
    teile,
    rueckmeldungKnapp:
      bewertung === 'richtig'
        ? 'Richtig! Alle Artikel passen.'
        : 'Noch nicht alle Artikel passen. Schau dir die markierten Wörter noch einmal an.',
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// menge - Einzahl und Mehrzahl
// ---------------------------------------------------------------------------

const UNBESTIMMT: Record<Genus, string> = { der: 'ein', die: 'eine', das: 'ein' }

/**
 * Alle Formen, die als richtige Antwort auf eine Mengen-Runde gelten.
 *
 * Bewusst grosszuegig bei allem, was NICHT der Lerngegenstand ist: ob das Kind
 * "Das sind zwei Radiergummis." oder nur "zwei Radiergummis" schreibt, ob mit
 * oder ohne Punkt, ob "ein" oder "eins" - all das ist hier nicht die Frage.
 * Gefragt ist einzig: passt die Zahlform zur Menge im Bild?
 */
function mengenAkzeptiert(wort: Wort, anzahl: number, mitIstSind: boolean): string[] {
  const formen = new Set<string>()

  const kerne: string[] = []
  if (anzahl === 1) {
    kerne.push(wortMitArtikel(wort))
    kerne.push(`${UNBESTIMMT[wort.genus]} ${wort.nomen}`)
    if (wort.genus !== 'die') kerne.push(`eins ${wort.nomen}`)
  } else {
    kerne.push(`${zahlwort(anzahl)} ${pluralNomen(wort) ?? wort.nomen}`)
    kerne.push(`${anzahl} ${pluralNomen(wort) ?? wort.nomen}`)
  }

  const verb = anzahl === 1 ? 'Das ist' : 'Das sind'
  for (const kern of kerne) {
    formen.add(kern)
    formen.add(`${kern}.`)
    formen.add(`${verb} ${kern}`)
    formen.add(`${verb} ${kern}.`)
  }

  // Bei gekoppelter ist/sind-Uebung bleibt die Kurzform zwar akzeptiert, die
  // Musterloesung nennt aber den vollen Satz - siehe mengenLoesung.
  void mitIstSind
  return [...formen]
}

/** Enthaelt die Antwort das richtige Nomen, egal in welcher Zahlform? */
function nomenGetroffen(eingabe: string, wort: Wort): 'einzahl' | 'mehrzahl' | null {
  const worte = eingabe.split(/[^\p{L}]+/u).filter(Boolean).map((w) => vergleichsform(w))
  const einzahl = vergleichsform(wort.nomen)
  const mehrzahl = vergleichsform(pluralNomen(wort) ?? wort.nomen)
  // Mehrzahl zuerst pruefen: bei Woertern ohne Pluralaenderung ("die Fenster")
  // sind beide Formen gleich, dann ist die Zahlform ohnehin nie der Fehler.
  if (worte.includes(mehrzahl)) return 'mehrzahl'
  if (worte.includes(einzahl)) return 'einzahl'
  return null
}

function bewerteMengeRunde(
  eingabeRoh: string,
  wort: Wort,
  anzahl: number,
  mitIstSind: boolean,
): Omit<TeilErgebnis, 'id'> {
  const erwartet = mengenLoesung(wort, anzahl, mitIstSind)
  const getrimmt = normalisiere(eingabeRoh)
  const basis = { gegeben: getrimmt, erwartet }

  if (getrimmt.length === 0) {
    return { ...basis, bewertung: 'falsch', fehlerart: 'leer', rueckmeldung: 'Hier fehlt noch die Antwort.' }
  }

  const eingabeVergleich = vergleichsform(getrimmt)
  const akzeptiert = mengenAkzeptiert(wort, anzahl, mitIstSind)
  if (akzeptiert.some((form) => vergleichsform(form) === eingabeVergleich)) {
    return { ...basis, bewertung: 'richtig', fehlerart: 'keine', rueckmeldung: 'Richtig – die Zahlform passt zum Bild.' }
  }

  const getroffen = nomenGetroffen(getrimmt, wort)
  const erwarteteForm = anzahl === 1 ? 'einzahl' : 'mehrzahl'

  if (getroffen !== null && getroffen !== erwarteteForm) {
    return {
      ...basis,
      bewertung: 'fast',
      fehlerart: 'numerus',
      rueckmeldung:
        anzahl === 1
          ? 'Im Bild liegt nur ein Stück. Dann steht das Wort in der Einzahl.'
          : `Im Bild liegen ${zahlwort(anzahl)} Stück. Nach Zahlen über eins steht das Wort in der Mehrzahl.`,
    }
  }

  if (getroffen === erwarteteForm) {
    // Nomen und Zahlform stimmen - dann fehlt der Artikel bzw. das Zahlwort.
    return {
      ...basis,
      bewertung: 'fast',
      fehlerart: anzahl === 1 ? 'genus' : 'numerus',
      rueckmeldung:
        anzahl === 1
          ? `Das Wort stimmt. Es fehlt noch der Artikel: der, die oder das ${wort.nomen}?`
          : 'Das Wort stimmt. Schreibe die Anzahl davor – als Wort, nicht als Ziffer.',
    }
  }

  if (istRechtschreibNah(eingabeVergleich, vergleichsform(erwartet))) {
    return {
      ...basis,
      bewertung: 'fast',
      fehlerart: 'rechtschreibung',
      rueckmeldung: 'Fast! Schau dir die Schreibweise noch einmal an.',
    }
  }

  return {
    ...basis,
    bewertung: 'falsch',
    fehlerart: 'verstaendnis',
    rueckmeldung: 'Zähle noch einmal, wie viele Stücke im Bild liegen.',
  }
}

function bewerteMenge(antwort: Antwort, aufgabe: AufgabeMenge, ctx: GraderKontext): GraderErgebnis {
  const werte = antwort.werte ?? []

  const teile: TeilErgebnis[] = aufgabe.runden.map((runde, i) => {
    const wort = findeWort(ctx.modul, runde.wortId)
    if (!wort) {
      throw new Error(`bewerteMenge: Wort "${runde.wortId}" fehlt im Modul "${ctx.modul.id}".`)
    }
    return { id: runde.id, ...bewerteMengeRunde(werte[i] ?? '', wort, runde.anzahl, aufgabe.mitIstSind) }
  })

  const anteil = anteilRichtig(teile)
  const bewertung = bewertungAusAnteil(anteil)

  return abschliessen({
    bewertung,
    fehlerart: mehrheitsFehlerart(teile),
    punkte: anteil,
    teile,
    rueckmeldungKnapp:
      bewertung === 'richtig'
        ? 'Richtig! Einzahl und Mehrzahl passen überall zum Bild.'
        : 'Noch nicht überall. Zähle die Gegenstände und prüfe die Zahlform.',
    rueckmeldungReveal: aufgabe.loesungserklaerung,
    aufgabe,
    ctx,
  })
}

// ---------------------------------------------------------------------------
// heft - Schreibauftrag ins Heft, von der App bewusst NICHT bewertet
// ---------------------------------------------------------------------------

/**
 * Deckt nie eine Loesung auf und vergibt nie "richtig".
 *
 * Der Auftrag verlangt einen selbst formulierten Satz. Ob der stimmt, haengt
 * an Rechtschreibung, Satzbau und Inhalt zugleich - das beurteilt eine
 * Lehrperson, nicht ein Vergleich mit einer Musterzeile. Die App quittiert
 * daher nur, dass der Auftrag erledigt ist, und meldet ihn im
 * Lehrkraft-Bereich als offen zur Korrektur.
 */
function bewerteHeft(antwort: Antwort, aufgabe: AufgabeHeft): GraderErgebnis {
  const bestaetigt = antwort.wert === 'erledigt'

  if (!bestaetigt) {
    return {
      bewertung: 'offen',
      punkte: 0,
      fehlerart: 'leer',
      rueckmeldung: 'Schreibe den Auftrag zuerst in dein Heft und setze dann das Häkchen.',
      nochmal: true,
      loesungZeigen: false,
    }
  }

  return {
    bewertung: 'offen',
    punkte: 0,
    fehlerart: 'keine',
    rueckmeldung:
      aufgabe.heft === 'vokabelheft'
        ? 'Erledigt. Deine Lehrerin oder dein Lehrer schaut sich dein Vokabelheft an.'
        : 'Erledigt. Diesen Auftrag korrigiert deine Lehrerin oder dein Lehrer im Heft – die App zeigt dir hier keine Lösung.',
    nochmal: false,
    loesungZeigen: false,
  }
}

// ---------------------------------------------------------------------------
// Grader-Objekte
// ---------------------------------------------------------------------------

export const auswahlGrader: Grader = {
  id: 'auswahl-deterministisch-v1',
  art: 'deterministisch',
  typ: 'auswahl',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'auswahl') {
      throw new Error(`auswahlGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteAuswahl(antwort, aufgabe, ctx))
  },
}

export const wahrheitGrader: Grader = {
  id: 'wahrheit-deterministisch-v1',
  art: 'deterministisch',
  typ: 'wahrheit',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'wahrheit') {
      throw new Error(`wahrheitGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteWahrheit(antwort, aufgabe, ctx))
  },
}

export const freitextGrader: Grader = {
  id: 'freitext-deterministisch-v1',
  art: 'deterministisch',
  typ: 'freitext',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'freitext') {
      throw new Error(`freitextGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteFreitext(antwort, aufgabe, ctx))
  },
}

export const lueckenGrader: Grader = {
  id: 'luecken-deterministisch-v1',
  art: 'deterministisch',
  typ: 'luecken',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'luecken') {
      throw new Error(`lueckenGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteLuecken(antwort, aufgabe, ctx))
  },
}

export const reihenfolgeGrader: Grader = {
  id: 'reihenfolge-deterministisch-v1',
  art: 'deterministisch',
  typ: 'reihenfolge',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'reihenfolge') {
      throw new Error(`reihenfolgeGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteReihenfolge(antwort, aufgabe, ctx))
  },
}

export const artikelGrader: Grader = {
  id: 'artikel-deterministisch-v1',
  art: 'deterministisch',
  typ: 'artikel',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'artikel') {
      throw new Error(`artikelGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteArtikel(antwort, aufgabe, ctx))
  },
}

export const mengeGrader: Grader = {
  id: 'menge-deterministisch-v1',
  art: 'deterministisch',
  typ: 'menge',
  bewerte: (antwort, aufgabe, ctx) => {
    if (aufgabe.typ !== 'menge') {
      throw new Error(`mengeGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteMenge(antwort, aufgabe, ctx))
  },
}

export const heftGrader: Grader = {
  // "keine-bewertung" statt einer Versionsnummer: Der Name soll im
  // Lehrkraft-Bereich sofort sagen, dass hier nichts automatisch bewertet wird.
  id: 'heft-keine-bewertung-v1',
  art: 'deterministisch',
  typ: 'heft',
  bewerte: (antwort, aufgabe) => {
    if (aufgabe.typ !== 'heft') {
      throw new Error(`heftGrader kann Aufgabe vom Typ "${aufgabe.typ}" nicht bewerten.`)
    }
    return Promise.resolve(bewerteHeft(antwort, aufgabe))
  },
}
