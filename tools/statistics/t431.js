// تدريب 4.3.1 (ملف القسم ص11): السؤال بدون حل + مع الحل + أجزاؤه — صور شفافة بلون الملزمة
// الفقرة 6 في ملف القسم (رسم المستقيم) انضمت للفقرة 4، وفقرة معامل التحديد انشالت (بتنحط في الدرس اللي بعده) — طلب المستخدم
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de', BOX='#b0453a', GRID='#d9c9bd', PT='#b0453a', STEP='#9a3412', LN='#1f5f8b';
const K=(t,d)=>katex.renderToString(t,{output:'html',displayMode:!!d});
const X=[3,2,5,1,4], Y=[2,1,3,-2,1], n=X.length;
const rows=X.map((x,i)=>[x,Y[i],x*Y[i],x*x,Y[i]*Y[i]]);
const S=[0,1,2,3,4].map(j=>rows.reduce((a,r)=>a+r[j],0));            // 15 5 25 55 19
const num=n*S[2]-S[0]*S[1], dx=n*S[3]-S[0]**2, dy=n*S[4]-S[1]**2;      // 50 50 70
const r=num/Math.sqrt(dx*dy), b=num/dx, xb=S[0]/n, yb=S[1]/n, a=yb-b*xb, y15=a+b*1.5;
const tr=(v,d)=>(Math.trunc(v*10**d+1e-9*Math.sign(v))/10**d).toFixed(d);
const r4=tr(r,4), r2v=(+r4)**2;
console.log({S,num,dx,dy,r,b,a,y15,r4,r2v});
const sg=v=>v<0?`(${v})`:`${v}`;
// جدول البيانات (مثل ملف القسم)
const data=`<table class="t"><tr><th class="h">${K('X')}</th>${X.map(x=>`<td>${K(String(x))}</td>`).join('')}</tr>
<tr><th class="h">${K('Y')}</th>${Y.map(y=>`<td>${K(String(y))}</td>`).join('')}</tr></table>`;
// جدول الحسابات
const calc=`<table class="t c"><tr class="hd">${['x_i','y_i','x_iy_i','x_i^{2}','y_i^{2}'].map(h=>`<th>${K(h)}</th>`).join('')}</tr>
${rows.map(rw=>`<tr>${rw.map(v=>`<td>${K(String(v))}</td>`).join('')}</tr>`).join('')}
<tr class="s">${S.map(v=>`<td>${K('\\Sigma='+v)}</td>`).join('')}</tr></table>`;
// لوحة الانتشار: النقاط (+ المستقيم)
function grid(pts,line){
 const W=700,H=600,l=78,rr=60,t=60,bm=62, X0=0,X1=6,Y0=-3,Y1=4;
 const xs=v=>l+(v-X0)*(W-l-rr)/(X1-X0), ys=v=>H-bm-(v-Y0)*(H-t-bm)/(Y1-Y0); let g='';
 for(let k=X0*2;k<=X1*2;k++){const v=k/2;g+=`<line x1="${xs(v)}" x2="${xs(v)}" y1="${ys(Y0)}" y2="${ys(Y1)}" stroke="${GRID}" stroke-width="${k%2?1:1.6}"/>`;}
 for(let k=Y0*2;k<=Y1*2;k++){const v=k/2;g+=`<line x1="${xs(X0)}" x2="${xs(X1)}" y1="${ys(v)}" y2="${ys(v)}" stroke="${GRID}" stroke-width="${k%2?1:1.6}"/>`;}
 // المحاور: الأفقي عند Y=0 والرأسي عند X=0
 g+=`<line x1="${xs(X0)}" x2="${xs(X1)+18}" y1="${ys(0)}" y2="${ys(0)}" stroke="${BR}" stroke-width="3.5"/><line x1="${xs(0)}" x2="${xs(0)}" y1="${ys(Y0)}" y2="${ys(Y1)-18}" stroke="${BR}" stroke-width="3.5"/>`;
 g+=`<path d="M${xs(X1)+30},${ys(0)} l-14,-7 v14z" fill="${BR}"/><path d="M${xs(0)},${ys(Y1)-30} l-7,14 h14z" fill="${BR}"/>`;
 for(let v=1;v<=X1;v++) g+=`<text x="${xs(v)}" y="${ys(0)+32}" text-anchor="middle" class="n">${v}</text>`;
 for(let v=Y0;v<=Y1;v++) if(v) g+=`<text x="${xs(0)-14}" y="${ys(v)+9}" text-anchor="end" class="n">${v<0?'−'+(-v):v}</text>`;
 g+=`<text x="${xs(0)-14}" y="${ys(0)+32}" text-anchor="end" class="n">0</text>`;
 g+=`<text x="${xs(X1)+40}" y="${ys(0)+10}" class="ax">X</text><text x="${xs(0)-10}" y="${ys(Y1)-38}" class="ax">Y</text>`;
 if(line){g+=`<line x1="${xs(0)}" y1="${ys(a)}" x2="${xs(6)}" y2="${ys(a+6*b)}" stroke="${LN}" stroke-width="4.5"/>`;
  g+=`<circle cx="${xs(xb)}" cy="${ys(yb)}" r="10" fill="#fff" stroke="${LN}" stroke-width="4"/><circle cx="${xs(0)}" cy="${ys(a)}" r="10" fill="#fff" stroke="${LN}" stroke-width="4"/>`;
  g+=`<text x="${xs(xb)+16}" y="${ys(yb)+34}" class="lb">(x̄, ȳ) = (3, 1)</text><text x="${xs(0)+18}" y="${ys(a)+32}" class="lb">(0, −2)</text>`;
  g+=`<text x="${xs(0.3)}" y="${ys(3.45)}" class="lq">Ŷ = −2 + X</text>`;}
 if(pts) X.forEach((x,i)=>{g+=`<circle cx="${xs(x)}" cy="${ys(Y[i])}" r="10" fill="${PT}" stroke="#fff" stroke-width="2"/>`;});
 return `<svg width="${W+40}" height="${H}" viewBox="0 0 ${W+40} ${H}">${g}</svg>`;}
