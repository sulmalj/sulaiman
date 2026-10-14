"""يبني قسم الاستماع لموقع الإنجليزي من tools/english/listening.txt
- يولّد الصوت بـ Kokoro TTS  ← sites/english/audio/Lxx.mp3
- يكتب البيانات (النص + الأسئلة)  ← sites/english/listening.js

التشغيل (يحتاج kokoro-onnx و soundfile و ffmpeg، وملفي الموديل):
  python build_listening.py --model kokoro.onnx --voices voices.bin [--only 3,7] [--check]
--check: يتأكد من صيغة الملف والأسئلة فقط بدون توليد صوت.
مقطع ما تغيّر نصه ما ينعاد توليده (البصمة في audio/.hashes.json).
"""
import argparse, hashlib, json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NAME = os.path.basename(os.path.dirname(os.path.abspath(__file__)))   # english أو english-final
SRC = os.path.join(ROOT, 'tools', NAME, 'listening.txt')
SITE = os.path.join(ROOT, 'sites', NAME)
AUDIO = os.path.join(SITE, 'audio')
SPEED = 1.1          # سرعة الكلام (طلب المستخدم: أسرع شوي)
TURN_GAP = 0.55      # سكتة بين المتحدثين
SAME_GAP = 0.45      # سكتة بين جمل نفس المتحدث


def parse(path):
    clips, cur, q = [], None, None
    for n, raw in enumerate(open(path, encoding='utf-8'), 1):
        line = raw.strip()
        if not line or line.startswith('# '):
            continue
        err = lambda m: sys.exit(f'listening.txt:{n}: {m}')
        if line.startswith('## '):
            num, title, kind = [x.strip() for x in line[3:].split('|')]
            if kind not in ('dialogue', 'monologue'):
                err('النوع لازم dialogue أو monologue')
            cur = {'n': int(num), 'title': title, 'kind': kind, 'voices': {}, 'lines': [], 'qs': []}
            clips.append(cur); q = None
        elif line.startswith('@ '):
            for pair in line[2:].split():
                name, voice = pair.split('=')
                cur['voices'][name] = voice
        elif line.startswith('?? '):
            q = {'q': line[3:].strip(), 'o': []}; cur['qs'].append(q)
        elif line.startswith('* '):
            if q['o']:
                err('الإجابة الصحيحة (*) لازم تكون أول خيار')
            q['o'].append(line[2:].strip())
        elif line.startswith('- '):
            if not q['o']:
                err('خيار خطأ قبل الإجابة الصحيحة')
            q['o'].append(line[2:].strip())
        else:
            m = re.match(r'^([A-Za-z]+):\s+(.+)$', line)
            if not m or m.group(1) not in cur['voices']:
                err(f'سطر غير مفهوم أو متحدث بدون صوت: {line[:40]}')
            if cur['qs']:
                err('كلام بعد ما بدأت الأسئلة')
            cur['lines'].append([m.group(1), m.group(2)])
    for c in clips:
        if len(c['qs']) != 10:
            sys.exit(f'المقطع {c["n"]}: عدد الأسئلة {len(c["qs"])} (لازم 10)')
        for qq in c['qs']:
            if len(qq['o']) != 4 or len(set(o.lower() for o in qq['o'])) != 4:
                sys.exit(f'المقطع {c["n"]}: السؤال «{qq["q"]}» لازم 4 خيارات مختلفة')
    nums = [c['n'] for c in clips]
    if nums != list(range(1, len(clips) + 1)):
        sys.exit(f'أرقام المقاطع مو متسلسلة: {nums}')
    return clips


def clip_hash(c):
    return hashlib.sha1(json.dumps([c['voices'], c['lines'], SPEED, TURN_GAP, SAME_GAP]).encode()).hexdigest()[:12]


def synth(c, kokoro, out_mp3):
    import numpy as np, soundfile as sf
    parts, sr, prev = [], 24000, None
    for who, text in c['lines']:
        if prev is not None:
            parts.append(np.zeros(int(sr * (SAME_GAP if who == prev else TURN_GAP)), dtype='float32'))
        a, sr = kokoro.create(text, voice=c['voices'][who], speed=SPEED, lang='en-us')
        parts.append(a.astype('float32')); prev = who
    audio = np.concatenate([np.zeros(int(sr * 0.3), dtype='float32')] + parts + [np.zeros(int(sr * 0.5), dtype='float32')])
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
        sf.write(t.name, audio, sr)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', t.name, '-ac', '1', '-b:a', '48k', out_mp3], check=True)
    os.unlink(t.name)
    return round(len(audio) / sr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model'); ap.add_argument('--voices')
    ap.add_argument('--only', default='')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    clips = parse(SRC)
    print(f'{len(clips)} مقطع · {sum(len(c["qs"]) for c in clips)} سؤال')
    if a.check:
        for c in clips:
            words = sum(len(t.split()) for _, t in c['lines'])
            print(f'  {c["n"]:2} {c["kind"]:9} {words:3} كلمة  {c["title"]}')
        return
    os.makedirs(AUDIO, exist_ok=True)
    hp = os.path.join(AUDIO, '.hashes.json')
    hashes = json.load(open(hp)) if os.path.exists(hp) else {}
    only = {int(x) for x in a.only.split(',') if x}
    kokoro = None
    for c in clips:
        name = f'L{c["n"]:02}.mp3'; out = os.path.join(AUDIO, name)
        h = clip_hash(c)
        entry = hashes.get(name)
        if os.path.exists(out) and entry and entry['h'] == h and c['n'] not in only:
            c['dur'] = entry['dur']; continue
        if kokoro is None:
            from kokoro_onnx import Kokoro
            kokoro = Kokoro(a.model, a.voices)
        c['dur'] = synth(c, kokoro, out)
        hashes[name] = {'h': h, 'dur': c['dur']}
        print(f'  ✓ {name}  {c["dur"] // 60}:{c["dur"] % 60:02}  {c["title"]}')
    json.dump(hashes, open(hp, 'w'), indent=1)
    data = [{'n': c['n'], 'title': c['title'], 'kind': c['kind'], 'audio': f'audio/L{c["n"]:02}.mp3',
             'dur': c['dur'], 'lines': c['lines'], 'qs': c['qs']} for c in clips]
    with open(os.path.join(SITE, 'listening.js'), 'w', encoding='utf-8') as f:
        f.write('/* قسم الاستماع — ملف مولّد من tools/english/listening.txt بالسكربت build_listening.py (لا تعدّله يدوياً)\n'
                '   qs[].o[0] = الإجابة الصحيحة (الخيارات تنخلط في الموقع) */\n')
        f.write('window.LISTENING = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')


if __name__ == '__main__':
    main()
