/**
 * Der Elternbrief in den Sprachen, die an einer Mittelschule tatsaechlich
 * gebraucht werden.
 *
 * Warum ueberhaupt:
 * Ein Brief an die Eltern eines DaZ-Kindes auf Deutsch erreicht haeufig genau
 * die Eltern nicht, um die es geht. Das Kind muss ihn dann selbst uebersetzen -
 * ausgerechnet das Kind, dessen Lernstand darin steht.
 *
 * Uebersetzt wird nur der FESTE RAHMEN. Die Lernwoerter bleiben deutsch, denn
 * sie sind der Gegenstand: "der Radiergummi" soll zu Hause auf Deutsch gesagt
 * werden, nicht auf Tuerkisch. So funktionieren auch die Elternbriefe, die
 * Schulen selbst verschicken.
 *
 * Keine Uebersetzungs-Schnittstelle, kein Dienst, kein Netzaufruf: Die Texte
 * stehen hier im Repository. Das ist nicht die bequemste Loesung, aber die
 * einzige, bei der nichts ueber das Kind das Geraet verlaesst.
 *
 * ACHTUNG - VOR DEM ECHTEN EINSATZ GEGENLESEN LASSEN.
 * Diese Fassungen sind sorgfaeltig, aber nicht muttersprachlich abgenommen.
 * Ein Elternbrief in schiefem Arabisch ist schlimmer als gar keiner: Er
 * beschaedigt genau das Vertrauen, das er herstellen soll. An einer
 * Mittelschule findet sich fuer jede dieser Sprachen jemand im Kollegium oder
 * in der Elternschaft, der in fuenf Minuten drueberliest.
 */

export type SprachCode = 'de' | 'en' | 'tr' | 'bks' | 'uk' | 'ar' | 'ro'

export interface Elternbrieftexte {
  code: SprachCode
  /** Bezeichnung IN DER SPRACHE SELBST - so findet sie, wer sie braucht. */
  eigenname: string
  /** Bezeichnung auf Deutsch, fuer die Lehrkraft beim Auswaehlen. */
  deutsch: string
  /** Schreibrichtung; nur Arabisch weicht ab. */
  richtung: 'ltr' | 'rtl'

  anrede: string
  titelGeuebt: string
  /** {thema} und {woerter} werden ersetzt; die Wortliste bleibt deutsch. */
  satzGeuebt: string
  titelKlappt: string
  satzAnfang: string
  satzArbeitet: string
  satzSelbstkorrektur: string
  titelWeiter: string
  /** {woerter} wird ersetzt. */
  satzArtikel: string
  satzLesen: string
  titelHilfe: string
  hilfen: [string, string, string]
  dank: string
  gruss: string
  unterschrift: string
}

