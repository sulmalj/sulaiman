/* موقع تدريب عرب 100 — منطق الموقع (مشترك بين موقع الميد والفاينل؛ الفرق في SITE) */
(function () {
'use strict';

const TELEGRAM_URL = 'https://t.me/mlazmadl';
const UNITS = {
  1: ['الوحدة الأولى', 'الرسم الإملائي'],
  2: ['الوحدة الثانية', 'تحرير الكتابة وعلامات الترقيم وأهم الأخطاء الشائعة'],
  3: ['الوحدة الثالثة', 'كتابة الفقرة المقالية'],
  4: ['الوحدة الرابعة', 'الكتابة الوظيفية']
};
const LESSONS = {
  1: { u: 1, t: 'همزتا الوصل والقطع' },
  2: { u: 1, t: 'الهمزة المتوسطة والهمزة آخر الكلمة' },
  3: { u: 1, t: 'الحذف والزيادة في الرسم' },
  4: { u: 1, t: 'كتابة الألف اللينة والتاء والهاء في آخر الكلمة' },
  5: { u: 2, t: 'التحرير الكتابي' },
  6: { u: 2, t: 'علامات الترقيم' },
  7: { u: 2, t: 'كتابة الفقرة', write: true },
  8: { u: 2, t: 'الأخطاء الشائعة' },
  9: { u: 3, t: 'البناء النصّي' },
  10: { u: 3, t: 'الاستدلال والإقناع' },
  11: { u: 4, t: 'الكتابة الوظيفية' },
  12: { u: 4, t: 'الكتابة الوظيفية والذكاء الاصطناعي' }
};
const NUMS = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ'];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const lessonName = s => `الدرس ${NUMS[s]}: ${LESSONS[s].t}`;
const D = window.DATA || {};
const ICON = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
window.ICON = ICON;
const inPart = s => SITE.lessons.includes(s);

/* ── البيانات ── */
const QS = (D.questions || []).filter(q => inPart(q.s)).map(q => Object.assign({ id: 'q' + q.s + '-' + hash(q.q + '|' + (q.o ? q.o[0] : q.c || '')) }, q));
const ES = (D.essays || []).filter(q => inPart(q.s)).map(q => Object.assign({ id: 'e' + q.s + '-' + hash(q.q), t: 'es' }, q));
const CARDS = (D.cards || []).filter(c => inPart(c.s));
const BY_ID = Object.fromEntries(QS.concat(ES).map(q => [q.id, q]));
const qOf = s => QS.filter(q => q.s === s);
const eOf = s => ES.filter(q => q.s === s);
SITE.lessons.forEach(s => { qOf(s).forEach((q, i) => q.code = s + '-' + (i + 1)); eOf(s).forEach((q, i) => q.code = 'م' + s + '-' + (i + 1)); });

/* ── الحفظ في المتصفح ── */
const fresh = () => ({ ans: {}, wrong: {}, pos: {}, paras: 0, proof: {}, drafts: {} });
let LS = fresh();
try { const v = JSON.parse(localStorage.getItem(SITE.key) || 'null'); if (v && typeof v === 'object') LS = Object.assign(fresh(), v); } catch (e) {}
const save = () => { try { localStorage.setItem(SITE.key, JSON.stringify(LS)); } catch (e) {} };
window.APP = { save: () => save(), get LS() { return LS; } };

/* تسجيل الإجابة: الخطأ يدخل «مراجعة أخطائي» وينشال إذا جاوبه صح مرتين ورا بعض */
function record(q, ok) {
  LS.ans[q.id] = ok ? 1 : 0;
  if (!ok) LS.wrong[q.id] = 0;
  else if (q.id in LS.wrong) { LS.wrong[q.id]++; if (LS.wrong[q.id] >= 2) delete LS.wrong[q.id]; }
  save();
}
const weakIds = () => Object.keys(LS.wrong).filter(id => BY_ID[id]);

/* ── التنقل ── */
const VIEWS = ['home', 'lessons', 'cards', 'quiz', 'write', 'exam', 'examrun', 'report', 'review', 'hamza', 'proof'];
let cur = 'home';
function show(v, navKey) {
  cur = v;
  VIEWS.forEach(x => $('v-' + x).hidden = x !== v);
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.nav === (navKey || v)));
  window.scrollTo(0, 0);
}
function go(key) {
  if (E && key !== 'examrun') { confirmBox('تطلع من الاختبار؟', 'إذا طلعت بيضيع هذا الاختبار.', 'إيه، اطلع', () => { stopExam(); go(key); }); return; }
  if (key === 'home') { renderHome(); show('home'); }
  else if (key === 'rules' || key === 'practice' || key === 'essay') { renderLessons(key); show('lessons', key); }
  else if (key === 'write') { show('write'); window.Paragraph && Paragraph.open(); }
  else if (key === 'exam') { renderExamIntro(); show('exam'); }
  else if (key === 'review') { renderReviewIntro(); show('review'); }
  else if (key === 'hamza') { renderHamza(); show('hamza'); }
  else if (key === 'proof') { renderProof(); show('proof'); }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-nav]'); if (b) go(b.dataset.nav); });

/* ── الرئيسية ── */
function renderHome() {
  const ids = Object.keys(LS.ans).filter(id => BY_ID[id] && BY_ID[id].t !== 'es');
  const right = ids.filter(id => LS.ans[id]).length;
  const mastery = QS.length ? Math.round(right / QS.length * 100) : 0;
  $('mPct').textContent = mastery + '%';
  $('mBar').style.width = mastery + '%';
  $('heroLead').textContent = `${SITE.lessons.length} دروس من كتاب مهارات الكتابة: ${QS.length} سؤال صح وخطأ واختيار، و${ES.length} سؤال مقالي، وبطاقات للقواعد، وتصحيح لكتابة الفقرة.`;
  $('toolExam').textContent = `${SITE.examN} سؤال عشوائي في ${SITE.examMin} دقيقة، والنتيجة في النهاية`;
  $('sAns').textContent = ids.length;
  $('sAcc').textContent = ids.length ? Math.round(right / ids.length * 100) + '%' : '—';
  $('sRev').textContent = weakIds().length;
  $('sPara').textContent = LS.paras || 0;
}

