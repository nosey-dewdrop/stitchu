/* keyhole-proof.js — drafts a crew dress with the keyhole through the REAL
   wasm engine and renders the mirrored front (as worn) + the facing piece.
   run:  node engine/tools/keyhole-proof.js  -> engine/tools/keyhole-proof.svg */
const createEngine = require(process.env.HOME + '/damla_projects_2026/00_currently_on_working/stitchu/engine/dist/stitchu-engine.js');
const fs = require('fs');
const M = [88, 70, 94, 37, 40.5, 58, 35];

function path(cmds, mirror) {
  const sx = mirror ? -1 : 1;
  let d = '';
  for (const c of cmds) {
    if (c.type === 'move') d += `M${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'line') d += `L${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'curve') d += `C${(sx * c.cp1x).toFixed(1)} ${c.cp1y.toFixed(1)} ${(sx * c.cp2x).toFixed(1)} ${c.cp2y.toFixed(1)} ${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'close') d += 'Z';
  }
  return d;
}

createEngine().then(e => {
  const out = JSON.parse(e.draftJSON('dress','princess','natural','woven','crew','none','short','aLine','midi','hip', false, 1, true, ...M));
  if (out.issues.length) { console.error('VALIDATOR ISSUES:', out.issues); process.exit(1); }
  const pieces = out.pattern.pieces;
  const front = pieces.find(p => p.name === 'Bodice Center Front') || pieces.find(p => p.name === 'Bodice Front');
  const facing = pieces.find(p => p.name === 'Keyhole Facing');
  console.log('pieces:', pieces.map(p => p.name).join(' | '));
  console.log('facing cut:', facing.cutInstruction);

  // keyhole = the last 3 markings on the front
  const hole = front.markings.slice(-3);
  const S = 0.62;
  let body = '';
  body += `<g transform="translate(300,30) scale(${S})">` +
    `<path d="${path(front.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(front.commands, true)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(hole, false)}" fill="#fff" stroke="#8f2038" stroke-width="3"/>` +
    `<path d="${path(hole, true)}" fill="#fff" stroke="#8f2038" stroke-width="3"/>` +
    `</g><text x="200" y="330" font-family="Helvetica" font-size="15" fill="#111">front pair mirrored on CF — keyhole under the crew neck</text>`;
  body += `<g transform="translate(700,60) scale(${S * 1.6})">` +
    `<path d="${path(facing.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="2"/>` +
    `<path d="${path(facing.commands, true)}" fill="#fdf8f5" stroke="#111" stroke-width="2"/>` +
    `<path d="${path(facing.markings, false)}" fill="none" stroke="#8f2038" stroke-width="2" stroke-dasharray="8 6"/>` +
    `<path d="${path(facing.markings, true)}" fill="none" stroke="#8f2038" stroke-width="2" stroke-dasharray="8 6"/>` +
    `</g><text x="640" y="330" font-family="Helvetica" font-size="15" fill="#111">Keyhole Facing (mirrored) with the stitch line</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="380" viewBox="0 0 980 380">` +
    `<rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
  fs.writeFileSync(__dirname + '/keyhole-proof.svg', svg);
  console.log('wrote engine/tools/keyhole-proof.svg');
});
