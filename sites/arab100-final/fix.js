/* «صحّح الفقرة» داخل كتابة الفقرة: فقرة فيها أخطاء، والطالب يصححها على ثلاث خطوات:
   1) علامات الترقيم (خانات يختار علامتها)  2) الأخطاء اللغوية (يضغط على الكلمة)  3) بناء الفقرة (اختيار من متعدد)
   ثم «تحقّق» يطلع الدرجة، وكل خطأ مع الصواب والتوضيح، والفقرة بعد التصحيح. */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const IC = n => window.ICON ? ICON(n) : '';
const MARKS = ['،', '؛', '.', ':', '؟', '!', '-'];
const MNAME = { '،': 'الفاصلة (،)', '؛': 'الفاصلة المنقوطة (؛)', '.': 'النقطة (.)', ':': 'النقطتان (:)', '؟': 'علامة الاستفهام (؟)', '!': 'علامة التعجب (!)', '-': 'بدون علامة' };
const showMark = m => m === '-' ? '' : m;

/* تحويل نص الفقرة إلى أجزاء */
function parse(text) {
  const toks = []; const re = /\{\{([^|}]*)\|([^|}]*)\|([^}]*)\}\}|\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]|<<([^>]+)>>/g;
  let last = 0, m, slot = 0, err = 0;
  const plain = (s, off) => s.split(/(\s+)/).forEach(w => { if (!w) return; toks.push(/^\s+$/.test(w) ? { sp: w, off } : { w, off }); });
  while ((m = re.exec(text))) {
    plain(text.slice(last, m.index));
    if (m[1] !== undefined) toks.push({ slot: slot++, c: m[1].trim(), g: m[2].trim(), why: m[3].trim() });
    else if (m[4] !== undefined) toks.push({ err: err++, w: m[4].trim(), r: m[5].trim(), why: m[6].trim() });
    else plain(m[7], true);
    last = re.lastIndex;
  }
  plain(text.slice(last));
  return toks;
}
const ALL = ((window.DATA || {}).fix || []).map((f, i) => Object.assign({ i, toks: parse(f.text) }, f));

