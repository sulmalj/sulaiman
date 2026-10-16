/* كتابة الفقرة — التصحيح حسب شروط الكتاب (درس «كتابة الفقرة»)
   1) إذا كان مفتاح الذكاء الاصطناعي مضاف في Netlify: التصحيح الكامل من /api/correct
   2) وإلا (أو إذا تعطل): فحص آلي في المتصفح للشروط الظاهرة والأخطاء المعروفة */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const TOPICS = [
  { id: 't1', title: 'أهمية دور الفرد في المجتمع', keys: ['فرد', 'افراد', 'مجتمع', 'مواطن'] },
  { id: 't2', title: 'دور القائد في مهنته ومؤسسته', keys: ['قائد', 'قاد', 'قياد', 'مؤسس', 'مهن'] },
  { id: 'own', title: 'اختر موضوعك بنفسك', own: true }
];
/* نماذج فقرات (5 جمل): جملة مفتاحية + 3 داعمة + ختامية */
const MODELS = {
  t1: [['k', 'يؤدي الفرد دورًا مهمًّا في بناء المجتمع وتقدّمه.'],
       ['s', 'فالمجتمع يتكوّن من أفراده، وكلما كان الفرد واعيًا بواجباته، أدّاها على أكمل وجه.'],
       ['s', 'كما أنّ إسهامه في الأعمال التطوعية ومساعدة المحتاجين يقوّي روابط التكافل بين الناس.'],
       ['s', 'بالإضافة إلى ذلك، يسهم التزامه بالأنظمة ومحافظته على الممتلكات العامة في حفظ أمن المجتمع واستقراره.'],
       ['c', 'وبذلك يتضح أنّ صلاح المجتمع يبدأ من صلاح أفراده وإحساسهم بالمسؤولية.']],
  t2: [['k', 'يُعدّ القائد حجر الأساس في نجاح مؤسسته وتطوّر مهنته.'],
       ['s', 'فهو الذي يحدد الأهداف بوضوح، ويضع الخطط المناسبة لتحقيقها.'],
       ['s', 'كما أنّه يحفّز العاملين معه، ويوزّع المهام بينهم بحسب قدراتهم وخبراتهم.'],
       ['s', 'بالإضافة إلى ذلك، يكون القائد قدوة لفريقه في الالتزام والأمانة وإتقان العمل.'],
       ['c', 'ولذلك تحقق المؤسسة التي يقودها قائد واعٍ أهدافها بكفاءة، وتستمر في التقدم والازدهار.']]
};

let T = 't1', N = 5;
const st = () => window.APP ? APP.LS : { drafts: {} };
const draftKey = () => T === 'own' ? 'own' : T;

/* ── أدوات النص ── */
const HARAKAT = /[ً-ْٰـ]/g;
const plain = s => s.replace(HARAKAT, '');
function splitSentences(text) {
  const out = []; const re = /[^.!؟?]+[.!؟?]+|[^.!؟?]+$/g; let m;
  while ((m = re.exec(text))) { const s = m[0].trim(); if (s && /[ء-ي]/.test(s)) out.push(s); }
  return out;
}
const countDone = text => splitSentences(text).length;
const words = text => (text.trim().match(/[^\s]+/g) || []).filter(w => /[ء-ي]/.test(w));

/* ── الواجهة ── */
function open() {
  $('wTopics').innerHTML = TOPICS.map(t => `<button type="button" class="topic ${t.id === T ? 'on' : ''}" data-t="${t.id}">${esc(t.title)}<small>${t.own ? 'اكتب عنوان موضوعك' : 'موضوع مقترح'}</small></button>`).join('');
  $('wTopic').hidden = T !== 'own';
  const d = st().drafts || {};
  $('wText').value = d[draftKey()] || '';
  $('wTopic').value = d.ownTitle || '';
  if (d.n) N = d.n;
  $('wN').textContent = N;
  $('wModel').hidden = T === 'own';
  counts();
}
function counts() {
  const t = $('wText').value, n = countDone(t);
  $('wWords').textContent = 'الكلمات: ' + words(t).length;
  $('wSents').innerHTML = `الجمل: <span class="${n === N ? 'ok' : ''}">${n} من ${N}</span>`;
}
function saveDraft() {
  const L = st(); L.drafts = L.drafts || {};
  L.drafts[draftKey()] = $('wText').value; L.drafts.ownTitle = $('wTopic').value; L.drafts.n = N;
  window.APP && APP.save();
}
$('wTopics').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  saveDraft(); T = b.dataset.t; $('wRes').innerHTML = ''; $('wModelBox').innerHTML = ''; open();
});
$('wText').addEventListener('input', () => { counts(); saveDraft(); });
$('wTopic').addEventListener('input', saveDraft);
$('wMinus').onclick = () => { N = Math.max(3, N - 1); $('wN').textContent = N; counts(); saveDraft(); };
$('wPlus').onclick = () => { N = Math.min(15, N + 1); $('wN').textContent = N; counts(); saveDraft(); };
$('wClear').onclick = () => { $('wText').value = ''; $('wRes').innerHTML = ''; counts(); saveDraft(); };
$('wModel').onclick = () => {
  const m = MODELS[T]; if (!m) return;
  if ($('wModelBox').innerHTML) { $('wModelBox').innerHTML = ''; return; }
  $('wModelBox').innerHTML = `<div class="panel model"><h4>نموذج فقرة: ${esc(topicTitle())}</h4>
    <p>${m.map(([c, s]) => `<span class="${c}">${esc(s)}</span>`).join(' ')}</p>
    <div class="legend"><span class="k">الجملة المفتاحية</span><span class="s">الجمل الداعمة</span><span class="c">الجملة الختامية</span></div>
    <p class="mnote">لاحظ أدوات الربط: فـ، كما أنّ، بالإضافة إلى ذلك، وبذلك، ولذلك. اكتب فقرتك بأسلوبك أنت، ولا تنسخ النموذج.</p></div>`;
};
const topicTitle = () => T === 'own' ? ($('wTopic').value.trim() || 'موضوع من اختيارك') : TOPICS.find(t => t.id === T).title;

