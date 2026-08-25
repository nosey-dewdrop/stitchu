#!/usr/bin/env node
// landing_truth_check.mjs — SİTE DOĞRULUK KAPISI (kart V10-B, 2026-08-25).
// Node yerleşikleri dışında bağımlılığı YOKTUR. Emsal: engine/tests/docs_truth_check.mjs
// (kart V9-B) — aynı desen: ayrı exit kodu, kayıtlı-borç tabanı, --baseline / --no-baseline.
//
// ═══ NE ÖLÇER (beş denetim, şef tanımladı) ══════════════════════════════════
// Kapsam: `<dir>/**/*.html` + `<dir>/js/*.js`. `<dir>` varsayılan `web`,
// `--dir=<yol>` ile DEĞİŞTİRİLEBİLİR — mutasyon fikstürü `web/` DIŞINDA koşsun diye
// (kart V10-B: "web/ altına TEK BAYT yazma"; paralel işçi aynı anda web/'de yazıyor).
//
// L1 — SAĞLAYICISIZ SAYI. Sayı+birim taşıyan her iddia bloğu, repoda GERÇEKTEN
//      VAR OLAN bir test/alet ADI taşımalı. Sağlayıcı evreni:
//        (a) `engine/CMakeLists.txt`'teki `add_test(NAME …)` adları  ∪
//        (b) `git ls-files engine/tools` dosya adları.
//      ⚠ Kart "`ctest -N` çıktısındaki test adları" diyor. `ctest -N` BİR BUILD
//      DİZİNİ ister; build dizini olmayan temiz bir checkout'ta kapı hüküm
//      veremezdi (V9-B3 taşınabilirlik dersi: varlık sorusu DİSKE sorulmaz).
//      Bu yüzden ad kümesi CMakeLists'ten çıkarılır ve build dizini VARSA
//      `ctest -N` ile KARŞILAŞTIRILIP fark BASILIR (bugün fark 0, aşağıda yazılı).
//      Uydurma ad sağlayıcı SAYILMAZ: küme dışı hiçbir jeton eşleşmez.
//
// L2 — YASAK VAAT + DURAN İDDİA. Kartın verdiği 13 kalıp. Hit SAYISI basılır,
//      taban ratchet'tir (yalnız düşebilir). Bu kapı cümlenin DOĞRU olup
//      olmadığını bilmez; biçimi ölçer.
//
// L3 — VİZYON ZAMANI. Vizyon bölümü `data-vision="1"` ile İŞARETLENİR. İşaretli
//      blok içindeki her cümle gelecek kipinde olmalı; şimdiki zaman fiili ihlal.
//      İşaretsiz blokta vizyon kelimesi (`coming soon` / `roadmap`) geçmesi de ihlal.
//
// L4 — ÖLÜ LİNK. `engine/tools/site-health.mjs` exit 0 ve kırık link 0.
//      Hedef dizinin KENDİ repo kökündeki site-health koşulur (`<dir>/../engine/
//      tools/site-health.mjs`), böylece git worktree fikstüründe de gerçek alet
//      koşar — kapının kendi taklidi değil.
//
// L5 — BEDEN DÜRÜSTLÜĞÜ. Sitede geçen her `EU\d\d` etiketi
//      `contract/layers/shape-ratios.json`'un beden kümesinde OLMALI; ayrıca
//      kullanıcının seçebildiği liste (`web/js/*.js` içindeki `EU_SIZES`) motorun
//      kümesinin ÜSTKÜMESİ olamaz.
//
// ═══ KAÇIŞ GRAMERİ — ADLANDIRILMIŞ, SAYILABİLİR (V10-R §4 / Vale dersi) ═════
// Kaçış bir regex istisnası değil, bir AYRIŞTIRICI meselesidir. Bu kapı ham
// metni taramaz; metni İDDİA BLOKLARINA ayırır:
//   HTML → (i) metin düğümleri, (ii) `data-en/data-tr/alt/title/content/aria-label/
//           placeholder` öznitelik değerleri.
//   JS   → yalnız STRING LİTERALLERİ.
// Kapsam dışı (SKIPPED SCOPE) ve her koşuda SAYISI BASILIR:
//   `<style>`, `<script>` (html içi), `<!-- -->`, SVG `d=`/`points=`/`viewBox=`/
//   `transform=` verisi, JS yorum satırları.
// V9'un dersi: basılıyor ama denetlenmiyorsa o bir GEVŞETMEDİR ve öyle yazılır.
//
// ═══ NE YAKALAMAZ (kapının kendi kusurları — GECE/V10-B.md'de adıyla) ═══════
// · Bir cümlenin DOĞRU olduğunu bilmez. "Alet adı var" ≠ "sayı o aletten çıktı".
// · L1 sağlayıcı eşleşmesi SUBSTRING'dir: `site-health` yazan her blok sağlayıcılı
//   sayılır, o aletin o sayıyı bastığı doğrulanmaz.
// · JS yorumlarındaki iddia hiç görülmez (skipped scope) — kullanıcıya görünmüyor
//   ama bir kaçış kanalıdır; sayısı basılır.
// · `sentence` scope'u NOKTA ile bölünür; `0.5 mm` gibi ondalıklar korunur ama
//   kısaltmalar (`vs.`) yanlış bölebilir → L3'te fazladan cümle doğurur.
//
// exit 0 yeşil · exit 1 İHLAL · exit 3 KAPININ KENDİ ARIZASI (lychee emsali).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const BASELINE = path.join(ROOT, 'engine', 'tests', 'landing-truth-baseline.json');

