// قانون r بالدرجات المعيارية [4-1] — صورة شفافة بالبني الغامق (نفس صورة قانون بيرسون)
const { chromium } = require('playwright'); const fs=require('fs');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const BR='#4a220a';
const tex=String.raw`r=\dfrac{1}{n-1}\displaystyle\sum_{i=1}^{n}Z_{x_i}\cdot Z_{y_i}`;
const html=katex.renderToString(tex,{displayMode:true,output:'html'});
const f=`${OUT}/_fz.html`;
fs.writeFileSync(f,`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>html,body{margin:0;background:transparent}
#f{display:inline-block;padding:18px 24px;color:${BR};font-size:44px;-webkit-text-stroke:1.1px ${BR}}.katex-display{margin:0}</style></head><body><div id="f">${html}</div></body></html>`);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:4});
await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);
await (await p.$('#f')).screenshot({path:`${OUT}/قانون r بالدرجات المعيارية - بني غامق بدون خلفية.png`,omitBackground:true});
fs.unlinkSync(f);await b.close();})();
