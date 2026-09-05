#!/usr/bin/env bash
# P9 tur — iki temiz tur ust uste
source "$(dirname "$0")/_ortak.sh"
ls -d $C/tur-* >/dev/null 2>&1 || kir "tur-N yok"
son=$(ls -d $C/tur-* 2>/dev/null | sort -V | tail -2)
c=0; for t in $son; do var $t/hukum.json; python3 -c "import json,sys;h=json.load(open('$t/hukum.json'));sys.exit(0 if h.get('kusur',[])==[] and h.get('alirMiydim')=='ALIRDIM' else 1)" && { ok "temiz: $t"; c=$((c+1)); } || kir "temiz degil: $t"; done
[ $c -eq 2 ] && ok "iki temiz tur" || kir "iki ust uste temiz tur yok"
hukum P9
