// ============================================================================
// 2D KÜTLE-YAY KUMAŞ ÇÖZÜCÜ — DETERMİNİSTİK (Damla master directive madde 6).
// stitchu'nun ilk fizik katmanı. Bir dikdörtgen kumaşı düğüm ızgarası olarak
// modeller; yerçekimi + yapısal gerilim + eğilme direnci altında dengeye
// oturtur. Girdi: tutturma noktaları (üst kenar) + kumaş parametreleri
// (gatherRatio = büzgü oranı, stiffness, weight). Çıktı: kararlı düğüm konumları
// → kat (drape fold) çizgileri.
//
// DETERMİNİZM MUTLAK (golden/STYLE-PIN kırılmaz): Math.random YOK, argsız Date
// YOK. Sabit başlangıç ızgarası + sabit iterasyon sayısı + sabit alt-adım →
// aynı girdi HEP aynı çıktı. Simülasyon "canlı" değil; deterministik bir
// çözücüdür (fizik-tabanlı bir formül gibi). Verlet integrasyonu (hızsız,
// konumdan konuma) → sayısal olarak kararlı ve tekrarlanabilir.
//
// İZOLE KANIT (adım b): rectClothGather() bir dikdörtgeni üst kenardan büzer,
// kat çizgilerinin dağılımını verir. Çözücü çalışırsa shirred primitifine
// bağlanır (22 hedef); çalışmazsa erken öğreniriz — motora bağlamadan.
// ============================================================================

// ---- fabric seeds: karakteri parametre belirler (chiffon çok+ince, satin
// az+uzun, keten sert+kırık). Değerler ölçülmedi (emsal band gelince kalibre);
// şimdilik fiziksel-makul başlangıç, item 5 ÖLÇÜLMEDİ notuyla.
export const SEED_FABRICS = {
  chiffon: { stiffness: 0.20, bend: 0.04, weight: 0.6 },  // yumuşak, çok ince kat
  satin:   { stiffness: 0.45, bend: 0.10, weight: 1.0 },  // ağır, az uzun kat
  cotton:  { stiffness: 0.60, bend: 0.18, weight: 0.9 },  // orta
  linen:   { stiffness: 0.80, bend: 0.35, weight: 1.0 },  // sert, kırık kat
};

// ---- çözücü sabitleri (deterministik ayar) ----
const ITERS = 240;          // toplam Verlet adımı (sabit)
const CONSTRAINT_PASSES = 3; // her adımda yay-kısıt gevşetme geçişi
const GRAVITY = 0.45;        // aşağı sabit ivme (düğüm başına)
const DAMP = 0.94;           // sönümleme (kararlılık için)

// deterministik başlangıç mikro-sapması (fold simetrisini kırar ama SABİT —
// bir seed'den türeyen tekrarlanabilir sözde-rasgele, çözücü çıktısı seed'e
// bağlı ama HEP aynı).
function seededOffset(i, seed) {
  const s = ((i + 1) * 2654435761 + seed * 40503) >>> 0;
  return ((s ^ (s >>> 13)) % 1000) / 1000 - 0.5; // [-0.5, 0.5]
}