const EXIT_OK = 0, EXIT_VIOLATION = 1, EXIT_GATE_BROKEN = 3;
const die = (m) => { console.error('GATE ERROR: ' + m); process.exit(EXIT_GATE_BROKEN); };

const argv = process.argv.slice(2);
const WRITE = argv.includes('--baseline');
const NO_BASELINE = argv.includes('--no-baseline');
const NOTE = (argv.find(a => a.startsWith('--note=')) ?? '').slice('--note='.length);
const DIRARG = (argv.find(a => a.startsWith('--dir=')) ?? '').slice('--dir='.length);
const WEB = path.resolve(ROOT, DIRARG || 'web');
if (!fs.existsSync(WEB)) die('hedef dizin yok: ' + WEB);
const WEBROOT = path.resolve(WEB, '..');   // fikstürün kendi repo kökü

// ───────────────────────── dosya kümesi ────────────────────────────────────
const PRUNE = new Set(['.git', 'node_modules', '.vercel', '.wrangler']);
function walk(dir, out = []) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    if (PRUNE.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(WEB, p).split(path.sep).join('/');
const allFiles = walk(WEB).sort();
const htmlFiles = allFiles.filter(p => /\.html$/i.test(p));
const jsFiles = allFiles.filter(p => /\.js$/i.test(p) && rel(p).startsWith('js/'));
if (htmlFiles.length === 0) die('hedef dizinde HİÇ html yok — taranacak şey yok: ' + WEB);

// ───────────────────────── SAĞLAYICI EVRENİ ────────────────────────────────
// Varlık sorusu GİT'e sorulur (git ls-files) — disk okunmaz (V9-B3 dersi).
function gitZ(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean);
  } catch { return null; }
}
const toolPaths = gitZ('git ls-files -z engine/tools');
if (toolPaths === null)
  die('git ls-files koşmadı — sağlayıcı evreni izlenen ağaca sorulamaz. EKSİK YASA ASLA GEÇİŞ DEĞİLDİR.');

