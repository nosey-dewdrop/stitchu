#!/usr/bin/env python3
# ============================================================================
# gen-size-table — the size table becomes a CONTRACT file.
#
# printpack.py (an L4 referee surface) used to `import mapping` to print the
# size table — the one forbidden read katman-lint reported. The table is L1
# data, so it lives in contract/layers/size-table.json: this generator
# PRODUCES it, printpack CONSUMES the JSON, and the lint runs strict.
#
#   gen-size-table.py           write contract/layers/size-table.json
#   gen-size-table.py --check   exit 1 if the file is stale (harness H0 runs this)
#
# ---------------------------------------------------------------------------
# T16 (17.08) — THE GIRTHS COME FROM THE CONTRACT NOW, NOT FROM mapping.py.
#
# There were TWO body tables and they disagreed. This file used to publish
# mapping.graded_body(), i.e. bodies/mean_all.yaml (a scan mean) graded off
# EU38; the ENGINE drafts from contract/tables.json draft.euSizeChart via
# euSize(). The gap was constant and large:
#
#     EU34..EU46   bust -0.159   waist +2.334   hip -2.522  cm
#     EU48         bust -2.159   waist +0.334   hip -4.522  cm
#
# and printpack.py prints THIS file to the buyer under the heading
# "BEDEN TABLOSU (vucut olculeri, cm)". So the PDF advertised a body the
# pattern was never drafted for — a buyer who measures a 72.3cm waist was
# sold a pattern cut for 70.0cm. That is the sharp end of the two-table bug.
#
# The chart wins, and the reasons are countable, not aesthetic:
#   1. it is what the engine actually drafts (euSize() has 11 consumers,
#      h10_gate_check / surface-pattern / tech-pack / backend/draft.js
#      among them); this file had exactly ONE functional consumer,
#      printpack.py:1380, and it is a text surface.
#   2. it is the PUBLISHED EU chart a buyer picks a size from; mean_all is a
#      scan mean whose EU38 is EU38 only by our own naming.
#   3. contract/layers/shape-ratios.json already declares the division of
#      labour: mean_all supplies the DIMENSIONLESS front/back split, the
#      chart supplies the absolute quantity. This file was the one place
#      that broke it by publishing absolute girths out of mean_all.
#
# mapping.py is still imported for SIZES — the shipped size RANGE (8 of the
# chart's 10 rows). That is a range, not a measurement. No girth is invented
# here and none is derived: every number is copied out of the contract.
# ============================================================================
import json
import sys
from pathlib import Path

import mapping

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'contract/layers/size-table.json'
TABLES = ROOT / 'contract/tables.json'


def build():
    chart = json.loads(TABLES.read_text())['draft']['euSizeChart']
    fields = chart['_fields']
    i_bust = fields.index('bustCM')
    i_waist = fields.index('waistCM')
    i_hip = fields.index('hipCM')
    table = {}
    for label in mapping.SIZES:
        row = chart[label]
        table[label] = {
            'bust': row[i_bust],
            'waist': row[i_waist],
            'hips': row[i_hip],
        }
    return {
        'comment': 'body girths (cm) per EU size, COPIED from '
                   'contract/tables.json draft.euSizeChart — the same table '
                   'the engine drafts from (sizechart.hpp euSize). Edit the '
                   'contract, then regenerate. Rows are the shipped size '
                   'range (mapping.SIZES); the chart itself carries EU50/52 '
                   'too. See the T16 note at the head of gen-size-table.py.',
        'sizes': mapping.SIZES,
        'girths_cm': table,
    }


def main():
    fresh = json.dumps(build(), indent=2, ensure_ascii=False) + '\n'
    if '--check' in sys.argv:
        if not OUT.exists() or OUT.read_text() != fresh:
            print(f'size-table BAYAT: {OUT} contract/tables.json ile '
                  f'uyuşmuyor — gen-size-table.py koş')
            return 1
        print('  ok size-table taze')
        return 0
    OUT.write_text(fresh)
    print(f'yazıldı: {OUT}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
