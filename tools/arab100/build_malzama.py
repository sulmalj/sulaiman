"""يبني ملزمة عرب 100 (مهارات الكتابة — جزئية الميد) من الكتاب الجديد بنفس تصميم الملزمة القديمة.

- الغلاف وصفحة المقدمة منسوخة من الملزمة القديمة (`base/cover-intro.pdf`).
- كل صفحة محتوى = خلفية الملزمة القديمة نفسها (`base/page-base.pdf`: الإطار الكريمي، «عرب 100»، شعار عدل، الخط،
  وعبارة «لا احلل نشر…») + المحتوى الجديد (HTML ← PDF عبر Chromium) + تذييل (عنوان الدرس ورقم الصفحة).
- الدروس في `content/NN-*.html` (أول سطر تعليق فيه عنوان التذييل)، وبنوك الأسئلة (التجميعات) في `bank/NN-*.txt`
  بقالب «تدريبات» ملزمة النهج: صندوق لكل سؤال + الجواب في دائرة على اليسار + «التصحيح» لأسئلة صح/خطأ.

الاستخدام:
  python3 tools/arab100/build_malzama.py store/arab100/malzama-mid-new.pdf
  python3 tools/arab100/build_malzama.py out.pdf --only 01   # درس واحد للمعاينة

الخطوط: خطوط الملزمة الأصلية (Childos Arabic و 29LT Azer) تجارية؛ البديل Readex Pro في `fonts/`
(اخترناه لأنه يرسم الحروف والحركات صح؛ Baloo كان يشوّه «لى» و«الإملائي»، وAlexandria يرسم خط قاعدة كأنه تسطير).
لو توفرت ملفات الخطوط الأصلية: حطها في `fonts/` وعدّل FONT_BODY / FONT_HEAD تحت.
"""
import argparse, base64, html, pathlib, re, sys, tempfile
import pymupdf
from playwright.sync_api import sync_playwright
import frontmatter as fm

HERE = pathlib.Path(__file__).resolve().parent
FONTS = HERE / "fonts"
BASE = HERE / "base" / "page-base.pdf"
BASE_BANK = HERE / "base" / "page-base-bank.pdf"  # بدون الترويسة (مثل صفحات تدريبات النهج)
COVER = HERE / "base" / "cover-intro.pdf"
LOGO = HERE.parent / "statistics" / "logo-adl.png"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
W, H = 595.5, 842.25
TOP_M, BOT_M = 96, 54  # هوامش صفحة الدرس: مسافة واضحة تحت خط الترويسة وفوق رقم الصفحة
FONT_BODY = "Readex Pro"
FONT_HEAD = "Readex Pro"


def font_faces():
    out, weights = [], []
    for f in sorted(FONTS.glob("*.ttf")):
        fam, wt = f.stem.rsplit("-", 1)
        if fam == "Amiri":
            continue
        fam = {"Readex": "Readex Pro"}.get(fam, fam)
        if fam == "Readex Pro":
            weights.append(wt)
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{wt};src:url('{f.as_uri()}') format('truetype');}}")
    # القوسان المزخرفان ﴿ ﴾: Readex يرسمهم أقواس عادية، فناخذ هالحرفين من Amiri
    # (نفس العائلة والوزن + unicode-range، والوجه اللي ينكتب آخر يتقدّم لهالحرفين)
    amiri = FONTS / "Amiri-Regular.ttf"
    if amiri.exists():
        for wt in weights:
            out.append(f"@font-face{{font-family:'Readex Pro';font-weight:{wt};src:url('{amiri.as_uri()}') format('truetype');"
                       "unicode-range:U+FD3E-FD3F;}")
    return "\n".join(out)


