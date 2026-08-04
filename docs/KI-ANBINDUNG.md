# Wo die KI später andockt

Die Korrektur in dieser Demo ist vollständig deterministisch. Dieses Dokument
beschreibt, wie eine KI-gestützte Bewertung ergänzt würde — und, genauso wichtig,
**was bewusst deterministisch bleiben sollte**.

Der Umbau ist bereits vorbereitet: `src/grading/ki-grader.ts` implementiert das
`Grader`-Interface und lässt sich einsetzen, ohne dass eine einzige
UI-Komponente angefasst wird.

---

## 1. Was zur KI gehört — und was nicht

Das ist keine technische, sondern eine fachliche Entscheidung.

| Aufgabentyp | Bewertung | Warum |
|---|---|---|
| Auswahl, Richtig/Falsch, Reihenfolge | **deterministisch** | Es gibt genau eine richtige Antwort. Eine KI würde hier nichts hinzufügen und nur Kosten, Latenz und Unsicherheit erzeugen. |
| Artikelzuordnung (der/die/das) | **deterministisch** | Das Genus ist ein Faktum, kein Ermessen. Und es ist der Wert, auf dem die gesamte Fehlerdiagnostik für die Lehrkraft aufbaut. |
| Lückentext mit Wortbank | **deterministisch** | Die Wortbank ist endlich. Fuzzy-Matching deckt Tippfehler ab. |
| Kurze Freitextantwort | **hybrid** | Deterministisch zuerst. Nur wenn das Ergebnis „falsch" lautet, lohnt eine zweite Meinung — vielleicht war die Antwort sinngemäß richtig, nur anders formuliert. |
| Freie Schreibaufgaben, Begründungen, eigene Nacherzählung | **KI** | Hier gibt es keine Musterlösung. Genau das kann eine Regel nicht leisten — und genau deshalb fehlen solche Aufgaben in dieser Demo noch. |

Der Grund für diese Zurückhaltung steht in der Marktrecherche: **Lehrkräfte
misstrauen undurchsichtigen KI-Urteilen bei Sprachlernenden.** Eine Lehrkraft
muss einem Kind — und dessen Eltern — erklären können, warum eine Antwort als
falsch gewertet wurde. „Das Modell hat es so eingeschätzt" ist keine Erklärung.
Bei `der/die/das` ist Nachvollziehbarkeit wichtiger als Sprachgefühl.

---

## 2. Der Umbau im Code

Eine Zeile:

```ts
import { hybrideAuswahl } from '@/grading/ki-grader'

// vorher: graderFuer(aufgabe.typ)
// nachher:
const graderWaehlen = hybrideAuswahl(['freitext'], { endpunkt: '/api/bewerte' })
```

Alles andere bleibt unverändert. Der Grund, warum das funktioniert: `bewerte()`
ist von Anfang an `async`. Deterministisch lösen wir sofort auf
(`Promise.resolve`), aber jeder Aufrufer ist damit auf einen Netzwerk-Grader
vorbereitet. Ein späterer Umbau von synchron auf asynchron wäre ein Umbau durch
die gesamte Komponentenschicht gewesen.

---

## 3. Der Server-Endpunkt

**Der API-Schlüssel darf niemals in den Browser.** Alles im Frontend-Bundle ist
öffentlich lesbar — auch Werte aus `.env`, weil Vite sie beim Build einsetzt.
Der `KiGrader` spricht deshalb ausschließlich mit einem eigenen Endpunkt.

```ts
// api/bewerte.ts — serverseitig, z. B. als Vercel Function
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // liest ANTHROPIC_API_KEY aus der Serverumgebung

const SCHEMA = {
  type: 'object',
  properties: {
    bewertung: { type: 'string', enum: ['richtig', 'fast', 'falsch'] },
    punkte: { type: 'number' },
    fehlerart: {
      type: 'string',
      enum: ['keine', 'rechtschreibung', 'genus', 'grossschreibung',
             'wortwahl', 'verstaendnis', 'teilweise', 'leer'],
    },
    rueckmeldung: { type: 'string' },
    hinweis: { type: 'string' },
  },
  required: ['bewertung', 'punkte', 'fehlerart', 'rueckmeldung'],
  additionalProperties: false,
} as const

const SYSTEM = `Du bewertest Antworten von Kindern (9-11 Jahre), die Deutsch als
Zweitsprache lernen, Niveau A2.

Regeln, die nicht verhandelbar sind:
- Die Rückmeldung ist auf Deutsch, in höchstens zwei kurzen Sätzen.
- Sie bezieht sich auf die AUFGABE, nie auf das Kind. Niemals "du machst Fehler".
- Ein sinngemäß richtiges Wort in anderer Formulierung ist "richtig".
- Ein richtiges Wort mit falschem Artikel ist "fast", fehlerart "genus".
- Ein richtiges Wort mit Schreibfehler ist "fast", fehlerart "rechtschreibung".
- Kleinschreibung eines Nomens ist NIE "falsch". Sie ist "richtig" mit
  fehlerart "grossschreibung" und einem freundlichen Hinweis.
