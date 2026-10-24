// تدريب 4.1.4: حل بيرسون كصورة شفافة (جدول + القانون = التعويض = الناتج + نوع الارتباط)
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const FONTS=path.resolve(__dirname,'../arab100/fonts');
const BR='#4a220a', LINE='#c9b2a2', HEAD='#f3e7de', BOX='#b0453a';
const X=[2,4,6,8], Y=[2,6,4,10], n=X.length;
const rows=X.map((x,i)=>[x,Y[i],x*Y[i],x*x,Y[i]*Y[i]]);
const S=[0,1,2,3,4].map(j=>rows.reduce((a,r)=>a+r[j],0)); // 20 22 132 120 156
const num=n*S[2]-S[0]*S[1], dx=n*S[3]-S[0]**2, dy=n*S[4]-S[1]**2, den=Math.sqrt(dx)*Math.sqrt(dy), r=num/den;
const trunc=(v,d)=>(Math.trunc(v*10**d)/10**d).toFixed(d);
console.log({S,num,dx,dy,den,r});
const K=t=>katex.renderToString(t,{displayMode:true,output:'html'});
const hd=['x_i','y_i','x_iy_i','x_i^{2}','y_i^{2}'].map(h=>`<th>${katex.renderToString(h,{output:'html'})}</th>`).join('');
const table=`<table><tr>${hd}</tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
<tr class="s">${S.map(v=>`<td>Σ = ${v}</td>`).join('')}</tr></table>`;
// سطر واحد أفقي: القانون = التعويض = … = الناتج
const tex=String.raw`r=\dfrac{n\displaystyle\sum x_iy_i-\sum x_i\sum y_i}{\sqrt{n\displaystyle\sum x_i^{2}-\left(\sum x_i\right)^{2}}\;\sqrt{n\displaystyle\sum y_i^{2}-\left(\sum y_i\right)^{2}}}
=\dfrac{${n}(${S[2]})-(${S[0]})(${S[1]})}{\sqrt{${n}(${S[3]})-(${S[0]})^{2}}\;\sqrt{${n}(${S[4]})-(${S[1]})^{2}}}
=\dfrac{${num}}{\sqrt{${dx}}\;\sqrt{${dy}}}=\dfrac{${num}}{${trunc(den,2)}}
=\fcolorbox{${BOX}}{transparent}{$\;${trunc(r,2)}\;$}`;
const sol=`<div class="eq">${K(tex)}</div><div class="ans"><span>ارتباط خطي طردي قوي</span></div>`;
const css=`@font-face{font-family:Rx;src:url(file://${FONTS}/Readex-600.ttf)}
html,body{margin:0;background:transparent}#w{display:inline-block;padding:16px 22px;color:${BR}}
.katex{color:${BR};-webkit-text-stroke:0.9px ${BR}}.katex-display{margin:0}.katex [style*="transparent"],.katex [style*="transparent"] *{-webkit-text-stroke:0!important}.eq{font-size:40px;text-align:center}.eq .katex-display{text-align:left}.eq .katex-display>.katex{text-align:left}
.katex .fcolorbox{border-width:3.5px!important;border-radius:8px;padding:2px 6px!important}
table{border-collapse:separate;border-spacing:0;margin:0 auto 34px;font:600 34px 'DejaVu Sans';color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff}
td,th{min-width:120px;height:66px;padding:0 14px;text-align:center;border-left:2px solid ${LINE};border-bottom:2px solid ${LINE}}
td:first-child,th:first-child{border-left:none} tr:last-child td{border-bottom:none}
th{background:${HEAD};font-size:36px} tr.s td{background:${HEAD};font-size:30px}
.ans{text-align:center;margin-top:30px}.ans span{display:inline-block;direction:rtl;font:44px Rx;color:${BR};border:3.5px solid ${BOX};border-radius:12px;padding:8px 30px 14px}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:3});
for(const [name,body] of [['أفقي مع الجدول',table+sol],['أفقي بدون جدول',sol]]){
 const f=`${OUT}/_t414.html`; fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>${css}</style></head><body><div id="w">${body}</div></body></html>`);
 await p.goto('file://'+f);
 await p.evaluate(()=>document.fonts.ready);
 await (await p.$('#w')).screenshot({path:`${OUT}/تدريب 4.1.4 - ${name}.png`,omitBackground:true});}
fs.unlinkSync(`${OUT}/_t414.html`); await b.close();})();