CSS = f"""
{font_faces()}
/* Chrome يقص أي شي يطلع عن منطقة المحتوى؛ نخلي 4pt زيادة على الجنبين (حشوة للـbody) عشان الدوائر والخلفيات ما تنقص */
/* (طلب المستخدم) الكلام ما يلصق بخط الترويسة فوق (الخط عند 69pt) ولا برقم الصفحة تحت */
@page {{ size:{W}pt {H}pt; margin:{TOP_M}pt 9pt {BOT_M}pt 9pt; }}
:root {{ --brown:#603b28; --term:#cc6e53; --mithl:#db526f; --ex:#527c82; --sec:#ad7c95; --sub:#844f6a;
        --teal:#41848d; --hl:#f2e6dd; --pill:#f5e6d9; --blue:#325c8e; }}
* {{ box-sizing:border-box; }}
html,body {{ margin:0; background:transparent; color:var(--brown); font-family:'{FONT_BODY}'; font-weight:600;
            font-size:12pt; line-height:1.65; direction:rtl; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ padding:0 4pt; }}
p {{ margin:0; }}
.sec {{ color:var(--sec); font-size:14.5pt; margin:44pt 0 8pt; break-after:avoid; }}
body > .sec:first-child, body > .keep:first-child > .sec {{ margin-top:2pt; }}
/* عنوان القسم: نقطة + خط ناعم يكمل لآخر السطر */
.sec {{ display:flex; align-items:center; }}
.sec::after {{ content:''; flex:1; height:1.6pt; margin-right:10pt; border-radius:2pt;
              background:linear-gradient(to left, #e6cfd9, rgba(230,207,217,0)); }}
.sub {{ width:fit-content; border-bottom:2pt solid #efdccf; padding-bottom:1pt; }}
.lessonhead {{ border-right:5pt solid #325c8e; padding:2pt 12pt 4pt; margin:0 0 4pt; }}
.lessonhead small {{ display:inline-block; background:#f5e6d9; color:#844f6a; font-size:10.5pt; border-radius:10pt; padding:1pt 10pt; }}
.lessonhead b {{ display:block; color:#89543d; font-weight:700; font-size:18pt; line-height:1.5; margin-top:2pt; }}
/* النقطة حرف (●) مو شكل مرسوم: بعض برامج قراءة الـPDF تقص الأشكال الصغيرة */
.sec::before {{ content:'●'; font-family:'DejaVu Sans',sans-serif; font-size:7pt; color:var(--sec); margin-left:9pt; vertical-align:2pt; }}
/* العنوان الرئيسي اللي تحته «أولًا/ثانيًا…» (طلب المستخدم): في النص، بدون الدائرة والخط، وبلون مختلف (كحلي الجداول) */
.sec.main {{ display:block; text-align:center; color:var(--blue); font-size:16.5pt; margin:44pt 0 12pt; }}
.sec.main::before {{ content:none; }}
.sec.main::after {{ content:''; display:block; width:56pt; height:2.2pt; margin:5pt auto 0; border-radius:2pt; background:#c9d6e6; flex:none; }}
.sub {{ color:var(--sub); font-size:13.4pt; margin:34pt 0 6pt; break-after:avoid; }}
/* عنوان ثالث (مثل «■ حذف الهمزة من أول الكلمة» في الكتاب) */
.sub2 {{ color:var(--term); font-size:12.6pt; margin:26pt 0 6pt; break-after:avoid; }}
.sub2::before {{ content:'■'; font-family:'DejaVu Sans',sans-serif; font-size:7.5pt; color:var(--sub); margin-left:7pt; vertical-align:2pt; }}
.term {{ color:var(--term); }}
.m {{ color:var(--mithl); }}
.ex {{ color:var(--ex); }}
.red {{ color:var(--mithl); }}
/* (طلب المستخدم: «ما أحب زحمة بالصفحة») مسافة واضحة بين كل فقرة ونقطة — حتى لو زادت الصفحات */
.ln {{ display:block; margin:17pt 0; break-inside:avoid; line-height:2.1; }}
/* الخلفية تمشي مع النص سطر سطر وتوقف عند آخر كلمة (مثل الملزمة القديمة) */
.ln > .hl {{ background:var(--hl); padding:3pt 9pt; border-radius:3pt; -webkit-box-decoration-break:clone; box-decoration-break:clone; }}
.pill {{ background:var(--pill); border-radius:22pt; padding:7pt 16pt; margin:14pt 0 16pt; break-inside:avoid; text-align:justify; text-align-last:right; }}
.dots {{ border:0; border-top:2.2pt dotted var(--brown); opacity:.55; margin:16pt 0; }}
ol.n, ul.b {{ margin:3pt 0; padding-right:16pt; }}
ol.n > li, ul.b > li {{ margin:10pt 0; break-inside:avoid; }}
/* (لما يطلبها المستخدم بس) قائمة ببندين في كل سطر عشان توفير مساحة */
ul.b.two {{ display:grid; grid-template-columns:1fr 1fr; column-gap:28pt; padding-right:16pt; }}
ul.b.two > li {{ margin:2pt 0; }}
/* (استثناء بطلب المستخدم لصفحة معيّنة) مسافات أضيق شوي عشان يدخل قسم كامل في الصفحة */
.sec.tz {{ margin-top:26pt; }} .sub.tz {{ margin-top:16pt; }} .sub2.tz {{ margin-top:12pt; }}
.ln.tz {{ margin:9pt 0; }} .pill.tz {{ margin:6pt 0 8pt; }} .bul.tz {{ margin:8pt 0; }}
ul.b.tz > li {{ margin:5pt 0; }} table.t.tz {{ margin:8pt 0 4pt; }}
/* (استثناء بطلب المستخدم) يبدأ صفحة جديدة */
.pb {{ break-before:page; margin-top:0 !important; }}
/* (استثناء بطلب المستخدم: «توزعهم على الصفحة») مسافات أوسع شوي في صفحات فيها قسمين بس */
ul.b.rm > li {{ margin:20pt 0; }} .bul.rm {{ margin:24pt 0; }} .sec.rm:not(.pb) {{ margin-top:62pt; }} .lead.rm {{ margin:16pt 0 6pt; }}
/* سطر تمهيدي قبل قائمة (مثل «ومن مبادئها الأساسية:») بلون غير لون بنود القائمة */
.lead {{ color:var(--blue); font-weight:700; margin:10pt 0 4pt; }}
/* القائمة تنقسم بين البنود إذا طالت (القصيرة — 3 بنود أو أقل — تبقى مع بعض) */
ol.n, ul.b {{ break-inside:auto; }}
ol.n:not(:has(> li:nth-child(4))), ul.b:not(:has(> li:nth-child(4))) {{ break-inside:avoid; }}
ul.b > li::marker {{ color:var(--sec); }}
/* الترقيم مثل الكتاب: «١- ٢- ٣-» (أرقام عربية وشرطة) بدل «1. 2.» */
ol.n {{ list-style:arabic-indic; }}
ol.n > li::marker {{ content:counter(list-item, arabic-indic) "- "; color:var(--term); font-weight:700; }}
/* (مراجعة) آخر بند ما ينزل لحاله للصفحة الجاية */
ol.n > li:last-child, ul.b > li:last-child {{ break-before:avoid; }}
.cards {{ display:flex; gap:8pt; margin:6pt 0; break-inside:avoid; }}
.cards > div {{ flex:1; text-align:center; }}
.dot {{ display:block; width:15pt; height:15pt; border-radius:50%; margin:0 auto 4pt; }}
.d1 {{ background:#e3a594; }} .d2 {{ background:#f0c98d; }} .d3 {{ background:#8db3b3; }} .d4 {{ background:#bb9cae; }}
.bul {{ display:flex; gap:8pt; align-items:flex-start; margin:15pt 0; break-inside:avoid; }}
.bul > .dot {{ flex:none; margin:3pt 0 0; width:13pt; height:13pt; }}
table.t {{ width:100%; border-collapse:separate; border-spacing:0; margin:16pt 0 18pt; font-size:11.6pt; line-height:1.45;
           border:1pt solid #d9c2b1; border-radius:9pt; overflow:hidden; }}
table.t th {{ background:var(--blue); color:#fff; font-family:'{FONT_HEAD}'; font-weight:700; font-size:11.6pt; padding:5pt 6pt; border-left:1pt solid #4a73a3; }}
table.t th:last-child, table.t td:last-child {{ border-left:0; }}
table.t td {{ padding:4pt 6pt; border-top:1pt solid #e2cfc1; border-left:1pt solid #e2cfc1; text-align:center; vertical-align:middle; background:#fdf8f3; }}
table.t tr:nth-child(even) td {{ background:#f6ece4; }}
table.t tr {{ break-inside:avoid; }}
/* الجدول الطويل اللي ينقسم: ما يبقى صف أو صفين لحالهم أول الجدول أو آخره */
table.t tbody tr:nth-child(-n+3), table.t tbody tr:nth-last-child(-n+2) {{ break-before:avoid; }}
table.t td.r {{ text-align:right; }}
/* جدول عناوينه في العمود الأول (مثل جدول حالات التاء والهاء في الكتاب) */
table.t.side th {{ width:27%; border-top:1pt solid #4a73a3; }}
table.t.side tr:first-child th {{ border-top:0; }}
/* (مراجعة) الجدول اللي ينقسم بين صفحتين كان إطاره الخارجي يبقى مفتوح ويمتد فاضي لآخر الصفحة —
   الحين الإطار مرسوم على الخلايا نفسها: كل صف يقفل نفسه من تحت، والزوايا الدائرية على أول وآخر صف */
table.t {{ border:0 !important; border-radius:0 !important; overflow:visible !important; }}
table.t td {{ border-top:0 !important; border-bottom:1pt solid #e2cfc1; }}
table.t tr > :first-child {{ border-right:1pt solid #d9c2b1 !important; }}
table.t tr > :last-child {{ border-left:1pt solid #d9c2b1 !important; }}
table.t tr:first-child > :first-child {{ border-top-right-radius:9pt; }}
table.t tr:first-child > :last-child {{ border-top-left-radius:9pt; }}
table.t tr:last-child > :first-child {{ border-bottom-right-radius:9pt; }}
table.t tr:last-child > :last-child {{ border-bottom-left-radius:9pt; }}
table.t tr:first-child > td {{ border-top:1pt solid #d9c2b1 !important; }}
table.t td.no {{ width:20pt; }}
/* الخط تحت الكلمة كاملة (بدون ما يتقطع عند الياء) وينزل تحت نقاطها عشان ما يغطيها — طلب المستخدم */
.u {{ text-decoration:underline; text-decoration-thickness:0.8pt; text-underline-offset:0.56em; text-decoration-skip-ink:none; }}
/* السطر اللي فيه كلمة تحتها خط ياخذ مسافة أكبر شوي عشان الخط ما ينزل على السطر اللي تحته (طلب المستخدم) */
td:has(.u), li:has(.u), .note:has(.u), .bul > div:has(.u), .ln:has(.u) {{ line-height:2.1; }}
.note {{ border-right:4pt solid var(--blue); background:var(--hl); padding:6pt 10pt; margin:16pt 0; break-inside:avoid; border-radius:3pt; text-align:justify; text-align-last:right; }}
.keep {{ break-inside:avoid; }}
.card {{ background:var(--hl); padding:6pt 10pt; margin:8pt 0; border-radius:3pt; break-inside:avoid; }}
table.t.short {{ break-inside:avoid; }}
.two {{ display:flex; gap:14pt; break-inside:avoid; }}
.two > div {{ flex:1; }}
.hd {{ color:var(--teal); text-align:center; margin-bottom:2pt; }}
.pb {{ break-before:page; }}
.avoid {{ break-inside:avoid; }}
"""

