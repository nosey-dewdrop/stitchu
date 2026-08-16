#!/usr/bin/env bash
# ============================================================================
# taban.sh — TEK KOMUT, TEK HÜKÜM. Motorun o andaki hâlinin mührü.
#
# Neden var: 12 Ağu'da 8 bedenin yüzey paketi ELLE üretildi; onu yeniden üreten
# commitli hiçbir script yoktu. Yani "taban" diye gösterilen şey yeniden
# üretilemiyordu — compounding error tam olarak böyle görünmez kalır. Bu script
# tabanı ÜRETİR, ÖLÇER ve MÜHÜRLER; iki koşuda aynı manifest çıkmazsa
# determinizm zaten kırıktır ve iş orada durur.
#
# Kullanım:
#   scripts/taban.sh                 # tam taban (build + ctest + harness + 8 beden paket)
#   scripts/taban.sh --hizli         # paketleri atla (yalnız motor + hakem), iterasyon için
#   scripts/taban.sh --etiket F1.3   # mühür adı (varsayılan: git kısa sha)
#
# Çıktı: Logs/taban-<etiket>/
#   manifest.sha256   <- KARŞILAŞTIRILAN ŞEY (zaman damgası YOK, sıralı)
#   taban.txt         <- insan okunur hüküm + panel
#   ctest.log · harness.log · strain.txt · specs/ · packs/
# ============================================================================
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SIZES=(EU34 EU36 EU38 EU40 EU42 EU44 EU46 EU48)
GCPY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
BRPY="$ROOT/engine/pattern-bridge/.venv/bin/python"

HIZLI=0
ETIKET=""
while [ $# -gt 0 ]; do
  case "$1" in
    --hizli) HIZLI=1; shift;;
    --etiket) ETIKET="${2:-}"; shift 2;;
    *) echo "bilinmeyen argüman: $1" >&2; exit 2;;
  esac
done
[ -n "$ETIKET" ] || ETIKET="$(git rev-parse --short HEAD 2>/dev/null || echo nogit)"

OUT="$ROOT/Logs/taban-$ETIKET"
rm -rf "$OUT"
mkdir -p "$OUT/specs" "$OUT/packs"

FAILS=0
RAPOR="$OUT/taban.txt"
: >"$RAPOR"
say() { echo "$@" | tee -a "$RAPOR"; }
adim() { say ""; say "== $*"; }

say "TABAN MÜHRÜ — $ETIKET"
say "git:  $(git rev-parse HEAD 2>/dev/null || echo -)"
say "kirli çalışma ağacı: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') dosya"

# ---------------------------------------------------------------- 1. BUILD
adim "1. BUILD (Release — boş CMAKE_BUILD_TYPE tuzağı: 19s → 2684s)"
cmake -S engine -B engine/build -DCMAKE_BUILD_TYPE=Release >"$OUT/cmake.log" 2>&1 \
  && cmake --build engine/build -j8 >>"$OUT/cmake.log" 2>&1 \
  && say "  ok build" || { say "  FAIL build (cmake.log)"; FAILS=$((FAILS+1)); }

# ---------------------------------------------------------------- 2. CTEST
adim "2. CTEST (tam süit)"
ctest --test-dir engine/build --output-on-failure >"$OUT/ctest.log" 2>&1
CT=$(grep -Eo '[0-9]+% tests passed, [0-9]+ tests failed out of [0-9]+' "$OUT/ctest.log" | tail -1)
say "  ${CT:-ÇIKTI OKUNAMADI}"
grep -q "100% tests passed" "$OUT/ctest.log" || { say "  FAIL ctest"; FAILS=$((FAILS+1)); }

# ---------------------------------------------------------------- 3. HARNESS
adim "3. TEŞHİS HARNESİ (H0/H1/H2/H3b/H3c/H4)"
bash engine-check/harness/run-all.sh >"$OUT/harness.log" 2>&1 \
  && say "  ok harness" || { say "  FAIL harness (harness.log)"; FAILS=$((FAILS+1)); }

# ---------------------------------------------------------------- 4. GERİNİM
adim "4. GERİNİM HARİTASI (satır bandı — suppression kararının girdisi)"
if [ -x engine/build/surface_pattern_check ]; then
  STITCHU_SP_DEBUG=1 ./engine/build/surface_pattern_check >"$OUT/strain.txt" 2>&1
  # panel başına sınır satırı: kesim çizgisi sözleşmesi
  grep "sınır:" "$OUT/strain.txt" | sed 's/^/  /' | tee -a "$RAPOR" >/dev/null
  grep "sınır:" "$OUT/strain.txt" | sed 's/^/  /'
else
  say "  FAIL surface_pattern_check yok"; FAILS=$((FAILS+1))
fi

