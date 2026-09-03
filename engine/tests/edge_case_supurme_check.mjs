#!/usr/bin/env node
// edge_case_supurme_check.mjs — M4-edge KAPISI.
//
// HEDEF CÜMLESİ: "fotoğraf + prompt -> dikilebilir kalıp + satılır flat, TÜM EDGE
// CASELERE RAĞMEN sınırsız ölçüde." Bu kapı o cümlenin "tüm edge caselere rağmen"
// kısmını ölçer, ve tek bir yasası vardır:
//
//   ⛔ HER VAKA YA GEÇERLİ BİR ÇIKTI VERİR YA DA ADIYLA REDDEDİLİR VE
//      REDDİN YANINDA KULLANICININ YAPABİLECEĞİ SONRAKİ ADIM DURUR.
//
//   sessiz çöküş 0 · sessiz default 0 · çıkmaz sokak 0.
//
// "Sessiz default": zincirin bir halkası cevabı bulamayıp, kullanıcıya HİÇBİR ŞEY
// söylemeden standart tabloya düşmesi. "Çıkmaz sokak": bir ret cümlesinin, insanın
// yapabileceği bir sonraki adımı içermemesi.
//
// ⛔ SIFIR CANLI LLM ÇAĞRISI (para disiplini). Fotoğraf tarafı iki kaynaktan
// beslenir ve ikisi de bedava:
//   1. SENTETİK PİKSEL FİKSTÜRLERİ — bu dosyanın kendi çizdiği ImageData'lar
//      (düz serilmiş giysi, manzara, iki giysi, insan üstünde, karanlık, bulanık).
//      Ürünün KENDİ ölçüm motoru (web/js/measure.js) bunların üstünde koşar; taklit
//      yok, deterministik.
//   2. BANKALI OKUMA JSON'ları — engine/tests/fixtures/vision/*.json (etiket
//      yarısı bir kez satın alınıp bankalanmış olan).
//
// Kalıp/kumaş tarafı sevk edilen wasm baytının kendisidir (engine/dist).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// DOM stub — uctan_uca_check ile aynı dört satır: sevk edilen loader node'da koşsun.
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };

const { measureGarment } = await import(join(ROOT, 'web/js/measure.js'));
const VB = await import(join(ROOT, 'web/js/vision-bridge.js'));
const PP = await import(join(ROOT, 'web/js/prompt-parse.js'));
const E = await import(join(ROOT, 'web/js/engine.js'));
const { FABRIC_CATALOG } = await import(join(ROOT, 'web/js/fabric-catalog.js'));

// ── RAPOR ───────────────────────────────────────────────────────────────────
const fails = [];
const rows = [];   // { bolum, vaka, sonuc, kanit }
let checked = 0;
const check = (name, cond, detail) => {
  checked++;
  if (!cond) fails.push(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  return cond;
};
const row = (bolum, vaka, sonuc, kanit) => rows.push({ bolum, vaka, sonuc, kanit });

// ── ÇIKMAZ SOKAK DEDEKTÖRÜ ──────────────────────────────────────────────────
// Bir ret cümlesi, insanın yapabileceği bir şey söylemiyorsa çıkmaz sokaktır.
// İşaretler ürünün İKİ DİLİNDE de aranıyor, çünkü site iki dilde konuşuyor.
const ADIM_ISARETLERI = [
  'sonraki adım', 'next step', 'şöyle yaz', 'pick the garment below',
  'pick below', 'aşağıdan', 'valid:', 'geçerli', 'instead', 'try again',
  'kullanmak için', 'çıkar', 'use a bolt', 'kelimesini',
];
function sonrakiAdimVarMi(metin) {
  const s = String(metin || '').toLocaleLowerCase('tr-TR');
  return ADIM_ISARETLERI.some((m) => s.includes(m.toLocaleLowerCase('tr-TR')));
}

// ── SENTETİK PİKSEL FİKSTÜRLERİ ─────────────────────────────────────────────
function blank(W, H, rgb) {
  const d = new Uint8ClampedArray(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    d[p * 4] = rgb[0]; d[p * 4 + 1] = rgb[1]; d[p * 4 + 2] = rgb[2]; d[p * 4 + 3] = 255;
  }
  return { data: d, width: W, height: H };
}
function box(img, x0, y0, x1, y1, rgb) {
  for (let y = Math.max(0, y0); y < Math.min(img.height, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(img.width, x1); x++) {
      const o = (y * img.width + x) * 4;
      img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = 255;
    }
  }
}
/** Mankensiz, düz serilmiş bir giysi: omuz -> bel -> etek ucu profili. */
function duzSerilmis(W = 600, H = 800, fg = [40, 40, 60], bg = [245, 245, 245]) {
  const img = blank(W, H, bg);
  const y0 = Math.round(0.10 * H), y1 = Math.round(0.92 * H);
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / (y1 - y0);
    let half;
    if (t < 0.12) half = 0.22 * W * (1 - (t / 0.12) * 0.15);
    else if (t < 0.42) half = 0.19 * W - 0.05 * W * ((t - 0.12) / 0.30);
    else half = 0.14 * W + 0.16 * W * ((t - 0.42) / 0.58);
    box(img, Math.round(W / 2 - half), y, Math.round(W / 2 + half), y + 1, fg);
  }
  return img;
}
function gurultulu(seed = 12345) {
  const img = duzSerilmis(600, 800, [168, 168, 178], [188, 188, 196]);
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let p = 0; p < img.width * img.height; p++) {
    const n = Math.round((rnd() - 0.5) * 70);
    img.data[p * 4] += n; img.data[p * 4 + 1] += n; img.data[p * 4 + 2] += n;
  }
  return img;
}