BANK_CSS = """
.page { width:595.5pt; height:842.25pt; position:relative; break-after:page; overflow:hidden; }
.page:last-child { break-after:auto; }
.wm { position:absolute; left:50%; top:47%; width:380pt; transform:translate(-50%,-50%); opacity:.07; }
.qs { position:absolute; top:14pt; bottom:44pt; left:12pt; right:12pt; display:flex; flex-direction:column; justify-content:flex-start; gap:7.5pt; }
.q { display:flex; align-items:center; gap:14pt; }
.ans { flex:none; width:36pt; height:36pt; border-radius:50%; background:#8a6455; color:#fff; display:flex; align-items:center;
       justify-content:center; font-size:17pt; font-weight:700; padding-top:2pt; }
/* كل حرف شكله غير (الباء والجيم تحتها نقطة/ذيل)، فنحركه عشان يجي بالضبط في نص الدائرة (طلب المستخدم) */
.ans span { position:relative; }
.ans .L0 { top:1.9pt; } .ans .L1 { top:-5pt; } .ans .L2 { top:-6.7pt; } .ans .L3 { top:-2.3pt; }
.box { flex:1; border:1.6pt solid #603b28; border-radius:7pt; overflow:hidden; font-family:'%HEAD%'; font-weight:600; font-size:10pt; line-height:1.35; }
.box .qt { padding:4pt 8pt; color:#844f6a; border-bottom:1.2pt solid #603b28; }
.box .row { display:flex; border-bottom:1.2pt solid #603b28; }
.box .row:last-child { border-bottom:0; }
.box .op { flex:1; padding:3.5pt 8pt; color:#cc6e53; }
.box .op + .op { border-right:1.2pt solid #603b28; }
.box .fix { padding:3.5pt 8pt; color:#603b28; }
.box .fix b { color:#db526f; font-weight:700; }
"""


