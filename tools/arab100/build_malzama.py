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
FONT_BODY = "Readex Pro"
FONT_HEAD = "Readex Pro"


def font_faces():
    out = []
    for f in sorted(FONTS.glob("*.ttf")):
        fam, wt = f.stem.rsplit("-", 1)
        fam = {"Readex": "Readex Pro"}.get(fam, fam)
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{wt};src:url('{f.as_uri()}') format('truetype');}}")
    return "\n".join(out)


CSS = f"""
{font_faces()}
/* Chrome يقص أي شي يطلع عن منطقة المحتوى؛ نخلي 4pt زيادة على الجنبين (حشوة للـbody) عشان الدوائر والخلفيات ما تنقص */
@page {{ size:{W}pt {H}pt; margin:84pt 9pt 36pt 9pt; }}
:root {{ --brown:#603b28; --term:#cc6e53; --mithl:#db526f; --ex:#527c82; --sec:#ad7c95; --sub:#844f6a;
        --teal:#41848d; --hl:#f2e6dd; --pill:#f5e6d9; --blue:#325c8e; }}
* {{ box-sizing:border-box; }}
html,body {{ margin:0; background:transparent; color:var(--brown); font-family:'{FONT_BODY}'; font-weight:600;
            font-size:12pt; line-height:1.65; direction:rtl; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ padding:0 4pt; }}
p {{ margin:0; }}
.sec {{ color:var(--sec); font-size:14.5pt; margin:32pt 0 10pt; break-after:avoid; }}
body > .sec:first-child, body > .keep:first-child > .sec {{ margin-top:2pt; }}
/* عنوان القسم: نقطة + خط ناعم يكمل لآخر السطر */
.sec {{ display:flex; align-items:center; }}
.sec::after {{ content:''; flex:1; height:1.6pt; margin-right:10pt; border-radius:2pt;
              background:linear-gradient(to left, #e6cfd9, rgba(230,207,217,0)); }}
.sub {{ width:fit-content; border-bottom:2pt solid #efdccf; padding-bottom:1pt; }}
.lessonhead {{ border-right:5pt solid #cc6e53; padding:2pt 12pt 4pt; margin:0 0 4pt; }}
.lessonhead small {{ display:inline-block; background:#f5e6d9; color:#844f6a; font-size:10.5pt; border-radius:10pt; padding:1pt 10pt; }}
.lessonhead b {{ display:block; color:#89543d; font-weight:700; font-size:18pt; line-height:1.5; margin-top:2pt; }}
/* النقطة حرف (●) مو شكل مرسوم: بعض برامج قراءة الـPDF تقص الأشكال الصغيرة */
.sec::before {{ content:'●'; font-family:'DejaVu Sans',sans-serif; font-size:7pt; color:var(--sec); margin-left:9pt; vertical-align:2pt; }}
.sub {{ color:var(--sub); font-size:13.4pt; margin:24pt 0 8pt; break-after:avoid; }}
/* عنوان ثالث (مثل «■ حذف الهمزة من أول الكلمة» في الكتاب) */
.sub2 {{ color:var(--term); font-size:12.6pt; margin:16pt 0 6pt; break-after:avoid; }}
.sub2::before {{ content:'■'; font-family:'DejaVu Sans',sans-serif; font-size:7.5pt; color:var(--sub); margin-left:7pt; vertical-align:2pt; }}
.term {{ color:var(--term); }}
.m {{ color:var(--mithl); }}
.ex {{ color:var(--ex); }}
.red {{ color:var(--mithl); }}
.ln {{ display:block; margin:9pt 0; break-inside:avoid; line-height:2.05; }}
/* الخلفية تمشي مع النص سطر سطر وتوقف عند آخر كلمة (مثل الملزمة القديمة) */
.ln > .hl {{ background:var(--hl); padding:3pt 9pt; border-radius:3pt; -webkit-box-decoration-break:clone; box-decoration-break:clone; }}
.pill {{ background:var(--pill); border-radius:22pt; padding:7pt 16pt; margin:8pt 0 10pt; break-inside:avoid; text-align:justify; text-align-last:right; }}
.dots {{ border:0; border-top:2.2pt dotted var(--brown); opacity:.55; margin:16pt 0; }}
ol.n, ul.b {{ margin:3pt 0; padding-right:16pt; }}
ol.n > li, ul.b > li {{ margin:4pt 0; break-inside:avoid; }}
ul.b > li::marker {{ color:var(--sec); }}
.cards {{ display:flex; gap:8pt; margin:6pt 0; break-inside:avoid; }}
.cards > div {{ flex:1; text-align:center; }}
.dot {{ display:block; width:15pt; height:15pt; border-radius:50%; margin:0 auto 4pt; }}
.d1 {{ background:#e3a594; }} .d2 {{ background:#f0c98d; }} .d3 {{ background:#8db3b3; }} .d4 {{ background:#bb9cae; }}
.bul {{ display:flex; gap:8pt; align-items:flex-start; margin:9pt 0; break-inside:avoid; }}
.bul > .dot {{ flex:none; margin:3pt 0 0; width:13pt; height:13pt; }}
table.t {{ width:100%; border-collapse:separate; border-spacing:0; margin:9pt 0 12pt; font-size:11.6pt; line-height:1.45;
           border:1pt solid #d9c2b1; border-radius:9pt; overflow:hidden; }}
table.t th {{ background:var(--blue); color:#fff; font-family:'{FONT_HEAD}'; font-weight:700; font-size:11.6pt; padding:5pt 6pt; border-left:1pt solid #4a73a3; }}
table.t th:last-child, table.t td:last-child {{ border-left:0; }}
table.t td {{ padding:4pt 6pt; border-top:1pt solid #e2cfc1; border-left:1pt solid #e2cfc1; text-align:center; vertical-align:middle; background:#fdf8f3; }}
table.t tr:nth-child(even) td {{ background:#f6ece4; }}
table.t tr {{ break-inside:avoid; }}
table.t td.r {{ text-align:right; }}
/* جدول عناوينه في العمود الأول (مثل جدول حالات التاء والهاء في الكتاب) */
table.t.side th {{ width:27%; border-top:1pt solid #4a73a3; }}
table.t.side tr:first-child th {{ border-top:0; }}
table.t td.no {{ width:20pt; }}
.u {{ text-decoration:underline; text-decoration-thickness:1.2pt; text-underline-offset:3pt; }}
.note {{ border-right:4pt solid var(--term); background:var(--hl); padding:6pt 10pt; margin:9pt 0; break-inside:avoid; border-radius:3pt; text-align:justify; text-align-last:right; }}
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
    if (t.rows.length <= 9) t.classList.add('short');
  }
  for (const e of document.querySelectorAll('.ln')) {
    if (e.firstElementChild && e.firstElementChild.classList.contains('hl')) continue;
    const sp = document.createElement('span'); sp.className = 'hl';
    while (e.firstChild) sp.appendChild(e.firstChild);
    e.appendChild(sp);
  }
  const heads = [...document.body.children].filter(e => e.matches('.sec, .sub, .sub2, .lesson'));
  for (const h of heads) {
    const grp = document.createElement('div'); grp.className = 'keep';
    h.before(grp); grp.appendChild(h);
    let n = grp.nextElementSibling;
    // يمسك العنوان مع العنوان الفرعي اللي بعده ثم أول عنصر محتوى
    while (n && n.matches('.sub, .sec, .sub2')) { const nx = n.nextElementSibling; grp.appendChild(n); n = nx; }
    if (n && !(n.matches('table') && !n.classList.contains('short'))) grp.appendChild(n);
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
  const els = document.querySelectorAll('.ln, .note, .pill, .card, li, .bul > div, td, .box .qt, .box .fix');
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
    for (const k of [0.98, 0.96, 0.94, 0.92, 0.9]) for (const ws of [0, -0.6]) steps.push([ws, k]);
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


def render(html_str, out_pdf, browser):
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
    pg.pdf(path=str(out_pdf), print_background=True, prefer_css_page_size=True)
    pg.close()


def last_page_fill(pdf_path):
    """نسبة المساحة المستخدمة في آخر صفحة (من أعلى منطقة المحتوى لأسفل عنصر فيها)."""
    d = pymupdf.open(pdf_path)
    pg = d[-1]
    bottoms = [b[3] for b in pg.get_text("blocks")] + [x["rect"].y1 for x in pg.get_drawings()]
    top, bot = 84, H - 36
    n = d.page_count
    return n, (max(bottoms, default=top) - top) / (bot - top)


def render_fit(src, out_pdf, browser):
    """إذا آخر صفحة في الدرس فيها شي بسيط (جدول لحاله مثلاً)، نصغّر الدرس كله شوي لين يرجع للصفحة اللي قبل،
    بحد أقصى 92%؛ وإذا ما نفع نخليه مثل ما هو."""
    render(doc(src), out_pdf, browser)
    n0, fill = last_page_fill(out_pdf)
    if n0 < 2 or fill > 0.7:
        return
    trial = pathlib.Path(str(out_pdf) + ".fit.pdf")
    tight = (".sec{margin-top:24pt} .sub{margin-top:18pt} .sub2{margin-top:12pt} .ln{margin:6pt 0;line-height:1.9} "
             ".bul{margin:6pt 0} ol.n>li,ul.b>li{margin:2pt 0} table.t{margin:7pt 0 9pt}")
    for z, t in ((0.98, ""), (0.96, ""), (1, tight), (0.97, tight), (0.94, tight), (0.92, tight), (0.9, tight)):
        render(doc(src, f"body{{zoom:{z}}} " + t), trial, browser)
        if last_page_fill(trial)[0] < n0:
            trial.replace(out_pdf)
            print(f"  {pathlib.Path(out_pdf).name}: انضمّت آخر صفحة (تصغير {round((1 - z) * 100)}%{' + مسافات أقل' if t else ''})")
            return


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
                         f'<div class="ans">{q["ans"]}</div></div>')
        pages.append(f'<div class="page"><img class="wm" src="{logo}"><div class="qs">{"".join(items)}</div></div>')
    return "".join(pages)


# ---------- التذييل ----------
def footers_html(items):
    pages = "".join(
        f'<div class="fp"><div class="ft">{html.escape(t)}</div>' + (f'<div class="pn">~{n}~</div>' if n else '') + '</div>'
        for t, n in items)
    css = f"""@page{{size:{W}pt {H}pt;margin:0}}
