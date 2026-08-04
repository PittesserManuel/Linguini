import type { Modul } from './types'

/**
 * Demo-Modul "Im Klassenzimmer" - Deutsch als Zweitsprache, A2, Klasse 3/4.
 *
 * Redaktionelle Grundsatzentscheidungen (bewusst, mit Begruendung):
 *
 * 1. SIEBEN Lernwoerter, nicht fuenfzehn. Das Arbeitsgedaechtnis von
 *    9- bis 11-Jaehrigen verarbeitet 4-7 neue Einheiten (Miller 1956,
 *    Cognitive Load Theory). Das Bild zeigt trotzdem 15 beschriftete Dinge -
 *    die uebrigen 8 sind bekannte Stuetzwoerter. Sie geben der Szene
 *    Bedeutung, werden aber nicht geprueft. So bleibt das Bild reich und
 *    die Lernlast klein.
 *
 * 2. Thema Klassenzimmer statt "Freizeit" oder "Markt". Fuer ein Kind, das
 *    neu in einer deutschen Schule ist, sind das die Woerter, die es
 *    NOCH HEUTE braucht - hoechster Transferwert, sofortige Anwendung.
 *
 * 3. Kurze Saetze (Durchschnitt ~7 Woerter). Die Bildungsstandards nennen
 *    fuer Klasse 4 durchschnittlich 13-15 Woerter pro Satz - das gilt fuer
 *    Kinder mit Deutsch als Erstsprache. Fuer DaZ-Lernende auf A2 mit
 *    1-3 Jahren Sprachkontakt ist das zu lang. Wir bleiben deutlich darunter
 *    und heben die Komplexitaet ueber die AUFGABEN, nicht ueber den Text.
 *
 * 4. Die Geschichte hat einen sozialen Kern (neu sein, nichts haben, geteilt
 *    bekommen). DaZ-Kinder sollen sich im Text wiederfinden, ohne dass ihre
 *    Lage zum Defizit erklaert wird.
 */

