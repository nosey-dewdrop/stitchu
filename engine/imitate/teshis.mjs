// ARIZA KATMANI TEŞHİS (2026-07-23, Damla emri: "103 hedefin her biri için, çizilemiyorsa/
// kötü çiziliyorsa hata HANGİ KATMANDA — iddia değil kanıt").
//
// Bir hedef 4 katmandan SIRAYLA geçer; ilk BAŞARISIZ katman kök-neden etiketidir (üstteki
// katman bozuksa alttakini ölçmenin anlamı yok — JSON yanlışsa router/flat/kalıp zaten çöp).
//
//   1) JSON   — spec motorun enum'uyla ifade edilebilir mi? garment ∉ {skirt,dress,top}
//               (trousers / romper=other) ya da neckline/skirtStyle motorda YOK = kapsam-dışı.
//               beyondEngine[] motorun enum'la çizemediği görsel özelliklerin listesi (bilgi).
//   2) ROUTER — spec doğru ama motor yanlış stile mi düşürüyor? Tam styleKey var mı (yakin=false),
//               yoksa fallback mı? Ve aday havuzu denenince BELİRGİN daha iyi (>=%3) bir eşleşme
//               çıkıyor mu — çıkıyorsa router KÖR (ilk tahmini en iyisi değil).
//   3) FLAT   — en iyi/doğru stil seçildi ama sapma > %10 = motorun o şekli çizen yeteneği yok.
//   4) KALIP  — flat oturdu (<= %10) ama o hedefin spec'i dikilebilir kalıba (WASM draftJSON)
//               dönüşemiyor mu (engine error / validator issue) = kalıp katmanı arızası.
//   TEMIZ    — 4 katman da geçti (sapma <= %10 ve kalıp temiz).
//
// ÇIKTI: engine/imitate/teshis-rapor.json — her katmanda kaç hedef, hangi ID'ler, en çok
// tekrarlayan kök-neden, en yüksek kaldıraçlı tek düzeltme.
//
// KULLANIM: node engine/imitate/teshis.mjs [limit]
// SALT-OKUR: motor C++'a / styles.json'a / contract'a DOKUNMAZ, yeni dosya üretir.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { imitate } from './imitate.mjs';
import * as ref from '../flat-engine/_engine-full.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE + '../../';

// --- katman eşikleri ---
const FLAT_KOTU = 0.10;   // sapma > %10 = motor şekli çizemiyor (FLAT arızası)
const ROUTER_KOR = 0.03;  // en iyi aday, ilk/tam adayı >= %3 geçiyorsa router kör
const NBAND = 16;

// --- motor enum'ları (web/js/vocab.gen.js'ten okunur; TEK KAYNAK, elle liste yok) ---
const VOCAB = (await import('../../web/js/vocab.gen.js')).VOCAB;
const enumVals = (f) => (VOCAB[f] ? VOCAB[f].values : []);
const GARMENTS = new Set(enumVals('garment'));       // skirt, dress, top
const NECKLINES = new Set(enumVals('neckline'));
const SKIRTS = new Set(enumVals('skirtStyle'));

// --- WASM motoru (KALIP katmanı testi için; full-scan-27.mjs ile aynı yükleme) ---
const require2 = createRequire(import.meta.url);
const engine = await require2(ROOT + 'engine/dist/stitchu-engine.js')();

// spec → WASM'ın kabul ettiği isimli-nesne (engineSpec'in özet kopyası; enum-string alanları
// motorun default'una düşer, yalnız garment/neckline/skirt/shaping/waistline yapısal alanlar
// KALIP katmanının ne çizeceğini belirler — geri kalan detay enum'ları KALIP testinde 0/default,
// çünkü bu test "yapısal siluet kalıba dönüyor mu" sorusudur, süsleme değil).
function engineSpecFor(spec) {
  const s = spec || {};
  const g = GARMENTS.has(s.garment) ? s.garment : 'dress';
  const nl = NECKLINES.has(s.neckline) ? s.neckline : 'crew';
  const sk = SKIRTS.has(s.skirtStyle) ? s.skirtStyle : 'aLine';
  const shp = (s.shaping === 'princess' || s.shaping === 'dart') ? s.shaping : 'dart';
  const wl = (s.waistline === 'empire' || s.waistline === 'natural') ? s.waistline : 'natural';
  return {
    garment: g, shaping: shp, waistline: wl, fabric: 'woven',
    neckline: nl, sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: sk, skirtLength: 'midi', topLength: 'hip',
    ruffleHem: false, ruffleTiers: 1, keyhole: false, frontPlacket: false,
    tieClosure: 0, sleeveCap: 0, collarType: 0, collarEdge: 0, gatherType: 0,
    gatherZone: 0, backOpening: 0, backSlit: 0, ruffledStraps: 0, peplum: 0,
    placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
    shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
  };
}
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36, upperBust: 0 };

