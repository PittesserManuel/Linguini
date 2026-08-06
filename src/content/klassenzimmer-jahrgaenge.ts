import type { Jahrgangstext } from './types'

/**
 * Die vier Jahrgangsfassungen des Klassenzimmer-Lesetexts.
 *
 * Zielgruppe ist die Mittelschule, also 10- bis 14-Jaehrige. Alle vier Texte
 * spielen im selben Klassenzimmer und nutzen denselben Wortschatz - was sich
 * aendert, ist NICHT das Thema, sondern die Sprache.
 *
 * Warum ueberhaupt vier Fassungen und nicht drei Niveaustufen eines Textes:
 * Die Niveaustufe sagt, wie sicher ein Kind im Deutschen ist. Der Jahrgang
 * sagt, wie alt es ist. Bei DaZ-Lernenden faellt beides regelmaessig
 * auseinander. Eine Vierzehnjaehrige mit vier Monaten Deutschkontakt braucht
 * einen Text, der sie sprachlich nicht ueberfordert und inhaltlich nicht
 * unterfordert - "Mala setzt sich auf den Stuhl" ist fuer sie beschaemend,
 * nicht hilfreich. Deshalb steigt mit dem Jahrgang der INHALT mit, waehrend
 * die Niveaustufe weiterhin die Aufgaben steuert.
 *
 * Die sprachliche Steigerung ueber die vier Fassungen - die Satzlaenge ist
 * die tragende Groesse, nicht die Textlaenge:
 *
 *   1. Klasse  nur Praesens, nur Hauptsaetze                    Ø 4,3 W/Satz
 *   2. Klasse  Praesens, erste Konnektoren (aber, und)          Ø 6,2 W/Satz
 *   3. Klasse  Perfekt, Nebensaetze mit weil/dass               Ø 7,7 W/Satz
 *   4. Klasse  Praeteritum, Relativsaetze, indirekte Rede       Ø 9,6 W/Satz
 *
 * Dass die Texte dabei NICHT deutlich laenger werden (68 / 149 / 139 / 153
 * Woerter), ist Absicht. Ein DaZ-Lernender in der vierten Klasse liest nicht
 * mehr Zeilen als einer in der zweiten - er liest dichtere. Laenge zu
 * steigern waere die bequeme, aber wirkungslose Variante.
 *
 * Die Kennzahlen unten sind gezaehlt, nicht geschaetzt:
 * `node werkzeuge/kennzahlen.mjs` traegt sie ein, `--pruefen` meldet
 * Abweichungen, ohne zu schreiben.
 */

/**
 * 2. Klasse - die Ausgangsfassung des Moduls.
 *
 * Kurze Hauptsaetze im Praesens, erste Konnektoren. Der soziale Kern
 * (neu sein, nichts haben, geteilt bekommen) traegt alle vier Fassungen.
 */
