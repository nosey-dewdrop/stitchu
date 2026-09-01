#!/usr/bin/env node
// prompt_spec_check.mjs — F1 KAPISI: YAZIYLA TARİF → SPEC → KALIP.
//
// Hedef cümlenin yarısı: "fotoğraf + PROMPT → kalıp + flat". Bu kapı, prompt
// hattının dört yasasını ölçer:
//
//   1. ÇEŞİTLİLİK — en az 8 farklı metin, 8 GEÇERLİ spec üretir ve bunlardan
//      en az 6 FARKLI kalıp çıkar (metin motora gerçekten ulaşıyor; tek
//      kalıba çöken bir parser süs olurdu).
//   2. ÖNCELİK — prompt, fotoğraf okumasıyla çatışırsa PROMPT kazanır
//      (kullanıcının açık isteği; create.js'te etiket `soruldu`).
//   3. SESSİZ DÜŞME 0 — parser'ın anlamadığı her kelime ADIYLA raporlanır ve
//      en yakın Edge/Panel/Stitch primitifine işaret eder; her token ya
//      eşleşir, ya bağlaçtır, ya raporludur (hesap toplamı tutar).
//   4. UYDURMA DEĞER 0 — parser'ın bastığı her değer üretilmiş sözlükte
//      (vocab.gen.js) ya da belgeli iki API kolaylığında zaten vardır.
//
// Ek: /api/analyze'in METİN kabul eden hali (backend/analyze-core.js) lokal
// doğrulanır — foto istemi bayt bayt korunur, metin istemi aynı şemayı sorar,
// foto+metin birlikteyken yazının kazandığı modele de söylenir. (Deploy F10.)
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

const { parsePrompt, birlestir } = await import(join(ROOT, 'web/js/prompt-parse.js'));
const { VOCAB, canonical } = await import(join(ROOT, 'web/js/vocab.gen.js'));
const backend = await import(join(ROOT, 'backend/spec-core.js'));
const core = await import(join(ROOT, 'backend/analyze-core.js'));
const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const ok = (m) => console.log('ok   ', m);

// create.js'in kendi default spec'i (satır 165 bloğunun düz kopyası değil,
// motorun tükettiği eksenler): prompt bunun ÜSTÜNE yazılır.
const DEFAULTS = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven',
};
const MEAS = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };

// ---------------------------------------------------------------- 1. ÇEŞİTLİLİK
const PROMPTS = [
  'puf kollu mini elbise',
  'square neckline, long fitted sleeves',
  'pileli midi etek',
  'kolsuz maksi elbise kalp yaka',
  'half circle skirt, mini',
  'boat neck crop top, long fitted sleeves',
  'kruvaze elbise, uzun kollu',
  'prenses balon kollu elbise',
];

const hashes = new Set();
for (const text of PROMPTS) {
  const parsed = parsePrompt(text);
  if (parsed.bos) { fail(`'${text}': parser boş döndü`); continue; }
  // 4. uydurma değer 0: her basılan değer sözlükte zaten var.
  for (const [f, e] of Object.entries(parsed.eksenler)) {
    const legal = VOCAB[f] ? canonical(f, e.value) !== undefined
      : (f === 'ruffle' && ['none', 'single', 'tiered'].includes(e.value)) ||
        (f === 'keyhole' && ['none', 'keyhole'].includes(e.value));
    if (!legal) fail(`'${text}': parser uydurma değer bastı — ${f}='${e.value}'`);
  }
  // 3. hesap: her token ya eşleşti, ya bağlaç, ya adıyla raporlu.
  const h = parsed.hesap;
  if (h.toplam !== h.eslesen + h.stop + h.anlasilmayan) {
    fail(`'${text}': token hesabı tutmuyor (${JSON.stringify(h)})`);
  }
  if (h.anlasilmayan !== 0 && !parsed.anlasilmadi.length) {
    fail(`'${text}': ${h.anlasilmayan} token sessizce düştü (anlasilmadi listesi boş)`);
  }
  const spec = { ...DEFAULTS };
  birlestir(spec, parsed);
  // create.js rebuild() kuralının aynısı: etek olduysa gövde eksenleri ilk
  // seçeneğe döner (motorun reddetmemesi için — tercih değil, dikilebilirlik).
  const v = backend.validateDraftRequest({ spec, measurements: MEAS });
  if (v.error) { fail(`'${text}': validate red — ${v.detail}`); continue; }
  const out = JSON.parse(engine.draftJSON(backend.engineSpec(v.spec), { ...MEAS, upperBust: 0 }));
  if (out.error || !out.pattern) { fail(`'${text}': motor red — ${out.error}`); continue; }
  if (out.issues && out.issues.length) { fail(`'${text}': motor issues ${JSON.stringify(out.issues)}`); continue; }
  const hash = createHash('sha256').update(JSON.stringify(out.pattern)).digest('hex').slice(0, 16);
  hashes.add(hash);
  ok(`'${text}' → ${Object.entries(parsed.eksenler).map(([f, e]) => `${f}=${e.value}`).join(' ')} → kalıp ${hash}`);
}
if (hashes.size < 6) fail(`8 metinden yalnız ${hashes.size} farklı kalıp çıktı (en az 6 gerekir)`);
else ok(`${PROMPTS.length} metin → ${hashes.size} farklı kalıp hashi`);

