const { chromium } = require('playwright');
const fs=require('fs'); const G=__dirname;
const xb='x&#772;', yb='y&#772;';
const s=t=>`<sub>${t}</sub>`, B=t=>`<span class="b">${t}</span>`, A=t=>`<span class="a">${t}</span>`;
const F=(n,d)=>`<span class="fr"><span class="nu">${n}</span><span class="de">${d}</span></span>`;
const SQ=t=>`<span class="sq">√<span class="sqi">${t}</span></span>`;
const L=t=>`<span dir="ltr">${t}</span>`;
const S='Σ';
const FOOT=`<a class="ft" href="https://t.me/mlazmadl"><span class="f1">قناتنا لمعرفة كل جديد: <span dir="ltr" class="url">https://t.me/mlazmadl</span></span><span class="f2">للدخول للقناة اضغط على الرابط</span></a>`;
// scatter svg (pt units via viewBox)
const sc=(()=>{const W=250,H=128,l=24,b=18,t=6,r=6;const X=v=>l+v*(W-l-r)/6,Y=v=>H-b-v*(H-b-t)/6;let g='';
 for(let i=0;i<=6;i++){g+=`<line x1="${X(i)}" x2="${X(i)}" y1="${Y(0)}" y2="${Y(6)}" stroke="#c7cde0" stroke-width="0.5"/><line x1="${X(0)}" x2="${X(6)}" y1="${Y(i)}" y2="${Y(i)}" stroke="#c7cde0" stroke-width="0.5"/>`;
  g+=`<text x="${X(i)}" y="${Y(0)+10}" font-size="8" text-anchor="middle">${i}</text>`; if(i) g+=`<text x="${X(0)-5}" y="${Y(i)+3}" font-size="8" text-anchor="end">${i}</text>`;}
 g+=`<line x1="${X(0)}" x2="${X(6.2)}" y1="${Y(0)}" y2="${Y(0)}" stroke="#0b2a9c" stroke-width="1.2"/><line x1="${X(0)}" x2="${X(0)}" y1="${Y(0)}" y2="${Y(6.2)}" stroke="#0b2a9c" stroke-width="1.2"/>`;
 g+=`<text x="${X(6.15)}" y="${Y(0)-4}" font-size="10" font-weight="bold" font-style="italic">X</text><text x="${X(0)+4}" y="${Y(6)+2}" font-size="10" font-weight="bold" font-style="italic">Y</text>`;
 g+=`<line x1="${X(0)}" y1="${Y(0.2)}" x2="${X(6)}" y2="${Y(5)}" stroke="#ea580c" stroke-width="1.6"/>`;
 g+=`<text x="${X(5.95)}" y="${Y(5)-5}" font-size="8.5" text-anchor="end" fill="#ea580c" font-weight="bold">Ŷ = 0.2 + 0.8X</text>`;
 for(const [x,y] of [[4,3],[1,2],[5,5],[2,1],[3,2]]) g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="3" fill="#0b2a9c"/>`;
 return `<svg width="${W}pt" height="${H}pt" viewBox="0 0 ${W} ${H}" font-family="DejaVu Sans" fill="#0b2a9c">${g}</svg>`;})();
const ptab=`<table class="tb"><tr><th></th><th>x</th><th>y</th><th>xy</th><th>x²</th><th>y²</th></tr>`+
 [[4,3],[1,2],[5,5],[2,1],[3,2]].map(([x,y])=>`<tr><td></td><td>${x}</td><td>${y}</td><td>${x*y}</td><td>${x*x}</td><td>${y*y}</td></tr>`).join('')+
 `<tr class="sum"><td>Σ</td><td>15</td><td>13</td><td>47</td><td>55</td><td>43</td></tr></table>`;
const R=[['ممتاز','منخفض جداً',6.5,1],['جيد جداً','منخفض',5,2.5],['ممتاز','منخفض',6.5,2.5],['جيد','متوسط',3.5,4.5],['مقبول','مرتفع',2,6],['جيد','متوسط',3.5,4.5],['ضعيف','مرتفع جداً',1,7]];
const stab=`<table class="tb" dir="rtl"><tr><th>X</th><th>Y</th><th>R<sub>x</sub></th><th>R<sub>y</sub></th><th>d = R<sub>x</sub> − R<sub>y</sub></th><th>d²</th></tr>`+
 R.map(([x,y,a,b])=>{const d=a-b;return `<tr><td class="a">${x}</td><td class="a">${y}</td><td>${a}</td><td>${b}</td><td dir="ltr">${d<0?'−'+(-d):d}</td><td>${d*d}</td></tr>`}).join('')+
 `<tr class="sum"><td colspan="5" class="a">المجموع</td><td dir="ltr">Σd² = 106.5</td></tr></table>`;
const rank=`<div class="rk" dir="rtl"><div class="a">ترتيب X تصاعدياً:</div><div class="a">ضعيف (1) ، مقبول (2) ، جيد ، جيد <span dir="ltr">${F('3 + 4','2')} = 3.5</span></div><div class="a">جيد جداً (5) ، ممتاز ، ممتاز <span dir="ltr">${F('6 + 7','2')} = 6.5</span></div>
<div class="a" style="margin-top:4pt">ترتيب Y تصاعدياً:</div><div class="a">منخفض جداً (1) ، منخفض ، منخفض <span dir="ltr">${F('2 + 3','2')} = 2.5</span></div><div class="a">متوسط ، متوسط <span dir="ltr">${F('4 + 5','2')} = 4.5</span> ، مرتفع (6) ، مرتفع جداً (7)</div></div>`;
// [x0,y0,x1,y1,font,html,dir,align,raw]
const pages={
 1:[
  [60,794,535,816,9,FOOT,'rtl','center'],
  [42,44,182,98,11,`<span class="badge"><span class="b1">الأقدم في شروحات احص 102</span><span class="b2">منذ عام 1444 هـ</span></span>`,'rtl','center'],
  [300,140,488,163,14,A('ملازم عدل'),'rtl'],
  ...['خطأ','خطأ','صح','صح','خطأ'].map((w,i)=>[36,512+23*i,98,535+23*i,12,A(`<b>${w}</b>`),'rtl','center']),
  [38,650,138,673,12,'1','ltr','center'],
  [38,673,138,704,12,'0.756','ltr','center'],
  [38,705,138,728,12,`(${xb} , ${yb})`,'ltr','center'],
  [38,728,138,769,10,`Ŷ = 7.79 + 0.0961X`,'ltr','center'],
  [38,769,138,792,12,'[0 , 1]','ltr','center'],
 ],
 2:[
  [60,794,535,816,9,FOOT,'rtl','center'],
  [70,163,330,298,10,sc,'ltr','center','raw'],
  [372,324,550,458,10,ptab,'ltr','center','raw'],
  [42,326,365,358,11,`r = ${F(`n${S}xy − ${S}x${S}y`,`${SQ(`n${S}x² − (${S}x)²`)} ${SQ(`n${S}y² − (${S}y)²`)}`)}`],
  [42,363,365,396,11,`= ${F('5(47) − (15)(13)',`${SQ('5(55) − (15)²')} ${SQ('5(43) − (13)²')}`)}`],
  [42,401,365,434,11,`= ${F('40',`${SQ('50')} ${SQ('46')}`)} = ${B('0.83')}`],
  [45,462,340,480,11.5,A(`ارتباط خطي ${B('طردي قوي')}`),'rtl'],
  [45,513,535,545,11,`b = ${F(`n${S}xy − ${S}x${S}y`,`n${S}x² − (${S}x)²`)} = ${F('5(47) − (15)(13)','5(55) − (15)²')} = ${F('40','50')} = 0.8`],
  [45,549,535,581,11,`${xb} = ${F(`${S}x`,'n')} = ${F('15','5')} = 3 &nbsp;&nbsp;&nbsp;&nbsp; ${yb} = ${F(`${S}y`,'n')} = ${F('13','5')} = 2.6`],
  [45,585,535,605,11,`a = ${yb} − b${xb} = 2.6 − 0.8(3) = 0.2`],
  [45,609,535,631,12,`Ŷ = a + bX &nbsp;&nbsp;⟹&nbsp;&nbsp; Ŷ = ${B('0.2 + 0.8X')}`],
  [45,651,440,668,11,`r² = (0.834)² = ${B('0.69')}`],
  [40,673,420,691,10.5,A('69% من التباين الكلي في درجة الطالب (Y) يمكن تفسيره بعدد ساعات المذاكرة (X)'),'rtl'],
  [45,695,535,714,10.5,A('من خلال نموذج الانحدار الخطي، و 31% تعود لعوامل أخرى'),'rtl'],
  [45,740,535,760,11.5,`ŷ = 0.2 + 0.8X = 0.2 + 0.8(1.5) = ${B('1.4')}`],
  [45,763,320,781,11,A('تم تمثيله على لوحة الانتشار في الفرع (1)'),'rtl'],
 ],
 3:[
  [60,758,535,782,9,FOOT,'rtl','center'],
  [292,176,537,352,8.5,stab,'rtl','center','raw'],
  [42,186,284,346,9.5,rank,'rtl','center','raw'],
  [45,362,535,402,12,`r${s('s')} = 1 − ${F(`6${S}d²`,'n(n² − 1)')} = 1 − ${F('6(106.5)','7(7² − 1)')} = 1 − ${F('639','336')} = ${B('−0.90')}`],
  [45,556,340,573,11.5,A(`ارتباط رتبي ${B('عكسي قوي جداً')}`),'rtl'],
 ]};
(async()=>{
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
 const pg=await br.newPage();
 for(const [n,items] of Object.entries(pages)){
  const divs=items.map(([x0,y0,x1,y1,f,h,d,al,raw])=>`<div class="l${raw?' raw':''}" dir="${d||'ltr'}" style="left:${x0}pt;top:${y0}pt;width:${x1-x0}pt;height:${y1-y0}pt;font-size:${f}pt;justify-content:${al=='center'?'center':'flex-start'}"><span class="in">${h}</span></div>`).join('');
  const html=`<html><head><style>
@font-face{font-family:ar;src:url(file://${G}/cairo-bold.ttf)}
@page{size:595.32pt 841.92pt;margin:0}
html,body{margin:0;background:transparent}
.l{position:absolute;display:flex;align-items:center;color:#0b2a9c;font-family:'DejaVu Sans',sans-serif;font-weight:bold;overflow:visible}
.in{white-space:nowrap}
.raw .in{white-space:normal}
.a{font-family:ar}
.ft{display:inline-flex;flex-direction:column;align-items:center;font-family:ar;text-decoration:none;color:#0b2a9c}
.f1{font-size:9pt;line-height:1.25}
.url{font-family:'DejaVu Sans',sans-serif;color:#991b1b;text-decoration:underline;font-size:8.5pt}
.f2{font-size:7.5pt;line-height:1.2;color:#991b1b}
.badge{display:inline-flex;flex-direction:column;align-items:center;gap:2pt;font-family:ar;border:1.4pt solid #0b2a9c;border-radius:8pt;padding:3pt 9pt 4pt;background:#fff;box-shadow:2pt 2pt 0 #ea580c}
.b1{font-size:10pt;color:#0b2a9c;line-height:1.3}
.b2{font-size:8.5pt;color:#ea580c;line-height:1.2;border-top:0.8pt solid #ea580c;padding-top:2pt}
.a .b{display:inline-block;line-height:1.05;padding:0.5pt 3pt 1.5pt}
.b{border:1pt solid #ea580c;padding:0 2pt;font-weight:bold}
sub{font-size:68%;vertical-align:sub;line-height:0}
.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 1.5pt;line-height:1.15}
.nu{padding:0 2pt 0.5pt;border-bottom:0.9pt solid currentColor}
.de{padding:0.5pt 2pt 0}
.sq{white-space:nowrap}.sqi{border-top:0.9pt solid currentColor;padding:0 1pt}
.tb{border-collapse:collapse;font-size:inherit;color:#0b2a9c}
.tb td,.tb th{border:0.8pt solid #0b2a9c;padding:1.2pt 4pt;text-align:center;line-height:1.25;white-space:nowrap}
.tb th{background:#e8edf9}
.tb .sum td{background:#fff3ea}
.rk{line-height:1.55}
.rk .fr{font-size:85%}
</style></head><body>${divs}</body></html>`;
  fs.writeFileSync(`${G}/w7p${n}.html`,html);
  await pg.goto(`file://${G}/w7p${n}.html`);
  await pg.evaluate(()=>document.fonts.ready);
  const r=await pg.evaluate(()=>[...document.querySelectorAll('.l')].map(d=>{const w=d.getBoundingClientRect().width;let f=parseFloat(d.style.fontSize);const raw=d.classList.contains('raw');while(!raw&&d.querySelector('.in').getBoundingClientRect().width>w&&f>5){f-=0.1;d.style.fontSize=f+'pt';}const ib=d.querySelector('.in').getBoundingClientRect(),db=d.getBoundingClientRect();return f.toFixed(1)+(ib.height>db.height+1?'!H':'')+(ib.width>db.width+1?'!W':'');}).join(' '));
  console.log('page',n,r);
  await pg.pdf({path:`${G}/w7ov${n}.pdf`,preferCSSPageSize:true,printBackground:true});
 }
 await br.close();
})();
