#!/usr/bin/env node
// parca_sayisi_check.mjs — F5-parca kapısı: GÖRSELDEKİ KADAR PARÇA.
//
// Motor F5'e kadar A-line kolsuz elbiseye 5 parça veriyordu; fazlalık KOŞULSUZ
// arka fermuar (+ CB dikişiyle ayrı düşen arka etek) ve sayıma giren bias
// şeritti. F5'in kanunu (contract/parca-gecis-v1.json):
//
//   1. GEÇİŞ KURALI — fermuar koşulsuz değil: giysinin en dar geçiş çevresi
//      (yaka açıklığı, örmede streç ile uzamış hâli; elbisede bel geçişi de)
//      baş çevresi referansından (~51cm, theknitwit) darsa fermuar GEREKİR,
//      değilse GEREKMEZ. İki yön de burada yargılanır: dar yakalı dokuma elbise
//      fermuarını sayılı gerekçeyle TUTMAK zorunda.
//   2. HER PARÇA GEREKÇELİ — gerekçesiz parça = hata (koşulsuz parça 0).
//   3. BİTİRME ŞERİTLERİ AYRI SINIF — bias binding / bel bandı `sinif:
//      "bitirme"` taşır: kesim parçası sayımına girmez, listede gerekçesiyle
//      durur.
//
// NOT (bilinçli seçim, uydurma değil): "3 parçalık A-line elbise" ancak geçiş
// kuralı fermuarsız dediğinde çıkar. Ölçüldü: çizilen yaka açıklığı ~36cm, baş
// referansı 51cm — DOKUMA elbise fermuarını tutar (4 kesim parçası, gerekçeli).
// Streç %50 ilan eden ÖRME elbisede açıklık 36 × 1.5 = 54cm ≥ 51cm → fermuar
// düşer → 3 parça. Bu yüzden 3-parça vakası knit + fabricStretchPct 50 ile
// (kataloğun cotton-modal-jersey bandı) yargılanır; dokuma vaka da AYRICA
// yargılanır ki kural silinmiş değil koşullu olduğu kanıtlansın.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const { draft } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));

let fails = 0;
const check = (ok, what) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${what}`);
  if (!ok) fails++;
};

const kesimOf = (d) => d.pattern.pieces.filter((p) => p.sinif !== 'bitirme');
const names = (list) => list.map((p) => p.name).join(' | ');

console.log('parca_sayisi_check — GORSELDEKI KADAR PARCA (F5)');

// ── 1. A-line kolsuz elbise (örme, streç %50 ilanlı) = 3 kesim parçası ──────
{
  const d = await draft({ garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none',
                          fabric: 'knit', fabricStretchPct: 50 });
  check(!d.error, `a-line kolsuz (knit %50): kalip cikti (${d.error || 'ok'})`);
  const kesim = kesimOf(d);
  check(kesim.length === 3, `a-line kolsuz (knit %50) = 3 kesim parcasi (olculen ${kesim.length}: ${names(kesim)})`);
  check(!d.pattern.pieces.some((p) => (p.closure || '').includes('zipper')),
        'fermuar YOK: gecis kurali stretch ile acikligi bas referansinin ustune tasidi');
  const binding = d.pattern.pieces.find((p) => p.sinif === 'bitirme');
  check(!!binding && !!binding.gerekce,
        `bitirme seridi listede ve gerekceli (${binding ? binding.name : 'YOK'})`);
}

// ── 1b. AYNI elbise dokumada fermuarını sayılı gerekçeyle TUTAR ─────────────
{
  const d = await draft({ garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none' });
  const zips = d.pattern.pieces.filter((p) => (p.closure || '').includes('zipper'));
  check(zips.length > 0, 'dokuma a-line: fermuar DURUYOR (yaka 36cm < bas 51cm — kural silinmedi, kosullu)');
  check(zips.every((p) => /fermuar: .*< bas/.test(p.gerekce || '')),
        `dokuma fermuarli parcalar sayili gerekce tasiyor ("${(zips[0] || {}).gerekce || ''}")`);
}

// ── 2. Düz etek = 2 kesim parçası ───────────────────────────────────────────
{
  const d = await draft({ garment: 'skirt', skirtStyle: 'straight' });
  const kesim = kesimOf(d);
  check(kesim.length === 2, `duz etek = 2 kesim parcasi (olculen ${kesim.length}: ${names(kesim)})`);
  const band = d.pattern.pieces.find((p) => p.name === 'Waistband');
  check(!!band && band.sinif === 'bitirme' && !!band.gerekce,
        'bel bandi bitirme sinifinda ve gerekceli (listede duruyor, sayimda degil)');
}

// ── 3. Düz kollu elbise = 4 kesim parçası, kol 1 parça ──────────────────────
{
  const d = await draft({ garment: 'dress', skirtStyle: 'straight', sleeveStyle: 'straight',
                          fabric: 'knit', fabricStretchPct: 50 });
  const kesim = kesimOf(d);
  check(kesim.length === 4, `duz kollu elbise (knit %50) = 4 kesim parcasi (olculen ${kesim.length}: ${names(kesim)})`);
  const sleeves = kesim.filter((p) => p.name.includes('Sleeve'));
  check(sleeves.length === 1, `kol 1 parca (olculen ${sleeves.length})`);
}

// ── 4. HER parça gerekçeli — koşulsuz parça 0 (geniş süpürme) ───────────────
{
  const specs = [
    { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none', fabric: 'knit', fabricStretchPct: 50 },
    { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none' },
    { garment: 'dress', skirtStyle: 'straight', sleeveStyle: 'straight', fabric: 'knit', fabricStretchPct: 50 },
    { garment: 'skirt', skirtStyle: 'straight' },
    { garment: 'skirt', skirtStyle: 'gathered' },
    { garment: 'top', sleeveStyle: 'straight' },
    { garment: 'dress', skirtStyle: 'halfCircle', sleeveStyle: 'none' },
    { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none', shaping: 'princess' },
    { garment: 'dress', skirtStyle: 'straight', sleeveStyle: 'none', backSlit: 'vent' },
  ];
  let gerekcesiz = 0, toplam = 0;
  for (const spec of specs) {
    const d = await draft(spec);
    if (d.error) { console.log(`    (not: ${JSON.stringify(spec)} reddedildi: ${d.error})`); continue; }
    for (const p of d.pattern.pieces) {
      toplam++;
      if (!p.gerekce || !p.gerekce.trim()) {
        gerekcesiz++;
        console.log(`    ✗ gerekcesiz parca: ${p.name}  (${JSON.stringify(spec)})`);
      }
    }
  }
  check(gerekcesiz === 0, `kosulsuz/gerekcesiz parca 0 (${toplam} parca tarandi, ${gerekcesiz} gerekcesiz)`);
}

console.log(fails ? `\nparca_sayisi_check FAIL (${fails})` : '\nparca_sayisi_check PASS');
process.exit(fails ? 1 : 0);
