#!/usr/bin/env python3
"""Forensic mm-geometry extraction from Bugra A0 nested-size PDFs.
Pure stdlib. Proves scale via calibration ruler / MediaBox.
"""
import zlib, re, math, json

PT2MM = 25.4/72.0

PDFS = {
    "corset_bustier": "/Users/damummyphus/damla_projects_2026/stitchu/patterns_real/Buttoned Corset Bustier - FIXED/PDFs/A0.pdf",
    "locket_top":     "/Users/damummyphus/damla_projects_2026/stitchu/patterns_real/Locket Top/PDF's/A0.pdf",
}

NUM = r'[-+]?\d*\.?\d+'

def decompress_streams(data):
    out=[]
    for m in re.finditer(rb'stream\r?\n', data):
        start=m.end(); end=data.find(b'endstream', start)
        raw=data[start:end]
        for cand in (raw, raw.rstrip(b'\r\n')):
            try:
                out.append(zlib.decompress(cand)); break
            except Exception:
                continue
    return out

def pick_geometry_stream(streams):
    best=None; bl=-1
    for dec in streams:
        if b' cm' in dec and (b' m' in dec or b' l' in dec):
            cmn=len(re.findall(rb'\bcm\b',dec))
            if cmn>bl:
                bl=cmn; best=dec
    return best.decode('latin1') if best else None

def find_calibration(text):
    """The ruler draws a 4cm box: '... m 0 15.504 l 113.386 15.504 l ...'.
    113.386pt should be 40.00mm. Also MediaBox check done by caller."""
    # look for the horizontal 113.386 length near the ruler text
    for val in re.findall(r'(\d+\.\d+)\s+15\.504\s+l', text):
        w = float(val)*PT2MM
        if 39.0 < w < 41.0:
            return ("ruler 4cm bar", float(val), w)
    return None

def bezier_pts(p0,p1,p2,p3,n=8):
    pts=[]
    for i in range(1,n+1):
        t=i/n; mt=1-t
        x=mt**3*p0[0]+3*mt*mt*t*p1[0]+3*mt*t*t*p2[0]+t**3*p3[0]
        y=mt**3*p0[1]+3*mt*mt*t*p1[1]+3*mt*t*t*p2[1]+t**3*p3[1]
        pts.append((x,y))
    return pts

def parse_paths(text):
    """Return list of polylines, each: dict(pts=[(x,y)mm...], color=str).
    Track q/Q translate stack (only tx,ty used, a=d=1,b=c=0 verified) and stroke color."""
    stack=[]
    cur_tx, cur_ty = 0.0, 0.0
    color="?"
    polylines=[]
    cx=cy=0.0
    start_x=start_y=0.0
    cur=[]
    def push_seg():
        nonlocal cur
        if len(cur)>=2:
            polylines.append({"pts":cur, "color":color})
        cur=[]
    N=NUM
    # ordered alternation; each branch has its OWN numbered groups via findall-style scan
    pat=re.compile(
        r'(?P<q>q)(?=[\s])'
        r'|(?P<Q>Q)(?=[\s])'
        r'|(?P<cm>('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+cm)'
        r'|(?P<rg>('+N+r')\s+('+N+r')\s+('+N+r')\s+(?:RG|rg))'
        r'|(?P<re>('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+re)'
        r'|(?P<c>('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+('+N+r')\s+c)(?=[\s])'
        r'|(?P<l>('+N+r')\s+('+N+r')\s+l)(?=[\s])'
        r'|(?P<m>('+N+r')\s+('+N+r')\s+m)(?=[\s])'
        r'|(?P<h>h)(?=[\s])'
        r'|(?P<paint>[SsFfBb]\*?|n)(?=[\s])'
    )
    for mt in pat.finditer(text):
        k=mt.lastgroup
        g=mt.groupdict()
        if k=='q':
            stack.append((cur_tx,cur_ty))
        elif k=='Q':
            push_seg()
            if stack:
                cur_tx,cur_ty = stack.pop()
        elif k=='cm':
            nums=re.findall(N, g['cm'])
            a,b,c,d,e,f=[float(x) for x in nums[:6]]
            cur_tx += e; cur_ty += f
        elif k=='rg':
            nums=[round(float(x),3) for x in re.findall(N, g['rg'])[:3]]
            color=f"{nums[0]} {nums[1]} {nums[2]}"
        elif k=='re':
            nums=[float(x) for x in re.findall(N, g['re'])[:4]]
            x,y,w,h=nums
            X=(x+cur_tx)*PT2MM; Y=(y+cur_ty)*PT2MM
            W=w*PT2MM; H=h*PT2MM
            if abs(W)<800 and abs(H)<800:
                polylines.append({"pts":[(X,Y),(X+W,Y),(X+W,Y+H),(X,Y+H),(X,Y)],"color":color})
        elif k=='m':
            push_seg()
            nums=[float(x) for x in re.findall(N, g['m'])[:2]]
            x=(nums[0]+cur_tx)*PT2MM; y=(nums[1]+cur_ty)*PT2MM
            cx,cy=x,y; start_x,start_y=x,y; cur=[(x,y)]
        elif k=='l':
            nums=[float(x) for x in re.findall(N, g['l'])[:2]]
            x=(nums[0]+cur_tx)*PT2MM; y=(nums[1]+cur_ty)*PT2MM
            if not cur: cur=[(cx,cy)]
            cur.append((x,y)); cx,cy=x,y
        elif k=='c':
            nums=[float(x) for x in re.findall(N, g['c'])[:6]]
            x1=(nums[0]+cur_tx)*PT2MM; y1=(nums[1]+cur_ty)*PT2MM
            x2=(nums[2]+cur_tx)*PT2MM; y2=(nums[3]+cur_ty)*PT2MM
            x3=(nums[4]+cur_tx)*PT2MM; y3=(nums[5]+cur_ty)*PT2MM
            if not cur: cur=[(cx,cy)]
            for pnt in bezier_pts((cx,cy),(x1,y1),(x2,y2),(x3,y3),8):
                cur.append(pnt)
            cx,cy=x3,y3
        elif k=='h':
            if cur:
                cur.append((start_x,start_y)); cx,cy=start_x,start_y
        elif k=='paint':
            push_seg()
    push_seg()
    return polylines

