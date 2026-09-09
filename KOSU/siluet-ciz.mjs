// KOSU/siluet-ciz.mjs — SILUET -> FLAT (0-K.10, 10 Eyl 2026).
// Flat, gordugunun mankene (croquis36) cizilmis halidir: okuma (contract/siluet-v1.json) noktalari manken
// landmark'larina oranla verir, bu dosya YALNIZ o noktalari cizer. Cevre / 1/4 / 2pi / pens payi / bolluk YOK;
// taban elbise YOK. Motor (graf) flat'e girmez; kalip ayri (KOSU/siluet-kalip.mjs).
//   node KOSU/siluet-ciz.mjs <siluet.json> <cikis.svg>        -> svg (on + arka yan yana)
//   import { ciz } from './siluet-ciz.mjs'; ciz(okuma) -> { svg, imza, kirmizi[] }
import { readFileSync, writeFileSync } from 'node:fs';

const BODY = JSON.parse(readFileSync('contract/body-v1.json', 'utf8'));
const CIZ = JSON.parse(readFileSync('contract/siluet-v1.json', 'utf8')).cizgi;
const LM = BODY.bedenler.croquis36.landmarklar;
const lm = (ad) => { const l = LM['landmark.' + ad]; if (!l) throw new Error('landmark yok: ' + ad); return l; };
// ayni ifade baska bedende (kalip: gercek36) — KOSU/siluet-kalip.mjs kullanir
export function noktaBeden(p, bedenId) {
  const T = BODY.bedenler[bedenId].landmarklar, l = (ad) => { const q = T['landmark.' + ad]; if (!q) throw new Error('landmark yok: ' + ad); return q; };
  const [xs, ys] = p;
  const mx = /^(\w+)\*(-?[0-9.]+)(?:([+-][0-9.]+))?$/.exec(xs), my = /^(\w+)(?:\.\.(\w+)@([0-9.]+))?(?:([+-][0-9.]+))?$/.exec(ys);
  if (!mx || !my) throw new Error('ifade bozuk: ' + xs + ' / ' + ys);
  let y = l(my[1]).y; if (my[2]) y += (l(my[2]).y - y) * parseFloat(my[3]); if (my[4]) y += parseFloat(my[4]);
  return { x: l(mx[1]).x * parseFloat(mx[2]) + (mx[3] ? parseFloat(mx[3]) : 0), y };
}

// ---- nokta ifadeleri (contract/siluet-v1.json koordinat)
export function nokta(p) {
  if (Array.isArray(p) && typeof p[0] === 'number') return { x: p[0], y: p[1] };
  const [xs, ys] = p;
  const mx = /^(\w+)\*(-?[0-9.]+)(?:([+-][0-9.]+))?$/.exec(xs);
  if (!mx) throw new Error('x ifadesi bozuk: ' + xs);
  const x = lm(mx[1]).x * parseFloat(mx[2]) + (mx[3] ? parseFloat(mx[3]) : 0);
  const my = /^(\w+)(?:\.\.(\w+)@([0-9.]+))?(?:([+-][0-9.]+))?$/.exec(ys);
  if (!my) throw new Error('y ifadesi bozuk: ' + ys);
  let y = lm(my[1]).y;
  if (my[2]) y = y + (lm(my[2]).y - y) * parseFloat(my[3]);
  if (my[4]) y += parseFloat(my[4]);
  return { x, y };
}
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const P = (p) => `${f1(p.x)} ${f1(p.y)}`;

