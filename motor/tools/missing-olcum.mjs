// missing-olcum.mjs — DÜRÜSTLÜK KATMANI TERS YÖNDE YALAN SÖYLÜYOR MU?
//
// DAMLA-KUYRUK.md (22 Ağu, "[ÖLÇÜM GEREK]"): `web/js/missing.js` alıcıya
// "lace-up çizili değil / fiyonk parça olarak çizili değil / düğme patı çizili
// değil" diyor, oysa laceupback.cpp / tie.cpp / buttonrow.cpp var ve kapıları
// yeşil. O kayıt "sadece grep'le bakıldı, KOŞTURARAK DOĞRULANMADI" diyor.
// Bu dosya koşturur.
//
// Zincir, ürünün kullandığı fonksiyonların TA KENDİSİ:
//   vision `seen`  --(vision-bridge.js pick*)-->  spec alanı
//                  --(vision-bridge.js buildSeenRecord)-->  çizildi bayrakları
//                  --(missing.js missingFeatures)-->  alıcıya gösterilen kart
//                  --(engine draftJSON)-->  kalıpta gerçekten parça var mı
//
// Dört sonuç sınıfı:
//   DOGRU-SESSIZ  motor çizdi, kart YOK, kalıpta parça VAR      -> doğru
//   TERS-YALAN    motor çizdi ama kart hâlâ "çizemedim" diyor    -> KIRMIZI
//   DURUST        motor çizmedi, kart var                        -> doğru
//   SESSIZ-DUSUS  motor çizmedi, kart da yok                     -> en kötüsü
import {
  pickTiePlacement, pickLaceUpBack, pickCollar, pickBackOpening, pickPeplum,
  pickPocket, pickCuff, pickBackDetail, pickExposedZip, pickGather, pickYoke,
  buildSeenRecord,
} from '../../web/js/vision-bridge.js';
import { missingFeatures } from '../../web/js/missing.js';
import { draft } from './spec-diff.mjs';

// create.js'in vision dalındaki host kapıları (satır atıfları yorumda) — her
// biri TEK bir koşul, kopya değil atıf.
const SPEC_DEFAULTS = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  tieClosure: 'none', laceUpBack: 'none', collarType: 'none', collarEdge: 'round',
  gatherType: 'none', gatherZone: 'neckline', backOpening: 'none', wrapFront: 'none',
  backSlit: 'none', ruffledStraps: 'none', peplum: 'none', hemFlounce: 'none',
  placketStyle: 'none', frontPlacket: false, edgeFinish: 'biasBinding',
  pocketStyle: 'none', cuffStyle: 'none', hemShape: 'straight', shoulderStyle: 'set',
  buttonRow: 'none', exposedZip: 'none', backDetail: 'none', bardotStyle: 'none',
  cupSeam: 'none', yoke: 'none', boxPleat: 'none', sleeveCap: 'plain', ruffle: 'none',
  keyhole: 'none',
};

// Vision okumaları — hepsi worker'ın gerçekten ürettiği şekilde (structured
// alanlar + serbest outOfVocab kanalı).
const READINGS = [
  ['korse bağcıklı sırt', { closure: { type: 'lace-up', location: 'center back' }, backDetail: 'lacedBack', outOfVocab: ['corset lace-up back'] }],
  ['ön yaka fiyonku', { closure: { type: 'ties', location: 'front neck' }, outOfVocab: ['neck bow'] }],
  ['bel bağı / kuşak', { closure: { type: 'ties', location: 'waist' }, outOfVocab: ['self-fabric sash'] }],
  ['düğme patı (ön)', { closure: { type: 'buttons', location: 'center front' }, outOfVocab: ['button front placket'] }],
  ['düğme sırası (kapanma okunmadı)', { closure: null, outOfVocab: ['row of buttons down the front'], details: 'a row of buttons' }],
  ['bebe yaka', { collar: { type: 'peterPan', name: 'Peter Pan collar' }, outOfVocab: [] }],
  ['gömlek yakası', { collar: { type: 'shirt', name: 'shirt collar' }, outOfVocab: [] }],
  ['denizci yaka (çizilemez)', { collar: { type: 'sailor', name: 'sailor collar' }, outOfVocab: [] }],
  ['açık sırt oyuğu', { backDetail: 'openBack', outOfVocab: ['round open back'] }],
  ['arka fırfır', { backDetail: 'ruffle', outOfVocab: ['back neck ruffle'] }],
  ['görünür fermuar (arka)', { closure: { type: 'zipper', location: 'center back' }, outOfVocab: ['exposed zipper'] }],
  ['yama cep', { outOfVocab: ['patch pockets'] }],
  ['manşet', { outOfVocab: ['buttoned cuff'] }],
  ['büzgülü yaka (drawstring)', { yoke: { type: 'shirred', name: 'shirred yoke' }, outOfVocab: ['drawstring neckline'] }],
  ['peplum', { outOfVocab: ['peplum at the waist'] }],
];