# العنوان ما ينفصل عن اللي تحته، والجدول القصير ما ينقسم بين صفحتين، والطويل يتكرر رأسه في الصفحة الثانية
KEEP_JS = """() => {
  for (const t of document.querySelectorAll('table.t')) {
    const first = t.querySelector('tr');
    if (first && first.querySelector('th') && !first.querySelector('td') && !t.tHead) { const h = t.createTHead(); h.appendChild(first); }
    // الجدول ما ينقسم بين صفحتين (طلب المستخدم) إلا إذا كان أطول من صفحة
    // (والجدول الطويل — أكثر من نص صفحة — يكمل تحت عنوانه ويتكرر رأسه، عشان ما تبقى نص صفحة فاضية)
    if (t.getBoundingClientRect().height < 470) t.classList.add('short');
  }
  for (const e of document.querySelectorAll('.ln')) {
    if (e.firstElementChild && e.firstElementChild.classList.contains('hl')) continue;
    const sp = document.createElement('span'); sp.className = 'hl';
    while (e.firstChild) sp.appendChild(e.firstChild);
    e.appendChild(sp);
  }
  const heads = [...document.body.children].filter(e => e.matches('.sec, .sub, .sub2, .lesson, .unit'));
  for (const h of heads) {
    const grp = document.createElement('div'); grp.className = 'keep';
    h.before(grp); grp.appendChild(h);
    let n = grp.nextElementSibling;
    // يمسك العنوان مع العنوان الفرعي اللي بعده ثم أول عنصر محتوى
    while (n && n.matches('.sub, .sec, .sub2, .lesson')) { const nx = n.nextElementSibling; grp.appendChild(n); n = nx; }
    // القائمة الطويلة (أكثر من 3 بنود) ما تنمسك كاملة مع العنوان — تنقسم بين البنود (العنوان + أول بندين ما ينفصلون)،
    // عشان ما تنزل القائمة كلها للصفحة الجاية وتخلي فراغ كبير (طلب المستخدم: «فراغات مبالغ فيها»)
    const longList = (e) => e && e.matches('ol.n, ul.b') && e.children.length > 3;
    const softKeep = (lst) => { grp.style.breakAfter = 'avoid'; lst.firstElementChild.style.breakAfter = 'avoid'; };
    if (longList(n)) softKeep(n);
    else if (n && !(n.matches('table') && !n.classList.contains('short'))) {
      let nx = n.nextElementSibling; grp.appendChild(n);
      // سطر قصير يشتغل كعنوان (مثل «١- من وسط الكلمة») ما يبقى لحاله تحت الصفحة
      if (n.matches('.ln') && n.textContent.trim().length < 40 && nx && !nx.matches('.sec, .sub, .sub2')
          && !(nx.matches('table') && !nx.classList.contains('short')) && !longList(nx)) { const nn = nx.nextElementSibling; grp.appendChild(nx); n = nx; nx = nn; }
      // سطر ينتهي بنقطتين (مثل «مثال:» أو «تحذف الواو في الحالات الآتية:») ما ينفصل عن اللي بعده
      if (n.matches('.ln') && /:\\s*$/.test(n.textContent) && nx && !nx.matches('.sec, .sub, .sub2')
          && !(nx.matches('table') && !nx.classList.contains('short'))) {
        if (longList(nx)) softKeep(nx); else grp.appendChild(nx);
      }
    }
  }
  // آخر نقطة (.bul) في مجموعة نقاط ما تنزل لحالها أول الصفحة
  for (const b of document.querySelectorAll('.bul')) {
    const nx = b.nextElementSibling;
    if (!(nx && nx.matches('.bul')) && b.previousElementSibling && b.previousElementSibling.matches('.bul')) b.style.breakBefore = 'avoid';
  }
  for (const p of [...document.querySelectorAll('body > .ln')]) {
    const nx = p.nextElementSibling;
    if (!nx || !/:\\s*$/.test(p.textContent) || nx.matches('.sec, .sub, .sub2, .keep')) continue;
    if (nx.matches('table') && !nx.classList.contains('short')) continue;
    const grp = document.createElement('div'); grp.className = 'keep';
    p.before(grp); grp.appendChild(p); grp.appendChild(nx);
  }
}"""


# ما نفتح سطر جديد عشان كلمة أو كلمتين: إذا آخر سطر في الفقرة قصير مرة، نضغط الفقرة شوي
# (مسافة الكلمات ثم حجم الخط بحد أقصى) لين يرجع الكلام سطر أقل؛ وإذا ما نفع نرجعها مثل ما كانت.
TIGHTEN_JS = """() => {
  const lineInfo = (el) => {
    const r = document.createRange(); r.selectNodeContents(el);
    const rects = [...r.getClientRects()].filter(x => x.width > 0.5 && x.height > 4);
    const rows = [];
    for (const x of rects) {
      let row = rows.find(o => Math.abs(o.top - x.top) < x.height * 0.5);
      if (!row) { row = {top: x.top, left: x.left, right: x.right}; rows.push(row); }
      row.left = Math.min(row.left, x.left); row.right = Math.max(row.right, x.right);
    }
    rows.sort((a, b) => a.top - b.top);
    return rows;
  };
  // (.passage .bl .qq .op .why .item: عناصر ملف الحلول)
  const els = document.querySelectorAll('.ln, .note, .pill, .card, li, .bul > div, td, .box .qt, .box .fix, .passage, .bl, .qq, .op, .why, .item > div');
  for (const el of els) {
    const rows = lineInfo(el);
    if (rows.length < 2) continue;
    const full = Math.max(...rows.map(o => o.right - o.left));
    const last = rows[rows.length - 1];
    if ((last.right - last.left) > full * 0.22) continue;
    const n0 = rows.length, fs0 = parseFloat(getComputedStyle(el).fontSize);
    const steps = [];
    // مسافة الكلمات تنقص شوي بس (أكثر من كذا تلتصق الكلمات العربية)، والباقي من حجم الخط
    for (const ws of [-0.3, -0.6]) steps.push([ws, 1]);
    // (مراجعة) التصغير كان ينلاحظ (لين 90%) — الحين بحد أقصى 3% بس
    for (const k of [0.985, 0.97]) for (const ws of [0, -0.6]) steps.push([ws, k]);
    let ok = false;
    for (const [ws, k] of steps) {
      el.style.wordSpacing = ws + 'pt';
      el.style.fontSize = (fs0 * k) + 'px';
      if (lineInfo(el).length < n0) { ok = true; break; }
    }
    if (!ok) { el.style.wordSpacing = ''; el.style.fontSize = ''; }
    else window.__fixed = (window.__fixed || 0) + 1;
  }
  return window.__fixed || 0;
}"""


# «لًا / لّا»: إذا كانت الحركة بين اللام والألف، خط Readex ما يركّب «لا» ويطلع اللام لاصق بالألف (المستخدم: «مو واضح»).
# نأخر الحركة بعد الألف عند الرسم بس (المصادر تبقى بحركات الكتاب) عشان تنرسم «لا» مركّبة والحركة فوقها.
LAM_ALEF = re.compile("ل([\u064B-\u0652]+)([اأإآ])")


def fix_lam_alef(s):
    return LAM_ALEF.sub(lambda m: "ل" + m.group(2) + m.group(1), s)


