/* precision-report.js — the tailor's micrometer. Measures every seam PAIR the
   sewist will actually pin together (shoulder, side, princess, waist join,
   sleeve cap, facing) across bodies and specs, and reports the worst mismatch
   in mm. Anything over 1.0 mm (outside intended ease) fails.
   run:  node engine/tools/precision-report.js */
const createEngine = require(require('path').join(__dirname, '../dist/stitchu-engine.js'));

const BODIES = {
  EU38: { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 },
  petite: { bust: 84, waist: 64, hip: 90, shoulder: 34, backLength: 33, armLength: 49, neck: 33 },
  plus: { bust: 122, waist: 104, hip: 128, shoulder: 42, backLength: 43.5, armLength: 61.5, neck: 41 },
};
const SPECS = {
  'princess scoop dress': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false },
  'babydoll knit': { garment: 'dress', shaping: 'princess', waistline: 'empire', fabric: 'knit', neckline: 'crew', sleeveStyle: 'balloon', sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false },
  'halter halfcircle': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'halter', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'halfCircle', skirtLength: 'maxi', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false },
};

function flat(cmds) {
  const pts = []; let cur = null, start = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = [c.x, c.y]; start = cur; pts.push({ p: cur, cmd: c }); }
    else if (c.type === 'line') { pts.push({ p: [c.x, c.y], from: cur, cmd: c }); cur = [c.x, c.y]; }
    else if (c.type === 'curve') {
      const seg = [];
      for (let i = 1; i <= 24; i++) {
        const t = i / 24, mt = 1 - t;
        seg.push([mt*mt*mt*cur[0] + 3*mt*mt*t*c.cp1x + 3*mt*t*t*c.cp2x + t*t*t*c.x,
                  mt*mt*mt*cur[1] + 3*mt*mt*t*c.cp1y + 3*mt*t*t*c.cp2y + t*t*t*c.y]);
      }
      pts.push({ p: [c.x, c.y], from: cur, seg, cmd: c });
      cur = [c.x, c.y];
    } else if (c.type === 'close') { pts.push({ p: start, from: cur, cmd: c }); cur = start; }
  }
  return pts;
}
function segLen(entry) {
  if (!entry.from) return 0;
  if (entry.seg) { let L = 0, prev = entry.from; for (const q of entry.seg) { L += Math.hypot(q[0]-prev[0], q[1]-prev[1]); prev = q; } return L; }
  return Math.hypot(entry.p[0]-entry.from[0], entry.p[1]-entry.from[1]);
}
function cmdLen(cmds, i) { return segLen(flat(cmds)[i]); }

let worst = 0, failures = 0;
function pair(label, a, b, tolerance = 1.0) {
  const d = Math.abs(a - b);
  worst = Math.max(worst, d);
  const ok = d <= tolerance;
  if (!ok) failures++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(46)} ${a.toFixed(2)} vs ${b.toFixed(2)}  Δ ${d.toFixed(2)} mm`);
}

createEngine().then(e => {
  for (const [bodyName, M] of Object.entries(BODIES)) {
    for (const [specName, args] of Object.entries(SPECS)) {
      const out = JSON.parse(e.draftJSON(args, M));
      if (out.issues.length) { console.log(`SKIP ${bodyName}/${specName}: blocked`); continue; }
      const P = out.pattern.pieces;
      const g = (n) => P.find(x => x.name === n);
      console.log(`\n${bodyName} · ${specName}`);

      const cf = g('Bodice Center Front') || g('Bodice Front');
      const cb = g('Bodice Center Back') || g('Bodice Back');
      const sf = g('Bodice Side Front');
      const sb = g('Bodice Side Back');
      const halter = specName.includes('halter');

      // Shoulder seam pair (front vs back) — halter has none by design.
      if (!halter && cf && cb) {
        pair('shoulder seam front vs back', cmdLen(cf.commands, 2), cmdLen(cb.commands, 2));
      }
      // Side seam pair: side panels' armhole-bottom -> side-waist line; the
      // unsplit halves carry it at index 4 (after neck, shoulder, armhole).
      const sideFrontLen = sf ? cmdLen(sf.commands, 2) : cf ? cmdLen(cf.commands, 4) : null;
      const sideBackLen = sb ? cmdLen(sb.commands, 2) : cb ? cmdLen(cb.commands, 4) : null;
      if (sideFrontLen && sideBackLen) pair('bodice side seam front vs back', sideFrontLen, sideBackLen);

      // Princess seam pair per half: center panel edge = seamUpper[4]+leg[5];
      // side panel edge = leg[4]+reversed seamUpper[5] ([3] is its waist edge).
      for (const [half, c, s] of [['front', cf, sf], ['back', cb, sb]]) {
        if (!c || !s) continue;
        if (!(g('Bodice Side ' + (half === 'front' ? 'Front' : 'Back')))) continue;
        const center = cmdLen(c.commands, 4) + cmdLen(c.commands, 5);
        const side = cmdLen(s.commands, 4) + cmdLen(s.commands, 5);
        pair(`princess seam ${half} center vs side panel`, center, side);
      }

      // Waist join: bodice sewn waist vs skirt waist, per quarter where the
      // skirt reports quarters (aLine/halfCircle quarters vs gathered ratio).
      const skirtCF = g('Skirt Center Front');
      if (skirtCF && cf) {
        const bodiceArc = cmdLen(cf.commands, 6);
        const skirtArc = cmdLen(skirtCF.commands, 1);
        pair('waist join front: bodice CF arc vs skirt CF arc', bodiceArc, skirtArc);
      }
      const skirtCB = g('Skirt Center Back');
      if (skirtCB && cb) {
        pair('waist join back: bodice CB arc vs skirt CB arc',
             cmdLen(cb.commands, 6), cmdLen(skirtCB.commands, 1));
      }

      // Facing inner edge vs garment neckline (non-halter).
      const facing = g('Front Neck Facing');
      if (facing && cf && !halter) {
        pair('front facing inner edge vs neckline', cmdLen(facing.commands, 1), cmdLen(cf.commands, 1), 1.5);
      }

      // Sleeve cap vs armhole: intended EASE, so check the WINDOW not equality.
      const sleeve = P.find(x => x.name.includes('Sleeve') && !x.name.includes('Cuff'));
      if (sleeve && sf && sb) {
        const cap = cmdLen(sleeve.commands, 1) + cmdLen(sleeve.commands, 2);
        const armhole = cmdLen(cf.commands, 3) + cmdLen(sf.commands, 1) +
                        cmdLen(cb.commands, 3) + cmdLen(sb.commands, 1);
        const ease = cap / armhole - 1;
        const okEase = ease >= 0.0 && ease <= 0.10;
        if (!okEase) failures++;
        console.log(`  ${okEase ? 'ok  ' : 'FAIL'} ${'sleeve cap ease (0-10% window)'.padEnd(46)} cap ${cap.toFixed(1)} armhole ${armhole.toFixed(1)}  ease ${(ease*100).toFixed(1)}%`);
      }
    }
  }
  console.log(`\nprecision report: worst pair mismatch ${worst.toFixed(2)} mm | ${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
});
