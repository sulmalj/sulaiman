// جدول تقييم قوة الارتباط (من ملف القسم) — صورة شفافة بلون الملزمة
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de';
const K=t=>katex.renderToString(t,{output:'html'});
const R=[['1','خطي تام'],['0.86<|r|<1','قوي جدًا'],['0.70<|r|\\le 0.86','قوي'],['0.50<|r|\\le 0.70','متوسط القوة'],
 ['0.30<|r|\\le 0.50','ضعيف'],['0<|r|\\le 0.30','ضعيف جدًا'],['0','خطي معدوم']];
const table=`<table><tr><th>القيمة المطلقة لمعامل الارتباط ${K('r')}</th><th>وصف قوة الارتباط</th></tr>
${R.map(([v,d])=>`<tr><td class="m">${K(v)}</td><td>${d}</td></tr>`).join('')}</table>`;
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-600.ttf)}@font-face{font-family:Rx7;src:url(file://${FONTS}/Readex-700.ttf)}
html,body{margin:0;background:transparent}#w{display:inline-block;padding:10px}
.katex{color:${BR};font-size:1.15em;-webkit-text-stroke:0.6px ${BR}}
table{direction:rtl;border-collapse:separate;border-spacing:0;font:30px Rx;color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff}
th{background:${HEAD};font:32px Rx7;padding:18px 34px}
.katex{direction:ltr;unicode-bidi:isolate}td{height:70px;padding:0 34px;text-align:center}
td,th{border-bottom:2px solid ${LINE}} tr:last-child td{border-bottom:none}
td:first-child,th:first-child{border-left:2px solid ${LINE};min-width:420px} td:last-child,th:last-child{min-width:300px}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:3});
const f=`${OUT}/_ts.html`; fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${table}</div></body></html>`);
await p.goto('file://'+f); await p.evaluate(()=>document.fonts.ready);
await (await p.$('#w')).screenshot({path:`${OUT}/جدول تقييم قوة الارتباط.png`,omitBackground:true});
fs.unlinkSync(f); await b.close();})();