$('wCheck').onclick = async () => {
  const text = $('wText').value.trim();
  if (T === 'own' && !$('wTopic').value.trim()) { $('wTopic').focus(); return alertRes('اكتب عنوان موضوعك أول.'); }
  if (words(text).length < 8) return alertRes('اكتب فقرتك أول (جملة مفتاحية، وجمل داعمة، وجملة ختامية).');
  $('wCheck').disabled = true; $('wLoading').hidden = false; $('wRes').innerHTML = '';
  $('wLoadTxt').textContent = 'جاري تصحيح فقرتك حسب شروط الكتاب…';
  let r = null, src = 'ai';
  try { r = await aiCorrect(text); } catch (e) { r = null; }
  if (!r) { src = 'local'; r = localCheck(text); }
  $('wCheck').disabled = false; $('wLoading').hidden = true;
  const L = st(); L.paras = (L.paras || 0) + 1; window.APP && APP.save();
  render(r, text, src);
  $('wRes').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
function alertRes(msg) { $('wRes').innerHTML = `<p class="note warn">${window.ICON ? ICON('alert') : ''}<span>${esc(msg)}</span></p>`; }

/* ── التصحيح بالذكاء الاصطناعي (بث مباشر من /api/correct) ── */
async function aiCorrect(text) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 150000);
  const res = await fetch('/api/correct', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, topic: topicTitle(), sentences: N }), signal: ctl.signal });
  if (!res.ok || !res.body || !(res.headers.get('content-type') || '').includes('event-stream')) { clearTimeout(to); return null; }
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', out = '', refused = false, n = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
      const line = chunk.split('\n').find(l => l.startsWith('data:'));
      if (!line) continue;
      let ev; try { ev = JSON.parse(line.slice(5)); } catch (e) { continue; }
      if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
        out += ev.delta.text;
        if (++n % 25 === 0) $('wLoadTxt').textContent = 'جاري كتابة التصحيح… ' + Math.min(99, Math.round(out.length / 30)) + '٪';
      } else if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason === 'refusal') refused = true;
      else if (ev.type === 'error') { clearTimeout(to); return null; }
    }
  }
  clearTimeout(to);
  if (refused) return null;
  try { const r = JSON.parse(out); return r && typeof r.score === 'number' ? r : null; } catch (e) { return null; }
}

/* ══════════ الفحص الآلي (بدون ذكاء اصطناعي) ══════════ */
const LESS = { hamza1: 'همزتا الوصل والقطع', hamza2: 'الهمزة المتوسطة والهمزة آخر الكلمة', alif: 'الألف اللينة والتاء والهاء', tarq: 'علامات الترقيم', akh: 'الأخطاء الشائعة', faqra: 'كتابة الفقرة', tahrir: 'التحرير الكتابي' };
const PRE = '(?:[وف]?(?:[بكل]?ال|لل|[بكل])?)';
const B = '(?<![\\u0621-\\u064A])', E = '(?![\\u0621-\\u064A])';
const MID = '(?:\\s+(?!على|عن|في|من|إلى|الى)[\\u0621-\\u064A]+)?';
/* كلمات همزتها قطع تنكتب كثير بدون همزة (الصيغة الخطأ → الصواب) */
const QAT = { 'او': 'أو', 'اذا': 'إذا', 'اذ': 'إذ', 'الى': 'إلى', 'اي': 'أي', 'ايضا': 'أيضًا', 'اكثر': 'أكثر', 'اقل': 'أقل', 'اكبر': 'أكبر', 'افضل': 'أفضل', 'اهم': 'أهم', 'اهمية': 'أهمية', 'افراد': 'أفراد', 'اجل': 'أجل', 'امام': 'أمام', 'اول': 'أول', 'اولا': 'أولًا', 'اخرى': 'أخرى', 'اخر': 'آخر', 'اخرين': 'آخرين', 'احد': 'أحد', 'اساس': 'أساس', 'اساسي': 'أساسي', 'اساسية': 'أساسية', 'اسرة': 'أسرة', 'اسرته': 'أسرته', 'امة': 'أمة', 'امن': 'أمن', 'اعمال': 'أعمال', 'اعماله': 'أعماله', 'اهداف': 'أهداف', 'اهدافها': 'أهدافها', 'اخلاق': 'أخلاق', 'اداء': 'أداء', 'ادارة': 'إدارة', 'انتاج': 'إنتاج', 'انجاز': 'إنجاز', 'انجازات': 'إنجازات', 'ابداع': 'إبداع', 'اسهام': 'إسهام', 'امانة': 'أمانة', 'انسان': 'إنسان', 'اصبح': 'أصبح', 'اصبحت': 'أصبحت', 'اثناء': 'أثناء', 'اسلوب': 'أسلوب', 'ارض': 'أرض', 'اجيال': 'أجيال', 'اخطاء': 'أخطاء', 'ادوار': 'أدوار', 'اعضاء': 'أعضاء', 'امور': 'أمور', 'اصحاب': 'أصحاب', 'ابناء': 'أبناء', 'اباء': 'آباء', 'اراء': 'آراء', 'اهل': 'أهل', 'ايجابي': 'إيجابي', 'ايجابية': 'إيجابية', 'اتقان': 'إتقان', 'اخلاص': 'إخلاص', 'اصلاح': 'إصلاح', 'ادراك': 'إدراك', 'احساس': 'إحساس', 'اسس': 'أسس', 'افكار': 'أفكار', 'اشخاص': 'أشخاص', 'امثلة': 'أمثلة', 'اسباب': 'أسباب', 'اوقات': 'أوقات', 'اثر': null, 'ان': null };
const NOT_Q = new Set(['واو', 'واحد', 'واحدة', 'واحدا', 'واهم', 'والى', 'فاي']);
const QAT_REASON = 'همزة قطع: تُنطق في الابتداء وعند الوصل، فتُكتب (أ) فوق الألف مع الفتح والضم و(إ) تحت الألف مع الكسر.';
/* أسماء همزتها وصل تنكتب غلط بهمزة قطع */
const WASL = { 'إسم': 'اسم', 'إبن': 'ابن', 'إبنة': 'ابنة', 'إمرأة': 'امرأة', 'إمرؤ': 'امرؤ', 'إثنان': 'اثنان', 'إثنين': 'اثنين', 'إثنتان': 'اثنتان', 'إثنتين': 'اثنتين' };
/* كلمات تنتهي بتاء مربوطة تنكتب كثير بالهاء */
const TAA = 'مسؤولية مسئولية اهمية أهمية دولة مدرسة جامعة حياة اسرة أسرة مؤسسة مهنة شركة بيئة ثقافة طاقة صحة قوة فكرة فقرة جملة كتابة قراءة خدمة تنمية رؤية رسالة قيادة ادارة إدارة مسيرة تجربة خبرة فرصة ثقة قدرة مهارة طريقة مشكلة نتيجة حكومة وزارة منظمة جماعة مجموعة نهضة مكانة قيمة امانة أمانة نزاهة عدالة مساعدة مشاركة مبادرة عملية اجتماعية وطنية ايجابية إيجابية اساسية أساسية رئيسة رئيسية كبيرة عظيمة مهمة فعالة واضحة جديدة مختلفة كثيرة مستمرة ناجحة صالحة سليمة صحيحة مملكة عربية سعودية انسانية إنسانية إنتاجية انتاجية كفاءة مرونة شجاعة حكمة قدوة رعاية حماية توعية تربية تعليمية معرفة منفعة مصلحة سعادة فائدة خطة رغبة همة حاجة وظيفة دراسة لغة امة أمة ثروة طبيعة بلدية نظافة صناعة تجارة زراعة سياحة رياضة ثانوية متوسطة ابتدائية مرحلة فترة مدة سنة ساعة دقيقة لحظة مرة كلمة قصة صورة'.split(' ');
const TAA_SET = new Set(TAA.map(w => w.replace(/^ال/, '')));
const YEH_EXC = new Set(['فيه', 'عليه', 'إليه', 'اليه', 'لديه', 'يديه', 'أبيه', 'ابيه', 'أخيه', 'اخيه', 'ذويه', 'نزيه', 'وجيه', 'فقيه', 'نبيه', 'سفيه', 'شبيه', 'كريه', 'بديه', 'تيه']);
/* أخطاء إملائية من جدول الكتاب + أخطاء مشهورة */
const SPELL = { 'محاظرة': 'محاضرة', 'موضف': 'موظف', 'موضفين': 'موظفين', 'ضروف': 'ظروف', 'ضاهرة': 'ظاهرة', 'حضا': 'حظًا', 'حضيرة': 'حظيرة', 'نضرية': 'نظرية', 'عضمي': 'عظمي', 'ملاحضة': 'ملاحظة', 'يقضة': 'يقظة', 'ضهير': 'ظهير', 'ضهيرا': 'ظهيرًا', 'ضمأ': 'ظمأ', 'ضن': 'ظن', 'نضام': 'نظام', 'محافضة': 'محافظة', 'أنتي': 'أنتِ', 'انتي': 'أنتِ', 'لاكن': 'لكن', 'لاكنّ': 'لكنّ', 'هاذا': 'هذا', 'هاذه': 'هذه', 'ذالك': 'ذلك', 'هاؤلاء': 'هؤلاء', 'هاؤلاء': 'هؤلاء', 'شئ': 'شيء', 'شيئ': 'شيء', 'حتي': 'حتى', 'متي': 'متى', 'مستوي': 'مستوى', 'معني': 'معنى', 'الذى': 'الذي', 'التى': 'التي', 'فى': 'في', 'الأخري': 'الأخرى', 'الاخري': 'الأخرى', 'أخري': 'أخرى', 'اخري': 'أخرى', 'الكبري': 'الكبرى', 'العظمي': 'العظمى', 'أدني': 'أدنى', 'أقصي': 'أقصى' };
const SPELL_REASON = { 'ض': 'الضاد والظاء: الكلمة تُكتب بالظاء (من جدول الأخطاء الإملائية المتفرقة في الكتاب).', 'ى': 'الألف اللينة في آخر الكلمة: تُكتب ياءً غير منقوطة (ى) في هذه الكلمة.' };