// KALIP testi: draftJSON hatasız + validator-temiz mi?
function kalipTest(spec) {
  let mapped;
  try { mapped = engineSpecFor(spec); } catch (e) { return { ok: false, kanit: 'map-hata: ' + String(e).slice(0, 60) }; }
  let out;
  try { out = JSON.parse(engine.draftJSON(mapped, BODY)); }
  catch (e) { return { ok: false, kanit: 'engine-throw: ' + String(e).slice(0, 60) }; }
  if (out.error) return { ok: false, kanit: 'refused: ' + String(out.error).slice(0, 60) };
  if (out.issues && out.issues.length) return { ok: false, kanit: 'validator: ' + String(out.issues[0]).slice(0, 60) };
  const n = out.pattern && out.pattern.pieces ? out.pattern.pieces.length : 0;
  return { ok: n > 0, kanit: n > 0 ? `${n} parça` : 'parça yok', pieces: n };
}

// --- ROUTER: tur.mjs'in styleKeyFor + candidateStyles KOPYASI (tur davranışını birebir yansıt) ---
function styleKeyFor(spec) {
  const s = spec || {};
  const nl = s.neckline, garment = s.garment, skirt = s.skirt || s.skirtStyle, shaping = s.shaping;
  const sleeve = s.sleeveStyle && s.sleeveStyle !== 'none';
  const circle = skirt === 'fullCircle' || skirt === 'halfCircle' || skirt === 'circle';
  const wrap = (s.closure && (s.closure.type === 'wrap' || s.closure === 'wrap')) || s.wrapFront;
  const tieBack = s.backDetail === 'tieBack' || (s.closure && s.closure.location === 'back');
  const strapType = (s.straps && (s.straps.type || s.straps)) || s.strapType;
  const gathered = skirt === 'gathered';
  if (garment === 'dress') {
    if (nl === 'boat' && tieBack) return 'dress_boat_aline_tieback';
    if (nl === 'vNeck' && wrap) return 'wrap_dress';
    if (nl === 'square' && shaping === 'princess' && circle) return 'dress_square_princess_circle';
    if (nl === 'boat' && shaping === 'princess' && circle) return 'dress_boat_princess_circle';
    if (nl === 'sweetheart' && shaping === 'princess' && circle && strapType === 'spaghetti') return 'dress_sweetheart_spag_circle';
    if (nl === 'sweetheart' && shaping === 'princess' && circle) return 'dress_sweetheart_princess_circle';
    if (nl === 'vNeck' && gathered && sleeve) return 'dress_vneck_gathered';
    if ((nl === 'scoop' || nl === 'crew') && shaping === 'princess') return s.length === 'midi' ? 'dress_princess_scoop_aline_midi' : 'dress_princess_scoop_aline';
  }
  return null;
}
function candidateStyles(spec, exact, maxK = 8) {
  const s = spec || {};
  const norm = { neckline: s.neckline === 'vNeck' ? 'v' : s.neckline, shaping: s.shaping, garment: s.garment,
                 skirt: s.skirt || s.skirtStyle };
  const keys = Object.keys(ref.STYLE).filter(k => !k.startsWith('_'));
  const scored = keys.map(k => {
    const st = ref.STYLE[k]; let sc = 0;
    if (st.garment === norm.garment) sc += 4; else sc -= 2;
    if (st.neckline === norm.neckline) sc += 3;
    if (st.shaping && st.shaping === norm.shaping) sc += 2;
    if (st.corset && s.shaping === 'princess') sc += 1;
    return { k, sc };
  }).sort((a, b) => b.sc - a.sc);
  const out = [];
  if (exact && ref.STYLE[exact]) out.push(exact);
  for (const c of scored) { if (out.length >= maxK) break; if (!out.includes(c.k)) out.push(c.k); }
  return out;
}

// sessiz imitate (imitate.mjs pass'leri console.log basar → sarıp sustur)
function imitateQuiet(style, crop) {
  const orig = console.log; console.log = () => {};
  try { return imitate(style, crop, NBAND); }
  finally { console.log = orig; }
}

