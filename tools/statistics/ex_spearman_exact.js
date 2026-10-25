// مثال من عندنا: سبيرمان بالصيغة الدقيقة rs = r(Rx, Ry) (بيرسون على الرتب) — صورة مرجعية بخلفية كريمية
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de', BOX='#b0453a', STEP='#9a3412';
const K=(t,d)=>katex.renderToString(t,{output:'html',displayMode:!!d});
const X=[2,5,3,8,5,6], Y=[60,75,65,90,70,85], n=X.length;
function ranks(v){const s=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]);const r=[];let i=0;
 while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const pos=[];for(let k=i;k<=j;k++)pos.push(k+1);
  for(let k=i;k<=j;k++)r[s[k][1]]={v:pos.reduce((a,b)=>a+b,0)/pos.length,pos};i=j+1;}return r;}
const RX=ranks(X), RY=ranks(Y), rx=RX.map(r=>r.v), ry=RY.map(r=>r.v);
const ORD=X.map((_,i)=>i).sort((a,b)=>X[a]-X[b]||a-b);
const S=a=>a.reduce((p,q)=>p+q,0), XY=rx.map((a,i)=>a*ry[i]), X2=rx.map(a=>a*a), Y2=ry.map(a=>a*a);
const [sx,sy,sxy,sx2,sy2]=[S(rx),S(ry),S(XY),S(X2),S(Y2)];
const num=n*sxy-sx*sy, dx=n*sx2-sx*sx, dy=n*sy2-sy*sy, r=num/(Math.sqrt(dx)*Math.sqrt(dy));
const trunc=(v,d)=>(Math.trunc(v*10**d)/10**d).toFixed(d), fmt=v=>String(+v.toFixed(4));
console.log({rx,ry,sx,sy,sxy,sx2,sy2,num,dx,dy,r});
const rk=x=>x.pos.length>1?K(`\\frac{${x.pos.join('+')}}{${x.pos.length}}=${fmt(x.v)}`):K(fmt(x.v));
const strength=a=>a===1?'تام':a>0.86?'قوي جدًا':a>0.70?'قوي':a>0.50?'متوسط القوة':a>0.30?'ضعيف':a>0?'ضعيف جدًا':'معدوم';
const verdict=`ارتباط رتبي ${r>0?'طردي':'عكسي'} ${strength(Math.abs(+trunc(r,2)))}`;
const q=`<p class="q"><b>مثال:</b> الجدول الآتي يمثل عدد ساعات المذاكرة ${K('X')} ودرجة الاختبار ${K('Y')} لـ ${n} طلاب.
أوجد معامل ارتباط سبيرمان للرتب باستخدام الصيغة ${K('r_s=r(R_x,R_y)')}، وحدد نوع الارتباط وقوته.</p>
<table class="t"><tr><th class="h">ساعات المذاكرة ${K('X')}</th>${X.map(v=>`<td>${v}</td>`).join('')}</tr>
<tr><th class="h">درجة الاختبار ${K('Y')}</th>${Y.map(v=>`<td>${v}</td>`).join('')}</tr></table>`;
const sx_=[...X].sort((a,b)=>a-b), sy_=[...Y].sort((a,b)=>a-b);
const st1=`<h3>الحل:</h3><h4>1) ترتيب المشاهدات تصاعديًا وإعطاء الرتب الأولية</h4>
<table class="t"><tr class="hd"><th class="h">الرتبة الأولية</th>${sx_.map((_,i)=>`<th>${i+1}</th>`).join('')}</tr>
<tr><th class="h">${K('X')}</th>${sx_.map(v=>`<td>${v}</td>`).join('')}</tr><tr><th class="h">${K('Y')}</th>${sy_.map(v=>`<td>${v}</td>`).join('')}</tr></table>`;
const st2=`<h4>2) جدول الرتب والحسابات</h4>
<table class="t m"><tr class="hd">${['X','Y','R_x','R_y','R_xR_y','R_x^{2}','R_y^{2}'].map(h=>`<th>${K(h)}</th>`).join('')}</tr>
${ORD.map(i=>[X[i],i]).map(([x,i])=>`<tr><td>${K(String(x))}</td><td>${K(String(Y[i]))}</td><td>${rk(RX[i])}</td><td>${rk(RY[i])}</td><td>${K(fmt(XY[i]))}</td><td>${K(fmt(X2[i]))}</td><td>${K(fmt(Y2[i]))}</td></tr>`).join('')}
<tr class="s"><td colspan="2"></td>${[sx,sy,sxy,sx2,sy2].map(v=>`<td>${K('\\Sigma='+fmt(v))}</td>`).join('')}</tr></table>`;
const L1=String.raw`r_s=r\left(R_x,R_y\right)=\dfrac{${n}(${fmt(sxy)})-(${fmt(sx)})(${fmt(sy)})}{\sqrt{${n}(${fmt(sx2)})-(${fmt(sx)})^{2}}\;\sqrt{${n}(${fmt(sy2)})-(${fmt(sy)})^{2}}}=\fcolorbox{${BOX}}{transparent}{$\;${trunc(r,2)}\;$}`;
const st3=`<h4>3) التعويض في قانون بيرسون على الرتب</h4><div class="eq">${K(L1,1)}</div>
<div class="ans"><span>${verdict}</span></div>`;
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-500.ttf)}@font-face{font-family:Rx7;src:url(file://${FONTS}/Readex-700.ttf)}
html,body{margin:0;background:#fffdf5}#w{width:1180px;padding:30px 40px 40px;color:${BR};direction:rtl;font:28px/1.9 Rx}
.katex{color:${BR};direction:ltr;unicode-bidi:isolate}.katex-display{margin:0}
.q{margin:0 0 22px}.q b{font-family:Rx7;color:${STEP}}
h3{font:34px Rx7;color:${STEP};margin:34px 0 4px}h4{font:28px Rx7;color:${STEP};margin:30px 0 14px}
.t{border-collapse:separate;border-spacing:0;font:28px Rx;color:${BR};border:3px solid ${BR};border-radius:14px;overflow:hidden;background:#fff;margin:0 auto}
.t td,.t th{height:60px;padding:0 22px;text-align:center;border-left:2px solid ${LINE};border-bottom:2px solid ${LINE};font-weight:normal;white-space:nowrap}
.t tr>*:last-child{border-left:none}.t tr:last-child>*{border-bottom:none}
.t th.h,.t tr.hd th{background:${HEAD};font-family:Rx7}.t .katex{font-size:1.08em}
.t tr.s td{background:${HEAD}}.t tr.s td[colspan]{background:#fff;border-left:2px solid ${LINE}}
.eq{font-size:34px;margin:10px 0 18px;-webkit-text-stroke:0.5px ${BR}}
.katex .fcolorbox{border-width:3px!important;border-radius:8px;padding:2px 6px!important}
.ans{text-align:center;margin-top:20px}.ans span{display:inline-block;font:36px Rx7;border:3px solid ${BOX};border-radius:12px;padding:6px 28px 12px}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:2.5});
const f=`${OUT}/_ee.html`; fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${q}${st1}${st2}${st3}</div></body></html>`);
await p.goto('file://'+f); await p.evaluate(()=>document.fonts.ready);
await (await p.$('#w')).screenshot({path:`${OUT}/مثال سبيرمان بالصيغة الدقيقة r(Rx,Ry).png`});
fs.unlinkSync(f); await b.close();})();
