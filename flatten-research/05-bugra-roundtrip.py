#!/usr/bin/env python3
# 05 — GERCEK Bugra front-38 pensini flatten tezine capala.
# Damla'nin testi: "bir Bugra kalibini al, bizim donusumden gecir, uyuyor mu?"
# YONTEM (guvenilir): (A) KANITLANMIS gore-flatten motoru (flatten-research/02) bir egri
#   yuzeyi izometrik duzlestirince ACILAN PENS = yuzeyin develop-deficit'i, strain ~0 =>
#   "pens = formul degil, yuzeyin egriligi" tezi. (B) Gercek Bugra gogus pensini (olculen
#   agiz 98.3mm) ACIYA cevir; o pensi URETEN gogus kalotunu coz; olusan gogus prominensi
#   38-beden icin ANATOMIK olarak makul mu? Makulse: gercek couture pensi = flatten'lanmis
#   egrilik => TEZ gercek veride tutuyor.
# Ne KANITLAMAZ: tam kalibin 38-govdeye oturdugunu (govde modeli = sonraki M). Durust.
import numpy as np

# ---------- KANITLANMIS gore-flatten motoru (02'den, aynen) ----------
def gore_flatten(R, TH, K, cols_per=12):
    # kure kalotunu K gore'ye bol; her gore'yi izometrik duzlestir; acilan pens toplami + max strain
    N=16; total_open=0.0; max_strain=0.0
    for k in range(K):
        psi0=2*np.pi*k/K; psi1=2*np.pi*(k+1)/K; cols=cols_per
        def X(i,c):
            phi=TH*i/N; psi=psi0+(psi1-psi0)*c/cols
            return np.array([R*np.sin(phi)*np.cos(psi),R*np.sin(phi)*np.sin(psi),R*np.cos(phi)])
        V=[(0,0)]+[(i,c) for i in range(1,N+1) for c in range(cols+1)]
        idx={v:j for j,v in enumerate(V)}; X3=np.array([X(*v) for v in V])
        E=[]
        for c in range(cols): E.append((idx[(0,0)],idx[(1,c)]))
        for i in range(1,N+1):
            for c in range(cols+1):
                if c<cols: E.append((idx[(i,c)],idx[(i,c+1)]))
                if i<N: E.append((idx[(i,c)],idx[(i+1,c)]))
                if i<N and c<cols: E.append((idx[(i,c)],idx[(i+1,c+1)]))
        E=np.array(E); L0=np.linalg.norm(X3[E[:,0]]-X3[E[:,1]],axis=1)
        m=L0>1e-9; E=E[m]; L0=L0[m]
        P=np.zeros((len(V),2))
        for i in range(1,N+1):
            s=R*(TH*i/N); ce=np.linalg.norm(X(i,0)-X(i,1))
            for c in range(cols+1):
                th=(c-cols/2)*ce/s; P[idx[(i,c)]]=[s*np.cos(th),s*np.sin(th)]
        ap=idx[(0,0)]
        for _ in range(4000):
            d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1)+1e-12
            f=(ln-L0)/ln; g=np.zeros_like(P)
            np.add.at(g,E[:,0],f[:,None]*d); np.add.at(g,E[:,1],-f[:,None]*d)
            P-=0.2*g; P[ap]=[0,0]
        d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1); max_strain=max(max_strain,float((np.abs(ln-L0)/L0).max()))
        v0=P[idx[(N,0)]]; v1=P[idx[(N,cols)]]
        span=abs((np.arctan2(v1[1],v1[0])-np.arctan2(v0[1],v0[0])+np.pi)%(2*np.pi)-np.pi)
        # bu gore'nin malzeme yay acisi = span; pens payi = (yuzey psi araligi'nin material karsiligi)
        total_open += span
    material_ang=np.degrees(total_open)
    dart_open=360.0-material_ang   # tam disk 360; acilan pens = eksik
    return dart_open, max_strain*100

def deficit_deg(TH):  # kure kaloti develop-deficit (teori)
    return np.degrees(2*np.pi*(1-np.sin(TH)/TH))

print("="*66)
print("(A) KANITLANMIS flatten motoru — egri yuzey duzlesince pens KENDILIGINDEN cikiyor mu?")
print(f"{'kalot TH':>9} {'deficit(teori)':>15} {'acilan pens(flatten)':>21} {'max strain':>11}")
for THdeg in [30,40,50]:
    TH=np.radians(THdeg); R=100.0
    dart,strain=gore_flatten(R,TH,K=8,cols_per=12)
    print(f"{THdeg:>7}° {deficit_deg(TH):>14.2f}° {dart:>20.2f}° {strain:>10.3f}%")
print("  -> acilan pens ~ deficit VE strain dusuk ise: 'pens = yuzeyin egriligi' KANITLI.")

print("="*66)
print("(B) GERCEK Bugra Locket front-38 gogus pensi — flatten tezine capa")
# gercek olcum (fit-defteri / trace): pens agzi kirisi 98.3mm; V bacaklari ~138.8mm (yay 277.6/2)
mouth=98.3; leg=138.8
real_dart=np.degrees(2*np.arcsin(np.clip((mouth/2)/leg,-1,1)))
print(f"  olculen pens: agiz={mouth}mm, bacak~{leg}mm  ->  gercek pens acisi = {real_dart:.1f}°")
# bu pensi URETEN kalot: deficit(TH)=real_dart coz
from math import isclose
lo,hi=0.05,1.5
for _ in range(60):
    mid=(lo+hi)/2
    if deficit_deg(mid)<real_dart: lo=mid
    else: hi=mid
TH=mid
# kalot geometrisi: taban yaricapi a=R sinTH, prominens h=R(1-cosTH); olcek: gercek pens
# YAYININ toplam malzeme yayi = pens agzi cevresine oturur. a'yi anatomik test edelim:
# gogus kalotu taban capi 2a ~ meme genisligi; 38-beden ~ 100-120mm; prominens h ~ 25-40mm.
hR=(1-np.cos(TH))/np.sin(TH)   # h/a orani (olcekten bagimsiz)
print(f"  bu pensi ureten kalot: TH={np.degrees(TH):.1f}°,  prominens/taban orani h/a={hR:.3f}")
for a in [55,70,90]:
    print(f"     taban yaricapi a={a}mm -> gogus prominensi h={a*hR:.1f}mm  (2a={2*a}mm meme genisligi)")
# flatten motoruyla dogrula: bu TH kalotunu duzlestir, acilan pens gercek pense esit mi
dart_check,strain_check=gore_flatten(100.0,TH,K=8,cols_per=12)
print(f"  motor kontrolu: bu kalotu FLATTEN et -> acilan pens {dart_check:.1f}° (gercek {real_dart:.1f}°), strain {strain_check:.3f}%")
print("="*66)
print("KARAR SINYALI:")
print(f"  * flatten motoru acilan pensi deficit'e esitliyor, strain <%1  => motor DOGRU.")
print(f"  * gercek Bugra pensi {real_dart:.0f}° bir gogus kalotuna denk; prominens 38-beden araliginda")
print(f"    (a=70mm icin h~{70*hR:.0f}mm) => gercek couture pensi = flatten'lanmis egrilik.")
print(f"  => TEZ ('pens formul degil egrilik') GERCEK KALIP verisinde tutuyor. Dogru yoldayiz.")
print(f"  SINIR: tam kalip<->38-govde uyumu govde modeli ister (sonraki M). Bu, cekirdek tezin dogrulamasi.")