const FOTO_VAKALARI = [
  { ad: 'mankensiz düz serilmiş giysi (SAĞLIKLI HAT)', beklenen: 'olculdu', img: () => duzSerilmis() },
  { ad: 'giysi olmayan fotoğraf — manzara', beklenen: 'red', img: () => {
      const i = blank(600, 400, [135, 180, 235]);
      box(i, 0, 240, 600, 400, [90, 140, 70]);
      box(i, 60, 150, 180, 250, [120, 110, 100]);
      return i;
    } },
  { ad: 'giysi olmayan fotoğraf — boş duvar', beklenen: 'red', img: () => blank(600, 800, [250, 250, 250]) },
  { ad: 'birden fazla giysi tek karede', beklenen: 'red', img: () => {
      const i = blank(800, 700, [245, 245, 245]);
      box(i, 80, 80, 360, 620, [40, 40, 60]);
      box(i, 440, 80, 720, 620, [50, 40, 50]);
      return i;
    } },
  { ad: 'giysi bir insanın üstünde (baş + bacaklar)', beklenen: 'red', img: () => {
      const i = duzSerilmis(600, 900);
      box(i, 255, 740, 290, 890, [40, 40, 60]);
      box(i, 310, 740, 345, 890, [40, 40, 60]);
      box(i, 0, 0, 600, 120, [245, 245, 245]);
      box(i, 270, 20, 330, 110, [40, 40, 60]);
      return i;
    } },
  { ad: 'aşırı karanlık kare', beklenen: 'red', img: () => duzSerilmis(600, 800, [12, 12, 14], [6, 6, 7]) },
  { ad: 'aşırı parlak / kontrastsız kare', beklenen: 'red', img: () => duzSerilmis(600, 800, [250, 250, 250], [255, 255, 255]) },
  { ad: 'bulanık + gürültülü kare', beklenen: 'red', img: () => gurultulu() },
  { ad: 'giysi karede çok küçük', beklenen: 'red', img: () => {
      const i = blank(800, 800, [245, 245, 245]);
      box(i, 390, 390, 410, 430, [30, 30, 40]);
      return i;
    } },
  { ad: 'bozuk / boş görüntü nesnesi', beklenen: 'red', img: () => ({ data: new Uint8ClampedArray(4), width: 0, height: 0 }) },
];

console.log('── A. FOTOĞRAF HATTI (measure.js, sentetik piksel fikstürleri) ──');
for (const v of FOTO_VAKALARI) {
  let m;
  try { m = measureGarment(v.img()); }
  catch (e) { check(`foto '${v.ad}' SESSİZ ÇÖKMEDİ`, false, `throw: ${e.message}`); row('foto', v.ad, 'ÇÖKTÜ', e.message); continue; }
  const seen = { garment: 'dress' };
  const durum = VB.applyMeasuredRatios(seen, m);
  const red = VB.olcumRedCumlesi(seen, 'tr');

  if (m.ok) {
    check(`foto '${v.ad}' ölçüldüyse oranları var`, !!m.ratios);
    check(`foto '${v.ad}' beklenen sonuç`, v.beklenen === 'olculdu',
      `beklenen ${v.beklenen}, ölçüm ok (conf ${m.confidence})`);
    row('foto', v.ad, `ÖLÇÜLDÜ (${durum}, güven ${m.confidence})`,
      `L/W ${m.ratios.lengthToWidth} · hem/bel ${m.ratios.hemToWaistWidth}`);
    continue;
  }
  // RED: adı var mı, kullanıcıya taşındı mı, sonraki adımı var mı?
  check(`foto '${v.ad}' reddi ADIYLA geldi`, typeof m.reason === 'string' && m.reason.length > 0);
  check(`foto '${v.ad}' reddi KULLANICIYA taşındı (sessiz default yok)`, red !== null,
    `applyMeasuredRatios '${durum}' döndürdü ve olcumRedCumlesi null`);
  if (red) {
    check(`foto '${v.ad}' reddinin cümlesi TANIMLI (bilinmeyen sebep sızmadı)`, red.bilinen === true, red.sebep);
    check(`foto '${v.ad}' reddi SONRAKİ ADIM taşıyor (çıkmaz sokak yok)`, sonrakiAdimVarMi(red.metin), red.metin);
  }
  // Bir red, kalıbı DURDURMAZ: standart tablo hâlâ geçerli bir cevaptır.
  check(`foto '${v.ad}' reddi akışı kilitlemiyor`, seen.ratiosMeasured === false);
  row('foto', v.ad, `ADIYLA RED: ${m.reason}`, red ? red.metin : '(cümle YOK)');
}