export const textMs2: Jahrgangstext = {
  jahrgang: 'ms2',
  kurz: '2. Klasse',
  bezeichnung: '2. Klasse Mittelschule',
  alter: '11 bis 12 Jahre',
  sprachprofil:
    'Praesens, ueberwiegend Hauptsaetze, erste Konnektoren (aber, und). Woertliche Rede in einem Absatz.',

  lesetext: {
      titel: 'Malas erster Tag',
      absaetze: [
        {
          id: 'a1',
          saetze: [
            'Mala ist neu in der Klasse 4b.',
            'Sie kommt aus Syrien.',
            'Heute ist ihr erster Schultag in Deutschland.',
          ],
        },
        {
          id: 'a2',
          saetze: [
            'Frau Berger zeigt auf die Tafel.',
            'Dort steht ein Wort: Willkommen.',
            'Mala liest das Wort ganz langsam und lächelt.',
          ],
        },
        {
          id: 'a3',
          saetze: [
            'Alle Kinder sollen ein Bild malen.',
            'Aber Malas Schultasche ist fast leer.',
            'Sie hat nur einen Stift und ein Heft.',
            'Sie hat keinen Kleber und keine Schere.',
            'Mala sagt nichts mehr.',
          ],
        },
        {
          id: 'a4',
          saetze: [
            'Da steht Nuri auf.',
            'Er sitzt neben Mala.',
            'Er legt seinen Spitzer, sein Lineal und seinen Radiergummi auf ihren Tisch.',
            '„Wir teilen“, sagt er. „Das machen wir hier immer.“',
          ],
        },
        {
          id: 'a5',
          saetze: [
            'Mala malt einen Baum.',
            'Ein Strich geht daneben.',
            'Sie nimmt den Radiergummi und reibt ihn weg.',
            'Das alte Blatt wirft sie in den Papierkorb.',
          ],
        },
        {
          id: 'a6',
          saetze: [
            'Am Ende hängt Malas Bild an der Tafel.',
            'Es ist ein Baum mit vielen bunten Vögeln.',
            'Mala sagt jetzt wieder etwas.',
            'Sie erzählt Nuri von den Vögeln.',
          ],
        },
      ],
      kennzahlen: { woerter: 149, saetze: 24, woerterProSatzDurchschnitt: 6.2, langstesWort: 'Deutschland' },
  },

  aufgaben: [
      /* Der Einstieg auf Stufe "einfach" laeuft ueber das BILD, nicht ueber den
         Text. Ein Kind mit wenigen Monaten Deutschkontakt versteht den Lesetext
         noch nicht vollstaendig - eine Frage dazu misst dann Wortschatzluecken
         statt Leseverstehen. Am Bild ist die Aussage dagegen ueberpruefbar:
         Man sieht, dass der Radiergummi rosa und blau ist. Deshalb hier auch
         nur richtig/falsch: "steht nicht im Text" ergibt bei einem Bild keinen
         Sinn. */
      {
        id: 'f0',
        typ: 'wahrheit',
        frage: 'Schau dir den Radiergummi genau an. Stimmen die Sätze?',
        ebene: 'literal',
        abStufe: 'einfach',
        bildObjekt: 'radiergummi',
        nurRichtigFalsch: true,
        aussagen: [
          {
            id: 'b1',
            text: 'Der Radiergummi ist rosa und blau.',
            richtig: 'richtig',
            begruendung: 'Im Bild siehst du zwei Farben: eine Hälfte ist rosa, die andere Hälfte ist blau.',
          },
          {
            id: 'b2',
            text: 'Der Radiergummi ist grün.',
            richtig: 'falsch',
            begruendung: 'Grün ist keine der beiden Farben. Grün ist zum Beispiel die Tafel.',
          },
          {
            id: 'b3',
            text: 'Der Radiergummi ist rund.',
            richtig: 'falsch',
            begruendung: 'Er hat vier Ecken – er ist eckig, nicht rund. Rund ist zum Beispiel die Uhr.',
          },
        ],
        hilfen: [
          'Sieh dir zuerst nur das Bild an. Welche Farben erkennst du?',
          'Lies dann Satz für Satz und vergleiche jedes Mal mit dem Bild.',
        ],
        loesungserklaerung:
          'Bei dieser Aufgabe brauchst du den Text nicht. Alles, was du wissen musst, steht im Bild. So kannst du prüfen, ob du die Wörter für Farben und Formen schon verstehst.',
      },

      {
        id: 'f1',
        typ: 'auswahl',
        frage: 'Woher kommt Mala?',
        ebene: 'literal',
        abStufe: 'einfach',
        belegAbsatz: 'a1',
        optionen: [
          { id: 'o1', text: 'Aus der Türkei' },
          { id: 'o2', text: 'Aus Syrien' },
          { id: 'o3', text: 'Aus Deutschland' },
          { id: 'o4', text: 'Aus Italien' },
        ],
        richtig: 'o2',
        hilfen: [
          'Lies den ersten Absatz noch einmal.',
          'Der zweite Satz beginnt mit „Sie kommt aus …“',
        ],
        loesungserklaerung:
          'Im ersten Absatz steht: „Sie kommt aus Syrien.“ Die Antwort steht also direkt im Text.',
      },

      {
        id: 'f2',
        typ: 'wahrheit',
        frage: 'Stimmt das? Wähle: richtig, falsch oder steht nicht im Text.',
        ebene: 'literal',
        abStufe: 'einfach',
        aussagen: [
          {
            id: 'w1',
            text: 'Nuri sitzt neben Mala.',
            richtig: 'richtig',
            begruendung: 'Im Text steht: „Er sitzt neben Mala.“',
          },
          {
            id: 'w2',
            text: 'Malas Schultasche ist voll.',
            richtig: 'falsch',
            begruendung: 'Im Text steht das Gegenteil: „Malas Schultasche ist fast leer.“',
          },
          {
            id: 'w3',
            text: 'Mala hat einen kleinen Bruder.',
            richtig: 'unbekannt',
            begruendung:
              'Über Malas Familie steht nichts im Text. Vielleicht hat sie einen Bruder, vielleicht nicht – wir wissen es nicht.',
          },
        ],
        hilfen: [
          'Suche zu jedem Satz die Stelle im Text.',
          'Wenn du die Stelle nicht findest, ist die Antwort vielleicht „steht nicht im Text“.',
        ],
        loesungserklaerung:
          'Bei dieser Aufgabe geht es um einen wichtigen Unterschied: Etwas kann falsch sein – oder es steht einfach nicht im Text. Beides ist nicht dasselbe.',
      },

      {
        id: 'f3',
        typ: 'luecken',
        frage: 'Setze die richtigen Wörter ein.',
        ebene: 'literal',
        abStufe: 'einfach',
        belegAbsatz: 'a3',
        teile: ['Mala hat keinen ', null, ' und keine ', null, '.'],
        loesungen: ['Kleber', 'Schere'],
        wortbank: ['Kleber', 'Schere', 'Spitzer', 'Tafel', 'Lineal'],
        hilfen: [
          'Achte auf „keinen“ und „keine“ – das verrät dir den Artikel.',
          '„keinen“ passt zu einem der-Wort, „keine“ zu einem die-Wort.',
        ],
        loesungserklaerung:
          '„keinen“ gehört zu „der Kleber“, „keine“ zu „die Schere“. Die kleinen Wörter vor dem Nomen verraten dir das Genus.',
      },

      {
        id: 'f4',
        typ: 'freitext',
        frage: 'Womit macht Mala den Strich weg? Schreibe das Wort mit Artikel.',
        ebene: 'literal',
        abStufe: 'standard',
        belegAbsatz: 'a5',
        akzeptiert: ['der Radiergummi', 'Radiergummi', 'mit dem Radiergummi', 'dem Radiergummi'],
        artikelPflicht: true,
        platzhalter: 'zum Beispiel: der Stift',
        hilfen: [
          'Lies den fünften Absatz noch einmal.',
          'Das Wort beginnt mit „Radier…“',
        ],
        loesungserklaerung:
          'Die Lösung ist „der Radiergummi“. Das Wort ist maskulin – darum heißt es „der“ und im Text „den Radiergummi“ (Akkusativ).',
      },

      {
        id: 'f5',
        typ: 'reihenfolge',
        frage: 'Bringe die Ereignisse in die richtige Reihenfolge.',
        ebene: 'reorganisierend',
        abStufe: 'standard',
        schritte: [
          { id: 's1', text: 'Mala kommt neu in die Klasse 4b.' },
          { id: 's2', text: 'Mala merkt, dass ihre Schultasche fast leer ist.' },
          { id: 's3', text: 'Nuri legt seine Sachen auf Malas Tisch.' },
          { id: 's4', text: 'Mala malt einen Baum mit Vögeln.' },
          { id: 's5', text: 'Malas Bild hängt an der Tafel.' },
        ],
        hilfen: [
          'Welches Ereignis passiert ganz am Anfang der Geschichte?',
          'Geh die Absätze der Reihe nach durch – die Geschichte wird der Reihe nach erzählt.',
        ],
        loesungserklaerung:
          'Die Geschichte wird von vorne nach hinten erzählt: Mala kommt an, ihr fehlen Sachen, Nuri hilft, sie malt, am Ende hängt ihr Bild an der Tafel.',
      },

      {
        id: 'f6',
        typ: 'artikel',
        frage: 'Welcher Artikel passt? Ordne jedem Wort der, die oder das zu.',
        ebene: 'sprachbetrachtend',
        abStufe: 'standard',
        woerter: ['tafel', 'lineal', 'radiergummi', 'spitzer', 'schere', 'kleber', 'papierkorb'],
        hilfen: [
          'Schau dir das Bild oben noch einmal an – dort steht jeder Artikel dabei.',
          'Merkhilfe: Wörter auf -er sind oft maskulin (der Spitzer, der Kleber).',
        ],
        loesungserklaerung:
          'Im Deutschen gehört der Artikel fest zum Nomen. Man lernt ihn am besten zusammen mit dem Wort – nie das Wort allein.',
      },

      {
        id: 'f7',
        typ: 'auswahl',
        frage: 'Warum sagt Mala nichts mehr?',
        ebene: 'inferentiell',
        abStufe: 'anspruchsvoll',
        belegAbsatz: 'a3',
        optionen: [
          { id: 'p1', text: 'Weil sie müde ist.' },
          { id: 'p2', text: 'Weil sie traurig ist. Sie hat fast nichts zum Malen.' },
          { id: 'p3', text: 'Weil Frau Berger es so gesagt hat.' },
          { id: 'p4', text: 'Weil sie kein Deutsch versteht.' },
        ],
        richtig: 'p2',
        hilfen: [
          'Was passiert direkt vorher? Lies die zwei Sätze davor.',
          'Im Text steht nicht „Mala ist traurig“. Du musst es selbst erschließen.',
        ],
        loesungserklaerung:
          'Diese Antwort steht nicht wörtlich im Text. Vorher steht: Alle sollen malen, aber Mala hat fast nichts. Daraus kannst du schließen, warum sie still wird. Das nennt man „zwischen den Zeilen lesen“.',
      },

      /* Der Abschluss geht bewusst wieder vom Bildschirm weg: Die letzte
         Aufgabe des Lesewegs ist eine eigene Schreibleistung im Heft, die eine
         Lehrperson korrigiert. */
      {
        id: 'f8',
        typ: 'heft',
        heft: 'linguiniheft',
        frage: 'Schreibe in dein Heft: Was würdest du Mala geben? Und warum?',
        ebene: 'wertend',
        abStufe: 'standard',
        imHeft: true,
        musterSaetze: ['Ich würde Mala einen Buntstift geben, weil …'],
        umfang: 'Drei bis vier Sätze.',
        hilfen: [
          'Nimm ein Wort aus dem Bild: Bleistift, Schere, Lineal, Geodreieck …',
          'Der zweite Satz beginnt mit „weil“ – schreib dort deinen Grund auf.',
        ],
        loesungserklaerung:
          'Auf diese Frage gibt es keine richtige Antwort, nur deine eigene. Deshalb zeigt dir die App hier nichts – deine Lehrerin oder dein Lehrer liest, was du geschrieben hast.',
      },
  ],
}

