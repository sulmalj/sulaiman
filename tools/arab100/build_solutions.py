"""يبني ملفي حلول تطبيقات كتاب عرب 100 (مهارات الكتابة) بنفس تصميم الملزمة (خلفيتها وخطها وألوانها):

1) ملف المشتركين (كامل): تطبيقات الكتاب كلها (الوحدات الأربع) وأنشطة كل وحدة (من آخر الكتاب) بعد تطبيقاتها،
   مع غلاف وصفحة تنويه وفهرس، وتحت كل صفحة: خاص بالمشتركين ولا أحلل نشره أو نقل حلوله.
     python3 tools/arab100/build_solutions.py store/arab100/applications-solutions.pdf
2) الملف الإعلاني (--promo): حلول الوحدتين الأولى والثانية فقط. أول صفحة إعلان (الدورة + المتجر + القناة)،
   ورابط القناة تحت كل صفحة، وفي الآخر صندوق «لرؤية حلول باقي الوحدات اشترك معنا».
     python3 tools/arab100/build_solutions.py store/arab100/applications-solutions-units-1-2.pdf --promo

المصادر (Markdown) في store/arab100/book/: applications.md (الوحدتان 1–2)، applications-u34.md (3–4)،
activities.md (أنشطة آخر الكتاب، قسم «## أنشطة الوحدة …» لكل وحدة).
الصيغة: «# الوحدة …» ثم «## الموضوع …» ثم «### التطبيق … — التعليمات (صNN)»، وسؤال الاختيار في سطر واحد:
«1. السؤال: أ) … ب) … ج) … د) … ✔ ب (سبب اختياري)»، والجداول بـ |، و«النص: …» للنصوص المقتبسة.
"""
import argparse, base64, html, io, pathlib, re, tempfile
import pymupdf, segno
from playwright.sync_api import sync_playwright
import build_malzama as bm
import frontmatter as fm

BOOK = bm.HERE.parents[1] / "store" / "arab100" / "book"
# pretest-u1.md أول شي: التدريب القبلي للوحدة الأولى (صفحته قبل ص17، من صورة المستخدم)
SOURCES = [BOOK / "pretest-u1.md", BOOK / "applications.md", BOOK / "applications-u34.md"]
ACTS = BOOK / "activities.md"
STORE = "https://mtgradl.com"
CHANNEL = "https://t.me/mlazmadl"
ORD = ["الأولى", "الثانية", "الثالثة", "الرابعة"]
LET = "أبجد"
W, H = bm.W, bm.H


# ---------- قراءة الملفات ----------
def unit_no(text):
    for k, w in enumerate(ORD):
        if re.search(r"الوحدة\s+" + w, text):
            return k
    return None


def load_units():
    """[{apps: [أسطر], acts: [أسطر]}] لكل وحدة من الأربع."""
    units = [{"apps": [], "acts": []} for _ in ORD]
    for p in SOURCES:
        if not p.exists():
            continue
        cur = None
        for ln in p.read_text(encoding="utf-8").splitlines():
            if ln.startswith("# "):
                cur = unit_no(ln)
                continue
            if cur is not None:
                units[cur]["apps"].append(ln)
    if ACTS.exists():
        cur = None
        for ln in ACTS.read_text(encoding="utf-8").splitlines():
            if ln.startswith("# "):
                cur = None
                continue
            if ln.startswith("## "):
                cur = unit_no(ln)
            if cur is not None:
                units[cur]["acts"].append(ln)
    return units


# ---------- Markdown ← HTML ----------
def inline(t):
    t = html.escape(t.strip())
    t = re.sub(r"\*\*(.+?)\*\*", r'<span class="term">\1</span>', t)
    t = re.sub(r"__(.+?)__", r'<span class="u">\1</span>', t)
    return t


PAGE_REF = re.compile(r"\s*\((ص[^)]*)\)")


