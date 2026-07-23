// Honesty + attempt layer (BENCHMARK-58 Loop 2).
//
// The vision now reads structural elements the C++ engine cannot draw yet
// (closure, collar, straps, cup seams, sleeve head, yoke, back detail, plus a
// free honesty channel `outOfVocab`). Before Loop 2, the draft silently fell
// back to the nearest block and never told the user what it dropped, that
// silent fallback is what killed trust ("why doesn't it see the buttons").
//
// This module is the SINGLE SOURCE of that honesty. For every seen element it
// (1) tries the NEAREST derivative the engine CAN already draw, and (2) if
// there is no real formula, names the element so the user, and whoever prints
// the pattern, reads exactly "I saw this, I could not draw it in the pattern,
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
// block derivative, it is reported as "not in the pattern" with no false
// "closest given".

// closure.type → derivative
const CLOSURE_DERIVATIVE = {
  buttons: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the button placket + buttonholes are not drawn, add a facing/placket and mark buttons yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'düğme patı + ilikler çizili değil, pat/tela ekle ve düğme yerlerini kendin işaretle' },
  },
  placket: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the buttoned placket band is not drawn, add a placket and mark buttons yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'düğmeli pat bandı çizili değil, pat ekle ve düğme yerlerini kendin işaretle' },
  },
  zipper: {
    en: { applied: 'a plain seamed opening at that edge', note: 'the zip is not drafted with its own allowance, insert a zip along that seam yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'fermuar kendi payıyla çizili değil, o dikişe fermuarı kendin tak' },
  },
  ties: {
    en: { applied: 'a plain seamed edge where the ties sit', note: 'the fabric ties / bow are not drawn as pieces, cut simple strips and stitch them at that edge' },
    tr: { applied: 'bağların oturduğu düz dikişli kenar', note: 'kumaş bağlar / fiyonk parça olarak çizili değil, basit şeritler kes ve o kenara dik' },
  },
  'lace-up': {
    en: { applied: 'a plain closed center-back/front block', note: 'the corset lacing (eyelets + gap) is not drafted, this is a closed version, not a laced one' },
    tr: { applied: 'düz kapalı orta arka/ön blok', note: 'korse bağcığı (kuşgözü + boşluk) çizili değil, bu kapalı bir sürüm, bağcıklı değil' },
  },
  hookEye: {
    en: { applied: 'a plain seamed opening at that edge', note: 'hook-and-eye tape is not drafted, add it along that seam yourself' },
    tr: { applied: 'o kenarda düz dikişli bir açıklık', note: 'kopça bandı çizili değil, o dikişe kendin ekle' },
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
  en: { applied: 'the plain neckline edge', note: 'the separate collar piece is not drafted, draft/buy a collar to that neckline yourself' },
  tr: { applied: 'düz yaka oyuğu kenarı', note: 'ayrı yaka parçası çizili değil, o oyuğa yakayı kendin çiz/ekle' },
};
// Loop 7/8: the collar family the engine now draws as a REAL separate piece
// (neck edge trued to the neckline). A vision collar of one of these types is no
// longer listed as missing. Patch 3.10 also made bias binding the DEFAULT
// neckline/armhole finish, so a "bias-bound / bound edge" read (a bound raw
// edge, no structural collar) is now genuinely drawn and is no longer honest.
// A notched/sailor tailored collar still stays honest here.
const COLLAR_DRAWN = ['stand', 'mock', 'mandarin', 'flat', 'peterPan', 'scallop', 'shirt',
                      'bias', 'biasBound', 'bound', 'binding'];

// straps.type → derivative. The engine draws a plain sleeveless shoulder edge,
// so a normal shoulder/wide strap is effectively drawn; frills, halter framing,
// asymmetric and off-shoulder straps are NOT.
const STRAP_DRAWN = ['none', 'shoulder', 'wide']; // engine's plain edge is a fair match
const STRAP_DERIVATIVE = {
  spaghetti: {
    en: { applied: 'a plain narrow shoulder edge', note: 'the thin spaghetti straps are not drawn as pieces, cut narrow bias strips yourself' },
    tr: { applied: 'düz dar omuz kenarı', note: 'ince spagetti askılar parça olarak çizili değil, dar biye şeritler kes' },
  },
  ruffled: {
    en: { applied: 'a plain sleeveless shoulder edge', note: 'the ruffled/frilled strap is not drawn, add a gathered frill strip at the shoulder yourself' },
    tr: { applied: 'düz kolsuz omuz kenarı', note: 'fırfırlı askı çizili değil, omuza büzgülü fırfır şeridi kendin ekle' },
  },
  halter: {
    en: { applied: 'the halter neckline block', note: 'reported as a halter neckline; if the straps tie behind the neck as separate ties, add those yourself' },
    tr: { applied: 'halter yaka bloğu', note: 'halter yaka olarak verildi; askılar boyun arkasında ayrı bağ olarak bağlanıyorsa onları kendin ekle' },
  },
  oneShoulder: {
    en: { applied: 'a symmetric two-strap block', note: 'the ONE-shoulder asymmetry is not drafted, this is a symmetric version' },
    tr: { applied: 'simetrik iki-askı bloğu', note: 'TEK-omuz asimetrisi çizili değil, bu simetrik bir sürüm' },
  },
  offShoulder: {
    en: { applied: 'a straight-across bodice edge', note: 'the off-shoulder band that sits below the shoulders is not drafted, this sits on the shoulders' },
    tr: { applied: 'düz enine korsaj kenarı', note: 'omuz altına oturan düşük-omuz bandı çizili değil, bu omuz üstünde durur' },
  },
};

// sleeveHead → derivative. `plain` is exactly what the engine draws.
const SLEEVEHEAD_DERIVATIVE = {
  gathered: {
    en: { applied: 'a plain sleeve head', note: 'the gathered sleeve head was not drawn here, pick a straight sleeve and the "gathered" sleeve head to draw it' },
    tr: { applied: 'düz kol başı', note: 'büzgülü kol başı burada çizilmedi, düz kol + "büzgülü" kol başı seçersen çizilir' },
  },
  puffed: {
    en: { applied: 'a plain sleeve head', note: 'the puffed sleeve head was not drawn here, pick a straight sleeve and the puffed sleeve head to draw it' },
    tr: { applied: 'düz kol başı', note: 'puf kol başı burada çizilmedi, düz kol + "puf" kol başı seçersen çizilir' },
  },
  capped: {
    en: { applied: 'the plain short sleeve block', note: 'the true cap-sleeve shape is not drawn, a short straight sleeve is the closest' },
    tr: { applied: 'düz kısa kol bloğu', note: 'gerçek cap-kol şekli çizili değil, kısa düz kol en yakını' },
  },
};

// yoke → derivative. No block draws a separate yoke; all approximate to plain.
const YOKE_DERIVATIVE = {
  shoulderYoke: {
    en: { applied: 'a plain one-piece bodice', note: 'the separate shoulder yoke seam is not drawn, the bodice is one piece here' },
    tr: { applied: 'düz tek-parça korsaj', note: 'ayrı omuz robası dikişi çizili değil, burada korsaj tek parça' },
  },
  shirring: {
    en: { applied: 'a plain fitted panel', note: 'shirring/elastic gathering is not drafted, add rows of shirring elastic to that panel yourself' },
    tr: { applied: 'düz oturan panel', note: 'büzgü/lastik büzme çizili değil, o panele lastikli büzgü sıralarını kendin ekle' },
  },
  smocking: {
    en: { applied: 'a plain fitted panel', note: 'smocking is not drafted, add the smocked stitching to that panel yourself' },
    tr: { applied: 'düz oturan panel', note: 'smocking çizili değil, o panele smock dikişini kendin ekle' },
  },
};

// backDetail → derivative
const BACKDETAIL_DERIVATIVE = {
  openBack: {
    en: { applied: 'a plain closed back', note: 'the open/cut-out back is not drafted, this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'açık/oyuk sırt çizili değil, bu sırt kapalı' },
  },
  keyholeBack: {
    en: { applied: 'a plain closed back', note: 'the back keyhole cut-out is not drafted, this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'sırt damla oyuğu çizili değil, bu sırt kapalı' },
  },
  vBack: {
    en: { applied: 'a plain closed back', note: 'the deep V back is not drafted, this back is closed' },
    tr: { applied: 'düz kapalı sırt', note: 'derin V sırt çizili değil, bu sırt kapalı' },
  },
  tieBack: {
    en: { applied: 'a plain closed back', note: 'the fabric ties/bow at the back are not drawn as pieces, cut strips and stitch them yourself' },
    tr: { applied: 'düz kapalı sırt', note: 'sırttaki kumaş bağlar/fiyonk parça olarak çizili değil, şeritler kes ve kendin dik' },
  },
  lacedBack: {
    en: { applied: 'a plain closed back', note: 'the corset back lacing is not drafted, this back is closed, not laced' },
    tr: { applied: 'düz kapalı sırt', note: 'korse sırt bağcığı çizili değil, bu sırt kapalı, bağcıklı değil' },
  },
  buttonBack: {
    en: { applied: 'a plain closed back', note: 'the back button placket is not drawn, add a placket and mark buttons yourself' },
    tr: { applied: 'düz kapalı sırt', note: 'sırt düğme patı çizili değil, pat ekle ve düğme yerlerini kendin işaretle' },
  },
};

const CUPSEAM_NOTE = {
  en: { applied: 'a darted/princess-shaped bust', note: 'separate bra-cup seams are not drafted, bust shaping is by dart/princess seam here' },
  tr: { applied: 'pens/prenses biçimli göğüs', note: 'ayrı kup dikişleri çizili değil, göğüs biçimi burada pens/prenses dikişiyle' },
};

// ── Compute the honest missing-feature list from spec.seen ──────────────────
// Returns [{ label, applied, note }], label = what was seen (couture term),
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

  // closure, skipped when the engine DREW it (Loop 3: front button placket;
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

  // collar, only when a real collar the engine does NOT draw. The stand/mock/
  // flat/peter-pan/shirt family is now a real drafted piece (seen.collarDrawn set
  // by create.js when the vision collar maps to a drawable type), so it is not
  // listed; bias-bound / notched / sailor finishes stay honest.
  if (seen.collar && seen.collar.type && seen.collar.type !== 'none' &&
      !seen.collarDrawn && !COLLAR_DRAWN.includes(seen.collar.type)) {
    const name = seen.collar.name ? seen.collar.name : (L === 'tr' ? 'yaka' : 'collar');
    push(name, COLLAR_NOTE[L]);
  }

  // straps, only the ones the plain edge does NOT fairly cover. queue #3: a
  // RUFFLED strap is now DRAWN as a separate gathered strip pair (seen.
  // ruffledStrapsDrawn), so it no longer lists as missing. A spaghetti / one-
  // shoulder / off-shoulder / halter strap stays honest (a different construction).
  if (seen.straps && seen.straps.type && !STRAP_DRAWN.includes(seen.straps.type)) {
    // vocab 2026-07-17: an off-shoulder / bardot strap read is now DRAWN as an
    // off-shoulder band (bardotDrawn), so it no longer lists as missing.
    const strapDrawn = (seen.ruffledStrapsDrawn && seen.straps.type === 'ruffled') ||
      (seen.bardotDrawn && seen.straps.type === 'offShoulder');
    if (!strapDrawn) {
      const d = STRAP_DERIVATIVE[seen.straps.type];
      push((L === 'tr' ? strapLabelTr(seen.straps.type) : strapLabelEn(seen.straps.type)), d ? d[L] : null);
    }
  }

  // cup seams, only when the engine did NOT draw them. cupseam.cpp now draws a
  // horizontal Upper/Lower cup seam for a strapless princess bustier (flagged by
  // seen.cupSeamDrawn from create.js). A sleeved bodice cup seam / a dart bust the
  // engine refused stays honest here.
  if (seen.cupSeams === true && !seen.cupSeamDrawn) {
    push(L === 'tr' ? 'ayrı kup göğüs dikişleri' : 'separate bust-cup seams', CUPSEAM_NOTE[L]);
  }

  // sleeve head, only when it is NOT plain AND the engine did not draw it.
  // Loop 6: the engine draws a gathered/puff head directly (raised + widened cap
  // + crown gather), flagged by seen.sleeveCapDrawn. R1.2: the engine now also
  // draws the short CAP-sleeve wing (seen.capSleeveDrawn). A drawstring-gathered
  // sleeve stays honest.
  if (seen.sleeveHead && seen.sleeveHead !== 'plain') {
    const headDrawn =
      ((seen.sleeveHead === 'gathered' || seen.sleeveHead === 'puffed') && seen.sleeveCapDrawn) ||
      (seen.sleeveHead === 'capped' && seen.capSleeveDrawn);
    if (!headDrawn) {
      const d = SLEEVEHEAD_DERIVATIVE[seen.sleeveHead];
      push((L === 'tr' ? sleeveHeadLabelTr(seen.sleeveHead) : sleeveHeadLabelEn(seen.sleeveHead)), d ? d[L] : null);
    }
  }

  // yoke, now DRAWN as a real Front/Back Yoke + Body split (yoke.cpp, flagged by
  // seen.yokeDrawn from create.js): a plain shoulderYoke → yoke:1, a shirred/
  // smocked yoke → yoke:2. Either way it is a real drafted piece now, so skip it.
  // (A shirred/smocked yoke drawn instead as a gathered PANEL, seen.gatherDrawn,
  // is also covered.) A yoke on a skirt the engine refused stays honest.
  if (seen.yoke && seen.yoke.type && seen.yoke.type !== 'none') {
    const gatheredYoke = seen.gatherDrawn &&
      (seen.yoke.type === 'shirring' || seen.yoke.type === 'smocking');
    if (!seen.yokeDrawn && !gatheredYoke) {
      const d = YOKE_DERIVATIVE[seen.yoke.type];
      push((L === 'tr' ? yokeLabelTr(seen.yoke.type) : yokeLabelEn(seen.yoke.type)), d ? d[L] : null);
    }
  }

  // back detail, a tieBack is now DRAWN as strips (Loop 4b), so skip it when
  // tieDrawn; an open/keyhole/V back cut-out is now DRAWN as a facing-finished
  // opening (Loop 9b), so skip it when backOpeningDrawn. A laced back / back
  // button placket stays honest. (A tie-back photo often has BOTH a tie AND an
  // open cut-out, the tie is suppressed by tieDrawn, the cut-out by
  // backOpeningDrawn; a laced back stays honest either way.)
  const tieBackDrawn = seen.tieDrawn && seen.backDetail === 'tieBack';
  const openBackDrawn = seen.backOpeningDrawn &&
    ['openBack', 'keyholeBack', 'vBack'].includes(seen.backDetail);
  // vocab 2026-07-17: a cape/ruffle/flounce back is now DRAWN as a separate piece
  // (backDetailDrawn), so it no longer lists as missing.
  const backDetailPieceDrawn = seen.backDetailDrawn &&
    ['cape', 'ruffle', 'flounce', 'backCape', 'backRuffle', 'backFlounce'].includes(seen.backDetail);
  if (seen.backDetail && seen.backDetail !== 'none' && !tieBackDrawn && !openBackDrawn &&
      !backDetailPieceDrawn) {
    const d = BACKDETAIL_DERIVATIVE[seen.backDetail];
    push((L === 'tr' ? backLabelTr(seen.backDetail) : backLabelEn(seen.backDetail)), d ? d[L] : null);
  }

  // honesty channel, everything the structured fields could not express.
  // These never have a block derivative (they are surface/construction trim),
  // so they report as "seen, not in the pattern". Skip an outOfVocab item that
  // a structured field already reported (the prompt sometimes lists e.g.
  // "ruffled straps" in BOTH straps.type and outOfVocab, one line, not two).
  const already = out.map((o) => norm(o.label));
  // Loop 8: a drawstring / shirred / smocked / gathered PANEL is now drawn, so an
  // outOfVocab term naming that gathering is no longer missing. A gathered SLEEVE
  // that needs an arm casing is a different (undrawn) construction and stays
  // honest even when gatherDrawn (a neckline/bust panel was drawn, not the sleeve).
  const gatherTerm = (t) => /drawstring|shirr|smock|gathered|gathering/i.test(t);
  const sleeveGather = (t) => /sleeve/i.test(t) && /drawstring|gathered|shirr/i.test(t);
  // Loop 9b: an open-back cut-out (round / low-V / square / keyhole back) is now
  // drawn as a facing-finished opening, so an outOfVocab term naming that opening
  // is no longer missing. A tie-back closure term is a DIFFERENT construction
  // (Loop 4b handles the tie) and is not suppressed here.
  const openBackTerm = (t) => /open.?back|back.?cutout|backless|low open back/i.test(t) &&
    !/tie|lace/i.test(t);
  // Loop M1: a back hem slit / walking vent is now drawn (CB seam + bar tack +
  // lapped extension), so an outOfVocab term naming that back slit is no longer
  // missing. A FRONT or SIDE slit is a different (undrawn) opening and stays
  // honest even when hemSlitDrawn (only the center-back walking vent is drawn).
  const hemSlitTerm = (t) => /(back|hem|walking)[\s-]*(hem[\s-]*)?(slit|vent)|kick[\s-]*(pleat|vent)/i.test(t) &&
    !/front|side/i.test(t);
  // queue #3: a ruffled shoulder strap is now drawn as a separate gathered strip
  // pair, so an outOfVocab term naming a ruffled/frilled/flutter strap is no longer
  // missing. A spaghetti / one-shoulder / off-shoulder / halter strap stays honest.
  const strapTerm = (t) => /(ruffled?|frilled?|gathered|flutter)\s*(shoulder\s*)?strap/i.test(t) &&
    !/spaghetti|halter|one[\s-]?shoulder|off[\s-]?shoulder/i.test(t);
  // R1.1: a full/half/pointed circular peplum is now drawn as a separate flared
  // piece trued to the waist, so an outOfVocab term naming that peplum is no
  // longer missing. A pleated/gathered/draped/tiered peplum is a different
  // construction the engine does NOT draft and stays honest.
  const peplumTerm = (t) => /peplum|waist flounce|waist frill/i.test(t) &&
    !/pleated|gathered|draped|tiered|box[\s-]?pleat/i.test(t);
  // R1.2: an asymmetric button placket is now drawn (the CF stand shifted off
  // center), so an outOfVocab term naming an asymmetric/offset/diagonal button
  // front is no longer missing. It must name a button/placket closure.
  const asymPlacketTerm = (t) =>
    /(asymmetric|asymmetrical|offset|off[\s-]?cent|diagonal)/i.test(t) &&
    /(button|placket|closure|front)/i.test(t);
  // R1.2: the short cap-sleeve wing is now drawn, so an outOfVocab term naming a
  // "cap sleeve" is no longer missing. A dropped/off-shoulder sleeve is different.
  const capSleeveTerm = (t) => /\bcap\s*sleeve/i.test(t) && !/drop|off[\s-]?shoulder/i.test(t);
  // patch 3.12: a patch pocket or a side-seam in-seam pocket is now drawn, so an
  // outOfVocab term naming that pocket is no longer missing. A welt / besom /
  // bound / jetted / cargo / flap / kangaroo / zip pocket is a DIFFERENT
  // construction the engine does NOT draft and stays honest.
  const pocketTerm = (t) => /pocket/i.test(t) &&
    !/welt|besom|bound|jetted|cargo|flap|kangaroo|zip(per)?/i.test(t);
  // patch 3.16: a cowl neckline is now drawn (deep + wide front cut on the bias
  // with drape excess), so an outOfVocab term naming a cowl / draped cowl neck is
  // no longer missing. An asymmetric / multi-layer draped cowl stays honest.
  const cowlNeck = seen.neckline === 'cowl';
  const cowlTerm = (t) => /cowl(\s*neck)?|draped?\s*(neck|neckline)/i.test(t) &&
    !/asymmetric|asymmetrical|layered|multi/i.test(t);
  // patch 3.16: a pussy-bow neckline is now drawn (high neck band + a long
  // self-lined tie strip that knots into a bow), so an outOfVocab term naming a
  // pussy-bow / neck-tie bow is no longer missing. An asymmetric bow stays honest.
  const bowNeck = seen.neckline === 'pussyBow';
  const bowNeckTerm = (t) => /pussy[\s-]?bow|neck\s*bow|bow\s*(tie|neck|collar)|tie[\s-]?neck/i.test(t) &&
    !/asymmetric|asymmetrical/i.test(t);
  // patch 3.13: a button/ribbed cuff at the sleeve end is now drawn as a separate
  // band trued to the wrist, so an outOfVocab term naming a button/barrel/shirt/
  // ribbed/knit cuff is no longer missing. A FRENCH cuff (double turn-back), an
  // ELASTIC-casing cuff, and a RUFFLE/TIE cuff are a different construction the
  // engine does NOT draft and stay honest.
  const cuffTerm = (t) => /\bcuff\b/i.test(t) &&
    /button|barrel|shirt|rib(bed)?|knit|bomber/i.test(t) &&
    !/french|elastic|casing|ruffle|frill|tie/i.test(t);
  // patch 3.15: a shirt-tail / high-low hem is now drawn by reshaping the fitted
  // lower edge, so an outOfVocab term naming that hem shape is no longer missing.
  // A handkerchief / pointed / asymmetric-diagonal hem is a different construction
  // the engine does NOT draw and stays honest.
  const hemShapeTerm = (t) =>
    /(shirt[\s-]?tail|shirttail|high[\s-]?low|mullet|curved hem|curved hemline)/i.test(t) &&
    !/handkerchief|pointed|asymmetric|diagonal/i.test(t);
  // vocab 2026-07-17: an off-shoulder / bardot neckline is now drawn (top edge
  // dropped below the shoulder + elastic casing), so an outOfVocab term naming an
  // off-shoulder / bardot neck is no longer missing. A one-shoulder / strapless
  // off-shoulder stays honest.
  const bardotTerm = (t) => /off[\s-]?shoulder|bardot/i.test(t) &&
    !/one[\s-]?shoulder|strapless|structured|boned/i.test(t);
  // vocab 2026-07-17: a back ruffle / cape / flounce is now drawn as a separate
  // piece, so an outOfVocab term naming a caped/ruffled/flounced BACK is no longer
  // missing. A hood / watteau / shoulder cape stays honest.
  const backDetailTerm = (t) =>
    /(back|cape).*(cape|ruffle|frill|flounce|cascade)|caped back|cape back|pelerin/i.test(t) &&
    !/hood|watteau|train|shoulder cape/i.test(t);
  // boxpleat.cpp: a center inverted box pleat is now drawn behind the CF panel, so
  // an outOfVocab term naming a center box / inverted pleat is no longer missing. A
  // knife/accordion/sunburst/kick pleat is a different construction that stays honest.
  const boxPleatTerm = (t) =>
    /(center|centre|central|front|cf)[\s-]*(box|inverted)[\s-]*pleat|(box|inverted)[\s-]*pleat|center fold pleat/i.test(t) &&
    !/knife|accordion|sunburst|sunray|kick|side pleat/i.test(t);
  // cupseam.cpp: a horizontal bust-cup seam is now drawn (Upper/Lower cup) for a
  // strapless princess bustier, so an outOfVocab term naming a cup seam / bra-cup
  // / bustier cup is no longer missing. A moulded/foam/padded cup (no seam) is a
  // different construction that stays honest.
  const cupSeamTerm = (t) =>
    /cup seam|bra[\s-]?cup|bustier cup|corset cup|seamed cup|underbust seam|cup bodice/i.test(t) &&
    !/moulded|molded|foam|padded/i.test(t);
  // yoke.cpp: a plain/gathered yoke split is now drawn (Front/Back Yoke + Body),
  // so an outOfVocab term naming a yoke / shirred-yoke / smocked-yoke / babydoll
  // yoke is no longer missing. (The gathered-panel path also covers a shirred yoke
  // via gatherTerm above; this covers the yoke-SPLIT wiring.)
  const yokeTerm = (t) =>
    /\byoke\b|shirr(ed|ing)?\s*(yoke|bodice|panel)|smock(ed|ing)?\s*(yoke|bodice|panel)|babydoll\s*yoke/i.test(t);
  // vocab 2026-07-17: an exposed / visible zipper is now drawn as a teeth glyph on
  // the CF/CB seam, so an outOfVocab term naming an exposed/visible zip is no
  // longer missing. A separating / two-way / diagonal zip stays honest.
  const exposedZipTerm = (t) => /(exposed|visible|statement|contrast)\s*zip(per)?/i.test(t) &&
    !/separating|two[\s-]?way|diagonal/i.test(t);
  // vocab 2026-07-17: a decorative / functional button row is now drawn as real
  // button circles down the front, so an outOfVocab term naming a button
  // row/front is no longer missing when a row was drawn.
  const buttonRowTerm = (t) => /button\s*(row|front|down|placket|closure)|row of buttons/i.test(t);
  for (const raw of seen.outOfVocab || []) {
    const label = String(raw).trim();
    if (seen.gatherDrawn && gatherTerm(label) && !sleeveGather(label)) continue;
    if (seen.backOpeningDrawn && openBackTerm(label)) continue;
    if (seen.hemSlitDrawn && hemSlitTerm(label)) continue;
    if (seen.ruffledStrapsDrawn && strapTerm(label)) continue;
    if (seen.peplumDrawn && peplumTerm(label)) continue;
    if (seen.placketAsymDrawn && asymPlacketTerm(label)) continue;
    if (seen.capSleeveDrawn && capSleeveTerm(label)) continue;
    if (seen.pocketDrawn && pocketTerm(label)) continue;
    if (cowlNeck && cowlTerm(label)) continue;
    if (bowNeck && bowNeckTerm(label)) continue;
    if (seen.cuffDrawn && cuffTerm(label)) continue;
    if (seen.hemShapeDrawn && hemShapeTerm(label)) continue;
    if (seen.bardotDrawn && bardotTerm(label)) continue;
    if (seen.backDetailDrawn && backDetailTerm(label)) continue;
    if (seen.boxPleatDrawn && boxPleatTerm(label)) continue;
    if (seen.cupSeamDrawn && cupSeamTerm(label)) continue;
    if (seen.yokeDrawn && yokeTerm(label)) continue;
    if (seen.exposedZipDrawn && exposedZipTerm(label)) continue;
    if (seen.buttonRowDrawn && buttonRowTerm(label)) continue;
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
    en: 'I read these details on the garment but the pattern engine cannot draft them yet. For each, here is the closest I gave you, add the rest by hand:',
    tr: 'Bu ayrıntıları giysinin üzerinde gördüm ama kalıp motoru bunları henüz çizemiyor. Her biri için sana verdiğim en yakınını yazdım, kalanını elle ekle:',
  },
  gaveClosest: { en: 'closest given', tr: 'verilen en yakın' },
  notInPattern: { en: 'not in the pattern, add by hand', tr: 'kalıpta yok, elle ekle' },
};