// ---------------------------------------------------------------- 2. ÖNCELİK
{
  // "Fotoğraf" crew yaka + kolsuz okudu; kullanıcı kare yaka + uzun kol YAZDI.
  const spec = { ...DEFAULTS, neckline: 'crew', sleeveStyle: 'none' };
  const parsed = parsePrompt('square neckline, long fitted sleeves');
  const { degisen } = birlestir(spec, parsed);
  if (spec.neckline !== 'square') fail(`çatışmada prompt kaybetti: neckline=${spec.neckline}`);
  else ok('çatışmada prompt kazandı: crew (foto) → square (yazı)');
  if (spec.sleeveStyle !== 'straight' || spec.sleeveLength !== 'long') {
    fail(`çatışmada kol yazıyı izlemedi: ${spec.sleeveStyle}/${spec.sleeveLength}`);
  }
  if (!degisen.some(([f, once, sonra]) => f === 'neckline' && once === 'crew' && sonra === 'square')) {
    fail('degisen listesi çatışmayı adıyla taşımıyor');
  }
  // create.js kablosu: ingestReading, buildSeenRecord'dan önce uygulaPrompt()
  // çağırır (öncelik fotoğraf SONRA yüklense de korunur). Kaynak metnine bak.
  const src = readFileSync(join(ROOT, 'web/js/create.js'), 'utf8');
  const i = src.indexOf('uygulaPrompt();', src.indexOf('async function ingestReading'));
  const j = src.indexOf('spec.seen = { ...buildSeenRecord');
  if (i === -1 || j === -1 || i > j) fail('create.js: ingestReading içinde uygulaPrompt() buildSeenRecord\'dan önce koşmuyor');
  else ok('create.js: foto sonra gelse de prompt yeniden uygulanıyor (uygulaPrompt < buildSeenRecord)');
}

// ------------------------------------------------- 3. ANLAŞILMAYAN KELİMELER
{
  const parsed = parsePrompt('floral bolero heartneck');
  if (Object.keys(parsed.eksenler).length !== 0) {
    fail(`bilinmeyen metin eksen üretti: ${JSON.stringify(parsed.eksenler)}`);
  }
  if (parsed.anlasilmadi.length !== 3) {
    fail(`3 bilinmeyen kelimeden ${parsed.anlasilmadi.length} raporlandı`);
  }
  for (const u of parsed.anlasilmadi) {
    if (!u.oneri || !/primitif|ekseni/.test(u.oneri)) fail(`'${u.kelime}' önerisiz raporlandı`);
  }
  ok(`bilinmeyen kelimeler adıyla + primitif önerisiyle döndü: ${parsed.anlasilmadi.map((u) => u.kelime).join(', ')}`);
  // Çelişki de sessiz düşmez: iki boy yazılırsa ikincisi adıyla raporlanır.
  const p2 = parsePrompt('mini maxi elbise');
  if (!p2.anlasilmadi.some((u) => /maxi|mini/.test(u.kelime))) {
    fail('aynı eksene ikinci değer sessizce düştü');
  } else ok('aynı eksene ikinci değer adıyla raporlandı (çelişki sessiz değil)');
}

