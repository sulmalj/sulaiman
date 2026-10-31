"""يبني ملف «درجات طلابنا» لدورة احص 102 أو تقن 102 (المسار الإنساني) بهوية ملازم عدل:
صفحة غلاف إعلانية + صفحات صور الدرجات (ترتيب عشوائي، الدرجات المتساوية متفرقة)
مع علامة مائية بحقوق ملازم عدل، وتنويه إن التقييمات جزء بسيط، ورابط القناة والمتجر أسفل كل صفحة.

الهوية (من شعار المستخدم وملازمه `store/brand/`): خلفية كريمية #fffdf5، كحلي الشعار #204b7d،
أزرق المخ #6c89ac، وردي اللمبة #b0698d، وخط عناوين دائري (Baloo Bhaijaan 2 بديل Childos Arabic).

الاستخدام:
  python3 tools/statistics/build_grades_pdf.py store/statistics/grades/images store/statistics/grades/stat102-humanities-grades.pdf \
    --grades store/statistics/grades/grades.txt
  --grades: سطر لكل صورة «اسم_الملف<TAB>الدرجة» عشان الدرجات المتساوية ما تجي جنب بعض.
  --seed: رقم ثابت للخلط (نفس الرقم = نفس الترتيب).
  --course tech102: ملف تقن 102 ميد (القسمين النظري والعملي + رابط «نبذة عن الملزمة»):
  python3 tools/statistics/build_grades_pdf.py store/tech102/grades/images store/tech102/grades/tech102-humanities-grades.pdf \
    --grades store/tech102/grades/grades.txt --course tech102
"""
import argparse, base64, io, pathlib, random, sys, tempfile
import pymupdf, segno
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE / "logo-adl.png"
TELEGRAM = "https://t.me/mlazmadl"
STORE = "https://mtgradl.com"
DEMO = "https://t.me/mlazmadl/3465"
COURSE = "احص 102"
TRACK = "المسار الإنساني"
FEATURES = ["ملزمة مرتبة وشاملة", "شروحات لكامل الدروس", "حلول للواجبات",
            "شروحات للواجبات", "كويزات للمعلومات النظرية", "تغني عن الكتاب واي مصدر آخر"]
NOTE = ("التقييمات في هذا الملف جزء بسيط جداً من تقييماتنا، ولا تشكّل حتى 5% منها — "
        "وجميع التقييمات متواجدة في المتجر وفي قناتنا العامة")
NOTE_HTML = NOTE.replace("ولا تشكّل حتى 5% منها", "<em>ولا تشكّل حتى 5% منها</em>")
IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}
BADGE = True     # شارة «الأقدم في شروحات …» (احص بس)
PART = ""        # مثل «جزئية الميد»
HIGH = 24        # الدرجات العالية اللي ما تتجمع في مكان واحد
SECTIONS = None  # [(عنوان, [بنود])] بدل FEATURES
INTRO = ""
OVERVIEW = None  # رابط «نبذة عن الملزمة»

# ملفات المواد الثانية: نفس التصميم، والفرق في هذي القيم (نص المستخدم حرفياً)
PROFILES = {
    "tech102": dict(
        COURSE="تقن 102", PART="جزئية الميد", DEMO="https://t.me/mlazmadl/3474", BADGE=True, HIGH=30,
        OVERVIEW="https://drive.google.com/file/d/14HmUxajAcgC337Mu2YMju3RsLaMpGmlJ/view?usp=drivesdk",
        INTRO="يوجد اشتراك عملي ونظري",
        SECTIONS=[
            ("القسم النظري (ملزمة)", [
                "تلخيص للكتاب بشكل مرتب.", "تدريبات في الملزمة.", "كويزات اضافية للمشتركين.",
                "قروب للاسئلة والاستفسارات.", "تسريبات السنوات الماضية.", "بنك اسئلة للمراجعة الشاملة.",
                "تغني عن الكتاب واي مصدر آخر."]),
            ("القسم العملي (شروحات)", [
                "شرح كامل للعملي الداخل بالاختبار.", "شرح واجبات الجلسات.",
                "يشمل موقع للتدرب على الجزء العملي يغني عن الكتاب و واجبات الجلسات، موقع متكامل وشرح الخطوات بطريقة الكتاب.",
                "شرح الاختبار التجريبي.", "تسريبات السنوات الماضية.", "قروب للاسئلة والاستفسارات.",
                "يغني عن الكتاب واي مصدر آخر."]),
        ]),
    # الإنجليزي (انجل 102/103): مزايا الدورة من نص إعلان المستخدم في دليل الميد،
    # وبدون شرح تجريبي (ما فيه رابط) وبدون شارة «الأقدم…» لين يأكدها المستخدم
    "english": dict(
        COURSE="الإنجليزي", TRACK="", PART="جزئية الميد", DEMO=None, BADGE=False, HIGH=30,  # بدون «المسار الإنساني» (طلب المستخدم)
        FEATURES=["موقع للتدريب شامل كل الأقسام", "تدريب على القطع والاستماع والفوكاب والقواعد",
                  "شرح كامل القواعد", "تصحيح تلقائي من الموقع",
                  "أكثر من 900 سؤال", "مستوى الأسئلة مشابه للاختبار"]),
}

