#!/usr/bin/env bash
# 0509-kapi-kendi-check.sh — kapi.sh'in KENDI cikti sozlesmesini olcer (A1a).
#
# NEDEN AYRI BIR SCRIPT. 0509-kapi.sh ctest'i KENDISI kosar; onu ctest'e
# eklemek sonsuz ozyineleme olurdu. Bu check kapi.sh'i TAM kosmadan, yalniz
# ucuz modlarini (--kisa, --ivme, --regresyon, --kilit-diff) ve sozlesmeyi
# dogrular: cikti gecerli JSON mu, zorunlu alanlar var mi, exit kodu
# beklendigi gibi mi. <10 s, ctest cagirmaz.
#
#   bash engine/tests/0509-kapi-kendi-check.sh
# exit 0 = sozlesme saglam, 1 = bozuk.

set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
KAPI=engine/tests/0509-kapi.sh
K=0
ok()  { printf '  OK    %s\n' "$*"; }
kir() { printf '  FAIL  %s\n' "$*"; K=1; }

[ -f "$KAPI" ] || { kir "$KAPI yok"; exit 1; }

# 1) sozdizimi
bash -n "$KAPI" 2>/dev/null && ok "bash -n gecti" || kir "bash -n gecmedi"

# 2) set -u var, set -e YOK (kizaran gecit scripti oldurmemeli)
grep -qE '^set -u$' "$KAPI" && ok "set -u var" || kir "set -u yok"
grep -qE '^set -e|^set -eu|^set -ue' "$KAPI" && kir "set -e KULLANILMIS (kizaran gecit scripti oldurur)" || ok "set -e yok"

# 3) --kisa: tek satir gecerli JSON, zorunlu alanlar, exit 0
OUT=$(bash "$KAPI" --kisa 2>/dev/null); RC=$?
[ "$RC" -eq 0 ] && ok "--kisa exit 0" || kir "--kisa exit $RC"
SATIR=$(printf '%s\n' "$OUT" | grep -c .)
[ "$SATIR" = "1" ] && ok "--kisa tek satir" || kir "--kisa $SATIR satir (tek satir olmali)"
printf '%s' "$OUT" | python3 -c "
import json,sys
d=json.load(sys.stdin)
eksik=[k for k in ('commit','anaSapmaMM','enum','kirmizi','tarih') if k not in d]
if eksik: print('eksik alan: '+','.join(eksik)); raise SystemExit(1)
" >/dev/null 2>&1 && ok "--kisa JSON + zorunlu alanlar (commit/anaSapmaMM/enum/kirmizi/tarih)" \
  || kir "--kisa JSON bozuk ya da alan eksik"

# 4) --ivme: metrik olsun olmasin GECERLI JSON, asla NaN/exception
OUT=$(bash "$KAPI" --ivme 2>/dev/null); RC=$?
[ "$RC" -eq 0 ] && ok "--ivme exit 0" || kir "--ivme exit $RC"
printf '%s' "$OUT" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if not isinstance(d.get('yerelMinimum'), bool): raise SystemExit(1)
" >/dev/null 2>&1 && ok "--ivme JSON, yerelMinimum bool (NaN/exception yok)" || kir "--ivme JSON bozuk ya da yerelMinimum bool degil"

# 5) --regresyon: set yoksa 'kosmadi:' der ve SESSIZ ATLAMAZ
OUT=$(bash "$KAPI" --regresyon 2>/dev/null)
[ -n "$OUT" ] && ok "--regresyon bos cikti basmiyor" || kir "--regresyon sessiz (kosmadi gerekcesi yok)"

# 6) --kilit-diff tag'siz: kullanim basar, exit 2
bash "$KAPI" --kilit-diff >/dev/null 2>&1; RC=$?
[ "$RC" -eq 2 ] && ok "--kilit-diff tag'siz exit 2" || kir "--kilit-diff tag'siz exit $RC (2 olmali)"

# 7) bilinmeyen mod: adiyla ret + exit 3 (sessiz default yasagi)
OUT=$(bash "$KAPI" --yok-boyle-mod 2>/dev/null); RC=$?
[ "$RC" -eq 3 ] && printf '%s' "$OUT" | grep -q 'BILINMEYEN_MOD' \
  && ok "bilinmeyen mod: adiyla ret, exit 3" || kir "bilinmeyen mod sessizce gecti (exit $RC)"

# 8) her alt surec logta: dogrudan stdout'a sizan alt surec olmamali.
#    Cok satirli cagrilar var (python3 -c '...'), satir bazli grep yetmez;
#    ayri bir tarayici cagrinin blogunda LOG yonlendirmesi/degiskene atama arar.
SIZAN=$(python3 engine/tests/0509-kapi-sizinti.py "$KAPI" 2>/dev/null)
if [ -n "$SIZAN" ]; then
  kir "logsuz/yakalanmamis alt surec cagrisi var (stdout'a sizabilir):"
  printf '%s\n' "$SIZAN" | sed 's/^/        /'
else
  ok "yakalanmamis alt surec cagrisi yok"
fi

# 9) --kisa bozulursa BOS satir degil, adiyla hata + exit != 0 (sessiz default yasagi)
SAHTE=$(mktemp -d)
printf '#!/bin/sh\nexit 1\n' > "$SAHTE/python3"; chmod +x "$SAHTE/python3"
OUT=$(PATH="$SAHTE:$PATH" bash "$KAPI" --kisa 2>/dev/null); RC=$?
rm -rf "$SAHTE"
if printf '%s' "$OUT" | grep -q 'KAPI_KISA_BOZUK' && [ "$RC" -ne 0 ]; then
  ok "--kisa bozulunca adiyla hata + exit != 0"
else
  kir "--kisa bozulunca sessiz kaldi ya da exit 0 dondu (cikti: '$OUT', exit $RC)"
fi

[ "$K" -eq 0 ] && { echo "KAPI SOZLESMESI: SAGLAM"; exit 0; }
echo "KAPI SOZLESMESI: BOZUK"; exit 1
