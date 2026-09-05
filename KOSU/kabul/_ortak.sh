#!/usr/bin/env bash
# ortak yardimcilar — kabul scriptleri source eder. Isci bu dosyaya DOKUNMAZ (muhurlu).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
C=KOSU/ciktilar; K=0
ok(){ printf '  YESIL  %s\n' "$*"; }
kir(){ printf '  KIRMIZI %s\n' "$*"; K=1; }
var(){ for f in "$@"; do [ -s "$f" ] && ok "var: $f" || kir "yok/bos: $f"; done; }
png_boyut(){ # png en az 400px genis olsun (bos/kirik png dedektoru)
  for f in "$@"; do w=$(python3 -c "import struct,sys;d=open(sys.argv[1],'rb').read(24);print(struct.unpack('>I',d[16:20])[0] if d[:8]==b'\x89PNG\r\n\x1a\n' else 0)" "$f" 2>/dev/null || echo 0)
  [ "${w:-0}" -ge 400 ] && ok "png ${w}px: $f" || kir "png kucuk/bozuk (${w:-0}px): $f"; done; }
dogrula(){ # graf json dogrulayicidan gecsin: engine/build/grafdogrula <graf.json> <bodyId>  (P1 bu CLI'yi kurar)
  local g=$1 b=${2:-gercek36}
  if [ -x engine/build/grafdogrula ]; then engine/build/grafdogrula "$g" "$b" >/dev/null 2>&1 && ok "dogrulayici 0 kirmizi ($b): $g" || kir "dogrulayici kirmizi ($b): $g"
  else kir "engine/build/grafdogrula yok (P1 kurar)"; fi; }
ciz_iki_kez(){ # determinizm: ayni graf+beden iki kosumda bayt-ayni SVG. CLI: engine/build/grafciz <graf.json> <bodyId> flat|kalip > svg
  local g=$1 b=$2 m=$3; [ -x engine/build/grafciz ] || { kir "engine/build/grafciz yok (P1 kurar)"; return; }
  engine/build/grafciz "$g" "$b" "$m" > /tmp/_a.svg 2>/dev/null; engine/build/grafciz "$g" "$b" "$m" > /tmp/_b.svg 2>/dev/null
  [ -s /tmp/_a.svg ] && cmp -s /tmp/_a.svg /tmp/_b.svg && ok "deterministik ($b/$m): $g" || kir "iki kosum farkli ya da bos ($b/$m): $g"; }
katman(){ for id in outline seams topstitch details; do grep -q "id=\"$id\"" "$1" && ok "katman $id: $1" || kir "katman yok $id: $1"; done; }
farkli(){ # dosyalar ikiser ikiser farkli olsun (sessiz ayni-giysiye-donus dedektoru)
  local a; local -a fs=("$@"); for ((i=0;i<${#fs[@]};i++)); do for ((j=i+1;j<${#fs[@]};j++)); do cmp -s "${fs[i]}" "${fs[j]}" && kir "AYNI icerik: ${fs[i]} = ${fs[j]}"; done; done; ok "${#fs[@]} dosya ikiser ikiser farkli"; }
hukum(){ [ $K -eq 0 ] && { echo "KABUL $1: GECTI"; exit 0; } || { echo "KABUL $1: GECMEDI"; exit 1; }; }
