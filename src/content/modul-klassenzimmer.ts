import type { Modul } from './types'

/**
 * Demo-Modul "Im Klassenzimmer" - Deutsch als Zweitsprache, A2, Klasse 3/4.
 *
 * Redaktionelle Grundsatzentscheidungen (bewusst, mit Begruendung):
 *
 * 1. DREIZEHN Lernwoerter, aber NIE alle auf einmal. Das Arbeitsgedaechtnis
 *    von 9- bis 11-Jaehrigen verarbeitet 4-7 neue Einheiten (Miller 1956,
 *    Cognitive Load Theory). Die Antwort darauf ist nicht, Woerter
 *    wegzulassen - Bleistift, Buntstift, Zirkel und Geodreieck braucht ein
 *    Kind im Unterricht taeglich -, sondern sie zu PORTIONIEREN: Das Bild
 *    zeigt alles, geuebt wird paketweise mit hoechstens fuenf Woertern
 *    (siehe `wortpakete`). Dazu kommen acht bekannte Stuetzwoerter, die
 *    beschriftet, aber nicht abgefragt werden.
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
 *
 * 5. Nicht alles passiert am Bildschirm. Merktexte, Vokabeln und eigene
 *    Saetze gehoeren ins Heft (siehe `heftauftraege` und `grammatik`). Was
 *    ein Kind selbst formuliert, korrigiert eine Lehrperson - nicht die App.
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
  // Wortschatz - 13 Lernwoerter (neu: true) + 8 Stuetzwoerter (neu: false)
  // Die Koordinaten sind der VERTRAG mit der SVG-Szene: jedes Wort hat dort
  // eine Gruppe mit derselben id an genau dieser Position.
  //
  // Anordnung auf der Tischplatte: obere Objektreihe y = 59 (sieben Sachen),
  // untere y = 75 (fuenf). Die x-Werte sind krumm, weil sie aus einer
  // Randbedingung folgen und nicht aus Geschmack:
  //
  // Eine Beschriftung ist rund 48 px hoch - das ist die Mindestgroesse fuer
  // ein Tippziel (WCAG 2.5.5) und damit nicht verhandelbar. Umgerechnet auf
  // die Bildkoordinaten sind das etwa 75 Einheiten. Zwischen den beiden
  // Objektreihen liegen 144 Einheiten; dort passen also GENAU ZWEI
  // Beschriftungsbaender uebereinander, kein drittes.
  //
  // Deshalb: Die obere Reihe verteilt ihre Beschriftungen abwechselnd nach
  // oben und unten (zwei Baender zu vier bzw. drei), die untere Reihe setzt
  // alle nach unten (ein Band zu fuenf). Ergebnis: hoechstens fuenf
  // Beschriftungen je Band mit 16 % Abstand - genug fuer das laengste Wort
  // ("der Radiergummi"). Zwoelf nebeneinander waeren es 6 % gewesen.
  // -------------------------------------------------------------------------
  wortschatz: [
    // --- Lernwoerter: Schreiben und Radieren ---
    {
      id: 'bleistift',
      genus: 'der',
      nomen: 'Bleistift',
      plural: 'die Bleistifte',
      beispiel: 'Mit dem Bleistift kann ich radieren.',
      erklaerung: 'Ein Stift aus Holz mit grauer Mine. Was du damit schreibst, kannst du wegradieren.',
      neu: true,
      punkt: { x: 36, y: 75 },
      labelSeite: 'unten',
    },
    {
      id: 'buntstift',
      genus: 'der',
      nomen: 'Buntstift',
      plural: 'die Buntstifte',
      beispiel: 'Ich male den Baum mit einem grünen Buntstift.',
      erklaerung: 'Ein Stift, der in einer Farbe schreibt. Es gibt ihn in vielen Farben.',
      neu: true,
      punkt: { x: 68, y: 75 },
      labelSeite: 'unten',
    },
    {
      id: 'radiergummi',
      genus: 'der',
      nomen: 'Radiergummi',
      plural: 'die Radiergummis',
      beispiel: 'Mit dem Radiergummi mache ich den Fehler weg.',
      erklaerung: 'Damit machst du etwas weg, das du mit Bleistift geschrieben hast.',
      neu: true,
      punkt: { x: 50.5, y: 59 },
      labelSeite: 'unten',
    },
    {
      id: 'spitzer',
      genus: 'der',
      nomen: 'Spitzer',
      plural: 'die Spitzer',
      beispiel: 'Mein Stift ist stumpf. Ich brauche den Spitzer.',
      erklaerung: 'Damit machst du deinen Stift wieder spitz.',
      neu: true,
      punkt: { x: 82, y: 59 },
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
      punkt: { x: 84, y: 75 },
      labelSeite: 'unten',
    },

    // --- Lernwoerter: Messen und Schneiden ---
    {
      id: 'lineal',
      genus: 'das',
      nomen: 'Lineal',
      plural: 'die Lineale',
      beispiel: 'Mit dem Lineal male ich eine gerade Linie.',
      erklaerung: 'Ein flaches, langes Ding. Damit malst du gerade Linien.',
      neu: true,
      punkt: { x: 27.5, y: 59 },
      labelSeite: 'unten',
    },
    {
      id: 'geodreieck',
      genus: 'das',
      nomen: 'Geodreieck',
      plural: 'die Geodreiecke',
      beispiel: 'Das Geodreieck ist durchsichtig.',
      erklaerung: 'Ein Dreieck aus durchsichtigem Kunststoff. Damit misst du Linien und Winkel.',
      neu: true,
      punkt: { x: 39, y: 59 },
      labelSeite: 'oben',
    },
    {
      id: 'zirkel',
      genus: 'der',
      nomen: 'Zirkel',
      plural: 'die Zirkel',
      beispiel: 'Mit dem Zirkel male ich einen Kreis.',
      erklaerung: 'Ein Gerät mit zwei Beinen. Damit malst du Kreise.',
      neu: true,
      punkt: { x: 73.5, y: 59 },
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
      punkt: { x: 62, y: 59 },
      labelSeite: 'oben',
    },

    // --- Lernwoerter: Der Klassenraum ---
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
      id: 'tuer',
      genus: 'die',
      nomen: 'Tür',
      plural: 'die Türen',
      beispiel: 'Bitte mach die Tür zu!',
      erklaerung: 'Dadurch gehst du in den Raum hinein und wieder hinaus.',
      neu: true,
      punkt: { x: 74, y: 28 },
      labelSeite: 'oben',
    },
    {
      id: 'pflanze',
      genus: 'die',
      nomen: 'Pflanze',
      plural: 'die Pflanzen',
      beispiel: 'Die Pflanze steht auf der Fensterbank.',
      erklaerung: 'Sie ist grün und lebt. Sie braucht Wasser und Licht.',
      neu: true,
      punkt: { x: 6, y: 27 },
      labelSeite: 'rechts',
    },
    {
      id: 'papierkorb',
      genus: 'der',
      nomen: 'Papierkorb',
      plural: 'die Papierkörbe',
      beispiel: 'Das alte Blatt kommt in den Papierkorb.',
      erklaerung: 'Da wirfst du Papier hinein, das du nicht mehr brauchst.',
      neu: true,
      punkt: { x: 94, y: 88 },
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
      labelSeite: 'oben',
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
      punkt: { x: 8, y: 80 },
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
      punkt: { x: 16, y: 59 },
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
      punkt: { x: 20, y: 75 },
      labelSeite: 'unten',
    },
    {
      id: 'stift',
      genus: 'der',
      nomen: 'Stift',
      plural: 'die Stifte',
      beispiel: 'Mein Stift schreibt blau.',
      erklaerung: 'Damit schreibst du. Er schreibt mit Tinte, nicht mit Blei.',
      neu: false,
      punkt: { x: 52, y: 75 },
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
      punkt: { x: 20, y: 88 },
      labelSeite: 'unten',
    },
  ],

  // -------------------------------------------------------------------------
  // Lernpakete - hoechstens fuenf Woerter je Durchgang
  //
  // Die Aufteilung folgt der TAETIGKEIT, nicht dem Alphabet und nicht der
  // Position im Bild: Was man zusammen benutzt, lernt man zusammen. Wer
  // "Zirkel" lernt, lernt im selben Atemzug "Geodreieck" - im
  // Geometrieunterricht liegen beide nebeneinander auf dem Tisch.
  // -------------------------------------------------------------------------
  wortpakete: [
    {
      id: 'schreiben',
      titel: 'Schreiben und Radieren',
      woerter: ['bleistift', 'buntstift', 'radiergummi', 'spitzer', 'kleber'],
    },
    {
      id: 'messen',
      titel: 'Messen und Schneiden',
      woerter: ['lineal', 'geodreieck', 'zirkel', 'schere'],
    },
    {
      id: 'raum',
      titel: 'Der Klassenraum',
      woerter: ['tafel', 'tuer', 'pflanze', 'papierkorb'],
    },
  ],

  // -------------------------------------------------------------------------
  // Auftraege fuer die beiden Hefte
  //
  // Warum ueberhaupt Papier neben einer App: Ein Wort, das man einmal selbst
  // geschrieben und in die eigene Sprache uebersetzt hat, sitzt anders als
  // eines, das man angetippt hat. Und ein Vokabelheft funktioniert auch dann,
  // wenn kein Geraet da ist. Die App ersetzt das Heft nicht - sie fuehrt
  // hinein.
  // -------------------------------------------------------------------------
  heftauftraege: [
    {
      id: 'h-vokabeln',
      typ: 'heft',
      heft: 'vokabelheft',
      frage: 'Schreibe die neuen Wörter in dein Vokabelheft und übersetze sie in deine Sprache.',
      ebene: 'sprachbetrachtend',
      abStufe: 'einfach',
      imHeft: true,
      abschreiben: [
        'der Bleistift',
        'der Buntstift',
        'der Radiergummi',
        'der Spitzer',
        'der Kleber',
        'das Lineal',
        'das Geodreieck',
        'der Zirkel',
        'die Schere',
        'die Tafel',
        'die Tür',
        'die Pflanze',
        'der Papierkorb',
      ],
      umfang: 'Alle dreizehn Wörter, immer mit Artikel.',
      hilfen: [
        'Schreibe den Artikel immer mit – der, die oder das gehört zum Wort dazu.',
        'Male hinter jedes Wort ein kleines Bild. Das hilft dir beim Wiederholen.',
      ],
      loesungserklaerung:
        'Ein Nomen lernt man nie allein, sondern immer zusammen mit seinem Artikel. Deshalb steht er in deinem Vokabelheft in jeder Zeile mit.',
    },
    {
      id: 'h-tisch-saetze',
      typ: 'heft',
      heft: 'linguiniheft',
      frage: 'Schau dir den Tisch an. Schreibe fünf Sätze über die Sachen in dein Heft.',
      ebene: 'sprachbetrachtend',
      abStufe: 'einfach',
      imHeft: true,
      bildSzene: 'tisch',
      musterSaetze: ['Das Geodreieck ist durchsichtig.', 'Das Lineal ist gelb.'],
      umfang: 'Fünf eigene Sätze.',
      hilfen: [
        'Fang jeden Satz mit dem Artikel an: Der …, Die …, Das …',
        'Schreib dazu, welche Farbe die Sache hat oder wie sie aussieht.',
      ],
      loesungserklaerung:
        'Hier gibt es keine einzige richtige Lösung – jedes Kind wählt andere Gegenstände. Deine Lehrerin oder dein Lehrer schaut sich an, ob die Artikel und die Schreibweise stimmen.',
    },
    {
      id: 'h-steckbrief',
      typ: 'heft',
      heft: 'linguiniheft',
      frage: 'Erstelle einen Steckbrief: Das ist in meiner Schultasche.',
      ebene: 'wertend',
      abStufe: 'standard',
      imHeft: true,
      musterSaetze: [
        'In meiner Schultasche sind: ein Heft, zwei Bleistifte und eine Schere.',
        'Mein Lieblingsstift ist blau.',
      ],
      umfang: 'Sechs bis acht Zeilen.',
      hilfen: [
        'Zähle zuerst auf, was du dabeihast. Denk an die Zahlwörter: ein, zwei, drei …',
        'Schreib zum Schluss einen Satz darüber, was du am liebsten benutzt.',
      ],
      loesungserklaerung:
        'Ein Steckbrief ist ein eigener Text. Die App kann ihn nicht bewerten – zeig ihn deiner Lehrerin oder deinem Lehrer.',
    },
  ],

  // -------------------------------------------------------------------------
  // Grammatik: erst der Hefteintrag, dann die Uebung
  // -------------------------------------------------------------------------
  grammatik: [
    {
      id: 'ist-sind',
      titel: 'Ist / sind',
      untertitel: 'Einzahl und Mehrzahl',
      hefteintrag: [
        {
          art: 'regel',
          schluesselwort: 'ist',
          ton: 'einzahl',
          text: 'verwenden wir, wenn es eine Person oder eine Sache gibt.',
          bild: [{ wortId: 'buch', anzahl: 1 }],
        },
        {
          art: 'regel',
          schluesselwort: 'sind',
          ton: 'mehrzahl',
          text: 'verwenden wir, wenn es mehrere Personen oder Sachen gibt.',
          bild: [{ wortId: 'buch', anzahl: 3 }],
        },
        {
          art: 'gegenueberstellung',
          titel: 'Beispiele aus dem Klassenzimmer',
          zeilen: [
            {
              links: 'Das ist der Radiergummi.',
              linksBild: { wortId: 'radiergummi', anzahl: 1 },
              rechts: 'Das sind zwei Radiergummis.',
              rechtsBild: { wortId: 'radiergummi', anzahl: 2 },
            },
            {
              links: 'Das ist die Schere.',
              linksBild: { wortId: 'schere', anzahl: 1 },
              rechts: 'Das sind drei Scheren.',
              rechtsBild: { wortId: 'schere', anzahl: 3 },
            },
            {
              links: 'Das ist der Bleistift.',
              linksBild: { wortId: 'bleistift', anzahl: 1 },
              rechts: 'Das sind vier Bleistifte.',
              rechtsBild: { wortId: 'bleistift', anzahl: 4 },
            },
          ],
        },
        {
          art: 'merke',
          zeilen: ['1 Sache oder 1 Person → ist', '2 oder mehr Sachen oder Personen → sind'],
        },
        {
          art: 'wichtig',
          text: 'Nach Zahlen größer als eins steht das Nomen in der Mehrzahl.',
          beispiele: ['ein Radiergummi', 'zwei Radiergummis', 'drei Radiergummis'],
        },
      ],
      hinweise: [
        'Der Hefteintrag wird abgeschrieben, bevor die Übungen freigeschaltet werden. Die Regel steht danach in der eigenen Handschrift im Heft und ist auch ohne Gerät nachschlagbar.',
        'Die häufigste Fehlerquelle ist nicht „ist/sind“, sondern das fehlende Plural-s am Nomen. Die Übung meldet das als eigene Fehlerart „Numerus“ zurück.',
      ],
      aufgaben: [
        {
          id: 'g1-heft',
          typ: 'heft',
          heft: 'linguiniheft',
          frage: 'Schreibe den Merktext in dein Linguini-Heft.',
          ebene: 'sprachbetrachtend',
          abStufe: 'einfach',
          imHeft: true,
          abschreiben: [
            'Ist / sind',
            'ist verwenden wir, wenn es eine Person oder eine Sache gibt.',
            'sind verwenden wir, wenn es mehrere Personen oder Sachen gibt.',
            'Das ist der Radiergummi. – Das sind zwei Radiergummis.',
            'Merke: Nach Zahlen größer als eins steht das Nomen in der Mehrzahl.',
          ],
          umfang: 'Der ganze Merktext mit einem Beispiel.',
          hilfen: ['Schreibe die Überschrift und unterstreiche sie mit dem Lineal.'],
          loesungserklaerung:
            'Diesen Text schreibst du 1:1 ab – er ist deine Merkhilfe für später. Deine Lehrerin oder dein Lehrer schaut, ob alles vollständig im Heft steht.',
        },
        {
          id: 'g1-menge',
          typ: 'menge',
          frage: 'Wie viele sind es? Schreibe den passenden Satz.',
          ebene: 'sprachbetrachtend',
          abStufe: 'einfach',
          mitIstSind: true,
          beispiel: [
            { wortId: 'schere', anzahl: 1, satz: 'Das ist die Schere.' },
            { wortId: 'schere', anzahl: 3, satz: 'Das sind drei Scheren.' },
          ],
          runden: [
            { id: 'r1', wortId: 'radiergummi', anzahl: 2 },
            { id: 'r2', wortId: 'bleistift', anzahl: 1 },
            { id: 'r3', wortId: 'zirkel', anzahl: 3 },
            { id: 'r4', wortId: 'geodreieck', anzahl: 4 },
          ],
          hilfen: [
            'Zähle zuerst die Gegenstände im Bild. Schreibe die Zahl als Wort: ein, zwei, drei, vier.',
            'Bei mehr als einem Stück brauchst du „sind“ – und das Nomen bekommt meistens ein s oder e am Ende.',
          ],
          loesungserklaerung:
            'Bei einem Stück heißt es „Das ist …“, ab zwei Stück „Das sind …“. Nach einer Zahl über eins steht das Nomen in der Mehrzahl: zwei Radiergummis, drei Zirkel, vier Geodreiecke.',
        },
        {
          id: 'g1-luecken',
          typ: 'luecken',
          frage: 'Setze ist oder sind ein.',
          ebene: 'sprachbetrachtend',
          abStufe: 'standard',
          teile: ['Das ', null, ' der Spitzer. Das ', null, ' zwei Lineale. Das ', null, ' die Tür.'],
          loesungen: ['ist', 'sind', 'ist'],
          wortbank: ['ist', 'sind'],
          hilfen: [
            'Schau bei jedem Satz nach, ob dort eine Zahl steht.',
            'Ohne Zahl und mit der, die oder das: immer „ist“.',
          ],
          loesungserklaerung:
            '„zwei Lineale“ sind mehrere – dort steht „sind“. Bei „der Spitzer“ und „die Tür“ geht es um je ein Stück, dort steht „ist“.',
        },
      ],
    },

    {
      id: 'ein-eine',
      titel: 'Ein / eine',
      untertitel: 'Der unbestimmte Artikel',
      hefteintrag: [
        {
          art: 'kasten',
          titel: 'Regel',
          zeilen: [
            'Im Deutschen haben Nomen (Namenwörter) einen Artikel.',
            'Der Artikel steht immer vor dem Nomen.',
            'Es gibt drei Geschlechter: der (männlich), das (sächlich), die (weiblich).',
          ],
        },
        {
          art: 'genusspalten',
          spalten: [
            {
              genus: 'der',
              bezeichnung: 'männlich',
              regel: 'der = ein',
              beispiele: [
                { satz: 'Das ist ein Bleistift.', bild: { wortId: 'bleistift', anzahl: 1 } },
                { satz: 'Das ist ein Radiergummi.', bild: { wortId: 'radiergummi', anzahl: 1 } },
                { satz: 'Das ist ein Spitzer.', bild: { wortId: 'spitzer', anzahl: 1 } },
              ],
            },
            {
              genus: 'das',
              bezeichnung: 'sächlich',
              regel: 'das = ein',
              beispiele: [
                { satz: 'Das ist ein Heft.', bild: { wortId: 'heft', anzahl: 1 } },
                { satz: 'Das ist ein Lineal.', bild: { wortId: 'lineal', anzahl: 1 } },
                { satz: 'Das ist ein Buch.', bild: { wortId: 'buch', anzahl: 1 } },
              ],
            },
            {
              genus: 'die',
              bezeichnung: 'weiblich',
              regel: 'die = eine',
              beispiele: [
                { satz: 'Das ist eine Schere.', bild: { wortId: 'schere', anzahl: 1 } },
                { satz: 'Das ist eine Tür.', bild: { wortId: 'tuer', anzahl: 1 } },
                { satz: 'Das ist eine Pflanze.', bild: { wortId: 'pflanze', anzahl: 1 } },
              ],
            },
          ],
        },
        {
          art: 'merke',
          zeilen: [
            'der = ein → für männliche Nomen (der Bleistift)',
            'das = ein → für sächliche Nomen (das Heft)',
            'die = eine → für weibliche Nomen (die Schere)',
          ],
        },
      ],
      hinweise: [
        'Nur „die“ bekommt ein -e. Das ist die ganze Regel – und genau deshalb funktioniert sie: Wer den bestimmten Artikel kennt, kennt automatisch den unbestimmten.',
        'Die Übung baut auf dem Wortschatz aus dem Bildteil auf. Kinder, die dort beim Genus unsicher waren, tauchen im Lehrkraft-Bereich unter „Genus unsicher“ auf.',
      ],
      aufgaben: [
        {
          id: 'g2-heft',
          typ: 'heft',
          heft: 'linguiniheft',
          frage: 'Schreibe den Merktext in dein Linguini-Heft.',
          ebene: 'sprachbetrachtend',
          abStufe: 'einfach',
          imHeft: true,
          abschreiben: [
            'Ein / eine',
            'Im Deutschen haben Nomen einen Artikel. Der Artikel steht vor dem Nomen.',
            'der = ein → für männliche Nomen (der Bleistift)',
            'das = ein → für sächliche Nomen (das Heft)',
            'die = eine → für weibliche Nomen (die Schere)',
          ],
          umfang: 'Der ganze Merktext.',
          hilfen: ['Schreibe „der“, „das“ und „die“ jeweils in der Farbe, die du auch in der App siehst.'],
          loesungserklaerung:
            'Diesen Text schreibst du 1:1 ab. Er ist deine Merkhilfe – deine Lehrerin oder dein Lehrer schaut, ob er vollständig im Heft steht.',
        },
        {
          id: 'g2-luecken',
          typ: 'luecken',
          frage: 'Setze ein oder eine ein.',
          ebene: 'sprachbetrachtend',
          abStufe: 'einfach',
          teile: [
            'Das ist ',
            null,
            ' Schere. Das ist ',
            null,
            ' Lineal. Das ist ',
            null,
            ' Zirkel. Das ist ',
            null,
            ' Pflanze.',
          ],
          loesungen: ['eine', 'ein', 'ein', 'eine'],
          wortbank: ['ein', 'eine'],
          hilfen: [
            'Frag dich zuerst: Heißt es der, die oder das?',
            'Nur bei die-Wörtern schreibst du „eine“. Bei der- und das-Wörtern immer „ein“.',
          ],
          loesungserklaerung:
            'die Schere → eine Schere. das Lineal → ein Lineal. der Zirkel → ein Zirkel. die Pflanze → eine Pflanze. Nur „die“ bekommt das -e.',
        },
        {
          id: 'g2-artikel',
          typ: 'artikel',
          frage: 'Welcher Artikel passt? Ordne jedem Wort der, die oder das zu.',
          ebene: 'sprachbetrachtend',
          abStufe: 'standard',
          woerter: ['bleistift', 'geodreieck', 'schere', 'zirkel', 'tuer', 'pflanze'],
          hilfen: [
            'Schau dir das Bild im Bereich „Bilder & Wörter“ noch einmal an – dort steht jeder Artikel dabei.',
            'Merkhilfe: Wörter auf -er sind oft maskulin (der Spitzer, der Zirkel).',
          ],
          loesungserklaerung:
            'Im Deutschen gehört der Artikel fest zum Nomen. Man lernt ihn am besten zusammen mit dem Wort – nie das Wort allein.',
        },
      ],
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
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Lehrkraft-Ebene
  // -------------------------------------------------------------------------
  lernziele: [
    'Die Schülerinnen und Schüler benennen dreizehn Gegenstände aus dem Klassenzimmer mit dem korrekten bestimmten Artikel.',
    'Sie bilden zu diesen Nomen die Pluralform und verwenden sie nach Zahlwörtern korrekt.',
    'Sie unterscheiden „ist“ und „sind“ in Abhängigkeit von der Anzahl.',
    'Sie leiten den unbestimmten Artikel (ein/eine) aus dem bestimmten Artikel ab.',
    'Sie entnehmen einem kurzen erzählenden Text gezielt Einzelinformationen (literales Verstehen).',
    'Sie unterscheiden zwischen einer im Text belegten und einer nicht belegten Aussage.',
    'Sie erschließen eine nicht ausgesprochene Ursache aus dem Textzusammenhang (inferentielles Verstehen).',
    'Sie schreiben eigene einfache Aussagesätze über Gegenstände und halten sie schriftlich fest.',
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
      quelle: 'LehrplanPLUS Bayern, Deutsch 3/4',
      bereich: 'Schreiben – Texte planen und verfassen',
      formulierung:
        'Die Schülerinnen und Schüler verfassen kurze eigene Texte zu Bildern und Anlässen aus dem Schulalltag.',
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
        'Einstieg über die bildgestützte Richtig-/Falsch-Aufgabe – ohne Lesetext lösbar.',
        'Nur ein Lernpaket pro Sitzung (fünf Wörter), nicht der ganze Wortschatz.',
        'Bild-Wort-Teil im Modus „Entdecken“: alle Beschriftungen bleiben sichtbar.',
        'Vorlesefunktion aktiv lassen; Text zuerst Satz für Satz anhören.',
        'Vorentlastung im Unterricht: die Gegenstände real auf den Tisch legen und benennen lassen.',
      ],
    },
    {
      stufe: 'standard',
      fuerWen: 'Zielgruppe des Moduls: A2, ein bis drei Jahre Deutschkontakt',
      massnahmen: [
        'Zwei Lernpakete pro Sitzung, danach der Schreiben-Modus im Bildteil.',
        'Beide Grammatikthemen mit Hefteintrag und anschließenden Übungen.',
        'Hilfen erst nach dem ersten eigenen Versuch anbieten.',
      ],
    },
    {
      stufe: 'anspruchsvoll',
      fuerWen: 'Kinder, die den Wortschatz sicher beherrschen, Niveau A2+ bis B1',
      massnahmen: [
        'Alle drei Lernpakete, Bild-Wort-Teil direkt im Modus „Schreiben“ ohne Beschriftungen.',
        'Zusätzlich die Inferenzfrage zum Lesetext.',
        'Schreibauftrag im Heft auf acht bis zehn Sätze erweitern.',
      ],
    },
  ],

  unterrichtshinweise: [
    'Vorentlastung (5 Min.): Legen Sie die Gegenstände eines Lernpakets real auf einen Tisch. Jedes Kind nimmt einen und sagt „Das ist …“. Erst danach an den Bildschirm.',
    'Die Artikelfarben (blau/rot/grün) entsprechen der in DaZ-Materialien üblichen Konvention. Wenn Sie im Unterricht andere Farben nutzen, weisen Sie einmal kurz darauf hin.',
    'Die Grammatikthemen sind so gebaut, dass der Hefteintrag VOR den Übungen steht. Planen Sie dafür eine Schreibphase ein – die App schaltet die Übungen erst danach frei.',
    'Aufgabe „Stimmt das?“ zum Lesetext (richtig / falsch / steht nicht im Text) ist erfahrungsgemäß die schwerste. Die dritte Option verhindert Raten, irritiert aber zunächst. Ein gemeinsames Beispiel an der Tafel lohnt sich.',
    'Die Schreibaufträge im Linguini-Heft werden bewusst NICHT von der App bewertet. Sie erscheinen im Lehrkraft-Bereich als Liste „wartet auf Korrektur“.',
    'Der Text hat einen sozialen Kern. Er eignet sich als Gesprächsanlass über das Ankommen in einer neuen Klasse – gerade wenn selbst neu zugewanderte Kinder in der Gruppe sind.',
    'Nacharbeit: Die Wortkarten aus dem Lehrkraft-Bereich ausdrucken und als Partnerspiel „Ich sehe was, was du nicht siehst“ einsetzen.',
  ],
}
