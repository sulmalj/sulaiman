import pymupdf, sys
G='/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/gen/'
SP='/tmp/claude-0/-home-user-sulaiman/71c612a1-d5ae-5f87-85c2-c51534749003/scratchpad/'
SRC='/home/user/sulaiman/store/statistics/worksheets/chapter-3-worksheet.pdf'
OUT=sys.argv[1]
doc=pymupdf.open(SRC)
arch=pymupdf.Archive()
arch.add(SP+'cairo.ttf','cairo.ttf')
arch.add('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','dv.ttf')
BLUE='#1e40af'; BOX='#ea580c'
CSS=f"""@font-face{{font-family:ar;src:url(cairo.ttf)}}
@font-face{{font-family:m;src:url(dv.ttf)}}
body{{margin:0;color:{BLUE};font-family:m;}}
.a{{font-family:ar;}}
.b{{border:0.9px solid {BOX};padding:0 1.5px;font-weight:bold;}}
"""
def box(page,rect,html,fs=7,align='left',dirn='ltr'):
    h=f'<div dir="{dirn}" style="font-size:{fs}px;line-height:1.45;text-align:{align}">{html}</div>'
    r=page.insert_htmlbox(pymupdf.Rect(rect),h,css=CSS,archive=arch)
    if r[0]<0: print('OVERFLOW',rect,html[:40])
def circ(page,rect):
    r=pymupdf.Rect(rect); r.x0-=1;r.x1+=1;r.y0-=1.5;r.y1+=1.5
    page.draw_oval(r,color=pymupdf.utils.getColor('blue') if False else (0.12,0.25,0.69),width=1.2)
def B(t): return f'<span class="b">{t}</span>'
def A(t): return f'<span class="a">{t}</span>'
xb='x&#772;'; xt='x&#771;'; xh='x&#770;'
def s(t): return f'<sub>{t}</sub>'
p14,p15,p16=doc[13],doc[14],doc[15]
# MCQ circles
for r in [(41,453,128,471),(41,511,128,529),(41,582,128,600)]: circ(p14,r)
for r in [(41,163,128,181),(134,271,222,288),(41,337,128,354),(134,444,222,462)]: circ(p15,r)
# 3.5.5 boxplot in dashed box (40,182,223,218)
x0,x1=50,214; lo,hi=0,20
X=lambda v: x0+(v-lo)*(x1-x0)/(hi-lo)
C=(0.12,0.25,0.69)
ya=210
p16.draw_line((X(lo)-3,ya),(X(hi)+3,ya),color=(0.4,0.4,0.4),width=0.6)
for v in range(0,21):
    p16.draw_line((X(v),ya-1.5),(X(v),ya+1.5),color=(0.4,0.4,0.4),width=0.5)
    if v%2==0 or v in (3,5,15):pass
for v in range(0,21,1):
    p16.insert_text((X(v)-(1.3 if v<10 else 2.6),ya+6.5),str(v),fontsize=4.2,color=(0.35,0.35,0.35))
yc=196; hgt=6
p16.draw_rect(pymupdf.Rect(X(5),yc-hgt,X(14),yc+hgt),color=C,width=1)
p16.draw_line((X(8),yc-hgt),(X(8),yc+hgt),color=C,width=1)
p16.draw_line((X(3),yc),(X(5),yc),color=C,width=1)
p16.draw_line((X(14),yc),(X(18),yc),color=C,width=1)
for v in (3,18): p16.draw_line((X(v),yc-3.5),(X(v),yc+3.5),color=C,width=1)
for v,l in [(3,'xs'),(5,'Q1'),(8,'Q2'),(14,'Q3'),(18,'xl')]:
    p16.insert_text((X(v)-3,yc-hgt-1.5),l,fontsize=4.5,color=C)

for n,pg in ((14,p14),(16,p16)):
    ov=pymupdf.open(G+f'ov{n}.pdf'); pg.show_pdf_page(pg.rect,ov,0,overlay=True)
out=pymupdf.open(); out.insert_pdf(doc,from_page=13,to_page=15); out.save(OUT,garbage=3,deflate=True)
