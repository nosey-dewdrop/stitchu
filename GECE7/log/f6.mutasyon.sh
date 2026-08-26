#!/usr/bin/env bash
# F6 AJAN MUTASYONLARI — GECE7, §3.8 md.3.
#
# f4.hakem.mutasyon.sh'ten kopyalandı, iki disiplini aynen taşıyor:
#   1. BAYAT İKİLİ TUZAĞI — her turda ikili SİLİNİR, yeniden derlenir, `shasum`
#      ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa "HUKUM YOK".
#   2. ETİKET BİR ÖLÇÜMDÜR — her turun başında
#      `git diff --numstat F6-oncesi..HEAD -- <dosya>` BASILIR.
#      BOŞ = dosyaya BU KARTTA DOKUNULMADI.
#
# ÜÇ tur (M1·M2·M3) `numstat` BOŞ dosyalarda — bu kartın hiç açmadığı yerler.
# ÜÇ tur (M4·M5·M6) bu kartın KENDİ dosyalarında, çünkü yeni kapının iki kolu
# (kontrat↔motor uyuşması, tarayıcı kopyasının kayması) yalnız orada kırılabilir.
#
# ⚠ CIRCIRI HEDEFLEYEN MUTASYON YOK (borç 80/K61): bu kartın kapıları NATIVE
# ikiliyle koşuyor, wasm ile değil, o yüzden C++ mutasyonu doğrudan ulaşıyor.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build
BINS="fabric_catalog_check guide_completeness_check fabric_ease_check"

hash_of() { shasum "$B/$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in $BINS; do o="$o$(hash_of "$b")"; done; echo "$o"; }
build() { for b in $BINS; do rm -f "$B/$b"; done; cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1; }
gate()  { "$B/$1" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }

tur() { # $1=ad $2=dosya $3=sed-ifadesi $4..=aciklama
  local ad="$1" dosya="$2" ifade="$3"; shift 3
  echo ""
  echo "================================================================"
  echo "$ad — $dosya"
  echo "  $*"
  echo "  numstat (F6-oncesi..HEAD): [$(git diff --numstat F6-oncesi..HEAD -- "$dosya" | tr '\n' ' ')]"
  local once; once="$(ikili)"
  cp "$dosya" /tmp/f6.mut.bak
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$dosya" /tmp/f6.mut.bak; then
    echo "  ⚠ KAYNAK KIMILDAMADI — perl ifadesi tutmadi. HUKUM YOK."
    cp /tmp/f6.mut.bak "$dosya"; return
  fi
  build
  local sonra; sonra="$(ikili)"
  if [ "$once" = "$sonra" ]; then
    echo "  ikili: $once -> $sonra  ⚠ KIMILDAMADI (kaynak JSON/JS olabilir; kapi yine de kosuluyor)"
  else
    echo "  ikili: $once -> $sonra  (KIMILDADI)"
  fi
  echo "  fabric_catalog_check      : $(gate fabric_catalog_check)"
  echo "  guide_completeness_check  : $(gate guide_completeness_check)"
  echo "  fabric_ease_check         : $(gate fabric_ease_check)"
  cp /tmp/f6.mut.bak "$dosya"
  build
  echo "  GERI ALINDI -> fabric_catalog_check $(gate fabric_catalog_check) · guide_completeness_check $(gate guide_completeness_check)"
}

echo "F6 MUTASYON LOGU — $(date '+%Y-%m-%d %H:%M')"
echo "HEAD: $(git rev-parse --short HEAD)   etiket: F6-oncesi"
build
echo "TEMIZ AGAC: fabric_catalog_check $(gate fabric_catalog_check) · guide_completeness_check $(gate guide_completeness_check) · fabric_ease_check $(gate fabric_ease_check)"

# ── M1..M3: numstat BOŞ dosyalar (bu kartın hiç açmadığı yerler) ────────────
tur "M1" engine/src/bodice.hpp \
  's/inline double waistEaseFor\(const FabricAxis& f\) \{ return FabricBand::easeFor\(FabricBand::Girth::WaistBodice, f\); \}/inline double waistEaseFor(const FabricAxis\&) { return 0.05; }/' \
  "bel ease'i kumastan KOPARILIYOR (hep dokuma degeri). Beklenen: jersey'in beli poplin'inkiyle esitlenir -> fabric_catalog_check KIRMIZI."

tur "M2" contract/guide-sources.json \
  's/"values": \["4916", "4915", "1.01.01", "301", "6.01.01", "3", "1", "2.5"\]/"values": ["4916"]/' \
  "kayitli kaynagin izin verdigi sayilar SILINIYOR. Beklenen: rehberin bastigi ISO numaralari dayanaksiz kalir -> guide_completeness_check KIRMIZI."

tur "M3" engine/src/garment.cpp \
  's/    pattern\.rehber = rehber::build\(pattern, spec\.fabric\);/    \/\/ MUTASYON: rehber hic kurulmuyor/' \
  "motor rehberi HIC KURMUYOR. Beklenen: zorunlu bolumler eksik -> guide_completeness_check KIRMIZI."

# ── M4..M6: bu kartın kendi kolları ─────────────────────────────────────────
tur "M4" engine/src/fabricease.hpp \
  's/    if \(e < 0\.0 && !recoveryQualifies\(f\)\) return 0\.0;\n//' \
  "TOPARLANMA SARTI kaldiriliyor: D3107 asgarisini tutmayan kumas yine negatif pay aliyor. Beklenen: fabric_catalog_check KIRMIZI (LEG 5)."

tur "M5" web/js/fabric-catalog.js \
  's/    fabricWidthCM: 112\.0,/    fabricWidthCM: 150.0,/' \
  "tarayici kopyasindaki bir sayi kontrattan KAYIYOR. Beklenen: fabric_catalog_check KIRMIZI (LEG 8)."

tur "M6" contract/fabric-catalog-v1.json \
  's/"recovery30minMinPct": 85\.0/"recovery30minMinPct": 80.0/' \
  "kontrattaki yayinlanmis esik motorunkinden AYRISIYOR. Beklenen: fabric_catalog_check KIRMIZI (LEG 2)."

echo ""
echo "================================================================"
echo "KAPANIS — temiz agac geri:"
build
echo "  fabric_catalog_check      : $(gate fabric_catalog_check)"
echo "  guide_completeness_check  : $(gate guide_completeness_check)"
echo "  fabric_ease_check         : $(gate fabric_ease_check)"
echo "  git status --porcelain:"
git status --porcelain | sed 's/^/    /'
