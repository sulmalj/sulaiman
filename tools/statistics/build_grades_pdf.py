"""يبني ملف «درجات طلابنا» لدورة احص 102 (المسار الإنساني):
صفحة غلاف إعلانية + صفحات صور الدرجات (ترتيب عشوائي، الدرجات المتشابهة متفرقة)
مع علامة مائية بحقوق ملازم عدل ورابط القناة والمتجر أسفل كل صفحة.

الاستخدام:
  python3 tools/statistics/build_grades_pdf.py store/statistics/grades/images store/statistics/grades/grades-ready.pdf
  (اختياري) --grades ملف فيه سطر لكل صورة: «اسم_الملف<TAB>الدرجة» عشان الدرجات المتساوية ما تجي ورا بعض.
  (اختياري) --seed رقم ثابت للخلط (نفس الرقم = نفس الترتيب).
"""
import argparse, base64, io, pathlib, random, sys, tempfile
import pymupdf, segno
from playwright.sync_api import sync_playwright

TELEGRAM = "https://t.me/mlazmadl"
STORE = "https://mtgradl.com"
DEMO = "https://t.me/mlazmadl/3465"
COURSE = "احص 102"
TRACK = "المسار الإنساني"
FEATURES = ["ملزمة مرتبة وشاملة", "شروحات لكامل الدروس", "حلول للواجبات",
            "شروحات للواجبات", "كويزات للمعلومات النظرية", "تغني عن الكتاب واي مصدر آخر"]
IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800'
         '&family=Lexend:wght@400;600;700&family=Lalezar&display=block" rel="stylesheet">')
BASE_CSS = """
:root { --navy:#13294b; --blue:#1d4ed8; --orange:#f08a24; --orange-soft:#fff1e2; --sky:#eaf1ff; --ink:#1f2633; --muted:#5b6475; }
* { box-sizing:border-box; }
html,body { margin:0; color:var(--ink); font-family:'Tajawal',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
a { color:inherit; text-decoration:none; }
.en { font-family:'Lexend',sans-serif; direction:ltr; unicode-bidi:isolate; }
"""


def qr_img(url, px):
    """باركود PNG حاد (نسخة SVG ما كانت تنقرأ)."""
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=20, border=2, dark="#13294b")
    return (f'<img alt="QR" src="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}" '
            f'style="width:{px}px;height:{px}px;display:block;image-rendering:pixelated">')


