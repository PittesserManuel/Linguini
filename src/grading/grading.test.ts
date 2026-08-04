import { describe, expect, it } from 'vitest'
import type { AufgabenTyp, Aufgabe, AufgabeFreitext } from '@/content/types'
import { modulKlassenzimmer } from '@/content/modul-klassenzimmer'
import type { Antwort, GraderKontext } from './types'
import { damerauLevenshtein, schwelleFuer } from './distance'
import { faltUmlaute, istNomenGross, normalisiere, teileArtikelNomen } from './normalize'
import {
  artikelGrader,
  auswahlGrader,
  freitextGrader,
  lueckenGrader,
  reihenfolgeGrader,
  wahrheitGrader,
} from './graders'
import { bewerte, damerauLevenshtein as dlAusIndex, faltUmlaute as faltUmlauteAusIndex, graderFuer, istNomenGross as istNomenGrossAusIndex, normalisiere as normalisiereAusIndex, schwelleFuer as schwelleFuerAusIndex } from './index'

// ---------------------------------------------------------------------------
// Hilfsfunktionen fuer die Tests
// ---------------------------------------------------------------------------

function ctx(versuch: number, maxVersuche = 3): GraderKontext {
  return { versuch, maxVersuche, stufe: 'standard' }
}

/** Holt eine Aufgabe aus dem echten Modul und prueft ihren Typ zur Laufzeit. */
function holeAufgabe<T extends AufgabenTyp>(id: string, typ: T): Extract<Aufgabe, { typ: T }> {
  const gefunden = modulKlassenzimmer.aufgaben.find((a) => a.id === id)
  if (!gefunden || gefunden.typ !== typ) {
    throw new Error(`Aufgabe "${id}" mit Typ "${typ}" wurde im Testmodul nicht gefunden.`)
  }
  return gefunden as Extract<Aufgabe, { typ: T }>
}

const f1 = holeAufgabe('f1', 'auswahl') // Woher kommt Mala? -> o2
const f2 = holeAufgabe('f2', 'wahrheit') // w1 richtig, w2 falsch, w3 unbekannt
const f3 = holeAufgabe('f3', 'luecken') // Kleber, Schere
const f4 = holeAufgabe('f4', 'freitext') // der Radiergummi
const f5 = holeAufgabe('f5', 'reihenfolge') // s1..s5
const f6 = holeAufgabe('f6', 'artikel') // tafel, lineal, radiergummi, spitzer, schere, kleber, papierkorb
const f7 = holeAufgabe('f7', 'auswahl') // Warum sagt Mala nichts mehr? -> p2

/** Baut eine minimale freitext-Aufgabe fuer isolierte Tests (kein artikelPflicht-Rauschen). */
function baueFreitextAufgabe(teil: {
  akzeptiert: string[]
  artikelPflicht: boolean
  hilfen?: string[]
}): AufgabeFreitext {
  return {
    id: 'test-freitext',
    typ: 'freitext',
    frage: 'Testfrage',
    ebene: 'literal',
    abStufe: 'einfach',
    hilfen: teil.hilfen ?? ['Hilfe 1', 'Hilfe 2'],
    loesungserklaerung: 'Testerklaerung.',
    platzhalter: 'Antwort',
    akzeptiert: teil.akzeptiert,
    artikelPflicht: teil.artikelPflicht,
  }
}

// ---------------------------------------------------------------------------
// normalize.ts
// ---------------------------------------------------------------------------

