import numpy as np
# Küre kalotunu K DİLİME (gore) böl, her dilimi izometrik düzleştir.
# İddia: dilim sayisi arttikça (a) açilan pens TOPLAMI -> eğrilik (99.3°),
#        (b) strain -> 0. Yani tek yüzeyden pens KENDİLİĞİNDEN, doğru toplamda çikar.
a,h=70.0,28.0; R=(a*a+h*h)/(2*h); TH=np.arcsin(a/R)
dart_exact=2*np.pi*(1-np.cos(TH))
N=28
def flatten_gore(psi0,psi1,cols):
    # dilim mesh: i=0..N (tepe), c=0..cols; 3B kalot noktalari
    def X(i,c):
        phi=TH*i/N; psi=psi0+(psi1-psi0)*c/cols
        return np.array([R*np.sin(phi)*np.cos(psi),R*np.sin(phi)*np.sin(psi),R*np.cos(phi)])
    V=[(0,0)]+[(i,c) for i in range(1,N+1) for c in range(cols+1)]
    idx={v:k for k,v in enumerate(V)}; X3=np.array([X(*v) for v in V])
    E=[]
    for c in range(cols): E.append((idx[(0,0)],idx[(1,c)]))
    for i in range(1,N+1):
        for c in range(cols+1):
            if c<cols: E.append((idx[(i,c)],idx[(i,c+1)]))
            if i<N: E.append((idx[(i,c)],idx[(i+1,c)]))
            if i<N and c<cols: E.append((idx[(i,c)],idx[(i+1,c+1)]))
    E=np.array(E); L0=np.linalg.norm(X3[E[:,0]]-X3[E[:,1]],axis=1)
    # init: r=geodezik, açi=gerçek çevresel yay/r
    P=np.zeros((len(V),2))
    for i in range(1,N+1):
        s=R*(TH*i/N); ce=np.linalg.norm(X(i,0)-X(i,1))
        for c in range(cols+1):
            th=(c-cols/2)*ce/s
            P[idx[(i,c)]]=[s*np.cos(th),s*np.sin(th)]
    ap=idx[(0,0)]
    for it in range(4000):
        d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1)+1e-12
        f=(ln-L0)/ln; g=np.zeros_like(P)
        np.add.at(g,E[:,0],(f[:,None])*d); np.add.at(g,E[:,1],-(f[:,None])*d)
        P-=0.2*g; P[ap]=[0,0]
    d=P[E[:,0]]-P[E[:,1]]; ln=np.linalg.norm(d,axis=1); strain=np.abs(ln-L0)/L0
    # dilimin tepe açisi: ilk ve son sütun kenari arasi
    v0=P[idx[(N,0)]]; v1=P[idx[(N,cols)]]
    span=abs((np.arctan2(v1[1],v1[0])-np.arctan2(v0[1],v0[0])+np.pi)%(2*np.pi)-np.pi)
    return span, strain.max()
print(f"göğüs kalotu: eğrilik toplami = {np.degrees(dart_exact):.2f}°  (tüm pensler bunu toplamli)")
print(f"{'dilim':>6} {'malzeme açisi':>14} {'PENS toplami':>13} {'max strain':>11}")
for K in [1,2,3,4,6,8,12]:
    cols=max(3,72//K)
    spans=[]; strains=[]
    for k in range(K):
        sp,st=flatten_gore(2*np.pi*k/K,2*np.pi*(k+1)/K,cols); spans.append(sp); strains.append(st)
    material=sum(spans); dart_total=2*np.pi-material
    print(f"{K:>6} {np.degrees(material):>13.2f}° {np.degrees(dart_total):>12.2f}° {max(strains)*100:>10.3f}%")
print()
print("=> dilim arttikça PENS TOPLAMI eğriliğe (99.3°), strain sıfıra yakınsıyor mu? sayilar yukarida.")
