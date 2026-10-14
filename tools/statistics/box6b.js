const { chromium } = require('playwright'); const fs=require('fs'); const G=__dirname;
const W=1100,H=260,L=40,R=40, lo=-5, hi=30, fx0=30, fx1=W-30, fy0=20, fy1=190;
const X=v=>L+20+(v-lo)/(hi-lo)*(W-L-R-40);
const by=125, bh=26; let s='';
s+=`<rect x="${fx0}" y="${fy0}" width="${fx1-fx0}" height="${fy1-fy0}" fill="none" stroke="#000" stroke-width="2"/>`;
for(let v=lo;v<=hi;v++){s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${fy1}" y2="${fy1+7}" stroke="#000" stroke-width="1.5"/><text x="${X(v)}" y="${fy1+26}" text-anchor="middle" class="n">${v}</text>`;}
s+=`<line x1="${X(4)}" x2="${X(8)}" y1="${by}" y2="${by}" stroke="#000" stroke-width="3"/><line x1="${X(16)}" x2="${X(25)}" y1="${by}" y2="${by}" stroke="#000" stroke-width="3"/>`;
for(const v of [4,25]) s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${by-14}" y2="${by+14}" stroke="#000" stroke-width="3"/>`;
s+=`<rect x="${X(8)}" y="${by-bh}" width="${X(16)-X(8)}" height="${bh*2}" fill="#fff" stroke="#000" stroke-width="3"/><line x1="${X(10)}" x2="${X(10)}" y1="${by-bh}" y2="${by+bh}" stroke="#000" stroke-width="3"/>`;
const sub=(a,b)=>`${a}<tspan baseline-shift="sub" font-size="70%">${b}</tspan>`;
for(const [v,l] of [[4,sub('x','s')],[8,sub('Q','1')],[10,sub('Q','2')],[16,sub('Q','3')],[25,sub('x','l')]]) s+=`<text x="${X(v)}" y="${by-bh-14}" text-anchor="middle" class="lb">${l}</text>`;
for(const [v,l] of [[-4,'LF'],[28,'HF']]){s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${by-16}" y2="${fy1}" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${X(v)}" y="${by-bh-14}" text-anchor="middle" class="lb">${l}</text>`;}
const html=`<html><head><style>body{margin:0;background:#fff}
.n{font-family:'DejaVu Sans';font-size:15px;fill:#000}.lb{font-family:'DejaVu Serif';font-style:italic;font-size:22px;fill:#000}</style></head>
<body><svg width="${W}" height="${H}">${s}</svg></body></html>`;
fs.writeFileSync(G+'/box6b.html',html);
(async()=>{const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await br.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
await p.goto('file://'+G+'/box6b.html');await p.screenshot({path:G+'/../box6b.png'});await br.close();})();
