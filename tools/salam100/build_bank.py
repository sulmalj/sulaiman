#!/usr/bin/env python3
"""بنك أسئلة سلم 100 (تجميعات الملزمة + أسئلة إضافية) — PDF بتصميم بنك فجب وألوان بنية.
المصادر: store/salam100/bank/uNN.txt  (Q| أ| ب| ج| د| A| N| P|  و«## إضافية»)
الاستخدام: python3 tools/salam100/build_bank.py store/salam100/salam100-bank.pdf [--site URL]
"""
import argparse, base64, html, os, re, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'store/salam100/bank'
FONTS = ROOT / 'tools/salam100/fonts'
LOGO = ROOT / 'tools/statistics/logo-adl.png'
SITE = 'https://malazmadlsalam.netlify.app'

UNITS = {
    1: ('الوحدة الأولى', 'مفهوم السيرة النبوية ومصادرها، وحال العرب قبل البعثة'),
    2: ('الوحدة الثانية', 'مراحل حياته ﷺ الأولى، وما سبقها من مبشرات بنبوته'),
    3: ('الوحدة الثالثة', 'حياته ﷺ من الطفولة إلى البعثة'),
    4: ('الوحدة الرابعة', 'بعثة النبي ﷺ، وبدايات الدعوة في العهد المكي'),
    5: ('الوحدة الخامسة', 'أحداث ووقائع من العهد المكي'),
    6: ('الوحدة السادسة', 'المجتمع الإسلامي في المدينة (العهد المدني)'),
    7: ('الوحدة السابعة', 'الغزوات الأولى'),
    8: ('الوحدة الثامنة', 'غزوات: بني النضير، والخندق، وبني قريظة'),
    9: ('الوحدة التاسعة', 'صلح الحديبية، ومراسلة الملوك والأمراء'),
    10: ('الوحدة العاشرة', 'غزوة الفتح'),
    11: ('الوحدة الحادية عشرة', 'مرض الرسول ﷺ ووفاته'),
    12: ('الوحدة الثانية عشرة', 'حقوق الرسول ﷺ على أمته'),
}
LET = ['أ', 'ب', 'ج', 'د']
AR = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')


def parse(path):
    """يرجّع (تجميعات, إضافية, احتياط) — كل سؤال dict(q, o, a, n, p).
    «## إضافية» = أسئلة من عندنا تنطبع دائماً، «## احتياط» = تتعبّى منها آخر صفحة في الوحدة على قد الفراغ."""
    secs = {'': [], 'إضافية': [], 'احتياط': []}
    target, cur = secs[''], None
    for raw in path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith('## '):
            target = secs[line[3:].strip()]
            continue
        if '|' not in line:
            sys.exit(f'{path.name}: سطر غير مفهوم: {line}')
        k, v = line.split('|', 1)
        k, v = k.strip(), v.strip()
        if k == 'Q':
            cur = {'q': v, 'o': {}, 'a': None, 'n': [], 'p': None}
            target.append(cur)
        elif k in LET:
            cur['o'][k] = v
        elif k == 'A':
            cur['a'] = v
        elif k == 'N':
            cur['n'].append(v)
        elif k == 'P':
            cur['p'] = v
        else:
            sys.exit(f'{path.name}: مفتاح غير معروف {k}')
    for q in secs[''] + secs['إضافية'] + secs['احتياط']:
        if not set(LET[:3]) <= set(q['o']) or not set(q['o']) <= set(LET) or q['a'] not in q['o']:
            sys.exit(f'{path.name}: سؤال ناقص: {q["q"]}')
    return secs[''], secs['إضافية'], secs['احتياط']


def font_face():
    css = ''
    for w in (500, 700, 800, 900):
        css += f"@font-face{{font-family:'Taj';font-weight:{w};src:url('file://{FONTS}/Tajawal-{w}.ttf')}}\n"
    css += f"@font-face{{font-family:'AmiriS';src:url('file://{FONTS}/Amiri-Regular.ttf');unicode-range:U+FDFA,U+FD3E-FD3F}}\n"
    return css


