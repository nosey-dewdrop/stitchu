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

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');

const { draft } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));
const { renderGarmentFlat } = await import(join(ROOT, 'engine/tools/render-garment-flat.mjs'));
const { canonical } = await import(join(ROOT, 'web/js/vocab.gen.js'));
const VB = await import(join(ROOT, 'web/js/vision-bridge.js'));

const TABAN_FILE = join(ROOT, 'contract', 'hedef-kosu-taban.json');
const WRITE_TABAN = process.argv.includes('--taban');

// ── MÜHÜRLÜ GİRDİ (§3.8 md.2) ───────────────────────────────────────────────
// Faz ajanı bu iki yolu değiştiremez, foto ekleyemez, çıkaramaz.
const FIXTURE = join(ROOT, 'vision', 'eval', 'live-2026-08-22.json');
const LABELS_F = join(ROOT, 'vision', 'eval', 'labels.json');

const bank = JSON.parse(readFileSync(FIXTURE, 'utf8'));
const LABELS = JSON.parse(readFileSync(LABELS_F, 'utf8'));
const files = Object.keys(bank).filter((k) => !k.startsWith('_')).sort();

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
  const label = LABELS[file] || {};
  const t0 = process.hrtime.bigint();
  const r = {
    file, judged: 0, agree: 0, hallucinated: [], outOfDict: [], inferred: 0, fieldsTotal: 0,
    pieces: 0, ok: false, flatBytes: 0, seamPairs: [], oov: (seen.outOfVocab || []).length,
  };

  // H2: fotoğrafta GÖRÜLEN alanların kaçı doğru okundu (göz etiketine karşı).
  for (const [lf] of Object.entries(FIELD_MAP)) {
    const want = label[lf];
    if (want === null || want === undefined) continue;   // göz "görünmüyor" dedi
    r.judged++;
    const got = seen[lf];
    const same = String(got) === String(want) ||
      (lf === 'hemRuffle' && String(got ?? 'none') === String(want));
    if (same) r.agree++;
  }

  // H3: UYDURMA ALAN — göz "görünmüyor" (null) demiş ama vision bir değer basmış
  // ve bu bir çıkarım olarak İLAN EDİLMEMİŞ. §3.6: cezalandırılan uydurmak değil,
  // SESSİZCE uydurmaktır. Bugün ilan kanalı (F0 md.6) kodda yok, o yüzden bu
  // sınıfın tamamı H3'e yazılır; ilan kanalı gelince buradan düşecek.
  for (const [lf] of Object.entries(FIELD_MAP)) {
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
  for (const k of Object.keys(spec)) {
    r.fieldsTotal++;
    if (!declared.has(k)) r.inferred++;
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
    }
  } else {
    r.draftErr = d.error || 'kalıp yok';
  }
  r.ms = Number(process.hrtime.bigint() - t0) / 1e6;
  rows.push(r);
}

// ── altı sayı (§3.6) ────────────────────────────────────────────────────────
const n = rows.length;
const done = rows.filter((r) => r.ok).length;
const J = rows.reduce((s, r) => s + r.judged, 0);
const A = rows.reduce((s, r) => s + r.agree, 0);
const H3 = rows.reduce((s, r) => s + r.hallucinated.length, 0);
const OOD = rows.reduce((s, r) => s + r.outOfDict.length, 0);
const FT = rows.reduce((s, r) => s + r.fieldsTotal, 0);
const INF = rows.reduce((s, r) => s + r.inferred, 0);
// H5: uzunluğu eşleşmeyen dikiş çifti. Eşik %4 cap ease (§1C, sleeve.hpp:12).
const pairs = rows.flatMap((r) => r.seamPairs);
const badPairs = pairs.filter((p) => p.a > 0 && Math.abs(p.diff / p.a) > 0.08).length;
const times = rows.map((r) => r.ms).sort((a, b) => a - b);
const median = times.length ? times[Math.floor(times.length / 2)] : 0;