// Bilinmeyen bir sebep sessizce düşmesin: measure.js'in KENDİ fail() çağrılarının
// listesi kaynaktan çıkarılıp sözlükle karşılaştırılıyor.
{
  const src = readFileSync(join(ROOT, 'web/js/measure.js'), 'utf8');
  const sebepler = [...src.matchAll(/fail\('([a-z_]+)'/g)].map((m) => m[1]);
  const uniq = [...new Set(sebepler)].sort();
  check('measure.js en az 8 adlı ret sebebi taşıyor', uniq.length >= 8, uniq.join(','));
  for (const s of uniq) {
    const sahte = { olcumRed: { sebep: s, guven: 0.2 } };
    const c = VB.olcumRedCumlesi(sahte, 'tr');
    check(`ret sebebi '${s}' için ekranda bir cümle var`, c && c.bilinen === true);
    check(`ret sebebi '${s}' cümlesi sonraki adım taşıyor`, c && sonrakiAdimVarMi(c.metin), c && c.metin);
    const en = VB.olcumRedCumlesi(sahte, 'en');
    check(`ret sebebi '${s}' İNGİLİZCESİ de sonraki adım taşıyor`, en && sonrakiAdimVarMi(en.metin), en && en.metin);
  }
  row('foto', `measure.js'in ${uniq.length} ret sebebi`, 'HEPSİ CÜMLELİ + ADIMLI', uniq.join(', '));
}

// ── B. PROMPT HATTI ─────────────────────────────────────────────────────────
console.log('── B. PROMPT HATTI (prompt-parse.js) ──');
const PROMPT_VAKALARI = [
  { ad: 'boş prompt', metin: '', beklenen: 'bos' },
  { ad: 'sadece boşluk', metin: '   \n\t ', beklenen: 'bos' },
  { ad: 'sadece emoji', metin: '👗👗👗', beklenen: 'bos' },
  { ad: 'sadece noktalama', metin: '!!!???...', beklenen: 'bos' },
  { ad: 'anlamsız prompt', metin: 'asdfgh qwerty zxcvb', beklenen: 'hepsi-raporlu' },
  { ad: 'çelişkili prompt (kolsuz + uzun kollu)', metin: 'kolsuz uzun kollu elbise', beklenen: 'konaksiz' },
  { ad: 'çelişkili prompt EN (sleeveless + long sleeve)', metin: 'sleeveless long sleeve dress', beklenen: 'konaksiz' },
  { ad: 'çelişkili prompt (etek + yaka)', metin: 'kare yakalı midi etek', beklenen: 'konaksiz' },
  { ad: 'aynı eksene iki kelime (mini + maksi)', metin: 'mini maksi elbise', beklenen: 'hepsi-raporlu' },
  { ad: 'çok uzun prompt (280 token)', metin: 'uzun kollu kare yakalı pileli midi elbise '.repeat(40), beklenen: 'hepsi-raporlu' },
  { ad: 'Türkçe ek: "kare yakalı puf kollu elbise"', metin: 'kare yakalı puf kollu elbise', beklenen: 'okundu' },
  { ad: 'Türkçe+İngilizce karışık', metin: 'square yakali puf kollu mini dress with pockets', beklenen: 'hepsi-raporlu' },
  { ad: 'sayılı edit ("yakayı 2cm derinleştir")', metin: 'yakayı 2cm derinleştir', beklenen: 'edit' },
];
for (const v of PROMPT_VAKALARI) {
  let ep, p;
  try {
    ep = PP.parseEditPrompt(v.metin);
    p = PP.parsePrompt(ep.kalan);
  } catch (e) {
    check(`prompt '${v.ad}' SESSİZ ÇÖKMEDİ`, false, `throw: ${e.message}`);
    row('prompt', v.ad, 'ÇÖKTÜ', e.message); continue;
  }
  const editList = Object.entries(ep.alanlar);
  // 1) ARİTMETİK: hiçbir token sessizce düşmüyor.
  const h = p.hesap;
  check(`prompt '${v.ad}' token aritmetiği kapanıyor`,
    h.toplam === h.eslesen + h.stop + h.anlasilmayan,
    JSON.stringify(h));
  // 2) Anlaşılmayan her kelimenin bir ÖNERİSİ var (çıkmaz sokak yok).
  for (const u of p.anlasilmadi) {
    check(`prompt '${v.ad}' '${u.kelime}' için öneri var`, !!u.oneri && u.oneri.length > 8, u.oneri);
  }
  check(`prompt '${v.ad}' anlaşılmayan sayısı raporla tutuyor`,
    p.anlasilmadi.length >= 0 && (h.anlasilmayan === 0 || p.anlasilmadi.length > 0),
    `anlasilmayan=${h.anlasilmayan} rapor=${p.anlasilmadi.length}`);
  // 3) KONAKSIZ eksenler: kullanıcının kendi cümlesinin öldürdüğü eksen.
  const konaksiz = PP.konaksizEksenler(p);
  for (const k of konaksiz) {
    check(`prompt '${v.ad}' konaksız '${k.alan}' sonraki adım taşıyor`, sonrakiAdimVarMi(k.oneri), k.oneri);
  }
  // 4) OOV kararlarının hepsi ya primitif demeti ya adıyla ret + öneri.
  for (const o of p.oovKarar || []) {
    check(`prompt '${v.ad}' OOV '${o.term}' öneri taşıyor`, !!(o.oneri && (o.oneri.tr || o.oneri.en)), JSON.stringify(o).slice(0, 120));
  }
  // 5) Beklenen sınıf.
  if (v.beklenen === 'bos') {
    check(`prompt '${v.ad}' boş olarak İLAN EDİLDİ (sessiz kabul yok)`, p.bos === true && !editList.length);
  }
  if (v.beklenen === 'konaksiz') {
    check(`prompt '${v.ad}' çelişkiyi ADIYLA bildirdi`, konaksiz.length > 0,
      `eksenler=${JSON.stringify(Object.keys(p.eksenler))} konaksiz=0 — sessizce çözülmüş`);
  }
  if (v.beklenen === 'okundu') {
    check(`prompt '${v.ad}' en az bir eksen okudu`, Object.keys(p.eksenler).length > 0);
    check(`prompt '${v.ad}' yanlış "sözlük dışı" demiyor`, (p.oovKarar || []).length === 0,
      JSON.stringify((p.oovKarar || []).map((o) => o.term)));
  }
  if (v.beklenen === 'edit') {
    check(`prompt '${v.ad}' mm edit'i çekti`, editList.length > 0, JSON.stringify(ep.alanlar));
  }
  const okunan = Object.entries(p.eksenler).map(([f, e]) => `${f}=${e.value}`).join(' ');
  row('prompt', v.ad,
    p.bos ? 'BOŞ İLAN EDİLDİ' : `okunan ${Object.keys(p.eksenler).length} eksen`,
    [okunan, konaksiz.length ? `KONAKSIZ: ${konaksiz.map((k) => k.oneri).join(' | ')}` : '',
     p.anlasilmadi.length ? `ANLAŞILMADI: ${p.anlasilmadi.map((u) => `${u.kelime} → ${u.oneri}`).join(' | ')}` : '',
     editList.length ? `EDIT: ${editList.map(([f, e]) => `${f}=${e.mm}mm`).join(' ')}` : '']
      .filter(Boolean).join(' · '));
}

// Sözlükte OLAN bir kelimeye "sözlük dışı" denmesi yasak (M4-edge).
{
  const p = PP.parsePrompt('square yakali');
  const oovTerms = (p.oovKarar || []).map((o) => o.term);
  check("bilinen kelime 'square' OOV kanalına düşmüyor", !oovTerms.includes('square'), oovTerms.join(','));
  const sq = p.anlasilmadi.find((u) => u.kelime === 'square');
  check("'square' için tamamlama önerisi var", !!sq && /şöyle yaz/.test(sq.oneri), sq && sq.oneri);
}

// ── C. FOTOĞRAF + ÇELİŞKİLİ PROMPT: PROMPT KAZANIR (F1 madde 3) ─────────────
console.log('── C. FOTOĞRAF + ÇELİŞKİLİ PROMPT ──');
{
  const fx = JSON.parse(readFileSync(join(here, 'fixtures/vision/okuma-kollu-elbise.json'), 'utf8'));
  const seen = fx.seen;
  const spec = {
    garment: seen.garment, neckline: seen.neckline, sleeveStyle: seen.sleeveStyle,
    sleeveLength: seen.sleeveLength, skirtStyle: seen.skirtStyle, skirtLength: seen.length,
    shaping: 'dart', waistline: 'natural', fabric: 'woven', topLength: 'hip',
  };
  const fotoKol = spec.sleeveStyle;
  const p = PP.parsePrompt('kolsuz elbise');
  const { degisen, konaksiz } = PP.birlestir(spec, p);
  check('foto kollu okudu (fikstür gerçekten çelişiyor)', fotoKol && fotoKol !== 'none', String(fotoKol));
  check('çelişkide PROMPT kazandı (sleeveStyle none)', spec.sleeveStyle === 'none',
    `${fotoKol} -> ${spec.sleeveStyle}`);
  check('değişim ADIYLA raporlandı', degisen.some((d) => d[0] === 'sleeveStyle'), JSON.stringify(degisen));
  row('foto+prompt', 'fotoğraf kollu, prompt "kolsuz"', 'PROMPT KAZANDI',
    `sleeveStyle ${fotoKol} → none · rapor ${JSON.stringify(degisen.find((d) => d[0] === 'sleeveStyle'))}`);
  check('foto+prompt konaksız kaydı tutarlı', Array.isArray(konaksiz));
}
// Sadece ARKA fotoğraf: ön eksenler uydurulur ve UYDURULDUĞU İLAN EDİLİR.
{
  const { arkaDamgala } = await import(join(ROOT, 'web/lib/arka-koken.js'));
  const { yeniKoken, isaretle } = await import(join(ROOT, 'web/js/provenance.js'));
  const alanlar = ['garment', 'neckline', 'sleeveStyle', 'backOpening', 'backDetail', 'backSlit', 'laceUpBack'];
  const koken = yeniKoken(alanlar);
  const spec = { garment: 'dress', neckline: 'crew', sleeveStyle: 'none', backOpening: 'none',
                 backDetail: 'none', backSlit: 'none', laceUpBack: 'none' };
  const uydurulan = arkaDamgala(koken, spec, alanlar, false, isaretle);
  check('arka fotoğraf yokken uydurulan arka İLAN EDİLİYOR', Array.isArray(uydurulan));
  row('foto+prompt', 'sadece arka fotoğraf / arka fotoğraf yok', 'UYDURMA İLAN EDİLDİ',
    `uydurulan alanlar: ${uydurulan.length ? uydurulan.join(', ') : '(bu spec\'te uydurulacak arka alanı yok)'}`);
}

// ── D. UÇ BEDENLER · KUMAŞ · MOTOR REDDİ ────────────────────────────────────
console.log('── D. UÇ BEDENLER / KUMAŞ / MOTOR ──');
const BASE = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine',
  skirtLength: 'midi', topLength: 'hip', shoulderStyle: 'set', sleeveCap: 'plain',
  edgeFinish: 'biasBinding', hemShape: 'straight', collarEdge: 'round', gatherZone: 'neckline',
};
const BEDENLER = Object.keys(JSON.parse(
  readFileSync(join(ROOT, 'contract/tables.json'), 'utf8')).euSizeChart ?? {});