def bbox(pts):
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    return min(xs),min(ys),max(xs),max(ys)

def poly_len(pts):
    s=0.0
    for i in range(1,len(pts)):
        s+=math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])
    return s

def union_bbox(polys):
    xs0=[]; ys0=[]; xs1=[]; ys1=[]
    for p in polys:
        b=bbox(p["pts"]); xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    return min(xs0),min(ys0),max(xs1),max(ys1)

def cluster_pieces(polys, gap=25.0):
    """Union-find polylines whose bounding boxes are within `gap` mm (overlap/near).
    Returns list of clusters (lists of poly indices)."""
    boxes=[bbox(p["pts"]) for p in polys]
    n=len(polys)
    parent=list(range(n))
    def find(a):
        while parent[a]!=a:
            parent[a]=parent[parent[a]]; a=parent[a]
        return a
    def union(a,b):
        ra,rb=find(a),find(b)
        if ra!=rb: parent[ra]=rb
    def near(b1,b2,g):
        # expand b1 by g, test overlap with b2
        return not (b1[2]+g < b2[0] or b2[2]+g < b1[0] or b1[3]+g < b2[1] or b2[3]+g < b1[1])
    for i in range(n):
        for j in range(i+1,n):
            if near(boxes[i],boxes[j],gap):
                union(i,j)
    groups={}
    for i in range(n):
        groups.setdefault(find(i),[]).append(i)
    return list(groups.values())

def centroid_of(pts):
    b=bbox(pts); return ((b[0]+b[2])/2,(b[1]+b[3])/2)