const cmakePath = path.join(ROOT, 'engine', 'CMakeLists.txt');
if (!fs.existsSync(cmakePath)) die('engine/CMakeLists.txt yok — test adları çıkarılamaz.');
const testNames = [...fs.readFileSync(cmakePath, 'utf8')
  .matchAll(/add_test\(\s*NAME\s+([A-Za-z0-9_]+)/g)].map(m => m[1]);

const toolNames = toolPaths.map(p => path.posix.basename(p));
const toolStems = toolNames.map(n => n.replace(/\.[a-z0-9]+$/i, ''));
// Kısa jeton yanlış eşleşme doğurur (ör. "nest" kelimesi). Sağlayıcı olarak
// sayılan jeton en az 6 karakter; tam dosya adı (uzantılı) her zaman sayılır.
const PROVIDERS = new Set([
  ...toolNames,
  ...toolStems.filter(n => n.length >= 6),
  ...testNames.filter(n => n.length >= 6),
]);
const EVIDENCE = /(GECE|Logs|reports)\/[^\s"'<]+/;

// `ctest -N` ile KARŞILAŞTIRMA (build dizini varsa) — kart bunu istiyor, ama
// hüküm CMakeLists'ten çıkar; ctest yalnız DOĞRULAR ve farkı BASAR.
let ctestNote = 'ctest -N KOŞULMADI (build dizini yok) — ad kümesi CMakeLists.txt\'ten';
{
  const bdir = path.join(ROOT, 'engine', 'build');
  if (fs.existsSync(path.join(bdir, 'CTestTestfile.cmake'))) {
    const r = spawnSync('ctest', ['--test-dir', bdir, '-N'], { encoding: 'utf8' });
    if (r.status === 0) {
      const ct = [...r.stdout.matchAll(/^\s*Test\s+#\d+:\s+(\S+)\s*$/gm)].map(m => m[1]);
      const onlyCtest = ct.filter(n => !testNames.includes(n));
      const onlyCmake = testNames.filter(n => !ct.includes(n));
      ctestNote = `ctest -N ${ct.length} ad · CMakeLists ${testNames.length} ad · yalnız-ctest ${onlyCtest.length} · yalnız-cmake ${onlyCmake.length}`;
      if (onlyCtest.length) ctestNote += ' [' + onlyCtest.join(',') + ']';
      if (onlyCmake.length) ctestNote += ' [' + onlyCmake.join(',') + ']';
    } else ctestNote = 'ctest -N exit ' + r.status + ' — ad kümesi CMakeLists.txt\'ten';
  }
}

// ───────────────────────── AYRIŞTIRICI: iddia blokları ─────────────────────
// Ham metin taranmaz. HTML metin düğümleri + adlandırılmış öznitelikler; JS
// yalnız string literalleri. Atlanan her scope SAYILIR.
const skipped = { style: 0, script: 0, comment: 0, svgdata: 0, jscomment: 0 };
const TEXT_ATTRS = /\b(data-en|data-tr|alt|title|content|aria-label|placeholder)\s*=\s*"([^"]*)"/gi;
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

// L3'ün ikinci geçişi aynı kaynağı yeniden maskeler; sayaç iki kez artmasın diye
// ölçüm yalnız BİRİNCİ geçişte açıktır (ADLANDIRILMIŞ kusur, gizli değil).
let COUNT_SKIPS = true;
function maskRegion(src, re, counter) {
  return src.replace(re, (m) => { if (COUNT_SKIPS) skipped[counter]++; return m.replace(/[^\n]/g, ' '); });
}

function htmlBlocks(src, file) {
  let s = src;
  s = maskRegion(s, /<style[\s\S]*?<\/style>/gi, 'style');
  s = maskRegion(s, /<script[\s\S]*?<\/script>/gi, 'script');
  s = maskRegion(s, /<!--[\s\S]*?-->/g, 'comment');
  s = maskRegion(s, /\s(?:d|points|viewBox|transform)\s*=\s*"[^"]*"/gi, 'svgdata');
  const out = [];
  // (i) adlandırılmış öznitelik değerleri
  for (const m of s.matchAll(TEXT_ATTRS))
    out.push({ file, line: lineOf(s, m.index), scope: 'attr:' + m[1].toLowerCase(), text: decode(m[2]) });
  // (ii) metin düğümleri: `>` ile `<` arası
  for (const m of s.matchAll(/>([^<>]+)</g)) {
    const t = decode(m[1]);
    if (!t.trim()) continue;
    out.push({ file, line: lineOf(s, m.index), scope: 'text', text: t });
  }
  return out;
}

function decode(t) {
  return t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&[a-z]+;/gi, ' ');
}

// JS: karakter karakter yürü, string literallerini topla, yorumları SAY ve ATLA.
function jsBlocks(src, file) {
  const out = [];
  let i = 0, line = 1;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && src[i + 1] === '/') {
      const j = src.indexOf('\n', i); skipped.jscomment++; i = j < 0 ? n : j; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const j = src.indexOf('*/', i + 2); skipped.jscomment++;
      const seg = src.slice(i, j < 0 ? n : j + 2);
      line += (seg.match(/\n/g) || []).length; i = j < 0 ? n : j + 2; continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const startLine = line; let j = i + 1, buf = '';
      while (j < n) {
        if (src[j] === '\\') { buf += src[j + 1] ?? ''; j += 2; continue; }
        if (src[j] === c) break;
        if (src[j] === '\n') line++;
        buf += src[j]; j++;
      }
      if (buf.trim()) out.push({ file, line: startLine, scope: 'string', text: buf });
      i = j + 1; continue;
    }
    i++;
  }
  return out;
}

const blocks = [];
for (const p of htmlFiles) blocks.push(...htmlBlocks(fs.readFileSync(p, 'utf8'), rel(p)));
for (const p of jsFiles) blocks.push(...jsBlocks(fs.readFileSync(p, 'utf8'), rel(p)));

// ───────────────────────── L1 — sağlayıcısız sayı ──────────────────────────
const NUM_UNIT = /(?:^|[^\w.])\d[\d.,]*\s*(?:mm|cm|%|KB|MB|bytes?|bayt|sayfa|pages?|pieces?|drafts?|sizes?|beden|parça|tests?|checks?|seconds?|ms)\b/i;
function hasProvider(t) {
  if (EVIDENCE.test(t)) return true;
  for (const p of PROVIDERS) if (t.includes(p)) return true;
  return false;
}
function scanL1() {
  const missing = []; let numeric = 0;
  for (const b of blocks) {
    if (!NUM_UNIT.test(b.text)) continue;
    numeric++;
    if (hasProvider(b.text)) continue;
    missing.push({ dosya: b.file, satirNo: b.line, scope: b.scope, satir: b.text.trim().slice(0, 140) });
  }
  return { missing, numeric };
}

