"""الغلاف وصفحة المقدمة (التنويهات + الفهرس) لملزمة عرب 100 — بنفس ألوان الملزمة وخطها."""
import base64, html, pathlib

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE.parent / "statistics" / "logo-adl.png"
INTRO_LINK = "https://drive.google.com/file/d/1idhtoHzHLnsHvXAvInF3tcthe6o2rmTa/view?usp=drivesdk"
# صورة الطالب من الغلاف القديم (مقطوعة منه كما هي، بخلفيتها #fff4e9)
ART_CLIP = (82, 352, 536, 734)
CREAM = "#fff4e9"

UNITS = [("الوحدة الأولى", "الرسم الإملائي"),
         ("الوحدة الثانية", "تحرير الكتابة وعلامات الترقيم وأهم الأخطاء الشائعة")]
TOPIC_NAMES = ["الموضوع الأول", "الموضوع الثاني", "الموضوع الثالث", "الموضوع الرابع"]


def lesson_label(idx):
    """درس رقم idx (من 0) ← (الوحدة، الموضوع) حسب الكتاب: 4 مواضيع لكل وحدة."""
    return UNITS[idx // 4][0], TOPIC_NAMES[idx % 4]


def _logo():
    return "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode()


def cover_html(fonts_css, art_box):
    """art_box: (x0, y0, x1, y1) بالنقاط — مكان صورة الطالب (تنحط فوق الصفحة بعدين من الـPDF القديم)."""
    x0, y0, x1, y1 = art_box
    chips = "".join(f'<div class="chip"><b>{u}</b>{html.escape(t)}</div>' for u, t in UNITS)
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>{fonts_css}
@page {{ size:595.5pt 842.25pt; margin:0; }}
html,body {{ margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.pg {{ width:595.5pt; height:842.25pt; background:#b1794a; position:relative; overflow:hidden; font-family:'Baloo Bhaijaan 2'; }}
.in {{ position:absolute; inset:14pt; background:{CREAM}; border-radius:18pt; overflow:hidden; }}
.blob {{ position:absolute; border-radius:50%; }}
.b1 {{ width:230pt; height:200pt; background:#f6e2d2; top:-70pt; left:-60pt; }}
.b2 {{ width:160pt; height:150pt; background:#f3dfe7; top:-40pt; right:-50pt; }}
.b3 {{ width:120pt; height:120pt; background:#e4efee; top:250pt; left:-55pt; }}
.dotgrid {{ position:absolute; top:40pt; right:40pt; width:60pt; height:40pt;
  background-image:radial-gradient(#d9b9a3 1.6pt, transparent 1.7pt); background-size:12pt 12pt; }}
.ver {{ position:absolute; top:26pt; left:28pt; text-align:left; color:#844f6a; font-weight:700; font-size:11pt; line-height:1.45; }}
.logo {{ position:absolute; top:22pt; right:30pt; width:70pt; }}
.title {{ position:absolute; top:118pt; left:0; right:0; text-align:center; }}
.title h1 {{ margin:0; font-weight:800; font-size:64pt; line-height:1.15; color:#89543d; }}
.pill {{ display:inline-block; margin-top:4pt; background:#89543d; color:#fff; font-weight:800; font-size:20pt; border-radius:30pt; padding:3pt 30pt 0; }}
.sub {{ margin-top:10pt; font-weight:700; font-size:14pt; color:#ad7c95; }}
.chips {{ position:absolute; top:330pt; left:60pt; right:60pt; display:flex; flex-direction:column; gap:7pt; align-items:center; }}
.chip {{ background:#fff; border:1.4pt solid #ead2bf; border-radius:22pt; padding:4pt 16pt 2pt; font-weight:700; font-size:12.5pt; color:#603b28; }}
.chip b {{ color:#cc6e53; margin-left:6pt; }}
.foot {{ position:absolute; bottom:22pt; left:0; right:0; text-align:center; font-weight:700; font-size:11pt; color:#844f6a; }}
</style></head><body><div class="pg"><div class="in">
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="dotgrid"></div>
<img class="logo" src="{_logo()}">
<div class="ver">نسخة 1448 · الفصل الأول<br>جزئية الاختبار النصفي (الميد)</div>
<div class="title"><h1>مهارات الكتابة</h1><div class="pill">عرب 100</div>
<div class="sub">ملزمة مطابقة للكتاب الجديد · مع تجميعات لكل درس</div></div>
<div class="chips">{chips}</div>
<div class="foot">ملازم عدل · لا أحلل نشر أو إرسال الملخص أو جزء منه</div>
</div></div></body></html>"""


def intro_body(toc):
    """toc: قائمة (رقم الدرس من 0، العنوان، صفحة الشرح، صفحة التجميعات أو None)."""
    notes = [
        ("للتنويه", f'الملزمة مع الشروحات تغني عن الكتاب تمامًا، ويتواجد قناة للمشتركين يوجد بها الشروحات وتجميعات إضافية وكل ما هو مهم عن الاختبار <a href="{INTRO_LINK}">(طريقة الدخول <u>هنا</u>)</a>.'),
        ("ملحوظة هامة", "الاختبار النصفي (الميد) لمادة عرب 100 لا يعتمد على التجميعات؛ بسبب أن كل دكتور هو من يقوم بعمل أسئلة الاختبار، فلا يجب الاعتماد على التجميعات فقط (التحضيري يكون موحدًا). وأنا ذكرت هذه الملحوظة بسبب أنني لا أريد الضرر لأحد، وفي الاختبار النهائي بإذن الله ستكون التجميعات لها دور أكبر، لكن في الميد لا يجب الاعتماد عليها."),
        ("هام", "بمجرد شرائك للملف فأنت تتعهد بعدم نشره أو تصويره أو نقله إلى أي مكان أو شخص آخر، وهو خاص بك فقط، ولا أحلل وأمنع اشتراك شخصين أو أكثر في اشتراك واحد (القطّات)."),
        ("الاشتراك", "الاشتراك معنا بأي مادة هو عامل مساعد لحصولك على أعلى الدرجات، وبدون اجتهادك وسعيك لن يكون للاشتراك أي دور لتحقيق أعلى الدرجات."),
        ("عن ملازمنا", "جميع الملازم في المتجر يتم تجهيزها على أحدث نسخة."),
    ]
    cards = "".join(f'<div class="nc"><span class="nk">{k}</span>{v}</div>' for k, v in notes)
    rows, last_unit = "", None
    for idx, title, p_les, p_bank in toc:
        unit, topic = lesson_label(idx)
        if unit != last_unit:
            rows += f'<tr class="u"><td colspan="3">{unit}: {UNITS[idx // 4][1]}</td></tr>'
            last_unit = unit
        rows += (f'<tr><td class="r"><span class="tp">{topic}</span>{html.escape(title)}</td>'
                 f'<td>{p_les}</td><td>{p_bank if p_bank else "—"}</td></tr>')
    return f"""<!-- المقدمة -->
<style>
.nc {{ background:#f2e6dd; border-radius:10pt; padding:5pt 11pt; margin:0 0 6pt; font-size:11pt; line-height:1.7; text-align:justify; text-align-last:right; break-inside:avoid; }}
.nk {{ display:inline-block; background:#cc6e53; color:#fff; border-radius:12pt; padding:0 9pt; margin-left:7pt; font-size:10.5pt; }}
.nc a {{ color:#db526f; text-decoration:none; }}
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:11pt; margin-top:4pt; border:1pt solid #e2cdbd; border-radius:10pt; overflow:hidden; }}
.toc th {{ background:#325c8e; color:#fff; font-family:'Alexandria'; font-weight:700; padding:4pt 6pt; }}
.toc td {{ padding:3pt 8pt; text-align:center; border-top:1pt solid #eadbd0; background:#fbf6f1; }}
.toc td.r {{ text-align:right; }}
.toc tr.u td {{ background:#f5e6d9; color:#cc6e53; font-weight:800; font-size:12pt; text-align:right; }}
.tp {{ color:#ad7c95; margin-left:6pt; font-size:10pt; }}
.thanks {{ text-align:center; color:#db526f; font-size:15pt; margin-top:10pt; }}
</style>
<div class="sec">قبل أن تبدأ</div>
{cards}
<div class="sec">فهرس الملزمة</div>
<table class="toc"><tr><th>الموضوع</th><th style="width:60pt">الشرح</th><th style="width:70pt">التجميعات</th></tr>{rows}</table>
<div class="thanks">شكرًا لكم على اختياركم</div>"""
