#!/usr/bin/env python3
# ============================================================================
# L0 TEK VÜCUT KONTRATI ÜRETİCİ (2026-08-10).
# Bugün vücut İKİ kaynaktan okunuyor: flat → contract/figure-bands.json
# figur_croquis (px, Zoe Hong stilize), kalıp → bodies/mean_all.yaml + grade
# (cm, gerçek). Bu script ikisini TEK dosyada toplar ve aralarındaki stilizasyon
# makasını ÖLÇÜP kaydeder. h0-vucut.py bu dosyanın tazeliğini ve makasın
# kımıldamadığını bekler. Kullanım: python3 uret-body-kontrat.py [EU38 ...]
# ============================================================================
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'engine/pattern-bridge'))
import mapping  # noqa: E402

fb = json.loads((ROOT / 'contract/figure-bands.json').read_text())
cro = fb['figur_croquis']['oran']

sizes = sys.argv[1:] or ['EU38']
outdir = ROOT / 'contract/layers'
outdir.mkdir(parents=True, exist_ok=True)

for size in sizes:
    notes = []
    body = mapping.graded_body(mapping.SIZES.index(size), notes)
    # stilizasyon makası: croquis İZDÜŞÜM oranı vs gerçek ÇEVRE oranı.
    # Bunlar eşit OLMAZ (croquis 9-baş fashion figürü, çevre≠izdüşüm);
    # makas bilinçli, ÖLÇÜLÜR ve pinlenir — h0 drift bekçisidir.
    makas = {
        'bel_bust_croquis_izdusum': round(cro['bel'] / 1.0, 4),          # bel/koltukaltı (B paydası)
        'bel_bust_gercek_cevre': round(body['waist'] / body['bust'], 4),
        'kalca_bust_croquis_izdusum': round(cro['kalca'] / 1.0, 4),
        'kalca_bust_gercek_cevre': round(body['hips'] / body['bust'], 4),
        'omuz_bust_croquis_izdusum': round(cro['omuz'] / 1.0, 4),
    }
    makas['bel_stilizasyon_faktoru'] = round(
        makas['bel_bust_croquis_izdusum'] / makas['bel_bust_gercek_cevre'], 4)
    makas['kalca_stilizasyon_faktoru'] = round(
        makas['kalca_bust_croquis_izdusum'] / makas['kalca_bust_gercek_cevre'], 4)
    doc = {
        '_rol': 'L0 TEK VÜCUT KONTRATI — kalıp gövdesi (cm, gerçek) + flat croquis (oran, stilize) '
                'tek dosyada. Üretici: engine-check/harness/uret-body-kontrat.py; bekçi: h0-vucut.py. '
                'Elle düzenlenmez.',
        'beden': size,
        '_kolon_sayimi': (
            'TUR 17B (2026-08-17) — BU 26 SAYININ HİÇBİRİ BU BEDENDE ÖLÇÜLMEDİ. '
            'Hepsi engine/pattern-bridge/bodies/mean_all.yaml adlı TEK gövdeden '
            '(GarmentCode ortalama seti, ~EU44 çapası) mapping.py GRADE_PER_SIZE '
            'kuralıyla doğrusal olarak uzatılmıştır: 16 alan +sabit adım/beden, 10 '
            'alan hiç kımıldamıyor (arm_length, arm_pose_angle, bust_line, '
            'crotch_hip_diff, head_l, height, hip_inclination, hips_line, '
            'shoulder_incl, vert_bust_line). Sekiz beden taşımak sekiz ölçüm '
            'yapmaz. ⚠ Bu yüzden buradaki bel 72.3338cm, contract/tables.json '
            'euSizeChart EU38 belinin (70.0cm) yerine GEÇMEZ — ikisi ayrı gövde '
            've bu dosya motoru beslemiyor (Tur 7 ölçtü: tek tüketici '
            'flatten-research/17-garment-surface.py). '
            '★ shoulder_incl 21.6777 sekiz bedende de aynıdır ve bu bir kusur '
            'DEĞİL: gerçek bir 8 bedenli endüstriyel kalıpta (Buğra Locket) omuz '
            'EĞİMİ ön 0.18°, arka 0.09° aralıkta sabit kalıyor, graded olan omuz '
            'BOYU (ön 63.00→67.75mm). Ölçüm: '
            'flatten-research/20-shoulder-slope.py. Sabitlik doğrulandı, DEĞERİN '
            'kendisi (nape→uç düşüşü) doğrulanmadı.'),
        'olculer_cm': body,
        'grade_notu': notes,
        'croquis_oran': cro,
        'stilizasyon_makasi': makas,
    }
    (outdir / f'body.{size}.json').write_text(json.dumps(doc, indent=2, ensure_ascii=False) + '\n')
    print(f'{size}: bel {body["waist"]}cm bust {body["bust"]}cm | croquis bel/B {cro["bel"]} | '
          f'bel stilizasyon x{makas["bel_stilizasyon_faktoru"]}')
