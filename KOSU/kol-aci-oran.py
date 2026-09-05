# KOSU/kol-aci-oran.py — F1 tur 11 gorseli: satilan flatlerde AGZI BUZGULU kollarin cizilen acisi (y) ile kol boyu / omuz genisligi (x).
#   python3 KOSU/kol-aci-oran.py -> KOSU/ciktilar/kol-aci-oran.svg (sayilar KOSU/ciktilar/flat-olcum.json f1Tur8.medyanlar'dan; elle sayi yok).
#   Telif: yalniz sayi ve ad; fotograf/cizim yok. Sag panel: satici boy kelimesi (kisa/dirsek/uzun) araliklari ayni eksende (ortusme).
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); J = json.load(open(os.path.join(HERE, 'ciktilar', 'flat-olcum.json')))
M = J['f1Tur8']['medyanlar']; kb = M['kolBoyuOverOmuz']; band = M['yanaAcilanBand']; bs = M['boySinifiOrtusme']['kolBoyuOverOmuz']
FC = json.load(open(os.path.join(HERE, '..', 'contract', 'flat-convention-v1.json')))['sevkPoz']['kolAcisiDeg']
W, H = 1400, 720; L, R, T, B = 90, 60, 70, 70; PW = 780; ph = H - T - B
xmin, xmax, ymin, ymax = 0.3, 1.9, 20, 95
def X(v): return L + (v - xmin) / (xmax - xmin) * PW
def Y(v): return T + (ymax - v) / (ymax - ymin) * ph
INK, INK2, GRID = '#0b0b0b', '#52514e', '#e4e3df'
C_YANA, C_SARKAN, C_DUZ = '#eb6834', '#2a78d6', '#9a9890'
o = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" font-family="Helvetica, Arial, sans-serif" font-size="13">' % (W, H, W, H),
     '<rect width="%d" height="%d" fill="#fcfcfb"/>' % (W, H),
     '<text x="%d" y="34" font-size="19" fill="%s">Satilan flat: kol acisi - kol boyu / omuz genisligi (F1 tur 11, n=%d kol, %d agzi buzgulu)</text>' % (L, INK, kb['n'], kb['nBuzgulu']),
     '<text x="%d" y="54" fill="%s">Kaynak: KOSU/ciktilar/flat-olcum.json f1Tur8.medyanlar.kolBoyuOverOmuz; aci = omuz ucu -&gt; kol agzi ortasi, yatayin altina derece; oran = kol ekseni boyu / iki omuz ucu arasi</text>' % (L, INK2)]
for v in range(ymin, ymax + 1, 10):
    o.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s"/>' % (L, Y(v), L + PW, Y(v), GRID)); o.append('<text x="%d" y="%.1f" text-anchor="end" fill="%s" dy="4">%d°</text>' % (L - 8, Y(v), INK2, v))
for v in [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8]:
    o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s"/>' % (X(v), T, X(v), T + ph, GRID)); o.append('<text x="%.1f" y="%d" text-anchor="middle" fill="%s">%.1f</text>' % (X(v), T + ph + 18, INK2, v))
o.append('<text x="%.1f" y="%d" text-anchor="middle" fill="%s">kol boyu / omuz genisligi (croquis36: uzun kol 590 / 367.6 = 1.61)</text>' % (L + PW / 2, T + ph + 40, INK))
# sarkan band (contract) ve puf bandi (askida)
o.append('<rect x="%d" y="%.1f" width="%d" height="%.1f" fill="%s" opacity="0.10"/>' % (L, Y(FC['max']), PW, Y(FC['min']) - Y(FC['max']), C_SARKAN))
o.append('<text x="%d" y="%.1f" fill="%s" font-size="12">sarkan band IQR [%s, %s], taban %s (contract)</text>' % (L + 6, Y(FC['min']) + 14, C_SARKAN, FC['min'], FC['max'], FC['taban']))
if kb['bosluk']:
    a, b2 = kb['bosluk']; o.append('<rect x="%.1f" y="%d" width="%.1f" height="%d" fill="%s" opacity="0.18"/>' % (X(a), T, X(b2) - X(a), ph, C_YANA))
    o.append('<text x="%.1f" y="%d" fill="%s" font-size="12" text-anchor="middle">oran boslugu [%s, %s] orta %s (0.019: olcum hatasi mertebesi)</text>' % (X((a + b2) / 2), T + 14, C_YANA, a, b2, kb['ortaNokta']))
if kb['aciKumeleri']['kesimDeg']:
    k = kb['aciKumeleri']['kesimDeg']; o.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-dasharray="6 4"/>' % (L, Y(k), L + PW, Y(k), C_YANA))
    o.append('<text x="%d" y="%.1f" fill="%s" font-size="12" dy="-4">en buyuk aci boslugu %s -&gt; %s, kesim %.1f°: alti YANA ACILAN, ustu SARKAN</text>' % (L + 6, Y(k), C_YANA, kb['aciKumeleri']['enBuyukAciBoslugu'][0][0], kb['aciKumeleri']['enBuyukAciBoslugu'][0][1], k))
