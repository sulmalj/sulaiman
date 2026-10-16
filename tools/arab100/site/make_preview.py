#!/usr/bin/env python3
"""يحوّل موقع مبني (sites/arab100-mid أو sites/arab100-final) إلى صفحة واحدة للمعاينة في Artifact
   (كل الملفات داخل الصفحة). التصحيح بالذكاء الاصطناعي ما يشتغل في المعاينة — يشتغل الفحص الآلي.
   الاستخدام: python3 tools/arab100/site/make_preview.py sites/arab100-mid OUT.html "عرب 100 ميد" """
import base64, re, sys
from pathlib import Path

src, out, title = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
html = (src / 'index.html').read_text(encoding='utf-8')
logo = 'data:image/png;base64,' + base64.b64encode((src / 'logo.png').read_bytes()).decode()
head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', head).group(1)
css = (src / 'style.css').read_text(encoding='utf-8')
css += '\n.top{top:env(safe-area-inset-top,0px)}\nbody::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}\n'
body = body.replace('src="logo.png"', f'src="{logo}"')
for f in ('data.js', 'app.js', 'paragraph.js'):
    js = (src / f).read_text(encoding='utf-8').replace('</script>', '<\\/script>')
    body = body.replace(f'<script src="{f}"></script>', f'<script>\n{js}\n</script>')
assert 'src="data.js"' not in body
page = (f'<title>{title}</title>\n<meta name="color-scheme" content="light only">\n'
        f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link rel="stylesheet" href="{fonts}">\n<style>\n{css}</style>\n{body}')
out.write_text(page, encoding='utf-8')
print(out, len(page))
