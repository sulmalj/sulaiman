#!/bin/sh
# يبني questions.js من parts/u01.js … u12.js
cd "$(dirname "$0")"
{
cat <<'H'
/* أسئلة تدريبات سلم 100 — دراسات في السيرة النبوية (مولّد من parts/ — عدّل parts/uNN.js ثم شغّل build_questions.sh)
   M(وحدة, صفحة الكتاب, سؤال, [الإجابة الصحيحة أولاً, ...بقية الخيارات], شرح)
   الخيارات تنخلط في الموقع، و«ليس مما سبق» / «جميع ما سبق/ذكر» تبقى آخر خيار.
*/
(function(){
const Q=[];
const M=(u,p,q,o,e)=>Q.push({u,p,q,o,e});
H
for f in parts/u*.js; do echo; echo "/* ═══════════════ $(basename $f .js) ═══════════════ */"; cat "$f"; done
echo
echo 'window.QUESTIONS=Q;'
echo '})();'
} > questions.js
