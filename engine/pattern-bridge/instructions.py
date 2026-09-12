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
import sqlite3
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
KNOWLEDGE_DB = REPO / 'knowledge/stitchu.db'
SEWING_GUIDE = REPO / 'knowledge/sewing-guide.md'

# The two levers the guide (knowledge/sewing-guide.md §1) says decide the
# cloth, turned into thresholds so the pattern can answer them itself.
#   - waist ease: how much bigger than the body the garment's own waist ring
#     is. Small ease means the shape is CUT (seams and darts), not draped.
#   - hem sweep: the hem divided by the waist. Above 1, the skirt leaves the
#     body, and a silhouette that stands away wants cloth that holds shape.
# 1.15 is the smallest sweep that is a shape rather than walking room: a
# straight skirt still needs a few cm at the hem to walk in.
FITTED_EASE_CM = 6.0
SWEEP_STANDS_AWAY = 1.15


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


# ===========================================================================
# fabric — WHICH cloth, and why, from what this pattern measures
#
# The sales spec (docs/SATIS-SARTNAMESI.md §4) promises "a fabric suggestion
# with a weight/drape reason". The pack shipped a YARDAGE and nothing else:
# how many metres to buy, never of what. A metre count is not an answer to
# "what do I sew this in", and a beginner who buys viscose for this dress
# gets a limp bag with a zip in it.
#
# Two things this layer will NOT do:
#   1. print a general fabric list. Any book has one; copying it here is
#      wrapper work and says nothing about THIS garment.
#   2. invent a fabric name. Every family, every reason and every warning
#      below is read at print time out of knowledge/stitchu.db (fabrics,
#      filled from NMSU G-401 / SDSU / UNL extension sources, each row
#      carrying its own source_url). If the database is missing, this layer
#      says the source is missing rather than remembering what it said.
#
# The choice itself is the rule in knowledge/sewing-guide.md §1 -- a shape
# that STANDS AWAY from the body wants cloth that holds its shape; a shape
# that FALLS CLOSE wants cloth that drapes -- applied to numbers taken off
# this pattern, not to a garment name.
# ===========================================================================
def _edge_len(geos, panel, edge):
    return geos[panel].segs[edge].length()


def shape_facts(pattern, geos, body_waist_cm=None):
    """The numbers the cloth turns on, measured off this pattern.

    waist_cm   the garment's own waist ring: the waist seams are what joins
               bodice to skirt, so their lengths ARE the ring.
    hem_cm     the skirt edges no stitch touches -- the free bottom.
    sweep      hem / waist. 1.0 is a tube; this dress measures 1.75.
    ease_cm    garment waist minus the graded body waist, when the caller
               knows the body. None rather than a guess if it does not.
    closure    a garment with an unsewn opening is got into through that
               opening, so it is not relying on the cloth stretching.
    """
    used = set()
    waist_cm = 0.0
    for st in pattern['stitches']:
        for side in st:
            used.add((side['panel'], side['edge']))
        a, b = st[0]['panel'], st[1]['panel']
        if _role(a)[0] != _role(b)[0]:          # bodice <-> skirt = the waist
            waist_cm += _edge_len(geos, a, st[0]['edge'])

    hem_cm = 0.0
    for name, geo in geos.items():
        if _role(name)[0] != 'skirt':
            continue
        for i in range(len(geo.segs)):
            if (name, i) not in used:
                hem_cm += _edge_len(geos, name, i)

    return {
        'waist_cm': waist_cm,
        'hem_cm': hem_cm,
        'sweep': (hem_cm / waist_cm) if waist_cm > 0 else None,
        'body_waist_cm': body_waist_cm,
        'ease_cm': (waist_cm - body_waist_cm) if body_waist_cm else None,
        'closure': bool((pattern.get('openings') or {}).get('stitches')),
        'stretch_drafted': False,   # this engine drafts one woven family
    }


def _fabric_rows():
    """The fabric table, read at print time. [] if the source is not there."""
    if not KNOWLEDGE_DB.exists():
        return []
    con = sqlite3.connect(f'file:{KNOWLEDGE_DB}?mode=ro', uri=True)
    try:
        cur = con.execute(
            'SELECT name, name_tr, drape, weight, stretch, good_for, '
            'bad_for, common_mistakes, source_url FROM fabrics ORDER BY name')
        cols = [c[0] for c in cur.description]
        rows = [dict(zip(cols, r)) for r in cur.fetchall()]
    finally:
        con.close()
    for r in rows:
        for k in ('good_for', 'bad_for', 'common_mistakes'):
            try:
                r[k] = json.loads(r[k] or '[]')
            except (TypeError, ValueError):
                r[k] = []
    return rows


def _matches_any(values, words):
    return sorted({v for v in values
                   if any(w in v.lower() for w in words)})


# A cloth is ruled out by what its own source says it is bad for. Two classes,
# because one of the entries is conditional and reading it as unconditional
# gave the wrong answer:
#   HARD  — 'structured', 'tailored', 'woven-drafted': this garment is all
#           three, so these always bite.
#   TIGHT — linen's bad_for is "TIGHT fitted styles", not "fitted styles",
#           and this dress carries +2.5cm of ease at the waist and a 1.75
#           hem sweep, so it is fitted but not tight. Reading the qualifier
#           off made linen an avoid, which contradicts sewing-guide.md 1,
#           where linen is a named choice for a fitted dress. The qualifier
#           is the whole claim, so it is measured instead of dropped.
BAD_HARD = ('structured', 'tailored', 'woven-drafted')
BAD_FITTED = 'fitted'
TIGHT_EASE_CM = 0.0


