// يرسم الشروح (شريط تحت) والبطاقات (المقدمة، الأجهزة، الخاتمة) كصور PNG بخطوط الموقع
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname;
const sb = JSON.parse(fs.readFileSync(`${OUT}/storyboard.json`, 'utf8'));
const logo = 'data:image/png;base64,' + fs.readFileSync(`${OUT}/logo.png`).toString('base64');
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@600;700;800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=swap">`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box} body{direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif} y{color:#FFC94D}`;

const CARD_BG = `background:radial-gradient(120% 90% at 50% 0%, #2a5486 0%, #1c3d66 40%, #0f2238 100%);`;
const card = inner => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:1920px;height:1080px;${CARD_BG}color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center}
  .logo{width:150px;height:150px;border-radius:34px;background:#fff;display:grid;place-items:center;box-shadow:0 18px 50px rgba(0,0,0,.35)}
  .logo img{width:112px}
  h1{font-family:'Noto Kufi Arabic';font-weight:800;font-size:84px;line-height:1.35}
  .sub{font-size:40px;font-weight:600;color:#dbe6f3;line-height:1.6}
  .tag{display:inline-block;font-family:'Noto Kufi Arabic';font-weight:700;font-size:30px;color:#0f2238;background:#FFC94D;border-radius:999px;padding:6px 30px}
  .chips{display:flex;gap:22px;margin-top:6px}
  .chip{font-family:'Noto Kufi Arabic';font-weight:700;font-size:34px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);border-radius:999px;padding:10px 34px}
  .small{font-size:30px;color:#9fb5cf;font-weight:500}
</style></head><body>${inner}</body></html>`;

const CARDS = {
  intro: card(`<div class="logo"><img src="${logo}"></div>
    <h1>شرح موقع <y>ملازم عدل</y></h1>
    <div class="tag">عرب 100 · مهارات الكتابة · جزئية الميد</div>
    <div class="sub">تدرّب على <y>كل دروس الميد</y>، والتصحيح والتوضيح أول ما تجاوب</div>`),
  device: card(`<h1>على أي جهاز</h1>
    <div class="chips"><span class="chip"><y>اللابتوب</y></span><span class="chip"><y>الآيباد</y></span><span class="chip"><y>الجوال</y></span></div>
    <div class="sub">الموقع يفتح على كل الأجهزة، وتقدّمك ينحفظ على نفس الجهاز</div>`),
  outro: card(`<div class="logo"><img src="${logo}"></div>
    <h1>بالتوفيق للجميع</h1>
    <div class="sub">تدرّب على الدروس، وراجع أخطاءك، وقبل الاختبار جرّب <y>محاكاة الميد</y></div>
    <div class="small">ملازم عدل · موقع خاص بالمشتركين</div>`)
};

const capHtml = t => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  html,body{background:transparent}
  .c{display:inline-block;max-width:1500px;background:rgba(15,28,46,.93);color:#fff;font-weight:700;font-size:40px;line-height:1.55;
     padding:20px 44px 22px;border-radius:22px;box-shadow:0 14px 40px rgba(0,0,0,.35);text-align:center}
  .wrap{width:1920px;display:flex;justify-content:center;padding:30px 0}
</style></head><body><div class="wrap"><div class="c">${t.replace(/<y>/g, '<y>')}</div></div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [k, html] of Object.entries(CARDS)) {
    await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `${OUT}/ovl/${k}.png` });
  }
  const caps = [...new Set(sb.steps.map(s => s.cap).filter(Boolean))];
  const map = {};
  for (let i = 0; i < caps.length; i++) {
    await p.setContent(capHtml(caps[i]), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const el = await p.$('.c'); const f = `${OUT}/ovl/cap${i}.png`;
    await el.screenshot({ path: f, omitBackground: true });
    map[caps[i]] = f;
  }
  fs.writeFileSync(`${OUT}/ovl/caps.json`, JSON.stringify(map, null, 1));
  console.log('cards', Object.keys(CARDS).length, 'captions', caps.length);
  await b.close();
})();
