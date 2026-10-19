import pymupdf,sys,glob
G='/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/'
SRC=glob.glob('/root/.claude/uploads/71c612a1-d5ae-5f87-85c2-c51534749003/742f3d7b-*.pdf')[0]
doc=pymupdf.open(SRC)
C=(0.04,0.16,0.61)
for r in [(242,256,310,280),(97,302,182,323),(439,372,557,393),(144,419,183,440),(380,467,435,488)]:
    doc[0].draw_oval(pymupdf.Rect(r),color=C,width=1.7)
def white(p,rects):
    for r in rects: p.draw_rect(pymupdf.Rect(r),color=None,fill=(1,1,1))
# remove all dash guide lines on pages 2-3 + dash tails of question lines
for i,extra in ((1,[(41,463,356,480),(40,674,434,690),(40,719,193,736)]),(2,[(41,556,357,573)])):
    p=doc[i]; rs=[]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            t=''.join(s['text'] for s in l['spans']).strip()
            if t and set(t)<=set('-‐ '): x0,y0,x1,y1=l['bbox']; rs.append((x0-1,y0+1,x1+1,y1-1))
    white(p,rs+extra)
for n in (1,2,3):
    pg=doc[n-1]; ov=pymupdf.open(G+f'w7ov{n}.pdf'); pg.show_pdf_page(pg.rect,ov,0,overlay=True)
    for l in ov[0].get_links():
        if l.get('uri'): pg.insert_link({'kind':pymupdf.LINK_URI,'from':l['from'],'uri':l['uri']})
doc.save(sys.argv[1],garbage=3,deflate=True)
