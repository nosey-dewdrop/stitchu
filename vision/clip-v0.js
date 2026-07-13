/* clip-v0.js — Track B v0: LOCAL zero-shot garment attribute classification.
   CLIP (ONNX, @xenova/transformers, CPU) scores each attribute's label prompts
   against the photo — no training data, no API, no per-call cost. Same stack
   can later run IN THE BROWSER next to the WASM engine.
   run:  node vision/clip-v0.js   -> vision/eval/clip-predictions.json */
const fs = require('fs');
const path = require('path');

// Attribute -> [ [engineValue, promptText], ... ]. Prompts are what CLIP sees.
const ATTRS = {
  garment: [
    ['skirt', 'a skirt worn alone'],
    ['dress', 'a dress'],
    ['top', 'a top, blouse or shirt'],
  ],
  neckline: [
    ['crew', 'a garment with a high round crew neckline'],
    ['scoop', 'a garment with a low scooped round neckline'],
    ['vNeck', 'a garment with a v-neck neckline'],
    ['square', 'a garment with a square neckline'],
    ['boat', 'a garment with a wide boat neckline'],
    ['sweetheart', 'a garment with a heart-shaped sweetheart neckline'],
  ],
  sleeveStyle: [
    ['none', 'a sleeveless garment with bare shoulders or straps'],
    ['straight', 'a garment with plain fitted sleeves'],
    ['balloon', 'a garment with puffy gathered balloon sleeves'],
  ],
  sleeveLength: [
    ['short', 'a garment with short sleeves'],
    ['elbow', 'a garment with elbow-length sleeves'],
    ['long', 'a garment with long full-length sleeves'],
  ],
  skirtStyle: [
    ['aLine', 'a garment with a smooth a-line flared skirt'],
    ['straight', 'a garment with a straight narrow pencil skirt'],
    ['gathered', 'a garment with a gathered bunched full skirt'],
    ['halfCircle', 'a garment with a flowing circle skirt'],
    ['pleated', 'a garment with a crisply pleated skirt'],
  ],
  length: [
    ['mini', 'a short garment ending above the knee'],
    ['midi', 'a garment ending between the knee and mid-calf'],
    ['maxi', 'a long garment reaching the ankle or floor'],
  ],
  waistline: [
    ['natural', 'a garment with a seam or belt at the natural waist'],
    ['empire', 'a garment with an empire waist seam right under the bust'],
  ],
  fabric: [
    ['woven', 'a garment in crisp non-stretch woven fabric'],
    ['knit', 'a garment in stretchy knit jersey fabric'],
  ],
  hemRuffle: [
    ['none', 'a garment with a plain straight hem'],
    ['single', 'a garment with one gathered ruffle strip at the hem'],
    ['tiered', 'a garment with many stacked cascading ruffle tiers'],
  ],
  keyhole: [
    [false, 'a garment with a plain solid front'],
    [true, 'a garment with a small keyhole cutout opening below the neckline'],
  ],
};

(async () => {
  const { pipeline, env } = await import('@xenova/transformers');
  env.cacheDir = path.join(__dirname, '.model-cache');
  console.log('loading CLIP (first run downloads the ONNX model)...');
  const clip = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch16');

  const labels = JSON.parse(fs.readFileSync(path.join(__dirname, 'eval/labels.json'), 'utf8'));
  const files = Object.keys(labels).filter((k) => !k.startsWith('_'));
  const out = {};

  for (const file of files) {
    const img = path.join(__dirname, 'eval/photos', file);
    const pred = {};
    for (const [attr, pairs] of Object.entries(ATTRS)) {
      const res = await clip(img, pairs.map(([, prompt]) => prompt));
      const best = res[0];
      const pair = pairs.find(([, prompt]) => prompt === best.label);
      pred[attr] = pair[0];
      pred[`${attr}_p`] = Number(best.score.toFixed(3));
    }
    out[file] = pred;
    console.log(file, '->', JSON.stringify(Object.fromEntries(Object.entries(pred).filter(([k]) => !k.endsWith('_p')))));
  }

  fs.writeFileSync(path.join(__dirname, 'eval/clip-predictions.json'), JSON.stringify(out, null, 1));
  console.log('\nwrote vision/eval/clip-predictions.json');
})();