def process(name, path):
    data=open(path,"rb").read()
    mb=re.search(rb'/MediaBox\s*\[([^\]]+)\]',data)
    mbvals=[float(x) for x in mb.group(1).split()]
    page_w_mm=(mbvals[2]-mbvals[0])*PT2MM
    page_h_mm=(mbvals[3]-mbvals[1])*PT2MM
    streams=decompress_streams(data)
    text=pick_geometry_stream(streams)
    calib=find_calibration(text)
    polys=parse_paths(text)

    # keep only substantial rings (a garment outline ring is large on at least one axis)
    big=[]
    for p in polys:
        b=bbox(p["pts"]); w=b[2]-b[0]; h=b[3]-b[1]
        # a garment outline ring is substantial on BOTH axes; slivers (grainline,
        # fold lines, seam-allowance offset strips) have a tiny minor axis -> drop.
        if min(w,h)>=45 and max(w,h)>=100 and len(p["pts"])>=8:
            big.append({"poly":p,"bbox":b,"w":w,"h":h,
                        "cx":(b[0]+b[2])/2,"cy":(b[1]+b[3])/2,
                        "area":w*h,"perim":poly_len(p["pts"]),"col":p["color"]})

    # Cluster by centroid proximity: nested sizes of one piece share a centroid.
    # Union-find on centroid distance < THRESH mm.
    THRESH=70.0
    n=len(big); parent=list(range(n))
    def find(a):
        while parent[a]!=a: parent[a]=parent[parent[a]]; a=parent[a]
        return a
    def union(a,b):
        ra,rb=find(a),find(b)
        if ra!=rb: parent[ra]=rb
    for i in range(n):
        for j in range(i+1,n):
            if math.hypot(big[i]["cx"]-big[j]["cx"], big[i]["cy"]-big[j]["cy"])<THRESH:
                union(i,j)
    groups={}
    for i in range(n): groups.setdefault(find(i),[]).append(i)

    pieces=[]
    for idxs in groups.values():
        members=[big[i] for i in idxs]
        # a real piece: overall extent > 100mm and >=3 rings (nested sizes) OR very large single
        colors={}
        for m in members:
            # per color keep the ring with the largest area (the true outline of that size)
            c=m["col"]
            if c not in colors or m["area"]>colors[c]["area"]:
                colors[c]=m
        ring_list=sorted(colors.values(), key=lambda m:m["area"])
        outer=ring_list[-1]
        # size rings: those within an order of magnitude of the max (exclude stray marks)
        maxa=outer["area"]
        size_rings=[m for m in ring_list if m["area"]>=0.15*maxa]
        inner=size_rings[0]
        # overall union bbox for position/extent
        ub=union_bbox([m["poly"] for m in members])
        ext_w=ub[2]-ub[0]; ext_h=ub[3]-ub[1]
        if max(ext_w,ext_h)<150:   # too small to be a garment piece
            continue
        if len(size_rings)<4:      # a nested multi-size piece must show several sizes
            continue
        cx=(ub[0]+ub[2])/2; cy=(ub[1]+ub[3])/2
        pieces.append({
            "ub":ub,"cx":cx,"cy":cy,
            "outer":outer,"inner":inner,
            "ring_count":len(size_rings),"total_colors":len(colors),
        })
    pieces.sort(key=lambda p:p["outer"]["area"], reverse=True)

    def pos(cx,cy):
        col="L" if cx<page_w_mm/3 else ("C" if cx<2*page_w_mm/3 else "R")
        row="T" if cy>2*page_h_mm/3 else ("M" if cy>page_h_mm/3 else "B")
        return f"{row}-{col}"

    out={
        "page_bbox_mm":{"w":round(page_w_mm,2),"h":round(page_h_mm,2)},
        "calibration":(None if not calib else
            {"source":calib[0],"pt":round(calib[1],3),"mm":round(calib[2],3)}),
        "piece_count":len(pieces),"pieces":[]
    }
    for p in pieces:
        ow=p["outer"]["w"]; oh=p["outer"]["h"]; oper=p["outer"]["perim"]
        closed_ratio = oper/(2*(ow+oh)) if (ow+oh)>0 else 0
        ambiguous = closed_ratio < 0.55   # open arc / fragment, not a full closed ring
        out["pieces"].append({
            "approx_position":pos(p["cx"],p["cy"]),
            "closed_ring_ratio":round(closed_ratio,2),
            "ambiguous_fragment":ambiguous,
            "centroid_mm":[round(p["cx"],1),round(p["cy"],1)],
            "bbox_w_mm":round(p["outer"]["w"],1),
            "bbox_h_mm":round(p["outer"]["h"],1),
            "outer_perimeter_mm":round(p["outer"]["perim"],1),
            "inner_bbox_w_mm":round(p["inner"]["w"],1),
            "inner_bbox_h_mm":round(p["inner"]["h"],1),
            "inner_perimeter_mm":round(p["inner"]["perim"],1),
            "ring_count":p["ring_count"],
            "total_color_groups":p["total_colors"],
        })
    return out

def main():
    results={}
    for name,path in PDFS.items():
        results[name]=process(name,path)
    with open("/tmp/bugra-geometry.json","w") as f:
        json.dump(results,f,indent=2)

    for name,r in results.items():
        print("="*78)
        print(f"PDF: {name}")
        print(f"  page: {r['page_bbox_mm']['w']} x {r['page_bbox_mm']['h']} mm  "
              f"(A0 ref 841x1189)")
        c=r["calibration"]
        if c: print(f"  SCALE PROOF: {c['source']} = {c['pt']}pt = {c['mm']}mm (expect 40.0)")
        else: print("  SCALE PROOF: no ruler found; relying on MediaBox=A0")
        print(f"  pieces detected: {r['piece_count']}")
        print(f"  {'pos':4} {'W_mm':>7} {'H_mm':>7} {'perim_mm':>9} "
              f"{'rings':>5} {'colors':>6}  {'inner WxH':>14}")
        for p in r["pieces"]:
            flag=" <FRAGMENT?" if p.get("ambiguous_fragment") else ""
            print(f"  {p['approx_position']:4} {p['bbox_w_mm']:7.1f} {p['bbox_h_mm']:7.1f} "
                  f"{p['outer_perimeter_mm']:9.1f} {p['ring_count']:5d} "
                  f"{p['total_color_groups']:6d}  "
                  f"{p['inner_bbox_w_mm']:6.1f}x{p['inner_bbox_h_mm']:.1f}{flag}")
    print("\nJSON -> /tmp/bugra-geometry.json")

if __name__=="__main__":
    main()