CSS = """
@page{size:A4;margin:12mm 11mm 19mm}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:'AmiriS','Taj',sans-serif;color:var(--ink);background:var(--bg);-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:10pt;font-weight:700}
:root{--bg:#F8EFE8;--box:#FBF7F4;--ink:#3A2317;--br:#5C3825;--terra:#CC6E53;--mauve:#844F6A;--circ:#A8917F;--pink:#C9466A;--soft:#F3E7DF}
.wm{position:fixed;top:50%;left:50%;width:125mm;transform:translate(-50%,-50%);opacity:.06;z-index:0}
.wm img{width:100%}
main{position:relative;z-index:1;padding:0 1.5mm}

/* الغلاف — نفس غلاف بنك النهج */
.cover{height:262mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:42mm;break-after:page;position:relative}
.cover .subj{color:var(--terra);font-weight:800;font-size:13pt}
.cover h1{margin:3mm 0 0;font-weight:900;font-size:46pt;line-height:1.2;color:var(--br)}
.cover h2{margin:1mm 0 0;font-weight:900;font-size:36pt;line-height:1.25;color:var(--terra)}
.cover .rule{width:38mm;height:2.4px;background:var(--br);margin:7mm 0 5mm;border-radius:2px}
.pill{background:var(--br);color:#fff;border-radius:999px;padding:1.8mm 7mm;font-size:10.5pt;font-weight:800}
.cbox{width:100%;border:1.3px solid var(--terra);border-radius:4.5mm;padding:4.5mm 6mm;margin-top:6mm;background:rgba(251,247,244,.85)}
.cbox .big{font-size:16.5pt;font-weight:900;line-height:1.65;color:var(--ink)}
.cbox .big em{font-style:normal;color:var(--terra)}
.cbox p{margin:1mm 0 0;font-size:11.5pt;font-weight:800;color:var(--ink);line-height:1.7}
.cbox p em{font-style:normal;color:var(--terra)}
.site{display:inline-block;margin-top:3mm;background:var(--br);color:#fff;text-decoration:none;border-radius:3.5mm;padding:2.6mm 7mm;font-size:12.5pt;font-weight:900}
.site .u{display:block;direction:ltr;font-size:11pt;font-weight:800;color:#F3D9CC;margin-top:.5mm}
.tap{display:block;margin-top:1.8mm;font-size:10pt;color:var(--terra);font-weight:800}
.spaced{margin-top:7mm;color:var(--br);font-size:12.5pt;font-weight:800;letter-spacing:.7mm}
.nopub{position:absolute;bottom:14mm;left:50%;transform:translateX(-50%);color:var(--pink);font-size:14pt;font-weight:900;border-top:1.3px solid var(--pink);border-bottom:1.3px solid var(--pink);padding:1.6mm 9mm;white-space:nowrap}

/* الوحدات */
.unit{break-before:page}
.uhead{display:flex;align-items:center;gap:4mm;margin:0 0 2.5mm}
.uhead .t{background:var(--br);color:#fff;border-radius:2.8mm;padding:1.3mm 6mm;font-size:14pt;font-weight:900;white-space:nowrap}
.uhead .line{flex:1;height:2px;border-radius:2px;background:linear-gradient(to left,#DEA390,rgba(222,163,144,0))}
.uhead .c{color:var(--mauve);font-size:10.5pt;font-weight:900;white-space:nowrap}
.usub{margin:0 0 3mm;color:var(--mauve);font-size:10pt;font-weight:800}
.sechead{display:flex;align-items:center;gap:3mm;margin:3.5mm 0 2.6mm;color:var(--terra);font-size:11pt;font-weight:900;break-after:avoid;white-space:nowrap}
.sechead small{color:var(--mauve);font-size:9pt;font-weight:800}
.sechead::after{content:"";flex:1;height:1.2px;background:linear-gradient(to left,#DEA390,rgba(222,163,144,0))}
.q{display:flex;align-items:center;gap:3mm;margin-bottom:2.4mm;break-inside:avoid}
.qb{flex:1;min-width:0;border:1px solid var(--br);border-radius:3mm;background:var(--box);overflow:hidden}
.qt{padding:1.5mm 3mm;font-weight:900;font-size:10pt;line-height:1.6;color:var(--ink);border-bottom:1px solid var(--br)}
.qt b{color:var(--mauve);font-weight:900}
.ops{display:grid;grid-template-columns:1fr 1fr}
.op{padding:1.2mm 3mm;font-weight:800;font-size:9.6pt;line-height:1.5;color:var(--ink)}
.op:nth-child(odd){border-inline-end:1px solid var(--br)}
.op:nth-child(n+3){border-top:1px solid var(--br)}
.op.c{grid-column:1/-1;text-align:center;border-inline-end:0}
.op i{font-style:normal;color:var(--terra);font-weight:900}
.note{padding:1.2mm 3mm;border-top:1px dashed var(--br);color:var(--mauve);font-size:9pt;font-weight:800;line-height:1.55}
.ans{flex:none;width:9.5mm;height:9.5mm;border-radius:50%;background:var(--circ);color:#fff;display:grid;place-items:center;font-size:12.5pt;font-weight:900;line-height:1}
"""