/* ── قائمة الدروس ── */
let MODE = 'practice';
const MODES = {
  rules: { t: 'الدروس والقواعد', p: 'بطاقات تلخّص قواعد كل درس واستثناءاتها. راجعها قبل ما تتدرّب.' },
  practice: { t: 'تدرّب بالدرس', p: 'أسئلة صح وخطأ واختيار من متعدد لكل درس، وتطلع لك الإجابة الصحيحة والتوضيح أول ما تجاوب.' },
  essay: { t: 'الأسئلة المقالية', p: 'علّل وصحّح واذكر. اكتب إجابتك، وبعدها قارنها بالإجابة النموذجية.' }
};
function renderLessons(mode) {
  MODE = mode;
  $('lesTitle').textContent = MODES[mode].t;
  $('lesSub').textContent = MODES[mode].p;
  let html = '', unit = 0;
  SITE.lessons.forEach(s => {
    const L = LESSONS[s];
    if (L.u !== unit) { if (unit) html += '</div></div>'; unit = L.u; html += `<div class="unit"><div class="unit-h"><b>${UNITS[unit][0]}</b><span>${UNITS[unit][1]}</span></div><div class="rows">`; }
    let meta = '', pct = null, disabled = false, act = `data-les="${s}"`, cls = '';
    if (mode === 'rules') {
      const n = CARDS.filter(c => c.s === s).length;
      meta = n ? `${n} بطاقة` : 'قريباً'; disabled = !n;
    } else if (L.write && mode === 'practice') {
      meta = 'تمرين كتابي: اكتب فقرة وتُصحَّح لك'; act = 'data-nav="write"'; cls = 'special';
    } else {
      const list = mode === 'essay' ? eOf(s) : qOf(s);
      const done = list.filter(q => q.id in LS.ans).length;
      pct = list.length ? Math.round(done / list.length * 100) : 0;
      meta = list.length ? `${list.length} سؤال` : 'قريباً'; disabled = !list.length;
    }
    html += `<button type="button" class="row ${cls}" ${disabled ? 'disabled' : act}>
      <span class="n">${s}</span>
      <span class="t"><b>${esc(LESSONS[s].t)}</b><small>${meta}</small></span>
      ${pct === null ? '<span></span>' : `<span class="pg"><span class="pgbar"><i style="width:${pct}%"></i></span>${pct}%</span>`}
      <span class="chev">${ICON('chev')}</span>
    </button>`;
  });
  $('lesList').innerHTML = html + '</div></div>';
}
$('lesList').addEventListener('click', e => {
  const b = e.target.closest('[data-les]'); if (!b) return;
  const s = +b.dataset.les;
  if (MODE === 'rules') openCards(s);
  else startLesson(s, MODE);
});

/* ── بطاقات القواعد ── */
let CS = 1;
function openCards(s) {
  CS = s;
  const list = CARDS.filter(c => c.s === s);
  $('cTitle').innerHTML = `${esc(lessonName(s))}<small>${UNITS[LESSONS[s].u].join(' · ')} · ${list.length} بطاقة</small>`;
  $('cList').innerHTML = list.map(c => `<article class="rc">
      <h4>${rich(c.t)}</h4>
      <ul>${c.l.map(x => `<li>${rich(x)}</li>`).join('')}</ul>
      ${c.e && c.e.length ? `<div class="ex"><span class="ex-l">أمثلة</span>${c.e.map(x => `<span class="c">${rich(x)}</span>`).join('')}</div>` : ''}
      ${c.x ? `<div class="exc"><b>استثناء أو تنبيه:</b> ${rich(c.x)}</div>` : ''}
    </article>`).join('');
  const withCards = SITE.lessons.filter(x => CARDS.some(c => c.s === x));
  const i = withCards.indexOf(s);
  $('cPrev').disabled = i <= 0; $('cNext').disabled = i >= withCards.length - 1;
  $('cPrev').onclick = () => openCards(withCards[i - 1]);
  $('cNext').onclick = () => openCards(withCards[i + 1]);
  $('cPractice').hidden = LESSONS[s].write;
  $('cPractice').onclick = () => startLesson(s, 'practice');
  show('cards', 'rules');
}

/* ── التدريب / المقالي / المراجعة ── */
let P = null;
function startLesson(s, mode) {
  const ids = (mode === 'essay' ? eOf(s) : qOf(s)).map(q => q.id);
  if (!ids.length) return;
  const key = (mode === 'essay' ? 'e' : 'p') + s;
  P = { kind: mode, s, key, ids, i: Math.min(LS.pos[key] || 0, ids.length - 1), picked: {}, shown: {}, typed: {} };
  show('quiz', mode); renderQ();
}
function startReview() {
  const ids = shuffle(weakIds());
  if (!ids.length) return;
  P = { kind: 'review', ids, i: 0, picked: {}, shown: {}, typed: {} };
  show('quiz', 'review'); renderQ();
}
const ORDER = {};
function options(q) {
  if (q.t === 'tf') return [{ txt: 'صح', ok: q.a === true }, { txt: 'خطأ', ok: q.a === false }];
  if (!ORDER[q.id]) ORDER[q.id] = shuffle(q.o.map((txt, i) => ({ txt, ok: i === 0 })));
  return ORDER[q.id];
}
const rightText = q => q.t === 'tf' ? (q.a ? 'صح' : 'خطأ') : q.o[0];
const explain = q => (q.t === 'tf' && !q.a ? `<span class="corr"><b>التصحيح:</b> ${esc(q.c)}</span>` : '') + (q.x ? `<span class="corr"><b>التوضيح:</b> ${esc(q.x)}</span>` : '');
const kindLabel = q => q.t === 'es' ? q.k : q.t === 'tf' ? 'صح أو خطأ' : 'اختيار من متعدد';