def split_head(text):
    """عنوان «##»/«###» ← (صغير، كبير، فرعي، الصفحات). أمثلة:
    «الموضوع الثاني: الهمزة المتوسطة — تطبيقات الهمزة المتوسطة (ص31–33)» ← (الموضوع الثاني، الهمزة المتوسطة، تطبيقات…، ص31–33)
    «الموضوع الثاني (تابع) — تطبيقات الهمزة المتطرفة (ص36–38)» ← (الموضوع الثاني (تابع)، تطبيقات الهمزة المتطرفة، ، …)
    «التطبيق الأول — اختر الإجابة الصحيحة (ص22)» ← (، التطبيق الأول، اختر الإجابة الصحيحة، ص22)"""
    pages = "، ".join(m.group(1) for m in PAGE_REF.finditer(text))
    t = PAGE_REF.sub("", text).strip()
    head, _, rest = t.partition(" — ")
    small, colon, big = head.partition(":")
    if not colon:
        small, big = "", head
    if not colon and head.startswith("الموضوع") and rest:
        small, big, rest = head, rest, ""
    return small.strip(), big.strip(), rest.strip(), pages


def mcq(ln):
    """«1. سؤال: أ) … ب) … ✔ ب (سبب)» ← html، أو None إذا ما هو سؤال اختيار."""
    m = re.match(r"^(\d+)\.\s+(.*?)\s*✔\s*([أبجد])\s*(.*)$", ln)
    if not m:
        return None
    n, body, ans, why = m.groups()
    parts = re.split(r"(?:^|\s)([أبجد])\)\s*", " " + body)
    q, ops = parts[0].strip(), [(parts[i], parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]
    if len(ops) < 2 or ans not in [l for l, _ in ops]:
        return None
    cells = "".join(f'<div class="op{" ok" if l == ans else ""}"><b>{l}</b> {inline(o)}</div>' for l, o in ops)
    why = f'<div class="why">{inline(why)}</div>' if why.strip() else ""
    longest = max(len(o) for _, o in ops)
    cols = len(ops) if longest <= 16 else (3 if len(ops) == 3 and longest <= 26 else 2)
    return (f'<div class="mcq"><div class="qq"><span class="qn">{n}</span>{inline(q)}</div>'
            f'<div class="ops c{cols}">{cells}</div>{why}</div>')


def md_html(lines, lessons):
    """يحوّل أسطر وحدة إلى HTML. lessons: قائمة تنضاف لها (العنوان في الفهرس، عنوان التذييل) لكل «##»."""
    out, i, topic = [], 0, ""
    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if not s:
            i += 1
            continue
        if ln.startswith("## "):
            small, big, rest, pages = split_head(ln[3:])
            cont = "(تابع)" in small
            if small.startswith("الموضوع") and not cont:
                topic = big
            foot = topic if cont and topic else big
            toc = (small + (" — " if cont else ": ") if small else "") + big
            if rest and len(rest) <= 30:
                toc += " — " + rest
            k = len(lessons)
            lessons.append((toc, foot))
            out.append(f'<div class="lesson"><span class="mk">zzL{k:02d}zz</span>'
                       + (f'<small>{inline(small)}</small>' if small else "")
                       + f'<b>{inline(big)}</b>'
                       + (f'<i>{inline(rest)}</i>' if rest else "")
                       + (f'<span class="pgref">{inline(pages)}</span>' if pages else "") + "</div>")
        elif ln.startswith("### "):
            small, big, rest, pages = split_head(ln[4:])
            label = (small + ": " + big) if small else big
            out.append(f'<div class="sec"><span class="exn">{inline(label)}</span>'
                       + (f' <span class="ext">{inline(rest)}</span>' if rest else "")
                       + (f' <span class="pgref">{inline(pages)}</span>' if pages else "") + "</div>")
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            t = '<table class="t"><tr>' + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr>"
            for r in body:
                t += "<tr>" + "".join(f'<td class="r">{inline(c)}</td>' for c in r) + "</tr>"
            out.append(t + "</table>")
            continue
        elif re.match(r"^\d+\.\s", s):
            out.append(mcq(s) or (f'<div class="item"><span class="qn">{s.split(".", 1)[0]}</span>'
                                  f'<div>{inline(s.split(".", 1)[1])}</div></div>'))
        elif re.match(r"^(النص|الفقرة)\s*:", s):
            k, _, v = s.partition(":")
            out.append(f'<div class="passage"><span class="pk">{inline(k)}:</span> {inline(v)}</div>')
        elif s.startswith("- "):
            out.append(f'<div class="bl">{inline(s[2:])}</div>')
        elif s.startswith("(") and s.endswith(")"):
            out.append(f'<p class="note">{inline(s[1:-1])}</p>')
        else:
            out.append(f'<p class="ln">{inline(s)}</p>')
        i += 1
    return "\n".join(out)


SOL_CSS = """
.soltitle{text-align:center;font-weight:700;font-size:22pt;color:#89543d;margin:0 0 6pt;line-height:1.45}
.soltitle small{display:block;font-size:12pt;color:#8c5671;font-weight:600}
.unit{display:flex;align-items:center;gap:10pt;background:#603b28;color:#fff7ee;border-radius:24pt;padding:6pt 18pt 7pt;
  font-weight:700;font-size:15pt;margin:30pt 0 6pt;break-after:avoid}
body > .unit:first-child, body > .keep:first-child > .unit{margin-top:4pt}
.unit small{background:#fff7ee;color:#603b28;border-radius:14pt;padding:0 10pt;font-size:11pt}
.lesson{position:relative;background:#f5e6d9;border-right:5pt solid #a94a2e;border-radius:6pt;padding:6pt 12pt 7pt;
  margin:26pt 0 8pt;break-after:avoid;line-height:1.5}
.lesson small{display:block;color:#8c5671;font-size:10.5pt;font-weight:600}
.lesson b{display:block;color:#89543d;font-size:15pt;font-weight:700}
.lesson i{display:block;font-style:normal;color:#a94a2e;font-size:11.5pt}
.lesson .pgref{position:absolute;left:10pt;top:8pt}
.mk{position:absolute;left:30pt;bottom:2pt;font-size:2pt;color:#f5e6d9;font-family:'OpenSans';direction:ltr}
.pgref{display:inline-block;background:#fff;color:#844f6a;border:1pt solid #ecd9c9;border-radius:9pt;padding:0 7pt;font-size:9.5pt;font-weight:600;margin-right:6pt;white-space:nowrap}
.sec{margin:18pt 0 7pt;display:block;line-height:1.6;font-size:12pt}
.sec::after{display:none}
.sec .exn{color:#a9718f;font-weight:700;font-size:13pt;margin-left:6pt}
.sec .ext{color:#603b28}
.mcq{margin:7pt 0 9pt;break-inside:avoid}
.qq,.item{display:flex;gap:7pt;align-items:baseline;line-height:1.75}
.qn{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:17pt;height:17pt;border-radius:9pt;
  background:#a94a2e;color:#fff;font-size:9.5pt;font-weight:700;padding:0 4pt;transform:translateY(-1pt)}
.item{margin:6pt 0;break-inside:avoid}
.ops{display:grid;gap:4pt 7pt;margin:4pt 24pt 0 0}
.ops.c4{grid-template-columns:repeat(4,1fr)} .ops.c3{grid-template-columns:repeat(3,1fr)} .ops.c2{grid-template-columns:1fr 1fr}
.op{background:#fbf3ec;border:1pt solid #eddccf;border-radius:7pt;padding:2pt 8pt 3pt;font-size:11pt;line-height:1.5;color:#6d4a37}
.op b{color:#8c5671;margin-left:3pt}
.op.ok{background:#e3efed;border-color:#7fa9a4;color:#2f5f63;box-shadow:inset -3pt 0 0 #466c72}
.op.ok b{color:#466c72}
.op.ok::after{content:'✔';font-family:'DejaVu Sans',sans-serif;color:#466c72;margin-right:6pt;font-size:10pt}
.why{margin:3pt 24pt 0 0;font-size:10.5pt;color:#466c72}
.passage{background:#fffaf5;border:1pt dashed #dcbfa6;border-radius:8pt;padding:6pt 11pt;margin:7pt 0;line-height:1.9;font-size:11.4pt;break-inside:avoid;text-align:justify}
.passage .pk{color:#a94a2e;margin-left:5pt}
.bl{position:relative;padding-right:14pt;margin:5pt 0;line-height:1.9;break-inside:avoid}
.bl::before{content:'';position:absolute;right:2pt;top:8.5pt;width:6pt;height:6pt;border-radius:50%;background:#e3a594}
.note{font-size:10.6pt}
table.t td{font-size:11pt}
"""


def content_html(units, which, promo):
    """HTML المحتوى + قائمة الدروس (للفهرس والتذييل)."""
    lessons, parts = [], []
    if promo:
        parts.append('<div class="soltitle">حلول تطبيقات كتاب مهارات الكتابة'
                     '<small>عرب 100 · الوحدتان الأولى والثانية (التطبيقات والأنشطة)</small></div>')
    for k in which:
        name, title, _ = fm.UNITS[k]
        lines = units[k]["apps"] + units[k]["acts"]
        if not any(l.strip() for l in lines):
            continue
        parts.append(f'<div class="unit"><small>{name}</small>{html.escape(title)}</div>')
        parts.append(md_html(lines, lessons))
    if promo:
        parts.append(closing_html())
    return "<!-- حلول التطبيقات -->\n" + "\n".join(parts), lessons


# ---------- الإعلان ----------
def qr(url, pt):
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=16, border=1, dark="#603b28")
    return (f'<img class="qr" alt="QR" src="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}" '
            f'style="width:{pt}pt;height:{pt}pt;image-rendering:pixelated">')


