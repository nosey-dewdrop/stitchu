#!/usr/bin/env python3
# ============================================================================
# G0 — YER GERÇEĞİ FİKSTÜRÜ (2026-08-10, Faz C kapı 0).
# Kaynak: patterns_real/geometry/geometry-full.json (PDF vektör, mm-kalibre).
# ring-trace-locket-front-38.json KULLANILMAZ (652mm'si düz-çizgi tahmini,
# CLAUDE.md 29 Tem dersi). Bu modül sonraki kapıların (G5 mm kıyası, G6
# round-trip) tek veri kapısıdır: kalıp halkası → kapalı poligon (mm).
# Doğrudan koşunca kendini doğrular: Locket Front Body 38 çevresi yeniden
# hesaplanır ve kayıtlı perimMM ile ±0.1mm; 38'in tüm parçaları listelenir.
# ============================================================================
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GEO = ROOT / 'patterns_real/geometry/geometry-full.json'


def _load():
    return json.loads(GEO.read_text())


def ring(pattern, piece, size):
    """Kapalı halka poligonu (mm, Nx2 liste) + kayıt metadatası."""
    g = _load()
    for r in g['rings']:
        if r['pattern'] == pattern and r['piece'] == piece and str(r['sizeGuess']) == str(size):
            return r
    raise KeyError(f'{pattern}/{piece}/{size} yok')


def perim(poly):
    return sum(math.dist(poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly)))


def pieces_of(pattern, size):
    g = _load()
    return sorted({r['piece'] for r in g['rings']
                   if r['pattern'] == pattern and str(r['sizeGuess']) == str(size)})


if __name__ == '__main__':
    fails = 0
    r = ring('locket_top', 'Front Body', 38)
    p = perim(r['polygon'])
    dev = abs(p - r['perimMM'])
    print(f"Locket Front Body 38: kayıtlı {r['perimMM']}mm, yeniden hesap {p:.1f}mm, fark {dev:.3f}mm")
    if dev > 0.1:
        print('G0 FAIL: çevre yeniden üretilemedi'); fails += 1
    if r.get('anomaly'):
        print(f"  not: anomaly={r['anomaly']}")
    print('Locket 38 parçaları:', ', '.join(pieces_of('locket_top', 38)))
    # kapanma: her 38 halkası gerçekten kapalı mı (closureGapMM)?
    g = _load()
    for rr in g['rings']:
        if rr['pattern'] == 'locket_top' and str(rr['sizeGuess']) == '38' and rr['closureGapMM'] > 1.0:
            print(f"G0 FAIL: {rr['piece']} 38 kapanma açığı {rr['closureGapMM']}mm"); fails += 1
    if fails:
        raise SystemExit(1)
    print('G0 OK: yer gerçeği fikstürü sağlam (mm, kapalı, yeniden üretilebilir)')
