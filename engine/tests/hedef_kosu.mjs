#!/usr/bin/env node
// hedef_kosu.mjs — KOŞU v7 §3.6 HEDEF KOŞUSU. Compounding-error kilidi.
//
// HEDEF (sabit, hiçbir faz değiştiremez): fotoğraf + prompt -> kalıp + flat.
// Bu dosya o hedefi bir TESTE çevirir ve her fazın sonunda koşar. Bir faz kendi
// kapısını geçse bile buradaki sayılardan biri kötüleştiyse faz KAPANMAZ.
//
// SIFIR API ÇAĞRISI, SIFIR KURUŞ (§3.9): VLM cevapları bir kez alınmış ve
// vision/eval/live-2026-08-22.json'a bankalanmıştır. Bu dosya o kayda karşı
// koşar. Fixture yenilemek bir FAZ KARARIDIR, kartta maliyetiyle yazılır.
//
// Zincir taklit edilmez — ürünün kendi fonksiyonları koşar:
//   bankalı `seen`  --(web/js/vision-bridge.js pick*)-->  spec
//                   --(engine/dist WASM draftJSON)-->     kalıp
//                   --(engine/tools/render-garment-flat)-> flat
//
//   node engine/tests/hedef_kosu.mjs            ratchet: tabana karşı yargıla
//   node engine/tests/hedef_kosu.mjs --taban    tabanı YENİDEN yaz (hakem işi)
//
// TABAN: contract/hedef-kosu-taban.json. §3.8 md.1 gereği faz ajanı bu dosyaya
// DOKUNAMAZ; değiştirmek hakemin işidir ve önceki/sonraki sayı yan yana yazılır.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');

const { draft } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));
const { renderGarmentFlat } = await import(join(ROOT, 'engine/tools/render-garment-flat.mjs'));
const { canonical } = await import(join(ROOT, 'web/js/vocab.gen.js'));
const VB = await import(join(ROOT, 'web/js/vision-bridge.js'));

const TABAN_FILE = join(ROOT, 'contract', 'hedef-kosu-taban.json');
const WRITE_TABAN = process.argv.includes('--taban');
// --eksenler: H10'un SAYDIĞI eksenlerin adlarını ve gözün 12 ekseninde karşılığı
// olup olmadığını dosyaya döker. Hakemin görünürlük şablonu bu dökümden üretilir
// (vision/eval/gen-kaynak.py), çünkü ayrışma ancak H10'un saydığı eksenlerde bir
// insan beyanı varsa yapılabilir — liste elle yazılırsa iki yerde iki doğru olur.
const DUMP_AXES = process.argv.includes('--eksenler');
const AXES_FILE = join(ROOT, 'vision', 'eval', 'h10-eksenleri.json');

// ── MÜHÜRLÜ GİRDİ (§3.8 md.2) ───────────────────────────────────────────────
// Faz ajanı bu iki yolu değiştiremez, foto ekleyemez, çıkaramaz.
const FIXTURE = join(ROOT, 'vision', 'eval', 'live-2026-08-22.json');
// ⭐ CEVAP ANAHTARI ARTIK İNSAN (§1F md.3, F2 2. tur İŞ 2).
// Eskiden buradan `vision/eval/labels.json` okunurdu ve o dosya kendi başlığında
// "Ground truth labeled by eye (Fable, 2026-07-13)" diyor — yani bir MODELİN
// başka bir modele ne kadar uyduğu ölçülüyordu. Hakem 19 fotoğrafın 19'unu açtı,
// gözle baktı ve `labels-hakem.json`'u yazdı (künye + sha256, üç durumlu).
// `labels.json` MÜHÜRLÜ ve diskte duruyor; artık okunmuyor, tek bayt değişmedi.
const EYE_F = join(ROOT, 'vision', 'eval', 'labels-hakem.json');

// ⭐ ÖLÇÜM SETİ n=5 -> n=10 (F2 2. tur İŞ 3). Seti HAKEM seçti (§3.8 md.2,
// contract/hedef-kosu-taban.json `_olcum_seti.hedef_10`); ajan seçemez, ekleme
// yapamaz, çıkaramaz. Beşi zaten bankalıydı, beşi BİR KEZ ödendi ve
// vision/eval/fetch-hedef10.sh ile bankalandı — koşu hâlâ 0 API çağrısı (§3.9).
// Hakemin YEDEK 5'i (10 · 14 · 15 · 34 · 36) burada YOKTUR (K16).
const FIXTURE10 = join(ROOT, 'vision', 'eval', 'live-hedef10-2026-08-26.json');

const bank5 = JSON.parse(readFileSync(FIXTURE, 'utf8'));
const bank = { ...bank5, ...JSON.parse(readFileSync(FIXTURE10, 'utf8')) };
// CIRCIR SETİ = tabanın ölçüldüğü BEŞ fotoğraf, başkası değil. Yeni beş
// fotoğrafın sayısı n=5'in tabanına KARIŞTIRILMAZ: H3 · H8 gibi MUTLAK sayaçlar
// foto sayısıyla büyür, iki farklı n'i tek cırcırda kıyaslamak sahte bir
// "kötüleşme" (ya da sahte bir kazanım) üretir. Tabanı n=10'a hakem taşır.
const TABAN_SET = new Set(Object.keys(bank5).filter((k) => !k.startsWith('_')));
const EYE = JSON.parse(readFileSync(EYE_F, 'utf8'));
const files = Object.keys(bank).filter((k) => !k.startsWith('_')).sort();
for (const f of files) {
  if (!EYE[f]) { console.error(`GÖZ ETİKETİ YOK: ${f} — cevap anahtarı eksik, ölçüm yapılamaz`); process.exit(3); }
}