def esc(s):
    return html.escape(s, quote=False)


def q_html(n, q, extra=False):
    ops = ''.join(f'<div class="op{" c" if L == "ج" and "د" not in q["o"] else ""}"><i>{L} / </i>{esc(q["o"][L])}</div>' for L in LET if L in q['o'])
    notes = ''.join(f'<div class="note">{esc(t)}</div>' for t in q['n'])
    return (f'<div class="q"><div class="qb"><div class="qt"><b>{str(n)}-</b> {esc(q["q"])}</div>'
            f'<div class="ops">{ops}</div>{notes}</div><div class="ans">{q["a"]}</div></div>')


def unit_html(u, taj, extra):
    name = UNITS[u][0]
    parts = [f'<section class="unit"><div class="uhead"><span class="t">{name}</span><span class="line"></span>'
             f'<span class="c">{len(taj) + len(extra)} سؤال</span></div>',
             f'<div class="sechead">تجميعات {name}</div>']
    parts += [q_html(i + 1, q) for i, q in enumerate(taj + extra)]
    parts.append('</section>')
    return ''.join(parts)


def render_pdfs(htmls):
    """يطبع كل HTML لـPDF (بنفس إعدادات الصفحة) ويرجّع عدد صفحات كل واحد."""
    import pymupdf
    tmp = tempfile.mkdtemp()
    for i, h in enumerate(htmls):
        Path(tmp, f'{i}.html').write_text(h, encoding='utf-8')
    js = f"""const {{ chromium }} = require('playwright');
(async () => {{ const b = await chromium.launch(); const p = await b.newPage();
  for (let i = 0; i < {len(htmls)}; i++) {{
    await p.goto('file://{tmp}/' + i + '.html'); await p.evaluate(() => document.fonts.ready);
    await p.pdf({{ path: '{tmp}/' + i + '.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true }});
  }} await b.close(); }})();"""
    Path(tmp, 'r.js').write_text(js)
    env = dict(os.environ, NODE_PATH=subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip())
    subprocess.run(['node', f'{tmp}/r.js'], check=True, env=env)
    return [len(pymupdf.open(f'{tmp}/{i}.pdf')) for i in range(len(htmls))]


def fill_counts(loaded):
    """لكل وحدة: أكبر عدد من أسئلة الاحتياط يعبّي آخر صفحة بدون ما يفتح صفحة جديدة."""
    head = f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{font_face()}{CSS}</style></head><body><main>'
    jobs, keys = [], []
    for u, taj, extra, res in loaded:
        for k in range(len(res) + 1):
            jobs.append(head + unit_html(u, taj, extra + res[:k]) + '</main></body></html>')
            keys.append((u, k))
    pages = render_pdfs(jobs) if jobs else []
    base = {u: p for (u, k), p in zip(keys, pages) if k == 0}
    best = {u: 0 for u, *_ in loaded}
    for (u, k), p in zip(keys, pages):
        if p == base[u]:
            best[u] = max(best[u], k)
    return best


