"""الغلاف وصفحة المقدمة (التنويهات + الفهرس) لملزمة عرب 100 — بنفس ألوان الملزمة وخطها."""
import base64, html, pathlib

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE.parent / "statistics" / "logo-adl.png"
INTRO_LINK = "https://drive.google.com/file/d/1idhtoHzHLnsHvXAvInF3tcthe6o2rmTa/view?usp=drivesdk"

UNITS = [("الوحدة الأولى", "الرسم الإملائي", 4),
         ("الوحدة الثانية", "تحرير الكتابة وعلامات الترقيم وأهم الأخطاء الشائعة", 4),
         ("الوحدة الثالثة", "كتابة الفقرة المقالية", 2),
         ("الوحدة الرابعة", "الكتابة الوظيفية", 2)]
TOPIC_NAMES = ["الموضوع الأول", "الموضوع الثاني", "الموضوع الثالث", "الموضوع الرابع"]


def unit_of(idx):
    """درس رقم idx (من 0) ← (رقم الوحدة، رقم الموضوع داخلها) حسب عدد مواضيع كل وحدة في الكتاب."""
    for u, (_, _, n) in enumerate(UNITS):
        if idx < n:
            return u, idx
        idx -= n
    raise IndexError("درس خارج الوحدات")


def lesson_label(idx):
    """درس رقم idx (من 0) ← (الوحدة، الموضوع) حسب الكتاب."""
    u, t = unit_of(idx)
    return UNITS[u][0], TOPIC_NAMES[t]


def unit_lessons(names):
    """[(اسم الوحدة، عنوانها، [أسماء مواضيعها])] من قائمة أسماء الدروس بالترتيب."""
    out, k = [], 0
    for unit, title, n in UNITS:
        out.append((unit, title, names[k:k + n]))
        k += n
    return out


def _logo():
    return "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode()


UNIT_STYLE = [  # (لون الوحدة، لون خفيف، أيقونة SVG بيضاء 24×24)
    ("#cc6e53", "#fbe8df", '<text x="12" y="19.5" text-anchor="middle" font-size="21" font-weight="700" fill="#fff" stroke="none">ء</text>'),
    ("#527c82", "#e2eded", '<path d="M5 19l1-4L15.5 5.5a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L9 18z M13.5 7.5l3 3"/>'),
    ("#a9718f", "#f4e6ee", '<path d="M4 6.5h16M8 10.5h12M4 14.5h16M11 18.5h9"/>'),
    ("#325c8e", "#e3eaf4", '<rect x="3.5" y="6" width="17" height="12.5" rx="2"/><path d="M4 7.5l8 5.5 8-5.5"/>'),
]


