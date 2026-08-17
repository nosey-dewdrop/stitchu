#!/usr/bin/env python3
# ============================================================================
# atolye-bridge-check.py — VITRIN-MOTOR ACIGI KAPISI (TUR 17C)
#
# Soru: atolye.html'in kadranlarindan kaci INDIRILEN KALIBI gercekten oynatiyor?
#
# Tur 15 sevk edilen motor icin cevabi biliyordu (surface-pattern tek argüman
# alir: beden etiketi -> HICBIRI). Bu kapi digerini olcer: /api/pattern'in
# gercekten surdugu ARSIV HAT (serve.py -> generate.py -> mapping.py ->
# GarmentCode) kac kadrani okuyor.
#
# Kapi ne yapar: yeniden OLCER ve olcumu engine/tools/atolye/bridge-dead.json
# ile karsilastirir. Sayfa o dosyadan yazi basiyor; dosya bayatlarsa sayfa yalan
# soyler. Bu yuzden bayatlama = KIRMIZI.
#
#   python3 engine/tools/atolye-bridge-check.py --check    (kapi, exit 1 = kirmizi)
#   python3 engine/tools/atolye-bridge-check.py --write    (olcumu yeniden yaz)
#
# ⚠ KAPIYI BOYAMA: olcum degistiyse dogru hamle bu dosyayi --write ile
# tazelemek DEGIL, once "kadran neden oldu" sorusunu cevaplamaktir. --write
# bilerek ayri bir bayrak; --check onu kendiliginden cagirmaz.
#
# GarmentCode venv'i yoksa kapi YESIL BASMAZ, exit 2 ile "OLCULEMEDI" der.
# Olculmemis bir sey yesil sayilamaz.
# ============================================================================
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
VENV_PY = REPO / 'core' / 'third_party' / 'garmentcode' / '.venv' / 'bin' / 'python'
GENERATE = REPO / 'engine' / 'pattern-bridge' / 'generate.py'
PAGE = REPO / 'web' / 'atolye.html'
FACTS = REPO / 'engine' / 'tools' / 'atolye' / 'bridge-dead.json'

# Bu kadranlarin varsayilan topolojide baska bir uc degeri var (choice kadrani).
CHOICE_PROBES = [('_garment', 'top'), ('_bodice', 'band'), ('_neckShape', 'v'),
                 ('_peplum', 'full'), ('_waistTie', 'bow'), ('_wrapDir', 'left'),
                 ('_ink', 'minimal'), ('_asym', False)]


def _array(src, name):
    """Sayfadaki `const NAME = [...]` dizisini JS'e sormadan cikarir."""
    m = re.search(r'^(?:var|const|let)\s+%s\s*=\s*\[' % name, src, re.M)
    if not m:
        sys.exit(f'FAIL: web/atolye.html icinde {name} dizisi yok')
    i, depth = m.end() - 1, 0
    for j in range(i, len(src)):
        if src[j] == '[':
            depth += 1
        elif src[j] == ']':
            depth -= 1
            if depth == 0:
                break
    return json.loads(subprocess.run(
        ['node', '-e', 'console.log(JSON.stringify(%s))' % src[i:j + 1]],
        capture_output=True, text=True, check=True).stdout)


def read_page():
    src = PAGE.read_text()
    M = _array(src, 'M')
    FLAGS = _array(src, 'FLAGS')
    SFLAGS = _array(src, 'SFLAGS')
    state = {'_garment': 'dress', '_bodice': 'shoulder', '_neckShape': 'round',
             '_peplum': 'none', '_waistTie': 'none', '_wrapDir': 'right',
             '_ink': 'orta', '_asym': True}
    for a in M:
        state[a[0]] = a[6]
    for a in FLAGS + SFLAGS:
        state[a[0]] = a[3]
    probes = [(a[0], a[4] if state[a[0]] != a[4] else a[3]) for a in M]
    probes += [(a[0], not state[a[0]]) for a in FLAGS + SFLAGS]
    probes += CHOICE_PROBES
    return state, probes


def canon(spec_path):
    """Panel GEOMETRISI + dikis KUMESI. Sira bilerek atilir: arsiv hat bayt
    determinist degil (ayni durum iki farkli dikis SIRASI veriyor, geometri
    ozdes). Siraya bakan bir karsilastirma her kadrani 'canli' gosterirdi —
    ilk olcum tam bu yuzden 61/61 dedi ve YANLISTI."""
    pat = json.loads(Path(spec_path).read_text())['pattern']
    core = {'panels': pat['panels'],
            'panel_order': sorted(pat['panel_order']),
            'stitches': sorted(tuple(sorted((x['panel'], x['edge']) for x in s))
                               for s in pat['stitches'])}
    return hashlib.sha256(json.dumps(core, sort_keys=True).encode()).hexdigest()


