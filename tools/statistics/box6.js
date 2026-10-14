const { chromium } = require('playwright'); const fs=require('fs'); const G=__dirname;
const W=1100,H=600,L=60,R=60, lo=-5, hi=30;
const X=v=>L+(v-lo)/(hi-lo)*(W-L-R);
const ay=380, by=250, bh=36; // axis y, box center y
const PUR='#5b4b9e', RED='#c0392b', GRN='#2e8b57', INK='#22221f', MUT='#55554f', BLUE='#1e3a8a';
let s='';
// axis
s+=`<line x1="${X(lo)-10}" x2="${X(hi)+18}" y1="${ay}" y2="${ay}" stroke="#6b6b8a" stroke-width="3"/><path d="M${X(hi)+28},${ay} l-14,-8 v16 Z" fill="#6b6b8a"/>`;
for(let v=lo;v<=hi;v++){const t=v%5===0;s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${ay-(t?9:6)}" y2="${ay+(t?9:6)}" stroke="#6b6b8a" stroke-width="${t?2:1.3}"/>`; if((t&&v!==5&&v!==15)||[4,8,10,16,25,28,-4].includes(v)) s+=`<text x="${X(v)}" y="${ay+32}" text-anchor="middle" class="n${[4,8,10,16,25,28,-4].includes(v)?' b':''}">${v}</text>`;}
// key points on axis
for(const [v,c] of [[4,RED],[8,RED],[10,RED],[16,RED],[25,RED],[28,GRN],[-4,GRN]]) s+=`<circle cx="${X(v)}" cy="${ay}" r="6" fill="${c}"/>`;
// whiskers
s+=`<line x1="${X(4)}" x2="${X(8)}" y1="${by}" y2="${by}" stroke="${RED}" stroke-width="4"/><line x1="${X(16)}" x2="${X(25)}" y1="${by}" y2="${by}" stroke="${RED}" stroke-width="4"/>`;
for(const v of [4,25]) s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${by-14}" y2="${by+14}" stroke="${RED}" stroke-width="4"/>`;
// box
s+=`<rect x="${X(8)}" y="${by-bh}" width="${X(16)-X(8)}" height="${bh*2}" fill="#eceaf7" stroke="${PUR}" stroke-width="3.5"/><line x1="${X(10)}" x2="${X(10)}" y1="${by-bh}" y2="${by+bh}" stroke="${RED}" stroke-width="4"/>`;
// labels above box
for(const [v,l] of [[4,'x<tspan baseline-shift="sub" font-size="70%">s</tspan>'],[8,'Q<tspan baseline-shift="sub" font-size="70%">1</tspan>'],[10,'Q<tspan baseline-shift="sub" font-size="70%">2</tspan>'],[16,'Q<tspan baseline-shift="sub" font-size="70%">3</tspan>'],[25,'x<tspan baseline-shift="sub" font-size="70%">l</tspan>']]) s+=`<text x="${X(v)}" y="${ay-22}" text-anchor="middle" class="lb">${l}</text>`;
for(const [v,l] of [[28,'HF'],[-4,'LF']]) s+=`<text x="${X(v)}" y="${ay-22}" text-anchor="middle" class="lb" fill="${GRN}">${l}</text>`;
// distance braces inside/above box
const dim=(a,b,y,txt,c)=>`<line x1="${X(a)+3}" x2="${X(b)-3}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="2" marker-start="url(#m${c.slice(1)})" marker-end="url(#m${c.slice(1)})"/><text x="${(X(a)+X(b))/2}" y="${y-10}" text-anchor="middle" class="d" fill="${c}">${txt}</text>`;
s+=dim(8,10,by-bh-22,'2',BLUE)+dim(10,16,by-bh-22,'6',BLUE);
s+=dim(4,8,by+bh+30,'4',RED)+dim(16,25,by+bh+30,'9',RED);
const mk=c=>`<marker id="m${c.slice(1)}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 Z" fill="${c}"/></marker>`;
const html=`<html><head><style>
@font-face{font-family:ar;src:url(file://${G}/cairo-bold.ttf)}
body{margin:0;background:#ffffff;font-family:ar,'DejaVu Sans',sans-serif}
.n{font-family:'DejaVu Sans';font-size:17px;fill:${MUT}} .b{fill:${INK};font-weight:bold}
.lb{font-family:'DejaVu Serif';font-style:italic;font-size:24px;fill:${INK}}
.d{font-family:'DejaVu Sans';font-weight:bold;font-size:20px}
.t{font-size:27px;fill:${INK}} .k{font-size:20px} .c{font-size:25px}
</style></head><body><svg width="${W}" height="${H}">
<defs>${mk(BLUE)}${mk(RED)}</defs>
<text x="${W/2}" y="46" text-anchor="middle" class="t">المخطط الصندوقي (السؤال الأول – فقرة 6)</text>
<text x="${W/2}" y="86" text-anchor="middle" style="font-family:'DejaVu Sans';font-size:19px" fill="${MUT}" direction="ltr">x<tspan baseline-shift="sub" font-size="70%">s</tspan> = 4 ,  Q<tspan baseline-shift="sub" font-size="70%">1</tspan> = 8 ,  Q<tspan baseline-shift="sub" font-size="70%">2</tspan> = 10 ,  Q<tspan baseline-shift="sub" font-size="70%">3</tspan> = 16 ,  x<tspan baseline-shift="sub" font-size="70%">l</tspan> = 25 ,  HF = 28 ,  LF = −4</text>
${s}
<text x="${W-40}" y="470" text-anchor="start" class="k" fill="${BLUE}" direction="rtl">داخل الصندوق: الوسيط أقرب إلى Q₁ (2 < 6)</text>
<text x="${W-40}" y="505" text-anchor="start" class="k" fill="${RED}" direction="rtl">الشعيرة اليمنى أطول من اليسرى (9 > 4) ← الذيل جهة اليمين</text>
<text x="${W-40}" y="560" text-anchor="start" class="c" fill="${INK}" direction="rtl">إذن التوزيع <tspan fill="${RED}">ملتوٍ نحو اليمين</tspan> (التواء موجب)</text>
</svg></body></html>`;
fs.writeFileSync(G+'/box6.html',html);
(async()=>{const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await br.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
await p.goto('file://'+G+'/box6.html');await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:G+'/../box6.png'});await br.close();})();