// ------------------------------------- 4. /api/analyze METİN HALİ (LOKAL)
{
  const MODEL = 'claude-opus-4-8';
  // 4a. Foto istemi korunmuş mu: analyze-core'un kurduğu istem, HEAD'deki
  // literalin taşıdığı cümleleri aynen taşımalı (bayt parite ayrıca ölçüldü,
  // rapora yapıştırıldı; burada çapa cümleler kilitlenir).
  const ip = core.imagePrompt();
  for (const anchor of [
    'You are a couture pattern-cutter reading a garment for sewing-pattern drafting.',
    '"outOfVocab":',
    'strapWidthToShoulder = width of one shoulder strap',
  ]) {
    if (!ip.includes(anchor)) fail(`foto istemi çapa cümleyi kaybetti: ${anchor.slice(0, 40)}…`);
  }
  const img = core.buildAnalyzeRequest({ image: 'AAAA', mediaType: 'image/jpeg' }, MODEL);
  if (img.error) fail(`foto isteği reddedildi: ${img.error}`);
  else if (img.body.messages[0].content[1].text !== ip) fail('foto isteği imagePrompt() dışında bir istem taşıyor');
  else ok('foto yolu: istem değişmedi, gövde şekli aynı');

  // 4b. Metin-tek: aynı şema, oranlar null talimatı, kullanıcı metni çitin içinde.
  const txt = core.buildAnalyzeRequest({ text: 'puf kollu mini elbise' }, MODEL);
  if (txt.error) fail(`metin isteği reddedildi: ${txt.error}`);
  else {
    const t = txt.body.messages[0].content[0].text;
    if (txt.body.messages[0].content.length !== 1) fail('metin isteğinde görüntü bloğu var');
    if (!t.includes('"outOfVocab":')) fail('metin istemi aynı şemayı sormuyor');
    if (!t.includes('every ratio is null')) fail('metin istemi oranların ölçülemeyeceğini söylemiyor');
    if (!t.includes('puf kollu mini elbise')) fail('kullanıcı metni isteme girmedi');
    if (txt.body.model !== MODEL || txt.body.max_tokens !== 1100) fail('metin isteği model/max_tokens taşımıyor');
    if (!fails) ok('metin yolu: aynı şema + oran-null talimatı + metin çit içinde');
  }

  // 4c. Foto+metin: yazı kazanır cümlesi istemde.
  const both = core.buildAnalyzeRequest({ image: 'AAAA', text: 'kare yaka' }, MODEL);
  if (both.error) fail(`foto+metin reddedildi: ${both.error}`);
  else if (!both.body.messages[0].content[1].text.includes('the WORDS win')) {
    fail('foto+metin isteminde öncelik cümlesi yok');
  } else ok('foto+metin: yazının kazandığı modele söyleniyor');

  // 4d. Dürüst redler: boş istek 400, taşan metin 413 — sessiz kırpma yok.
  const empty = core.buildAnalyzeRequest({}, MODEL);
  if (empty.error !== 'invalid_request') fail('boş istek adıyla reddedilmedi');
  const long = core.buildAnalyzeRequest({ text: 'x'.repeat(core.TEXT_MAX_CHARS + 1) }, MODEL);
  if (long.error !== 'text_too_long') fail('taşan metin sessizce kırpıldı ya da geçti');
  if (empty.error === 'invalid_request' && long.error === 'text_too_long') ok('redler adıyla: invalid_request / text_too_long');

  // 4e. worker.js kablosu: handleAnalyze artık analyze-core'dan kuruyor, eski
  // inline istem öldü. (worker.js WASM importu yüzünden node'da koşmaz; kablo
  // kaynak metninden doğrulanır, parse hatası ayrı yakalanır.)
  const w = readFileSync(join(ROOT, 'backend/worker.js'), 'utf8');
  if (!w.includes('buildAnalyzeRequest(body, overrideModel || MODEL)')) fail('worker.js analyze-core\'a bağlı değil');
  if (w.includes('const prompt = `You are a couture')) fail('worker.js eski inline istemi hâlâ taşıyor (çift gerçek)');
  try {
    await import(join(ROOT, 'backend/worker.js'));
  } catch (e) {
    if (e instanceof SyntaxError) fail(`worker.js parse edilemiyor: ${e.message}`);
  }
  ok('worker.js: analyze-core kablosu takılı, tek istem kaynağı');
}

if (fails) { console.error(`\nprompt_spec_check FAILED (${fails})`); process.exit(1); }
console.log('\nprompt_spec_check GREEN: 8 metin → geçerli spec → ≥6 farklı kalıp; çatışmada prompt kazanıyor; anlaşılmayan kelime adıyla + primitif önerisiyle; /api/analyze metin hali lokal doğru');