// Gözün üç durumu (labels-hakem.json `_uc_durum`):
//   deger[a] = enum       -> GÖRDÜM ve yargıladım        (H2'nin paydası)
//   deger[a] = null       -> bu fotoğraf bu ekseni GÖSTEREMEZ
//   a ∈ goremedim[]       -> eksen çerçevede ama YARGILAYAMADIM (§0B md.3)
// "göremedim" bir tahmin DEĞİL, bir ret. Paydaya girmez, `null` ile de
// karıştırılmaz. Anahtar listesi olarak taşınır, dize DEĞERİ olarak değil (K17).
const eyeDeger = (f) => EYE[f].deger || {};
const eyeGoremedim = (f) => new Set(EYE[f].goremedim || []);
const eyeGorunurluk = (f) => EYE[f].gorunurluk || {};

// göz etiketinin 12 alanı -> spec alanı (foto-spec-olcum.mjs ile aynı harita)
const FIELD_MAP = {
  garment: 'garment', neckline: 'neckline', sleeveStyle: 'sleeveStyle',
  sleeveLength: 'sleeveLength', skirtStyle: 'skirtStyle', length: 'skirtLength',
  topLength: 'topLength', shaping: 'shaping', waistline: 'waistline',
  fabric: 'fabric', hemRuffle: 'ruffle', keyhole: 'keyhole',
};

// create.js'in vision dalındaki host kapıları. Fotoğrafta GÖRÜNMEYEN her alan
// buradan doldurulur — yani "çıkarıldı" (§0B). H10 bu sözlüğü sayar.
const SPEC_DEFAULTS = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  shoulderStyle: 'set', sleeveCap: 'plain', edgeFinish: 'biasBinding',
  hemShape: 'straight', collarEdge: 'round', gatherZone: 'neckline',
};

const pct = (a, b) => (b ? +(100 * a / b).toFixed(1) : 0);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Bir kenarın (first..last komut aralığı) yay uzunluğu. Kübik kenarlar
// 64 parçaya bölünerek ölçülür; kalıbın kendi komut dilinden okunur.
function edgeLength(commands, first, last) {
  let total = 0;
  for (let i = first; i <= last && i < commands.length; i++) {
    const c = commands[i];
    const prev = commands[i - 1];
    if (!prev) continue;
    const p0 = { x: prev.x, y: prev.y };
    if (c.type === 'line' || c.type === 'move') { total += dist(p0, c); continue; }
    if (c.type === 'curve') {
      let a = p0;
      for (let s = 1; s <= 64; s++) {
        const t = s / 64, u = 1 - t;
        const b = {
          x: u * u * u * p0.x + 3 * u * u * t * c.cp1x + 3 * u * t * t * c.cp2x + t * t * t * c.x,
          y: u * u * u * p0.y + 3 * u * u * t * c.cp1y + 3 * u * t * t * c.cp2y + t * t * t * c.y,
        };
        total += dist(a, b); a = b;
      }
    }
  }
  return total;
}

