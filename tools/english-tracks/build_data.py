"""يبني ملفات بيانات موقع الإنجليزي من ملفات tools/english/*.txt:
  vocabulary.txt ← sites/english/vocab.js
  grammar.txt    ← sites/english/grammar.js   (إذا موجود)
  reading.txt    ← sites/english/reading.js   (إذا موجود)
(الاستماع له سكربت خاص: build_listening.py لأنه يولّد صوت)
التشغيل: python3 tools/english/build_data.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
NAME = os.path.basename(HERE)   # english (الميد) أو english-tracks (جميع المسارات باستثناء الإنساني): نفس السكربت، كل مجلد يبني موقعه
SITE = os.path.join(ROOT, 'sites', NAME)


def rows(name):
    p = os.path.join(HERE, name)
    if not os.path.exists(p):
        return None
    return [(n, l.rstrip('\n')) for n, l in enumerate(open(p, encoding='utf-8'), 1)
            if l.strip() and not l.startswith('# ')]


def opts(s, where):
    o = [x.strip() for x in s.split('|')]
    if len(o) != 4 or len({x.lower() for x in o}) != 4:
        sys.exit(f'{where}: لازم 4 خيارات مختلفة')
    return o


def write(name, var, data, note):
    with open(os.path.join(SITE, name), 'w', encoding='utf-8') as f:
        f.write(f'/* {note} — ملف مولّد بالسكربت tools/english/build_data.py (لا تعدّله يدوياً)\n'
                '   o[0] = الإجابة الصحيحة (الخيارات تنخلط في الموقع) */\n')
        f.write(f'window.{var} = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
    print(f'{name}: {sum(len(x["qs"]) for x in data) if data and "qs" in data[0] else len(data)} سؤال')


def vocab():
    if rows('vocabulary.txt') is None:   # الكلمات لسا ما وصلت (موقع جديد)
        write('vocab.js', 'VOCAB', [], 'أسئلة الكلمات (Vocabulary)'); return
    words = [l.split(' | ')[0].strip() for l in open(os.path.join(ROOT, 'store', NAME, 'vocabulary-list.txt'), encoding='utf-8')
             if l.strip() and not l.startswith('# ')]
    out = []
    for n, l in rows('vocabulary.txt'):
        parts = [x.strip() for x in l.split(' || ')]
        if len(parts) not in (3, 4):
            sys.exit(f'vocabulary.txt:{n}: لازم: الكلمة || الجملة || الخيارات [|| تنويه]')
        w, q, o = parts[:3]
        if '.....' not in q:
            sys.exit(f'vocabulary.txt:{n}: الجملة بدون فراغ .....')
        item = {'w': w, 'q': q, 'o': opts(o, f'vocabulary.txt:{n}')}
        if len(parts) == 4:   # تنويه يطلع بعد الإجابة (مثل الكلمة اللي لها معنيين)
            item['e'] = parts[3]
        out.append(item)
    missing = [w for w in words if w not in {x['w'] for x in out}]
    if missing:
        sys.exit(f'كلمات بدون سؤال: {missing}')
    write('vocab.js', 'VOCAB', out, 'أسئلة الكلمات (Vocabulary) — سؤال لكل كلمة من القائمة')


def grammar():
    """grammar.txt:  ## اسم القاعدة   ثم أسطر:  السؤال || صحيح | خطأ | خطأ | خطأ || الشرح"""
    r = rows('grammar.txt')
    out = []
    for n, l in r or []:
        if l.startswith('## '):
            out.append({'rule': l[3:].strip(), 'qs': []})
        else:
            parts = [x.strip() for x in l.split(' || ')]
            if len(parts) != 3 or not parts[2]:
                sys.exit(f'grammar.txt:{n}: لازم: السؤال || الخيارات || الشرح')
            q, o, e = parts
            out[-1]['qs'].append({'q': q, 'o': opts(o, f'grammar.txt:{n}'), 'e': e})
    write('grammar.js', 'GRAMMAR', out, 'أسئلة القواعد (Grammar) مقسمة حسب القاعدة')


def reading():
    """reading.txt:  ## رقم | العنوان   ثم النص (فقرات)   ثم  ?? سؤال  * صحيح  - خطأ ×3  !! الشرح"""
    r = rows('reading.txt')
    out, q = [], None
    for n, l in r or []:
        if l.startswith('## '):
            num, title = [x.strip() for x in l[3:].split('|')]
            out.append({'n': int(num), 'title': title, 'text': [], 'qs': []}); q = None
        elif l.startswith('?? '):
            q = {'q': l[3:].strip(), 'o': []}; out[-1]['qs'].append(q)
        elif l.startswith('* ') or l.startswith('- '):
            q['o'].append(l[2:].strip())
        elif l.startswith('!! '):
            q['e'] = l[3:].strip()
        else:
            out[-1]['text'].append(l.strip())
    import re
    for p in out:
        if len(p['qs']) != 10:
            sys.exit(f'القطعة {p["n"]}: عدد الأسئلة {len(p["qs"])} (لازم 10)')
        for qq in p['qs']:
            opts(' | '.join(qq['o']), f'reading.txt القطعة {p["n"]}')
            if not qq.get('e'):
                sys.exit(f'القطعة {p["n"]}: السؤال «{qq["q"]}» بدون شرح (!!)')
            m = re.search(r'underlined words? "([^"]+)" in paragraph (\d)', qq['q'])
            if m:   # الكلمة اللي تحتها خط لازم تكون معلّمة _كذا_ في نفس الفقرة
                para = next((t for t in p['text'] if t.startswith(m.group(2) + '.')), '')
                if f'_{m.group(1)}_' not in para:
                    sys.exit(f'القطعة {p["n"]}: «{m.group(1)}» مو معلّمة بخط في الفقرة {m.group(2)}')
    nums = [p['n'] for p in out]
    if nums != list(range(1, len(out) + 1)):
        sys.exit(f'أرقام القطع مو متسلسلة: {nums}')
    write('reading.js', 'READING', out, 'القطع (Reading) — كل قطعة مع أسئلتها')


if __name__ == '__main__':
    vocab(); grammar(); reading()
