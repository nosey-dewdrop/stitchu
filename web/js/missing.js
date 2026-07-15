// Honesty + attempt layer (BENCHMARK-58 Loop 2).
//
// The vision now reads structural elements the C++ engine cannot draw yet
// (closure, collar, straps, cup seams, sleeve head, yoke, back detail, plus a
// free honesty channel `outOfVocab`). Before Loop 2, the draft silently fell
// back to the nearest block and never told the user what it dropped — that
// silent fallback is what killed trust ("why doesn't it see the buttons").
//
// This module is the SINGLE SOURCE of that honesty. For every seen element it
// (1) tries the NEAREST derivative the engine CAN already draw, and (2) if
// there is no real formula, names the element so the user — and whoever prints
// the pattern — reads exactly "I saw this, I could not draw it in the pattern,
// here is the closest I gave you." No engine C++ is touched; this is spec/UI.
//
// One place, one truth: the derivative map and the missing-feature strings live
// here and here only. render.js (screen) and print.js (paper) both read this.

// ── Derivative map ──────────────────────────────────────────────────────────
// element the engine cannot draw  →  nearest thing it CAN draw today.
// `applied` = the derivative that shipped in the pattern (so the note reads
// "I gave you the closest: X"). `note` = why it is an approximation, not exact.
// EN + TR side by side (i18n follows the existing print.js inline-bilingual
// pattern; render/create pass getLang()).
//
// A derivative is only listed when it is a REAL structural approximation the
// engine already produces. Pure surface trim (a bow, a patch pocket) has no
// block derivative — it is reported as "not in the pattern" with no false
// "closest given".

// closure.type → derivative
const CLOSURE_DERIVATIVE = {
  buttons: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the button placket + buttonholes are not drawn — add a facing/placket and mark buttons yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'düğme patı + ilikler çizili değil — pat/tela ekle ve düğme yerlerini kendin işaretle' },
  },
  placket: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the buttoned placket band is not drawn — add a placket and mark buttons yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'düğmeli pat bandı çizili değil — pat ekle ve düğme yerlerini kendin işaretle' },
  },
  zipper: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the zip is not drafted with its own allowance — insert a zip along that seam yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'fermuar kendi payıyla çizili değil — o dikişe fermuarı kendin tak' },
  },
  ties: {
    en: { applied: 'a plain seamed edge where the ties sit', note: 'the fabric ties / bow are not drawn as pieces — cut simple strips and stitch them at that edge' },
    tr: { applied: 'bağların oturduğu düz dikişli kenar', note: 'kumaş bağlar / fiyonk parça olarak çizili değil — basit şeritler kes ve o kenara dik' },
  },
  'lace-up': {
    en: { applied: 'a plain closed center-back/front block', note: 'the corset lacing (eyelets + gap) is not drafted — this is a closed version, not a laced one' },
    tr: { applied: 'düz kapalı orta arka/ön blok', note: 'korse bağcığı (kuşgözü + boşluk) çizili değil — bu kapalı bir sürüm, bağcıklı değil' },
  },
  hookEye: {
    en: { applied: 'a plain seamed opening at that edge', note: 'hook-and-eye tape is not drafted — add it along that seam yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'kopça bandı çizili değil — o dikişe kendin ekle' },
  },
};

// collar.type → derivative (the engine draws necklines, never a separate collar)
const COLLAR_DERIVATIVE = {
  stand: 'neckline',
  shirt: 'neckline',
  peterPan: 'neckline',
  mandarin: 'neckline',
  notched: 'neckline',
  sailor: 'neckline',
  other: 'neckline',
};
const COLLAR_NOTE = {
  en: { applied: 'the plain neckline edge', note: 'the separate collar piece is not drafted — draft/buy a collar to that neckline yourself' },
  tr: { applied: 'düz yaka oyuğu kenarı', note: 'ayrı yaka parçası çizili değil — o oyuğa yakayı kendin çiz/ekle' },
};