// ---------------------------------------------------------------------------
// solveCloth: bir düğüm ızgarasını dengeye oturt.
//   nx, ny        : ızgara boyutu (yatay × dikey düğüm)
//   restX, restY  : dinlenme (gerilmemiş) düğüm aralığı
//   pin(i,j)      : bu düğüm sabit mi (üst kenar tutturma) → {x,y} | null
//   fabric        : {stiffness, bend, weight}
//   seed          : deterministik başlangıç
// Döner: pos[j][i] = {x,y} kararlı konumlar.
// ---------------------------------------------------------------------------
export function solveCloth({ nx, ny, restX, restY, pin, fabric, seed = 7, topLockRows = 0, gatherStiffTop = 1 }) {
  const { stiffness, bend, weight } = fabric;
  // konum + önceki konum (Verlet). Başlangıç: düz asılı ızgara + sabit sapma.
  const pos = [], prev = [];
  for (let j = 0; j < ny; j++) {
    pos[j] = []; prev[j] = [];
    for (let i = 0; i < nx; i++) {
      const p = pin(i, j);
      const x = p ? p.x : i * restX + seededOffset(j * nx + i, seed) * restX * 0.3;
      const y = p ? p.y : j * restY;
      pos[j][i] = { x, y, pinned: !!p };
      prev[j][i] = { x, y };
    }
  }
  // yay dinlenme uzunlukları
  const relax = (a, b, rest, k) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1e-6;
    const diff = (d - rest) / d * 0.5 * k;
    const ox = dx * diff, oy = dy * diff;
    if (!a.pinned) { a.x += ox; a.y += oy; }
    if (!b.pinned) { b.x -= ox; b.y -= oy; }
  };
  for (let it = 0; it < ITERS; it++) {
    // Verlet integrasyon: yerçekimi + atalet
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const p = pos[j][i]; if (p.pinned) continue;
      const pr = prev[j][i];
      const vx = (p.x - pr.x) * DAMP, vy = (p.y - pr.y) * DAMP;
      pr.x = p.x; pr.y = p.y;
      p.x += vx; p.y += vy + GRAVITY * weight;
    }
    // kısıt gevşetme: yapısal (komşu) + eğilme (2-komşu)
    // SHIRRED profili (topLockRows>0): üst birkaç satırda yatay yay ÇOK sert
    // (büzgü kumaşı üstte sıkı toplar), aşağı doğru hızla normale döner → kat
    // aktif bölgesi üst %15-25'te sönümlenir, alt düz kalır. Emsal shirred
    // panel karakteri budur (hakem kıyası 2026-07-21). skirt profilinde
    // topLockRows=0 → eski davranış (byte-identical).
    for (let c = 0; c < CONSTRAINT_PASSES; c++) {
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        // yatay stiffness: shirred'de üstte gatherStiffTop× sert, alta doğru söner
        let hstiff = stiffness;
        if (topLockRows > 0 && j <= topLockRows) {
          const t = j / topLockRows;                 // 0 (üst) .. 1 (kilit sonu)
          hstiff = stiffness * (gatherStiffTop * (1 - t) + t); // üstte yüksek, altta normal
          if (hstiff > 1) hstiff = 1;
        }
        if (i + 1 < nx) relax(pos[j][i], pos[j][i + 1], restX, hstiff);          // yatay yapısal
        if (j + 1 < ny) relax(pos[j][i], pos[j + 1][i], restY, stiffness);       // dikey yapısal
        if (i + 2 < nx) relax(pos[j][i], pos[j][i + 2], restX * 2, bend);        // yatay eğilme
        if (j + 2 < ny) relax(pos[j][i], pos[j + 2][i], restY * 2, bend);        // dikey eğilme
      }
    }
  }
  return pos;
}

// ---------------------------------------------------------------------------
// rectClothGather (İZOLE KANIT — adım b): bir dikdörtgen kumaşı üst kenardan
// büz. Kumaş genişliği = finished × gatherRatio; üst düğümler dar bitmiş
// genişliğe SIKIŞTIRILIR (büzgü), alt serbest sarkar. Çözücü katları kendisi
// bulur.
//   finishedW : bitmiş (büzülmüş) üst kenar genişliği
//   clothH    : kumaş boyu
//   gatherRatio : büzgü oranı (2.0 = iki kat kumaş bir kata)
// Döner: { pos, folds } — folds = dikey kat çizgileri (fizikten türetilmiş).
// ---------------------------------------------------------------------------
export function rectClothGather({ finishedW, clothH, gatherRatio, fabric = SEED_FABRICS.cotton, seed = 7, profile = 'skirt' }) {
  const shirred = profile === 'shirred';
  // shirred panel çok daha ince+çok kat taşır (emsal ~25-45); skirt daha az.
  const nx = shirred
    ? Math.max(21, Math.round(gatherRatio * 14) | 1)
    : Math.max(9, Math.round(gatherRatio * 8) | 1); // tek sayı → orta düğüm var
  const ny = shirred ? 18 : 14;
  const clothW = finishedW * gatherRatio;
  const restX = clothW / (nx - 1);      // gerilmemiş kumaş aralığı (geniş)
  const restY = clothH / (ny - 1);
  // büzgü hattı: skirt'te sadece üst satır (0) pinli. shirred'de üst 2 satır
  // pinli (büzgü kumaşı üstte fiziksel olarak toplanmış+tutturulmuş = panel),
  // + üst-kilitli sönüm (topLockRows) katları üst %20'ye hapseder.
  const pinRows = shirred ? 1 : 0; // 0..pinRows arası satır büzgü hattında sabit
  const pin = (i, j) => {
    if (j > pinRows) return null;
    // pinli satırlar bitmiş dar genişliğe eşit aralıkla sıkışır; alt pin satırı
    // hafif rasgele x ile büzgü kırışığını başlatır (deterministik seed).
    const jitter = j === 0 ? 0 : seededOffset(i, seed) * restX * 0.18;
    return { x: (i / (nx - 1)) * finishedW + jitter, y: j * restY };
  };
  const topLockRows = shirred ? Math.round(ny * 0.22) : 0; // kat aktif bölge üst %22
  const pos = solveCloth({ nx, ny, restX, restY, pin, fabric, seed,
    topLockRows, gatherStiffTop: shirred ? 3.2 : 1 });
  // kat çizgileri: her iç sütunun düğümlerini bağla.
  // skirt: kat tüm boyu iner (çan). shirred: kat SADECE üst sönüm bölgesinde
  // görünür (büzgü kırışığı üstte yoğun, altta panel düz düşer) — bu emsal
  // shirred karakteridir; fold'ları üst %activeFrac'e kırp, altı düz bırak.
  const activeFrac = shirred ? 0.21 : 1.0; // kıyas-2: %28 sönüm ~%34'e taşıyordu, emsal %15-25 → %21'e çek
  const jMax = shirred ? Math.max(2, Math.round((ny - 1) * activeFrac)) : ny - 1;
  const folds = [];
  for (let i = 1; i < nx - 1; i++) {
    const line = [];
    for (let j = 0; j <= jMax; j++) line.push([pos[j][i].x, pos[j][i].y]);
    folds.push(line);
  }
  return { pos, folds, nx, ny, clothW, finishedW, activeFrac };
}