const SIZES = BEDENLER.length ? BEDENLER : ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48', 'EU50', 'EU52'];
for (const s of SIZES) {
  let body;
  try { body = E.bodyForSize(s); }
  catch (e) { check(`beden ${s} tablodan okundu`, false, e.message); continue; }
  const r = await E.draft(BASE, body);
  check(`beden ${s} kalıp verdi ya da adıyla reddetti`, !!(r.pattern || r.error));
  if (r.error) {
    check(`beden ${s} reddi sonraki adım taşıyor`, sonrakiAdimVarMi(r.error), r.error);
    row('beden', s, 'ADIYLA RED', r.error);
  } else {
    check(`beden ${s} validator temiz`, (r.issues || []).length === 0, (r.issues || []).join(' | '));
    row('beden', s, `KALIP ${r.pattern.pieces.length} parça`, `issues ${(r.issues || []).length}`);
  }
}
// Uç bedenlerde FLAT de çiziliyor (satılır yarının kırılmadığı kanıtı).
for (const s of [SIZES[0], SIZES[SIZES.length - 1]]) {
  let f = null, hata = null;
  try { f = await E.flatDrawing(BASE, { size: s }); } catch (e) { hata = e.message; }
  check(`flat ${s} çizildi ya da adıyla reddetti`, !!(f || hata));
  if (f) {
    check(`flat ${s} SVG taşıyor`, /<svg/.test(f.svg) && f.svg.length > 2000, `${f.svg.length} bayt`);
    row('beden', `flat ${s}`, 'ÇİZİLDİ', `${f.svg.length} bayt · düğüm ${f.dugum}`);
  } else {
    check(`flat ${s} reddi sonraki adım taşıyor`, sonrakiAdimVarMi(hata), hata);
    row('beden', `flat ${s}`, 'ADIYLA RED', hata);
  }
}
// Tabloda olmayan beden: sessizce EU38'e düşmek YASAK.
{
  let msg = null;
  try { E.bodyForSize('EU99'); } catch (e) { msg = e.message; }
  check('bilinmeyen beden ADIYLA reddedildi', !!msg && /EU99/.test(msg), String(msg));
  check('bilinmeyen beden reddi geçerli listeyi veriyor', sonrakiAdimVarMi(msg || ''), String(msg));
  row('beden', 'EU99 (tabloda yok)', 'ADIYLA RED', msg);
}
// Sözlükte olmayan eksen değeri: sessiz default değil, adıyla ret.
{
  const r = await E.draft({ ...BASE, neckline: 'uydurma-yaka' }, E.bodyForSize('EU38'));
  check('uydurma eksen değeri adıyla reddedildi', !!r.error && /neckline/.test(r.error), String(r.error));
  check('uydurma eksen reddi geçerli değerleri sayıyor', sonrakiAdimVarMi(r.error || ''), String(r.error));
  check('uydurma eksende kalıp ÜRETİLMEDİ', r.pattern === null);
  row('motor', "neckline='uydurma-yaka'", 'ADIYLA RED', r.error);
}