def run(state, out):
    out = Path(out)
    if out.exists():
        shutil.rmtree(out)
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump(state, f)
        sp = f.name
    r = subprocess.run([str(VENV_PY), str(GENERATE), sp, str(out), '--no-print'],
                       capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        return None, None
    return canon(out / 'stitchu_specification.json'), \
        {e['field'] for e in json.loads((out / 'mapping-notes.json').read_text())}


def ui_faded(state):
    """Sayfanin KENDI inertKeys()'i, ayni durum icin. Sayfa bu kadranlari zaten
    solduruyor = kullaniciya 'bu okunmuyor' diyor. Onlarin kalipta da olu
    olmasi bir VAAT IHLALI DEGIL. Kirilan vaat, PARLAK durup kalibi
    oynatmayan kadrandir — kapinin sayisi odur."""
    src = PAGE.read_text()
    m = re.search(r'function inertKeys\(s\) \{[\s\S]*?\n\}', src)
    if not m:
        sys.exit('FAIL: web/atolye.html icinde inertKeys() yok')
    js = '%s\nconsole.log(JSON.stringify([...inertKeys(%s)]));' % (
        m.group(0), json.dumps(state))
    return set(json.loads(subprocess.run(['node', '-e', js], capture_output=True,
                                         text=True, check=True).stdout))


def measure():
    state, probes = read_page()
    faded = ui_faded(state)
    with tempfile.TemporaryDirectory(prefix='atolye-bridge-') as tmp:
        base, noted = run(state, Path(tmp) / 'base')
        if base is None:
            sys.exit('FAIL: generate.py taban durumda cokuyor — olcum yapilamadi')
        again, _ = run(state, Path(tmp) / 'base2')
        det = (base == again)
        live, dead = [], []
        for k, v in probes:
            s = dict(state)
            s[k] = v
            h, _ = run(s, Path(tmp) / 'probe')
            (live if h is not None and h != base else dead).append(k)
    # Bir kadran birden cok kez sondalanabilir (_neckShape); bir kez bile
    # kalibi oynattiysa CANLI sayilir.
    live_set = sorted(set(live))
    dead_set = sorted(set(dead) - set(live_set))
    bright_dead = sorted(k for k in dead_set if k not in faded)
    return {'canonical_determinism': det, 'live': live_set, 'dead': dead_set,
            'ui_faded': sorted(faded), 'bright_dead': bright_dead,
            'silently_swallowed': sorted(k for k in bright_dead if k not in noted)}


def main():
    ap = argparse.ArgumentParser(description='atolye kadranlari -> indirilen kalip acigi')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--write', action='store_true')
    a = ap.parse_args()
    if not (a.check or a.write):
        ap.error('--check ya da --write ver')
    if not VENV_PY.exists():
        print('OLCULEMEDI: GarmentCode venv yok (%s).' % VENV_PY)
        print('Olculmemis bir kapi YESIL sayilmaz — scripts/setup-garmentcode.sh')
        sys.exit(2)

    got = measure()
    facts = json.loads(FACTS.read_text())
    if a.write:
        facts['sayim']['kalibi_oynatan'] = len(got['live'])
        facts['sayim']['kalibi_oynatmayan'] = len(got['dead'])
        facts['sayim']['ui_solduruyor'] = len(got['ui_faded'])
        facts['sayim']['UI_PARLAK_AMA_KALIP_OKUMUYOR'] = len(got['bright_dead'])
        facts['sayim']['bunlardan_SESSIZCE_YUTULAN'] = len(got['silently_swallowed'])
        facts['sayim']['bunlardan_notta_ilan_edilen'] = \
            len(got['bright_dead']) - len(got['silently_swallowed'])
        facts['kalibi_oynatan'] = got['live']
        facts['ui_parlak_ama_kalip_okumuyor'] = got['bright_dead']
        facts['sessizce_yutulan'] = got['silently_swallowed']
        FACTS.write_text(json.dumps(facts, ensure_ascii=False, indent=2) + '\n')
        print('yazildi:', FACTS.relative_to(REPO))
        return

    red = []
    if set(got['live']) != set(facts['kalibi_oynatan']):
        red.append(('canli kadran kumesi', 'ilan %d, olculen %d; fark: %s'
                    % (len(facts['kalibi_oynatan']), len(got['live']),
                       sorted(set(got['live']) ^ set(facts['kalibi_oynatan'])))))
    if set(got['bright_dead']) != set(facts['ui_parlak_ama_kalip_okumuyor']):
        red.append(('UI parlak ama kalip okumuyor', 'ilan %d, olculen %d; fark: %s'
                    % (len(facts['ui_parlak_ama_kalip_okumuyor']), len(got['bright_dead']),
                       sorted(set(got['bright_dead']) ^ set(facts['ui_parlak_ama_kalip_okumuyor'])))))
    if set(got['silently_swallowed']) != set(facts['sessizce_yutulan']):
        red.append(('sessizce yutulan kume', 'ilan %d, olculen %d; fark: %s'
                    % (len(facts['sessizce_yutulan']), len(got['silently_swallowed']),
                       sorted(set(got['silently_swallowed']) ^ set(facts['sessizce_yutulan'])))))
    if not got['canonical_determinism']:
        red.append(('kanonik determinizm',
                    'ayni durum iki kosuda FARKLI panel geometrisi verdi'))

    print('atolye kopru olcumu: %d kadran kalibi oynatiyor, %d oynatmiyor '
          '(%d\'ini UI zaten solduruyor). UI PARLAK ama kalip okumuyor: %d, '
          'bunlardan %d SESSIZ (notta bile yok).'
          % (len(got['live']), len(got['dead']), len(got['ui_faded']),
             len(got['bright_dead']), len(got['silently_swallowed'])))
    if red:
        print('KAPI: KIRMIZI — %d hukum:' % len(red))
        for n, c in red:
            print('  %s: %s' % (n, c))
        print('⚠ Once "kadran neden oldu/dirildi" sorusunu cevapla. --write bir '
              'cevap degil, bir kayit tazelemesidir.')
        sys.exit(1)
    print('KAPI: YESIL — sayfanin ilan ettigi acik, olculen acikla ayni')


if __name__ == '__main__':
    main()