// ───────────────────────── L2 — yasak vaat + duran iddia ───────────────────
const BANNED = [
  ['made to measure', /made[- ]to[- ]measure/gi],
  ['your own measurements', /your own measurements/gi],
  ['your measurements', /your (?:exact )?measurements/gi],
  ['no fixed sizes', /no fixed sizes/gi],
  ['custom fit', /custom fit/gi],
  ['bespoke', /bespoke/gi],
  ['ALL PASS', /ALL PASS/g],
  ['byte-identical', /byte[- ]identical/gi],
  ['zero issues', /zero issues/gi],
  ['always', /\balways\b/gi],
  ['never fails', /never fails/gi],
  ['perfect', /\bperfect\b/gi],
  ['0.000000 mm', /0\.000000\s*mm/gi],
  // ── V10-G: kapıdan KAÇMIŞ MTM cümleleri (V10-F "KART DIŞI" md.2/md.4).
  // Bunların hepsi canlı web/ altındaydı ve yukarıdaki 13 kalıbın hiçbirine
  // takılmıyordu. Motorun gerçeği: 8 SABİT beden (contract/layers/shape-ratios.json).
  ['from your body', /from your body/gi],
  ['your seven measurements', /your (?:own )?seven measurements/gi],
  ['sized from your <x>', /sized from your \w+/gi],
  ['not fixed sizes', /not fixed sizes/gi],
  ['per body', /\bper body\b/gi],
  // "drafted per SIZE" DÜRÜST bir cümledir (web/index.html:346) ve motorun
  // gerçeğini söyler; kalıp onu cezalandırmasın diye `size` dışlanır. Bu bir
  // muafiyet DEĞİL, kalıbın kendi tanımı: yasak olan gövdeye/ölçüye göre çizim.
  ['drafted per <non-size>', /drafted per (?!size\b)/gi],
  ['your <ölçü> measurement/girth', /your (?:own )?(?:neck|bust|waist|hip|underbust|arm|body) (?:measurement|girth)s?/gi],
  // ── V10-I: KAPI TEK DİLLİYDİ. Yukarıdaki 18 kalıbın 18'i İNGİLİZCE, ama site
  // İKİ DİLLİ: web/js/shared-header.js:20 her [data-en]/[data-tr] düğümünün
  // innerHTML'ini değiştiriyor, yani `data-tr` CANLI KULLANICI METNİDİR.
  // Hakem ölçtü (GECE/log/V10-hakem.txt "L2'NİN DİL KÖRLÜĞÜ"): İngilizce'de 0
  // iken Türkçe'de 127 yasak duran-iddia YAYINDAYDI. Kalıplar SİLİNMEDİ,
  // EKLENDİ — bu bir sıkılaştırmadır, gevşetme değil.
  // Türkçe sondan eklemelidir: `\b` sonek sınırında güvenilmez, o yüzden
  // kökler sınırsız yazılır (`kusursuz` → `kusursuzca` da yakalanır).
  ['bayt-birebir (TR)', /bayt[- ]birebir/gi],
  ['bayt-aynı (TR)', /bayt[- ]aynı/gi],
  ['bayt bayt aynı (TR)', /bayt bayt aynı/gi],
  ['sıfır hata (TR)', /sıfır hata/gi],
  ['kusursuz (TR)', /kusursuz/gi],
  ['hatasız (TR)', /hatasız/gi],
  ['her zaman (TR)', /\bher zaman\b/gi],
  ['ölçülerinize göre (TR)', /ölçüleriniz[a-zçğıöşü]* göre/gi],
  ['kendi ölçülerinizle (TR)', /kendi ölçülerinizle/gi],
  ['sabit beden yok (TR)', /sabit beden yok/gi],
  ['ısmarlama (TR)', /ısmarlama/gi],
  ['vücudunuza göre (TR)', /vücudunuz[a-zçğıöşü]* göre/gi],
];
function scanL2() {
  const hits = []; const perPattern = {};
  for (const b of blocks) for (const [name, re] of BANNED) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(b.text)) !== null) {
      perPattern[name] = (perPattern[name] || 0) + 1;
      hits.push({ dosya: b.file, satirNo: b.line, kalip: name, satir: b.text.trim().slice(0, 140) });
    }
  }
  return { hits, perPattern };
}