def cover_html(n_imgs):
    lis = "".join(f'<li><span class="tick">✓</span>{t}</li>' for t in FEATURES)
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:A4; margin:0; }}
body {{ background:#fff; }}
.page {{ width:210mm; height:297mm; padding:12mm 12mm 10mm; display:flex; flex-direction:column; justify-content:space-between;
  background:radial-gradient(circle at 100% 0, #dbe7ff 0, transparent 38%), radial-gradient(circle at 0 100%, #ffe6cc 0, transparent 34%), #fff; }}
.top {{ display:flex; justify-content:space-between; align-items:flex-start; }}
.brand {{ font-family:'Lalezar'; font-size:30px; color:var(--navy); background:#fff; border:2px solid var(--navy); border-radius:14px; padding:2px 18px 0; box-shadow:4px 4px 0 var(--orange); }}
.badge {{ text-align:center; border:2.5px solid var(--blue); border-radius:14px; padding:6px 14px; background:#fff; box-shadow:5px 5px 0 var(--orange); }}
.badge b {{ display:block; font-size:18px; font-weight:800; color:var(--blue); }}
.badge span {{ font-size:14px; font-weight:700; color:var(--navy); }}
.hero {{ text-align:center; }}
.hero .k {{ display:inline-block; background:var(--orange); color:#fff; font-weight:800; font-size:20px; border-radius:999px; padding:4px 18px; }}
.hero h1 {{ font-family:'Lalezar'; font-weight:400; margin:6px 0 0; font-size:84px; line-height:1.1; color:var(--navy); }}
.hero h1 em {{ font-style:normal; color:var(--blue); }}
.hero .tr {{ display:inline-block; margin-top:6px; font-size:26px; font-weight:800; color:#fff; background:var(--navy); border-radius:12px; padding:5px 22px; }}
.card {{ background:#fff; border:2px solid #d6e2fb; border-radius:20px; padding:18px 20px; box-shadow:0 6px 18px rgba(19,41,75,.08); }}
.card h2 {{ margin:0 0 14px; font-size:27px; font-weight:800; color:var(--blue); }}
ul {{ list-style:none; margin:0; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:12px 14px; }}
li {{ display:flex; align-items:center; gap:9px; font-size:20.5px; font-weight:800; color:var(--navy); background:var(--sky); border-radius:14px; padding:14px 10px; }}
.tick {{ flex:none; width:30px; height:30px; border-radius:50%; background:var(--orange); color:#fff; display:grid; place-items:center; font-size:14px; }}
.links {{ display:grid; grid-template-columns:1fr 1fr; gap:4.2mm; }}
.lk {{ display:flex; align-items:center; gap:12px; border-radius:20px; padding:16px 16px; }}
.lk .t {{ flex:1; }}
.lk .t b {{ display:block; font-size:24px; font-weight:800; line-height:1.35; }}
.lk .t small {{ display:block; font-size:14px; font-weight:600; opacity:.9; margin:2px 0 7px; line-height:1.5; }}
.lk .u {{ display:inline-block; font:700 15px 'Lexend'; direction:ltr; border-radius:9px; padding:4px 10px; }}
.qr {{ flex:none; background:#fff; border-radius:12px; padding:5px; }}
.demo {{ background:var(--navy); color:#fff; }}
.demo .u {{ background:var(--orange); color:#fff; }}
.store {{ background:var(--orange-soft); color:var(--navy); border:2px solid var(--orange); }}
.store .u {{ background:var(--navy); color:#fff; }}
.proof {{ text-align:center; background:linear-gradient(90deg, var(--blue), var(--navy)); color:#fff; border-radius:18px; padding:16px 12px; }}
.proof b {{ display:block; font-family:'Lalezar'; font-weight:400; font-size:40px; line-height:1.2; }}
.proof span {{ font-size:18px; font-weight:700; opacity:.95; }}
.tg {{ display:flex; justify-content:center; align-items:center; gap:10px; font-size:19px; font-weight:800; color:var(--navy); }}
.tg .u {{ font:700 16px 'Lexend'; direction:ltr; background:var(--sky); color:var(--blue); border-radius:9px; padding:4px 12px; }}
</style></head><body><div class="page">
<div class="top">
  <div class="brand">ملازم عدل</div>
  <div class="badge"><b>الأقدم في شروحات {COURSE}</b><span>منذ عام 1444 هـ</span></div>
</div>
<div class="hero">
  <span class="k">دورة ملازم عدل</span>
  <h1>دورة <em>{COURSE}</em></h1>
  <span class="tr">{TRACK}</span>
</div>
<div class="card"><h2>الدورة تشمل:</h2><ul>{lis}</ul></div>
<div class="links">
  <a class="lk demo" href="{DEMO}"><div class="t"><b>شاهد الشرح التجريبي</b><small>جرّب بنفسك قبل ما تشترك</small><span class="u">t.me/mlazmadl/3465</span></div><div class="qr">{qr_img(DEMO, 128)}</div></a>
  <a class="lk store" href="{STORE}"><div class="t"><b>اشترك الآن من متجرنا</b><small>اضغط على الرابط أو امسح الباركود</small><span class="u">mtgradl.com</span></div><div class="qr">{qr_img(STORE, 128)}</div></a>
</div>
<div class="proof"><b>درجات طلابنا تتكلم عنّا</b><span>شوف درجات مشتركي الدورة في الصفحات التالية ({n_imgs} صورة)</span></div>
<a class="tg" href="{TELEGRAM}">قناتنا لمعرفة كل جديد: <span class="u">t.me/mlazmadl</span></a>
</div></body></html>"""


def frame_html(page_no, total):
    """إطار صفحات الدرجات: عنوان فوق + روابط القناة والمتجر تحت."""
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:A4; margin:0; }}
body {{ background:#fff; }}
.page {{ width:210mm; height:297mm; position:relative; background:linear-gradient(#f4f7fd, #fff 20%); }}
.head {{ position:absolute; top:8mm; left:10mm; right:10mm; height:13mm; display:flex; align-items:center; justify-content:space-between;
  background:var(--navy); color:#fff; border-radius:12px; padding:0 14px; box-shadow:4px 4px 0 var(--orange); }}
.head b {{ font-family:'Lalezar'; font-weight:400; font-size:23px; }}
.head span {{ font-size:14px; font-weight:700; color:#ffd7ad; }}
.foot {{ position:absolute; bottom:6mm; left:10mm; right:10mm; height:12mm; display:flex; gap:3mm; }}
.foot a {{ flex:1; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:11px; font-size:14.5px; font-weight:800; }}
.foot .u {{ font:700 14px 'Lexend'; direction:ltr; }}
.foot .tg {{ background:var(--sky); color:var(--navy); }} .foot .tg .u {{ color:var(--blue); }}
.foot .st {{ background:var(--orange-soft); color:var(--navy); border:1.5px solid var(--orange); }} .foot .st .u {{ color:#c25e00; }}
.pn {{ position:absolute; bottom:19.5mm; left:0; right:0; text-align:center; font:600 10px 'Lexend'; color:var(--muted); }}
</style></head><body><div class="page">
<div class="head"><b>درجات طلاب دورة ملازم عدل</b><span>{COURSE} · {TRACK}</span></div>
<div class="pn"><span class="en">{page_no} / {total}</span></div>
<div class="foot">
  <a class="tg" href="{TELEGRAM}">قناتنا لمعرفة كل جديد: <span class="u">t.me/mlazmadl</span></a>
  <a class="st" href="{STORE}">اشترك من متجرنا: <span class="u">mtgradl.com</span></a>
</div></div></body></html>"""


def watermark_html():
    """علامة مائية شفافة (بدون خلفية) تنحط فوق الصور."""
    cells = "".join('<div class="w">حقوق ملازم عدل<small>mtgradl.com</small></div>' for _ in range(40))
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page {{ size:190mm 248mm; margin:0; }}
html,body {{ background:transparent; overflow:hidden; }}
.page {{ width:190mm; height:248mm; overflow:hidden; position:relative; }}
.grid {{ position:absolute; left:-70mm; top:-60mm; width:330mm; height:380mm; transform:rotate(-30deg);
  display:grid; grid-template-columns:repeat(5, 1fr); align-content:space-around; justify-items:center; row-gap:16mm; }}
.w {{ font-family:'Lalezar'; font-size:31px; color:rgba(19,41,75,.13); text-align:center; line-height:1.1; white-space:nowrap; }}
.w small {{ display:block; font:700 14px 'Lexend'; color:rgba(240,138,36,.2); }}
.w:nth-child(10n+6), .w:nth-child(10n+7), .w:nth-child(10n+8), .w:nth-child(10n+9), .w:nth-child(10n+10) {{ transform:translateX(-24mm); }}
</style></head><body><div class="page"><div class="grid">{cells}</div></div></body></html>"""


def spread_order(items, grade_of, seed):
    """خلط عشوائي، والصور اللي درجتها متساوية ما تجي جنب بعض (قدر الإمكان)."""
    rng = random.Random(seed)
    pool = items[:]
    rng.shuffle(pool)
    out = []
    while pool:
        # الأولوية للدرجة الأكثر تبقّياً (عشان ما تتكدس في الآخر)، بشرط ما تساوي آخر درجتين
        counts = {}
        for it in pool:
            counts[grade_of(it)] = counts.get(grade_of(it), 0) + 1
        recent = {grade_of(x) for x in out[-2:]}
        cands = [it for it in pool if grade_of(it) not in recent or grade_of(it) is None] or \
                [it for it in pool if not out or grade_of(it) != grade_of(out[-1])] or pool
        top = max(counts.get(grade_of(it), 0) for it in cands)
        best = [it for it in cands if counts.get(grade_of(it), 0) >= max(1, top - 1)]
        pick = rng.choice(best)
        pool.remove(pick)
        out.append(pick)
    return out


def layout(aspects, W, H, gap, target_h):
    """صفوف متساوية العرض (justified rows) ثم توزيع الصفوف على الصفحات.
    يرجّع: قائمة صفحات، كل صفحة قائمة صفوف، كل صف (ارتفاع، [(index, عرض)])."""
    rows, cur = [], []
    for i, a in enumerate(aspects):
        cur.append(i)
        s = sum(aspects[j] for j in cur)
        if s * target_h + gap * (len(cur) - 1) >= W:
            h = min((W - gap * (len(cur) - 1)) / s, H)
            rows.append((h, cur))
            cur = []
    if cur:  # آخر صف: بنفس الارتفاع المستهدف وفي النص
        s = sum(aspects[j] for j in cur)
        h = min(target_h, (W - gap * (len(cur) - 1)) / s, H)
        rows.append((h, cur))
    pages, pg, used = [], [], 0
    for h, idx in rows:
        need = h + (gap if pg else 0)
        if pg and used + need > H:
            pages.append(pg)
            pg, used = [], 0
            need = h
        pg.append((h, [(j, aspects[j] * h) for j in idx]))
        used += need
    if pg:
        pages.append(pg)
    return pages


def render(pg, html_text, out):
    pg.set_content(html_text, wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.pdf(path=str(out), format="A4", print_background=True, prefer_css_page_size=True)


def add_links(page, uris):
    """روابط Chrome تنحفظ مع insert_pdf (Chrome يضيف / في آخر الرابط)، بس نتأكد إنها موجودة."""
    have = {(l.get("uri") or "").rstrip("/") for l in page.get_links()}
    missing = [u for u in uris if u.rstrip("/") not in have]
    if missing:
        raise SystemExit(f"روابط ناقصة في الصفحة: {missing}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("images", help="مجلد صور الدرجات")
    ap.add_argument("out")
    ap.add_argument("--grades", help="ملف: اسم_الملف<TAB>الدرجة")
    ap.add_argument("--seed", type=int, default=1448)
    ap.add_argument("--per-row-h", type=float, default=0, help="ارتفاع الصف المستهدف بالنقاط (0 = تلقائي)")
    a = ap.parse_args()

    files = sorted(p for p in pathlib.Path(a.images).iterdir() if p.suffix.lower() in IMG_EXT)
    if not files:
        raise SystemExit("ما فيه صور")
    grades = {}
    if a.grades:
        for line in pathlib.Path(a.grades).read_text(encoding="utf-8").splitlines():
            if line.strip():
                name, g = line.split("\t")
                grades[name.strip()] = g.strip()
    files = spread_order(files, lambda p: grades.get(p.name), a.seed)

    # مقاسات الصفحة بالنقاط (A4 = 595×842)
    PW, PH = 595.28, 841.89
    mm = 72 / 25.4
    X0, X1 = 10 * mm, PW - 10 * mm
    Y0, Y1 = 26 * mm, PH - 23 * mm
    W, H, gap = X1 - X0, Y1 - Y0, 4 * mm
    aspects = []
    for f in files:
        pix = pymupdf.Pixmap(str(f))
        aspects.append(pix.width / pix.height)
    target_h = a.per_row_h or min(H / 2 - gap, max(H / 4, W / (2.2 * (sum(aspects) / len(aspects)))))
    pages = layout(aspects, W, H, gap, target_h)

    tmp = pathlib.Path(tempfile.mkdtemp())
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page()
        render(pg, cover_html(len(files)), tmp / "cover.pdf")
        for k in range(len(pages)):
            render(pg, frame_html(k + 1, len(pages)), tmp / f"frame{k}.pdf")
        pg.set_content(watermark_html(), wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.pdf(path=str(tmp / "wm.pdf"), print_background=False, prefer_css_page_size=True)
        b.close()

    out = pymupdf.open()
    out.insert_pdf(pymupdf.open(tmp / "cover.pdf"))
    if out.page_count != 1:
        raise SystemExit(f"الغلاف طلع {out.page_count} صفحات")
    add_links(out[0], [DEMO, STORE, TELEGRAM])
    wm = pymupdf.open(tmp / "wm.pdf")
    for k, rows in enumerate(pages):
        out.insert_pdf(pymupdf.open(tmp / f"frame{k}.pdf"))
        page = out[-1]
        add_links(page, [STORE, TELEGRAM])
        # توزيع المساحة الفاضية بالتساوي بين الصفوف (بحد أقصى) عشان الصفحة تبين مرتبة
        used = sum(h for h, _ in rows) + gap * (len(rows) - 1)
        extra = min((H - used) / (len(rows) + 1), 14 * mm)
        y = Y0 + (H - used - extra * (len(rows) - 1)) / 2
        for h, cells in rows:
            rw = sum(w for _, w in cells) + gap * (len(cells) - 1)
            x = X0 + (W - rw) / 2
            for j, w in cells:
                r = pymupdf.Rect(x, y, x + w, y + h)
                page.draw_rect(r + (1.5, 1.5, 1.5, 1.5), color=None, fill=(0.94, 0.54, 0.14), radius=None)
                page.insert_image(r, filename=str(files[j]))  # الصورة الأصلية نفسها بدون ضغط
                page.draw_rect(r, color=(0.075, 0.16, 0.29), width=1.2)
                x += w + gap
            y += h + gap + extra
        page.show_pdf_page(pymupdf.Rect(X0, Y0, X1, Y1), wm, 0, overlay=True)  # العلامة المائية على منطقة الصور بس

    out.set_metadata({"title": f"درجات طلاب دورة ملازم عدل — {COURSE} ({TRACK})", "author": "ملازم عدل"})
    out.save(a.out, garbage=3, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة، {len(files)} صورة")


if __name__ == "__main__":
    sys.exit(main())
