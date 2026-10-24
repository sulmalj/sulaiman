const { chromium } = require('playwright'); const katex=require('/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/kx/node_modules/katex/dist/katex.js'); const fs=require('fs');
const tex=String.raw`r=\dfrac{n\displaystyle\sum_{i=1}^{n}x_iy_i-\sum_{i=1}^{n}x_i\sum_{i=1}^{n}y_i}{\sqrt{n\displaystyle\sum_{i=1}^{n}x_i^{2}-\left(\sum_{i=1}^{n}x_i\right)^{2}}\;\sqrt{n\displaystyle\sum_{i=1}^{n}y_i^{2}-\left(\sum_{i=1}^{n}y_i\right)^{2}}}`;
const html=katex.renderToString(tex,{displayMode:true,output:'html'});
const page=`<html><head><link rel="stylesheet" href="file:///tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/kx/node_modules/katex/dist/katex.min.css"><style>html,body{margin:0;background:transparent}
#f{display:inline-block;padding:18px 24px;color:#603b28;font-size:44px;-webkit-text-stroke:1.1px #603b28}.katex-display{margin:0}</style></head><body><div id="f">${html}</div></body></html>`;
fs.writeFileSync('/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/formula.html',page);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:4});
await p.goto('file:///tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/formula.html');await p.evaluate(()=>document.fonts.ready);
await (await p.$('#f')).screenshot({path:'/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/formula.png',omitBackground:true});await b.close();})();
