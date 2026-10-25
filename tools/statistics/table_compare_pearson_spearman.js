// جدول المقارنة بين بيرسون وسبيرمان (من ملف القسم) — صورة شفافة بلون الملزمة
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de';
const K=t=>katex.renderToString(t,{output:'html'});
const R=[
 ['التعريف','مقياس يقيس الارتباط الخطي بين متغيرين كميين','مقياس يقيس الارتباط الرتبي بين متغيرين رتبيين (نوعيين أو كميين)'],
 ['نوع البيانات','كمية فقط','رتبية، نوعية أو كمية'],
 ['طبيعة العلاقة','يقيس قوة واتجاه العلاقة الخطية','يقيس قوة واتجاه العلاقة الرتيبة'],
 ['أساس الحساب','يعتمد على القيم الخام وانحرافاتها','يعتمد على رتب القيم وليس القيم ذاتها'],
 ['الحساسية للقيم المنعزلة','عالي الحساسية','أقل حساسية، أكثر متانة'],
 ['التعامل مع المشاهدات المكررة','لا يوجد مفهوم القيم المكررة','يستخدم متوسط الرتب لضمان الدقة عند وجود مشاهدات مكررة'],
 ['العلاقة الخطية','لا يعمل مع العلاقات غير الخطية','يقيس العلاقة الرتيبة حتى لو كانت غير خطية'],
 ['حالة الارتباط التام','تعني أن النقاط تقع على خط مستقيم','تعني أن المتغيرين لهما نفس الترتيب أو عكسه تمامًا'],
 ['حالات التفضيل','يُفضَّل عند دراسة العلاقة الخطية بين متغيرين كميين، في غياب القيم المنعزلة، ومع تحقق افتراض الخطية والتباين','يُفضَّل عند دراسة العلاقة الرتيبة غير الخطية، أو عند وجود قيم منعزلة'],
 ['التحويلات','ثابت عند ضرب أو جمع ثابت','ثابت عند ضرب أو جمع ثابت، ويظل ثابتًا تحت التحويلات الرتيبة أيضًا'],
 ['وحدة القياس','عديم الوحدات','عديم الوحدات'],
 ['المدى',K('[-1,\\,1]'),K('[-1,\\,1]')],
];
const table=`<table><tr><th>وجه المقارنة</th><th>معامل ارتباط بيرسون (${K('r')})</th><th>معامل ارتباط سبيرمان (${K('r_s')})</th></tr>
${R.map(([a,b,c])=>`<tr><th class="h">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</table>`;
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-500.ttf)}@font-face{font-family:Rx7;src:url(file://${FONTS}/Readex-700.ttf)}
html,body{margin:0;background:transparent}#w{display:inline-block;padding:10px}
.katex{color:${BR};direction:ltr;unicode-bidi:isolate;font-size:1.05em}
table{direction:rtl;border-collapse:separate;border-spacing:0;font:34px/1.6 Rx;color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff}
td,th{padding:var(--pv,26px) 22px;text-align:center;vertical-align:middle;border-left:2px solid ${LINE};border-bottom:2px solid ${LINE};font-weight:normal}
tr>*:last-child{border-left:none} tr:last-child>*{border-bottom:none}
tr:first-child th{background:${HEAD};font:36px Rx7;padding:30px 20px}
th.h{background:${HEAD};font-family:Rx7;width:250px;font-size:35px}
td{width:520px;text-wrap:balance}th.h{text-wrap:balance}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:3,viewport:{width:2400,height:1400}});
const f=`${OUT}/_tc.html`; fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${table}</div></body></html>`);
await p.goto('file://'+f); await p.evaluate(()=>document.fonts.ready);
 for(let i=0;i<30;i++){const {w,h}=await p.evaluate(()=>{const r=document.querySelector('table').getBoundingClientRect();return {w:r.width,h:r.height}});
  const need=w*Math.SQRT2-h; if(Math.abs(need)<4) break;
  await p.evaluate(d=>{const pv=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pv'))||26;document.documentElement.style.setProperty('--pv',Math.max(10,pv+d/26)+'px')},need);}
await (await p.$('#w')).screenshot({path:`${OUT}/جدول المقارنة بين بيرسون وسبيرمان.png`,omitBackground:true});
fs.unlinkSync(f); await b.close();})();
