import type { Modul } from './types'

/**
 * Modul "Auf dem Wochenmarkt" - Deutsch als Zweitsprache, A2, Klasse 3/4.
 *
 * Das zweite Modul der Demo. Es existiert aus zwei Gruenden:
 *
 * 1. Fachlich. Die Recherche zur Themenwahl sprach fuer den Wochenmarkt:
 *    Schulwortschatz ist nach ein bis drei Jahren Immersion grossenteils
 *    erworben, Marktwortschatz dagegen wird ausserhalb der Schule gebraucht -
 *    am Samstag darauf, mit den Eltern. Beides ist vertretbar, deshalb gibt
 *    es beide Module statt einer Entscheidung.
 *
 * 2. Architektonisch. Dieses Modul ist eine reine Datendatei. Es wurde kein
 *    React-Code geschrieben, um es zu bauen - der Nachweis, dass "Inhalte
 *    sind Daten" mehr ist als eine Behauptung im README.
 *
 * Unterschied zum Klassenzimmer: Die Szene ist ein Rasterbild statt einer
 * SVG-Zeichnung. Das ist optisch reicher, kostet aber die Hervorhebung
 * einzelner Gegenstaende - Pixel sind nicht ansprechbar. Statt dessen gibt es
 * Trefferflaechen. Die Startseite benennt diesen Unterschied bei jedem Modul,
 * damit die Wahl nicht wie ein Zufall wirkt.
 */