def build(out, site):
    units, total_t, total_x = [], 0, 0
    loaded = []
    for u in UNITS:
        f = SRC / f'u{u:02d}.txt'
        if not f.exists():
            print('تنبيه: ما فيه ملف', f.name)
            continue
        loaded.append((u, *parse(f)))
    fill = fill_counts(loaded)
    for u, taj, extra, res in loaded:
        extra = extra + res[:fill[u]]
        units.append((u, taj, extra))
        total_t += len(taj)
        total_x += len(extra)
    print('أسئلة الاحتياط المستخدمة:', {u: f'{fill[u]}/{len(r)}' for u, _, _, r in loaded})
    total = total_t + total_x
    logo = base64.b64encode(LOGO.read_bytes()).decode()
    cover = f"""<section class="cover">
  <div class="subj">سلم 100 • دراسات في السيرة النبوية</div>
  <h1>تجميعات</h1>
  <div class="rule"></div>
  <div class="pill">{total} سؤال • 12 وحدة • 3 خيارات مع الحل</div>
  <div class="cbox">
    <div class="big">هذه الأسئلة <em>تجميعات</em>: أسئلة جاءت في <em>اختبارات سابقة</em></div>
    <p>مقسّمة حسب الوحدات، وفي آخر كل وحدة <em>أسئلة إضافية</em> من ملازم عدل</p>
  </div>
  <div class="cbox">
    <div class="big">يوجد <em>تدريبات</em> على جميع الوحدات في <em>موقعنا</em></div>
    <p>أسئلة كتبناها لك لتتدرّب عليها، مع تصحيح فوري</p>
    <a class="site" href="{site}">ادخل موقع التدريبات<span class="u">{esc(site.replace('https://', ''))}</span></a>
    <span class="tap">اضغط على الزر ويدخلك الموقع مباشرة · الموقع خاص بالمشتركين</span>
  </div>
  <div class="spaced">خــاص لــمــشــتــركــيــن مــلازم عـــدل</div>
  <div class="nopub">لا نحلل ولا نبيح نشرها</div>
</section>"""
    body = [unit_html(u, taj, extra) for u, taj, extra in units]
    doc = (f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تجميعات سلم 100</title>'
           f'<style>{font_face()}{CSS}</style></head><body><div class="wm"><img src="data:image/png;base64,{logo}"></div>'
           f'<main>{cover}{"".join(body)}</main></body></html>')
    foot = ("<div dir='rtl' style='-webkit-print-color-adjust:exact;width:100%;margin:0 12mm 5mm;font-family:Tajawal;font-weight:800'>"
            "<div style='text-align:center;font-size:7pt;color:#CC6E53;margin-bottom:1.6mm'>لا نحلل ولا نبيح نشرها</div>"
            "<div style='display:flex;justify-content:space-between;align-items:center;color:#3A2317'>"
            "<span style='font-size:11pt;font-weight:900'>تجميعات سلم 100</span>"
            "<span style='font-size:9pt'>~<span class='pageNumber'></span>~</span>"
            "<span style='font-size:11pt;font-weight:900;letter-spacing:.6mm'>خاص لمشتركين ملازم عدل</span></div></div>")
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as fh:
        fh.write(doc)
        src = fh.name
    out = os.path.abspath(out)
    js = f"""const {{ chromium }} = require('playwright');
(async () => {{ const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://{src}'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.pdf({{ path: {out!r}, format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: {foot!r} }}); await b.close(); }})();"""
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as fh:
        fh.write(js)
        jsf = fh.name
    env = dict(os.environ, NODE_PATH=subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip())
    subprocess.run(['node', jsf], check=True, env=env)
    os.unlink(src)
    os.unlink(jsf)
    # خلفية كريمية للصفحة كاملة (Chrome ما يلوّن الهوامش) + الغلاف بدون تذييل
    import pymupdf
    CREAM = (248 / 255, 239 / 255, 232 / 255)
    src_doc = pymupdf.open(out)
    d = pymupdf.open()
    for i, sp in enumerate(src_doc):
        r = sp.rect
        np_ = d.new_page(width=r.width, height=r.height)
        np_.draw_rect(r, color=None, fill=CREAM)
        np_.show_pdf_page(r, src_doc, i)
        if i == 0:
            np_.draw_rect(pymupdf.Rect(0, r.height - 22 * 72 / 25.4, r.width, r.height), color=None, fill=CREAM)
        for ln in sp.get_links():
            if ln.get('uri'):
                np_.insert_link({'kind': pymupdf.LINK_URI, 'from': ln['from'], 'uri': ln['uri']})
    d.set_metadata({'title': 'تجميعات سلم 100 — دراسات في السيرة النبوية', 'author': 'ملازم عدل'})
    d.save(out + '.tmp', garbage=3, deflate=True)
    os.replace(out + '.tmp', out)
    print(f'PDF: {out} — {len(units)} وحدة، تجميعات {total_t} + إضافية {total_x} = {total}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--site', default=SITE)
    a = ap.parse_args()
    build(a.out, a.site)