CREAM = (1, 253 / 255, 245 / 255)
NAVY, BLUE, ROSE = "#204b7d", "#6c89ac", "#b0698d"

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;600;700;800'
         '&family=Tajawal:wght@500;700;800&family=Lexend:wght@500;600;700&display=block" rel="stylesheet">')
BASE_CSS = f"""
:root {{ --navy:{NAVY}; --blue:{BLUE}; --rose:{ROSE}; --cream:#fffdf5; --blue-soft:#e3eaf3; --rose-soft:#f5e3ec; --ink:#23324a; --muted:#6b7385; }}
* {{ box-sizing:border-box; }}
html,body {{ margin:0; color:var(--ink); font-family:'Tajawal',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
a {{ color:inherit; text-decoration:none; }}
.en {{ font-family:'Lexend',sans-serif; direction:ltr; unicode-bidi:isolate; }}
"""


def data_uri(path):
    return "data:image/png;base64," + base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def qr_img(url, px):
    """باركود PNG حاد (نسخة SVG ما كانت تنقرأ)."""
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=20, border=1, dark=NAVY)
    return (f'<img alt="QR" src="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}" '
            f'style="width:{px}px;height:{px}px;display:block;image-rendering:pixelated">')


# زخارف عضوية بنفس روح أغلفة ملازم عدل (بقع ناعمة + نقاط + أقواس)
DECO_TOP = f"""<svg class="deco top" viewBox="0 0 794 260" preserveAspectRatio="none">
<path d="M794 0H430c10 40 52 70 110 78 70 10 96 52 150 66 46 12 80 0 104-18Z" fill="#e3eaf3"/>
<path d="M794 0H600c4 34 30 58 74 62 52 5 80 34 120 30Z" fill="#c9d6e7"/>
<path d="M0 0h250c-6 46-48 74-104 80C88 86 40 112 0 140Z" fill="#f5e3ec"/>
<g fill="none" stroke="{ROSE}" stroke-width="3" opacity=".55"><path d="M0 92c40-10 70-40 78-92"/><path d="M0 70c28-8 48-30 54-70"/></g>
<g fill="{BLUE}" opacity=".55"><circle cx="470" cy="34" r="7"/><circle cx="505" cy="58" r="5"/><circle cx="440" cy="62" r="4"/></g>
<g fill="{ROSE}" opacity=".5"><circle cx="300" cy="28" r="6"/><circle cx="330" cy="48" r="4"/></g>
</svg>"""
DECO_BOT = f"""<svg class="deco bot" viewBox="0 0 794 200" preserveAspectRatio="none">
<path d="M0 200V70c40 10 70 44 130 46 66 2 90-40 150-36 60 4 80 52 140 70 20 6 40 8 60 50Z" fill="#e3eaf3"/>
<path d="M794 200V60c-50 6-80 46-140 54-56 8-90-14-140 6-44 18-56 58-90 80Z" fill="#f5e3ec"/>
<path d="M794 200v-70c-36 4-60 30-110 34-36 3-60 18-74 36Z" fill="#e8c9d8"/>
<g fill="{ROSE}" opacity=".5"><circle cx="560" cy="60" r="6"/><circle cx="590" cy="40" r="4"/></g>
<g fill="{BLUE}" opacity=".55"><circle cx="210" cy="50" r="6"/><circle cx="240" cy="70" r="4"/><circle cx="180" cy="30" r="4"/></g>
</svg>"""

