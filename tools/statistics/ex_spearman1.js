// مثال 1 سبيرمان (ملف القسم ص7–8) + لوحة انتشار الرتب — صور شفافة بلون الملزمة
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de', BOX='#b0453a', GRID='#d9c9bd', PT='#b0453a';
const K=(t,d)=>katex.renderToString(t,{output:'html',displayMode:!!d});
const LV={'ضعيف':1,'متوسط':2,'جيد جدًا':3,'ممتاز':4};
const X=['متوسط','ضعيف','ممتاز','جيد جدًا','جيد جدًا'], Y=[70,75,95,80,85], n=X.length;
function ranks(v){const s=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]);const r=[];let i=0;
 while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const pos=[];for(let k=i;k<=j;k++)pos.push(k+1);
  for(let k=i;k<=j;k++)r[s[k][1]]={v:pos.reduce((a,b)=>a+b,0)/pos.length,pos};i=j+1;}return r;}
const RX=ranks(X.map(x=>LV[x])), RY=ranks(Y), D=RX.map((r,i)=>r.v-RY[i].v), D2=D.map(d=>d*d), SD2=D2.reduce((a,b)=>a+b,0);
const ORD=X.map((_,i)=>i).sort((a,b)=>LV[X[a]]-LV[X[b]]||a-b);
const rs=1-6*SD2/(n*(n*n-1)); console.log({RX:RX.map(r=>r.v),RY:RY.map(r=>r.v),D,SD2,rs});
const fmt=v=>String(+v.toFixed(4));
const rk=r=>r.pos.length>1?K(`\\frac{${r.pos.join('+')}}{${r.pos.length}}=${fmt(r.v)}`):K(fmt(r.v));
// 1) جدول البيانات
const data=`<table class="t"><tr><th class="h">تقدير المستوى ${K('X')}</th>${X.map(x=>`<td>${x}</td>`).join('')}</tr>
<tr><th class="h">الدرجة الفعلية ${K('Y')}</th>${Y.map(y=>`<td>${y}</td>`).join('')}</tr></table>`;
// 2) الترتيب التصاعدي والرتب الأولية
const sx=[...X].sort((a,b)=>LV[a]-LV[b]), sy=[...Y].sort((a,b)=>a-b);
const step1=`<table class="t"><tr class="hd"><th class="h">الرتبة الأولية</th>${sx.map((_,i)=>`<th>${i+1}</th>`).join('')}</tr>
<tr><th class="h">تقدير المستوى ${K('X')}</th>${sx.map(x=>`<td>${x}</td>`).join('')}</tr>
<tr><th class="h">الدرجة الفعلية ${K('Y')}</th>${sy.map(y=>`<td>${y}</td>`).join('')}</tr></table>`;
// 3) جدول الرتب
const step2=`<table class="t"><tr class="hd">${['X','Y','R_{x_i}','R_{y_i}','d_i=R_{x_i}-R_{y_i}','d_i^{2}'].map(h=>`<th>${K(h)}</th>`).join('')}</tr>
${ORD.map(i=>[X[i],i]).map(([x,i])=>`<tr><td>${x}</td><td>${K(String(Y[i]))}</td><td>${rk(RX[i])}</td><td>${rk(RY[i])}</td><td>${K(fmt(D[i]))}</td><td>${K(fmt(D2[i]))}</td></tr>`).join('')}
<tr class="s"><td colspan="5"></td><td>${K('\\Sigma='+fmt(SD2))}</td></tr></table>`;
// 4) القانون والتعويض والناتج
const tex=String.raw`r_s=1-\dfrac{6\sum d_i^{2}}{n\left(n^{2}-1\right)}=1-\dfrac{6(${fmt(SD2)})}{${n}(${n*n}-1)}=\fcolorbox{${BOX}}{transparent}{$\;${fmt(rs)}\;$}`;
const sol=`<div class="eq">${K(tex,1)}</div><div class="ans"><span>ارتباط رتبي طردي قوي جدًا</span></div>`;
// 5) لوحة انتشار الرتب
function grid(points){
 const W=620,H=520,l=70,r=40,t=80,b=62,M=5; const xs=v=>l+v*(W-l-r)/M, ys=v=>H-b-v*(H-t-b)/M; let g='';
 for(let k=0;k<=2*M;k++){const v=k/2,w=k%2?1:1.6;
  g+=`<line x1="${xs(v)}" x2="${xs(v)}" y1="${ys(0)}" y2="${ys(M)}" stroke="${GRID}" stroke-width="${w}"/><line x1="${xs(0)}" x2="${xs(M)}" y1="${ys(v)}" y2="${ys(v)}" stroke="${GRID}" stroke-width="${w}"/>`;}
 g+=`<line x1="${xs(0)}" x2="${xs(M)+18}" y1="${ys(0)}" y2="${ys(0)}" stroke="${BR}" stroke-width="3.5"/><line x1="${xs(0)}" x2="${xs(0)}" y1="${ys(0)}" y2="${ys(M)-18}" stroke="${BR}" stroke-width="3.5"/>`;
 g+=`<path d="M${xs(M)+30},${ys(0)} l-14,-7 v14z" fill="${BR}"/><path d="M${xs(0)},${ys(M)-30} l-7,14 h14z" fill="${BR}"/>`;
 for(let v=0;v<=M;v++) g+=`<text x="${xs(v)}" y="${ys(0)+34}" text-anchor="middle" class="n">${v}</text>`;
 for(let v=1;v<=M;v++) g+=`<text x="${xs(0)-16}" y="${ys(v)+9}" text-anchor="end" class="n">${v}</text>`;
 g+=`<text x="${xs(M)+40}" y="${ys(0)+9}" class="ax">R<tspan class="sb" dy="9">x</tspan></text><text x="${xs(0)-12}" y="${ys(M)-38}" class="ax">R<tspan class="sb" dy="9">y</tspan></text>`;
 if(points) RX.forEach((r,i)=>{g+=`<circle cx="${xs(r.v)}" cy="${ys(RY[i].v)}" r="9" fill="${PT}" stroke="#fff" stroke-width="2"/>`;});
 return `<svg width="${W+40}" height="${H}" viewBox="0 0 ${W+40} ${H}">${g}</svg>`;}
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-600.ttf)}@font-face{font-family:Rx7;src:url(file://${FONTS}/Readex-700.ttf)}
html,body{margin:0;background:transparent}#w{display:inline-block;padding:14px 20px;color:${BR}}
.katex{color:${BR};-webkit-text-stroke:0.6px ${BR};direction:ltr;unicode-bidi:isolate}.katex-display{margin:0}
.t{direction:rtl;border-collapse:separate;border-spacing:0;font:30px Rx;color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff;margin:0 auto}
.t td,.t th{height:68px;padding:0 26px;text-align:center;border-left:2px solid ${LINE};border-bottom:2px solid ${LINE};font-weight:normal;white-space:nowrap}
.t tr>*:last-child{border-left:none}.t tr:last-child>*{border-bottom:none}
.t th.h,.t tr.hd th{background:${HEAD};font:30px Rx7}.t td{font-size:31px}.t .katex{font-size:1.1em}
.t tr.s td{background:${HEAD}}.t tr.s td[colspan]{background:transparent;border-left:2px solid ${LINE}}
.q{text-align:center}.g{margin-top:36px}.n{font:600 26px 'DejaVu Sans';fill:${BR}}.ax{font:italic 700 30px 'DejaVu Serif';fill:${BR}}.sb{font-size:20px}
.eq{font-size:40px;text-align:center}.eq .katex{-webkit-text-stroke:0.9px ${BR}}
.katex .fcolorbox{border-width:3.5px!important;border-radius:8px;padding:2px 6px!important}
.ans{text-align:center;margin-top:26px}.ans span{display:inline-block;direction:rtl;font:42px Rx;color:${BR};border:3.5px solid ${BOX};border-radius:12px;padding:8px 30px 14px}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:3});
const f=`${OUT}/_es.html`;
for(const [name,body] of [['السؤال - الجدول مع اللوحة الفاضية',`<div class="q">${data}<div class="g">${grid(false)}</div></div>`],['الحل كامل',`<div class="q">${step1}<div class="g">${step2}</div><div class="g">${grid(true)}</div><div class="g">${sol}</div></div>`],['جدول البيانات',data],['الخطوة 1 - الرتب الأولية',step1],['الخطوة 2 - جدول الرتب',step2],
  ['لوحة انتشار الرتب - فاضية',grid(false)],['لوحة انتشار الرتب - محلولة',grid(true)],['حساب معامل سبيرمان',sol]]){
 fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${body}</div></body></html>`);
 await p.goto('file://'+f); await p.evaluate(()=>document.fonts.ready);
 await (await p.$('#w')).screenshot({path:`${OUT}/سبيرمان مثال 1 - ${name}.png`,omitBackground:true});}
fs.unlinkSync(f); await b.close();})();
