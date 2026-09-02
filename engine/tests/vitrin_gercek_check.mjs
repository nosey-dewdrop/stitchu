#!/usr/bin/env node
// vitrin_gercek_check.mjs — VİTRİN GERÇEĞİ SÖYLER (F10-vitrin, İŞ 4).
//
// F10'un bulduğu üç yalan sınıfı, üç denetime döndü:
//
//   1. ELLE YAZILMIŞ SAYI. Landing "10 pieces A-LINE DRESS" taşıyordu; motor
//      aynı elbiseye bugün başka sayı veriyor. Artık landing'deki her rakam ya
//      bir üreteç öğesinden gelir (data-v = gen-vitrin.mjs / hedef_kosu,
//      data-motor = gen-landing-motor.mjs / engine.draftJSON) ya da rakam
//      taşıyan iddia bloğu, repoda VAR OLAN bir alet/test adını anar (L1
//      emsali). İzinli jetonlar sayılıdır ve aşağıda adıyla durur.
//   2. BAYAT ÜRETEÇ ÇIKTISI. İki üreteç burada YENİDEN koşar; sevk edilen
//      web/data/*.json, sayfadaki değerler ve web/assets/motor/ çizimleri
//      bugünkü koşuyla bayt bayt aynı olmak zorunda. Elle düzeltilen sayı ve
//      bayatlamış çizim burada yanar.
//   3. ÖLÜ SAYFA / ÖLÜ LİNK. atolye.html ve signature.html silindi ve geri
//      gelemez; iç link sağlığı site-health.mjs'in kendisiyle ölçülür (kapının
//      taklidi değil, aleti). Gizlilik cümlesi de bir vitrin gerçeğidir:
//      fotoğrafın Anthropic API'ye gittiği yükleme ekranında ve gizlilik
//      sayfasında yazılı olmak ZORUNDADIR — "cihazında kalır" yalanı buradan
//      bir daha geçemez.
//
// ⚠ BU KAPI NEYİ BİLMEZ: bir cümlenin doğruluğunu. Bildiği: sayı bugünkü
// üreteç koşusundan mı, ölmesi gereken sayfa öldü mü, olması şart olan cümle
// sayfada mı. exit 0 yeşil · exit 1 ihlal.
//
// SIFIR API ÇAĞRISI: motor wasm + contract okuması, ağ yok.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const fails = [];
const note = [];
const check = (name, cond, detail) => {
  (cond ? note : fails).push(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── 1+2. ÜRETEÇLER YENİDEN KOŞAR, SEVK EDİLEN BUGÜNÜN BAYTI OLMALI ─────────
const LM = await import(join(ROOT, 'engine/tools/gen-landing-motor.mjs'));
let fresh = null;
try { fresh = await LM.build(); }
catch (e) { check('gen-landing-motor.mjs yeniden koşar', false, String(e.message || e)); }
if (fresh) {
  check('web/data/landing-motor.json bugünkü motor koşusuyla bayt-aynı',
    read(LM.OUT_JSON) === JSON.stringify(fresh.data, null, 2) + '\n',
    'elle düzeltilmiş ya da bayatlamış sayı burada yanar');
  for (const [name, svg] of Object.entries(fresh.assets)) {
    const p = join(ROOT, LM.ASSET_DIR, name);
    check(`çizim bugünkü motor çıktısı: ${name}`,
      existsSync(p) && readFileSync(p, 'utf8') === svg,
      'landing görseli motorun bugünkü çizimi olmak zorunda');
  }
  const page = read('web/index.html');
  const { out, missing, filled } = LM.fillPage(page, fresh.data);
  check('landing her data-motor anahtarını üreteçten bulabiliyor',
    missing.length === 0, missing.join(', ') || `${filled.length} anahtar`);
  check('landing bugünkü data-motor değerlerini taşıyor (yeniden basmak no-op)',
    out === page, filled.join(' · '));
  check('landing gerçekten motor sayısı basıyor (boş geçiş yok)',
    filled.length >= 4, `${filled.length} data-motor öğesi`);
}

// ── 1b. LANDING'DE SAĞLAYICISIZ ELLE SAYI = 0 ──────────────────────────────
// İddia blokları: gövde metin düğümleri + data-en/data-tr/alt/title/
// placeholder öznitelikleri. <head>, <style>, <script>, yorumlar ve
// data-v/data-motor taşıyan öğelerin KENDİ metni kapsam dışıdır (onların
// tazeliğini yukarıdaki bayt kıyası zaten yargılıyor).
// İzinli jetonlar (rakam taşıyan ama iddia olmayan): motorun kendi beden
// etiketleri (contract'tan okunur), akış sıra numarası 0N, kâğıt boyu A4/A0,
// DXF sürüm adı R12. Bunların dışında rakam taşıyan her blok, sağlayıcı
// evreninden (CMakeLists add_test adları ∪ engine/tools dosya adları ∪ web
// üreteç/çizer dosya adları) bir ad anmak ZORUNDADIR.
{
  let html = read('web/index.html')
    .replace(/^[\s\S]*?<body[^>]*>/i, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  // data-v / data-motor öğelerinin içeriğini boşalt (tek seviyeli, VPATH deseni)
  html = html.replace(/(<([a-z]+)(?:\s[^<>]*?)?\sdata-(?:v|motor)="[^"]+"(?:\s[^<>]*?)?>)[^<]*(<\/\2>)/g, '$1$3');

  const cmake = read('engine/CMakeLists.txt');
  const providers = new Set(
    [...cmake.matchAll(/add_test\(\s*NAME\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]));
  for (const t of execFileSync('git', ['ls-files', 'engine/tools'],
      { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)) {
    const base = t.split('/').pop();
    if (base.length > 6) { providers.add(base); providers.add(base.replace(/\.[a-z0-9]+$/i, '')); }
  }
  // sayfanın kendi bastığı çizer/üreteç dosyaları da sağlayıcıdır
  ['gen-landing-motor.mjs', 'gen-vitrin.mjs', 'flat-from-pattern.js', 'rehber-tr.js',
   'hedef_kosu', 'vitrin_gercek_check'].forEach((p) => providers.add(p));

  const sizes = JSON.parse(read('contract/layers/shape-ratios.json')).sizes; // EU34..EU48
  // İzinli jeton sırası ÖNEMLİ: uzun aralık yazımı (`EU34–48`) tekil beden
  // etiketlerinden ÖNCE gelir, yoksa `EU34` yenip geriye `–48` rakamı kalır.
  // `n=10` payda işareti izinli: payda, kartın stat satırında adı geçen
  // hedef_kosu koşusunun ilanıdır, skorların kendisi data-v'den basılır.
  // `1 unit = 1 mm` / `1 birim = 1 mm` DXF-AAMA ölçek sözleşmesinin adıdır.
  // Akış numarası 0N, kâğıt A4/A0, DXF R12 iddia değil ad/jetondur.
  const allowRe = new RegExp(
    "(?:EU34–48|EU34['’]?ten EU48['’]?e|EU34 to EU48" +
    '|' + sizes.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') +
    '|1 unit = 1 mm|1 birim = 1 mm' +
    "|\\bn=\\d+\\b|\\b0\\d\\b|\\bA[04]\\b|\\bR12\\b)", 'g');

  const blocks = [];
  for (const m of html.matchAll(/\s(?:data-en|data-tr|alt|title|placeholder|data-en-ph|data-tr-ph)="([^"]*)"/g))
    blocks.push(m[1]);
  for (const m of html.matchAll(/>([^<>]+)</g)) blocks.push(m[1]);

  const suclu = [];
  for (const b of blocks) {
    const kalan = b.replace(allowRe, ' ');
    if (!/\d/.test(kalan)) continue;
    const adAndi = [...providers].some((p) => b.includes(p));
    if (!adAndi) suclu.push(b.trim().slice(0, 90));
  }
  check('landing üzerinde sağlayıcısız elle yazılmış sayı 0',
    suclu.length === 0,
    suclu.length ? suclu.slice(0, 6).join(' ¦ ') : 'her rakamlı blok bir alet adı anıyor ya da izinli jeton');
}

// ── 3a. ÖLÜ SAYFALAR ÖLÜ KALIR ─────────────────────────────────────────────
for (const dead of ['web/atolye.html', 'web/signature.html'])
  check(`ölü sayfa geri gelmedi: ${dead}`, !existsSync(join(ROOT, dead)), 'F10 sildi');
// git grep'in exit 1'i "hiç yok" demektir; execFileSync o durumda fırlatır:
{
  let refs = '';
  try {
    refs = execFileSync('git', ['grep', '-l', '-E', 'atolye\\.html|signature\\.html', '--', 'web'],
      { cwd: ROOT, encoding: 'utf8' });
  } catch { /* eşleşme yok = temiz */ }
  check('web/ içinden ölü sayfaya tek referans yok', refs.trim() === '', refs.trim().split('\n').join(', '));
}

// ── 3b. İÇ LİNK SAĞLIĞI — site-health.mjs'in KENDİSİ ───────────────────────
{
  let out = '', code = 0;
  try {
    out = execFileSync(process.execPath, [join(ROOT, 'engine/tools/site-health.mjs')],
      { encoding: 'utf8' });
  } catch (e) { code = e.status ?? 1; out = String((e.stdout || '') + (e.stderr || '')); }
  check('site-health.mjs exit 0 (ölü iç link 0, sitemap tam, tek ?v)',
    code === 0, out.trim().split('\n').pop());
}

// ── 3c. GİZLİLİK CÜMLESİ: FOTOĞRAF ANTHROPIC'E GİDER, VE BU YAZILI ─────────
check('gizlilik sayfası fotoğrafın sunucu üzerinden Anthropic\'e gittiğini yazıyor',
  /Anthropic/.test(read('web/privacy.html')), 'web/privacy.html');
check('yükleme ekranının kendi metni aynı cümleyi taşıyor (i18n photoprivacy)',
  /photoprivacy/.test(read('web/js/create.js')) &&
  /Anthropic API/.test(read('web/js/i18n.js')), 'create.js + i18n.js');
check('landing fotoğraf için "cihazında kalır" DEMİYOR ve gideceği yeri söylüyor',
  /Anthropic/.test(read('web/index.html')) &&
  !/patterns stay yours|on-device · your/i.test(read('web/index.html')),
  'motor cihazda, görü değil');

// ── 3d. ANA AKIŞ BAĞLI: create + al-dene + showcase landing'den erişilir ───
{
  const index = read('web/index.html');
  for (const p of ['create.html', 'al-dene.html', 'showcase.html'])
    check(`ana akış sayfası landing'den bağlı: ${p}`, index.includes(`href="${p}"`), 'tek giriş, ölü uç yok');
  check('rehber sonuç ekranına kablolu (hakem borcu c)',
    /rehber-tr\.js/.test(read('web/js/create.js')), 'create.js indirme paneli rehber düğmesi');
}

console.log('VİTRİN GERÇEK KAPISI — landing motorun bugünkü çıktısını mı anlatıyor? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log(`\nVİTRİN GERÇEK KAPISI: ${fails.length ? `KIRMIZI — ${fails.length} kalem` : 'YEŞİL'}`);
process.exit(fails.length ? 1 : 0);
