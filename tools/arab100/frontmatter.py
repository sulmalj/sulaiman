"""الغلاف وصفحة المقدمة (التنويهات + الفهرس) لملزمة عرب 100 — بنفس ألوان الملزمة وخطها."""
import base64, html, pathlib

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE.parent / "statistics" / "logo-adl.png"
INTRO_LINK = "https://drive.google.com/file/d/1idhtoHzHLnsHvXAvInF3tcthe6o2rmTa/view?usp=drivesdk"

UNITS = [("الوحدة الأولى", "الرسم الإملائي"),
         ("الوحدة الثانية", "تحرير الكتابة وعلامات الترقيم وأهم الأخطاء الشائعة")]
TOPIC_NAMES = ["الموضوع الأول", "الموضوع الثاني", "الموضوع الثالث", "الموضوع الرابع"]


def lesson_label(idx):
    """درس رقم idx (من 0) ← (الوحدة، الموضوع) حسب الكتاب: 4 مواضيع لكل وحدة."""
    return UNITS[idx // 4][0], TOPIC_NAMES[idx % 4]


def _logo():
    return "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode()


def cover_html(fonts_css, topics):
    """غلاف جديد: صور الهمزة الخمس (موضوع الوحدة الأولى) في دوائر بألوان الملزمة، وورقة دفتر مسطّرة فيها مواضيع الكتاب.
    topics: [(اسم الوحدة، عنوانها، [أسماء المواضيع])]."""
    forms = [("ء", "#e3a594"), ("أ", "#f0c98d"), ("إ", "#8db3b3"), ("ؤ", "#bb9cae"), ("ئ", "#e3a594")]
    circles = "".join(f'<span class="hz" style="background:{c}">{h}</span>' for h, c in forms)
    note = ""
    for unit, utitle, items in topics:
        note += f'<div class="nu">{html.escape(unit)}: {html.escape(utitle)}</div>'
        note += "".join(f'<div class="nl"><span class="nn">{i}</span>{html.escape(t)}</div>' for i, t in enumerate(items, 1))
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>{fonts_css}
@page {{ size:595.5pt 842.25pt; margin:0; }}
html,body {{ margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.pg {{ width:595.5pt; height:842.25pt; position:relative; overflow:hidden; background:#fff4e9; font-family:'Readex Pro'; color:#603b28; }}
/* بقع ناعمة في الأطراف (ستايل ملازم عدل) */
.blob {{ position:absolute; border-radius:50%; }}
.b1 {{ width:220pt; height:190pt; background:#f8e6d6; top:-80pt; left:-70pt; }}
.b2 {{ width:150pt; height:150pt; background:#f5e1e8; bottom:-55pt; right:-45pt; }}
.b3 {{ width:90pt; height:90pt; background:#e3eeec; top:300pt; right:-40pt; }}
.b4 {{ width:70pt; height:70pt; background:#f8e6d6; bottom:120pt; left:-30pt; }}
.frame {{ position:absolute; inset:16pt; border:1.6pt solid #b1794a; border-radius:20pt; }}
.top {{ position:absolute; top:34pt; left:40pt; right:40pt; display:flex; justify-content:space-between; align-items:center; }}
.top img {{ width:64pt; }}
.ver {{ text-align:left; color:#844f6a; font-weight:600; font-size:10.5pt; line-height:1.6; }}
.head {{ position:absolute; top:122pt; left:0; right:0; text-align:center; }}
.kicker {{ display:inline-block; color:#cc6e53; font-weight:600; font-size:13pt; letter-spacing:.5pt; }}
h1 {{ margin:2pt 0 0; font-weight:700; font-size:62pt; line-height:1.2; color:#89543d; }}
.pill {{ display:inline-block; margin-top:8pt; background:#89543d; color:#fff4e9; font-weight:700; font-size:19pt; border-radius:30pt; padding:2pt 34pt 4pt; }}
.hzrow {{ position:absolute; top:318pt; left:0; right:0; display:flex; justify-content:center; gap:14pt; }}
.hz {{ width:46pt; height:46pt; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:24pt; color:#fff; }}
.note {{ position:absolute; top:400pt; left:56pt; right:56pt; background:#fffdf8; border-radius:6pt; padding:14pt 22pt 14pt 18pt;
  box-shadow:0 3pt 12pt rgba(96,59,40,.12); border-right:3pt solid #db526f;
  background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 25.5pt, #eadcd0 25.5pt, #eadcd0 26.5pt); background-position:0 14pt; }}
.nu {{ color:#cc6e53; font-weight:700; font-size:13pt; line-height:26.5pt; }}
.nl {{ font-weight:600; font-size:12.5pt; line-height:26.5pt; display:flex; gap:9pt; }}
.nn {{ color:#ad7c95; min-width:10pt; }}
.foot {{ position:absolute; bottom:32pt; left:0; right:0; text-align:center; font-weight:600; font-size:10.5pt; color:#844f6a; }}
</style></head><body><div class="pg">
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="blob b4"></div>
<div class="frame"></div>
<div class="top"><img src="{_logo()}"><div class="ver">نسخة 1448 · الفصل الأول<br>جزئية الاختبار النصفي (الميد)</div></div>
<div class="head"><div class="kicker">ملزمة مطابقة للكتاب الجديد</div><h1>مهارات الكتابة</h1><div class="pill">عرب 100</div></div>
<div class="hzrow">{circles}</div>
<div class="note">{note}</div>
<div class="foot">ملازم عدل · لا أحلل نشر أو إرسال الملخص أو جزء منه</div>
</div></body></html>"""


def intro_body(toc):
    """toc: قائمة (رقم الدرس من 0، العنوان، صفحة الشرح، صفحة التجميعات أو None)."""
    notes = [
        ("للتنويه", f'الملزمة مع الشروحات تغني عن الكتاب تمامًا، ويتواجد قناة للمشتركين يوجد بها الشروحات وتجميعات إضافية وكل ما هو مهم عن الاختبار <a href="{INTRO_LINK}">(طريقة الدخول <u>هنا</u>)</a>.'),
        ("ملحوظة هامة", "الاختبار النصفي (الميد) لمادة عرب 100 لا يعتمد على التجميعات؛ بسبب أن كل دكتور هو من يقوم بعمل أسئلة الاختبار، فلا يجب الاعتماد على التجميعات فقط (التحضيري يكون موحدًا). وأنا ذكرت هذه الملحوظة بسبب أنني لا أريد الضرر لأحد، وفي الاختبار النهائي بإذن الله ستكون التجميعات لها دور أكبر، لكن في الميد لا يجب الاعتماد عليها."),
        ("هام", "بمجرد شرائك للملف فأنت تتعهد بعدم نشره أو تصويره أو نقله إلى أي مكان أو شخص آخر، وهو خاص بك فقط، ولا أحلل وأمنع اشتراك شخصين أو أكثر في اشتراك واحد (القطّات)."),
        ("الاشتراك", "الاشتراك معنا بأي مادة هو عامل مساعد لحصولك على أعلى الدرجات، وبدون اجتهادك وسعيك لن يكون للاشتراك أي دور لتحقيق أعلى الدرجات."),
        ("عن ملازمنا", "جميع الملازم في المتجر يتم تجهيزها على أحدث نسخة."),
    ]
    cards = "".join(f'<p class="ln nc"><span class="nk">{k}</span> {v}</p>' for k, v in notes)
    rows, last_unit = "", None
    for idx, title, p_les, p_bank in toc:
        unit, topic = lesson_label(idx)
        if unit != last_unit:
            rows += f'<tr class="unitrow"><td colspan="3">{unit}: {UNITS[idx // 4][1]}</td></tr>'
            last_unit = unit
        rows += (f'<tr><td class="r"><span class="tp">{topic}</span>{html.escape(title)}</td>'
                 f'<td>{p_les}</td><td>{p_bank if p_bank else "—"}</td></tr>')
    return f"""<!-- المقدمة -->
<style>
.nc {{ font-size:11pt; margin:0 0 7pt; }}
.nk {{ background:#cc6e53; color:#fff; border-radius:10pt; padding:0 8pt; font-size:10pt; }}
.nc a {{ color:#db526f; text-decoration:none; }}
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:11pt; margin-top:4pt; border:1pt solid #e2cdbd; border-radius:10pt; overflow:hidden; }}
.toc th {{ background:#325c8e; color:#fff; font-weight:700; padding:4pt 6pt; }}
.toc td {{ padding:3pt 8pt; text-align:center; border-top:1pt solid #eadbd0; background:#fbf6f1; }}
.toc td.r {{ text-align:right; }}
.toc tr.unitrow td {{ background:#f5e6d9; color:#cc6e53; font-weight:700; font-size:11.5pt; text-align:right; }}
.tp {{ display:inline-block; color:#ad7c95; margin-left:8pt; padding:0 2pt; font-size:10pt; }}
</style>
<div class="sec">قبل أن تبدأ</div>
{cards}
<div class="sec">فهرس الملزمة</div>
<table class="toc"><tr><th>الموضوع</th><th style="width:60pt">الشرح</th><th style="width:70pt">التجميعات</th></tr>{rows}</table>"""
