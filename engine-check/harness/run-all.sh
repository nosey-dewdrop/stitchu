#!/bin/bash
# ============================================================================
# TEŞHİS HARNESİ — tek komut, katman sınırı testleri (docs/KATMAN-HARITASI.md).
# Beklenmedik FAIL'de çıkış 1. Bilinen açık cephe (H3b, Faz C hedefi) ayrıca
# damgalanır: dondurulmuş kanıtta arıza TEKRARLANMALI (teşhis kaybolmasın),
# Faz C bel'i tek eğriye bağlayınca beklenti YEŞİLE çevrilir.
# ============================================================================
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VENVPY="$ROOT/engine/pattern-bridge/.venv/bin/python"
FAILS=0

adim() { echo; echo "== $1"; }

adim "H0 — L0 tek vücut kontratı (taze + stilizasyon pinleri)"
python3 "$ROOT/engine-check/harness/h0-vucut.py" || FAILS=$((FAILS+1))

adim "H1 — L1 tasarım uzayı: katman zabıtası (rapor modu)"
python3 "$ROOT/scripts/katman-lint.py" || FAILS=$((FAILS+1))

adim "H2/L2 — shell + drape (ctest alt kümesi)"
if [ -d "$ROOT/engine/build" ]; then
  ctest --test-dir "$ROOT/engine/build" -R "body_volume|garment_shell|drape" 2>&1 | grep -E "tests passed|Failed" || FAILS=$((FAILS+1))
else
  echo "engine/build yok — cmake ile kur"; FAILS=$((FAILS+1))
fi

adim "H3b-rings — BİLİNEN AÇIK CEPHE: dondurulmuş kanıtta 2.95mm TEKRARLANMALI"
if "$VENVPY" "$ROOT/engine-check/harness/h3b-rings.py" "$ROOT/Logs/paket-2026-08-06/stitchu_specification.json"; then
  echo "BEKLENMEDİK YEŞİL: kanıt spec'i artık arıza göstermiyor — ya spec değişti ya test köreldi. İNCELE."
  FAILS=$((FAILS+1))
else
  echo "(beklenen kırmızı: arıza L3b'ye mühürlü, kök çözüm Faz C — bel 3B'de tek eğri)"
fi

adim "H3b-flatten kapıları — kanıtlı çözücü sınırları (01/02/07/12; 04-arap YASAK)"
for g in 01-dart-from-curvature 02-gore-flatten-strain 07-seam-solver-v1 12-notch-zone-walk; do
  if python3 "$ROOT/flatten-research/$g.py" >/tmp/harness-$g.log 2>&1; then
    echo "  ok $g"
  else
    echo "  FAIL $g (/tmp/harness-$g.log)"; FAILS=$((FAILS+1))
  fi
done

adim "H4 — L4 hakem (seamdeed testleri)"
( cd "$ROOT/engine/pattern-bridge" && "$VENVPY" test_seamdeed.py >/tmp/harness-seamdeed.log 2>&1 ) \
  && echo "  ok test_seamdeed" || { echo "  FAIL test_seamdeed (/tmp/harness-seamdeed.log)"; FAILS=$((FAILS+1)); }

echo
if [ "$FAILS" -gt 0 ]; then echo "HARNESS: $FAILS beklenmedik arıza"; exit 1; fi
echo "HARNESS OK: tüm sınırlar beklenen durumda (H3b bilinen-kırmızı dahil)"