# توزيع المساحة في كل الصفحات (طلب المستخدم: «استغل المساحات بدل ما تحط الكلام تحت بعض»):
# - القسم: كل عنصر في body (العنوان مع اللي بعده عنصر واحد بسبب KEEP_JS) — علامته zzB.
# - البند: كل بند في قائمة مرقمة/منقطة ما عدا الأول — علامته zzI.
# markers: علامة نصية صغيرة أول كل واحد عشان نعرف من الـPDF مكانه؛ spread: {رقم: مسافة قبله pt}؛
# brk: رقم عنصر يبدأ صفحة جديدة (موازنة آخر صفحتين في الدرس).
SPREAD_JS = """(o) => {
  const items = [], z = parseFloat(getComputedStyle(document.body).zoom) || 1;
  const isHead = (c) => c.matches('.sec, .sub, .sub2') ||
    (c.matches('.keep') && c.firstElementChild && c.firstElementChild.matches('.sec, .sub, .sub2'));
  for (const c of [...document.body.children]) {
    if (c.tagName === 'STYLE' || c.tagName === 'SCRIPT') continue;
    items.push([isHead(c) ? 'H' : 'B', c]);
    // داخل مجموعة العنوان: الفقرات بعد أول فقرة تاخذ مسافات بعد (مثل البند ١ اللي ماسك في المقدمة)
    if (c.matches('.keep')) {
      const kids = [...c.children].filter(k => !k.matches('.sec, .sub, .sub2, .lesson, .unit'));
      for (const k of kids.slice(1)) if (k.matches('.ln, .bul, .note, p')) items.push(['C', k]);
    }
    for (const li of c.querySelectorAll(':scope li'))
      if (li.parentElement.matches('ol.n, ul.b') && li.previousElementSibling) items.push(['I', li]);
  }
  items.forEach(([kind, c], i) => {
    if (o.markers) {
      const host = c.matches('table') ? (c.querySelector('td, th') || c) : c;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const m = document.createElement('span');
      m.textContent = 'zz' + kind + i + 'zz';
      m.style.cssText = 'position:absolute;top:0;left:0;font:6px OpenSans;color:#000;direction:ltr;white-space:nowrap;text-decoration:none';
      host.appendChild(m);
    }
    const h = o.spread[String(i)];
    if (h) {
      // نقيس قبل وبعد عشان المسافة تزيد بالضبط h (الـmargins تندمج مع اللي قبلها، والـzoom يغيّر القياس)
      const want = h * 96 / 72 * z, top0 = c.getBoundingClientRect().top;
      const mt0 = parseFloat(getComputedStyle(c).marginTop) || 0;
      let add = h * 96 / 72;
      for (let t = 0; t < 4; t++) {
        c.style.marginTop = (mt0 + add) + 'px';
        const d = c.getBoundingClientRect().top - top0;
        if (Math.abs(d - want) < 0.3) break;
        add += (want - d) / z;
      }
    }
    // عنوان في أول الصفحة: ينزل شوي (margin يختفي أول الصفحة، فنستخدم padding)
    const pd = o.pad[String(i)];
    if (pd) c.style.paddingTop = pd + 'pt';
    if (o.brks.includes(i)) {
      c.style.breakBefore = 'page';
      // الكسر الإجباري يخلي مسافة العنوان فوق — نشيلها عشان ما ينزل العنوان بزيادة أول الصفحة
      c.style.marginTop = '0'; if (c.firstElementChild) c.firstElementChild.style.marginTop = '0';
      for (let a = c.parentElement; a && a !== document.body; a = a.parentElement) a.style.breakInside = 'auto';
    }
  });
}"""

TOP, BOT = TOP_M, H - BOT_M  # حدود منطقة المحتوى في صفحة الدرس
CAPH = BOT - TOP


def page_marks(pdf_path):
    """لكل صفحة: [(y, رقم, نوع)] وأسفل محتوى فيها. النوع: H عنوان، B قسم، I بند في قائمة."""
    out = []
    for pg in pymupdf.open(pdf_path):
        marks = sorted((w[1], int(re.search(r"\d+", w[4]).group()), w[4][2]) for w in pg.get_text("words")
                       if re.fullmatch(r"zz[BIHC]\d+zz", w[4]))
        bottoms = [b[3] for b in pg.get_text("blocks") if not re.fullmatch(r"\s*(zz[BIHC]\d+zz\s*)+", b[4])]
        bottoms += [x["rect"].y1 for x in pg.get_drawings()]
        out.append((marks, max(bottoms, default=TOP)))
    return out


def head_break(pages):
    """عنوان قسم في ربع الصفحة الأخير وكلامه يكمل في الصفحة اللي بعدها → ينزل مع قسمه للصفحة الجاية
    (طلب المستخدم: «المفروض تحطه بالصفحة اللي تحت»)."""
    # بس الأقسام (مو البنود والفقرات اللي داخل مجموعة العنوان)
    page_of = {i: pi for pi, (m, _) in enumerate(pages) for _, i, k in m if k in "BH"}
    for pi, (marks, _) in enumerate(pages[:-1]):
        for y, i, k in marks[1:]:
            if k != "H" or (y - TOP) < 0.85 * CAPH:
                continue
            nxt = min((j for j in page_of if j > i), default=None)
            if nxt is None or page_of[nxt] > pi:
                return i
    return None


def spread_map(pages, cap=44, cap_head=60, cap_item=24):
    """لكل صفحة فيها فراغ تحت: العنوان اللي أول الصفحة ينزل شوي، والباقي يتوزع بين الأقسام والبنود
    (القسم ياخذ ضعف البند). آخر صفحة في الدرس ما تتمطّط."""
    sp, pad = {}, {}
    for pi, (marks, bottom) in enumerate(pages):
        if pi == len(pages) - 1 or not marks:
            continue
        gap = BOT - bottom - 8
        if gap < 16:
            continue
        y0, i0, k0 = marks[0]
        if k0 == "H" and pi > 0:
            pad[str(i0)] = p0 = round(min(6, gap * 0.3), 1)
            gap -= p0
        rest = [(i, k) for _, i, k in marks[1:]]
        if not rest or gap < 16:
            continue
        # العنوان ياخذ 3 أضعاف البند، والقسم ضعفه
        units = sum({"I": 1, "B": 2, "C": 2, "H": 3}[k] for _, k in rest)
        u = gap / units
        for i, k in rest:
            sp[str(i)] = round({"I": min(cap_item, u), "B": min(cap, 2 * u), "C": min(cap, 2 * u), "H": min(cap_head, 3 * u)}[k], 1)
    return sp, pad


def balance_break(pages):
    """إذا آخر صفحة في الدرس شبه فاضية والصفحة اللي قبلها مليانة: نختار نقطة نبدأ منها صفحة جديدة
    عشان ينقسم الكلام على الصفحتين بالتساوي تقريباً (مثل: نقاط 7–8 من حالات الإدغام تنزل للصفحة الأخيرة)."""
    if len(pages) < 2:
        return []
    (pm, pb), (lm, lb) = pages[-2], pages[-1]
    used_l = lb - TOP
    # (طلب المستخدم) الكلام يمشي طبيعي ويعبّي الصفحة؛ نوازن بس إذا آخر صفحة فيها سطر أو سطرين
    if used_l / CAPH > 0.15 or (pb - TOP) / CAPH < 0.6 or not pm:
        return []
    cands = []
    for y, i, k in pm[1:]:
        moved = pb - y
        new_l = used_l + moved + 14
        if new_l > CAPH * 0.9 or moved < 60:
            continue
        cands.append((abs((y - TOP) - new_l), i))
    return [i for _, i in sorted(cands)]