ICONS = [  # أيقونات بسيطة لكل ميزة
    '<path d="M6 4h9l3 3v13H6z M15 4v3h3 M9 11h6 M9 14h6 M9 17h4"/>',
    '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M10 9l5 2.5-5 2.5z M8 20h8"/>',
    '<path d="M5 12l4 4 10-10"/>',
    '<path d="M4 6h16v10H9l-5 4z M8 10h8 M8 13h5"/>',
    '<circle cx="12" cy="12" r="8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-.7.8-.7 1.6 M12 16.5v.5"/>',
    '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
]


def track_label():
    return " · ".join(x for x in (TRACK, PART) if x)


def short(url):
    return url.split("://", 1)[1]


def cover_html():
    QR = 74 if SECTIONS else 88
    if SECTIONS:  # قسمين (نظري/عملي) كل واحد ببنوده
        cards = "".join(
            f'<div class="sc {"b" if k == 0 else "r"}"><h3><span class="ic {"b" if k == 0 else "r"}"><svg viewBox="0 0 24 24">'
            f'{ICONS[0] if k == 0 else ICONS[1]}</svg></span>{t}</h3><ul>{"".join(f"<li>{x}</li>" for x in items)}</ul></div>'
            for k, (t, items) in enumerate(SECTIONS))
        body = (f'<div class="sec"><h2>الدورة تشمل</h2>' + (f'<div class="intro">{INTRO}</div>' if INTRO else "")
                + f'<div class="two">{cards}</div></div>')
    else:
        feats = "".join(
            f'<div class="f"><span class="ic {"b" if i % 2 == 0 else "r"}"><svg viewBox="0 0 24 24">{ICONS[i]}</svg></span>{t}</div>'
            for i, t in enumerate(FEATURES))
        body = f'<div class="sec"><h2>الدورة تشمل</h2><div class="grid">{feats}</div></div>'
    badge = (f'<div class="badge"><b>الأقدم في شروحات {COURSE}</b><span>منذ عام 1444 هـ</span></div>' if BADGE else "")
    ov = (f'<a class="c ov" href="{OVERVIEW}"><div class="t"><b>نبذة عن الملزمة</b><small>اضغط على الرابط أو امسح الباركود</small>'
          f'<span class="u">اضغط هنا لفتح النبذة</span></div><div class="q">{qr_img(OVERVIEW, QR)}</div></a>' if OVERVIEW else "")
    compact = "compact" if SECTIONS else ""
    if not SECTIONS and not DEMO:  # بدون بطاقة شرح تجريبي: نكبّر العناصر عشان ما يبقى فراغ تحت الغلاف
        compact = "nodemo"
    demo = (f'<a class="c demo" href="{DEMO}"><div class="t"><b>شاهد الشرح التجريبي</b><small>اضغط على الرابط أو امسح الباركود</small><span class="u">{short(DEMO)}</span></div><div class="q">{qr_img(DEMO, QR)}</div></a>' if DEMO else "")
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:A4; margin:0; }}
body {{ background:var(--cream); }}
.page {{ width:210mm; height:297mm; position:relative; overflow:hidden; background:var(--cream); }}
.deco {{ position:absolute; left:0; width:100%; }} .deco.top {{ top:0; height:68mm; }} .deco.bot {{ bottom:0; height:52mm; }}
.in {{ position:relative; height:100%; padding:10mm 14mm 9mm; display:flex; flex-direction:column; align-items:center; }}
.badge {{ position:absolute; top:12mm; left:14mm; text-align:center; background:#fff; border:2px solid var(--navy); border-radius:16px; padding:7px 14px 5px; box-shadow:4px 4px 0 var(--rose); }}
.badge b {{ display:block; font:700 15px 'Baloo Bhaijaan 2'; color:var(--navy); line-height:1.3; }}
.badge span {{ font-size:12.5px; font-weight:700; color:var(--rose); }}
.logo {{ height:35mm; margin-top:3mm; }}
.kick {{ margin-top:3mm; font:600 19px 'Baloo Bhaijaan 2'; color:var(--rose); }}
h1 {{ margin:-2mm 0 0; font:800 74px/1.12 'Baloo Bhaijaan 2'; color:var(--navy); }}
.track {{ margin-top:1mm; font:700 21px 'Baloo Bhaijaan 2'; color:#fff; background:var(--blue); border-radius:999px; padding:3px 26px 1px; }}
.sec {{ width:100%; margin-top:5mm; }}
.sec h2 {{ display:flex; align-items:center; gap:10px; margin:0 0 3.5mm; font:800 24px 'Baloo Bhaijaan 2'; color:var(--navy); }}
.sec h2::after {{ content:""; flex:1; height:2px; background:linear-gradient(90deg, transparent, var(--blue)); border-radius:2px; }}
.grid {{ display:grid; grid-template-columns:1fr 1fr; gap:3mm 4mm; }}
.f {{ display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #e6e1d3; border-radius:16px; padding:9px 12px; font-size:19px; font-weight:800; color:var(--navy); }}
.ic {{ flex:none; width:36px; height:36px; border-radius:12px; display:grid; place-items:center; }}
.ic.b {{ background:var(--blue-soft); }} .ic.r {{ background:var(--rose-soft); }}
.ic svg {{ width:21px; height:21px; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }}
.ic.b svg {{ stroke:var(--navy); }} .ic.r svg {{ stroke:var(--rose); }}
.cta {{ width:100%; margin-top:5mm; display:grid; gap:3.5mm; }}
.c {{ display:flex; align-items:center; gap:16px; border-radius:22px; padding:9px 12px 9px 22px; }}
.c .t {{ flex:1; }}
.c b {{ display:block; font:800 27px/1.25 'Baloo Bhaijaan 2'; }}
.c small {{ display:block; font-size:15px; font-weight:700; margin:2px 0 8px; opacity:.92; }}
.c .u {{ display:inline-block; font:600 16px 'Lexend'; direction:ltr; border-radius:9px; padding:3px 10px; }}
.c .q {{ flex:none; background:#fff; border-radius:12px; padding:5px; }}
.c.demo {{ background:var(--navy); color:#fff; }} .c.demo .u {{ background:#fff; color:var(--navy); }}
.c.store {{ background:var(--rose); color:#fff; }} .c.store .u {{ background:#fff; color:var(--rose); }}
.proof {{ width:100%; margin-top:5mm; background:#fff; border:2px dashed var(--blue); border-radius:20px; padding:10px 16px; text-align:center; }}
.proof b {{ display:block; font:800 25px 'Baloo Bhaijaan 2'; color:var(--navy); }}
.proof p {{ margin:2px 0 0; font-size:15px; font-weight:700; color:var(--ink); line-height:1.6; }}
.proof p em {{ font-style:normal; color:var(--rose); font-weight:800; }}
.tg {{ margin-top:auto; position:relative; display:flex; align-items:center; gap:9px; background:#fff; border-radius:999px; padding:6px 18px; font-size:16px; font-weight:800; color:var(--navy); box-shadow:0 3px 10px rgba(32,75,125,.12); }}
.tg .u {{ font:600 15px 'Lexend'; direction:ltr; color:var(--rose); }}
.intro {{ margin:-1mm 0 3mm; text-align:center; font:800 21px 'Baloo Bhaijaan 2'; color:var(--rose); }}
.two {{ display:grid; grid-template-columns:1fr 1fr; gap:4mm; }}
.sc {{ background:#fff; border:1.5px solid #e6e1d3; border-radius:18px; padding:10px 14px 8px; }}
.sc h3 {{ display:flex; align-items:center; gap:9px; margin:0 0 6px; font:800 20px 'Baloo Bhaijaan 2'; color:var(--navy); }}
.sc.r h3 {{ color:var(--rose); }}
.sc ul {{ margin:0; padding:0; list-style:none; }}
.sc li {{ position:relative; padding:4px 16px 4px 0; font-size:15.5px; font-weight:800; line-height:1.5; color:var(--ink); border-top:1px dashed #ebe5d6; }}
.sc li:first-child {{ border-top:0; }}
.sc li::before {{ content:""; position:absolute; right:2px; top:13px; width:7px; height:7px; border-radius:50%; background:var(--blue); }}
.sc.r li::before {{ background:var(--rose); }}
.c.ov {{ background:var(--blue); color:#fff; }} .c.ov .u {{ background:#fff; color:var(--navy); font-family:'Tajawal'; font-weight:800; }}
.nodemo .logo {{ height:40mm; margin-top:6mm; }}
.nodemo h1 {{ font-size:80px; }}
.nodemo .sec {{ margin-top:8mm; }}
.nodemo .sec h2 {{ margin-bottom:5mm; }}
.nodemo .grid {{ gap:5mm 5mm; }}
.nodemo .f {{ padding:16px 14px; font-size:20px; }}
.nodemo .cta, .nodemo .proof {{ margin-top:7mm; }}
.nodemo .c {{ padding:14px 14px 14px 24px; }}
.compact .logo {{ height:27mm; margin-top:1mm; }}
.compact .kick {{ margin-top:1mm; }}
.compact h1 {{ font-size:62px; }}
.compact .sec, .compact .cta, .compact .proof {{ margin-top:4mm; }}
.compact .cta {{ grid-template-columns:1fr 1fr; gap:3mm; }}
.compact .cta .store {{ grid-column:1 / -1; }}
.compact .c {{ padding:8px 10px 8px 16px; gap:10px; }}
.compact .c b {{ font-size:22px; }}
.compact .c small {{ font-size:13px; margin:1px 0 6px; }}
.compact .c .u {{ font-size:14px; }}
.compact .proof {{ padding:8px 14px; }}
.compact .proof b {{ font-size:22px; }}
.compact .proof p {{ font-size:14px; }}
</style></head><body><div class="page {compact}">{DECO_TOP}{DECO_BOT}<div class="in">
{badge}
<img class="logo" src="{data_uri(LOGO)}" alt="عدل">
<div class="kick">دورة ملازم عدل</div>
<h1>{COURSE}</h1>
<div class="track">{track_label()}</div>
{body}
<div class="cta">
  {demo}
  {ov}
  <a class="c store" href="{STORE}"><div class="t"><b>اشترك الآن من متجرنا</b><small>اضغط على الرابط أو امسح الباركود</small><span class="u">mtgradl.com</span></div><div class="q">{qr_img(STORE, QR)}</div></a>
</div>
<div class="proof"><b>درجات طلابنا في الصفحات التالية</b><p>{NOTE_HTML}</p></div>
<a class="tg" href="{TELEGRAM}">قناتنا لمعرفة كل جديد: <span class="u">t.me/mlazmadl</span></a>
</div></div></body></html>"""


def frame_html(page_no, total):
    """إطار صفحات الدرجات: الشعار + اسم المقرر فوق، التنويه، وروابط القناة والمتجر تحت."""
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:A4; margin:0; }}
body {{ background:var(--cream); }}
.page {{ width:210mm; height:297mm; position:relative; overflow:hidden; background:var(--cream); }}
.head {{ position:absolute; top:7mm; left:12mm; right:12mm; height:16mm; display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid var(--blue-soft); }}
.head .ttl b {{ display:block; font:800 21px/1.2 'Baloo Bhaijaan 2'; color:var(--navy); }}
.head .ttl span {{ font:700 13px 'Baloo Bhaijaan 2'; color:var(--rose); }}
.head img {{ height:13mm; }}
.note {{ position:absolute; top:25mm; left:12mm; right:12mm; text-align:center; font-size:11.5px; font-weight:700; color:var(--muted); }}
.note em {{ font-style:normal; color:var(--rose); }}
.foot {{ position:absolute; bottom:6mm; left:12mm; right:12mm; height:11mm; display:flex; gap:3mm; }}
.foot a {{ flex:1; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; font-size:14px; font-weight:800; }}
.foot .u {{ font:600 13.5px 'Lexend'; direction:ltr; }}
.foot .tg {{ background:var(--navy); color:#fff; }} .foot .tg .u {{ color:#cfe0f5; }}
.foot .st {{ background:var(--rose); color:#fff; }} .foot .st .u {{ color:#fff3f8; }}
.pn {{ position:absolute; bottom:18.5mm; left:0; right:0; text-align:center; font:600 10px 'Lexend'; color:var(--muted); }}
</style></head><body><div class="page">
<div class="head"><div class="ttl"><b>درجات طلاب دورة ملازم عدل</b><span>{COURSE} · {track_label()}</span></div><img src="{data_uri(LOGO)}" alt="عدل"></div>
<div class="note">{NOTE_HTML}</div>
<div class="pn"><span class="en">{page_no} / {total}</span></div>
<div class="foot">
  <a class="tg" href="{TELEGRAM}">قناتنا لمعرفة كل جديد: <span class="u">t.me/mlazmadl</span></a>
  <a class="st" href="{STORE}">اشترك من متجرنا: <span class="u">mtgradl.com</span></a>
</div></div></body></html>"""


def watermark_html(w_mm, h_mm):
    """علامة مائية شفافة (بدون خلفية) تنحط فوق منطقة الصور."""
    cells = "".join('<div class="w">حقوق ملازم عدل<small>mtgradl.com</small></div>' for _ in range(42))
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:{w_mm}mm {h_mm}mm; margin:0; }}
html,body {{ background:transparent; overflow:hidden; }}
.page {{ width:{w_mm}mm; height:{h_mm}mm; overflow:hidden; position:relative; }}
.grid {{ position:absolute; left:-70mm; top:-60mm; width:330mm; height:380mm; transform:rotate(-28deg);
  display:grid; grid-template-columns:repeat(6, 1fr); align-content:space-around; justify-items:center; }}
.w {{ font:800 25px/1 'Baloo Bhaijaan 2'; color:rgba(32,75,125,.15); -webkit-text-stroke:.7px rgba(255,255,255,.28); text-align:center; white-space:nowrap; }}
.w small {{ display:block; margin-top:3px; font:600 11px 'Lexend'; color:rgba(176,105,141,.3); -webkit-text-stroke:0; }}
.w:nth-child(12n+7), .w:nth-child(12n+8), .w:nth-child(12n+9), .w:nth-child(12n+10), .w:nth-child(12n+11), .w:nth-child(12n+12) {{ transform:translateX(-20mm); }}
</style></head><body><div class="page"><div class="grid">{cells}</div></div></body></html>"""


def closing_html(w_mm, h_mm):
    """مربع ختامي يملأ الفراغ في آخر صفحة: دعوة للاشتراك + باركود المتجر."""
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:{w_mm}mm {h_mm}mm; margin:0; }}
html,body {{ background:transparent; }}
.box {{ width:{w_mm}mm; height:{h_mm}mm; border-radius:22px; background:var(--navy); color:#fff; display:flex; align-items:center; gap:18px; padding:0 20px 0 26px; position:relative; overflow:hidden; }}
.box::before {{ content:""; position:absolute; left:-40px; bottom:-60px; width:220px; height:180px; border-radius:50%; background:rgba(176,105,141,.45); }}
.box::after {{ content:""; position:absolute; right:-30px; top:-50px; width:150px; height:120px; border-radius:50%; background:rgba(108,137,172,.35); }}
.t {{ flex:1; position:relative; z-index:1; }}
.t b {{ display:block; font:800 30px/1.25 'Baloo Bhaijaan 2'; }}
.t p {{ margin:4px 0 10px; font-size:16px; font-weight:700; opacity:.92; }}
.u {{ display:inline-block; font:600 17px 'Lexend'; direction:ltr; background:#fff; color:var(--navy); border-radius:10px; padding:4px 14px; }}
.q {{ position:relative; z-index:1; background:#fff; border-radius:14px; padding:6px; }}
</style></head><body><div class="box"><div class="t"><b>تبي تكون منهم؟</b><p>اشترك الآن في دورة {COURSE}{f" ({TRACK})" if TRACK else ""}</p><span class="u" id="st">mtgradl.com</span></div>
<div class="q" id="qr">{qr_img(STORE, 120)}</div></div></body></html>"""


def spread_order(items, grade_of, seed):
    """خلط عشوائي، والصور اللي درجتها متساوية تكون متباعدة قدر الإمكان (الـ25 مثلاً موزعة على الصفحات)،
    والدرجات العالية (HIGH وفوق) بعد ما تتجمع في مكان واحد."""
    rng = random.Random(seed)
    pool = items[:]
    rng.shuffle(pool)
    n = len(items)
    keys = [lambda it: grade_of(it), lambda it: grade_of(it) is not None and grade_of(it) >= HIGH]
    totals = [{} for _ in keys]
    for it in items:
        for t, key in zip(totals, keys):
            t[key(it)] = t.get(key(it), 0) + 1
    out = []

    def score(it):
        sc = 1.0
        for t, key in zip(totals, keys):
            k = key(it)
            if k is None or k is False:
                continue
            ideal = n / t[k]
            d = next((j for j, x in enumerate(reversed(out), 1) if key(x) == k), n)
            sc = min(sc, min(d, ideal) / ideal)
        return sc

    while pool:
        best = max(score(it) for it in pool)
        pick = rng.choice([it for it in pool if score(it) >= best - 0.05])
        pool.remove(pick)
        out.append(pick)
    return out


def spread_quality(order, grade_of):
    """أقل مسافة بين صورتين بنفس الدرجة (مقسومة على المسافة المثالية)، والـ25 وزنها أكبر."""
    n, q = len(order), []
    for k in {grade_of(x) for x in order if grade_of(x) is not None}:
        pos = [i for i, x in enumerate(order) if grade_of(x) == k]
        if len(pos) > 1:
            d = min(b - a for a, b in zip(pos, pos[1:])) / (n / len(pos))
            q.append(d * (0.5 if k == max(grade_of(x) for x in order) else 1))
    return min(q, default=1), sum(q)


def masonry(heights, H, gap):
    """توزيع على عمودين: كل صورة تروح للعمود الأقصر، وإذا ما وسعت تبدأ صفحة جديدة.
    يرجّع قائمة صفحات، كل صفحة [(index, عمود, y)]."""
    pages, cur, cols = [], [], [0.0, 0.0]
    for i, h in enumerate(heights):
        c = 0 if cols[0] <= cols[1] else 1
        y = cols[c] + (gap if cols[c] else 0)
        if y + h > H:
            c2 = 1 - c
            y2 = cols[c2] + (gap if cols[c2] else 0)
            if y2 + h <= H:
                c, y = c2, y2
            else:
                pages.append(cur)
                cur, cols, c, y = [], [0.0, 0.0], 0, 0.0
        cur.append((i, c, y))
        cols[c] = y + h
    if cur:
        pages.append(cur)
    return pages


def rounded_mask(page, r, rad, color):
    """يغطي زوايا الصورة بلون الخلفية عشان تطلع زواياها دائرية (بدون ما نعيد ضغط الصورة)."""
    k = 0.5523 * rad
    x0, y0, x1, y1 = r
    sh = page.new_shape()
    for (cx, cy, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        p0 = pymupdf.Point(cx, cy)
        a = pymupdf.Point(cx + sx * rad, cy)
        b = pymupdf.Point(cx, cy + sy * rad)
        sh.draw_polyline([b, p0, a])
        sh.draw_bezier(a, pymupdf.Point(cx + sx * (rad - k), cy), pymupdf.Point(cx, cy + sy * (rad - k)), b)
        sh.finish(fill=color, color=None, closePath=True)
    sh.commit()


def render(pg, html_text, out, bg=True):
    pg.set_content(html_text, wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.pdf(path=str(out), print_background=bg, prefer_css_page_size=True)


def check_links(page, uris):
    """روابط Chrome تنحفظ مع insert_pdf (Chrome يضيف / في آخر الرابط)، بس نتأكد إنها موجودة."""
    have = {(l.get("uri") or "").rstrip("/") for l in page.get_links()}
    missing = [u for u in uris if u.rstrip("/") not in have]
    if missing:
        raise SystemExit(f"روابط ناقصة في الصفحة: {missing}")


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("images", help="مجلد صور الدرجات")
    ap.add_argument("out")
    ap.add_argument("--grades", help="ملف: اسم_الملف<TAB>الدرجة")
    ap.add_argument("--seed", type=int, default=1448)
    ap.add_argument("--course", choices=sorted(PROFILES), help="مادة غير احص 102")
    a = ap.parse_args()
    if a.course:
        globals().update(PROFILES[a.course])

    files = sorted(p for p in pathlib.Path(a.images).iterdir() if p.suffix.lower() in IMG_EXT)
    if not files:
        raise SystemExit("ما فيه صور")
    grades = {}
    if a.grades:
        for line in pathlib.Path(a.grades).read_text(encoding="utf-8").splitlines():
            if line.strip() and not line.startswith("#"):
                name, g = line.split("\t")[:2]
                grades[name.strip()] = float(g)
        missing = [f.name for f in files if f.name not in grades]
        if missing:
            raise SystemExit(f"صور بدون درجة في {a.grades}: {missing}")
    # نجرب كذا خلطة ونختار اللي الدرجات المتساوية فيها أبعد عن بعض
    g = lambda p: grades.get(p.name)
    files = max((spread_order(files, g, a.seed + t) for t in range(200)), key=lambda o: spread_quality(o, g))

    # مقاسات الصفحة بالنقاط (A4 = 595×842)
    PW, PH = 595.28, 841.89
    mm = 72 / 25.4
    X0, X1 = 12 * mm, PW - 12 * mm
    Y0, Y1 = 31 * mm, PH - 22 * mm
    W, H, gap = X1 - X0, Y1 - Y0, 5 * mm
    CLOSE_MM = 48  # ارتفاع المربع الختامي
    colw = (W - gap) / 2
    heights = []
    for f in files:
        pix = pymupdf.Pixmap(str(f))
        heights.append(colw * pix.height / pix.width)
    pages = masonry(heights, H, gap)
    # توازن: أقل ارتفاع يعطي نفس عدد الصفحات، عشان آخر صفحة ما تطلع فاضية والصفحات متقاربة
    lo, hi = max(heights), H
    for _ in range(30):
        mid = (lo + hi) / 2
        if len(masonry(heights, mid, gap)) <= len(pages):
            hi = mid
        else:
            lo = mid
    pages = masonry(heights, hi, gap)

    tmp = pathlib.Path(tempfile.mkdtemp())
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page()
        render(pg, cover_html(), tmp / "cover.pdf")
        for k in range(len(pages)):
            render(pg, frame_html(k + 1, len(pages)), tmp / f"frame{k}.pdf")
        render(pg, closing_html(round(W / mm, 2), CLOSE_MM), tmp / "close.pdf", bg=True)
        render(pg, watermark_html(round((X1 - X0) / mm, 2), round((Y1 - Y0) / mm, 2)), tmp / "wm.pdf", bg=False)
        b.close()

    out = pymupdf.open()
    out.insert_pdf(pymupdf.open(tmp / "cover.pdf"))
    if out.page_count != 1:
        raise SystemExit(f"الغلاف طلع {out.page_count} صفحات")
    check_links(out[0], [u for u in (DEMO, STORE, TELEGRAM, OVERVIEW) if u])
    wm = pymupdf.open(tmp / "wm.pdf")
    shadow = hexrgb("#e9dfd0")
    for k, cells in enumerate(pages):
        out.insert_pdf(pymupdf.open(tmp / f"frame{k}.pdf"))
        page = out[-1]
        check_links(page, [STORE, TELEGRAM])
        # المحتوى في النص عمودياً
        used = max(y + heights[i] for i, _, y in cells)
        dy = min((H - used) / 2, 4 * mm)
        for i, c, y in cells:
            x = X1 - colw - c * (colw + gap)  # العمود الأول يمين (RTL)
            r = pymupdf.Rect(x, Y0 + dy + y, x + colw, Y0 + dy + y + heights[i])
            page.draw_rect(r + (2.5, 3, 2.5, 3), color=None, fill=shadow, radius=9 / min(r.width, r.height))
            page.insert_image(r, filename=str(files[i]))  # الصورة الأصلية نفسها بدون ضغط
            rounded_mask(page, r, 9, CREAM)
            # العلامة المائية على الصورة نفسها (نفس النمط ممتد على الصفحة، بس ما يطلع على الفراغ)
            page.show_pdf_page(r, wm, 0, clip=r - (X0, Y0, X0, Y0), overlay=True)
            page.draw_rect(r, color=hexrgb(BLUE), width=1, radius=9 / min(r.width, r.height))

    # المربع الختامي في آخر صفحة إذا فيه فراغ تحت الصور
    page = out[-1]
    cells = pages[-1]
    bottom = Y0 + min((H - max(y + heights[i] for i, _, y in cells)) / 2, 4 * mm) + max(y + heights[i] for i, _, y in cells)
    box_h = CLOSE_MM * mm
    if Y1 - bottom >= box_h + gap:
        r = pymupdf.Rect(X0, Y1 - box_h, X1, Y1)
        page.show_pdf_page(r, pymupdf.open(tmp / "close.pdf"), 0)
        page.insert_link({"kind": pymupdf.LINK_URI, "from": r, "uri": STORE})
    out.set_metadata({"title": f"درجات طلاب دورة ملازم عدل — {COURSE} ({track_label()})", "author": "ملازم عدل"})
    out.save(a.out, garbage=3, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة، {len(files)} صورة")
    print("الترتيب:", " ".join(f"{f.stem}({grades.get(f.name, '?')})" for f in files))


if __name__ == "__main__":
    sys.exit(main())