const box=v=>`\\fcolorbox{${BOX}}{transparent}{$\\;${v}\\;$}`;
const eq=t=>`<div class="eq">${K(t,1)}</div>`;
const eqs=t=>`<div class="eq sm">${K(t,1)}</div>`;
// الحلول
const solR=eqs(String.raw`r=\dfrac{n\sum x_iy_i-\sum x_i\sum y_i}{\sqrt{n\sum x_i^{2}-\left(\sum x_i\right)^{2}}\;\sqrt{n\sum y_i^{2}-\left(\sum y_i\right)^{2}}}
=\dfrac{${n}(${S[2]})-(${S[0]})(${S[1]})}{\sqrt{${n}(${S[3]})-(${S[0]})^{2}}\;\sqrt{${n}(${S[4]})-(${S[1]})^{2}}}=${box(tr(r,2))}`);
const solType=`<div class="ans"><span>ارتباط خطي طردي قوي</span></div>`;
const solB=eq(String.raw`b=\dfrac{n\sum x_iy_i-\sum x_i\sum y_i}{n\sum x_i^{2}-\left(\sum x_i\right)^{2}}=\dfrac{${n}(${S[2]})-(${S[0]})(${S[1]})}{${n}(${S[3]})-(${S[0]})^{2}}=${b}`)
 +eq(String.raw`\bar{x}=\dfrac{\sum x_i}{n}=\dfrac{${S[0]}}{${n}}=${xb}\qquad\quad \bar{y}=\dfrac{\sum y_i}{n}=\dfrac{${S[1]}}{${n}}=${yb}`)
 +eq(String.raw`a=\bar{y}-b\,\bar{x}=${yb}-${b}(${xb})=${a}`)
 +eq(String.raw`${box(`\\hat{Y}=${a}+X`)}`)
 +`<p class="note">لرسم المستقيم نعيّن نقطتين عليه، مثل ${K('(0,\\,-2)')} و ${K('(\\bar{x},\\,\\bar{y})=(3,\\,1)')}، ثم نصل بينهما:</p>`
 +`<div class="g">${grid(true,true)}</div>`;
