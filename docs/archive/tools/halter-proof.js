/* halter-proof.js — drafts a halter dress through the REAL wasm engine and
   renders: the mirrored front pair (strap + plunge as worn), the low back
   pair, and the piece list. LOOK before shipping.
   run:  node engine/tools/halter-proof.js  -> engine/tools/halter-proof.svg */
const createEngine = require(require('path').join(__dirname, '../dist/stitchu-engine.js'));
const fs = require('fs');
const M = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

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
  const out = JSON.parse(e.draftJSON({ garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'halter', sleeveStyle: 'balloon', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false }, M));
  if (out.issues.length) { console.error('VALIDATOR ISSUES:', out.issues); process.exit(1); }
  const pieces = out.pattern.pieces;
  console.log('garment:', out.pattern.garment);
  console.log('pieces:', pieces.map(p => p.name).join(' | '));
  const front = pieces.find(p => p.name === 'Bodice Center Front') || pieces.find(p => p.name === 'Bodice Front');
  const frontSide = pieces.find(p => p.name === 'Bodice Side Front');
  const back = pieces.find(p => p.name === 'Bodice Center Back') || pieces.find(p => p.name === 'Bodice Back');
  const backSide = pieces.find(p => p.name === 'Bodice Side Back');
  const binding = pieces.find(p => p.name === 'Bias binding (halter)');
  console.log('binding:', binding.cutInstruction);

  const S = 0.5, PAD = 30;
  let body = '';
  // Left: mirrored front pair — plunge + straps as worn.
  body += `<g transform="translate(300,${PAD + 40}) scale(${S})">` +
    `<path d="${path(front.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(front.commands, true)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `</g><text x="220" y="${PAD + 15}" font-family="Helvetica" font-size="15" fill="#111">front pair mirrored on CF — nape straps + plunge</text>`;
  // Middle: front side panel (the bare-shoulder sweep lives here too).
  if (frontSide) body += `<g transform="translate(560,${PAD + 60}) scale(${S})">` +
    `<path d="${path(frontSide.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `</g><text x="560" y="${PAD + 15}" font-family="Helvetica" font-size="15" fill="#111">side front</text>`;
  // Right: back pair mirrored — the low back.
  if (back) body += `<g transform="translate(900,${PAD + 60}) scale(${S})">` +
    `<path d="${path(back.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(back.commands, true)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    (backSide ? `<g transform="translate(180,0)"><path d="${path(backSide.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/></g>` : '') +
    `</g><text x="830" y="${PAD + 15}" font-family="Helvetica" font-size="15" fill="#111">back pair (CB) + side back — the low back</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="330" viewBox="0 0 1250 330">` +
    `<rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
  fs.writeFileSync(__dirname + '/halter-proof.svg', svg);
  console.log('wrote engine/tools/halter-proof.svg');
});
