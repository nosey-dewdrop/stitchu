#!/usr/bin/env python3
# 08 — GERCEK Bugra Locket front-38 armscye'i konturdan CIKAR (257mm sisik bug'ini duzelt).
# Yontem: ring-trace-locket-front-38.json kapali konturu (176 segment, measured+bridge) sirali
# nokta zincirine cevrilir; donus-acisi ile KOSE noktalari bulunur (omuz ucu, koltukalti, CF ust,
# yaka, etek koseleri = yuksek-egrilik). Kontur PNG'ye cizilir, koseler indeksle isaretlenir ->
# armscye yayi GOZLE tanimlanir (tahmin degil, gercek sekli okuyarak). Bu pas: cizim + kose dokumu.
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT="/Users/damummyphus/damla_projects_2026/stitchu"
d=json.load(open(ROOT+"/patterns_real/geometry/ring-trace-locket-front-38.json"))
segs=d["segments"]

# --- sirali kapali kontur: segment pts'lerini birlestir, ardisik tekrarlari at ---
pts=[]
for s in segs:
    for p in s["pts"]:
        if not pts or (abs(p[0]-pts[-1][0])>1e-6 or abs(p[1]-pts[-1][1])>1e-6):
            pts.append([float(p[0]),float(p[1])])
# kapat
if math.hypot(pts[0][0]-pts[-1][0],pts[0][1]-pts[-1][1])>1e-6:
    pts.append(pts[0][:])
P=np.array(pts)
n=len(P)-1  # son = ilk tekrar
per=float(np.sum(np.linalg.norm(np.diff(P,axis=0),axis=1)))
print(f"kontur: {n} nokta, cevre {per:.1f} mm  (json perim {d['summaryMM']['perim']})")

# --- ARC-LENGTH boyunca yeniden ornekle (esit ~2mm) => kose tespiti stabil ---
seg=np.linalg.norm(np.diff(P,axis=0),axis=1); arc=np.concatenate([[0],np.cumsum(seg)]); L=arc[-1]
step=2.0; samp=np.arange(0,L,step)
X=np.interp(samp,arc,P[:,0]); Y=np.interp(samp,arc,P[:,1])
Q=np.column_stack([X,Y]); m=len(Q)

# --- donus acisi (yumusatilmis): her noktada k-ileri/k-geri vektorler arasi aci ---
k=max(3,int(round(8.0/step)))  # ~16mm bazli yon
turn=np.zeros(m)
for i in range(m):
    a=Q[i]-Q[(i-k)%m]; b=Q[(i+k)%m]-Q[i]
    na=np.linalg.norm(a)+1e-9; nb=np.linalg.norm(b)+1e-9
    cross=a[0]*b[1]-a[1]*b[0]; dot=(a@b)
    turn[i]=math.degrees(math.atan2(cross,na*nb) if False else math.atan2(cross,dot))
absturn=np.abs(turn)
# yerel maksimumlar = koseler (min ~30 derece toplam sapma, min aralik)
corners=[]
win=max(4,int(round(12.0/step)))
for i in range(m):
    if absturn[i]<25: continue
    lo=(i-win)%m; hh=(i+win)%m
    seg_idx=[(i+t)%m for t in range(-win,win+1)]
    if absturn[i]>=max(absturn[j] for j in seg_idx)-1e-9:
        if not corners or min((abs(i-c),m-abs(i-c)) for c in corners)[0] if False else True:
            corners.append(i)
# yakin koseleri birlestir
corners=sorted(set(corners))
merged=[]
for c in corners:
    if merged and min(abs(c-merged[-1]), m-abs(c-merged[-1]))<win:
        if absturn[c]>absturn[merged[-1]]: merged[-1]=c
    else: merged.append(c)
corners=merged
print(f"tespit {len(corners)} kose (>25deg donus):")
for ci,c in enumerate(corners):
    print(f"  kose{ci:2d}: idx{c:4d}  arc {samp[c]:6.1f}mm  xy=({Q[c,0]:6.1f},{Q[c,1]:6.1f})  donus {turn[c]:+6.1f}deg")

# --- PNG render: kontur + koseler etiketli ---
minx,miny=Q.min(0); maxx,maxy=Q.max(0); pad=25
sc=2.2
W=int((maxx-minx+2*pad)*sc); H=int((maxy-miny+2*pad)*sc)
img=Image.new("RGB",(W,H),"#fdfcf8"); dr=ImageDraw.Draw(img)
try: font=ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc",22); fb=ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc",30)
except: font=fb=ImageFont.load_default()
def T(x,y): return ((x-minx+pad)*sc,(maxy-y+pad)*sc)  # y-up -> y-down
dr.line([T(x,y) for x,y in Q]+[T(Q[0,0],Q[0,1])],fill="#333",width=2)
# arc-length yon oku (baslangic yesil)
dr.ellipse([*[v-6 for v in T(Q[0,0],Q[0,1])],*[v+6 for v in T(Q[0,0],Q[0,1])]],fill="#228833")
for ci,c in enumerate(corners):
    px,py=T(Q[c,0],Q[c,1])
    dr.ellipse([px-7,py-7,px+7,py+7],fill="#cc3311")
    dr.text((px+9,py-12),f"{ci}",fill="#cc3311",font=fb)
dr.text((16,H-40),f"Locket front-38  cevre {per:.0f}mm  yesil=arc bas  kirmizi=kose(indeks)",fill="#111",font=font)
out=ROOT+"/flatten-research/08-front38-corners.png"
img.save(out)
print(f"\nPNG -> {out}")
print("SIRADAKI: PNG'ye bak, armscye yayinin iki ucu (omuz ucu + koltukalti) hangi koseler -> o alt-yayi olc.")
