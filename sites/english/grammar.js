/* أسئلة القواعد (Grammar) مقسمة حسب القاعدة — ملف مولّد بالسكربت tools/english/build_data.py (لا تعدّله يدوياً)
   o[0] = الإجابة الصحيحة (الخيارات تنخلط في الموقع) */
window.GRAMMAR = [
{
"rule": "Simple present",
"qs": [
{
"q": "Saleh ..... a science teacher. He works at Kingdom School in Riyadh.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "Saleh مفرد (He) ← نستخدم is.",
"x": 1
},
{
"q": "Look at this cake my sister made. ..... the best baker in our family.",
"o": [
"She's",
"She'is",
"Shes'",
"She-is"
],
"e": "She's اختصار She is، والفاصلة العلوية مكان حرف i المحذوف (She + 's).",
"x": 1
},
{
"q": "He ..... much in class, but he gets A+ for the essays he writes.",
"o": [
"doesn't talk",
"doesn't",
"not talk",
"don't talk"
],
"e": "He ← النفي doesn't + الفعل الأساسي talk (بدون s).",
"x": 1
},
{
"q": "A: ..... to go tonight? B: Let's go to an art gallery first and then have dinner at Le Chateau.",
"o": [
"Where do you want",
"Where do you wanting",
"Where does you wanting",
"Where does you want"
],
"e": "you ← WH + do + Subject + الفعل الأساسي: Where do you want…?",
"x": 1
},
{
"q": "I ..... an Uber taxi at 7:00 every morning to be at work on time.",
"o": [
"book",
"books",
"booking",
"is book"
],
"e": "I ← الفعل بدون s: book.",
"x": 1
},
{
"q": "My brother ..... a doctor. He works at King Faisal Hospital in Riyadh.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "My brother = He ← مع He نستخدم is."
},
{
"q": "Look at those men over there. ..... my uncles from Jeddah.",
"o": [
"They're",
"They'are",
"Theyre'",
"They-are"
],
"e": "They're اختصار They are، والفاصلة العلوية مكان حرف a المحذوف."
},
{
"q": "A: ..... your parents at home now? B: No, they're at the mall.",
"o": [
"Are",
"Is",
"Do",
"Does"
],
"e": "your parents جمع (They) ← سؤال Yes/No بفعل be: Are + they."
},
{
"q": "Ahmed and I ..... in the same class. We sit next to each other every day.",
"o": [
"are",
"is",
"am",
"aren't"
],
"e": "Ahmed and I = We ← نستخدم are (والجملة الثانية تأكد إنهم مع بعض)."
},
{
"q": "I'm sorry, but I ..... hungry. I had a big lunch an hour ago.",
"o": [
"am not",
"isn't",
"not am",
"don't"
],
"e": "I ← النفي am not (اللي أكل قبل ساعة مو جوعان)."
},
{
"q": "My sister ..... coffee. She only drinks tea in the morning.",
"o": [
"doesn't drink",
"don't drink",
"doesn't drinks",
"not drink"
],
"e": "My sister = She ← doesn't + الفعل الأساسي drink (بدون s)."
},
{
"q": "A: ..... your brother play football? B: Yes, he plays every Friday with his friends.",
"o": [
"Does",
"Do",
"Is",
"Are"
],
"e": "your brother = He ← سؤال Yes/No: Does + he + verb."
},
{
"q": "Nora ..... to the gym three times a week, so she is very fit.",
"o": [
"goes",
"go",
"gos",
"going"
],
"e": "Nora = She ← go ينتهي بـ o فنضيف es: goes."
},
{
"q": "A: Where ..... your cousins live? B: They live in a small village near Abha.",
"o": [
"do",
"does",
"are",
"is"
],
"e": "your cousins جمع (They) ← WH + do + Subject + verb."
},
{
"q": "My father ..... the newspaper every morning before he goes to work.",
"o": [
"reads",
"read",
"reading",
"is read"
],
"e": "My father = He ← نضيف s للفعل: reads."
},
{
"q": "It's a beautiful day! The sun ..... and the sky is blue.",
"o": [
"shines",
"shine",
"shining",
"is shine"
],
"e": "The sun = It ← نضيف s للفعل: shines."
},
{
"q": "These cookies ..... delicious. Can I have another one?",
"o": [
"are",
"is",
"am",
"be"
],
"e": "These cookies جمع (They) ← نستخدم are."
},
{
"q": "A: Is your new teacher strict? B: No, he ...... He's really friendly.",
"o": [
"isn't",
"doesn't",
"aren't",
"don't"
],
"e": "سؤال بـ Is ← الجواب No, he isn't (مع صفة نستخدم be مو does)."
},
{
"q": "We ..... TV in the evening. We prefer to read books or play games.",
"o": [
"don't watch",
"doesn't watch",
"don't watches",
"not watch"
],
"e": "We ← النفي don't + الفعل الأساسي watch."
},
{
"q": "A: What time ..... the bank open? B: At 9:30 in the morning.",
"o": [
"does",
"do",
"is",
"are"
],
"e": "the bank = It ← WH + does + Subject + verb (open هنا فعل)."
},
{
"q": "My little brother ..... every time he can't find his toys. Then my mother helps him.",
"o": [
"cries",
"crys",
"cry",
"cryes"
],
"e": "My little brother = He ← قبل y حرف ساكن (r) فنحذف y ونضيف ies: cries (مو crys ولا cryes)."
},
{
"q": "Sami ..... his car every weekend. It's always clean.",
"o": [
"washes",
"washs",
"wash",
"washing"
],
"e": "Sami = He ← الفعل المنتهي بـ sh نضيف له es: washes."
},
{
"q": "A: ..... you a new student here? B: Yes, I am. I started yesterday.",
"o": [
"Are",
"Is",
"Do",
"Am"
],
"e": "you ← سؤال Yes/No بفعل be: Are you…? والجواب Yes, I am."
},
{
"q": "The museum ..... on Fridays, so we can visit it on Saturday.",
"o": [
"doesn't open",
"don't open",
"doesn't opens",
"not opens"
],
"e": "The museum = It ← النفي doesn't + الفعل الأساسي open."
},
{
"q": "My friends ..... very busy this week because they have three exams.",
"o": [
"are",
"is",
"am",
"be"
],
"e": "My friends جمع (They) ← نستخدم are."
},
{
"q": "A: How ..... you usually go to the university? B: I take the metro.",
"o": [
"do",
"does",
"are",
"is"
],
"e": "you ← WH + do + Subject + verb: How do you go…?"
},
{
"q": "Khalid ..... fast food. He says it's unhealthy.",
"o": [
"doesn't like",
"don't like",
"doesn't likes",
"isn't like"
],
"e": "Khalid = He ← doesn't + الفعل الأساسي like."
},
{
"q": "The children ..... in the garden. Let's go and play with them.",
"o": [
"are",
"is",
"am",
"does"
],
"e": "The children جمع (They) ← نستخدم are."
},
{
"q": "A: Where ..... the nearest pharmacy? B: It's next to the bank.",
"o": [
"is",
"are",
"does",
"do"
],
"e": "the nearest pharmacy مفرد ← WH + is + Subject."
},
{
"q": "My mother ..... dinner for the whole family every evening. Her kabsa is the best in Riyadh.",
"o": [
"cooks",
"cook",
"cooking",
"is cook"
],
"e": "My mother = She ← عادة كل مساء، ومع She نضيف s للفعل: cooks."
},
{
"q": "I ..... my grandparents every Friday. They live near our house.",
"o": [
"visit",
"visits",
"visiting",
"am visit"
],
"e": "I ← الفعل بدون s: visit."
},
{
"q": "A: Do you like spicy food? B: No, I ...... It's too hot for me.",
"o": [
"don't",
"doesn't",
"am not",
"isn't"
],
"e": "Do you…? ← الجواب No, I don't."
},
{
"q": "Lama ..... a lot of time on her phone. Her mother is not happy about it.",
"o": [
"spends",
"spend",
"spending",
"is spend"
],
"e": "Lama = She ← نضيف s للفعل: spends."
},
{
"q": "The shops in the mall ..... at 10 p.m. every night.",
"o": [
"close",
"closes",
"closing",
"is close"
],
"e": "The shops جمع (They) ← الفعل بدون s: close."
},
{
"q": "A: What ..... your sister do? B: She's a nurse at a big hospital.",
"o": [
"does",
"do",
"is",
"are"
],
"e": "your sister = She ← What does she do? (سؤال عن الوظيفة)."
},
{
"q": "Fahad ..... his homework before dinner, so he has free time in the evening.",
"o": [
"does",
"do",
"dos",
"doing"
],
"e": "Fahad = He ← do ينتهي بـ o فنضيف es: does."
},
{
"q": "My grandfather ..... seventy years old, but he still walks every morning.",
"o": [
"is",
"are",
"has",
"does"
],
"e": "العمر في الإنجليزي بفعل be ← He is seventy years old."
},
{
"q": "A: ..... your friends speak English? B: Yes, they do. They speak it very well.",
"o": [
"Do",
"Does",
"Are",
"Is"
],
"e": "your friends جمع (They) ← Do + they + verb، والجواب Yes, they do."
},
{
"q": "My phone ..... very old. I want to buy a new one.",
"o": [
"is",
"are",
"am",
"be"
],
"e": "My phone = It ← نستخدم is."
},
{
"q": "The baby ..... a lot at night, so her parents are always tired.",
"o": [
"doesn't sleep",
"don't sleep",
"doesn't sleeps",
"isn't sleep"
],
"e": "The baby = She ← doesn't + الفعل الأساسي sleep."
},
{
"q": "I ..... the kids' store at Panorama Mall. It has many toys and books.",
"o": [
"love",
"to love",
"be loving",
"loving"
],
"e": "I ← في المضارع البسيط الفعل يجي بصيغته الأساسية بدون to وبدون ing: I love.",
"x": 1
},
{
"q": "This ..... a shoe store. People come here to buy shoes and accessories.",
"o": [
"is",
"be",
"am",
"are"
],
"e": "This (شي واحد مفرد = It) ← نستخدم is.",
"x": 1
},
{
"q": "He ..... from home. He goes to the office from Sunday to Thursday every week.",
"o": [
"doesn't work",
"no work",
"don't work",
"not work"
],
"e": "He ← النفي مع He / She / It يكون doesn't + الفعل الأساسي: doesn't work (لأنه يروح المكتب كل أسبوع).",
"x": 1
},
{
"q": "Sameera ..... articles for the local newspaper, and she has a website about life in Riyadh.",
"o": [
"writes",
"writing",
"write",
"writer"
],
"e": "Sameera = She ← في المضارع البسيط مع He / She / It نضيف s للفعل: writes.",
"x": 1
},
{
"q": "I ..... my room every weekend because I am very busy during the week.",
"o": [
"clean",
"cleans",
"cleaning",
"cleaner"
],
"e": "I ← في المضارع البسيط الفعل بدون s: I clean. (cleaner اسم = منظّف، وcleaning ما تجي بعد I لحالها.)",
"x": 1
},
{
"q": "I ..... to buy shoes from Granada Mall. It has many shoe stores.",
"o": [
"want",
"wanting",
"to want",
"be wanting"
],
"e": "I ← في المضارع البسيط الفعل بصيغته الأساسية: I want (to buy). wanting وto want وbe wanting ما تجي بعد I كفعل.",
"x": 1
},
{
"q": "Osama ..... every evening at 5:30 to relax, stay fit, and clear his mind.",
"o": [
"swims",
"swim",
"swimming",
"swimmer"
],
"e": "Osama = He ← في المضارع البسيط مع He / She / It نضيف s للفعل: swims. (swimmer اسم = سبّاح.)",
"x": 1
},
{
"q": "He ..... very well, but he can write a lot of poems and songs.",
"o": [
"doesn't sing",
"don't sing",
"not sing",
"no sing"
],
"e": "He ← النفي في المضارع البسيط مع He / She / It يكون doesn't + الفعل الأساسي: doesn't sing. (don't مع I/You/We/They، وnot/no لحالها ما تنفي الفعل.)",
"x": 1
},
{
"q": "I ..... a photojournalist. I take photos for magazines like National Geographic.",
"o": [
"am",
"are",
"is",
"be"
],
"e": "I ← مع I نستخدم am: I am a photojournalist.",
"x": 1
}
]
},
{
"rule": "Adjectives + Adverbs (a / an)",
"qs": [
{
"q": "That is ..... idea! I've heard it's not safe to go there after dark.",
"o": [
"a really bad",
"an extremely",
"a very",
"a bad really"
],
"e": "اسم مفرد (idea) ← a + Adverb + Adjective + Noun، وأول كلمة really حرف ساكن ← a really bad.",
"x": 1
},
{
"q": "My teacher is kind and ...... If I don't understand my math lesson, she explains it to me again.",
"o": [
"helpful",
"a helpful",
"a helpfuls",
"helpfuls"
],
"e": "بعد Verb be صفة بدون اسم ← ما نحط a: kind and helpful. والصفة ما تنجمع.",
"x": 1
},
{
"q": "We stayed at ..... hotel. The rooms were big and the staff were very kind.",
"o": [
"a really nice",
"a nice really",
"really a nice",
"an really nice"
],
"e": "hotel مفرد ← a + Adverb + Adjective + Noun، وأول كلمة really حرف ساكن ← a really nice."
},
{
"q": "I can't wear these shoes. They are ......",
"o": [
"extremely uncomfortable",
"an extremely uncomfortable",
"uncomfortables extremely",
"a extremely uncomfortable"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a / an: extremely uncomfortable."
},
{
"q": "Don't go to that restaurant. It's ..... place, and the food is terrible.",
"o": [
"a very dirty",
"an very dirty",
"a dirty very",
"very a dirty"
],
"e": "place مفرد ← a + very + dirty + place."
},
{
"q": "My new phone is ...... It takes great photos and the battery lasts two days.",
"o": [
"really good",
"a really good",
"good really",
"a really goods"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: really good."
},
{
"q": "Khalid is ...... He always helps his classmates with their homework.",
"o": [
"a very kind boy",
"very kind boy",
"a boy very kind",
"an very kind boy"
],
"e": "boy اسم مفرد ← a + very + kind + boy."
},
{
"q": "We watched ..... movie last night. I couldn't stop laughing!",
"o": [
"an extremely funny",
"a extremely funny",
"extremely funny",
"a funny extremely"
],
"e": "extremely تبدأ بحرف علة (e) ← an extremely funny movie."
},
{
"q": "The new mall in our neighbourhood is ...... You can find everything there in one place.",
"o": [
"pretty big",
"a pretty big",
"big pretty",
"a big pretty"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: pretty big."
},
{
"q": "Riyadh has ..... buildings. Some of them have more than fifty floors.",
"o": [
"very tall",
"a very tall",
"very talls",
"talls very"
],
"e": "buildings جمع ← بدون a، والصفة ما تنجمع: very tall buildings."
},
{
"q": "Sara is ..... student. She always gets full marks.",
"o": [
"an excellent",
"a excellent",
"excellent",
"a excellents"
],
"e": "excellent تبدأ بحرف علة (e) ← an excellent student."
},
{
"q": "Be careful! The streets are ..... after the rain.",
"o": [
"really dangerous",
"a really dangerous",
"dangerous really",
"really a dangerous"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: really dangerous."
},
{
"q": "My grandfather lives in ..... village near Abha. There are no cars or loud noises there.",
"o": [
"a quiet",
"an quiet",
"quiet",
"a quiets"
],
"e": "village اسم مفرد والصفة quiet تبدأ بحرف ساكن (q) ← a quiet village، والصفة ما تنجمع."
},
{
"q": "That was ..... exam! Nobody finished it on time.",
"o": [
"an extremely difficult",
"a extremely difficult",
"extremely difficult",
"an difficult extremely"
],
"e": "exam مفرد وأول كلمة extremely حرف علة ← an extremely difficult exam."
},
{
"q": "These oranges from the farm are ...... Where did you buy them? I want some more.",
"o": [
"very sweet",
"a very sweet",
"very sweets",
"sweets very"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a، والصفة ما تنجمع: very sweet."
},
{
"q": "I need ..... umbrella. It's raining outside.",
"o": [
"an",
"a",
"the an",
"a an"
],
"e": "umbrella تبدأ بحرف علة (u) ← an umbrella."
},
{
"q": "Our teacher gave us ..... assignment, so we finished it in ten minutes.",
"o": [
"a pretty easy",
"an pretty easy",
"pretty easy",
"a easy pretty"
],
"e": "assignment مفرد وأول كلمة pretty حرف ساكن ← a pretty easy assignment."
},
{
"q": "My brother is ...... He wakes up at 5 a.m. every day to study.",
"o": [
"very hardworking",
"a very hardworking",
"hardworking very",
"an very hardworking"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: very hardworking."
},
{
"q": "Let's go to the beach. It's ..... day!",
"o": [
"a really beautiful",
"a beautiful really",
"really a beautiful",
"an really beautiful"
],
"e": "day مفرد ← a + really + beautiful + day."
},
{
"q": "She bought ..... bag. It cost more than 3000 riyals!",
"o": [
"an extremely expensive",
"a extremely expensive",
"extremely expensive",
"an expensive extremely"
],
"e": "bag مفرد وأول كلمة extremely حرف علة ← an extremely expensive bag."
},
{
"q": "My neighbours are ...... They always invite us for dinner and help us when we need anything.",
"o": [
"very friendly",
"a very friendly",
"very friendlys",
"friendly very"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a، والصفة ما تنجمع: very friendly."
},
{
"q": "I have ..... question about the homework. Can you help me?",
"o": [
"a quick",
"an quick",
"quick",
"a quicks"
],
"e": "question مفرد والصفة quick تبدأ بحرف ساكن ← a quick question."
},
{
"q": "The weather in Abha is ..... in summer. Many people go there on holiday.",
"o": [
"quite cool",
"a quite cool",
"cool quite",
"quite a cool"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: quite cool."
},
{
"q": "He drives ..... car. It's more than twenty years old!",
"o": [
"an old",
"a old",
"old",
"an olds"
],
"e": "old تبدأ بحرف علة (o) ← an old car."
},
{
"q": "Those are ..... shoes. Where did you get them?",
"o": [
"really nice",
"a really nice",
"nices really",
"really nices"
],
"e": "shoes جمع ← بدون a، والصفة ما تنجمع: really nice shoes."
},
{
"q": "Our English class is ..... class. Everyone enjoys it.",
"o": [
"a very interesting",
"an very interesting",
"very interesting",
"a interesting very"
],
"e": "class مفرد وأول كلمة very حرف ساكن ← a very interesting class."
},
{
"q": "My father is ..... man. He never tells lies.",
"o": [
"an honest",
"a honest",
"honest",
"an honests"
],
"e": "honest الـ h ما تنطق، فالنطق يبدأ بصوت حرف علة ← an honest man."
},
{
"q": "The library is ..... during exams. There are no empty seats.",
"o": [
"extremely crowded",
"an extremely crowded",
"crowded extremely",
"a extremely crowded"
],
"e": "بعد Verb be صفة بدون اسم ← بدون a: extremely crowded."
},
{
"q": "King Saud University is ..... university. Students from many countries come to study there every year.",
"o": [
"a very famous",
"an very famous",
"very famous",
"a famous very"
],
"e": "university اسم مفرد وأول كلمة very حرف ساكن ← a very famous university."
}
]
},
{
"rule": "Have / Has",
"qs": [
{
"q": "Let's go to Riyadh Park. They ..... many different shops, restaurants, and movie theaters.",
"o": [
"have",
"having",
"has",
"has had"
],
"e": "They ← have.",
"x": 1
},
{
"q": "My sister ..... a new car. It's white and very fast.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "My sister = She ← has."
},
{
"q": "A: ..... you have any brothers? B: Yes, I have two.",
"o": [
"Do",
"Does",
"Are",
"Has"
],
"e": "you ← السؤال Do + you + have."
},
{
"q": "My father ..... a lot of free time. He works from early morning until late at night.",
"o": [
"doesn't have",
"don't have",
"doesn't has",
"hasn't have"
],
"e": "My father = He ← النفي doesn't have (في النفي دائماً have)."
},
{
"q": "Our neighbours ..... three cats and a big dog, so their garden is always noisy.",
"o": [
"have",
"has",
"having",
"are have"
],
"e": "Our neighbours جمع (They) ← have."
},
{
"q": "A: What does Ahmed have in his hand? B: He ..... a cup of coffee.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "He ← في الإثبات has."
},
{
"q": "I'm sorry, I ..... a pen. Can I borrow yours?",
"o": [
"don't have",
"doesn't have",
"don't has",
"hasn't"
],
"e": "I ← النفي don't have."
},
{
"q": "This hotel is great. It ..... a big swimming pool and a gym.",
"o": [
"has",
"have",
"is",
"having"
],
"e": "The hotel = It ← has."
},
{
"q": "A: ..... your school have a library? B: Yes, it does. It's very big.",
"o": [
"Does",
"Do",
"Has",
"Is"
],
"e": "your school = It ← Does + it + have، والجواب Yes, it does."
},
{
"q": "My friends and I ..... an important exam tomorrow, so we're studying tonight.",
"o": [
"have",
"has",
"are",
"having"
],
"e": "My friends and I = We ← have."
},
{
"q": "Fahad can't call you. He ..... a phone right now. It's broken.",
"o": [
"doesn't have",
"don't have",
"doesn't has",
"not have"
],
"e": "Fahad = He ← doesn't have."
},
{
"q": "A: Do your parents have a car? B: No, they ...... They take the metro.",
"o": [
"don't",
"doesn't",
"hasn't",
"aren't"
],
"e": "Do your parents…? ← الجواب No, they don't."
},
{
"q": "Let's go to the new café on Olaya Street. It ..... great coffee and delicious cakes.",
"o": [
"has",
"have",
"having",
"has had"
],
"e": "The café = It ← has."
},
{
"q": "A: What ..... you have for breakfast? B: I usually have eggs and bread.",
"o": [
"do",
"does",
"are",
"have"
],
"e": "you ← What do you have…?"
},
{
"q": "Riyadh ..... many big parks and malls, so families can always find a place to go on weekends.",
"o": [
"has",
"have",
"is",
"having"
],
"e": "Riyadh = It ← has."
},
{
"q": "My little brother ..... long hair. It's very short.",
"o": [
"doesn't have",
"don't have",
"doesn't has",
"not has"
],
"e": "My little brother = He ← النفي doesn't have."
},
{
"q": "A: Does Sara have a laptop? B: Yes, she ...... She uses it for her studies.",
"o": [
"does",
"has",
"have",
"is"
],
"e": "Does she…? ← الجواب Yes, she does."
},
{
"q": "We ..... a big family. I have five brothers and three sisters.",
"o": [
"have",
"has",
"are",
"is"
],
"e": "We ← have."
},
{
"q": "A: How many classes ..... you have today? B: I have four.",
"o": [
"do",
"does",
"are",
"have"
],
"e": "you ← How many classes do you have?"
},
{
"q": "The students ..... a short break at 10 o'clock every day. They usually buy snacks from the cafeteria.",
"o": [
"have",
"has",
"having",
"are have"
],
"e": "The students جمع (They) ← have."
},
{
"q": "A: What does your brother .....? B: He has a new bike.",
"o": [
"have",
"has",
"haves",
"having"
],
"e": "بعد does نستخدم have: What does your brother have?"
},
{
"q": "My grandmother ..... a beautiful garden with many flowers. She waters them every morning before breakfast.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "My grandmother = She ← has."
},
{
"q": "I can't go out tonight. I ..... a lot of homework.",
"o": [
"have",
"has",
"am",
"having"
],
"e": "I ← have."
},
{
"q": "A: Does your apartment ..... a balcony? B: No, it doesn't.",
"o": [
"have",
"has",
"haves",
"having"
],
"e": "بعد Does نستخدم have."
},
{
"q": "Noura and Huda ..... the same English teacher, so they often study together after class.",
"o": [
"have",
"has",
"is",
"having"
],
"e": "Noura and Huda = They ← have."
},
{
"q": "That restaurant is not good. It ..... any healthy food.",
"o": [
"doesn't have",
"don't have",
"doesn't has",
"not has"
],
"e": "The restaurant = It ← النفي doesn't have."
},
{
"q": "A: Do you have a car? B: Yes, I ...... It's a small red car.",
"o": [
"do",
"have",
"does",
"am"
],
"e": "Do you…? ← الجواب Yes, I do."
},
{
"q": "My uncle ..... a big farm with cows and sheep near Qassim. We visit him every spring.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "My uncle = He ← has."
}
]
},
{
"rule": "Subject and Object pronouns",
"qs": [
{
"q": "I enjoy playing computer games. ..... is a fun activity to do in my free time.",
"o": [
"It",
"Those",
"They",
"These"
],
"e": "playing computer games نشاط واحد (مفرد) ← It is (والفعل is يدل على المفرد).",
"x": 1
},
{
"q": "A: Did you bring the face masks with you? B: I'm sorry, I forgot ..... at home.",
"o": [
"them",
"us",
"him",
"her"
],
"e": "face masks جمع، وبعد الفعل forgot نحط ضمير مفعول ← them.",
"x": 1
},
{
"q": "My brother is very busy. I don't see ..... very often.",
"o": [
"him",
"he",
"his",
"them"
],
"e": "My brother = he، وبعد الفعل see نحط ضمير مفعول ← him."
},
{
"q": "A: Where are my glasses? B: I saw ..... on the kitchen table.",
"o": [
"them",
"it",
"they",
"her"
],
"e": "glasses جمع، وبعد الفعل saw نحط ضمير مفعول ← them."
},
{
"q": "Sara is my best friend. ..... always helps me with my homework.",
"o": [
"She",
"Her",
"Hers",
"It"
],
"e": "الجملة تحتاج فاعل (Subject) قبل الفعل helps ← She."
},
{
"q": "I love this song. Can you play ..... again?",
"o": [
"it",
"them",
"its",
"she"
],
"e": "this song مفرد غير عاقل، وبعد play ← it."
},
{
"q": "Our grandparents live in Taif. We visit ..... every summer.",
"o": [
"them",
"they",
"us",
"their"
],
"e": "Our grandparents = they، وبعد visit ضمير مفعول ← them."
},
{
"q": "A: Is this pen yours? B: No, it doesn't belong to ......",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد حرف الجر to نحط ضمير مفعول ← me."
},
{
"q": "My friends and I play football on Fridays. Sometimes our coach plays with ......",
"o": [
"us",
"we",
"our",
"them"
],
"e": "My friends and I = we، وبعد حرف الجر with ← us."
},
{
"q": "Mr. Ali is our new teacher. ..... is from Egypt.",
"o": [
"He",
"Him",
"His",
"They"
],
"e": "الفاعل قبل is، والمعلم رجل ← He."
},
{
"q": "The baby is crying. Can you give ..... some milk?",
"o": [
"her",
"she",
"hers",
"they"
],
"e": "The baby (بنت)، وبعد الفعل give ضمير مفعول ← her."
},
{
"q": "I bought a new car last week. ..... is very fast.",
"o": [
"It",
"He",
"They",
"Its"
],
"e": "a new car مفرد غير عاقل، والفاعل قبل is ← It."
},
{
"q": "A: Do you know Khalid and Omar? B: Yes, I study with ..... at the university.",
"o": [
"them",
"they",
"him",
"us"
],
"e": "Khalid and Omar = they، وبعد حرف الجر with ← them."
},
{
"q": "My mother cooks dinner for us every day, and I always help ..... in the kitchen.",
"o": [
"her",
"she",
"him",
"hers"
],
"e": "My mother = she، وبعد الفعل help نحط ضمير مفعول ← her."
},
{
"q": "The teacher asked ..... a difficult question, but I knew the answer.",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد الفعل asked ضمير مفعول، والمتكلم هو اللي جاوب ← me."
},
{
"q": "..... are my cousins, Lama and Reem. They live next door.",
"o": [
"They",
"Them",
"Their",
"She"
],
"e": "الفاعل قبل are، والمقصود Lama and Reem ← They."
},
{
"q": "These cookies are delicious! Did you make ..... yourself?",
"o": [
"them",
"it",
"they",
"its"
],
"e": "These cookies جمع، وبعد make ← them."
},
{
"q": "A: Where is Fahad? B: I don't know. I can't see ......",
"o": [
"him",
"he",
"his",
"it"
],
"e": "Fahad = he، وبعد see ← him."
},
{
"q": "Huda and I are sisters. ..... share a bedroom.",
"o": [
"We",
"Us",
"They",
"Our"
],
"e": "Huda and I = We، والفاعل قبل share ← We."
},
{
"q": "The keys are not in my bag. Did you take .....?",
"o": [
"them",
"it",
"they",
"him"
],
"e": "The keys جمع، وبعد take ← them."
},
{
"q": "My father bought ..... a new laptop for university. Now I can study at home.",
"o": [
"me",
"I",
"my",
"mine"
],
"e": "بعد الفعل bought ضمير مفعول للمتكلم ← me."
},
{
"q": "A: What do you think of the new mall? B: I love ...... It has great shops.",
"o": [
"it",
"them",
"its",
"he"
],
"e": "the new mall مفرد غير عاقل، وبعد love ← it."
},
{
"q": "The children are noisy. Please tell ..... to be quiet.",
"o": [
"them",
"they",
"their",
"him"
],
"e": "The children = they، وبعد tell ← them."
},
{
"q": "Noura called me three times yesterday, but I didn't answer ...... I was sleeping.",
"o": [
"her",
"she",
"hers",
"him"
],
"e": "Noura = she، وبعد الفعل answer نحط ضمير مفعول ← her."
},
{
"q": "A: Is this your bag? B: Yes, thank you! I was looking for ......",
"o": [
"it",
"them",
"its",
"her"
],
"e": "your bag مفرد غير عاقل، وبعد حرف الجر for ← it."
},
{
"q": "Ahmed is very funny. Everybody likes ......",
"o": [
"him",
"he",
"his",
"them"
],
"e": "Ahmed = he، وبعد likes ← him."
},
{
"q": "..... is a beautiful city. Many tourists visit it every year.",
"o": [
"It",
"They",
"Its",
"He"
],
"e": "المدينة مفرد غير عاقل، والفاعل قبل is ← It."
},
{
"q": "Please wait for ..... at the bus stop. We'll be there in five minutes.",
"o": [
"us",
"we",
"our",
"them"
],
"e": "بعد حرف الجر for، والمقصود (نحن) لأنه قال We'll be there ← us."
},
{
"q": "My parents are coming tonight. I want to cook dinner for ......",
"o": [
"them",
"they",
"their",
"him"
],
"e": "My parents = they، وبعد حرف الجر for ← them."
},
{
"q": "My brother doesn't like running in the morning. ..... makes him tired during the day.",
"o": [
"It",
"She",
"These",
"They"
],
"e": "running in the morning شي واحد (مو شخص)، ونحتاج فاعل مفرد قبل makes ← It.",
"x": 1
},
{
"q": "I asked Hussain and Tariq to join me at the gym. ..... my friends from the neighborhood.",
"o": [
"They're",
"There",
"There's",
"Their"
],
"e": "Hussain and Tariq = They، ونحتاج فاعل + فعل be ← They're = They are. (There = هناك، Their = حقهم.)",
"x": 1
},
{
"q": "My brother loves playing football. ..... the best player on the team.",
"o": [
"He's",
"Him",
"His",
"He'd"
],
"e": "My brother = He، ونحتاج فاعل + is ← He's = He is. (Him/His مو فاعل، وHe'd = He would/had.)",
"x": 1
},
{
"q": "This ice cream store has new flavors on sale. You can try ..... all before you decide what you want.",
"o": [
"them",
"her",
"they",
"him"
],
"e": "new flavors جمع، وبعد الفعل try نحط ضمير مفعول ← them.",
"x": 1
},
{
"q": "My mother made some cookies this afternoon. She put ..... on the kitchen table.",
"o": [
"them",
"him",
"her",
"they"
],
"e": "some cookies جمع، وبعد الفعل put نحط ضمير مفعول ← them.",
"x": 1
},
{
"q": "Have you tasted Auntie Majda's kabsa? ..... the best cook in our family.",
"o": [
"She's",
"Her",
"Hers",
"She'd"
],
"e": "Auntie Majda = She، ونحتاج فاعل + is قبل the best cook ← She's = She is. (Her/Hers مو فاعل، وShe'd = She would/had.)",
"x": 1
},
{
"q": "Where did you put the extra towels? I looked everywhere, but I can't find ......",
"o": [
"them",
"they",
"she",
"her"
],
"e": "the extra towels جمع، وبعد الفعل find نحط ضمير مفعول ← them. (they فاعل، وshe/her للمفرد المؤنث.)",
"x": 1
}
]
},
{
"rule": "Verbs + gerunds or infinitives",
"qs": [
{
"q": "I want ..... my grandmother this weekend. She lives in Abha.",
"o": [
"to visit",
"visit",
"visiting",
"to visiting"
],
"e": "بعد want نحط to + الفعل الأساسي: want to visit."
},
{
"q": "My brother enjoys ..... football with his friends every Friday. He never misses a game.",
"o": [
"playing",
"to play",
"play",
"plays"
],
"e": "بعد enjoy الفعل ياخذ ing: enjoys playing."
},
{
"q": "You need ..... more water. It's very hot today.",
"o": [
"to drink",
"drink",
"drinking",
"to drinking"
],
"e": "بعد need نحط to + الفعل: need to drink."
},
{
"q": "My father has diabetes, so the doctor told him to avoid ..... too much sugar.",
"o": [
"eating",
"to eat",
"eat",
"eats"
],
"e": "بعد avoid الفعل ياخذ ing: avoid eating."
},
{
"q": "I study hard every day because I hope ..... a good job after I graduate.",
"o": [
"to find",
"find",
"finding",
"to finding"
],
"e": "بعد hope نحط to + الفعل الأساسي: hope to find."
},
{
"q": "Please stop ..... so loudly. The baby is sleeping.",
"o": [
"talking",
"to talk",
"talk",
"talks"
],
"e": "بعد stop نضيف ing: stop talking."
},
{
"q": "My sister tries ..... healthy food every day, but sometimes she eats pizza with her friends.",
"o": [
"to eat",
"eat",
"eats",
"to eating"
],
"e": "بعد try (بمعنى تحاول) نحط to + الفعل الأساسي: tries to eat."
},
{
"q": "I dislike ..... in traffic. It makes me very angry.",
"o": [
"waiting",
"to wait",
"wait",
"waits"
],
"e": "بعد dislike نضيف ing: dislike waiting."
},
{
"q": "Huda loves ..... cakes for her friends. She makes a chocolate cake every weekend.",
"o": [
"to bake",
"bake",
"bakes",
"to baking"
],
"e": "بعد love يجي to + الفعل أو ing ← to bake (bake و bakes و to baking كلها غلط)."
},
{
"q": "Khalid can't stand ..... early in the morning. He's always tired.",
"o": [
"waking up",
"wake up",
"wakes up",
"to waking up"
],
"e": "بعد can't stand يجي to أو ing ← waking up (الخيارات الثانية غلط)."
},
{
"q": "Our relatives are visiting tonight, so we need ..... the house before they arrive.",
"o": [
"to clean",
"clean",
"cleaning",
"to cleaning"
],
"e": "بعد need نحط to + الفعل الأساسي: need to clean."
},
{
"q": "I enjoy ..... books in the library. It's very quiet there.",
"o": [
"reading",
"to read",
"read",
"reads"
],
"e": "بعد enjoy نضيف ing: enjoy reading."
},
{
"q": "My aunt and uncle want ..... a big party for their son's graduation next month.",
"o": [
"to have",
"have",
"having",
"to having"
],
"e": "بعد want نحط to + الفعل الأساسي: want to have."
},
{
"q": "My father stopped ..... coffee at night because he couldn't sleep well. Now he sleeps much better.",
"o": [
"drinking",
"to drink",
"drink",
"drinks"
],
"e": "بعد stop (بمعنى بطّل) الفعل ياخذ ing: stopped drinking."
},
{
"q": "Sara hates ..... the dishes. She always asks her brother to do it.",
"o": [
"washing",
"wash",
"washes",
"to washing"
],
"e": "بعد hate يجي to أو ing ← washing (الخيارات الثانية غلط)."
},
{
"q": "Ahmed's graduation party is tomorrow night. I hope ..... you there with your brothers.",
"o": [
"to see",
"see",
"seeing",
"to seeing"
],
"e": "بعد hope نحط to + الفعل الأساسي: hope to see."
},
{
"q": "Phones are not allowed in the exam room, so please avoid ..... them during the test.",
"o": [
"using",
"to use",
"use",
"uses"
],
"e": "بعد avoid الفعل ياخذ ing: avoid using."
},
{
"q": "Faisal ..... to finish his history project before Sunday, so he is working on it all weekend.",
"o": [
"needs",
"need",
"needing",
"to need"
],
"e": "Faisal = He ← الفعل الأول ينضاف له s: needs، وبعده to finish."
},
{
"q": "My mother ..... watching cooking shows on TV. She learns a new recipe from them every week.",
"o": [
"enjoys",
"enjoy",
"enjoying",
"to enjoy"
],
"e": "My mother = She ← الفعل الأول ينضاف له s: enjoys، وبعده watching."
},
{
"q": "I like ..... with my family in the evening. We go to the park near our house.",
"o": [
"walking",
"walk",
"walks",
"to walking"
],
"e": "بعد like يجي to + الفعل أو ing ← walking (walk و walks و to walking كلها غلط)."
},
{
"q": "A: We're driving to the beach on Friday. Do you want ..... with us? B: Yes, I'd love to!",
"o": [
"to come",
"come",
"coming",
"to coming"
],
"e": "بعد want نحط to + الفعل الأساسي: want to come."
},
{
"q": "Omar tried ..... the big box up the stairs, but it was too heavy for him.",
"o": [
"to carry",
"carry",
"carries",
"to carrying"
],
"e": "بعد try (بمعنى حاول) نحط to + الفعل الأساسي: tried to carry."
},
{
"q": "My little brother dislikes ..... to bed early. He always wants to stay up and watch cartoons.",
"o": [
"going",
"to go",
"go",
"goes"
],
"e": "بعد dislike الفعل ياخذ ing: dislikes going."
},
{
"q": "I love ..... in the sea. Every summer, we spend a week at the beach in Jeddah.",
"o": [
"swimming",
"swim",
"swims",
"to swimming"
],
"e": "بعد love يجي to + الفعل أو ing ← swimming (swim و swims و to swimming كلها غلط)."
},
{
"q": "You need ..... your passport to the airport. They won't let you travel without it.",
"o": [
"to bring",
"bring",
"bringing",
"to bringing"
],
"e": "بعد need نحط to + الفعل الأساسي: need to bring."
},
{
"q": "Please stop ..... video games and do your homework! You have an exam tomorrow morning.",
"o": [
"playing",
"to play",
"play",
"plays"
],
"e": "بعد stop (بمعنى بطّل) الفعل ياخذ ing: stop playing."
},
{
"q": "My cousin Reem hopes ..... medicine at King Saud University after she finishes high school.",
"o": [
"to study",
"study",
"studying",
"to studying"
],
"e": "بعد hope نحط to + الفعل الأساسي: hopes to study."
},
{
"q": "I can't stand ..... to loud music when I'm studying. I need a quiet room.",
"o": [
"to listen",
"listen",
"listens",
"to listening"
],
"e": "بعد can't stand يجي to + الفعل أو ing ← to listen (listen و listens و to listening كلها غلط)."
}
]
},
{
"rule": "Prepositions of location",
"qs": [
{
"q": "The student is sitting ..... his desk, writing in his notebook before the exam starts.",
"o": [
"at",
"over",
"above",
"under"
],
"e": "at للمكان المحدد اللي يكون الشخص عنده: sitting at his desk (قاعد عند مكتبه يكتب)."
},
{
"q": "The ruler isn't on the desk. Open the drawer; it's ..... the drawer, next to my pens.",
"o": [
"in",
"over",
"above",
"at"
],
"e": "in = داخل: تفتح الدرج والمسطرة داخله ← in the drawer."
},
{
"q": "The lamp hangs from the ceiling. It is ..... the desk, so I can read at night.",
"o": [
"above",
"under",
"in",
"at"
],
"e": "above = فوق بدون ما يلمس: المصباح معلّق من السقف فهو فوق المكتب ← above the desk."
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
"q": "I put a big poster of my favourite team ..... the wall of my bedroom.",
"o": [
"on",
"in",
"under",
"behind"
],
"e": "on = على سطح الشيء (يلمسه): on the wall."
},
{
"q": "The trash can is ..... the desk, so I can throw papers in it without standing up.",
"o": [
"next to",
"in",
"over",
"above"
],
"e": "next to / beside = جنب: السلة جنب المكتب فترمي فيها وأنت قاعد ← next to the desk."
},
{
"q": "The bookshelf is ..... the sofa, so I have to walk around the sofa to get a book.",
"o": [
"behind",
"on",
"in",
"over"
],
"e": "behind = ورا: لازم تلف حول الكنبة عشان توصل للرف، يعني الرف وراها."
},
{
"q": "I put the fan ..... the bookshelf, so now I can't see the books behind it.",
"o": [
"in front of",
"under",
"over",
"at"
],
"e": "in front of = قدام: المروحة قدام الرف وتغطي الكتب اللي وراها."
},
{
"q": "A: Excuse me, where is the pharmacy? B: It's ..... the bank. They are side by side.",
"o": [
"next to",
"under",
"in",
"over"
],
"e": "side by side = جنب بعض ← next to."
},
{
"q": "A: Where is the bus stop? B: It's ..... the hospital. You can see it when you come out of the main door.",
"o": [
"in front of",
"behind",
"under",
"over"
],
"e": "تشوفه أول ما تطلع من الباب الرئيسي ← in front of (قدام)."
},
{
"q": "I'm waiting for you ..... the traffic lights. Hurry up!",
"o": [
"at",
"in",
"under",
"over"
],
"e": "at للمكان المحدد اللي الشخص واقف عنده: at the traffic lights."
},
{
"q": "There's a small café ..... the corner of our street. I buy my coffee there every morning.",
"o": [
"on",
"under",
"above",
"behind"
],
"e": "on the corner = على زاوية الشارع."
},
{
"q": "The car park is ..... the mall. Walk to the back of the building to find it.",
"o": [
"behind",
"in front of",
"over",
"in"
],
"e": "الخلف (the back of the building) ← behind."
},
{
"q": "Be careful! There's a cat ..... your car. Look down before you drive.",
"o": [
"under",
"over",
"above",
"in"
],
"e": "under = تحت السيارة."
},
{
"q": "The children are playing football ..... the street. It's dangerous!",
"o": [
"in",
"over",
"under",
"above"
],
"e": "in للمكان اللي الشخص داخله: in the street."
},
{
"q": "A: Where is the bakery? B: It's ..... the right of the supermarket.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on the right of = على يمين."
},
{
"q": "The bridge is ..... the highway. Cars drive under it.",
"o": [
"over",
"under",
"in",
"behind"
],
"e": "السيارات تمشي تحته، فالجسر فوق ← over."
},
{
"q": "The man is standing ..... the bus stop. He is waiting for the bus.",
"o": [
"at",
"in",
"under",
"over"
],
"e": "at للمكان المحدد: at the bus stop."
},
{
"q": "Look up! The big green sign that says \"Pharmacy\" is ..... the door of the shop.",
"o": [
"above",
"under",
"in",
"behind"
],
"e": "Look up (طالع فوق) ← above = فوق الباب بدون ما يلمسه."
},
{
"q": "A: Where did you park? B: I parked ..... the hotel entrance.",
"o": [
"in front of",
"under",
"above",
"in"
],
"e": "in front of = قدام مدخل الفندق."
},
{
"q": "Look at the street map: the school is on the left, the mosque is in the middle, and the park is on the ..... of the mosque.",
"o": [
"right",
"front",
"back",
"next"
],
"e": "المدرسة يسار والمسجد في الوسط، فالحديقة على اليمين ← on the right of."
},
{
"q": "There are many restaurants and cafés ..... Tahlia Street, so it's always busy at night.",
"o": [
"on",
"under",
"above",
"over"
],
"e": "on مع أسماء الشوارع: on Tahlia Street."
},
{
"q": "The streetlights are ..... the road. They light it at night.",
"o": [
"over",
"under",
"in",
"at"
],
"e": "over = فوق الطريق بدون ما تلمسه."
},
{
"q": "A: Where is the gas station? B: It's ..... the left of the mall.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on the left of = على يسار."
},
{
"q": "The taxi is ..... the bus. The bus can't see the road ahead.",
"o": [
"in front of",
"behind",
"under",
"on"
],
"e": "التاكسي قدام الباص، فالباص ما يشوف الطريق ← in front of."
},
{
"q": "My office is ..... the third floor of that building, so I take the elevator every morning.",
"o": [
"on",
"in",
"under",
"over"
],
"e": "on مع الأدوار: on the third floor."
},
{
"q": "Turn left at the traffic lights. The bank is ..... your right.",
"o": [
"on",
"in",
"at",
"under"
],
"e": "on your right = على يمينك."
},
{
"q": "The boy is hiding ..... the car. His friends can't find him.",
"o": [
"behind",
"in front of",
"on",
"over"
],
"e": "behind = ورا السيارة عشان ما يشوفونه."
},
{
"q": "A: Where is the hospital? B: It's ..... the end of this street.",
"o": [
"at",
"on",
"under",
"over"
],
"e": "at the end of the street = في نهاية الشارع."
},
{
"q": "The bank is on the left of the café, so the café is on the ..... of the bank.",
"o": [
"right",
"left",
"front",
"behind"
],
"e": "إذا البنك يسار المقهى، فالمقهى يمين البنك ← right."
},
{
"q": "There is a big tree ..... our house. It gives shade to the front door.",
"o": [
"in front of",
"behind",
"under",
"over"
],
"e": "يظلل الباب الأمامي، فالشجرة قدام البيت ← in front of."
},
{
"q": "It's raining hard, so I parked my car ..... the garage to keep it dry.",
"o": [
"in",
"over",
"above",
"under"
],
"e": "in = داخل: داخل الكراج عشان ما يجيها المطر ← in the garage."
},
{
"q": "A: Where is your bike? B: It's ..... the wall, beside the door.",
"o": [
"next to",
"over",
"in",
"above"
],
"e": "beside = next to ← جنب الجدار."
},
{
"q": "The police officer is standing ..... the middle of the road and stopping the cars.",
"o": [
"in",
"on",
"at",
"under"
],
"e": "in the middle of = في وسط."
},
{
"q": "A: I can't find my phone! B: Look down. It's ..... the car seat.",
"o": [
"under",
"over",
"above",
"in"
],
"e": "Look down (طالع تحت) ← under = تحت الكرسي."
},
{
"q": "School is over. The children are waiting ..... the school gate for their parents to arrive.",
"o": [
"at",
"in",
"under",
"over"
],
"e": "at للمكان المحدد: at the school gate."
},
{
"q": "The shop's name is written ..... the glass of the window in big red letters.",
"o": [
"on",
"at",
"in",
"next to"
],
"e": "on = على سطح الشيء: الاسم مكتوب على الزجاج نفسه."
},
{
"q": "A: Where are the shopping bags? B: They're ..... the car, on the back seat.",
"o": [
"in",
"on",
"under",
"over"
],
"e": "in = داخل السيارة."
},
{
"q": "Turn right when you see the traffic lights. They are ..... the corner, next to the bank.",
"o": [
"on",
"under",
"above",
"over"
],
"e": "on the corner = على الزاوية."
},
{
"q": "The new restaurant is ..... the mall. It's on the second floor.",
"o": [
"in",
"under",
"over",
"behind"
],
"e": "in = داخل المول."
}
]
}
];
