/**
 * Editierdistanz fuer die Rechtschreibpruefung im Freitext-Grader.
 *
 * Warum Damerau-Levenshtein und nicht einfaches Levenshtein: Der haeufigste
 * Tippfehler bei Kindern ist der Buchstabendreher (Transposition), z. B.
 * "Shcere" statt "Schere". Reines Levenshtein zaehlt das als zwei Operationen
 * (loeschen + einfuegen), Damerau-Levenshtein als eine - naeher am
 * tatsaechlichen Fehlerbild.
 */

/**
 * Echte Damerau-Levenshtein-Distanz (mit Transposition benachbarter Zeichen),
 * iterativ berechnet (dynamische Programmierung), keine Rekursion - haelt den
 * Speicher- und Zeitbedarf bei den kurzen Woertern dieser Plattform trivial,
 * bleibt aber auch fuer laengere Eingaben unproblematisch (O(n*m)).
 */
export function damerauLevenshtein(a: string, b: string): number {
  const n = a.length
  const m = b.length

  if (n === 0) return m
  if (m === 0) return n

  // d[i][j] = Distanz zwischen den ersten i Zeichen von a und den ersten j Zeichen von b.
  const d: number[][] = []
  for (let i = 0; i <= n; i++) {
    d.push(new Array<number>(m + 1).fill(0))
  }
  for (let i = 0; i <= n; i++) d[i]![0] = i
  for (let j = 0; j <= m; j++) d[0]![j] = j

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1

      const loeschen = d[i - 1]![j]! + 1
      const einfuegen = d[i]![j - 1]! + 1
      const ersetzen = d[i - 1]![j - 1]! + kosten
      let wert = Math.min(loeschen, einfuegen, ersetzen)

      // Transposition: die zwei letzten Zeichen beider Woerter sind vertauscht.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        const transposition = d[i - 2]![j - 2]! + 1
        wert = Math.min(wert, transposition)
      }

      d[i]![j] = wert
    }
  }

  return d[n]![m]!
}

/**
 * Konservative Fehlertoleranz nach Wortlaenge. Absichtlich streng bei kurzen
 * Woertern: Bei drei Zeichen wuerde Distanz 1 sonst "der" mit "die" oder
 * "das" verwechseln - fachlich fatal, weil Genus dann faelschlich als
 * "fast richtig" durchgehen wuerde. Lieber ein "fast" zu wenig als ein
 * falsches "richtig".
 */
export function schwelleFuer(wortlaenge: number): number {
  if (wortlaenge <= 3) return 0
  if (wortlaenge <= 6) return 1
  if (wortlaenge <= 10) return 1
  return 2
}
