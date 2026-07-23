// TAKLİT MOTORU (2026-07-23, Damla emri: "örneği birebir çiz, %1 hata payı olsun belanı sikerim").
// Bugün Damla besler (103 örnek = öğretmen), yarın motor besler (öğrenilen paramlar birikir).
//
// NE YAPAR: bir örnek flat'in (design_patterns/crops) dış siluetini GROUND-TRUTH alır, motor
// (_engine-full.mjs) parametrelerini o siluete BİREBİR oturtan optimize edici çalıştırır.
// Sapma = bant-bant yarı-genişlik farkının RMS'i (silüet-normalize). %1 altına inene kadar
// koordinat inişi (coordinate descent). Göz-kararı YOK — ölç, düzelt, yakınsa.
//
// ÇIKTI: engine/imitate/learned/<style>.json = oturmuş parametreler + son sapma. Bu birikim
// "yarın motor seni besler" katmanı: yeni giysi geldiğinde en yakın öğrenilmiş paramdan başlar.
//
// KULLANIM: node engine/imitate/imitate.mjs <style> <ornek.png> [nband=16]
//   ör: node engine/imitate/imitate.mjs dress_sweetheart_spag_circle design_patterns/crops/ar-202455-6.png

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { PNG } from './png.mjs';           // küçük PNG decoder (aşağıda; bağımlılık yok)
import * as ref from '../flat-engine/_engine-full.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE + '../../';

// UYARLAMALI EŞİK (2026-07-23 kök bug fix): sabit eşik YANLIŞ — 195 floral'da doğru ama
// kolaj/desenli crop'ta arka planın %85'ini "giysi" sayıyordu (id13 sahte %57 sapma = ölçüm
// bug'ı, motor değil). Otsu: her crop'un histogramını açık-zemin vs koyu-çizgi olarak ayıran
// eşiği HESAPLAR. Böylece hem floral ince kontur hem kolaj temiz ground-truth verir.
function otsuThreshold(gray, W, H) {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < W * H; i++) hist[gray[i]]++;
  const total = W * H;
  let sum = 0; for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0, wB = 0, best = 0, thr = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (wB === 0) continue;
    const wF = total - wB; if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) { best = between; thr = t; }
  }
  // çizgi = eşiğin ALTINDAKI koyu piksel; ama çok gevşemesin (dark oranı > %40 ise kolaj/desen
  // baskın → eşiği düşür, sadece en koyu çizgiyi al). Güvenli tavan: %25 dark.
  let dark = 0; for (let i = 0; i < W * H; i++) if (gray[i] < thr) dark++;
  while (thr > 60 && dark / total > 0.25) { thr -= 5; dark = 0; for (let i = 0; i < W * H; i++) if (gray[i] < thr) dark++; }
  return thr;
}

// --- silüet çıkarımı: bir PNG'nin dark-pikselleri → bant-bant yarı-genişlik profili ---
function halfWidthProfile(gray, W, H, box, nband, ink) {
  const [y0, y1, x0, x1] = box;
  const ch = y1 - y0 || 1;
  const prof = [];
  for (let b = 0; b < nband; b++) {
    const yy = y0 + Math.floor((b + 0.5) / nband * ch);
    let lo = 1e9, hi = -1;
    for (let x = x0; x < x1; x++) { if (gray[yy * W + x] < ink) { if (x < lo) lo = x; if (x > hi) hi = x; } }
    prof.push(hi > lo ? (hi - lo) / 2 / ch : 0);   // torso-boyuna normalize (motor profiliyle aynı taban)
  }
  return prof;
}
function bbox(gray, W, H, xmax, ink) {
  let y0 = 1e9, y1 = -1, x0 = 1e9, x1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < (xmax || W); x++) {
    if (gray[y * W + x] < ink) { if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; }
  }
  return [y0, y1, x0, x1];
}
function rms(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return Math.sqrt(s / a.length); }