// ───────────────────────── L3 — vizyon zamanı ──────────────────────────────
const VISION_WORD = /coming soon|road ?map|çok yakında|yakında/i;
const FUTURE = /\bwill\b|\bplanned\b|\bgoing to\b|road ?map|\byakında\b|[a-zçğıöşü]+(acak|ecek|acağ|eceğ)/i;
const PRESENT_VERB = /\b(is|are|does|do|has|have|generates?|produces?|drafts?|ships?|runs?|supports?)\b|üretiyor|yapıyor|çiziyor|veriyor/i;
// ★ ADLANDIRILMIŞ MUAFİYET (V10-R §2 C2c) — YOKLUK BEYANI.
// Kaynak, vizyon bloğunun "somut olarak neyin canlı OLMADIĞINI adıyla" saymasını
// ZORUNLU kılıyor. Böyle bir cümle zorunlu olarak ŞİMDİKİ ZAMANDIR
// ("it does not do that today", "none of it is being sold to you today").
// Muafiyetsiz kural, kaynağın İSTEDİĞİ dürüst cümleyi cezalandırırdı — V9-A §2B'nin
// tam olarak uyardığı hata (kapı, doğru davranışı kırmızıya çevirir).
// Muafiyet kuralın içine gömülü DEĞİL: ayrı, adlandırılmış ve her koşuda SAYISI basılır.
const ABSENCE = /\b(not|no|none|never|yet|without|nothing|cannot|can't|isn't|doesn't|don't)\b|\bdeğil\b|\byok\b|\bhenüz\b/i;

// `data-vision="1"` taşıyan öğenin İÇERİĞİ (aynı adlı iç etiketler sayılarak).
function visionRegions(src) {
  const regions = [];
  const re = /<([a-zA-Z][\w-]*)\b[^>]*\bdata-vision\s*=\s*"1"[^>]*>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const tag = m[1];
    if (m[0].endsWith('/>')) { regions.push({ start: m.index, end: re.lastIndex }); continue; }
    let depth = 1, i = re.lastIndex;
    const tre = new RegExp(`<(/?)${tag}\\b`, 'gi');
    tre.lastIndex = i;
    let t;
    while ((t = tre.exec(src)) !== null) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) break;
    }
    regions.push({ start: m.index, end: t ? t.index : src.length });
  }
  return regions;
}

function scanL3() {
  COUNT_SKIPS = false;   // ikinci geçiş: atlanan-scope sayacı DONDURULUR
  const viol = []; let markedBlocks = 0, markedSentences = 0, muafYokluk = 0;
  const seen = new Set();   // aynı cümle data-en + metin düğümü olarak İKİ KEZ gelir
  for (const p of htmlFiles) {
    const src = fs.readFileSync(p, 'utf8');
    const f = rel(p);
    const regions = visionRegions(src);
    markedBlocks += regions.length;
    const inRegion = (idx) => regions.some(r => idx >= r.start && idx < r.end);
    // (a) işaretli blok: her cümle gelecek kipinde olmalı
    for (const r of regions) {
      const seg = src.slice(r.start, r.end);
      const txt = htmlBlocks(seg, f).map(b => b.text).join(' ');
      for (const s of txt.split(/(?<![0-9])[.!?]+(?![0-9])/)) {
        const t = s.trim();
        if (t.length < 12) continue;
        const key = f + '|' + t.replace(/\s+/g, ' ');
        if (seen.has(key)) continue;
        seen.add(key);
        markedSentences++;
        if (FUTURE.test(t)) continue;
        if (!PRESENT_VERB.test(t)) continue;
        if (ABSENCE.test(t)) { muafYokluk++; continue; }   // C2c yokluk beyanı
        viol.push({ dosya: f, satirNo: lineOf(src, r.start), tur: 'isaretli-blokta-simdiki-zaman',
                    satir: t.slice(0, 140) });
      }
    }
    // (b) işaretsiz blokta vizyon kelimesi
    for (const b of htmlBlocks(src, f)) {
      if (!VISION_WORD.test(b.text)) continue;
      const idx = src.split('\n').slice(0, b.line - 1).join('\n').length;
      if (inRegion(idx)) continue;
      const k2 = f + '|un|' + b.text.replace(/\s+/g, ' ');
      if (seen.has(k2)) continue;
      seen.add(k2);
      viol.push({ dosya: f, satirNo: b.line, tur: 'isaretsiz-blokta-vizyon-kelimesi',
                  satir: b.text.trim().slice(0, 140) });
    }
  }
  // js tarafı: vizyon kelimesi hiçbir zaman işaretli olamaz (öznitelik yok)
  for (const b of blocks) {
    if (b.scope !== 'string') continue;
    if (!VISION_WORD.test(b.text)) continue;
    const key = b.file + '|js|' + b.text.replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    viol.push({ dosya: b.file, satirNo: b.line, tur: 'js-stringinde-vizyon-kelimesi',
                satir: b.text.trim().slice(0, 140) });
  }
  return { viol, markedBlocks, markedSentences, muafYokluk };
}

