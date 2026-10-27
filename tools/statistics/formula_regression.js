// قوانين الانحدار 4.3: Ŷ = a + bX ، b بالمجاميع ، a = ȳ − b x̄ — صور شفافة بالبني الغامق (Σ بدون حدود)
const { chromium } = require('playwright'); const fs=require('fs');
const KX=process.env.KATEX_DIR; const katex=require(KX+'/dist/katex.js'); const OUT=process.argv[2]||__dirname;
const BR='#4a220a';
const F={
  'معادلة الانحدار': String.raw`\hat{Y}=a+bX`,
  'الميل b': String.raw`b=\dfrac{n\sum xy-\sum x\sum y}{n\sum x^{2}-\left(\sum x\right)^{2}}`,
  'المقطع a': String.raw`a=\bar{y}-b\,\bar{x}`,
};
const k=t=>katex.renderToString(t,{displayMode:true,output:'html'});
const page=body=>`<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${KX}/dist/katex.min.css"><style>html,body{margin:0;background:transparent}
#f{display:inline-flex;flex-direction:column;align-items:center;gap:34px;padding:18px 24px;color:${BR};font-size:44px;-webkit-text-stroke:1.1px ${BR}}.katex-display{margin:0}</style></head><body><div id="f">${body}</div></body></html>`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({deviceScaleFactor:4});
const shots=[['قوانين الانحدار الثلاثة',Object.values(F).map(k).join('')],...Object.entries(F).map(([n,t])=>[`قانون ${n}`,k(t)])];
for(const [name,body] of shots){const f=`${OUT}/_freg.html`;fs.writeFileSync(f,page(body));
await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);
await (await p.$('#f')).screenshot({path:`${OUT}/${name} - بني غامق بدون خلفية.png`,omitBackground:true});fs.unlinkSync(f);}
await b.close();})();