function specFor(seen) {
  const s = { ...SPEC_DEFAULTS };
  // create.js:492  spec.tieClosure = pickTiePlacement(seen)
  s.tieClosure = pickTiePlacement(seen) || 'none';
  // create.js:527  laceUpBack: pick + host (garment !== 'skirt')
  s.laceUpBack = (pickLaceUpBack(seen) && s.garment !== 'skirt') ? 'corset' : 'none';
  // create.js:497  collar
  const collar = pickCollar(seen);
  if (collar) { s.collarType = collar.type; s.collarEdge = collar.edge; }
  // create.js:513  gather
  const g = pickGather(seen);
  if (g) { s.gatherType = g.type; s.gatherZone = g.zone; }
  // create.js:521  backOpening
  s.backOpening = pickBackOpening(seen) || 'none';
  s.peplum = pickPeplum(seen) || 'none';
  s.pocketStyle = pickPocket(seen) || 'none';
  s.cuffStyle = (s.sleeveStyle === 'straight' ? pickCuff(seen) : null) || 'none';
  s.backDetail = pickBackDetail(seen) || 'none';
  s.exposedZip = pickExposedZip(seen) || 'none';
  // create.js:639-641 yoke + host (garment !== 'skirt')
  const yokePick = pickYoke(seen);
  s.yoke = yokePick ? (yokePick === 2 ? 'gathered' : 'plain') : 'none';
  // create.js:459-470 front button placket
  let frontButtons = false;
  if (seen.closure && (seen.closure.type === 'buttons' || seen.closure.type === 'placket')) {
    const loc = (seen.closure.location || '').toLowerCase();
    if (!loc || loc.includes('front') || loc.includes('center') || loc.includes('ön')) frontButtons = true;
  }
  s.placketStyle = frontButtons ? 'standard' : 'none';
  s.frontPlacket = s.placketStyle === 'standard';
  // create.js:653-657 decorative button row
  const buttonsRead = /button/.test(((seen.outOfVocab || []).join(' ')) + ' ' + (seen.details || ''));
  s.buttonRow = (buttonsRead && s.placketStyle === 'none' && !s.frontPlacket) ? 'decorative' : 'none';
  return s;
}

const rows = [];
for (const [ad, raw] of READINGS) {
  const seen = { outOfVocab: [], ...raw };
  const spec = specFor(seen);
  spec.seen = buildSeenRecord(spec, seen);
  const cards = missingFeatures(spec.seen, 'tr');
  const drawnFlags = Object.entries(spec.seen)
    .filter(([k, v]) => k.endsWith('Drawn') && v === true).map(([k]) => k);
  const d = await draft(spec);
  const pieces = d.error ? [] : d.pattern.pieces.map((p) => p.name);
  const base = await draft(SPEC_DEFAULTS);
  const basePieces = base.error ? [] : base.pattern.pieces.map((p) => p.name);
  const newPieces = pieces.filter((n) => !basePieces.includes(n));
  const drew = drawnFlags.length > 0;
  const reported = cards.length > 0;
  let cls;
  if (drew && !reported) cls = 'DOGRU-SESSIZ';
  else if (drew && reported) cls = 'TERS-YALAN?';
  else if (!drew && reported) cls = 'DURUST';
  else cls = 'SESSIZ-DUSUS';
  rows.push({ ad, cls, drawnFlags, cards: cards.map((c) => c.label), newPieces, err: d.error || '' });
}

const w = (s, n) => String(s).padEnd(n);
console.log(w('okuma', 30), w('sınıf', 14), w('çizildi bayrağı', 22), 'kart / yeni panel');
console.log('-'.repeat(120));
for (const r of rows) {
  console.log(w(r.ad, 30), w(r.cls, 14), w(r.drawnFlags.join(',') || '-', 22),
    `kart=[${r.cards.join(' ; ') || '-'}] panel=[${r.newPieces.join(', ') || '-'}]${r.err ? ' HATA:' + r.err : ''}`);
}
const say = (c) => rows.filter((r) => r.cls === c).length;
console.log('-'.repeat(120));
console.log(`TOPLAM ${rows.length} okuma · DOGRU-SESSIZ ${say('DOGRU-SESSIZ')} · TERS-YALAN? ${say('TERS-YALAN?')} · DURUST ${say('DURUST')} · SESSIZ-DUSUS ${say('SESSIZ-DUSUS')}`);
console.log('NOT: TERS-YALAN? bir bayrak çizildi derken ayrı bir kartın hâlâ basılması demektir; kartın');
console.log('     hangi öğeye ait olduğu satırda yazılı — aynı okumanın BAŞKA bir öğesine aitse yalan değildir.');