describe('normalisiere', () => {
  it('bringt NFD-zerlegte Umlaute (macOS) auf NFC, sodass sie gegen die komponierte Form matchen', () => {
    const zerlegt = 'Schüler' // "Schu" + combining diaeresis + "ler"
    const komponiert = 'Schüler'
    expect(normalisiere(zerlegt)).toBe(normalisiere(komponiert))
    expect(normalisiere(zerlegt)).toBe('Schüler')
  })

  it('trimmt aeussere Leerzeichen', () => {
    expect(normalisiere('  Radiergummi  ')).toBe('Radiergummi')
  })

  it('reduziert Whitespace-Folgen (Tabs, doppelte Leerzeichen, Zeilenumbrueche) auf ein Leerzeichen', () => {
    expect(normalisiere('der   Radiergummi\t\tist\nklein')).toBe('der Radiergummi ist klein')
  })

  it('vereinheitlicht typografische Apostrophe', () => {
    expect(normalisiere('Nuri’s Heft')).toBe("Nuri's Heft")
  })

  it('entfernt Satzzeichen am Rand, auch wenn sie urspruenglich in Anfuehrungszeichen standen', () => {
    expect(normalisiere('„Hallo“')).toBe('Hallo')
    expect(normalisiere('Radiergummi.')).toBe('Radiergummi')
    expect(normalisiere('  Schere! ')).toBe('Schere')
  })

  it('laesst Satzzeichen in der Wortmitte unberuehrt', () => {
    expect(normalisiere('St. Pauli')).toBe('St. Pauli')
  })

  it('schreibt optional klein', () => {
    expect(normalisiere('Radiergummi', { kleinschreiben: true })).toBe('radiergummi')
  })

  it('faltet optional Umlaute im selben Aufruf', () => {
    expect(normalisiere('Füße', { kleinschreiben: true, umlauteFalten: true })).toBe('fuesse')
  })

  it('liefert bei reiner Leerzeichen-Eingabe einen leeren String', () => {
    expect(normalisiere('   ')).toBe('')
    expect(normalisiere('\t\n ')).toBe('')
  })
})

describe('faltUmlaute', () => {
  it('faltet alle vier deutschen Sonderzeichen in Kleinschreibung', () => {
    expect(faltUmlaute('äöüß')).toBe('aeoeuess')
  })

  it('faltet Grossbuchstaben-Umlaute', () => {
    expect(faltUmlaute('ÄÖÜ')).toBe('AeOeUe')
  })

  it('faltet "Füße" zu "Fuesse"', () => {
    expect(faltUmlaute('Füße')).toBe('Fuesse')
  })

  it('faltet "Straße" zu "Strasse"', () => {
    expect(faltUmlaute('Straße')).toBe('Strasse')
  })

  it('laesst Text ohne Umlaute unveraendert', () => {
    expect(faltUmlaute('Radiergummi')).toBe('Radiergummi')
  })
})

describe('istNomenGross', () => {
  it('erkennt grossgeschriebene Nomen', () => {
    expect(istNomenGross('Radiergummi')).toBe(true)
  })

  it('erkennt kleingeschriebene Nomen als nicht gross', () => {
    expect(istNomenGross('radiergummi')).toBe(false)
  })

  it('liefert false bei leerem String', () => {
    expect(istNomenGross('')).toBe(false)
  })

  it('ignoriert fuehrende Leerzeichen beim Pruefen', () => {
    expect(istNomenGross('  Radiergummi')).toBe(true)
  })
})

describe('teileArtikelNomen', () => {
  it('trennt einen einfachen bestimmten Artikel ab', () => {
    expect(teileArtikelNomen('der Radiergummi')).toEqual({ artikel: 'der', nomen: 'Radiergummi' })
  })

  it('trennt einen unbestimmten Artikel ab', () => {
    expect(teileArtikelNomen('eine Schere')).toEqual({ artikel: 'eine', nomen: 'Schere' })
  })

  it('schneidet eine fuehrende Praeposition ab und erkennt den Artikel danach', () => {
    expect(teileArtikelNomen('mit dem Radiergummi')).toEqual({ artikel: 'dem', nomen: 'Radiergummi' })
    expect(teileArtikelNomen('in der Schule')).toEqual({ artikel: 'der', nomen: 'Schule' })
  })

  it('liefert null als Artikel, wenn keiner erkannt wird', () => {
    expect(teileArtikelNomen('Radiergummi')).toEqual({ artikel: null, nomen: 'Radiergummi' })
  })

  it('liefert ein leeres Nomen bei leerem Text', () => {
    expect(teileArtikelNomen('')).toEqual({ artikel: null, nomen: '' })
  })
})