/**
 * 1. Klasse - die kuerzeste Fassung.
 *
 * Nur Praesens, nur Hauptsaetze, hoechstens ein Nebensatz pro Absatz - und
 * bewusst KEIN Konflikt, der erklaert werden muesste. Auf dieser Stufe ist
 * schon "Wer sitzt neben Mala?" eine echte Leseleistung.
 */
export const textMs1: Jahrgangstext = {
  jahrgang: 'ms1',
  kurz: '1. Klasse',
  bezeichnung: '1. Klasse Mittelschule',
  alter: '10 bis 11 Jahre',
  sprachprofil:
    'Ausschliesslich Praesens und Hauptsaetze. Kein Nebensatz, keine Konnektoren ausser "und". Jeder Satz enthaelt genau eine Aussage.',

  lesetext: {
    titel: 'Mala kommt in die Klasse',
    absaetze: [
      {
        id: 'e1',
        saetze: ['Mala ist neu.', 'Sie kommt aus Syrien.', 'Heute ist ihr erster Tag.'],
      },
      {
        id: 'e2',
        saetze: ['Frau Berger zeigt auf einen Tisch.', '„Das ist dein Platz.“', 'Mala setzt sich.'],
      },
      {
        id: 'e3',
        saetze: [
          'Auf dem Tisch liegt ein Heft.',
          'Daneben liegt ein Bleistift.',
          'Mala nimmt den Bleistift.',
        ],
      },
      {
        id: 'e4',
        saetze: ['Nuri sitzt neben Mala.', 'Er sagt: „Hallo! Ich bin Nuri.“', 'Mala lacht.'],
      },
      {
        id: 'e5',
        saetze: [
          'Mala malt ein Bild.',
          'Das Bild ist für Nuri.',
          'Nuri hängt das Bild an die Tafel.',
        ],
      },
    ],
    kennzahlen: { woerter: 68, saetze: 16, woerterProSatzDurchschnitt: 4.3, langstesWort: 'Bleistift' },
  },

  aufgaben: [
    {
      id: 'm1-1',
      typ: 'wahrheit',
      frage: 'Schau dir den Bleistift an. Stimmen die Sätze?',
      ebene: 'literal',
      abStufe: 'einfach',
      bildObjekt: 'bleistift',
      nurRichtigFalsch: true,
      aussagen: [
        {
          id: 'm1-1a',
          text: 'Der Bleistift ist gelb.',
          richtig: 'richtig',
          begruendung: 'Im Bild siehst du: Der Bleistift ist gelb.',
        },
        {
          id: 'm1-1b',
          text: 'Der Bleistift ist rund.',
          richtig: 'falsch',
          begruendung: 'Der Bleistift hat Kanten. Rund ist zum Beispiel die Uhr.',
        },
      ],
      hilfen: ['Sieh dir zuerst nur das Bild an.', 'Lies dann jeden Satz einzeln.'],
      loesungserklaerung:
        'Für diese Aufgabe brauchst du den Text nicht. Alles steht im Bild. So übst du die Wörter für Farben und Formen.',
    },
    {
      id: 'm1-2',
      typ: 'auswahl',
      frage: 'Wer sitzt neben Mala?',
      ebene: 'literal',
      abStufe: 'einfach',
      belegAbsatz: 'e4',
      optionen: [
        { id: 'm1-2a', text: 'Frau Berger' },
        { id: 'm1-2b', text: 'Nuri' },
        { id: 'm1-2c', text: 'Niemand' },
      ],
      richtig: 'm1-2b',
      hilfen: ['Lies den vierten Absatz.', 'Der erste Satz sagt es dir.'],
      loesungserklaerung: 'Im Text steht: „Nuri sitzt neben Mala.“',
    },
    {
      id: 'm1-3',
      typ: 'luecken',
      frage: 'Setze die richtigen Wörter ein.',
      ebene: 'literal',
      abStufe: 'einfach',
      belegAbsatz: 'e3',
      teile: ['Auf dem Tisch liegt ein ', null, '. Daneben liegt ein ', null, '.'],
      loesungen: ['Heft', 'Bleistift'],
      wortbank: ['Heft', 'Bleistift', 'Lineal', 'Zirkel'],
      hilfen: ['Lies den dritten Absatz noch einmal.', 'Die zwei Wörter stehen dort hintereinander.'],
      loesungserklaerung: 'Im Text steht: „Auf dem Tisch liegt ein Heft. Daneben liegt ein Bleistift.“',
    },
    {
      id: 'm1-4',
      typ: 'heft',
      heft: 'vokabelheft',
      frage: 'Schreibe drei Sätze aus dem Text in dein Heft ab.',
      ebene: 'sprachbetrachtend',
      abStufe: 'einfach',
      imHeft: true,
      abschreiben: ['Mala ist neu.', 'Nuri sitzt neben Mala.', 'Mala malt ein Bild.'],
      umfang: 'Drei Sätze.',
      hilfen: ['Schreibe genau ab. Achte auf den Punkt am Ende.'],
      loesungserklaerung:
        'Diese Sätze schreibst du 1:1 ab. Deine Lehrerin oder dein Lehrer schaut, ob alles richtig im Heft steht.',
    },
  ],
}