// --- ana tur ---
const limit = process.argv[2] ? +process.argv[2] : Infinity;
const targets = JSON.parse(readFileSync(ROOT + 'contract/hedef-giysiler.json')).targets;

const rows = [];
let done = 0;
for (const t of targets) {
  if (done >= limit) break;
  const spec = t.spec || {};
  const row = { id: t.id, label: t.label, katman: null, kanit: null, detay: {} };

  // ---- KATMAN 1: JSON (kapsam-dışı yapısal enum) ----
  const gOk = GARMENTS.has(spec.garment);
  const nlOk = spec.neckline == null || NECKLINES.has(spec.neckline);   // null = motor default'u, kapsam-içi
  const skOk = spec.skirtStyle == null || SKIRTS.has(spec.skirtStyle);
  if (!gOk) {
    row.katman = 'JSON';
    row.kanit = `garment='${spec.garment}' motor enum'unda yok (geçerli: ${[...GARMENTS].join('/')})`;
    row.detay = { garment: spec.garment };
    rows.push(row); done++; process.stdout.write(`id${t.id}\tJSON\t${row.kanit}\n`); continue;
  }
  if (!nlOk || !skOk) {
    row.katman = 'JSON';
    const bad = [];
    if (!nlOk) bad.push(`neckline='${spec.neckline}'`);
    if (!skOk) bad.push(`skirtStyle='${spec.skirtStyle}'`);
    row.kanit = `${bad.join(', ')} motor enum'unda yok`;
    row.detay = { neckline: spec.neckline, skirtStyle: spec.skirtStyle };
    rows.push(row); done++; process.stdout.write(`id${t.id}\tJSON\t${row.kanit}\n`); continue;
  }

  // örnek crop (JSON geçenler için ROUTER/FLAT ölçümü lazım)
  let crop = null;
  for (const c of (t.crops || [])) { const p = ROOT + 'design_patterns/crops/' + c.replace('-alt', ''); if (existsSync(p)) { crop = p; break; } }

  // ---- KATMAN 4 hazırlığı: KALIP testi (crop'tan bağımsız, spec'ten) ----
  const kalip = kalipTest(spec);

  if (!crop) {
    // Crop yok → ROUTER/FLAT ölçülemez. KALIP yine de ölçüldü: kalıp bozuksa KALIP, değilse crop-yok.
    if (!kalip.ok) {
      row.katman = 'KALIP'; row.kanit = kalip.kanit; row.detay = { kalip };
    } else {
      row.katman = 'CROP-YOK'; row.kanit = 'emsal görsel yok → router/flat ölçülemedi (kalıp temiz)'; row.detay = { kalip };
    }
    rows.push(row); done++; process.stdout.write(`id${t.id}\t${row.katman}\t${row.kanit}\n`); continue;
  }
  done++;

  // ---- KATMAN 2 + 3: ROUTER + FLAT (deneyip-ölçen) ----
  const exact = styleKeyFor(spec);
  const cands = candidateStyles(spec, exact);
  const trials = [];
  for (const style of cands) {
    try { const r = imitateQuiet(style, crop); trials.push({ style, err: r.err, ok: r.ok }); }
    catch { /* bu aday çizemedi */ }
  }
  if (!trials.length) {
    // hiçbir aday çizemedi → flat yeteneği yok say (FLAT), ama kalıp bozuksa KALIP öne geçer
    if (!kalip.ok) { row.katman = 'KALIP'; row.kanit = kalip.kanit; }
    else { row.katman = 'FLAT'; row.kanit = 'hiçbir aday stil bu siluete çizemedi'; }
    row.detay = { kalip, cands };
    rows.push(row); process.stdout.write(`id${t.id}\t${row.katman}\t${row.kanit}\n`); continue;
  }
  trials.sort((a, b) => a.err - b.err);
  const best = trials[0];
  // ilk aday = havuzun ilk sırası (tam styleKey varsa o, yoksa en-benzer). Router bunu seçerdi.
  const firstPick = trials.find(x => x.style === (exact || cands[0])) || trials[0];
  const yakin = best.style !== exact;                       // gerçek styleKey yok (fallback)
  const routerBlind = (firstPick.err - best.err) > ROUTER_KOR;   // ilk seçim en iyisi değil

  row.detay = {
    bestStyle: best.style, bestSapma: +(best.err * 100).toFixed(2),
    firstStyle: firstPick.style, firstSapma: +(firstPick.err * 100).toFixed(2),
    exact: exact || null, yakin, routerBlind, denenen: trials.length,
    kalip: { ok: kalip.ok, kanit: kalip.kanit },
  };

  // Karar sırası: ROUTER kör mü (VE düzeltince iyi çizim çıkıyor mu) → yoksa FLAT sapması →
  // yoksa KALIP → yoksa TEMİZ. KRİTİK: router yalnızca en iyi aday KABUL edilebilir çizdiğinde
  // (best <= %10) suçlanır — çünkü o zaman doğru stili seçmek gerçekten iyi kalıp verir. En iyi
  // aday bile %10 üstündeyse routing'i düzeltmek çözmez; kök-neden FLAT'tir (motor şekli çizemiyor).
  if (routerBlind && best.err <= FLAT_KOTU) {
    row.katman = 'ROUTER';
    row.kanit = `ilk seçim ${firstPick.style} %${(firstPick.err * 100).toFixed(2)} ama ${best.style} %${(best.err * 100).toFixed(2)} → router ${((firstPick.err - best.err) * 100).toFixed(2)}pt daha iyisini kaçırıyor (düzeltince kabul edilebilir çizim)`;
  } else if (best.err > FLAT_KOTU) {
    row.katman = 'FLAT';
    row.kanit = `en iyi stil ${best.style} sapma %${(best.err * 100).toFixed(2)} > %${FLAT_KOTU * 100} → motor bu şekli çizemiyor${yakin ? ' (gerçek stil eksik, fallback)' : ''}${routerBlind ? ' (router da kör ama düzeltmek yetmez)' : ''}`;
  } else if (!kalip.ok) {
    row.katman = 'KALIP';
    row.kanit = `flat oturdu (%${(best.err * 100).toFixed(2)}) ama draftJSON: ${kalip.kanit}`;
  } else {
    row.katman = 'TEMIZ';
    row.kanit = `flat %${(best.err * 100).toFixed(2)} + kalıp ${kalip.kanit}`;
  }
  rows.push(row);
  process.stdout.write(`id${t.id}\t${row.katman}\t${row.detay.bestStyle} %${row.detay.bestSapma}${yakin ? '~' : ''}${routerBlind ? ' [KÖR]' : ''}\n`);
}