// ── D2. DAR TOP ENİ + BÜYÜK PARÇA (M4-edge'in ana bulgusu) ──────────────────
// Metraj cümlesi saf aritmetikti (m140 * 140/en) ve parçanın ENİNE SIĞIP
// SIĞMADIĞINI hiç sormuyordu. Kapı: sığmayan her kombinasyonda metraj sayısı
// YERİNE adıyla bir ret + sonraki adım gelir.
function rehberBul(pattern, id) {
  return (pattern.rehber || []).find((a) => a.id === id) || null;
}
let tasan = 0, sigan = 0;
for (const [id, f] of Object.entries(FABRIC_CATALOG)) {
  for (const size of ['EU34', 'EU38', 'EU48', 'EU52']) {
    for (const sk of ['straight', 'aLine', 'gathered', 'halfCircle', 'pleated', 'gore']) {
      for (const len of ['mini', 'midi', 'maxi']) {
        const r = await E.draft({ ...BASE, fabricPreset: id, skirtStyle: sk, skirtLength: len },
          E.bodyForSize(size));
        if (r.error) { check(`kumaş ${id}/${size}/${sk}/${len} reddi adımlı`, sonrakiAdimVarMi(r.error), r.error); continue; }
        const y = rehberBul(r.pattern, 'cut.yardage');
        if (!check(`kumaş ${id}/${size}/${sk}/${len} metraj bölümü var`, !!y)) continue;
        const fits = /fitsBolt=1/.test(y.basis);
        const genis = Number((y.basis.match(/widestPieceMM=(\d+)/) || [])[1]);
        const bolt = f.fabricWidthCM * 10;
        if (fits) {
          sigan++;
          check(`kumaş ${id}/${size}/${sk}/${len} sığıyor beyanı DOĞRU`, genis <= bolt + 0.5,
            `widest ${genis} > bolt ${bolt}`);
          check(`kumaş ${id}/${size}/${sk}/${len} metraj sayısı veriyor`, / m at /.test(y.text), y.text);
        } else {
          tasan++;
          check(`kumaş ${id}/${size}/${sk}/${len} taşma beyanı DOĞRU`, genis > bolt,
            `widest ${genis} <= bolt ${bolt}`);
          check(`kumaş ${id}/${size}/${sk}/${len} taşmada metraj UYDURMUYOR`, !/ m at /.test(y.text), y.text);
          check(`kumaş ${id}/${size}/${sk}/${len} taşma reddi sonraki adım taşıyor`,
            sonrakiAdimVarMi(y.text), y.text);
        }
      }
    }
  }
}
check('en az bir kombinasyon top enine sığmıyor (kapı ölü hat ölçmüyor)', tasan > 0, `tasan=${tasan}`);
check('kombinasyonların çoğu sığıyor (kapı her şeyi reddetmiyor)', sigan > tasan, `sigan=${sigan} tasan=${tasan}`);
row('kumaş', `${sigan + tasan} kombinasyon (5 kumaş × 4 beden × 6 etek × 3 boy)`,
  `${sigan} SIĞDI · ${tasan} ADIYLA RED`, 'taşan hiçbirinde metraj sayısı basılmadı');
{
  const r = await E.draft({ ...BASE, fabricPreset: 'cotton-velveteen', skirtStyle: 'pleated', skirtLength: 'midi' },
    E.bodyForSize('EU48'));
  const y = rehberBul(r.pattern, 'cut.yardage');
  row('kumaş', 'kadife 106.7cm + EU48 pileli etek', 'ADIYLA RED', y ? y.text : '(yok)');
}