const sayilar = {
  H1_tamamlanma:      { deger: done,               n, birim: `${done}/${n} girdi kalıp+flat üretti`, yon: 'yuksek' },
  H2_gorulen_isabet:  { deger: pct(A, J),          n, birim: `%${pct(A, J)} (${A}/${J} alan yargısı)`, yon: 'yuksek',
                        uyari: 'göz etiketi Fable tarafından gözle konuldu, İNSAN etiketi değil — §1F, geçici' },
  H3_uydurma_alan:    { deger: H3,                 n, birim: `${H3} ilan edilmemiş uydurma alan`, yon: 'dusuk' },
  H4_gereksiz_dikis:  { deger: null,               n, birim: 'ÖLÇEMEDİM — F5 dört sebep katmanı kodda yok', yon: 'dusuk' },
  H5_dikilebilirlik:  { deger: badPairs,           n, birim: `${badPairs} eşleşmeyen çift / ${pairs.length} ölçülebilen çift`, yon: 'dusuk',
                        uyari: 'kalıpta yalnız armhole+sleeve_cap rolleri ilan edili; diğer dikişler ÖLÇÜLEMİYOR' },
  H6_konvansiyon:     { deger: null,               n, birim: 'ÖLÇEMEDİM — manken çapası flat_convention_check içinde, bu koşuya bağlanmadı', yon: 'dusuk' },
  H8_ifade_edilemeyen:{ deger: rows.reduce((s, r) => s + r.oov, 0) + OOD, n, yon: 'dusuk',
                        birim: `${rows.reduce((s, r) => s + r.oov, 0)} outOfVocab terim + ${OOD} sözlükte olmayan alan okuması` },
  H9_cikarim_makullugu:{ deger: null,              n, birim: 'ÖLÇEMEDİM — görünmeyen alanda makullük hakemi yok', yon: 'yuksek' },
  H10_cikarildi_orani:{ deger: pct(INF, FT),       n, birim: `%${pct(INF, FT)} (${INF}/${FT} alan default'tan geldi)`, yon: 'tavan' },
  // H11 CIRCIRA BAĞLI DEĞİL, TAVANA BAĞLI. Duvar saati ±0.3ms sallanıyor;
  // eşitlik cırcırına bağlanırsa kapı gürültüde kırmızı yanar ve herkes onu yok
  // saymayı öğrenir. §3.6'nın hedefi zaten bir tavan: toplam < 10 sn.
  H11_sure_ms:        { deger: +median.toFixed(1), n, yon: 'tavan_10sn', tavan: 10000,
                        birim: `medyan ${median.toFixed(1)} ms, en kötü ${Math.max(...times).toFixed(1)} ms`,
                        uyari: 'VLM çağrısı HARİÇ (bankadan okundu) — gerçek kullanıcı süresi bunun üstüne API turu ekler' },
};

// ── tablo ───────────────────────────────────────────────────────────────────
const w = (s, k) => String(s).padEnd(k);
console.log(`HEDEF KOŞUSU — fotoğraf + prompt -> kalıp + flat   (n=${n}, mühürlü fixture, 0 API çağrısı)`);
console.log('='.repeat(104));
for (const r of rows) {
  console.log(w(r.file, 42), r.ok ? 'TAM ' : 'DÜŞTÜ',
    w(` panel ${r.pieces}`, 10), w(`isabet ${r.agree}/${r.judged}`, 15),
    w(`çıkarıldı ${r.inferred}/${r.fieldsTotal}`, 18), `${r.ms.toFixed(0)}ms`,
    r.draftErr ? ` HATA ${r.draftErr}` : '');
}
console.log('='.repeat(104));
for (const [k, v] of Object.entries(sayilar)) {
  console.log(w(k, 22), w(v.deger === null ? '—' : v.deger, 8), `n=${v.n}  ${v.birim}`);
  if (v.uyari) console.log(' '.repeat(22), `⚠ ${v.uyari}`);
}

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

console.log('\n' + '-'.repeat(104));
if (gerileme.length) {
  console.log(`CIRCIR KIRIK — ${gerileme.length} sayı kötüleşti. Faz KAPANMAZ (§3.6).`);
  for (const g of gerileme) console.log('  ✗', g);
  process.exit(1);
}
console.log(`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi (taban ${taban._tarih}, n=${taban._n}).`);
