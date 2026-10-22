#!/usr/bin/env python3
"""يبني قسم «احفظ معاني الكلمات» (الكلمة بالإنجليزي ← معناها بالعربي، 4 خيارات) لموقعي الإنجليزي.

  python3 tools/english/build_meanings.py            # يبني الموقعين
  python3 tools/english/build_meanings.py english    # موقع واحد

المصادر:
  - ترتيب الكلمات = قائمة الموقع نفسها (store/<site>/vocabulary-list.txt)
  - المعنى + الجملة + الترجمة = بطاقات دليل الميد (tools/english/vocab_cards*.txt)
الخيارات الغلط ثابتة (مولّدة بترتيب ثابت)، ومن نفس نوع الكلمة قدر الإمكان، وما تشارك الجواب الصح في أي كلمة عربية
(عشان ما يصير خيار غلط معناه نفس الجواب). الناتج: sites/<site>/meanings.js
"""
import json, os, random, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITES = {
    'english': ('store/english/vocabulary-list.txt', 'tools/english/vocab_cards.txt'),
    'english-tracks': ('store/english-tracks/vocabulary-list.txt', 'tools/english/vocab_cards_medical.txt'),
}
KIND = {'Adjective': 'adj', 'Adjective/Adverb': 'adj', 'Adverb': 'adv', 'Noun': 'n', 'Noun Phrase': 'n',
        'Verb': 'v', 'Verb Phrase': 'v', 'Phrasal Verb': 'v', 'Collocation (Verb & Noun)': 'v',
        'Preposition': 'p', 'Prepositional Phrase': 'p', 'Phrase': 'p'}
TYPE_EN = {'n': 'noun', 'v': 'verb', 'adj': 'adjective', 'adv': 'adverb', 'p': 'phrase'}
# استبعاد يدوي: الكلمة (بالحروف الصغيرة) ← معاني ممنوع تطلع لها كخيار غلط (مترادفات ما يكشفها الفحص الآلي)
AVOID = {
    'be interested in': ('مهتم بـ',), 'interested in': ('يهتم بـ',),
    'on': ('فوق / أعلى',), 'bright': ('ذكي',),
    'complicated': ('صعب',), 'difficult': ('مُعقَّد',), 'tough': ('مُعقَّد',),
    'produce': ('يزرع / ينمو',),
}
DIAC = re.compile('[ً-ْـ]')


def tokens(meaning):
    t = DIAC.sub('', meaning)
    t = re.sub('[أإآ]', 'ا', t).replace('ة', 'ه').replace('ى', 'ي')
    out = set()
    for w in re.findall('[ء-ي]+', t):
        if w.startswith('ال') and len(w) > 4: w = w[2:]
        if len(w) >= 3: out.add(w)
    return out


def norm(w):
    return re.sub(r'\s+', ' ', w.strip().lower()).replace('aerobics', 'aerobic')


def load_cards(path):
    cards = []
    for l in open(os.path.join(ROOT, path), encoding='utf-8'):
        if not l.strip() or l.startswith('#'): continue
        w, typ, mean, sent, tr = [x.strip() for x in l.split('|')]
        cards.append({'w': w, 'k': KIND[typ], 'm': mean, 's': sent.replace('**', ''), 'tr': tr})
    return cards


def build(site):
    list_path, cards_path = SITES[site]
    words = [l.split('|')[0].strip() for l in open(os.path.join(ROOT, list_path), encoding='utf-8') if l.strip() and not l.startswith('#')]
    cards = load_cards(cards_path)
    pool = {}
    for c in cards: pool.setdefault(norm(c['w']), []).append(c)
    used = {}
    items = []
    for w in words:
        k = norm(w); i = used.get(k, 0); used[k] = i + 1
        assert k in pool and i < len(pool[k]), f'{site}: الكلمة «{w}» ما لها بطاقة'
        c = pool[k][i]
        if c['w'].lower() != w.lower(): w = c['w']   # إملاء البطاقة أصح (Do aerobic ← Do aerobics)
        items.append(dict(c, w=w, dup=len(pool[k]) > 1))
    assert len(items) == len(cards), (site, len(items), len(cards))
    out = []
    for it in items:
        rnd = random.Random(f'{site}|{it["w"]}|{it["k"]}')
        mine = tokens(it['m'])
        def ok(c, chosen):
            return (norm(c['w']) != norm(it['w']) and c['m'] != it['m'] and not (tokens(c['m']) & mine)
                    and c['m'] not in AVOID.get(norm(it['w']), ())
                    and all(not (tokens(c['m']) & tokens(x)) and c['m'] != x for x in chosen))
        same = [c for c in items if c['k'] == it['k']]; other = [c for c in items if c['k'] != it['k']]
        rnd.shuffle(same); rnd.shuffle(other)
        chosen = []
        for c in same + other:
            if len(chosen) == 3: break
            if ok(c, chosen): chosen.append(c['m'])
        assert len(chosen) == 3, it['w']
        q = it['w'] + (f' ({TYPE_EN[it["k"]]})' if it['dup'] else '')
        out.append({'w': q, 'o': [it['m']] + chosen, 'e': f'«{it["s"]}» = {it["tr"]}'})
    dst = os.path.join(ROOT, 'sites', site, 'meanings.js')
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(f'/* «احفظ معاني الكلمات» — ملف مولّد بالسكربت tools/english/build_meanings.py (لا تعدّله يدوياً)\n'
                '   o[0] = المعنى الصحيح (الخيارات تنخلط في الموقع) */\n')
        f.write('window.MEANINGS = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
    print(f'{site}/meanings.js: {len(out)} كلمة')


if __name__ == '__main__':
    for s in (sys.argv[1:] or SITES):
        build(s)