// --- motoru bir paramla render → siluet profili, DOĞRUDAN GEOMETRİDEN (Chrome'suz, hızlı) ---
function cub(s, t) { const u = 1 - t, a = u * u * u, B = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * s[0] + B * s[2] + c * s[4] + d * s[6], a * s[1] + B * s[3] + c * s[5] + d * s[7]]; }
function renderMotorProfile(style, params, nband) {
  const p = ref.defaults(style);
  for (const k in params) p[k] = params[k];
  const cx = 240;
  const b = ref.buildHalf(p, cx, false, () => 0.5);   // front yarı geometrisi
  const pts = [];
  for (const s of b.g) if (Array.isArray(s) && s.length >= 8) for (let t = 0; t <= 1; t += 0.04) pts.push(cub(s, t));
  const ys = pts.map(q => q[1]); const y0 = Math.min(...ys), y1 = Math.max(...ys), h = y1 - y0 || 1;
  const prof = [];
  for (let bd = 0; bd < nband; bd++) {
    const yy = y0 + (bd + 0.5) / nband * h;
    const near = pts.filter(q => Math.abs(q[1] - yy) < h / (nband * 1.5));
    const hw = near.length ? Math.max(...near.map(q => Math.abs(q[0] - cx))) : 0;
    prof.push(hw / h);   // torso-boyuna normalize (ölçek-bağımsız, örnekle kıyaslanabilir)
  }
  return prof;
}

// --- ana: coordinate descent, sapma %1 altına inene kadar ---
export function imitate(style, examplePng, nband = 16) {
  const { gray: eg, W: eW, H: eH } = PNG.grayFromFile(examplePng);
  const ink = otsuThreshold(eg, eW, eH);          // her crop'a uyarlanan eşik (kolaj/floral güvenli)
  const ebox = bbox(eg, eW, eH, eW, ink);
  const target = halfWidthProfile(eg, eW, eH, ebox, nband, ink);

  // oturtucunun oynatacağı kollar + aralık (motor param → silüete etki eden)
  const KNOBS = {
    neckWidth:     [0.6, 1.8, 0.04],
    neckDepth:     [6, 40, 1],
    skirtFull:     [1.2, 3.2, 0.04],
    waistNip:      [0.05, 0.5, 0.015],
    bustProject:   [0.2, 0.9, 0.04],
    shoulderSlope: [1.2, 2.0, 0.04],
    bustHeight:    [0.15, 0.6, 0.03],   // korsaj bust hattı yüksekliği
    yokeDrop:      [8, 20, 0.5],        // bel çizgisi yüksekliği (korset bel)
    hemDip:        [0, 5, 0.3],         // hem eğrisi
    armholeHollow: [0.06, 0.22, 0.015], // koltukaltı/korsaj yan
  };
  const FINE_PASSES = 2;               // yakınsama sonrası adım yarıya inip ince ayar
  let params = {}; for (const k in KNOBS) params[k] = ref.defaults(style)[k];
  let cur = renderMotorProfile(style, params, nband);
  let err = rms(cur, target);
  const HATA = 0.01;   // %1

  const scale = {}; for (const k in KNOBS) scale[k] = 1;   // her kolun adım çarpanı (yerel min'de yarılanır)
  let refine = 0;
  for (let pass = 0; pass < 120 && err > HATA; pass++) {
    let improved = false;
    for (const k in KNOBS) {
      const [lo, hi, step] = KNOBS[k];
      for (const dir of [+1, -1]) {
        const nv = Math.max(lo, Math.min(hi, params[k] + dir * step * scale[k]));
        if (Math.abs(nv - params[k]) < 1e-6) continue;
        const trial = { ...params, [k]: nv };
        const e2 = rms(renderMotorProfile(style, trial, nband), target);
        if (e2 < err - 1e-5) { params = trial; err = e2; improved = true; }
      }
    }
    if (!improved) {
      // yerel minimum: TÜM adımları yarıla, ince aramaya geç (max 6 kez → 64× hassasiyet)
      if (refine++ >= 6) { console.log(`  pass ${pass}: sapma=${(err * 100).toFixed(2)}% (ince arama bitti)`); break; }
      for (const k in KNOBS) scale[k] *= 0.5;
    }
    console.log(`  pass ${pass}: sapma=${(err * 100).toFixed(2)}%${refine ? ' [ince ' + refine + ']' : ''}`);
  }

  const ok = err <= HATA;
  const outDir = HERE + 'learned';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/${style}.json`, JSON.stringify({ style, examplePng, params, sapma: err, ok, ts: '2026-07-23' }, null, 1));
  return { ok, err, params };
}

if (process.argv[1] && process.argv[1].endsWith('imitate.mjs')) {
  const [, , style, png, nb] = process.argv;
  const r = imitate(style, png, nb ? +nb : 16);
  console.log(r.ok ? `OTURDU: sapma ${(r.err * 100).toFixed(2)}% (<=1%)` : `OTURMADI: sapma ${(r.err * 100).toFixed(2)}% (>1%, hata payı aşıldı)`);
}
