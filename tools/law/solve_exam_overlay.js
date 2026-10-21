// يكتب حل الاختبار الفصلي (322 حقق) فوق صفحات الورقة الأصلية: node solve_exam_overlay.js OUT_DIR
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const OUT = process.argv[2]; const FONT = path.join(__dirname, '../statistics/cairo-bold.ttf');
const W = 595.44, H = 842.04;
// صح/خطأ: [x0,x1,top,bottom, الجواب, التصحيح أو null, سطر النقاط top,bottom]
const tf = [
  [84.6,115.6,259.4,273.4,'صح',null,283.1,297.2],
  [247.8,278.8,307.6,321.7,'خطأ','من خصائص نظام التأمينات الاجتماعية أنه نظام إلزامي، فالخضوع له لا يتوقف على إرادة العامل أو صاحب العمل.',331.8,345.8],
  [116.3,151.7,356.3,370.3,'صح',null,380.4,394.4],
  [72.8,104.0,404.9,418.9,'خطأ','لا يُعد المعلم الخاص من عمال المنازل لأن عمله فكري لا مادي، والاستثناء لا يشمل من في حكمهم، فهو غير مستثنى.',430.1,444.1],
  [71.3,98.7,454.6,468.6,'خطأ','لا يُشترط أن يكون نشاط صاحب العمل ربحيًا، فقد يكون جمعية تعاونية أو خيرية.',479.8,493.8],
  [332.8,359.9,529.9,543.9,'خطأ','لا يخضع مطلقًا، وإنما يقتصر خضوعه على فرع المعاشات دون فرعي الأخطار المهنية والتعطل عن العمل.',554.0,568.0],
  [74.9,105.8,578.5,592.5,'صح',null,603.7,617.7],
  [193.8,228.6,628.2,642.2,'خطأ','لا يُشترط العجز الكلي؛ فالمنظم لم يفرق بين العجز الكلي والعجز الجزئي في استحقاق المعاش.',653.4,667.4],
  [66.6,93.9,677.9,691.9,'خطأ','لا يفقد حقوقه، بل يستحق تعويضًا لمرة واحدة يُحسب على أساس مجموع الاشتراكات بعد إعادة تثمينها.',703.5,717.5],
  [87.2,125.9,727.9,742.0,'خطأ','لا يُشترط حكم المحكمة بوفاته؛ فالمفقود يُعامل معاملة من ثبتت وفاته في استحقاق عائلته للمعاش.',753.2,767.2],
];
// الاختيار: دوائر [x0,x1,top,bottom]
const mcq = [
  [66,137,161.6,179.6],
  [78,194,199.8,218.4],[468,511,218.5,236.5],
  [112,308,272.5,290.5],
  [102,232,326.9,344.9],
  [178,395,381.3,400],
  [276,347,456.5,474.6],
  [325,511,531.8,549.9],
  [203,376,569.6,588.4],
  [86,264,644.9,663],
  [140,196,683.1,701.7],
];
const css = `@font-face{font-family:ar;src:url(file://${FONT})}
@page{size:${W}pt ${H}pt;margin:0}html,body{margin:0;background:transparent}
.a{position:absolute;font-family:ar;color:#0b2a6b;font-weight:bold;text-align:center;line-height:1}
.c{position:absolute;font-family:ar;color:#0b2a6b;font-weight:bold;direction:rtl;text-align:right;line-height:1.35}
.c span{background:#fff;padding:0 2pt}
.o{position:absolute;border:1.6pt solid #c2410c;border-radius:999px;box-sizing:border-box}`;
const pages = {
  1: tf.map(([x0,x1,t,b,a,c,dt,db]) => {
    let s = `<div class="a" style="left:${x0}pt;width:${x1-x0}pt;top:${t+1}pt;height:${b-t}pt;font-size:11.5pt;color:${a=='صح'?'#0b2a6b':'#b91c1c'}">${a}</div>`;
    if (c) s += `<div class="c fit" style="left:60pt;width:478pt;bottom:${H-db+1}pt;font-size:11pt"><span>${c}</span></div>`;
    return s;
  }).join(''),
  2: mcq.map(([x0,x1,t,b]) => `<div class="o" style="left:${x0}pt;width:${x1-x0}pt;top:${t}pt;height:${b-t}pt"></div>`).join(''),
};
(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await br.newPage();
  for (const [n, body] of Object.entries(pages)) {
    const f = path.join(OUT, `ov${n}.html`);
    fs.writeFileSync(f, `<html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready);
    // سطر واحد إذا أمكن (حتى 9.5pt)، وإلا سطرين
    const info = await pg.evaluate(() => [...document.querySelectorAll('.fit')].map(d => {
      let fs = 11; const lh = () => d.getBoundingClientRect().height;
      const one = parseFloat(getComputedStyle(d).lineHeight);
      while (lh() > one * 1.3 && fs > 8.75) { fs -= 0.25; d.style.fontSize = fs + 'pt'; }
      return fs + 'pt/' + Math.round(lh() / parseFloat(getComputedStyle(d).lineHeight)) + 'L';
    }));
    console.log('page', n, info.join(' '));
    await pg.pdf({ path: path.join(OUT, `ov${n}.pdf`), preferCSSPageSize: true, printBackground: true });
  }
  await br.close();
})();
