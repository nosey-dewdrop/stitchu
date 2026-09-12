#!/usr/bin/env node
// gen-vitrin.mjs — THE SHOP WINDOW'S NUMBERS COME OUT OF A TEST RUN, NOT OUT OF
// A WRITER'S HEAD (GECE7 / F9, İŞ 1).
//
// WHY THIS FILE EXISTS. The landing page shipped "photo to spec: 1 of 5 exact,
// 47 of 51 fields" for weeks after the measurement it quotes had been replaced
// twice — once when the answer key stopped being a machine's own labels and
// became a human's (K19), and once when the set grew from five photographs to
// ten. Nobody lied; somebody typed a number and the number aged. This run has
// now paid for that lesson four separate times, so the landing page does not
// get to hold a number of its own any more.
//
// WHAT IT DOES. Runs engine/tests/hedef_kosu.mjs — the ratchet itself, as a
// child process, exactly as ctest runs it — parses the two blocks it prints
// (the sealed n=5 ratchet set and the referee's n=10 target set) and writes
// web/data/vitrin.json. web/index.html renders from that file and carries no
// digits of its own. engine/tests/vitrin_check.mjs re-runs this generator and
// refuses to pass if the shipped file has drifted from what the ratchet prints
// today, so a stale number cannot survive a build.
//
// 🚨 EVERY NUMBER CARRIES ITS OWN `n` (§3.6) AND THE TWO `n`s ARE NEVER MIXED.
// H6's n is different again — it is flat_convention_check's 8-style matrix, not
// this run's photographs — and it is written into the file with that warning
// attached so the page cannot quietly present it as "8 of the ten".
//
// ZERO API CALLS: hedef_kosu reads banked fixtures (§3.9).
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const OUT = join(ROOT, 'web/data/vitrin.json');
// The pages that are allowed to print a generated number. Adding a page here is
// the ONLY way a number gets onto the site; vitrin_check walks the same list.
export const PAGES = ['web/index.html', 'web/benchmark.html'];

