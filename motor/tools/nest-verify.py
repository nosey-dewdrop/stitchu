#!/usr/bin/env python3
# nest-verify: reads a nest MARKER .dxf with ezdxf (an INDEPENDENT CAD library)
# and re-proves the marker contract from the OUTSIDE — not from our own C++ types:
#   1. the file opens in ezdxf and carries the AAMA/ASTM boundary layer "1";
#   2. $INSUNITS == 4 (mm);
#   3. every boundary polygon is inside the fabric strip [0, W] x [-L, 0]
#      (DXF y-up; the motor roll runs down +y so DXF y is <= 0);
#   4. NO two boundary polygons overlap (Shapely, an independent geometry engine)
#      — the overlap==0 claim survives a round trip through a third-party CAD +
#      a third-party geometry kernel.
# Exits non-zero (loud) on any failure. Args: <marker.dxf> <fabricWidthMM>.
import sys

import ezdxf

# Independent overlap kernel: Shapely when present (a third-party geometry
# engine), else a self-contained pure-Python polygon intersection (still an
# INDEPENDENT implementation from the engine's C++ nest::polygonsOverlap). Never
# a silent skip — one of the two always runs.
try:
    from shapely.geometry import Polygon as _Shape
    _HAVE_SHAPELY = True
except ImportError:
    _HAVE_SHAPELY = False


def _seg_intersect(p1, p2, p3, p4):
    def o(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    d1, d2, d3, d4 = o(p3, p4, p1), o(p3, p4, p2), o(p1, p2, p3), o(p1, p2, p4)
    return ((d1 > 0) != (d2 > 0)) and ((d3 > 0) != (d4 > 0))


def _point_in(poly, q):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        a, b = poly[i], poly[j]
        if (a[1] > q[1]) != (b[1] > q[1]):
            xc = a[0] + (q[1] - a[1]) / (b[1] - a[1]) * (b[0] - a[0])
            if q[0] < xc:
                inside = not inside
        j = i
    return inside


def _overlap_area(a, b):
    """~intersection magnitude: >0 iff a proper crossing or containment."""
    na, nb = len(a), len(b)
    for i in range(na):
        for j in range(nb):
            if _seg_intersect(a[i], a[(i + 1) % na], b[j], b[(j + 1) % nb]):
                return 1.0
    if _point_in(b, a[0]) or _point_in(a, b[0]):
        return 1.0
    return 0.0


path, width = sys.argv[1], float(sys.argv[2])
doc = ezdxf.readfile(path)
msp = doc.modelspace()

insunits = doc.header.get("$INSUNITS", None)
assert insunits == 4, f"$INSUNITS != 4 (mm), got {insunits}"

layers = {ly.dxf.name for ly in doc.layers}
assert "1" in layers, f"AAMA boundary layer '1' missing (layers={sorted(layers)})"

boundary = [e for e in msp if e.dxftype() == "POLYLINE" and e.dxf.layer == "1"]
assert len(boundary) >= 2, f"expected >= 2 boundary polygons, got {len(boundary)}"

polys = []
for e in boundary:
    pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
    assert len(pts) >= 3, "boundary polygon has < 3 vertices"
    # inside the fabric strip: x in [0, W], y in [-inf, 0] (DXF y-up)
    for x, y in pts:
        assert -1e-4 <= x <= width + 1e-4, f"x {x:.3f} outside [0,{width}]"
        assert y <= 1e-4, f"y {y:.3f} > 0 (outside the y-down roll in DXF frame)"
    polys.append(pts)

# 4) independent-kernel overlap check: intersection must be ~0 for all pairs.
overlaps = 0
worst = 0.0
for i in range(len(polys)):
    for j in range(i + 1, len(polys)):
        if _HAVE_SHAPELY:
            inter = _Shape(polys[i]).intersection(_Shape(polys[j])).area
        else:
            inter = _overlap_area(polys[i], polys[j])
        worst = max(worst, inter)
        if inter > 1e-3:  # > 0.001 mm^2 = a real overlap
            overlaps += 1
assert overlaps == 0, f"{overlaps} overlapping polygon pairs (worst {worst:.4f})"

kernel = "shapely" if _HAVE_SHAPELY else "pure-python"
print(f"nest-verify {path.split('/')[-1]}: OPENED | {len(polys)} boundary polys | "
      f"insunits=mm | inside [0,{width:.0f}]mm | overlap=0 ({kernel}, worst {worst:.6f})")
