"""يبني ملفي حلول تطبيقات كتاب عرب 100 (مهارات الكتابة) بنفس تصميم الملزمة (خلفيتها وخطها وألوانها):

1) ملف المشتركين (كامل): تطبيقات الكتاب كلها (الوحدات الأربع) وأنشطة كل وحدة (من آخر الكتاب) بعد تطبيقاتها،
   مع غلاف وصفحة تنويه وفهرس، وتحت كل صفحة: خاص بالمشتركين ولا أحلل نشره أو نقل حلوله.
     python3 tools/arab100/build_solutions.py store/arab100/applications-solutions.pdf
2) الملف الإعلاني (--promo): حلول الوحدتين الأولى والثانية فقط. أول صفحة إعلان (الدورة + المتجر + القناة)،
   ورابط القناة تحت كل صفحة، وفي الآخر صندوق «لرؤية حلول باقي الوحدات اشترك معنا».
     python3 tools/arab100/build_solutions.py store/arab100/applications-solutions-units-1-2.pdf --promo
3) ملف المشتركين للوحدتين الأولى والثانية (--units12): نفس ملف المشتركين بس أول وحدتين.
     python3 tools/arab100/build_solutions.py store/arab100/applications-solutions-units-1-2-subscribers.pdf --units12

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
            ref = f'<span class="pgref">{inline(pages)}</span>' if pages else ""
            if ref:  # رقم الصفحة ما ينزل لحاله في سطر: يمسك في آخر كلمة قبله
                tail = rest or label
                a_, _, w_ = tail.rpartition(" ")
                tail = (inline(a_) + " " if a_ else "") + f'<span style="white-space:nowrap">{inline(w_)} {ref}</span>'
                rest, label = (tail, inline(label)) if rest else ("", tail)
            else:
                label, rest = inline(label), inline(rest) if rest else ""
            out.append(f'<div class="sec"><span class="exn">{label}</span>'
                       + (f' <span class="ext">{rest}</span>' if rest else "") + "</div>")
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            heavy = len(body) > 6 or sum(len(c) for r in body for c in r) > 650  # جدول طويل أو خلاياه نصوص طويلة
            t = (f'<table class="t{" brk" if heavy else ""}"><tr>'
                 + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr>")
            # خانة أولى فاضية = نفس الجملة اللي فوقها (كلمتين من جملة وحدة) ← تندمج معها بدل ما تبان فاضية
            span = [1] * len(body)
            for k in range(len(body) - 1, 0, -1):
                if body[k] and not body[k][0]:
                    j = k - 1
                    while j > 0 and body[j] and not body[j][0]:
                        j -= 1
                    span[j] += 1
            g, par = 0, []  # الصفوف المدموجة تاخذ نفس لون صفها الأول (التلوين المتناوب حسب المجموعة)
            for k, r in enumerate(body):
                if not (r and not r[0] and k > 0):
                    g += 1
                par.append(g % 2)
            for k, r in enumerate(body):
                cells = [f'<td class="r">{inline(c)}</td>' for c in r]
                if r and not r[0] and k > 0:
                    cells = cells[1:]
                elif span[k] > 1:
                    cells[0] = f'<td class="r" rowspan="{span[k]}">{inline(r[0])}</td>'
                t += (f'<tr class="z{par[k]}">' if any(s > 1 for s in span) else "<tr>") + "".join(cells) + "</tr>"
            out.append(t + "</table>")
            continue
        elif re.match(r"^\d+\.\s", s):
            out.append(mcq(s) or (f'<div class="item"><span class="qn">{s.split(".", 1)[0]}</span>'
                                  f'<div>{inline(s.split(".", 1)[1])}</div></div>'))
        elif re.match(r"^(النص|الفقرة)\s*:", s):
            k, _, v = s.partition(":")
            out.append(f'<div class="passage"><span class="pk">{inline(k)}:</span> {inline(v)}</div>')
        elif s.startswith("- ") or s.startswith("• "):
            out.append(f'<div class="bl">{inline(s[2:])}</div>')
        elif s.startswith("(") and s.endswith(")"):
            out.append(f'<p class="note">{inline(s[1:-1])}</p>')
        else:
            # الفقرة النموذجية (بعد «نموذج حل» / «الفقرة بعد التعديل»): مسافة بادئة أول السطر مثل شرط الكتاب للفقرة
            prev = re.sub(r"\*", "", lines[i - 1]).strip() if i else ""
            ind = len(s) > 200 and (prev.startswith(("نموذج حل", "نموذج الحل", "الفقرة بعد التعديل", "النص بعد التعديل"))
                                    or ("فقرة" in prev and prev.endswith(":")))
            out.append(f'<p class="ln{" ind" if ind else ""}">{inline(s)}</p>')
        i += 1
    return "\n".join(keep_groups(out))


def keep_groups(out):
    """ما يبقى شي لحاله أعلى أو أسفل الصفحة (المراجعة: «٢ الجمل الداعمة:» آخر الصفحة وقائمتها بعدها،
    بند وحيد أول الصفحة، سؤال انفصل عن حله):
    - القائمة: أول بندين مع بعض وآخر بندين مع بعض (والقصيرة كلها مع بعض).
    - السؤال المرقّم، أو أي سطر ينتهي بـ«:»، يمسك في اللي بعده (إلا الجدول — له رأس يتكرر)."""
    # بنود القائمة والأسئلة المرقّمة المتتالية، والأسطر المرقّمة «أ- ب- ج-» و«١- ٢-»
    isbl = lambda h: h.startswith(('<div class="bl">', '<div class="item">')) or \
        re.match(r'<p class="ln">(?:[أبجدهو]|[١-٩][٠-٩]?)-\s', h) is not None
    # نوع البند: سطر مرقّم بحرف «أ-» ≠ سطر مرقّم برقم «١-» (سؤال) ≠ بند قائمة «•» (جواب)
    kind = lambda h: ("let" if re.match(r'<p class="ln[^"]*">[أبجدهو]-', h) else "ln") if h.startswith('<p class="ln') else "bl"
    short = lambda h: len(re.sub(r"<[^>]+>", "", h)) < 220
    pieces, k = [], 0
    while k < len(out):
        if isbl(out[k]):
            j = k
            while j < len(out) and isbl(out[j]) and kind(out[j]) == kind(out[k]):
                j += 1
            run = out[k:j]
            if len(run) <= 3:
                pieces.append(["".join(run)])
            elif not all(short(x) for x in run):  # بنود طويلة (فقرات): كل بند لحاله عشان القائمة تنقسم وتعبّي الصفحة
                pieces += [[x] for x in run]
            else:
                pieces.append(["".join(run[:2])])
                pieces += [[x] for x in run[2:-2]]
                pieces.append(["".join(run[-2:])])
            k = j
        else:
            pieces.append([out[k]])
            k += 1
    text = lambda h: re.sub(r"<[^>]+>", "", h).strip()
    is_tab = lambda h: h.startswith("<table")
    is_q = lambda h: h.startswith(('<div class="item">', '<div class="mcq">'))
    is_long = lambda h: is_tab(h) and 'class="t brk"' in h[:40]
    multi = lambda h: len(re.findall(r'<(?:p class="ln"|div class="bl"|div class="item")', h)) > 1

    def attach(last, nxt):
        """هل «nxt» لازم يكون في نفس الصفحة مع «last»؟"""
        if not nxt or is_tab(last):
            return False
        if text(nxt).startswith(("الحل", "نموذج حل", "نموذج الحل")):  # السؤال وحله (مو قائمة مطالب كاملة مع نموذج طويل)
            return not multi(last) or size_ok

        if is_tab(nxt):  # النص/السؤال وجدول حله القصير (الطويل ينقسم تحته ورأسه يتكرر)
            return not is_long(nxt) and (not is_q(last) or last.startswith('<div class="item">'))
        if last.startswith('<div class="passage">') and (isbl(nxt) or is_q(nxt)):  # النص وأول أسئلته
            return True
        if last.startswith('<p class="ln') and not isbl(last) and len(text(last)) < 220 and isbl(nxt) and kind(nxt) == "ln":
            return True  # سطر تمهيدي قصير («القضية: …») والسؤال المرقّم اللي بعده
        if kind(last) != "bl" and isbl(last) and not multi(last) and nxt.startswith('<div class="bl">'):  # سؤال مرقّم «٢- …» وأجوبته
            return True
        if nxt.startswith('<div class="passage">') and last.startswith(('<p class="ln">', '<div class="bl">')):  # المطلوب والنص اللي بعده
            return True
        if text(last).endswith(":") and not is_q(last):  # سطر ينتهي بـ«:» وكلامه بعده
            return True
        # سؤال مرقّم وحله (سطر/قائمة/نص بعده — مو عنوان أو درس جديد)
        return last.endswith('</div>') and '<div class="item">' in last[-400:] and \
            nxt.startswith(('<div class="bl">', '<p class="ln">', '<div class="passage">', '<p class="note">'))
    res, k = [], 0
    size_ok = False
    while k < len(pieces):
        group, last = [pieces[k][0]], pieces[k][0]
        while True:
            if k + 1 >= len(pieces):
                break
            # قائمة المطالب + «نموذج حل» + الفقرة: مع بعض بس إذا كلها قصيرة (تدخل في صفحة وحدة براحة)
            nx = pieces[k + 1][0]
            tail = pieces[k + 2][0] if k + 2 < len(pieces) and text(nx).endswith(":") else ""
            size_ok = len(text("".join(group)) + text(nx) + text(tail)) < 1600
            if not attach(last, nx):
                break
            if is_long(pieces[k + 1][0]):
                break
            k += 1
            group.append(pieces[k][0])
            last = pieces[k][0]
        nxt = pieces[k + 1][0] if k + 1 < len(pieces) else ""
        html_ = "".join(group)
        if len(group) > 1 or html_.count('<div class="bl">') + html_.count('<div class="item">') > 1:
            html_ = f'<div class="keep">{html_}</div>'
        if is_long(nxt) and not is_tab(last):  # جدول طويل: يبدأ تحت سؤاله مباشرة
            # data-tp: سؤال/نص قبل جدول طويل — لو بقى آخر الصفحة والجدول بدأ في الجاية، ينزل معه (head_break)
            html_ = re.sub(r"^<(\w+) ", r'<\1 data-tp="1" style="break-after:avoid" ', html_, count=1)
        res.append(html_)
        k += 1
    return res


SOL_CSS = """
.soltitle{text-align:center;font-weight:700;font-size:22pt;color:#89543d;margin:0 0 6pt;line-height:1.45}
.soltitle small{display:block;font-size:12pt;color:#ad7c95;font-weight:600}
.unit{position:relative;display:flex;align-items:center;gap:10pt;background:#603b28;color:#fff7ee;border-radius:24pt;padding:6pt 18pt 7pt;
  font-weight:700;font-size:15pt;margin:30pt 0 6pt;break-after:avoid}
body > .unit:first-child, body > .keep:first-child > .unit{margin-top:4pt}
.unit small{background:#fff7ee;color:#603b28;border-radius:14pt;padding:0 10pt;font-size:11pt}
.lesson{position:relative;background:#f5e6d9;border-right:5pt solid #325c8e;border-radius:6pt;padding:6pt 12pt 7pt;
  margin:44pt 0 12pt;break-after:avoid;line-height:1.5}
.lesson small{display:block;color:#ad7c95;font-size:10.5pt;font-weight:600}
.lesson b{display:block;color:#89543d;font-size:15pt;font-weight:700}
.lesson i{display:block;font-style:normal;color:#cc6e53;font-size:11.5pt}
.lesson .pgref{position:absolute;left:10pt;top:8pt}
.mk{position:absolute;left:30pt;bottom:2pt;font-size:2pt;color:#f5e6d9;font-family:'OpenSans';direction:ltr}
.pgref{display:inline-block;background:#fff;color:#844f6a;border:1pt solid #ecd9c9;border-radius:9pt;padding:0 7pt;font-size:9.5pt;font-weight:600;margin-right:6pt;white-space:nowrap}
.sec{margin:34pt 0 10pt;display:block;line-height:1.6;font-size:12pt}  /* نفس مسافات الملزمة: مسافة واضحة قبل كل تطبيق */
.sec::after{display:none}
.sec .exn{color:#a9718f;font-weight:700;font-size:13pt;margin-left:6pt}
.sec .ext{color:#603b28}
.mcq{margin:13pt 0 15pt;break-inside:avoid}
.qq,.item{display:flex;gap:7pt;align-items:baseline;line-height:1.75}
.qn{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:17pt;height:17pt;border-radius:9pt;
  background:#cc6e53;color:#fff;font-size:9.5pt;font-weight:700;padding:0 4pt;transform:translateY(-1pt)}
.item{margin:11pt 0;break-inside:avoid}
.ops{display:grid;gap:4pt 7pt;margin:4pt 24pt 0 0}
.ops.c4{grid-template-columns:repeat(4,minmax(0,1fr))} .ops.c3{grid-template-columns:repeat(3,minmax(0,1fr))} .ops.c2{grid-template-columns:repeat(2,minmax(0,1fr))}
.op{background:#fbf3ec;border:1pt solid #eddccf;border-radius:7pt;padding:2pt 8pt 3pt;font-size:11pt;line-height:1.5;color:#6d4a37}
.op b{color:#ad7c95;margin-left:3pt}
.op.ok{background:#e3efed;border-color:#7fa9a4;color:#2f5f63;box-shadow:inset -3pt 0 0 #527c82}
.op.ok b{color:#527c82}
.op.ok::after{content:'✔';font-family:'DejaVu Sans',sans-serif;color:#527c82;margin-right:6pt;font-size:10pt}
.why{margin:3pt 24pt 0 0;font-size:10.5pt;color:#527c82}
.passage{background:#fffaf5;border:1pt dashed #dcbfa6;border-radius:8pt;padding:6pt 11pt;margin:12pt 0;line-height:1.9;font-size:11.4pt;break-inside:avoid;text-align:justify}
.passage .pk{color:#cc6e53;margin-left:5pt}
.bl{position:relative;padding-right:14pt;margin:9pt 0;line-height:1.9;break-inside:avoid}
.bl::before{content:'';position:absolute;right:2pt;top:8.5pt;width:6pt;height:6pt;border-radius:50%;background:#e3a594}
.note{font-size:10.6pt}
table.t td{font-size:11pt}
table.t.brk{break-inside:auto !important}
.ln.ind{text-indent:18pt}
table.t tr.z1 td{background:#fdf8f3} table.t tr.z0 td{background:#f6ece4}
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
        parts.append(f'<div class="unit"><span class="mk">zzUzz</span><small>{name}</small>{html.escape(title)}</div>')
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
    ("تدريبات", '<path d="M6 4.5h12v15H6zM9 9h6M9 12.5h6M9 16h4"/>'),
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
.closing .cs{{color:#cc6e53;font-size:12pt;text-align:center;margin-bottom:9pt}}
.closing .cb{{display:flex;gap:16pt;align-items:center}}
.closing .feats{{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:7pt 10pt}}
.closing .fh{{grid-column:1/-1;color:#603b28;font-size:12pt}}
.closing .f{{display:flex;align-items:center;gap:7pt;background:#f5e6d9;border-radius:12pt;padding:4pt 9pt;color:#603b28;font-size:12pt;font-weight:700}}
.closing .fi{{flex:none;width:22pt;height:22pt;border-radius:50%;background:#cc6e53;padding:4pt;box-sizing:border-box;display:flex}}
.closing .store{{flex:none;display:flex;flex-direction:column;align-items:center;gap:3pt;text-decoration:none;
  background:#fff;border:1pt solid #ecd9c9;border-radius:12pt;padding:7pt 9pt 5pt}}
.closing .store span{{font-family:'OpenSans';font-weight:800;font-size:11pt;color:#db526f;direction:ltr}}
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
.free {{ background:#db526f; color:#fff; border-radius:14pt; padding:3pt 14pt 4pt; font-weight:700; font-size:12pt; }}
.hero {{ position:absolute; top:118pt; left:40pt; right:40pt; text-align:center; }}
.kicker {{ color:#cc6e53; font-weight:600; font-size:13pt; }}
h1 {{ margin:0; font-weight:700; font-size:50pt; line-height:1.3; color:#89543d; }}
.sub {{ display:inline-block; margin-top:6pt; background:#89543d; color:#fff7ee; font-weight:700; font-size:15pt; border-radius:30pt; padding:3pt 24pt 5pt; }}
.ad {{ position:absolute; top:296pt; left:40pt; right:40pt; background:#fffdfa; border-radius:20pt; padding:16pt 20pt 18pt;
  box-shadow:0 5pt 16pt rgba(96,59,40,.12); border-top:5pt solid #cc6e53; }}
.ad h2 {{ margin:0; text-align:center; color:#89543d; font-size:21pt; line-height:1.45; }}
.ad .lead {{ text-align:center; color:#cc6e53; font-size:13pt; font-weight:600; margin:2pt 0 12pt; }}
.fc {{ display:flex; align-items:center; gap:11pt; background:#fbf3ec; border-radius:14pt; padding:6pt 12pt; margin-bottom:6pt; }}
.fc .fi {{ flex:none; width:36pt; height:36pt; border-radius:50%; background:#527c82; padding:7pt; box-sizing:border-box; display:flex; }}
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
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="frame"></div>
<div class="top"><img src="{fm._logo()}"><div class="free">ملف مجاني</div></div>
<div class="hero"><div class="kicker">عرب 100 · مهارات الكتابة</div><h1>حلول التطبيقات</h1>
<div class="sub">الوحدتان الأولى والثانية</div></div>
<div class="ad"><h2>عندنا دورة شاملة لمادة عرب 100</h2><div class="lead">دورة ملازم عدل تشمل:</div>{cards}
<a class="buy" href="{STORE}"><div class="t"><b>للاشتراك في الدورة</b><span>من متجر ملازم عدل</span><span class="url">mtgradl.com</span></div>
<div class="q">{qr(STORE, 78)}</div></a></div>
<a class="tg" href="{CHANNEL}">قناتنا لمعرفة كل جديد: <span class="url">t.me/mlazmadl</span></a>
</div></body></html>"""


# ---------- الغلاف وصفحة التنويه (ملف المشتركين) ----------
def intro_html(toc_rows, compact=False):
    notes = [
        ("خاص بالمشتركين", "هذا الملف خاص بمشتركي ملازم عدل في مادة عرب 100، ولا أحلل نشره أو إرساله أو إعطاءه لأي شخص، ولا نقل الحلول منه أو تصويرها."),
        ("ترتيب الحلول", "الحلول مرتبة حسب وحدات الكتاب ومواضيعه، وأنشطة كل وحدة (من آخر الكتاب) بعد تطبيقاتها، ومع كل تطبيق رقم صفحته في الكتاب."),
        ("الأسئلة المفتوحة", "الأسئلة التي تطلب كتابة فقرة أو جملة من عندك: الحل نموذج واحد للإجابة، وتصح أي إجابة أخرى تحقق المطلوب."),
    ]
    cards = "".join(f'<p class="ln nc"><span class="nk">{k}</span> {v}</p>' for k, v in notes)
    rows = "".join(r for r in toc_rows)
    # (طلب المستخدم، ملف الوحدتين) «قبل أن تبدأ» والفهرس يرتفعون ويدخل الفهرس كامل في صفحة وحدة
    tight = (".intro-top{margin-top:0!important} .sec.toch{margin-top:18pt!important}"
             " .toc td{padding-top:3.2pt!important;padding-bottom:3.2pt!important}") if compact else ""
    return f"""<!-- قبل أن تبدأ -->
<style>
{tight}
.nc {{ font-size:11.4pt; margin:0 0 8pt; }}
.nk {{ background:#cc6e53; color:#fff; border-radius:10pt; padding:0 8pt; font-size:10.5pt; }}
/* الفهرس ينقسم على صفحتين: رأسه يتكرر، وكل صف مقفول بحدوده (عشان ما يبقى الجدول مفتوح تحت) */
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:11.4pt; margin-top:8pt; }}
.toc th {{ background:#325c8e; color:#fff; font-weight:700; padding:4pt 6pt; }}
.toc thead th:first-child {{ border-top-right-radius:9pt; }} .toc thead th:last-child {{ border-top-left-radius:9pt; }}
.toc tr {{ break-inside:avoid; }}
.toc td {{ padding:4.5pt 10pt; text-align:center; border-bottom:1pt solid #e2cdbd; background:#fbf6f1; line-height:1.5; }}
.toc td:first-child {{ border-right:1pt solid #e2cdbd; }} .toc td:last-child {{ border-left:1pt solid #e2cdbd; }}
.toc td.r {{ text-align:right; }}
.toc tr.unitrow td {{ background:#f5e6d9; color:#cc6e53; font-weight:700; font-size:12pt; text-align:right; }}
</style>
<div class="sec intro-top">قبل أن تبدأ</div>
{cards}
<div class="sec toch">فهرس الحلول</div>
<table class="toc"><thead><tr><th>الموضوع</th><th style="width:60pt">الصفحة</th></tr></thead><tbody>{rows}</tbody></table>"""


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
.lf a{{color:#db526f;text-decoration:none;font-family:'OpenSans';font-weight:800;direction:ltr;unicode-bidi:embed}}"""
    return (f'<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>{bm.font_faces()}{css}</style></head>'
            f'<body style="margin:0">{pages}</body></html>')


def base_page():
    """خلفية الملزمة بدون عبارة «لا احلل نشر … الملخص» (نكتب بدالها عبارة تناسب ملف الحلول)."""
    d = pymupdf.open(bm.BASE)
    pg = d[0]
    pg.add_redact_annot(pymupdf.Rect(10, 821, 207, 841), fill=False)
    pg.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    return d


def copy_links(src_page, dst_page, shift=0):
    for l in src_page.get_links():
        if l.get("uri"):
            dst_page.insert_link({"kind": pymupdf.LINK_URI, "uri": l["uri"], "from": l["from"] + (0, shift, 0, shift)})


def marker_pages(pdf):
    """رقم صفحة كل عنوان «##» (من العلامات المخفية zzLNNzz)."""
    pages = {}
    for pno, pg in enumerate(pdf):
        for m in re.finditer(r"zzL(\d+)zz", pg.get_text()):
            pages.setdefault(int(m.group(1)), pno)
    return pages


def scrub_markers(pdf):
    for pg in pdf:
        hits = pg.search_for("zzL") + pg.search_for("zzU")
        if hits:
            for r in hits:
                pg.add_redact_annot(r + (-2, -2, 30, 2), fill=False)
            pg.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--promo", action="store_true", help="الملف الإعلاني: الوحدتان الأولى والثانية فقط")
    ap.add_argument("--units12", action="store_true", help="ملف المشتركين للوحدتين الأولى والثانية فقط (جزئية الميد)")
    a = ap.parse_args()

    units = load_units()
    which = [0, 1] if a.promo or a.units12 else [0, 1, 2, 3]
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
            bm.render(fm.cover_html(bm.font_faces(), cov, kicker=("مهارات الكتابة · الوحدتان الأولى والثانية" if a.units12 else "مهارات الكتابة · التطبيقات والأنشطة كاملة"),
                                    title="حلول التطبيقات", badge="ملف خاص بالمشتركين",
                                    foot="خاص بالمشتركين · لا أحلل نشر الملف أو إرساله أو إعطاءه لأي شخص أو نقل حلوله"),
                      tmp / "cover.pdf", br)
            bm.render(bm.doc(intro_html(rows, compact=a.units12)), tmp / "intro.pdf", br)
            front += [("cover", tmp / "cover.pdf"), ("intro", tmp / "intro.pdf")]
        n_intro = pymupdf.open(tmp / "intro.pdf").page_count if not a.promo else 0
        bm.render(footers_html([("قبل أن تبدأ", None)] * n_intro + foot, left), tmp / "f.pdf", br)
        br.close()

    # الصفحات اللي تبدأ (من أعلاها) بموضوع/درس جديد
    starts = {pno for pno, pg in enumerate(content) for r in pg.search_for("zzL") + pg.search_for("zzU") if r.y0 < bm.TOP + 90}
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
        bottom = bm.content_bottom(content[i])
        # نقص الصفحة بس إذا الجاية تبدأ موضوع جديد (أو هي الأخيرة) — مو في نص تطبيق
        ends = i + 1 >= content.page_count or (i + 1) in starts
        if ends and bottom is not None and (H - bm.BOT_M) - bottom > bm.TRIM_GAP * bm.CAPH:
            # نفس الملزمة: الصفحة اللي فيها فراغ كبير تنقص على قد الكلام والتذييل تحتها مباشرة
            cut = bottom + 30
            hn = cut + bm.FOOT_STRIP
            pg = out.new_page(width=W, height=hn)
            top_r, bot_r = pymupdf.Rect(0, 0, W, cut), pymupdf.Rect(0, cut, W, hn)
            top_clip, bot_clip = pymupdf.Rect(0, 0, W, cut), pymupdf.Rect(0, H - bm.FOOT_STRIP, W, H)
            pg.show_pdf_page(top_r, base, 0, clip=top_clip)
            pg.show_pdf_page(bot_r, base, 0, clip=bot_clip)
            pg.show_pdf_page(top_r, content, i, clip=top_clip)
            copy_links(content[i], pg)
            pg.show_pdf_page(bot_r, footp, fk, clip=bot_clip)
            copy_links(footp[fk], pg, shift=cut - (H - bm.FOOT_STRIP))
            fk += 1
            continue
        pg = out.new_page(width=W, height=H)
        pg.show_pdf_page(pg.rect, base, 0)
        pg.show_pdf_page(pg.rect, content, i)
        # Chrome أحياناً يرسم حركة من أول سطر في الصفحة الجاية على حد هذي الصفحة ← نغطيها بالخلفية
        for r in bm.stray_marks(content[i]):
            pg.show_pdf_page(r, base, 0, clip=r)
        copy_links(content[i], pg)
        pg.show_pdf_page(pg.rect, footp, fk)
        copy_links(footp[fk], pg)
        fk += 1
    title = ("عرب 100 — حلول تطبيقات الوحدتين الأولى والثانية" if a.promo else
             "عرب 100 — حلول تطبيقات الوحدتين الأولى والثانية وأنشطتهما (خاص بالمشتركين)" if a.units12 else
             "عرب 100 — حلول تطبيقات الكتاب وأنشطته (خاص بالمشتركين)")
    out.set_metadata({"title": title, "author": "ملازم عدل"})
    out.save(a.out, garbage=4, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة")


def SOL_CSS_WRAP(body):
    return body.replace("-->", "-->\n<style>" + SOL_CSS + "</style>", 1)


if __name__ == "__main__":
    main()
