#!/usr/bin/env python3
# Joint alignment: dark-run centers 0.5mm inside the shared edge of adjacent
# sheets must line up (curve slope over the 1mm gap allowed: tol 2mm).
import subprocess, tempfile, os
DPI=300; PX=DPI/25.4; DARK=128
PAD_X=10.0; PAD_Y=23.5; PW=190.0; PH=250.0

def raster(pdf,page,tmp):
    subprocess.run(['pdftoppm','-gray','-r',str(DPI),'-f',str(page),'-l',str(page),pdf,os.path.join(tmp,'pg')],check=True)
    for f in sorted(os.listdir(tmp)):
        if f.endswith('.pgm'):
            data=open(os.path.join(tmp,f),'rb').read(); os.remove(os.path.join(tmp,f))
            toks=[];pos=0
            while len(toks)<4:
                while data[pos:pos+1].isspace():pos+=1
                s=pos
                while not data[pos:pos+1].isspace():pos+=1
                toks.append(data[s:pos])
            return int(toks[1]),int(toks[2]),data[pos+1:]
    raise RuntimeError('no pgm')

def runcenters_col(w,h,img,x,y0,y1):
    runs=[];start=None
    for y in range(y0,y1):
        d=img[y*w+x]<DARK
        if d and start is None:start=y
        if not d and start is not None:runs.append(((start+y-1)/2)); start=None
    return runs

def runcenters_row(w,h,img,y,x0,x1):
    runs=[];start=None
    for x in range(x0,x1):
        d=img[y*w+x]<DARK
        if d and start is None:start=x
        if not d and start is not None:runs.append(((start+x-1)/2)); start=None
    return runs

def check_vjoint(pdf,pageL,pageR,label):
    """vertical joint: right edge of pageL vs left edge of pageR"""
    with tempfile.TemporaryDirectory() as t: wL,hL,L=raster(pdf,pageL,t)
    with tempfile.TemporaryDirectory() as t: wR,hR,R=raster(pdf,pageR,t)
    y0=round((PAD_Y+2)*PX); y1=round((PAD_Y+PH-2)*PX)
    a=runcenters_col(wL,hL,L, round((PAD_X+PW-0.5)*PX), y0,y1)
    b=runcenters_col(wR,hR,R, round((PAD_X+0.5)*PX), y0,y1)
    match(a,b,label)

def check_hjoint(pdf,pageT,pageB,label):
    with tempfile.TemporaryDirectory() as t: wT,hT,T=raster(pdf,pageT,t)
    with tempfile.TemporaryDirectory() as t: wB,hB,B=raster(pdf,pageB,t)
    x0=round((PAD_X+2)*PX); x1=round((PAD_X+PW-2)*PX)
    a=runcenters_row(wT,hT,T, round((PAD_Y+PH-0.5)*PX), x0,x1)
    b=runcenters_row(wB,hB,B, round((PAD_Y+0.5)*PX), x0,x1)
    match(a,b,label)

def match(a,b,label):
    TOL=2.0*PX
    unmatched_a=[x/PX for x in a if not any(abs(x-y)<=TOL for y in b)]
    unmatched_b=[x/PX for x in b if not any(abs(x-y)<=TOL for y in a)]
    paired=[(x/PX, min((abs(x-y)/PX for y in b), default=None)) for x in a if any(abs(x-y)<=TOL for y in b)]
    devs=[d for _,d in paired if d is not None]
    ok = not unmatched_a and not unmatched_b and len(a)>0
    print(f'{"PASS" if ok else "FAIL"} {label}: {len(a)} vs {len(b)} crossings, paired {len(devs)}, max dev {max(devs) if devs else float("nan"):.3f} mm'
          + (f'  UNMATCHED L={[round(v,1) for v in unmatched_a]} R={[round(v,1) for v in unmatched_b]}' if not ok else ''))

# dress-eu38: A1(p3)|A2(p4) vertical joint, A1(p3)/B1(p6) horizontal joint, A2(p4)/B2(p7)
d='/tmp/satis-verify/dress-eu38.pdf'
check_vjoint(d,3,4,'dress A1|A2')
check_hjoint(d,3,6,'dress A1/B1')
check_hjoint(d,4,7,'dress A2/B2')
s='/tmp/satis-verify/skirt-eu38.pdf'
# skirt: sheets grid 3 wide, A1 p3, A2 p4, B1 p6? list: rows? assume same ordering as dress: A1,A2,A3,B1..
check_vjoint(s,3,4,'skirt A1|A2')
check_hjoint(s,3,6,'skirt A1/B1')