def render(html_str, out_pdf, browser, spread=None, markers=False, brks=(), pad=None):
    html_str = fix_lam_alef(html_str)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_str)
        path = f.name
    # عرض الصفحة = عرض منطقة الطباعة بالضبط (الصفحة ناقص الهوامش) عشان قياس الأسطر يطابق الـPDF
    pg = browser.new_page(viewport={"width": round((W - 18) * 96 / 72), "height": 1100})
    pg.emulate_media(media="print")
    pg.goto(pathlib.Path(path).as_uri())
    pg.evaluate(KEEP_JS)
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(300)
    fixed = pg.evaluate(TIGHTEN_JS)
    if fixed:
        print(f"  {pathlib.Path(out_pdf).name}: انضمّت {fixed} كلمة يتيمة لسطرها")
    if spread or markers or brks or pad:
        pg.evaluate(SPREAD_JS, {"spread": spread or {}, "markers": markers, "brks": list(brks), "pad": pad or {}})
    pg.pdf(path=str(out_pdf), print_background=True, prefer_css_page_size=True)
    pg.close()


def last_page_fill(pdf_path):
    """نسبة المساحة المستخدمة في آخر صفحة (من أعلى منطقة المحتوى لأسفل عنصر فيها)."""
    d = pymupdf.open(pdf_path)
    pg = d[-1]
    bottoms = [b[3] for b in pg.get_text("blocks")] + [x["rect"].y1 for x in pg.get_drawings()]
    top, bot = TOP, BOT
    n = d.page_count
    return n, (max(bottoms, default=top) - top) / (bot - top)


def render_fit(src, out_pdf, browser):
    """ترتيب صفحات الدرس — أهم شي عند المستخدم: «ما أحب زحمة بالصفحة».
    1) ما نضغط الدرس أبداً عشان نوفّر صفحة.
    2) العنوان اللي يجي آخر الصفحة وكلامه يكمل بعدها ينزل للصفحة الجاية.
    3) إذا آخر صفحة شبه فاضية والقبلها مليانة، ينقسم الكلام بينهم.
    4) أي فراغ يبقى تحت صفحة يتوزع بين أقسامها، والعنوان اللي أول الصفحة ينزل شوي."""
    name = pathlib.Path(out_pdf).name
    css = ""
    render(doc(src), out_pdf, browser)
    trial = pathlib.Path(str(out_pdf) + ".fit.pdf")
    brks = []
    for _ in range(8):
        render(doc(src, css), trial, browser, markers=True, brks=brks)
        pages = page_marks(trial)
        hb = head_break(pages)
        if hb is None or hb in brks:
            break
        brks.append(hb)
    bb = None
    # الكسر اللي يبدأ آخر صفحة (عنوان نزل لها) ينشال لما نوازن، وإلا تبقى الصفحتين مقسومة عنده
    last_first = pages[-1][0][0][1] if pages[-1][0] else None
    base_brks = [b for b in brks if b != last_first]
    cands = balance_break(pages)[:4]
    tail = {i for m, _ in pages[-3:] for _, i, _ in m}
    if any(b in tail for b in brks):
        # أول: نجرب نشيل الكسور اللي في آخر 3 صفحات — إذا قلّت صفحة، أحسن من صفحات نصها فاضي (وبعدها نوازن)
        merged = [b for b in brks if b not in tail]
        render(doc(src, css), trial, browser, markers=True, brks=merged)
        p2 = page_marks(trial)
        if len(p2) < len(pages):
            brks, pages = merged, p2
            last_first = pages[-1][0][0][1] if pages[-1][0] else None
            base_brks = [b for b in brks if b != last_first]
            cands = balance_break(pages)[:4]
    for c in cands:
        render(doc(src, css), trial, browser, markers=True, brks=base_brks + [c])
        p2 = page_marks(trial)
        if len(p2) <= len(pages) and (p2[-1][1] - TOP) / CAPH > 0.45:
            bb, brks, pages = c, base_brks + [c], p2
            break
    where = {i: pi for pi, (m, _) in enumerate(pages) for _, i, _ in m}
    sp, pad = spread_map(pages)
    # (طلب المستخدم بعد ما أرسل ملزمة النهج كمرجع للمسافات) مسافات ثابتة في كل الصفحات، بدون تمطيط الفراغ بين الفقرات —
    # الفراغ اللي يبقى تحت الصفحة عادي. نخلي بس نزول العنوان اللي يبدأ الصفحة.
    sp = {}
    # نتأكد إن ولا قسم انتقل من صفحته بعد المسافات؛ والصفحة اللي انتقل منها شي بس تتصغّر مسافاتها
    # (قبل كانت أي مشكلة في صفحة وحدة تلغي المسافات في كل الدرس)
    factor = {pi: 1.0 for pi in range(len(pages))}
    for _ in range(6):
        sp_k = {i: round(h * factor[where[int(i)]], 1) for i, h in sp.items() if factor[where[int(i)]] > 0}
        pad_k = {i: round(h * factor[where[int(i)]], 1) for i, h in pad.items() if factor[where[int(i)]] > 0}
        render(doc(src, css), trial, browser, markers=True, spread=sp_k, brks=brks, pad=pad_k)
        now = {i: pi for pi, (m, _) in enumerate(page_marks(trial)) for _, i, _ in m}
        bad = {where[i] for i in where if now.get(i) != where[i]}
        if not bad:
            break
        for pi in bad:
            factor[pi] = 0 if factor[pi] < 0.3 else factor[pi] * 0.6
    render(doc(src, css), out_pdf, browser, spread=sp_k, brks=brks, pad=pad_k)
    msg = [f"{len(sp_k)} مسافة"] if sp_k else []
    if brks:
        msg.append(f"{len(brks) - (bb is not None)} عنوان نزل للصفحة الجاية" if len(brks) - (bb is not None) else "")
    if bb is not None:
        msg.append("توازنت آخر صفحتين")
    msg = [m for m in msg if m]
    if msg:
        print(f"  {name}: " + "، ".join(msg) + f" ({pymupdf.open(out_pdf).page_count} صفحات)")


