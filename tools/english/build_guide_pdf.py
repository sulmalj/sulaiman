"""يبني ملف دليل الميد للإنجليزي:
صفحة إعلان + صفحات الملف الأصلي (بدون Source/Units وبدون قائمة الكلمات، ومع حل النماذج) + بطاقات الكلمات + إعلان ثاني.

الاستخدام:
  المسار الإنساني:
    python3 tools/english/build_guide_pdf.py store/english/midterm-guide-humanities-original.pdf store/english/midterm-guide-humanities-ready.pdf
  جميع المسارات باستثناء الإنساني (الأصلي ملف المسار الطبي ENGL 108/109B):
    python3 tools/english/build_guide_pdf.py store/english/midterm-guide-engl108-original.pdf store/english/midterm-guide-all-tracks-except-humanities-ready.pdf \
      --vocab tools/english/vocab_cards_medical.txt --track "جميع المسارات باستثناء المسار الإنساني"
"""
import argparse, html, re, sys, tempfile, pathlib
import base64, io
import pymupdf, segno
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
TELEGRAM = "https://t.me/mlazmadl"
STORE = "https://mtgradl.com"

CSS = """
@page { size: A4; margin: 14mm 12mm 18mm; }
:root { --navy:#1f2f57; --rose:#c2355f; --rose-soft:#fbe9ef; --cream:#fffaf2; --gold:#e8a33d; --ink:#2a2f3a; --muted:#6a7080; }
* { box-sizing:border-box; }
html,body { margin:0; background:#fff; color:var(--ink); font-family:'Tajawal',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.en { font-family:'Lexend',sans-serif; direction:ltr; }
a { color:inherit; text-decoration:none; }
"""

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Lexend:wght@400;500;600;700&display=block" rel="stylesheet">'


def qr_img(url, px):
    """باركود كصورة PNG حادة (المربعات واضحة وتنقرأ بالكاميرا)."""
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=20, border=2, dark="#1f2f57")
    return (f'<img alt="QR" src="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}" '
            f'style="width:{px}px;height:{px}px;display:block;margin:0 auto 4px;image-rendering:pixelated">')