// --- RAPOR ---
const byLayer = {};
for (const r of rows) { (byLayer[r.katman] ||= []).push(r.id); }

// En sık kök-neden: JSON katmanında hangi garment, FLAT'te hangi eksik-yetenek (beyondEngine)
const jsonRoot = {};
for (const r of rows) if (r.katman === 'JSON') { const k = r.detay.garment || (r.detay.neckline + '/' + r.detay.skirtStyle); jsonRoot[k] = (jsonRoot[k] || 0) + 1; }

// FLAT+CROP-YOK+ROUTER'daki hedeflerin beyondEngine özelliklerini say (motora ne eklemek en çok düzeltir)
const idToTarget = Object.fromEntries(targets.map(t => [t.id, t]));
const beyondFreq = {};
for (const r of rows) if (r.katman === 'FLAT' || r.katman === 'ROUTER') {
  for (const b of (idToTarget[r.id].beyondEngine || [])) beyondFreq[b] = (beyondFreq[b] || 0) + 1;
}
const topBeyond = Object.entries(beyondFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

const layerCount = Object.fromEntries(Object.entries(byLayer).map(([k, v]) => [k, v.length]));
const rapor = {
  ts: '2026-07-23',
  toplam: rows.length,
  esikler: { flatKotuPct: FLAT_KOTU * 100, routerKorPct: ROUTER_KOR * 100, nband: NBAND },
  katmanlar: layerCount,
  katmanHedefleri: byLayer,
  jsonKokNeden: jsonRoot,
  flatRouterBeyondEngineFreq: Object.fromEntries(topBeyond),
  satirlar: rows,
};
writeFileSync(HERE + 'teshis-rapor.json', JSON.stringify(rapor, null, 1));

console.log('\n=== ARIZA KATMANI TEŞHİS ===');
console.log('toplam:', rows.length);
for (const [k, v] of Object.entries(layerCount).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log('JSON kök-neden:', JSON.stringify(jsonRoot));
console.log('FLAT/ROUTER beyondEngine sıklık (ilk 5):', topBeyond.slice(0, 5).map(([k, v]) => `${v}× ${k}`).join(' | '));
console.log('rapor: engine/imitate/teshis-rapor.json');