/* قواعد التراكيب من جداول «الأخطاء الشائعة» في الكتاب */
const RULES = [
  { re: B + '(?:و|ف)?(?:لعب|يلعب|تلعب|يلعبون|لعبت)' + MID + '\\s+(?:ال)?(?:دور|دورا|دوراً|دورًا|أدوار|ادوار)' + E, w: 'لعب دورًا', r: 'أدّى/يؤدي دورًا', why: 'تركيب دخيل من الترجمة: لا يقال «لعب فلان دورًا مهمًا»، والصواب «أدّى فلان دورًا مهمًا».' },
  { re: B + '(?:و|ف)?(?:أجاب|اجاب|يجيب|تجيب|أجبت|اجبت|أجيب|اجيب)' + MID + '\\s+على' + E, fix: m => m.replace(/على$/, 'عن'), why: 'الفعل (أجاب) يتعدى بحرف الجر (عن): أجاب عن سؤاله.' },
  { re: B + '(?:و|ف)?(?:ينبغي|يجب\\s+ينبغي)\\s+على' + E, fix: m => m.replace(/على$/, 'لـ'), why: 'الفعل (ينبغي) يتعدى باللام: لا ينبغي لك أن تفعل كذا.' },
  { re: B + '(?:و|ف)?(?:تخرج|تخرّج|تخرجت|تخرّجت|يتخرج|يتخرّج|تتخرج)' + MID + '\\s+من' + E, fix: m => m.replace(/من$/, 'في'), why: 'الفعل (تخرّج) يتعدى بـ(في): تخرج في جامعة الملك سعود.' },
  { re: B + '(?:يزيد|تزيد|زاد|زادت)\\s+عن' + E, fix: m => m.replace(/عن$/, 'على'), why: 'الزيادة تتعدى بـ(على): ما يزيد على ثلاثين.' },
  { re: B + '(?:و|ف)?(?:أكد|اكد|أكّد|يؤكد|يؤكّد|تؤكد|أكدت|اكدت)' + MID + '\\s+على' + E, fix: m => m.replace(/\s+على$/, ''), why: 'الفعل (أكّد) يتعدى بنفسه: أكد المدرس معلومات كثيرة.' },
  { re: B + '(?:أطمح|اطمح|يطمح|تطمح|نطمح)\\s+في' + E, fix: m => m.replace(/في$/, 'إلى'), why: 'الطموح يتعدى بـ(إلى): أطمح إلى معدل مرتفع.' },
  { re: B + 'ل(?:وحده|وحدها|وحدي|وحدهم|وحدك)' + E, fix: m => m.slice(1), why: '«وحده» تُستعمل بدون لام: جاء الطالب وحده.' },
  { re: B + '(?:و|ف)?(?:تعود|تعوّد|تعودت|تعوّدت|يتعود|يتعوّد|تتعود)' + MID + '\\s+على' + E, fix: m => m.replace(/\s+على$/, ''), why: 'الفعل (تعوّد) يتعدى بنفسه: تعودت القراءة.' },
  { re: B + '(?:و|ف)?(?:حاز|حازت|يحوز|تحوز)' + MID + '\\s+على' + E, fix: m => m.replace(/\s+على$/, ''), why: 'الفعل (حاز) يتعدى بنفسه: حاز شهادة التميز.' },
  { re: B + 'الغير\\s+(?!ال)([\\u0621-\\u064A]+)', fix: m => m.replace(/^الغير\s+/, 'غير ال'), why: '«غير» لا تدخل عليها (أل)، والصواب: القرار غير الصحيح.' },
  { re: B + 'البعض\\s+من' + E, fix: () => 'بعض', why: '«بعض» لا تدخل عليها (أل) في هذا الاستعمال: احفظوا بعض العلم.' },
  { re: B + 'كلما[^.!؟?]*?،?\\s*(كلما)' + E, w: 'كلما … كلما', r: 'كلما … (بدون تكرار)', why: '(كلما) لا تتكرر في الجملة: كلما تعلمت، استفدت.', grp: 1 },
  { re: '،\\s*و(?:الذي|التي|الذين|اللذان|اللتان|اللاتي)' + E, fix: m => m.replace(/و(ال)/, '$1'), why: 'لا تدخل الواو على الاسم الموصول الذي يصف ما قبله: قرأت الكتاب المفيد، الذي أحضره والدي.' },
  { re: B + 'أنا\\s+ك[\\u0621-\\u064A]+', w: 'أنا كـ…', r: 'أنا … / أنا بصفتي …', why: 'استعمال الكاف هنا دخيل: أنا موظف في وزارة العدل، أو: أنا بصفتي موظفًا.' },
  { re: B + 'من\\s+قبل\\s+(?!أن|ان|ذلك|هذا)(?:ال)?[\\u0621-\\u064A]+', w: 'من قبل', r: 'بناء الفعل للمعلوم', why: 'لا يُذكر الفاعل مع المبني للمجهول بعبارة «من قبل»: كتب فلان المقال، لا: كُتب المقال من قبل فلان.' },
  { re: B + '(?:و|ف)?بشكل' + E, w: 'بشكل', r: 'مصدر أو حال (بجدّ، جدّيًّا…)', why: 'استعمال «بشكل» لوصف الفعل من الأخطاء الشائعة: عمل الموظف بجد، لا: بشكل جدي.' },
  { re: B + '(?<!من\\s)(?:و|ف)?(?:قام|قامت|يقوم|تقوم|قاموا|يقومون|نقوم)' + MID + '\\s+ب(?:ال)?[\\u0621-\\u064A]+', w: 'قام بـ…', r: 'الفعل مباشرة', why: 'استعمال «قام بـ» دخيل: زار الوفد معالم الدرعية، لا: قام الوفد بزيارة.' },
  { re: '(?:بكل\\s+معنى\\s+الكلمة|بكل\\s+ما\\s+في\\s+الكلمة\\s+من\\s+معنى)', w: 'بكل معنى الكلمة', r: 'وصف مباشر (بطل عظيم)', why: 'تركيب دخيل من الترجمة: خالد بطل عظيم.' },
  { re: B + 'على\\s+نحو' + E, w: 'على نحو …', r: 'مفعول مطلق (ظهر ظهورًا واضحًا)', why: 'تركيب دخيل من الترجمة: ظهر ظهورًا واضحًا.' },
  { re: B + '(?:و|ف)?بالنسبة\\s+ل', w: 'بالنسبة لـ', r: 'أمّا … فـ', why: 'تركيب دخيل من الترجمة، والصواب: أمّا معرض الرياض فقد شهد إقبالًا كبيرًا.' },
  { re: B + '(?:و|ف)?(?:تم|يتم|سيتم|تمّ|يتمّ)\\s+(?:ال)?[\\u0621-\\u064A]+', w: 'تم + مصدر', r: 'الفعل المبني للمجهول (عُقد)', why: 'استعمال «تم» دخيل من الترجمة: عُقد الاجتماع أمس، لا: تم عقد الاجتماع.' },
  { re: B + '(?:أعطى|اعطى|أعطت)\\s+موافقت', w: 'أعطى موافقته', r: 'وافق', why: 'تركيب دخيل من الترجمة: وافق على المشروع.' },
  { re: B + PRE + '(?:ملفت|ملفتة)' + E, fix: m => m.replace('ملفت', 'لافت'), why: 'الصواب «لافت»؛ لأنه اسم فاعل من الثلاثي (لفت).' },
  { re: B + PRE + 'منتزه' + E, fix: m => m.replace('منتزه', 'متنزه'), why: 'الصواب «المتنزه» (من تنزّه).' },
  { re: B + PRE + '(?:مشاكل)' + E, fix: m => m.replace('مشاكل', 'مشكلات'), why: 'جمع (مشكلة) الصحيح: مشكلات.' },
  { re: B + PRE + 'مدراء' + E, fix: m => m.replace('مدراء', 'مديرو'), why: 'جمع (مدير) جمع مذكر سالم: مديرون/مديرو.' },
  { re: B + PRE + 'نسائم' + E, fix: m => m.replace('نسائم', 'نسمات'), why: 'جمع (نسمة): نسمات.' },
  { re: B + PRE + 'مناطة' + E, fix: m => m.replace('مناطة', 'منوطة'), why: 'الصواب «المنوطة» من (ناط).' },
  { re: B + PRE + 'مشائخ' + E, fix: m => m.replace('مشائخ', 'مشايخ'), why: 'جمع (شيخ): مشايخ بالياء.' },
  { re: B + PRE + 'فتاوي' + E, fix: m => m.replace('فتاوي', 'فتاوى'), why: 'جمع (فتوى): فتاوى.' },
  { re: B + PRE + 'دعاوي' + E, fix: m => m.replace('دعاوي', 'دعاوى'), why: 'جمع (دعوى): دعاوى.' }
].map(r => Object.assign(r, { type: r.type || 'أسلوبي', lesson: LESS.akh }));
RULES.forEach(r => { if (/ملفت|منتزه|مشاكل|مدراء|نسائم|مناطة|مشائخ|فتاوي|دعاوي/.test(r.re)) r.type = 'صرفي'; else if (/أجاب|ينبغي|تخرج|يزيد|أكد|أطمح|وحده|تعود|حاز|الغير|البعض|كلما|الذي|أنا/.test(r.re)) r.type = 'نحوي'; });