const solY=eq(String.raw`\hat{y}=${a}+1.5=${box(String(y15))}`);
const solR2=eq(String.raw`r^{2}=(${r4})^{2}=${box(tr(r2v,2))}`);
const Q=[
 ['مثّل البيانات على لوحة الانتشار.', `<div class="g">${grid(false,false)}</div>`, `<div class="g">${grid(true,false)}</div>`],
 [`احسب معامل ارتباط بيرسون ${K('r')}.`, '', `<div class="g">${calc}</div>${solR}`],
 ['حدد نوع الارتباط وقيّم قوته.', '', solType],
 [`أوجد معادلة مستقيم انحدار ${K('Y')} على ${K('X')}، ثم ارسمه على لوحة الانتشار في الفقرة (1).`, '', solB],
 [`استخدم معادلة الانحدار لتقدير القيمة ${K('\\hat{y}')} الموافقة للقيمة ${K('x=1.5')}`, '', solY],
];
const head=`<div class="ti">من أجل البيانات الإحصائية المعطاة في الجدول الآتي، أجب عما يلي:</div><div class="g">${data}</div>`;
// بدون حل: الأسئلة تحت بعض بدون مسافات ولا لوحة فاضية (طلب المستخدم)
const page=sol=>`<div class="all${sol?'':' tight'}">${head}${Q.map(([q,blank,s],i)=>`<div class="qi"><div class="qt"><b>${i+1})</b> ${q}</div>${sol?`<div class="sv">${s}</div>`:''}</div>`).join('')}</div>`;
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-600.ttf)}@font-face{font-family:Rx7;src:url(file://${FONTS}/Readex-700.ttf)}
html,body{margin:0;background:transparent}#w{display:inline-block;padding:16px 22px;color:${BR}}
.katex{color:${BR};-webkit-text-stroke:0.6px ${BR};direction:ltr;unicode-bidi:isolate}.katex-display{margin:0}
.katex [style*="transparent"],.katex [style*="transparent"] *{-webkit-text-stroke:0!important}
.all{direction:rtl;width:1500px}
.ti{font:38px Rx7;color:${BR};margin-bottom:6px}
.qi{margin-top:44px}.tight .qi{margin-top:6px}.tight .g{margin-bottom:22px}.qt{font:36px Rx;color:${BR};line-height:1.6}.qt b{color:${STEP};font:38px Rx7}.qt .katex{font-size:1.05em}
.sv{margin-top:22px}.g{margin-top:24px;text-align:center}
.t{direction:rtl;border-collapse:separate;border-spacing:0;font:30px Rx;color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff;margin:0 auto}
.t td,.t th{height:68px;min-width:90px;padding:0 22px;text-align:center;border-left:2px solid ${LINE};border-bottom:2px solid ${LINE};font-weight:normal;white-space:nowrap}
.t tr>*:last-child{border-left:none}.t tr:last-child>*{border-bottom:none}
.t th.h,.t tr.hd th{background:${HEAD}}.t .katex{font-size:1.15em}.t.c td,.t.c th{min-width:150px}.t tr.s td{background:${HEAD}}
.eq{font-size:40px;text-align:center;margin-top:22px}.eq .katex{-webkit-text-stroke:0.9px ${BR}}.eq.sm{font-size:31px}
.katex .fcolorbox{border-width:3.5px!important;border-radius:8px;padding:2px 6px!important}
.note{font:34px Rx;color:${BR};margin:30px 0 0;text-align:center}.note .katex{font-size:1.05em}
svg{direction:ltr}
.n{font:600 26px 'DejaVu Sans';fill:${BR}}.ax{font:italic 700 32px 'DejaVu Serif';fill:${BR}}
.lb{font:600 24px 'DejaVu Sans';fill:${LN}}.lq{font:italic 700 30px 'DejaVu Serif';fill:${LN}}
.ans{text-align:center}.ans span{display:inline-block;direction:rtl;font:42px Rx;color:${BR};border:3.5px solid ${BOX};border-radius:12px;padding:8px 30px 14px}`;
(async()=>{const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await br.newPage({deviceScaleFactor:3,viewport:{width:2400,height:1200}});
const p2=await br.newPage({deviceScaleFactor:2.2,viewport:{width:2400,height:1200}}); // الصورة الطويلة: أقل من 8000px عشان تنرسل
const f=`${OUT}/_t431.html`;
for(const [name,body] of [['السؤال بدون حل',page(false)],['السؤال مع الحل',page(true)],['جدول البيانات',data],['جدول الحسابات',calc],
  ['لوحة الانتشار - فاضية',grid(false,false)],['لوحة الانتشار - النقاط',grid(true,false)],['لوحة الانتشار - مع مستقيم الانحدار',grid(true,true)],
  ['حل 2 - معامل بيرسون',solR],['حل 3 - نوع الارتباط',solType],['حل 4 - معادلة الانحدار',`<div style="width:1500px;direction:rtl">${solB}</div>`],['حل 5 - التقدير',solY]]){
 fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${body}</div></body></html>`);
 const pg=name==='السؤال مع الحل'?p2:p;
 await pg.goto('file://'+f); await pg.evaluate(()=>document.fonts.ready);
 await (await pg.$('#w')).screenshot({path:`${OUT}/تدريب 4.3.1 - ${name}.png`,omitBackground:true});}
fs.unlinkSync(f); await br.close();})();