function renderQ() {
  const q = BY_ID[P.ids[P.i]];
  const head = P.kind === 'review' ? 'مراجعة أخطائي' : P.kind === 'essay' ? 'الأسئلة المقالية' : 'تدرّب بالدرس';
  $('qTitle').innerHTML = `${head}<small>${esc(lessonName(q.s))} · سؤال ${P.i + 1} من ${P.ids.length}</small>`;
  $('qBar').style.width = ((P.i + 1) / P.ids.length * 100) + '%';
  let html = `<div class="qmeta"><span class="tag ${q.t === 'es' ? 'rose' : ''}">${esc(kindLabel(q))}</span><span class="qcode">سؤال ${q.code}</span></div>
    <p class="qtext">${esc(q.q)}</p>`;
  if (q.t === 'es') {
    const shown = P.shown[q.id];
    html += `<textarea class="ans-in" id="esIn" placeholder="اكتب إجابتك هنا (اختياري)…">${esc(P.typed[q.id] || '')}</textarea>`;
    if (!shown) html += `<div class="self"><button class="btn btn-pri" type="button" id="esShow">اعرض الإجابة النموذجية</button></div>`;
    else {
      html += `<div class="model-ans"><div class="h">الإجابة النموذجية</div>${esc(q.a)}</div>`;
      const m = P.picked[q.id];
      html += m === undefined
        ? `<div class="self"><span>قارن إجابتك:</span><button class="btn btn-good btn-sm" type="button" data-self="1">${ICON('check')}إجابتي صحيحة</button><button class="btn btn-bad btn-sm" type="button" data-self="0">${ICON('x')}أخطأت أو ما عرفتها</button></div>`
        : `<div class="fb ${m ? 'ok' : 'no'}"><div class="h">${m ? ICON('check') + 'ممتاز' : ICON('x') + 'انضاف لـ«مراجعة أخطائي»، ارجع له بعدين'}</div></div>`;
    }
  } else {
    const opts = options(q), picked = P.picked[q.id];
    html += `<div class="opts ${q.t === 'tf' ? 'tf' : ''}">` + opts.map((o, i) => {
      let cls = '';
      if (picked !== undefined) { if (o.ok) cls = 'ok'; else if (i === picked) cls = 'no'; }
      return `<button class="opt ${cls}" type="button" data-i="${i}" ${picked !== undefined ? 'disabled' : ''}>${q.t === 'tf' ? '' : `<span class="lt">${LETTERS[i]}</span>`}<span>${esc(o.txt)}</span></button>`;
    }).join('') + `</div>`;
    if (picked !== undefined) {
      const ok = opts[picked].ok;
      html += `<div class="fb ${ok ? 'ok' : 'no'}"><div class="h">${ok ? ICON('check') + 'إجابة صحيحة' : ICON('x') + 'إجابة خاطئة، والصحيحة: ' + esc(rightText(q))}</div>${explain(q)}</div>`;
    }
  }
  $('qCard').innerHTML = html;
  $('qPrev').disabled = P.i === 0;
  $('qNext').innerHTML = P.i === P.ids.length - 1 ? 'إنهاء' : 'التالي' + ICON('next');
}
$('qCard').addEventListener('input', e => { if (e.target.id === 'esIn') P.typed[P.ids[P.i]] = e.target.value; });
$('qCard').addEventListener('click', e => {
  const q = BY_ID[P.ids[P.i]];
  if (e.target.closest('#esShow')) { P.shown[q.id] = 1; renderQ(); return; }
  const sb = e.target.closest('[data-self]');
  if (sb) { const ok = sb.dataset.self === '1'; P.picked[q.id] = ok; record(q, ok); renderQ(); return; }
  const b = e.target.closest('.opt'); if (!b || b.disabled) return;
  const i = +b.dataset.i;
  P.picked[q.id] = i;
  record(q, options(q)[i].ok);
  renderQ();
});
function moveQ(d) {
  const n = P.i + d;
  if (n < 0) return;
  if (n >= P.ids.length) { if (P.key) { LS.pos[P.key] = 0; save(); } go(P.kind === 'review' ? 'review' : P.kind); return; }
  P.i = n;
  if (P.key) { LS.pos[P.key] = P.i; save(); }
  renderQ(); window.scrollTo(0, 0);
}
$('qPrev').onclick = () => moveQ(-1);
$('qNext').onclick = () => moveQ(1);
$('qBack').onclick = () => go(P && P.kind !== 'review' ? P.kind : 'review');

/* ── مراجعة الأخطاء ── */
function renderReviewIntro() {
  const ids = weakIds();
  const by = {};
  ids.forEach(id => { const s = BY_ID[id].s; by[s] = (by[s] || 0) + 1; });
  $('revBox').innerHTML = ids.length
    ? `<p style="margin:0 0 10px">عندك <b>${ids.length}</b> سؤال تحتاج مراجعة:</p>
       <div class="revs">${Object.keys(by).map(s => `<span>${esc(LESSONS[s].t)} · ${by[s]}</span>`).join('')}</div>
       <button class="btn btn-pri" type="button" id="revStart">ابدأ المراجعة</button>`
    : `<p class="empty">ما عندك أخطاء حالياً. تدرّب على الدروس، وأي سؤال تغلط فيه بيجيك هنا.</p>`;
  const b = $('revStart'); if (b) b.onclick = startReview;
}