// ───────────────────────── L4 — ölü link (site-health.mjs) ─────────────────
function scanL4() {
  const tool = path.join(WEBROOT, 'engine', 'tools', 'site-health.mjs');
  if (!fs.existsSync(tool))
    return { exit: null, broken: null, note: 'site-health.mjs YOK: ' + tool, out: '' };
  const r = spawnSync(process.execPath, [tool], { encoding: 'utf8', cwd: WEBROOT });
  const out = (r.stdout || '') + (r.stderr || '');
  const broken = (out.match(/^FAIL\b/gm) || []).length;
  return { exit: r.status, broken, note: 'koşuldu: node ' + path.relative(ROOT, tool), out };
}

// ───────────────────────── L5 — beden dürüstlüğü ───────────────────────────
function scanL5() {
  const sp = path.join(ROOT, 'contract', 'layers', 'shape-ratios.json');
  if (!fs.existsSync(sp)) die('contract/layers/shape-ratios.json yok — motorun beden kümesi okunamaz.');
  let engineSizes;
  try { engineSizes = JSON.parse(fs.readFileSync(sp, 'utf8')).sizes; }
  catch (e) { die('shape-ratios.json okunamadı: ' + e.message); }
  if (!Array.isArray(engineSizes) || !engineSizes.length) die('shape-ratios.json `sizes` boş.');
  const known = new Set(engineSizes);

  const badLabels = [];
  for (const b of blocks) for (const m of b.text.matchAll(/\bEU(\d{2})\b/g)) {
    const label = 'EU' + m[1];
    if (known.has(label)) continue;
    badLabels.push({ dosya: b.file, satirNo: b.line, etiket: label, satir: b.text.trim().slice(0, 140) });
  }

  // kullanıcının seçebildiği liste: `EU_SIZES` / `SIZES` dizi literalleri
  const superset = [];
  const lists = [];
  for (const p of jsFiles) {
    const src = fs.readFileSync(p, 'utf8');
    for (const m of src.matchAll(/\b(EU_SIZES|SIZES|SIZE_LIST)\s*=\s*\[([^\]]*)\]/g)) {
      const labels = [...m[2].matchAll(/EU\d{2}/g)].map(x => x[0]);
      if (!labels.length) continue;
      lists.push({ dosya: rel(p), satirNo: lineOf(src, m.index), ad: m[1], n: labels.length });
      for (const l of labels) if (!known.has(l))
        superset.push({ dosya: rel(p), satirNo: lineOf(src, m.index), ad: m[1], etiket: l });
    }
  }
  return { engineSizes, badLabels, superset, lists };
}

// ───────────────────────── koş ─────────────────────────────────────────────
const L1 = scanL1(), L2 = scanL2(), L3 = scanL3(), L4 = scanL4(), L5 = scanL5();
const L4broken = (L4.exit === 0 && L4.broken === 0) ? 0 : (L4.broken ?? 1);

