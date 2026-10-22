import numpy as np, matplotlib, sys
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rng=np.random.default_rng(7)
OUT=sys.argv[1]; C='#1f2f8f'
n=1000
def rot(x,y,t): c,s=np.cos(t),np.sin(t); return x*c-y*s, x*s+y*c
row1=[];
for r in [1,0.8,0.4,0,-0.4,-0.8,-1]:
    if abs(r)==1:
        x=rng.normal(0,1,n); y=r*x
    else:
        m=rng.multivariate_normal([0,0],[[1,r],[r,1]],n); x,y=m[:,0],m[:,1]
    row1.append((x,y,f'{r:g}',4))
row2=[]
for ang,lab in [(45,'1'),(28,'1'),(12,'1'),(0,'0'),(-12,'-1'),(-28,'-1'),(-45,'-1')]:
    x=rng.uniform(-1,1,n)*3.2; y=np.tan(np.radians(ang))*x if ang!=0 else np.zeros(n)
    row2.append((x,y,lab,4))
row3=[]
x=rng.uniform(-1,1,n); y=4*(x**2-0.5)**2+rng.uniform(-1,1,n)/3; row3.append((x,y,'0',None))
x=rng.uniform(-1,1,n); y=rng.uniform(-1,1,n); x2,y2=rot(x,y,-np.pi/8); row3.append((x2,y2,'0',None))
x2,y2=rot(x,y,-np.pi/4); row3.append((x2,y2,'0',None))
x=rng.uniform(-1,1,n); y=2*x**2+rng.uniform(-1,1,n); row3.append((x,y,'0',None))
x=rng.uniform(-1,1,n); y=(x**2+rng.uniform(0,0.5,n))*rng.choice([-1,1],n); row3.append((x,y,'0',None))
t=rng.uniform(-1,1,n); x=np.sin(t*np.pi)+rng.normal(0,1/8,n); y=np.cos(t*np.pi)+rng.normal(0,1/8,n); row3.append((x,y,'0',None))
k=n//4; x=np.concatenate([rng.normal(-1,0.33,2*k),rng.normal(1,0.33,2*k)]); y=np.concatenate([rng.normal(-1,0.33,k),rng.normal(1,0.33,k),rng.normal(-1,0.33,k),rng.normal(1,0.33,k)]); row3.append((x,y,'0',None))
fig,axs=plt.subplots(3,7,figsize=(14,6.6),dpi=300)
for i,row in enumerate([row1,row2,row3]):
    for j,(x,y,lab,lim) in enumerate(row):
        ax=axs[i][j]
        ax.scatter(x,y,s=1.2,c=C,linewidths=0,alpha=0.9)
        if lim: ax.set_xlim(-lim,lim); ax.set_ylim(-lim,lim)
        else:
            mx=max(np.ptp(x),np.ptp(y))/2*1.1; cx=(x.max()+x.min())/2; cy=(y.max()+y.min())/2
            ax.set_xlim(cx-mx,cx+mx); ax.set_ylim(cy-mx,cy+mx)
        ax.set_aspect('equal'); ax.axis('off')
        ax.set_title(lab.replace('-','−'),fontsize=15,fontweight='bold',color='#111',pad=6)
plt.subplots_adjust(left=0.01,right=0.99,top=0.93,bottom=0.01,wspace=0.12,hspace=0.32)
fig.savefig(OUT+'/correlation-scatter-white.png',facecolor='white')
fig.savefig(OUT+'/correlation-scatter-transparent.png',transparent=True)
print('ok')
