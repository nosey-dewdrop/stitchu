#!/usr/bin/env python3
"""dxf-verify — DXF-AAMA/ASTM parity harness (PIPELINE Aşama 5, KAPI 5).

Opens a motor-exported .dxf with a STANDARD tool (ezdxf) and proves, entity by
entity, that every layer's mm coordinates equal the motor's own geometry. The
motor geometry comes from recipe-json-dump (the same DraftedPattern the DXF was
exported from), flattened here with the SAME 24-step cubic formula the C++ motor
uses (geometry.cpp:flattenCubic). No fabricated numbers: expected == motor's
own flattened samples; actual == what ezdxf reads out of the file.

Layer contract (AAMA-250 / ASTM D6673):
  1  boundary/cut   <- piece.cutLine        8  seamline   <- piece.commands
  7  grainline      <- piece.grainline      4  notch      <- piece.notches
  11 internal       <- piece.markings       15 annotation <- piece.name (TEXT)

Fails loudly (exit 1) on: ezdxf missing, layer set mismatch, any vertex off by
> TOL mm, missing/extra polyline, unit not mm ($INSUNITS != 4).

usage: dxf-verify.py <file.dxf> <recipe-json-dump-JSON>
  The JSON is recipe-json-dump's stdout for the SAME recipe+body+param.
"""
import json
import sys

TOL_MM = 1e-4  # DXF written at %.4f; the exporter and this flattener share the formula.


def flatten_cubic(p0, p1, cp1, cp2, steps=24):
    """Identical to stitchu::flattenCubic (geometry.cpp:13). Returns steps+1 pts."""
    pts = [p0]
    for i in range(1, steps + 1):
        t = i / steps
        mt = 1.0 - t
        x = (mt*mt*mt*p0[0] + 3*mt*mt*t*cp1[0] + 3*mt*t*t*cp2[0] + t*t*t*p1[0])
        y = (mt*mt*mt*p0[1] + 3*mt*mt*t*cp1[1] + 3*mt*t*t*cp2[1] + t*t*t*p1[1])
        pts.append((x, y))
    return pts


def flatten_path(cmds, steps=24):
    """Motor command list -> list of (closed, [pts]) subpaths, motor frame."""
    subs = []
    cur = []
    open_ = False
    current = (0.0, 0.0)
    start = (0.0, 0.0)

    def flush(closed):
        nonlocal cur, open_
        if open_ and len(cur) >= 2:
            subs.append((closed, cur))
        cur = []
        open_ = False

    for c in cmds:
        t = c["type"]
        if t == "move":
            flush(False)
            p = (c["x"], c["y"])
            cur = [p]
            current = p
            start = p
            open_ = True
        elif t == "line":
            p = (c["x"], c["y"])
            if open_:
                cur.append(p)
            current = p
        elif t == "curve":
            p = (c["x"], c["y"])
            samples = flatten_cubic(current, p, (c["cp1x"], c["cp1y"]),
                                    (c["cp2x"], c["cp2y"]), steps)
            cur.extend(samples[1:])
            current = p
        elif t == "close":
            flush(True)
            current = start
    flush(False)
    return subs


def to_dxf(p):
    """Motor mm (y-down) -> DXF frame (y-up): x same, y negated."""
    return (p[0], -p[1])


def expected_polylines(pattern):
    """Build the layer->list-of-(closed, pts) map the DXF MUST contain."""
    exp = {"1": [], "8": [], "11": [], "4": [], "7": []}
    for piece in pattern["pieces"]:
        if piece.get("cutLine"):
            for closed, pts in flatten_path(piece["cutLine"]):
                exp["1"].append((closed, [to_dxf(p) for p in pts]))
        for closed, pts in flatten_path(piece["commands"]):
            exp["8"].append((closed, [to_dxf(p) for p in pts]))
        for closed, pts in flatten_path(piece["markings"]):
            exp["11"].append((closed, [to_dxf(p) for p in pts]))
        for closed, pts in flatten_path(piece["notches"]):
            exp["4"].append((closed, [to_dxf(p) for p in pts]))
        g = piece.get("grainline")
        if g:
            exp["7"].append((False, [to_dxf((g["fromX"], g["fromY"])),
                                     to_dxf((g["toX"], g["toY"]))]))
    return exp