let commit = 'UNKNOWN';
try {
  commit = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch { /* boş */ }

const counts = {
  L1: L1.missing.length, L2: L2.hits.length, L3: L3.viol.length,
  L4: L4broken, L5: L5.badLabels.length + L5.superset.length,
};

if (WRITE) {
  const out = {
    _baslik: 'landing_truth_check TABANI — site doğruluk kapısı (kart V10-B). Kapı: engine/tests/landing_truth_check.mjs (ctest: landing_truth_check). Yeniden kes: node engine/tests/landing_truth_check.mjs --baseline --note="..."',
    _yasa: [
      'Bu taban YALNIZ DÜŞEBİLİR. Herhangi bir L sayısı tabanı AŞARSA kapı KIRMIZI.',
      '★ V9 DERSİ: borç kaydeden taban kapıyı süse çevirir. Aşağıdaki sayılar 0 DEĞİL; her birinin neden 0 olamadığı `_neden0Degil` içinde ADIYLA yazılı (hangi sayı, hangi dosya, hangi kart onaracak).',
      'Kapının kendi arızası (hedef dizin yok, git yok, kontrat yok) exit 3 alır; ihlal exit 1 alır (lychee emsali, V9-R §1 B3). EKSİK YASA ASLA GEÇİŞ DEĞİLDİR.',
      '--no-baseline: tabanı yok sayan HARD-0 kipi; §4.2 kırmızı kanıtı bu kiple alınır (GECE/log/V10-B.red-before.txt).',
      '--dir=<yol>: hedef dizin. Mutasyon fikstürü `web/` DIŞINDA koşar (kart V10-B yasağı: web/ altına tek bayt yazma).',
    ],
    _note: NOTE || 'GEREKÇE YAZILMADI — RULES §4.6 ihlali. Yeniden kes: --note="eski X -> yeni Y, sebep"',
    olcumCommit: commit,
    olcumTarihi: new Date().toISOString().slice(0, 10),
    kapsam: {
      dizin: path.relative(ROOT, WEB) || 'web',
      html: htmlFiles.length, js: jsFiles.length, iddiaBlogu: blocks.length,
      atlananScope: { ...skipped },
      saglayiciEvreni: { testAdi: testNames.length, aletAdi: toolNames.length, eslesebilirJeton: PROVIDERS.size, ctest: ctestNote },
    },
    L1: { taban: counts.L1, sayisalBlok: L1.numeric,
          yontem: 'sayı+birim taşıyan iddia bloğu; blok içinde add_test adı ∪ engine/tools dosya adı ∪ GECE|Logs|reports/ yolu YOKSA sağlayıcısız' },
    L2: { taban: counts.L2, kalipBasina: L2.perPattern },
    L3: { taban: counts.L3, isaretliBlok: L3.markedBlocks, isaretliCumle: L3.markedSentences,
          muafYoklukBeyani: L3.muafYokluk,
          muafiyet: 'ADLANDIRILMIŞ: V10-R §2 C2c vizyon bloğunun neyin canlı OLMADIĞINI saymasını ZORUNLU kılar; böyle bir cümle zorunlu olarak şimdiki zamandır. Muafiyet kurala gömülü değil, ayrı ve SAYILIYOR.' },
    L4: { taban: counts.L4, siteHealthExit: L4.exit, not: L4.note },
    L5: { taban: counts.L5, motorBedenKumesi: L5.engineSizes,
          kacakEtiket: L5.badLabels.length, ustkumeSecim: L5.superset.length,
          secimListeleri: L5.lists },
    _neden0Degil: {
      L1: counts.L1 + ' sağlayıcısız sayısal blok. Kapı ÖLÇER, ONARMAZ; onarım web/ altına yazmayı gerektirir, bu kart web/\'e tek bayt yazamaz. Onaracak kart: V10-C (paralel, web/ onarımı). En yoğun dosyalar kapı çıktısında ADIYLA basılıyor.',
      L2: counts.L2 + ' yasak-vaat hit\'i. Ağırlığı MTM dili ("your own measurements" vb.) — V10-A §1 bunu YALAN diye hükme bağladı (motorun kümesi 8 sabit beden). Onaracak kart: V10-C.',
      L3: counts.L3 + ' vizyon ihlali. Bugün sitede data-vision="1" taşıyan blok SIFIR; yani vizyon dili hiç işaretlenmemiş. Onaracak kart: V10-C.',
      L4: counts.L4 + '. site-health.mjs bugün exit 0 veriyor; bu sayı 0 ise L4 borcu YOKTUR.',
      L5: counts.L5 + '. web/ EU50 ve EU52 etiketlerini taşıyor, contract/layers/shape-ratios.json sizes kümesi 8 beden (EU34–EU48). Zincir V10-A §5\'te satır satır yazılı (web/js/create.js:810 EU_SIZES 10 beden). Onaracak kart: V10-C.',
    },
  };
  fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + '\n');
  console.log('baseline written:', path.relative(ROOT, BASELINE));
  for (const k of ['L1', 'L2', 'L3', 'L4', 'L5']) console.log(`  ${k} taban: ${counts[k]}`);
  process.exit(EXIT_OK);
}

let base = null;
if (!NO_BASELINE) {
  if (!fs.existsSync(BASELINE)) {
    console.error('FAIL: taban yok — ' + path.relative(ROOT, BASELINE));
    die('EKSİK YASA ASLA GEÇİŞ DEĞİLDİR. Bir kez kes: node engine/tests/landing_truth_check.mjs --baseline --note="ilk kesim"');
  }
  try { base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); }
  catch (e) { die('taban okunamadı: ' + e.message); }
  for (const k of ['L1', 'L2', 'L3', 'L4', 'L5'])
    if (typeof base?.[k]?.taban !== 'number') die(`taban dosyasında ${k}.taban yok ya da sayı değil.`);
}
const T = (k) => (NO_BASELINE ? 0 : base[k].taban);

console.log('landing_truth_check — site doğruluk kapısı (kart V10-B)');
console.log('kip           :', NO_BASELINE ? 'HARD-0 (--no-baseline, §4.2 kırmızı kanıtı)' : 'taban kipi');
console.log('commit        :', commit.slice(0, 12));
console.log('hedef dizin   :', path.relative(ROOT, WEB) || 'web', `(${htmlFiles.length} html · ${jsFiles.length} js)`);
console.log('iddia bloğu   :', blocks.length,
  `· ATLANAN SCOPE: style ${skipped.style} · script ${skipped.script} · html-yorum ${skipped.comment} · svg-veri ${skipped.svgdata} · js-yorum ${skipped.jscomment}`);
console.log('sağlayıcı     :', `${testNames.length} test adı + ${toolNames.length} alet adı → ${PROVIDERS.size} eşleşebilir jeton`);
console.log('                ', ctestNote);
console.log();