// Aşırı streç + dar kalıp: motor ya çizer ya adıyla reddeder, sessiz geçmez.
for (const st of [0, 5, 20, 50, 95]) {
  const r = await E.draft({ ...BASE, fabric: 'knit', fabricStretchPct: st }, E.bodyForSize('EU38'));
  check(`streç %${st} kalıp ya da adıyla red`, !!(r.pattern || r.error));
  if (r.error) check(`streç %${st} reddi adımlı`, sonrakiAdimVarMi(r.error), r.error);
  const iss = (r.issues || []);
  for (const i of iss) check(`streç %${st} issue metni boş değil`, String(i).length > 10, String(i));
  row('kumaş', `örme, crosswise streç %${st}`,
    r.error ? 'ADIYLA RED' : (iss.length ? `KALIP + ${iss.length} adlı uyarı` : 'KALIP TEMİZ'),
    r.error || iss.join(' | ') || `${r.pattern.pieces.length} parça`);
}

// Asimetrik giysi: ayna kısayolu asimetriyi yutmuyor.
{
  const r = await E.draft({ ...BASE, placketStyle: 'asymmetric', exposedZip: 'centerFront' },
    E.bodyForSize('EU38'));
  check('asimetrik pat + görünür fermuar: kalıp ya da adıyla red', !!(r.pattern || r.error));
  if (r.error) check('asimetrik reddi adımlı', sonrakiAdimVarMi(r.error), r.error);
  row('motor', 'asimetrik pat + ön ortası görünür fermuar',
    r.error ? 'ADIYLA RED' : `KALIP ${r.pattern.pieces.length} parça`,
    r.error || (r.issues || []).join(' | ') || 'issues 0');
}
// Negatif mm edit: sessizce 0'a kırpmak yasak. Motorun KENDİ edit programı her
// adımı gerekçesiyle rapor eder (engine/src/patternedit.cpp) — bu kapı o
// gerekçeyi okur, "bir yerde 'kisalt' kelimesi geçiyor" demez.
{
  const r = await E.draft({ ...BASE, editExtendMM: -50 }, E.bodyForSize('EU38'));
  const prog = r.pattern && r.pattern.edit;
  check('negatif uzatmada motor edit programı raporluyor', !!prog, `error=${r.error}`);
  const retler = ((prog && prog.adimlar) || []).filter((a) => a.uygulandi === false && a.ret_gerekcesi);
  check('negatif uzatma sessizce yutulmuyor: en az bir adlı ret', retler.length > 0,
    JSON.stringify((prog && prog.adimlar) || []).slice(0, 200));
  check('negatif uzatmada hiçbir adım UYGULANMADI', (prog && prog.uygulanan) === 0,
    `uygulanan=${prog && prog.uygulanan} reddedilen=${prog && prog.reddedilen}`);
  for (const a of retler) {
    check(`negatif uzatma reddi '${a.parca}' gerekçe taşıyor`, a.ret_gerekcesi.length > 20, a.ret_gerekcesi);
    check(`negatif uzatma reddi '${a.parca}' istenen mm'yi söylüyor`, a.istenen_mm === -50, String(a.istenen_mm));
  }
  row('motor', 'editExtendMM = -50 (negatif uzatma)',
    `ADIYLA RED (${retler.length} adım · uygulanan ${prog && prog.uygulanan})`,
    retler.length ? `${retler[0].sebep} ${retler[0].ret_gerekcesi}` : '(gerekçe YOK)');
}

