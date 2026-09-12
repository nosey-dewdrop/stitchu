#!/usr/bin/env python3
# Independent raster measurement (verifier arm) — separate implementation from
# satis-pdf-proof.mjs. 1D probe model: a square/piece edge crossed by a probe
# line is a short dark run; distance between first and last run CENTERS along
# the probe = drawn dimension (strokes centered on path).
import json, subprocess, sys, tempfile, os, statistics

DPI = 300
PX = DPI / 25.4
DARK = 128

def raster(pdf, page, tmp):
    subprocess.run(['pdftoppm','-gray','-r',str(DPI),'-f',str(page),'-l',str(page),
                    pdf, os.path.join(tmp,'pg')], check=True)
    for f in sorted(os.listdir(tmp)):
        if f.startswith('pg') and f.endswith('.pgm'):
            path = os.path.join(tmp,f)
            data = open(path,'rb').read()
            os.remove(path)
            # parse P5
            toks=[]; pos=0
            while len(toks)<4:
                while pos<len(data) and data[pos:pos+1].isspace(): pos+=1
                s=pos
                while pos<len(data) and not data[pos:pos+1].isspace(): pos+=1
                toks.append(data[s:pos])
            pos+=1
            w,h=int(toks[1]),int(toks[2])
            return w,h,data[pos:pos+w*h]
    raise RuntimeError('no pgm')

def runs_along(img_w, img_h, img, fixed, lo, hi, vertical):
    """dark runs along a probe: vertical=True -> probe is a column x=fixed, scan y in [lo,hi]."""
    runs=[]; start=None
    for i in range(lo, hi+1):
        v = img[i*img_w + fixed] if vertical else img[fixed*img_w + i]
        d = v < DARK
        if d and start is None: start=i
        if not d and start is not None: runs.append((start, i-1)); start=None
    if start is not None: runs.append((start, hi))
    return runs

def measure(pdf, page, rect_mm, label, expect_mm, probes_frac=(0.25,0.35,0.65,0.75), margin_mm=2.0):
    """rect_mm: page-mm dict x,y,w,h of the feature bbox. Measures h (vertical probes) and w."""
    with tempfile.TemporaryDirectory() as tmp:
        w,h,img = raster(pdf, page, tmp)
    out=[]
    for axis in ('h','w'):
        vals=[]
        for f in probes_frac:
            if axis=='h':
                fixed = round((rect_mm['x'] + f*rect_mm['w']) * PX)
                lo = round((rect_mm['y'] - margin_mm) * PX); hi = round((rect_mm['y']+rect_mm['h']+margin_mm)*PX)
                hi = min(hi, h-1); lo=max(lo,0)
                rr = runs_along(w,h,img,fixed,lo,hi,True)
            else:
                fixed = round((rect_mm['y'] + f*rect_mm['h']) * PX)
                lo = round((rect_mm['x'] - margin_mm) * PX); hi = round((rect_mm['x']+rect_mm['w']+margin_mm)*PX)
                hi = min(hi, w-1); lo=max(lo,0)
                rr = runs_along(w,h,img,fixed,lo,hi,False)
            if len(rr) < 2: continue
            c0 = (rr[0][0]+rr[0][1])/2; c1 = (rr[-1][0]+rr[-1][1])/2
            vals.append((c1-c0)/PX)
        if not vals:
            out.append((axis,label,None,None)); continue
        med = statistics.median(vals)
        exp = expect_mm[axis]
        out.append((axis,label,med,med-exp))
    return out

def report(rows, tol=1.0):
    npass=0; nfail=0
    for axis,label,got,delta in rows:
        if got is None:
            print(f'  FAIL {label} {axis}: no edges found'); nfail+=1; continue
        ok = abs(delta)<=tol
        npass+= ok; nfail += (not ok)
        print(f'  {"PASS" if ok else "FAIL"} {label} {axis}: {got:.3f} mm (delta {delta:+.3f})')
    return npass,nfail

base='/tmp/satis-verify'
tot_p=tot_f=0
for name, mani_path in [('dress-eu38', 'shift-dress-eu38'), ('dress-pear','shift-dress-pear'), ('skirt-eu38','skirt-aline-eu38')]:
    pdf=f'{base}/{name}.pdf'
    m=json.load(open(f'/Users/damummyphus/damla_projects_2026/stitchu/reports/gate/satis-paketi/{mani_path}.pdf.json'))
    print(f'== {name} ==')
    sp = m['pages']['scale']
    r = m['scaleRects']['square100']
    p,f_ = report(measure(pdf, sp, r, 'square100', {'h':100.0,'w':100.0})); tot_p+=p; tot_f+=f_
    r = m['scaleRects']['square30']
    p,f_ = report(measure(pdf, sp, r, 'square30', {'h':30.0,'w':30.0})); tot_p+=p; tot_f+=f_
print(f'TOTAL scale squares: {tot_p} PASS / {tot_f} FAIL (tol 1.0 mm)')