/* ── الاختبار التجريبي ── */
let E = null, timer = null;
function renderExamIntro() {
  $('exFacts').innerHTML = `<div><dt>عدد الأسئلة</dt><dd>${SITE.examN} سؤال</dd></div><div><dt>الوقت</dt><dd>${SITE.examMin} دقيقة</dd></div><div><dt>الأسئلة من</dt><dd>${SITE.examScope}</dd></div>`;
}
function startExam() {
  const pool = QS.filter(q => SITE.examLessons.includes(q.s));
  const ids = shuffle(pool.map(q => q.id)).slice(0, SITE.examN);
  E = { ids, i: 0, picked: {}, end: Date.now() + SITE.examMin * 60000 };
  ids.forEach(id => delete ORDER[id]);
  show('examrun', 'exam'); renderE(); tick();
  clearInterval(timer); timer = setInterval(tick, 500);
}
function stopExam() { clearInterval(timer); timer = null; E = null; }
function fmt(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function tick() {
  if (!E) return;
  const rem = E.end - Date.now();
  $('eTimer').textContent = fmt(rem);
  $('eTimer').classList.toggle('low', rem < 120000);
  if (rem <= 0) finishExam(true);
}
function renderE() {
  const q = BY_ID[E.ids[E.i]], opts = options(q), picked = E.picked[q.id];
  $('eCount').textContent = `سؤال ${E.i + 1} من ${E.ids.length} · جاوبت ${Object.keys(E.picked).length}`;
  $('eDots').innerHTML = E.ids.map((id, k) => `<button type="button" data-k="${k}" class="${id in E.picked ? 'ans' : ''} ${k === E.i ? 'cur' : ''}" aria-label="سؤال ${k + 1}">${k + 1}</button>`).join('');
  $('eCard').innerHTML = `<div class="qmeta"><span class="tag">${kindLabel(q)}</span><span>${esc(LESSONS[q.s].t)}</span></div>
    <p class="qtext">${esc(q.q)}</p>
    <div class="opts ${q.t === 'tf' ? 'tf' : ''}">` +
    opts.map((o, i) => `<button class="opt ${picked === i ? 'sel' : ''}" type="button" data-i="${i}">${q.t === 'tf' ? '' : `<span class="lt">${LETTERS[i]}</span>`}<span>${esc(o.txt)}</span></button>`).join('') + `</div>`;
  $('ePrev').disabled = E.i === 0;
  $('eNext').innerHTML = E.i === E.ids.length - 1 ? 'إنهاء وتصحيح' : 'التالي' + ICON('next');
}
$('startExam').onclick = startExam;
$('eCard').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; E.picked[E.ids[E.i]] = +b.dataset.i; renderE(); });
$('eDots').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { E.i = +b.dataset.k; renderE(); } });
$('ePrev').onclick = () => { if (E.i > 0) { E.i--; renderE(); } };
$('eNext').onclick = () => { if (E.i < E.ids.length - 1) { E.i++; renderE(); window.scrollTo(0, 0); } else askFinish(); };
$('eEnd').onclick = askFinish;
function askFinish() {
  const left = E.ids.length - Object.keys(E.picked).length;
  confirmBox('تنهي الاختبار؟', left ? `باقي ${left} سؤال ما جاوبت عليه، وبينحسب خطأ.` : 'جاوبت على كل الأسئلة. يطلع لك التصحيح الحين.', 'إيه، أنهِ الاختبار', () => finishExam(false));
}
function finishExam(timeUp) {
  if (!E) return;
  const res = E.ids.map(id => {
    const q = BY_ID[id], opts = options(q), p = E.picked[id];
    const ok = p !== undefined && opts[p].ok;
    record(q, ok);
    return { q, ok, you: p === undefined ? null : opts[p].txt };
  });
  stopExam();
  const score = res.filter(r => r.ok).length, n = res.length, pct = Math.round(score / n * 100);
  const msg = pct >= 90 ? 'ممتاز، مستواك عالي.' : pct >= 75 ? 'جيد جداً، راجع أخطاءك وتكون جاهز.' : pct >= 50 ? 'لا بأس، تحتاج مراجعة أكثر للدروس.' : 'ارجع للدروس وبطاقات القواعد وراجعها زين قبل الاختبار.';
  $('rScore').innerHTML = `<div class="n">${score}<small> / ${n}</small></div><p>${timeUp ? 'انتهى الوقت · ' : ''}${msg}</p>`;
  const wrong = res.filter(r => !r.ok);
  $('rHead').textContent = wrong.length ? `الأسئلة اللي غلطت فيها (${wrong.length})` : 'ما غلطت في ولا سؤال';
  $('rList').innerHTML = wrong.map(r => `<div class="ritem">
      <p class="q">${esc(r.q.q)}</p>
      <div class="rw you">إجابتك: <b>${r.you === null ? 'ما جاوبت' : esc(r.you)}</b></div>
      <div class="rw right">الإجابة الصحيحة: <b>${esc(rightText(r.q))}</b></div>
      ${r.q.t === 'tf' && !r.q.a ? `<div class="cr"><b>التصحيح:</b> ${esc(r.q.c)}</div>` : ''}
      ${r.q.x ? `<div class="cr"><b>التوضيح:</b> ${esc(r.q.x)}</div>` : ''}
      <div class="src">${esc(lessonName(r.q.s))} · سؤال ${r.q.code}</div>
    </div>`).join('');
  show('report', 'exam');
}
$('rAgain').onclick = startExam;

