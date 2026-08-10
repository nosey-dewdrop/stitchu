// ============================================================================
// GİYSİ BEL BOLLUĞU ÇÖZÜCÜ (2026-08-10).
// Hedef: 4aec2e5'in taşımadığı silüet karakterini ölçümle geri getirmek.
// Eski onaylı çizimlerin waist/bust'ı AYNI ALETLE (figure-lint waistBust,
// 30fae0e worktree'de) ölçülür → hedef dosyası. Bu script, yeni kalemde stil
// başına contract garment_ease.bel çarpanını o hedefe İKİLİ ARAMAYLA oturtur.
// Ölçüm her iterasyonda TAZE subprocess'te (modül cache kontratı dondurur).
//
// Kullanım:
//   node engine/tools/solve-garment-ease.mjs /tmp/old-figure-targets.txt
// Sadece bugün mandaldan DÜŞEN stiller çözülür; geçenler bayta dokunulmaz.
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTRACT = join(root, 'contract/figure-bands.json');
const LINT = join(root, 'engine/tools/figure-lint.mjs');

// hedefler: eski ağacın figure-lint çıktısı ("ok   <stil>  waist/bust <deger> ...")
const targets = {};
for (const line of readFileSync(process.argv[2], 'utf8').split('\n')) {
  const m = line.match(/^(ok|FAIL)\s+(\S+)\s+waist\/bust\s+([\d.]+)/);
  if (m) targets[m[2]] = Number(m[3]);
}

function measure(style) {
  const out = execFileSync(process.execPath, ['--input-type=module', '-e',
    `const {waistBust}=await import(${JSON.stringify('file://' + LINT)});console.log(await waistBust(process.env.STYLE));`],
    { env: { ...process.env, STYLE: style }, encoding: 'utf8' });
  const v = Number(out.trim());
  if (!Number.isFinite(v)) throw new Error(`${style}: ölçüm sayı dönmedi: ${out}`);
  return v;
}

function setEase(fb, style, m) {
  fb.garment_ease = fb.garment_ease || {};
  fb.garment_ease.bel = fb.garment_ease.bel || {};
  if (m === null) delete fb.garment_ease.bel[style]; else fb.garment_ease.bel[style] = +m.toFixed(4);
  writeFileSync(CONTRACT, JSON.stringify(fb, null, 2) + '\n');
}

const fb = JSON.parse(readFileSync(CONTRACT, 'utf8'));
const M = fb.mandal;
const [bandLo, bandHi] = M.figurel_top_band;
const ST = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8')).styles;

function failsNow(key, wb) {
  const st = ST[key];
  if (key in M.taban_v3) return Math.abs(wb - M.taban_v3[key]) > M.drift_tolerans;
  if (st.boxy) return !(wb > M.boxy_min);
  if (st.garment === 'top') return !(wb >= bandLo && wb <= bandHi);
  return false; // yeni stil: rapora, banda değil
}

const solved = {}, skipped = [], unsolved = [];
for (const key of Object.keys(ST)) {
  const t = targets[key];
  const cur = measure(key);
  if (cur == null || Number.isNaN(cur)) { skipped.push(`${key} (ölçülemez)`); continue; }
  if (!failsNow(key, cur)) { skipped.push(`${key} (geçiyor, dokunulmadı: ${cur})`); continue; }
  if (t === undefined) { unsolved.push(`${key} (eski hedef yok!)`); continue; }
  // ikili arama: wb(m) m ile monoton artar (bel genişledikçe oran büyür)
  let lo = 0.7, hi = 2.5, best = null, bestDev = 1e9;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    setEase(fb, key, mid);
    const wb = measure(key);
    const dev = Math.abs(wb - t);
    if (dev < bestDev) { bestDev = dev; best = mid; }
    if (dev <= 0.002) break;
    if (wb < t) lo = mid; else hi = mid;
  }
  setEase(fb, key, best);
  const finalWb = measure(key);
  solved[key] = { carpan: +best.toFixed(4), hedef: t, olcum: finalWb, sapma: +(finalWb - t).toFixed(4) };
  console.log(`${key.padEnd(36)} hedef ${t}  çözüm m=${best.toFixed(4)}  ölçüm ${finalWb}  sapma ${(finalWb - t).toFixed(4)}`);
}

fb.garment_ease._provenance = {
  ne: 'stil başına giysi BEL çarpanı: eX = cx + (vücut_bel - cx) * çarpan',
  neden: '4aec2e5 boyları taşıdı, silüeti taşımadı; giysi beli vücuda çöktü (figure_check 21 FAIL)',
  hedef_kaynagi: 'eski onaylı kalem 30fae0e, AYNI aletle ölçüm (figure-lint waistBust)',
  yontem: 'solve-garment-ease.mjs ikili arama, tolerans 0.002; geçen stillere dokunulmadı',
  tarih: '2026-08-10',
};
writeFileSync(CONTRACT, JSON.stringify(fb, null, 2) + '\n');
console.log('\nÇÖZÜLDÜ:', Object.keys(solved).length, ' DOKUNULMADI:', skipped.length, ' ÇÖZÜMSÜZ:', unsolved.length);
if (unsolved.length) { console.error('ÇÖZÜMSÜZ:', unsolved.join(', ')); process.exit(1); }