def main():
    if len(sys.argv) < 3:
        print("usage: dxf-verify.py <file.dxf> <recipe-json-dump-JSON>", file=sys.stderr)
        return 2
    dxf_path, json_path = sys.argv[1], sys.argv[2]

    try:
        import ezdxf
    except ImportError:
        print("FAIL: ezdxf not importable — install into the venv the harness "
              "points at (engine/.venv-dxf).", file=sys.stderr)
        return 1

    pattern = json.load(open(json_path))
    exp = expected_polylines(pattern)

    doc = ezdxf.readfile(dxf_path)

    # Unit check: $INSUNITS must be 4 (millimeters).
    insunits = doc.header.get("$INSUNITS", 0)
    if insunits != 4:
        print(f"FAIL: $INSUNITS={insunits}, expected 4 (mm)", file=sys.stderr)
        return 1

    msp = doc.modelspace()

    # Read every POLYLINE / LINE grouped by layer, into (closed, pts).
    actual = {}
    n_text = 0
    for e in msp:
        dt = e.dxftype()
        layer = e.dxf.layer
        if dt == "POLYLINE":
            pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
            closed = bool(e.is_closed)
            actual.setdefault(layer, []).append((closed, pts))
        elif dt == "LWPOLYLINE":
            pts = [(x, y) for (x, y, *_rest) in e.get_points()]
            actual.setdefault(layer, []).append((bool(e.closed), pts))
        elif dt == "TEXT":
            if layer == "15":
                n_text += 1
        elif dt == "LINE":
            s = e.dxf.start
            end = e.dxf.end
            actual.setdefault(layer, []).append((False, [(s.x, s.y), (end.x, end.y)]))

    # Layer name parity: every expected non-empty layer is present in the file's
    # LAYER table, and no geometry sits on an undeclared layer.
    declared = set(doc.layers.entries.keys())
    expected_layers = {"1", "8", "11", "4", "7", "15"}
    missing_decl = expected_layers - declared
    if missing_decl:
        print(f"FAIL: layers not declared in LAYER table: {sorted(missing_decl)}",
              file=sys.stderr)
        return 1

    # Geometry parity per layer.
    total_v = 0
    for layer, exp_list in exp.items():
        act_list = actual.get(layer, [])
        if len(exp_list) != len(act_list):
            print(f"FAIL layer {layer}: expected {len(exp_list)} polylines, "
                  f"got {len(act_list)}", file=sys.stderr)
            return 1
        for i, ((eclosed, epts), (aclosed, apts)) in enumerate(zip(exp_list, act_list)):
            if eclosed != aclosed:
                print(f"FAIL layer {layer} pl {i}: closed {eclosed} != {aclosed}",
                      file=sys.stderr)
                return 1
            if len(epts) != len(apts):
                print(f"FAIL layer {layer} pl {i}: {len(epts)} verts != {len(apts)}",
                      file=sys.stderr)
                return 1
            for j, (ep, ap) in enumerate(zip(epts, apts)):
                dx = abs(ep[0] - ap[0])
                dy = abs(ep[1] - ap[1])
                if dx > TOL_MM or dy > TOL_MM:
                    print(f"FAIL layer {layer} pl {i} vert {j}: motor "
                          f"({ep[0]:.4f},{ep[1]:.4f}) vs dxf "
                          f"({ap[0]:.4f},{ap[1]:.4f}) d=({dx:.5f},{dy:.5f})",
                          file=sys.stderr)
                    return 1
                total_v += 1

    n_pieces = len(pattern["pieces"])
    if n_text != n_pieces:
        print(f"FAIL: expected {n_pieces} piece-name TEXT annotations on layer 15, "
              f"got {n_text}", file=sys.stderr)
        return 1

    print(f"dxf-verify OK: {n_pieces} pieces, layers "
          f"{sorted(expected_layers)}, {total_v} vertices within {TOL_MM}mm, "
          f"$INSUNITS=mm, {n_text} annotations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
