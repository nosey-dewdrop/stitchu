// ============================================================================
// GARMENT EASE TÜRETİCİ (2026-08-10).
// 4aec2e5 tek croquis'e geçerken BOYLARI torso oranı olarak taşıdı ("garment
// lengths carried over as fractions of the torso") ama GENİŞLİKLERİ taşımadı:
// giysi gövdesi vücudun kendisine çöktü (boxy 0.74'e figürelleşti, 21 stil tek
// waist/bust'a indi, preview-truth paydası giysi göğsünden anatomik koltukaltına
// kaydı). Bu script taşımanın eksik yarısını ÖLÇÜMLE tamamlar:
//
//   eski onaylı kalem (30fae0e, 4aec2e5'ten hemen önce) her stil için
//   varsayılan kadranlarla koşulur, giysi genişlikleri k'dan okunur;
//   aynı stil yeni kalemde koşulur, YENİ VÜCUT çapaları okunur;
//   oran = eskiGiysi / yeniVücut → contract/figure-bands.json garment_ease.
//
// Figür TEK kalır (Damla 5 Ağu emri), giysi bolluğu geri gelir (mandal emri).
// Kullanım: node engine/tools/derive-garment-ease.mjs <eski-kalem-kökü>
//   ör: git worktree add /tmp/stitchu-old 30fae0e
//       node engine/tools/derive-garment-ease.mjs /tmp/stitchu-old
// Çıktı stdout'a JSON döker (elle contract'a yazılmaz, incele → yerleştir).
// ============================================================================
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const oldRoot = process.argv[2];
if (!oldRoot) { console.error('kullanım: node derive-garment-ease.mjs <eski-kalem-kökü>'); process.exit(2); }

const neu = await import(pathToFileURL(join(root, 'engine/flat-engine/_engine-full.mjs')).href);
const old = await import(pathToFileURL(join(oldRoot, 'engine/flat-engine/_engine-full.mjs')).href);
const FB = JSON.parse(readFileSync(join(root, 'contract/figure-bands.json'), 'utf8'));
const CR = FB.figur_croquis.oran;

const cx = 240;
function kOf(mod, styleKey) {
  const p = mod.defaults(styleKey);
  const b = mod.buildHalf(p, cx, false, mod.rng(p.seed * 131 + 13));
  return { k: b.k, p };
}

// yeni vücut çapaları (figureOf ile birebir aynı formül; export edilmediği için
// contract'tan yeniden hesaplanır ve yeni k'ya karşı doğrulanır)
function bodyAnchors(szShp, S) {
  const B = (szShp / CR.omuz) * S;
  return { B, waistHalf: CR.bel * B, hipHalf: CR.kalca * B };
}

const out = {};
const oldStyles = new Set(Object.keys(old.STYLE));
const S = neu.SIZE ? null : null; // unitPX her iki tarafta aynı tabloda; k üzerinden ölçüyoruz

for (const key of Object.keys(neu.STYLE)) {
  if (!oldStyles.has(key)) { out[key] = { not_in_old: true }; continue; }
  const o = kOf(old, key), n = kOf(neu, key);
  const sz = neu.SIZE[o.p.size];
  // çapa doğrulaması: yeni kalemde bustX === F.uaX === B olmalı (boxy/fitted-band
  // stillerinde bustX türetilmiş olabilir; ondan bağımsız vücut B'sini stX'ten kur)
  // stX = cx + sz.shp*S her iki sürümde de aynı ölçek → S'i stX'ten geri çöz.
  const unit = (n.k.stX !== undefined ? (n.k.stX - cx) / sz.shp
              : (o.k.stX - cx) / sz.shp);
  const body = bodyAnchors(sz.shp, unit);
  const rec = {
    // oranlar: eski onaylı giysi genişliği / yeni vücut çapası
    bust: +( (o.k.bustX - cx) / body.B ).toFixed(4),
    waist: +( (o.k.eX - cx) / body.waistHalf ).toFixed(4),
    hem: +( (o.k.hX - cx) / body.hipHalf ).toFixed(4),
    _eski_px: { bust: +(o.k.bustX - cx).toFixed(2), waist: +(o.k.eX - cx).toFixed(2), hem: +(o.k.hX - cx).toFixed(2) },
    _yeni_vucut_px: { bust: +body.B.toFixed(2), waist: +body.waistHalf.toFixed(2), hip: +body.hipHalf.toFixed(2) },
    _yeni_bugun_px: { bust: +(n.k.bustX - cx).toFixed(2), waist: +(n.k.eX - cx).toFixed(2), hem: +(n.k.hX - cx).toFixed(2) },
  };
  out[key] = rec;
}

console.log(JSON.stringify({
  _provenance: {
    method: 'derive-garment-ease.mjs — eski kalem k (varsayılan kadranlar, ön yarım) / yeni vücut çapası',
    old_commit: '30fae0e', date: '2026-08-10',
    anchor: 'stX=sz.shp*unitPX iki sürümde de aynı; vücut B=(shp/oran.omuz)*unit',
  },
  ease: out,
}, null, 2));