def doc(body, extra_css=""):
    return f'<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>{CSS}{extra_css}</style></head><body>{body}</body></html>'


# ---------- بنك الأسئلة ----------
LETTERS = ["أ", "ب", "ج", "د"]


def parse_bank(path):
    """صيغة الملف: سؤال في سطر يبدأ بـ «س:»، ثم الخيارات «أ) …» «ب) …» …، ثم «ج:» الحرف الصحيح، و«ت:» التصحيح (اختياري).
    صح/خطأ: الخيارات «أ) صح» «ب) خطأ»."""
    qs, cur = [], None
    for raw in path.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s or s.startswith("#"):
            continue
        if s.startswith("س:"):
            cur = {"q": s[2:].strip(), "ops": [], "ans": None, "fix": None}
            qs.append(cur)
        elif re.match(r"^[أبجد]\)", s):
            cur["ops"].append(s[2:].strip())
        elif s.startswith("ج:"):
            cur["ans"] = s[2:].strip()
        elif s.startswith("ت:"):
            cur["fix"] = s[2:].strip()
        else:
            raise SystemExit(f"{path.name}: سطر غير مفهوم: {s}")
    for i, q in enumerate(qs, 1):
        if q["ans"] not in LETTERS[: len(q["ops"])]:
            raise SystemExit(f"{path.name} س{i}: الجواب «{q['ans']}» مو من الخيارات")
        tf = q["ops"] == ["صح", "خطأ"]
        if tf and q["ans"] == "ب" and not q["fix"]:
            raise SystemExit(f"{path.name} س{i}: عبارة خاطئة بدون تصحيح")
    return qs


def esc(s):
    s = html.escape(s)
    return re.sub(r"__(.+?)__", r'<span class="u">\1</span>', s)


def bank_html(qs, per_page=10):
    logo = "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode()
    pages = []
    for start in range(0, len(qs), per_page):
        items = []
        for n, q in enumerate(qs[start:start + per_page], start + 1):
            ops = [f'<div class="op">{LETTERS[i]} / {esc(o)}</div>' for i, o in enumerate(q["ops"])]
            rows = "".join(f'<div class="row">{"".join(ops[i:i + 2])}</div>' for i in range(0, len(ops), 2))
            fix = f'<div class="row"><div class="fix"><b>التصحيح:</b> {esc(q["fix"])}</div></div>' if q["fix"] else ""
            items.append(f'<div class="q"><div class="box"><div class="qt">{n}- {esc(q["q"])}</div>{rows}{fix}</div>'
                         f'<div class="ans"><span class="L{LETTERS.index(q["ans"])}">{q["ans"]}</span></div></div>')
        pages.append(f'<div class="page"><img class="wm" src="{logo}"><div class="qs">{"".join(items)}</div></div>')
    return "".join(pages)


# ---------- التذييل ----------
# عبارة أسفل يسار كل صفحة (بدل «لا احلل نشر او ارسال الملخص او جزء منه» اللي في خلفية الملزمة القديمة — طلب المستخدم)
FOOT_NOTE = "ملف خاص بالمشتركين · لا أحلل نشره"


def plain_base(path):
    """خلفية الملزمة بدون العبارة القديمة المطبوعة فيها (نكتب بدالها FOOT_NOTE في التذييل)."""
    d = pymupdf.open(path)
    pg = d[0]
    pg.add_redact_annot(pymupdf.Rect(10, 821, 207, 841), fill=False)
    pg.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    return d


def footers_html(items):
    pages = "".join(
        f'<div class="fp"><div class="ft">{html.escape(t)}</div>' + (f'<div class="pn">~{n}~</div>' if n else '')
        + f'<div class="lf">{FOOT_NOTE}</div></div>'
        for t, n in items)
    css = f"""@page{{size:{W}pt {H}pt;margin:0}}
.fp{{width:{W}pt;height:{H}pt;position:relative;break-after:page}} .fp:last-child{{break-after:auto}}
.ft{{position:absolute;right:9pt;bottom:7pt;width:262pt;text-align:right;font-family:'{FONT_HEAD}';font-weight:700;font-size:10.5pt;line-height:1.25;color:#603b28}}
.pn{{position:absolute;left:0;right:0;bottom:7pt;text-align:center;font-family:'OpenSans';font-weight:700;font-size:14pt;color:#111;direction:ltr}}
.lf{{position:absolute;left:12pt;bottom:7pt;width:200pt;text-align:left;font-family:'{FONT_HEAD}';font-weight:700;font-size:10pt;line-height:1.25;color:#603b28}}"""
    return f'<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>{font_faces()}{css}</style></head><body style="margin:0">{pages}</body></html>'


# ---------- ملف حلول التطبيقات ----------
APPS = HERE.parents[1] / "store" / "arab100" / "book" / "applications.md"
# بعده: تطبيقات الوحدتين الثالثة والرابعة، ثم أنشطة آخر الكتاب
EXTRA_APPS = [APPS.parent / "applications-u34.md", APPS.parent / "activities.md"]


def _inline(t):
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r'<span class="term">\1</span>', t)
    t = re.sub(r"✔\s*(.+)$", r'<span class="ok">✔ \1</span>', t)
    return t


