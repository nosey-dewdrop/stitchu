#!/usr/bin/env python3
# v2: try both corner bands per axis (edge sheets have blobs on one side only).
import subprocess, tempfile, os, sys
DPI=300; PX=DPI/25.4; DARK=128; MINRUN=40
pdf=sys.argv[1]; pages=[int(x) for x in sys.argv[2:]]
def raster(page):
    tmp=tempfile.mkdtemp()
    subprocess.run(['pdftoppm','-gray','-r',str(DPI),'-f',str(page),'-l',str(page),pdf,os.path.join(tmp,'pg')],check=True)
    f=[x for x in os.listdir(tmp) if x.endswith('.pgm')][0]
    data=open(os.path.join(tmp,f),'rb').read()
    toks=[];pos=0
    while len(toks)<4:
        while data[pos:pos+1].isspace():pos+=1
        s=pos
        while not data[pos:pos+1].isspace():pos+=1
        toks.append(data[s:pos])
    return int(toks[1]),int(toks[2]),data[pos+1:]
def runs(img,w,fixed,n,vertical):
    rr=[];start=None
    for i in range(n):
        v=img[i*w+fixed] if vertical else img[fixed*w+i]
        if v<DARK and start is None:start=i
        if v>=DARK and start is not None:rr.append((start,i-1));start=None
    if start is not None:rr.append((start,n-1))
    return rr
npass=nfail=0
for page in pages:
    w,h,img=raster(page)
    rows=[y for y in range(h) if any(b-a+1>=MINRUN for a,b in runs(img,w,y,w,False))]
    cols=[x for x in range(w) if any(b-a+1>=MINRUN for a,b in runs(img,w,x,h,True))]
    def span(bands, horizontal):
        best=None
        for f in bands:
            rr=[r for r in (runs(img,w,f,w,False) if horizontal else runs(img,w,f,h,True)) if r[1]-r[0]+1>=MINRUN]
            if len(rr)>=1:
                s=(rr[-1][1]-rr[0][0]+1)/PX
                if best is None or s>best: best=s
        return best
    width=span([rows[0]+round(2*PX), rows[-1]-round(2*PX)], True)
    height=span([cols[0]+round(2*PX), cols[-1]-round(2*PX)], False)
    dw,dh=width-190.0,height-250.0
    ok=abs(dw)<=1.0 and abs(dh)<=1.0
    npass+=ok; nfail+=not ok
    print(f'{"PASS" if ok else "FAIL"} page {page}: frame {width:.3f} x {height:.3f} mm (delta {dw:+.3f} / {dh:+.3f})')
print(f'FRAME TOTAL: {npass} PASS / {nfail} FAIL (tol 1.0 mm)')
