const { chromium } = require('playwright'); const fs=require('fs'); const G=__dirname;
const BR='#4a220a', GRID='#d9c9bd', AX='#4a220a', PT='#b0453a';
const X=[2,4,6,8], Y=[2,6,4,10];
function grid(points){
  const W=760,H=510,l=70,r=40,t=80,b=62; const xs=v=>l+v*(W-l-r)/8, ys=v=>H-b-v*(H-t-b)/10; let g='';
  for(let v=0;v<=8;v++) g+=`<line x1="${xs(v)}" x2="${xs(v)}" y1="${ys(0)}" y2="${ys(10)}" stroke="${GRID}" stroke-width="${v%2?1:1.6}"/>`;
  for(let v=0;v<=10;v++) g+=`<line x1="${xs(0)}" x2="${xs(8)}" y1="${ys(v)}" y2="${ys(v)}" stroke="${GRID}" stroke-width="${v%2?1:1.6}"/>`;
  g+=`<line x1="${xs(0)}" x2="${xs(8)+18}" y1="${ys(0)}" y2="${ys(0)}" stroke="${AX}" stroke-width="3.5"/><line x1="${xs(0)}" x2="${xs(0)}" y1="${ys(0)}" y2="${ys(10)-18}" stroke="${AX}" stroke-width="3.5"/>`;
  g+=`<path d="M${xs(8)+30},${ys(0)} l-14,-7 v14z" fill="${AX}"/><path d="M${xs(0)},${ys(10)-30} l-7,14 h14z" fill="${AX}"/>`;
  for(let v=0;v<=8;v+=2) g+=`<text x="${xs(v)}" y="${ys(0)+34}" text-anchor="middle" class="n">${v}</text>`;
  for(let v=2;v<=10;v+=2) g+=`<text x="${xs(0)-16}" y="${ys(v)+8}" text-anchor="end" class="n">${v}</text>`;
  g+=`<text x="${xs(8)+40}" y="${ys(0)+9}" class="ax">X</text><text x="${xs(0)}" y="${ys(10)-38}" text-anchor="middle" class="ax">Y</text>`;
  if(points) X.forEach((x,i)=>{g+=`<circle cx="${xs(x)}" cy="${ys(Y[i])}" r="9" fill="${PT}" stroke="#fff" stroke-width="2"/>`;});
  return `<svg width="${W+30}" height="${H}" viewBox="0 0 ${W+30} ${H}">${g}</svg>`;
}
const table=`<table><tr><th class="h">X</th>${X.map(v=>`<td>${v}</td>`).join('')}</tr><tr><th class="h">Y</th>${Y.map(v=>`<td>${v}</td>`).join('')}</tr></table>`;
const css=`html,body{margin:0;background:transparent}.n{font:600 26px 'DejaVu Sans';fill:${BR}}.ax{font:italic 700 30px 'DejaVu Serif';fill:${BR}}
table{border-collapse:separate;border-spacing:0;direction:rtl;font:600 34px 'DejaVu Sans';color:${BR};border:3px solid ${BR};border-radius:16px;overflow:hidden;background:#fff}
td,th{width:120px;height:74px;text-align:center;border-left:2px solid #c9b2a2;border-bottom:2px solid #c9b2a2}
tr:last-child td,tr:last-child th{border-bottom:none} td:last-child{border-left:none}
th.h{background:#f3e7de;font:italic 700 38px 'DejaVu Serif';width:100px}
#w{display:inline-block;padding:10px}`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:3});
for(const [name,body] of [['table',table],['grid-empty',grid(false)],['grid-solved',grid(true)]]){
 await p.setContent(`<html><head><style>${css}</style></head><body><div id="w">${body}</div></body></html>`);
 await (await p.$('#w')).screenshot({path:`${G}/t413-${name}.png`,omitBackground:true});}
await b.close();})();
