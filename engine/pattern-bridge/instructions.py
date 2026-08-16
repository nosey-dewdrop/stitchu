#!/usr/bin/env python3
# ============================================================================
# instructions — MONTAJ SIRASI, DİKİŞ GRAFİĞİNDEN TÜRETİLİR
#
# decisions.json bunu 'talimat-kitapcigi' diye taşıyordu ve kanıt yolu YOKtu:
# ROADMAP'e "montaj sırası dikiş grafiğinin topolojik sıralamasından çıkar" diye
# yazılmış, hiç yapılmamış. karar-lint tam bunu bağırıyordu.
#
# Neden bu iş bize düşüyor: endüstriyel kalıp dosyaları isimsiz poligon taşır,
# kenar-eşleştirme grafı taşımaz — sırayı üretebilecek veri onlarda YOK, bizde
# var. Sıra elle yazılmaz; yazılırsa bir sonraki tasarımda yalan olur.
#
# ALGORİTMA — "önce en küçük parçayı birleştir", ve kapatan dikiş en sona.
#
#   Paneller düğüm, dikişler kenar. Bir dikişin iki ucu FARKLI bileşendeyse o
#   dikiş parçayı büyütür (ağaç kenarı); AYNI bileşendeyse o dikiş halkayı
#   KAPATIR ve dikildiği anda iş düz olmaktan çıkıp tüp olur.
#
#   Terzilikte bunun adı flat construction: mümkün olduğunca düz dik, tüpü
#   kapatan dikişi en sona bırak. Yani kural uydurma değil, zanaatın kuralı ve
#   grafikte tam olarak "cycle-closing edge" diye karşılığı var.
#
#   Ağaç kenarları arasında sıra: birleşince EN KÜÇÜK parçayı veren önce. Bir
#   giysi küçük birimlerden alt-montajlara, oradan bütüne gider; bu da onun
#   grafik hâli. Eşitlik kanonik isimle çözülür ki çıktı deterministik olsun.
#
# Aynı panelin iki kenarını birleştiren dikiş = PENS, ve pens her zaman en
# başta gelir: panel henüz tek başına, düz duruyorken kapatılır.
# ============================================================================
import json
import sys
from pathlib import Path


def _role(name):
    """torso/skirt, front/back — panel adından okunur (walk.py ile aynı dil)."""
    layer = 'skirt' if 'skirt' in name else 'bodice'
    side = 'back' if ('btorso' in name or 'skirt_back' in name) else 'front'
    return layer, side


def _human(name):
    layer, side = _role(name)
    lr = 'sol' if name.startswith('left_') else 'sağ' if name.startswith('right_') else ''
    tr = {'bodice': 'beden', 'skirt': 'etek'}[layer]
    ts = {'front': 'ön', 'back': 'arka'}[side]
    return f'{lr} {ts} {tr}'.strip()


def _seam_name(a, b):
    """Dikişin terzilikteki adı — panel ROLLERİNDEN, sabit listeden değil."""
    la, sa = _role(a)
    lb, sb = _role(b)
    if la != lb:
        return 'bel dikişi'
    if sa != sb:
        return 'yan dikiş'
    return 'arka orta dikiş' if sa == 'back' else 'ön orta dikiş'


def _seam_text(a, b, vertical_of):
    """Dikişi kumaştaki hâliyle anlat.

    Dikey dikişler bel dikişinin üstünden geçip devam eder, yani beden ve etek
    boyunca TEK dikiştir. Temsilci panel adları beden panelleri olduğu için
    düz yazmak 'arka orta dikiş = sadece beden' izlenimi verir; vermemeli.
    """
    base = f'{_human(a)} + {_human(b)} — {_seam_name(a, b)}.'
    if (a, b) in vertical_of:
        cols = vertical_of[(a, b)]
        spans = all(len(set(c)) > 1 for c in cols)
        if spans:
            base += ' Bu dikiş bel dikişinin üstünden geçer: beden ve etek boyunca TEK dikiş.'
    return base


