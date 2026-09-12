#!/usr/bin/env python3
# 0509 GECIT TABLOSU URETICISI (karar ajani, 6 Eyl 2026 — karar 2 secenek (b)).
#
# NEDEN AYRI DOSYA VE NEDEN KOSU/ ALTINDA.
#   engine/tests/0509-kapi.sh kosunun SOZLESMESIDIR: hukum basar, resim cizmez.
#   PNG renderer'ini oraya koymak gecit dosyasini sisirir. Elle tazelenen gorsel
#   ise bir sonraki adimda sessizce bayatlar (6 Eyl'de tam bu oldu). Bu yuzden
#   uretici script, kilitli olmayan KOSU/ altinda ve commit'li.
#   Emsal: KOSU/0509-karar-tablosu.py (ayni is, ayni yer).
#
# UYDURMA SAYI YOK: her hucre girdideki JSON'dan gelir. Girdi yoksa hata verir,
# eski gorseli birakmaz.
#
# KULLANIM
#   bash engine/tests/0509-kapi.sh > /tmp/kapi.json ; python3 KOSU/0509-kapi-tablo.py /tmp/kapi.json
#   bash engine/tests/0509-kapi.sh | python3 KOSU/0509-kapi-tablo.py -
#   python3 KOSU/0509-kapi-tablo.py --json /tmp/kapi.json --baslik "A1b tur 1"
# CIKTI
#   KOSU/ciktilar/0509-kapi/gecit-tablosu.svg + .png
# EXIT
#   0 yazildi · 2 girdi yok/bozuk (gorsel TAZELENMEZ)

import json, subprocess, sys, os, html, datetime

KOK = subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                     capture_output=True, text=True).stdout.strip()
if not KOK:
    print('HATA: git kok bulunamadi', file=sys.stderr); sys.exit(2)
os.chdir(KOK)

CIKTI_DIR = 'KOSU/ciktilar/0509-kapi'
SVG_P = CIKTI_DIR + '/gecit-tablosu.svg'
PNG_P = CIKTI_DIR + '/gecit-tablosu.png'
STATE_P = 'KOSU/0509-state.json'

# ---------------------------------------------------------------- girdi
args = sys.argv[1:]
kaynak, baslik_ek = None, None
i = 0
while i < len(args):
    a = args[i]
    if a == '--json' and i + 1 < len(args): kaynak = args[i + 1]; i += 2
    elif a == '--baslik' and i + 1 < len(args): baslik_ek = args[i + 1]; i += 2
    elif not a.startswith('--') and kaynak is None: kaynak = a; i += 1
    else:
        print('HATA: bilinmeyen arguman: %s' % a, file=sys.stderr); sys.exit(2)
if kaynak is None:
    print('kullanim: 0509-kapi-tablo.py <kapi.json|-> [--baslik "A1b tur 1"]', file=sys.stderr)
    sys.exit(2)

try:
    ham = sys.stdin.read() if kaynak == '-' else open(kaynak).read()
    d = json.loads(ham)
except Exception as e:
    print('HATA: gecit JSON okunamadi (%s): %s' % (kaynak, e), file=sys.stderr)
    print('gorsel TAZELENMEDI — eski png yerinde birakildi', file=sys.stderr)
    sys.exit(2)
if 'hata' in d:
    print('HATA: kapi bozuk cikti verdi: %s' % d.get('hata'), file=sys.stderr); sys.exit(2)
gecitler = d.get('gecitler')
if not isinstance(gecitler, list) or not gecitler:
    print('HATA: JSON icinde gecitler[] yok/bos', file=sys.stderr); sys.exit(2)

try:
    state = json.load(open(STATE_P))
except Exception:
    state = {}
ilanli = {}
for k in state.get('ilanliKirmizi', []) or []:
    ilanli[k.get('gecit')] = k

# ---------------------------------------------------------------- cizim
RENK = {'YESIL': '#1a7f45', 'KIRMIZI': '#b3261e', 'CRASH': '#8b1a1a', 'HENUZ-YOK': '#9a7b18'}
UST = 128
SATIR_H = 44
ALT_SATIRLAR = []

# genislik VERIDEN: en uzun kaynak metni sigacak kadar (kirpma yok, tasma yok).
W = 900

kirmizilar = d.get('kirmizilar') or []
henuz = d.get('henuzYok') or []
crash = d.get('crash') or []
ilanli_kirmizi = [a for a in kirmizilar if a in ilanli]
ilansiz_kirmizi = [a for a in kirmizilar if a not in ilanli]

ALT_SATIRLAR.append('kirmizi %d — ILANLI %d (%s) · ILANSIZ %d (%s)' % (
    len(kirmizilar), len(ilanli_kirmizi), ', '.join(ilanli_kirmizi) or '-',
    len(ilansiz_kirmizi), ', '.join(ilansiz_kirmizi) or 'yok'))
