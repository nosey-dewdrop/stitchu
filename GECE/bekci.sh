#!/usr/bin/env bash
# GECE/bekci.sh — Stop hook: F11 kapanmadıysa durmayı bloklar (v4 §L)
#
# İŞARET v4'E ÖZEL: 'F11 kapandı (v4)'. Sebep ölçüldü (22 Ağu kurulum):
# v3'ün GECE/KOSU.md:4 satırı zaten 'faz: **F11 kapandı, koşu bitti**' diyordu,
# yani §L'nin özgün grep'i daha koşu başlamadan exit 0 veriyordu — nöbetçi ölüydü.
# F11 şefi KOSU.md ŞU AN satırına birebir şunu yazar: faz: **F11 kapandı (v4)**
grep -q 'faz: \*\*F11 kapandı (v4)' GECE/KOSU.md 2>/dev/null && exit 0
echo "KOŞU BİTMEDİ. GECE/KOSU.md ŞU AN → 'sonraki adım'ı yap. Soru sorma; karar gerekirse Task(danisman). 07:00 geçtiyse F9." >&2
exit 2