// ── koşu ────────────────────────────────────────────────────────────────────
const rows = [];
for (const file of files) {
  const seen = bank[file];
  const label = eyeDeger(file);
  const goremedim = eyeGoremedim(file);
  const gorunur = eyeGorunurluk(file);
  const t0 = process.hrtime.bigint();
  const r = {
    file, judged: 0, agree: 0, hallucinated: [], outOfDict: [], inferred: 0, fieldsTotal: 0,
    inferredA: 0, inferredB: 0, inferredUnknown: 0, etiketHatasi: [], uyusmazlik: [],
    pieces: 0, ok: false, flatBytes: 0, seamPairs: [], oov: (seen.outOfVocab || []).length,
  };

  // H2: fotoğrafta GÖRÜLEN alanların kaçı doğru okundu (İNSAN göz etiketine karşı).
  for (const [lf] of Object.entries(FIELD_MAP)) {
    if (goremedim.has(lf)) continue;                     // göz YARGILAMAYI REDDETTİ
    const want = label[lf];
    if (want === null || want === undefined) continue;   // göz "gösteremez" dedi
    r.judged++;
    const got = seen[lf];
    const same = String(got) === String(want) ||
      (lf === 'hemRuffle' && String(got ?? 'none') === String(want));
    if (same) r.agree++;
    else r.uyusmazlik.push(`${lf}: hat '${got}' · göz '${want}'`);
  }

  // H3: UYDURMA ALAN — göz "gösteremez" (null) demiş ama vision bir değer basmış
  // ve bu bir çıkarım olarak İLAN EDİLMEMİŞ. §3.6: cezalandırılan uydurmak değil,
  // SESSİZCE uydurmaktır. Bugün ilan kanalı (F0 md.6) kodda yok, o yüzden bu
  // sınıfın tamamı H3'e yazılır; ilan kanalı gelince buradan düşecek.
  // "göremedim" H3'e GİRMEZ: göz o alanın çerçevede olduğunu söylüyor, yalnız
  // kendisi okuyamadı — hat orada bir değer basınca uydurmuş olmaz.
  for (const [lf] of Object.entries(FIELD_MAP)) {
    if (goremedim.has(lf)) continue;
    if (!(lf in label)) continue;                     // göz o alanı hiç yargılamadı
    if (label[lf] !== null) continue;                 // göz gördü -> H2'nin işi
    const got = seen[lf];
    if (got === null || got === undefined) continue;  // vision da "görmedim" dedi
    if (lf === 'keyhole' && got === false) continue;  // false = yokluk beyanı
    r.hallucinated.push(`${lf}: göz görmedi, vision '${got}' bastı, ilan yok`);
  }

  // spec'i kur
  const spec = { ...SPEC_DEFAULTS };
  const declared = new Set();
  for (const [lf, sf] of Object.entries(FIELD_MAP)) {
    const v = seen[lf];
    if (v === null || v === undefined) continue;
    if (sf === 'keyhole') { spec.keyhole = v ? 'keyhole' : 'none'; declared.add(sf); continue; }
    const c = canonical(sf, v);
    if (c !== undefined) { spec[sf] = c; declared.add(sf); }
    else r.outOfDict.push(`${lf}='${v}' sözlükte yok`);   // KELİME sınıfı, H3 değil
  }
  if (spec.garment === 'skirt') { spec.sleeveStyle = 'none'; spec.neckline = 'crew'; }

  // yapısal alanlar ürünün kendi köprüsünden (vision-bridge pick*)
  // Köprü bir alana 'none'dan başka bir değer bastıysa o değer FOTOĞRAFTAN
  // gelmiştir -> declared. 'none' dönmesi "görmedim" demektir -> çıkarım.
  const put = (k, v) => {
    if (v === null || v === undefined || v === 'none') return;
    spec[k] = v; declared.add(k);
  };
  const g = VB.pickGather(seen);
  if (g) { put('gatherType', g.gatherType); put('gatherZone', g.gatherZone); }
  const col = VB.pickCollar(seen);
  if (col) { put('collarType', col.collarType); put('collarEdge', col.collarEdge); }
  put('backOpening', VB.pickBackOpening(seen));
  put('peplum', VB.pickPeplum(seen));
  put('hemFlounce', VB.pickHemFlounce(seen));
  put('pocketStyle', VB.pickPocket(seen));
  put('cuffStyle', VB.pickCuff(seen));
  put('hemShape', VB.pickHemShape(seen));
  for (const k of ['gatherType', 'collarType', 'backOpening', 'peplum', 'hemFlounce', 'pocketStyle', 'cuffStyle']) {
    if (!(k in spec)) spec[k] = 'none';   // motorun beklediği yüzey tam olsun
  }

  // H10: ÇIKARILDI ORANI — motora giden spec'in TAM yüzeyi üzerinden sayılır,
  // yalnız gözün 12 alanı üzerinden değil. Bir alan ya fotoğraftan geldi
  // (declared) ya da host/köprü onu doldurdu (= çıkarıldı). §0B: çıkarım suç
  // değil, SESSİZ çıkarım suç; ama oranın tavanı var ve H2 ile birlikte okunur.
  // H10a / H10b AYRIŞTIRMASI (F2, Damla'nın 26 Ağu düzeltmesi). Tek kova iki
  // ayrı şey taşıyordu ve biri kusur DEĞİL.
  //
  // ⭐ AYRIM ARTIK İNSANIN GÖRÜNÜRLÜK BEYANINDAN GELİR (F2 2. tur İŞ 2).
  // Kaynak `labels-hakem.json`'un `gorunurluk` bloğu ve o blok H10'un KENDİ 24
  // ekseniyle anahtarlı — `SPEC_TO_EYE` köprüsüne gerek YOK, 12 alanlık dar göz
  // penceresi kalktı. Hakemin üç durumu:
  //     true -> eksen bu fotoğrafta GÖRÜNÜYOR                     -> H10b
  //     false -> GÖRÜNMESİ MÜMKÜN DEĞİL (arka/iç/örtülü/kadraj dışı,
  //              ya da eksen bu giysiye uygulanamaz: eteğin yakası yok) -> H10a
  //     ""   -> göremedim; İKİ SAYIYA DA yazılmaz                 -> H10x
  // Beyanı hiç olmayan eksen de H10x'te kalır. Bilmediğini bir kovaya doldurmak
  // sayıyı iki kat yanlış yapar.
  r.specAxes = Object.keys(spec);
  for (const k of Object.keys(spec)) {
    r.fieldsTotal++;
    const beyan = gorunur[k];
    if (declared.has(k)) {
      // ETİKETİN DOĞRULUĞU (H10e). Ölçülen: hat bir alanı "fotoğraftan geldi"
      // diye işaretlerken İNSANIN beyanı o ekseni GÖRÜNEMEZ ilan etmiş olması —
      // yani görülemeyecek bir şeyi görmüş olma iddiası. Böyle bir alan
      // H10b'den de H10a'dan da düşerdi; ayrıştırılmış iki sayı bu sayı sıfır
      // olmadan güvenilir değildir.
      if (beyan === false) {
        r.etiketHatasi.push(`${k}: göz GÖRÜNEMEZ dedi, hat 'fotoğraftan geldi' işaretledi`);
      }
      continue;
    }
    r.inferred++;
    if (beyan === true) r.inferredB++;                  // görünüyor ama alınamadı
    else if (beyan === false) r.inferredA++;            // görünmesi mümkün değil
    else r.inferredUnknown++;                           // "" ya da beyan yok
  }

  // H1: kalıp + flat sonuna kadar üretildi mi
  const d = await draft(spec);
  if (!d.error && d.pattern) {
    r.pieces = d.pattern.pieces.length;
    let svg = '';
    try { svg = renderGarmentFlat(d.pattern.pieces, spec); } catch (e) { r.flatErr = String(e.message || e); }
    r.flatBytes = svg.length;
    r.ok = r.pieces > 0 && r.flatBytes > 0;

    // H5: dikilebilirlik — kalıbın İLAN ETTİĞİ kenar rolleri üzerinden.
    // Bugün kalıpta yalnız armhole/sleeve_cap rolleri var; ölçüm o çiftle sınırlı
    // ve bu sınır sayının yanında ilan edilir.
    const byRole = {};
    for (const pc of d.pattern.pieces) {
      for (const er of (pc.edgeRoles || [])) {
        const L = edgeLength(pc.commands, er.first, er.last);
        (byRole[er.role] ||= []).push({ piece: pc.name, L });
      }
    }
    const armhole = (byRole.armhole_front || []).concat(byRole.armhole_back || []);
    const cap = byRole.sleeve_cap || [];
    if (armhole.length && cap.length) {
      const A = armhole.reduce((s, e) => s + e.L, 0);
      const C = cap.reduce((s, e) => s + e.L, 0);
      r.seamPairs.push({ pair: 'armhole↔sleeve_cap', a: +A.toFixed(2), b: +C.toFixed(2), diff: +(C - A).toFixed(2) });
      // ⚠ VE BU ÇİFT ÖN/ARKAYI TEK SAYIYA TOPLUYOR — SÖYLENİYOR, ONARILMIYOR
      // (GECE7 / F4 hakemi, borç 73). Ön +20 mm / arka −20 mm olan bir giysi
      // yukarıdaki farkta KUSURSUZ okunur. Ayırmanın YOLU YOK ve bu bir tercih
      // değil bir ÖLÇÜM: `sleeve_cap` motorda TEK ve BÖLÜNMEMİŞ bir yaydır
      // (sleeve.cpp:194, locket.cpp:379 — tek EdgeRole, omuz çentiğinde ön/arka
      // yarısı ilan EDİLMİYOR), yani kapağın hangi yarısının ön oyuğa gittiğini
      // söyleyen bir beyan yok. Uydurmak §3.10 ihlalidir. Kapatmanın tek yolu
      // MOTORUN kapağı çentikte ikiye ilan etmesidir; o bir faz işidir, bir kapı
      // düzeltmesi değil. Kör nokta burada SAYIYLA basılıyor ki gizli kalmasın.
      const AF = (byRole.armhole_front || []).reduce((s, e) => s + e.L, 0);
      const AB = (byRole.armhole_back || []).reduce((s, e) => s + e.L, 0);
      r.korNokta = { pair: 'armhole↔sleeve_cap', on: +AF.toFixed(2), arka: +AB.toFixed(2),
                     neden: 'sleeve_cap TEK ve BÖLÜNMEMİŞ yay — ön/arka ayrı yargılanamıyor' };
    }
    // ── PAYDA NEDEN 5? K53'ÜN CEVABI DÜZELTİLDİ, VE YERİNE ÖLÇÜLEN BİR CEVAP
    // KONDU (GECE7 / F4 hakemi, borç 51/73).
    //
    // K53 "payda bir TAVANDIR, motorda yapılacak hiçbir iş onu büyütemez" dedi;
    // teşhisi (`push` bir döngüde değil) doğruydu ama sonucu FAZLA GENİŞTİ.
    // Motor İKİNCİ bir çifti adıyla ZATEN ilan ediyor — sleeve.cpp:200-213 kendi
    // yorumunda yazıyor: "The underarm seam is the piece's TWO side edges sewn
    // to each other, so both carry the name." Hakem ölçtü: n=5'in BEŞ satırında
    // da `sleeve_underarm` İKİ kenar. Yani payda 5 -> 10 yapılabilirdi.
    //
    // 🚨 YAPILMADI, VE SEBEBİ BİR ÖLÇÜM: O ÇİFT İNŞADAN SIFIR.
    // sleeve.cpp:196-213 sol kenarı sağ kenarın AYNASI olarak kuruyor, yani iki
    // uzunluk bit-aynı. Hakemin kendi koşumu, beş satır:
    //     419.60/419.60  96.02/96.02  419.60/419.60  419.60/419.60  205.77/205.77
    //     -> diff 0.00, BEŞİNDE DE, ve başka türlü ÇIKAMAZ.
    // Payda 5 -> 10 olurdu, pay 0'da KALIRDI ve KALMAK ZORUNDA OLURDU: hiçbir
    // kusur o çifti kırmızı yakamaz. Bu bir SERTLEŞME değil, cırcırın kendi
    // sayısını süslemesidir (§3.8 md.3: kırmızı olamayan kapı kapı değildir;
    // §0B: yükselen bir sayı bilgi taşımıyorsa kazanım değildir).
    // Hakem bu yüzden paydayı KENDİ ELİYLE BÜYÜTMEDİ.
    //
    // PAYDAYI BÜYÜTEN GERÇEK İŞ, ve artık adı var: motor `sleeve_cap`ı omuz
    // ÇENTİĞİNDE ön/arka diye ikiye İLAN EDECEK. O zaman armhole_front ↔ ön
    // kapak ve armhole_back ↔ arka kapak İKİ ayrı çift olur, ikisi de gerçekten
    // kırmızı yanabilir, ve yukarıdaki kör nokta da kapanır. Bu bir FAZ işidir,
    // bir kapı düzeltmesi değil.
    const under = byRole.sleeve_underarm || [];
    if (under.length === 2)
      r.aynaCift = { pair: 'sleeve_underarm↔sleeve_underarm',
                     a: +under[0].L.toFixed(2), b: +under[1].L.toFixed(2),
                     neden: 'İNŞADAN AYNA — sayılmıyor, payda süslenmesin' };
  } else {
    r.draftErr = d.error || 'kalıp yok';
  }
  r.ms = Number(process.hrtime.bigint() - t0) / 1e6;
  rows.push(r);
}

