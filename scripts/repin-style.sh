#!/bin/sh
# ============================================================================
# repin-style — KALEM PİNİ. style_check'in ilan ettiği tek dürüst çıkış yolu.
#
# T17 (17 Ağu) `style_check`'i boş koşarken yakaladı: engine/STYLE-PIN/ diskte
# yoktu, test "PASS (nothing to enforce)" basıp yeşil görünüyordu. Test artık
# dürüstçe FAIL ediyor ve çıkış yolu olarak BU SCRIPT'i ilan ediyor — ama
# script hiç yazılmamıştı (TUR 9'da yazıldı). Kapı, kendisinin nasıl
# kapatılacağını söyleyip o yolu var etmemişti.
#
# ⚠ EN ÖNEMLİ KURAL — REGEN-VS-REGEN YASAĞI (DERSLER.md):
#   PİN'İ ÖLÇÜM ÜRETMEZ, KARAR ÜRETİR.
#   style_check kendi çıktısını pinleyemez; pinlerse kalem kendi kendini
#   onaylamış olur ve kapı bir aynaya dönüşür. Bu script de motorun çıktısını
#   sessizce dosyaya yazmaz: önce RENDER'I GÖSTERİR, Damla gözüyle bakar,
#   "bu benim kalemim" cümlesini KENDİ ELİYLE yazar, ancak ondan sonra pin
#   donar. Onay yoksa TEK BAYT yazılmaz.
#   (ANAYASA yasa 5: motorun kendi çıktısı kanıt değildir — göz gerekir.)
#
# Kullanım:
#   scripts/repin-style.sh <styleKey> "<beyan etiketi>"
#   scripts/repin-style.sh --list            pinlenebilir stilleri say
#   scripts/repin-style.sh --status          hangi stil pinli, hangisi değil
#                                            + sıradaki komutu hazır yazar
#
# KAPSAM: style_check'in hüküm listesi bu script'in listesiyle AYNI kaynaktan
# gelir (engine/flat-engine/styles.json). Kısmi pin YEŞİL SAYILMAZ — sözlükteki
# her stil pinlenene kadar kapı kırmızıdır. Yani bu script tek tek koşulur ve
# --status geri kalanı sayar; "bir tane pinledim, kapı yeşil" diye bir hâl yok.
#
# Onaydan sonra yazılanlar (ikisi birden, ayrılamazlar):
#   engine/STYLE-PIN/<styleKey>.svg          pinin kendisi
#   engine/STYLE-PIN/STYLE-PIN.md            tarihli defter girdisi
# İkisini AYNI commit'te commit'le.
# ============================================================================
set -eu
cd "$(dirname "$0")/.."

PIN_DIR="engine/STYLE-PIN"
LEDGER="$PIN_DIR/STYLE-PIN.md"
STYLES="engine/flat-engine/styles.json"
APPROVAL_PHRASE="bu benim kalemim"

style_keys() {
    node -e "const s=require('./$STYLES');console.log(Object.keys(s.styles).join('\n'))"
}

case "${1:-}" in
--list)
    style_keys
    exit 0
    ;;
