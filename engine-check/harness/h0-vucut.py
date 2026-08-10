#!/usr/bin/env python3
# ============================================================================
# H0 — L0 SINIR TESTİ: tek vücut kontratı taze mi, stilizasyon makası kımıldadı mı?
# FAIL ⇒ vücut kaynakları ayrışmış demektir; alt katman arızası aramadan ÖNCE
# bunu kapat (teşhis ilkesi: docs/KATMAN-HARITASI.md).
# ============================================================================
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
KONTRAT = ROOT / 'contract/layers/body.EU38.json'
TOL_FAKTOR = 0.02   # stilizasyon faktörü drift kilidi

fails = []
if not KONTRAT.exists():
    print('H0 FAIL: contract/layers/body.EU38.json yok — uret-body-kontrat.py koş')
    sys.exit(1)
mevcut = json.loads(KONTRAT.read_text())

# 1) TAZELİK: üretici bugün koşulsa aynı dosyayı mı üretir?
r = subprocess.run([sys.executable, str(ROOT / 'engine-check/harness/uret-body-kontrat.py'), 'EU38'],
                   capture_output=True, text=True, cwd=ROOT)
if r.returncode != 0:
    fails.append('üretici koşamadı: ' + r.stderr.strip()[:200])
else:
    taze = json.loads(KONTRAT.read_text())
    if taze != mevcut:
        fails.append('kontrat BAYAT: kaynaklar (figure-bands / mean_all / GRADE_PER_SIZE) değişmiş, '
                     'kontrat yeniden üretilip fark incelenmeli')
        KONTRAT.write_text(json.dumps(mevcut, indent=2, ensure_ascii=False) + '\n')  # dokunma, geri koy

# 2) STİLİZASYON MAKASI: pinli faktörler (ilk ölçüm 2026-08-10) drift etmesin
# İlk ölçüm 2026-08-10 (EU38): bel 0.8198/0.8235, kalça 1.2093/1.0414.
PIN = {'bel_stilizasyon_faktoru': 0.9955, 'kalca_stilizasyon_faktoru': 1.1612}
m = mevcut['stilizasyon_makasi']
for k, pin in PIN.items():
    if abs(m[k] - pin) > TOL_FAKTOR:
        fails.append(f'{k} {m[k]} pin {pin} ±{TOL_FAKTOR} DIŞINDA — croquis ile gerçek vücut ayrıştı')

# 3) sağlamlık: 26 ölçü tam mı, pozitif mi?
if len(mevcut['olculer_cm']) != 26:
    fails.append(f"ölçü sayısı {len(mevcut['olculer_cm'])} != 26")
if any(v <= 0 for v in mevcut['olculer_cm'].values()):
    fails.append('pozitif olmayan ölçü var')

if fails:
    print('H0 FAIL:\n  - ' + '\n  - '.join(fails)); sys.exit(1)
print(f"H0 OK: L0 tek vücut kontratı taze; bel stilizasyonu x{m['bel_stilizasyon_faktoru']}, "
      f"kalça x{m['kalca_stilizasyon_faktoru']} pinlerinde")
