#!/usr/bin/env node
// ios_zemin_check.mjs — iOS ZEMİNİ KAPISI (2026-09-03).
//
// Damla iOS uygulamasını "aynı arkaplan ve fontlarla" açıyor. O an iki şey
// çatlar: (a) renk/font değerleri iki yerde ayrı ayrı yazılır ve sessizce
// birbirinden uzaklaşır, (b) uygulama API.md'ye bakarak var olmayan (ya da
// başka isimli) bir uca istek atar. Bu kapı ikisini de kilitler.
//
// T1 — web/css/tokens.css contract/design-tokens.json'dan ÜRETİLİR ve diskteki
//      dosyayla BAYT BAYT aynıdır. (Görünüm değişmedi kanıtı: üretilen metin
//      reskin'den beri yayında olan dosyanın kendisi.)
// T2 — App/Stitchu/Tokens.swift aynı contract'tan üretilir, diskle aynıdır ve
//      GEÇERLİ Swift'tir (swiftc -parse; swiftc yoksa yapısal kontrol + açık
//      ATLANDI raporu — sessiz geçiş yok).
// T3 — web/css içindeki her ELLE YAZILMIŞ renk ya bir token değeridir ya da
//      contract.legacy.colors'ta GEREKÇESİYLE ilan edilmiştir. Dosya başına
//      literal sayısı bir CIRCIR: yükselemez (contract.legacy.maxLiteralsPerFile).
// T4 — web/css içindeki her literal font-family yığını contract.fontStacks'ten
//      biridir (tırnak/boşluk/harf duyarsız). Yeni bir yığın = kırmızı.
// T5 — backend/API.md'nin belgelediği her uç backend/worker.js'te GERÇEKTEN
//      yönlendirilir; worker'daki her /api/ ucu ya belgelidir ya da
//      contract.api.undocumented'ta ilan edilmiştir. Belgesiz yeni uç = kırmızı.
//
// Bağımlılık: sadece node yerleşikleri (+ varsa swiftc).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileSync, rmSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const ok = (m) => console.log('ok  :', m);
const note = (m) => console.log('not :', m);

const gen = await import(join(root, 'scripts/gen-design-tokens.mjs'));
const spec = gen.loadTokens();

// ---------------------------------------------------------------- T1: CSS
const cssTarget = join(root, spec.css.target);
const cssRendered = gen.renderCss(spec);
const cssOnDisk = readFileSync(cssTarget, 'utf8');
if (cssRendered !== cssOnDisk) {
  fail(`${spec.css.target} contract'ın çıktısıyla bayt bayt aynı değil — `
    + `\`node scripts/gen-design-tokens.mjs\` ile üret (görünüm değişmiş olabilir)`);
} else {
  ok(`${spec.css.target} contract'tan türüyor (${cssRendered.length} bayt, bayt bayt aynı)`);
}

// ---------------------------------------------------------- T2: Swift çıktı
const swiftTarget = join(root, spec.swift.target);
const swiftRendered = gen.renderSwift(spec);
if (!existsSync(swiftTarget)) {
  fail(`${spec.swift.target} yok — \`node scripts/gen-design-tokens.mjs --swift\``);
} else if (readFileSync(swiftTarget, 'utf8') !== swiftRendered) {
  fail(`${spec.swift.target} contract'tan sapmış — \`node scripts/gen-design-tokens.mjs --swift\``);
} else {
  ok(`${spec.swift.target} contract'tan türüyor (${swiftRendered.length} bayt)`);
}

// Yapısal kontrol: her sabit adı geçerli bir Swift tanımlayıcısı mı, parantezler
// dengeli mi? swiftc olmayan bir makinede de bir şey ÖLÇÜLÜR.
{
  const braces = [...swiftRendered].reduce((n, c) => n + (c === '{') - (c === '}'), 0);
  if (braces !== 0) fail(`üretilen Swift'te süslü parantez dengesiz (${braces})`);
  const idents = [...swiftRendered.matchAll(/static let ([^:\s=]+)/g)].map((m) => m[1]);
  const bad = idents.filter((i) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(i));
  if (bad.length) fail(`üretilen Swift'te geçersiz tanımlayıcı: ${bad.join(', ')}`);
  if (idents.length < 20) fail(`üretilen Swift'te sadece ${idents.length} sabit var — token listesi boşalmış olabilir`);
  if (!bad.length && braces === 0) ok(`üretilen Swift yapısal olarak temiz (${idents.length} sabit)`);
}