# ---------------------------------------------------------------- 5. 8 BEDEN
adim "5. YÜZEY MOTORU — 8 BEDEN SPEC + HAKEM"
WALKTOT=0; WALKPASS=0
for S in "${SIZES[@]}"; do
  SPEC="$OUT/specs/$S.json"
  if ! ./engine/build/surface-pattern "$S" >"$SPEC" 2>"$OUT/specs/$S.motor.txt"; then
    say "  FAIL $S: surface-pattern"; FAILS=$((FAILS+1)); continue
  fi
  MOTOR=$(tr -d '\n' <"$OUT/specs/$S.motor.txt")

  # H3c hakemi: motorun kendi spec'i h3b-rings'ten YEŞİL geçmek zorunda
  if "$BRPY" engine-check/harness/h3b-rings.py "$SPEC" >"$OUT/specs/$S.h3b.log" 2>&1; then
    H3C="OK"
  else
    H3C="FAIL"; FAILS=$((FAILS+1))
  fi

  # walk.py — dikiş tapusu
  if "$GCPY" engine/pattern-bridge/walk.py "$SPEC" \
        --out-txt "$OUT/specs/$S.walk.txt" >"$OUT/specs/$S.walk.log" 2>&1; then
    W="OK"
  else
    W="FAIL"; FAILS=$((FAILS+1))
  fi
  # grep -c 0 eşleşmede exit 1 döner; `|| echo 0` iki satır üretip aritmetiği
  # bozuyordu ve DÖNGÜYÜ düşürüyordu (F0'da yakalandı). Sayım artık tek satır.
  P=0; F=0
  if [ -f "$OUT/specs/$S.walk.txt" ]; then
    P=$(grep -c '^PASS' "$OUT/specs/$S.walk.txt" || true); P=${P:-0}
    F=$(grep -c '^FAIL' "$OUT/specs/$S.walk.txt" || true); F=${F:-0}
  fi
  [ "$F" -eq 0 ] || FAILS=$((FAILS+1))
  WALKPASS=$((WALKPASS+P)); WALKTOT=$((WALKTOT+P+F))
  say "  $S  h3c:$H3C  walk:$W $P/$((P+F))  | $MOTOR"
done
say "  WALK TOPLAM: $WALKPASS/$WALKTOT"

# ---------------------------------------------------------------- 6. PAKET
if [ "$HIZLI" -eq 0 ]; then
  adim "6. BASKI PAKETİ (8 beden — 1:1 A0+A4, çentik, pay, test karesi)"
  for S in "${SIZES[@]}"; do
    D="$OUT/packs/pack-$S"; mkdir -p "$D"
    cp "$OUT/specs/$S.json" "$D/stitchu_specification.json" 2>/dev/null || continue
    if "$GCPY" engine/pattern-bridge/printpack.py "$D" --size "$S" --date 2026-01-01 \
         >"$D/printpack.log" 2>&1; then
      DRAWN=$(grep -Eo '[0-9]+ panels in the specification -> [0-9]+ pieces drawn -> [0-9]+ pieces cut' "$D/printpack.log" | tail -1)
      say "  $S  ok  ${DRAWN:-}"
    else
      say "  $S  FAIL printpack"; FAILS=$((FAILS+1))
    fi
  done
else
  adim "6. BASKI PAKETİ — ATLANDI (--hizli)"
fi

# ---------------------------------------------------------------- 7. MANİFEST
adim "7. MÜHÜR (manifest.sha256 — zaman damgasız, sıralı, KARŞILAŞTIRILAN ŞEY)"
# .log dosyaları ZAMAN/SÜRE taşır → mühre GİRMEZ. Mühür yalnız ÜRÜNÜ kapsar:
# spec json, walk tapusu, gerinim, ve paketin PDF/SVG çıktıları.
# NORMALİZASYON: raporlar kendi mutlak yollarını içine yazıyor (walk.py "spec: /.../F0-A/...").
# O yol ÜRÜN DEĞİL, koşum yeridir; mühre girerse her koşu farklı çıkar ve
# determinizm sahte-kırık görünür (F0.2'de yakalandı). Metin dosyaları
# hashlenmeden önce yol normalize edilir; ikili çıktılar ham hashlenir.
: >"$OUT/manifest.sha256"
while IFS= read -r f; do
  case "$f" in
    *.pdf) H=$(shasum -a 256 "$OUT/$f" | cut -d' ' -f1);;
    *)     H=$(sed "s|$OUT|<TABAN>|g; s|$ROOT|<ROOT>|g" "$OUT/$f" | shasum -a 256 | cut -d' ' -f1);;
  esac
  echo "$H  $f" >>"$OUT/manifest.sha256"
done < <( cd "$OUT" && find specs packs strain.txt -type f \
    \( -name '*.json' -o -name '*.walk.txt' -o -name 'strain.txt' \
       -o -name '*.pdf' -o -name '*.svg' \) 2>/dev/null | LC_ALL=C sort )
MSUM=$(shasum -a 256 "$OUT/manifest.sha256" | cut -d' ' -f1)
NFILE=$(wc -l <"$OUT/manifest.sha256" | tr -d ' ')
say "  $NFILE dosya mühürlendi"
say "  MANİFEST SHA256: $MSUM"

# ---------------------------------------------------------------- PANEL
say ""
say "===================== HEDEFTE MİYİZ? ====================="
say "ctest            : ${CT:-?}"
say "harness          : $( [ -f "$OUT/harness.log" ] && tail -1 "$OUT/harness.log" || echo '-' )"
say "walk (8 beden)   : $WALKPASS/$WALKTOT"
say "gerinim (kontur) : $(grep -o 'bel [0-9.]*%' "$OUT/strain.txt" 2>/dev/null | sort -u | tr '\n' ' ')"
say "manifest         : $MSUM"
say "mühür            : $OUT"
say "beklenmedik arıza: $FAILS"
say "=========================================================="

[ "$FAILS" -gt 0 ] && exit 1
exit 0