// straps.type → derivative. The engine draws a plain sleeveless shoulder edge,
// so a normal shoulder/wide strap is effectively drawn; frills, halter framing,
// asymmetric and off-shoulder straps are NOT.
const STRAP_DRAWN = ['none', 'shoulder', 'wide']; // engine's plain edge is a fair match
const STRAP_DERIVATIVE = {
  spaghetti: {
    en: { applied: 'a plain narrow shoulder edge', note: 'the thin spaghetti straps are not drawn as pieces — cut narrow bias strips yourself' },
    tr: { applied: 'düz dar omuz kenarı', note: 'ince spagetti askılar parça olarak çizili değil — dar biye şeritler kes' },
  },
  ruffled: {
    en: { applied: 'a plain sleeveless shoulder edge', note: 'the ruffled/frilled strap is not drawn — add a gathered frill strip at the shoulder yourself' },
    tr: { applied: 'düz kolsuz omuz kenarı', note: 'fırfırlı askı çizili değil — omuza büzgülü fırfır şeridi kendin ekle' },
  },
  halter: {
    en: { applied: 'the halter neckline block', note: 'reported as a halter neckline; if the straps tie behind the neck as separate ties, add those yourself' },
    tr: { applied: 'halter yaka bloğu', note: 'halter yaka olarak verildi; askılar boyun arkasında ayrı bağ olarak bağlanıyorsa onları kendin ekle' },
  },
  oneShoulder: {
    en: { applied: 'a symmetric two-strap block', note: 'the ONE-shoulder asymmetry is not drafted — this is a symmetric version' },
    tr: { applied: 'simetrik iki-askı bloğu', note: 'TEK-omuz asimetrisi çizili değil — bu simetrik bir sürüm' },
  },
  offShoulder: {
    en: { applied: 'a straight-across bodice edge', note: 'the off-shoulder band that sits below the shoulders is not drafted — this sits on the shoulders' },
    tr: { applied: 'düz enine korsaj kenarı', note: 'omuz altına oturan düşük-omuz bandı çizili değil — bu omuz üstünde durur' },
  },
};

// sleeveHead → derivative. `plain` is exactly what the engine draws.
const SLEEVEHEAD_DERIVATIVE = {
  gathered: {
    en: { applied: 'a plain sleeve head', note: 'the gathered sleeve head was not drawn here — pick a straight sleeve and the "gathered" sleeve head to draw it' },
    tr: { applied: 'düz kol başı', note: 'büzgülü kol başı burada çizilmedi — düz kol + "büzgülü" kol başı seçersen çizilir' },
  },
  puffed: {
    en: { applied: 'a plain sleeve head', note: 'the puff sleeve head was not drawn here — pick a straight sleeve and the "puff" sleeve head to draw it' },
    tr: { applied: 'düz kol başı', note: 'puf kol başı burada çizilmedi — düz kol + "puf" kol başı seçersen çizilir' },
  },
  capped: {
    en: { applied: 'the plain short sleeve block', note: 'the true cap-sleeve shape is not drawn — a short straight sleeve is the closest' },
    tr: { applied: 'düz kısa kol bloğu', note: 'gerçek cap-kol şekli çizili değil — kısa düz kol en yakını' },
  },
};

// yoke → derivative. No block draws a separate yoke; all approximate to plain.
const YOKE_DERIVATIVE = {
  shoulderYoke: {
    en: { applied: 'a plain one-piece bodice', note: 'the separate shoulder yoke seam is not drawn — the bodice is one piece here' },
    tr: { applied: 'düz tek-parça korsaj', note: 'ayrı omuz robası dikişi çizili değil — burada korsaj tek parça' },
  },
  shirring: {
    en: { applied: 'a plain fitted panel', note: 'shirring/elastic gathering is not drafted — add rows of shirring elastic to that panel yourself' },
    tr: { applied: 'düz oturan panel', note: 'büzgü/lastik büzme çizili değil — o panele lastikli büzgü sıralarını kendin ekle' },
  },
  smocking: {
    en: { applied: 'a plain fitted panel', note: 'smocking is not drafted — add the smocked stitching to that panel yourself' },
    tr: { applied: 'düz oturan panel', note: 'smocking çizili değil — o panele smock dikişini kendin ekle' },
  },
};

