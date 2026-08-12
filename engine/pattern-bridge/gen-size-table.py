#!/usr/bin/env python3
# ============================================================================
# gen-size-table — the size table becomes a CONTRACT file.
#
# printpack.py (an L4 referee surface) used to `import mapping` to print the
# size table — the one forbidden read katman-lint reported. The table is L1
# data, so it lives in contract/layers/size-table.json: mapping PRODUCES it
# here, printpack CONSUMES the JSON, and the lint runs strict.
#
#   gen-size-table.py           write contract/layers/size-table.json
#   gen-size-table.py --check   exit 1 if the file is stale (harness H0 runs this)
# ============================================================================
import json
import sys
from pathlib import Path

import mapping

OUT = Path(__file__).resolve().parents[2] / 'contract/layers/size-table.json'


def build():
    table = {}
    for i, label in enumerate(mapping.SIZES):
        b = mapping.graded_body(i, [])
        table[label] = {
            'bust': round(b['bust'], 4),
            'waist': round(b['waist'], 4),
            'hips': round(b['hips'], 4),
        }
    return {
        'comment': 'graded body girths (cm) per EU size; produced by '
                   'engine/pattern-bridge/gen-size-table.py from mapping.py — '
                   'edit mapping, then regenerate',
        'sizes': mapping.SIZES,
        'girths_cm': table,
    }


def main():
    fresh = json.dumps(build(), indent=2, ensure_ascii=False) + '\n'
    if '--check' in sys.argv:
        if not OUT.exists() or OUT.read_text() != fresh:
            print(f'size-table BAYAT: {OUT} mapping.py ile uyuşmuyor — '
                  f'gen-size-table.py koş')
            return 1
        print('  ok size-table taze')
        return 0
    OUT.write_text(fresh)
    print(f'yazıldı: {OUT}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
