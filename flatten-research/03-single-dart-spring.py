import numpy as np
a,h=70.0,28.0; R=(a*a+h*h)/(2*h); TH=np.arcsin(a/R)
dart_exact=2*np.pi*(1-np.cos(TH))
N,M=24,72
def X(i,j):
    phi=TH*i/N; psi=2*np.pi*j/M
    return np.array([R*np.sin(phi)*np.cos(psi),R*np.sin(phi)*np.sin(psi),R*np.cos(phi)])
V=[(0,0)]+[(i,j) for i in range(1,N+1) for j in range(M+1)]
idx={v:k for k,v in enumerate(V)}
X3=np.array([X(*v) for v in V])
E=[]
for j in range(M): E.append((idx[(0,0)],idx[(1,j)]))
for i in range(1,N+1):
    for j in range(M+1):
        if j<M: E.append((idx[(i,j)],idx[(i,j+1)]))
        if i<N: E.append((idx[(i,j)],idx[(i+1,j)]))
        if i<N and j<M: E.append((idx[(i,j)],idx[(i+1,j+1)]))
E=np.array(E); L0=np.linalg.norm(X3[E[:,0]]-X3[E[:,1]],axis=1)
# --- DÜZELTİLMİŞ init: her halkayi GERÇEK 3B çevresine göre yay olarak seril (pens AÇIK başlar) ---
P=np.zeros((len(V),2))
for i in range(1,N+1):
    s=R*(TH*i/N)                                  # geodezik yariçap
    cedge=np.linalg.norm(X(i,0)-X(i,1))           # 3B çevresel kenar
    for j in range(M+1):
        th=j*cedge/s                              # yay/yariçap = açi (pens kendiliğinden < 2pi)
        P[idx[(i,j)]]=[s*np.cos(th),s*np.sin(th)]
apex=idx[(0,0)]
for it in range(6000):
    d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1)+1e-12
    f=(ln-L0)/ln; g=np.zeros_like(P)
    np.add.at(g,E[:,0],(f[:,None])*d); np.add.at(g,E[:,1],-(f[:,None])*d)
    P-=0.1*g; P[apex]=[0,0]
    # dönme kilidi: ilk kol açisini +x'e sabitle (yumuşak)
    v=P[idx[(N,0)]]; ang0=np.arctan2(v[1],v[0])
    c,s2=np.cos(-ang0),np.sin(-ang0); Rm=np.array([[c,-s2],[s2,c]]); P[:]=P@Rm.T
d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1); strain=np.abs(ln-L0)/L0
v0=P[idx[(N,0)]]-P[apex]; vM=P[idx[(N,M)]]-P[apex]
ang=(np.arctan2(vM[1],vM[0])-np.arctan2(v0[1],v0[0]))%(2*np.pi)
dart_measured=2*np.pi-ang
print(f"göğüs kalotu R={R:.1f} theta={np.degrees(TH):.1f}°  (DÜZELTİLMİŞ init)")
print(f"  analitik pens (eğrilik)    = {np.degrees(dart_exact):.2f}°")
print(f"  DÜZLEŞTİRMEDEN açilan pens = {np.degrees(dart_measured):.2f}°   fark {np.degrees(abs(dart_measured-dart_exact)):.2f}°")
print(f"  uzunluk-koruma: ort {strain.mean()*100:.3f}%  max {strain.max()*100:.3f}%")
print(f"  KAPI(a) pens==eğrilik<0.5°: {'GECTI' if np.degrees(abs(dart_measured-dart_exact))<0.5 else 'KALDI'}")
print(f"  KAPI(b) uzunluk<0.5%      : {'GECTI' if strain.max()<0.005 else 'KALDI'}")
# SVG çiz (matplotlib yok)
pmin=P.min(0)-10; pmax=P.max(0)+10; w=pmax-pmin
def sc(p): return ((p-pmin)[0], (pmax[1]-p[1]+pmin[1]))
paths=[]
for i in range(1,N+1):
    pts=' '.join(f'{sc(P[idx[(i,j)]])[0]:.1f},{sc(P[idx[(i,j)]])[1]:.1f}' for j in range(M+1))
    paths.append(f'<polyline points="{pts}" fill="none" stroke="#1f3a5f" stroke-width="0.5"/>')
for j in range(0,M+1,3):
    pts=' '.join(f'{sc(P[apex])[0]:.1f},{sc(P[apex])[1]:.1f}')+' '+' '.join(f'{sc(P[idx[(i,j)]])[0]:.1f},{sc(P[idx[(i,j)]])[1]:.1f}' for i in range(1,N+1))
    paths.append(f'<polyline points="{pts}" fill="none" stroke="#1f3a5f" stroke-width="0.4"/>')
for J,col in [(0,'red'),(M,'red')]:
    pts=' '.join(f'{sc(P[apex])[0]:.1f},{sc(P[apex])[1]:.1f}')+' '+' '.join(f'{sc(P[idx[(i,J)]])[0]:.1f},{sc(P[idx[(i,J)]])[1]:.1f}' for i in range(1,N+1))
    paths.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="2"/>')
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w[0]:.0f} {w[1]:.0f}" width="500"><rect width="{w[0]:.0f}" height="{w[1]:.0f}" fill="#fff"/>{"".join(paths)}<text x="8" y="18" font-family="Helvetica" font-size="12" fill="#1f3a5f">gogus kalotu DUZLESTIRILDI — kirmizi = pens kenarlari, acilan aci {np.degrees(dart_measured):.1f}° = egrilik</text></svg>'
open('/Users/damummyphus/Desktop/DUZLESTIRME-SPIKE.svg','w').write(svg)
print("  görsel: ~/Desktop/DUZLESTIRME-SPIKE.svg")