// ---------------------------------------------------------------------------
// distance.ts
// ---------------------------------------------------------------------------

describe('damerauLevenshtein', () => {
  it('liefert 0 fuer identische Woerter', () => {
    expect(damerauLevenshtein('Schere', 'Schere')).toBe(0)
  })

  it('zaehlt eine einzelne Ersetzung als Distanz 1', () => {
    expect(damerauLevenshtein('abc', 'abd')).toBe(1)
  })

  it('zaehlt ein einzelnes Einfuegen als Distanz 1', () => {
    expect(damerauLevenshtein('ab', 'abc')).toBe(1)
  })

  it('zaehlt ein einzelnes Loeschen als Distanz 1', () => {
    expect(damerauLevenshtein('abc', 'ab')).toBe(1)
  })

  it('zaehlt einen Buchstabendreher (Transposition) als EINE Operation, nicht zwei', () => {
    // Der haeufigste Kinder-Tippfehler. Plain-Levenshtein braeuchte hier 2
    // Operationen (loeschen + einfuegen); Damerau-Levenshtein genau 1.
    expect(damerauLevenshtein('ab', 'ba')).toBe(1)
    expect(damerauLevenshtein('schere', 'shcere')).toBe(1)
  })

  it('behandelt leere Strings korrekt', () => {
    expect(damerauLevenshtein('', '')).toBe(0)
    expect(damerauLevenshtein('', 'abc')).toBe(3)
    expect(damerauLevenshtein('abc', '')).toBe(3)
  })

  it('ist symmetrisch', () => {
    expect(damerauLevenshtein('Radiergummi', 'Radiergumi')).toBe(damerauLevenshtein('Radiergumi', 'Radiergummi'))
  })
})