def ad_page(extra=""):
    """extra: سطر إضافي (اختياري) يطلع فوق صندوق المتجر — مثل «عندنا جميع مواد المسار الإنساني»."""
    qr = qr_img(STORE, 140)
    items = ["موقع للتدريب شامل كل الأقسام", "تدريب على القطع", "تدريب على الاستماع",
             "تدريب على الفوكاب", "تدريب على القواعد", "شرح كامل القواعد"]
    lis = "".join(f'<li><span class="tick">✓</span>{t}</li>' for t in items)
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{CSS}
@page {{ size:A4; margin:0; }}
body {{ background:var(--cream); }}
.pg {{ width:210mm; height:297mm; padding:16mm 16mm 16mm; display:flex; flex-direction:column; justify-content:space-between; }}
.tg {{ display:flex; align-items:center; justify-content:center; gap:10px; background:var(--navy); color:#fff; border-radius:14px; padding:11px 16px; font-weight:700; font-size:20px; }}
.tg .lnk {{ font-family:'Lexend'; direction:ltr; background:#fff; color:var(--navy); border-radius:8px; padding:4px 12px; font-size:18px; }}
.hero {{ text-align:center; }}
.brand {{ display:inline-block; font-size:18px; font-weight:800; color:var(--rose); background:var(--rose-soft); border-radius:999px; padding:5px 16px; }}
h1 {{ margin:10px 0 0; font-size:48px; font-weight:800; color:var(--navy); line-height:1.25; }}
.card {{ background:#fff; border:2px solid #ecdcc4; border-radius:18px; padding:22px 26px; box-shadow:0 6px 0 #f1e3cc; }}
.card h2 {{ margin:0 0 14px; font-size:24px; color:var(--rose); }}
ul {{ list-style:none; margin:0; padding:0; display:grid; grid-template-columns:1.35fr 1fr; gap:16px 18px; }}
li {{ font-size:21px; font-weight:700; color:var(--navy); display:flex; align-items:center; gap:9px; }}
.tick {{ flex:none; width:28px; height:28px; border-radius:50%; background:var(--gold); color:#fff; display:grid; place-items:center; font-size:14px; }}
.chips {{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }}
.chip {{ background:var(--navy); color:#fff; border-radius:14px; padding:18px 14px; text-align:center; font-weight:700; font-size:19px; line-height:1.5; }}
.chip b {{ display:block; font-size:40px; color:var(--gold); font-family:'Lexend'; direction:ltr; }}
.note {{ text-align:center; font-size:19px; font-weight:700; color:var(--navy); background:var(--rose-soft); border-radius:12px; padding:14px; }}
.buy {{ display:flex; align-items:center; gap:18px; background:#fff; border:2px dashed var(--rose); border-radius:18px; padding:22px 26px; }}
.buy .txt {{ flex:1; }}
.buy .price {{ font-size:28px; font-weight:800; color:var(--navy); }}
.btn {{ display:inline-block; margin-top:10px; background:var(--rose); color:#fff; border-radius:12px; padding:11px 28px; font-size:24px; font-weight:700; font-family:'Lexend'; direction:ltr; }}
.qr {{ flex:none; width:180px; text-align:center; font-size:14px; color:var(--muted); }}
.qr svg {{ width:140px; height:140px; display:block; margin:0 auto 4px; }}
.extra {{ text-align:center; font-size:23px; font-weight:800; color:#fff; background:var(--rose); border-radius:14px; padding:14px; line-height:1.5; }}
.extra small {{ display:block; font-size:17px; font-weight:500; opacity:.95; }}
</style></head><body><div class="pg">
<a class="tg" href="{TELEGRAM}">قناتنا لمعرفة كل جديد <span class="lnk">t.me/mlazmadl</span></a>
<div class="hero"><span class="brand">ملازم عدل</span><h1>دورة ملازم عدل للإنجليزي</h1></div>
<div class="card"><h2>تشمل ما يلي:</h2><ul>{lis}</ul></div>
<div class="chips">
 <div class="chip"><b>900+</b>سؤال تدريبي شاملة كل الأقسام</div>
 <div class="chip"><b>✓</b>تصحيح تلقائي من الموقع</div>
</div>
<div class="note">(تم وضع مستوى الأسئلة في موقعنا على مستوى مشابه للاختبار)</div>
{extra}<div class="buy">
 <div class="txt"><div class="price">سعر الدورة في متناول اليد</div>
  <a class="btn" href="{STORE}">mtgradl.com</a></div>
 <a class="qr" href="{STORE}">{qr}امسح الباركود لزيارة المتجر</a>
</div>
</div></body></html>"""


def ad2():
    qr = qr_img(STORE, 104)
    tiles = [("القواعد", "Grammar"), ("الكلمات", "Vocabulary"), ("القطع", "Reading"), ("الاستماع", "Listening")]
    t = "".join(f'<div class="tile"><b>{a}</b><span>{b}</span></div>' for a, b in tiles)
    return f"""<div class="ad2"><span class="kick">خلّصت الكلمات؟</span>
<h2>الحين جاء وقت التدريب الحقيقي</h2>
<p class="sub">دورة ملازم عدل للإنجليزي — موقع تدريب شامل كل أقسام الاختبار، مع شرح كامل القواعد</p>
<div class="tiles">{t}</div>
<div class="row"><div class="t">أكثر من <strong>900 سؤال</strong> بمستوى مشابه للاختبار، و<strong>تصحيح تلقائي</strong> من الموقع.<br>سعر الدورة في متناول اليد<br>
<a class="go" href="{STORE}">mtgradl.com</a></div><a class="qr" href="{STORE}">{qr}</a></div>
<a class="tg2" href="{TELEGRAM}">قناتنا لمعرفة كل جديد: <span>t.me/mlazmadl</span></a></div>"""


def vocab_pages(vocab_file):
    rows = []
    for line in pathlib.Path(vocab_file).read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        w, pos, ar, s, s_ar = [x.strip() for x in line.split(" | ")]
        rows.append((w, pos, ar, s, s_ar))
    cards = []
    for i, (w, pos, ar, s, s_ar) in enumerate(rows, 1):
        s = re.sub(r"\*\*(.+?)\*\*", r"<mark>\1</mark>", html.escape(s))
        cards.append(f"""<div class="c"><div class="top"><span class="n">{i}</span>
<span class="w en">{html.escape(w)}</span><span class="m">{html.escape(ar)}</span></div>
<div class="s en">{s}</div><div class="sa">{html.escape(s_ar)}</div></div>""")
    doc = f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{CSS}
.head {{ display:flex; align-items:center; justify-content:space-between; background:var(--navy); color:#fff; border-radius:12px; padding:10px 16px; margin-bottom:10px; }}
.head .t {{ font-size:20px; font-weight:800; }}
.head .t small {{ font-weight:500; opacity:.8; font-size:13px; margin-inline-start:6px; }}
.head .en {{ font-size:17px; font-weight:600; color:var(--gold); }}
.grid {{ columns:2; column-gap:10px; }}
.c {{ break-inside:avoid; border:1px solid #e7e2d8; border-left:4px solid var(--rose); border-radius:10px; padding:4px 9px 5px; margin-bottom:5px; background:#fff; }}
.c:nth-child(even) {{ background:var(--cream); }}
.top {{ display:flex; align-items:center; gap:7px; direction:ltr; }}
.n {{ flex:none; min-width:22px; height:20px; border-radius:6px; background:var(--rose-soft); color:var(--rose); font:600 11px 'Lexend'; display:grid; place-items:center; padding:0 3px; }}
.w {{ font-size:15px; font-weight:700; color:var(--navy); white-space:nowrap; }}
.pos {{ font-size:9px; font-weight:500; color:var(--muted); border:1px solid #e1dccf; border-radius:5px; padding:0 4px; white-space:nowrap; }}
.m {{ margin-left:auto; direction:rtl; font-size:14px; font-weight:800; color:var(--rose); }}
.s {{ font-size:11.5px; color:var(--ink); margin-top:2px; line-height:1.4; text-align:left; }}
mark {{ background:#fde7b8; color:var(--navy); font-weight:600; border-radius:3px; padding:0 2px; }}
.sa {{ font-size:11.5px; color:var(--muted); line-height:1.45; }}
.ad2 {{ break-inside:avoid; margin-top:12px; background:var(--navy); color:#fff; border-radius:20px; padding:22px 24px; position:relative; overflow:hidden; }}
.ad2::before {{ content:""; position:absolute; inset:auto -60px -60px auto; width:220px; height:220px; border-radius:50%; background:var(--rose); opacity:.35; }}
.ad2::after {{ content:""; position:absolute; inset:-50px auto auto -50px; width:160px; height:160px; border-radius:50%; border:18px solid var(--gold); opacity:.25; }}
.ad2 > * {{ position:relative; }}
.ad2 .kick {{ display:inline-block; background:var(--gold); color:var(--navy); font-weight:800; font-size:14px; border-radius:999px; padding:4px 14px; }}
.ad2 h2 {{ margin:10px 0 4px; font-size:30px; font-weight:800; line-height:1.3; }}
.ad2 .sub {{ font-size:16px; opacity:.9; margin:0 0 14px; }}
.ad2 .tiles {{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; }}
.ad2 .tile {{ background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); border-radius:12px; padding:10px 6px; text-align:center; }}
.ad2 .tile b {{ display:block; font-size:17px; }}
.ad2 .tile span {{ font-family:'Lexend'; font-size:11px; color:var(--gold); }}
.ad2 .row {{ display:flex; align-items:center; gap:18px; background:#fff; color:var(--navy); border-radius:14px; padding:12px 16px; }}
.ad2 .row .t {{ flex:1; font-size:15px; font-weight:700; line-height:1.6; }}
.ad2 .row .t strong {{ color:var(--rose); }}
.ad2 .go {{ display:inline-block; margin-top:6px; background:var(--rose); color:#fff; border-radius:10px; padding:6px 18px; font:600 18px 'Lexend'; }}
.ad2 .qr svg {{ width:96px; height:96px; display:block; }}
.ad2 .tg2 {{ display:block; margin-top:12px; text-align:center; font-size:15px; font-weight:700; }}
.ad2 .tg2 span {{ font-family:'Lexend'; color:var(--gold); }}
.foot {{ position:fixed; bottom:-12mm; left:0; right:0; text-align:center; }}
.foot a {{ display:inline-block; background:var(--rose-soft); color:var(--navy); border-radius:8px; padding:3px 12px; font-size:12.5px; font-weight:700; }}
.foot a span {{ font-family:'Lexend'; color:var(--rose); }}
</style></head><body>
<div class="head"><div class="t">الكلمات ومعانيها<small>({len(rows)} كلمة)</small></div><div class="en">Vocabulary List</div></div>
<div class="grid">{''.join(cards)}</div>{ad2()}</body></html>"""
    return doc, len(rows)


def render(page, html_text, out):
    page.set_content(html_text, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.pdf(path=str(out), format="A4", print_background=True, prefer_css_page_size=True)


# إجابات النماذج: (رقم الصفحة في الملف الأصلي، بداية نص السؤال، نص الخيار الصحيح)
ANSWERS = [
    (4, "1. She usually", "drinks"), (4, "2. Where does he", "live"), (4, "3. A:", "Are they"),
    (4, "4. A: When", "are you going to submit"), (4, "5. It", "is important to be"),
    (4, "6. You", "shouldn't eat"), (4, "7. He", "is going to"), (4, "8. Please", "don't shout"),
    (4, "9. My friend", "bought"), (4, "10. I", "didn't know"),
    (5, "1. What happened", "Banana smoothies were first made."),
    (5, "2. How many calories", "100 calories in a medium banana"),
    (5, "3. Which of the following", "They can cause stomach ulcers."),
    (5, "4. Banana smoothies should NOT", "sugar"),
    (5, "5. In paragraph 1", "work properly"), (5, "6. In paragraph 4", "helpful"),
    (5, "7. What does the underlined", "wonderful fruit"),
    (5, "8. Which of these titles", "Have a Banana Smoothie"),
    (6, "1.The man is calling", "to make a reservation"), (6, "2.The hotel is located", "Jeddah"),
    (6, "3.How long", "Three nights"), (6, "4.When will the man", "January 13th"),
    (6, "5.Why is the man", "He is meeting friends."),
    (7, "1. I don", "fit"), (7, "2. I want", "an international"), (7, "3. She", "pleasant"),
    (7, "4. My watch", "repair"), (7, "5. Someone", "a manager"), (7, "6. Special clothes", "uniform"),
    (7, "7. The library", "crowded"), (7, "8. Look at the sky", "cloudy"),
    (7, "9. An area of land", "an island"), (7, "10. Fatima", "retired"),
]
RED = (0.86, 0.12, 0.12)


def lines_of(page):
    """أسطر الصفحة: [(نص السطر، مستطيله)] — كل كتلة نصية تتقسم أسطر."""
    out = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            t = "".join(sp["text"] for sp in l["spans"]).strip().replace("\u2019", "'")
            if t:
                out.append((t, pymupdf.Rect(l["bbox"])))
    return out


def mark_answers(doc):
    for pno, q, ans in ANSWERS:
        page = doc[pno - 1]
        L = lines_of(page)
        qs = [r for t, r in L if t.startswith(q)]
        assert len(qs) == 1, (pno, q, len(qs))
        qr = qs[0]
        col0, col1 = (qr.x0 - 2, qr.x0 + 370)
        # الخيار: سطر نصه = الإجابة، تحت السؤال وفي نفس العمود، وأقرب واحد
        c = [r for t, r in L if t == ans and col0 <= r.x0 <= col1 and qr.y0 < r.y0 < qr.y1 + 95]
        assert c, (pno, q, ans)
        r = min(c, key=lambda r: r.y0)
        letter = [lr for t, lr in L if t in "ABCD" and len(t) == 1 and abs((lr.y0 + lr.y1) / 2 - (r.y0 + r.y1) / 2) < 3
                  and col0 - 5 <= lr.x0 < r.x0]
        x0 = min([lr.x0 for lr in letter] + [r.x0])
        box = pymupdf.Rect(x0 - 4, r.y0 - 1.5, r.x1 + 4, r.y1 + 1.5)
        page.draw_rect(box, color=RED, width=1.6)


def hide_source_units(page):
    """يشيل صفوف Source/Units (العنوان + الصفين) ويخلي الجدول مقفل نظيف."""
    hits = [r for t, r in lines_of(page) if t.startswith("Source")]
    assert len(hits) == 1
    top = hits[0].y0 - 0.6  # خط الحد فوق عنوان Source يبقى
    nxt = [r for t, r in lines_of(page) if t == "Grammar"][0]
    # المنطقة من تحت خط Source لين الخط الأفقي اللي فوق قسم Grammar
    hl = [d["rect"].y0 for d in page.get_drawings()
          if d["rect"].height < 1.5 and d["rect"].width > 400 and top < d["rect"].y0 < nxt.y0]
    dr = [d["rect"] for d in page.get_drawings()]
    hx = [r for r in dr if r.height < 1.5 and r.width > 400]
    x0, x1 = min(r.x0 for r in hx), max(r.x1 for r in hx)  # عرض الجدول نفسه
    vx = [(r.x0 + r.x1) / 2 for r in dr if r.width < 1.5 and r.height > 5]
    bl = min(vx, key=lambda x: abs(x - x0))  # مكان الحد اليسار الأصلي بالضبط
    br = min(vx, key=lambda x: abs(x - x1))
    area = pymupdf.Rect(x0 - 0.5, top, x1 + 0.5, max(hl) - 0.4)
    page.add_redact_annot(area, fill=(1, 1, 1))
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED)
    # نرجّع حدود الجدول اليمين واليسار في المكان الفاضي
    # نرجّع حدود الجدول الخارجية (أطراف الخطوط الأفقية)
    for x in (bl, br):
        page.draw_line((x, area.y0 - 0.3), (x, area.y1 + 0.3), color=(0, 0, 0), width=0.6)


def hide_course_code(page, track):
    """يشيل رمز المقرر (ENGL 102 / 103B) ويرجّع سطر المسار في النص (طلب المستخدم)."""
    hits = [r for t, r in lines_of(page) if t.startswith("ENGL")]
    assert len(hits) == 1
    r = hits[0]
    page.add_redact_annot(r + (-1, -0.5, 1, 0.5), fill=(1, 1, 1))
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    # المسافة بين صندوق العنوان والجدول اللي تحته — نكتب المسار فيها بخط كبير وواضح
    hl = sorted(d["rect"].y0 for d in page.get_drawings() if d["rect"].height < 1.5 and d["rect"].width > 400)
    top = max(y for y in hl if y < r.y0) + 0.8
    bot = min(y for y in hl if y > r.y1) - 0.8
    box = pymupdf.Rect(20.7, top, 576.5, bot)
    fs = min(14, (bot - top) * 0.58)
    arch = pymupdf.Archive(str(HERE.parent / "statistics"))  # فيه cairo-bold.ttf (خط عربي عريض)
    css = "@font-face {font-family: cairob; src: url(cairo-bold.ttf);}"
    page.insert_htmlbox(box, f'<p dir="rtl" style="text-align:center;margin:0;line-height:1;padding-top:{(bot - top - fs * 1.15) / 2:.1f}px;'
                             f'font-family:cairob;font-size:{fs:.1f}px;color:#9b1c1c">'
                             + html.escape(track) + '</p>', css=css, archive=arch)


def hide_page_numbers(doc):
    """أرقام صفحات الملف الأصلي تتلخبط بعد حذف صفحتين القائمة، فنشيلها."""
    for page in doc:
        for t, r in lines_of(page):
            if t.isdigit() and r.y0 > page.rect.height - 60:
                page.add_redact_annot(r + (-2, -1, 2, 1), fill=(1, 1, 1))
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src", help="ملف المسار الإنساني الأصلي")
    ap.add_argument("out")
    ap.add_argument("--vocab", default=str(HERE / "vocab_cards.txt"), help="ملف بطاقات الكلمات الخاص بالمسار")
    ap.add_argument("--track", default="المسار الإنساني (Humanities)", help="سطر المسار اللي يبقى في الغلاف")
    a = ap.parse_args()
    tmp = pathlib.Path(tempfile.mkdtemp())
    vdoc, n = vocab_pages(a.vocab)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page()
        render(pg, ad_page(), tmp / "ad.pdf")
        render(pg, vdoc, tmp / "vocab.pdf")
        pg.set_content(f'<html dir="rtl"><head>{FONTS}<style>@page{{margin:0}} html,body{{margin:0;background:#fff;font-family:Tajawal}} a{{display:inline-block;background:#fbe9ef;color:#1f2f57;border-radius:8px;padding:4px 14px;font-size:13px;font-weight:700}} span{{font-family:Lexend;color:#c2355f}}</style></head><body><a id="f">قناتنا لمعرفة كل جديد: <span>t.me/mlazmadl</span></a></body></html>', wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        bb = pg.locator("#f").bounding_box()
        pg.pdf(path=str(tmp / "foot.pdf"), width=f"{bb['width']+1}px", height=f"{bb['height']+1}px", print_background=True, page_ranges="1")
        b.close()

    src = pymupdf.open(a.src)
    hide_source_units(src[0])
    hide_course_code(src[0], a.track)
    mark_answers(src)
    src.delete_pages([1, 2])  # صفحتين قائمة الكلمات الأصلية — بدالها بطاقات الكلمات
    hide_page_numbers(src)

    out = pymupdf.open()
    out.insert_pdf(pymupdf.open(tmp / "ad.pdf"))
    s0 = out.page_count
    out.insert_pdf(src)
    out.insert_pdf(pymupdf.open(tmp / "vocab.pdf"))
    foot = pymupdf.open(tmp / "foot.pdf")
    fr = foot[0].rect
    for i in range(s0, out.page_count):
        pg = out[i]
        r = pymupdf.Rect((pg.rect.width - fr.width) / 2, pg.rect.height - fr.height - 6,
                         (pg.rect.width + fr.width) / 2, pg.rect.height - 6)
        pg.show_pdf_page(r, foot, 0)
        pg.insert_link({"kind": pymupdf.LINK_URI, "from": r, "uri": TELEGRAM})
    out.set_metadata({"title": f"دليل الميد للإنجليزي — {a.track}", "author": "ملازم عدل"})
    out.save(a.out, garbage=3, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة، {n} كلمة")


if __name__ == "__main__":
    sys.exit(main())