.fp{{width:{W}pt;height:{H}pt;position:relative;break-after:page}} .fp:last-child{{break-after:auto}}
.ft{{position:absolute;right:9pt;bottom:7pt;width:215pt;text-align:right;font-family:'{FONT_HEAD}';font-weight:700;font-size:10.5pt;line-height:1.25;color:#603b28}}
.pn{{position:absolute;left:0;right:0;bottom:7pt;text-align:center;font-family:'OpenSans';font-weight:700;font-size:14pt;color:#111;direction:ltr}}"""
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
.lesson{background:#f5e6d9;border-right:5pt solid #cc6e53;border-radius:4pt;padding:5pt 10pt;color:#cc6e53;font-weight:700;font-size:13.5pt;margin:30pt 0 6pt;break-after:avoid}
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
    ap.add_argument("--solutions", action="store_true", help="يبني ملف حلول التطبيقات من store/arab100/book/applications.md")
    a = ap.parse_args()

    lessons = sorted((HERE / "content").glob("*.html"))
    if a.solutions:
        lessons = [solutions_html()]
    if a.only:
        lessons = [p for p in lessons if p.name.startswith(a.only)]
    tmp = pathlib.Path(tempfile.mkdtemp())
    base = pymupdf.open(BASE)
    base_bank = pymupdf.open(BASE_BANK)
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
                overlays.append((tmp / f"b{li}.pdf", "تجميعات " + title, True))
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
            render(fm.cover_html(font_faces(), topics), tmp / "cover.pdf", br)
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