describe('schwelleFuer', () => {
  it('ist 0 fuer Woerter mit bis zu drei Zeichen (der/die/das)', () => {
    expect(schwelleFuer(1)).toBe(0)
    expect(schwelleFuer(3)).toBe(0)
  })

  it('ist 1 fuer Woerter mit vier bis zehn Zeichen', () => {
    expect(schwelleFuer(4)).toBe(1)
    expect(schwelleFuer(6)).toBe(1)
    expect(schwelleFuer(7)).toBe(1)
    expect(schwelleFuer(10)).toBe(1)
  })

  it('ist 2 fuer Woerter mit elf oder mehr Zeichen', () => {
    expect(schwelleFuer(11)).toBe(2)
    expect(schwelleFuer(20)).toBe(2)
  })

  it('REGRESSIONSTEST: der/die/das duerfen sich bei Schwelle 0 niemals verwechseln', () => {
    // Die Artikel sind alle drei Zeichen lang -> Schwelle 0. Jede reale
    // Distanz zwischen ihnen liegt bei mindestens 1 und damit ausserhalb
    // der Schwelle - genau das verhindert die fatale Verwechslung.
    expect(schwelleFuer(3)).toBe(0)
    expect(damerauLevenshtein('der', 'die')).toBeGreaterThan(0)
    expect(damerauLevenshtein('der', 'das')).toBeGreaterThan(0)
    expect(damerauLevenshtein('die', 'das')).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// freitext-Grader
// ---------------------------------------------------------------------------

describe('freitextGrader', () => {
  it('akzeptiert die volle Musterloesung mit Artikel', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'der Radiergummi' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.fehlerart).toBe('keine')
    expect(ergebnis.punkte).toBe(1)
    expect(ergebnis.nochmal).toBe(false)
  })

  it('akzeptiert das blosse Nomen ohne Artikel (im Modul explizit erlaubt)', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'Radiergummi' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
  })

  it('akzeptiert die Praepositionalform aus dem Beispielsatz', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'mit dem Radiergummi' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
  })

  it('Grossschreibung: kleingeschriebenes Nomen bleibt richtig, aber mit Hinweis', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'radiergummi' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.fehlerart).toBe('grossschreibung')
    expect(ergebnis.rueckmeldung.toLowerCase()).toContain('gross')
  })

  it('Nomen richtig + Artikel falsch -> fast, Fehlerart genus', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'die Radiergummi' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('fast')
    expect(ergebnis.fehlerart).toBe('genus')
  })

  it('Nomen richtig + Artikel fehlt -> fast, Fehlerart genus, Hinweis auf fehlenden Artikel', async () => {
    // "Radiergummi" alleine ist im Modul als akzeptiert gelistet und daher
    // schon oben "richtig" - hier simulieren wir den Fall mit einem Wort,
    // das NICHT in der akzeptiert-Liste bare vorkommt.
    const aufgabe = baueFreitextAufgabe({ akzeptiert: ['der Kleber'], artikelPflicht: true })
    const ergebnis = await freitextGrader.bewerte({ wert: 'Kleber' }, aufgabe, ctx(1))
    expect(ergebnis.bewertung).toBe('fast')
    expect(ergebnis.fehlerart).toBe('genus')
    expect(ergebnis.rueckmeldung).toContain('Artikel')
  })

  it('Artikel richtig + Nomen falsch -> nicht richtig (Rechtschreibung oder Verstaendnis)', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'der Radiator' }, f4, ctx(1))
    expect(ergebnis.bewertung).not.toBe('richtig')
  })

  it('beides falsch -> falsch, Fehlerart verstaendnis', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: 'die Banane' }, f4, ctx(1))
    expect(ergebnis.bewertung).toBe('falsch')
    expect(ergebnis.fehlerart).toBe('verstaendnis')
  })

  it('leere Eingabe zaehlt nicht als Fehlversuch: nochmal bleibt true, auch am Versuchslimit', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: '' }, f4, ctx(3, 3))
    expect(ergebnis.fehlerart).toBe('leer')
    expect(ergebnis.nochmal).toBe(true)
    expect(ergebnis.loesungZeigen).toBe(false)
  })

  it('nur Leerzeichen wird wie leere Eingabe behandelt', async () => {
    const ergebnis = await freitextGrader.bewerte({ wert: '   ' }, f4, ctx(1))
    expect(ergebnis.fehlerart).toBe('leer')
  })

  it('NFC/NFD: eine NFD-zerlegte Eingabe matcht die NFC-Musterloesung', async () => {
    const aufgabe = baueFreitextAufgabe({ akzeptiert: ['Schüler'], artikelPflicht: false })
    const ergebnis = await freitextGrader.bewerte({ wert: 'Schüler' }, aufgabe, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
  })

  it('Umlaut-Faltung: "strasse" wird gegen "Straße" akzeptiert', async () => {
    const aufgabe = baueFreitextAufgabe({ akzeptiert: ['Straße'], artikelPflicht: false })
    const ergebnis = await freitextGrader.bewerte({ wert: 'strasse' }, aufgabe, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
  })

  it('Umlaut-Faltung: "Fuesse" wird gegen "Füße" akzeptiert', async () => {
    const aufgabe = baueFreitextAufgabe({ akzeptiert: ['Füße'], artikelPflicht: false })
    const ergebnis = await freitextGrader.bewerte({ wert: 'Fuesse' }, aufgabe, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
  })

  describe('"Schere"-Testreihe (Rechtschreib-Toleranz, ohne Artikel-Rauschen)', () => {
    const aufgabe = baueFreitextAufgabe({ akzeptiert: ['Schere'], artikelPflicht: false })

    it('akzeptiert "Schere " mit Leerzeichen als richtig', async () => {
      const ergebnis = await freitextGrader.bewerte({ wert: 'Schere ' }, aufgabe, ctx(1))
      expect(ergebnis.bewertung).toBe('richtig')
    })

    it('akzeptiert "schere" kleingeschrieben als richtig', async () => {
      const ergebnis = await freitextGrader.bewerte({ wert: 'schere' }, aufgabe, ctx(1))
      expect(ergebnis.bewertung).toBe('richtig')
    })

    it('akzeptiert "Scheere" (doppeltes e - typischer Tippfehler) als fast', async () => {
      const ergebnis = await freitextGrader.bewerte({ wert: 'Scheere' }, aufgabe, ctx(1))
      expect(ergebnis.bewertung).toBe('fast')
      expect(ergebnis.fehlerart).toBe('rechtschreibung')
    })

    it('lehnt "Schwere" ab - trotz Editierdistanz 1 ein anderes echtes Wort, kein Tippfehler', async () => {
      const ergebnis = await freitextGrader.bewerte({ wert: 'Schwere' }, aufgabe, ctx(1))
      expect(ergebnis.bewertung).toBe('falsch')
      expect(ergebnis.fehlerart).toBe('verstaendnis')
    })
  })
})

// ---------------------------------------------------------------------------
// luecken-Grader
// ---------------------------------------------------------------------------

describe('lueckenGrader', () => {
  it('bewertet beide Luecken richtig', async () => {
    const ergebnis = await lueckenGrader.bewerte({ werte: ['Kleber', 'Schere'] }, f3, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.punkte).toBe(1)
    expect(ergebnis.teile).toHaveLength(2)
    expect(ergebnis.teile?.every((t) => t.bewertung === 'richtig')).toBe(true)
  })

  it('erkennt ein anderes Wortbank-Wort als Verwechslung (Fehlerart wortwahl)', async () => {
    const ergebnis = await lueckenGrader.bewerte({ werte: ['Spitzer', 'Schere'] }, f3, ctx(1))
    expect(ergebnis.punkte).toBe(0.5)
    expect(ergebnis.bewertung).toBe('fast')
    expect(ergebnis.teile?.[0]?.fehlerart).toBe('wortwahl')
    // Die Rueckmeldung darf die Loesung nicht verraten.
    expect(ergebnis.teile?.[0]?.rueckmeldung.toLowerCase()).not.toContain('kleber')
  })

  it('behandelt eine leere Luecke als Fehlerart leer, nicht als wortwahl oder verstaendnis', async () => {
    const ergebnis = await lueckenGrader.bewerte({ werte: ['', 'Schere'] }, f3, ctx(1))
    expect(ergebnis.teile?.[0]?.fehlerart).toBe('leer')
    expect(ergebnis.punkte).toBe(0.5)
  })

  it('toleriert eine kleine Verschreibung innerhalb der Schwelle', async () => {
    const ergebnis = await lueckenGrader.bewerte({ werte: ['Kleeber', 'Schere'] }, f3, ctx(1))
    expect(ergebnis.teile?.[0]?.bewertung).toBe('fast')
    expect(ergebnis.teile?.[0]?.fehlerart).toBe('rechtschreibung')
  })

  it('bewertet komplett falsche Woerter (beide aus der Wortbank, aber falsch) als falsch', async () => {
    const ergebnis = await lueckenGrader.bewerte({ werte: ['Tafel', 'Lineal'] }, f3, ctx(1))
    expect(ergebnis.bewertung).toBe('falsch')
    expect(ergebnis.punkte).toBe(0)
    expect(ergebnis.fehlerart).toBe('wortwahl')
  })
})

// ---------------------------------------------------------------------------
// wahrheit-Grader
// ---------------------------------------------------------------------------

describe('wahrheitGrader', () => {
  it('bewertet alle drei Aussagen richtig zugeordnet als richtig', async () => {
    const ergebnis = await wahrheitGrader.bewerte(
      { zuordnung: { w1: 'richtig', w2: 'falsch', w3: 'unbekannt' } },
      f2,
      ctx(1),
    )
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.punkte).toBe(1)
  })

  it('zeigt die Begruendung NICHT vor dem Versuchslimit', async () => {
    const ergebnis = await wahrheitGrader.bewerte({ zuordnung: { w1: 'falsch' } }, f2, ctx(1, 3))
    for (const teil of ergebnis.teile ?? []) {
      expect(teil.rueckmeldung).not.toBe(
        f2.aussagen.find((a) => a.id === teil.id)?.begruendung,
      )
    }
  })

  it('zeigt die Begruendung ERST am Versuchslimit', async () => {
    const ergebnis = await wahrheitGrader.bewerte({ zuordnung: { w1: 'falsch' } }, f2, ctx(3, 3))
    expect(ergebnis.loesungZeigen).toBe(true)
    for (const aussage of f2.aussagen) {
      const teil = ergebnis.teile?.find((t) => t.id === aussage.id)
      expect(teil?.rueckmeldung).toBe(aussage.begruendung)
    }
  })

  it('markiert eine unbeantwortete Aussage mit Fehlerart leer', async () => {
    const ergebnis = await wahrheitGrader.bewerte({ zuordnung: { w1: 'richtig' } }, f2, ctx(1))
    const teilW2 = ergebnis.teile?.find((t) => t.id === 'w2')
    expect(teilW2?.fehlerart).toBe('leer')
  })

  it('bewertet eine teilweise richtige Zuordnung als fast', async () => {
    const ergebnis = await wahrheitGrader.bewerte(
      { zuordnung: { w1: 'richtig', w2: 'richtig', w3: 'unbekannt' } },
      f2,
      ctx(1),
    )
    expect(ergebnis.bewertung).toBe('fast')
    expect(ergebnis.punkte).toBeCloseTo(2 / 3)
  })
})