// ---- egriler
// Catmull-Rom -> kubik Bezier (yumusak yan dikis: koltukalti -> gogus -> bel -> kalca -> etekYan)
function catmull(pts, gerginlik = 0.5) {
  if (pts.length < 2) return '';
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6 * gerginlik * 2, y: p1.y + (p2.y - p0.y) / 6 * gerginlik * 2 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6 * gerginlik * 2, y: p2.y - (p3.y - p1.y) / 6 * gerginlik * 2 };
    d += ` C ${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}
// iki nokta arasi kavis: bombe (mm) sag-el normali yonunde (pozitif = saga/asagi tarafa)
function kavis(a, b, bombe) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  return ` Q ${f1(mx + nx * bombe * 2)} ${f1(my + ny * bombe * 2)} ${P(b)}`;
}
const ayna = (p) => ({ x: -p.x, y: p.y });

// ---- yaka bicimleri: yakaOrta (x=0) -> yakaOmuz
function yakaYolu(orta, omuz, bicim, sag = true) {
  const s = sag ? 1 : -1;
  const o = { x: s * Math.abs(orta.x), y: orta.y }, m = { x: s * Math.abs(omuz.x), y: omuz.y };
  switch (bicim) {
    case 'V': return ` L ${P(m)}`;
    case 'kare': return ` L ${f1(m.x)} ${f1(o.y)} L ${P(m)}`;
    case 'duz': case 'off-shoulder': return ` L ${P(m)}`;
    case 'kalp': { // iki lob: orta cukurdan tepeye kubik
      const tepe = { x: m.x * 0.5, y: o.y - (o.y - m.y) * 0.55 - 12 };
      return ` C ${f1(o.x + s * 10)} ${f1(o.y - 6)} ${f1(tepe.x - s * 14)} ${f1(tepe.y)} ${P(tepe)} C ${f1(tepe.x + s * 16)} ${f1(tepe.y)} ${f1(m.x - s * 4)} ${f1(m.y + 8)} ${P(m)}`;
    }
    case 'kayik': return ` C ${f1(m.x * 0.55)} ${f1(o.y)} ${f1(m.x * 0.90)} ${f1(m.y + (o.y - m.y) * 0.22)} ${P(m)}`;
    case 'yuvarlak': default:
      return ` C ${f1(m.x * 0.6)} ${f1(o.y)} ${f1(m.x * 0.94)} ${f1(m.y + (o.y - m.y) * 0.30)} ${P(m)}`;
  }
}

// ---- bir gorunumun dis konturu (kapali yol) + aski / kol / ic ogeler
function gorunumCiz(g, ad, kirmizi, oturma) {
  const K = {}; for (const k of Object.keys(g.kontur)) K[k] = g.kontur[k] ? nokta(g.kontur[k]) : null;
  const KS = {}; if (g.konturSol) for (const k of Object.keys(g.konturSol)) KS[k] = g.konturSol[k] ? nokta(g.konturSol[k]) : null;
  const sag = (k) => K[k], sol = (k) => (KS[k] !== undefined ? KS[k] : K[k]) && ayna(KS[k] !== undefined ? KS[k] : K[k]);
  const yb = g.yakaBicim || 'yuvarlak';
  // yaka ortasi asimetrikse (Leia) konturSol.yakaOrta ile verilir; sag/sol ayri
  const yakaOrtaSag = sag('yakaOrta'), yakaOrtaSol = KS.yakaOrta ? ayna(KS.yakaOrta) : ayna(K.yakaOrta);

  let d = `M ${P(yakaOrtaSag)}`;
  // SAG yarim: yaka -> omuz -> kol oyugu -> yan -> etek
  const yanSag = ['koltukalti', 'gogus', 'bel', 'kalca', 'etekYan'].map(sag).filter(Boolean);
  d += yakaYolu(yakaOrtaSag, sag('yakaOmuz'), yb, true);
  if (g.aski && sag('askiUst')) {
    const a = sag('askiUst'), w = g.aski.genislik || 12, yo = sag('yakaOmuz'), ou = sag('omuzUc');
    // ic kenar: yakaOmuz -> aski ust ic; ust; dis kenar: aski ust dis -> omuzUc  (askilar omuza dogru hafif kavisli)
    d += kavis(yo, { x: a.x - w / 2, y: a.y }, -4) + ` Q ${f1(a.x)} ${f1(a.y - w * 0.45)} ${f1(a.x + w / 2)} ${f1(a.y)}` + kavis({ x: a.x + w / 2, y: a.y }, ou, -4);
    if (a.x + w / 2 > lm('shoulderTip').x + 0.5) kirmizi.push(`${ad}: aski ucu manken omuz noktasini asiyor (${f1(a.x + w / 2)} > ${f1(lm('shoulderTip').x)})`);
  } else if (sag('omuzUc')) {
    d += ` L ${P(sag('omuzUc'))}`;
  }
  // kol oyugu / kol: omuzUc -> koltukalti
  const ou = sag('omuzUc'), ka = sag('koltukalti');
  if (ou && ka) {
    if (g.kol) d += ` L ${P(ka)}`; // kol uste cizilir, oyuk cizgisi kolun altinda kalir
    // kol evi: omuzdan icbukey iner, koltukaltina DUSEY tegetle gelir (yan dikisle cusp yok)
    else d += ` C ${f1(ou.x - (ou.x - ka.x) * 0.35)} ${f1(ou.y + (ka.y - ou.y) * 0.35)} ${f1(ka.x)} ${f1(ka.y - (ka.y - ou.y) * 0.35)} ${P(ka)}`;
  }
  d += catmull(yanSag, 0.38);
  // etek ucu: etekYan -> etekOrta -> etekYan(sol), sarkik kavis
  const eo = sag('etekOrta'), ey = sag('etekYan');
  d += ` Q ${f1(ey.x * 0.5)} ${f1(eo.y + (g.etekSarkma ?? 6))} ${P(eo)}`;
  const eySol = sol('etekYan');
  d += ` Q ${f1(eySol.x * 0.5)} ${f1(eo.y + (g.etekSarkma ?? 6))} ${P(eySol)}`;
  // SOL yarim ters sirayla
  const yanSol = ['etekYan', 'kalca', 'bel', 'gogus', 'koltukalti'].map(sol).filter(Boolean);
  d += catmull(yanSol, 0.38);
  const ouS = sol('omuzUc'), kaS = sol('koltukalti');
  if (ouS && kaS) {
    if (g.kol && !(g.kolSol === null)) d += ` L ${P(ouS)}`;
    else d += ` C ${f1(kaS.x)} ${f1(kaS.y - (kaS.y - ouS.y) * 0.35)} ${f1(ouS.x - (ouS.x - kaS.x) * 0.35)} ${f1(ouS.y + (kaS.y - ouS.y) * 0.35)} ${P(ouS)}`;
  }
  const askiSol = KS.askiUst !== undefined ? KS.askiUst : K.askiUst;
  if (g.aski && askiSol && g.askiSol !== null) {
    const a = ayna(askiSol), w = g.aski.genislik || 12, yo = sol('yakaOmuz');
    d += kavis(ouS, { x: a.x - w / 2, y: a.y }, -4) + ` Q ${f1(a.x)} ${f1(a.y - w * 0.45)} ${f1(a.x + w / 2)} ${f1(a.y)}` + kavis({ x: a.x + w / 2, y: a.y }, yo, -4);
  } else if (sol('omuzUc')) {
    d += ` L ${P(sol('yakaOmuz'))}`;
  }
  // sol yaka: yakaOmuz(sol) -> yakaOrta(sol): sag yolun aynasi, ters yonde -> yakaYolu'nu ters cizmek yerine simetrik yol kur
  d += yakaTers(yakaOrtaSol, sol('yakaOmuz'), KS.yakaBicim || yb);
  if (Math.abs(yakaOrtaSol.x - yakaOrtaSag.x) > 0.01 || Math.abs(yakaOrtaSol.y - yakaOrtaSag.y) > 0.01) d += ` L ${P(yakaOrtaSag)}`;
  d += ' Z';

  let svg = `<path d="${d}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round"/>\n`;

  // KOL (kapak / puf / duz) — govdenin ustune, beyaz dolgu
  const kolCiz = (kol, ou, ka, s) => {
    if (!kol) return '';
    const dis = nokta(kol.dis), ic = nokta(kol.ic);
    dis.x *= s; ic.x *= s;
    const sis = (kol.sisme || 0) * s;
    let kd = `M ${P(ou)}`;
    if (kol.tip === 'puf') {
      // omuzdan disari balon: ust kubbe + dis bombe + agiz bandi
      const tepe = { x: ou.x + (dis.x - ou.x) * 0.45 + sis * 0.6, y: ou.y - (kol.kubbe || 22) };
      kd += ` C ${f1(ou.x + sis * 0.3)} ${f1(ou.y - (kol.kubbe || 22) * 0.9)} ${f1(tepe.x - sis * 0.2)} ${f1(tepe.y)} ${P(tepe)}`;
      kd += ` C ${f1(dis.x + sis)} ${f1(tepe.y + (dis.y - tepe.y) * 0.25)} ${f1(dis.x + sis)} ${f1(dis.y - (dis.y - tepe.y) * 0.2)} ${P(dis)}`;
    } else if (kol.tip === 'kapak') {
      kd += ` C ${f1(ou.x + (dis.x - ou.x) * 0.55)} ${f1(ou.y - 2)} ${f1(dis.x + (dis.x - ou.x) * 0.12)} ${f1(ou.y + (dis.y - ou.y) * 0.45)} ${P(dis)}`;
      kd += ` Q ${f1((dis.x + ic.x) / 2 + (dis.x - ic.x) * 0.05)} ${f1(dis.y + 10)} ${P(ic)} L ${P(ka)} Z`;
      return `<path d="${kd}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round"/>\n`;
    } else {
      kd += ` L ${P(dis)}`;
    }
    kd += ` L ${P(ic)} L ${P(ka)} Z`;
    let out = `<path d="${kd}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round"/>\n`;
    if (kol.bant) { // agiz bandi: agiz cizgisine paralel ic cizgi
      const bh = kol.bantMM || 14, ux = ic.x - dis.x, uy = ic.y - dis.y, L = Math.hypot(ux, uy) || 1;
      const nx = uy / L * -bh * s, ny = -ux / L * -bh * s; // bant yukari (agizdan govde-ust yonune)
      out += `<path d="M ${f1(dis.x + nx)} ${f1(dis.y + ny)} L ${f1(ic.x + nx)} ${f1(ic.y + ny)}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}"/>\n`;
      if (kol.buzgu) out += tikler([{ x: dis.x + nx, y: dis.y + ny }, { x: ic.x + nx, y: ic.y + ny }], 12, 13, { x: 0, y: -1 });
    }
    if (kol.firfir) { const ux = ic.x - dis.x, uy = ic.y - dis.y, L = Math.hypot(ux, uy) || 1; const nx = -uy / L * 7 * s, ny = ux / L * 7 * s;
      out += ogeCiz({ tip: 'firfir', adim: 9, derinlik: 5 }, [{ x: dis.x - nx, y: dis.y - ny }, { x: ic.x - nx, y: ic.y - ny }], s, {}); }
    if (kol.buzgu && kol.tip === 'puf') { // kapak buzgusu: omuz ucundan asagi kisa cizgiler
      out += tikler([{ x: ou.x, y: ou.y }, { x: ou.x + (dis.x - ou.x) * 0.5, y: ou.y - (kol.kubbe || 22) * 0.9 }], 10, 11, { x: 0, y: 1 });
    }
    return out;
  };
  if (g.kol) {
    svg += kolCiz(g.kol, ou, ka, 1);
    if (g.kolSol !== null) svg += kolCiz(g.kolSol || g.kol, ouS, kaS, -1);
  }

  // IC OGELER
  for (const o of g.ogeler || []) {
    const taraflar = o.ayna === false ? [1] : (o.ayna === 'sol' ? [-1] : [1, -1]);
    for (const s of taraflar) {
      const pts = (o.noktalar || []).map((p) => { const q = nokta(p); q.x *= s; return q; });
      svg += ogeCiz(o, pts, s, K);
    }
  }
  // imza: konturun deterministik ozeti (yanlislama 1/2)
  const imza = ['yakaOrta', 'yakaOmuz', 'omuzUc', 'koltukalti', 'gogus', 'bel', 'kalca', 'etekYan', 'etekOrta'].map((k) => K[k] ? `${k}=${f1(K[k].x)},${f1(K[k].y)}` : `${k}=-`).join(';');
  // yanlislama 3: bol duran giysi oturamaz
  if (oturma && oturma.bel === false && K.bel && K.gogus && K.bel.x < K.gogus.x * 0.97) kirmizi.push(`${ad}: fotografta bel OTURMUYOR ama flat belde daraliyor (bel ${f1(K.bel.x)} < gogus ${f1(K.gogus.x)} x 0.97)`);
  const xs = [], ys = [];
  for (const k of Object.keys(K)) if (K[k]) { xs.push(Math.abs(K[k].x)); ys.push(K[k].y); }
  for (const k of Object.keys(KS)) if (KS[k]) { xs.push(Math.abs(KS[k].x)); ys.push(KS[k].y); }
  if (g.kol) { const dd = nokta(g.kol.dis); xs.push(Math.abs(dd.x) + (g.kol.sisme || 0)); ys.push(dd.y); }
  return { svg, imza, w: Math.max(...xs), y0: Math.min(...ys) - (g.kol && g.kol.tip === 'puf' ? (g.kol.kubbe || 22) : 0), y1: Math.max(...ys) + (g.etekSarkma ?? 6) };
}
function yakaTers(orta, omuz, bicim) {
  // sol yarim: omuz(sol) -> orta(sol). yakaYolu'nun (orta->omuz) sag-el aynasi ters yonde: kontrol noktalarini ters sirala
  const yol = yakaYolu(orta, { x: Math.abs(omuz.x), y: omuz.y }, bicim, true); // sag yol: orta -> omuz
  // sag yolu segmentlere ayir, ters cevir ve x'i aynala
  const toks = yol.trim().split(/\s+(?=[A-Z])/);
  const segs = toks.map((t) => { const [c, ...n] = t.split(/\s+/); return { c, n: n.map(Number) }; });
  let d = ''; let son = { x: Math.abs(omuz.x), y: omuz.y };
  const noktalar = []; // (cmd, ctrl..., end) listesi; ters: end_i -> ... -> start
  let cur = { x: orta.x < 0 ? -orta.x : orta.x, y: orta.y }; cur = { x: Math.abs(orta.x), y: orta.y };
  for (const sgm of segs) {
    if (sgm.c === 'L') { noktalar.push({ c: 'L', from: cur, to: { x: sgm.n[0], y: sgm.n[1] } }); cur = { x: sgm.n[0], y: sgm.n[1] }; }
    else if (sgm.c === 'Q') { noktalar.push({ c: 'Q', from: cur, c1: { x: sgm.n[0], y: sgm.n[1] }, to: { x: sgm.n[2], y: sgm.n[3] } }); cur = { x: sgm.n[2], y: sgm.n[3] }; }
    else if (sgm.c === 'C') { noktalar.push({ c: 'C', from: cur, c1: { x: sgm.n[0], y: sgm.n[1] }, c2: { x: sgm.n[2], y: sgm.n[3] }, to: { x: sgm.n[4], y: sgm.n[5] } }); cur = { x: sgm.n[4], y: sgm.n[5] }; }
  }
  const A = (p) => ({ x: -p.x, y: p.y });
  for (const sgm of noktalar.reverse()) {
    if (sgm.c === 'L') d += ` L ${P(A(sgm.from))}`;
    else if (sgm.c === 'Q') d += ` Q ${P(A(sgm.c1))} ${P(A(sgm.from))}`;
    else d += ` C ${P(A(sgm.c2))} ${P(A(sgm.c1))} ${P(A(sgm.from))}`;
  }
  void son;
  return d;
}

// kisa cizgiler (buzgu): yol boyunca, normal yonunde uzunluk 'boy', aralik CIZ.buzguTikMM
// pref: tiklerin gitmesi istenen MUTLAK yon (ör. {x:0,y:1} asagi); normalin isareti ona gore secilir -> sol/sag ayni fiziksel taraf
function tikler(pts, boy, aralik = CIZ.buzguTikMM, pref = { x: 0, y: 1 }) {
  let out = '';
  const BOYLAR = [1, 0.62, 0.85, 0.55, 0.95, 0.7];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.floor(L / aralik));
    let nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
    if (nx * pref.x + ny * pref.y < 0) { nx = -nx; ny = -ny; }
    for (let k = 0; k <= n; k++) {
      const t = (k + 0.5) / (n + 1), px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
      const bb = Math.abs(boy) * BOYLAR[k % BOYLAR.length];
      // ince, hafif kavisli, dikise dogru solan buzgu izi
      out += `<path d="M ${f1(px)} ${f1(py)} q ${f1(nx * bb * 0.5 + ny * 1.2)} ${f1(ny * bb * 0.5 - nx * 1.2)} ${f1(nx * bb)} ${f1(ny * bb)}" fill="none" stroke="#000" stroke-width="${CIZ.kesikliMM * 0.8}" stroke-linecap="round"/>\n`;
    }
  }
  return out;
}
function yol(pts, kapali = false, bombe = 0) {
  if (!pts.length) return '';
  let d = `M ${P(pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += bombe ? kavis(pts[i - 1], pts[i], bombe) : ` L ${P(pts[i])}`;
  return d + (kapali ? ' Z' : '');
}
function ogeCiz(o, pts, s, K) {
  const ince = `fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round"`;
  const kesik = `fill="none" stroke="#000" stroke-width="${CIZ.kesikliMM}" stroke-dasharray="${CIZ.kesikli}"`;
  const bombe = (o.bombe || 0) * s;
  switch (o.tip) {
    case 'dikis': case 'roba': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${ince}/>\n`;
    case 'kesikli': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${kesik}/>\n`;
    case 'fermuar': { // CB fermuar: kesikli cift cizgi + cekecek
      const [a, b] = pts;
      return `<path d="M ${f1(a.x - 2)} ${f1(a.y)} L ${f1(b.x - 2)} ${f1(b.y)} M ${f1(a.x + 2)} ${f1(a.y)} L ${f1(b.x + 2)} ${f1(b.y)}" ${kesik}/>\n<rect x="${f1(a.x - 3)}" y="${f1(a.y + 2)}" width="6" height="9" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}"/>\n`;
    }
    case 'buzgu': { const pref = o.yon === 'yukari' ? { x: 0, y: -1 } : o.yon === 'ic' ? { x: -s, y: 0 } : o.yon === 'dis' ? { x: s, y: 0 } : { x: 0, y: 1 };
      return tikler(pts, o.boy || 12, (o.aralik || CIZ.buzguTikMM) * 1.6, pref); }
    case 'pens': { const [uc, a, b] = pts; return `<path d="M ${P(a)} L ${P(uc)} L ${P(b)}" ${ince}/>\n`; }
    case 'dugme': {
      const [a, b] = pts, n = o.adet || 5, r = (o.cap || 12) / 2; let out = '';
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1), x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        out += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/><circle cx="${f1(x + r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/>\n`;
      }
      return out;
    }
    case 'pat': { const [a, b] = pts, w = (o.genislik || 24) / 2; return `<path d="M ${f1(a.x - w)} ${f1(a.y)} L ${f1(b.x - w)} ${f1(b.y)} M ${f1(a.x + w)} ${f1(a.y)} L ${f1(b.x + w)} ${f1(b.y)}" ${o.kesikli ? kesik : ince}/>\n`; }
    case 'fiyonk': { // iki kulak + iki kuyruk
      const c = pts[0], b = o.boy || 28;
      return `<path d="M ${P(c)} c ${f1(-b * 0.9)} ${f1(-b * 0.7)} ${f1(-b * 1.1)} ${f1(b * 0.2)} 0 0 c ${f1(b * 0.9)} ${f1(-b * 0.7)} ${f1(b * 1.1)} ${f1(b * 0.2)} 0 0 m 0 0 c ${f1(-b * 0.2)} ${f1(b * 0.5)} ${f1(-b * 0.3)} ${f1(b * 0.9)} ${f1(-b * 0.35)} ${f1(b * 1.3)} M ${P(c)} c ${f1(b * 0.2)} ${f1(b * 0.5)} ${f1(b * 0.3)} ${f1(b * 0.9)} ${f1(b * 0.35)} ${f1(b * 1.3)}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}"/>\n`;
    }
    case 'bag': { // sarkan bagcik: iki ince dalgali serit
      const c = pts[0], b = o.boy || 120;
      return `<path d="M ${f1(c.x - 3)} ${f1(c.y)} c ${f1(-8)} ${f1(b * 0.4)} ${f1(6)} ${f1(b * 0.7)} ${f1(-4)} ${f1(b)} M ${f1(c.x + 3)} ${f1(c.y)} c ${f1(8)} ${f1(b * 0.4)} ${f1(-2)} ${f1(b * 0.7)} ${f1(6)} ${f1(b * 0.95)}" ${ince}/>\n`;
    }
    case 'drape': { let out = ''; for (let i = 0; i + 1 < pts.length; i += 2) out += `<path d="${yol([pts[i], pts[i + 1]], false, (o.bombe || 6) * s)}" ${ince}/>\n`; return out; }
    case 'firfir': { // dalgali kenar: kucuk yaylar
      let out = 'M ' + P(pts[0]);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(2, Math.round(L / (o.adim || 10)));
        const nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
        for (let k = 1; k <= n; k++) { const t = k / n, tm = (k - 0.5) / n; out += ` Q ${f1(a.x + (b.x - a.x) * tm + nx * (o.derinlik || 6) * (k % 2 ? 1 : -1))} ${f1(a.y + (b.y - a.y) * tm + ny * (o.derinlik || 6) * (k % 2 ? 1 : -1))} ${f1(a.x + (b.x - a.x) * t)} ${f1(a.y + (b.y - a.y) * t)}`; }
      }
      return `<path d="${out}" ${ince}/>\n`;
    }
    case 'bebeYaka': { // yakanin ustune oturan yuvarlak lob: yakaOrta -> yakaOmuz yolu disari 'genislik' kadar ofsetli
      const w = o.genislik || 45, orta = { x: 0, y: K.yakaOrta.y }, omuz = { x: K.yakaOmuz.x * s, y: K.yakaOmuz.y };
      const dis = { x: omuz.x + s * w * 0.35, y: omuz.y + w * 0.75 };
      const alt = { x: s * w * 0.35, y: orta.y + w };
      const d = `M ${P(orta)} L ${f1(s * 4)} ${f1(orta.y + 2)} C ${f1(s * 4)} ${f1(orta.y + w * 0.7)} ${f1(alt.x * 0.4)} ${f1(alt.y)} ${P(alt)} C ${f1(alt.x + s * w * 0.9)} ${f1(alt.y)} ${f1(dis.x)} ${f1(dis.y + w * 0.1)} ${P(dis)} C ${f1(omuz.x + s * w * 0.2)} ${f1(omuz.y + w * 0.3)} ${f1(omuz.x)} ${f1(omuz.y)} ${P(omuz)}`;
      let out = `<path d="${d}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}"/>\n`;
      if (o.firfir) out += ogeCiz({ tip: 'firfir', adim: 9, derinlik: 5 }, [alt, dis], s, K);
      return out;
    }
    case 'cepKapagi': { const [a, b] = pts; const h = o.yukseklik || 40; return `<path d="M ${P(a)} L ${P(b)} L ${f1(b.x)} ${f1(b.y + h * 0.7)} Q ${f1((a.x + b.x) / 2)} ${f1(b.y + h * 1.15)} ${f1(a.x)} ${f1(a.y + h * 0.7)} Z" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}"/>\n<path d="M ${f1(a.x + s * 3)} ${f1(a.y + 4)} L ${f1(b.x - s * 3)} ${f1(b.y + 4)}" ${kesik}/>\n`; }
    default: return `<!-- bilinmeyen oge ${o.tip} -->\n`;
  }
}