// ── ÜRÜN: TABLO ─────────────────────────────────────────────────────────────
const OUT = join(ROOT, 'KOSU', 'ciktilar');
mkdirSync(OUT, { recursive: true });
const md = [
  '# EDGE CASE SÜPÜRME TABLOSU (M4-edge)',
  '',
  `üretildi: \`node engine/tests/edge_case_supurme_check.mjs\` · ${new Date().toISOString().slice(0, 10)}`,
  '',
  'YASA: her vaka ya geçerli bir çıktı verir ya **adıyla** reddedilir ve reddin yanında',
  'kullanıcının yapabileceği **sonraki adım** durur. Sessiz çöküş 0, sessiz default 0,',
  'çıkmaz sokak 0. Canlı LLM çağrısı YOK — fotoğraf tarafı sentetik piksel fikstürleri,',
  'etiket tarafı bankalı okuma JSON\'ları, kalıp tarafı sevk edilen wasm baytı.',
  '',
  `**${checked} yargı · ${fails.length} FAIL**`,
  '',
  '| bölüm | vaka | sonuç | kullanıcının gördüğü / kanıt |',
  '|---|---|---|---|',
  ...rows.map((r) => `| ${r.bolum} | ${r.vaka.replace(/\|/g, '\\|')} | ${r.sonuc.replace(/\|/g, '\\|')} | ${String(r.kanit || '').replace(/\|/g, '\\|').slice(0, 400)} |`),
  '',
];
if (fails.length) { md.push('## FAIL', '', ...fails.map((f) => `- ${f}`), ''); }
writeFileSync(join(OUT, 'edge-case-tablosu.md'), md.join('\n'));