// ---------------------------------------------------------------------------
// reihenfolge-Grader
// ---------------------------------------------------------------------------

describe('reihenfolgeGrader', () => {
  const korrekt = f5.schritte.map((s) => s.id)

  it('bewertet die komplett korrekte Reihenfolge als richtig', async () => {
    const ergebnis = await reihenfolgeGrader.bewerte({ werte: korrekt }, f5, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.punkte).toBe(1)
  })

  it('bewertet eine teilweise richtige Reihenfolge (vertauschte Nachbarn) als fast/teilweise', async () => {
    const vertauscht = [korrekt[1]!, korrekt[0]!, korrekt[2]!, korrekt[3]!, korrekt[4]!]
    const ergebnis = await reihenfolgeGrader.bewerte({ werte: vertauscht }, f5, ctx(1))
    expect(ergebnis.bewertung).toBe('fast')
    expect(ergebnis.fehlerart).toBe('teilweise')
    expect(ergebnis.punkte).toBeCloseTo(3 / 5)
  })

  it('bewertet eine komplett verdrehte Reihenfolge (zyklische Verschiebung, 0 Treffer) als falsch', async () => {
    const komplettVerdreht = [korrekt[1]!, korrekt[2]!, korrekt[3]!, korrekt[4]!, korrekt[0]!]
    const ergebnis = await reihenfolgeGrader.bewerte({ werte: komplettVerdreht }, f5, ctx(1))
    expect(ergebnis.punkte).toBe(0)
    expect(ergebnis.bewertung).toBe('falsch')
  })

  it('gibt bei Teiltreffern einen Hinweis auf das erste Element, ohne die ganze Loesung zu verraten', async () => {
    const vertauscht = [korrekt[1]!, korrekt[0]!, korrekt[2]!, korrekt[3]!, korrekt[4]!]
    const ergebnis = await reihenfolgeGrader.bewerte({ werte: vertauscht }, f5, ctx(1))
    expect(ergebnis.rueckmeldung).toContain(f5.schritte[0]!.text)
    expect(ergebnis.rueckmeldung).not.toContain(f5.schritte[4]!.text)
  })
})

