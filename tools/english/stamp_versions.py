#!/usr/bin/env python3
"""يحط رقم نسخة (?v=بصمة الملف) على ملفات البيانات في index.html لموقعي الإنجليزي،
عشان المتصفح ما يستخدم نسخة قديمة مخزّنة بعد أي تحديث. شغّله بعد build_data / build_listening / build_meanings.
  python3 tools/english/stamp_versions.py
"""
import hashlib, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for site in ('english', 'english-tracks'):
    d = os.path.join(ROOT, 'sites', site); p = os.path.join(d, 'index.html')
    t = open(p, encoding='utf-8').read()
    def rep(m):
        name = m.group(1); h = hashlib.sha1(open(os.path.join(d, name), 'rb').read()).hexdigest()[:10]
        return f'<script src="{name}?v={h}"></script>'
    t2 = re.sub(r'<script src="([a-z]+\.js)(?:\?v=[0-9a-f]+)?"></script>', rep, t)
    open(p, 'w', encoding='utf-8').write(t2); print(site, 'stamped' if t2 != t else 'unchanged')
