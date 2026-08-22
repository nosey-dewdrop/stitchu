#!/usr/bin/env bash
# GECE/gece.sh -- fazlari AYRI ajan surecleriyle sirayla kosturur (§1, §3.1).
#
# v3 (22 Agu): her faz UC ayri oturum acar -- SEF, HAKEM, KATIP. Hicbiri
# digerinin context'inde yasamaz. Sef kod yazmaz, isciyi `Agent` araciyla salar;
# isci tanimlari .claude/agents/ altindadir ve `-p` modunda yuklenir (olculdu).
#
# Kullanim:  bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &
set -uo pipefail
cd "$(dirname "$0")/.."

# --- v3 faz dizileri (§4). Cekirdek bitmeden uzatma acilmaz; kapanis HER
# HALUKARDA kosar -- cekirdek nerede biterse bitsin sabaha F9/F10/F11 kosar.
CEKIRDEK=(F0 F1 F2 F3 F4 F5)
UZATMA=(F6 F7 F8)
KAPANIS=(F9 F10 F11)

# UZATMA'ya girmek icin gereken en az kalan saat. Altindaysa dogruca kapanisa
# gecilir: yarim kalmis bir uzatma fazi, kosulmus bir kapanistan kotudur.
UZATMA_ESIK_SAAT=${UZATMA_ESIK_SAAT:-4}

# Alt-ajanlar ON PLANDA kosmali (§1). Bu degisken dokumanda BULUNAMADI
# (UNVERIFIED, 22 Agu) -- zararsiz oldugu icin set ediliyor, ama guvenilmiyor.
export CLAUDE_CODE_FORK_SUBAGENT=0
# Arka plana dusen alt-ajan `-p` cikisinda 10 dk bekletebiliyor; beklemeyi ac.
export CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=${CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS:-0}

# NOT: `--max-turns` bu surumde YOK (2.1.172; `claude --help`'te sadece
# --max-budget-usd var). Yazsaydik claude flag'i reddederdi ve HER FAZ
# "kosmadi" duserdi. Sefin tur tavani yok; iscilerin var (maxTurns, frontmatter).
# NOT: `--bare` KULLANILMAZ -- .claude/agents/ okunmaz ve isci mimarisi coker.

mkdir -p GECE/log GECE/KART
DAL=$(git rev-parse --abbrev-ref HEAD)
BASLANGIC_SN=$(date +%s)
TMP_KUTUK=$(mkdir -p /tmp/stitchu-gece && cd /tmp/stitchu-gece && pwd -P)/gece-kutuk.txt

# --- kapi muhru: kirilmissa kosu HIC baslamaz
if ! sha256sum -c GECE/kapi.sha; then
  echo "KAPI MUHRU KIRIK -- kosu baslamadi. GECE/kapi.sh ya da GECE/mutasyon.sh degismis."
  exit 1
fi
# --- isci tanimlari olmadan §1 mimarisi yoktur: sef isci salamaz, tek basina
# calisir ve kimse fark etmez. Bu sessiz cokusu burada durduruyoruz.
for A in isci-motor isci-arastirma isci-vitrin hakem katip; do
  [ -f ".claude/agents/$A.md" ] || { echo "ISCI TANIMI YOK: .claude/agents/$A.md -- kosu baslamadi (§1)"; exit 1; }
done
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

echo "=== GECE KOSUSU v3 basladi $(date '+%Y-%m-%d %H:%M') · dal=$DAL · HEAD=$(git rev-parse --short HEAD)"
echo "=== cekirdek: ${CEKIRDEK[*]} · uzatma: ${UZATMA[*]} · kapanis: ${KAPANIS[*]}"

ORTAK=$(awk '/^# §0 DEGISMEZLER|^# §0 DEĞİŞMEZLER/,/^# §4 FAZLAR/' GECE-KOSUSU.md)
if [ -z "$ORTAK" ]; then
  echo "ORTAK BOLUM BULUNAMADI (§0-§3) -- GECE-KOSUSU.md'nin baslik duzeni degismis. Kosu baslamadi."
  exit 1
fi