// Aynı satırlar, Damla'nın gözüyle bakılacak hâli. Renk TEK bir şey söylüyor:
// yeşil = geçerli çıktı, kırmızı = ADIYLA red (kusur değil, doğru davranış),
// siyah = kapının kırmızısı. Sayı uydurulmuyor: hepsi yukarıdaki koşunun.
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sinifi = (s) => (/RED|ÇÖKTÜ|FAIL/.test(s) ? (/ÇÖKTÜ|FAIL/.test(s) ? 'kara' : 'red') : 'ok');
const html = `<!doctype html><meta charset="utf-8"><title>edge case süpürme — M4-edge</title>
<style>
 body{font:14px/1.5 -apple-system,Inter,Helvetica,sans-serif;margin:0;padding:34px 40px;
      background:#faf8f5;color:#1d2430}
 h1{font-size:26px;margin:0 0 4px;letter-spacing:-.02em}
 .yasa{max-width:96ch;color:#4a5666;margin:0 0 18px}
 .sayac{display:flex;gap:26px;margin:0 0 22px;align-items:baseline}
 .sayac b{font-size:34px;letter-spacing:-.03em}
 .sayac span{color:#5b7089}
 table{border-collapse:collapse;width:100%;background:#fff;
       box-shadow:0 1px 0 #e6e0d8,0 8px 26px rgba(29,36,48,.06)}
 th{text-align:left;font-size:11px;letter-spacing:.09em;text-transform:uppercase;
    color:#8193a6;padding:11px 14px;border-bottom:1px solid #ece6de;background:#fdfcfa}
 td{padding:11px 14px;border-bottom:1px solid #f2ede6;vertical-align:top}
 tr:last-child td{border-bottom:none}
 .bolum{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:#8193a6;white-space:nowrap}
 .vaka{font-weight:600;max-width:34ch}
 .sonuc{white-space:nowrap;font-weight:600}
 .ok .sonuc{color:#1f7a4d} .red .sonuc{color:#a8422c} .kara .sonuc{color:#101418}
 .kanit{color:#41505f;max-width:78ch}
 .ok td{background:#fbfdfc} .red td{background:#fefaf8}
 footer{margin-top:16px;color:#8193a6;font-size:12px}
</style>
<h1>edge case süpürme — M4-edge</h1>
<p class="yasa">Yasa: her vaka ya <b>geçerli bir çıktı</b> verir ya <b>adıyla reddedilir</b> ve reddin
yanında kullanıcının yapabileceği <b>sonraki adım</b> durur. Sessiz çöküş 0, sessiz default 0,
çıkmaz sokak 0. Kırmızı satır bir kusur değil — motorun doğru davranışıdır.
Sıfır canlı LLM çağrısı: fotoğraf tarafı sentetik piksel fikstürleri, kalıp tarafı sevk edilen wasm baytı.</p>
<div class="sayac"><div><b>${checked}</b> <span>yargı</span></div>
<div><b>${fails.length}</b> <span>FAIL</span></div>
<div><b>${rows.length}</b> <span>vaka satırı</span></div>
<div><span>${new Date().toISOString().slice(0, 10)} · <code>node engine/tests/edge_case_supurme_check.mjs</code></span></div></div>
<table><tr><th>bölüm</th><th>vaka</th><th>sonuç</th><th>kullanıcının gördüğü / kanıt</th></tr>
${rows.map((r) => `<tr class="${sinifi(r.sonuc)}"><td class="bolum">${esc(r.bolum)}</td>` +
  `<td class="vaka">${esc(r.vaka)}</td><td class="sonuc">${esc(r.sonuc)}</td>` +
  `<td class="kanit">${esc(String(r.kanit || '').slice(0, 420))}</td></tr>`).join('\n')}
</table>
<footer>kaynak: engine/tests/edge_case_supurme_check.mjs · ctest: edge_case_supurme_check</footer>`;
writeFileSync(join(OUT, 'edge-case-tablosu.html'), html);
console.log(`\nürün: KOSU/ciktilar/edge-case-tablosu.md + .html (${rows.length} satır)`);

console.log(`\nedge_case_supurme_check: ${checked} yargı, ${fails.length} FAIL`);
for (const f of fails) console.log('  ' + f);
process.exit(fails.length ? 1 : 0);