function localCheck(text) {
  const errs = [];
  const add = (start, end, right, type, why, lesson, fixable) => {
    if (errs.some(e => start < e.end && end > e.start)) return;
    errs.push({ start, end, wrong: text.slice(start, end), right, type, reason: why, lesson, fix: fixable });
  };
  // نسخة بدون حركات مع خريطة للمواضع الأصلية
  let pl = '', map = [];
  for (let i = 0; i < text.length; i++) { if (!HARAKAT.test(text[i])) { map.push(i); pl += text[i]; } HARAKAT.lastIndex = 0; }
  map.push(text.length);
  const span = (s, e) => [map[s], map[e - 1] + 1];

  // 1) التراكيب الشائعة
  RULES.forEach(r => {
    const re = new RegExp(r.re, 'g'); let m;
    while ((m = re.exec(pl))) {
      let s = m.index, e = s + m[0].length;
      if (r.grp) { s = m.index + m[0].lastIndexOf(m[r.grp]); e = s + m[r.grp].length; }
      const [a, b] = span(s, e);
      add(a, b, r.fix ? r.fix(m[0]) : r.r, r.type, r.why, r.lesson, !!r.fix);
    }
  });
  // 2) الكلمات
  const wre = /[ء-ي]+/g; let m;
  while ((m = wre.exec(pl))) {
    const w = m[0], [a, b] = span(m.index, m.index + w.length);
    if (SPELL[w]) { const r = SPELL[w]; const why = /ظ/.test(r) && /ض/.test(w) ? SPELL_REASON['ض'] : /ى$/.test(r) ? SPELL_REASON['ى'] : 'خطأ إملائي مشهور، والصواب: ' + r + '.'; add(a, b, r, 'إملائي', why, /ى$/.test(r) ? LESS.alif : LESS.akh, true); continue; }
    if (WASL[w]) { add(a, b, WASL[w], 'إملائي', 'همزة وصل: من الأسماء المسموعة (اسم، ابن، ابنة، امرؤ، امرأة، اثنان، اثنتان) تُكتب ألفًا بلا همزة.', LESS.hamza1, true); continue; }
    // همزة وصل مكتوبة قطع في مصدر/ماضي الخماسي والسداسي (إستخدام، إحترام، إنطلاق)
    const pm = w.match(/^([وف]?(?:[بكل]?ال|لل|[بكل])?)(إ[\u0621-\u064A]{3,})$/);
    if (pm && !/استراتيج|إستراتيج/.test(w) && /^(?:إست[^ا]|إ[^ا]ت[^ا]ا[^ا]|إ[^ا]ت[^ا][^ا]$|إن[^ا][^ا]ا[^ا]|إن[^ا][^ا][^ا]$)/.test(pm[2])) {
      const fixed = pm[1] + 'ا' + pm[2].slice(1);
      add(a, b, fixed, 'إملائي', 'همزة وصل: ماضي الفعل الخماسي والسداسي وأمرهما ومصدرهما تُكتب ألفًا بلا همزة (انتصار، استغفار، احترام).', LESS.hamza1, true); continue;
    }
    // همزة قطع مكتوبة بلا همزة
    const qm = w.match(/^([وف]?(?:[بكل]?ال|لل|[بكل])?)(ا[ء-ي]*)$/);
    if (qm && !NOT_Q.has(w)) {
      const stem = qm[2];
      if (stem in QAT) {
        if (QAT[stem]) add(a, b, qm[1] + QAT[stem], 'إملائي', QAT_REASON, LESS.hamza1, true);
        else if (stem === 'ان' && !qm[1]) add(a, b, 'أنْ / أنّ / إنّ', 'إملائي', 'الحروف المبدوءة بهمزة همزتها قطع (أنْ، أنّ، إنّ)، فلا تُكتب ألفًا بلا همزة.', LESS.hamza1, false);
        continue;
      }
    }
    // التاء المربوطة مكتوبة هاء
    const tm = w.match(/^([وف]?(?:[بكل]?ال|لل|[بكل])?)([ء-ي]+)ه$/);
    if (tm && !YEH_EXC.has(w) && !YEH_EXC.has(tm[2] + 'ه')) {
      const st2 = tm[2] + 'ة';
      const yeh = /ي$/.test(tm[2]) && tm[2].length >= 3 && (tm[1].includes('ال') || !/^[يتنأ]/.test(tm[2]));
      if (TAA_SET.has(st2) || (yeh && tm[1].includes('ال'))) {
        add(a, b, tm[1] + st2, 'إملائي', 'التاء المربوطة: تُنطق هاءً عند الوقف وتاءً عند الوصل، فتُكتب (ة) لا (ه).', LESS.alif, true); continue;
      }
    }
  }
  // 3) علامات الترقيم
  const W = '[\u0621-\u0652]+';
  const P = [
    [new RegExp('(' + W + ') +([،؛:.!؟?,;])', 'g'), mm => mm.replace(/ +/, ''), 'لا تُترك مسافة قبل علامة الترقيم؛ تُلصق العلامة بالكلمة التي قبلها.'],
    [new RegExp('(' + W + '),(?=\\s*[\u0621-\u064A])', 'g'), mm => mm.slice(0, -1) + '،', 'الفاصلة العربية تُكتب (،) لا (,).'],
    [new RegExp('(' + W + ')\\?', 'g'), mm => mm.slice(0, -1) + '؟', 'علامة الاستفهام العربية تُكتب (؟).'],
    [new RegExp('(' + W + ');', 'g'), mm => mm.slice(0, -1) + '؛', 'الفاصلة المنقوطة العربية تُكتب (؛).'],
    [/([،؛])\1+|([!؟])\2{1,}/g, mm => mm[0], 'لا تُكرر علامة الترقيم.'],
    [new RegExp('([،؛.])(' + W + ')', 'g'), mm => mm[0] + ' ' + mm.slice(1), 'اترك مسافة بعد علامة الترقيم قبل الكلمة التالية.']
  ];
  P.forEach(([re, f, why]) => { let mm; re.lastIndex = 0; while ((mm = re.exec(text))) { if (mm[0] === '.' && /\d/.test(text[mm.index - 1] || '')) continue; add(mm.index, mm.index + mm[0].length, f(mm[0]), 'ترقيم', why, LESS.tarq, true); } });
  // تكرار كلمة متتالية
  { const re = /(?<![\u0621-\u0652])([\u0621-\u064A]{2,})(\s+\1)(?![\u0621-\u0652])/g; let mm; while ((mm = re.exec(text))) add(mm.index, mm.index + mm[0].length, mm[1], 'أسلوبي', 'تكرار الكلمة مرتين متتاليتين؛ ومن التحرير حذف التكرار أو العبارات الزائدة.', LESS.tahrir, true); }
  // الجملة الاستفهامية تنتهي بعلامة استفهام
  const sents = splitSentences(text);
  sents.forEach(s => {
    if (/^(?:و|ف)?(?:هل|لماذا|كيف|متى|أين|كم|أليس|ألا)\s/.test(plain(s)) && /\.$/.test(s)) {
      const idx = text.indexOf(s) + s.length - 1; add(idx, idx + 1, '؟', 'ترقيم', 'الجملة الاستفهامية تنتهي بعلامة استفهام (؟).', LESS.tarq, true);
    }
  });
  // نهاية الفقرة
  const endsDot = /[.]\s*$/.test(text);

  // ── البناء ──
  const topic = TOPICS.find(t => t.id === T);
  const keys = T === 'own' ? plain(topicTitle()).split(/\s+/).map(w => w.replace(/^(?:[وف]?(?:[بكل]?ال|لل)?)/, '')).filter(w => w.length >= 3 && !/^(?:في|من|على|إلى|الى|عن|مع|بين|دور|أهمية|اهمية|حول)$/.test(w)).map(w => w.slice(0, 4)) : topic.keys;
  const hasKey = s => { const p = plain(s).replace(/[أإآ]/g, 'ا'); return keys.some(k => p.includes(k.replace(/[أإآ]/g, 'ا'))); };
  const CONN = ['لذلك', 'ولذلك', 'كما', 'بالإضافة', 'بالاضافة', 'إضافة', 'اضافة', 'بناء', 'بناءً', 'فضلا', 'فضلًا', 'علاوة', 'كذلك', 'أيضا', 'أيضًا', 'ثم', 'إذ', 'لأن', 'لان', 'حيث', 'لهذا', 'ولهذا', 'وعليه', 'لكن', 'ولكن', 'غير', 'بل', 'أما', 'فمثلا', 'مثلا', 'وبذلك', 'وبهذا', 'وهكذا', 'ومن', 'وبالتالي', 'بالتالي', 'كذا', 'وأخيرا', 'أخيرا', 'أولا', 'ثانيا', 'ثالثا', 'وفي', 'إن', 'إنّ', 'فإن', 'فإنّ'];
  const connOf = s => { const p = plain(s).trim(); const w1 = p.split(/\s+/)[0] || ''; const w2 = p.split(/\s+/).slice(0, 3).join(' ');
    const hit = CONN.find(c => w1 === c || w1 === 'و' + c || w1 === 'ف' + c) || (/^(بالإضافة|بالاضافة|إضافة|علاوة|فضلا|بناء)/.test(w2) ? w2.split(/[،,]/)[0] : '');
    if (hit) return hit; if (/^ف/.test(w1) && w1.length > 2) return 'الفاء'; if (/^و/.test(w1) && w1.length > 2) return 'الواو'; return ''; };
  const CLOSE = /^(?:و|ف)?(?:بذلك|بهذا|هكذا|لذلك|عليه|خلاصة|ختاما|ختامًا|في\s+الختام|في\s+النهاية|من\s+ثم|من\s+هنا|بالتالي|إذن|يتضح|نستنتج|نخلص|على\s+هذا|مما\s+سبق|هذا\s+يؤكد|يمكن\s+القول)/;
  const n = sents.length;
  const key = sents[0] || '', closing = n >= 3 ? sents[n - 1] : '', supp = n >= 3 ? sents.slice(1, -1) : sents.slice(1);
  const keyOk = !!key && hasKey(key);
  const closeOk = !!closing && (CLOSE.test(plain(closing).trim()) || hasKey(closing));
  const linked = supp.concat(closing ? [closing] : []).filter(s => connOf(s)).length;
  const needLinks = Math.max(1, Math.ceil((n - 1) / 2));
  const relevance = sents.filter(hasKey).length;
  // وحدة الفقرة: كل جملة تذكر الموضوع، أو ترجع له بضمير أو أداة ربط
  const REF = /^(?:و|ف)?(?:هو|هي|هم|هذا|هذه|ذلك|تلك|كما|لذلك|لهذا|إذ|حيث|بل|ثم|أيضا|كذلك|بالإضافة|بالاضافة|إضافة|علاوة|فضلا|بناء|وبذلك|بذلك|هكذا|عليه)(?![\u0621-\u064A])/;
  const offTopic = sents.slice(1).filter(x => !hasKey(x) && !REF.test(plain(x).trim()) && !connOf(x));
  const unityOk = n >= 2 && offTopic.length === 0;
  // التسلسل المنطقي: مفتاحية في البداية، وختام في النهاية، وما فيه أداة ختام في وسط الفقرة، والتعداد مرتب
  const midClose = supp.filter(x => CLOSE.test(plain(x).trim()) && !/^(?:و|ف)?(?:لذلك|عليه|من\s+ثم)/.test(plain(x).trim()));
  const ORD = ['أولا', 'ثانيا', 'ثالثا', 'رابعا', 'خامسا'];
  const ordSeen = sents.map(x => ORD.findIndex(o => plain(x).replace(/[أإآ]/g, 'ا').includes(o.replace(/[أإآ]/g, 'ا')))).filter(k => k >= 0);
  const ordOk = ordSeen.every((k, j) => j === 0 || k > ordSeen[j - 1]);
  const seqOk = keyOk && !!closing && closeOk && midClose.length === 0 && ordOk;

  const R = {
    score: 0, sentence_count: n,
    key_sentence: { text: key, ok: keyOk, note: keyOk ? 'جملة مفتاحية تقدّم موضوع الفقرة في بدايتها.' : 'الجملة الأولى ما تقدّم موضوع الفقرة بوضوح. ابدأ بجملة مفتاحية تذكر الفكرة الرئيسة صراحة (' + topicTitle() + ').' },
    supporting: supp.map(s => ({ text: s, role: '', connector: connOf(s) })),
    supporting_note: supp.length >= 2 ? 'تأكد إن كل جملة داعمة تشرح الفكرة الرئيسة أو تدعمها بدليل أو معلومة أو مثال.' : 'الجمل الداعمة قليلة: أضف جملًا تشرح الفكرة الرئيسة وتدعمها بالأدلة أو المعلومات أو الأمثلة.',
    closing: { text: closing, ok: closeOk, note: !closing ? 'ما فيه جملة ختامية: اختم الفقرة بجملة تلخّص الفكرة أو تؤكدها.' : closeOk ? 'جملة ختامية تؤكد الفكرة أو تلخّصها.' : 'الجملة الأخيرة ما تبيّن إنها خاتمة. ابدأها بأداة ختام (وبذلك، ولذلك، وهكذا) وأكّد فيها الفكرة الرئيسة.' },
    conditions: {
      unity: { ok: unityOk, note: unityOk ? `كل الجمل تدور حول فكرة واحدة هي «${topicTitle()}»، وكل جملة مرتبطة بالفكرة الرئيسة.` : n < 2 ? 'الفقرة جملة واحدة؛ الفقرة مجموعة جمل تدور حول فكرة واحدة.' : `هذي الجمل ما يظهر ارتباطها بالفكرة الرئيسة، وقد تكون فكرة ثانية: ${offTopic.map(x => '«' + x + '»').join('، ')}. تأكد إن جميع الجمل تدور حول فكرة واحدة فقط دون إدخال أفكار أخرى.` },
      cohesion: { ok: linked >= needLinks, note: linked >= needLinks ? `استعملت أدوات ربط بين الجمل (${linked} من ${n - 1}).` : `أدوات الربط قليلة (${linked} من ${n - 1}). اربط الجمل بأدوات مثل: لذلك، كما أنّ، بالإضافة إلى ذلك، بناءً على ذلك.` },
      sequence: { ok: seqOk, note: seqOk ? 'الفقرة مرتبة: تبدأ بالفكرة الرئيسة (العام)، ثم الجمل الداعمة (التفاصيل)، ثم الختام.' : !keyOk ? 'الفقرة ما تبدأ بالفكرة الرئيسة؛ رتّبها من العام إلى الخاص: ابدأ بالجملة المفتاحية ثم التفاصيل.' : midClose.length ? `فيه جملة ختام في وسط الفقرة: «${midClose[0]}». الختام يكون في آخر جملة.` : !ordOk ? 'التعداد (أولًا، ثانيًا…) ما جاء بالترتيب.' : 'الفقرة ما تنتهي بجملة ختامية واضحة؛ الترتيب المنطقي: فكرة رئيسة، ثم تفاصيل، ثم ختام.' },
      relevance: { ok: relevance >= Math.ceil(n / 2), note: relevance >= Math.ceil(n / 2) ? 'الفقرة مرتبطة بعنوان الموضوع.' : 'كثير من الجمل ما تذكر الموضوع؛ تأكد إن الفقرة مرتبطة بعنوان «' + topicTitle() + '».' }
    },
    ends_with_period: { ok: endsDot, note: endsDot ? 'الفقرة تنتهي بنقطة.' : 'الفقرة لازم تنتهي بنقطة بعد الجملة الأخيرة.' },
    errors: errs.sort((x, y) => x.start - y.start).map(e => ({ wrong: e.wrong, right: e.right, type: e.type, reason: e.reason, lesson: e.lesson, start: e.start, end: e.end, fix: e.fix })),
    corrected: '', tips: [], summary: ''
  };
  // الفقرة بعد التصحيح (الأخطاء اللي لها تصحيح أكيد)
  let c = text;
  errs.filter(e => e.fix).sort((x, y) => y.start - x.start).forEach(e => { c = c.slice(0, e.start) + e.right + c.slice(e.end); });
  if (!endsDot) c = c.replace(/[\s،؛:]*$/, '') + '.';
  R.corrected = c;
  // الدرجة: البناء 4، الشروط 3، السلامة اللغوية 3
  let sc = (keyOk ? 1.5 : 0) + Math.min(1.5, supp.length * 0.5) + (closeOk ? 1 : closing ? 0.5 : 0);
  sc += (R.conditions.cohesion.ok ? 0.75 : linked ? 0.4 : 0) + (R.conditions.relevance.ok ? 0.75 : 0.25) + (unityOk ? 0.75 : 0) + (seqOk ? 0.75 : 0.25);
  sc += Math.max(0, 3 - errs.length * 0.5 - (endsDot ? 0 : 0.5));
  if (n !== N) sc -= 0.5;
  R.score = Math.max(0, Math.min(10, Math.round(sc)));
  R.summary = (n === N ? `عدد الجمل مطابق للمطلوب (${N}). ` : `عدد الجمل ${n} والمطلوب ${N}. `) + (errs.length ? `لقينا ${errs.length === 1 ? 'ملاحظة واحدة' : errs.length === 2 ? 'ملاحظتين' : errs.length + (errs.length <= 10 ? ' ملاحظات' : ' ملاحظة')} لغوية أو ترقيمية، شوفها تحت.` : 'ما لقينا أخطاء من الأخطاء المعروفة في الفحص الآلي.');
  if (keyOk) R.tips.push('أحسنت في البدء بجملة مفتاحية واضحة.');
  if (n !== N) R.tips.push(`الدكتور طالب ${N} جمل، وفقرتك فيها ${n}. عدّل عدد الجمل (الجملة تنتهي بنقطة).`);
  if (!R.conditions.cohesion.ok) R.tips.push('اربط كل جملة بالتي قبلها بأداة ربط مناسبة.');
  if (!unityOk) R.tips.push('خلّ كل الجمل تخدم فكرة الموضوع نفسها، واحذف أي جملة تفتح فكرة ثانية.');
  if (supp.length < 2) R.tips.push('ادعم الفكرة بمثال أو معلومة في جملة داعمة.');
  R.tips.push('اقرأ فقرتك قراءة أخيرة للتأكد من الهمزات والتاء المربوطة وعلامات الترقيم.');
  return R;
}

