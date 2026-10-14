/* أسئلة القواعد (Grammar) مقسمة حسب القاعدة — ملف مولّد بالسكربت tools/english/build_data.py (لا تعدّله يدوياً)
   o[0] = الإجابة الصحيحة (الخيارات تنخلط في الموقع) */
window.GRAMMAR = [
{
"rule": "Simple present",
"qs": [
{
"q": "Sulaiman and Fahad ..... from Saudi Arabia.",
"o": [
"are",
"is",
"am",
"am not"
],
"e": "Sulaiman and Fahad = شخصين (They) ← مع They نستخدم are."
},
{
"q": "He ..... really intelligent.",
"o": [
"is",
"am",
"are",
"am not"
],
"e": "He ← مع He / She / It نستخدم is."
},
{
"q": "The books ..... red and white.",
"o": [
"are",
"is",
"am",
"am not"
],
"e": "The books جمع (They) ← نستخدم are."
},
{
"q": "Sara and Noof ..... friends.",
"o": [
"are",
"is",
"am",
"am not"
],
"e": "Sara and Noof = شخصين (They) ← نستخدم are."
},
{
"q": "Badr and I ..... best friends.",
"o": [
"are",
"is",
"am",
"am not"
],
"e": "Badr and I = We ← مع We نستخدم are."
},
{
"q": "The university ..... a good place.",
"o": [
"is",
"am",
"are",
"am not"
],
"e": "The university مفرد (It) ← نستخدم is."
},
{
"q": "Where ..... the station?",
"o": [
"is",
"am",
"are",
"am not"
],
"e": "the station مفرد (It) ← في سؤال WH: WH + is + Subject."
},
{
"q": "How old ..... your brother?",
"o": [
"is",
"am",
"are",
"am not"
],
"e": "your brother مفرد (He) ← How old + is + Subject."
},
{
"q": "These books ..... very hard to understand.",
"o": [
"are",
"is",
"am",
"am not"
],
"e": "These books جمع (They) ← نستخدم are."
},
{
"q": "Saleh ..... a science teacher. He works at Kingdom School in Riyadh.",
"o": [
"is",
"are",
"aren't",
"am"
],
"e": "Saleh مفرد (He) ← نستخدم is."
},
{
"q": "Look at this cake my sister made. ..... the best baker in our family.",
"o": [
"She's",
"She'is",
"Shes'",
"She-is"
],
"e": "She's اختصار She is، والفاصلة العلوية مكان حرف i المحذوف (She + 's)."
},
{
"q": "I ..... a student at King Saud University.",
"o": [
"am",
"is",
"are",
"be"
],
"e": "I ← مع I نستخدم am فقط."
},
{
"q": "My parents ..... at home now.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "My parents جمع (They) ← نستخدم are."
},
{
"q": "..... you from Jeddah? Yes, I am.",
"o": [
"Are",
"Is",
"Am",
"Do"
],
"e": "سؤال Yes/No بفعل be: Verb be + Subject ← مع you نستخدم Are (والجواب Yes, I am)."
},
{
"q": "..... your sister a doctor? No, she isn't.",
"o": [
"Is",
"Are",
"Am",
"Does"
],
"e": "your sister = She ← سؤال Yes/No: Is + she… (والجواب No, she isn't)."
},
{
"q": "..... I late for the class?",
"o": [
"Am",
"Is",
"Are",
"Do"
],
"e": "I ← مع I نستخدم Am: Am I …?"
},
{
"q": "Is Ahmed in class? No, he ......",
"o": [
"isn't",
"aren't",
"doesn't",
"don't"
],
"e": "الجواب المختصر بنفس فعل السؤال: Is he…? ← No, he isn't."
},
{
"q": "Are they your friends? Yes, they ......",
"o": [
"are",
"is",
"do",
"am"
],
"e": "Are they…? ← الجواب Yes, they are."
},
{
"q": "Where ..... you from? I'm from Saudi Arabia.",
"o": [
"are",
"is",
"do",
"does"
],
"e": "WH + Verb be + Subject ← مع you نستخدم are: Where are you from?"
},
{
"q": "What ..... your name?",
"o": [
"is",
"are",
"do",
"am"
],
"e": "your name مفرد ← What is…?"
},
{
"q": "Who ..... those men?",
"o": [
"are",
"is",
"am",
"does"
],
"e": "those men جمع ← Who are…?"
},
{
"q": "How ..... your parents? They're fine, thank you.",
"o": [
"are",
"is",
"does",
"am"
],
"e": "your parents جمع (They) ← How are…?"
},
{
"q": "I ..... not hungry. I had a big breakfast.",
"o": [
"am",
"is",
"are",
"do"
],
"e": "النفي: Subject + Verb be + not ← مع I نستخدم am not."
},
{
"q": "We ..... in the library. We're at the café.",
"o": [
"aren't",
"isn't",
"don't",
"am not"
],
"e": "We ← النفي are not = aren't (والجملة الثانية توضّح إنهم مو في المكتبة)."
},
{
"q": "It ..... cold today. It's very hot!",
"o": [
"isn't",
"aren't",
"doesn't",
"don't"
],
"e": "It ← النفي is not = isn't (لأنه حار مو بارد)."
},
{
"q": "My brother ..... tall. He's only 150 cm.",
"o": [
"isn't",
"aren't",
"doesn't",
"am not"
],
"e": "My brother = He ← النفي isn't (لأن طوله 150 بس)."
},
{
"q": "Riyadh ..... the capital of Saudi Arabia.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "Riyadh مفرد (It) ← نستخدم is."
},
{
"q": "My friends and I ..... very busy this week.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "My friends and I = We ← نستخدم are."
},
{
"q": "Nora ..... shy. She talks to everyone.",
"o": [
"isn't",
"aren't",
"doesn't",
"don't"
],
"e": "Nora = She ← النفي isn't (لأنها تكلّم الكل، يعني مو خجولة). وdoesn't ما تجي مع صفة."
},
{
"q": "The children ..... in the garden.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "The children جمع (They) ← نستخدم are."
},
{
"q": "..... the museum open on Fridays?",
"o": [
"Is",
"Are",
"Does",
"Do"
],
"e": "the museum مفرد (It) + صفة open ← السؤال بـ Is وليس Does."
},
{
"q": "This bag ..... very expensive.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "This bag مفرد (It) ← نستخدم is."
},
{
"q": "..... we in the right room for the English class?",
"o": [
"Are",
"Is",
"Am",
"Do"
],
"e": "We ← سؤال Yes/No: Are we…?"
},
{
"q": "You ..... my best friend.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "You ← مع You نستخدم are."
},
{
"q": "My phone ..... on the table.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "My phone مفرد (It) ← نستخدم is."
},
{
"q": "..... it your first day at the university?",
"o": [
"Is",
"Are",
"Does",
"Am"
],
"e": "it ← سؤال Yes/No: Is it…?"
},
{
"q": "They ..... teachers. They are students.",
"o": [
"aren't",
"isn't",
"don't",
"doesn't"
],
"e": "They ← النفي are not = aren't (لأنهم طلاب مو معلمين)."
},
{
"q": "Where is my book? ..... on your desk.",
"o": [
"It's",
"Its",
"It'is",
"Its'"
],
"e": "It's = It is (الكتاب في مكان). أما Its بدون فاصلة فمعناها (ملكه)."
},
{
"q": "..... from Egypt. They're from Sudan.",
"o": [
"They aren't",
"They isn't",
"They don't",
"They not"
],
"e": "They ← النفي They aren't = They are not (لأنهم من السودان مو مصر)."
},
{
"q": "Khalid and Omar ..... brothers.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "Khalid and Omar = They ← نستخدم are."
},
{
"q": "Children usually ..... watching cartoons.",
"o": [
"like",
"likes",
"likeing",
"does like"
],
"e": "Children جمع (They) ← الفعل يبقى بدون s: like."
},
{
"q": "In many countries, people ..... until they are sixty-five.",
"o": [
"work",
"works",
"working",
"are work"
],
"e": "people جمع (They) ← الفعل بدون s: work."
},
{
"q": "Betty is not very kind. She ..... help old people.",
"o": [
"does not",
"do not",
"is not",
"are not"
],
"e": "She ← النفي: doesn't / does not + الفعل الأساسي (help)."
},
{
"q": "She usually ..... a lot of time to choose her clothes.",
"o": [
"spends",
"spending",
"spend",
"is spends"
],
"e": "She ← في الإثبات نضيف s للفعل: spends."
},
{
"q": "I always ..... my teacher's website to study English.",
"o": [
"visit",
"is visit",
"visits",
"visiting"
],
"e": "I ← الفعل بدون s: visit."
},
{
"q": "Please ..... put your things on the teacher's table.",
"o": [
"don't",
"doesn't",
"isn't",
"aren't"
],
"e": "الأمر بالنفي: Don't + الفعل الأساسي (Please don't put…)."
},
{
"q": "..... you always wear the same uniform every day?",
"o": [
"Do",
"Does",
"Is",
"Are"
],
"e": "you ← سؤال Yes/No: Do + Subject + verb."
},
{
"q": "Some teachers ..... much homework.",
"o": [
"give",
"gives",
"giveing",
"are give"
],
"e": "Some teachers جمع (They) ← الفعل بدون s: give."
},
{
"q": "..... your parents let you go to bed late?",
"o": [
"Do",
"Does",
"Is",
"Are"
],
"e": "your parents جمع (They) ← Do + Subject + verb."
},
{
"q": "How many books ..... you read in a year?",
"o": [
"do",
"does",
"are",
"is"
],
"e": "you ← WH + do + Subject: How many books do you read?"
},
{
"q": "..... your school have a big library? No, it ......",
"o": [
"Does / doesn't",
"Do / don't",
"Does / don't",
"Don't / Does"
],
"e": "your school مفرد (It) ← Does في السؤال، والجواب No, it doesn't."
},
{
"q": "He ..... much in class, but he gets A+ for the essays he writes.",
"o": [
"doesn't talk",
"doesn't",
"not talk",
"don't talk"
],
"e": "He ← النفي doesn't + الفعل الأساسي talk (بدون s)."
},
{
"q": "A: ..... to go tonight? B: Let's go to an art gallery first and then have dinner at Le Chateau.",
"o": [
"Where do you want",
"Where do you wanting",
"Where does you wanting",
"Where does you want"
],
"e": "you ← WH + do + Subject + الفعل الأساسي: Where do you want…?"
},
{
"q": "I ..... an Uber taxi at 7:00 every morning to be at work on time.",
"o": [
"book",
"books",
"booking",
"is book"
],
"e": "I ← الفعل بدون s: book."
},
{
"q": "My father ..... to work by car every day.",
"o": [
"goes",
"go",
"gos",
"going"
],
"e": "He ← الفعل المنتهي بـ o نضيف له es: go ← goes."
},
{
"q": "She ..... her homework after dinner.",
"o": [
"does",
"do",
"dos",
"doing"
],
"e": "She ← do ينتهي بـ o فنضيف es: does."
},
{
"q": "My brother ..... to fix his car himself.",
"o": [
"tries",
"trys",
"try",
"trying"
],
"e": "He ← قبل y حرف غير متحرك (r) فنحذف y ونضيف ies: try ← tries."
},
{
"q": "He ..... TV every evening.",
"o": [
"watches",
"watch",
"watchs",
"watching"
],
"e": "He ← الفعل المنتهي بـ ch نضيف له es: watch ← watches."
},
{
"q": "My mother ..... English at a primary school.",
"o": [
"teaches",
"teach",
"teachs",
"teaching"
],
"e": "She ← الفعل المنتهي بـ ch نضيف له es: teach ← teaches."
},
{
"q": "Ali ..... in a big hospital. He is a nurse.",
"o": [
"works",
"work",
"working",
"is work"
],
"e": "Ali = He ← نضيف s للفعل: works."
},
{
"q": "I ..... coffee. I only drink tea.",
"o": [
"don't drink",
"doesn't drink",
"don't drinks",
"not drink"
],
"e": "I ← النفي don't + الفعل الأساسي drink."
},
{
"q": "Sara ..... meat. She is a vegetarian.",
"o": [
"doesn't eat",
"don't eat",
"doesn't eats",
"not eat"
],
"e": "Sara = She ← النفي doesn't + الفعل الأساسي eat (بدون s)."
},
{
"q": "We ..... on Fridays.",
"o": [
"don't work",
"doesn't work",
"don't works",
"not work"
],
"e": "We ← النفي don't + الفعل الأساسي work."
},
{
"q": "My cat ..... milk.",
"o": [
"doesn't like",
"don't like",
"doesn't likes",
"not like"
],
"e": "My cat = It ← النفي doesn't + الفعل الأساسي like."
},
{
"q": "..... he like tennis? Yes, he does.",
"o": [
"Does",
"Do",
"Is",
"Are"
],
"e": "he ← سؤال Yes/No: Does + he + الفعل الأساسي، والجواب Yes, he does."
},
{
"q": "..... they live near the university? No, they don't.",
"o": [
"Do",
"Does",
"Are",
"Is"
],
"e": "they ← Do + they + verb، والجواب No, they don't."
},
{
"q": "Does your sister play the piano? Yes, she ......",
"o": [
"does",
"do",
"is",
"plays"
],
"e": "Does she…? ← الجواب المختصر Yes, she does."
},
{
"q": "Do you speak French? No, I ......",
"o": [
"don't",
"doesn't",
"am not",
"isn't"
],
"e": "Do you…? ← الجواب المختصر No, I don't."
},
{
"q": "Where ..... he live?",
"o": [
"does",
"do",
"is",
"are"
],
"e": "he ← WH + does + Subject: Where does he live?"
},
{
"q": "What time ..... you usually get up?",
"o": [
"do",
"does",
"are",
"is"
],
"e": "you ← WH + do + Subject: What time do you get up?"
},
{
"q": "What ..... your father do? He's an engineer.",
"o": [
"does",
"do",
"is",
"are"
],
"e": "your father = He ← What does he do? (سؤال عن الوظيفة)."
},
{
"q": "How ..... your brother go to school? By bus.",
"o": [
"does",
"do",
"is",
"are"
],
"e": "your brother = He ← How does he go…?"
},
{
"q": "When ..... the class start?",
"o": [
"does",
"do",
"is",
"are"
],
"e": "the class = It ← When does it start?"
},
{
"q": "Who ..... you live with?",
"o": [
"do",
"does",
"are",
"is"
],
"e": "you ← Who do you live with?"
},
{
"q": "The bus ..... at 7:30 every morning.",
"o": [
"leaves",
"leave",
"leaving",
"is leave"
],
"e": "The bus = It ← نضيف s للفعل: leaves."
},
{
"q": "My friends ..... football every Saturday.",
"o": [
"play",
"plays",
"playing",
"is play"
],
"e": "My friends جمع (They) ← الفعل بدون s: play."
},
{
"q": "The baby ..... a lot at night.",
"o": [
"cries",
"crys",
"cry",
"crying"
],
"e": "The baby = It ← قبل y حرف غير متحرك فنحذف y ونضيف ies: cries."
},
{
"q": "Noura ..... her grandmother every weekend.",
"o": [
"visits",
"visit",
"visiting",
"is visit"
],
"e": "Noura = She ← نضيف s للفعل: visits."
},
{
"q": "My parents ..... in a small village.",
"o": [
"live",
"lives",
"living",
"is live"
],
"e": "My parents جمع (They) ← الفعل بدون s: live."
},
{
"q": "He ..... his teeth twice a day.",
"o": [
"brushes",
"brush",
"brushs",
"brushing"
],
"e": "He ← الفعل المنتهي بـ sh نضيف له es: brush ← brushes."
}
]
},
{
"rule": "Adjectives + Adverbs (a / an)",
"qs": [
{
"q": "It's ..... class.",
"o": [
"a pretty interesting",
"pretty interesting",
"pretty a interesting",
"an pretty interesting"
],
"e": "اسم مفرد (class) يبدأ بحرف ساكن ← a + Adverb + Adjective + Noun: a pretty interesting class."
},
{
"q": "They are ......",
"o": [
"beautiful classes",
"a beautiful classes",
"an beautiful classes",
"classes beautiful"
],
"e": "classes جمع ← ما نحط a / an، والصفة قبل الاسم: beautiful classes."
},
{
"q": "I have ......",
"o": [
"smart students",
"a smart students",
"an smart students",
"smarts students"
],
"e": "students جمع ← بدون a / an، والصفة ما تنجمع: smart students."
},
{
"q": "It is ......",
"o": [
"a very safe school",
"very safe school",
"very a safe school",
"an very safe school"
],
"e": "school اسم مفرد ← a + very + safe + school."
},
{
"q": "This is ......",
"o": [
"an extremely quiet classroom",
"a extremely quiet classroom",
"extremely quiet classroom",
"extremely an quiet classroom"
],
"e": "تبدأ بـ extremely (حرف علة e) ← an extremely quiet classroom."
},
{
"q": "The ......",
"o": [
"building is really beautiful",
"building is a really beautiful",
"is building really beautiful",
"really building is beautiful"
],
"e": "Subject + Verb be + Adverb + Adjective: The building is really beautiful (بدون a لأنه ما فيه اسم بعد الصفة)."
},
{
"q": "That is ..... idea! I've heard it's not safe to go there after dark.",
"o": [
"a really bad",
"an extremely",
"a very",
"a bad really"
],
"e": "اسم مفرد (idea) ← a + Adverb + Adjective + Noun، وأول كلمة really حرف ساكن ← a really bad."
},
{
"q": "My teacher is kind and ...... If I don't understand my math lesson, she explains it to me again.",
"o": [
"helpful",
"a helpful",
"a helpfuls",
"helpfuls"
],
"e": "بعد Verb be صفة بدون اسم ← ما نحط a: kind and helpful. والصفة ما تنجمع."
},
{
"q": "Riyadh is ......",
"o": [
"a very big city",
"very big city",
"a city very big",
"an very big city"
],
"e": "city اسم مفرد ← a very big city (a لأن very يبدأ بحرف ساكن)."
},
{
"q": "My brother has ......",
"o": [
"an old car",
"a old car",
"old a car",
"car old"
],
"e": "old تبدأ بحرف علة (o) ← an old car."
},
{
"q": "She is ......",
"o": [
"an intelligent student",
"a intelligent student",
"intelligent a student",
"student intelligent"
],
"e": "intelligent تبدأ بحرف علة (i) ← an intelligent student."
},
{
"q": "The food here is ......",
"o": [
"really delicious",
"a really delicious",
"delicious really",
"really a delicious"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: really delicious."
},
{
"q": "We live in ......",
"o": [
"a quite small house",
"a small quite house",
"quite small a house",
"an quite small house"
],
"e": "house اسم مفرد ← a + quite + small + house (الظرف قبل الصفة)."
},
{
"q": "This is ..... book. I couldn't stop reading it.",
"o": [
"an extremely interesting",
"a extremely interesting",
"extremely interesting",
"an interesting extremely"
],
"e": "book اسم مفرد وأول كلمة extremely حرف علة ← an extremely interesting book."
},
{
"q": "The rooms in this hotel are ......",
"o": [
"very clean",
"a very clean",
"very cleans",
"cleans very"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a، والصفة ما تنجمع: very clean."
},
{
"q": "He is ......",
"o": [
"a pretty funny man",
"pretty funny man",
"a funny pretty man",
"an pretty funny man"
],
"e": "man اسم مفرد ← a + pretty + funny + man."
},
{
"q": "It was ......",
"o": [
"an easy test",
"a easy test",
"easy a test",
"test easy"
],
"e": "easy تبدأ بحرف علة (e) ← an easy test."
},
{
"q": "They are ......",
"o": [
"very friendly people",
"a very friendly people",
"very friendlys people",
"friendly very people"
],
"e": "people جمع ← بدون a، والصفة ما تنجمع: very friendly people."
},
{
"q": "My grandmother has ......",
"o": [
"an orange cat",
"a orange cat",
"orange a cat",
"an cat orange"
],
"e": "orange تبدأ بحرف علة (o) ← an orange cat."
},
{
"q": "The weather today is ......",
"o": [
"extremely hot",
"an extremely hot",
"hot extremely",
"a extremely hot"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: extremely hot."
},
{
"q": "Our campus is ......",
"o": [
"really modern",
"a really modern",
"modern really",
"really a modern"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: really modern."
},
{
"q": "This is ..... question. Nobody can answer it.",
"o": [
"a very difficult",
"an very difficult",
"very difficult",
"a difficult very"
],
"e": "question مفرد وأول كلمة very حرف ساكن ← a very difficult question."
},
{
"q": "I want to buy ......",
"o": [
"a cheap phone",
"an cheap phone",
"cheap a phone",
"phone cheap"
],
"e": "cheap يبدأ بحرف ساكن ← a cheap phone."
},
{
"q": "Fahad is ......",
"o": [
"an honest man",
"a honest man",
"honest a man",
"man honest"
],
"e": "honest نطقها يبدأ بصوت حرف علة (الـ h ما تنطق) ← an honest man."
},
{
"q": "These shoes are ......",
"o": [
"quite comfortable",
"a quite comfortable",
"comfortable quite",
"quite a comfortable"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: quite comfortable."
},
{
"q": "It's ..... day for a picnic.",
"o": [
"a really nice",
"a nice really",
"really a nice",
"an really nice"
],
"e": "day مفرد ← a + really + nice + day."
},
{
"q": "She has ......",
"o": [
"a very messy room",
"very messy room",
"a messy very room",
"an very messy room"
],
"e": "room مفرد ← a very messy room."
},
{
"q": "He is ......",
"o": [
"a university student",
"an university student",
"university a student",
"student university"
],
"e": "university نطقها يبدأ بصوت (يو) مو حرف علة ← a university student."
},
{
"q": "I ate ..... for breakfast.",
"o": [
"an apple",
"a apple",
"apple an",
"an apples"
],
"e": "apple تبدأ بحرف علة (a) ← an apple."
},
{
"q": "Saudi Arabia is ......",
"o": [
"a very beautiful country",
"very beautiful country",
"a beautiful very country",
"an very beautiful country"
],
"e": "country مفرد ← a very beautiful country."
},
{
"q": "My new classmates are ......",
"o": [
"pretty friendly",
"a pretty friendly",
"friendly pretty",
"pretty a friendly"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: pretty friendly."
},
{
"q": "This exercise is ......",
"o": [
"really easy",
"a really easy",
"easy really",
"an really easy"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: really easy."
},
{
"q": "That movie was ......",
"o": [
"extremely boring",
"an extremely boring",
"boring extremely",
"a extremely boring"
],
"e": "صفة بعد Verb be بدون اسم ← بدون a: extremely boring."
},
{
"q": "Look! It's ......",
"o": [
"an elephant",
"a elephant",
"elephant",
"an elephants"
],
"e": "Elephant تبدأ بحرف علة (e) ← an elephant (مثال الملزمة)."
},
{
"q": "She bought ..... dress for the party.",
"o": [
"a really expensive",
"an really expensive",
"really a expensive",
"a expensive really"
],
"e": "dress مفرد وأول كلمة really حرف ساكن ← a really expensive dress."
}
]
},
{
"rule": "Have / Has",
"qs": [
{
"q": "He ..... a shower in the morning.",
"o": [
"doesn't have",
"doesn't has",
"don't have",
"don't has"
],
"e": "He ← في النفي نستخدم have دائماً: doesn't have."
},
{
"q": "We ..... have time to play games.",
"o": [
"don't",
"doesn't",
"are",
"is"
],
"e": "We ← النفي don't + have."
},
{
"q": "Noof ..... a car.",
"o": [
"doesn't have",
"doesn't has",
"don't has",
"don't have"
],
"e": "Noof = She ← doesn't + have (في النفي ما نقول has)."
},
{
"q": "..... you have a house?",
"o": [
"Do",
"Does",
"Has",
"Are"
],
"e": "you ← السؤال Do + you + have."
},
{
"q": "Ahmed and Adnan ..... a big house.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "Ahmed and Adnan = They ← have."
},
{
"q": "What does he .....?",
"o": [
"have",
"is",
"has",
"are"
],
"e": "في السؤال بعد does نستخدم have: What does he have?"
},
{
"q": "Let's go to Riyadh Park. They ..... many different shops, restaurants, and movie theaters.",
"o": [
"have",
"having",
"has",
"has had"
],
"e": "They ← have."
},
{
"q": "I ..... two brothers and one sister.",
"o": [
"have",
"has",
"am",
"is"
],
"e": "I ← have."
},
{
"q": "My father ..... a new car.",
"o": [
"has",
"have",
"is",
"are"
],
"e": "My father = He ← has."
},
{
"q": "She ..... long black hair.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "She ← has."
},
{
"q": "We ..... a big garden behind our house.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "We ← have."
},
{
"q": "The university ..... a large library.",
"o": [
"has",
"have",
"are",
"having"
],
"e": "The university = It ← has."
},
{
"q": "Our teacher ..... a lot of books.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "Our teacher = He / She ← has."
},
{
"q": "You ..... a beautiful voice.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "You ← have."
},
{
"q": "My cat ..... green eyes.",
"o": [
"has",
"have",
"is",
"are"
],
"e": "My cat = It ← has."
},
{
"q": "They ..... an English exam tomorrow.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "They ← have."
},
{
"q": "Sara ..... a laptop. She uses her brother's.",
"o": [
"doesn't have",
"doesn't has",
"don't have",
"hasn't have"
],
"e": "Sara = She ← النفي doesn't have."
},
{
"q": "I ..... any money with me today.",
"o": [
"don't have",
"doesn't have",
"don't has",
"haven't have"
],
"e": "I ← النفي don't have."
},
{
"q": "My parents ..... a car. They take the bus.",
"o": [
"don't have",
"doesn't have",
"don't has",
"doesn't has"
],
"e": "My parents = They ← النفي don't have."
},
{
"q": "The hotel ..... a swimming pool.",
"o": [
"doesn't have",
"don't have",
"doesn't has",
"don't has"
],
"e": "The hotel = It ← النفي doesn't have."
},
{
"q": "..... your brother have a job?",
"o": [
"Does",
"Do",
"Has",
"Is"
],
"e": "your brother = He ← Does + he + have."
},
{
"q": "..... they have a big house?",
"o": [
"Do",
"Does",
"Has",
"Are"
],
"e": "they ← Do + they + have."
},
{
"q": "Does she have a phone? Yes, she ......",
"o": [
"does",
"has",
"have",
"is"
],
"e": "Does she…? ← الجواب Yes, she does."
},
{
"q": "Do you have a pen? No, I ......",
"o": [
"don't",
"doesn't",
"isn't",
"am not"
],
"e": "Do you…? ← الجواب No, I don't."
},
{
"q": "What ..... you have in your bag?",
"o": [
"do",
"does",
"have",
"are"
],
"e": "you ← What do you have?"
},
{
"q": "What does your sister .....? She has a new camera.",
"o": [
"have",
"has",
"haves",
"having"
],
"e": "بعد does نستخدم have: What does your sister have?"
},
{
"q": "How many children ..... they have?",
"o": [
"do",
"does",
"have",
"are"
],
"e": "they ← How many children do they have?"
},
{
"q": "Does your school ..... a gym?",
"o": [
"have",
"has",
"haves",
"having"
],
"e": "بعد does نستخدم have: Does your school have…?"
},
{
"q": "What do you have? We ..... a house near the beach.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "We ← have."
},
{
"q": "What does she have? She ..... a computer.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "She ← في الإثبات has."
},
{
"q": "My brother and I ..... the same teacher.",
"o": [
"have",
"has",
"is",
"are"
],
"e": "My brother and I = We ← have."
},
{
"q": "It ..... four legs. It's a horse.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "It ← has."
},
{
"q": "Do you ..... a car?",
"o": [
"have",
"has",
"having",
"haves"
],
"e": "بعد Do نستخدم have."
},
{
"q": "Khalid ..... a lot of friends at school.",
"o": [
"has",
"have",
"is",
"are"
],
"e": "Khalid = He ← has."
}
]
},
{
"rule": "Subject and Object pronouns",
"qs": [
{
"q": "Jim drives ..... to work.",
"o": [
"her",
"we",
"he",
"she"
],
"e": "بعد الفعل (drives) نحط ضمير مفعول (Object) ← her."
},
{
"q": "Look at .....!",
"o": [
"me",
"she",
"they",
"he"
],
"e": "بعد حرف الجر at نحط ضمير مفعول ← me."
},
{
"q": "The books are heavy. I can't carry ......",
"o": [
"them",
"he",
"they",
"him"
],
"e": "The books = They، وبعد الفعل carry نحط ضمير المفعول ← them."
},
{
"q": "Your friends are waiting for ......",
"o": [
"us",
"they",
"him",
"he"
],
"e": "بعد حرف الجر for نحط ضمير مفعول ← us."
},
{
"q": "If you don't want to watch TV, please turn ..... off.",
"o": [
"it",
"she",
"he",
"we"
],
"e": "TV = it، وit نفسها في الفاعل والمفعول ← turn it off."
},
{
"q": "I want to help ......",
"o": [
"you",
"she",
"he",
"we"
],
"e": "بعد الفعل help نحط ضمير مفعول ← you."
},
{
"q": "I enjoy playing computer games. ..... is a fun activity to do in my free time.",
"o": [
"It",
"Those",
"They",
"These"
],
"e": "playing computer games نشاط واحد (مفرد) ← It is (والفعل is يدل على المفرد)."
},
{
"q": "A: Did you bring the face masks with you? B: I'm sorry, I forgot ..... at home.",
"o": [
"them",
"us",
"him",
"her"
],
"e": "face masks جمع، وبعد الفعل forgot نحط ضمير مفعول ← them."
},
{
"q": "My sister is very kind. ..... always helps me.",
"o": [
"She",
"Her",
"Hers",
"They"
],
"e": "الجملة تحتاج فاعل (Subject) قبل الفعل helps ← She."
},
{
"q": "My sister is very kind. She always helps ......",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد الفعل helps نحط ضمير مفعول ← me."
},
{
"q": "Ahmed is my friend. I play football with ..... every Friday.",
"o": [
"him",
"he",
"his",
"they"
],
"e": "Ahmed = he، وبعد حرف الجر with نحط ضمير مفعول ← him."
},
{
"q": "..... are students at King Saud University.",
"o": [
"We",
"Us",
"Our",
"Him"
],
"e": "الجملة تحتاج فاعل قبل are ← We."
},
{
"q": "Sara and I are classmates. ..... study together.",
"o": [
"We",
"Us",
"They",
"Them"
],
"e": "Sara and I = We، والفاعل قبل الفعل study ← We."
},
{
"q": "This is my teacher. I like ..... very much.",
"o": [
"her",
"she",
"hers",
"they"
],
"e": "my teacher (امرأة)، وبعد الفعل like نحط ضمير مفعول ← her."
},
{
"q": "Where are my keys? I can't find ......",
"o": [
"them",
"they",
"it",
"him"
],
"e": "my keys جمع، وبعد find نحط ضمير مفعول ← them."
},
{
"q": "My parents are coming. I'm waiting for ......",
"o": [
"them",
"they",
"their",
"us"
],
"e": "My parents = they، وبعد حرف الجر for ← them."
},
{
"q": "..... is my brother. His name is Fahad.",
"o": [
"He",
"Him",
"His",
"She"
],
"e": "الفاعل قبل is، والأخ ذكر ← He."
},
{
"q": "My grandmother lives with us. We love ..... a lot.",
"o": [
"her",
"she",
"hers",
"they"
],
"e": "My grandmother = she، وبعد الفعل love ← her."
},
{
"q": "The phone is ringing. Can you answer .....?",
"o": [
"it",
"he",
"them",
"its"
],
"e": "The phone = it ← answer it."
},
{
"q": "Please call ..... tonight. My number is 0551234567.",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد الفعل call نحط ضمير مفعول، والمقصود المتكلم ← me."
},
{
"q": "..... is a big city. It has many tall buildings.",
"o": [
"It",
"They",
"Its",
"Them"
],
"e": "الفاعل لمدينة (مفرد غير عاقل) ← It."
},
{
"q": "Noura is sick, so I am going to visit ......",
"o": [
"her",
"she",
"hers",
"him"
],
"e": "Noura = she، وبعد visit ← her."
},
{
"q": "The children are in the garden. Can you see .....?",
"o": [
"them",
"they",
"their",
"it"
],
"e": "The children = they، وبعد see ← them."
},
{
"q": "Can you come with ..... to the market? We need help.",
"o": [
"us",
"we",
"our",
"they"
],
"e": "بعد حرف الجر with نحط ضمير مفعول، والمقصود (نحن) ← us."
},
{
"q": "Khalid gave ..... a nice gift for my birthday.",
"o": [
"me",
"I",
"my",
"he"
],
"e": "بعد الفعل gave ضمير مفعول للمتكلم ← me."
},
{
"q": "..... are my friends, Ali and Omar.",
"o": [
"They",
"Them",
"Their",
"We"
],
"e": "الفاعل قبل are، والمقصود Ali and Omar ← They."
},
{
"q": "My brother and I go to school together. Our father drives ......",
"o": [
"us",
"we",
"our",
"them"
],
"e": "My brother and I = we، وبعد drives ضمير مفعول ← us."
},
{
"q": "I don't know that man. Who is .....?",
"o": [
"he",
"him",
"his",
"she"
],
"e": "بعد Verb be (is) نستخدم ضمير الفاعل ← he."
},
{
"q": "This cake is for ...... Happy birthday, Mona!",
"o": [
"you",
"your",
"yours",
"she"
],
"e": "بعد حرف الجر for نحط ضمير مفعول ← you."
},
{
"q": "Mr. Saleh is a good teacher. All the students listen to ......",
"o": [
"him",
"he",
"his",
"they"
],
"e": "Mr. Saleh = he، وبعد حرف الجر to ← him."
},
{
"q": "I love my cat. ..... sleeps on my bed every night.",
"o": [
"It",
"They",
"Them",
"He'is"
],
"e": "الحيوان مفرد = It، والفاعل قبل sleeps ← It."
},
{
"q": "Please sit with ...... I want to talk to you.",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد حرف الجر with ضمير مفعول للمتكلم ← me."
},
{
"q": "Lama and Huda are sisters. ..... live in Jeddah.",
"o": [
"They",
"Them",
"She",
"Their"
],
"e": "Lama and Huda = They، والفاعل قبل live ← They."
},
{
"q": "I have a new car. I drive ..... every day.",
"o": [
"it",
"its",
"them",
"he"
],
"e": "a new car = it، وبعد drive ← it."
}
]
},
{
"rule": "Verbs + gerunds or infinitives",
"qs": [
{
"q": "I hope ..... the exam at the end of the course.",
"o": [
"to pass",
"pass",
"pass to",
"passing"
],
"e": "بعد hope نحط to + الفعل: hope to pass."
},
{
"q": "I avoid ..... in fast food restaurants whenever possible.",
"o": [
"eating",
"to eat",
"eat to",
"eat"
],
"e": "بعد avoid نضيف ing للفعل: avoid eating."
},
{
"q": "I dislike ..... in a hurry.",
"o": [
"drinking",
"to drink",
"drink",
"drinks"
],
"e": "بعد dislike نضيف ing للفعل: dislike drinking."
},
{
"q": "I hate ..... early every day.",
"o": [
"to get up",
"get up",
"to geting up",
"to gets up"
],
"e": "بعد hate يجي to + الفعل أو الفعل + ing ← to get up (الخيارات الثانية غلط)."
},
{
"q": "She tried ..... her hair red, but it didn't suit her at all.",
"o": [
"to dye",
"to dyes",
"dye",
"to dyeing"
],
"e": "بعد try نحط to + الفعل الأساسي: tried to dye."
},
{
"q": "I need ..... a stamp on this letter.",
"o": [
"to put",
"to puting",
"put",
"to puts"
],
"e": "بعد need نحط to + الفعل الأساسي: need to put."
},
{
"q": "She avoids ..... too much meat.",
"o": [
"eating",
"to eat",
"eat",
"eats"
],
"e": "بعد avoid نضيف ing: avoids eating."
},
{
"q": "You need ..... hard for the exam.",
"o": [
"to study",
"study",
"studying",
"to studying"
],
"e": "بعد need نحط to + الفعل: need to study."
},
{
"q": "I enjoy ..... with my friends on weekends.",
"o": [
"going out",
"to go out",
"go out",
"goes out"
],
"e": "بعد enjoy نضيف ing: enjoy going out."
},
{
"q": "My father stopped ..... five years ago. It's better for his health.",
"o": [
"smoking",
"to smoke",
"smoke",
"smokes"
],
"e": "بعد stop نضيف ing: stopped smoking."
},
{
"q": "I want ..... a doctor in the future.",
"o": [
"to become",
"become",
"becoming",
"to becoming"
],
"e": "بعد want نحط to + الفعل: want to become."
},
{
"q": "We hope ..... you again soon.",
"o": [
"to see",
"see",
"seeing",
"to seeing"
],
"e": "بعد hope نحط to + الفعل: hope to see."
},
{
"q": "He tries ..... to the gym three times a week.",
"o": [
"to go",
"go",
"going",
"to going"
],
"e": "بعد try نحط to + الفعل: tries to go."
},
{
"q": "My brother dislikes ..... the dishes.",
"o": [
"washing",
"to wash",
"wash",
"washes"
],
"e": "بعد dislike نضيف ing: dislikes washing."
},
{
"q": "They need ..... a bigger apartment.",
"o": [
"to find",
"find",
"finding",
"to finding"
],
"e": "بعد need نحط to + الفعل: need to find."
},
{
"q": "She enjoys ..... books in the evening.",
"o": [
"reading",
"to read",
"read",
"reads"
],
"e": "بعد enjoy نضيف ing: enjoys reading."
},
{
"q": "Please stop ..... so much noise. I'm trying to study.",
"o": [
"making",
"to make",
"make",
"makes"
],
"e": "بعد stop نضيف ing: stop making."
},
{
"q": "I like ..... in the sea in summer.",
"o": [
"swimming",
"swim",
"swims",
"to swimming"
],
"e": "بعد like يجي to أو ing ← swimming (الخيارات الثانية غلط)."
},
{
"q": "I can't stand ..... after work. I'm always too tired.",
"o": [
"to cook",
"cook",
"cooks",
"to cooking"
],
"e": "بعد can't stand يجي to أو ing ← to cook (مثال الملزمة)."
},
{
"q": "My mother loves ..... new dishes.",
"o": [
"to try",
"try",
"tries",
"to trying"
],
"e": "بعد love يجي to أو ing ← to try."
},
{
"q": "He hates ..... in traffic every morning.",
"o": [
"waiting",
"wait",
"waits",
"to waiting"
],
"e": "بعد hate يجي to أو ing ← waiting."
},
{
"q": "Sara wants ..... French next year.",
"o": [
"to learn",
"learn",
"learning",
"to learning"
],
"e": "بعد want نحط to + الفعل: wants to learn."
},
{
"q": "Students should avoid ..... up late before an exam.",
"o": [
"staying",
"to stay",
"stay",
"stays"
],
"e": "بعد avoid نضيف ing: avoid staying."
},
{
"q": "We enjoy ..... time at the beach.",
"o": [
"spending",
"to spend",
"spend",
"spends"
],
"e": "بعد enjoy نضيف ing: enjoy spending."
},
{
"q": "I need ..... my room. It's very messy.",
"o": [
"to clean",
"clean",
"cleaning",
"to cleaning"
],
"e": "بعد need نحط to + الفعل: need to clean."
},
{
"q": "Khalid stopped ..... video games because he wanted more time to study.",
"o": [
"playing",
"to play",
"play",
"plays"
],
"e": "بعد stop نضيف ing: stopped playing."
},
{
"q": "I hope ..... to Japan one day.",
"o": [
"to travel",
"travel",
"traveling",
"to traveling"
],
"e": "بعد hope نحط to + الفعل: hope to travel."
},
{
"q": "My little sister doesn't like ..... vegetables.",
"o": [
"eating",
"eat",
"eats",
"to eating"
],
"e": "بعد like يجي to أو ing ← eating."
},
{
"q": "They want ..... a party for their father's birthday.",
"o": [
"to have",
"have",
"having",
"to having"
],
"e": "بعد want نحط to + الفعل: want to have."
},
{
"q": "She ..... to finish her homework before dinner.",
"o": [
"tries",
"try",
"trying",
"to try"
],
"e": "She ← الفعل الأول ينضاف له s، وtry قبل y حرف غير متحرك ← tries (وبعده to finish)."
},
{
"q": "He ..... playing tennis with his friends.",
"o": [
"enjoys",
"enjoy",
"to enjoy",
"enjoying"
],
"e": "He ← الفعل الأول ينضاف له s: enjoys، وبعده playing."
},
{
"q": "My friend avoids ..... coffee at night.",
"o": [
"drinking",
"to drink",
"drink",
"drinks"
],
"e": "بعد avoid نضيف ing: avoids drinking."
},
{
"q": "I love ..... music while I study.",
"o": [
"listening to",
"listen to",
"listens to",
"to listening to"
],
"e": "بعد love يجي to أو ing ← listening to."
},
{
"q": "Do you need ..... a break?",
"o": [
"to take",
"take",
"taking",
"to taking"
],
"e": "بعد need نحط to + الفعل: need to take."
},
{
"q": "I ..... to a dentist. I have a lot of pain in my teeth.",
"o": [
"should go",
"should to go",
"should going",
"should to going"
],
"e": "بعد should يجي الفعل الأساسي مباشرة بدون to وبدون ing: should go."
}
]
},
{
"rule": "Prepositions of location",
"qs": [
{
"q": "The student is sitting ..... his desk.",
"o": [
"at",
"on",
"under",
"behind"
],
"e": "at للمكان المحدد اللي يكون الشخص عنده: sitting at his desk."
},
{
"q": "The ruler is ..... the desk drawer.",
"o": [
"in",
"on",
"over",
"at"
],
"e": "in = داخل: in the desk drawer."
},
{
"q": "The light is ..... the desk.",
"o": [
"above",
"under",
"in",
"at"
],
"e": "over / above = فوق بدون ما يلمس: the light is above the desk."
},
{
"q": "The backpack is ..... the table. It's on the floor.",
"o": [
"under",
"above",
"over",
"in"
],
"e": "under = تحت: under the table."
},
{
"q": "The poster is ..... the wall.",
"o": [
"on",
"in",
"under",
"behind"
],
"e": "on = على سطح الشيء (يلمسه): on the wall."
},
{
"q": "The trash can is ..... the desk.",
"o": [
"next to",
"in",
"over",
"at"
],
"e": "next to / beside = جنب: next to the desk."
},
{
"q": "The bookshelf is ..... the fan.",
"o": [
"behind",
"on",
"in",
"over"
],
"e": "behind = ورا: the bookshelf is behind the fan."
},
{
"q": "The fan is ..... the bookshelf.",
"o": [
"in front of",
"in",
"on",
"under"
],
"e": "in front of = قدام: the fan is in front of the bookshelf."
},
{
"q": "Excuse me, where is the bank? It's ..... the pharmacy. They are side by side.",
"o": [
"next to",
"under",
"in",
"over"
],
"e": "side by side = جنب بعض ← next to."
},
{
"q": "I'm waiting for you ..... the bus stop.",
"o": [
"at",
"in",
"under",
"over"
],
"e": "at للمكان المحدد: at the bus stop."
},
{
"q": "The traffic lights are ..... the road. The cars stop under them.",
"o": [
"over",
"under",
"in",
"behind"
],
"e": "over = فوق بدون ما يلمس، والسيارات تقف تحتها ← over the road."
},
{
"q": "There is a cat sleeping ..... the car. Be careful when you drive!",
"o": [
"under",
"over",
"above",
"in"
],
"e": "under = تحت السيارة."
},
{
"q": "The children are playing football ..... the street.",
"o": [
"in",
"over",
"under",
"above"
],
"e": "in للمكان اللي الشخص داخله: in the street."
},
{
"q": "Park your car ..... the restaurant, not in front of it. There is a big car park back there.",
"o": [
"behind",
"in front of",
"over",
"in"
],
"e": "behind = ورا المطعم (back there)."
},
{
"q": "Wait for me ..... the corner of the street.",
"o": [
"on",
"under",
"over",
"behind"
],
"e": "on the corner = على زاوية الشارع."
},
{
"q": "The bakery is ..... the right of the bank.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on the right of = على يمين."
},
{
"q": "The police car is ..... the school gate, so the students can see it when they come out.",
"o": [
"in front of",
"behind",
"under",
"over"
],
"e": "in front of = قدام البوابة عشان يشوفونها."
},
{
"q": "The bridge is ..... the river.",
"o": [
"over",
"under",
"in",
"at"
],
"e": "over = فوق النهر."
},
{
"q": "The man is standing ..... the traffic lights. He wants to cross the street.",
"o": [
"at",
"in",
"under",
"over"
],
"e": "at للمكان المحدد: at the traffic lights."
},
{
"q": "The bus stop is ..... the hospital. It's right beside it.",
"o": [
"next to",
"under",
"above",
"in"
],
"e": "next to / beside = جنب."
},
{
"q": "The sign above the shop says \"Pharmacy\". The sign is ..... the door.",
"o": [
"above",
"under",
"in",
"behind"
],
"e": "above = فوق الباب."
},
{
"q": "Look at the street: the mosque is in the middle, the bank is on the left, and the café is on the ..... of the mosque.",
"o": [
"right",
"front",
"back",
"next"
],
"e": "البنك على اليسار، فالمقهى على اليمين ← on the right of."
},
{
"q": "My car is ..... the garage.",
"o": [
"in",
"over",
"above",
"at"
],
"e": "in = داخل الكراج."
},
{
"q": "There is a big tree ..... my house, so I can't see it from the street. It's in the back garden.",
"o": [
"behind",
"in front of",
"over",
"on"
],
"e": "behind = ورا البيت (في الحديقة الخلفية)."
},
{
"q": "A: Where is the supermarket? B: It's ..... the gas station. You can see it beside the station.",
"o": [
"next to",
"under",
"over",
"in"
],
"e": "beside = next to ← جنب محطة البنزين."
},
{
"q": "The taxi is waiting ..... the hotel entrance.",
"o": [
"in front of",
"under",
"above",
"in"
],
"e": "in front of = قدام مدخل الفندق."
},
{
"q": "There are many shops ..... King Fahd Road.",
"o": [
"on",
"under",
"above",
"over"
],
"e": "on مع أسماء الشوارع: on King Fahd Road."
},
{
"q": "The streetlight is ..... the parked car.",
"o": [
"over",
"under",
"in",
"at"
],
"e": "over = فوق السيارة بدون ما يلمسها."
},
{
"q": "The bike is ..... the wall.",
"o": [
"next to",
"over",
"in",
"above"
],
"e": "next to = جنب الجدار."
},
{
"q": "The mall is ..... the left of the hospital.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on the left of = على يسار."
},
{
"q": "The keys are ..... my pocket.",
"o": [
"in",
"on",
"over",
"under"
],
"e": "in = داخل الجيب."
},
{
"q": "The bus is ..... the car. The car can't see the road ahead.",
"o": [
"in front of",
"behind",
"under",
"over"
],
"e": "الباص قدام السيارة، فالسيارة ما تشوف الطريق ← in front of."
},
{
"q": "The restaurant is ..... the ground floor of the building.",
"o": [
"on",
"in",
"under",
"over"
],
"e": "on مع الأدوار: on the ground floor."
},
{
"q": "Turn right at the traffic lights. The museum is ..... your left.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on your left = على يسارك."
},
{
"q": "The boy is hiding ..... the car. His friends can't see him from the street.",
"o": [
"behind",
"in front of",
"on",
"over"
],
"e": "behind = ورا السيارة، عشان ما يشوفونه."
},
{
"q": "The newspaper is ..... the table.",
"o": [
"on",
"in",
"under",
"over"
],
"e": "on = على سطح الطاولة."
},
{
"q": "There's a coffee shop ..... the end of the street.",
"o": [
"at",
"on",
"under",
"over"
],
"e": "at the end of the street = في نهاية الشارع."
},
{
"q": "The bank is on the left of the bakery, so the bakery is on the ..... of the bank.",
"o": [
"right",
"left",
"front",
"behind"
],
"e": "البنك على يسار المخبز، فالمخبز على يمين البنك ← on the right of."
},
{
"q": "The man is sitting ..... the bench in the park.",
"o": [
"on",
"in",
"under",
"over"
],
"e": "on = على الكرسي (bench)."
},
{
"q": "The car is ..... the bus. The bus can't see the road ahead.",
"o": [
"in front of",
"behind",
"under",
"on"
],
"e": "السيارة قدام الباص، فالباص ما يشوف الطريق ← in front of."
}
]
}
];
