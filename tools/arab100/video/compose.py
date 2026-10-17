"""مونتاج مقطع شرح الموقع: صور الصفحات + مؤشر يتحرك ويضغط + تظليل برتقالي + تعتيم الباقي + شروح تحت.
الناتج: فيديو 1920×1080 بـ30 إطار، بدون صوت."""
import json, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

D = Path(__file__).parent
sb = json.loads((D / 'storyboard.json').read_text())
caps = json.loads((D / 'ovl/caps.json').read_text())
OUT = sys.argv[1] if len(sys.argv) > 1 else str(D / 'out.mp4')
FPS, W, H = 30, 1920, 1080
K = sb['scale']; VH = sb['vh']                     # 1.5 ، 720
BG = (242, 244, 247)
ORANGE = (245, 165, 36)
MAX_TOTAL = 116.0                                  # الحد: دقيقتين

# ── الصور ──
views = {}
for vid, v in sb['views'].items():
    im = Image.open(v['file']).convert('RGB')
    views[vid] = dict(img=im, h=v['h'], hh=v['hh'], header=im.crop((0, 0, W, round(v['hh'] * K))))
cap_img = {t: Image.open(f).convert('RGBA') for t, f in caps.items()}
card = {k: Image.open(D / f'ovl/{k}.png').convert('RGB') for k in ('intro', 'device', 'outro')}

def ease(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

def page_frame(vid, scroll):
    v = views[vid]; y0 = round(scroll * K)
    im = Image.new('RGB', (W, H), BG)
    im.paste(v['img'].crop((0, y0, W, min(v['img'].height, y0 + H))), (0, 0))
    if scroll > 0.5: im.paste(v['header'], (0, 0))
    return im

def to_screen(vid, x, y, scroll):
    hh = views[vid]['hh']
    sy = y * K if y < hh else (y - scroll) * K       # عناصر الترويسة ثابتة فوق
    return x * K, sy

def clamp_scroll(vid, s):
    return max(0.0, min(s, views[vid]['h'] - VH))

def want_scroll(st, prev_scroll):
    vid = st['view']; mode = st.get('scroll', 'auto')
    if isinstance(mode, (int, float)): return clamp_scroll(vid, mode)
    if mode == 'keep': return clamp_scroll(vid, prev_scroll)
    tgt = st.get('box') or st.get('focus')
    if not tgt and st.get('cur'): tgt = {'x': st['cur'][0], 'y': st['cur'][1], 'w': 1, 'h': 1}
    if not tgt: return clamp_scroll(vid, prev_scroll)
    hh = views[vid]['hh']
    if tgt['y'] < hh: return clamp_scroll(vid, prev_scroll) if mode == 'auto' else 0.0
    visible_top, visible_bot = prev_scroll + hh + 10, prev_scroll + VH - 120   # فوق الشرح
    if mode == 'auto' and tgt['y'] >= visible_top and tgt['y'] + tgt['h'] <= visible_bot:
        return clamp_scroll(vid, prev_scroll)
    avail = VH - hh - 130
    s = tgt['y'] - hh - max(20, (avail - tgt['h']) / 2)
    return clamp_scroll(vid, s)

# ── المؤشر ──
def cursor_img(scale=1.0):
    s = 2.2 * scale
    pts = [(0, 0), (0, 17), (4.5, 13), (7.5, 20), (10, 19), (7, 12.2), (12.5, 12.2)]
    pts = [(x * s + 6, y * s + 6) for x, y in pts]
    im = Image.new('RGBA', (int(40 * scale + 12), int(56 * scale + 12)), (0, 0, 0, 0))
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).polygon([(x + 2, y + 3) for x, y in pts], fill=(0, 0, 0, 110))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(2.5)))
    dr = ImageDraw.Draw(im); dr.polygon(pts, fill=(255, 255, 255, 255), outline=(20, 20, 20, 255), width=2)
    return im
CUR = cursor_img(1.0); CUR_DOWN = cursor_img(0.88)

# ── التظليل ──
_box_cache = {}
def box_layers(rect_px):
    key = tuple(round(v) for v in rect_px)
    if key in _box_cache: return _box_cache[key]
    x, y, w, h = key
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle((x, y, x + w, y + h), radius=16, fill=255)
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32)[..., None] / 255.0
    stroke = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(stroke).rounded_rectangle((x, y, x + w, y + h), radius=16, outline=ORANGE + (255,), width=5)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).rounded_rectangle((x - 2, y - 2, x + w + 2, y + h + 2), radius=18, outline=ORANGE + (150,), width=12)
    glow = glow.filter(ImageFilter.GaussianBlur(9)); glow.alpha_composite(stroke)
    _box_cache[key] = (m, glow)
    return _box_cache[key]

def apply_box(frame, rect_px, a):
    if a <= 0: return frame
    m, glow = box_layers(rect_px)
    arr = np.asarray(frame, dtype=np.float32)
    dim = 0.42 * a
    arr = arr * (1 - dim * (1 - m)) + np.array([14, 24, 40], np.float32) * dim * (1 - m) * 0.25
    out = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert('RGBA')
    g = glow.copy(); g.putalpha(g.getchannel('A').point(lambda v: int(v * a)))
    out.alpha_composite(g)
    return out.convert('RGB')