FEATURES = [  # ميزات الاشتراك (كلام المستخدم)
    ("حلول للتطبيقات", '<path d="M5 12.5l4.2 4.2L19 7"/>'),
    ("شروحات وملزمة شاملة", '<path d="M4 5.5h7v13H4zM13 5.5h7v13h-7z"/>'),
    ("قروب خاص للأسئلة", '<path d="M4 5.5h16v10H10l-4.5 3.5V15.5H4z"/>'),
    ("موقع محاكي", '<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8"/><path d="M9 20h6M12 16v4"/>'),
    ("تجميعات", '<path d="M6 4.5h12v15H6zM9 9h6M9 12.5h6M9 16h4"/>'),
]


def icon(path, col="#fff"):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="{col}" stroke-width="2" stroke-linecap="round" '
            f'stroke-linejoin="round">{path}</svg>')


def closing_html():
    feats = "".join(f'<div class="f"><span class="fi">{icon(p)}</span>{t}</div>' for t, p in FEATURES)
    return f"""<div class="closing">
<div class="ct">لرؤية حل باقي الوحدات</div>
<div class="cs">حلول تطبيقات الوحدتين الثالثة والرابعة وأنشطتهما متوفرة لمشتركينا — اشترك معنا</div>
<div class="cb"><div class="feats"><div class="fh">الاشتراك يشمل:</div>{feats}</div>
<a class="store" href="{STORE}">{qr(STORE, 74)}<span>mtgradl.com</span></a></div>
</div>
<style>
.closing{{margin:26pt 0 0;break-inside:avoid;background:#fffaf5;border:1.4pt solid #dcbfa6;border-radius:18pt;padding:14pt 18pt 14pt;
  box-shadow:0 4pt 0 #f1e2d4}}
.closing .ct{{color:#89543d;font-weight:700;font-size:19pt;text-align:center;line-height:1.4}}
.closing .cs{{color:#a94a2e;font-size:12pt;text-align:center;margin-bottom:9pt}}
.closing .cb{{display:flex;gap:16pt;align-items:center}}
.closing .feats{{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:7pt 10pt}}
.closing .fh{{grid-column:1/-1;color:#603b28;font-size:12pt}}
.closing .f{{display:flex;align-items:center;gap:7pt;background:#f5e6d9;border-radius:12pt;padding:4pt 9pt;color:#603b28;font-size:12pt;font-weight:700}}
.closing .fi{{flex:none;width:22pt;height:22pt;border-radius:50%;background:#a94a2e;padding:4pt;box-sizing:border-box;display:flex}}
.closing .store{{flex:none;display:flex;flex-direction:column;align-items:center;gap:3pt;text-decoration:none;
  background:#fff;border:1pt solid #ecd9c9;border-radius:12pt;padding:7pt 9pt 5pt}}
.closing .store span{{font-family:'OpenSans';font-weight:800;font-size:11pt;color:#c42446;direction:ltr}}
</style>"""