# ============================================================ tek fazi kosar
faz_kos(){
  local F=$1
  local ONCE; ONCE=$(git rev-parse HEAD)
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
      git clean -fdq -- engine contract web knowledge docs vision-student >/dev/null 2>&1
    fi
  }

  # --- fazin brief'i: SADECE kendi blogu (§2). Digerlerini gormez.
  local BRIEF; BRIEF=$(awk "/^<!--FAZ:$F-->/,/^<!--FAZ-SON:$F-->/" GECE-KOSUSU.md)
  if [ -z "$BRIEF" ]; then echo "$F: brief bulunamadi, atlandi"; return 0; fi

  # --- arastirma fazlarinda sefin de web araci olur; digerlerinde OLMAZ.
  local ARACLAR="Agent,Bash,Read,Grep,Glob,Write,Edit"
  case "$F" in F1|F4|F5|F7) ARACLAR="$ARACLAR,WebSearch,WebFetch" ;; esac

  # ============================================ 1) SEF -- temiz oturum
  claude -p "$ORTAK

$BRIEF

# SENIN ROLUN: SEFSIN (§1)
Bu fazin sefisin. KOD YAZMAZSIN. Isin: bu brief'i gorev kartlarina bolmek,
iscileri \`Agent\` araciyla salmak, donen tutanaklari islemek, fazi kapatmak.

- Isciler: isci-motor (kod/olcum) · isci-arastirma (web, yalniz knowledge/'e yazar)
  · isci-vitrin (docs+web iddia sayimi, yalniz GECE/'ye yazar). subagent_type
  olarak BU ADLARI kullan.
- Isciye giren tek kanal senin Agent prompt'undur. Karti ve dosya yollarini
  prompt'a YAZ; 'KOSU.md'ye bak' deme. KOSU.md ve bu brief isciye girmez.
- Her kart: NE (tek cumle) · GIRDI DOSYALARI · CIKTI (dosya yolu + kapi adi)
  · ONCE GREP (hangi mevcut test/alet okunacak) · YASAKLAR · SURE TAVANI.
  Kartlari GECE/KART/ altina yaz.
- Paralellik: birbirini gormesi gereken is SIRALI; kapali listeden dagitilan
  is PARALEL. Paralel isci tavani 4. Her kart setini once 'sirali mi paralel mi'
  diye etiketle.
- Iscilerin commit ATMAZ, sen de ATMAZSIN -- commit'i gece.sh atar.
- Bu fazin kapisini GECE/mutasyon.tsv'ye YAZ (bos satir = faz kapanamaz, §2.3).
  Zorunlu mutasyon adlari GECE/mutasyon.sh icinde sabittir, secemezsin.
- Fazin tutanagini GECE/$F.md'ye yaz (uzun, serbest, her sayinin yaninda dosya
  yolu). GECE/KOSU.md'yi guncelle (<=150 satir HARD CAP; satir eklemek icin sil).
- Damla'ya dusen karar varsa DAMLA-KUYRUK.md'ye tek satir; kosuyu BLOKE ETME." \
         --append-system-prompt "$(cat ENV.md; echo; cat RULES.md; echo; cat GECE/KOSU.md)" \
         --allowedTools "$ARACLAR" \
         --permission-mode acceptEdits \
         --output-format stream-json --verbose \
         > GECE/log/$F.ajan.txt 2>&1
  echo "    sef bitti $(date +%H:%M)"

  # `claude -p` API hatasinda bile exit 0 doner ve stream-json'da
  # {"type":"result", ..., "is_error":true} yazar. 21 Agu'da uc faz
  # (F2/F3/F4) tam olarak boyle oldu: ajan hic kosmadi, gece.sh yine de
  # kapiyi calistirip fazi "kirmizi" saydi. Kosmamis faz kirmizi DEGILDIR,
  # KOSMAMISTIR -- ikisi ayni sey degil.
  if grep -q '"type":"result"' GECE/log/$F.ajan.txt 2>/dev/null \
     && grep -q '"is_error":true' GECE/log/$F.ajan.txt; then
     local HATA; HATA=$(grep -o '"result":"[^"]*"' GECE/log/$F.ajan.txt | head -1)
     echo "    SEF KOSMADI (API hatasi) -- kapi calistirilmadi"
     { echo "## AJAN KOSMADI: $F  ($(date +%H:%M))"
       echo "once commit: $ONCE"
       echo "$HATA"
       echo "Bu faz KIRMIZI degil, HIC KOSMADI. Yeniden acilabilir."
       echo
     } >> GECE/STOP.md
     return 2   # 2 = kosmadi (kirmizi degil)
  fi

  # ============================================ 2) MAKINE KAPISI (K1..K7, K9)
  if ! bash GECE/kapi.sh "$F" "$ONCE" > GECE/log/$F.kapi.txt 2>&1; then
     echo "    KAPI KIRMIZI"; DUR "KAPI KIRMIZI" GECE/log/$F.kapi.txt; return 1
  fi
  echo "    kapi yesil $(date +%H:%M)"

  # ============================================ 3) COMMIT (yerel, push YOK)
  git add -A
  git commit -q -m "$F: $(head -1 "GECE/$F.md" | sed 's/^#* *//')" || true

  # ============================================ 4) MUTASYON -- kapi bos mu
  if ! bash GECE/mutasyon.sh "$F" > GECE/log/$F.mutasyon.txt 2>&1; then
     echo "    MUTASYON DUSTU (kapi bos)"; DUR "MUTASYON DUSTU (kapi bos)" GECE/log/$F.mutasyon.txt; return 1
  fi
  echo "    mutasyon gecti $(date +%H:%M)"

  # ============================================ 5) HAKEM -- brief'i GORMEYEN oturum
  claude -p "$(cat GECE/hakem-sorusu.md)" \
         --append-system-prompt "$(cat RULES.md)" \
         --allowedTools "Read,Grep,Glob,Bash(git diff*),Bash(git log*),Bash(git show*),Bash(ctest*)" \
         > GECE/log/$F.hakem.txt 2>&1
  if ! grep -qi "HAKEM: EVET" GECE/log/$F.hakem.txt; then
     echo "    HAKEM REDDETTI (ya da cevap vermedi)"; DUR "HAKEM REDDETTI" GECE/log/$F.hakem.txt; return 1
  fi
  echo "    hakem evet $(date +%H:%M)"

  # ============================================ 6) KATIP -- ucuncu ayri oturum
  # Katip fazin tutanagini ve diff'ini gorur; docs/ README.md GECE/INDEX.md
  # disinda hicbir yere yazamaz. Commit'i K8'dir: yoksa faz KAPANMAMISTIR.
  claude -p "Sen bu fazin KATIBIsin. Faz: $F.

Eline verilenler (baskasini ACMA):
- fazin tutanagi: GECE/$F.md
- fazin diff'i:   git diff $ONCE..HEAD
- docs/ agaci ve README.md

Isin: docs/, README.md ve GECE/INDEX.md icinde BU FAZLA bayatlayan her cumleyi
bulmak; guncellemek ya da gerekcesiyle docs/archive/'e tasimak. Sessiz silme yok.
Duran-iddia YAZILMAZ ('ALL PASS', '0.00mm', 'bitti', 'kapandi', 'tamam', 'hazir',
'sifir hata', 'done', 'complete') -- yerine sayiyi basan testin/aletin ADI yazilir.
Koda, contract/'a, engine/'e, web/'e DOKUNMA. GECE/KOSU.md'ye DOKUNMA.
Emin olamadigin cumleyi silme; yanina 'DOGRULANMADI (katip, $(date +%Y-%m-%d))' yaz." \
         --append-system-prompt "$(cat RULES.md)" \
         --allowedTools "Read,Grep,Glob,Edit,Write,Bash(git diff*),Bash(git log*),Bash(git show*)" \
         --permission-mode acceptEdits \
         > GECE/log/$F.katip.txt 2>&1

  if [ -n "$(git status --porcelain -- docs README.md GECE/INDEX.md)" ]; then
    git add -A -- docs README.md GECE/INDEX.md
    git commit -q -m "docs($F): $(head -1 "GECE/$F.md" | sed 's/^#* *//' | cut -c1-60)" || true
  fi

  # ============================================ 7) K8 -- katip kapisi
  if ! bash GECE/kapi.sh "$F" "$ONCE" katip > GECE/log/$F.katip-kapi.txt 2>&1; then
     echo "    KATIP KAPISI KIRMIZI"; DUR "KATIP KAPISI KIRMIZI (K8)" GECE/log/$F.katip-kapi.txt; return 1
  fi
  echo "    katip kapisi yesil $(date +%H:%M)"

  # ============================================ 8) HEPSI GECTI -> push
  if git push -q; then
    echo "$F KAPANDI $(date '+%Y-%m-%d %H:%M') $(git rev-parse --short HEAD)" >> GECE/log/ozet.txt
    echo "    $F KAPANDI ve push edildi"
    return 0
  else
    echo "    push patladi -- commit yerelde duruyor"
    echo "## PUSH PATLADI: $F ($(date +%H:%M)) commit yerelde" >> GECE/STOP.md
    return 0
  fi
}

# ============================================================ cekirdek
KOSMADI_SAYAC=0
for F in "${CEKIRDEK[@]}"; do
  faz_kos "$F"; RC=$?
  if [ $RC -eq 2 ]; then
    # Ajan olumu kirmizi DEGILDIR: bir kez yeniden baslatilir (§3.1).
    echo "    $F yeniden aciliyor (ajan olumu, 1. tekrar)"
    faz_kos "$F"; RC=$?
    if [ $RC -eq 2 ]; then
      KOSMADI_SAYAC=$((KOSMADI_SAYAC+1))
      echo "## KOSU DURDU: $F iki kez kosmadi ($(date +%H:%M))" >> GECE/STOP.md
      echo "    $F iki kez kosmadi -- cekirdek durduruldu, kapanisa geciliyor"
      break
    fi
  fi
  if [ $RC -eq 1 ]; then
    echo "    $F kapanmadi -- sonraki cekirdek fazi ACILMIYOR (§3.1)"
    # Istisna (§4): F3, F2'ye sert bagli DEGIL. F2 duserse F3 yine acilir.
    if [ "$F" = "F2" ]; then
      echo "    istisna: F3 F2'ye sert bagli degil, aciliyor"
      continue
    fi
    break
  fi
done

# ============================================================ uzatma
KALAN_SAAT=$(( (BASLANGIC_SN + 16*3600 - $(date +%s)) / 3600 ))
if [ "$KALAN_SAAT" -ge "$UZATMA_ESIK_SAAT" ]; then
  echo "=== uzatma aciliyor (kalan ~${KALAN_SAAT}s >= esik ${UZATMA_ESIK_SAAT}s)"
  for F in "${UZATMA[@]}"; do
    faz_kos "$F"; RC=$?
    [ $RC -eq 1 ] && { echo "    $F kapanmadi -- uzatma durdu"; break; }
    [ $RC -eq 2 ] && { echo "    $F kosmadi -- uzatma durdu"; break; }
  done
else
  echo "=== uzatma ATLANDI (kalan ~${KALAN_SAAT}s < esik ${UZATMA_ESIK_SAAT}s). Yarim uzatma, kosulmus kapanistan kotudur."
  echo "## UZATMA ATLANDI: kalan ~${KALAN_SAAT}s ($(date +%H:%M))" >> GECE/STOP.md
fi

# ============================================================ kapanis (ZORUNLU)
echo "=== kapanis basliyor $(date '+%H:%M') -- uzatmalardan BAGIMSIZ, atlanmaz (§4)"
for F in "${KAPANIS[@]}"; do
  faz_kos "$F"; RC=$?
  [ $RC -eq 2 ] && { echo "    $F kosmadi, bir kez daha"; faz_kos "$F"; RC=$?; }
  [ $RC -eq 1 ] && echo "    $F kapanmadi -- kapanisin geri kalani YINE de kosar"
done

echo "=== GECE KOSUSU bitti $(date '+%Y-%m-%d %H:%M')"
[ -f GECE/STOP.md ] && { echo "--- STOP.md:"; cat GECE/STOP.md; }
[ -f GECE/log/ozet.txt ] && { echo "--- kapanan fazlar:"; cat GECE/log/ozet.txt; }
exit 0
