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
"e": "She's اختصار She is، والفاصلة العلوية مكان حرف i المحذوف (She + 's)."
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
"q": "Look at those men near the door. ..... my uncles from Jeddah, and they visit us every Eid.",
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
"q": "My sister ..... coffee because it gives her a headache. She only drinks tea in the morning.",
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
"q": "My father ..... the newspaper every morning with his coffee before he goes to work.",
"o": [
"reads",
"read",
"reading",
"is read"
],
"e": "My father = He ← عادة كل يوم، فنضيف s للفعل: reads."
},
{
"q": "It rarely rains in Riyadh in summer. The sun ..... every day, and the sky is blue.",
"o": [
"shines",
"shine",
"shining",
"is shine"
],
"e": "The sun = It ← عادة كل يوم، فنضيف s للفعل: shines."
},
{
"q": "These cookies from the new bakery ..... delicious. Can I have another one, please?",
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
"q": "A: What time ..... the bank open its doors? B: At 9:30 in the morning.",
"o": [
"does",
"do",
"is",
"are"
],
"e": "the bank = It ← WH + does + Subject + الفعل الأساسي (open)."
},
{
"q": "My little brother ..... every time he can't find his toys. Then my mother helps him look.",
"o": [
"cries",
"crys",
"cry",
"crying"
],
"e": "He ← قبل y حرف غير متحرك (r) فنحذف y ونضيف ies: cries."
},
{
"q": "Sami ..... his car every weekend with soap and water, so it's always clean.",
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
"q": "Khalid ..... fast food. He says it's unhealthy, so he always eats at home.",
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
"e": "My mother = She ← عادة كل يوم، فنضيف s للفعل: cooks."
},
{
"q": "I ..... my grandparents every Friday after the prayer. They live near our house.",
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
"q": "The shops in this small mall ..... at 10 p.m. every night, so we always go early.",
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
"q": "Zainab ..... all the cats in her neighborhood with food she buys at the local pet store.",
"o": [
"feeds",
"don't feed",
"feed",
"feeding"
],
"e": "Zainab = She ← في الإثبات نضيف s للفعل: feeds.",
"x": 1
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
"rule": "Simple past",
"qs": [
{
"q": "I ..... to my brother's football match, so he was angry with me.",
"o": [
"didn't go",
"gone",
"not go",
"doesn't go"
],
"e": "أخوه زعل (was angry) يعني الكلام عن الماضي ← النفي: didn't + الفعل الأساسي go.",
"x": 1
},
{
"q": "In the 1900s, people ..... wood to make fires to stay warm.",
"o": [
"burned",
"burns",
"burning",
"burn"
],
"e": "«In the 1900s» زمن ماضي ← burn + ed = burned.",
"x": 1
},
{
"q": "I was very tired yesterday, so I ..... to bed at nine o'clock.",
"o": [
"went",
"go",
"goes",
"going"
],
"e": "«yesterday» ماضي ← go ماضيه went (فعل شاذ)."
},
{
"q": "A: ..... you at home last night? B: No, I was at my cousin's house.",
"o": [
"Were",
"Was",
"Did",
"Are"
],
"e": "مع you نستخدم were ← Were you…? والجواب I was."
},
{
"q": "My grandfather ..... a teacher when he was young. He taught math at a school in Taif.",
"o": [
"was",
"were",
"is",
"did"
],
"e": "«when he was young» و«taught» ماضي، و My grandfather = He ← مع He / She / It / I نستخدم was."
},
{
"q": "The students ..... very happy after the exam yesterday. It was easy, and everyone finished early.",
"o": [
"were",
"was",
"are",
"did"
],
"e": "The students جمع (They) ← في الماضي were."
},
{
"q": "We ..... at the mall yesterday. We stayed at home all day.",
"o": [
"weren't",
"wasn't",
"didn't",
"don't"
],
"e": "We ← النفي were + not = weren't (لأنهم جلسوا في البيت)."
},
{
"q": "A: Did you watch the match last night? B: No, I ......",
"o": [
"didn't",
"don't",
"wasn't",
"did"
],
"e": "Did you…? ← الجواب المختصر: No, I didn't."
},
{
"q": "My sister ..... a beautiful dress for her friend's wedding last week. It was very expensive.",
"o": [
"bought",
"buyed",
"buys",
"buy"
],
"e": "«last week» ماضي ← buy فعل شاذ، ماضيه bought."
},
{
"q": "They ..... to Jeddah by plane. The flight took an hour and a half.",
"o": [
"flew",
"flied",
"fly",
"flying"
],
"e": "الرحلة خلصت (took) ← fly فعل شاذ، ماضيه flew."
},
{
"q": "A: What ..... you eat for breakfast this morning? B: Eggs and bread.",
"o": [
"did",
"do",
"does",
"were"
],
"e": "السؤال في الماضي: What + did + you + الفعل الأساسي (eat)."
},
{
"q": "I ..... my homework last night because I was sick, so my teacher gave me one more day.",
"o": [
"didn't do",
"didn't did",
"don't do",
"not did"
],
"e": "«last night» ماضي ← didn't + الفعل الأساسي do (مو did)."
},
{
"q": "Khalid ..... his keys this morning, so he couldn't open the door.",
"o": [
"lost",
"losed",
"loses",
"lose"
],
"e": "«this morning» صار وخلص ← lose فعل شاذ، ماضيه lost."
},
{
"q": "My father ..... me a new phone for my birthday last month.",
"o": [
"gave",
"gived",
"gives",
"give"
],
"e": "«last month» ماضي ← give فعل شاذ، ماضيه gave."
},
{
"q": "Our baby ..... for hours last night, so my parents didn't get any sleep.",
"o": [
"cried",
"cryed",
"cries",
"crys"
],
"e": "«last night» ماضي، وقبل y حرف غير متحرك (r) ← نحذف y ونضيف ied: cry ← cried."
},
{
"q": "We ..... a great time at the beach last weekend. We swam and played football all day.",
"o": [
"had",
"haved",
"have",
"has"
],
"e": "«last weekend» ماضي ← have فعل شاذ، ماضيه had."
},
{
"q": "A: Where ..... you go on your holiday last year? B: We went to Malaysia.",
"o": [
"did",
"do",
"were",
"was"
],
"e": "سؤال ماضي فيه فعل (go) ← Where + did + you + الفعل الأساسي."
},
{
"q": "I ..... Sara at the supermarket two days ago. She said hello to me.",
"o": [
"met",
"meeted",
"meet",
"meets"
],
"e": "«two days ago» ماضي ← meet فعل شاذ، ماضيه met."
},
{
"q": "We went to the cinema last night. The film ..... very long, almost three hours!",
"o": [
"was",
"were",
"is",
"did"
],
"e": "The film = It ← في الماضي was."
},
{
"q": "Omar ..... to study for the math exam last week, so he failed it.",
"o": [
"didn't try",
"didn't tried",
"doesn't try",
"not tried"
],
"e": "«last week» ماضي والنتيجة صارت (failed) ← didn't + الفعل الأساسي try."
},
{
"q": "My mother ..... a delicious cake for my brother's party yesterday. Everyone loved it.",
"o": [
"made",
"maked",
"makes",
"make"
],
"e": "«yesterday» ماضي ← make فعل شاذ، ماضيه made."
},
{
"q": "A: Was the test difficult? B: No, it ...... It was easy.",
"o": [
"wasn't",
"weren't",
"didn't",
"isn't"
],
"e": "Was it…? ← الجواب المختصر: No, it wasn't."
},
{
"q": "We ..... the bus because we were late. We took a taxi instead.",
"o": [
"missed",
"missd",
"miss",
"missing"
],
"e": "الكلام عن موقف صار (took a taxi) ← miss + ed = missed."
},
{
"q": "I ..... the news on TV last night. It was about the weather.",
"o": [
"saw",
"seen",
"see",
"sees"
],
"e": "«last night» ماضي ← see فعل شاذ، ماضيه saw."
},
{
"q": "A: ..... your brother call you yesterday? B: Yes, he called me in the evening.",
"o": [
"Did",
"Was",
"Does",
"Is"
],
"e": "«yesterday» ماضي وفيه فعل (call) ← Did + your brother + الفعل الأساسي."
}
]
},
{
"rule": "Should / Shouldn't",
"qs": [
{
"q": "You ..... cigarettes. They are very bad for your health and for the people around you.",
"o": [
"shouldn't smoke",
"should smoking",
"should smoke",
"shouldn't smoking"
],
"e": "التدخين يضر (الجملة الثانية توضح) ← shouldn't + الفعل الأساسي (smoke)، بدون ing."
},
{
"q": "You ..... the garbage out once it's full to avoid bad smells.",
"o": [
"should throw",
"should",
"shouldn't",
"shouldn't throw"
],
"e": "رمي الزبالة شي زين عشان ما تطلع ريحة ← should + الفعل الأساسي throw.",
"x": 1
},
{
"q": "You look very tired, and you have work tomorrow morning. You ..... go to bed early tonight.",
"o": [
"should",
"shouldn't",
"should to",
"shoulds"
],
"e": "النوم بدري شي زين للتعبان ← should + go."
},
{
"q": "You ..... drink coffee before bed. It will keep you awake, and you'll feel tired tomorrow.",
"o": [
"shouldn't",
"should",
"should not to",
"don't should"
],
"e": "القهوة قبل النوم تسهّرك (شي مو زين) ← shouldn't + drink."
},
{
"q": "Students ..... use their phones during the exam. The teacher will take them if they do.",
"o": [
"shouldn't",
"should",
"shouldn't to",
"doesn't should"
],
"e": "الجوال وقت الاختبار ممنوع والمعلم بياخذه ← shouldn't + use (بدون to)."
},
{
"q": "It's very cold outside this morning. You ..... wear a jacket, or you'll get sick.",
"o": [
"should",
"shouldn't",
"should to",
"are should"
],
"e": "البرد يحتاج جاكيت (شي زين) ← should + wear."
},
{
"q": "A: I have a terrible toothache. B: You ..... see a dentist.",
"o": [
"should",
"shouldn't",
"should to",
"should seeing"
],
"e": "النصيحة للي عنده ألم أسنان: should + see."
},
{
"q": "A: ..... I take an umbrella? B: Yes, you should. It's going to rain.",
"o": [
"Should",
"Do",
"Am",
"Shoulds"
],
"e": "السؤال: Should + I + الفعل الأساسي، والجواب Yes, you should."
},
{
"q": "A: Should we eat fast food every day? B: No, we ......",
"o": [
"shouldn't",
"should",
"don't should",
"aren't"
],
"e": "الأكل السريع كل يوم مو زين ← No, we shouldn't."
},
{
"q": "You ..... eat a lot of fruit and vegetables to stay healthy.",
"o": [
"should",
"shouldn't",
"should to",
"should eating"
],
"e": "الفواكه والخضار شي زين ← should + eat."
},
{
"q": "My brother drives too fast, and he had an accident last month. He ..... drive more slowly.",
"o": [
"should",
"shouldn't",
"should to",
"shoulds"
],
"e": "النصيحة الصح يسوق على مهل (شي زين) ← should + drive."
},
{
"q": "You ..... leave your bag alone at the airport. Someone could easily steal it.",
"o": [
"shouldn't",
"should",
"should to",
"shouldn't to"
],
"e": "ترك الشنطة لحالها خطر لأن ممكن تنسرق ← shouldn't + leave (بدون to)."
},
{
"q": "Oh no, I lost my passport at the airport! What ..... I do now?",
"o": [
"should",
"shoulds",
"do should",
"am should"
],
"e": "السؤال: What + should + I + الفعل الأساسي (do)."
},
{
"q": "Children ..... play with fire or matches. It's very dangerous, and they can get hurt.",
"o": [
"shouldn't",
"should",
"shouldn't to",
"don't should"
],
"e": "اللعب بالنار خطير (شي مو زين) ← shouldn't + play."
},
{
"q": "If you want to pass the exam, you ..... study every day.",
"o": [
"should",
"shouldn't",
"should to",
"should studying"
],
"e": "المذاكرة كل يوم شي زين ← should + study."
},
{
"q": "A: My English is not very good. B: You ..... practice speaking with your friends.",
"o": [
"should",
"shouldn't",
"should to",
"should practicing"
],
"e": "النصيحة: should + practice (الفعل الأساسي)."
},
{
"q": "You ..... be late for your job interview. The manager will think you are not serious.",
"o": [
"shouldn't",
"should",
"shouldn't to",
"don't should"
],
"e": "التأخير يعطي صورة سيئة عنك ← shouldn't + be (وما نقول don't should)."
},
{
"q": "We ..... help our parents at home. They work hard and they need our help.",
"o": [
"should",
"shouldn't",
"should to",
"should helping"
],
"e": "مساعدة الوالدين شي زين ← should + help (بدون to وبدون ing)."
},
{
"q": "A: Should Sara buy that expensive bag? B: No, she ...... She doesn't have enough money.",
"o": [
"shouldn't",
"should",
"doesn't",
"isn't"
],
"e": "ما عندها فلوس كفاية ← No, she shouldn't."
},
{
"q": "You ..... wash your hands before you eat. They carry germs that can make you sick.",
"o": [
"should",
"shouldn't",
"should to",
"should washing"
],
"e": "غسل اليدين قبل الأكل يحميك من الجراثيم ← should + wash."
},
{
"q": "People ..... throw rubbish in the street. They should use the bins.",
"o": [
"shouldn't",
"should",
"should to",
"don't should"
],
"e": "رمي الزبالة في الشارع شي غلط ← shouldn't + throw."
},
{
"q": "A: Where should we go for dinner? B: We ..... try the new Italian restaurant.",
"o": [
"should",
"shouldn't",
"should to",
"shoulds"
],
"e": "اقتراح شي زين ← should + try."
},
{
"q": "He ..... spend all his money on video games. He needs to save some.",
"o": [
"shouldn't",
"should",
"shouldn't to",
"doesn't should"
],
"e": "صرف كل فلوسه على الألعاب شي مو زين ← shouldn't + spend."
},
{
"q": "You ..... drink a lot of water in summer. It's very hot, and your body needs it.",
"o": [
"should",
"shouldn't",
"should to",
"should drinking"
],
"e": "الجو حار والجسم يحتاج ماء ← should + drink."
},
{
"q": "A: Should I tell my parents the truth? B: Yes, you ......",
"o": [
"should",
"do",
"are",
"shoulds"
],
"e": "الجواب المختصر: Yes, you should."
}
]
},
{
"rule": "It's + adjective + infinitive",
"qs": [
{
"q": "It's ..... new languages if you practice every day.",
"o": [
"easy to learn",
"learn easy",
"easy learn",
"easy learn to"
],
"e": "الترتيب: It's + صفة (easy) + to + الفعل (learn).",
"x": 1
},
{
"q": "It's ..... to eat a lot of fast food. It has too much fat and salt.",
"o": [
"unhealthy",
"unhealthy not",
"to unhealthy",
"unhealthily"
],
"e": "It's + صفة + to. والأكل السريع فيه دهون وملح كثير ← It's unhealthy to eat… (unhealthily ظرف مو صفة)."
},
{
"q": "It's ..... to wear a seat belt in the car. It can save your life in an accident.",
"o": [
"important",
"importantly",
"important not",
"to important"
],
"e": "It's + صفة (important) + to + الفعل. importantly ظرف مو صفة."
},
{
"q": "It's fun ..... volleyball with friends at the beach. We go there every Friday evening.",
"o": [
"to play",
"play",
"playing to",
"plays"
],
"e": "It's + fun + to + الفعل الأساسي: to play."
},
{
"q": "Look at the big waves! It's ..... to swim here. The sea is very rough today.",
"o": [
"not safe",
"safe not",
"not safe to",
"safely"
],
"e": "النفي: It's + not + صفة + to. والبحر هايج ← It's not safe to swim."
},
{
"q": "A: Why do you study every day? B: Because it's necessary ..... good grades.",
"o": [
"to get",
"get",
"gets",
"to getting"
],
"e": "بعد الصفة necessary يجي to + الفعل الأساسي."
},
{
"q": "It's hard ..... up early in winter. The mornings are cold and dark, and I feel lazy.",
"o": [
"to wake",
"wake",
"waking to",
"to waking"
],
"e": "It's + hard + to + الفعل الأساسي (wake)."
},
{
"q": "It's ..... to visit your grandparents every week. They love to see you and hear your news.",
"o": [
"nice",
"nicely",
"not nice",
"to nice"
],
"e": "It's + صفة + to. وزيارة الجدّين شي حلو ← It's nice to visit…"
},
{
"q": "It's not easy ..... a good job in a big city. Many people apply for the same job.",
"o": [
"to find",
"find",
"finds",
"to finding"
],
"e": "النفي: It's not + صفة + to + الفعل الأساسي: not easy to find."
},
{
"q": "..... to walk alone at night in this area. There are no lights on the streets.",
"o": [
"It's dangerous",
"Dangerous it's",
"It dangerous",
"It's dangerously"
],
"e": "الترتيب: It's + صفة + to ← It's dangerous to walk… (dangerously ظرف مو صفة)."
},
{
"q": "It's interesting ..... about other cultures. That's why I watch travel videos every weekend.",
"o": [
"to learn",
"learn",
"learns",
"to learning"
],
"e": "It's + interesting + to + الفعل الأساسي."
},
{
"q": "It's ..... to talk on the phone while you're driving. You can easily have an accident.",
"o": [
"not a good idea",
"a good idea not",
"not good idea to",
"no good idea"
],
"e": "الكلام بالجوال وأنت تسوق خطر ← النفي: It's + not + a good idea + to."
},
{
"q": "It's polite ..... \"please\" and \"thank you\" when you ask for something. People will respect you.",
"o": [
"to say",
"say",
"says",
"to saying"
],
"e": "It's + polite + to + الفعل الأساسي: to say."
},
{
"q": "It's ..... to drink water when you exercise. Your body loses a lot of water when you sweat.",
"o": [
"important",
"importance",
"importantly",
"important not"
],
"e": "بعد It's تجي صفة (important) + to. importance اسم و importantly ظرف."
},
{
"q": "It's boring ..... at home all day with nothing to do, so I often visit my cousins.",
"o": [
"to stay",
"stay",
"staying to",
"stays"
],
"e": "It's + boring + to + الفعل الأساسي: to stay."
},
{
"q": "It's ..... to be late for class. The teacher doesn't like it.",
"o": [
"not OK",
"OK not",
"not OK to",
"no OK"
],
"e": "النفي: It's + not + OK + to. والمعلم ما يحب التأخير ← not OK."
},
{
"q": "It's difficult ..... English grammar without practice, so I do some exercises every evening.",
"o": [
"to understand",
"understand",
"understands",
"to understanding"
],
"e": "It's + difficult + to + الفعل الأساسي: to understand."
},
{
"q": "It's ..... to help people who need help. My family gives food to poor families every Ramadan.",
"o": [
"good",
"goodness",
"to good",
"goods"
],
"e": "بعد It's تجي صفة (good) + to. goodness و goods أسماء مو صفات."
},
{
"q": "It's exciting ..... a new country for the first time. Last year, I went to Japan.",
"o": [
"to visit",
"visit",
"visiting to",
"to visiting"
],
"e": "It's + exciting + to + الفعل الأساسي: to visit."
},
{
"q": "It's not polite ..... while other people are talking. Wait until they finish, then speak.",
"o": [
"to interrupt",
"interrupt",
"interrupting to",
"to interrupting"
],
"e": "النفي: It's not + صفة + to + الفعل الأساسي."
},
{
"q": "A: Is it expensive to live in Riyadh? B: Yes, it's quite expensive ..... an apartment in the city centre.",
"o": [
"to rent",
"rent",
"rents",
"to renting"
],
"e": "بعد الصفة expensive يجي to + الفعل الأساسي."
},
{
"q": "It's ..... to sleep eight hours every night. Your body and your brain need rest.",
"o": [
"healthy",
"healthily",
"health",
"healthy not"
],
"e": "بعد It's تجي صفة (healthy) + to. health اسم و healthily ظرف."
},
{
"q": "It's easy ..... lost in a big city like Riyadh, so always use a map app.",
"o": [
"to get",
"get",
"gets",
"to getting"
],
"e": "It's + easy + to + الفعل الأساسي: to get."
},
{
"q": "It's ..... to make mistakes when you learn a new language, so don't worry about them.",
"o": [
"normal",
"normally",
"not normal to",
"to normal"
],
"e": "الأخطاء طبيعية وقت التعلّم (don't worry) ← It's + normal + to + make. normally ظرف."
}
]
},
{
"rule": "Be going to",
"qs": [
{
"q": "He ..... spend three months in Canada to finish his research.",
"o": [
"is going to",
"going to",
"is going",
"to going"
],
"e": "He + is + going to + الفعل الأساسي (spend). لازم is ولازم to.",
"x": 1
},
{
"q": "We ..... visit our grandparents this weekend. We've already bought the tickets.",
"o": [
"are going to",
"is going to",
"going to",
"are going"
],
"e": "We + are + going to + الفعل."
},
{
"q": "A: What ..... you going to do after graduation? B: I'm going to look for a job.",
"o": [
"are",
"is",
"do",
"will"
],
"e": "السؤال: What + are + you + going to + الفعل."
},
{
"q": "My sister ..... study medicine at King Saud University next year. She wants to be a doctor.",
"o": [
"is going to",
"are going to",
"going to",
"is going"
],
"e": "My sister = She ← is + going to + الفعل (ولازم to قبل study)."
},
{
"q": "My cousins ..... come to the party tonight. They're too busy with their final exams.",
"o": [
"aren't going to",
"isn't going to",
"not going to",
"aren't going"
],
"e": "النفي: My cousins (They) + are + not + going to ← aren't going to."
},
{
"q": "I'm really hungry, and there's bread and cheese in the kitchen. I ..... make a sandwich.",
"o": [
"am going to",
"is going to",
"going to",
"am going"
],
"e": "I + am + going to + الفعل."
},
{
"q": "A: Is Fahad going to play football tomorrow? B: No, he ...... He hurt his leg.",
"o": [
"isn't",
"doesn't",
"aren't",
"won't to"
],
"e": "Is he…? ← الجواب المختصر: No, he isn't."
},
{
"q": "The shop ..... open a new branch in Jeddah next month. The workers are getting it ready now.",
"o": [
"is going to",
"are going to",
"going to",
"is going"
],
"e": "The shop = It ← is + going to + الفعل."
},
{
"q": "A: ..... your parents going to travel this summer? B: Yes, they're going to visit Turkey.",
"o": [
"Are",
"Is",
"Do",
"Does"
],
"e": "your parents جمع ← Are + they + going to."
},
{
"q": "I ..... buy a new car this year. My old car is still fine.",
"o": [
"am not going to",
"am not going",
"not going to",
"isn't going to"
],
"e": "النفي: I + am + not + going to + الفعل."
},
{
"q": "Be careful! The floor in the kitchen is wet, and you're running. You ..... fall!",
"o": [
"are going to",
"is going to",
"going to",
"are going"
],
"e": "شي واضح بيصير الحين (You) ← are + going to."
},
{
"q": "We are going to ..... a party for my father's birthday next Friday. All our cousins are coming.",
"o": [
"have",
"having",
"has",
"to have"
],
"e": "بعد going to يجي الفعل الأساسي: have (بدون to ثانية وبدون ing)."
},
{
"q": "A: What is Lama going to ..... at the wedding? B: A long blue dress.",
"o": [
"wear",
"wearing",
"wears",
"to wear"
],
"e": "بعد going to الفعل الأساسي: wear."
},
{
"q": "My friends ..... watch the match at my house tonight. I already bought some snacks and drinks.",
"o": [
"are going to",
"is going to",
"going to",
"are going"
],
"e": "My friends جمع ← are + going to + الفعل."
},
{
"q": "It ..... be very hot tomorrow, so drink a lot of water and stay inside at noon.",
"o": [
"is going to",
"are going to",
"going to",
"is going"
],
"e": "It + is + going to + be."
},
{
"q": "A: Are you going to study tonight? B: Yes, I ...... I have an exam tomorrow.",
"o": [
"am",
"do",
"are",
"going"
],
"e": "Are you…? ← الجواب المختصر: Yes, I am."
},
{
"q": "Khalid is not feeling well this morning. He ..... go to work today. He's staying home.",
"o": [
"isn't going to",
"aren't going to",
"not going to",
"isn't going"
],
"e": "النفي: He + is + not + going to ← isn't going to."
},
{
"q": "A: Where ..... you going to stay in Riyadh? B: At my uncle's house near the university.",
"o": [
"are",
"is",
"do",
"does"
],
"e": "السؤال مع you: Where + are + you + going to + الفعل."
},
{
"q": "I'm going to ..... my room this afternoon. It's very messy, and my mother is angry.",
"o": [
"clean",
"cleaning",
"cleans",
"to clean"
],
"e": "بعد going to الفعل الأساسي: clean."
},
{
"q": "The teacher ..... give us a test next Sunday, so we need to study this weekend.",
"o": [
"is going to",
"are going to",
"going to",
"is going"
],
"e": "The teacher = He / She ← is + going to + الفعل."
},
{
"q": "A: Why are you taking your camera? B: Because I ..... take photos of the mountains.",
"o": [
"am going to",
"is going to",
"going to",
"am going"
],
"e": "I + am + going to + take."
},
{
"q": "Ahmed and I ..... start a small online business together after we graduate next summer.",
"o": [
"are going to",
"is going to",
"am going to",
"going to"
],
"e": "Ahmed and I = We ← are + going to."
},
{
"q": "A: What time ..... the movie going to start? B: At nine o'clock. Let's leave at eight.",
"o": [
"is",
"are",
"does",
"do"
],
"e": "the movie مفرد ← What time + is + the movie + going to + الفعل."
},
{
"q": "Don't worry, I ..... tell anyone your secret. I promise I won't say a word.",
"o": [
"am not going to",
"not going to",
"am not going",
"don't going to"
],
"e": "النفي: I + am + not + going to + الفعل."
}
]
},
{
"rule": "But / Because / So / When",
"qs": [
{
"q": "My cousins and I are excited ..... are all going to try paragliding for the first time!",
"o": [
"because we",
"because our",
"because us",
"because them"
],
"e": "بعد because جملة كاملة تبدأ بفاعل (Subject)، والفاعل هنا «My cousins and I» = we ← because we.",
"x": 1
},
{
"q": "Mazin's hands always start sweating ..... nervous, so he puts them in his pockets.",
"o": [
"when he is",
"when is he",
"when he",
"when is"
],
"e": "when + جملة عادية بترتيب الخبر: Subject + Verb ← when he is (مو when is he).",
"x": 1
},
{
"q": "Sara did not go to school yesterday ..... she was sick. She had a high fever.",
"o": [
"because",
"so",
"but",
"because of"
],
"e": "نتيجة (ما راحت) + because + سبب (مريضة). وbecause of بعدها اسم مو جملة."
},
{
"q": "Sara had a high fever yesterday morning, ..... she did not go to school.",
"o": [
"so",
"because",
"but",
"because of"
],
"e": "سبب (عندها حرارة) + so + نتيجة (ما راحت المدرسة)."
},
{
"q": "I studied very hard for two weeks, ..... I failed the exam. I was really sad.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "ذاكر بقوة ورسب (تضاد) ← but، وقبلها فاصلة."
},
{
"q": "..... I run for a long time, I get tired and need to drink water.",
"o": [
"When",
"And",
"So",
"But"
],
"e": "When = عندما (وقت الجري)، ولما تكون when في البداية نحط فاصلة بعد الجملة الأولى."
},
{
"q": "I always get tired and thirsty ..... I run for more than thirty minutes.",
"o": [
"when",
"so",
"but",
"because of"
],
"e": "when في الوسط بدون فاصلة: النتيجة + when + وقت الجري. وbecause of بعدها اسم مو جملة."
},
{
"q": "It was raining heavily all day, ..... we stayed at home and watched a movie.",
"o": [
"so",
"because",
"but",
"when"
],
"e": "سبب (مطر) + so + نتيجة (جلسنا في البيت)."
},
{
"q": "We stayed at home and watched a movie ..... it was raining heavily all day.",
"o": [
"because",
"so",
"but",
"and so"
],
"e": "نتيجة (جلسنا) + because + سبب (المطر)."
},
{
"q": "I like coffee very much, ..... I don't like tea at all. I never drink it.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "جملتين متضادتين (أحب / ما أحب) ← but."
},
{
"q": "..... I was a child, I lived in Abha with my grandparents. Now I live in Riyadh.",
"o": [
"When",
"So",
"But",
"Because of"
],
"e": "When = عندما، تتكلم عن وقت (لما كنت صغير) ← When I was a child, …"
},
{
"q": "The shop near my house was closed, ..... I couldn't buy any bread for breakfast.",
"o": [
"so",
"because",
"but",
"when"
],
"e": "سبب (المحل مقفل) + so + نتيجة (ما اشتريت)."
},
{
"q": "I couldn't buy any bread for breakfast ..... the shop near my house was closed.",
"o": [
"because",
"so",
"but",
"because of"
],
"e": "نتيجة (ما اشتريت) + because + سبب (مقفل). وbecause of بعدها اسم مو جملة."
},
{
"q": "My brother is very smart, ..... he is lazy. He never does his homework on time.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "صفة حلوة (ذكي) وصفة مو حلوة (كسول) متضادين ← but."
},
{
"q": "I always drink a glass of water ..... I wake up. It's the first thing I do.",
"o": [
"when",
"so",
"but",
"because of"
],
"e": "when = عندما (وقت شرب الماء) ← … when I wake up."
},
{
"q": "Ahmed was very hungry after the football match, ..... he made a big chicken sandwich.",
"o": [
"so",
"because",
"but",
"when"
],
"e": "سبب (جوعان) + so + نتيجة (سوّى ساندويتش)."
},
{
"q": "Ahmed made a big sandwich after the football match ..... very hungry.",
"o": [
"because he was",
"because was he",
"because he",
"because was"
],
"e": "because + Subject + Verb ← because he was."
},
{
"q": "I wanted to go to the beach, ..... my father said no. The weather was too windy.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "أبي أروح لكن أبوي رفض (تضاد) ← but."
},
{
"q": "..... the teacher came into the classroom, all the students stopped talking and sat down.",
"o": [
"When",
"So",
"But",
"Because of"
],
"e": "When = عندما (وقت دخول المعلم)، وفي البداية بعدها فاصلة."
},
{
"q": "I'm going to bed early tonight ..... I have an important exam tomorrow morning.",
"o": [
"because",
"so",
"but",
"when"
],
"e": "نتيجة (بنام بدري) + because + سبب (عندي اختبار)."
},
{
"q": "I have an important exam tomorrow morning, ..... I'm going to bed early tonight.",
"o": [
"so",
"because",
"but",
"when"
],
"e": "سبب (اختبار) + so + نتيجة (بنام بدري)."
},
{
"q": "The food at the new restaurant was delicious, ..... it was very expensive. We paid 600 riyals.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "لذيذ لكن غالي (تضاد) ← but."
},
{
"q": "My mother is always happy ..... visit her on Fridays. She cooks lunch for everyone.",
"o": [
"when we",
"when us",
"when our",
"when do we"
],
"e": "when + Subject (we) + Verb ← when we visit."
},
{
"q": "Sorry, I didn't call you yesterday ..... phone was broken. I fixed it this morning.",
"o": [
"because my",
"because me",
"because I",
"because mine"
],
"e": "بعد because جملة كاملة: my phone was broken ← because my."
},
{
"q": "She was very tired, ..... she didn't go to bed until she finished her homework.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "تعبانة لكنها ما نامت لين خلصت الواجب (تضاد) ← but."
},
{
"q": "My cousins were late for school ..... missed the bus. The next one came at eight.",
"o": [
"because they",
"because them",
"because their",
"because theirs"
],
"e": "because + Subject (they) + Verb ← because they missed."
},
{
"q": "..... it is very hot in the afternoon, I turn on the air conditioner in my room.",
"o": [
"When",
"But",
"So",
"Because of"
],
"e": "When = عندما (وقت الحر)، ثم النتيجة، ومع when في البداية فاصلة."
},
{
"q": "The math test was very easy this time, ..... everyone in our class passed it.",
"o": [
"so",
"but",
"because",
"when"
],
"e": "سبب (سهل) + so + نتيجة (الكل نجح)."
},
{
"q": "Everyone in our class passed ..... the math test was very easy this time.",
"o": [
"because",
"so",
"but",
"because of"
],
"e": "نتيجة (نجحوا) + because + سبب (سهل). وbecause of بعدها اسم مو جملة."
},
{
"q": "I called Omar three times last night, ..... he didn't answer. Maybe he was asleep.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "اتصلت بس ما رد (تضاد) ← but."
},
{
"q": "Noura always smiles and sings ..... happy, so it's easy to know her mood.",
"o": [
"when she is",
"when is she",
"when she",
"when her is"
],
"e": "when + Subject + Verb ← when she is happy."
},
{
"q": "I love this city, ..... the weather is too hot for me in summer.",
"o": [
"but",
"so",
"because",
"when"
],
"e": "أحب المدينة لكن الجو حار علي (تضاد) ← but."
},
{
"q": "My brothers and I were excited ..... were going to Disneyland for the first time.",
"o": [
"because we",
"because us",
"because our",
"because ours"
],
"e": "My brothers and I = We ← because + Subject (we) + Verb ← because we were going."
},
{
"q": "My phone battery was dead last night, ..... I couldn't call you. I'm really sorry.",
"o": [
"so",
"because",
"but",
"when"
],
"e": "سبب (البطارية خلصت) + so + نتيجة (ما قدرت أتصل)."
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
"e": "They ← have."
},
{
"q": "My sister ..... a new car. It's white and very fast, and she drives it to work.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "My sister = She ← has."
},
{
"q": "A: ..... you have any brothers or sisters? B: Yes, I have two brothers and one sister.",
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
"q": "Our neighbours ..... three cats and two parrots. The cats play in their garden every day.",
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
"q": "I'm sorry, I ..... a pen with me today. Can I borrow yours for the exam?",
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
"q": "Fahad can't call you. He ..... a phone right now because his old one is broken.",
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
"haves"
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
"q": "Riyadh ..... many big parks and malls, so there are lots of places to visit at weekends.",
"o": [
"has",
"have",
"is",
"having"
],
"e": "Riyadh = It ← has."
},
{
"q": "My little brother ..... long hair. It's very short because he goes to the barber every week.",
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
"do",
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
"having",
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
"q": "The students ..... a short break at 10 o'clock every day. They eat breakfast in the cafeteria.",
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
"q": "My grandmother ..... a beautiful garden with many flowers. She waters it every morning.",
"o": [
"has",
"have",
"is",
"haves"
],
"e": "My grandmother = She ← has."
},
{
"q": "I can't go out with you tonight. I ..... a lot of homework for tomorrow.",
"o": [
"have",
"has",
"am",
"having"
],
"e": "I ← have."
},
{
"q": "A: Does your new apartment ..... a balcony? B: No, it doesn't. It's small.",
"o": [
"have",
"has",
"haves",
"having"
],
"e": "بعد Does نستخدم have."
},
{
"q": "Noura and Huda ..... the same teacher this year, so they study together after class.",
"o": [
"have",
"has",
"is",
"having"
],
"e": "Noura and Huda = They ← have."
},
{
"q": "That restaurant is not good for people on a diet. It ..... any healthy food.",
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
"has",
"does",
"am"
],
"e": "Do you…? ← الجواب Yes, I do."
},
{
"q": "My uncle ..... a big farm with cows and sheep in Qassim. We visit him every holiday.",
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
"rule": "Verbs + infinitives (like, want, need)",
"qs": [
{
"q": "You need ..... well on your exams if you want to get into college.",
"o": [
"to do",
"does",
"doing",
"do"
],
"e": "بعد need يجي to + الفعل الأساسي: need to do.",
"x": 1
},
{
"q": "I like ..... people. That's why I want to be a nurse.",
"o": [
"to help",
"help",
"helps",
"helping to"
],
"e": "بعد like يجي to + الفعل الأساسي: like to help."
},
{
"q": "I want ..... a doctor in the future. I love science, and I'm good at biology.",
"o": [
"to be",
"be",
"being",
"to being"
],
"e": "بعد want يجي to + الفعل الأساسي: want to be."
},
{
"q": "I finished university last year, and now I need ..... job. I don't have any money.",
"o": [
"a good",
"to a good",
"good a",
"a good to"
],
"e": "بعد need ممكن يجي اسم (noun phrase): a good job."
},
{
"q": "Children make me happy, so I want ..... in teaching after I graduate.",
"o": [
"a career",
"to a career",
"career a",
"a career to"
],
"e": "بعد want يجي اسم (noun phrase): want a career، بدون to."
},
{
"q": "I watch every football match on TV. I like ..... very much. They always win!",
"o": [
"my team",
"to my team",
"team my",
"my team to"
],
"e": "بعد like يجي اسم: like my team."
},
{
"q": "My brother wants ..... a new car next year. He is saving money from his salary.",
"o": [
"to buy",
"buy",
"buying",
"buys"
],
"e": "بعد want يجي to + الفعل الأساسي: wants to buy."
},
{
"q": "We need ..... to the supermarket after work. There's no milk or bread at home.",
"o": [
"to go",
"go",
"going",
"goes"
],
"e": "بعد need يجي to + الفعل الأساسي: need to go."
},
{
"q": "Sara likes ..... books in her free time. She goes to the library every week.",
"o": [
"to read",
"read",
"reads",
"to reading"
],
"e": "بعد like يجي to + الفعل الأساسي: likes to read."
},
{
"q": "A: What do you want ..... after university? B: I want to work in a bank.",
"o": [
"to do",
"do",
"doing",
"does"
],
"e": "بعد want يجي to + الفعل الأساسي: want to do."
},
{
"q": "I need ..... help with my math homework. It's very difficult, and I can't finish it.",
"o": [
"some",
"to some",
"some to",
"any to"
],
"e": "بعد need يجي اسم: need some help."
},
{
"q": "My parents want ..... a big house with a garden because our family is getting bigger.",
"o": [
"to have",
"have",
"having",
"has"
],
"e": "بعد want يجي to + الفعل الأساسي: want to have."
},
{
"q": "I don't like ..... early on weekends. I usually sleep until ten o'clock.",
"o": [
"to wake up",
"wake up",
"wakes up",
"to waking up"
],
"e": "بعد like (حتى في النفي) يجي to + الفعل الأساسي."
},
{
"q": "My cousin ..... to study abroad next year. He is applying to universities in Canada.",
"o": [
"wants",
"want",
"wanting",
"to want"
],
"e": "My cousin = He ← الفعل الأول ينضاف له s: wants، وبعده to study."
},
{
"q": "A: Do you need ..... with those heavy bags? B: Yes, please. Can you carry this one?",
"o": [
"some help",
"to some help",
"help some",
"some to help"
],
"e": "بعد need ممكن يجي اسم مباشرة (بدون to): need some help."
},
{
"q": "My little sister likes ..... with her friends in the park. She goes there every evening.",
"o": [
"to play",
"play",
"plays",
"playing to"
],
"e": "بعد like يجي to + الفعل الأساسي: likes to play."
},
{
"q": "You need ..... more water. It's very hot today, and you are playing football in the sun.",
"o": [
"to drink",
"drink",
"drinking",
"drinks"
],
"e": "بعد need يجي to + الفعل الأساسي: need to drink."
},
{
"q": "A: Can I help you? B: Yes, I want ..... cup of coffee with milk, please.",
"o": [
"a",
"to a",
"to",
"for"
],
"e": "بعد want يجي اسم مباشرة: want a cup of coffee (بدون to وبدون for)."
},
{
"q": "Fahad ..... to visit his grandparents in Abha this weekend. He misses them a lot.",
"o": [
"wants",
"want",
"wanting",
"to want"
],
"e": "Fahad = He ← wants + to + الفعل."
},
{
"q": "We don't need ..... a taxi. My father is going to drive us.",
"o": [
"to take",
"take",
"taking",
"takes"
],
"e": "بعد need يجي to + الفعل الأساسي: need to take."
},
{
"q": "My sister likes ..... new things, so she orders a different dish at every restaurant.",
"o": [
"to try",
"try",
"tries",
"to trying"
],
"e": "بعد like يجي to + الفعل الأساسي: likes to try."
},
{
"q": "I dropped my phone yesterday, and the screen broke. I need ..... new phone.",
"o": [
"a",
"to a",
"to",
"a to"
],
"e": "بعد need يجي اسم: need a new phone (بدون to)."
},
{
"q": "A: Does your father like ..... ? B: Yes, he cooks every Friday.",
"o": [
"to cook",
"cook",
"cooks",
"to cooking"
],
"e": "بعد like يجي to + الفعل الأساسي: like to cook."
},
{
"q": "Students need ..... their homework on time, or the teacher will take away some marks.",
"o": [
"to finish",
"finish",
"finishing",
"finishes"
],
"e": "بعد need يجي to + الفعل الأساسي: need to finish."
},
{
"q": "My mother wants ..... a new language, so she's taking French classes twice a week.",
"o": [
"to learn",
"learn",
"learning",
"learns"
],
"e": "بعد want يجي to + الفعل الأساسي: wants to learn."
},
{
"q": "I like ..... job at the bank. My manager is very kind, and the work is interesting.",
"o": [
"my",
"to my",
"to",
"mine"
],
"e": "بعد like يجي اسم: like my job."
},
{
"q": "We need ..... a decision today. The company wants our answer before five o'clock.",
"o": [
"to make",
"make",
"making",
"makes"
],
"e": "بعد need يجي to + الفعل الأساسي: need to make."
},
{
"q": "A: Do you want ..... to the cinema with us tonight? B: Sorry, I have to study.",
"o": [
"to come",
"come",
"coming",
"comes"
],
"e": "بعد want يجي to + الفعل الأساسي: want to come."
},
{
"q": "My brother doesn't want ..... his room. He's too lazy, so it's always messy.",
"o": [
"to clean",
"clean",
"cleans",
"cleaning to"
],
"e": "بعد want (حتى في النفي) يجي to + الفعل الأساسي."
},
{
"q": "I need ..... rest. I've been working all day, and my head hurts.",
"o": [
"some",
"to some",
"any to",
"some to"
],
"e": "بعد need يجي اسم: need some rest."
},
{
"q": "My friends like ..... football on Fridays. They meet at the park after lunch.",
"o": [
"to play",
"play",
"plays",
"to playing"
],
"e": "بعد like يجي to + الفعل الأساسي: like to play."
},
{
"q": "Lama ..... to travel to London next summer. She has never been to Europe before.",
"o": [
"wants",
"want",
"to want",
"wanting"
],
"e": "Lama = She ← wants + to + الفعل."
},
{
"q": "I want ..... my English before the final exam, so I practice for an hour every day.",
"o": [
"to improve",
"improve",
"improving",
"improves"
],
"e": "بعد want يجي to + الفعل الأساسي: want to improve."
},
{
"q": "A: What does your brother need? B: He needs ..... new laptop for university.",
"o": [
"a",
"to a",
"to",
"a to"
],
"e": "بعد need يجي اسم: a new laptop."
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
"q": "Your backpack isn't on the table. Look down. It's ..... the table, on the floor.",
"o": [
"under",
"above",
"over",
"in"
],
"e": "Look down وعلى الأرض ← under = تحت الطاولة."
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
"q": "I'm standing ..... the traffic lights near the school, waiting for you. Hurry up!",
"o": [
"at",
"in",
"on",
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
"q": "The children are playing football ..... the street. It's dangerous because many cars drive fast here.",
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
"q": "The new bridge is ..... the highway. Every day, hundreds of cars drive under it.",
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
"above",
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
"q": "The streetlights are ..... the road. They hang high and light it at night for drivers.",
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
"on"
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
"at"
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
