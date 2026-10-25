#!/usr/bin/env python3
"""ملف PDF: نماذج أسئلة المستخدم (قطعة + قواعد + كلمات) مع الحل — إنجليزي المسار الإنساني (جزئية الميد).
  python3 tools/english/build_exam_samples_pdf.py
المصادر: store/english/exam-samples-2/batch1..3 (الخيارات بترتيبها الأصلي هنا تحت).
الناتج: store/english/exam-samples-2/humanities-exam-samples-with-answers.pdf
"""
import html, os, re, subprocess, tempfile
import pypdf, pypdfium2, pymupdf, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guide_pdf as guide   # صفحة الإعلان نفسها حق دليل الميد
from pypdf.annotations import Link

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'store/english/exam-samples-2/humanities-exam-samples-with-answers.pdf')
FONTS = os.path.join(ROOT, 'tools/arab100/fonts')
LOGO = os.path.join(ROOT, 'tools/statistics/logo-adl.png')
LETTERS = 'ABCD'
# تنويه الحقوق (نفس فكرة تنويه موقع النهج) — يطلع في كل صفحة
RIGHTS = '© ملازم عدل · لا نُحلّل أخذ محتوى الملف أو أسئلته أو حلوله أو نسخها أو استغلالها بأي شكل، لغرض تجاري أو غير تجاري، بدون إذن منّا.'
AD_EXTRA = '<div class="extra">وعندنا جميع مواد المسار الإنساني<small>كل المواد متوفرة في المتجر: mtgradl.com</small></div>'

# القطعة: نفس نص القطعة 4 في tools/english/reading.txt (والشروح منه)
def passage():
    t = open(os.path.join(ROOT, 'tools/english/reading.txt'), encoding='utf-8').read()
    blk = re.search(r'^## 4 \|.*?(?=^## 5 \|)', t, re.S | re.M).group(0)
    paras = [l for l in blk.split('\n') if re.match(r'^\d\. ', l)]
    expl = [l[3:] for l in blk.split('\n') if l.startswith('!! ')]
    return paras, expl