def ad_page_html():
    feats = [  # كلام المستخدم
        ("شروحات وملزمة شاملة", "شروحات لدروس الكتاب، وتغني عن الكتاب وأي مصدر آخر", '<path d="M4 5.5h7v13H4zM13 5.5h7v13h-7z"/>'),
        ("قروب خاص للأسئلة والاستفسارات", "على مدار الساعة", '<path d="M4 5.5h16v10H10l-4.5 3.5V15.5H4z"/>'),
        ("موقع محاكي", "يشمل جميع أجزاء الاختبار وجميع الدروس", '<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8"/><path d="M9 20h6M12 16v4"/>'),
        ("تصحيح تلقائي", "لإجاباتك في الموقع", '<path d="M5 12.5l4.2 4.2L19 7"/>'),
    ]
    cards = "".join(f'<div class="fc"><span class="fi">{icon(p)}</span><div><b>{t}</b><span>{d}</span></div></div>'
                    for t, d, p in feats)
    return f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>{bm.font_faces()}
@page {{ size:{W}pt {H}pt; margin:0; }}
html,body {{ margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.pg {{ width:{W}pt; height:{H}pt; position:relative; overflow:hidden; background:#fff7ee; font-family:'Readex Pro'; color:#603b28; }}
.blob {{ position:absolute; border-radius:50%; }}
.b1 {{ width:300pt; height:260pt; background:#f9e7d8; top:-120pt; left:-110pt; }}
.b2 {{ width:240pt; height:220pt; background:#e8f0ef; bottom:-100pt; right:-90pt; }}
.b3 {{ width:120pt; height:120pt; background:#f6e6ee; top:300pt; left:-60pt; }}
.dots {{ position:absolute; top:30pt; right:130pt; width:90pt; height:40pt;
  background-image:radial-gradient(#e9cdb9 1.6pt, transparent 1.7pt); background-size:12pt 12pt; }}
.frame {{ position:absolute; inset:15pt; border:1.2pt solid #dcbfa6; border-radius:22pt; }}
.top {{ position:absolute; top:34pt; left:42pt; right:42pt; display:flex; justify-content:space-between; align-items:center; }}
.top img {{ width:66pt; }}
.free {{ background:#c42446; color:#fff; border-radius:14pt; padding:3pt 14pt 4pt; font-weight:700; font-size:12pt; }}
.hero {{ position:absolute; top:118pt; left:40pt; right:40pt; text-align:center; }}
.kicker {{ color:#a94a2e; font-weight:600; font-size:13pt; }}
h1 {{ margin:0; font-weight:700; font-size:50pt; line-height:1.3; color:#89543d; }}
.sub {{ display:inline-block; margin-top:6pt; background:#89543d; color:#fff7ee; font-weight:700; font-size:15pt; border-radius:30pt; padding:3pt 24pt 5pt; }}
.ad {{ position:absolute; top:296pt; left:40pt; right:40pt; background:#fffdfa; border-radius:20pt; padding:16pt 20pt 18pt;
  box-shadow:0 5pt 16pt rgba(96,59,40,.12); border-top:5pt solid #a94a2e; }}
.ad h2 {{ margin:0; text-align:center; color:#89543d; font-size:21pt; line-height:1.45; }}
.ad .lead {{ text-align:center; color:#a94a2e; font-size:13pt; font-weight:600; margin:2pt 0 12pt; }}
.fc {{ display:flex; align-items:center; gap:11pt; background:#fbf3ec; border-radius:14pt; padding:6pt 12pt; margin-bottom:6pt; }}
.fc .fi {{ flex:none; width:36pt; height:36pt; border-radius:50%; background:#466c72; padding:7pt; box-sizing:border-box; display:flex; }}
.fc b {{ display:block; color:#603b28; font-size:15pt; line-height:1.4; }}
.fc span {{ color:#7a5a48; font-size:11.5pt; font-weight:500; }}
.buy {{ display:flex; align-items:center; gap:14pt; margin-top:12pt; background:#603b28; border-radius:16pt; padding:10pt 14pt; color:#fff7ee; text-decoration:none; }}
.buy .t {{ flex:1; }}
.buy .t b {{ display:block; font-size:16pt; line-height:1.4; }}
.buy .t span {{ font-size:11.5pt; color:#f0dccb; }}
.buy .url {{ font-family:'OpenSans'; font-weight:800; font-size:17pt; color:#fff; direction:ltr; display:block; margin-top:2pt; }}
.buy .q {{ background:#fff; border-radius:10pt; padding:5pt; display:flex; }}
.tg {{ position:absolute; bottom:44pt; left:40pt; right:40pt; display:flex; align-items:center; justify-content:center; gap:10pt;
  background:#e8f0ef; border:1pt solid #c7dbd8; border-radius:14pt; padding:8pt 12pt; text-decoration:none; color:#2f5f63; font-weight:700; font-size:13pt; }}
.tg .url {{ font-family:'OpenSans'; font-weight:800; direction:ltr; background:#fff; color:#2f5f63; border-radius:8pt; padding:2pt 10pt; font-size:13pt; }}
</style></head><body><div class="pg">
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="dots"></div><div class="frame"></div>
<div class="top"><img src="{fm._logo()}"><div class="free">ملف مجاني</div></div>
<div class="hero"><div class="kicker">عرب 100 · مهارات الكتابة</div><h1>حلول التطبيقات</h1>
<div class="sub">الوحدتان الأولى والثانية</div></div>
<div class="ad"><h2>عندنا دورة شاملة لمادة عرب 100</h2><div class="lead">دورة ملازم عدل تشمل:</div>{cards}
<a class="buy" href="{STORE}"><div class="t"><b>للاشتراك في الدورة</b><span>من متجر ملازم عدل</span><span class="url">mtgradl.com</span></div>
<div class="q">{qr(STORE, 78)}</div></a></div>
<a class="tg" href="{CHANNEL}">قناتنا لمعرفة كل جديد: <span class="url">t.me/mlazmadl</span></a>
</div></body></html>"""


# ---------- الغلاف وصفحة التنويه (ملف المشتركين) ----------
def intro_html(toc_rows):
    notes = [
        ("خاص بالمشتركين", "هذا الملف خاص بمشتركي ملازم عدل في مادة عرب 100، ولا أحلل نشره أو إرساله أو إعطاءه لأي شخص، ولا نقل الحلول منه أو تصويرها."),
        ("ترتيب الحلول", "الحلول مرتبة حسب وحدات الكتاب ومواضيعه، وأنشطة كل وحدة (من آخر الكتاب) بعد تطبيقاتها، ومع كل تطبيق رقم صفحته في الكتاب."),
        ("الأسئلة المفتوحة", "الأسئلة التي تطلب كتابة فقرة أو جملة من عندك: الحل نموذج واحد للإجابة، وتصح أي إجابة أخرى تحقق المطلوب."),
    ]
    cards = "".join(f'<p class="ln nc"><span class="nk">{k}</span> {v}</p>' for k, v in notes)
    rows = "".join(r for r in toc_rows)
    return f"""<!-- قبل أن تبدأ -->
<style>
.nc {{ font-size:11.4pt; margin:0 0 8pt; }}
.nk {{ background:#a94a2e; color:#fff; border-radius:10pt; padding:0 8pt; font-size:10.5pt; }}
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:11.4pt; margin-top:8pt; border:1pt solid #e2cdbd; border-radius:10pt; overflow:hidden; }}
.toc th {{ background:#325c8e; color:#fff; font-weight:700; padding:4pt 6pt; }}
.toc td {{ padding:4.5pt 10pt; text-align:center; border-top:1pt solid #eadbd0; background:#fbf6f1; line-height:1.5; }}
.toc td.r {{ text-align:right; }}
.toc tr.unitrow td {{ background:#f5e6d9; color:#a94a2e; font-weight:700; font-size:12pt; text-align:right; }}
</style>
<div class="sec">قبل أن تبدأ</div>
{cards}
<div class="sec">فهرس الحلول</div>
<table class="toc"><tr><th>الموضوع</th><th style="width:60pt">الصفحة</th></tr>{rows}</table>"""


# ---------- التذييل ----------
def footers_html(items, left):
    """items: [(عنوان، رقم أو None)]، left: نص (HTML) يسار أسفل الصفحة مكان عبارة الخلفية."""
    pages = "".join(
        f'<div class="fp"><div class="ft">{html.escape(t)}</div>' + (f'<div class="pn">~{n}~</div>' if n else "")
        + f'<div class="lf">{left}</div></div>' for t, n in items)
    css = f"""@page{{size:{W}pt {H}pt;margin:0}}
.fp{{width:{W}pt;height:{H}pt;position:relative;break-after:page}} .fp:last-child{{break-after:auto}}
.ft{{position:absolute;right:9pt;bottom:7pt;width:200pt;text-align:right;font-family:'Readex Pro';font-weight:700;font-size:10pt;line-height:1.25;color:#603b28}}
.pn{{position:absolute;left:0;right:0;bottom:7pt;text-align:center;font-family:'OpenSans';font-weight:700;font-size:14pt;color:#111;direction:ltr}}
.lf{{position:absolute;left:12pt;bottom:6pt;width:200pt;text-align:left;font-family:'Readex Pro';font-weight:700;font-size:9.6pt;line-height:1.3;color:#603b28}}
.lf a{{color:#c42446;text-decoration:none;font-family:'OpenSans';font-weight:800;direction:ltr;unicode-bidi:embed}}"""
    return (f'<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>{bm.font_faces()}{css}</style></head>'
            f'<body style="margin:0">{pages}</body></html>')


def base_page():
    """خلفية الملزمة بدون عبارة «لا احلل نشر … الملخص» (نكتب بدالها عبارة تناسب ملف الحلول)."""
    d = pymupdf.open(bm.BASE)
    pg = d[0]
    pg.add_redact_annot(pymupdf.Rect(10, 821, 207, 841), fill=False)
    pg.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    return d


def copy_links(src_page, dst_page):
    for l in src_page.get_links():
        if l.get("uri"):
            dst_page.insert_link({"kind": pymupdf.LINK_URI, "uri": l["uri"], "from": l["from"]})


def marker_pages(pdf):
    """رقم صفحة كل عنوان «##» (من العلامات المخفية zzLNNzz)."""
    pages = {}
    for pno, pg in enumerate(pdf):
        for m in re.finditer(r"zzL(\d+)zz", pg.get_text()):
            pages.setdefault(int(m.group(1)), pno)
    return pages


def scrub_markers(pdf):
    for pg in pdf:
        hits = pg.search_for("zzL")
        if hits:
            for r in hits:
                pg.add_redact_annot(r + (-2, -2, 30, 2), fill=False)
            pg.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--promo", action="store_true", help="الملف الإعلاني: الوحدتان الأولى والثانية فقط")
    a = ap.parse_args()

    units = load_units()
    which = [0, 1] if a.promo else [0, 1, 2, 3]
    body, lessons = content_html(units, which, a.promo)
    tmp = pathlib.Path(tempfile.mkdtemp())
    if a.promo:
        left = f'قناتنا لمعرفة كل جديد: <a href="{CHANNEL}">t.me/mlazmadl</a>'
    else:
        left = "خاص بالمشتركين · لا أحلل نشره أو نقل حلوله"
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=bm.CHROME)
        bm.render_fit(SOL_CSS_WRAP(body), tmp / "c.pdf", br)
        content = pymupdf.open(tmp / "c.pdf")
        mp = marker_pages(content)
        n = content.page_count
        # عنوان التذييل لكل صفحة = آخر موضوع بدأ في هذي الصفحة أو قبلها
        foot = []
        for pno in range(n):
            cur = max((k for k, pg in mp.items() if pg <= pno), default=None)
            foot.append((lessons[cur][1] if cur is not None else "حلول التطبيقات", pno + 1))
        front = []
        if a.promo:
            bm.render(ad_page_html(), tmp / "ad.pdf", br)
            front.append(("ad", tmp / "ad.pdf"))
        else:
            # الفهرس: كل «##» برقم صفحته، تحت وحدته
            unit_of_lesson = []
            for u in which:
                unit_of_lesson += [u] * sum(1 for l in units[u]["apps"] + units[u]["acts"] if l.startswith("## "))
            rows, last_unit = [], None
            for li, (toc, ft) in enumerate(lessons):
                u = unit_of_lesson[li]
                if u != last_unit:
                    rows.append(f'<tr class="unitrow"><td colspan="2">{fm.UNITS[u][0]}: {html.escape(fm.UNITS[u][1])}</td></tr>')
                    last_unit = u
                rows.append(f'<tr><td class="r">{inline(toc)}</td><td>{mp.get(li, 0) + 1}</td></tr>')
            # الغلاف: بطاقة لكل وحدة فيها مواضيعها + «الأنشطة»
            cov = []
            for u in which:
                tops = [ft for li, (toc, ft) in enumerate(lessons) if unit_of_lesson[li] == u]
                seen = []
                for t in tops:
                    if t not in seen and not t.startswith("تدريب"):
                        seen.append(t)
                cov.append((fm.UNITS[u][0], fm.UNITS[u][1], seen))
            bm.render(fm.cover_html(bm.font_faces(), cov, kicker="مهارات الكتابة · التطبيقات والأنشطة كاملة",
                                    title="حلول التطبيقات", badge="ملف خاص بالمشتركين",
                                    foot="خاص بالمشتركين · لا أحلل نشر الملف أو إرساله أو إعطاءه لأي شخص أو نقل حلوله"),
                      tmp / "cover.pdf", br)
            bm.render(bm.doc(intro_html(rows)), tmp / "intro.pdf", br)
            front += [("cover", tmp / "cover.pdf"), ("intro", tmp / "intro.pdf")]
        n_intro = pymupdf.open(tmp / "intro.pdf").page_count if not a.promo else 0
        bm.render(footers_html([("قبل أن تبدأ", None)] * n_intro + foot, left), tmp / "f.pdf", br)
        br.close()

    scrub_markers(content)
    base = base_page()
    footp = pymupdf.open(tmp / "f.pdf")
    out = pymupdf.open()
    fk = 0
    for kind, path in front:
        d = pymupdf.open(path)
        for i in range(d.page_count):
            pg = out.new_page(width=W, height=H)
            if kind == "intro":
                pg.show_pdf_page(pg.rect, base, 0)
            pg.show_pdf_page(pg.rect, d, i)
            copy_links(d[i], pg)
            if kind == "intro":
                pg.show_pdf_page(pg.rect, footp, fk)
                copy_links(footp[fk], pg)
                fk += 1
    for i in range(content.page_count):
        pg = out.new_page(width=W, height=H)
        pg.show_pdf_page(pg.rect, base, 0)
        pg.show_pdf_page(pg.rect, content, i)
        copy_links(content[i], pg)
        pg.show_pdf_page(pg.rect, footp, fk)
        copy_links(footp[fk], pg)
        fk += 1
    title = "عرب 100 — حلول تطبيقات الوحدتين الأولى والثانية" if a.promo else "عرب 100 — حلول تطبيقات الكتاب وأنشطته (خاص بالمشتركين)"
    out.set_metadata({"title": title, "author": "ملازم عدل"})
    out.save(a.out, garbage=4, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة")


def SOL_CSS_WRAP(body):
    return body.replace("-->", "-->\n<style>" + SOL_CSS + "</style>", 1)


if __name__ == "__main__":
    main()