--status)
    total=0; pinned=0; next=''
    for k in $(style_keys); do
        total=$((total + 1))
        if [ -f "$PIN_DIR/$k.svg" ]; then
            pinned=$((pinned + 1)); echo "  PIN  $k"
        else
            echo "  --   $k"
            [ -n "$next" ] || next="$k"
        fi
    done
    # sahipsiz pin: dizinde var, sözlükte yok — style_check bunu da FAIL sayar
    orphans=0
    if [ -d "$PIN_DIR" ]; then
        for f in "$PIN_DIR"/*.svg; do
            [ -e "$f" ] || continue
            b=$(basename "$f" .svg)
            style_keys | grep -qx "$b" || { orphans=$((orphans + 1)); echo "  ??   $b (SAHİPSİZ: styles.json'da yok)"; }
        done
    fi
    echo
    if [ "$orphans" -gt 0 ]; then
        echo "pinli $pinned / $total stil · SAHİPSİZ PİN $orphans (style_check bunu da FAIL sayar)"
    else
        echo "pinli $pinned / $total stil"
    fi
    if [ "$pinned" -eq "$total" ] && [ "$orphans" -eq 0 ]; then
        echo "kapsam TAM. style_check artık her stili repo pinine byte-byte diff'liyor."
    else
        echo "style_check bu sayı $total olana kadar KIRMIZI kalır (guard.json _ilan_listesi)."
        echo "kısmi pin yeşil saymaz: kapsam kuralı testin İÇİNDE (engine/tests/style_check.mjs)."
        [ -z "$next" ] || {
            echo
            echo "SIRADAKİ KOMUT (kopyala, beyanı kendi cümlenle değiştir):"
            echo "  scripts/repin-style.sh $next \"<beyan, ör. 'F2 çizgi hiyerarşisi, Damla onayı $(date +%d.%m)'>\""
            echo "  -> render açılır, GÖZLE bak, beğenirsen terminale yaz: $APPROVAL_PHRASE"
        }
    fi
    exit 0
    ;;
esac

STYLE="${1:-}"
LABEL="${2:-}"

if [ -z "$STYLE" ] || [ -z "$LABEL" ]; then
    echo "FAIL: stil anahtarı VE beyan etiketi zorunlu."
    echo "usage: scripts/repin-style.sh <styleKey> \"<beyan, ör. 'F2 çizgi hiyerarşisi 3 katman, MIHENK-01 sonrası, Damla onayı 17.08'>\""
    echo "       scripts/repin-style.sh --list | --status"
    exit 1
fi

if ! style_keys | grep -qx "$STYLE"; then
    echo "FAIL: '$STYLE' engine/flat-engine/styles.json'da yok. Pinlenebilirler:"
    style_keys | sed 's/^/  /'
    exit 1
fi

# ---- 1. üretim yolunu koş (style_check'in koştuğu YOLUN AYNISI) --------------
FRESH="/tmp/style-pin-$STYLE.svg"
RUNNER=$(mktemp /tmp/repin-style-run-XXXX.mjs)
cat > "$RUNNER" <<'MJS'
import { writeFileSync } from 'node:fs';
const [, , root, out, style] = process.argv;
const { renderGarmentFlatAsync } = await import(`${root}/engine/tools/render-garment-flat.mjs`);
writeFileSync(out, await renderGarmentFlatAsync([], { style }));
MJS
node "$RUNNER" "$(pwd)" "$FRESH" "$STYLE"
rm -f "$RUNNER"
[ -s "$FRESH" ] || { echo "FAIL: render boş döndü ($FRESH)"; exit 1; }
BYTES=$(wc -c < "$FRESH" | tr -d ' ')

# ---- 2. mevcut pinle kıyas ---------------------------------------------------
if [ -f "$PIN_DIR/$STYLE.svg" ] && cmp -s "$FRESH" "$PIN_DIR/$STYLE.svg"; then
    echo "no-op: '$STYLE' render'ı mevcut pinle byte-identical ($BYTES bayt), pinlenecek bir şey yok"
    exit 0
fi
if [ -f "$PIN_DIR/$STYLE.svg" ]; then
    OLD=$(wc -c < "$PIN_DIR/$STYLE.svg" | tr -d ' ')
    echo "DİKKAT: '$STYLE' ZATEN PİNLİ ve render değişmiş ($OLD -> $BYTES bayt)."
    echo "  Bu bir KALEM REVİZYONU. style_check'in ikinci dürüst yolu:"
    echo "  değişim İSTENMEDİYSE pini oynatma, flat kodunu düzelt."
    echo
fi

# ---- 3. GÖZ — render gösterilir, sayıya bakılarak onaylanmaz ----------------
echo "=============================================================="
echo " STİL   : $STYLE"
echo " RENDER : $FRESH  ($BYTES bayt)"
echo " BEYAN  : $LABEL"
echo "=============================================================="
if command -v open >/dev/null 2>&1; then
    open "$FRESH" || true
    echo "Render açıldı. SVG path'ine bakıp beğenmek YASAK (ANAYASA yasa 5) — çizime bak."
else
    echo "Render'ı elle aç: $FRESH"
fi
echo

# ---- 4. ONAY — insan eliyle, tam cümleyle -----------------------------------
# Onay bir bayrakla, bir ortam değişkeniyle ya da bir --yes ile verilemez:
# tek kanal, terminale ELLE yazılan cümledir. Boru hattından beslenen stdin
# reddedilir — otomasyonun kalemi onaylaması, kapının kendini onaylamasıdır.
if [ ! -t 0 ]; then
    echo "FAIL: onay yalnız TERMİNALDEN alınır (stdin bir tty değil)."
    echo "  Pin bir ÖLÇÜM değil bir KARARDIR; script/CI/ajan onaylayamaz."
    echo "  HİÇBİR ŞEY YAZILMADI."
    exit 1
fi
printf 'Bu render Damla\x27nın kalemi mi? Öyleyse tam olarak şunu yaz: %s\n> ' "$APPROVAL_PHRASE"
read -r ANSWER
if [ "$ANSWER" != "$APPROVAL_PHRASE" ]; then
    echo "İPTAL: onay cümlesi yazılmadı. HİÇBİR ŞEY YAZILMADI (pin de defter de)."
    exit 1
fi

# ---- 5. pin donar + defter girdisi (ikisi birlikte) --------------------------
mkdir -p "$PIN_DIR"
cp "$FRESH" "$PIN_DIR/$STYLE.svg"
SHA=$(shasum -a 256 "$PIN_DIR/$STYLE.svg" | cut -d' ' -f1)
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'no-git')
DATE=$(date +%Y-%m-%d)

if [ ! -f "$LEDGER" ]; then
    {
        echo "# STYLE-PIN DEFTERİ"
        echo
        echo "Her satır bir KALEM KARARIDIR, bir ölçüm değil. Pin \`scripts/repin-style.sh\`"
        echo "ile ve yalnız Damla'nın terminale yazdığı onay cümlesiyle donar; \`style_check\`"
        echo "üretim render'ını bu pine byte-byte diff'ler. Regen-vs-regen kanıt değildir."
        echo
    } > "$LEDGER"
fi
{
    echo "## $DATE — $STYLE"
    echo "- beyan: $LABEL"
    echo "- pin: \`$PIN_DIR/$STYLE.svg\` · $BYTES bayt · sha256 \`$SHA\`"
    echo "- ağaç: \`$COMMIT\`"
    echo "- onay: Damla, terminalde \"$APPROVAL_PHRASE\" (render gözle görüldü)"
    echo
} >> "$LEDGER"

echo
echo "PİNLENDİ: $PIN_DIR/$STYLE.svg ($BYTES bayt, sha256 ${SHA%"${SHA#????????}"}…)"
echo "DEFTER  : $LEDGER"
echo
echo "ŞİMDİ GEREKLİ (pin bunlarsız geçerli değil):"
echo "  1. ikisini AYNI commit'te commit'le (pin + defter ayrılamaz)."
TOTAL=$(style_keys | wc -l | tr -d ' ')
PINNED=$(ls "$PIN_DIR"/*.svg 2>/dev/null | wc -l | tr -d ' ')
echo "  2. kapsam $PINNED/$TOTAL. style_check ancak $TOTAL stilin HEPSİ pinliyken yeşile döner"
echo "     ve .rabadon/guard.json _ilan_listesi'nden ÇIKAR (bitiş şartı orada yazılı)."
echo "     Kısmi pin yeşil saymaz — kapsam kuralı engine/tests/style_check.mjs içinde."
echo "  3. durum + sıradaki komut: scripts/repin-style.sh --status"