# (السؤال، الخيارات بترتيب الاختبار، رقم الصحيح)
READING = [
    ('The writer says that people eat apples in ______.', ['diet classes', 'most countries', 'the kitchen', 'some states'], 1),
    ('Which technology company does the author mention?', ['Amazon', 'Starbucks', 'Seattle', 'Northwest'], 0),
    ('People in Washington celebrate apples by ______.', ['cooking food', 'selling flowers', 'performing dances', 'listening to music'], 3),
    ('What does the underlined word "it" in paragraph 2 refer to?', ['The United States', 'Washington State', 'the biggest city', 'technology company'], 1),
    ('What does the underlined word "them" in paragraph 2 refer to?', ['farmers', 'apples', 'trees', 'oranges'], 1),
    ('How is growing apples different from growing oranges?', ['Apples need warm and cold weather.', 'Oranges need extremely rainy weather.', 'Apples need temperatures to always be cold.', 'Oranges need six hours of sun every day.'], 0),
    ('Which activity does the author NOT mention?', ['joining apple eating contests', 'making apple juice', 'driving around a farm', 'learning the history of apples'], 3),
    ('What does the word "beloved" in paragraph 1 mean?', ['really liked', 'a little liked', 'sometimes eaten', 'not eaten'], 0),
    ('What does the word "cripple" in paragraph 2 mean?', ['make sweet like sugar', 'make grow large', 'give a lot of water to', 'hurt badly or kill'], 3),
    ('What is the best title for the passage?', ['The Biggest Types of Trees in USA', 'Washington: The Best Place to Grow Apples', 'How to Grow Apples in Warm Weather', 'The Advantages of Eating Apples'], 1),
]
GRAMMAR = [
    ("My brother doesn't like running in the morning. ______ makes him tired during the day.", ['It', 'She', 'These', 'They'], 0, 'Subject and Object pronouns',
     'running in the morning شي واحد (مو شخص)، ونحتاج فاعل مفرد قبل makes ← It.'),
    ("I ______ the kids' store at Panorama Mall. It has many toys and books.", ['to love', 'love', 'be loving', 'loving'], 1, 'Simple present',
     'I ← في المضارع البسيط الفعل يجي بصيغته الأساسية (بدون to وبدون ing) ← I love.'),
    ('This ______ a shoe store. People come here to buy shoes and accessories.', ['is', 'be', 'am', 'are'], 0, 'Simple present',
     'This (شي واحد مفرد = It) ← نستخدم is.'),
    ('He ______ from home. He goes to the office from Sunday to Thursday every week.', ['no work', "don't work", 'not work', "doesn't work"], 3, 'Simple present',
     "He ← النفي مع He / She / It يكون doesn't + الفعل الأساسي: doesn't work (لأنه يروح المكتب كل أسبوع)."),
    ('I asked Hussain and Tariq to join me at the gym. ______ my friends from the neighborhood.', ["They're", 'There', "There's", 'Their'], 0, 'Subject and Object pronouns',
     "Hussain and Tariq = They، ونحتاج فاعل + فعل be ← They're = They are. (There = هناك، Their = حقهم.)"),
    ('My brother plays football. ______ the best player on our school team.', ['Him', 'His', "He's", "He'd"], 2, 'Subject and Object pronouns',
     "My brother = He، ونحتاج فاعل + is ← He's = He is."),
    ('Sameera ______ articles for the local newspaper, and she has a website about life in Riyadh.', ['writing', 'writes', 'write', 'writer'], 1, 'Simple present',
     'Sameera = She ← في المضارع البسيط مع He / She / It نضيف s للفعل: writes.'),
    ('This ice cream store has new flavors on sale. You can try ______ all before you decide what you want.', ['her', 'they', 'him', 'them'], 3, 'Subject and Object pronouns',
     'new flavors جمع، وبعد الفعل try نحط ضمير مفعول ← them.'),
    ('My mother made some cookies this afternoon. She put ______ on the kitchen table.', ['him', 'her', 'them', 'they'], 2, 'Subject and Object pronouns',
     'some cookies جمع، وبعد الفعل put نحط ضمير مفعول ← them.'),
    ('Saleh ______ a science teacher. He works at Kingdom School in Riyadh.', ['are', 'am', 'is', 'be'], 2, 'Simple present',
     'Saleh مفرد (He) ← نستخدم is.'),
]
VOCAB = [
    ('I drank a ______ mango smoothie after practice, which helped me cool down.', ['deliberate', 'confusing', 'delicious', 'spacious'], 2,
     'delicious = لذيذ ← عصير مانجو يبرّد بعد التمرين، فالمناسب «لذيذ».'),
    ('Have you ever met a/an ______ football player in real life, like Mohamed Salah or Cristiano Ronaldo?', ['poor', 'clear', 'unsafe', 'famous'], 3,
     'famous = مشهور ← محمد صلاح ورونالدو لاعبين مشهورين.'),
    ("I don't have a picture of my school, but I can ______ it to you. It's a tall yellow building.", ['describe', 'leave', 'stream', 'believe'], 0,
     'describe = يصف ← ما عنده صورة، فيوصفها بالكلام: مبنى طويل أصفر.'),
    ('My brother loves to ______ science videos on YouTube. He wants to start his own channel one day.', ['entice', 'watch', 'remove', 'knock'], 1,
     'watch = يشاهد ← الفيديوهات تتشاهد.'),
    ('I think food tastes better when I cook with ______ vegetables from my garden.', ['heavy', 'fresh', 'strong', 'neat'], 1,
     'fresh = طازج ← خضار من حديقته، يعني طازجة.'),
    ("I like this weather because it's perfect for a family get together ______ like a picnic or a barbecue.", ['underneath', 'outdoors', 'overland', 'online'], 1,
     'outdoors = في الهواء الطلق (برّا) ← النزهة والشواء يكونون برّا.'),
    ('These days, many people buy their ______ and other items from online stores instead of going to the mall.', ['clothes', 'sales', 'goals', 'bridges'], 0,
     'clothes = ملابس ← الناس يشترون ملابسهم أونلاين بدل المول.'),
    ('I think I need to ______ the time I am on the computer. The screen hurts my eyes, and I am having trouble sleeping.', ['stir', 'expect', 'reduce', 'slam'], 2,
     'reduce = يقلّل ← الشاشة تتعب عيونه وما ينام زين، فلازم يقلّل وقته على الكمبيوتر.'),
    ('One of his ______ is that he has a good attitude no matter what happens in his life.', ['blocks', 'strengths', 'events', 'controls'], 1,
     'strengths = نقاط القوة ← «good attitude» ميزة فيه، يعني من نقاط قوته.'),
    ("I need to move soon. I'm looking for a new furnished home with ______ appliances.", ['polite', 'crowded', 'stale', 'modern'], 3,
     'modern = حديث ← بيت جديد مفروش بأجهزة حديثة.'),
]

