#!/usr/bin/env python3
"""Compare Swift and C++ golden dumps: same lines, numbers within 0.1 mm.

Usage: python3 golden-diff.py /tmp/golden-swift.csv /tmp/golden-cpp.csv
"""
import sys

TOLERANCE = 0.1


def parse(path):
    with open(path) as f:
        return [line.rstrip("\n") for line in f if line.strip()]


def main():
    swift_lines = parse(sys.argv[1])
    cpp_lines = parse(sys.argv[2])
    if len(swift_lines) != len(cpp_lines):
        print(f"LINE COUNT MISMATCH: swift {len(swift_lines)} vs cpp {len(cpp_lines)}")
        return 1

    mismatches = 0
    max_delta = 0.0
    for lineno, (s, c) in enumerate(zip(swift_lines, cpp_lines), 1):
        sp, cp = s.split(","), c.split(",")
        if len(sp) != len(cp):
            print(f"line {lineno}: field count differs\n  swift: {s}\n  cpp:   {c}")
            mismatches += 1
            continue
        for sf, cf in zip(sp, cp):
            try:
                sv, cv = float(sf), float(cf)
            except ValueError:
                if sf != cf:
                    print(f"line {lineno}: text field differs: {sf!r} vs {cf!r}")
                    mismatches += 1
                continue
            delta = abs(sv - cv)
            max_delta = max(max_delta, delta)
            if delta > TOLERANCE:
                print(f"line {lineno}: {sv} vs {cv} (delta {delta:.4f})\n  swift: {s}\n  cpp:   {c}")
                mismatches += 1

    print(f"compared {len(swift_lines)} lines, max numeric delta {max_delta:.6f} mm")
    if mismatches:
        print(f"GOLDEN DIFF FAILED: {mismatches} mismatch(es)")
        return 1
    print("GOLDEN DIFF PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
