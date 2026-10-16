"""يتأكد إن حركات الملزمة نفس حركات الكتاب بالضبط.

المرجع: store/arab100/book/exact/NN-*.txt (نص الكتاب بحركاته مقروء من الصفحات).
لكل كلمة في الدرس (content/NN-*.html):
  - إذا الكلمة موجودة في الكتاب: لازم حركاتها تطابق وحدة من صور الكلمة في الكتاب (لا زيادة ولا نقص).
  - إذا الكلمة مو موجودة في الكتاب: تطلع في قائمة «كلمات من خارج الكتاب» للمراجعة (مسموح بس للعناوين الفرعية مثل «مثل/سبب التسمية»).
وكمان يطلع الكلمات المشكولة في الكتاب اللي ما ظهرت أبدًا في الدرس (عشان ما ينقص مثال).

الاستخدام: python3 tools/arab100/check_harakat.py [NN ...]
"""
import html, pathlib, re, sys, unicodedata

HERE = pathlib.Path(__file__).resolve().parent
EXACT = HERE.parents[1] / "store" / "arab100" / "book" / "exact"
HARAKAT = "ًٌٍَُِّْٰ"
WORD = re.compile(r"[ء-غف-يً-ْٰآأإٱ]+")
# كلمات تنظيمية نكتبها نحن (بدون حركات) وما تحتاج تكون في الكتاب
LABELS = set("""مثل مثال سبب التسمية رسمها الحالة الحكم المثال الحرف أمثلة الكلمة الموضع البيان النوع تعريفها
 الأصل ملاحظة وهي أو و في من على""".split())


def norm(w):
    w = unicodedata.normalize("NFC", w.replace("ـ", ""))
    # ترتيب الحركات على الحرف الواحد ثابت (الشدة قبل الحركة) عشان المقارنة
    out, marks = [], []
    for ch in w:
        if ch in HARAKAT:
            marks.append(ch)
        else:
            if marks:
                out.append("".join(sorted(marks)))
                marks = []
            out.append(ch)
    if marks:
        out.append("".join(sorted(marks)))
    return "".join(out)


def bare(w):
    return "".join(ch for ch in w if ch not in HARAKAT)


def words(text):
    return [norm(m.group()) for m in WORD.finditer(text)]


def html_text(src):
    src = re.sub(r"<!--.*?-->", " ", src, flags=re.S)
    src = re.sub(r"<style.*?</style>", " ", src, flags=re.S)
    # وسوم السطر (span/b/i) تنشال بدون مسافة عشان «و<span>الضمة</span>» تبقى كلمة وحدة
    src = re.sub(r"</?(span|b|i|em|strong)\b[^>]*>", "", src)
    src = re.sub(r"<[^>]+>", " ", src)
    return html.unescape(src)


def check(num):
    ex = next(EXACT.glob(f"{num}-*.txt"))
    book = "\n".join(l for l in ex.read_text(encoding="utf-8").splitlines() if not l.startswith("#"))
    les = next((HERE / "content").glob(f"{num}-*.html"))
    mine = html_text(les.read_text(encoding="utf-8"))
    forms = {}
    for w in words(book):
        forms.setdefault(bare(w), set()).add(w)
    bad, outside, used = [], set(), set()
    for w in words(mine):
        b = bare(w)
        if b not in forms:
            if b not in LABELS:
                outside.add(w)
            continue
        used.add(w)
        if w not in forms[b]:
            bad.append((w, sorted(forms[b])))
    missing = sorted({w for w in words(book) if any(c in HARAKAT for c in w)} - used
                     - {w for w in words(book) if bare(w) in {bare(u) for u in used} and w in used})
    print(f"== {les.name}")
    seen = set()
    for w, fs in bad:
        if w in seen:
            continue
        seen.add(w)
        print(f"  حركات مختلفة: «{w}» ← في الكتاب: {' / '.join('«'+f+'»' for f in fs)}")
    if outside:
        print("  كلمات من خارج الكتاب:", " ".join(sorted(outside)))
    if missing:
        print("  كلمات مشكولة في الكتاب ما ظهرت بشكلها:", " ".join(missing))
    return not bad


if __name__ == "__main__":
    nums = sys.argv[1:] or sorted({p.name[:2] for p in EXACT.glob("*.txt")})
    ok = all([check(n) for n in nums])
    sys.exit(0 if ok else 1)
