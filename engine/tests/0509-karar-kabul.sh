#!/usr/bin/env bash
# A1a KARARLARININ KABULU (6 Eyl). exit 0 = uc karar da uygulanmis. Sayilar state.json'dan, koda gomulu degil.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
python3 - <<'PY' || exit 1
import json,subprocess,sys,re
s=json.load(open('KOSU/0509-state.json'))
h=[]
ik={r['gecit']:r for r in s.get('ilanliKirmizi',[])}
# KARAR 1
r=ik.get('flat_ayni_insan_check')
if not r or r.get('kapanacakAdim')!='A4' or r.get('tavan')!=34: h.append('karar1: ilan/tavan/A4 yok')
if not any('flat_ayni_insan_check' in d for d in s.get('devredilen',[])): h.append('karar1: devredilen[] satiri yok')
o=subprocess.run(['bash','-c',r['tavanOlcumKomutu']],capture_output=True,text=True).stdout.strip() if r else ''
if o!='34': h.append('karar1: tavan olcumu 34 degil -> %r'%o)
# KARAR 2
r2=ik.get('sinyal_tam')
if not r2 or r2.get('kapanacakAdim')!='A9' or r2.get('kirmiziAltTestKumesi')!=['bundle_fresh_check']: h.append('karar2: ilan/kume/A9 yok')
if not any('sinyal_tam' in d for d in s.get('devredilen',[])): h.append('karar2: devredilen[] satiri yok')
k=open('engine/tests/0509-kapi.sh').read()
if 'sinyal_tam' not in k or '--kisa' not in k: h.append('karar2: kapi.sh okunamadi')
# KARAR 3: A1b tarifinde CMakeLists satir yonu denetimi yazili
j=open('KOSU/0509-kosu.js').read()
if 'add_executable(' not in j or 'KILIT_IHLALI' not in j or 'engine/CMakeLists.txt' not in j: h.append('karar3: A1b tarifinde satir yonu denetimi yok')
if 'ilanliKirmiziKumesi' not in j: h.append('karar3/1-2: kosucu ilanli kirmiziyi dusmuyor')
print('\n'.join(h) if h else 'A1a KARARLARI: UYGULANDI')
sys.exit(1 if h else 0)
PY