// ---------------------------------------------------------------------------
// artikel-Grader
// ---------------------------------------------------------------------------

describe('artikelGrader', () => {
  it('bewertet eine vollstaendig korrekte Zuordnung als richtig', async () => {
    const zuordnung = Object.fromEntries(
      f6.woerter.map((id) => {
        const wort = modulKlassenzimmer.wortschatz.find((w) => w.id === id)
        return [id, wort?.genus ?? '']
      }),
    )
    const ergebnis = await artikelGrader.bewerte({ zuordnung }, f6, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.punkte).toBe(1)
  })

  it('REGRESSIONSTEST: ein der-Wort akzeptiert niemals die/das als richtig', async () => {
    // "radiergummi" hat Genus "der".
    const ergebnis = await artikelGrader.bewerte({ zuordnung: { radiergummi: 'die' } }, f6, ctx(1))
    const teil = ergebnis.teile?.find((t) => t.id === 'radiergummi')
    expect(teil?.bewertung).not.toBe('richtig')
    expect(teil?.fehlerart).toBe('genus')
  })

  it('markiert eine falsche Genus-Zuordnung mit Fehlerart genus', async () => {
    const ergebnis = await artikelGrader.bewerte({ zuordnung: { tafel: 'der' } }, f6, ctx(1))
    const teil = ergebnis.teile?.find((t) => t.id === 'tafel')
    expect(teil?.bewertung).toBe('falsch')
    expect(teil?.fehlerart).toBe('genus')
  })

  it('bewertet eine komplett falsche Zuordnung als falsch', async () => {
    const zuordnung = Object.fromEntries(f6.woerter.map((id) => [id, 'die'] as const))
    // "die" ist nicht fuer alle Woerter korrekt (radiergummi, spitzer, kleber, papierkorb sind "der").
    const ergebnis = await artikelGrader.bewerte({ zuordnung }, f6, ctx(1))
    expect(ergebnis.bewertung).not.toBe('richtig')
    expect(ergebnis.fehlerart).toBe('genus')
  })
})