// ---- CLI: izole kanıt SVG üret ----
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fabricName = process.argv[3] || 'cotton';
  const gr = parseFloat(process.argv[4] || '2.0');
  const profile = process.argv[5] || 'skirt';
  const out = process.argv[2] || '/tmp/cloth-proof.svg';
  const { pos, folds, nx, ny, clothW, finishedW } =
    rectClothGather({ finishedW: 180, clothH: 340, gatherRatio: gr, fabric: SEED_FABRICS[fabricName], seed: 7, profile });
  // SVG: ızgarayı ve kat çizgilerini çiz
  const W = 520, H = 460, ox = 170, oy = 40;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<style>.fold{fill:none;stroke:#1f3a5f;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.edge{fill:none;stroke:#111;stroke-width:2;stroke-linejoin:round}.gath{fill:none;stroke:#3f74a8;stroke-width:1;stroke-dasharray:3 2}.lbl{font:11px Helvetica;fill:#555}</style>`;
  // dış hat: üst (büzülmüş) + iki yan + alt (sarkan)
  const P = (x, y) => `${(ox + x).toFixed(1)},${(oy + y).toFixed(1)}`;
  // sol kenar
  let left = `M ${P(pos[0][0].x, pos[0][0].y)}`;
  for (let j = 1; j < ny; j++) left += ` L ${P(pos[j][0].x, pos[j][0].y)}`;
  // alt
  let bot = '';
  for (let i = 0; i < nx; i++) bot += ` L ${P(pos[ny - 1][i].x, pos[ny - 1][i].y)}`;
  // sağ kenar yukarı
  let right = '';
  for (let j = ny - 2; j >= 0; j--) right += ` L ${P(pos[j][nx - 1].x, pos[j][nx - 1].y)}`;
  // üst (büzülmüş kenar)
  let top = '';
  for (let i = nx - 2; i >= 0; i--) top += ` L ${P(pos[0][i].x, pos[0][i].y)}`;
  s += `<path class="edge" d="${left}${bot}${right}${top} Z"/>`;
  // büzgü çizgisi (üst kenar shirring dikişi)
  let gline = `M ${P(pos[0][0].x, pos[0][0].y)}`;
  for (let i = 1; i < nx; i++) gline += ` L ${P(pos[0][i].x, pos[0][i].y)}`;
  s += `<path class="gath" d="${gline}"/>`;
  // kat çizgileri
  for (const f of folds) {
    let d = `M ${P(f[0][0], f[0][1])}`;
    for (let k = 1; k < f.length; k++) d += ` L ${P(f[k][0], f[k][1])}`;
    s += `<path class="fold" d="${d}"/>`;
  }
  s += `<text class="lbl" x="8" y="20">gatherRatio ${gr} · ${fabricName} · kumaş ${clothW.toFixed(0)}mm → bitmiş ${finishedW}mm · ${folds.length} kat</text>`;
  s += `</svg>`;
  writeFileSync(out, s);
  console.log('wrote', out, '|', folds.length, 'fold, cloth', clothW.toFixed(0), '-> finished', finishedW);
}
