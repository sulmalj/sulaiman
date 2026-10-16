#!/usr/bin/env python3
"""يبني موقعي تدريب عرب 100 من المصادر:
     sites/arab100-mid    (جزئية الميد: الدروس 1–8)
     sites/arab100-final  (جزئية الفاينل: الكتاب كامل 1–12)
   المصادر في tools/arab100/site/: questions/ cards/ proof.js common_errors.json
   template.html style.css app.js paragraph.js edge-correct.js
   الاستخدام:  python3 tools/arab100/site/build_site.py
"""
import json, re, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EXACT = ROOT / 'store/arab100/book/exact'

PARTS = {
    'mid': dict(out='sites/arab100-mid', title='جزئية الميد', hero='استعد لاختبار الميد في عرب 100',
                site=dict(key='arab100-mid-v1', lessons=list(range(1, 9)), examLessons=[1, 2, 3, 4, 5, 6, 8],
                          examN=20, examMin=15, examName='محاكاة الميد', examScope='دروس جزئية الميد')),
    'final': dict(out='sites/arab100-final', title='جزئية الفاينل', hero='استعد لاختبار الفاينل في عرب 100',
                  site=dict(key='arab100-final-v1', lessons=list(range(1, 13)), examLessons=[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
                            examN=30, examMin=25, examName='محاكاة الفاينل', examScope='كل دروس الكتاب')),
}

LOADER = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const out = { questions: [], cards: [], proof: [] };
const ctx = {
  M: (s, q, o, x) => out.questions.push({ s, t: 'mc', q, o, x: x || '' }),
  T: (s, q, x) => out.questions.push({ s, t: 'tf', q, a: true, x: x || '' }),
  F: (s, q, c, x) => out.questions.push({ s, t: 'tf', q, a: false, c, x: x || '' }),
  C: (s, t, l, e, x) => out.cards.push({ s, t, l, e: e || [], x: x || '' }),
  PR: (title, text) => out.proof.push({ title, text })
};
vm.createContext(ctx);
const dir = process.argv[1];
for (const sub of ['questions', 'cards']) {
  const d = path.join(dir, sub);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(f => f.endsWith('.js')).sort()) {
    try { vm.runInContext(fs.readFileSync(path.join(d, f), 'utf8'), ctx, { filename: sub + '/' + f }); }
    catch (e) { console.error('ERROR in ' + sub + '/' + f + ': ' + e.message); process.exit(1); }
  }
}
const pf = path.join(dir, 'proof.js');
if (fs.existsSync(pf)) vm.runInContext(fs.readFileSync(pf, 'utf8'), ctx, { filename: 'proof.js' });
process.stdout.write(JSON.stringify(out));
"""


def load():
    r = subprocess.run(['node', '-e', LOADER, str(HERE)], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr)
    return json.loads(r.stdout)


def validate(d):
    errs = []
    seen = set()
    for q in d['questions']:
        tag = f"[س {q['s']}] {q['q'][:50]}"
        if not isinstance(q['s'], int) or not 1 <= q['s'] <= 12: errs.append('رقم درس غلط: ' + tag)
        if q['t'] == 'mc':
            o = q['o']
            if not (3 <= len(o) <= 5): errs.append('عدد الخيارات: ' + tag)
            if len(set(o)) != len(o): errs.append('خيارات مكررة: ' + tag)
        if q['t'] == 'tf' and not q['a'] and not q.get('c'): errs.append('خطأ بدون تصحيح: ' + tag)
        if not q.get('x', '').strip(): errs.append('سؤال بدون شرح: ' + tag)
        key = (q['s'], q['q'], tuple(q.get('o') or []))
        if key in seen: errs.append('سؤال مكرر: ' + tag)
        seen.add(key)
    for c in d['cards']:
        if not c['l']: errs.append(f"بطاقة فاضية: {c['s']} {c['t']}")
    mk = re.compile(r'\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]')
    for p in d['proof']:
        ms = mk.findall(p['text'])
        if not ms: errs.append('فقرة بدون أخطاء: ' + p['title'])
        if re.search(r'\[\[|\]\]', mk.sub('', p['text'])): errs.append('علامة ناقصة: ' + p['title'])
        for w, r, _ in ms:
            if w == r or ' ' in w or ' ' in r: errs.append(f"علامة غلط في {p['title']}: {w}|{r}")
    if errs:
        sys.exit('\n'.join(errs))


def book_text():
    parts = []
    for n, name in (('07', 'درس كتابة الفقرة'), ('06', 'درس علامات الترقيم'), ('08', 'درس الأخطاء الشائعة')):
        f = next(EXACT.glob(n + '-*.txt'))
        lines = [l for l in f.read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#') and not re.fullmatch(r'\[ص\d+\]', l.strip())]
        parts.append(f'=== {name} ===\n' + '\n'.join(lines))
    return '\n\n'.join(parts)


def build(part, d):
    P = PARTS[part]
    out = ROOT / P['out']
    if out.exists():
        shutil.rmtree(out)
    (out / 'netlify/edge-functions').mkdir(parents=True)
    les = set(P['site']['lessons'])
    data = {k: [x for x in d[k] if x.get('s', 1) in les] for k in ('questions', 'cards')}
    data['proof'] = d['proof']
    (out / 'data.js').write_text('/* بيانات مولّدة من tools/arab100/site/build_site.py — لا تعدّلها يدوياً */\nwindow.DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    html = (HERE / 'template.html').read_text(encoding='utf-8')
    html = (html.replace('__PART_TITLE__', P['title']).replace('__HERO__', P['hero'])
                .replace('__EXAM_NAME__', P['site']['examName'])
                .replace('__SITE__', json.dumps(P['site'], ensure_ascii=False)))
    assert '__' not in re.sub(r'<script src[^>]*>', '', html).replace('__proto__', ''), 'placeholder left'
    (out / 'index.html').write_text(html, encoding='utf-8')
    for f in ('style.css', 'app.js', 'paragraph.js'):
        shutil.copy(HERE / f, out / f)
    shutil.copy(ROOT / 'tools/statistics/logo-adl.png', out / 'logo.png')
    edge = (HERE / 'edge-correct.js').read_text(encoding='utf-8').replace('__BOOK__', json.dumps(book_text(), ensure_ascii=False))
    (out / 'netlify/edge-functions/correct.js').write_text(edge, encoding='utf-8')
    (out / 'netlify.toml').write_text('[build]\n  publish = "."\n  edge_functions = "netlify/edge-functions"\n', encoding='utf-8')
    counts = {k: len(v) for k, v in data.items()}
    print(f"{P['out']}: {counts}")


def main():
    d = load()
    validate(d)
    per = {}
    for q in d['questions']: per[q['s']] = per.get(q['s'], 0) + 1
    print('أسئلة لكل درس:', dict(sorted(per.items())))
    for part in PARTS:
        build(part, d)


if __name__ == '__main__':
    main()
