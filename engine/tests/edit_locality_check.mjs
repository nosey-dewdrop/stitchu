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
//   A4  Karşılaştırmanın GRANÜLARİTESİ bayt olmalı. Dokunulmayan bir panelde tek
//       koordinat 0.001mm oynatılınca localityReport İHLAL basmak ZORUNDA.
//       (V6-B ölçtü: karşılaştırma bayttan panel varlığına indirilince kapı
//       yeşil kalıyordu — A1'in eşiği `antiCaught > 0` olduğu için 10/12'den
//       9/12'ye düşmek yetmiyordu. A4 + A1 tabanı o açığı kapatır.)
import {
  runEdit, applyDiff, draft, localityReport, touchedZones, untouchablePatterns, BODY,
  LOCALITY_GRANULARITY, LOCALITY, ROOT,
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

// ── A1 TABANI (ratchet) ─────────────────────────────────────────────────────
// Eşik ESKİDEN `antiCaught > 0` idi: 12 vakanın 11'i sessizce düşse bile kapı
// yeşil kalıyordu. Şimdi taban ÖLÇÜLEN sayıya çakılı ve yalnız YÜKSELEBİLİR.
// 2026-08-25 ölçümü (bu dosyanın kendi çıktısı): rewrite kipinde 12 vakanın
// 10'u lokallik ihlali olarak yakalanıyor. Yakalanmayan İKİSİ adıyla:
//   - "yaka oyuğunu değiştir (V)": rewrite bölge dışı paneli gerçekten bozmuyor.
//   - "manşet ekle": rewrite kipinde sleeveStyle düşüyor, motor spec'i
//     "cuffStyle requires a sleeve" diye reddediyor -> vaka ÜRETİMDE atlanıyor.
// Taban DÜŞÜRÜLEMEZ; ölçüm tabanı aşarsa taban güncellenmeden test geçmez.
// F5-parca (2026-09-02): gerekce/sinif beyan alanlari karsilastirma disina
// alininca (spec-diff.mjs pieceBytes, ilanli) V-yaka vakasinin gecici 11.
// yakalanisi geri dustu — taban olculen 10'da kaldi, dusurulmedi.
const A1_FLOOR = 10;
// A1 döngüsünde sessizce atlanan vaka sayısının TAVANI. Atlanan vaka yargı
// üretmez; sayısı artarsa kapının yüzeyi sessizce daralıyor demektir.
const A1_SKIP_CAP = 1;

// ── F7-edit: MM-EDİT VAKALARI (--all-zones) ─────────────────────────────────
// patternedit.cpp'nin beş opt-in operatörü, ekranın (create.js) gönderdiği
// AYNI alan adlarıyla. Bunlar A1 döngüsüne GİRMEZ: rewrite kipi mm alanı +
// garment dışındaki her şeyi düşürür ve üretim zaten reddeder — o boşluk A1'in
// ölçtüğü şey değildir. Lokallik yargısı ise birebir aynı kapıdan geçer.
const MM_CASES = [
  ['yakayı 2cm derinleştir', { field: 'editNeckDeepenMM', value: 20 }],
  ['boyu 3cm uzat', { field: 'editExtendMM', value: 30 }],
  ['boyu 2cm kısalt', { field: 'editShortenMM', value: 20 }],
  ['kolu 2cm uzat', { field: 'editSleeveExtendMM', value: 20 }],
  ['fiyonk ekle (etek ucu)', { field: 'editAttach', value: 1 }],
];
const ALL_ZONES = process.argv.includes('--all-zones');

let fail = 0;
const line = (ok, s) => { if (!ok) fail++; console.log(`${ok ? 'OK  ' : 'FAIL'} ${s}`); };

const coveredZones = new Set();
for (const [ad, op] of [...CASES, ...(ALL_ZONES ? MM_CASES : [])]) {
  const diff = { why: ad, ops: [{ op: 'set', ...op }] };
  const r = await runEdit(BASE, diff);
  if (r.stage !== 'tamam') { line(false, `${ad}: ${r.stage} aşamasında reddedildi -> ${r.rejected.join(' / ')}`); continue; }
  if (r.rejected.length) { line(false, `${ad}: ${r.rejected.join(' / ')}`); continue; }   // A3
  if (r.locality.checked === 0) {                                                          // A2
    line(false, `${ad}: bölge dışı yargılanan panel YOK (bölge ${r.zones.join('+')}, kalıp: ${r.after.pattern.pieces.map((p) => p.name).join(', ')})`);
    continue;
  }
  const ok = r.locality.violations.length === 0;
  if (ok) for (const z of r.zones) coveredZones.add(z);
  line(ok,
    `${ad} [${r.zones.join('+')}] bölge dışı ${r.locality.checked} panel bayt-aynı: ${r.locality.held.join(', ')}` +
    (r.locality.violations.length ? ` | İHLAL: ${r.locality.violations.join('; ')}` : ''));
}

// ── --all-zones: KAPSAM + EKRAN TELİ ────────────────────────────────────────
// (1) Sözleşmedeki global-olmayan HER bölge en az bir GEÇEN vakayla ölçülmüş
//     olmalı — ölçülmemiş bölge, lokallik iddiası olmayan bölgedir.
// (2) En az 4 edit tipi create ekranından erişilebilir olmalı: create.js'in
//     DOM'a bastığı alanlar (statik tel kontrolü — alan adı + i18n etiketi) ve
//     create.html'in create.js'i yüklediği, dosyanın kendisinden okunur.
if (ALL_ZONES) {
  console.log('--- --all-zones: bölge kapsamı + create ekranı teli');
  const nonGlobal = Object.keys(LOCALITY.zones).filter((z) => z !== 'global');
  for (const z of nonGlobal) {
    line(coveredZones.has(z), `bölge ${z}: ${coveredZones.has(z) ? 'geçen vakayla ölçüldü' : 'HİÇBİR GEÇEN VAKA DOKUNMADI'}`);
  }
  const { readFileSync: rf } = await import('node:fs');
  const { join: j } = await import('node:path');
  const createJs = rf(j(ROOT, 'web', 'js', 'create.js'), 'utf8');
  const createHtml = rf(j(ROOT, 'web', 'create.html'), 'utf8');
  line(createHtml.includes('js/create.js'), 'create.html js/create.js modülünü yüklüyor');
  const editFields = ['editExtendMM', 'editShortenMM', 'editSleeveExtendMM', 'editNeckDeepenMM'];
  // create.js ekran girdilerini `wanted = { editX: Number(input.value)*10 }`
  // haritasına, oradan `spec[f] = wanted[f]` ile spec'e yazar; alan adı o
  // haritada geçmek VE yazma teli var olmak zorunda.
  const writes = createJs.includes('spec[f] = wanted[f]');
  let wired = 0;
  for (const f of editFields) {
    const has = createJs.includes(`${f}:`) && writes;
    if (has) wired++;
    line(has, `create.js '${f}' alanını ekran girdisinden spec'e yazıyor`);
  }
  line(wired >= 4, `create ekranından erişilebilir edit tipi ${wired} >= 4`);
}

// ── A1: aynı diff'i tüm spec'i yeniden yazacak şekilde uygula -> KIRMIZI ────
console.log('--- ANTI-HACK A1: diff yerine tüm spec yeniden yazılırsa');
let antiCaught = 0;
const antiSkipped = [];
for (const [ad, op] of CASES) {
  const ops = [{ op: 'set', ...op }];
  const zones = touchedZones(ops);
  if (!untouchablePatterns(zones).length) { antiSkipped.push(`${ad} (untouchable listesi boş)`); continue; }
  const before = await draft(BASE, BODY);
  const after = await draft(applyDiff(BASE, ops, 'rewrite'), BODY);
  if (before.error || after.error) {
    antiSkipped.push(`${ad} (üretim: ${before.error || after.error})`);
    continue;
  }
  const rep = localityReport(before.pattern, after.pattern, zones);
  if (rep.violations.length) antiCaught++;
  else console.log(`     (yakalanmadı: ${ad})`);
}
for (const s of antiSkipped) console.log(`     (atlandı: ${s})`);
line(antiSkipped.length <= A1_SKIP_CAP,
  `A1 sessiz atlama ${antiSkipped.length} <= tavan ${A1_SKIP_CAP}` +
  (antiSkipped.length > A1_SKIP_CAP ? ' — atlanan vaka yargı üretmiyor, kapı daralıyor' : ''));
line(antiCaught >= A1_FLOOR,
  `tüm-spec-yeniden-yazma ${antiCaught}/${CASES.length} vakada LOKALLİK İHLALİ olarak yakalandı (taban ${A1_FLOOR})` +
  (antiCaught >= A1_FLOOR ? '' : ` — TABANIN ALTINA DÜŞTÜ, kapının dişi köreldi`));
if (antiCaught > A1_FLOOR) {
  line(false, `A1 TABANI BAYAT: ölçülen ${antiCaught} > taban ${A1_FLOOR} — ratchet gereği ` +
    `edit_locality_check.mjs içindeki A1_FLOOR ${antiCaught} yapılmalı (taban yalnız yükselir)`);
}

// ── A4: KARŞILAŞTIRMA BAYT İNCELİĞİNDE Mİ? ─────────────────────────────────
// İlan spec-diff.mjs'te (LOCALITY_GRANULARITY). Burada İLAN denetlenir:
// dokunulmayan bir panelin TEK koordinatı 0.001mm oynatılır; karşılaştırma
// gerçekten bayt ise localityReport bunu İHLAL diye basmak zorundadır.
console.log('--- ANTI-HACK A4: bölge dışı panelde 0.001mm oynama görülüyor mu');
line(LOCALITY_GRANULARITY === 'bayt',
  `ilan edilen granülarite '${LOCALITY_GRANULARITY}' (beklenen 'bayt')`);
{
  const zones = ['neckZone'];
  const pats = untouchablePatterns(zones).map((p) => new RegExp(p));
  const before = await draft(BASE, BODY);
  if (before.error) {
    line(false, `A4 kurulamadı: taban kalıp üretilemedi -> ${before.error}`);
  } else {
    const after = JSON.parse(JSON.stringify(before.pattern));
    const target = after.pieces.find((p) => pats.some((r) => r.test(p.name))
      && p.commands.some((c) => typeof c.x === 'number' && c.x !== 0));
    if (!target) {
      line(false, 'A4 kurulamadı: bölge dışı panelde oynatılacak koordinat yok');
    } else {
      const cmd = target.commands.find((c) => typeof c.x === 'number' && c.x !== 0);
      const eski = cmd.x;
      cmd.x = eski + 0.001;                              // 0.001mm = bir mikron
      const rep = localityReport(before.pattern, after, zones);
      const gordu = rep.violations.some((v) => v.startsWith(`${target.name}:`));
      line(gordu,
        `${target.name}: tek koordinat ${eski} -> ${cmd.x} (0.001mm) ` +
        (gordu ? 'İHLAL olarak görüldü' : 'GÖRÜLMEDİ — karşılaştırma bayt değil, granülarite ilanı YALAN'));
      // Aynı kontrolün tersi: hiç oynatılmazsa ihlal ÇIKMAMALI (mandal
      // "her şeye kırmızı basan" ucuz bir mandal olmasın).
      const temiz = localityReport(before.pattern, JSON.parse(JSON.stringify(before.pattern)), zones);
      line(temiz.violations.length === 0 && temiz.checked > 0,
        `kontrol: oynatmasız kopya ${temiz.checked} panelde ${temiz.violations.length} ihlal (beklenen 0, checked>0)`);
    }
  }
}

console.log(fail ? `edit_locality_check: ${fail} KIRMIZI` : 'edit_locality_check: hepsi yeşil');
process.exit(fail ? 1 : 0);