E = html.escape
def en(s):
    return f'<span class="en">{E(s)}</span>'
def rich_ar(s):
    # «…» = اقتباس إنجليزي من القطعة (سطر لحاله)، والكلمات الإنجليزية داخل الشرح العربي معزولة باتجاهها
    parts = re.split(r'(«[^»]*»)', s)
    out = []; after_q = False
    for p in parts:
        if p.startswith('«') and re.search('[A-Za-z]', p) and len(p) > 25:
            out.append(f'<q class="en">{E(p[1:-1])}</q>'); after_q = True
            continue
        if p.startswith('«'):
            out.append(f'«{rich_ar(p[1:-1])}»'); continue
        if after_q: p = re.sub(r'^[\s،,.]+', '', p)   # الفاصلة/النقطة بعد الاقتباس ما تنزل سطر لحالها
        after_q = False
        if not p.strip(): continue
        bits = re.split(r"([A-Za-z][A-Za-z0-9'’.\-]*(?:[ =+/:]+[A-Za-z0-9][A-Za-z0-9'’.\-]*)*)", p)
        out.append(''.join(en_run(b) if i % 2 else E(b) for i, b in enumerate(bits)))
    return ''.join(out)
def en_run(w):
    tail = ''
    while w and w[-1] in '.,':
        tail = w[-1] + tail; w = w[:-1]
    return f'<bdi class="en">{E(w)}</bdi>{E(tail)}'
def blank(s):
    return E(s).replace('______', '<span class="blank">______</span>')

def q_html(n, q, opts, ok, expl, tag=''):
    li = ''.join(f'<div class="op{" ok" if i == ok else ""}"><b>{LETTERS[i]}</b><span>{E(o)}</span>{"<i>✓</i>" if i == ok else ""}</div>' for i, o in enumerate(opts))
    return (f'<div class="q"><div class="qh"><span class="qn">{n}</span>{tag}<p class="qt en">{blank(q)}</p></div>'
            f'<div class="ops en">{li}</div>'
            f'<div class="ans"><b>الإجابة: {en(LETTERS[ok] + ") " + opts[ok])}</b><p>{rich_ar(expl)}</p></div></div>')

def end_ad():
    """إعلان كبير في آخر صفحة: المتجر + القناة (رابط يضغط عليه + باركود)."""
    def card(cls, title, desc, url, label, hint):
        return (f'<div class="ec {cls}"><div class="et">{title}</div><div class="ed">{desc}</div>'
                f'<a class="eq" href="{url}">{guide.qr_img(url, 118)}</a>'
                f'<div class="eh">{hint}</div><a class="eb" href="{url}">{en(label)}</a></div>')
    return ('<div class="endad"><div class="eh1">تبي تستعد للاختبار صح؟</div>'
            '<div class="eh2">دورة ملازم عدل للإنجليزي — وعندنا جميع مواد المسار الإنساني</div><div class="eg">'
            + card('st', 'متجر ملازم عدل', 'الدورات والملازم لكل المواد', 'https://mtgradl.com', 'mtgradl.com',
                   'للدخول للمتجر اضغط على الرابط')
            + card('tg', 'قناتنا على التليجرام', 'لمعرفة كل جديد: نماذج وحلول وتسريبات', 'https://t.me/mlazmadl', 't.me/mlazmadl',
                   'للدخول للقناة اضغط على الرابط')
            + '</div></div>')

