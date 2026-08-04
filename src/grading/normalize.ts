/**
 * Normalisierung von Kind-Eingaben.
 *
 * Kinder tippen auf Tablets, oft mit Autokorrektur, manchmal ueber Diktat.
 * Diese Funktionen bringen Eingabe UND Erwartung auf eine vergleichbare Form,
 * BEVOR irgendein Vergleich stattfindet. Reihenfolge der Schritte ist bewusst
 * fixiert (siehe normalisiere) - eine andere Reihenfolge erzeugt neue Randfaelle.
 */

// ---------------------------------------------------------------------------
// normalisiere
// ---------------------------------------------------------------------------

/**
 * Vereinheitlicht typografische Anfuehrungszeichen und Apostrophe auf die
 * einfachen ASCII-Formen. macOS/iOS-Tastaturen liefern gern "kurvige" Varianten.
 */
function vereinheitlicheAnfuehrungszeichen(text: string): string {
  return text.replace(/[‘’‚‛′]/g, "'").replace(/[“”„‟″]/g, '"')
}

/**
 * Entfernt Satzzeichen am Rand (Anfang und Ende), nicht in der Mitte -
 * "Radiergummi." wird zu "Radiergummi", aber "St. Pauli" bleibt unberuehrt.
 */
function entferneRandzeichen(text: string): string {
  // \p{P} = Unicode-Kategorie "Punctuation" (Satzzeichen jeder Art)
  return text.replace(/^[\s\p{P}]+/gu, '').replace(/[\s\p{P}]+$/gu, '')
}

/**
 * Bringt eine Eingabe in eine fuer den Vergleich stabile Form.
 *
 * Schritte, IN DIESER REIHENFOLGE:
 * 1. Unicode NFC (macOS liefert oft NFD-zerlegte Umlaute - ohne diesen
 *    Schritt matcht 'a' + Combining-Diaeresis nie gegen ein vorkomponiertes 'ä').
 * 2. trimmen (aeussere Leerzeichen weg).
 * 3. alle Whitespace-Folgen (Tabs, doppelte Leerzeichen, Zeilenumbrueche) auf
 *    genau ein Leerzeichen reduzieren.
 * 4. typografische Anfuehrungszeichen/Apostrophe vereinheitlichen.
 * 5. Satzzeichen am Rand entfernen (Punkt, Komma, etc. - Kinder tippen oft
 *    einen Schlusspunkt mit).
 * 6. optional: kleinschreiben.
 * 7. optional: Umlaute falten (ae/oe/ue/ss statt ä/ö/ü/ß).
 */
export function normalisiere(
  text: string,
  opt?: { kleinschreiben?: boolean; umlauteFalten?: boolean },
): string {
  let ergebnis = text.normalize('NFC')
  ergebnis = ergebnis.trim()
  ergebnis = ergebnis.replace(/\s+/g, ' ')
  ergebnis = vereinheitlicheAnfuehrungszeichen(ergebnis)
  ergebnis = entferneRandzeichen(ergebnis)

  if (opt?.kleinschreiben) {
    ergebnis = ergebnis.toLocaleLowerCase('de-DE')
  }
  if (opt?.umlauteFalten) {
    ergebnis = faltUmlaute(ergebnis)
  }

  return ergebnis
}

// ---------------------------------------------------------------------------
// faltUmlaute
// ---------------------------------------------------------------------------

const UMLAUT_TABELLE: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
  // Grossbuchstaben-ss gibt es im Deutschen praktisch nie am Wortanfang,
  // wird hier aber der Vollstaendigkeit halber wie Kleinschreibung behandelt.
}

/**
 * Faltet deutsche Umlaute und scharfes S auf ihre ASCII-Ersatzschreibung.
 * Notwendig, weil viele DaZ-Kinder auf Tastaturen ohne Umlauttasten schreiben
 * (Handy-Standardlayout, Schulrechner mit englischem Layout).
 */
export function faltUmlaute(text: string): string {
  return text.replace(/[äöüßÄÖÜ]/g, (zeichen) => UMLAUT_TABELLE[zeichen] ?? zeichen)
}

// ---------------------------------------------------------------------------
// istNomenGross
// ---------------------------------------------------------------------------

/** Prueft, ob das erste Wort des (bereits getrimmten) Texts grossgeschrieben beginnt. */
export function istNomenGross(text: string): boolean {
  const getrimmt = text.trim()
  if (getrimmt.length === 0) return false
  const ersterBuchstabe = getrimmt[0] as string
  return ersterBuchstabe === ersterBuchstabe.toLocaleUpperCase('de-DE') && ersterBuchstabe !== ersterBuchstabe.toLocaleLowerCase('de-DE')
}

// ---------------------------------------------------------------------------
// teileArtikelNomen
// ---------------------------------------------------------------------------

/** Bestimmte und unbestimmte Artikel in allen vier Faellen. */
const ARTIKEL = ['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'eines', 'einer']

/**
 * Praepositionen, die Kinder aus dem Beispielsatz mit abschreiben
 * ("mit dem Radiergummi" statt "der Radiergummi"). Werden VOR dem Artikel
 * abgeschnitten, damit teileArtikelNomen() danach den Artikel normal erkennt.
 */
const PRAEPOSITIONEN = ['mit', 'in', 'an', 'auf', 'für', 'fuer', 'aus', 'von', 'zu', 'bei', 'durch', 'ohne', 'um']

/**
 * Zerlegt eine Eingabe in fuehrenden Artikel und Nomen.
 * Erkennt auch Praepositionalphrasen ("mit dem Radiergummi" -> Praeposition
 * "mit" wird verworfen, "dem" bleibt als Artikel erhalten, Rest ist das Nomen).
 * Gibt `artikel: null` zurueck, wenn kein bekannter Artikel am Anfang steht.
 */
export function teileArtikelNomen(text: string): { artikel: string | null; nomen: string } {
  const woerter = normalisiere(text).split(' ').filter((w) => w.length > 0)

  if (woerter.length === 0) {
    return { artikel: null, nomen: '' }
  }

  let index = 0

  // Fuehrende Praeposition abschneiden (case-insensitive Vergleich).
  const erstesWortKlein = woerter[0]!.toLocaleLowerCase('de-DE')
  if (PRAEPOSITIONEN.includes(erstesWortKlein) && woerter.length > 1) {
    index = 1
  }

  const kandidatKlein = woerter[index]?.toLocaleLowerCase('de-DE')
  if (kandidatKlein !== undefined && ARTIKEL.includes(kandidatKlein)) {
    const artikel = woerter[index] as string
    const nomen = woerter.slice(index + 1).join(' ')
    return { artikel, nomen }
  }

  // Kein Artikel erkannt: alles ab der urspruenglichen Position (ohne
  // abgeschnittene Praeposition) ist das Nomen.
  return { artikel: null, nomen: woerter.slice(index).join(' ') }
}