const FTOP = [{ id: 't1', title: 'أهمية دور الفرد في المجتمع' }, { id: 't2', title: 'دور القائد في مهنته ومؤسسته' }, { id: 'rnd', title: 'فقرة عشوائية', sub: 'من أي موضوع' }];
const topicName = id => (FTOP.find(t => t.id === id) || {}).title || '';
let FT = 't1', FI = 0, ST = null, mode = 'p', done = false, menuSlot = null;
const inTopic = () => ALL.filter(f => FT === 'rnd' || f.topic === FT);
/* فقرة عشوائية: نفضّل اللي ما حلّها الطالب، وغير الفقرة الحالية */
function randomFI() {
  const L = (window.APP && APP.LS.fix) || {};
  let pool = ALL.filter(f => f.i !== FI && !(f.i in L));
  if (!pool.length) pool = ALL.filter(f => f.i !== FI);
  if (!pool.length) pool = ALL;
  return pool[Math.floor(Math.random() * pool.length)].i;
}
function pickTopic(id) {
  FT = id;
  if (id === 'rnd') FI = randomFI();
  else { const L = (window.APP && APP.LS.fix) || {}; const list = inTopic(); FI = (list.find(f => !(f.i in L)) || list[0] || ALL[0]).i; }
  ALL[FI].qs.forEach(q => delete q._o); reset();
}
function reset() {
  const f = ALL[FI];
  ST = { pick: {}, words: new Set(), ans: {} };
  f.toks.forEach(t => { if (t.slot !== undefined) ST.pick[t.slot] = t.g; });
  mode = 'p'; done = false; menuSlot = null;
}
function correctedText(f) {
  let out = '';
  f.toks.forEach(t => {
    if (t.off) return;
    if (t.sp !== undefined) out += t.sp;
    else if (t.slot !== undefined) out += showMark(t.c);
    else if (t.err !== undefined) out += t.r;
    else out += t.w;
  });
  out = out.replace(/\s+([،؛:.!؟])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  if (f.add) out += ' ' + f.add;
  return out;
}

function render() {
  const box = $('wFix'); if (!box) return;
  if (!ALL.length) { box.innerHTML = '<p class="empty">قريباً</p>'; return; }
  const f = ALL[FI];
  const LS = window.APP ? APP.LS : {};
  const tabs = `<div class="topics fx-topics">${FTOP.map(t => `<button type="button" class="topic ${t.id === FT ? 'on' : ''}" data-ft="${t.id}">${esc(t.title)}<small>${t.sub || (ALL.filter(f => f.topic === t.id).length + ' فقرة')}</small></button>`).join('')}</div>`;
  const pick = FT === 'rnd'
    ? `<div class="fx-rnd"><span>فقرة عشوائية من موضوع: <b>${esc(topicName(f.topic))}</b></span><button class="btn btn-quiet" type="button" id="fxRnd">${IC('redo')}فقرة عشوائية ثانية</button></div>`
    : `<div class="pager">${inTopic().map((x, k) => `<button type="button" data-fk="${x.i}" class="${x.i === FI ? 'on' : (LS.fix && x.i in LS.fix ? 'done' : '')}" aria-label="فقرة ${k + 1}">${k + 1}</button>`).join('')}</div>`;
  // النص
  let wi = 0, txt = '';
  f.toks.forEach(t => {
    if (t.sp !== undefined) { txt += t.sp; return; }
    if (t.slot !== undefined) {
      const p = ST.pick[t.slot];
      let cls = 'slot';
      if (done) cls += p === t.c ? ' ok' : ' no';
      else if (mode === 'p') cls += ' act';
      if (p === '-') cls += ' empty';
      const label = done && p !== t.c ? `${showMark(p) || '∅'}<sup>${showMark(t.c) || '∅'}</sup>` : (showMark(p) || '&nbsp;');
      txt += `<button type="button" class="${cls}" data-slot="${t.slot}" ${done || mode !== 'p' ? 'tabindex="-1"' : ''} aria-label="خانة ترقيم">${label}</button>`;
      if (!done && mode === 'p' && menuSlot === t.slot) txt += `<span class="mmenu">${MARKS.map(m => `<button type="button" data-mark="${m}" class="${p === m ? 'on' : ''}">${m === '-' ? 'بدون' : m}</button>`).join('')}</span>`;
      return;
    }
    const idx = wi++;
    const isErr = t.err !== undefined;
    const sel = ST.words.has(idx);
    let cls = 'fw';
    if (done) cls += isErr ? (sel ? ' hit' : ' miss') : (sel ? ' false' : '');
    else if (mode === 'w') cls += ' act' + (sel ? ' sel' : '');
    const inner = esc(t.w) + (done && isErr ? `<small class="fx">(${esc(t.r)})</small>` : '');
    txt += (mode === 'w' && !done) ? `<button type="button" class="${cls}" data-w="${idx}">${inner}</button>` : `<span class="${cls}">${inner}</span>`;
  });
  const nSlots = f.toks.filter(t => t.slot !== undefined).length, nErr = f.toks.filter(t => t.err !== undefined).length;
  const steps = [['p', '1', 'علامات الترقيم', `اضغط على كل خانة واختر العلامة الصحيحة (أو «بدون»). فيه ${nSlots} خانات، بعضها صحيحة أصلًا.`],
                 ['w', '2', 'الأخطاء اللغوية', `اضغط على كل كلمة تشوفها خطأ (إملاء أو خطأ شائع). عدد الأخطاء: ${nErr}.`],
                 ['s', '3', 'بناء الفقرة', 'جاوب عن أسئلة بناء الفقرة تحت.']];
  let qs = '';
  f.qs.forEach((q, k) => {
    const opts = q._o || (q._o = shuffle(q.o.map((t, i) => ({ t, ok: i === 0 }))));
    qs += `<div class="fq"><p class="fqq">${k + 1}. ${esc(q.q)}</p><div class="opts">${opts.map((o, j) => {
      let c = ''; const a = ST.ans[k];
      if (done) { if (o.ok) c = 'ok'; else if (a === j) c = 'no'; } else if (a === j) c = 'sel';
      return `<button type="button" class="opt ${c}" data-q="${k}" data-o="${j}" ${done ? 'disabled' : ''}><span>${esc(o.t)}</span></button>`;
    }).join('')}</div>${done ? `<div class="fb ${ST.ans[k] !== undefined && opts[ST.ans[k]].ok ? 'ok' : 'no'}"><div class="h">${ST.ans[k] !== undefined && opts[ST.ans[k]].ok ? IC('check') + 'إجابة صحيحة' : IC('x') + 'الصحيحة: ' + esc(q.o[0])}</div><span class="corr"><b>التوضيح:</b> ${esc(q.x)}</span></div>` : ''}</div>`;
  });
  let res = '';
  if (done) {
    const slots = f.toks.filter(t => t.slot !== undefined);
    const sOk = slots.filter(t => ST.pick[t.slot] === t.c).length;
    let k = 0; const words = f.toks.filter(t => t.sp === undefined && t.slot === undefined).map(t => Object.assign({ idx: k++ }, t));
    const errs = words.filter(t => t.err !== undefined);
    const hits = errs.filter(t => ST.words.has(t.idx)).length;
    const fals = words.filter(t => t.err === undefined && ST.words.has(t.idx));
    const qOk = f.qs.filter((q, i) => ST.ans[i] !== undefined && q._o[ST.ans[i]].ok).length;
    res = `<div class="fx-score">
        <div><b>${sOk}/${slots.length}</b><span>علامات الترقيم</span></div>
        <div><b>${hits}/${errs.length}</b><span>الأخطاء اللغوية</span></div>
        <div><b>${qOk}/${f.qs.length}</b><span>بناء الفقرة</span></div></div>
      <div class="lbl-h">علامات الترقيم</div>
      <div class="errs">${slots.map(t => { const p = ST.pick[t.slot], ok = p === t.c; return `<div class="err"><div class="ln">${ok ? `<span class="r">${IC('check')} ${MNAME[t.c]}</span>` : `<span class="w">${MNAME[p]}</span>${IC('next').replace('class="i"', 'class="i ar"')}<span class="r">${MNAME[t.c]}</span>`}${t.g === t.c ? '<span class="ty">كانت صحيحة أصلًا</span>' : ''}</div><p>${esc(t.why)}</p></div>`; }).join('')}</div>
      <div class="lbl-h">الأخطاء اللغوية</div>
      <div class="errs">${errs.map(t => `<div class="err"><div class="ln"><span class="w">${esc(t.w)}</span>${IC('next').replace('class="i"', 'class="i ar"')}<span class="r">${esc(t.r)}</span>${ST.words.has(t.idx) ? '<span class="ty">اكتشفته</span>' : '<span class="ty miss">فاتك</span>'}</div><p>${esc(t.why)}</p></div>`).join('')}
      ${fals.length ? `<div class="err"><div class="ln"><span>حدّدت كلمات صحيحة على أنها خطأ:</span></div><p>${fals.map(t => esc(t.w)).join('، ')}</p></div>` : ''}</div>
      <div class="lbl-h">الفقرة بعد التصحيح</div>
      <div class="ptext fixed">${esc(correctedText(f))}</div>`;
  }
  box.innerHTML = `${tabs}${pick}
    <div class="panel fx-card">
      <div class="pr-head"><h3>${esc(f.title)}<span class="fx-tag">${esc(topicName(f.topic))}</span></h3><span>صحّح الفقرة على ثلاث خطوات، وبعدين اضغط «تحقّق»</span></div>
      ${done ? '' : `<div class="fx-steps">${steps.map(([m, n, t]) => `<button type="button" data-mode="${m}" class="${mode === m ? 'on' : ''}"><span class="sn">${n}</span>${t}</button>`).join('')}</div>
      <p class="fx-hint">${steps.find(s => s[0] === mode)[3]}</p>`}
      <div class="pr-text fx-text ${mode === 's' && !done ? 'dim' : ''}">${txt}</div>
      ${mode === 's' || done ? `<div class="fqs">${qs}</div>` : ''}
      <div class="wacts" style="margin-top:16px">${done
        ? `<button class="btn btn-pri" type="button" id="fxNext">${FT === 'rnd' ? 'فقرة عشوائية ثانية' : 'الفقرة التالية'}${IC('next')}</button><button class="btn btn-quiet" type="button" id="fxRetry">أعد المحاولة</button>`
        : `${mode !== 's' ? `<button class="btn btn-quiet" type="button" data-mode="${mode === 'p' ? 'w' : 's'}">الخطوة التالية${IC('next')}</button>` : ''}<button class="btn btn-pri" type="button" id="fxCheck">تحقّق</button>`}</div>
      ${res}
    </div>`;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

document.addEventListener('click', e => {
  const box = $('wFix'); if (!box || !box.contains(e.target)) return;
  const ft = e.target.closest('[data-ft]');
  if (ft) { pickTopic(ft.dataset.ft); render(); return; }
  if (e.target.closest('#fxRnd')) { FI = randomFI(); ALL[FI].qs.forEach(q => delete q._o); reset(); render(); return; }
  const fk = e.target.closest('[data-fk]');
  if (fk) { FI = +fk.dataset.fk; ALL[FI].qs.forEach(q => delete q._o); reset(); render(); return; }
  const md = e.target.closest('[data-mode]');
  if (md && !done) { mode = md.dataset.mode; menuSlot = null; render(); return; }
  const sl = e.target.closest('[data-slot]');
  if (sl && mode === 'p' && !done) { const s = +sl.dataset.slot; menuSlot = menuSlot === s ? null : s; render(); return; }
  const mk = e.target.closest('[data-mark]');
  if (mk && menuSlot !== null) { ST.pick[menuSlot] = mk.dataset.mark; menuSlot = null; render(); return; }
  const w = e.target.closest('[data-w]');
  if (w && mode === 'w' && !done) { const i = +w.dataset.w; ST.words.has(i) ? ST.words.delete(i) : ST.words.add(i); render(); return; }
  const o = e.target.closest('[data-q]');
  if (o && !done) { ST.ans[+o.dataset.q] = +o.dataset.o; render(); return; }
  if (e.target.closest('#fxCheck')) {
    const f = ALL[FI];
    const left = f.qs.length - Object.keys(ST.ans).length;
    const go = () => { done = true; menuSlot = null; const L = window.APP && APP.LS; if (L) { L.fix = L.fix || {}; L.fix[FI] = 1; APP.save(); } render(); };
    if (left && window.confirmBox) confirmBox('تتحقق الحين؟', `باقي ${left} من أسئلة «بناء الفقرة» ما جاوبتها (الخطوة 3)، وبتنحسب خطأ.`, 'إيه، تحقّق', go);
    else go();
    return;
  }
  if (e.target.closest('#fxRetry')) { ALL[FI].qs.forEach(q => delete q._o); reset(); render(); return; }
  if (e.target.closest('#fxNext')) {
    if (FT === 'rnd') FI = randomFI();
    else { const list = inTopic(), k = list.findIndex(x => x.i === FI); FI = list[(k + 1) % list.length].i; }
    ALL[FI].qs.forEach(q => delete q._o); reset(); render(); window.scrollTo(0, 0);
  }
});

/* أول ما يدخل: يختار «اكتب فقرتك» أو «صحّح فقرة جاهزة»، وبعدها يقدر يبدّل من الشريط */
const HEAD = {
  choose: 'وش تبي تسوي؟ اختر طريقة التدريب.',
  write: 'اختر الموضوع، وحدّد عدد الجمل، واكتب فقرتك. يطلع لك التصحيح حسب شروط الكتاب: بناء الفقرة، وشروطها، والأخطاء مع شرحها.',
  fix: 'اختر الموضوع، وصحّح الفقرة: علامات الترقيم، والأخطاء اللغوية، وبناء الفقرة. وبعدين يطلع لك التصحيح مع التوضيح.'
};
function setMode(m) {
  document.querySelectorAll('#wSwitch button').forEach(b => b.classList.toggle('on', b.dataset.wm === m));
  $('wChoose').hidden = m !== 'choose'; $('wSwitch').hidden = m === 'choose';
  $('wWrite').hidden = m !== 'write'; $('wFix').hidden = m !== 'fix';
  $('wHeadP').textContent = HEAD[m];
  if (m === 'fix') { if (!ST) pickTopic(FT); render(); }
  if (m !== 'choose') window.scrollTo(0, 0);
}
$('wChoose').addEventListener('click', e => { const b = e.target.closest('[data-wm]'); if (b) setMode(b.dataset.wm); });
$('wSwitch').addEventListener('click', e => { const b = e.target.closest('[data-wm]'); if (b) setMode(b.dataset.wm); });
window.FixPara = { setMode, parse, correctedText, ALL };
})();
