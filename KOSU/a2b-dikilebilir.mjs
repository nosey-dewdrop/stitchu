// a2b-dikilebilir.mjs — 0509 A2b teslimi: KOSU/ciktilar/graf-ilk/dikilebilir.md
// A2 brief: "dikilebilir.md (her dikis cifti iki taraf mm)".
// SAYININ KAYNAGI: engine/build/grafdogrula --json (motorun kendi hukmu); bu script
// hesap YAPMAZ, motorun ciktisini tabloya cevirir. Esikler contract/graf-v1.json'dan
// dogrulayicinin kendi tolerans tablosuyla gelir.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const G = 'KOSU/ciktilar/graf-ilk/graf.json';
const bedenler = ['gercek36', 'croquis36', 'EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44'];
const f2 = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));

function rapor(b) {
  try {
    return JSON.parse(execFileSync('engine/build/grafdogrula', [G, b, '--json'], { maxBuffer: 1 << 26 }).toString());
  } catch (e) {
    // exit 1 = kirmizi var ama rapor YAZILDI; stdout yine JSON.
    if (e.stdout && e.stdout.length) return JSON.parse(e.stdout.toString());
    throw e;
  }
}

const raporlar = bedenler.map((b) => [b, rapor(b)]);
const [, r0] = raporlar[0];
const tol = Object.fromEntries((r0.toleranslar || []).map((t) => [t.ad, t]));

let md = `# Dikilebilirlik — graftan cizime, her dikis cifti iki taraf (0509 A2b)\n\n`;
md += `Kaynak: \`engine/build/grafdogrula <graf.json> <bodyId> --json\` (motorun kendi hukmu). `;
md += `Graf: \`${G}\` (\`${r0.grafId}\`). Bu tablo hesap yapmaz, motorun sayilarini basar.\n\n`;

md += `## Esikler (contract/graf-v1.json)\n\n| tolerans | mm | kaynak |\n|---|---|---|\n`;
for (const t of r0.toleranslar || []) md += `| ${t.ad} | ${f2(t.mm)} | ${String(t.kaynak).slice(0, 220)} |\n`;

md += `\n## SANAL DIKIS — her bedende en kotu artik\n\n`;
md += `\`sanalDikisMM\` = butun dikis ciftlerinin uzunluk artigi ve butun halka kavsak bosluklarinin `;
md += `MUTLAK EN BUYUGU. Esik: dikis \`dikisUzunlukMM\` = ${f2(tol.dikisUzunlukMM?.mm)} mm, `;
md += `halka \`halkaKapanmaMM\` = ${f2(tol.halkaKapanmaMM?.mm)} mm.\n\n`;
md += `| beden | en kotu dikis artigi (mm) | en kotu halka kapanmasi (mm) | sanalDikisMM | esik | hukum | kirmizi |\n|---|---|---|---|---|---|---|\n`;
const seri = [];
for (const [b, R] of raporlar) {
  const dMax = Math.max(0, ...(R.dikisler || []).map((d) => Math.abs(d.artikMM)));
  const hMax = Math.max(0, ...(R.halkalar || []).map((h) => Math.abs(h.kapanmaMM)));
  const s = Math.max(dMax, hMax);
  const esik = Math.min(tol.dikisUzunlukMM?.mm ?? Infinity, tol.halkaKapanmaMM?.mm ?? Infinity);
  const kirmizi = (R.hukumler || []).filter((h) => !h.bilgi && !h.gecti).length;
  seri.push({ beden: b, sanalDikisMM: Number(s.toFixed(4)), esik, kirmizi });
  md += `| ${b} | ${f2(dMax)} | ${f2(hMax)} | **${f2(s)}** | ${f2(esik)} | ${s <= esik ? 'GECTI' : 'KALDI'} | ${kirmizi} |\n`;
}

for (const [b, R] of raporlar) {
  md += `\n## ${b} — dikis ciftleri (iki taraf mm)\n\n`;
  md += `| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |\n|---|---|---|---|---|---|---|---|\n`;
  for (const d of R.dikisler || [])
    md += `| ${d.seam} | ${d.reverse} | ${f2(d.lenA)} | ${f2(d.lenB)} | ${f2(d.hedefA)} | ${f2(d.artikMM)} | ${f2(d.ucBoslukMM)} | ${d.gecti ? 'gecti' : 'KIRMIZI'} |\n`;
  md += `\n### ${b} — halkalar (sanal dikis kapanmasi)\n\n| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |\n|---|---|---|---|---|---|\n`;
  for (const h of R.halkalar || [])
    md += `| ${h.ring} | ${h.role} | ${f2(h.toplamMM)} | ${f2(h.kapanmaMM)} | ${h.enKotuKavsak || '-'} | ${h.gecti ? 'gecti' : 'KIRMIZI'} |\n`;
}

md += `\n## KAPANMAYAN DIKIS\n\n`;
const kapanmayan = [];
for (const [b, R] of raporlar) {
  for (const d of R.dikisler || []) if (!d.gecti) kapanmayan.push(`${b} / dikis ${d.seam}: artik ${f2(d.artikMM)} mm`);
  for (const h of R.halkalar || []) if (!h.gecti) kapanmayan.push(`${b} / halka ${h.ring}: kapanma ${f2(h.kapanmaMM)} mm (${h.enKotuKavsak})`);
}
md += kapanmayan.length
  ? kapanmayan.map((s) => `- ADIYLA KAPANMAYAN: ${s}`).join('\n') + '\n\n**ADIM BITMEDI** (A2 KIRILMA kurali).\n'
  : `Yok: ${raporlar.length} bedende de her dikis cifti ve her halka kavsagi esigin altinda kapaniyor.\n`;

md += `\n## CIZIMDE ADIYLA DURAN KUSUR (A2b, olculdu)\n\n`;
md += `- **Kol, flat gorunumde ACILMIS duruyor.** Kat kenari olmayan panel (kol) yerini `;
md += `dogrulayicinin dikis agaci pozundan alir; o poz kol oyugu dikisini "kitap gibi" acar, `;
md += `yani kol govdenin YANINA yatik cikar, asagi sarkmaz. Dikis olarak DOGRU (kol_oyugu `;
md += `artigi ${'`'}1e-8 mm${'`'}), cizim konvansiyonu olarak EKSIK: satilan flat'te kol govdeye `;
md += `sevkPoz.kolAcisiDeg (contract/flat-convention-v1.json) acisiyla sarkitilir. `;
md += `Bu aciyi baglamak A2c/A4'un isi; burada UYDURULMADI.\n`;
md += `- **Kol yalnizca bir gorunumde.** Kol iki gorunume de girmez; kat kenari olmadigi icin `;
md += `dikis grafindan yayilan tek gorunume (bu grafta ${'`'}cb${'`'}) dusuyor. On gorunumde kol `;
md += `cizilmiyor — sessiz degil, ${'`'}data-gorunum${'`'} ile SVG'de ilan ediliyor.\n`;

writeFileSync('KOSU/ciktilar/graf-ilk/dikilebilir.md', md);
writeFileSync('KOSU/ciktilar/graf-ilk/sanaldikis.json', JSON.stringify({ seri, esikler: r0.toleranslar }, null, 2) + '\n');
console.log(JSON.stringify(seri));