// backDetail → derivative
const BACKDETAIL_DERIVATIVE = {
  openBack: {
    en: { applied: 'a plain closed back', note: 'the open/cut-out back is not drafted — this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'açık/oyuk sırt çizili değil — bu sırt kapalı' },
  },
  keyholeBack: {
    en: { applied: 'a plain closed back', note: 'the back keyhole cut-out is not drafted — this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'sırt damla oyuğu çizili değil — bu sırt kapalı' },
  },
  vBack: {
    en: { applied: 'a plain closed back', note: 'the deep V back is not drafted — this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'derin V sırt çizili değil — bu sırt kapalı' },
  },
  tieBack: {
    en: { applied: 'a plain closed back', note: 'the fabric ties/bow at the back are not drawn as pieces — cut strips and stitch them yourself' },
    tr: { applied: 'düz kapalı sırt', note: 'sırttaki kumaş bağlar/fiyonk parça olarak çizili değil — şeritler kes ve kendin dik' },
  },
  lacedBack: {
    en: { applied: 'a plain closed back', note: 'the corset back lacing is not drafted — this back is closed, not laced' },
    tr: { applied: 'düz kapalı sırt', note: 'korse sırt bağcığı çizili değil — bu sırt kapalı, bağcıklı değil' },
  },
  buttonBack: {
    en: { applied: 'a plain closed back', note: 'the back button placket is not drawn — add a placket and mark buttons yourself' },
    tr: { applied: 'düz kapalı sırt', note: 'sırt düğme patı çizili değil — pat ekle ve düğme yerlerini kendin işaretle' },
  },
};

const CUPSEAM_NOTE = {
  en: { applied: 'a darted/princess-shaped bust', note: 'separate bra-cup seams are not drafted — bust shaping is by dart/princess seam here' },
  tr: { applied: 'pens/prenses biçimli göğüs', note: 'ayrı kup dikişleri çizili değil — göğüs biçimi burada pens/prenses dikişiyle' },
};

// ── Compute the honest missing-feature list from spec.seen ──────────────────
// Returns [{ label, applied, note }] — label = what was seen (couture term),
// applied = the derivative that shipped (or null if nothing block-derivable),
// note = the honest caveat. `seen` is spec.seen enriched with `sleeveStyle` (the
// drafted sleeve) so we can tell whether a seen puff WAS drawn (user picked
// balloon) and not falsely flag it as missing.
export function missingFeatures(seen, lang) {
  if (!seen) return [];
  const L = lang === 'tr' ? 'tr' : 'en';
  const out = [];
  const push = (label, derivative) =>
    out.push({ label, applied: derivative ? derivative.applied : null, note: derivative ? derivative.note : null });

  // closure — skipped when the engine DREW it (Loop 3: front button placket;
  // Loop 4b: a simple applied fabric tie/sash/bow is now real drawn strips, so a
  // ties-closure is skipped when tieDrawn). Drawstring-gathered ties keep
  // tieDrawn false and still report here.
  const tieClosureDrawn = seen.tieDrawn && seen.closure && seen.closure.type === 'ties';
  if (seen.closure && seen.closure.type && seen.closure.type !== 'none' &&
      !seen.closureDrawn && !tieClosureDrawn) {
    const d = CLOSURE_DERIVATIVE[seen.closure.type];
    const loc = seen.closure.location ? ` (${seen.closure.location})` : '';
    push((L === 'tr' ? closureLabelTr(seen.closure.type) : closureLabelEn(seen.closure.type)) + loc, d ? d[L] : null);
  }

  // collar (only when a real collar, not "none")
  if (seen.collar && seen.collar.type && seen.collar.type !== 'none') {
    const name = seen.collar.name ? seen.collar.name : (L === 'tr' ? 'yaka' : 'collar');
    push(name, COLLAR_NOTE[L]);
  }

  // straps — only the ones the plain edge does NOT fairly cover
  if (seen.straps && seen.straps.type && !STRAP_DRAWN.includes(seen.straps.type)) {
    const d = STRAP_DERIVATIVE[seen.straps.type];
    push((L === 'tr' ? strapLabelTr(seen.straps.type) : strapLabelEn(seen.straps.type)), d ? d[L] : null);
  }

  // cup seams
  if (seen.cupSeams === true) {
    push(L === 'tr' ? 'ayrı kup göğüs dikişleri' : 'separate bust-cup seams', CUPSEAM_NOTE[L]);
  }

  // sleeve head — only when it is NOT plain AND the engine did not draw it.
  // Loop 6: the engine now DRAWS a gathered/puff head directly (raised + widened
  // cap + crown gather), flagged by seen.sleeveCapDrawn — so those no longer list
  // as missing. A cap sleeve (true short cap SHAPE) still stays honest.
  if (seen.sleeveHead && seen.sleeveHead !== 'plain') {
    const headDrawn = (seen.sleeveHead === 'gathered' || seen.sleeveHead === 'puffed') && seen.sleeveCapDrawn;
    if (!headDrawn) {
      const d = SLEEVEHEAD_DERIVATIVE[seen.sleeveHead];
      push((L === 'tr' ? sleeveHeadLabelTr(seen.sleeveHead) : sleeveHeadLabelEn(seen.sleeveHead)), d ? d[L] : null);
    }
  }

  // yoke
  if (seen.yoke && seen.yoke.type && seen.yoke.type !== 'none') {
    const d = YOKE_DERIVATIVE[seen.yoke.type];
    push((L === 'tr' ? yokeLabelTr(seen.yoke.type) : yokeLabelEn(seen.yoke.type)), d ? d[L] : null);
  }

  // back detail — a tieBack is now DRAWN as strips (Loop 4b), so skip it when
  // tieDrawn; every other back detail (open/laced/keyhole back) stays honest.
  const tieBackDrawn = seen.tieDrawn && seen.backDetail === 'tieBack';
  if (seen.backDetail && seen.backDetail !== 'none' && !tieBackDrawn) {
    const d = BACKDETAIL_DERIVATIVE[seen.backDetail];
    push((L === 'tr' ? backLabelTr(seen.backDetail) : backLabelEn(seen.backDetail)), d ? d[L] : null);
  }

  // honesty channel — everything the structured fields could not express.
  // These never have a block derivative (they are surface/construction trim),
  // so they report as "seen, not in the pattern". Skip an outOfVocab item that
  // a structured field already reported (the prompt sometimes lists e.g.
  // "ruffled straps" in BOTH straps.type and outOfVocab — one line, not two).
  const already = out.map((o) => norm(o.label));
  for (const raw of seen.outOfVocab || []) {
    const label = String(raw).trim();
    if (label && !already.includes(norm(label))) {
      already.push(norm(label));
      push(label, null);
    }
  }

  return out;
}

// Loose match so "ruffled straps" (outOfVocab) dedupes against the strap label.
function norm(s) { return String(s).toLowerCase().replace(/[^a-zçğıöşü ]/gi, '').trim(); }

// Short human labels for the seen element (so the note reads naturally).
function closureLabelEn(t) {
  return { buttons: 'button closure', placket: 'buttoned placket', zipper: 'zip closure', ties: 'fabric ties / bow', 'lace-up': 'corset lacing', hookEye: 'hook-and-eye closure' }[t] || 'closure';
}
function closureLabelTr(t) {
  return { buttons: 'düğme kapanması', placket: 'düğmeli pat', zipper: 'fermuar', ties: 'kumaş bağ / fiyonk', 'lace-up': 'korse bağcığı', hookEye: 'kopça kapanması' }[t] || 'kapanma';
}
function strapLabelEn(t) {
  return { spaghetti: 'spaghetti straps', ruffled: 'ruffled straps', halter: 'halter straps', oneShoulder: 'one-shoulder strap', offShoulder: 'off-shoulder band' }[t] || 'straps';
}
function strapLabelTr(t) {
  return { spaghetti: 'spagetti askılar', ruffled: 'fırfırlı askılar', halter: 'halter askılar', oneShoulder: 'tek-omuz askı', offShoulder: 'düşük-omuz bandı' }[t] || 'askılar';
}
function sleeveHeadLabelEn(t) {
  return { gathered: 'gathered puff sleeve head', puffed: 'puffed sleeve head', capped: 'cap sleeve' }[t] || 'sleeve head';
}
function sleeveHeadLabelTr(t) {
  return { gathered: 'büzgülü puf kol başı', puffed: 'puf kol başı', capped: 'cap kol' }[t] || 'kol başı';
}
function yokeLabelEn(t) {
  return { shoulderYoke: 'shoulder yoke', shirring: 'shirred panel', smocking: 'smocked panel' }[t] || 'yoke';
}
function yokeLabelTr(t) {
  return { shoulderYoke: 'omuz robası', shirring: 'büzgülü panel', smocking: 'smock panel' }[t] || 'roba';
}
function backLabelEn(t) {
  return { openBack: 'open/cut-out back', keyholeBack: 'back keyhole', vBack: 'deep V back', tieBack: 'tie back', lacedBack: 'laced back', buttonBack: 'back button placket' }[t] || 'back detail';
}
function backLabelTr(t) {
  return { openBack: 'açık/oyuk sırt', keyholeBack: 'sırt damla oyuğu', vBack: 'derin V sırt', tieBack: 'bağlı sırt', lacedBack: 'bağcıklı sırt', buttonBack: 'sırt düğme patı' }[t] || 'sırt detayı';
}

// Fixed headings, EN + TR (couture-plain, no invented ornament).
export const MISSING_STRINGS = {
  heading: { en: 'What I saw vs what the pattern draws', tr: 'Gördüklerim ve kalıbın çizdikleri' },
  intro: {
    en: 'I read these details on the garment but the pattern engine cannot draft them yet. For each, here is the closest I gave you — add the rest by hand:',
    tr: 'Bu ayrıntıları giysinin üzerinde gördüm ama kalıp motoru bunları henüz çizemiyor. Her biri için sana verdiğim en yakınını yazdım — kalanını elle ekle:',
  },
  gaveClosest: { en: 'closest given', tr: 'verilen en yakın' },
  notInPattern: { en: 'not in the pattern — add by hand', tr: 'kalıpta yok — elle ekle' },
};