export const modulWochenmarkt: Modul = {
  id: 'wochenmarkt',
  titel: 'Auf dem Wochenmarkt',
  untertitel: 'Wortschatz und Lesen rund ums Einkaufen',
  niveau: 'A2',
  jahrgang: 'Klasse 3/4',
  dauerMinuten: 25,

  szene: {
    art: 'bild',
    quelle: 'bilder/wochenmarkt-1600.webp',
    quelleKlein: 'bilder/wochenmarkt-1000.webp',
    breite: 1600,
    hoehe: 893,
    alt:
      'Ein Marktstand unter einer gestreiften Markise. Eine Verkäuferin steht dahinter. ' +
      'Auf der Auslage liegen Tomaten, Kartoffeln, Karotten, ein Brot, ein großer Käse und ' +
      'ein Karton mit Eiern. Rechts stehen eine Waage, ein Korb, Blumen in einem Eimer, ' +
      'eine Papiertüte, Münzen und ein Geldbeutel. Links stapeln sich Kisten mit Äpfeln und ' +
      'Birnen. Vor dem Stand steht ein Kind mit einem Korb.',
  },

  // -------------------------------------------------------------------------
  // Wortschatz - 7 Lernwoerter + 8 Stuetzwoerter
  // Genusverteilung ueber alle 15: der 4 / die 7 / das 4
  // Pluralbildung der Lernwoerter deckt fuenf Typen ab:
  //   -n (Waagen, Tueten, Birnen), -er (Schilder), Umlaut+e (Koerbe),
  //   nur Umlaut (Aepfel), kein Plural (Geld).
  // -------------------------------------------------------------------------
  wortschatz: [
    // --- Lernwoerter ---
    {
      id: 'waage',
      genus: 'die',
      nomen: 'Waage',
      plural: 'die Waagen',
      beispiel: 'Die Äpfel liegen auf der Waage.',
      erklaerung: 'Damit misst man, wie schwer etwas ist.',
      neu: true,
      punkt: { x: 70, y: 51 },
      labelSeite: 'oben',
    },
    {
      id: 'schild',
      genus: 'das',
      nomen: 'Schild',
      plural: 'die Schilder',
      beispiel: 'Auf dem Schild steht der Preis.',
      erklaerung: 'Ein kleines Brett mit Schrift darauf. Es sagt dir etwas.',
      neu: true,
      punkt: { x: 61, y: 36 },
      labelSeite: 'oben',
    },
    {
      id: 'korb',
      genus: 'der',
      nomen: 'Korb',
      plural: 'die Körbe',
      beispiel: 'Mia trägt den Korb nach Hause.',
      erklaerung: 'Darin trägst du deine Sachen. Er ist oft aus Holz geflochten.',
      neu: true,
      punkt: { x: 89, y: 17 },
      labelSeite: 'unten',
    },
    {
      id: 'tuete',
      genus: 'die',
      nomen: 'Tüte',
      plural: 'die Tüten',
      beispiel: 'Die Äpfel kommen in eine Tüte.',
      erklaerung: 'Aus Papier oder Plastik. Du packst etwas hinein.',
      neu: true,
      punkt: { x: 85, y: 80 },
      labelSeite: 'links',
    },
    {
      id: 'geld',
      genus: 'das',
      nomen: 'Geld',
      plural: null,
      beispiel: 'Mia bezahlt das Brot mit ihrem Geld.',
      erklaerung: 'Münzen und Scheine. Damit bezahlst du.',
      neu: true,
      punkt: { x: 93, y: 88 },
      labelSeite: 'links',
    },
    {
      id: 'apfel',
      genus: 'der',
      nomen: 'Apfel',
      plural: 'die Äpfel',
      beispiel: 'Ich esse jeden Tag einen Apfel.',
      erklaerung: 'Eine runde Frucht. Sie ist rot oder grün.',
      neu: true,
      punkt: { x: 11, y: 28 },
      labelSeite: 'unten',
    },
    {
      id: 'birne',
      genus: 'die',
      nomen: 'Birne',
      plural: 'die Birnen',
      beispiel: 'Die Birne schmeckt süß.',
      erklaerung: 'Eine Frucht. Unten ist sie dick, oben schmal.',
      neu: true,
      punkt: { x: 11, y: 58 },
      labelSeite: 'unten',
    },

    // --- Stuetzwoerter (bekannt, nicht abgefragt) ---
    {
      id: 'tomate',
      genus: 'die',
      nomen: 'Tomate',
      plural: 'die Tomaten',
      beispiel: 'Die Tomate ist rot und rund.',
      erklaerung: 'Ein rotes Gemüse. Es ist weich und saftig.',
      neu: false,
      punkt: { x: 26, y: 64 },
      labelSeite: 'oben',
    },
    {
      id: 'kartoffel',
      genus: 'die',
      nomen: 'Kartoffel',
      plural: 'die Kartoffeln',
      beispiel: 'Wir kochen heute Kartoffeln.',
      erklaerung: 'Ein braunes Gemüse. Es wächst in der Erde.',
      neu: false,
      punkt: { x: 35, y: 65 },
      labelSeite: 'unten',
    },
    {
      id: 'karotte',
      genus: 'die',
      nomen: 'Karotte',
      plural: 'die Karotten',
      beispiel: 'Der Hase frisst eine Karotte.',
      erklaerung: 'Ein langes oranges Gemüse.',
      neu: false,
      punkt: { x: 43, y: 63 },
      labelSeite: 'oben',
    },
    {
      id: 'brot',
      genus: 'das',
      nomen: 'Brot',
      plural: 'die Brote',
      beispiel: 'Zum Frühstück esse ich ein Brot.',
      erklaerung: 'Es wird aus Mehl gebacken. Man isst es jeden Tag.',
      neu: false,
      punkt: { x: 52, y: 65 },
      labelSeite: 'unten',
    },
    {
      id: 'kaese',
      genus: 'der',
      nomen: 'Käse',
      plural: 'die Käse',
      beispiel: 'Der Käse riecht sehr stark.',
      erklaerung: 'Man macht ihn aus Milch. Er ist gelb oder weiß.',
      neu: false,
      punkt: { x: 62, y: 65 },
      labelSeite: 'oben',
    },
    {
      id: 'ei',
      genus: 'das',
      nomen: 'Ei',
      plural: 'die Eier',
      beispiel: 'Zum Kuchen brauchen wir drei Eier.',
      erklaerung: 'Es kommt vom Huhn. Außen ist eine dünne Schale.',
      neu: false,
      punkt: { x: 73, y: 67 },
      labelSeite: 'unten',
    },
    {
      id: 'blume',
      genus: 'die',
      nomen: 'Blume',
      plural: 'die Blumen',
      beispiel: 'Die Blumen stehen in einem Eimer.',
      erklaerung: 'Sie wächst und ist bunt. Sie riecht gut.',
      neu: false,
      punkt: { x: 90, y: 40 },
      labelSeite: 'links',
    },
    {
      id: 'stand',
      genus: 'der',
      nomen: 'Stand',
      plural: 'die Stände',
      beispiel: 'An diesem Stand kaufen wir Obst.',
      erklaerung: 'Ein Tisch auf dem Markt. Dort verkauft jemand etwas.',
      neu: false,
      punkt: { x: 50, y: 86 },
      labelSeite: 'unten',
    },
  ],

  // -------------------------------------------------------------------------
  // Lesetext
  // -------------------------------------------------------------------------
  lesetext: {
    titel: 'Mia bezahlt allein',
    absaetze: [
      {
        id: 'a1',
        saetze: [
          'Jeden Samstag geht Mia mit ihrem Opa auf den Markt.',
          'Mia trägt einen Korb aus Holz.',
          'Der Korb ist noch ganz leer.',
        ],
      },
      {
        id: 'a2',
        saetze: [
          'Zuerst gehen sie zu Frau Yilmaz.',
          'Sie verkauft Obst und Gemüse.',
          'An ihrem Stand hängt ein Schild.',
          'Auf dem Schild steht der Preis.',
          'Mia liest das Schild laut vor.',
        ],
      },
      {
        id: 'a3',
        saetze: [
          '„Ich möchte Äpfel und Birnen“, sagt Mia.',
          'Frau Yilmaz legt sechs Äpfel auf die Waage.',
          'Die Waage zeigt genau ein Kilo.',
          'Dann füllt sie die Äpfel in eine Tüte.',
          'Die Birnen kommen auch in die Tüte.',
          'Mia stellt die Tüte in ihren Korb.',
        ],
      },
      {
        id: 'a4',
        saetze: [
          'Am nächsten Stand kaufen sie Brot und Käse.',
          'Der Käse riecht sehr stark.',
          'Mia hält sich die Nase zu.',
          'Opa lacht laut.',
        ],
      },
      {
        id: 'a5',
        saetze: [
          'Jetzt muss Mia bezahlen.',
          'Opa gibt ihr das Geld.',
          'Sie legt das Geld auf den Tisch.',
          'Heute bezahlt Mia zum ersten Mal allein.',
          'Sie ist ein bisschen stolz.',
        ],
      },
      {
        id: 'a6',
        saetze: [
          'Der Korb ist jetzt schwer.',
          'Opa trägt ihn nach Hause.',
          'Mia trägt nur die leichte Tüte.',
        ],
      },
    ],
    kennzahlen: {
      woerter: 156,
      saetze: 26,
      woerterProSatzDurchschnitt: 6.0,
      langstesWort: 'Wochenmarkt',
    },
  },

  // -------------------------------------------------------------------------
  // Aufgaben
  // -------------------------------------------------------------------------
  aufgaben: [
    {
      id: 'm1',
      typ: 'auswahl',
      frage: 'Was trägt Mia auf den Markt?',
      ebene: 'literal',
      abStufe: 'einfach',
      belegAbsatz: 'a1',
      optionen: [
        { id: 'o1', text: 'Eine Tasche' },
        { id: 'o2', text: 'Einen Korb' },
        { id: 'o3', text: 'Eine Tüte' },
        { id: 'o4', text: 'Einen Rucksack' },
      ],
      richtig: 'o2',
      hilfen: [
        'Lies den ersten Absatz noch einmal.',
        'Im zweiten Satz steht, was Mia trägt.',
      ],
      loesungserklaerung:
        'Im ersten Absatz steht: „Mia trägt einen Korb aus Holz.“ Die Tüte bekommt sie erst später am Stand.',
    },

    {
      id: 'm2',
      typ: 'wahrheit',
      frage: 'Stimmt das? Wähle: richtig, falsch oder steht nicht im Text.',
      ebene: 'literal',
      abStufe: 'einfach',
      aussagen: [
        {
          id: 'w1',
          text: 'Am Anfang ist der Korb leer.',
          richtig: 'richtig',
          begruendung: 'Im Text steht: „Der Korb ist noch ganz leer.“',
        },
        {
          id: 'w2',
          text: 'Mia und Opa kaufen Fleisch.',
          richtig: 'falsch',
          begruendung:
            'Sie kaufen Äpfel, Birnen, Brot und Käse. Von Fleisch steht nichts – und der Stand verkauft Obst und Gemüse.',
        },
        {
          id: 'w3',
          text: 'Mia hat einen Bruder.',
          richtig: 'unbekannt',
          begruendung:
            'Über Mias Familie steht nur, dass sie mit ihrem Opa unterwegs ist. Ob sie Geschwister hat, wissen wir nicht.',
        },
      ],
      hilfen: [
        'Suche zu jedem Satz die Stelle im Text.',
        'Wenn du die Stelle nicht findest, ist die Antwort vielleicht „steht nicht im Text“.',
      ],
      loesungserklaerung:
        'Achte auf den Unterschied: Etwas kann falsch sein – oder es steht einfach nicht im Text. Das ist nicht dasselbe.',
    },

    {
      id: 'm3',
      typ: 'luecken',
      frage: 'Setze die richtigen Wörter ein.',
      ebene: 'literal',
      abStufe: 'einfach',
      belegAbsatz: 'a3',
      teile: ['Frau Yilmaz legt sechs ', null, ' auf die ', null, '.'],
      loesungen: ['Äpfel', 'Waage'],
      wortbank: ['Äpfel', 'Waage', 'Birnen', 'Tüte', 'Schilder'],
      hilfen: [
        'Lies den dritten Absatz noch einmal.',
        'Nach „auf die“ kommt ein die-Wort.',
      ],
      loesungserklaerung:
        '„Frau Yilmaz legt sechs Äpfel auf die Waage.“ Das kleine Wort „die“ vor der Lücke verrät dir das Genus.',
    },

    {
      id: 'm4',
      typ: 'freitext',
      frage: 'Wohin stellt Mia die Tüte? Schreibe das Wort mit Artikel.',
      ebene: 'literal',
      abStufe: 'standard',
      belegAbsatz: 'a3',
      akzeptiert: ['der Korb', 'Korb', 'in den Korb', 'den Korb'],
      artikelPflicht: true,
      platzhalter: 'zum Beispiel: die Tasche',
      hilfen: [
        'Lies den letzten Satz von Absatz 3.',
        'Das Wort hat vier Buchstaben und beginnt mit „K“.',
      ],
      loesungserklaerung:
        'Die Lösung ist „der Korb“. Im Text steht „in ihren Korb“ – das ist der Akkusativ. Die Grundform mit Artikel lautet „der Korb“.',
    },

    {
      id: 'm5',
      typ: 'reihenfolge',
      frage: 'Bringe die Ereignisse in die richtige Reihenfolge.',
      ebene: 'reorganisierend',
      abStufe: 'standard',
      schritte: [
        { id: 's1', text: 'Mia geht mit einem leeren Korb auf den Markt.' },
        { id: 's2', text: 'Mia liest das Schild am Stand von Frau Yilmaz.' },
        { id: 's3', text: 'Frau Yilmaz legt die Äpfel auf die Waage.' },
        { id: 's4', text: 'Mia bezahlt zum ersten Mal allein.' },
        { id: 's5', text: 'Opa trägt den schweren Korb nach Hause.' },
      ],
      hilfen: [
        'Womit fängt die Geschichte an? Was passiert ganz zuletzt?',
        'Geh die Absätze der Reihe nach durch – so wird die Geschichte erzählt.',
      ],
      loesungserklaerung:
        'Die Geschichte läuft von vorne nach hinten: ankommen, lesen, wiegen, bezahlen, nach Hause gehen.',
    },

    {
      id: 'm6',
      typ: 'artikel',
      frage: 'Welcher Artikel passt? Ordne jedem Wort der, die oder das zu.',
      ebene: 'sprachbetrachtend',
      abStufe: 'standard',
      woerter: ['waage', 'schild', 'korb', 'tuete', 'geld', 'apfel', 'birne'],
      hilfen: [
        'Schau dir das Bild oben noch einmal an – dort steht jeder Artikel dabei.',
        'Merkhilfe: Viele Wörter auf -e sind feminin (die Waage, die Tüte, die Birne).',
      ],
      loesungserklaerung:
        'Der Artikel gehört fest zum Nomen und wird zusammen mit ihm gelernt. „Waage“ allein ist nur ein halbes Wort.',
    },

    {
      id: 'm7',
      typ: 'auswahl',
      frage: 'Warum ist der Korb am Ende schwer?',
      ebene: 'inferentiell',
      abStufe: 'anspruchsvoll',
      belegAbsatz: 'a6',
      optionen: [
        { id: 'p1', text: 'Weil er aus Holz ist.' },
        { id: 'p2', text: 'Weil jetzt viele Sachen darin sind.' },
        { id: 'p3', text: 'Weil Opa ihn trägt.' },
        { id: 'p4', text: 'Weil es geregnet hat.' },
      ],
      richtig: 'p2',
      hilfen: [
        'Am Anfang war der Korb leer. Was ist seitdem passiert?',
        'Im Text steht nicht „der Korb ist voll“. Du musst es selbst erschließen.',
      ],
      loesungserklaerung:
        'Das steht nirgends wörtlich im Text. Am Anfang ist der Korb leer, dann kommen Äpfel, Birnen, Brot und Käse hinein – daraus kannst du schließen, warum er schwer wird. Das nennt man „zwischen den Zeilen lesen“.',
    },
  ],

  // -------------------------------------------------------------------------
  // Lehrkraft-Ebene
  // -------------------------------------------------------------------------
  lernziele: [
    'Die Schülerinnen und Schüler benennen sieben Gegenstände rund um den Einkauf mit dem korrekten bestimmten Artikel.',
    'Sie bilden zu diesen Nomen die Pluralform und begegnen dabei fünf verschiedenen Pluraltypen.',
    'Sie erkennen, dass „das Geld“ keine Pluralform hat.',
    'Sie entnehmen einem kurzen erzählenden Text gezielt Einzelinformationen (literales Verstehen).',
    'Sie unterscheiden zwischen einer im Text belegten und einer nicht belegten Aussage.',
    'Sie erschließen eine nicht ausgesprochene Ursache aus dem Textzusammenhang (inferentielles Verstehen).',
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
    {
      quelle: 'Gemeinsamer Europäischer Referenzrahmen (GER)',
      bereich: 'Mündliche Interaktion, Niveau A2',
      formulierung:
        'Kann in Geschäften einfache Auskünfte erfragen, nach dem Preis fragen und einfache Einkäufe tätigen.',
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
        'Vorentlastung: echtes Obst mitbringen und benennen lassen.',
      ],
    },
    {
      stufe: 'standard',
      fuerWen: 'Zielgruppe des Moduls: A2, ein bis drei Jahre Deutschkontakt',
      massnahmen: [
        'Sechs Aufgaben inklusive Freitext und Artikelzuordnung.',
        'Bild-Wort-Teil zuerst „Entdecken“, danach „Üben“.',
        'Hilfen erst nach dem ersten eigenen Versuch anbieten.',
      ],
    },
    {
      stufe: 'anspruchsvoll',
      fuerWen: 'Kinder, die den Wortschatz sicher beherrschen, Niveau A2+ bis B1',
      massnahmen: [
        'Alle sieben Aufgaben inklusive der Inferenzfrage.',
        'Bild-Wort-Teil direkt im Modus „Üben“ ohne Beschriftungen.',
        'Anschlussauftrag: ein Verkaufsgespräch zu zweit spielen – „Was kostet …?“, „Ich möchte …“.',
      ],
    },
  ],

  unterrichtshinweise: [
    'Vorentlastung (5 Min.): Bringen Sie echtes Obst mit. Jedes Kind nimmt eines und sagt „Das ist ein Apfel“. Der Unterschied zwischen „ein Apfel“ und „der Apfel“ lässt sich hier ganz nebenbei zeigen.',
    'Dieses Modul eignet sich als Anschluss an „Im Klassenzimmer“: dieselbe Struktur, anderer Lebensbereich. Der Vergleich der beiden Wortschätze macht die Artikelfarben zusätzlich einprägsam.',
    'Der Plural ist hier der eigentliche Lernschwerpunkt. Fünf verschiedene Typen kommen vor, darunter „die Äpfel“ (nur Umlaut) und „das Geld“ (gar kein Plural). Diese beiden lohnen eine eigene kurze Besprechung.',
    'Das Bild ist eine Fotografie-Alternative: Es stammt aus einer Bildgenerierung und ist bewusst gezeichnet, nicht fotografiert. Kinder erkennen Gegenstände in klaren Illustrationen zuverlässiger als auf Fotos mit unruhigem Hintergrund.',
    'Nacharbeit: Ein echter Einkaufszettel als Hausaufgabe – drei Dinge mit Artikel aufschreiben, die zu Hause gebraucht werden.',
  ],
}