/* ══════════ عرض النتيجة ══════════ */
const showWs = w => w;
const IC = n => window.ICON ? ICON(n) : '';
const stTag = (ok, y, n) => ok === null || ok === undefined ? '<span class="st na">راجعها بنفسك</span>' : ok ? `<span class="st ok">${IC('check')}${y}</span>` : `<span class="st no">${IC('x')}${n}</span>`;
const cls = ok => ok === null || ok === undefined ? 'na' : ok ? 'ok' : 'no';
function highlight(text, errs) {
  // نحدد مواضع الأخطاء (من الفحص الآلي جاهزة، ومن الذكاء الاصطناعي نبحث عن النص)
  const spans = []; let from = 0;
  errs.forEach(e => {
    let s = e.start, en = e.end;
    if (s === undefined) { s = text.indexOf(e.wrong, 0); if (s < 0) { s = plain(text).indexOf(plain(e.wrong)); if (s >= 0) s = -1; } en = s + (e.wrong || '').length; }
    if (s >= 0 && e.wrong && !spans.some(x => s < x[1] && en > x[0])) spans.push([s, en, e]);
  });
  spans.sort((a, b) => a[0] - b[0]);
  let out = '', last = 0;
  spans.forEach(([s, e, er]) => { out += esc(text.slice(last, s)) + `<mark title="${esc('الصواب: ' + er.right)}">${esc(text.slice(s, e))}</mark>`; last = e; });
  return out + esc(text.slice(last));
}
function render(r, text, src) {
  const n = r.sentence_count;
  const supp = (r.supporting || []);
  const C = r.conditions || {};
  const errs = r.errors || [];
  $('wRes').innerHTML = `<div class="card res-card">
    <div class="res-head">
      <div class="sc-box"><b>${r.score}/10</b><small>درجتك</small></div>
      <div><h3>${esc(topicTitle())}</h3><div class="sc">عدد الجمل: <span class="${n === N ? 'ok' : 'no'}">${n} من ${N}</span></div><p>${esc(r.summary || '')}</p></div>
    </div>
    <div class="src">${src === 'ai' ? 'صُحّحت فقرتك بالذكاء الاصطناعي حسب شروط الكتاب وطريقته.' : 'تصحيح آلي حسب شروط الكتاب وجداول الأخطاء فيه.'}</div>
    <div class="lbl-h">بناء الفقرة</div>
    <div class="chk ${cls(r.key_sentence.ok)}"><h5>الجملة المفتاحية (الفكرة الرئيسة) ${stTag(r.key_sentence.ok, 'صحيحة', 'تحتاج تعديل')}</h5>
      ${r.key_sentence.text ? `<p class="quote">«${esc(r.key_sentence.text)}»</p>` : ''}<p class="note">${esc(r.key_sentence.note)}</p></div>
    <div class="chk ${supp.length ? 'ok' : 'no'}"><h5>الجمل الداعمة ${stTag(supp.length > 0, 'تدعم الفكرة', 'ناقصة')}</h5>
      ${supp.length ? `<ol>${supp.map(s => `<li>${esc(s.text)}${s.role || s.connector ? `<small>${s.role ? esc(s.role) : ''}${s.connector ? `${s.role ? '، ' : ''}وربطت بـ«${esc(s.connector)}»` : ''}</small>` : ''}</li>`).join('')}</ol>` : ''}
      <p class="note">${esc(r.supporting_note || '')}</p></div>
    <div class="chk ${cls(r.closing.ok)}"><h5>الجملة الختامية ${stTag(r.closing.ok, 'صحيحة', 'تحتاج تعديل')}</h5>
      ${r.closing.text ? `<p class="quote">«${esc(r.closing.text)}»</p>` : ''}<p class="note">${esc(r.closing.note)}</p></div>
    <div class="lbl-h">شروط الفقرة الجيدة</div>
    ${[['unity', 'وحدة الفقرة'], ['cohesion', 'الترابط والتماسك'], ['sequence', 'التسلسل المنطقي'], ['relevance', 'الارتباط بعنوان الموضوع']].map(([k, t]) => C[k] ? `<div class="chk ${cls(C[k].ok)}"><h5>${t} ${stTag(C[k].ok, 'متحقق', 'غير متحقق')}</h5><p class="note">${esc(C[k].note)}</p></div>` : '').join('')}
    ${r.ends_with_period ? `<div class="chk ${cls(r.ends_with_period.ok)}"><h5>علامة النهاية ${stTag(r.ends_with_period.ok, 'متحقق', 'غير متحقق')}</h5><p class="note">${esc(r.ends_with_period.note)}</p></div>` : ''}
    ${errs.length ? `<div class="lbl-h">فقرتك (الأخطاء مظلّلة)</div>
    <div class="ptext">${highlight(text, errs)}</div>
    <div class="lbl-h">الأخطاء (${errs.length})</div>
    <div class="errs">${errs.map(e => `<div class="err"><div class="ln"><span class="w">${esc(showWs(e.wrong))}</span>${IC('next').replace('class="i"', 'class="i ar"')}<span class="r">${esc(e.right)}</span><span class="ty">${esc(e.type)}</span></div><p>${esc(e.reason)}</p>${e.lesson ? `<div class="ls">ارجع لدرس: ${esc(e.lesson)}</div>` : ''}</div>`).join('')}</div>
    <div class="lbl-h">الفقرة بعد التصحيح</div>
    <div class="ptext fixed">${esc(r.corrected || text)}</div>` : `<div class="chk"><h5>الأخطاء اللغوية والإملائية <span class="st ok">${IC('check')}ما فيه أخطاء</span></h5></div>`}
    ${r.tips && r.tips.length ? `<div class="lbl-h">نصائح لتحسين فقرتك</div><ul class="tips">${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
  </div>`;
}

window.Paragraph = { open, localCheck };
})();
