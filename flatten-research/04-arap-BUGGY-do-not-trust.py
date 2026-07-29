import numpy as np
a,h=70.0,28.0; R=(a*a+h*h)/(2*h); TH=np.arcsin(a/R)
N,M=16,48
def X(i,j):
    phi=TH*i/N; psi=2*np.pi*j/M
    return np.array([R*np.sin(phi)*np.cos(psi),R*np.sin(phi)*np.sin(psi),R*np.cos(phi)])
V=[(0,0)]+[(i,j) for i in range(1,N+1) for j in range(M+1)]
idx={v:k for k,v in enumerate(V)}; X3=np.array([X(*v) for v in V]); n=len(V)
T=[]
for j in range(M): T.append((idx[(0,0)],idx[(1,j)],idx[(1,j+1)]))
for i in range(1,N):
    for j in range(M):
        A,B,C,D=idx[(i,j)],idx[(i,j+1)],idx[(i+1,j)],idx[(i+1,j+1)]
        T.append((A,B,D)); T.append((A,D,C))
def local2d(p0,p1,p2):
    e1=p1-p0;L1=np.linalg.norm(e1);x=e1/L1;e2=p2-p0;px=np.dot(e2,x);Ly=np.linalg.norm(e2-px*x)
    return np.array([[0,0],[L1,0],[px,Ly]])
Xl=[local2d(X3[t[0]],X3[t[1]],X3[t[2]]) for t in T]
U=np.zeros((n,2))
for (i,j) in V:
    if i==0: continue
    s=R*(TH*i/N);ce=np.linalg.norm(X(i,0)-X(i,1));th=(j-M/2)*ce/s
    U[idx[(i,j)]]=[s*np.cos(th),s*np.sin(th)]
apex=idx[(0,0)]
# uniform Laplacian (sabit; local sadece RHS'i değiştirir)
Lp=np.zeros((n,n))
for t in T:
    for e in [(0,1),(1,2),(2,0)]:
        i0,i1=t[e[0]],t[e[1]]; Lp[i0,i0]+=1;Lp[i1,i1]+=1;Lp[i0,i1]-=1;Lp[i1,i0]-=1
free=[k for k in range(n) if k!=apex]
Lf=Lp[np.ix_(free,free)]
for it in range(20):
    Rt=[]
    for k,t in enumerate(T):
        u=U[list(t)]-U[list(t)].mean(0); x=Xl[k]-Xl[k].mean(0)
        Hh=x.T@u; Ub,_,Vt=np.linalg.svd(Hh); Rm=Vt.T@Ub.T
        if np.linalg.det(Rm)<0: Vt[1]*=-1; Rm=Vt.T@Ub.T
        Rt.append(Rm)
    B=np.zeros((n,2))
    for k,t in enumerate(T):
        x=Xl[k]; Rm=Rt[k]
        for e in [(0,1),(1,2),(2,0)]:
            i0,i1=t[e[0]],t[e[1]]; d=(Rm@(x[e[0]]-x[e[1]]))
            B[i0]+=d; B[i1]-=d
    Bf=B[free]-Lp[np.ix_(free,[apex])]@U[[apex]]
    U[free]=np.linalg.solve(Lf,Bf)
E=set()
for t in T:
    for e in [(0,1),(1,2),(2,0)]: E.add((min(t[e[0]],t[e[1]]),max(t[e[0]],t[e[1]])))
E=np.array(list(E)); l0=np.linalg.norm(X3[E[:,0]]-X3[E[:,1]],axis=1);l1=np.linalg.norm(U[E[:,0]]-U[E[:,1]],axis=1)
strain=np.abs(l1-l0)/l0
v0=U[idx[(N,0)]]-U[apex];vM=U[idx[(N,M)]]-U[apex]
ang=(np.arctan2(vM[1],vM[0])-np.arctan2(v0[1],v0[0]))%(2*np.pi); dart=np.degrees(2*np.pi-ang)
print(f"PROPER ARAP (lineer çözüm), göğüs kalotu TEK pens:")
print(f"  strain: ort {strain.mean()*100:.3f}%  max {strain.max()*100:.3f}%")
print(f"  açilan pens = {dart:.2f}°  (izometrik develop teorik {np.degrees(2*np.pi*(1-np.sin(TH)/TH)):.2f}°)")
print(f"  spring kaba: max %4  ->  ARAP: max %{strain.max()*100:.2f}   {'DAHA İYİ' if strain.max()<0.04 else 'değil'}")
