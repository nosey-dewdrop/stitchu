#!/usr/bin/env bash
# GECE/gece.sh -- fazlari AYRI ajan surecleriyle sirayla kosturur (§3.1).
#
# Her faz yeni bir SUREC, yani yeni bir context. Dort fazi ayni oturuma
# sikistirirsan GECE-KOSUSU.md'nin hicbir anlami kalmaz (§1).
#
# Kullanim:  bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &
set -uo pipefail
cd "$(dirname "$0")/.."

FAZLAR=(F1 F2 F3 F4)          # cekirdek; F5+ sabah
mkdir -p GECE/log
DAL=$(git rev-parse --abbrev-ref HEAD)
TMP_KUTUK=$(mkdir -p /tmp/stitchu-gece && cd /tmp/stitchu-gece && pwd -P)/gece-kutuk.txt

# --- kapi muhru: kirilmissa kosu HIC baslamaz
if ! sha256sum -c GECE/kapi.sha; then
  echo "KAPI MUHRU KIRIK -- kosu baslamadi. GECE/kapi.sh ya da GECE/mutasyon.sh degismis."
  exit 1
fi
# --- kirli agacla gece baslamaz: neyin ajandan geldigi ayirt edilemez.
# GECE/log/ haric tutulur -- bu dosyanin kendi ciktisi oraya yaziliyor, yani
# kendi logu yuzunden kendini bloke ederdi. Log yine de commit'e girer (§0.6:
# iki ctest logu kanit olarak kapidan gecer), sadece TEMIZLIK sartinda sayilmaz.
KIRLI=$(git status --porcelain -- . ':!GECE/log')
if [ -n "$KIRLI" ]; then
  echo "CALISMA AGACI KIRLI -- kosu baslamadi. Once commit et ya da temizle."
  echo "$KIRLI" | head -20
  exit 1
fi

echo "=== GECE KOSUSU basladi $(date '+%Y-%m-%d %H:%M') · dal=$DAL · HEAD=$(git rev-parse --short HEAD)"

for F in "${FAZLAR[@]}"; do
  ONCE=$(git rev-parse HEAD)
  echo "$ONCE" > GECE/log/$F.before
  echo "--- $F basliyor $(date +%H:%M) · once=$(git rev-parse --short "$ONCE")"

  DUR(){ # <baslik> <log>
    { echo "## $1: $F  ($(date '+%H:%M'))"
      echo "once commit: $ONCE"
      sed -n '1,80p' "$2"
      echo
    } >> GECE/STOP.md
    # ajanin emegi silinmez, ana daldan ALINIR: reddedilen is kendi dalinda durur
    if [ "$(git rev-parse HEAD)" != "$ONCE" ]; then
      git branch -f "gece/$F-reddedildi" HEAD
      # `git add -A` bu dosyanin KENDI logunu da commit'e almisti; reset --hard
      # sonra onu siliyor ve gece boyunca yazdigimiz kutuk yok oluyordu
      # (21 Agu: F1 reddedilince GECE/log/gece.txt diskten silindi, kabuk
      # silinmis inode'a yazmaya devam etti). Once kenara al, sonra geri koy.
      cp GECE/log/gece.txt "$TMP_KUTUK" 2>/dev/null
      git reset --hard "$ONCE" >/dev/null
      mkdir -p GECE/log; cp "$TMP_KUTUK" GECE/log/gece.txt 2>/dev/null
      echo "    $F reddedildi -> is 'gece/$F-reddedildi' dalinda, $DAL temiz"
    else
      git checkout -- . >/dev/null 2>&1
      git clean -fdq -- engine contract web knowledge vision-student >/dev/null 2>&1
    fi
  }

  # 1) FAZ AJANI -- temiz oturum, sadece kendi brief'ini gorur
  BRIEF=$(awk "/^<!--FAZ:$F-->/,/^<!--FAZ-SON:$F-->/" GECE-KOSUSU.md)
  ORTAK=$(awk '/^# §0/,/^# §5 — FAZLAR/' GECE-KOSUSU.md)
  if [ -z "$BRIEF" ]; then echo "$F: brief bulunamadi, atlandi"; continue; fi

  claude -p "$ORTAK