def cover_html(fonts_css, topics, kicker="ملزمة محدّثة على الكتاب الجديد", title="مهارات الكتابة",
               badge="نسخة 1448 · الفصل الأول", foot="ملف خاص بالمشتركين · لا أحلل نشره أو إرساله", part=""):
    """الغلاف: عنوان كبير مع ريشة كتابة خفيفة خلفه، وبطاقة لكل وحدة من وحدات الكتاب الأربع بلونها وأيقونتها ومواضيعها.
    topics: [(اسم الوحدة، عنوانها، [أسماء المواضيع])]. (ملف الحلول يستخدمه بعنوان وشارة وتذييل خاصين فيه.)"""
    compact = max(len(t[2]) for t in topics) > 4
    cards = ""
    for (unit, utitle, items), (col, tint, icon) in zip(topics, UNIT_STYLE):
        if not items:  # (جزئية الميد) الوحدات اللي مو داخلة ما تنعرض
            continue
        lis = "".join(f'<div class="it"><span class="n" style="background:{tint};color:{col}">{i}</span>{html.escape(t)}</div>'
                      for i, t in enumerate(items, 1))
        cards += (f'<div class="uc" style="--c:{col};--t:{tint}"><div class="ch">'
                  f'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{icon}</svg>'
                  f'<div class="cu">{html.escape(unit)}</div></div>'
                  f'<div class="ct">{html.escape(utitle)}</div>{lis}</div>')
    nib = ('<svg class="nib" viewBox="0 0 120 200"><g transform="rotate(32 60 100)">'
           '<path d="M60 8 C96 44 110 92 90 134 L60 196 L30 134 C10 92 24 44 60 8 Z" fill="#f4dfcf" stroke="#e6c5ad" stroke-width="2"/>'
           '<path d="M60 196 L60 104" stroke="#e6c5ad" stroke-width="3" stroke-linecap="round"/>'
           '<circle cx="60" cy="96" r="8" fill="#fff7ee" stroke="#e6c5ad" stroke-width="2.5"/></g></svg>')
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>{fonts_css}
@page {{ size:595.5pt 842.25pt; margin:0; }}
html,body {{ margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.pg {{ width:595.5pt; height:842.25pt; position:relative; overflow:hidden; background:#fff7ee; font-family:'Readex Pro'; color:#603b28; }}
/* بقع ناعمة ونقاط (ستايل ملازم عدل) */
.blob {{ position:absolute; border-radius:50%; }}
.b1 {{ width:300pt; height:260pt; background:#f9e7d8; top:-120pt; left:-110pt; }}
.b2 {{ width:230pt; height:210pt; background:#e8f0ef; bottom:-90pt; right:-80pt; }}
.b3 {{ width:110pt; height:110pt; background:#f6e6ee; top:250pt; right:-55pt; }}
.dots {{ position:absolute; top:30pt; right:120pt; width:90pt; height:40pt;
  background-image:radial-gradient(#e9cdb9 1.6pt, transparent 1.7pt); background-size:12pt 12pt; }}
.frame {{ position:absolute; inset:15pt; border:1.2pt solid #dcbfa6; border-radius:22pt; }}
.top {{ position:absolute; top:34pt; left:42pt; right:42pt; display:flex; justify-content:space-between; align-items:center; }}
.top img {{ width:66pt; }}
.ver {{ background:#fff; border:1pt solid #ecd9c9; border-radius:14pt; padding:4pt 12pt; color:#844f6a; font-weight:600; font-size:10.5pt; }}
.nib {{ position:absolute; width:104pt; height:172pt; top:176pt; left:-2pt; opacity:.85; }}
.hero {{ position:absolute; top:146pt; left:0; right:0; text-align:center; }}
.kicker {{ color:#cc6e53; font-weight:600; font-size:13pt; }}
h1 {{ margin:0; font-weight:700; font-size:70pt; line-height:1.25; color:#89543d; }}
.swash {{ display:block; margin:-4pt auto 0; width:230pt; height:16pt; }}
.code {{ display:inline-block; margin-top:10pt; background:#89543d; color:#fff7ee; font-weight:700; font-size:19pt; border-radius:30pt; padding:2pt 36pt 4pt; }}
.units {{ position:absolute; top:384pt; left:34pt; right:34pt; display:grid; grid-template-columns:1fr 1fr; gap:13pt; }}
.uc {{ background:#fffdfa; border-radius:16pt; padding:15pt 16pt 13pt; box-shadow:0 4pt 14pt rgba(96,59,40,.10); border-top:4pt solid var(--c); }}
.ch {{ display:flex; align-items:center; gap:9pt; margin-bottom:4pt; }}
.ic {{ flex:none; width:38pt; height:38pt; border-radius:50%; background:var(--c); padding:6pt; box-sizing:border-box; }}
.cu {{ color:var(--c); font-weight:700; font-size:12pt; line-height:1.3; }}
.ct {{ color:#603b28; font-weight:700; font-size:13.5pt; line-height:1.5; margin-bottom:5pt; padding-bottom:5pt; border-bottom:1pt dashed var(--t); }}
.it {{ display:flex; align-items:center; gap:6pt; font-weight:600; font-size:11pt; line-height:2.05; color:#5c4033; white-space:nowrap; }}
.n {{ flex:none; width:16pt; height:16pt; border-radius:50%; font-size:9pt; font-weight:700; display:inline-flex; align-items:center; justify-content:center; line-height:1; }}
.foot {{ position:absolute; bottom:30pt; left:0; right:0; text-align:center; font-weight:600; font-size:10.5pt; color:#844f6a; }}
.foot b {{ color:#cc6e53; }}
.part {{ display:inline-block; margin-top:8pt; background:#325c8e; color:#fff; border-radius:14pt; padding:3pt 18pt 4pt; font-weight:700; font-size:15pt; }}
{".hero{top:128pt} .nib{top:150pt} .units{top:330pt;gap:11pt} .uc{padding:12pt 14pt 10pt} .it{line-height:1.85} .ct{margin-bottom:3pt;padding-bottom:3pt} .ver{background:#db526f;color:#fff;border-color:#db526f;font-weight:700}" if compact else ""}
</style></head><body><div class="pg">
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="dots"></div>
<div class="frame"></div>
{nib}
<div class="top"><img src="{_logo()}"><div class="ver">{badge}</div></div>
<div class="hero"><div class="kicker">{kicker}</div><h1>{title}</h1>
<svg class="swash" viewBox="0 0 230 16"><path d="M6 10 C60 2 120 2 224 9" fill="none" stroke="#cc6e53" stroke-width="3.2" stroke-linecap="round"/><path d="M40 13 C90 8 140 8 190 12" fill="none" stroke="#f0c98d" stroke-width="2.2" stroke-linecap="round"/></svg>
<div class="code">عرب 100</div>{f'<div class="part">{html.escape(part)}</div>' if part else ''}</div>
<div class="units">{cards}</div>
<div class="foot"><b>ملازم عدل</b> · {foot}</div>
</div></body></html>"""


def intro_body(toc):
    """toc: قائمة (رقم الدرس من 0، العنوان، صفحة الشرح، صفحة التجميعات أو None)."""
    notes = [
        ("للتنويه", f'الملزمة مع الشروحات تغني عن الكتاب تمامًا، وتتوفر قناة خاصة بالمشتركين فيها الشروحات <a href="{INTRO_LINK}">(طريقة الدخول <u>هنا</u>)</a>.'),
        ("موقع التدريب", "يتوفر أيضًا موقع للتدريب على جميع الدروس، تجدونه في قناة المشتركين مع الشروحات."),
        ("هام", "بمجرد شرائك للملف فأنت تتعهد بعدم نشره أو تصويره أو نقله إلى أي مكان أو شخص آخر، وهو خاص بك فقط، ولا أحلل وأمنع اشتراك شخصين أو أكثر في اشتراك واحد (القطّات)."),
        ("الاشتراك", "الاشتراك معنا بأي مادة هو عامل مساعد لحصولك على أعلى الدرجات، وبدون اجتهادك وسعيك لن يكون للاشتراك أي دور لتحقيق أعلى الدرجات."),
        ("عن ملازمنا", "جميع الملازم في المتجر يتم تجهيزها على أحدث نسخة."),
    ]
    cards = "".join(f'<p class="ln nc"><span class="nk">{k}</span> {v}</p>' for k, v in notes)
    rows, last_unit = "", None
    for idx, title, p_les, p_bank in toc:
        unit, topic = lesson_label(idx)
        if unit != last_unit:
            rows += f'<tr class="unitrow"><td colspan="3">{unit}: {UNITS[unit_of(idx)[0]][1]}</td></tr>'
            last_unit = unit
        rows += (f'<tr><td class="r"><span class="tp">{topic}</span> {html.escape(title)}</td>'
                 f'<td>{p_les}</td><td>{p_bank if p_bank else "—"}</td></tr>')
    return f"""<!-- المقدمة -->
<style>
/* صفحة «قبل أن تبدأ» تعبّي الصفحة: كل تنويه في بطاقة بخط أكبر */
.nc {{ display:block; font-size:14.2pt; line-height:2.05; margin:0 0 20pt; background:#fbf3ec; border-right:5pt solid #325c8e;
      border-radius:10pt; padding:11pt 16pt 12pt; text-align:justify; text-align-last:right; break-inside:avoid; }}
.nc > .hl {{ background:none !important; padding:0 !important; }}
.nk {{ display:table; background:#cc6e53; color:#fff; border-radius:12pt; padding:1pt 12pt 2pt; font-size:11.5pt; margin-bottom:3pt; }}
.nc a {{ color:#db526f; text-decoration:none; }}
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:12pt; margin-top:26pt; border:1pt solid #e2cdbd; border-radius:10pt; overflow:hidden; }}
.toc th {{ background:#325c8e; color:#fff; font-weight:700; padding:4pt 6pt; }}
.toc td {{ padding:6pt 10pt; text-align:center; border-top:1pt solid #eadbd0; background:#fbf6f1; }}
.toc td.r {{ text-align:right; }}
.toc tr.unitrow td {{ background:#f5e6d9; color:#cc6e53; font-weight:700; font-size:12.5pt; text-align:right; }}
.tp {{ display:inline-block; color:#ad7c95; margin-left:8pt; padding:0 2pt; font-size:10pt; }}
</style>
<div class="sec">قبل أن تبدأ</div>
{cards}
<div class="sec pb">فهرس الملزمة</div>
<table class="toc"><tr><th>الموضوع</th><th style="width:60pt">الشرح</th><th style="width:70pt">التدريبات</th></tr>{rows}</table>"""
