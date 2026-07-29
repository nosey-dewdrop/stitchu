import numpy as np
def curv(P3, verts, tris):
    ang={k:0.0 for k in P3}
    for (A,B,C) in tris:
        for (v,p,q) in [(A,B,C),(B,C,A),(C,A,B)]:
            u1=P3[p]-P3[v];u2=P3[q]-P3[v]
            ang[v]+=np.arccos(np.clip(np.dot(u1,u2)/(np.linalg.norm(u1)*np.linalg.norm(u2)),-1,1))
    return sum(2*np.pi-ang[v] for v in verts)  # iç köşe defisit toplamı

# ---- KONİ FRUSTUMU (etek paneli: bel->etek, TEPE YOK) ----
al=np.radians(30); r0,r1=120.0,360.0; N,M=30,90   # slant r0..r1
P={}; 
for i in range(N+1):
    r=r0+(r1-r0)*i/N
    for j in range(M):
        psi=2*np.pi*j/M
        P[(i,j)]=np.array([r*np.sin(al)*np.cos(psi),r*np.sin(al)*np.sin(psi),r*np.cos(al)])
tris=[]
for i in range(N):
    for j in range(M):
        A,B,C,D=(i,j),(i,(j+1)%M),(i+1,j),(i+1,(j+1)%M)
        tris+= [(A,B,C),(B,D,C)]
interior=[(i,j) for i in range(1,N) for j in range(M)]  # üst+alt kenar hariç
print("KONİ FRUSTUMU (etek paneli, tepesiz):")
print(f"  toplam eğrilik / pens = {np.degrees(curv(P,interior,tris)):.4f}°   -> TAM 0 (düzleşebilir)")
print("  Eteğin pensi yok çünkü panel düzleşebilir bir yüzey. Matematik, formül değil.\n")

# ---- KÜRE KALOTU (göğüs) ----
a,h=70.0,28.0; R=(a*a+h*h)/(2*h); th=np.arcsin(a/R)
exact=2*np.pi*(1-np.cos(th))
N,M=160,480; P={}
for i in range(N+1):
    phi=th*i/N
    for j in range(M):
        psi=2*np.pi*j/M
        P[(i,j)]=np.array([R*np.sin(phi)*np.cos(psi),R*np.sin(phi)*np.sin(psi),R*np.cos(phi)])
P[(0,0)]=np.array([0,0,R])
tris=[(( 0,0),(1,j),(1,(j+1)%M)) for j in range(M)]
for i in range(1,N):
    for j in range(M):
        A,B,C,D=(i,j),(i,(j+1)%M),(i+1,j),(i+1,(j+1)%M); tris+=[(A,B,C),(B,D,C)]
interior=[(0,0)]+[(i,j) for i in range(1,N) for j in range(M)]
d=curv(P,interior,tris)
print("KÜRE KALOTU (göğüs, kavisli yüzey):")
print(f"  analitik pens (Gauss-Bonnet) = {np.degrees(exact):.3f}°")
print(f"  diskret mesh (160x480)       = {np.degrees(d):.3f}°   (hata {np.degrees(abs(d-exact)):.3f}°)")
print(f"  => göğüs pensi ZORUNLU, ve boyu = eğrilik. Kumaş ≈ {2*a*np.sin(exact/2):.0f}mm (bel+yan ≈ {a*np.sin(exact/2):.0f}mm'er)")