export const ELTERNBRIEF_SPRACHEN: Elternbrieftexte[] = [
  {
    code: 'de',
    eigenname: 'Deutsch',
    deutsch: 'Deutsch',
    richtung: 'ltr',
    anrede: 'Liebe Eltern,',
    titelGeuebt: 'Was Ihr Kind heute geübt hat',
    satzGeuebt:
      'Ihr Kind hat zum Thema „{thema}“ gearbeitet. Es hat diese neuen Wörter gelernt: {woerter}. Danach hat es einen kurzen Text gelesen und dazu Fragen beantwortet.',
    titelKlappt: 'Was schon gut klappt',
    satzAnfang: 'Ihr Kind hat mit diesem Thema begonnen. Bald gibt es hier mehr zu berichten.',
    satzArbeitet: 'Ihr Kind arbeitet an diesem Thema und kommt gut voran.',
    satzSelbstkorrektur:
      'Wenn etwas nicht sofort richtig war, hat Ihr Kind oft selbst die richtige Antwort gefunden. Das ist eine sehr gute Fähigkeit.',
    titelWeiter: 'Woran wir weiter arbeiten',
    satzArtikel:
      'Wir üben weiter, welches kleine Wort vor einem Nomen steht: der, die oder das. Zum Beispiel bei diesen Wörtern: {woerter}.',
    satzLesen: 'Wir üben weiter das Lesen und Verstehen von kurzen Texten.',
    titelHilfe: 'Wie Sie zu Hause helfen können',
    hilfen: [
      'Benennen Sie zusammen Dinge zu Hause auf Deutsch, zum Beispiel: der Tisch, die Tür, das Fenster.',
      'Lassen Sie Ihr Kind laut vorlesen. Das ist wichtig, auch wenn nicht jedes Wort verstanden wird.',
      'Sprechen Sie mit Ihrem Kind in Ihrer eigenen Sprache. Wer seine erste Sprache gut kann, lernt Deutsch leichter.',
    ],
    dank: 'Vielen Dank für Ihre Unterstützung.',
    gruss: 'Mit freundlichen Grüßen',
    unterschrift: 'Unterschrift der Lehrkraft',
  },

  {
    code: 'en',
    eigenname: 'English',
    deutsch: 'Englisch',
    richtung: 'ltr',
    anrede: 'Dear parents,',
    titelGeuebt: 'What your child practised today',
    satzGeuebt:
      'Your child worked on the topic “{thema}”. These are the new words it learned: {woerter}. After that it read a short text and answered questions about it.',
    titelKlappt: 'What is already going well',
    satzAnfang: 'Your child has started this topic. There will be more to report soon.',
    satzArbeitet: 'Your child is working on this topic and is making good progress.',
    satzSelbstkorrektur:
      'When something was not right straight away, your child often found the correct answer without help. That is a very good skill.',
    titelWeiter: 'What we will keep working on',
    satzArtikel:
      'We keep practising which small word comes before a noun: der, die or das. For example with these words: {woerter}.',
    satzLesen: 'We keep practising reading and understanding short texts.',
    titelHilfe: 'How you can help at home',
    hilfen: [
      'Name things at home together in German, for example: der Tisch, die Tür, das Fenster.',
      'Let your child read aloud. This matters even if not every word is understood.',
      'Speak with your child in your own language. Children who know their first language well learn German more easily.',
    ],
    dank: 'Thank you very much for your support.',
    gruss: 'Kind regards',
    unterschrift: 'Teacher’s signature',
  },

  {
    code: 'tr',
    eigenname: 'Türkçe',
    deutsch: 'Türkisch',
    richtung: 'ltr',
    anrede: 'Sayın veliler,',
    titelGeuebt: 'Çocuğunuz bugün ne çalıştı',
    satzGeuebt:
      'Çocuğunuz „{thema}“ konusu üzerinde çalıştı. Şu yeni kelimeleri öğrendi: {woerter}. Ardından kısa bir metin okudu ve metinle ilgili soruları yanıtladı.',
    titelKlappt: 'Şimdiden iyi giden şeyler',
    satzAnfang: 'Çocuğunuz bu konuya yeni başladı. Yakında burada daha fazla bilgi olacak.',
    satzArbeitet: 'Çocuğunuz bu konu üzerinde çalışıyor ve iyi ilerliyor.',
    satzSelbstkorrektur:
      'Bir şey hemen doğru olmadığında, çocuğunuz doğru cevabı çoğu zaman kendi buldu. Bu çok değerli bir beceridir.',
    titelWeiter: 'Üzerinde çalışmaya devam edeceğimiz konular',
    satzArtikel:
      'İsimlerin önüne hangi küçük kelimenin geldiğini çalışmaya devam ediyoruz: der, die veya das. Örneğin şu kelimelerde: {woerter}.',
    satzLesen: 'Kısa metinleri okumayı ve anlamayı çalışmaya devam ediyoruz.',
    titelHilfe: 'Evde nasıl yardımcı olabilirsiniz',
    hilfen: [
      'Evdeki eşyaları birlikte Almanca adlandırın, örneğin: der Tisch, die Tür, das Fenster.',
      'Çocuğunuzun yüksek sesle okumasına izin verin. Her kelime anlaşılmasa bile bu önemlidir.',
      'Çocuğunuzla kendi dilinizde konuşun. Ana dilini iyi bilen bir çocuk Almancayı daha kolay öğrenir.',
    ],
    dank: 'Desteğiniz için çok teşekkür ederiz.',
    gruss: 'Saygılarımızla',
    unterschrift: 'Öğretmenin imzası',
  },

  {
    code: 'bks',
    eigenname: 'Bosanski / Hrvatski / Srpski',
    deutsch: 'Bosnisch / Kroatisch / Serbisch',
    richtung: 'ltr',
    anrede: 'Poštovani roditelji,',
    titelGeuebt: 'Šta je vaše dijete danas vježbalo',
    satzGeuebt:
      'Vaše dijete je radilo na temi „{thema}“. Naučilo je ove nove riječi: {woerter}. Zatim je pročitalo kratak tekst i odgovorilo na pitanja o njemu.',
    titelKlappt: 'Šta već dobro ide',
    satzAnfang: 'Vaše dijete je počelo s ovom temom. Uskoro će ovdje biti više informacija.',
    satzArbeitet: 'Vaše dijete radi na ovoj temi i dobro napreduje.',
    satzSelbstkorrektur:
      'Kada nešto nije bilo odmah tačno, vaše dijete je često samo pronašlo tačan odgovor. To je vrlo dobra sposobnost.',
    titelWeiter: 'Na čemu ćemo dalje raditi',
    satzArtikel:
      'Nastavljamo vježbati koja mala riječ stoji ispred imenice: der, die ili das. Na primjer kod ovih riječi: {woerter}.',
    satzLesen: 'Nastavljamo vježbati čitanje i razumijevanje kratkih tekstova.',
    titelHilfe: 'Kako možete pomoći kod kuće',
    hilfen: [
      'Zajedno imenujte stvari kod kuće na njemačkom, na primjer: der Tisch, die Tür, das Fenster.',
      'Pustite dijete da čita naglas. To je važno i onda kada ne razumije svaku riječ.',
      'Razgovarajte s djetetom na svom jeziku. Dijete koje dobro zna svoj prvi jezik lakše uči njemački.',
    ],
    dank: 'Hvala vam na podršci.',
    gruss: 'S poštovanjem',
    unterschrift: 'Potpis nastavnika/nastavnice',
  },

  {
    code: 'uk',
    eigenname: 'Українська',
    deutsch: 'Ukrainisch',
    richtung: 'ltr',
    anrede: 'Шановні батьки,',
    titelGeuebt: 'Що ваша дитина вивчала сьогодні',
    satzGeuebt:
      'Ваша дитина працювала над темою «{thema}». Вона вивчила такі нові слова: {woerter}. Потім прочитала короткий текст і відповіла на запитання до нього.',
    titelKlappt: 'Що вже виходить добре',
    satzAnfang: 'Ваша дитина почала цю тему. Незабаром тут буде більше інформації.',
    satzArbeitet: 'Ваша дитина працює над цією темою і робить добрі успіхи.',
    satzSelbstkorrektur:
      'Коли щось не виходило одразу, ваша дитина часто сама знаходила правильну відповідь. Це дуже добра здібність.',
    titelWeiter: 'Над чим ми працюємо далі',
    satzArtikel:
      'Ми й далі вправляємося, яке маленьке слово стоїть перед іменником: der, die чи das. Наприклад, у цих словах: {woerter}.',
    satzLesen: 'Ми й далі вправляємося читати й розуміти короткі тексти.',
    titelHilfe: 'Як ви можете допомогти вдома',
    hilfen: [
      'Називайте разом речі вдома німецькою, наприклад: der Tisch, die Tür, das Fenster.',
      'Дозвольте дитині читати вголос. Це важливо, навіть якщо зрозуміле не кожне слово.',
      'Розмовляйте з дитиною своєю мовою. Дитина, яка добре знає свою першу мову, легше вивчає німецьку.',
    ],
    dank: 'Щиро дякуємо за вашу підтримку.',
    gruss: 'З повагою',
    unterschrift: 'Підпис учителя / учительки',
  },

  {
    code: 'ar',
    eigenname: 'العربية',
    deutsch: 'Arabisch',
    richtung: 'rtl',
    anrede: 'أولياء الأمور الكرام،',
    titelGeuebt: 'ما تدرّب عليه طفلكم اليوم',
    satzGeuebt:
      'عمل طفلكم على موضوع «{thema}». وتعلّم هذه الكلمات الجديدة: {woerter}. ثم قرأ نصًا قصيرًا وأجاب عن أسئلة حوله.',
    titelKlappt: 'ما يسير على ما يرام',
    satzAnfang: 'بدأ طفلكم هذا الموضوع. سيكون هنا المزيد من المعلومات قريبًا.',
    satzArbeitet: 'يعمل طفلكم على هذا الموضوع ويتقدّم تقدّمًا جيدًا.',
    satzSelbstkorrektur:
      'عندما لا تكون الإجابة صحيحة من المرة الأولى، كثيرًا ما يجد طفلكم الإجابة الصحيحة بنفسه. هذه قدرة جيدة جدًا.',
    titelWeiter: 'ما سنواصل العمل عليه',
    satzArtikel:
      'نواصل التدرّب على الكلمة الصغيرة التي تسبق الاسم: der أو die أو das. مثلًا مع هذه الكلمات: {woerter}.',
    satzLesen: 'نواصل التدرّب على قراءة النصوص القصيرة وفهمها.',
    titelHilfe: 'كيف يمكنكم المساعدة في البيت',
    hilfen: [
      'سمّوا معًا أشياء في البيت بالألمانية، مثلًا: der Tisch, die Tür, das Fenster.',
      'دعوا طفلكم يقرأ بصوت عالٍ. هذا مهم حتى لو لم يفهم كل كلمة.',
      'تحدّثوا مع طفلكم بلغتكم. الطفل الذي يتقن لغته الأولى يتعلّم الألمانية بسهولة أكبر.',
    ],
    dank: 'شكرًا جزيلًا على دعمكم.',
    gruss: 'مع أطيب التحيات',
    unterschrift: 'توقيع المعلّم / المعلّمة',
  },

  {
    code: 'ro',
    eigenname: 'Română',
    deutsch: 'Rumänisch',
    richtung: 'ltr',
    anrede: 'Stimați părinți,',
    titelGeuebt: 'Ce a exersat copilul dumneavoastră astăzi',
    satzGeuebt:
      'Copilul dumneavoastră a lucrat la tema „{thema}”. A învățat aceste cuvinte noi: {woerter}. Apoi a citit un text scurt și a răspuns la întrebări despre el.',
    titelKlappt: 'Ce merge deja bine',
    satzAnfang: 'Copilul dumneavoastră a început această temă. În curând vor fi mai multe de spus aici.',
    satzArbeitet: 'Copilul dumneavoastră lucrează la această temă și progresează bine.',
    satzSelbstkorrektur:
      'Când ceva nu a fost corect din prima, copilul dumneavoastră a găsit deseori singur răspunsul corect. Aceasta este o capacitate foarte bună.',
    titelWeiter: 'La ce lucrăm mai departe',
    satzArtikel:
      'Continuăm să exersăm ce cuvânt mic stă înaintea unui substantiv: der, die sau das. De exemplu la aceste cuvinte: {woerter}.',
    satzLesen: 'Continuăm să exersăm citirea și înțelegerea textelor scurte.',
    titelHilfe: 'Cum puteți ajuta acasă',
    hilfen: [
      'Numiți împreună lucruri din casă în germană, de exemplu: der Tisch, die Tür, das Fenster.',
      'Lăsați copilul să citească cu voce tare. Acest lucru este important chiar dacă nu înțelege fiecare cuvânt.',
      'Vorbiți cu copilul în limba dumneavoastră. Un copil care își cunoaște bine prima limbă învață germana mai ușor.',
    ],
    dank: 'Vă mulțumim mult pentru sprijin.',
    gruss: 'Cu stimă',
    unterschrift: 'Semnătura cadrului didactic',
  },
]

/** Ersetzt {thema} und {woerter}; fehlende Platzhalter bleiben einfach aus. */
export function fuelle(vorlage: string, werte: Record<string, string>): string {
  return vorlage.replace(/\{(\w+)\}/g, (treffer, name: string) => werte[name] ?? treffer)
}
