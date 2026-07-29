#!/usr/bin/env python3
# 06 — SEAM SOLVER v0 (moat'in ilk tuglasi): "eased-seam" SERT kisiti.
# Kesif: dikisler HER ZAMAN esit degil — set-in kol kapagi, oyuktan KASITLI ~%8-10 UZUN,
#        araya ease dagitilarak dikilir (kolun yuvarlakligi boyle olusur).
# Cozucu isi: iki parcanin paylasilan dikisini KURALA gore (esit YA DA eased) hedef uzunluga
#        SERT KISIT olarak cozmek, ve bunun giyilebilirlik bedelini (interior strain) OLCMEK.
# Neural araclar bunu YAPAMAZ (dikilemez panel uretir). LLM'i cikar -> mm-benchmark'li geometri.
# Bu spike deterministik; Python'da kanitla -> C++'a tasi. scipy YOK.
import numpy as np

def build_patch(width, height, nx, ny, bulge=0.0):
    # egri panel mesh'i (z = bulge*sin profili -> non-developable, gercekci); dis kenarlar seam adayi.
    V=[]; gid={}
    for i in range(ny+1):
        for j in range(nx+1):
            x=width*j/nx; y=height*i/ny
            z=bulge*np.sin(np.pi*j/nx)*np.sin(np.pi*i/ny)
            gid[(i,j)]=len(V); V.append([x,y,z])
    V=np.array(V,float); E=set()
    for i in range(ny+1):
        for j in range(nx+1):
            if j<nx: E.add((gid[(i,j)],gid[(i,j+1)]))
            if i<ny: E.add((gid[(i,j)],gid[(i+1,j)]))
            if i<ny and j<nx: E.add((gid[(i,j)],gid[(i+1,j+1)]))
    seam=[gid[(i,nx)] for i in range(ny+1)]   # sag kenar = paylasilan dikis
    return V,np.array(sorted(E)),gid,seam

def flatten(V3,E,L0=None,seam=None,seam_targetL=None,iters=8000,lr=0.15,pin=0):
    # izometrik spring flatten; seam+seam_targetL verilirse: dikis kenarlarini toplam hedef
    # uzunluga tasi (ease'i uniform dagit) = SERT kisit. Interior kenarlar dogal kalir.
    if L0 is None: L0=np.linalg.norm(V3[E[:,0]]-V3[E[:,1]],axis=1)
    L0=L0.copy()
    hard = seam is not None and seam_targetL is not None
    P=V3[:,:2].copy().astype(float)
    for _ in range(iters):
        d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1)+1e-12
        f=(ln-L0)/ln; g=np.zeros_like(P)
        np.add.at(g,E[:,0],f[:,None]*d); np.add.at(g,E[:,1],-f[:,None]*d)
        P-=lr*g; P[pin]=V3[pin,:2]
        if hard:
            # SERT KISIT: dikis toplam uzunlugunu hedefe PROJEKTE et (sekli koru, zinciri
            # sabit uctan yeniden kur). Boylece seam_len == hedef HER iter (~0 hata).
            sv=P[seam]; segd=np.diff(sv,axis=0); segl=np.linalg.norm(segd,axis=1)+1e-12
            sc=seam_targetL/segl.sum(); u=segd/segl[:,None]
            for k in range(len(seam)-1):
                P[seam[k+1]]=P[seam[k]]+u[k]*segl[k]*sc
    d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1)
    strain=np.abs(ln-L0)/np.maximum(L0,1e-9)
    return P,strain

def seam_len(P,seam):
    return float(np.sum(np.linalg.norm(np.diff(P[seam],axis=0),axis=1)))

print("="*68)
print("SEAM SOLVER v0 — eased-seam SERT kisiti (cap-ease kurali)")
print("="*68)
# ARMSCYE parcasi (bodice yan/oyuk): duz-ish panel
Va,Ea,_,seam_a=build_patch(180,240, 9,12, bulge=6.0)
Pa,sa=flatten(Va,Ea,seam=None)
A=seam_len(Pa,seam_a)          # oyuk (armscye) dikis uzunlugu — sabit hedef kaynagi
# SLEEVE CAP parcasi: egri kapak (non-developable)
Vc,Ec,_,seam_c=build_patch(180,240, 9,12, bulge=22.0)  # daha kubbeli = kap
Pc0,sc0=flatten(Vc,Ec,seam=None)
cap0=seam_len(Pc0,seam_c)      # kapin DOGAL flatten dikis uzunlugu

ease=0.08
target=A*(1+ease)              # KURAL: kap = armscye * (1 + ease)
print(f"armscye dikis uzunlugu  A         : {A:7.2f} mm")
print(f"kap DOGAL flatten uzunlugu (kisitsiz): {cap0:7.2f} mm   (A ile eslesmiyor -> DIKILEMEZ)")
print(f"KURAL hedefi cap = A*(1+{ease})    : {target:7.2f} mm")
print("-"*68)
# COZUCU: kabi, dikisi hedef uzunluga tasiyan SERT kisitla yeniden flatten et
Pc,sc=flatten(Vc,Ec,seam=seam_c,seam_targetL=target)
cap1=seam_len(Pc,seam_c)
print(f"cozucu sonrasi kap dikisi         : {cap1:7.2f} mm   (hedef {target:.2f})")
print(f"dikis eslesme HATASI              : {abs(cap1-target):.4f} mm   (SERT kisit -> ~0 olmali)")
print(f"kalan ease (kap - armscye)        : {cap1-A:7.2f} mm  = {(cap1-A)/A*100:.1f}%  (kurala uygun ~8%)")
print(f"interior strain (giyilebilirlik)  : max {sc.max()*100:.3f}%  ort {sc.mean()*100:.3f}%")
print(f"   -> DURUST: sert kisit tuttu (0mm) ama ease'i UNIFORM dagitinca dikiste bunching")
print(f"      (max strain yuksek). Gercek cap ease belli bolgeye dagitilir/buharla cekilir.")
print(f"      BULUNAN PROBLEM: akilli ease-dagitimi (strain'i minimize eden) = sonraki tugla.")
print("-"*68)
# DETERMINIZM: iki kez kos, bayt-ayni mi
Pc_b,_=flatten(Vc,Ec,seam=seam_c,seam_targetL=target)
print(f"determinizm (2 kosum ayni mi)     : {'EVET (bayt-ozdes)' if np.array_equal(Pc,Pc_b) else 'HAYIR'}")
print("="*68)
print("SONUC (durust): kol kapagi <-> oyuk dikisi KURALA gore (esit+%8 ease) SERT baglandi:")
print("  eslesme hatasi 0.00mm, ease tam %8, DETERMINISTIK. Bu moat'in ISKELETI ve neural")
print("  uretici bunu garanti EDEMEZ. ACIK PROBLEM: uniform ease -> yuksek lokal strain;")
print("  akilli ease-dagitimi gerekli. SIRADAKI: ease-dagitim + gercek Bugra + coklu-parca + C++.")