const SHOW = 25;
console.log('── L1 SAĞLAYICISIZ SAYI ──────────────────────────────────────');
console.log(`  sayı+birim taşıyan iddia bloğu ${L1.numeric} · SAĞLAYICISIZ ${counts.L1} · taban ${T('L1')}`);
{
  const per = {};
  for (const h of L1.missing) per[h.dosya] = (per[h.dosya] || 0) + 1;
  const top = Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [f, n] of top) console.log(`    ${String(n).padStart(4)}  ${f}`);
}
for (const h of L1.missing.slice(0, SHOW)) console.log(`  ORNEK ${h.dosya}:${h.satirNo} [${h.scope}] ${h.satir}`);
if (L1.missing.length > SHOW) console.log(`  … +${L1.missing.length - SHOW} blok daha`);
console.log();

console.log('── L2 YASAK VAAT + DURAN İDDİA ───────────────────────────────');
console.log(`  hit ${counts.L2} · taban ${T('L2')}`);
for (const [n, c] of Object.entries(L2.perPattern).sort((a, b) => b[1] - a[1]))
  console.log(`    ${String(c).padStart(4)}  ${n}`);
console.log();

console.log('── L3 VİZYON ZAMANI ──────────────────────────────────────────');
console.log(`  data-vision="1" blok ${L3.markedBlocks} · işaretli cümle ${L3.markedSentences} · MUAF yokluk-beyanı ${L3.muafYokluk} (V10-R C2c) · İHLAL ${counts.L3} · taban ${T('L3')}`);
for (const h of L3.viol.slice(0, SHOW)) console.log(`  IHLAL ${h.dosya}:${h.satirNo} [${h.tur}] ${h.satir}`);
if (L3.viol.length > SHOW) console.log(`  … +${L3.viol.length - SHOW} daha`);
console.log();

console.log('── L4 ÖLÜ LİNK (site-health.mjs) ─────────────────────────────');
console.log(`  ${L4.note} · exit ${L4.exit} · FAIL satırı ${L4.broken} · sayı ${counts.L4} · taban ${T('L4')}`);
if (counts.L4 !== 0) console.log(L4.out.split('\n').filter(l => /FAIL|OK |checked/.test(l)).slice(0, 20).map(l => '    ' + l).join('\n'));
console.log();

console.log('── L5 BEDEN DÜRÜSTLÜĞÜ ───────────────────────────────────────');
console.log(`  motorun kümesi (contract/layers/shape-ratios.json): ${L5.engineSizes.join(',')}`);
console.log(`  kaçak EU etiketi ${L5.badLabels.length} · üstküme seçim ${L5.superset.length} · toplam ${counts.L5} · taban ${T('L5')}`);
for (const h of L5.superset) console.log(`  USTKUME ${h.dosya}:${h.satirNo} ${h.ad} içinde ${h.etiket} — motorda YOK`);
for (const h of L5.badLabels.slice(0, SHOW)) console.log(`  KACAK   ${h.dosya}:${h.satirNo} ${h.etiket}  ${h.satir}`);
if (L5.badLabels.length > SHOW) console.log(`  … +${L5.badLabels.length - SHOW} daha`);
console.log();

let fail = false;
const lines = [];
for (const k of ['L1', 'L2', 'L3', 'L4', 'L5']) {
  const t = T(k), c = counts[k];
  const bad = c > t;
  if (bad) fail = true;
  lines.push(`${k} ${c}${NO_BASELINE ? '' : `/${t}`}${bad ? ' AŞTI' : (c < t ? ' DÜŞTÜ' : '')}`);
}
console.log('HÜKÜM: ' + (fail ? 'FAIL' : 'YEŞİL') + ' — ' + lines.join(' · '));
if (NO_BASELINE) {
  console.log('HARD-0 kipi: taban yok sayıldı. FAIL, kapının faz-öncesi ONARILMAMIŞ web/ ağacına');
  console.log('karşı KIRMIZI düştüğünün kanıtıdır (kart V10-B §4.2).');
} else if (fail) {
  console.log('Site, tabanın izin verdiğinden fazla sağlayıcısız sayı / yasak vaat / işaretsiz vizyon /');
  console.log('ölü link / motorda olmayan beden taşıyor. Kapı ÖLÇER, ONARMAZ.');
  console.log('Taban yeniden kesilecekse: --baseline --note="eski X -> yeni Y, sebep" (yalnız DÜŞÜŞ için).');
} else {
  console.log('AÇIK BORÇ (kapıyı kırmaz, kayıtlıdır): taban 0 DEĞİL — gerekçesi tabanın `_neden0Degil` alanında.');
}
process.exit(fail ? EXIT_VIOLATION : EXIT_OK);
