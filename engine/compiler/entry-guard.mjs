// ============================================================================
// GİRİŞ KONTROLÜ GUARD'I (Damla direktifi 2026-07-22, FAZ 0 numune dersi).
// Terzi gözü id82'de yakaladı: bitmiş yaka 35cm, kapanışsız, dokuma → kafa
// GEÇMEZ (~56cm baş). Motor C++ guard'ı sadece 150mm ALTI çökmüş açıklığı
// reddediyor; 350mm+kapanışsız+dokuma "çökmüş değil" ama giyilemez. Bu guard o
// boşluğu kapatır — baş/el/bel çevresiyle KARŞILAŞTIRIR, kapanış/örme şartını
// arar. Motor C++'a DOKUNMAZ (golden riski yok); kalıp-kapısı olarak koşar.
//
// KURAL: kapanış yoksa VE açıklık dar VE kumaş dokuma → FAIL "giriş yok" +
// çözüm. örme ise geç. Aynı mantık kol ağzı/el, bel/kalça için de.
// ============================================================================

// EU38 vücut çevreleri (mm) — engine/src/sizechart.hpp EU38 + antropometrik baş.
const BODY = {
  head: 560,        // baş çevresi (giyinme için kritik)
  hand: 220,        // el çevresi (kol ağzı geçişi)
  bust: 880, waist: 700, hip: 940,
};
// esneme payı: örme kumaş bu oranda esner (dokuma ~0).
const KNIT_STRETCH = 1.6;   // örme %60 esneyebilir

// spec: { garment, neckline, closure, fabric, sleeveStyle, ... }
// draft: { neckOpeningMM?, sleeveOpeningMM?, waistOpeningMM? } (draftJSON'dan ölçülür)
// Bir kalıbın giyilebilir GİRİŞİ var mı? issues[] döner (boşsa geçti).
export function entryGuard(spec, draft) {
  const issues = [];
  const fabric = spec.fabric || 'woven';
  const knit = fabric === 'knit';
  const stretch = knit ? KNIT_STRETCH : 1.0;

  const hasClosure = spec.closure && spec.closure !== 'none'
    && ['buttons', 'zipper', 'tieBack', 'placket', 'lace-up', 'hookEye'].includes(
        typeof spec.closure === 'string' ? spec.closure : spec.closure.type);

  // --- 1) BAŞ girişi: yaka açıklığı baştan geçer mi? ---
  // Bitmiş yaka çevresi (mm). draft.neckOpeningMM verilmezse spec'ten tahmin YOK
  // (uydurma yasak) → ÖLÇÜLMEDİ işareti.
  if (draft && draft.neckOpeningMM != null) {
    const effectiveNeck = draft.neckOpeningMM * stretch;
    if (!hasClosure && effectiveNeck < BODY.head) {
      const cozum = knit
        ? `örme yetmiyor (${(effectiveNeck).toFixed(0)}mm < ${BODY.head}mm baş) → yaka genişlet ya da kapanış ekle`
        : `dokuma + kapanışsız → fermuar/pat/düğme EKLE ya da fabric=knit + yaka ≥ ${Math.ceil(BODY.head / KNIT_STRETCH)}mm`;
      issues.push({ tip: 'giriş-yok', bolge: 'baş/yaka', olculen: `${draft.neckOpeningMM}mm x ${stretch} = ${effectiveNeck.toFixed(0)}mm`, gereken: `${BODY.head}mm`, cozum });
    }
  } else {
    issues.push({ tip: 'ÖLÇÜLMEDİ', bolge: 'baş/yaka', not: 'neckOpeningMM draft\'ta yok, giriş kontrolü yapılamadı' });
  }

  // --- 2) EL girişi: kol ağzı elden geçer mi? (kollu ise) ---
  if (spec.sleeveStyle && spec.sleeveStyle !== 'none' && draft && draft.sleeveOpeningMM != null) {
    const eff = draft.sleeveOpeningMM * stretch;
    if (eff < BODY.hand && !spec.cuffOpen) {
      issues.push({ tip: 'giriş-yok', bolge: 'el/kol-ağzı', olculen: `${eff.toFixed(0)}mm`, gereken: `${BODY.hand}mm`, cozum: 'kol ağzı genişlet ya da manşet açıklığı/düğme ekle' });
    }
  }

  // --- 3) BEL/KALÇA girişi: dar bel + kapanışsız → gövde geçmez ---
  // Sadece oturan (bel çekmeli) + kapanışsız + dokuma. boxy/bol muaf.
  if (spec.shaping !== 'boxy' && !hasClosure && draft && draft.waistFinishedMM != null) {
    const effWaist = draft.waistFinishedMM * stretch;
    if (effWaist < BODY.hip) {   // giyerken kalçadan geçmeli
      const cozum = knit ? `bel dar (${effWaist.toFixed(0)}mm < ${BODY.hip}mm kalça) → örme yetmiyor, kapanış ekle`
                         : 'dokuma + dar bel + kapanışsız → yan/arka fermuar EKLE';
      issues.push({ tip: 'giriş-yok', bolge: 'bel/kalça', olculen: `${effWaist.toFixed(0)}mm`, gereken: `${BODY.hip}mm`, cozum });
    }
  }

  return issues;
}

// kapı sonucu: PASS / FAIL + issue satırları
export function entryGate(spec, draft) {
  const issues = entryGuard(spec, draft);
  const fail = issues.some(i => i.tip === 'giriş-yok');
  return { pass: !fail, issues };
}
