// Virtual seamstress: assemble the garment seam by seam and measure what a
// numeric length check can't see — WHERE things meet, not just how long.
const createEngine = require(require('path').join(__dirname, '../dist/stitchu-engine.js'));
const M = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

function flat(cmds) { // flatten to points, tracking current position
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
function segLen(from, entry) {
  if (entry.seg) { let L = 0, prev = from; for (const q of entry.seg) { L += Math.hypot(q[0]-prev[0], q[1]-prev[1]); prev = q; } return L; }
  return Math.hypot(entry.p[0]-from[0], entry.p[1]-from[1]);
}
function cmdLen(cmds, i) { // length of command index i (must not be move)
  const f = flat(cmds);
  return segLen(f[i].from, f[i]);
}

createEngine().then(e => {
  const out = JSON.parse(e.draftJSON({ garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false }, M));
  const p = out.pattern;
  const g = n => p.pieces.find(x => x.name === n);
  console.log('=== VIRTUAL SEW: princess A-line dress, EU38 ===');

  // --- 1. waist join alignment: princess seam vs gore seam position ---
  // bodice center front: [0]move(centerNeck) [1]neck [2]line(shoulder) [3]armhole1 [4]seamUpper [5]line(legA) [6]waist(legA->CF) [7]CFcurve [8]close
  const bcf = g('Bodice Center Front').commands;
  const bodiceCFtoSeam = cmdLen(bcf, 6); // waist arc from princess leg to center front
  // skirt center front: [0]move(CF waist) [1]waist(CF->legA) ...
  const scf = g('Skirt Center Front').commands;
  const skirtCFtoSeam = cmdLen(scf, 1);
  console.log('WAIST JOIN front: bodice CF->princess seam', bodiceCFtoSeam.toFixed(1), 'mm | skirt CF->gore seam', skirtCFtoSeam.toFixed(1), 'mm | OFFSET', Math.abs(bodiceCFtoSeam-skirtCFtoSeam).toFixed(1), 'mm');

  // back: bodice center back waist arc CB->seam; skirt center back same
  const bcb = g('Bodice Center Back').commands;
  const bodiceCBtoSeam = cmdLen(bcb, 6);
  const scb = g('Skirt Center Back').commands;
  const skirtCBtoSeam = cmdLen(scb, 1);
  console.log('WAIST JOIN back:  bodice CB->princess seam', bodiceCBtoSeam.toFixed(1), 'mm | skirt CB->gore seam', skirtCBtoSeam.toFixed(1), 'mm | OFFSET', Math.abs(bodiceCBtoSeam-skirtCBtoSeam).toFixed(1), 'mm');

  // side seam totals front vs back at waist: bodice side panel waist arc vs skirt side panel waist arc
  const bsf = g('Bodice Side Front').commands;   // [0]move(split) [1]arm2 [2]line(side) [3]waistEdge(side->legB) [4]line(apex) [5]rev [6]close
  const ssf = g('Skirt Side Front').commands;    // [0]move(legB) [1]waist(legB->side) ...
  console.log('WAIST JOIN side front: bodice side->seam', cmdLen(bsf,3).toFixed(1), 'mm | skirt seam->side', cmdLen(ssf,1).toFixed(1), 'mm | OFFSET', Math.abs(cmdLen(bsf,3)-cmdLen(ssf,1)).toFixed(1), 'mm');

  // --- 2. sleeve cap distribution vs armhole halves ---
  const sl = g('Sleeve').commands; // [0]move(capLeft) [1]front S [2]back S ...
  const capFront = cmdLen(sl, 1), capBack = cmdLen(sl, 2);
  // armhole per half: bodice front armhole = center panel upper [3] + side panel lower [1]
  const armFront = cmdLen(bcf, 3) + cmdLen(bsf, 1);
  const bsb = g('Bodice Side Back').commands;
  const armBack = cmdLen(bcb, 3) + cmdLen(bsb, 1);
  console.log('SLEEVE front: cap', capFront.toFixed(1), 'vs armhole', armFront.toFixed(1), '-> ease', ((capFront/armFront-1)*100).toFixed(1)+'%');
  console.log('SLEEVE back:  cap', capBack.toFixed(1), 'vs armhole', armBack.toFixed(1), '-> ease', ((capBack/armBack-1)*100).toFixed(1)+'%');

  // --- 3. princess seam notch alignment (arc from armhole split to apex) ---
  const centerToApex = cmdLen(bcf, 4);           // seamUpper on center panel
  const f5 = flat(bsf);
  const sideToApexRev = segLen(f5[5].from, f5[5]); // reverse seamUpper on side panel (apex->split)
  console.log('PRINCESS notch front: center split->apex', centerToApex.toFixed(1), 'vs side', sideToApexRev.toFixed(1), '| delta', Math.abs(centerToApex-sideToApexRev).toFixed(2), 'mm');
});
