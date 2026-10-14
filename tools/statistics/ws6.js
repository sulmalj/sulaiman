const { chromium } = require('playwright');
const fs=require('fs'); const G=__dirname;
const xb='x&#772;', xt='x&#771;';
const s=t=>`<sub>${t}</sub>`, B=t=>`<span class="b">${t}</span>`, A=t=>`<span class="a">${t}</span>`;
const F=(n,d)=>`<span class="fr"><span class="nu">${n}</span><span class="de">${d}</span></span>`;
const Q=k=>`Q${s(k)}`;
// [x0,y0,x1,y1,fontPt,html,dir,align]
const pages={
 1:[
  [37,618,116,640,12,A(B('خطأ')),'rtl','center'],
  [37,641,116,663,12,A(B('صح')),'rtl','center'],
  [37,663,116,686,12,A(B('خطأ')),'rtl','center'],
  [37,686,116,709,12,A(B('خطأ')),'rtl','center'],
 ],
 2:[
  [44,129,398,152,11.5,`x${s('s')} = ${B('1')} &nbsp;&nbsp;&nbsp; ${Q(1)} = ${B('8')} &nbsp;&nbsp;&nbsp; ${Q(2)} = ${B('11')} &nbsp;&nbsp;&nbsp; ${Q(3)} = ${B('12')} &nbsp;&nbsp;&nbsp; x${s('l')} = ${B('16')}`],
  [54,187,208,208,11.5,B('25%')],
  [53,222,322,243,11.5,B('75%')],
  [51,257,348,278,11.5,B('50%')],
  [45,292,442,313,11.5,`${xt} = ${B('11')}`],
  [46,327,384,348,11.5,A(`${B('ملتوي نحو اليسار')} لأن `)+`<span dir="ltr">${xb} = 9 &lt; ${xt} = 11</span>`,'rtl'],
  [52,362,316,383,11.5,`LF = ${B('2')}`],
  [50,397,326,418,11.5,A(`${B('1')} قيمة متطرفة بصغرها لأنها أصغر من `)+`<span dir="ltr">LF = 2</span>`,'rtl'],
  [46,432,462,453,11.5,`R = x${s('l')} − x${s('s')} = 16 − 1 = ${B('15')}`],
  [47,467,418,488,11.5,`IQR = ${Q(3)} − ${Q(1)} = 12 − 8 = ${B('4')}`],
  [43,502,381,545,11.5,`QCD = ${F(Q(3)+' − '+Q(1),Q(3)+' + '+Q(1))} × 100% = ${F('12 − 8','12 + 8')} × 100% = ${B('20%')}`],
  [42,560,413,603,11.5,`CV = ${F('S',xb)} × 100% = ${F('2','9')} × 100% = ${B('22.22%')}`],
  [43,617,383,660,11.5,`Z<sub>x<sub>i</sub></sub> = ${F('x'+s('i')+' − '+xb,'S')} = ${F('5 − 9','2')} = ${B('−2')}`],
  [44,694,536,722,11.5,`${Q(1)} = 8 &nbsp;⟹&nbsp; ${F('r(n + 1)','4')} = 7 &nbsp;⟹&nbsp; ${F('1(n + 1)','4')} = 7 &nbsp;⟹&nbsp; n + 1 = 28 &nbsp;⟹&nbsp; n = ${B('27')}`],
 ]};
(async()=>{
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
 const pg=await br.newPage();
 for(const [n,items] of Object.entries(pages)){
  const divs=items.map(([x0,y0,x1,y1,f,h,d,al])=>`<div class="l" dir="${d||'ltr'}" style="left:${x0}pt;top:${y0}pt;width:${x1-x0}pt;height:${y1-y0}pt;font-size:${f}pt;justify-content:${al=='center'?'center':'flex-start'}"><span class="in">${h}</span></div>`).join('');
  const html=`<html><head><style>
@font-face{font-family:ar;src:url(file://${G}/cairo.ttf)}
@page{size:595.32pt 841.92pt;margin:0}
html,body{margin:0;background:transparent}
.l{position:absolute;display:flex;align-items:center;color:#1e40af;font-family:'DejaVu Sans',sans-serif;overflow:visible}
.in{white-space:nowrap}
.a{font-family:ar}
.a .b{display:inline-block;line-height:1.05;padding:0.5pt 3pt 1.5pt}
.b{border:1pt solid #ea580c;padding:0 2pt;font-weight:bold}
sub{font-size:68%;vertical-align:sub;line-height:0}
sub sub{font-size:80%}
.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 1.5pt;line-height:1.15}
.nu{padding:0 2pt 0.5pt;border-bottom:0.9pt solid currentColor}
.de{padding:0.5pt 2pt 0}
</style></head><body>${divs}</body></html>`;
  fs.writeFileSync(`${G}/w6p${n}.html`,html);
  await pg.goto(`file://${G}/w6p${n}.html`);
  await pg.evaluate(()=>document.fonts.ready);
  const r=await pg.evaluate(()=>[...document.querySelectorAll('.l')].map(d=>{const w=d.getBoundingClientRect().width;let f=parseFloat(d.style.fontSize);while(d.querySelector('.in').getBoundingClientRect().width>w&&f>5){f-=0.1;d.style.fontSize=f+'pt';}const ih=d.querySelector('.in').getBoundingClientRect().height,h=d.getBoundingClientRect().height;return f.toFixed(1)+(ih>h+1?'!H':'');}).join(' '));
  console.log('page',n,r);
  await pg.pdf({path:`${G}/w6ov${n}.pdf`,preferCSSPageSize:true,printBackground:false});
 }
 await br.close();
})();
