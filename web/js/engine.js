// Thin loader for the WASM engine (web/vendor/stitchu-engine.js, built by
// engine/build-wasm.sh). draft() returns {pattern, issues}; non-empty issues
// means the validator blocked the draft — callers must not show a PDF.
let enginePromise = null;

export function loadEngine() {
  if (!enginePromise) {
    enginePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/stitchu-engine.js';
      script.onload = () => window.createStitchuEngine().then(resolve, reject);
      script.onerror = () => reject(new Error('engine failed to load'));
      document.head.appendChild(script);
    });
  }
  return enginePromise;
}

export async function draft(spec, measurements) {
  const engine = await loadEngine();
  const json = engine.draftJSON(
    spec.garment, spec.shaping ?? 'princess', spec.waistline ?? 'natural', spec.fabric ?? 'woven',
    spec.neckline ?? 'crew',
    spec.sleeveStyle ?? 'none', spec.sleeveLength ?? 'short',
    spec.skirtStyle ?? 'aLine', spec.skirtLength ?? 'midi', spec.topLength ?? 'hip',
    (spec.ruffle ?? 'none') !== 'none', spec.ruffle === 'tiered' ? 3 : 1,
    spec.keyhole === 'keyhole',
    measurements.bust, measurements.waist, measurements.hip, measurements.shoulder,
    measurements.backLength, measurements.armLength, measurements.neck,
  );
  return JSON.parse(json);
}