for ad in ilanli_kirmizi:
    k = ilanli[ad]
    ALT_SATIRLAR.append('  ILANLI %s: sayi %s · kapanacak adim %s · %s' % (
        ad, k.get('sayi'), k.get('kapanacakAdim'),
        ('tavan %s' % k['tavan']) if k.get('tavan') else
        ('alt kume dondu: ' + ', '.join(k.get('kirmiziAltTestKumesi', [])))))
if henuz:
    ALT_SATIRLAR.append('henuz-yok %d: %s' % (len(henuz), ', '.join(henuz)))
_g = 'stdin' if kaynak == '-' else os.path.basename(kaynak)

H = UST + SATIR_H * len(gecitler) + 34 + 22 * len(ALT_SATIRLAR) + 64


def esc(t):
    return html.escape('' if t is None else str(t))


svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H),
    '<rect width="%d" height="%d" fill="#fbfaf8"/>' % (W, H),
    '<style>text{font-family:-apple-system,Helvetica,Arial,sans-serif}</style>',
    '<text x="34" y="46" font-size="24" font-weight="700" fill="#141414">0509 gecit tablosu%s</text>'
    % (esc(' — ' + baslik_ek) if baslik_ek else ''),
    '<text x="34" y="74" font-size="13" fill="#555">commit %s · %s · %s gecit · %d kirmizi · crash %d · gecitYesil %s</text>'
    % (esc(d.get('commit')), esc(d.get('tarih')), esc(d.get('gecitSayisi')),
       len(kirmizilar), len(crash), esc(d.get('gecitYesil'))),
    '<text x="34" y="96" font-size="13" fill="#555">log %s · uretim %s · uretici KOSU/0509-kapi-tablo.py &lt;- %s (tum sayilar gecit JSON\'undan)</text>'
    % (esc(d.get('log')), esc(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')), esc(_g)),
    '<line x1="34" y1="128" x2="%d" y2="128" stroke="#ddd"/>' % (W - 34),
    '<text x="34" y="120" font-size="11" fill="#888" letter-spacing="1">GECIT / KAYNAK</text>',
    '<text x="600" y="120" font-size="11" fill="#888" letter-spacing="1">DURUM</text>',
    '<text x="760" y="120" font-size="11" fill="#888" letter-spacing="1">SAYI / ESIK</text>',
]

y = UST
for n, g in enumerate(gecitler):
    ad = g.get('ad', '?')
    durum = g.get('durum', '?')
    if n % 2 == 0:
        svg.append('<rect x="34" y="%d" width="%d" height="%d" fill="#f2f0ec"/>' % (y, W - 68, SATIR_H))
    ty = y + 20
    etiket = ad + (' *' if ad in ilanli and durum in ('KIRMIZI', 'CRASH') else '')
    svg.append('<text x="42" y="%d" font-size="14" fill="#141414">%s</text>' % (ty, esc(etiket)))
    svg.append('<circle cx="608" cy="%d" r="5" fill="%s"/>' % (ty - 5, RENK.get(durum, '#666')))
    svg.append('<text x="622" y="%d" font-size="13" font-weight="600" fill="%s">%s</text>'
               % (ty, RENK.get(durum, '#666'), esc(durum)))
    sayi = g.get('sayi')
    esik = g.get('esik')
    svg.append('<text x="768" y="%d" font-size="13" fill="#333">%s%s</text>'
               % (ty, esc('null' if sayi is None else sayi),
                  esc('' if esik is None else ' / %s' % esik)))
    svg.append('<text x="42" y="%d" font-size="10.5" fill="#8a8a8a">%s</text>'
               % (ty + 16, esc(g.get('kaynak'))))
    y += SATIR_H

y += 26
svg.append('<line x1="34" y1="%d" x2="%d" y2="%d" stroke="#ddd"/>' % (y - 14, W - 34, y - 14))
for line in ALT_SATIRLAR:
    svg.append('<text x="34" y="%d" font-size="12.5" fill="#333">%s</text>' % (y, esc(line)))
    y += 22
svg.append('</svg>')

os.makedirs(CIKTI_DIR, exist_ok=True)
with open(SVG_P, 'w') as f:
    f.write('\n'.join(svg))

# qlmanage -s KARE bir kutudur: kisa kenar degil, BUYUK kenar verilmezse
# genislik kuculur ve sag sutun kirpilir. Bu yuzden max(W, H).
subprocess.run(['qlmanage', '-t', '-s', str(max(W, H)), '-o', CIKTI_DIR, SVG_P],
               capture_output=True, text=True)
gecici = SVG_P + '.png'
if os.path.exists(gecici):
    os.replace(gecici, PNG_P)

if not os.path.exists(PNG_P):
    print('HATA: png uretilemedi (qlmanage)', file=sys.stderr); sys.exit(2)
print('yazildi: %s (%d bayt) + %s' % (PNG_P, os.path.getsize(PNG_P), SVG_P))