// ---------------------------------------------------------------------------
// auswahl-Grader
// ---------------------------------------------------------------------------

describe('auswahlGrader', () => {
  it('bewertet die korrekte Option als richtig', async () => {
    const ergebnis = await auswahlGrader.bewerte({ wert: 'o2' }, f1, ctx(1))
    expect(ergebnis.bewertung).toBe('richtig')
    expect(ergebnis.punkte).toBe(1)
  })

  it('bewertet eine falsche Option als falsch mit Fehlerart verstaendnis', async () => {
    const ergebnis = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(1))
    expect(ergebnis.bewertung).toBe('falsch')
    expect(ergebnis.fehlerart).toBe('verstaendnis')
  })

  it('behandelt eine fehlende Auswahl als Fehlerart leer', async () => {
    const ergebnis = await auswahlGrader.bewerte({}, f1, ctx(1))
    expect(ergebnis.fehlerart).toBe('leer')
  })

  it('funktioniert auch fuer die inferentielle Auswahl-Aufgabe (f7)', async () => {
    const richtig = await auswahlGrader.bewerte({ wert: 'p2' }, f7, ctx(1))
    const falsch = await auswahlGrader.bewerte({ wert: 'p1' }, f7, ctx(1))
    expect(richtig.bewertung).toBe('richtig')
    expect(falsch.bewertung).toBe('falsch')
  })
})

// ---------------------------------------------------------------------------
// Versuchslogik (gilt fuer alle Grader gleich)
// ---------------------------------------------------------------------------

