import pymupdf,sys,glob
G='/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/'
SRC=glob.glob('/root/.claude/uploads/71c612a1-d5ae-5f87-85c2-c51534749003/24ab56a2-*.pdf')[0]
doc=pymupdf.open(SRC); p1,p2=doc[0],doc[1]
C=(0.12,0.25,0.69)
for r in [(87,300,183,325),(462,350,561,378),(235,395,307,423),(226,451,307,476),(520,498,561,522),(462,540,561,568)]:
    p1.draw_oval(pymupdf.Rect(r),color=C,width=1.4)
# white-out dashes in answer areas
W=[(43,131,399,150),(41,153,537,172),(53,188,210,207),(52,223,326,242),(50,258,351,277),(44,293,445,312),(47,328,388,347),(51,363,319,382),(51,398,329,417),(45,433,466,452),(46,468,421,487),(42,503,384,522),(38,526,537,544),(41,561,416,580),(45,583,537,602),(42,618,386,637),(45,641,537,659),(43,676,211,694),(52,698,537,717)]
for r in W: p2.draw_rect(pymupdf.Rect(r),color=None,fill=(1,1,1))
for n,pg in ((1,p1),(2,p2)):
    ov=pymupdf.open(G+f'w6ov{n}.pdf'); pg.show_pdf_page(pg.rect,ov,0,overlay=True)
doc.save(sys.argv[1],garbage=3,deflate=True)