if (DUMP_AXES) {
  const SPEC_TO_EYE = Object.fromEntries(
    Object.entries(FIELD_MAP).map(([lf, sf]) => [sf, lf]));
  const seen = new Map();
  for (const r of rows) for (const k of r.specAxes) seen.set(k, SPEC_TO_EYE[k] ?? null);
  const eksenler = [...seen.keys()].sort();
  // ⚠ K17 — BİR EKSEN ADI, TAKİPLİ BİR JSON'DA **DEĞER** OLARAK YAZILMAZ.
  // Eski şekil `{"sleeveStyle": "sleeveStyle"}` idi ve flat_expresses_spec_check
  // (git ls-files '*.json' üstünde `"<alan>"\s*:\s*"([^"]*)"` sayan kapı) onu
  // dokuzuncu bir KOL DEĞERİ sandı: kol alanı 8 -> 9, UNEXPRESSED 1/0, TAVAN
  // AŞILDI. Kapı daraltılmadı (K2/K11/K17); çarpışma kaynağında kaldırıldı.
  // Taşınan bilgi aynı: hangi H10 ekseninin gözde bir karşılığı VAR (true) ve
  // hangisinin YOK (null). Karşılığın ADI zaten tek kaynakta, bu dosyanın
  // üreticisindeki FIELD_MAP'te durur; iki yerde iki doğru tutulmaz.
  const varYok = Object.fromEntries([...seen].map(([k, v]) => [k, v === null ? null : true]));
  writeFileSync(AXES_FILE, JSON.stringify({
    _not: 'ÜRETİLMİŞTİR: node engine/tests/hedef_kosu.mjs --eksenler. Elle düzenlenmez. ' +
      'H10 bu eksenleri sayar; `goz_ekseni` null ise o eksen hakkında bugün hiçbir ' +
      'görünürlük beyanı YOKTUR ve alan H10a/H10b yerine H10x kovasına düşer.',
    _deger_yasasi: 'Bu dosyada bir EKSEN ADI hiçbir zaman bir JSON DEĞERİ olarak ' +
      'yazılmaz (K17). Değerler yalnız true/null. Eksen adları anahtarda ve ' +
      '`eksenler` dizisinde durur; dizi elemanı `"ad": "ad"` kalıbına uymadığı ' +
      'için spec tarama kapılarına sahte bir enum değeri gibi görünmez.',
    _kaynak_dosya: 'engine/tests/hedef_kosu.mjs',
    eksenler, goz_ekseni: varYok,
  }, null, 1) + '\n');
  console.log(`H10 EKSENLERİ YAZILDI -> ${AXES_FILE}  (${eksenler.length} eksen, ` +
    `${[...seen.values()].filter(Boolean).length}'inin göz karşılığı var)`);
  process.exit(0);
}