describe('Versuchslogik', () => {
  it('gibt bei Versuch 1 die erste Hilfe (hilfen[0]) und erlaubt einen weiteren Versuch', async () => {
    const ergebnis = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(1, 3))
    expect(ergebnis.nochmal).toBe(true)
    expect(ergebnis.loesungZeigen).toBe(false)
    expect(ergebnis.hinweis).toBe(f1.hilfen[0])
  })

  it('gibt bei Versuch 2 die zweite Hilfe (hilfen[1]) - Hilfen kommen in der richtigen Reihenfolge', async () => {
    const ergebnis = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(2, 3))
    expect(ergebnis.nochmal).toBe(true)
    expect(ergebnis.hinweis).toBe(f1.hilfen[1])
    expect(ergebnis.hinweis).not.toBe(f1.hilfen[0])
  })

  it('deckt die Loesung erst auf, wenn das Versuchslimit erreicht ist - nicht frueher', async () => {
    const nochNicht = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(2, 3))
    expect(nochNicht.loesungZeigen).toBe(false)

    const jetzt = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(3, 3))
    expect(jetzt.loesungZeigen).toBe(true)
    expect(jetzt.nochmal).toBe(false)
  })

  it('bei richtiger Antwort ist nochmal immer false, unabhaengig vom Versuchsstand', async () => {
    const versuch1 = await auswahlGrader.bewerte({ wert: 'o2' }, f1, ctx(1, 3))
    const versuch3 = await auswahlGrader.bewerte({ wert: 'o2' }, f1, ctx(3, 3))
    expect(versuch1.nochmal).toBe(false)
    expect(versuch3.nochmal).toBe(false)
    // Richtig gewertet -> keine Aufloesung noetig, selbst am Versuchslimit.
    expect(versuch3.loesungZeigen).toBe(false)
  })

  it('die Rueckmeldung enthaelt beim Aufdecken die Loesungserklaerung', async () => {
    const ergebnis = await auswahlGrader.bewerte({ wert: 'o1' }, f1, ctx(3, 3))
    expect(ergebnis.rueckmeldung).toContain(f1.loesungserklaerung)
  })

  it('funktioniert konsistent ueber alle sechs Aufgabentypen (kein Fehlversuch stuerzt ab)', async () => {
    const faelle: { aufgabe: Aufgabe; antwort: Antwort }[] = [
      { aufgabe: f1, antwort: { wert: 'o1' } },
      { aufgabe: f2, antwort: { zuordnung: { w1: 'falsch' } } },
      { aufgabe: f3, antwort: { werte: ['Tafel', 'Lineal'] } },
      { aufgabe: f4, antwort: { wert: 'die Banane' } },
      { aufgabe: f5, antwort: { werte: [] } },
      { aufgabe: f6, antwort: { zuordnung: {} } },
    ]

    for (const fall of faelle) {
      const ergebnis = await bewerte(fall.antwort, fall.aufgabe, ctx(1, 3))
      expect(['richtig', 'fast', 'falsch']).toContain(ergebnis.bewertung)
      expect(typeof ergebnis.rueckmeldung).toBe('string')
      expect(ergebnis.rueckmeldung.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// index.ts - der oeffentliche Vertrag
// ---------------------------------------------------------------------------

describe('graderFuer', () => {
  it('liefert fuer jeden Aufgabentyp einen Grader mit passendem typ-Feld', () => {
    const typen: AufgabenTyp[] = ['auswahl', 'wahrheit', 'freitext', 'luecken', 'reihenfolge', 'artikel']
    for (const typ of typen) {
      const grader = graderFuer(typ)
      expect(grader.typ).toBe(typ)
      expect(grader.art).toBe('deterministisch')
      expect(typeof grader.id).toBe('string')
    }
  })
})

describe('bewerte (oeffentlicher Einstiegspunkt)', () => {
  it('delegiert an den passenden Grader und liefert ein vollstaendiges GraderErgebnis', async () => {
    const ergebnis = await bewerte({ wert: 'o2' }, f1, ctx(1))
    expect(ergebnis).toMatchObject({ bewertung: 'richtig', punkte: 1, fehlerart: 'keine', nochmal: false })
  })

  it('bewertet eine freitext-Aufgabe genauso wie der direkte freitextGrader-Aufruf', async () => {
    const ueberIndex = await bewerte({ wert: 'der Radiergummi' }, f4, ctx(1))
    const direkt = await freitextGrader.bewerte({ wert: 'der Radiergummi' }, f4, ctx(1))
    expect(ueberIndex).toEqual(direkt)
  })
})

describe('Re-Exports aus index.ts (Pflicht-Export fuer andere Agenten)', () => {
  it('exportiert normalisiere, faltUmlaute, istNomenGross identisch zu normalize.ts', () => {
    expect(normalisiereAusIndex('  Test  ')).toBe(normalisiere('  Test  '))
    expect(faltUmlauteAusIndex('Füße')).toBe(faltUmlaute('Füße'))
    expect(istNomenGrossAusIndex('Radiergummi')).toBe(istNomenGross('Radiergummi'))
  })

  it('exportiert damerauLevenshtein und schwelleFuer identisch zu distance.ts', () => {
    expect(dlAusIndex('Schere', 'Scheere')).toBe(damerauLevenshtein('Schere', 'Scheere'))
    expect(schwelleFuerAusIndex(6)).toBe(schwelleFuer(6))
  })
})