// Gerçek sözdizimi kanıtı.
let swiftc = null;
try { swiftc = execFileSync('which', ['swiftc'], { encoding: 'utf8' }).trim(); } catch { /* yok */ }
if (!swiftc) {
  note('swiftc bu makinede YOK — Swift sözdizimi kanıtı ATLANDI (yapısal kontrol koştu)');
} else {
  const tmp = join(tmpdir(), `stitchu-tokens-${process.pid}.swift`);
  writeFileSync(tmp, swiftRendered);
  try {
    execFileSync(swiftc, ['-parse', tmp], { stdio: 'pipe' });
    ok('swiftc -parse geçti — üretilen dosya geçerli Swift');
  } catch (err) {
    fail(`swiftc -parse üretilen Swift'i reddetti:\n${(err.stderr || '').toString().slice(0, 1200)}`);
  } finally {
    rmSync(tmp, { force: true });
  }
}

// ------------------------------------------------- T3/T4: CSS'te elle değer
const cssDir = join(root, 'web/css');
const cssFiles = readdirSync(cssDir).filter((f) => f.endsWith('.css'));
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '');

const tokenValues = new Set();
for (const g of spec.css.groups) for (const t of g.tokens) tokenValues.add(String(t.value).toLowerCase());
const declared = new Set(spec.legacy.colors.map((c) => c.value.toLowerCase()));
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

const generatedCssFile = spec.css.target.split('/').pop();
for (const file of cssFiles) {
  if (file === generatedCssFile) continue; // T1 zaten bu dosyanın tamamını kilitliyor
  const body = stripComments(readFileSync(join(cssDir, file), 'utf8'));
  const hits = (body.match(COLOR_RE) || []).map((v) => v.toLowerCase());
  for (const v of new Set(hits)) {
    if (!tokenValues.has(v) && !declared.has(v)) {
      fail(`${file}: ilansız elle yazılmış renk "${v}" — token yap ya da `
        + `contract/design-tokens.json legacy.colors'a gerekçesiyle ekle`);
    }
  }
  const cap = spec.legacy.maxLiteralsPerFile[file];
  if (cap === undefined) {
    fail(`web/css/${file} contract.legacy.maxLiteralsPerFile'da yok — yeni CSS dosyası ilan edilmeli`);
  } else if (hits.length > cap) {
    fail(`${file}: elle yazılmış renk sayısı ${hits.length} > ilan edilen tavan ${cap} — `
      + `çırçır sadece AŞAĞI döner`);
  }

  // T4 — font yığınları
  const norm = (s) => s.toLowerCase().replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim();
  const allowed = new Set(Object.entries(spec.fontStacks)
    .filter(([k]) => !k.startsWith('$')).map(([, v]) => norm(v)));
  for (const m of body.matchAll(/font-family\s*:\s*([^;}]+)/g)) {
    const stack = m[1].trim();
    if (stack.includes('var(--') || stack === 'inherit') continue;
    if (!allowed.has(norm(stack))) {
      fail(`${file}: ilansız font yığını "${stack}" — contract.fontStacks'e ekle ya da var(--font) kullan`);
    }
  }
}
if (!fails) ok('web/css: ilansız renk yok, ilansız font yığını yok');

// -------------------------------------------------------- T5: API.md ↔ worker
const apiMd = readFileSync(join(root, 'backend/API.md'), 'utf8');
const worker = readFileSync(join(root, 'backend/worker.js'), 'utf8');

// worker'ın gerçekten yönlendirdiği yollar
const workerPaths = new Set();
for (const m of worker.matchAll(/url\.pathname\s*(?:===|\.startsWith\()\s*'([^']+)'/g)) {
  if (m[1].startsWith('/api/') && m[1] !== '/api/') workerPaths.add(m[1]);
}
// API.md'nin başlıklarda ilan ettiği uçlar
const docPaths = new Set(
  [...apiMd.matchAll(/^##\s+(?:GET|POST|PUT|DELETE)\s+(\/api\/\S+)/gm)].map((m) => m[1]),
);

for (const p of docPaths) {
  if (!workerPaths.has(p)) fail(`API.md ${p} ucunu belgeliyor ama worker.js böyle bir yol yönlendirmiyor`);
}
for (const p of spec.api.documented) {
  if (!docPaths.has(p)) fail(`contract ${p} için API.md'de "## POST ${p}" başlığı bekliyor, yok`);
  if (!workerPaths.has(p)) fail(`contract ${p} ucunu belgeli sayıyor ama worker.js'te yok`);
}
const knownUndoc = new Set(spec.api.undocumented.paths);
for (const p of workerPaths) {
  if (!docPaths.has(p) && !knownUndoc.has(p)) {
    fail(`worker.js ${p} ucunu servis ediyor ama ne API.md'de ne de contract.api.undocumented'ta — `
      + `belgesiz uç açılmış`);
  }
}
if (docPaths.size === 0) fail('API.md içinde tek bir "## POST /api/..." başlığı bulunamadı — ayrıştırıcı bozuk');
ok(`API.md ${docPaths.size} uç belgeliyor, worker.js ${workerPaths.size} /api/ yolu yönlendiriyor, hepsi eşleşti`);

if (fails) { console.error(`\nios_zemin_check: ${fails} FAIL`); process.exit(1); }
console.log('\nios_zemin_check: GREEN');
