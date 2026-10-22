#!/bin/sh
# يبني questions.js من parts/s1.js s2.js s3.js
cd "$(dirname "$0")"
{
cat <<'H'
/* أسئلة فجب 101 — جزئية الميد (مولّد من parts/ — عدّل parts/sN.js ثم شغّل build_questions.sh)
   M(جلسة, سؤال, [الإجابة الصحيحة أولاً, ...بقية الخيارات])  ← الخيارات تنخلط تلقائياً في الموقع
   T(جلسة, عبارة)                 ← صح
   F(جلسة, عبارة, التصحيح)        ← خطأ (مع تصحيح العبارة)
*/
(function(){
const Q=[];
const M=(s,q,o)=>Q.push({s,t:'mc',q,o});
const T=(s,q)=>Q.push({s,t:'tf',q,a:true});
const F=(s,q,c)=>Q.push({s,t:'tf',q,a:false,c});
H
for s in 1 2 3; do echo; echo "/* ═══════════════ الجلسة $s ═══════════════ */"; cat parts/s$s.js; done
echo
echo 'window.QUESTIONS=Q;'
echo '})();'
} > questions.js
