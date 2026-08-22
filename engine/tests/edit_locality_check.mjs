// edit_locality_check — F-I KAPISI.
//
// Damla: "midjourney gibi editleme olacak: fiyonk ekle şuraya, uzatma,
// kısaltma, yakayı değiştirme."
//
// Kapının tek cümlesi: "yakayı değiştir" deyince DOKUNULMAYAN paneller
// BAYT-AYNI kalmalı. Bölge ilanı motorun çıktısından türetilmez, yayınlanmış
// contract/edit-locality-v1.json'dan (o da composition.json'un conflictClass'ından)
// gelir — ORTAK.md md.3.
//
// ANTI-HACK (kapı boş olmasın diye üç ayrı mandal):
//   A1  Aynı diff "tüm spec'i yeniden yaz" kipinde uygulanırsa KIRMIZI düşmeli.
//       Düşmüyorsa kapının dişi yok -> test FAIL.
//   A2  Her vakada bölge dışı yargılanan panel sayısı > 0 olmalı; sıfırsa
//       lokallik iddiası boşlukta ölçülmüş demektir -> FAIL.
//   A3  Hiçbir vaka SESSİZ NO-OP olamaz. Kalıp hiç kımıldamıyorsa "dokunulmayan
//       panel bayt-aynı" bedava geçer; bu, kapıyı yeşil tutmanın en ucuz yolu.
import {
  runEdit, applyDiff, draft, localityReport, touchedZones, untouchablePatterns, BODY,
} from '../tools/spec-diff.mjs';

const BASE = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};

// Damla'nın saydığı düzenleme fiilleri, bölge bölge.
const CASES = [
  ['yakayı değiştir (bebe yaka)', { field: 'collarType', value: 'peterPan' }],
  ['yaka oyuğunu değiştir (V)', { field: 'neckline', value: 'vNeck' }],
  ['fiyonk ekle (ön yaka)', { field: 'tieClosure', value: 'frontNeckBow' }],
  ['uzat (etek maxi)', { field: 'skirtLength', value: 'maxi' }],
  ['kısalt (kol kısa)', { field: 'sleeveLength', value: 'short' }],
  ['manşet ekle', { field: 'cuffStyle', value: 'button' }],
  ['cep ekle (yama)', { field: 'pocketStyle', value: 'patch' }],
  ['peplum ekle', { field: 'peplum', value: 'full' }],
  ['sırtı aç', { field: 'backOpening', value: 'round' }],
  ['düğme sırası ekle', { field: 'buttonRow', value: 'decorative' }],
  ['etek ucuna volan', { field: 'hemFlounce', value: 'gathered' }],
  ['korse bağcıklı sırt', { field: 'laceUpBack', value: 'corset' }],
];

let fail = 0;
const line = (ok, s) => { if (!ok) fail++; console.log(`${ok ? 'OK  ' : 'FAIL'} ${s}`); };

for (const [ad, op] of CASES) {
  const diff = { why: ad, ops: [{ op: 'set', ...op }] };
  const r = await runEdit(BASE, diff);
  if (r.stage !== 'tamam') { line(false, `${ad}: ${r.stage} aşamasında reddedildi -> ${r.rejected.join(' / ')}`); continue; }
  if (r.rejected.length) { line(false, `${ad}: ${r.rejected.join(' / ')}`); continue; }   // A3
  if (r.locality.checked === 0) {                                                          // A2
    line(false, `${ad}: bölge dışı yargılanan panel YOK (bölge ${r.zones.join('+')}, kalıp: ${r.after.pattern.pieces.map((p) => p.name).join(', ')})`);
    continue;
  }
  line(r.locality.violations.length === 0,
    `${ad} [${r.zones.join('+')}] bölge dışı ${r.locality.checked} panel bayt-aynı: ${r.locality.held.join(', ')}` +
    (r.locality.violations.length ? ` | İHLAL: ${r.locality.violations.join('; ')}` : ''));
}

// ── A1: aynı diff'i tüm spec'i yeniden yazacak şekilde uygula -> KIRMIZI ────
console.log('--- ANTI-HACK A1: diff yerine tüm spec yeniden yazılırsa');
let antiCaught = 0;
for (const [ad, op] of CASES) {
  const ops = [{ op: 'set', ...op }];
  const zones = touchedZones(ops);
  if (!untouchablePatterns(zones).length) continue;
  const before = await draft(BASE, BODY);
  const after = await draft(applyDiff(BASE, ops, 'rewrite'), BODY);
  if (before.error || after.error) continue;
  const rep = localityReport(before.pattern, after.pattern, zones);
  if (rep.violations.length) antiCaught++;
  else console.log(`     (yakalanmadı: ${ad})`);
}
line(antiCaught > 0,
  `tüm-spec-yeniden-yazma ${antiCaught}/${CASES.length} vakada LOKALLİK İHLALİ olarak yakalandı` +
  (antiCaught ? '' : ' — kapının dişi yok'));

console.log(fail ? `edit_locality_check: ${fail} KIRMIZI` : 'edit_locality_check: hepsi yeşil');
process.exit(fail ? 1 : 0);