export function build() {
  // ⭐ KIRIK CIRCIR DA YAYINLANIR (H3-B, 2026-08-30). Bu çağrı `execFileSync`
  // olduğu için hedef_kosu EXIT 1 verdiğinde fırlatıyordu ve vitrin ÜRETİLMİYORDU
  // — yani cırcır kırıldığı anda sitede DÜNÜN YEŞİL SAYILARI donup kalıyordu.
  // Bu bir koruma değil, gizlemenin ta kendisi: kötüleşen tek sayı, sitenin
  // güncellenmesini durdurarak kendini görünmez yapıyor.
  //
  // Somut vaka: H3 teknik çizimi yüzey hattına bağladı ve H11 (süre) tavanı
  // AŞTI. İlk koşu bunu `r.ms`'ten flat süresini ÇIKARARAK gizlemişti; çıkarma
  // geri alındı, sayı kırmızı, ve artık o kırmızı sayı VİTRİNE de yazılıyor.
  // Kapı gevşemedi — hedef_kosu hâlâ EXIT 1 veriyor ve ctest'te KIRMIZI. Değişen
  // tek şey: vitrin artık BUGÜNÜN sayısını taşıyor, dünün yeşilini değil.
  // Çıktı hiç gelmediyse (koşu çöktü) yine fırlatılır: sayı yoksa vitrin yok.
  let out;
  try {
    out = execFileSync(process.execPath, [join(ROOT, 'engine/tests/hedef_kosu.mjs')],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, cwd: ROOT });
  } catch (e) {
    out = String((e && e.stdout) || '');
    if (!out.trim()) throw e;
    console.log('⚠ hedef_kosu EXIT ' + (e.status ?? '?') + ' verdi (cırcır kırık). ' +
                'Sayılar yine de BU koşudan alınıyor — kırık cırcır sitede dünün yeşilini dondurmaz.');
  }

  // The two blocks are delimited by the ratchet's own headings. Splitting on
  // them rather than scanning the whole text is what keeps the two `n`s apart:
  // both blocks print a line that starts "H1_tamamlanma".
  const iCircir = out.indexOf('CIRCIR SETİ');
  const iHedef = out.indexOf('HEDEF SETİ');
  if (iCircir < 0 || iHedef < 0 || iHedef < iCircir)
    throw new Error('hedef_kosu çıktısında CIRCIR SETİ / HEDEF SETİ blokları bulunamadı');
  const blocks = { n5: out.slice(iCircir, iHedef), n10: out.slice(iHedef) };

  // `H1_tamamlanma          10       n=10  10/10 girdi kalıp+flat üretti`
  const row = (block, key) => {
    const m = new RegExp(`^${key}\\s+(\\S+)\\s+n=(\\d+)\\s+(.*)$`, 'm').exec(blocks[block]);
    if (!m) throw new Error(`${key} satırı ${block} bloğunda yok`);
    return { deger: m[1], n: Number(m[2]), birim: m[3].trim() };
  };

  // `%93 (66/71 alan yargısı)` -> `66/71`
  const kesirOf = (birim) => {
    const m = /\((\d+\/\d+)/.exec(birim);
    if (!m) throw new Error('kesir okunamadı: ' + birim);
    return m[1];
  };

  const H1 = row('n10', 'H1_tamamlanma');
  const H2 = row('n10', 'H2_gorulen_isabet');
  const H3 = row('n10', 'H3_uydurma_alan');
  const H5 = row('n10', 'H5_dikilebilirlik');
  const H6 = row('n10', 'H6_konvansiyon');

  // ⚠ H11 IS DELIBERATELY NOT PUBLISHED AS A MEASURED VALUE. It is a wall-clock
  // median and it moves every run on the same machine (3.0 · 3.2 · 3.7 ms were
  // measured within minutes of each other while this file was written), so a
  // page that printed it would be stale the moment the next run finished and
  // vitrin_check could not tell staleness from jitter. What IS stable is the
  // CEILING the ratchet judges it against, and that ceiling lives in the sealed
  // baseline, so that is what the page is allowed to say.
  const taban = JSON.parse(readFileSync(join(ROOT, 'contract/hedef-kosu-taban.json'), 'utf8'));
  const tavanMs = taban.sayilar.H11_sure_ms.tavan;
  if (typeof tavanMs !== 'number') throw new Error('taban H11 tavanı sayı değil');
  // Aşılma, koşunun KENDİ bastığı satırdan okunur; burada yeniden ölçülmez.
  // ★ VE `n5` BLOĞUNDAN, çünkü cırcırın yargıladığı set MÜHÜRLÜ BEŞLİDİR
  // (contract/hedef-kosu-taban.json). İki blok iki ayrı paydadır ve
  // harmanlanmaz (§3.6): 30 Ağu koşusunda n=5 medyanı 15340.2 ms, n=10 medyanı
  // 6596.4 ms basıyor. Tavanı KIRAN, cırcırın kendi setidir; n=10'dan okumak
  // kırmızıyı yeşil gösterirdi.
  const H11row = row('n5', 'H11_sure_ms');
  const H11asildi = Number(H11row.deger) > tavanMs;

  // The engine's published size set, read from the contract the size picker is
  // built from — not counted by hand.
  const sizes = JSON.parse(readFileSync(join(ROOT, 'contract/layers/shape-ratios.json'), 'utf8')).sizes;

  return {
    _uretildi: 'engine/tools/gen-vitrin.mjs — ELLE YAZILMAZ. Sayılar engine/tests/hedef_kosu.mjs koşusundan gelir.',
    _yasa: [
      'web/index.html BU DOSYADAN okur ve kendi hanesinde tek rakam taşımaz.',
      'engine/tests/vitrin_check.mjs bu üreteci YENİDEN koşturur ve bayat sayıyı KIRMIZI yakar.',
      'HER SAYININ YANINDA n VARDIR (§3.6). İKİ n HARMANLANMAZ: H6 farklı bir paydadan gelir.',
    ],
    kaynak: 'engine/tests/hedef_kosu.mjs',
    H1: { deger: `${H1.deger}/${H1.n}`, n: H1.n, cumle: H1.birim },
    // H2 is published as its raw FRACTION, not as a percentage. Two reasons and
    // both are measured: a percentage hides the denominator (the answer key
    // moved from 51 machine judgements to 42 human ones once already, K19), and
    // "93%" would put a bare number+unit on the page for landing_truth_check's
    // L1 to hunt a provider for, where "66/71" says the same thing and shows the
    // work. Neither the percentage nor the fraction is the headline (F9 İŞ 1.3).
    H2: { deger: `%${H2.deger}`, kesir: kesirOf(H2.birim), n: H2.n, cumle: H2.birim },
    H3: { deger: H3.deger, n: H3.n, cumle: H3.birim },
    H5: { deger: H5.deger, n: H5.n, cumle: H5.birim },
    H6: { deger: H6.deger, n: H6.n, cumle: H6.birim,
          uyari: 'H6 bu koşunun fotoğraflarından gelmez; paydası flat_pattern_agree_check --all\'in '
               + 'dört sınıflık matrisidir (H3, 30 Ağu 2026: kaynak kapı flat_convention_check idi).' },
    // ⭐ TAVANIN AŞILIP AŞILMADIĞI BİR GÜRÜLTÜ DEĞİL, BİR OLGUDUR (H3-B).
    // Ölçülen medyan hâlâ yayınlanmıyor ve gerekçesi aşağıda duruyor — ama
    // "tavan aşıldı mı" sorusunun cevabı bir duvar saati sayısı değil, bir
    // EVET/HAYIR. Aşıldığı hâlde vitrinin yalnız tavanı göstermesi, kötü haberi
    // vitrinden çıkarmak olurdu.
    H11: { tavan_sn: tavanMs / 1000, n: null, asildi: H11asildi,
           cumle: 'hedef_kosu her koşuda medyan çizim süresini ölçer ve bu tavana karşı yargılar'
                + (H11asildi ? ' — BU KOŞUDA TAVAN AŞILDI' : ''),
           uyari: 'ÖLÇÜLEN MEDYAN YAYINLANMAZ: duvar saati sayısıdır, koşudan koşuya oynar, bayatlığı gürültüden ayırt edilemez. Aşılıp aşılmadığı ise oynamaz, o yüzden `asildi` yayınlanır.' },
    beden: { sayi: sizes.length, liste: sizes.join(', '),
             kaynak: 'contract/layers/shape-ratios.json' },
    olcemedim: ['H4', 'H9'],
  };
}

