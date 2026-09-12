#!/usr/bin/env python3
# Independent PIECE measurement: locate piece via manifest stripSew, map to
# sheet page, probe with my own 1D run model (see indep-measure.py).
import json, sys
sys.path.insert(0,'/tmp/satis-verify')
import importlib.util
spec = importlib.util.spec_from_file_location('im','/tmp/satis-verify/indep-measure.py')
# import only the helpers (the module runs its main on import; reuse code inline instead)
import subprocess, tempfile, os, statistics
DPI=300; PX=DPI/25.4; DARK=128
from math import floor

def raster(pdf,page,tmp):
    subprocess.run(['pdftoppm','-gray','-r',str(DPI),'-f',str(page),'-l',str(page),pdf,os.path.join(tmp,'pg')],check=True)
    for f in sorted(os.listdir(tmp)):
        if f.startswith('pg') and f.endswith('.pgm'):
            data=open(os.path.join(tmp,f),'rb').read()
            toks=[];pos=0
            while len(toks)<4:
                while data[pos:pos+1].isspace():pos+=1
                s=pos
                while not data[pos:pos+1].isspace():pos+=1
                toks.append(data[s:pos])
            pos+=1
            return int(toks[1]),int(toks[2]),data[pos:]
    raise RuntimeError('no pgm')

def probe(imgw,imgh,img,fixed,lo,hi,vertical):
    runs=[];start=None
    for i in range(lo,hi+1):
        v=img[i*imgw+fixed] if vertical else img[fixed*imgw+i]
        if v<DARK and start is None:start=i
        if v>=DARK and start is not None:runs.append((start,i-1));start=None
    if start is not None:runs.append((start,hi))
    return runs

def measure_piece(pdf, mani, piece_name, sheet_row, sheet_col, axis, fracs, margin=2.0):
    m=json.load(open(mani))
    pw,ph,padx,pady=m['pageWmm'],m['pageHmm'],m['padX'],m['padY']
    pc=[p for p in m['pieces'] if piece_name in p['name']][0]
    ss=pc['stripSew']
    # page-mm bbox of the sew rect ON this sheet
    x0=ss['minX']-sheet_col*pw+padx; x1=ss['maxX']-sheet_col*pw+padx
    y0=ss['minY']-sheet_row*ph+pady; y1=ss['maxY']-sheet_row*ph+pady
    # page number: firstSheet + index in sheets list
    idx=[i for i,s in enumerate(m['sheets']) if s['col']==sheet_col and s['row']==sheet_row][0]
    page=m['pages']['firstSheet']+idx
    with tempfile.TemporaryDirectory() as tmp:
        w,h,img=raster(pdf,page,tmp)
    vals=[]
    for f in fracs:
        if axis=='h':
            fx=round((x0+f*(x1-x0))*PX)
            lo=max(0,round((y0-margin)*PX)); hi=min(h-1,round((y1+margin)*PX))
            rr=probe(w,h,img,fx,lo,hi,True)
        else:
            fy=round((y0+f*(y1-y0))*PX)
            lo=max(0,round((x0-margin)*PX)); hi=min(w-1,round((x1+margin)*PX))
            rr=probe(w,h,img,fy,lo,hi,False)
        if len(rr)<2:continue
        c0=(rr[0][0]+rr[0][1])/2;c1=(rr[-1][0]+rr[-1][1])/2
        vals.append((c1-c0)/PX)
    med=statistics.median(vals)
    exp=pc['sewH'] if axis=='h' else pc['sewW']
    return page,med,exp,med-exp,len(vals)

base='/tmp/satis-verify'; mdir='/Users/damummyphus/damla_projects_2026/stitchu/reports/gate/satis-paketi'
tests=[
 (f'{base}/skirt-eu38.pdf', f'{mdir}/skirt-aline-eu38.pdf.json','Waistband',0,1,'h',(0.3,0.4,0.6,0.7)),
 (f'{base}/skirt-eu38.pdf', f'{mdir}/skirt-aline-eu38.pdf.json','Waistband',0,1,'w',()),  # spans 3 sheets, w not measurable on one page -> skip below
 (f'{base}/dress-eu38.pdf', f'{mdir}/shift-dress-eu38.pdf.json','Spaghetti',4,0,'w',(0.3,0.5,0.7)),
 (f'{base}/dress-pear.pdf', f'{mdir}/shift-dress-pear.pdf.json','Spaghetti',None,0,'w',(0.3,0.5,0.7)),
]
np=nf=0
for pdf,mani,name,row,col,axis,fr in tests:
    if not fr: continue
    if row is None:
        # pear strap: find its row from stripSew
        m=json.load(open(mani)); pc=[p for p in m['pieces'] if name in p['name']][0]
        row=floor((pc['stripSew']['minY']+pc['stripSew']['maxY'])/2/m['pageHmm'])
    page,got,exp,d,n=measure_piece(pdf,mani,name,row,col,axis,fr)
    ok=abs(d)<=1.0; np+=ok; nf+=not ok
    print(f'{"PASS" if ok else "FAIL"} {os.path.basename(pdf)} {name} {axis} (page {page}, sheet row{row}/col{col}): {got:.3f} mm vs engine {exp:.3f} (delta {d:+.3f}, {n} probes)')
print(f'PIECE TOTAL: {np} PASS / {nf} FAIL (tol 1.0 mm)')
