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

adim "H1 — L1 tasarım uzayı: katman zabıtası (STRICT — ihlal = arıza)"
python3 "$ROOT/scripts/katman-lint.py" --strict || FAILS=$((FAILS+1))
"$VENVPY" "$ROOT/engine/pattern-bridge/gen-size-table.py" --check || FAILS=$((FAILS+1))
# the body's FRONT/BACK split is a contract too: shape-ratios.json + the
# generated header must both match mapping.py, or the engine is drafting a
# different body than the one the contract publishes.
"$VENVPY" "$ROOT/engine/pattern-bridge/gen-shape-ratios.py" --check || FAILS=$((FAILS+1))

adim "H1b — KARAR DEFTERİ: yazılmış ama yapılmamış karar var mı"
# T17/TUR 9 (17 Ağu): burası `|| true` idi — karar defteri linti HİÇBİR koşulda
# arıza sayılmıyordu. Kasıt/unutma ayrımı ölçüldü (karar-lint.py başlığında
# yazılı): rapor kipi KASITLI (3 yapılmamış karar bilinen açık cephe), ama
# `|| true` bundan fazlasını yutuyordu — defterin KAYBOLMASI da yeşil geçiyordu.
# Artık çıkış kodu ayrışıyor: 0/1 rapor, 2 alet arızası (defter yok/boş/bozuk),
# 3 ratchet kırıldı (yapılmamış karar tavanı aştı). 2 ve 3 ARIZADIR.
python3 "$ROOT/scripts/karar-lint.py"; KL=$?
if [ "$KL" -ge 2 ]; then
  echo "  FAIL H1b — karar defteri (exit $KL: 2=alet arızası, 3=ratchet kırıldı)"
  FAILS=$((FAILS+1))
fi

adim "H2/L2 — shell + drape (ctest alt kümesi)"
if [ -d "$ROOT/engine/build" ]; then
  # T17 (17 Ağu): burası bir kapı DEĞİLDİ. `ctest ... | grep` boru hattının
  # exit kodu ctest'in değil GREP'in koduydu ve ctest arıza hâlinde de
  # "0% tests passed, 1 tests failed" satırını basıyor — grep eşleşiyor,
  # kod 0, arıza SAYILMIYORDU. Ölçüldü: h10_gate_check (kasten kırmızı) ile
  # boru hattı exit 0 döndü. walk.py ile aynı sınıf: hükmünü basan ama
  # iletemeyen hakem. Artık ctest'in KENDİ kodu okunuyor, çıktı ayrıca basılır.
  H2LOG=$(mktemp /tmp/harness-h2-XXXX.log)
  if ctest --test-dir "$ROOT/engine/build" -R "body_volume|garment_shell|drape" \
       >"$H2LOG" 2>&1; then
    grep -E "tests passed|Failed" "$H2LOG" || true
  else
    grep -E "tests passed|Failed" "$H2LOG" || echo "  ctest çıktı vermedi ($H2LOG)"
    echo "  FAIL H2/L2 ctest alt kümesi"; FAILS=$((FAILS+1))
  fi
  rm -f "$H2LOG"
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

adim "H3c — TEK YÜZEY HATTI: motorun kendi spec'i AYNI hakemden YEŞİL geçmeli"
# Faz C'nin motor karşılığı (engine/src/surfacepattern.cpp): bel halkası bir kez
# örneklenir, panel dikişleri inşa gereği eşleşir. Aynı h3b-rings hakemi bu
# spec'te YEŞİL beklenir; eski GC hattı (yukarıda) kırmızı kalır, çünkü kök
# çözüm oraya değil motora kondu — paketleme geçişi ayrı adım.
if [ -x "$ROOT/engine/build/surface-pattern" ]; then
  SPEC3C=$(mktemp /tmp/h3c-spec-XXXX.json)
  if "$ROOT/engine/build/surface-pattern" EU38 >"$SPEC3C" 2>/dev/null \
     && "$VENVPY" "$ROOT/engine-check/harness/h3b-rings.py" "$SPEC3C"; then
    echo "  ok tek yüzey hattı (halka tek sayıda)"
  else
    echo "  FAIL tek yüzey hattı"; FAILS=$((FAILS+1))
  fi
  rm -f "$SPEC3C"
else
  echo "  surface-pattern derlenmemiş (cmake --build engine/build)"; FAILS=$((FAILS+1))
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
