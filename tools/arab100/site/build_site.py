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
                          examN=30, examMin=50, examName='محاكاة الميد', examScope='دروس جزئية الميد', pastLabel='جاء في ميد سابق',
                          # (طلب المستخدم 2026-10-27) المحاكاة بنفس طريقة اختبار الميد: س1 جمل بأربع صور كتابية + س2 أجب حسب المطلوب
                          examPlan=[dict(k='e', n=15, title='السؤال الأول: ظلّل دائرة الإجابة الصحيحة'),
                                    dict(k='wr', n=15, title='السؤال الثاني: أجب حسب المطلوب')])),
    'final': dict(out='sites/arab100-final', title='جزئية الفاينل', hero='استعد لاختبار الفاينل في عرب 100',
                  site=dict(key='arab100-final-v1', lessons=list(range(1, 13)), examLessons=[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
                            examN=40, examMin=50, examName='محاكاة الفاينل', examScope='كل دروس الكتاب',
                            pastLabel='جاء في اختبار سابق')),
}

LOADER = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const out = { questions: [], cards: [], proof: [], examples: [], fix: [] };
const ctx = {
  // الحقل الأخير الاختياري f: PAST (جاء في ميد سابق) / EXAM (بطريقة س1 في الاختبار: جملة بأربع صور كتابية) / PAST_EXAM
  PAST: { p: 1 }, EXAM: { e: 1 }, PAST_EXAM: { p: 1, e: 1 },
  M: (s, q, o, x, f) => out.questions.push(Object.assign({ s, t: 'mc', q, o, x: x || '' }, f || {})),
  T: (s, q, x, f) => out.questions.push(Object.assign({ s, t: 'tf', q, a: true, x: x || '' }, f || {})),
  F: (s, q, c, x, f) => out.questions.push(Object.assign({ s, t: 'tf', q, a: false, c, x: x || '' }, f || {})),
  // أجب حسب المطلوب (س2 في الاختبار): المطلوب، الجملة (__كلمة__ = تحتها خط)، الإجابات المقبولة (الأولى تنعرض)، الشرح
  W: (s, q, sent, ans, x, f) => out.questions.push(Object.assign({ s, t: 'wr', q, sent, ans, x: x || '' }, f || {})),
  C: (s, t, l, e, x) => out.cards.push({ s, t, l, e: e || [], x: x || '' }),
  PR: (title, text) => out.proof.push({ title, text }),
  EX: (s, q, chk, ex, x) => out.examples.push({ s, q, chk, ex: ex || [], x: x || '' }),
  FX: (part, topic, title, text, qs, add) => out.fix.push({ part, topic, title, text, qs: (qs || []).map(([q, o, x]) => ({ q, o, x })), add: add || '' })
};
vm.createContext(ctx);
const dir = process.argv[1];
for (const sub of ['questions', 'cards', 'examples', 'fix']) {
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
        if q['t'] == 'wr':
            a = q.get('ans')
            if not isinstance(q.get('sent'), str) or not q['sent'].strip(): errs.append('أجب حسب المطلوب بدون جملة: ' + tag)
            if not isinstance(a, list) or not a or not all(isinstance(v, str) and v.strip() for v in a): errs.append('أجب حسب المطلوب بدون إجابات: ' + tag)
        if q.get('e') and q['t'] != 'mc': errs.append('EXAM لأسئلة الاختيار بس: ' + tag)
        if not q.get('x', '').strip(): errs.append('سؤال بدون شرح: ' + tag)
        key = (q['s'], q['q'], q.get('sent', ''), tuple(q.get('o') or []))
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
    for e in d['examples']:
        if not e['x'].strip(): errs.append(f"مثال بدون توضيح: {e['q'][:40]}")
        if not isinstance(e['chk'], dict) or 't' not in e['chk']: errs.append(f"مثال بدون فاحص: {e['q'][:40]}")
    slot = re.compile(r'\{\{([^|}]*)\|([^|}]*)\|([^}]*)\}\}')
    for f in d['fix']:
        if f['part'] not in ('mid', 'final'): errs.append('صحح الفقرة: part غلط: ' + f['title'])
        if f['topic'] not in ('t1', 't2'): errs.append('صحح الفقرة: topic غلط: ' + f['title'])
        for c, g, why in slot.findall(f['text']):
            if c.strip() not in '،؛.:؟!-' or g.strip() not in '،؛.:؟!-' or len(c.strip()) != 1 or len(g.strip()) != 1 or not why.strip():
                errs.append(f"صحح الفقرة: خانة غلط في {f['title']}: {c}|{g}")
        for w, r, _ in mk.findall(f['text']):
            if w == r: errs.append(f"صحح الفقرة: خطأ = صواب في {f['title']}: {w}")
        rest = mk.sub('', slot.sub('', f['text']))
        if re.search(r'\{\{|\}\}|\[\[|\]\]', rest): errs.append('صحح الفقرة: علامة ناقصة: ' + f['title'])
        for q in f['qs']:
            if len(q['o']) < 3 or len(set(q['o'])) != len(q['o']) or not q['x'].strip(): errs.append(f"صحح الفقرة: سؤال بناء ناقص في {f['title']}: {q['q'][:30]}")
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
    data = {k: [x for x in d[k] if x.get('s', 1) in les] for k in ('questions', 'cards', 'examples')}
    data['fix'] = [f for f in d['fix'] if f['part'] == 'mid' or part == 'final']
    data['proof'] = d['proof']
    (out / 'data.js').write_text('/* بيانات مولّدة من tools/arab100/site/build_site.py — لا تعدّلها يدوياً */\nwindow.DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    html = (HERE / 'template.html').read_text(encoding='utf-8')
    html = (html.replace('__PART_TITLE__', P['title']).replace('__HERO__', P['hero'])
                .replace('__EXAM_NAME__', P['site']['examName'])
                .replace('__SITE__', json.dumps(P['site'], ensure_ascii=False)))
    assert '__' not in re.sub(r'<script src[^>]*>', '', html).replace('__proto__', ''), 'placeholder left'
    (out / 'index.html').write_text(html, encoding='utf-8')
    for f in ('style.css', 'app.js', 'paragraph.js', 'fix.js'):
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
