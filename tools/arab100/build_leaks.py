"""يبني ملف «تسريبات الميد» لعرب 100 (أسئلة اختبارات سابقة محلولة من الكتاب) — خاص بالمشتركين،
بنفس تصميم ملف حلول التطبيقات (خلفية الملزمة وخطها وألوانها):
    python3 tools/arab100/build_leaks.py store/arab100/leaks/mid-leaks.pdf
المصدر: store/arab100/leaks/mid-leaks.md بنفس صيغة ملفات الحلول (build_solutions.py)، والأسطر اللي تبدأ بـ«# » تعليقات.
"""
import argparse, html, pathlib, tempfile
import pymupdf
from playwright.sync_api import sync_playwright
import build_malzama as bm
import build_solutions as bs

SRC = bm.HERE.parents[1] / "store" / "arab100" / "leaks" / "mid-leaks.md"
W, H = bm.W, bm.H
FOOT = "خاص بالمشتركين · لا أحلل نشره أو إرساله"


def intro_html(toc_rows):
    notes = [
        ("خاص بالمشتركين", "هذا الملف خاص بمشتركي ملازم عدل في مادة عرب 100، ولا أحلل نشره أو إرساله أو إعطاءه لأي شخص، ولا نقل الأسئلة أو الحلول منه أو تصويرها."),
        ("وش في الملف؟", "أسئلة جاءت في اختبارات ميد سابقة (نموذج الطلاب ونموذج الطالبات)، محلولة كلها من الكتاب، ومع كل حل سبب الإجابة ورقم صفحتها في الكتاب."),
        ("طريقة المذاكرة", "حاول تحل كل سؤال بنفسك قبل ما تشوف الإجابة الملوّنة، وإذا أخطأت ارجع لصفحة الكتاب المكتوبة جنب الحل."),
    ]
    cards = "".join(f'<p class="ln nc"><span class="nk">{k}</span> {v}</p>' for k, v in notes)
    return f"""<!-- قبل أن تبدأ -->
<style>
.nc {{ font-size:11.4pt; margin:0 0 8pt; }}
.nk {{ background:#cc6e53; color:#fff; border-radius:10pt; padding:0 8pt; font-size:10.5pt; }}
.toc {{ width:100%; border-collapse:separate; border-spacing:0; font-size:11.4pt; margin-top:8pt; }}
.toc th {{ background:#325c8e; color:#fff; font-weight:700; padding:4pt 6pt; }}
.toc thead th:first-child {{ border-top-right-radius:9pt; }} .toc thead th:last-child {{ border-top-left-radius:9pt; }}
.toc td {{ padding:4.5pt 10pt; text-align:center; border-bottom:1pt solid #e2cdbd; background:#fbf6f1; line-height:1.5; }}
.toc td:first-child {{ border-right:1pt solid #e2cdbd; }} .toc td:last-child {{ border-left:1pt solid #e2cdbd; }}
.toc td.r {{ text-align:right; }}
</style>
<div class="sec intro-top">قبل أن تبدأ</div>
{cards}
<div class="sec toch">فهرس الملف</div>
<table class="toc"><thead><tr><th>الموضوع</th><th style="width:60pt">الصفحة</th></tr></thead><tbody>{''.join(toc_rows)}</tbody></table>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    a = ap.parse_args()

    lines = [l for l in SRC.read_text(encoding="utf-8").splitlines() if not l.startswith("# ")]
    lessons = []
    body = "<!-- تسريبات الميد -->\n" + bs.md_html(lines, lessons)
    tmp = pathlib.Path(tempfile.mkdtemp())
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=bm.CHROME)
        bm.render_fit(bs.SOL_CSS_WRAP(body), tmp / "c.pdf", br)
        content = pymupdf.open(tmp / "c.pdf")
        mp = bs.marker_pages(content)
        n = content.page_count
        foot = []
        for pno in range(n):
            cur = max((k for k, pg in mp.items() if pg <= pno), default=None)
            foot.append((lessons[cur][1] if cur is not None else "تسريبات الميد", pno + 1))
        rows = [f'<tr><td class="r">{bs.inline(toc)}</td><td>{mp.get(li, 0) + 1}</td></tr>' for li, (toc, _) in enumerate(lessons)]
        cov = [("النموذج الأول", "اختبار الطلاب", ["ظلّل دائرة الإجابة الصحيحة (10)", "أجب حسب المطلوب (10)", "كتابة فقرة"]),
               ("النموذج الثاني", "اختبار الطالبات", ["ظلّلي دائرة الإجابة الصحيحة (10)", "أجيبي حسب المطلوب (10)"])]
        bm.render(bs.fm.cover_html(bm.font_faces(), cov, kicker="مهارات الكتابة · أسئلة اختبارات سابقة محلولة",
                                   title="تسريبات الميد", badge="ملف خاص بالمشتركين", part="جزئية الميد",
                                   foot="خاص بالمشتركين · لا أحلل نشر الملف أو إرساله أو إعطاءه لأي شخص أو نقل أسئلته"),
                  tmp / "cover.pdf", br)
        bm.render(bm.doc(intro_html(rows)), tmp / "intro.pdf", br)
        n_intro = pymupdf.open(tmp / "intro.pdf").page_count
        bm.render(bs.footers_html([("قبل أن تبدأ", None)] * n_intro + foot, FOOT), tmp / "f.pdf", br)
        br.close()

    bs.scrub_markers(content)
    base = bs.base_page()
    footp = pymupdf.open(tmp / "f.pdf")
    out = pymupdf.open()
    fk = 0
    for kind, path in (("cover", tmp / "cover.pdf"), ("intro", tmp / "intro.pdf")):
        d = pymupdf.open(path)
        for i in range(d.page_count):
            pg = out.new_page(width=W, height=H)
            if kind == "intro":
                pg.show_pdf_page(pg.rect, base, 0)
            pg.show_pdf_page(pg.rect, d, i)
            bs.copy_links(d[i], pg)
            if kind == "intro":
                pg.show_pdf_page(pg.rect, footp, fk)
                fk += 1
    for i in range(content.page_count):
        pg = out.new_page(width=W, height=H)
        pg.show_pdf_page(pg.rect, base, 0)
        pg.show_pdf_page(pg.rect, content, i)
        for r in bm.stray_marks(content[i]):
            pg.show_pdf_page(r, base, 0, clip=r)
        bs.copy_links(content[i], pg)
        pg.show_pdf_page(pg.rect, footp, fk)
        fk += 1
    out.set_metadata({"title": "عرب 100 — تسريبات الميد محلولة (خاص بالمشتركين)", "author": "ملازم عدل"})
    out.save(a.out, garbage=4, deflate=True)
    print(f"{a.out}: {out.page_count} صفحة")


if __name__ == "__main__":
    main()