def solutions_html():
    """يحوّل applications.md (عناوين ## و###، جداول |، أسئلة اختيار بـ✔) إلى صفحات بنفس تصميم الملزمة."""
    paths = [APPS] + [p for p in EXTRA_APPS if p.exists() and p != APPS]
    lines = [l for p in paths for l in p.read_text(encoding="utf-8").splitlines()]
    out = ['<!-- حلول تطبيقات الكتاب -->',
           '<div class="soltitle">حلول تطبيقات الكتاب وأنشطته<small>مهارات الكتابة — عرب 100 — مقسّمة حسب الوحدات والدروس</small></div>']
    i, first_unit = 0, True
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip() or ln.startswith("# تطبيقات") or ln.startswith("# حلول") or ln.startswith("كل تطبيق"):
            i += 1; continue
        if ln.startswith("# "):
            out.append(f'<div class="unit{"" if first_unit else " pb"}">{_inline(ln[2:])}</div>')
            first_unit = False
        elif ln.startswith("## "):
            out.append(f'<div class="lesson">{_inline(ln[3:])}</div>')
        elif ln.startswith("### "):
            out.append(f'<div class="sec">{_inline(ln[4:])}</div>')
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"-+", c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            t = '<table class="t"><tr>' + "".join(f"<th>{_inline(c)}</th>" for c in head) + "</tr>"
            for r in body:
                t += "<tr>" + "".join(f'<td class="r">{_inline(c)}</td>' for c in r) + "</tr>"
            out.append(t + "</table>")
            continue
        elif re.match(r"^\d+\.\s", ln):
            out.append(f'<p class="ln q">{_inline(ln)}</p>')
        elif ln.startswith("- "):
            out.append(f'<p class="ln">{_inline(ln[2:])}</p>')
        else:
            out.append(f'<p class="ln">{_inline(ln)}</p>')
        i += 1
    css = """<style>
.soltitle{text-align:center;font-weight:700;font-size:26pt;color:#603b28;margin:4pt 0 12pt;line-height:1.4}
.soltitle small{display:block;font-size:13pt;color:#ad7c95}
.unit{background:#603b28;color:#fff;text-align:center;border-radius:22pt;padding:5pt;font-weight:700;font-size:16pt;margin:8pt 0}
.lesson{background:#f5e6d9;border-right:5pt solid #325c8e;border-radius:4pt;padding:5pt 10pt;color:#cc6e53;font-weight:700;font-size:13.5pt;margin:30pt 0 6pt;break-after:avoid}
.ok{color:#527c82;white-space:nowrap}
.q{font-size:11.8pt}
</style>"""
    return "\n".join(out[:1]) + css + "\n".join(out[1:])


def intro_link_rect(intro_pdf):
    pg = pymupdf.open(intro_pdf)[0]
    r = pg.search_for("هنا")
    return r[0] if r else pymupdf.Rect(0, 0, 0, 0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--only", help="رقم الدرس (مثل 01) للمعاينة")
    ap.add_argument("--upto", type=int, help="آخر درس داخل (مثل 8 = لين «الأخطاء الشائعة» = جزئية الميد)")
    ap.add_argument("--part", default="", help="اسم الجزئية على الغلاف (جزئية الميد / جزئية الفاينل)")
    ap.add_argument("--solutions", action="store_true", help="يبني ملف حلول التطبيقات من store/arab100/book/applications.md")
    a = ap.parse_args()

    lessons = sorted((HERE / "content").glob("*.html"))
    if a.upto:
        lessons = lessons[:a.upto]
    if a.solutions:
        lessons = [solutions_html()]
    if a.only:
        lessons = [p for p in lessons if p.name.startswith(a.only)]
    tmp = pathlib.Path(tempfile.mkdtemp())
    base = plain_base(BASE)
    base_bank = plain_base(BASE_BANK)
    out = pymupdf.open()
    overlays, foot_items = [], []
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        for li, les in enumerate(lessons):
            src = les if isinstance(les, str) else les.read_text(encoding="utf-8")
            title = re.match(r"<!--\s*(.+?)\s*-->", src).group(1)
            if not a.solutions:
                unit, topic = fm.lesson_label(li if not a.only else int(a.only) - 1)
                src = src.replace("-->", f'-->\n<div class="lessonhead"><small>{unit} · {topic}</small><b>{html.escape(title)}</b></div>', 1)
            render_fit(src, tmp / f"c{li}.pdf", br)
            overlays.append((tmp / f"c{li}.pdf", title, False))
            bank = None if isinstance(les, str) else HERE / "bank" / (les.stem + ".txt")
            if bank and bank.exists():
                qs = parse_bank(bank)
                render(doc(bank_html(qs), BANK_CSS.replace("%HEAD%", FONT_HEAD) + "@page{margin:0}"), tmp / f"b{li}.pdf", br)
                overlays.append((tmp / f"b{li}.pdf", "تدريبات " + title, True))
        num = 0
        plan = []
        for path, title, is_bank in overlays:
            d = pymupdf.open(path)
            for i in range(d.page_count):
                num += 1
                plan.append((path, i, title, num, is_bank))
                foot_items.append((title, num))
        front = not a.only and not a.solutions
        if front:
            toc = []
            for li, les in enumerate(lessons):
                t = re.match(r"<!--\s*(.+?)\s*-->", les.read_text(encoding="utf-8")).group(1)
                p_les = next(n for (pth, i, tt, n, b) in plan if pth == tmp / f"c{li}.pdf")
                p_bank = next((n for (pth, i, tt, n, b) in plan if pth == tmp / f"b{li}.pdf"), None)
                toc.append((li, t, p_les, p_bank))
            names = [t for (_, t, _, _) in toc]
            topics = fm.unit_lessons(names)
            render(fm.cover_html(font_faces(), topics, part=a.part), tmp / "cover.pdf", br)
            render(doc(fm.intro_body(toc)), tmp / "intro.pdf", br)
            n_intro = pymupdf.open(tmp / "intro.pdf").page_count
            foot_items = [("المقدمة", None)] * n_intro + foot_items
        render(footers_html(foot_items), tmp / "f.pdf", br)
        br.close()
    foot = pymupdf.open(tmp / "f.pdf")
    if front:
        cv = out.new_page(width=W, height=H)
        cv.show_pdf_page(cv.rect, pymupdf.open(tmp / "cover.pdf"), 0)
        intro = pymupdf.open(tmp / "intro.pdf")
        for k in range(intro.page_count):  # التنويهات ثم الفهرس (كل واحد في صفحة)
            ip = out.new_page(width=W, height=H)
            ip.show_pdf_page(ip.rect, base, 0)
            ip.show_pdf_page(ip.rect, intro, k)
            ip.show_pdf_page(ip.rect, foot, k)
            if k == 0:
                ip.insert_link({"kind": pymupdf.LINK_URI, "uri": fm.INTRO_LINK, "from": intro_link_rect(tmp / "intro.pdf")})
        plan = [None] * intro.page_count + plan
    cache = {}
    for k, item in enumerate(plan):
        if item is None:
            continue
        path, i, title, num, is_bank = item
        src = cache.setdefault(path, pymupdf.open(path))
        pg = out.new_page(width=W, height=H)
        pg.show_pdf_page(pg.rect, base_bank if is_bank else base, 0)
        pg.show_pdf_page(pg.rect, src, i)
        pg.show_pdf_page(pg.rect, foot, k)
    out.set_metadata({"title": "عرب 100 — " + ("حلول تطبيقات الكتاب" if a.solutions else "مهارات الكتابة"), "author": "ملازم عدل"})
    out.save(a.out, garbage=4, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة")


if __name__ == "__main__":
    main()
