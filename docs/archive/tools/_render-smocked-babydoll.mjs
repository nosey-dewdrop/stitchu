// One-off: draft shirt-collar-smocked-babydoll-top, run the validator/wearability
// gate, and render the Etsy front+back from the ACTUAL pieces via the NEW
// piece-based renderer (render-garment-from-pieces.mjs). Reuses render-patterns
// draft params verbatim.
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const { renderFrontBack } = await import(join(here, 'render-garment-from-pieces.mjs'));

const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

const s = {
  slug: 'shirt-collar-smocked-babydoll-top', garment: 'top',
  shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
  sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  frontPlacket: true, collarType: 5, collarEdge: 1, sleeveCap: 1,
  gatherType: 3, gatherZone: 0,
};

const engine = await createEngine();
const out = JSON.parse(engine.draftJSON(
  s.garment, s.shaping, s.waistline, s.fabric, s.neckline, s.sleeveStyle, s.sleeveLength,
  s.skirtStyle, s.skirtLength, s.topLength, false, 1, false,
  BODY.bust, BODY.waist, BODY.hip, BODY.shoulder, BODY.backLength, BODY.armLength, BODY.neck, 0,
  s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0,
  s.gatherType || 0, s.gatherZone || 0, s.backOpening || 0,
  s.backSlit || 0, s.ruffledStraps || 0, s.peplum || 0, s.placketStyle || 0,
  s.edgeFinish || 0, s.pocketStyle || 0, s.cuffStyle || 0, s.hemShape || 0, s.shoulderStyle || 0));

if (out.error) { console.log('DRAFT ERROR', out.error); process.exit(1); }
const p = out.pattern;
const issues = out.issues || [];
console.log('PIECES', p.pieces.length);
for (const pc of p.pieces) console.log('  -', pc.name, '|', pc.cutInstruction || '');
console.log('ISSUES', JSON.stringify(issues));

const res = renderFrontBack(p.pieces, { title: 'Shirt-collar smocked babydoll top' });
const OUTDIR = join(here, '../../web/patterns/svg');
writeFileSync(join(OUTDIR, 'shirt-collar-smocked-babydoll-top-frontback.svg'), res.svg);
writeFileSync(join(OUTDIR, 'shirt-collar-smocked-babydoll-top-front.svg'), res.front);
writeFileSync(join(OUTDIR, 'shirt-collar-smocked-babydoll-top-back.svg'), res.back);
console.log('WROTE frontback/front/back into', OUTDIR);