// ── WRITING THE NUMBERS INTO THE PAGE ──────────────────────────────────────
// The page carries `<b data-v="H1.deger">…</b>`; this replaces the element's
// text with today's value and leaves everything else byte-identical.
//
// 🚨 WHY A BUILD STEP AND NOT A `fetch()` AT RUNTIME. web/js/shared-header.js
// rewrites the textContent of every [data-en]/[data-tr] node when the language
// is switched to Turkish, and restores a cached innerHTML in English. A number
// injected at runtime inside such a node is wiped by the first click on TR, and
// a number injected after the cache is taken comes back as a placeholder on the
// way to EN. So the values are written into the file, and the elements that
// hold them are siblings of the bilingual nodes rather than children of them.
export const VPATH = /(<([a-z]+)(?:\s[^<>]*?)?\sdata-v="([A-Za-z0-9_.]+)"(?:\s[^<>]*?)?>)([^<]*)(<\/\2>)/g;
export function fillPage(html, data) {
  const missing = [];
  const filled = [];
  const out = html.replace(VPATH, (_m, open, tag, key, _old, close) => {
    const val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), data);
    if (val === undefined || val === null) { missing.push(key); return _m; }
    filled.push(`${key}=${val}`);
    return `${open}${val}${close}`;
  });
  return { out, missing, filled };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = build();
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  const all = [];
  for (const rel of PAGES) {
    const f = join(ROOT, rel);
    const { out, missing, filled } = fillPage(readFileSync(f, 'utf8'), data);
    if (missing.length) {
      console.error(`${rel}: data-v anahtarı vitrin.json içinde YOK: ` + missing.join(', '));
      process.exit(1);
    }
    writeFileSync(f, out);
    all.push(`${rel} [${filled.join(' · ')}]`);
  }
  console.log('yazıldı: web/data/vitrin.json + ' + PAGES.join(' + '));
  console.log('  data-v: ' + all.join('  '));
  console.log(`  H1 ${data.H1.deger} (n=${data.H1.n}) · H2 ${data.H2.deger} (n=${data.H2.n}) · ` +
    `H5 ${data.H5.deger} (n=${data.H5.n}) · H6 ${data.H6.deger} (n=${data.H6.n}) · H11 tavan ${data.H11.tavan_sn} sn`);
}