// ── altı sayı (§3.6) ────────────────────────────────────────────────────────
// AYNI HESAP İKİ SETE KOŞAR: cırcır seti (n=5, tabanın ölçüldüğü fotoğraflar) ve
// hedef seti (n=10, hakemin seçtiği). Sayılar TEK bir tabloda harmanlanmaz.
function ozet(rows) {
const n = rows.length;
const done = rows.filter((r) => r.ok).length;
const J = rows.reduce((s, r) => s + r.judged, 0);
const A = rows.reduce((s, r) => s + r.agree, 0);
const H3 = rows.reduce((s, r) => s + r.hallucinated.length, 0);
const OOD = rows.reduce((s, r) => s + r.outOfDict.length, 0);
const FT = rows.reduce((s, r) => s + r.fieldsTotal, 0);
const INF = rows.reduce((s, r) => s + r.inferred, 0);
const INF_A = rows.reduce((s, r) => s + r.inferredA, 0);
const INF_B = rows.reduce((s, r) => s + r.inferredB, 0);
const INF_X = rows.reduce((s, r) => s + r.inferredUnknown, 0);
const ETI = rows.reduce((s, r) => s + r.etiketHatasi.length, 0);
// Ayrışma bir GEVŞETME değil, bir ölçüm bölmesidir: üç kova H10'un kendisini
// tüketmezse bölme yanlıştır ve sayılar basılmadan önce bağırır (F2 kartı,
// DEĞİŞMEZLER: "H10a + H10b = 70/120 çıkmıyorsa ayrışma yanlıştır").
if (INF_A + INF_B + INF_X !== INF) {
  console.error(`AYRIŞMA BOZUK (n=${n}): H10a ${INF_A} + H10b ${INF_B} + H10x ${INF_X} != H10 ${INF}`);
  process.exit(2);
}
// H5: uzunluğu eşleşmeyen dikiş çifti. Eşik %4 cap ease (§1C, sleeve.hpp:12).
const pairs = rows.flatMap((r) => r.seamPairs);
const badPairs = pairs.filter((p) => p.a > 0 && Math.abs(p.diff / p.a) > 0.08).length;
const times = rows.map((r) => r.ms).sort((a, b) => a - b);
const median = times.length ? times[Math.floor(times.length / 2)] : 0;

// ── H6: KONVANSİYON SAPMASI — ON İKİ FAZDIR "ÖLÇEMEDİM", ARTIK DEĞİL ────────
// (GECE7 / F4 hakemi, §3.8 md.1. F4 ajanı sayıyı ÖLÇTÜ ve bir KAPIYA bağladı
// (flat_convention_check §1d), ama bu dosya mühürlü olduğu için buraya
// basamadı ve kendi kartında öyle yazdı — doğru davrandı, yetkisi yoktu.)
//
// SAYI BURADA HESAPLANMIYOR, OKUNUYOR. İkinci bir hesap ikinci bir doğru
// demektir ve bu koşunun tekrar tekrar öldürdüğü hata sınıfı odur; kapı
// (flat_convention_check §1d) zaten (a) çapaların manken çizelgesinden
// aritmetikle türediğini ve (b) kaç flat'in o tek mankenden toleransın dışına
// düştüğünü ölçüyor. Cırcır o kapının BASTIĞI sayıyı alır.
//
// Kapı 0.45 sn sürüyor (hakemin kendi ctest koşusu), yani maliyet ölçüm
// gürültüsü içinde. Kapı KIRMIZI olsa bile sayı okunur: "kapı düştü" ile
// "sayı yok" iki ayrı şeydir (K33'ün dersi) ve cırcırın işi sayıyı taşımaktır.
// Okunamazsa ÖLÇEMEDİM'e döner ve sebebi yazılır — uydurulmaz (§3.10).
const H6 = (() => {
  const kapi = join(ROOT, 'engine/tests/flat_convention_check.mjs');
  if (!existsSync(kapi))
    return { deger: null, n, birim: 'ÖLÇEMEDİM — flat_convention_check bulunamadı', uyari: undefined };
  let cikti = '';
  try {
    cikti = execFileSync(process.execPath, [kapi], { encoding: 'utf8', maxBuffer: 64 << 20 });
  } catch (e) {
    // Kapı EXIT 1 verse bile stdout'u elimizde: sayı orada.
    cikti = String((e && e.stdout) || '');
  }
  const m = /H6 = (\d+)\s+\(manken capasi tek cizelgeden sapan flat sayisi \/ (\d+) flat, n=(\d+) stil/.exec(cikti);
  if (!m)
    return { deger: null, n, birim: 'ÖLÇEMEDİM — flat_convention_check H6 satırını basmadı', uyari: undefined };
  const [, sapan, flatN, stilN] = m;
  return {
    deger: Number(sapan), n: Number(stilN),
    birim: `${sapan} flat manken çapasından sapıyor / ${flatN} flat (n=${stilN} stil × ön+arka)`,
    uyari: 'PAYDA BU KOŞUNUN 5/10 FOTOĞRAFI DEĞİL, flat_convention_check\'in 8 STİLLİK '
         + 'matrisidir — H1..H11 ile AYNI n DEĞİL, harmanlanmaz (§3.6 "her sayının yanına n"). '
         + 'Sayı burada hesaplanmıyor, o kapıdan OKUNUYOR: ikinci bir hesap ikinci bir doğrudur.',
  };
})();

return {
  H1_tamamlanma:      { deger: done,               n, birim: `${done}/${n} girdi kalıp+flat üretti`, yon: 'yuksek' },
  H2_gorulen_isabet:  { deger: pct(A, J),          n, birim: `%${pct(A, J)} (${A}/${J} alan yargısı)`, yon: 'yuksek',
                        uyari: 'CEVAP ANAHTARI ARTIK İNSAN (labels-hakem.json, hakem 19/19 fotoğrafa baktı). '
                              + 'Payda MAKİNE anahtarına göre 51 -> 42 DÜŞTÜ: hakem, makinenin kendine sorduğu '
                              + '9 yargıyı fotoğraftan yapmayı REDDETTİ. Yüzde artışı bir CIRCIR KAZANIMI DEĞİL, '
                              + 'cevap anahtarının değişmesidir.' },
  H3_uydurma_alan:    { deger: H3,                 n, birim: `${H3} ilan edilmemiş uydurma alan`, yon: 'dusuk' },
  H4_gereksiz_dikis:  { deger: null,               n, birim: 'ÖLÇEMEDİM — F5 dört sebep katmanı kodda yok', yon: 'dusuk' },
  H5_dikilebilirlik:  { deger: badPairs,           n, birim: `${badPairs} eşleşmeyen çift / ${pairs.length} ölçülebilen çift`, yon: 'dusuk',
                        uyari: 'kalıpta yalnız armhole+sleeve_cap rolleri ilan edili; diğer dikişler ÖLÇÜLEMİYOR' },
  H6_konvansiyon:     { deger: H6.deger,           n: H6.n, birim: H6.birim, yon: 'dusuk', uyari: H6.uyari },
  H8_ifade_edilemeyen:{ deger: rows.reduce((s, r) => s + r.oov, 0) + OOD, n, yon: 'dusuk',
                        birim: `${rows.reduce((s, r) => s + r.oov, 0)} outOfVocab terim + ${OOD} sözlükte olmayan alan okuması` },
  H9_cikarim_makullugu:{ deger: null,              n, birim: 'ÖLÇEMEDİM — görünmeyen alanda makullük hakemi yok', yon: 'yuksek' },
  H10_cikarildi_orani:{ deger: pct(INF, FT),       n, birim: `%${pct(INF, FT)} (${INF}/${FT} alan default'tan geldi)`, yon: 'tavan' },
  // ── H10 AYRIŞTI (F2) ──────────────────────────────────────────────────────
  // H10a cırcıra BAĞLANMAZ: bir ön fotoğraftan arka kapamayı okumak mümkün
  // değil, orada çıkarım doğru davranıştır. H10b cırcıra bağlanır ve §0B tavanı
  // ona uygulanır. H10x bir kova değil bir İTİRAF: gözün hiç yargılamadığı,
  // yani hakkında beyan bulunmayan alan. Üçünün toplamı H10'un kendisidir.
  H10a_gorunemez:     { deger: pct(INF_A, FT),     n, yon: 'yok',
                        birim: `%${pct(INF_A, FT)} (${INF_A}/${FT}) — fotoğrafta GÖRÜNMESİ MÜMKÜN DEĞİL, cırcıra bağlı değil`,
                        uyari: 'beyan İNSAN beyanı (labels-hakem.json gorunurluk bloğu, 19/24 eksenin tamamı dolu)' },
  H10b_gorunen_alinamayan:{ deger: pct(INF_B, FT), n, yon: 'tavan',
                        birim: `%${pct(INF_B, FT)} (${INF_B}/${FT}) — GÖRÜNEN ama alınamayan, §0B tavanı BUNA uygulanır`,
                        uyari: 'beyan İNSAN beyanı (labels-hakem.json gorunurluk bloğu); §0B tavanı BU sayıya bağlı' },
  H10x_beyan_yok:     { deger: pct(INF_X, FT),     n, yon: 'dusuk',
                        birim: `%${pct(INF_X, FT)} (${INF_X}/${FT}) — insan 'göremedim' dedi ya da beyanı YOK` },
  H10e_etiket_hatasi: { deger: ETI,                n, yon: 'dusuk',
                        birim: `${ETI} alan: göz GÖRÜNEMEZ derken hat 'fotoğraftan geldi' işaretledi (ayrışmanın ön şartı)` },
  // H11 CIRCIRA BAĞLI DEĞİL, TAVANA BAĞLI. Duvar saati ±0.3ms sallanıyor;
  // eşitlik cırcırına bağlanırsa kapı gürültüde kırmızı yanar ve herkes onu yok
  // saymayı öğrenir. §3.6'nın hedefi zaten bir tavan: toplam < 10 sn.
  H11_sure_ms:        { deger: +median.toFixed(1), n, yon: 'tavan_10sn', tavan: 10000,
                        birim: `medyan ${median.toFixed(1)} ms, en kötü ${Math.max(...times).toFixed(1)} ms`,
                        uyari: 'VLM çağrısı HARİÇ (bankadan okundu) — gerçek kullanıcı süresi bunun üstüne API turu ekler' },
};
}

const circirRows = rows.filter((r) => TABAN_SET.has(r.file));
const sayilar = ozet(circirRows);          // CIRCIR — tabanla kıyaslanan tek küme
const sayilar10 = ozet(rows);              // HEDEF SETİ — bilgi, taban HAKEMİN işi
const n = circirRows.length;

// ── tablo ───────────────────────────────────────────────────────────────────
const w = (s, k) => String(s).padEnd(k);
console.log(`HEDEF KOŞUSU — fotoğraf + prompt -> kalıp + flat   (hedef seti n=${rows.length}, cırcır seti n=${n}, mühürlü fixture, 0 API çağrısı)`);
console.log('='.repeat(112));
for (const r of rows) {
  console.log(w(r.file, 42), TABAN_SET.has(r.file) ? 'circir' : 'YENİ  ', r.ok ? 'TAM ' : 'DÜŞTÜ',
    w(` panel ${r.pieces}`, 10), w(`isabet ${r.agree}/${r.judged}`, 15),
    w(`çıkarıldı ${r.inferred}/${r.fieldsTotal}`, 18),
    w(`a${r.inferredA} b${r.inferredB} x${r.inferredUnknown}`, 12), `${r.ms.toFixed(0)}ms`,
    r.draftErr ? ` HATA ${r.draftErr}` : '');
}
console.log('='.repeat(112));
console.log(`CIRCIR SETİ (n=${n}) — TABANLA KIYASLANAN SAYILAR BUNLAR:`);
for (const [k, v] of Object.entries(sayilar)) {
  console.log(w(k, 22), w(v.deger === null ? '—' : v.deger, 8), `n=${v.n}  ${v.birim}`);
  if (v.uyari) console.log(' '.repeat(22), `⚠ ${v.uyari}`);
}
// n=10 AYRI BASILIR. Mutlak sayaçlar (H3 · H8 · H10e) foto sayısıyla büyür;
// iki n'i tek tabloda harmanlamak sahte bir kötüleşme/kazanım üretir. Taban
// n=10'a ancak HAKEM taşır (§3.8 md.1) — ajan bu sayıları yalnız ÖLÇER ve BASAR.
console.log('-'.repeat(112));
console.log(`HEDEF SETİ (n=${rows.length}) — hakemin seçtiği set. CIRCIRA BAĞLI DEĞİL, taban anahtarı YOK:`);
for (const [k, v] of Object.entries(sayilar10)) {
  if (v.deger === null) continue;
  console.log(w(k, 22), w(v.deger, 8), `n=${v.n}  ${v.birim}`);
}

// H2'nin PAYI DEĞİL, EKSİĞİ İLAN EDİLİR. Bir yüzde tek başına hangi alanın
// yanlış okunduğunu saklar; her uyuşmazlık adıyla basılır ki bir sonraki faz
// neyi onaracağını sayıdan değil ADINDAN bilsin.
const tumUyusmazlik = rows.flatMap((r) => r.uyusmazlik.map((u) => `${r.file}  ${u}`));
console.log(`\nH2 UYUŞMAZLIKLARI (${tumUyusmazlik.length}) — hat ile İNSAN gözünün ayrıldığı alanlar:`);
for (const u of tumUyusmazlik) console.log('  ✗', u);
if (!tumUyusmazlik.length) console.log('  (yok)');
const tumEtiket = rows.flatMap((r) => r.etiketHatasi.map((e) => `${r.file}  ${e}`));
console.log(`H10e ETİKET HATALARI (${tumEtiket.length}):`);
for (const e of tumEtiket) console.log('  ✗', e);
if (!tumEtiket.length) console.log('  (yok)');

// ── 🚨 H5'İN KÖR NOKTASI, ARTIK GERÇEKTEN BASILIYOR (GECE7 / F9 hakemi, borç 73)
//
// Bu blok on bir karttır YOKTU. `r.korNokta` yukarıda (satır ~282) hesaplanıyordu
// ve dosyanın hiçbir yerinde OKUNMUYORDU — `grep -n korNokta` tek bir satır
// döndürüyor, atamanın kendisi. Yani yanındaki yorumun "kör nokta burada SAYIYLA
// basılıyor ki gizli kalmasın" cümlesi ÖLÇÜLDÜ VE YANLIŞTI: hesaplanıp
// düşürülüyordu, tek karakteri bile ekrana çıkmıyordu.
//
// Borç 73'ün KÖKÜ bununla kapanmıyor ve kapanamaz: `sleeve_cap` motorda TEK ve
// BÖLÜNMEMİŞ bir yay (sleeve.cpp:194, locket.cpp:379), o yüzden kapağın hangi
// yarısının ön oyuğa gittiğini söyleyen bir beyan YOK ve uydurmak §3.10 ihlali.
// Kapanan, borç 73'ün GÖRÜNÜR yarısı: H5 = 0 diyen her sayfanın yanında, o
// sıfırın ön ile arkayı topladığı ve ±eşit iki sapmanın burada KUSURSUZ
// okunacağı artık bir SAYIYLA duruyor.
const korlar = rows.filter((r) => r.korNokta);
console.log(`\nH5 KÖR NOKTASI (${korlar.length}/${rows.length} kalıpta ölçülebildi) — "0 eşleşmeyen çift" bunu GÖRMÜYOR:`);
for (const r of korlar) {
  const k = r.korNokta;
  console.log(`  ⚠ ${w(r.file, 42)} ${k.pair}  ön ${k.on} mm · arka ${k.arka} mm  (fark ${(k.on - k.arka).toFixed(2)} mm) — ${k.neden}`);
}
if (!korlar.length) console.log('  (hiçbir kalıpta armhole+sleeve_cap rolü birlikte ilan edilmedi)');

// ── CIRCIR (§3.6): altı sayının hiçbiri kötüleşemez ─────────────────────────
if (WRITE_TABAN || !existsSync(TABAN_FILE)) {
  writeFileSync(TABAN_FILE, JSON.stringify({
    _not: 'KOŞU v7 §3.6 hedef koşusu tabanı. §3.8 md.1: faz ajanı bu dosyaya DOKUNAMAZ. Değiştiren hakemdir ve önceki/sonraki sayıyı yan yana yazar.',
    _fixture: 'vision/eval/live-2026-08-22.json', _n: n,
    _tarih: '2026-08-26 (Halka 0)', sayilar,
  }, null, 2) + '\n');
  console.log(`\nTABAN YAZILDI -> contract/hedef-kosu-taban.json  (ratchet buradan başlar)`);
  process.exit(0);
}

const taban = JSON.parse(readFileSync(TABAN_FILE, 'utf8'));
const gerileme = [];
for (const [k, v] of Object.entries(sayilar)) {
  const t = taban.sayilar[k];
  if (!t || t.deger === null || v.deger === null) continue;
  const kotu = v.yon === 'yuksek' ? v.deger < t.deger
    : v.yon === 'dusuk' ? v.deger > t.deger
    : v.yon === 'tavan_10sn' ? v.deger > v.tavan   // saat gürültüsü değil, gerçek tavan
    : false;   // 'tavan' (H10) tek başına gerileme değil — §0B, H2 ile birlikte okunur
  if (kotu) gerileme.push(`${k}: taban ${t.deger} -> şimdi ${v.deger}`);
}
// §0B / H10 tavanı: çıkarılan alan oranı yükselirken H2 yükselmiyorsa faz kapanmaz
const t10 = taban.sayilar.H10_cikarildi_orani, t2 = taban.sayilar.H2_gorulen_isabet;
if (t10 && t2 && sayilar.H10_cikarildi_orani.deger > t10.deger && sayilar.H2_gorulen_isabet.deger <= t2.deger) {
  gerileme.push(`H10 tavanı: çıkarıldı %${t10.deger} -> %${sayilar.H10_cikarildi_orani.deger} ama H2 yükselmedi (%${t2.deger} -> %${sayilar.H2_gorulen_isabet.deger})`);
}
// Ayrışmadan SONRA tavan H10b'ye uygulanır (Damla, 26 Ağu). Taban dosyasına
// H10b'yi HAKEM yazar (§3.8 md.1); yazıldığı andan itibaren bu satır işler ve
// o güne kadar sessizce doğru davranır, çünkü taban anahtarı yoksa kıyas yok.
const t10b = taban.sayilar.H10b_gorunen_alinamayan;
if (t10b && t2 && sayilar.H10b_gorunen_alinamayan.deger > t10b.deger &&
    sayilar.H2_gorulen_isabet.deger <= t2.deger) {
  gerileme.push(`H10b tavanı: görünen-alınamayan %${t10b.deger} -> %${sayilar.H10b_gorunen_alinamayan.deger} ama H2 yükselmedi`);
}

console.log('\n' + '-'.repeat(104));
if (gerileme.length) {
  console.log(`CIRCIR KIRIK — ${gerileme.length} sayı kötüleşti. Faz KAPANMAZ (§3.6).`);
  for (const g of gerileme) console.log('  ✗', g);
  process.exit(1);
}
console.log(`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi (taban ${taban._tarih}, n=${taban._n}).`);
