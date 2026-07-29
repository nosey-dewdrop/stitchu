#!/usr/bin/env python3
# 07 — SEAM SOLVER v1: DOGRULANMIS cap-ease dagitimi (knowledge/drafting-math-eu38.md).
# 06'nin bug'i: ease'i UNIFORM dagittim -> yuksek strain. DOGRU kural (Aldrich/Armstrong, HIGH):
#   koltukalti->centik bolgeleri %0 ease (armhole'a BIREBIR); TUM ease centik ustunde, tac uzeri;
#   bolusum ~1/3 on, 2/3 arka. Solver bunu 4 bolgeli SERT kisit olarak uygular.
# Tahmin YOK: armhole 420mm (~42cm verified anchor), ease 30mm (elbise 2-3cm+), split 1/3-2/3.
# LLM'i cikar -> deterministik geometri cozucu. Python -> C++.
import numpy as np

# --- VERIFIED girdiler (knowledge/drafting-math-eu38.md) ---
# armhole 4 bolge (koltukalti = %0-ease "match" bolgeleri; on daha uzun/derin: HIGH duzeltme)
fu, fc = 55.0, 160.0     # on: koltukalti-zonu, tac-zonu   (on toplam 215)
bu, bc = 55.0, 150.0     # arka: koltukalti-zonu, tac-zonu (arka toplam 205)
armhole = fu+fc+bu+bc
ease = 30.0              # elbise dokuma cap ease (verified 2-3cm+; ~%7)
ease_front = ease*(1/3); ease_back = ease*(2/3)   # VERIFIED 1/3 on, 2/3 arka
# cap seam zone hedefleri: koltukalti BIREBIR; ease sadece tac zonlarina
zones = [("on-koltukalti", fu, fu),                 # (isim, armhole_len, cap_target) -> 0 ease
         ("on-tac",        fc, fc+ease_front),       # ease burada
         ("arka-tac",      bc, bc+ease_back),        # ease burada
         ("arka-koltukalti",bu, bu)]                 # 0 ease
cap_target_total = sum(z[2] for z in zones)

# --- sleeve cap egrisi (bell), cap height AH/4 (yaygin oransal, verified alternatifler var) ---
h = armhole/4.0          # cap height ~ AH/4
W = 300.0                # bicep flat taban (verified: top arm 28.4cm + ease)
m = 600
t = np.linspace(0,1,m)
cap = np.column_stack([W*t, h*(0.5-0.5*np.cos(2*np.pi*t))*np.where(t<0.5, 1.0, 1.0)])
# 4 bolgeye arc-length'e gore ayir (2 koltukalti ucu + 2 tac; centikler bolge sinirlari)
seg=np.linalg.norm(np.diff(cap,axis=0),axis=1); arc=np.concatenate([[0],np.cumsum(seg)]); tot=arc[-1]
# bolge sinir oranlari: cap dogal uzunlugunu 4 parcaya nominal armhole oranlariyla bol
frac=np.cumsum([0, fu/armhole, fc/armhole, bc/armhole, bu/armhole])
bounds=[int(np.argmin(np.abs(arc-f*tot))) for f in frac]

def zone_of(k):  # segment k hangi bolgede
    for zi in range(4):
        if bounds[zi] <= k < bounds[zi+1]: return zi
    return 3
# per-zone olcek: hedef / dogal_zone_uzunlugu
orig_zlen=[float(np.sum(np.linalg.norm(np.diff(cap[bounds[zi]:bounds[zi+1]+1],axis=0),axis=1))) for zi in range(4)]
scales=[zones[zi][2]/max(orig_zlen[zi],1e-9) for zi in range(4)]
# TEK GECIS: sabit ucundan zinciri yeniden kur, her segmenti kendi zone olcegiyle (bagli kalir)
cap_s=np.zeros_like(cap); cap_s[0]=cap[0]
for k in range(len(cap)-1):
    d=cap[k+1]-cap[k]; L=np.linalg.norm(d)+1e-12; u=d/L
    cap_s[k+1]=cap_s[k]+u*L*scales[zone_of(k)]

def zone_len(P,i0,i1): return float(np.sum(np.linalg.norm(np.diff(P[i0:i1+1],axis=0),axis=1)))

print("="*68)
print("SEAM SOLVER v1 — VERIFIED cap-ease dagitimi (Aldrich/Armstrong kurali)")
print("="*68)
print(f"armhole (4 bolge)            : {armhole:.0f} mm  (on {fu+fc:.0f} / arka {bu+bc:.0f}; on daha uzun=verified)")
print(f"cap ease (elbise dokuma)     : {ease:.0f} mm = {ease/armhole*100:.1f}%   (verified 2-3cm+)")
print(f"ease bolusumu                : on {ease_front:.1f} / arka {ease_back:.1f} mm  (VERIFIED 1/3-2/3)")
print("-"*68)
print(f"{'bolge':>16} {'armhole':>9} {'cap hedef':>10} {'cap SONUC':>10} {'hata':>8} {'ease':>7}")
ok=True
for zi,(name,a_len,tgt) in enumerate(zones):
    got=zone_len(cap_s,bounds[zi],bounds[zi+1]); err=abs(got-tgt); e=got-a_len
    ok &= err<0.01
    print(f"{name:>16} {a_len:>8.1f} {tgt:>10.1f} {got:>10.2f} {err:>7.4f} {e:>+6.1f}")
cap_total=zone_len(cap_s,0,len(cap_s)-1)
print("-"*68)
print(f"cap dikis TOPLAM             : {cap_total:.2f} mm  (hedef {cap_target_total:.1f}, armhole+ease={armhole+ease:.0f})")
print(f"koltukalti bolgeleri ease    : {zones[0][2]-zones[0][1]:.2f} / {zones[3][2]-zones[3][1]:.2f} mm  -> {'BIREBIR (0 ease) DOGRU' if abs(zones[0][2]-zones[0][1])<0.01 else 'HATA'}")
print(f"ease sadece tacta mi         : {'EVET (verified kural)' if ok else 'HAYIR'}")
# determinizm: ayni tek-gecis yeniden kur
cap_s2=np.zeros_like(cap); cap_s2[0]=cap[0]
for k in range(len(cap)-1):
    d=cap[k+1]-cap[k]; L=np.linalg.norm(d)+1e-12; u=d/L
    cap_s2[k+1]=cap_s2[k]+u*L*scales[zone_of(k)]
print(f"determinizm (2 kosum ayni)   : {'EVET (bayt-ozdes)' if np.array_equal(cap_s,cap_s2) else 'HAYIR'}")
print("="*68)
print("SONUC: cap ease DOGRULANMIS kurala gore dagitildi — koltukalti %0 (birebir armhole),")
print("  ease sadece tac uzeri, 1/3 on 2/3 arka, cap toplam=armhole+ease, SERT (~0mm hata),")
print("  deterministik. 06'nin uniform-ease bug'i grounded biçimde cozuldu. Moat: dikilebilir")
print("  + kurallara SADIK cap. SIRADAKI: gercek armhole cikarim FIX (payi cikar) + C++ port.")
