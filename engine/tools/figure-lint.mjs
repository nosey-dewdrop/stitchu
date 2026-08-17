// ============================================================================
// FIGURE LINT — figür oranı mandalı (FIGURE_BASE turu, 2026-07-22).
// Damla emri: "bir daha kimse fark etmeden boru üretemez." Her styles.json
// stilinin GÖVDE outline'ından waist/bust (bel oyuğu) ölçülür — göz kararı
// değil, <path class="body"> geometrisinden (figur-denetimi v3 metodu:
// bel = profil gerçek en-dar nokta, bust = bel üstü max).
//
// ÜÇ SINIF (contract/figure-bands.json mandal bloğu):
//   figürel TOP  → band [0.72, 0.84] içinde olmalı (boru = FAIL)
//   BOXY         → > 0.93 kalmalı (kasıtlı kutu; figürelleşirse DE FAIL)
//   DRESS/PİNLİ  → taban_v3 değerine ±drift_tolerans kilitli (pin hakikati)
// Bant dışı = exit 1 → ctest figure_check FAIL. Kalıp/draft'a dokunmaz.
// ============================================================================
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderGarmentFlatAsync } from './render-garment-flat.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FB = JSON.parse(readFileSync(join(root, 'contract/figure-bands.json'), 'utf8'));
const ST = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8')).styles;
const M = FB.mandal;

// --- SVG body-path geometri (figur-denetimi v3 metodu, birebir) -------------
function parsePath(d) {
  const toks = d.match(/[MCLQZ]|-?\d+\.?\d*/g) || [];
  const segs = []; let i = 0, cur = [0, 0], start = [0, 0];
  while (i < toks.length) {
    const t = toks[i++];
    if (t === 'M') { cur = [+toks[i++], +toks[i++]]; start = cur.slice(); }
    else if (t === 'L') { const p = [+toks[i++], +toks[i++]]; segs.push(['L', cur, p]); cur = p; }
    else if (t === 'C') { const c1 = [+toks[i++], +toks[i++]], c2 = [+toks[i++], +toks[i++]], p = [+toks[i++], +toks[i++]]; segs.push(['C', cur, c1, c2, p]); cur = p; }
    else if (t === 'Q') { const c = [+toks[i++], +toks[i++]], p = [+toks[i++], +toks[i++]]; segs.push(['Q', cur, c, p]); cur = p; }
    else if (t === 'Z') { segs.push(['L', cur, start]); cur = start.slice(); }
  }
  return segs;
}
function bez(seg, t) {
  if (seg[0] === 'L') { const [, a, b] = seg; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  if (seg[0] === 'Q') { const [, a, c, b] = seg; const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
  const [, a, c1, c2, b] = seg; const u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0],
          u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]];
}
function widthAt(segs, y) {
  let best = null;
  for (const s of segs) {
    const ys = s.slice(1).map((p) => p[1]);
    if (y < Math.min(...ys) - 1 || y > Math.max(...ys) + 1) continue;
    for (let k = 0; k <= 40; k++) { const p = bez(s, k / 40); if (Math.abs(p[1] - y) < 2.5 && (best === null || p[0] > best)) best = p[0]; }
  }
  return best;
}
export async function waistBust(styleKey) {
  const svg = await renderGarmentFlatAsync(null, { referenceStyle: styleKey });
  const m = svg.match(/<path class="body" d="([^"]+)"/);
  if (!m) return null;                                  // band top vs. — gövde path'siz, dürüst atla
  const segs = parsePath(m[1]);
  let lo = 1e9, hi = -1e9;
  for (const s of segs) for (const p of s.slice(1)) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  const H = hi - lo, CX = 240, prof = [];
  for (let f = 0.04; f <= 0.90; f += 0.01) { const x = widthAt(segs, lo + H * f); if (x != null) prof.push({ f, w: x - CX }); }
  if (prof.length < 10) return null;
  const mid = prof.filter((p) => p.f >= 0.10 && p.f <= 0.82);
  let waist = mid[0]; for (const p of mid) if (p.w < waist.w) waist = p;
  const above = prof.filter((p) => p.f >= 0.09 && p.f < waist.f);
  if (!above.length) return null;
  return +(waist.w / Math.max(...above.map((p) => p.w))).toFixed(3);
}

// --- mandal -----------------------------------------------------------------
// CLI koruması (2026-08-10): waistBust artık solve-garment-ease.mjs tarafından
// import ediliyor; import sırasında süitin koşup process.exit basması ölçümü
// öldürüyordu. Doğrudan çalıştırmada davranış birebir aynı.
if (import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1] || '').href) {
let fails = 0;
const [bandLo, bandHi] = M.figurel_top_band;
for (const key of Object.keys(ST)) {
  const st = ST[key];
  const wb = await waistBust(key);
  if (wb == null) { console.log(`  skip ${key} (gövde path yok — band top / ölçülemez)`); continue; }
  let verdict;
  if (key in M.taban_v3) {                               // dress/pinli: drift-lock
    const base = M.taban_v3[key], dev = Math.abs(wb - base);
    verdict = dev <= M.drift_tolerans ? `OK taban ${base} ±${M.drift_tolerans}` : `FAIL drift ${base} → ${wb}`;
  } else if (st.boxy) {                                  // kasıtlı kutu — iki yönlü
    verdict = wb > M.boxy_min ? `OK boxy > ${M.boxy_min}` : `FAIL boxy figürelleşmiş (${wb} ≤ ${M.boxy_min})`;
  } else if (st.garment === 'top') {                     // figürel top: band
    verdict = wb >= bandLo && wb <= bandHi ? `OK band [${bandLo},${bandHi}]` : `FAIL band dışı [${bandLo},${bandHi}]`;
  } else {
    // T17 (17 Ağu): burası KOŞULSUZ "OK" basıyordu. Ölçü alınıyor, ekrana
    // yazılıyor ve HİÇBİR ŞEYLE karşılaştırılmıyordu — 31 stilin 7'si bu
    // daldan geçiyor, yani figure_check'in yeşilinin %23'ü hükümsüzdü. Bu
    // dalda bir stil boruya da dönse kutuya da kaçsa mandal kımıldamıyordu
    // (ölçüldü: dress_bandeau_circle 0.872 — figürel bandın üstünde (0.84),
    // boxy eşiğinin altında (0.93), iki yasanın da dışında, yine "ok").
    // "Bir daha kimse fark etmeden boru üretemez" emri tam burada deliniyordu.
    // Tabansız stil HÜKÜMSÜZDÜR ve hükümsüz yeşil sayılmaz: FAIL.
    // Eşik gevşetilmedi, sınıf taşınmadı, uydurma bant konmadı — eksik olan
    // pinin kendisi, ve pin ölçülen değerden değil KARARDAN gelir (yoksa
    // regen-vs-regen olur: stil kendi çizdiği sayıyı kendine yasa yapar).
    verdict = `FAIL tabansız — figure-bands mandal.taban_v3'te pin yok, hükümsüz`;
  }
  if (verdict.startsWith('FAIL')) fails++;
  console.log(`  ${verdict.startsWith('FAIL') ? 'FAIL' : 'ok  '} ${key.padEnd(32)} waist/bust ${wb}  ${verdict}`);
}
if (fails) { console.error(`\nfigure-lint: ${fails} FAILURE(S) — boru/drift üretildi, mandal düştü`); process.exit(1); }
console.log(`\nOK figure-lint green: bel oyuğu bandları tutuyor (figürel top ${bandLo}-${bandHi}, boxy >${M.boxy_min}, pinli drift ±${M.drift_tolerans})`);
}