def paste_caption(frame, text, a):
    if not text or a <= 0: return frame
    c = cap_img[text]
    if a < 1: c = c.copy(); c.putalpha(c.getchannel('A').point(lambda v: int(v * a)))
    out = frame.convert('RGBA'); out.alpha_composite(c, ((W - c.width) // 2, H - c.height - 46))
    return out.convert('RGB')

def paste_cursor(frame, x, y, down=False):
    c = CUR_DOWN if down else CUR
    out = frame.convert('RGBA'); out.alpha_composite(c, (int(x) - 6, int(y) - 6)); return out.convert('RGB')

def ripple(frame, x, y, t):   # t من 0 لـ1
    if t <= 0 or t >= 1: return frame
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); r = 12 + 34 * t
    ImageDraw.Draw(ov).ellipse((x - r, y - r, x + r, y + r), outline=ORANGE + (int(230 * (1 - t)),), width=5)
    out = frame.convert('RGBA'); out.alpha_composite(ov); return out.convert('RGB')

# ── الإخراج ──
ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
nframes = 0
def emit(im):
    global nframes
    ff.stdin.write(im.tobytes()); nframes += 1

def blend(a, b, t): return Image.blend(a, b, ease(t))

steps = sb['steps']
base_total = sum(s['dur'] for s in steps)
INTRO, DEVICE, OUTRO, XF = 3.6, 3.2, 3.6, 0.45
fac = min(1.0, (MAX_TOTAL - INTRO - DEVICE - OUTRO - 3 * XF) / base_total)
print(f'steps {base_total:.1f}s × {fac:.3f}', flush=True)

# المقدمة: تظهر من الأسود
black = Image.new('RGB', (W, H), (0, 0, 0))
for i in range(int(INTRO * FPS)):
    t = i / FPS
    emit(blend(black, card['intro'], t / 0.5) if t < 0.5 else card['intro'])

prev_view, scroll = None, 0.0
cx, cy = W * 0.62, H * 0.62
cur_cap = None
last = card['intro']
for si, st in enumerate(steps):
    dur = st['dur'] * (fac if not st.get('click') else 1.0)
    vid = st['view']
    new_view = vid != prev_view
    s0 = scroll if not new_view or prev_view is None else scroll
    s1 = want_scroll(st, scroll)
    if new_view: s0 = s1 if st.get('scroll', 'auto') not in ('keep',) else clamp_scroll(vid, scroll)
    tx, ty = (None, None)
    nxt_cap = st['cap'] if st.get('cap') else cur_cap
    box = st.get('box')
    first = prev_view is None
    xf = XF if first else (0.3 if new_view else 0.0)
    move_t0, move_dur = (0.15 if not new_view else xf + 0.05), (0.65 if st.get('click') else 0.75)
    nf = max(1, round(dur * FPS)); nf += round(xf * FPS) if first else 0
    from_img = last
    sx0, sx1 = s0, s1
    for i in range(nf):
        t = i / FPS
        sc = s0 + (s1 - s0) * ease((t - 0.0) / 0.6) if not new_view else s1
        fr = page_frame(vid, sc)
        # المؤشر
        if st.get('cur'):
            ex, ey = to_screen(vid, st['cur'][0], st['cur'][1], sc)
            k = ease((t - move_t0) / move_dur)
            px, py = cx + (ex - cx) * k, cy + (ey - cy) * k
        else:
            px, py = cx, cy
        arrived = t >= move_t0 + move_dur
        # التظليل بعد ما يوصل المؤشر
        if box:
            bx, by = to_screen(vid, box['x'], box['y'], sc)
            a = ease((t - (move_t0 + move_dur * 0.6)) / 0.3)
            fr = apply_box(fr, (bx, by, box['w'] * K, box['h'] * K), a)
        # الضغط
        if st.get('click'):
            ct = (t - (move_t0 + move_dur)) / 0.35
            fr = ripple(fr, px, py, ct)
        # الشرح
        if nxt_cap != cur_cap:
            ca = ease(t / 0.3)
            if cur_cap: fr = paste_caption(fr, cur_cap, 1 - ca)
            fr = paste_caption(fr, nxt_cap, ca)
        else:
            fr = paste_caption(fr, cur_cap, 1.0)
        fr = paste_cursor(fr, px, py, down=st.get('click') and 0 <= (t - (move_t0 + move_dur)) < 0.18)
        # انتقال بين الصفحات
        if new_view and t < xf: fr = blend(from_img, fr, t / xf)
        emit(fr); last = fr
    if st.get('cur'):
        cx, cy = to_screen(vid, st['cur'][0], st['cur'][1], s1)
    scroll, prev_view, cur_cap = s1, vid, nxt_cap

# الأجهزة ثم الخاتمة
for nm, ln in (('device', DEVICE), ('outro', OUTRO)):
    src = last
    for i in range(int(ln * FPS)):
        t = i / FPS
        fr = blend(src, card[nm], t / XF) if t < XF else card[nm]
        emit(fr); last = fr
for i in range(int(0.6 * FPS)):
    emit(blend(card['outro'], black, i / (0.6 * FPS)))
ff.stdin.close(); ff.wait()
print(f'frames {nframes} = {nframes / FPS:.1f}s → {OUT}')
