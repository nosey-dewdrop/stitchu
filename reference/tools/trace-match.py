import json, math
base='/Users/damummyphus/damla_projects_2026/stitchu/'
G=json.load(open(base+'patterns_real/geometry/geometry-full.json'))
S=json.load(open(base+'patterns_real/geometry/seamgraph.json'))['pieces']
rings={}
for r in G['rings']:
    rings[(r['pattern'],r['piece'],r['sizeGuess'])]=r
def d(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
def resample(P, step=1.0):
    pts=list(P)+[P[0]]
    total=sum(d(pts[i],pts[i+1]) for i in range(len(pts)-1))
    m=int(round(total/step)); out=[]; acc=0.0; seg=0
    seglen=d(pts[0],pts[1])
    for k in range(m):
        target=k*step
        while acc+seglen < target and seg < len(pts)-2:
            acc+=seglen; seg+=1; seglen=d(pts[seg],pts[seg+1])
        t=(target-acc)/seglen if seglen>0 else 0
        a=pts[seg]; b=pts[seg+1]
        out.append((a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t))
    return out,total
def arc(P,i0,i1):
    n=len(P); L=0.0; i=i0%n; i1=i1%n; g=0
    while i!=i1 and g<2*n:
        j=(i+1)%n; L+=d(P[i],P[j]); i=j; g+=1
    return L
def segs_of(pc,sz,ename):
    key=('locket_top',pc,sz)
    if key not in rings: return None
    R,_=resample(rings[key]['polygon'])
    for e in S['locket_top/'+pc][sz]['edges']:
        if e['name']==ename:
            pts=[e['i0']]+list(e['notches'])+[e['i1']]
            return [round(arc(R,pts[k],pts[k+1]),2) for k in range(len(pts)-1)], e['cutMM']
    return None
sizes=['34','36','38','40','42','44','46']
print('%-4s %-28s %-28s %-28s %-28s'%('sz','back yaka-arka','CollarLining edge-1','front yaka-on','Collar edge-0'))
for sz in sizes:
    a=segs_of('Back Body',sz,'yaka-arka'); b=segs_of('Collar Lining',sz,'edge-1')
    c=segs_of('Front Body',sz,'yaka-on');  e=segs_of('Collar',sz,'edge-0')
    f=lambda x: str(x[0]) if x else 'YOK'
    print('%-4s %-28s %-28s %-28s %-28s'%(sz,f(a),f(b),f(c),f(e)))
print()
print('ARMHOLE vs SLEEVE CAP (cut mm)')
for sz in sizes:
    fo=segs_of('Front Body',sz,'OYUK-on'); bo=segs_of('Back Body',sz,'OYUK-arka'); sk=segs_of('Lower Sleeve',sz,'KAPAK(oyuga giden)')
    if not(fo and bo and sk): print(sz,'YOK'); continue
    ah=fo[1]+bo[1]
    print('%-4s armhole %8.2f  cap %8.2f  ease %+7.2f (%+5.2f%%)  frontSegs %s backSegs %s capSegs %s'%(sz,ah,sk[1],sk[1]-ah,100*(sk[1]-ah)/ah,fo[0],bo[0],sk[0]))