def _ruled_out(bad_for, tight):
    out = []
    for phrase in bad_for:
        low = phrase.lower()
        if any(w in low for w in BAD_HARD):
            out.append(phrase)
        elif BAD_FITTED in low and ('tight' not in low or tight):
            out.append(phrase)
    return sorted(set(out))


def fabric_advice(pattern, geos, body_waist_cm=None):
    """(facts, picked, avoided, note) -- what to sew this in, and why.

    `note` is non-empty only when the knowledge source could not be read; in
    that case picked/avoided are empty and the caller prints the absence.
    """
    facts = shape_facts(pattern, geos, body_waist_cm)
    rows = _fabric_rows()
    if not rows:
        return facts, [], [], (
            f'kumas kaynagi okunamadi ({KNOWLEDGE_DB.name} yok) — '
            'oneri UYDURULMADI')

    stands_away = (facts['sweep'] or 0.0) >= SWEEP_STANDS_AWAY
    fitted = facts['ease_cm'] is not None and facts['ease_cm'] <= FITTED_EASE_CM
    # both readings of this garment want the same thing, and the guide says
    # so in two separate rows (fitted dress; A-line skirt): hold the shape.
    want_structure = stands_away or fitted
    tight = facts['ease_cm'] is not None and facts['ease_cm'] <= TIGHT_EASE_CM
    picked, avoided = [], []
    for r in rows:
        # a woven pattern drafted with positive ease cannot be handed to a
        # knit: the knit rows say so themselves in bad_for
        knit = r['stretch'] not in (None, '', 'none') and 'none woven' not in r['stretch']
        bad = _ruled_out(r['bad_for'], tight)
        good = _matches_any(r['good_for'], ('dress',))
        holds = _matches_any(r['good_for'], ('structured',))
        if want_structure and (bad or knit):
            avoided.append({'name': r['name'], 'tr': r['name_tr'],
                            'why': bad or [f"esner ({r['stretch']})"],
                            'src': r['source_url']})
        elif want_structure and good and holds:
            picked.append({'name': r['name'], 'tr': r['name_tr'],
                           'drape': r['drape'], 'weight': r['weight'],
                           'cost': r['common_mistakes'],
                           'src': r['source_url']})
    return facts, picked, avoided, ''


def _ascii(s):
    """info page 1 is written in folded Turkish; keep one alphabet on it."""
    table = str.maketrans('ğĞıİşŞçÇöÖüÜâÂî', 'gGiIsScCoOuUaAi')
    return s.translate(table)


def fabric_lines(pattern, geos, body_waist_cm=None, fold=True):
    """(facts, lines, headline). Every sentence carries its own number.

    The headline is the one line that has to fit beside the yardage on page
    1, so it is the NAMES only; the reasoning is a page of its own.
    """
    facts, picked, avoided, note = fabric_advice(pattern, geos, body_waist_cm)
    out = []
    if note:
        out.append(note)
        return facts, out, _ascii(note)

    shape = []
    if facts['ease_cm'] is not None:
        shape.append(f"belde kalibin kendi cevresi {facts['waist_cm']:.1f}cm, "
                     f"vucut beli {facts['body_waist_cm']:.1f}cm "
                     f"(+{facts['ease_cm']:.1f}cm bolluk): sekil dikisten "
                     f"cikiyor, kumasin dokumundan degil")
    if facts['sweep']:
        shape.append(f"etek ucu {facts['hem_cm']:.0f}cm, bel "
                     f"{facts['waist_cm']:.0f}cm — acilma orani "
                     f"{facts['sweep']:.2f}: etek vucuttan ACILIYOR, yani "
                     f"kumasin bu acikligi ayakta tutmasi gerekiyor")
    if facts['closure']:
        shape.append('fermuarla giyiliyor: kumasin esnemesine ihtiyac YOK, '
                     'dokuma (non-stretch) kumas sart')
    out.extend(shape)

    if picked:
        names = ' · '.join(f"{p['tr']} ({p['name']}; {p['weight']}, "
                           f"{p['drape']})" for p in picked)
        out.append('ONERILEN: ' + names)
        out.append('agirlik: 150-250 g/m2 — dukkanda "orta agirlik, diri, '
                   'kati tutar" diye isteyin (sewing-guide.md, gramaj satiri)')
        costs = sorted({c for p in picked for c in p['cost']})
        if costs:
            out.append('bedeli: ' + '; '.join(costs))
    if avoided:
        out.append('KACININ: ' + ' · '.join(
            f"{a['tr']} ({a['name']} — {', '.join(a['why'])})"
            for a in avoided))
    out.append('kaynak: knowledge/stitchu.db fabrics (NMSU G-401, SDSU '
               'Extension, UNL NF00-415) + knowledge/sewing-guide.md 1. bolum')
    head = ('ONERILEN KUMAS: '
            + ' ya da '.join(p['tr'] for p in picked)
            + ' — orta agirlik, dokuma') if picked else \
           'ONERILEN KUMAS: bu kalip icin kaynakta eslesen kumas yok'
    lines = [_ascii(s) for s in out] if fold else out
    return facts, lines, _ascii(head)


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
