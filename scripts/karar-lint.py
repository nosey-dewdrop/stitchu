#!/usr/bin/env python3
# ============================================================================
# karar-lint — A DECISION THAT WAS NEVER EXECUTED IS A RED LIGHT, NOT A NOTE.
#
# Diagnosed 2026-08-16. Every session starts from the files with no memory of the
# last one. A session researches something, writes the conclusion into ROADMAP.md,
# and moves on; the next session reads the file, does not know the conclusion was
# never acted on, and re-derives something else. Two months of that.
#
# The proof is BFF and OptCuts: ROADMAP.md has listed them for months under
# "✅ ALINIR" — researched, licence-cleared, decided — and core/third_party/
# contains neither. Instead the flattener was hand-written, and a night was then
# spent debugging its conditioning.
#
# So decisions stop living in prose. contract/layers/decisions.json holds each
# one with the path that would EXIST if it had been carried out, and this script
# says out loud, on every harness run, which ones are still only words.
#
#   karar-lint.py            report
#   karar-lint.py --strict   exit 1 if any decision is unexecuted
# ============================================================================
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / 'contract/layers/decisions.json'


def main() -> int:
    if not LEDGER.exists():
        print(f'karar defteri yok: {LEDGER}')
        return 1
    doc = json.loads(LEDGER.read_text())
    kararlar = doc.get('kararlar', [])
    yapilmadi = []

    print('== KARAR DEFTERI — yazilmis ama yapilmamis olan ==')
    for k in kararlar:
        var = (ROOT / k['kanit_yolu']).exists()
        print(f"  {'ok  ' if var else 'YOK '} {k['id']:<20} {k['karar'][:64]}")
        if not var:
            print(f"       kanit yolu : {k['kanit_yolu']}")
            print(f"       kaynak     : {k['kaynak']}")
            yapilmadi.append(k)

    if not yapilmadi:
        print('  butun kararlar uygulanmis')
        return 0

    print(f"\n  {len(yapilmadi)}/{len(kararlar)} KARAR SADECE YAZI HALINDE.")
    print('  Bir karari ROADMAP\'e yazip gecmek onu yapmis saymaz. Ya uygula,')
    print('  ya defterden cikar ve NEDEN vazgecildigini yaz.')
    return 1 if '--strict' in sys.argv else 0


if __name__ == '__main__':
    sys.exit(main())