labels = []
for d in kb['degerler']:
    buz = d['etiket'] == 'buzgulu'; yana = d['flat'] in kb['aciKumeleri']['yanaAcilan']
    col = C_YANA if yana else (C_SARKAN if buz else C_DUZ); x, y = X(d['oran']), Y(d['kolAcisiDeg'])
    if buz: o.append('<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="#fcfcfb" stroke-width="2"><title>%s: aci %s, oran %s, boy %s</title></circle>' % (x, y, col, d['flat'], d['kolAcisiDeg'], d['oran'], d['boy']))
    else: o.append('<rect x="%.1f" y="%.1f" width="9" height="9" fill="%s" stroke="#fcfcfb" stroke-width="2"><title>%s (duz): aci %s, oran %s, boy %s</title></rect>' % (x - 4.5, y - 4.5, col, d['flat'], d['kolAcisiDeg'], d['oran'], d['boy']))
    if buz:
        ad = d['flat'].replace('.png', '').replace('.jpg', '').replace('#', ' ')
        ad = ad.split('-', 1)[1] if ad[:2].isdigit() else ad
        labels.append((x, y, ad, d['boy'], col))
# etiketler: ust uste binmeyi kaba azalt (y sirali, 12 px ayir)
labels.sort(key=lambda t: (t[0], t[1])); used = []
for x, y, ad, boy, col in labels:
    ty = y - 9
    while any(abs(ty - u) < 12 and abs(x - ux) < 120 for ux, u in used): ty -= 12
    used.append((x, ty)); o.append('<text x="%.1f" y="%.1f" font-size="11" fill="%s">%s (%s)</text>' % (x + 8, ty, INK2, ad, boy))
# legend
lx, ly = L + 8, T + ph - 60
for i, (c, t, shape) in enumerate([(C_YANA, 'buzgulu, yana acilan (n=%d) - kosulluBant[0] ASKIDA' % band['n'], 'c'), (C_SARKAN, 'buzgulu, sarkan (n=%d)' % len(kb['aciKumeleri']['sarkan']), 'c'), (C_DUZ, 'duz agiz (hepsi sarkan bandinda yargilanir)', 'r')]):
    yy = ly + i * 18
    o.append('<circle cx="%d" cy="%d" r="6" fill="%s"/>' % (lx, yy, c) if shape == 'c' else '<rect x="%d" y="%d" width="9" height="9" fill="%s"/>' % (lx - 4, yy - 4, c))
    o.append('<text x="%d" y="%d" dy="4" fill="%s" font-size="12">%s</text>' % (lx + 12, yy, INK, t))
# sag panel: boy sinifi araliklari
px0 = L + PW + 70; pw = W - px0 - R
o.append('<text x="%d" y="%d" font-size="15" fill="%s">Satici boy kelimesi, ayni oran ekseninde</text>' % (px0, T - 8, INK))
def PX(v): return px0 + (v - xmin) / (xmax - xmin) * pw
rows = [('kisa', 0), ('dirsek', 1), ('uzun', 2)]
for name, i in rows:
    s = bs[name]; yy = T + 60 + i * 70
    o.append('<text x="%d" y="%d" fill="%s" dy="4">%s  n=%d</text>' % (px0, yy - 22, INK, name, s['n']))
    o.append('<rect x="%.1f" y="%d" width="%.1f" height="18" rx="4" fill="%s" opacity="0.35"/>' % (PX(s['min']), yy - 9, PX(s['max']) - PX(s['min']), C_DUZ))
    for ad, v in s['degerler'].items(): o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="2"><title>%s %s</title></line>' % (PX(v), yy - 9, PX(v), yy + 9, INK2, ad, v))
    o.append('<text x="%.1f" y="%d" font-size="11" fill="%s" text-anchor="middle">%s</text>' % (PX(s['min']), yy + 24, INK2, s['min'])); o.append('<text x="%.1f" y="%d" font-size="11" fill="%s" text-anchor="middle">%s</text>' % (PX(s['max']), yy + 24, INK2, s['max']))
ort = bs['ortusme']
o.append('<text x="%d" y="%d" fill="%s" font-size="12">ortusme: kisa-dirsek %s, dirsek-uzun %s</text>' % (px0, T + 60 + 3 * 70 - 10, INK, 'EVET' if ort['kisa-dirsek'] else 'hayir', 'EVET' if ort['dirsek-uzun'] else 'hayir'))
o.append('<text x="%d" y="%d" fill="%s" font-size="12">%s</text>' % (px0, T + 60 + 3 * 70 + 8, C_YANA, 'boy kelimesi aciyi/orani ayirmiyor (3c)' if any(ort.values()) else 'boy siniflari ayrik'))
o.append('<text x="%d" y="%d" fill="%s" font-size="12">dirsek hukmu: %s</text>' % (px0, T + 60 + 3 * 70 + 28, INK2, M['dirsek']['hukum'].split(':')[0]))
for v in [0.4, 0.8, 1.2, 1.6]: o.append('<text x="%.1f" y="%d" text-anchor="middle" fill="%s" font-size="11">%.1f</text>' % (PX(v), T + ph + 18, INK2, v))
o.append('</svg>')
out = os.path.join(HERE, 'ciktilar', 'kol-aci-oran.svg'); open(out, 'w').write('\n'.join(o)); print(out, len(o), 'eleman')