/**
 * 3. Klasse - erstmals Vergangenheit und Nebensaetze.
 *
 * Das Perfekt kommt hier durchgaengig, dazu weil- und dass-Saetze. Inhaltlich
 * traegt der Text jetzt eine Handlung mit Fehlschlag und zweitem Versuch -
 * fuer Zwoelf- bis Dreizehnjaehrige ist "beim ersten Mal misslingt es" ein
 * Thema, "Mala setzt sich auf den Stuhl" nicht mehr.
 */
export const textMs3: Jahrgangstext = {
  jahrgang: 'ms3',
  kurz: '3. Klasse',
  bezeichnung: '3. Klasse Mittelschule',
  alter: '12 bis 13 Jahre',
  sprachprofil:
    'Perfekt als Erzaehlzeit, Nebensaetze mit weil und dass, woertliche Rede. Erste mehrgliedrige Saetze.',

  lesetext: {
    titel: 'Der Zirkel',
    absaetze: [
      {
        id: 'z1',
        saetze: [
          'In der dritten Stunde haben wir Geometrie gehabt.',
          'Frau Berger hat einen großen Kreis an die Tafel gezeichnet.',
          '„Heute arbeiten wir mit dem Zirkel“, hat sie gesagt.',
        ],
      },
      {
        id: 'z2',
        saetze: [
          'Mala hat ihre Schultasche geöffnet.',
          'Sie hat ein Lineal und ein Geodreieck gefunden, aber keinen Zirkel.',
          'Sie hat nichts gesagt, weil sie sich geschämt hat.',
        ],
      },
      {
        id: 'z3',
        saetze: [
          'Nuri hat das gemerkt.',
          'Er hat seinen Zirkel in die Mitte des Tisches geschoben.',
          '„Wir teilen“, hat er gesagt.',
          '„Du zeichnest zuerst.“',
        ],
      },
      {
        id: 'z4',
        saetze: [
          'Mala hat den Zirkel genommen und angesetzt.',
          'Die Spitze ist verrutscht, und der Kreis ist schief geworden.',
          'Sie hat den Fehler mit dem Radiergummi weggemacht.',
          'Dann hat sie es noch einmal versucht.',
        ],
      },
      {
        id: 'z5',
        saetze: [
          'Beim dritten Mal ist der Kreis rund geworden.',
          'Frau Berger ist stehen geblieben und hat gesagt, dass die Zeichnung sauber ist.',
          'Mala hat gewusst, dass sie das Wort „Zirkel“ nicht mehr vergisst.',
        ],
      },
    ],
    kennzahlen: { woerter: 139, saetze: 18, woerterProSatzDurchschnitt: 7.7, langstesWort: 'Schultasche' },
  },

  aufgaben: [
    {
      id: 'm3-1',
      typ: 'auswahl',
      frage: 'Was hat Mala in ihrer Schultasche nicht gefunden?',
      ebene: 'literal',
      abStufe: 'einfach',
      belegAbsatz: 'z2',
      optionen: [
        { id: 'm3-1a', text: 'Das Lineal' },
        { id: 'm3-1b', text: 'Das Geodreieck' },
        { id: 'm3-1c', text: 'Den Zirkel' },
        { id: 'm3-1d', text: 'Den Radiergummi' },
      ],
      richtig: 'm3-1c',
      hilfen: [
        'Lies den zweiten Absatz noch einmal.',
        'Achte auf das kleine Wort „aber“ – danach kommt, was fehlt.',
      ],
      loesungserklaerung:
        'Im Text steht: „Sie hat ein Lineal und ein Geodreieck gefunden, aber keinen Zirkel.“ Das Wort „aber“ zeigt dir den Gegensatz an.',
    },
    {
      id: 'm3-2',
      typ: 'wahrheit',
      frage: 'Stimmt das? Wähle: richtig, falsch oder steht nicht im Text.',
      ebene: 'literal',
      abStufe: 'einfach',
      aussagen: [
        {
          id: 'm3-2a',
          text: 'Der erste Kreis ist schief geworden.',
          richtig: 'richtig',
          begruendung: 'Im Text steht: „Die Spitze ist verrutscht, und der Kreis ist schief geworden.“',
        },
        {
          id: 'm3-2b',
          text: 'Mala hat ihren eigenen Zirkel benutzt.',
          richtig: 'falsch',
          begruendung: 'Sie hatte keinen Zirkel. Nuri hat ihr seinen geliehen.',
        },
        {
          id: 'm3-2c',
          text: 'Nuri hat den Zirkel zum Geburtstag bekommen.',
          richtig: 'unbekannt',
          begruendung: 'Woher Nuri seinen Zirkel hat, steht nirgends im Text.',
        },
      ],
      hilfen: [
        'Suche zu jedem Satz die passende Stelle im Text.',
        'Findest du keine Stelle, ist die Antwort vielleicht „steht nicht im Text“.',
      ],
      loesungserklaerung:
        'Etwas kann falsch sein – oder es steht einfach nicht im Text. Das ist nicht dasselbe. Nur was belegt ist, darfst du behaupten.',
    },
    {
      id: 'm3-3',
      typ: 'freitext',
      frage: 'Womit macht Mala den Fehler weg? Schreibe das Wort mit Artikel.',
      ebene: 'literal',
      abStufe: 'standard',
      belegAbsatz: 'z4',
      akzeptiert: ['der Radiergummi', 'Radiergummi', 'mit dem Radiergummi', 'dem Radiergummi'],
      artikelPflicht: true,
      platzhalter: 'zum Beispiel: das Lineal',
      hilfen: ['Lies den vierten Absatz noch einmal.', 'Das Wort beginnt mit „Radier…“'],
      loesungserklaerung:
        'Die Lösung ist „der Radiergummi“. Das Wort ist maskulin – im Satz steht es als „mit dem Radiergummi“ (Dativ).',
    },
    {
      id: 'm3-4',
      typ: 'reihenfolge',
      frage: 'Bringe die Ereignisse in die richtige Reihenfolge.',
      ebene: 'reorganisierend',
      abStufe: 'standard',
      schritte: [
        { id: 'm3-4a', text: 'Frau Berger zeichnet einen Kreis an die Tafel.' },
        { id: 'm3-4b', text: 'Mala merkt, dass ihr Zirkel fehlt.' },
        { id: 'm3-4c', text: 'Nuri schiebt seinen Zirkel in die Mitte.' },
        { id: 'm3-4d', text: 'Malas erster Kreis wird schief.' },
        { id: 'm3-4e', text: 'Beim dritten Mal wird der Kreis rund.' },
      ],
      hilfen: [
        'Womit beginnt die Stunde?',
        'Geh die Absätze der Reihe nach durch – die Geschichte wird der Reihe nach erzählt.',
      ],
      loesungserklaerung:
        'Die Geschichte läuft von vorne nach hinten: Aufgabe an der Tafel, fehlender Zirkel, Nuris Hilfe, misslungener Versuch, gelungener Versuch.',
    },
    {
      id: 'm3-5',
      typ: 'heft',
      heft: 'linguiniheft',
      frage: 'Schreibe in dein Heft: Was hat Mala gemacht, als der Kreis schief geworden ist?',
      ebene: 'reorganisierend',
      abStufe: 'standard',
      imHeft: true,
      musterSaetze: ['Zuerst hat Mala …', 'Danach hat sie …'],
      umfang: 'Drei bis vier Sätze im Perfekt.',
      hilfen: [
        'Benutze das Perfekt: „hat … gemacht“, „ist … geworden“.',
        'Fang mit „Zuerst“ an und schreib dann mit „Danach“ weiter.',
      ],
      loesungserklaerung:
        'Hier gibt es mehrere richtige Formulierungen. Deine Lehrerin oder dein Lehrer schaut, ob das Perfekt stimmt und die Reihenfolge passt.',
    },
  ],
}