/* ══════════ محلل الهمزة (قواعد الكتاب: الدرس الأول والثاني) ══════════ */
const HZ = { pos: null };
const HZQ = {
  pos: { q: 'وين مكان الهمزة في الكلمة؟', o: [['first', 'أول الكلمة'], ['mid', 'وسط الكلمة'], ['end', 'آخر الكلمة']] },
  kind: { q: 'وش نوع الكلمة؟', o: [['harf', 'حرف'], ['ism', 'اسم'], ['fil', 'فعل']] },
  harf: { q: 'أي حرف؟', o: [['al', '(أل) التعريف'], ['other', 'حرف آخر مبدوء بهمزة (أنْ، أنّ، إنّ، إذا، إلى، ألّا، إلّا…)']] },
  ism: { q: 'أي نوع من الأسماء؟', o: [
    ['sama', 'من الأسماء المسموعة (اسم، ابن، ابنة، امرؤ، امرأة، اثنان، اثنتان) — مفرد أو مثنى'],
    ['samaPl', 'جمع أحد هذه الأسماء (أسماء، أبناء…)'],
    ['m56', 'مصدر فعل خماسي أو سداسي (انتصار، استغفار)'],
    ['m4', 'مصدر فعل رباعي (إسلام، إكرام)'],
    ['m3', 'مصدر فعل ثلاثي مبدوء بهمزة (أَمْر، أَخْذ)'],
    ['alamF', 'عَلَم منقول من فعل همزته وصل (إعلم)'],
    ['alamI', 'عَلَم منقول من اسم همزته وصل (ابتسام)'],
    ['otherI', 'اسم آخر (أحمد، إعلان، أين، أنتَ…)']] },
  fil: { q: 'أي نوع من الأفعال؟', o: [
    ['amr3', 'أمر الفعل الثلاثي (اكتب، ارجع)'],
    ['f56', 'ماضي أو أمر الفعل الخماسي أو السداسي (انتصر، استغفر)'],
    ['madi3', 'ماضي الفعل الثلاثي المبدوء بهمزة (أَمَر، أَخَذ)'],
    ['f4', 'ماضي أو أمر الفعل الرباعي (أسلَم، أكرِم)'],
    ['mud', 'مضارع مبدوء بهمزة المضارعة (ألعبُ، أستخدمُ)']] },
  vow: { q: 'وش حركة الهمزة؟', o: [['fat', 'فتحة'], ['dam', 'ضمة'], ['kas', 'كسرة']] },
  hv: { q: 'وش حركة الهمزة نفسها؟', o: [['kas', 'كسرة'], ['dam', 'ضمة'], ['fat', 'فتحة'], ['suk', 'سكون']] },
  pv: { q: 'وش حركة الحرف اللي قبلها؟', o: [['kas', 'كسرة'], ['dam', 'ضمة'], ['fat', 'فتحة'], ['suk', 'سكون']] },
  sk: { q: 'وش الحرف الساكن اللي قبلها؟', o: [['alif', 'ألف مدّ (قاْئِم، قراْءَة)'], ['waw', 'واو ساكنة (مروْءَة)'], ['ya', 'ياء ساكنة (هيْئَة)'], ['other', 'حرف ساكن آخر (مسْأَلة)']] },
  after: { q: 'وش اللي بعد الهمزة؟', o: [['alef', 'ألف (مدّ أو تثنية أو جمع)'], ['none', 'غير ذلك']] },
  afterS: { q: 'وش اللي بعد الهمزة؟', o: [['madd', 'ألف مدّ (مرْآة، ظمْآن)'], ['tath', 'ألف المثنى، والساكن قبلها حرف لا يتصل بما بعده (جزْءَان)'], ['none', 'غير ذلك']] },
  ev: { q: 'وش حركة الحرف اللي قبل الهمزة؟', o: [['kas', 'كسرة'], ['dam', 'ضمة'], ['fat', 'فتحة'], ['suk', 'سكون']] },
  ex: { q: 'فيه شيء زايد على الكلمة؟', o: [['none', 'لا'], ['tan', 'منوّنة بتنوين النصب'], ['pro', 'اتصل بها ضمير أو زيادة (يملؤها، شاطئكم)'], ['dual', 'دخلت عليها ألف الاثنين (قرأ + ا)']] },
  esk: { q: 'وش الحرف الساكن اللي قبلها؟', o: [['alif', 'ألف مدّ (سماء، نداء)'], ['conn', 'حرف يتصل بما بعده (عبْء، دفْء، بطْء)'], ['disc', 'حرف لا يتصل بما بعده — د ذ ر ز و (بدْء، ضوْء، هدوء)']] }
};
function hzFlow() {
  const s = HZ, f = ['pos'];
  if (s.pos === 'first') {
    f.push('kind');
    if (s.kind) f.push(s.kind);
    if (hzWasl() === false) f.push('vow');
  } else if (s.pos === 'mid') {
    f.push('hv', 'pv');
    if (s.pv === 'suk') f.push('sk');
    if (s.hv === 'fat' && s.pv === 'fat') f.push('after');
    if (s.hv === 'fat' && s.pv === 'suk' && s.sk === 'other') f.push('afterS');
  } else if (s.pos === 'end') {
    f.push('ev');
    if (s.ev === 'suk') f.push('esk');
    f.push('ex');
  }
  return f;
}
function hzWasl() { // true = وصل، false = قطع، undefined = ما اكتمل
  const s = HZ;
  if (s.kind === 'harf' && s.harf) return s.harf === 'al';
  if (s.kind === 'ism' && s.ism) return ['sama', 'm56', 'alamI'].includes(s.ism);
  if (s.kind === 'fil' && s.fil) return ['amr3', 'f56'].includes(s.fil);
  return undefined;
}
const SEAT = { kas: ['ئ', 'على نبرة (ياء)'], dam: ['ؤ', 'على واو'], fat: ['أ', 'على ألف'], suk: ['ء', 'مفردة على السطر'] };
const VNAME = { kas: 'الكسرة', dam: 'الضمة', fat: 'الفتحة', suk: 'السكون' };
const RANK = { kas: 4, dam: 3, fat: 2, suk: 1 };
function hzSolve() {
  const s = HZ, steps = [];
  let g, title, ex = [], note = '';
  if (!s.pos) return null;
  if (s.pos === 'first') {
    const w = hzWasl(); if (w === undefined) return null;
    const why = {
      al: '(أل) التعريف همزتها وصل، وهي الحرف الوحيد المستثنى من الحروف.',
      other: 'جميع الحروف المبدوءة بهمزة همزتها قطع (ويستثنى منها «أل» التعريف).',
      sama: 'الأسماء المسموعة عن العرب (اسم، ابن، ابنة، امرؤ، امرأة، اثنان، اثنتان) تكتب بهمزة وصل في حال الإفراد والتثنية.',
      samaPl: 'جمع الأسماء المسموعة يكتب بهمزة قطع: أسماء – أبناء.',
      m56: 'مصدر الفعل الخماسي والسداسي همزته وصل: انتصار – استغفار.',
      m4: 'مصدر الفعل الرباعي همزته قطع: إسلام – إكرام.',
      m3: 'مصدر الفعل الثلاثي المبدوء بهمزة همزته قطع: أَمْر – أَخْذ.',
      alamF: 'إذا حُوِّل فعل همزته وصل إلى عَلَم تتحول همزته إلى قطع؛ لأنه خرج عن جنسه الفعلي: هذا إعلم.',
      alamI: 'إذا حُوِّل اسم همزته وصل إلى عَلَم تبقى همزته وصلًا؛ لأنه لم يخرج عن جنسه الاسمي: هذه ابتسام.',
      otherI: 'جميع الأسماء المبدوءة بهمزة همزتها قطع (ومنها أسماء الاستفهام والضمائر)، ويستثنى الأسماء المسموعة.',
      amr3: 'أمر الفعل الثلاثي همزته وصل: اركع – اكتب.',
      f56: 'ماضي الفعل الخماسي والسداسي وأمرهما همزتهما وصل: انتصَر – انتصِر، استغفَر – استغفِر.',
      madi3: 'ماضي الفعل الثلاثي المبدوء بهمزة همزته قطع: أَمَر – أَخَذ.',
      f4: 'ماضي الفعل الرباعي وأمره همزتهما قطع: أسلَم – أسلِم، أكرَم – أكرِم.',
      mud: 'همزة المضارعة همزة قطع: ألعبُ – أستخدمُ.'
    }[s.harf || s.ism || s.fil];
    steps.push('الهمزة في أول الكلمة: إمّا همزة وصل وإمّا همزة قطع.');
    steps.push(why);
    if (w) {
      g = 'ا'; title = 'همزة وصل — تُرسم ألفًا غير مهموزة (ا)';
      steps.push('همزة الوصل تُنطق عند الابتداء بها، ولا تُنطق عند وصلها بما قبلها، وتُرسم ألفًا بدون همزة.');
      ex = ['الكتاب', 'اسم', 'ابن', 'اكتب', 'انتصار', 'استغفار'];
    } else {
      if (!s.vow) return null;
      g = s.vow === 'kas' ? 'إ' : 'أ';
      title = s.vow === 'kas' ? 'همزة قطع مكسورة — تُكتب تحت الألف (إ)' : 'همزة قطع — تُكتب فوق الألف (أ)';
      steps.push('همزة القطع تُكتب فوق الألف في حالتي الفتح والضم (أ)، وتحتها في حالة الكسر (إ).');
      ex = s.vow === 'kas' ? ['إرسال', 'إسلام', 'إكرام', 'إلى'] : ['أرسَل', 'أُرسِل', 'أحمد', 'أخذ'];
      if (s.fil === 'mud') note = 'إذا دخلت همزة المضارعة على فعل ثلاثي مهموز (أكل – أخذ – أمر) تُكتب معه مدًّا: آكل – آخذ – آمر.';
    }
    steps.push('اختبار سريع: أدخل الواو أو الفاء على الكلمة؛ إن سقطت الهمزة في النطق فهي وصل، وإن بقيت فهي قطع (وَثْنان / وَأَحمد).');
  } else if (s.pos === 'mid') {
    if (!s.hv || !s.pv || (s.pv === 'suk' && !s.sk)) return null;
    if (s.hv === 'suk' && s.pv === 'suk') return { err: 'ما يجتمع ساكنان: إذا كانت الهمزة ساكنة فالحرف اللي قبلها متحرك. راجع اختيارك.' };
    if (s.pv === 'suk' && s.hv === 'suk') return null;
    steps.push(`الهمزة متوسطة، حركتها ${VNAME[s.hv]}، وما قبلها ${s.pv === 'suk' ? 'ساكن' : 'عليه ' + VNAME[s.pv]}.`);
    if (s.hv === 'fat' && s.pv === 'fat') { if (!s.after) return null; }
    if (s.hv === 'fat' && s.pv === 'suk' && s.sk === 'other' && !s.afterS) return null;
    // الاستثناءات أولاً (كما في الكتاب)
    if (s.pv === 'suk' && s.sk === 'ya') {
      g = 'ئ'; title = 'على نبرة (ئـ)';
      steps.push('استثناء: إذا كان الحرف السابق للهمزة ياءً ساكنة تُكتب الهمزة على نبرة مهما كانت حركتها.');
      ex = ['مشيْئَة', 'مضيْئَة', 'هيْئَة', 'مجيْئُك', 'فيْئُها'];
    } else if (s.pv === 'suk' && s.sk === 'alif' && s.hv === 'fat') {
      g = 'ء'; title = 'مفردة على السطر (ء)';
      steps.push('استثناء: إذا كانت الهمزة مفتوحة وما قبلها ألف مد تُكتب مفردة على السطر (وكذلك إذا وقعت بين ألفين).');
      ex = ['قراْءَة', 'عباْءَة', 'إضاْءَة', 'مساْءَلة', 'إجراءات'];
    } else if (s.pv === 'suk' && s.sk === 'waw' && (s.hv === 'fat' || s.hv === 'dam')) {
      g = 'ء'; title = 'مفردة على السطر (ء)';
      steps.push('استثناء: إذا كانت الهمزة مفتوحة أو مضمومة وما قبلها واو ساكنة تُكتب مفردة على السطر.');
      ex = ['سموْءَل', 'مروْءَة', 'نبوْءَة', 'مقروْءَة', 'ضوْءُهم'];
    } else if (s.hv === 'fat' && s.pv === 'suk' && s.sk === 'other' && s.afterS === 'tath') {
      g = 'ء'; title = 'مفردة على السطر (ء)';
      steps.push('استثناء: إذا كانت الهمزة مفتوحة وسبقها حرف ساكن لا يتصل بما بعده وجاء بعدها ألف المثنى تُكتب مفردة على السطر.');
      ex = ['جزْءَان', 'ضوْءَان'];
    } else if (s.hv === 'fat' && s.pv === 'suk' && s.sk === 'other' && s.afterS === 'madd') {
      g = 'آ'; title = 'مدًّا (آ)';
      steps.push('الهمزة مفتوحة وقبلها سكون وبعدها ألف مد، فاجتمعت صورتان ألفيتان فدُمجتا في صورة واحدة هي (آ) تخفيفًا واختصارًا.');
      ex = ['مرْآة', 'مرْآب', 'ظمْآن'];
    } else if (s.hv === 'fat' && s.pv === 'fat' && s.after === 'alef') {
      g = 'آ'; title = 'مدًّا (آ)';
      steps.push('الهمزة مفتوحة وقبلها فتحة وبعدها ألف (مد أو تثنية أو جمع)، فاجتمعت صورتان ألفيتان فدُمجتا في صورة واحدة هي (آ) تخفيفًا واختصارًا.');
      ex = ['تَآلف', 'تَآكل', 'خَطَآن', 'مَلجَآن', 'مُنشَآت', 'مُكافَآت'];
    } else {
      const pv = s.pv, hv = s.hv;
      const strong = RANK[hv] >= RANK[pv] ? hv : pv;
      steps.push('ما فيه حالة استثناء، فنطبّق قاعدة أقوى الحركات: الكسرة، ثم الضمة، ثم الفتحة، ثم السكون.');
      steps.push(`أقوى الحركتين (${VNAME[hv]} و${pv === 'suk' ? 'السكون' : VNAME[pv]}) هي ${VNAME[strong]}، و${VNAME[strong]} يناسبها ${{ kas: 'الياء (النبرة)', dam: 'الواو', fat: 'الألف', suk: '— ولا يناسب السكون حرف' }[strong]}.`);
      g = SEAT[strong][0]; title = SEAT[strong][1] + ` (${g})`;
      ex = ({
        kas: { kas: ['قارِئِين', 'مستهزِئِين'], fat: ['سَئِم', 'لَئِيم', 'مطمَئِن'], dam: ['سُئِل', 'رُئِس'], suk: s.sk === 'alif' ? ['تاْئِب', 'ساْئِق', 'قاْئِم'] : ['أفْئِدة', 'أسْئِلة'] }[pv],
        dam: { kas: ['ناشِئُون', 'ينبِّئُهم'], dam: ['رُؤُوس', 'فُؤُوس'], fat: ['يقرَؤُه', 'هَؤُلاء'], suk: s.sk === 'alif' ? ['التثاْؤُب', 'تفاْؤُل', 'تشاْؤُم'] : ['مسْؤُول'] }[pv],
        fat: { kas: ['فِئَة', 'ذِئَاب', 'ناشِئَة'], dam: ['يُؤَاخذ', 'مُؤَسسة'], fat: ['سَأَل', 'دَأَب'], suk: ['مسْأَلة', 'جرْأَة', 'فجْأَة'] }[pv],
        suk: { kas: ['جِئْت', 'ذِئْب', 'بِئْر'], dam: ['مُؤْمن', 'مُؤْتمر'], fat: ['فَأْس', 'رَأْس', 'كَأْس'] }[pv]
      }[hv]) || [];
    }
  } else if (s.pos === 'end') {
    if (!s.ev || (s.ev === 'suk' && !s.esk) || !s.ex) return null;
    steps.push('الهمزة في آخر الكلمة تُكتب على حرف يناسب حركة الحرف الذي قبلها فقط.');
    if (s.ex === 'pro') {
      return { g: 'ـئـ', title: 'صارت همزة متوسطة', steps: steps.concat(['إذا اتصلت بالكلمة زيادة كالضمير، فالهمزة ما تصير متطرفة، وتأخذ حكم الهمزة المتوسطة (قاعدة أقوى الحركات بين حركتها وحركة ما قبلها).', 'اختر «وسط الكلمة» فوق، وحدّد حركة الهمزة الجديدة وحركة ما قبلها.']), ex: ['يملَؤُها', 'تملَئِين', 'شاطِئُكم', 'سماؤُنا', 'سمائِنا'] };
    }
    const base = s.ev;
    g = SEAT[base][0]; title = SEAT[base][1] + ` (${g})`;
    steps.push(`الحرف اللي قبلها ${base === 'suk' ? 'ساكن، والسكون ما يناسبه حرف' : 'عليه ' + VNAME[base] + '، و' + VNAME[base] + ' يناسبها ' + { kas: 'الياء', dam: 'الواو', fat: 'الألف' }[base]}، فتُكتب ${SEAT[base][1]}.`);
    ex = { kas: ['شاطِئ', 'موانِئ', 'مرافِئ'], dam: ['تباطُؤ', 'تنبُّؤ', 'تكافُؤ'], fat: ['مبدَأ', 'خطَأ', 'ملجَأ'], suk: ['دفْء', 'بُطْء', 'فداْء', 'نداْء'] }[base];
    if (s.ex === 'tan') {
      if (base === 'fat' || (base === 'suk' && s.esk === 'alif')) {
        g = base === 'fat' ? 'أً' : 'ءً'; title = 'نكتفي بالتنوين بدون ألف';
        steps.push('الهمزة على ألف أو مفردة على السطر وقبلها ألف مد: نكتفي بالتنوين ولا تحتاج إلى ألف تنوين النصب.');
        ex = ['خطأً', 'مبدأً', 'نبأً', 'هواءً', 'فداءً', 'سماءً'];
      } else if (base === 'kas') {
        g = 'ئًا'; title = 'على نبرتها + ألف التنوين';
        steps.push('الهمزة على نبرة: تُكتب على نبرتها ثم تُزاد ألف التنوين.');
        ex = ['قارئًا', 'بارئًا', 'مبتدئًا', 'شاطئًا', 'هادئًا'];
      } else if (base === 'suk' && s.esk === 'conn') {
        g = 'ئًا'; title = 'على نبرة + ألف التنوين';
        steps.push('الهمزة مفردة على السطر وسبقها حرف يتصل بما بعده: تُكتب على نبرة ثم تُزاد ألف التنوين.');
        ex = ['عبئًا', 'دفئًا', 'بطئًا', 'ملئًا'];
      } else if (base === 'suk' && s.esk === 'disc') {
        g = 'ءًا'; title = 'مفردة + ألف التنوين';
        steps.push('الهمزة مفردة على السطر وسبقها حرف لا يتصل بما بعده (د ذ ر ز و): تُزاد بعد الهمزة ألف تنوين النصب.');
        ex = ['هدوءًا', 'ضوءًا', 'بدءًا'];
      } else {
        note = 'تنوين النصب مع الهمزة على الواو ما ذكره الكتاب في هذا الدرس.';
      }
    } else if (s.ex === 'dual') {
      if (base === 'fat') {
        g = 'آ'; title = 'تُدمجان مدًّا (آ)';
        steps.push('الكلمة منتهية بهمزة على ألف ودخلت عليها ألف الاثنين، فتُدمجان وتُكتبان مدًّا؛ منعًا لتوالي الألفين.');
        ex = ['قرأ ← قرآ', 'بدأ ← بدآ', 'أنشأ ← أنشآ', 'هدأ ← هدآ'];
      } else note = 'الدمج مدًّا (آ) يكون إذا كانت الهمزة المتطرفة على ألف؛ وغير ذلك تصير الهمزة متوسطة بعد الزيادة.';
    }
  }
  if (!g) return null;
  return { g, title, steps, ex, note };
}
function renderHamza() {
  const flow = hzFlow();
  // الخيار الناقص: سؤال قبله ما تجاوب وفيه سؤال بعده متجاوب
  const firstMissing = flow.find(k => HZ[k] === undefined || HZ[k] === null);
  const answeredAfter = firstMissing && flow.slice(flow.indexOf(firstMissing) + 1).some(k => HZ[k] !== undefined && HZ[k] !== null);
  $('hzBox').innerHTML = flow.map(k => `<div class="hz-q ${answeredAfter && k === firstMissing ? 'miss' : ''}" id="hzq-${k}"><b>${HZQ[k].q}</b><div class="seg">${HZQ[k].o.map(([v, t]) => `<button type="button" class="${HZ[k] === v ? 'on' : ''}" data-hk="${k}" data-hv="${v}">${esc(t)}</button>`).join('')}</div></div>`).join('') +
    `<button class="btn btn-quiet btn-sm" type="button" id="hzReset">ابدأ من جديد</button>`;
  $('hzReset').onclick = () => { Object.keys(HZ).forEach(k => delete HZ[k]); renderHamza(); };
  const r = hzSolve();
  if (!r) {
    $('hzOut').innerHTML = answeredAfter
      ? `<div class="panel hz-res" style="margin-top:12px"><p class="note warn" style="margin:0">${ICON('alert')}<span>حدّد أول: <b>${esc(HZQ[firstMissing].q)}</b> (${HZQ[firstMissing].o.map(o => o[1].replace(/ \(.*$/, '')).join('، ')})، وبعدها يطلع لك مكان الهمزة.</span></p></div>`
      : '';
    return;
  }
  if (r.err) { $('hzOut').innerHTML = `<div class="panel hz-res" style="margin-top:12px"><p class="note warn" style="margin:0">${ICON('alert')}<span>${esc(r.err)}</span></p></div>`; return; }
  $('hzOut').innerHTML = `<div class="panel hz-res" style="margin-top:12px">
      <div class="hz-final"><span class="hz-glyph">${esc(r.g)}</span><div><h3>${esc(r.title)}</h3><p>الخطوات حسب قاعدة الكتاب:</p></div></div>
      <ol class="hz-steps">${r.steps.map((t, i) => `<li><i>${i + 1}</i><span>${esc(t)}</span></li>`).join('')}</ol>
      ${r.ex && r.ex.length ? `<div><b>أمثلة من الكتاب</b><div class="hz-ex">${r.ex.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>` : ''}
      ${r.note ? `<p class="note warn" style="margin:0">${ICON('alert')}<span>${esc(r.note)}</span></p>` : ''}
    </div>`;
}
$('hzBox').addEventListener('click', e => {
  const b = e.target.closest('[data-hk]'); if (!b) return;
  const k = b.dataset.hk, v = b.dataset.hv;
  if (k === 'pos' && HZ.pos !== v) Object.keys(HZ).forEach(x => delete HZ[x]);   // تغيير مكان الهمزة يبدأ من جديد
  HZ[k] = v;
  // نحتفظ بباقي اختيارات الطالب، ونشيل بس اللي ما عاد لها سؤال
  const flow = hzFlow();
  Object.keys(HZ).forEach(x => { if (!flow.includes(x)) delete HZ[x]; });
  renderHamza();
});

/* ══════════ صحّح النص ══════════ */
const PROOF = (D.proof || []).map((p, i) => {
  const toks = [];
  const re = /\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]/g;
  let last = 0, m;
  const plain = s => s.split(/(\s+)/).forEach(w => { if (!w) return; toks.push(/^\s+$/.test(w) ? { sp: w } : { w }); });
  while ((m = re.exec(p.text))) { plain(p.text.slice(last, m.index)); toks.push({ w: m[1], right: m[2], why: m[3] }); last = re.lastIndex; }
  plain(p.text.slice(last));
  return { i, title: p.title, toks, n: toks.filter(t => t.right).length };
});
let PRI = 0, PRSEL = new Set(), PRDONE = false;
function renderProof() {
  if (!PROOF.length) { $('prBox').innerHTML = '<p class="empty">قريباً</p>'; return; }
  const p = PROOF[PRI];
  const pick = PROOF.map((x, k) => `<button type="button" data-pk="${k}" class="${k === PRI ? 'on' : (k in LS.proof ? 'done' : '')}" title="${esc(x.title)}" aria-label="فقرة ${k + 1}">${k + 1}</button>`).join('');
  let txt = '', k = 0;
  p.toks.forEach(t => {
    if (t.sp) { txt += t.sp; return; }
    const idx = k++;
    let cls = PRSEL.has(idx) ? 'sel' : '';
    if (PRDONE) cls = t.right ? (PRSEL.has(idx) ? 'hit' : 'miss') : (PRSEL.has(idx) ? 'false' : '');
    txt += `<button type="button" class="pw ${cls}" data-w="${idx}" ${PRDONE ? 'disabled' : ''}>${esc(t.w)}</button>${PRDONE && t.right ? `<small class="fx">(${esc(t.right)})</small>` : ''}`;
  });
  let res = '';
  if (PRDONE) {
    const words = p.toks.filter(t => !t.sp);
    const hits = words.filter((t, j) => t.right && PRSEL.has(j)).length;
    const fals = words.filter((t, j) => !t.right && PRSEL.has(j)).length;
    res = `<div class="pr-res"><div class="fb ${hits === p.n && !fals ? 'ok' : 'no'}"><div class="h">${hits === p.n && !fals ? ICON('check') : ICON('alert')}اكتشفت ${hits} من ${p.n} أخطاء${fals ? `، وحدّدت ${fals} كلمة صحيحة على أنها خطأ` : ''}</div></div>
      <div class="errs">${words.filter(t => t.right).map(t => `<div class="err"><div class="ln"><span class="w">${esc(t.w)}</span>${ICON('next').replace('class="i"', 'class="i ar"')}<span class="r">${esc(t.right)}</span></div><p>${esc(t.why)}</p></div>`).join('')}</div></div>`;
  }
  $('prBox').innerHTML = `<div class="pager">${pick}</div>
    <div class="panel">
      <div class="pr-head"><h3>${esc(p.title)}</h3><span>عدد الأخطاء في الفقرة: ${p.n}</span></div>
      <div class="pr-text">${txt}</div>
      <div class="wacts" style="margin-top:14px">${PRDONE
        ? `<button class="btn btn-pri" type="button" id="prNext">${PRI < PROOF.length - 1 ? 'الفقرة التالية' + ICON('next') : 'من البداية'}</button><button class="btn btn-quiet" type="button" id="prRetry">أعد المحاولة</button>`
        : `<button class="btn btn-pri" type="button" id="prCheck">تحقّق</button><span class="counts" style="margin:0">حدّدت ${PRSEL.size} كلمة</span>`}</div>
      ${res}
    </div>`;
}
$('prBox').addEventListener('click', e => {
  const pk = e.target.closest('[data-pk]');
  if (pk) { PRI = +pk.dataset.pk; PRSEL = new Set(); PRDONE = false; renderProof(); return; }
  const w = e.target.closest('[data-w]');
  if (w && !PRDONE) { const i = +w.dataset.w; PRSEL.has(i) ? PRSEL.delete(i) : PRSEL.add(i); renderProof(); return; }
  if (e.target.closest('#prCheck')) {
    PRDONE = true;
    const p = PROOF[PRI], words = p.toks.filter(t => !t.sp);
    LS.proof[PRI] = words.filter((t, j) => t.right && PRSEL.has(j)).length; save();
    renderProof(); return;
  }
  if (e.target.closest('#prRetry')) { PRSEL = new Set(); PRDONE = false; renderProof(); return; }
  if (e.target.closest('#prNext')) { PRI = (PRI + 1) % PROOF.length; PRSEL = new Set(); PRDONE = false; renderProof(); window.scrollTo(0, 0); }
});

/* ── عام ── */
function confirmBox(title, text, yes, fn) {
  $('mTitle').textContent = title; $('mText').textContent = text; $('mYes').textContent = yes;
  $('modal').hidden = false;
  $('mYes').onclick = () => { $('modal').hidden = true; fn(); };
  $('mNo').onclick = () => { $('modal').hidden = true; };
}
window.confirmBox = confirmBox;
$('resetAll').onclick = () => confirmBox('تمسح كل تقدمك؟', 'بتنمسح إجاباتك وقائمة أخطائك ومسودات فقراتك من هذا الجهاز.', 'إيه، امسح', () => { LS = fresh(); save(); renderHome(); });
document.querySelectorAll('.tg-link').forEach(a => a.href = TELEGRAM_URL);
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('modal').hidden = true; });

renderHome(); show('home');
})();