export const modulKlassenzimmer: Modul = {
  id: 'klassenzimmer',
  titel: 'Im Klassenzimmer',
  untertitel: 'Wortschatz und Lesen rund um den Schultag',
  niveau: 'A2',
  jahrgang: 'Klasse 3/4',
  dauerMinuten: 25,

  szene: { art: 'svg', komponente: 'klassenzimmer' },

  // -------------------------------------------------------------------------
  // Wortschatz - 7 Lernwoerter (neu: true) + 8 Stuetzwoerter (neu: false)
  // Genusverteilung ueber alle 15: der 6 / die 5 / das 4
  // Die Koordinaten sind der VERTRAG mit der SVG-Szene: jedes Wort hat dort
  // eine Gruppe mit derselben id an genau dieser Position.
  // -------------------------------------------------------------------------
  wortschatz: [
    // --- Lernwoerter ---
    {
      id: 'tafel',
      genus: 'die',
      nomen: 'Tafel',
      plural: 'die Tafeln',
      beispiel: 'Frau Berger schreibt ein Wort an die Tafel.',
      erklaerung: 'Die große dunkle Fläche vorne in der Klasse. Man schreibt mit Kreide darauf.',
      neu: true,
      punkt: { x: 46, y: 22 },
      labelSeite: 'oben',
    },
    {
      id: 'lineal',
      genus: 'das',
      nomen: 'Lineal',
      plural: 'die Lineale',
      beispiel: 'Mit dem Lineal male ich eine gerade Linie.',
      erklaerung: 'Ein flaches, langes Ding. Damit malst du gerade Linien.',
      neu: true,
      punkt: { x: 44, y: 57 },
      labelSeite: 'oben',
    },
    {
      id: 'radiergummi',
      genus: 'der',
      nomen: 'Radiergummi',
      plural: 'die Radiergummis',
      beispiel: 'Mit dem Radiergummi mache ich den Fehler weg.',
      erklaerung: 'Damit machst du etwas weg, das du mit Bleistift geschrieben hast.',
      neu: true,
      punkt: { x: 66, y: 57 },
      labelSeite: 'oben',
    },
    {
      id: 'spitzer',
      genus: 'der',
      nomen: 'Spitzer',
      plural: 'die Spitzer',
      beispiel: 'Mein Stift ist stumpf. Ich brauche den Spitzer.',
      erklaerung: 'Damit machst du deinen Stift wieder spitz.',
      neu: true,
      punkt: { x: 77, y: 66 },
      labelSeite: 'unten',
    },
    {
      id: 'schere',
      genus: 'die',
      nomen: 'Schere',
      plural: 'die Scheren',
      beispiel: 'Ich schneide das Papier mit der Schere.',
      erklaerung: 'Damit schneidest du Papier.',
      neu: true,
      punkt: { x: 88, y: 57 },
      labelSeite: 'oben',
    },
    {
      id: 'kleber',
      genus: 'der',
      nomen: 'Kleber',
      plural: 'die Kleber',
      beispiel: 'Ich klebe das Bild mit dem Kleber in mein Heft.',
      erklaerung: 'Damit machst du zwei Dinge fest zusammen.',
      neu: true,
      punkt: { x: 92, y: 66 },
      labelSeite: 'unten',
    },
    {
      id: 'papierkorb',
      genus: 'der',
      nomen: 'Papierkorb',
      plural: 'die Papierkörbe',
      beispiel: 'Das alte Blatt kommt in den Papierkorb.',
      erklaerung: 'Da wirfst du Papier hinein, das du nicht mehr brauchst.',
      neu: true,
      punkt: { x: 96, y: 38 },
      labelSeite: 'links',
    },

    // --- Stuetzwoerter (bekannt, nicht abgefragt) ---
    {
      id: 'fenster',
      genus: 'das',
      nomen: 'Fenster',
      plural: 'die Fenster',
      beispiel: 'Die Sonne scheint durch das Fenster.',
      erklaerung: 'Dadurch siehst du nach draußen.',
      neu: false,
      punkt: { x: 10, y: 20 },
      labelSeite: 'unten',
    },
    {
      id: 'uhr',
      genus: 'die',
      nomen: 'Uhr',
      plural: 'die Uhren',
      beispiel: 'Die Uhr zeigt zehn Uhr.',
      erklaerung: 'Sie zeigt dir, wie spät es ist.',
      neu: false,
      punkt: { x: 87, y: 13 },
      labelSeite: 'unten',
    },
    {
      id: 'stuhl',
      genus: 'der',
      nomen: 'Stuhl',
      plural: 'die Stühle',
      beispiel: 'Ich setze mich auf den Stuhl.',
      erklaerung: 'Darauf sitzt du.',
      neu: false,
      punkt: { x: 8, y: 57 },
      labelSeite: 'unten',
    },
    {
      id: 'schultasche',
      genus: 'die',
      nomen: 'Schultasche',
      plural: 'die Schultaschen',
      beispiel: 'Meine Schultasche ist heute schwer.',
      erklaerung: 'Darin trägst du deine Sachen zur Schule.',
      neu: false,
      punkt: { x: 13, y: 76 },
      labelSeite: 'unten',
    },
    {
      id: 'buch',
      genus: 'das',
      nomen: 'Buch',
      plural: 'die Bücher',
      beispiel: 'Wir lesen zusammen ein Buch.',
      erklaerung: 'Darin stehen Texte und Bilder zum Lesen.',
      neu: false,
      punkt: { x: 22, y: 57 },
      labelSeite: 'oben',
    },
    {
      id: 'heft',
      genus: 'das',
      nomen: 'Heft',
      plural: 'die Hefte',
      beispiel: 'Ich schreibe den Satz in mein Heft.',
      erklaerung: 'Ein dünnes Buch mit leeren Seiten zum Schreiben.',
      neu: false,
      punkt: { x: 33, y: 66 },
      labelSeite: 'unten',
    },
    {
      id: 'stift',
      genus: 'der',
      nomen: 'Stift',
      plural: 'die Stifte',
      beispiel: 'Mein Stift schreibt blau.',
      erklaerung: 'Damit schreibst und malst du.',
      neu: false,
      punkt: { x: 55, y: 66 },
      labelSeite: 'unten',
    },
    {
      id: 'tisch',
      genus: 'der',
      nomen: 'Tisch',
      plural: 'die Tische',
      beispiel: 'Meine Sachen liegen auf dem Tisch.',
      erklaerung: 'Darauf legst du deine Sachen und schreibst.',
      neu: false,
      punkt: { x: 20, y: 86 },
      labelSeite: 'unten',
    },
  ],

  // -------------------------------------------------------------------------
  // Lesetext
  // -------------------------------------------------------------------------
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
    kennzahlen: {
      woerter: 152,
      saetze: 22,
      woerterProSatzDurchschnitt: 6.9,
      langstesWort: 'Radiergummi',
    },
  },

  // -------------------------------------------------------------------------
  // Aufgaben - gestuft nach Verstehensebene (Barrett) und Niveaustufe
  // einfach = 3 Aufgaben | standard = 6 | anspruchsvoll = 7
  // -------------------------------------------------------------------------
  aufgaben: [
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
  ],

  // -------------------------------------------------------------------------
  // Lehrkraft-Ebene
  // -------------------------------------------------------------------------
  lernziele: [
    'Die Schülerinnen und Schüler benennen sieben Gegenstände aus dem Klassenzimmer mit dem korrekten bestimmten Artikel.',
    'Sie bilden zu diesen Nomen die Pluralform.',
    'Sie entnehmen einem kurzen erzählenden Text gezielt Einzelinformationen (literales Verstehen).',
    'Sie unterscheiden zwischen einer im Text belegten und einer nicht belegten Aussage.',
    'Sie erschließen eine nicht ausgesprochene Ursache aus dem Textzusammenhang (inferentielles Verstehen).',
    'Sie ordnen die Ereignisse der Geschichte in der richtigen Reihenfolge.',
  ],

  kompetenzen: [
    {
      quelle: 'KMK-Bildungsstandards Deutsch, Primarbereich',
      bereich: 'Lesen – mit Texten und Medien umgehen',
      formulierung:
        'Die Kinder entnehmen Texten gezielt Informationen und geben zentrale Aussagen wieder.',
    },
    {
      quelle: 'LehrplanPLUS Bayern, Deutsch 3/4',
      bereich: 'Lesen – mit Texten und weiteren Medien umgehen',
      formulierung:
        'Die Schülerinnen und Schüler verstehen kurze, altersgemäße und bildgestützte Texte, erkennen bekannte Wörter wieder und erschließen wesentliche Inhalte.',
    },
    {
      quelle: 'LehrplanPLUS Bayern, Deutsch 3/4',
      bereich: 'Sprachgebrauch untersuchen und reflektieren',
      formulierung:
        'Die Schülerinnen und Schüler verwenden Nomen mit dem passenden Begleiter und bilden Singular- und Pluralformen.',
    },
    {
      quelle: 'Gemeinsamer Europäischer Referenzrahmen (GER)',
      bereich: 'Lesen, Niveau A2',
      formulierung:
        'Kann kurze, einfache Texte zu vertrauten konkreten Themen lesen und darin bestimmte Informationen auffinden.',
    },
  ],

  differenzierung: [
    {
      stufe: 'einfach',
      fuerWen: 'Kinder mit weniger als einem Jahr Deutschkontakt, Niveau A1+',
      massnahmen: [
        'Nur die drei Aufgaben mit Auswahlantworten – kein freies Schreiben.',
        'Bild-Wort-Teil im Modus „Entdecken“: alle Beschriftungen bleiben sichtbar.',
        'Vorlesefunktion aktiv lassen; Text zuerst Satz für Satz anhören.',
        'Vorentlastung im Unterricht: die sieben Gegenstände real auf den Tisch legen und benennen lassen.',
      ],
    },
    {
      stufe: 'standard',
      fuerWen: 'Zielgruppe des Moduls: A2, ein bis drei Jahre Deutschkontakt',
      massnahmen: [
        'Sechs Aufgaben inklusive Freitext und Artikelzuordnung.',
        'Bild-Wort-Teil zuerst im Modus „Entdecken“, danach „Üben“.',
        'Hilfen erst nach dem ersten eigenen Versuch anbieten.',
      ],
    },
    {
      stufe: 'anspruchsvoll',
      fuerWen: 'Kinder, die den Wortschatz sicher beherrschen, Niveau A2+ bis B1',
      massnahmen: [
        'Alle sieben Aufgaben inklusive der Inferenzfrage.',
        'Bild-Wort-Teil direkt im Modus „Üben“ ohne Beschriftungen.',
        'Anschlussauftrag mündlich: Die Geschichte aus Nuris Sicht nacherzählen.',
      ],
    },
  ],

  unterrichtshinweise: [
    'Vorentlastung (5 Min.): Legen Sie die sieben Gegenstände real auf einen Tisch. Jedes Kind nimmt einen und sagt „Das ist …“. Erst danach an den Bildschirm.',
    'Die Artikelfarben (blau/rot/grün) entsprechen der in DaZ-Materialien üblichen Konvention. Wenn Sie im Unterricht andere Farben nutzen, weisen Sie einmal kurz darauf hin.',
    'Aufgabe 2 (richtig / falsch / steht nicht im Text) ist erfahrungsgemäß die schwerste. Die dritte Option verhindert Raten, irritiert aber zunächst. Ein gemeinsames Beispiel an der Tafel lohnt sich.',
    'Der Text hat einen sozialen Kern. Er eignet sich als Gesprächsanlass über das Ankommen in einer neuen Klasse – gerade wenn selbst neu zugewanderte Kinder in der Gruppe sind.',
    'Nacharbeit: Die Wortkarten aus dem Lehrkraft-Bereich ausdrucken und als Partnerspiel „Ich sehe was, was du nicht siehst“ einsetzen.',
  ],
}