$BRIEF" \
         --append-system-prompt "$(cat ENV.md; echo; cat RULES.md; echo; cat GECE/KOSU.md)" \
         --allowedTools "Bash,Read,Edit,Write,Grep,Glob" \
         --output-format stream-json --verbose \
         > GECE/log/$F.ajan.txt 2>&1
  echo "    ajan bitti $(date +%H:%M)"

  # `claude -p` API hatasinda bile exit 0 doner ve stream-json'da
  # {"type":"result", ..., "is_error":true} yazar. 21 Agu'da uc faz
  # (F2/F3/F4) tam olarak boyle oldu: ajan hic kosmadi, gece.sh yine de
  # kapiyi calistirip fazi "kirmizi" saydi. Kosmamis faz kirmizi DEGILDIR,
  # KOSMAMISTIR -- ikisi ayni sey degil.
  if grep -q '"type":"result"' GECE/log/$F.ajan.txt 2>/dev/null \
     && grep -q '"is_error":true' GECE/log/$F.ajan.txt; then
     HATA=$(grep -o '"result":"[^"]*"' GECE/log/$F.ajan.txt | head -1)
     echo "    AJAN KOSMADI (API hatasi) -- kapi calistirilmadi"
     { echo "## AJAN KOSMADI: $F  ($(date +%H:%M))"
       echo "once commit: $ONCE"
       echo "$HATA"
       echo "Bu faz KIRMIZI degil, HIC KOSMADI. Yeniden acilabilir."
       echo
     } >> GECE/STOP.md
     continue
  fi

  # 2) MAKINE KAPISI (K1..K7)
  if ! bash GECE/kapi.sh "$F" "$ONCE" > GECE/log/$F.kapi.txt 2>&1; then
     echo "    KAPI KIRMIZI"; DUR "KAPI KIRMIZI" GECE/log/$F.kapi.txt; continue
  fi
  echo "    kapi yesil $(date +%H:%M)"

  # 3) COMMIT (yerel, push YOK) -- mutasyon temiz agac ister
  git add -A
  git commit -q -m "$F: $(head -1 "GECE/$F.md" | sed 's/^#* *//')" || true

  # 4) MUTASYON -- kapi gercekten bir NESNE mi olcuyor
  if ! bash GECE/mutasyon.sh "$F" > GECE/log/$F.mutasyon.txt 2>&1; then
     echo "    MUTASYON DUSTU (kapi bos)"; DUR "MUTASYON DUSTU (kapi bos)" GECE/log/$F.mutasyon.txt; continue
  fi
  echo "    mutasyon gecti $(date +%H:%M)"

  # 5) HAKEM -- brief'i GORMEYEN temiz oturum
  claude -p "$(cat GECE/hakem-sorusu.md)" \
         --append-system-prompt "$(cat RULES.md)" \
         --allowedTools "Bash,Read,Grep" \
         > GECE/log/$F.hakem.txt 2>&1
  if ! grep -qi "HAKEM: EVET" GECE/log/$F.hakem.txt; then
     echo "    HAKEM REDDETTI (ya da cevap vermedi)"; DUR "HAKEM REDDETTI" GECE/log/$F.hakem.txt; continue
  fi
  echo "    hakem evet $(date +%H:%M)"

  # 6) BESI DE GECTI -> push
  if git push -q; then
    echo "$F KAPANDI $(date '+%Y-%m-%d %H:%M') $(git rev-parse --short HEAD)" >> GECE/log/ozet.txt
    echo "    $F KAPANDI ve push edildi"
  else
    echo "    push patladi -- commit yerelde duruyor"
    echo "## PUSH PATLADI: $F ($(date +%H:%M)) commit yerelde" >> GECE/STOP.md
  fi
done

echo "=== GECE KOSUSU bitti $(date '+%Y-%m-%d %H:%M')"
[ -f GECE/STOP.md ] && { echo "--- STOP.md:"; cat GECE/STOP.md; }
[ -f GECE/log/ozet.txt ] && { echo "--- kapanan fazlar:"; cat GECE/log/ozet.txt; }
exit 0
