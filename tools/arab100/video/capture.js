// يصوّر حالات موقع عرب 100 ميد ويكتب لوحة القصة (storyboard.json) للمونتاج
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname;
const URL = 'http://localhost:8851/';
const SCALE = 1.5;                       // 1280×720 → 1920×1080

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SCALE });
  const p = await ctx.newPage();
  await p.goto(URL); await p.waitForTimeout(1200);
  await p.evaluate(() => document.fonts.ready);
  // بدون حركات انتقال عشان الصور تكون ثابتة
  await p.addStyleTag({ content: '*{transition:none!important;animation:none!important;caret-color:transparent!important} html{scroll-behavior:auto!important}' });

  const views = {}, steps = [];
  let vn = 0;
  const snap = async () => {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(250);
    const id = 'v' + (++vn);
    const file = `${OUT}/views/${id}.png`;
    await p.screenshot({ path: file, fullPage: true });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    const hh = await p.evaluate(() => document.querySelector('header.top').getBoundingClientRect().height);
    views[id] = { file, h, hh };
    return id;
  };
  const rect = async (sel, i = 0, pad = 8) => {
    const r = await p.evaluate(([s, i]) => { const e = document.querySelectorAll(s)[i]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top + scrollY, w: b.width, h: b.height }; }, [sel, i]);
    if (!r) throw new Error('no element ' + sel + ' #' + i);
    return { x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad };
  };
  const rects = async (sels, pad = 8) => {      // مربع يجمع أكثر من عنصر
    const rs = []; for (const [s, i] of sels) rs.push(await rect(s, i, 0));
    const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y));
    const x2 = Math.max(...rs.map(r => r.x + r.w)), y2 = Math.max(...rs.map(r => r.y + r.h));
    return { x: x - pad, y: y - pad, w: x2 - x + 2 * pad, h: y2 - y + 2 * pad };
  };
  const ctr = r => [r.x + r.w / 2, r.y + r.h / 2];
  // خطوة: view, box (مربع التظليل), cur (مكان المؤشر), click, cap (نص الشرح), dur, scroll ('box' = يوسّط المربع)
  const step = o => steps.push(Object.assign({ click: false, scroll: 'auto', dur: 3 }, o));

  // ═════ الرئيسية ═════
  let v = await snap();
  step({ view: v, cur: [640, 380], cap: 'الصفحة <y>الرئيسية</y>: كل أدوات التدريب في مكان واحد', dur: 3.2, scroll: 0 });
  let r = await rect('.hero-side', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: 'هنا <y>تقدّمك</y>: عدد إجاباتك، ودقّتك، والأسئلة اللي تحتاج مراجعة', dur: 4, scroll: 0 });
  r = await rect('#nav', 0, 2);
  step({ view: v, box: r, cur: [r.x + r.w - 120, r.y + r.h / 2], cap: 'و<y>القوائم</y> كلها فوق، تتنقل بينها من أي صفحة', dur: 3.6, scroll: 0 });
  r = await rect('.tools', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: 'أو تدخل أي قسم من <y>أدوات التدريب</y>', dur: 3.2, scroll: 'box' });

  // ═════ الدروس والقواعد ═════
  r = await rect('#nav [data-nav="rules"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="rules"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#lesList', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«الدروس والقواعد»</y>: دروس جزئية الميد الثمانية بترتيب الكتاب', dur: 3.4, scroll: 0 });
  r = await rect('#lesList [data-les="2"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#lesList [data-les="2"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('.rc', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>بطاقات</y> تلخّص كل قاعدة واستثناءاتها، بأمثلة الكتاب وحركاته', dur: 4.2, scroll: 0 });
  r = await rect('.rc', 4, 6);
  step({ view: v, box: r, cur: ctr(r), dur: 2.6, scroll: 'box' });

  // ═════ تدرّب بالدرس ═════
  r = await rect('#nav [data-nav="practice"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="practice"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#lesList [data-les="8"]', 0, 4);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«تدرّب بالدرس»</y>: لكل درس قائمة أسئلة صح وخطأ واختيار من متعدد', dur: 3.6, scroll: 0 });
  step({ view: v, cur: ctr(r), click: true, dur: 0.6, scroll: 0 });
  await p.click('#lesList [data-les="8"]'); await p.waitForTimeout(300);
  // نروح لسؤال عبارته خاطئة عشان يطلع «التصحيح»
  for (let i = 0; i < 20; i++) {
    const isF = await p.evaluate(() => { const c = document.querySelector('#qCard'); return /صح أو خطأ/.test(c.textContent); });
    const q = await p.evaluate(() => { const q = window.__q; return null; });
    if (isF) {
      // نتأكد إن الجواب «خطأ» (عبارة خاطئة) بتجربة على نسخة: نقرأ البيانات
      const ok = await p.evaluate(() => { const t = document.querySelector('#qCard .qtext').textContent.trim(); const q = DATA.questions.find(x => x.q.trim() === t); return q && q.t === 'tf' && !!q.c; });
      if (ok) break;
    }
    await p.click('#qNext'); await p.waitForTimeout(80);
  }
  v = await snap();
  r = await rect('#qCard', 0, 6);
  step({ view: v, box: r, cur: [r.x + r.w * 0.3, r.y + r.h * 0.45], cap: 'اقرأ السؤال واختر إجابتك', dur: 2.8, scroll: 0 });
  // نضغط «خطأ»
  const fIdx = await p.evaluate(() => [...document.querySelectorAll('#qCard .opt')].findIndex(o => /خطأ/.test(o.textContent)));
  r = await rect('#qCard .opt', fIdx, 2);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click(`#qCard .opt >> nth=${fIdx}`); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#qCard .fb', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: 'أول ما تجاوب يطلع لك <y>الصح</y>، و<y>التصحيح</y> للعبارة الخاطئة، و<y>التوضيح</y>', dur: 5.2, scroll: 'box' });

  // ═════ اذكر مثالًا ═════
  r = await rect('#nav [data-nav="examples"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="examples"]'); await p.waitForTimeout(300);
  await p.click('#lesList [data-les="2"]'); await p.waitForTimeout(300);
  await p.fill('#xIn', 'ذئب');
  v = await snap();
  r = await rect('#xCard', 0, 6);
  step({ view: v, box: r, cur: ctr(await rect('#xIn', 0, 0)), cap: '<y>«اذكر مثالًا»</y>: تكتب مثالك بنفسك، مو لازم مثال الكتاب', dur: 3.8, scroll: 0 });
  r = await rect('#xCheck', 0, 2);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#xCheck'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#xCard .fb', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: 'ويتصحّح <y>بمرونة</y>، مع أمثلة الكتاب والتوضيح', dur: 4, scroll: 'box' });

  // ═════ كتابة الفقرة ═════
  r = await rect('#nav [data-nav="write"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="write"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#wChoose', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«كتابة الفقرة»</y>: تكتب فقرتك وتتصحّح، أو تصحّح فقرة جاهزة', dur: 4, scroll: 0 });
  r = await rect('#wChoose [data-wm="write"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#wChoose [data-wm="write"]'); await p.waitForTimeout(200);
  await p.click('#wTopics [data-t="t1"]');
  const para = 'يؤدي الفرد دورًا مهمًّا في بناء مجتمعه وتقدّمه. فهو يلتزم بالأنظمة، ويحافظ على الممتلكات العامة. كما أنه يشارك في الأعمال التطوعية ويساعد المحتاجين. بالإضافة إلى ذلك، يتقن عمله ويخلص فيه. لذلك يعد الفرد الواعي أساس نهضة المجتمع.';
  await p.fill('#wText', para); await p.waitForTimeout(200);
  v = await snap();
  r = await rects([['#wTopics', 0], ['#wText', 0]], 10);
  step({ view: v, box: r, cur: ctr(await rect('#wTopics', 0, 0)), cap: 'تختار <y>الموضوع</y> و<y>عدد الجمل</y> اللي طلبها الدكتور، وتكتب فقرتك', dur: 4.4, scroll: 'box' });
  r = await rect('#wCheck', 0, 2);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 'box', box: null, focus: r });
  await p.click('#wCheck'); await p.waitForSelector('.res-card'); await p.waitForTimeout(400);
  v = await snap();
  r = await rect('.res-card', 0, 6);
  const rTop = { x: r.x, y: r.y, w: r.w, h: Math.min(r.h, 520) };
  step({ view: v, box: rTop, cur: ctr(rTop), cap: 'ويطلع لك <y>التصحيح حسب شروط الكتاب</y>: درجة، وبناء الفقرة، وشروطها', dur: 5, scroll: 'box' });

  // ═════ صحّح فقرة جاهزة ═════
  await p.evaluate(() => window.scrollTo(0, 0));
  r = await rect('#wSwitch [data-wm="fix"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#wSwitch [data-wm="fix"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#wFix .fx-topics', 0, 6);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«صحّح فقرة جاهزة»</y>: فقرات عن الفرد والقائد، أو <y>فقرة عشوائية</y>', dur: 4, scroll: 0 });
  r = await rects([['#wFix .fx-steps', 0], ['#wFix .fx-text', 0]], 10);
  step({ view: v, box: r, cur: ctr(await rect('#wFix .fx-steps', 0, 0)), cap: 'تصحّح <y>علامات الترقيم</y>، و<y>الأخطاء اللغوية</y>، و<y>بناء الفقرة</y>', dur: 4.2, scroll: 'box' });
  // نحل الفقرة صح: الخانات، ثم الكلمات الغلط، ثم أسئلة البناء
  const plan = await p.evaluate(() => { const f = FixPara.ALL[0]; let wi = 0; const slots = [], words = [];
    f.toks.forEach(t => { if (t.sp !== undefined) return; if (t.slot !== undefined) { slots.push([t.slot, t.c]); return; } if (t.err !== undefined) words.push(wi); wi++; });
    return { slots, words, nq: f.qs.length }; });
  for (const [sl, c] of plan.slots) { await p.click(`#wFix [data-slot="${sl}"]`); await p.click(`#wFix [data-mark="${c}"]`); }
  await p.click('#wFix .fx-steps [data-mode="w"]');
  for (const w of plan.words) await p.click(`#wFix [data-w="${w}"]`);
  await p.click('#wFix .fx-steps [data-mode="s"]');
  for (let k = 0; k < plan.nq; k++) { const j = await p.evaluate(k => FixPara.ALL[0].qs[k]._o.findIndex(o => o.ok), k); await p.click(`#wFix [data-q="${k}"][data-o="${j}"]`); }
  await p.click('#fxCheck'); await p.waitForTimeout(200);
  if (await p.isVisible('#mYes')) await p.click('#mYes');
  await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#wFix .fx-score', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: 'وبعدين تطلع لك <y>درجتك</y>، والتوضيح لكل خطأ، والفقرة بعد التصحيح', dur: 4.2, scroll: 'box' });

  // ═════ محاكاة الميد ═════
  r = await rect('#nav [data-nav="exam"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="exam"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#exFacts', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«محاكاة الميد»</y>: 30 سؤالًا في 50 دقيقة، والتصحيح في الأخير', dur: 4.4, scroll: 0 });

  // ═════ مراجعة أخطائي ═════
  r = await rect('#nav [data-nav="review"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="review"]'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('#revBox', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«مراجعة أخطائي»</y>: كل سؤال غلطت فيه ينحفظ هنا، لين تجاوبه صح مرتين', dur: 4.2, scroll: 0 });

  // ═════ محلّل الهمزة ═════
  r = await rect('#nav [data-nav="hamza"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="hamza"]'); await p.waitForTimeout(300);
  for (const [k, val] of [['pos', 'mid'], ['hv', 'fat'], ['pv', 'kas']]) {
    v = await snap();
    r = await rect(`[data-hk="${k}"][data-hv="${val}"]`, 0, 3);
    step({ view: v, cur: ctr(r), click: true, dur: k === 'pos' ? 1.6 : 0.8, scroll: 0, cap: k === 'pos' ? '<y>«محلّل الهمزة»</y>: حدّد مكان الهمزة وحركتها وحركة ما قبلها' : undefined });
    await p.click(`[data-hk="${k}"][data-hv="${val}"]`); await p.waitForTimeout(150);
  }
  v = await snap();
  r = await rect('.hz-res', 0, 6);
  step({ view: v, box: { x: r.x, y: r.y, w: r.w, h: Math.min(r.h, 330) }, cur: ctr(r), cap: 'ويطلع لك <y>كيف تنكتب</y> خطوة بخطوة بقواعد الكتاب (مثل: فِئَة)', dur: 5, scroll: 'box' });

  // ═════ صحّح النص ═════
  r = await rect('#nav [data-nav="proof"]', 0, 4);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 0 });
  await p.click('#nav [data-nav="proof"]'); await p.waitForTimeout(300);
  // نضغط على الكلمات الخطأ في أول فقرة
  const wrongIdx = await p.evaluate(() => { const ws = [...document.querySelectorAll('.pw')]; const p0 = DATA.proof[0].text; const wrong = [...p0.matchAll(/\[\[([^|]+)\|/g)].map(m => m[1]); return ws.map((w, i) => wrong.includes(w.textContent.trim()) ? i : -1).filter(i => i >= 0).slice(0, 3); });
  v = await snap();
  r = await rect('#prBox .pr-text', 0, 8);
  step({ view: v, box: r, cur: ctr(r), cap: '<y>«صحّح النص»</y>: اضغط على كل كلمة تشوفها خطأ', dur: 3.4, scroll: 'box' });
  for (const wi of wrongIdx) {
    r = await rect('.pw', wi, 2);
    step({ view: v, cur: ctr(r), click: true, dur: 0.7, scroll: 'keep' });
    await p.click(`.pw >> nth=${wi}`); await p.waitForTimeout(120);
    v = await snap();
  }
  r = await rect('#prCheck', 0, 2);
  step({ view: v, cur: ctr(r), click: true, dur: 0.9, scroll: 'keep' });
  await p.click('#prCheck'); await p.waitForTimeout(300);
  v = await snap();
  r = await rect('.pr-res', 0, 6);
  step({ view: v, box: { x: r.x, y: r.y, w: r.w, h: Math.min(r.h, 420) }, cur: ctr(r), cap: 'وبعد «تحقّق» يطلع لك <y>الصواب</y> و<y>السبب</y> لكل خطأ', dur: 4.6, scroll: 'box' });

  fs.writeFileSync(`${OUT}/storyboard.json`, JSON.stringify({ scale: SCALE, vw: 1280, vh: 720, views, steps }, null, 1));
  console.log('views', Object.keys(views).length, 'steps', steps.length, 'seconds', steps.reduce((a, s) => a + s.dur, 0).toFixed(1));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