/**
 * 4. Klasse - Praeteritum, Relativsaetze und indirekte Rede.
 *
 * Der Text verlangt zum ersten Mal echtes Zwischen-den-Zeilen-Lesen: Warum
 * die Kiste am Ende voller ist als am Anfang, steht nirgends. Inhaltlich geht
 * es um Geben und Nehmen in einer Gruppe - ein Thema, ueber das
 * Dreizehn- bis Vierzehnjaehrige tatsaechlich diskutieren wollen.
 */
export const textMs4: Jahrgangstext = {
  jahrgang: 'ms4',
  kurz: '4. Klasse',
  bezeichnung: '4. Klasse Mittelschule',
  alter: '13 bis 14 Jahre',
  sprachprofil:
    'Praeteritum als Erzaehlzeit, Relativsaetze, indirekte Rede mit Konjunktiv I. Eine zentrale Aussage bleibt unausgesprochen und muss erschlossen werden.',

  lesetext: {
    titel: 'Die Kiste',
    absaetze: [
      {
        id: 'k1',
        saetze: [
          'Am Montag stand neben der Tür eine alte Holzkiste, die vorher niemand dort gesehen hatte.',
          'Frau Berger stellte sie auf den Tisch und öffnete den Deckel.',
          'Darin lagen Bleistifte, Radiergummis, Lineale, zwei Zirkel und ein Geodreieck.',
        ],
      },
      {
        id: 'k2',
        saetze: [
          '„Das ist ab heute unsere Klassenkiste“, sagte sie.',
          'Wer etwas vergessen habe oder nichts habe, könne sich hier etwas nehmen.',
          'Man müsse nicht fragen und nicht erklären, warum.',
        ],
      },
      {
        id: 'k3',
        saetze: [
          'Ein paar Kinder fanden das seltsam.',
          'Ali meinte, dann seien am Ende alle Sachen verschwunden.',
          'Frau Berger antwortete, dass sie genau das Gegenteil erwarte.',
        ],
      },
      {
        id: 'k4',
        saetze: [
          'In der ersten Woche nahm sich fast niemand etwas.',
          'In der zweiten Woche legte Nuri zwei Buntstifte hinein, die er doppelt hatte.',
          'Mala legte einen Spitzer dazu, den sie zum Geburtstag bekommen hatte.',
        ],
      },
      {
        id: 'k5',
        saetze: [
          'Nach einem Monat war die Kiste voller als am Anfang.',
          'Niemand konnte mehr sagen, wem welcher Stift einmal gehört hatte.',
          'Genau das, sagte Frau Berger, sei der Sinn der Sache gewesen.',
        ],
      },
    ],
    kennzahlen: { woerter: 153, saetze: 16, woerterProSatzDurchschnitt: 9.6, langstesWort: 'Radiergummis' },
  },

  aufgaben: [
    {
      id: 'm4-1',
      typ: 'wahrheit',
      frage: 'Stimmt das? Wähle: richtig, falsch oder steht nicht im Text.',
      ebene: 'literal',
      abStufe: 'einfach',
      aussagen: [
        {
          id: 'm4-1a',
          text: 'In der ersten Woche nahm sich fast niemand etwas aus der Kiste.',
          richtig: 'richtig',
          begruendung: 'Dieser Satz steht wörtlich im vierten Absatz.',
        },
        {
          id: 'm4-1b',
          text: 'Ali erwartete, dass die Kiste voller wird.',
          richtig: 'falsch',
          begruendung: 'Ali meinte das Gegenteil: dass am Ende alle Sachen verschwunden seien.',
        },
        {
          id: 'm4-1c',
          text: 'Frau Berger hat die Kiste selbst gebaut.',
          richtig: 'unbekannt',
          begruendung: 'Woher die Kiste kommt, steht nirgends. Wir wissen nur, dass sie am Montag da war.',
        },
      ],
      hilfen: [
        'Suche zu jedem Satz die Stelle im Text.',
        'Achte auf die indirekte Rede: „Ali meinte, …“ gibt Alis Meinung wieder, nicht die der Lehrerin.',
      ],
      loesungserklaerung:
        'Bei indirekter Rede musst du genau trennen, WER etwas sagt. „Ali meinte …“ ist Alis Erwartung – und sie war das Gegenteil von dem, was passiert ist.',
    },
    {
      id: 'm4-2',
      typ: 'auswahl',
      frage: 'Warum war die Kiste nach einem Monat voller als am Anfang?',
      ebene: 'inferentiell',
      abStufe: 'standard',
      belegAbsatz: 'k4',
      optionen: [
        { id: 'm4-2a', text: 'Weil Frau Berger neue Sachen gekauft hat.' },
        { id: 'm4-2b', text: 'Weil die Kinder mehr hineingelegt als herausgenommen haben.' },
        { id: 'm4-2c', text: 'Weil niemand die Kiste benutzt hat.' },
        { id: 'm4-2d', text: 'Weil eine andere Klasse etwas dazugelegt hat.' },
      ],
      richtig: 'm4-2b',
      hilfen: [
        'Der Grund steht nicht als Satz im Text. Lies den vierten Absatz und achte darauf, was die Kinder TUN.',
        'Nuri legt etwas hinein. Mala legt etwas hinein. Was folgt daraus?',
      ],
      loesungserklaerung:
        'Diese Antwort steht nirgends wörtlich. Im vierten Absatz legen zwei Kinder etwas hinein, herausgenommen hat kaum jemand etwas. Daraus kannst du schließen, warum die Kiste voller wurde. Das nennt man „zwischen den Zeilen lesen“.',
    },
    {
      id: 'm4-3',
      typ: 'freitext',
      frage: 'Was legte Mala in die Kiste? Schreibe das Wort mit Artikel.',
      ebene: 'literal',
      abStufe: 'standard',
      belegAbsatz: 'k4',
      akzeptiert: ['der Spitzer', 'Spitzer', 'einen Spitzer', 'den Spitzer'],
      artikelPflicht: true,
      platzhalter: 'zum Beispiel: der Kleber',
      hilfen: ['Lies den vierten Absatz.', 'Das Wort beginnt mit „Spi…“'],
      loesungserklaerung:
        'Die Lösung ist „der Spitzer“. Im Text steht „einen Spitzer“ – das ist der Akkusativ von „der Spitzer“.',
    },
    {
      id: 'm4-4',
      typ: 'auswahl',
      frage: 'Was meint Frau Berger am Ende mit „der Sinn der Sache“?',
      ebene: 'wertend',
      abStufe: 'anspruchsvoll',
      belegAbsatz: 'k5',
      optionen: [
        { id: 'm4-4a', text: 'Dass die Klasse möglichst viele Stifte sammelt.' },
        { id: 'm4-4b', text: 'Dass niemand mehr sagen muss, dass ihm etwas fehlt.' },
        { id: 'm4-4c', text: 'Dass alle Kinder gleich viel besitzen sollen.' },
        { id: 'm4-4d', text: 'Dass die Kinder ordentlicher mit ihren Sachen umgehen.' },
      ],
      richtig: 'm4-4b',
      hilfen: [
        'Lies noch einmal, was Frau Berger im zweiten Absatz über das Fragen und Erklären sagt.',
        'Es geht nicht um die Anzahl der Stifte, sondern darum, was man nicht mehr sagen muss.',
      ],
      loesungserklaerung:
        'Im zweiten Absatz sagt Frau Berger, man müsse nicht fragen und nicht erklären, warum. Am Ende kann niemand mehr zuordnen, wem was gehört hat – genau dadurch fällt niemand mehr auf. Das ist der Sinn.',
    },
    {
      id: 'm4-5',
      typ: 'heft',
      heft: 'linguiniheft',
      frage: 'Schreibe in dein Heft: Würdest du etwas in die Kiste legen? Begründe deine Antwort.',
      ebene: 'wertend',
      abStufe: 'standard',
      imHeft: true,
      musterSaetze: ['Ich würde … in die Kiste legen, weil …', 'Ali hatte insofern recht, als …'],
      umfang: 'Fünf bis sechs Sätze.',
      hilfen: [
        'Nenne zuerst deine Meinung, dann mindestens einen Grund mit „weil“.',
        'Geh auch auf Alis Einwand ein: Was könnte für ihn sprechen?',
      ],
      loesungserklaerung:
        'Auf diese Frage gibt es keine richtige Antwort, nur eine begründete. Deshalb zeigt dir die App hier nichts – deine Lehrerin oder dein Lehrer liest, was du geschrieben hast.',
    },
  ],
}

/**
 * Alle vier Fassungen in aufsteigender Reihenfolge - genau so erscheinen sie
 * in der Umschaltleiste.
 */
export const klassenzimmerJahrgaenge: Jahrgangstext[] = [textMs1, textMs2, textMs3, textMs4]