export function ciz(okuma) {
  const kirmizi = [];
  const gorunumler = [['on', okuma.on], ['arka', okuma.arka]].filter(([, g]) => g);
  const parcalar = gorunumler.map(([ad, g]) => ({ ad, ...gorunumCiz(g, ad, kirmizi, okuma.oturma) }));
  const M = 40, W = Math.max(...parcalar.map((p) => p.w)) * 2 + M;
  const y0 = Math.min(...parcalar.map((p) => p.y0)) - M, y1 = Math.max(...parcalar.map((p) => p.y1)) + M;
  const H = y1 - y0, TW = W * parcalar.length + M;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(TW)} ${f1(H)}" width="${f1(TW)}mm" height="${f1(H)}mm" data-siluet="v1" data-kaynak="${okuma.sha256 || ''}">\n<rect width="${f1(TW)}" height="${f1(H)}" fill="#fff"/>\n`;
  parcalar.forEach((p, i) => {
    svg += `<g transform="translate(${f1(M / 2 + W * i + W / 2)} ${f1(-y0)})" data-gorunum="${p.ad}">\n${p.svg}</g>\n`;
    svg += `<text x="${f1(M / 2 + W * i + W / 2)}" y="${f1(H - 12)}" font-family="Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666">${p.ad === 'on' ? 'ON' : 'ARKA'}</text>\n`;
  });
  svg += '</svg>\n';
  return { svg, imza: parcalar.map((p) => p.ad + ':' + p.imza).join('|'), kirmizi };
}

if (process.argv[1] && process.argv[1].endsWith('siluet-ciz.mjs')) {
  const [girdi, cikis] = process.argv.slice(2);
  if (!girdi || !cikis) { console.error('kullanim: node KOSU/siluet-ciz.mjs <siluet.json> <cikis.svg>'); process.exit(2); }
  const r = ciz(JSON.parse(readFileSync(girdi, 'utf8')));
  writeFileSync(cikis, r.svg);
  console.log(JSON.stringify({ svg: cikis, imza: r.imza, kirmizi: r.kirmizi }));
  if (r.kirmizi.length) process.exit(1);
}
