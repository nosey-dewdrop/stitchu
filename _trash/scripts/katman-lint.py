#!/usr/bin/env python3
# ============================================================================
# KATMAN ZABITASI (2026-08-10) — docs/KATMAN-HARITASI.md yasak-okuma matrisi.
# Varsayılan --report: ihlalleri listeler, çıkış 0 (envanter). --strict: çıkış 1.
# İhlal sıfırlanınca run-all.sh --strict'e geçirilir ve sınır kilitlenir.
# ============================================================================
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STRICT = '--strict' in sys.argv

# (dosya/desen, yasak regex, gerekçe)
KURALLAR = [
    ('engine/pattern-bridge/mapping.py', r'figure-bands|figur_croquis',
     'L3b kalıp, flat croquisini DOĞRUDAN okuyamaz — vücut sadece L0 kontratından (bodies/ veya contract/layers/)'),
    ('engine/pattern-bridge/walk.py', r'from mapping import|import mapping',
     'L4 hakem, üreticinin (L3b mapping) içini okuyamaz — sadece spec kontratını'),
    ('engine/pattern-bridge/printpack.py', r'from mapping import|import mapping',
     'L4 hakem, üreticinin içini okuyamaz'),
    ('engine/flat-engine/_engine-full.mjs', r'specification|body\.yaml|mean_all',
     'L3a flat, kalıp dünyasından hiçbir şey okuyamaz'),
    ('engine/tools/reference-flat.mjs', r'specification\.json|body\.yaml|mean_all',
     'L3a render, kalıp dünyasından hiçbir şey okuyamaz'),
    ('engine/src/bodice.cpp', r'figur|croquis',
     'L3b C++ motoru flat croquisini okuyamaz'),
    ('engine/src/skirt.cpp', r'figur|croquis',
     'L3b C++ motoru flat croquisini okuyamaz'),
]

ihlal = 0
kayip = 0
for rel, pat, neden in KURALLAR:
    f = ROOT / rel
    if not f.exists():
        # TUR 9 (17 Ağu) — BURASI BOŞ KOŞUYORDU. Korunan dosya diskte yoksa kural
        # SESSİZCE atlanıyor ve sayıya hiç girmiyordu: yedi dosyanın YEDİSİ birden
        # silinse katman-lint "0 ihlal (STRICT)" basıp exit 0 dönerdi. taban.sh'ın
        # sessiz beden atlaması + BOŞ MÜHÜR ile aynı sınıf (T17 md.4-5): girdisi
        # yokken de yeşil basan kapı, kapı değildir. Kaybolan dosya ihlalden DAHA
        # AĞIRDIR — sınırın kendisi ortadan kalkmıştır, ölçülecek şey yoktur.
        print(f'KAYIP {rel} — korunan dosya diskte YOK; sınır ölçülemiyor ({neden})')
        kayip += 1
        continue
    hits = [(i + 1, l.strip()[:90]) for i, l in enumerate(f.read_text(errors='ignore').splitlines())
            if re.search(pat, l) and not l.strip().startswith(('#', '//', '*'))]
    if hits:
        ihlal += len(hits)
        print(f'İHLAL {rel} — {neden}')
        for n, l in hits[:5]: print(f'    {n}: {l}')
    else:
        print(f'  ok {rel}')

print(f'\nkatman-lint: {ihlal} ihlal, {kayip} kayıp korunan dosya '
      f'({len(KURALLAR)} kural) ({"STRICT" if STRICT else "rapor modu"})')
if kayip:
    print('  KAYIP DOSYA ATLAMA DEĞİLDİR: korunan dosya yoksa katman sınırı')
    print('  ölçülemez. Ya dosya geri gelir, ya kural KURALLAR listesinden')
    print('  çıkarılır ve NEDEN çıkarıldığı yazılır. Sessiz atlama yasak (TUR 9).')
sys.exit(1 if (STRICT and (ihlal or kayip)) else 0)
