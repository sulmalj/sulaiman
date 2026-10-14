const { chromium } = require('playwright');
const fs=require('fs'); const G=__dirname;
const xb='x&#772;', xt='x&#771;', xh='x&#770;';
const s=t=>`<sub>${t}</sub>`, B=t=>`<span class="b">${t}</span>`, A=t=>`<span class="a">${t}</span>`;
// items: [x0,y0,x1,y1,html,dir]
const pages={
 14:[
  [35,193,231,203, `${xb} = Σx${s('i')} / n = 36 / 9 = ${B('4')} &nbsp;&nbsp;&nbsp; ${xh} = ${B('4')}`],
  [35,203,231,212.5, `S² = Σ(x${s('i')} − ${xb})² / (n − 1) = 12 / 8 = 1.5 &nbsp;&nbsp; S = √1.5 = ${B('1.22')}`],
  [35,223,231,233, `SK${s('P')} = (${xb} − ${xh}) / S = (4 − 4) / 1.22 = ${B('0')} &nbsp;←&nbsp; ${A(B('متماثل'))}`],
  [35,334,227,344.5, A('أكثر من منوال ← نستخدم الوسيط') + ' &nbsp;&nbsp; <span dir="ltr">2, 3, 3, 4, 4, 5, 6, 6</span>', 'rtl'],
  [35,345,231,355.2, `${xb} = Σx${s('i')} / n = 33 / 8 = ${B('4.125')} &nbsp;&nbsp; ${xt} = (x${s('4')} + x${s('5')}) / 2 = (4 + 4) / 2 = ${B('4')}`],
  [35,355.5,231,365.5, `S² = Σ(x${s('i')} − ${xb})² / (n − 1) = 14.875 / 7 = 2.125 &nbsp;&nbsp; S = √2.125 = ${B('1.45')}`],
  [35,365.5,231,375.5, `SK${s('P')} = 3(${xb} − ${xt}) / S = 3(4.125 − 4) / 1.45 = ${B('0.25')} &gt; 0 &nbsp;←&nbsp; ${A(B('ملتوٍ نحو اليمين'))}`],
 ],
 16:[
  [35,219.5,227,229.5, `HF = 14 + 1.5(14 − 5) = 27.5 &nbsp; LF = 5 − 1.5(14 − 5) = −8.5 &nbsp; ${A('← لا توجد قيم منعزلة')}`],
  [44,333,226,346, B('75%')],
  [44,364,226,377, B('50%')],
  [44,405,226,418, `x${s('s')} = ${B('2')} &nbsp;&nbsp; Q${s('1')} = ${B('4')} &nbsp;&nbsp; Q${s('2')} = ${B('5.5')} &nbsp;&nbsp; Q${s('3')} = ${B('8')} &nbsp;&nbsp; x${s('l')} = ${B('15')}`],
  [40,435,224,448, A(`${B('15')} قيمة منعزلة بكبرها لأنها أكبر من <span dir="ltr">HF = 14</span> ، ولا توجد قيم منعزلة بصغرها`),'rtl'],
  [40,466,224,479, A(B('ملتوٍ نحو اليمين')),'rtl'],
  [44,495.5,226,504.5, `HF = Q${s('3')} + 1.5(Q${s('3')} − Q${s('1')}) = 8 + 1.5(8 − 4) = ${B('14')}`],
  [44,505,226,514, `LF = Q${s('1')} − 1.5(Q${s('3')} − Q${s('1')}) = 4 − 1.5(8 − 4) = ${B('−2')}`],
  [44,527,226,540, `R = x${s('l')} − x${s('s')} = 15 − 2 = ${B('13')}`],
  [44,558,226,571, `IQR = Q${s('3')} − Q${s('1')} = 8 − 4 = ${B('4')}`],
  [35,586.5,231,595, `QCD = (Q${s('3')} − Q${s('1')}) / (Q${s('3')} + Q${s('1')}) × 100% = (8 − 4) / (8 + 4) × 100% = ${B('33.33%')}`],
 ]};
(async()=>{
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
 const pg=await br.newPage();
 for(const [n,items] of Object.entries(pages)){
  const divs=items.map(([x0,y0,x1,y1,h,d])=>`<div class="l" dir="${d||'ltr'}" style="left:${x0}pt;top:${y0}pt;width:${x1-x0}pt;height:${y1-y0}pt;font-size:${Math.min((y1-y0)*0.62,6.8)}pt;text-align:${d=='rtl'?'right':'left'}"><span class="in">${h}</span></div>`).join('');
  const html=`<html><head><style>
@font-face{font-family:ar;src:url(file://${G}/cairo.ttf)}
@page{size:595.92pt 841.92pt;margin:0}
html,body{margin:0;background:transparent}
.l{position:absolute;white-space:nowrap;color:#1e40af;font-family:'DejaVu Sans',sans-serif;line-height:1.25;overflow:visible;padding-top:0.6pt;box-sizing:border-box}
.in{white-space:nowrap}
.a{font-family:ar}
.b{border:0.8pt solid #ea580c;padding:0 1.2pt;font-weight:bold;line-height:1.05}
sub{font-size:70%;vertical-align:sub;line-height:0}
</style></head><body>${divs}</body></html>`;
  fs.writeFileSync(`${G}/p${n}.html`,html);
  await pg.goto(`file://${G}/p${n}.html`);
  await pg.evaluate(()=>document.fonts.ready);
  await pg.evaluate(()=>{for(const d of document.querySelectorAll('.l')){let f=parseFloat(d.style.fontSize);const w=d.getBoundingClientRect().width;while(d.querySelector('.in').getBoundingClientRect().width>w&&f>4){f-=0.1;d.style.fontSize=f+'pt';}d.dataset.f=f.toFixed(1);}});
  const fsz=await pg.evaluate(()=>[...document.querySelectorAll('.l')].map(d=>d.dataset.f).join(' '));
  console.log('page',n,'font sizes',fsz);
  await pg.pdf({path:`${G}/ov${n}.pdf`,preferCSSPageSize:true,printBackground:false});
 }
 await br.close();
})();