def build():
    paras, rexp = passage()
    def para(l):
        num, txt = l.split('. ', 1)
        txt = re.sub(r'_([^_]+)_', r'<u>\1</u>', E(txt))
        return f'<p><b class="pn">{num}.</b> {txt}</p>'
    reading = ''.join(q_html(i + 1, q, o, k, rexp[i]) for i, (q, o, k) in enumerate(READING))
    grammar = ''.join(q_html(i + 1, q, o, k, e, f'<span class="tag en">{E(r)}</span>') for i, (q, o, k, r, e) in enumerate(GRAMMAR))
    vocab = ''.join(q_html(i + 1, q, o, k, e) for i, (q, o, k, e) in enumerate(VOCAB))
    css = f"""
@font-face{{font-family:R;src:url('file://{FONTS}/Readex-400.ttf')}}
@font-face{{font-family:R;font-weight:600;src:url('file://{FONTS}/Readex-600.ttf')}}
@font-face{{font-family:R;font-weight:700;src:url('file://{FONTS}/Readex-700.ttf')}}
@page{{size:A4;margin:12mm 14mm 25mm}}
*{{box-sizing:border-box}}
html{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{margin:0;font-family:R,sans-serif;color:#1f2a37;font-size:11pt;line-height:1.7;direction:rtl;background:#fff}}
.en{{direction:ltr;unicode-bidi:isolate;text-align:left}}
bdi.en{{unicode-bidi:isolate}}
.cover{{text-align:center;padding:4mm 0 4mm;background:#fffdf5;border:1.5px solid #e7dcc6;border-radius:12px;margin-bottom:6mm}}
.cover img{{height:15mm}}
.cover h1{{margin:1.5mm 0 .5mm;color:#204b7d;font-size:21pt;font-weight:700}}
.cover .sub{{color:#b0698d;font-weight:600;font-size:13pt}}
.cover .exam{{display:inline-block;margin-top:2mm;background:#204b7d;color:#fff;font-weight:700;font-size:12pt;border-radius:999px;padding:1.2mm 6mm}}
.cover .toc{{margin-top:3mm;display:flex;justify-content:center;gap:5mm;font-size:10.5pt;color:#475569}}
.cover .toc span{{background:#eef3f9;border-radius:6px;padding:1mm 3mm}}
h2{{color:#fff;background:#204b7d;border-radius:8px;padding:2mm 4mm;font-size:14pt;margin:7mm 0 4mm;break-after:avoid}}
h2 small{{font-weight:400;font-size:10.5pt;opacity:.9;margin-inline-start:2mm}}
.passage{{break-inside:avoid;background:#fff;border:1.5px solid #d8cfbd;border-radius:10px;padding:4mm 5mm;margin-bottom:5mm}}
.passage h3{{margin:0 0 2mm;color:#204b7d;font-size:13pt;text-align:left}}
.passage p{{margin:0 0 2.5mm;text-align:justify}}
.passage .pn{{color:#b0698d}}
.passage u{{text-decoration-color:#b0698d;text-decoration-thickness:1.5px;text-underline-offset:2px;font-weight:600}}
.q{{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:3mm 4mm;margin:0 0 4mm;break-inside:avoid}}
.qh{{display:flex;align-items:flex-start;gap:2.5mm;margin-bottom:2mm}}
.qn{{flex:none;background:#204b7d;color:#fff;border-radius:50%;width:7mm;height:7mm;display:grid;place-items:center;font-weight:700;font-size:10pt}}
.tag{{flex:none;margin-top:.6mm;white-space:nowrap;background:#f6ecf2;color:#8a4a6c;border-radius:5px;padding:0 2mm;font-size:9pt}}
.qt{{margin:0;flex:1;font-weight:600;line-height:1.55}}
.blank{{color:#b0698d;letter-spacing:-1px}}
.ops{{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 4mm}}
.op{{display:flex;align-items:center;gap:2mm;border:1px solid #e2e8f0;border-radius:6px;padding:1mm 2.5mm;font-size:10.5pt}}
.op b{{color:#64748b}}
.op i{{margin-left:auto;font-style:normal;color:#15803d;font-weight:700}}
.op.ok{{background:#e8f6ec;border-color:#15803d;font-weight:600}}
.op.ok b{{color:#15803d}}
.ans{{margin-top:2.5mm;background:#fbf7ee;border-inline-start:4px solid #b0698d;border-radius:6px;padding:1.5mm 3mm;font-size:10pt}}
.ans b{{color:#204b7d}}
.ans p{{margin:.5mm 0 0;line-height:1.6}}
.endad{{break-inside:avoid;margin-top:8mm;background:#204b7d;border-radius:14px;padding:6mm 6mm 7mm;text-align:center;color:#fff}}
.endad .eh1{{font-size:20pt;font-weight:700;line-height:1.3}}
.endad .eh2{{font-size:12pt;color:#f3d3e3;margin:1mm 0 5mm}}
.endad .eg{{display:grid;grid-template-columns:1fr 1fr;gap:5mm}}
.endad .ec{{background:#fff;color:#1f2a37;border-radius:12px;padding:4mm 3mm 4mm}}
.endad .et{{font-size:15pt;font-weight:700;color:#204b7d}}
.endad .ed{{font-size:10pt;color:#5b6675;margin-bottom:2.5mm}}
.endad .eq{{display:block}}
.endad .eb{{display:inline-block;margin-top:1.5mm;background:#b0698d;color:#fff;border-radius:9px;padding:1.5mm 6mm;font-size:15pt;font-weight:700;text-decoration:underline;text-underline-offset:3px}}
.endad .tg .eb{{background:#2a8bd0}}
.endad .eh{{margin-top:2.5mm;font-size:10.5pt;font-weight:700;color:#204b7d;border-top:1px dashed #cbd5e1;padding-top:2mm}}
.ans q.en{{display:block;quotes:'“' '”';margin:.5mm 0;line-height:1.5;color:#334155;font-style:italic}}
"""
    body = f"""<div class="cover"><img src="file://{LOGO}"><h1>نماذج أسئلة مع الحل</h1>
<div class="sub">إنجليزي · المسار الإنساني · جزئية الميد</div>
<div class="exam">اختبار الميد · <bdi>1448</bdi> هـ · الفصل الأول · دفعة الساعة <bdi>10</bdi></div>
<div class="toc"><span>١) قطعة + 10 أسئلة</span><span>٢) قواعد: 10 أسئلة</span><span>٣) كلمات: 10 أسئلة</span></div></div>
<h2>١) القطعة <small>{en('Reading')}</small></h2>
<div class="passage en"><h3>Apples in Washington State</h3>{''.join(para(l) for l in paras)}</div>
{reading}
<h2>٢) القواعد <small>{en('Grammar')}</small></h2>{grammar}
<h2>٣) الكلمات <small>{en('Vocabulary')}</small></h2>{vocab}{end_ad()}"""
    doc = f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>'
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(doc); src = f.name
    LK = "<span dir='ltr' style='unicode-bidi:isolate;color:#b0698d;font-weight:700'>"
    FOOT = ("<div dir='rtl' style='-webkit-print-color-adjust:exact;width:100%;margin:0 14mm 5mm;font-family:sans-serif'>"
            "<div style='background:#fdecec;color:#8a1c1c;border:1px solid #f3b8b8;border-radius:5px;padding:1.2mm 2mm;margin-bottom:1.5mm;"
            f"text-align:center;font-size:8.5pt;font-weight:700'>{RIGHTS}</div>"
            "<div style='display:flex;justify-content:space-between;"
            "font-size:8.5pt;color:#64748b;border-top:1px solid #e2e8f0;padding-top:1.5mm'>"
            f"<span style='unicode-bidi:isolate'>قناتنا لمعرفة كل جديد: {LK}t.me/mlazmadl</span></span>"
            f"<span style='unicode-bidi:isolate'>المتجر: {LK}mtgradl.com</span></span>"
            "<span class='pageNumber' style='color:#204b7d;font-weight:700'></span></div></div>")
    js = f"""const {{ chromium }} = require('playwright');
(async () => {{ const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://{src}'); await p.waitForTimeout(400);
  await p.pdf({{ path: '{OUT}', format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: {FOOT!r} }}); await b.close(); }})();"""
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(js); jsf = f.name
    env = dict(os.environ, NODE_PATH=subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip())
    subprocess.run(['node', jsf], check=True, env=env)
    os.unlink(src); os.unlink(jsf)
    # روابط قابلة للضغط فوق نص التذييل (مكان النص من pdfium، والرابط بـ pypdf)
    boxes = []
    pdf = pypdfium2.PdfDocument(OUT)
    for pi in range(len(pdf)):
        tp = pdf[pi].get_textpage(); h = pdf[pi].get_height()
        for txt, url in (('t.me/mlazmadl', 'https://t.me/mlazmadl'), ('mtgradl.com', 'https://mtgradl.com')):
            se = tp.search(txt)
            while (m := se.get_next()):
                bx = [tp.get_charbox(c) for c in range(m[0], m[0] + m[1])]
                r = (min(x[0] for x in bx), min(x[1] for x in bx), max(x[2] for x in bx), max(x[3] for x in bx))
                if r[1] < h * 0.1: boxes.append((pi, r, url))
    pdf.close()
    w = pypdf.PdfWriter(clone_from=OUT)
    for pi, r, url in boxes:
        w.add_annotation(pi, Link(rect=(r[0] - 1, r[1] - 2, r[2] + 1, r[3] + 2), url=url))
    w.write(OUT)
    # أول صفحة: إعلان الدورة (نفس صفحة دليل الميد) + سطر «جميع مواد المسار الإنساني»
    ad = OUT + '.ad.pdf'
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(guide.ad_page(AD_EXTRA, f'<div style="text-align:center;font-size:15px;font-weight:700;color:#8a1c1c;background:#fdecec;border:1px solid #f3b8b8;border-radius:10px;padding:8px 12px">{RIGHTS}</div>')); adsrc = f.name
    js = f"""const {{ chromium }} = require('playwright');
(async () => {{ const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://{adsrc}', {{ waitUntil: 'networkidle' }}); await p.evaluate(() => document.fonts.ready);
  await p.pdf({{ path: '{ad}', format: 'A4', printBackground: true, preferCSSPageSize: true }}); await b.close(); }})();"""
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(js); jsf = f.name
    subprocess.run(['node', jsf], check=True, env=env)
    os.unlink(adsrc); os.unlink(jsf)
    d = pymupdf.open(ad); assert len(d) == 1, 'صفحة الإعلان طلعت أكثر من صفحة'
    d.insert_pdf(pymupdf.open(OUT)); d.set_metadata({'title': 'نماذج أسئلة مع الحل — إنجليزي المسار الإنساني (الميد 1448)', 'author': 'ملازم عدل'})
    d.save(OUT + '.tmp', garbage=3, deflate=True); os.replace(OUT + '.tmp', OUT); os.unlink(ad)
    print('PDF:', OUT)

if __name__ == '__main__':
    assert len(READING) == len(GRAMMAR) == len(VOCAB) == 10
    build()