def build(pattern):
    """(steps, closing_count) — sırayla, her adım bir sözlük."""
    stitches = pattern['stitches']
    opening = pattern.get('openings') or {}
    open_idx = set(opening.get('stitches') or [])

    # dikişleri MANTIKSAL dikişlere grupla: aynı panel çiftini birleştiren
    # bütün kenar eşleşmeleri tek bir dikiştir, insan onları tek seferde diker
    darts, seams = {}, {}
    for i, st in enumerate(stitches):
        a, b = st[0]['panel'], st[1]['panel']
        if a == b:
            darts.setdefault(a, []).append(i)
        else:
            seams.setdefault(tuple(sorted((a, b))), []).append(i)

    # BİR DİKİŞ, İKİ PANEL ÇİFTİ DEĞİL.
    #
    # Arka orta dikiş belden geçip etekte devam eder: kumaşta TEK dikiş, ama
    # motorda (sol/sağ beden) ve (sol/sağ etek) diye iki ayrı panel çifti. İlk
    # sürüm ikisini ayrı adım yazdı ve 8 dikey dikiş saydı; terzi 4 görür.
    # Sıra, dikişin kumaştaki hâline göre verilir, veri yapısının hâline göre
    # değil — yoksa talimat kendi iç temsilini anlatır, işi değil.
    #
    # Hangi çiftlerin aynı dikiş olduğu ARANMAZ, bel dikişinden okunur: bel
    # dikişi her beden panelini kendi etek paneline bağlar, yani bir "kolon"
    # tanımlar. İki dikey dikiş aynı kolon çiftini birleştiriyorsa aynı dikiştir.
    waist_partner = {}
    for (a_, b_) in seams:
        if _role(a_)[0] != _role(b_)[0]:
            waist_partner[a_] = b_
            waist_partner[b_] = a_

    def column(name):
        return tuple(sorted((name, waist_partner.get(name, name))))

    merged = {}
    for key, idx in seams.items():
        a_, b_ = key
        if _role(a_)[0] != _role(b_)[0]:
            merged.setdefault(key, []).extend(idx)  # bel dikişi kendi başına
            continue
        ckey = tuple(sorted((column(a_), column(b_))))
        merged.setdefault(('V', ckey), []).extend(idx)
    seams = {}
    vertical_of = {}
    for key, idx in merged.items():
        if key[0] == 'V':
            # kolon çiftinin temsilci panel çifti: aynı katmandan iki panel
            ca, cb = key[1]
            rep = (ca[0], cb[0])
            seams[rep] = idx
            vertical_of[rep] = (ca, cb)
        else:
            seams[key] = idx

    panels = sorted({p for k in seams for p in k} | set(darts))
    parent = {p: p for p in panels}
    size = {p: 1 for p in panels}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    steps = []
    n = 1
    for panel in sorted(darts):
        steps.append({'n': n, 'kind': 'dart', 'text':
                      f'{_human(panel)}: {len(darts[panel])} pens kenarını kapat. '
                      'Panel hâlâ tek başına ve düz — pensler burada dikilir.'})
        n += 1

    remaining = dict(seams)
    # ağaç kenarları: her turda birleşince en küçük parçayı veren dikiş
    while True:
        candidates = [(k, v) for k, v in remaining.items()
                      if find(k[0]) != find(k[1])]
        if not candidates:
            break
        candidates.sort(key=lambda kv: (size[find(kv[0][0])] + size[find(kv[0][1])],
                                        kv[0]))
        (a, b), idx = candidates[0]
        ra, rb = find(a), find(b)
        parent[ra] = rb
        size[rb] += size[ra]
        del remaining[(a, b)]
        opened = [i for i in idx if i in open_idx]
        text = _seam_text(a, b, vertical_of)
        if opened:
            text += (' BU DİKİŞİN ÜST KISMI AÇIK KALIR: eteğin altından başla, '
                     'zip-end yazan üçlü çentiğe kadar dik ve DUR.')
        steps.append({'n': n, 'kind': 'seam', 'text': text,
                      'pieces_after': size[rb], 'open': bool(opened)})
        n += 1

    # kalanlar halkayı kapatan dikişler — düz iş burada biter
    for (a, b), idx in sorted(remaining.items()):
        opened = [i for i in idx if i in open_idx]
        text = (_seam_text(a, b, vertical_of) +
                ' Bu dikiş halkayı KAPATIR: buradan sonra iş düz değil, tüp. '
                'Bu yüzden en sonda.')
        if opened:
            text += (' Üst kısmı açık kalır: zip-end çentiğine kadar dik ve DUR.')
        steps.append({'n': n, 'kind': 'closing', 'text': text, 'open': bool(opened)})
        n += 1

    if opening.get('stitches'):
        mm = opening.get('length_mm', 0.0)
        steps.append({'n': n, 'kind': 'zip', 'text':
                      f'Fermuarı arka orta açıklığa tak ({mm:.0f}mm / '
                      f'{mm / 25.4:.2f} inç). Çentik fermuarın alt ucudur.'})
        n += 1
    steps.append({'n': n, 'kind': 'finish', 'text':
                  'Yakayı ve etek ucunu temizle (biye ya da kıvırma).'})
    return steps, len(remaining)


def report_lines(pattern):
    steps, closing = build(pattern)
    out = ['MONTAJ SIRASI — dikiş grafiğinden türetildi, elle yazılmadı',
           '  (kural: parçayı büyüten dikişler önce, küçükten büyüğe; halkayı '
           'kapatan dikiş en sonda = flat construction)',
           f'  {len(steps)} adım, {closing} kapatan dikiş',
           '']
    for s in steps:
        out.append(f"  {s['n']:>2}. {s['text']}")
    out.append('')
    return out


def main():
    if len(sys.argv) < 2:
        print('kullanim: instructions.py <spec.json>', file=sys.stderr)
        return 2
    doc = json.loads(Path(sys.argv[1]).read_text())
    pattern = doc['pattern'] if 'pattern' in doc else doc
    print('\n'.join(report_lines(pattern)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