- Verrate die Lösung nicht. Gib einen Hinweis, der zum Nachdenken führt.`

export async function POST(req: Request) {
  const { aufgabeId, antwort, versuch } = await req.json()
  const aufgabe = ladeAufgabe(aufgabeId) // serverseitig, nicht vom Client

  const antwortModell = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: SCHEMA },
    },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `Aufgabe: ${aufgabe.frage}
Erwartet: ${aufgabe.akzeptiert.join(' | ')}
Antwort des Kindes: ${antwort.wert}
Versuch: ${versuch}`,
    }],
  })

  if (antwortModell.stop_reason === 'refusal') {
    return new Response(null, { status: 502 }) // Client fällt deterministisch zurück
  }

  const block = antwortModell.content.find((b) => b.type === 'text')
  return Response.json(JSON.parse(block.text))
}
```

Anmerkungen zu den Parametern:

- **`effort: 'low'`** — die Aufgabe ist eine kurze, klar umrissene Einordnung.
  Niedriger Aufwand ist hier nicht nur billiger, sondern auch schneller, und ein
  Kind wartet vor dem Bildschirm.
- **`thinking: { type: 'adaptive' }`** — bewusst nicht abgeschaltet. Das Denken
  ganz auszuschalten und dafür den Aufwand niedrig zu setzen ist der robustere
  Weg.
- **Kein `temperature`** — auf Opus 5 nicht mehr verfügbar. Für eine Bewertung
  wäre Zufallsstreuung ohnehin das Letzte, was man will.
- **`cache_control` auf dem Systemprompt** — der ist bei jedem Aufruf identisch.
  Ab 512 Token zahlt sich das Caching aus.
- **`stop_reason === 'refusal'`** — muss geprüft werden, bevor auf `content`
  zugegriffen wird. Der `KiGrader` fällt bei jedem Fehler still auf die
  deterministische Bewertung zurück; das Kind merkt nichts davon.

---

## 4. Der Datenschutz-Vorbehalt

Das ist der Punkt, an dem ein Schulprojekt scheitern kann, und er hat nichts mit
Technik zu tun.

Sobald Freitextantworten von Kindern an eine externe Schnittstelle gehen, ist
das eine **Auftragsverarbeitung personenbezogener Daten**. Der heutige Zustand
der Demo — keine Übertragung, kein Konto, keine Cookies — ist genau deshalb ein
Verkaufsargument: Eine Schule kann sie ohne Auftragsverarbeitungsvertrag und
ohne Elterneinwilligung einsetzen. Bei einer Zielgruppe unter 16 Jahren ist das
der Unterschied zwischen „heute ausprobieren" und „in drei Monaten vielleicht".

Wer die KI-Bewertung einschaltet, braucht:

1. einen Auftragsverarbeitungsvertrag mit dem Anbieter,
2. eine Information an die Eltern und, je nach Land und Alter, deren Einwilligung,
3. eine Datenschutz-Folgenabschätzung, weil es um Minderjährige geht,
4. eine Aufnahme in das Verzeichnis von Verarbeitungstätigkeiten der Schule.

Praktische Konsequenz für das Produkt: **Die KI-Bewertung gehört hinter einen
Schalter, der standardmäßig aus ist.** Nicht als Feigheit, sondern damit die
Plattform in jeder Schule sofort einsetzbar bleibt und die KI dort zugeschaltet
wird, wo die Formalitäten geklärt sind.

Technisch lässt sich die Datenmenge klein halten: Der `KiGrader` überträgt
ausschließlich Aufgaben-ID, Antworttext und Versuchszähler. Kein Name, keine
Geräte-Kennung, kein Sitzungsschlüssel. Das ist Datensparsamkeit im Sinne von
Art. 5 DSGVO — und reduziert den Umfang dessen, was überhaupt zu regeln ist.

---

## 5. Was zuerst gebaut werden sollte

Nicht die KI-Bewertung der bestehenden Aufgaben — die funktioniert
deterministisch gut. Sondern die Aufgaben, die es **ohne** KI nicht geben kann:

1. **„Erzähle die Geschichte aus Nuris Sicht."** Freie Schreibaufgabe, drei bis
   vier Sätze. Bewertet wird nicht Rechtschreibung, sondern ob die
   Perspektive gewechselt wurde.
2. **„Warum hat Nuri seine Sachen geteilt? Schreibe deine Meinung."** Wertendes
   Verstehen — die einzige Verstehensebene nach Barrett, die im aktuellen Modul
   fehlt, weil sie deterministisch nicht prüfbar ist.
3. **Gezielte Nachfragen bei Fehlern.** Statt einer festen Hilfe eine, die zur
   konkreten Fehlantwort des Kindes passt.

Für die Lehrkraft ändert sich dadurch nichts an der Diagnostik: Wortschatz und
Genus bleiben hart gemessen. Die KI erweitert das Modul nach oben, statt das zu
ersetzen, was bereits verlässlich funktioniert.
