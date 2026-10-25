// قانونا سبيرمان: الدقيق rs = r(Rx, Ry) والمختصر [4-4] — صورة شفافة بالبني الغامق (نفس ستايل قانون بيرسون)
const { chromium } = require('playwright'); const fs=require('fs');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const BR='#4a220a';
const K=t=>katex.renderToString(t,{displayMode:true,output:'html'});
const f1=K(String.raw`r_s=r\left(R_x,R_y\right)`), f2=K(String.raw`r_s=1-\dfrac{6\sum d_i^{2}}{n\left(n^{2}-1\right)}`);
const f=`${OUT}/_fs.html`;
fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>html,body{margin:0;background:transparent}
#f{display:inline-flex;direction:rtl;align-items:center;gap:60px;padding:18px 30px;color:${BR};font-size:44px;-webkit-text-stroke:1.1px ${BR}}
.katex{direction:ltr}.katex-display{margin:0}.sep{width:0;align-self:stretch;border-left:4px dotted ${BR};-webkit-text-stroke:0}</style></head>
<body><div id="f"><div>${f1}</div><div class="sep"></div><div>${f2}</div></div></body></html>`);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:4});
await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);
await (await p.$('#f')).screenshot({path:`${OUT}/قانونا سبيرمان - الدقيق والمختصر - بني غامق بدون خلفية.png`,omitBackground:true});
fs.unlinkSync(f);await b.close();})();
