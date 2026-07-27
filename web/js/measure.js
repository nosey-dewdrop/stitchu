// Deterministic garment measurement from a photo. No LLM, no network, no deps.
// Runs in the browser (canvas ImageData) and in node (any {data,width,height}
// with RGBA bytes). Method mirrors the proven tracer pipeline
// (engine/tools/tracer/trace-flat.py) reduced to measurement only:
// border-sample the ground color -> threshold -> largest connected component
// -> row width profile -> garment box + bust/waist/hem widths -> RATIOS.
//
// Contract (2026-07-27 forensic report, "LLM'den sayi istemeyi birak"):
// - returns ONLY ratios (garment measure / garment measure). No absolute mm:
//   there is no scale reference in a photo.
// - honesty first: if the ground cannot be separated or no garment body is
//   found, returns { ok:false } with a reason. It NEVER invents numbers; the
//   caller falls back to the existing enum-default path.
// Ratio semantics follow the worker schema (backend/worker.js RATIOS rule):
//   lengthToWidth   = garment length / width at the bust line
//   hemToWaistWidth = hem width / narrowest width between bust and hem
//   waistYToLength  = shoulder-to-narrowest-point drop / garment length
//   shoulderToHemProfile = 13 evenly spaced widths, normalized by max width

const DEFAULTS = {
  maxDim: 512, // internal working size (box downscale, deterministic)
  borderFrac: 0.03, // border ring thickness used to estimate the ground color
  uniformityTol: 32, // per-channel dev for a border pixel to count as "ground"
  minUniformity: 0.65, // below this the ground is not separable -> refuse
  minAreaFrac: 0.004, // component smaller than this is not a garment
  maxAreaFrac: 0.9, // component bigger than this fills the frame
  minSpanPx: 24,
  minLengthPx: 40,
  wantMask: false,
};

function fail(reason, confidence, debug) {
  return {
    ok: false,
    confidence: Math.max(0, Math.min(1, Math.round(confidence * 100) / 100)),
    reason,
    ratios: null,
    debug,
  };
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const r3 = (v) => Math.round(v * 1000) / 1000;

// Integer box downscale, deterministic. Returns {data,width,height} RGB-only
// triplets are kept in place inside an RGBA buffer for index compatibility.
function downscale(img, maxDim) {
  const f = Math.ceil(Math.max(img.width, img.height) / maxDim);
  if (f <= 1) return { data: img.data, width: img.width, height: img.height, factor: 1 };
  const W = Math.floor(img.width / f);
  const H = Math.floor(img.height / f);
  const out = new Uint8ClampedArray(W * H * 4);
  const src = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < f; dy++) {
        const row = ((y * f + dy) * img.width + x * f) * 4;
        for (let dx = 0; dx < f; dx++) {
          r += src[row + dx * 4];
          g += src[row + dx * 4 + 1];
          b += src[row + dx * 4 + 2];
        }
      }
      const n = f * f;
      const o = (y * W + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = 255;
    }
  }
  return { data: out, width: W, height: H, factor: f };
}

// Ground color from the border ring: per-channel median via histogram.
function groundStats(data, W, H, borderFrac, uniformityTol) {
  const t = Math.max(2, Math.round(borderFrac * Math.min(W, H)));
  const hist = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  const idxs = [];
  const push = (x, y) => {
    const o = (y * W + x) * 4;
    idxs.push(o);
    hist[0][data[o]]++;
    hist[1][data[o + 1]]++;
    hist[2][data[o + 2]]++;
  };
  for (let y = 0; y < t; y++) for (let x = 0; x < W; x++) push(x, y);
  for (let y = H - t; y < H; y++) for (let x = 0; x < W; x++) push(x, y);
  for (let y = t; y < H - t; y++) {
    for (let x = 0; x < t; x++) push(x, y);
    for (let x = W - t; x < W; x++) push(x, y);
  }
  const n = idxs.length;
  const bg = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[c][v];
      if (acc >= n / 2) {
        bg[c] = v;
        break;
      }
    }
  }
  const devs = new Float64Array(n);
  let uniform = 0;
  for (let i = 0; i < n; i++) {
    const o = idxs[i];
    const d = Math.max(
      Math.abs(data[o] - bg[0]),
      Math.abs(data[o + 1] - bg[1]),
      Math.abs(data[o + 2] - bg[2]),
    );
    devs[i] = d;
    if (d <= uniformityTol) uniform++;
  }
  devs.sort();
  const p90 = devs[Math.min(n - 1, Math.floor(n * 0.9))];
  return { bg, uniformity: uniform / n, p90, ringPx: t };
}

// Largest + second largest 4-connected foreground component (iterative BFS).
function components(fg, W, H) {
  const label = new Int32Array(W * H); // 0 = unvisited
  const stack = new Int32Array(W * H);
  let bestArea = 0;
  let bestId = 0;
  let secondArea = 0;
  let id = 0;
  for (let s = 0; s < W * H; s++) {
    if (!fg[s] || label[s]) continue;
    id++;
    let top = 0;
    stack[top++] = s;
    label[s] = id;
    let area = 0;
    while (top > 0) {
      const p = stack[--top];
      area++;
      const x = p % W;
      if (x > 0 && fg[p - 1] && !label[p - 1]) {
        label[p - 1] = id;
        stack[top++] = p - 1;
      }
      if (x < W - 1 && fg[p + 1] && !label[p + 1]) {
        label[p + 1] = id;
        stack[top++] = p + 1;
      }
      if (p >= W && fg[p - W] && !label[p - W]) {
        label[p - W] = id;
        stack[top++] = p - W;
      }
      if (p < W * (H - 1) && fg[p + W] && !label[p + W]) {
        label[p + W] = id;
        stack[top++] = p + W;
      }
    }
    if (area > bestArea) {
      secondArea = bestArea;
      bestArea = area;
      bestId = id;
    } else if (area > secondArea) {
      secondArea = area;
    }
  }
  return { label, bestId, bestArea, secondArea };
}

// Per-row span profile of one labeled component.
function rowProfile(label, id, W, H) {
  const xmin = new Int32Array(H).fill(-1);
  const xmax = new Int32Array(H).fill(-1);
  const runs = new Int32Array(H);
  let y0 = -1;
  let y1 = -1;
  for (let y = 0; y < H; y++) {
    let prev = false;
    for (let x = 0; x < W; x++) {
      const on = label[y * W + x] === id;
      if (on) {
        if (xmin[y] < 0) xmin[y] = x;
        xmax[y] = x;
        if (!prev) runs[y]++;
      }
      prev = on;
    }
    if (xmin[y] >= 0) {
      if (y0 < 0) y0 = y;
      y1 = y;
    }
  }
  return { xmin, xmax, runs, y0, y1 };
}

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export function measureGarment(image, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  if (!image || !image.data || !image.width || !image.height ||
      image.data.length < image.width * image.height * 4) {
    return fail('bad_input', 0, {});
  }

  const img = downscale(image, cfg.maxDim);
  const { data, width: W, height: H } = img;
  const debug = { workingSize: [W, H], downscaleFactor: img.factor };

  // 1) ground color from the border ring
  const ground = groundStats(data, W, H, cfg.borderFrac, cfg.uniformityTol);
  debug.ground = ground.bg;
  debug.groundUniformity = r3(ground.uniformity);
  if (ground.uniformity < cfg.minUniformity) {
    return fail('background_not_separable', 0.5 * ground.uniformity, debug);
  }
  // tolerance scales with the measured border noise floor: a clean ground
  // (p90 of border deviations near 0) can afford a low threshold, which is
  // what makes pale outline drawings on pastel grounds separable.
  const tol = Math.max(18, Math.min(70, Math.round(3.2 * ground.p90)));
  debug.tol = tol;

  // 2) threshold against the ground color
  const fg = new Uint8Array(W * H);
  const [br, bg2, bb] = ground.bg;
  for (let p = 0; p < W * H; p++) {
    const o = p * 4;
    const d = Math.max(
      Math.abs(data[o] - br),
      Math.abs(data[o + 1] - bg2),
      Math.abs(data[o + 2] - bb),
    );
    if (d > tol) fg[p] = 1;
  }

  // 3) largest connected component = garment candidate
  const comp = components(fg, W, H);
  if (cfg.wantMask && comp.bestId) {
    // attach the mask as soon as it exists so refusals ship evidence too
    const mask = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) if (comp.label[p] === comp.bestId) mask[p] = 1;
    debug.mask = { data: mask, width: W, height: H };
  }
  const areaFrac = comp.bestArea / (W * H);
  debug.areaFrac = r3(areaFrac);
  debug.secondCompFrac = r3(comp.bestArea ? comp.secondArea / comp.bestArea : 0);
  if (areaFrac < cfg.minAreaFrac) return fail('no_garment_found', 0.2, debug);
  if (areaFrac > cfg.maxAreaFrac) return fail('foreground_fills_frame', 0.2, debug);
  // if the runner-up component rivals the winner, the scene did not segment
  // into "one garment on a ground" — refuse instead of measuring a fragment
  // (typical failure: pale garment on pale ground shatters into pieces and
  // the largest piece is the model's head or a shadow).
  if (comp.secondArea > 0.5 * comp.bestArea) {
    return fail('ambiguous_foreground', 0.3, debug);
  }

  // 4) row span profile + trim of thin protrusions (hanger hooks, straps of
  //    noise) at top/bottom: a row thinner than 8% of the widest row is not
  //    yet garment body. Span (xmax-xmin) is used, so a two-strap top still
  //    reads its full shoulder span.
  const prof = rowProfile(comp.label, comp.bestId, W, H);
  let maxSpan = 0;
  const span = new Int32Array(H);
  for (let y = 0; y < H; y++) {
    if (prof.xmin[y] >= 0) span[y] = prof.xmax[y] - prof.xmin[y] + 1;
    if (span[y] > maxSpan) maxSpan = span[y];
  }
  let y0 = prof.y0;
  let y1 = prof.y1;
  const bboxH = y1 - y0 + 1;
  const trimLimitTop = y0 + Math.round(0.25 * bboxH);
  const trimLimitBot = y1 - Math.round(0.15 * bboxH);
  while (y0 < trimLimitTop && span[y0] < 0.08 * maxSpan) y0++;
  while (y1 > trimLimitBot && span[y1] < 0.08 * maxSpan) y1--;
  const L = y1 - y0 + 1;
  debug.bbox = { y0, y1, L, maxSpan };
  if (L < cfg.minLengthPx || maxSpan < cfg.minSpanPx) {
    return fail('garment_too_small', 0.25, debug);
  }

  // 5) worn-photo refusal: legs. In a plain-ground product shot of a
  //    skirt/dress/top the hem is one solid run; a model's legs below the hem
  //    split the bottom band into >=2 runs with a central gap. Measuring the
  //    body+garment blob would be fake numbers, so refuse honestly.
  //    Applies only to FILLED silhouettes: an outline drawing's hem band is
  //    legitimately two thin runs (left and right outline), not legs.
  let spanSum = 0;
  for (let y = y0; y <= y1; y++) spanSum += span[y];
  const fillFactor = comp.bestArea / Math.max(1, spanSum);
  debug.fillFactor = r3(fillFactor);
  const legBand0 = y1 - Math.round(0.12 * L);
  let split = 0;
  let bandRows = 0;
  for (let y = legBand0; y <= y1; y++) {
    if (span[y] <= 0) continue;
    bandRows++;
    if (prof.runs[y] >= 2) {
      // require a real central gap, not a lace/texture hole
      let gap = 0;
      let inGap = 0;
      for (let x = prof.xmin[y]; x <= prof.xmax[y]; x++) {
        if (comp.label[y * W + x] === comp.bestId) {
          if (inGap > gap) gap = inGap;
          inGap = 0;
        } else inGap++;
      }
      if (gap > 0.12 * span[y]) split++;
    }
  }
  debug.legSplitFrac = r3(bandRows ? split / bandRows : 0);
  if (fillFactor > 0.55 && bandRows && split / bandRows > 0.6) {
    return fail('worn_on_model_legs', 0.35, debug);
  }

  // 6) landmarks from the profile (all row indices relative to y0)
  const bandSpans = (f0, f1) => {
    const a = [];
    const s = y0 + Math.round(f0 * L);
    const e = y0 + Math.round(f1 * L);
    for (let y = s; y <= Math.min(e, y1); y++) if (span[y] > 0) a.push(span[y]);
    return a;
  };
  const bustWidth = median(bandSpans(0.1, 0.22));
  let waistWidth = Infinity;
  let waistY = -1;
  const wS = y0 + Math.round(0.24 * L);
  const wE = y0 + Math.round(0.62 * L);
  for (let y = wS; y <= Math.min(wE, y1); y++) {
    if (span[y] > 0 && span[y] < waistWidth) {
      waistWidth = span[y];
      waistY = y;
    }
  }
  // hem = MAX span near the bottom: a curved hem's last rows hold only the
  // central tail of the curve, so a median of the very last rows underreads.
  const hemBand = bandSpans(0.88, 1.0);
  const hemWidth = hemBand.length ? Math.max(...hemBand) : 0;
  if (!bustWidth || !hemWidth || !isFinite(waistWidth)) {
    return fail('profile_incomplete', 0.3, debug);
  }
  debug.px = { L, bustWidth, waistWidth, hemWidth, waistY: waistY - y0 };

  // worn-photo refusal 2: a HEAD at the top. In a product shot the top band
  // is a shoulder line (wide single run) or straps (two runs); a model's head
  // is one narrow centered run well below shoulder width. Skirt/dress/top
  // flats never start with a 12-55%-of-bust single run, so refuse: measuring
  // the body+garment blob would return fake garment ratios.
  let headRows = 0;
  let headHits = 0;
  const headE = y0 + Math.max(3, Math.round(0.15 * L));
  for (let y = y0; y <= headE; y++) {
    if (span[y] <= 0) continue;
    headRows++;
    if (prof.runs[y] === 1 && span[y] >= 0.12 * bustWidth && span[y] <= 0.55 * bustWidth) headHits++;
  }
  debug.headTopFrac = r3(headRows ? headHits / headRows : 0);
  if (headRows >= 3 && headHits / headRows > 0.6) {
    return fail('worn_on_model_head', 0.35, debug);
  }

  // worn-photo refusal 3: hem far narrower than the waist. No skirt/dress/top
  // tapers below ~45% of its waist at the hem; legs held together do.
  if (hemWidth < 0.45 * waistWidth) {
    return fail('hem_tapers_like_legs', 0.35, debug);
  }

  // 7) ratios only (no absolute units: a photo carries no scale reference)
  const profile = [];
  for (let i = 0; i < 13; i++) {
    const y = y0 + Math.round((i / 12) * (L - 1));
    profile.push(r3(span[y] / maxSpan));
  }
  let contig = 0;
  for (let y = y0; y <= y1; y++) if (span[y] > 0) contig++;
  const ratios = {
    lengthToWidth: r3(L / bustWidth),
    hemToWaistWidth: r3(hemWidth / waistWidth),
    waistYToLength: r3((waistY - y0) / L),
    shoulderToHemProfile: profile,
  };

  // 8) honest confidence from measured sub-scores
  const sBg = clamp01((ground.uniformity - cfg.minUniformity) / (1 - cfg.minUniformity));
  const sSize = clamp01((areaFrac - cfg.minAreaFrac) / 0.05);
  const sContig = clamp01(contig / L);
  const sClutter = clamp01(1 - 1.5 * (comp.bestArea ? comp.secondArea / comp.bestArea : 0));
  let confidence = 0.4 * sBg + 0.15 * sSize + 0.25 * sContig + 0.2 * sClutter;
  confidence = Math.round(confidence * 100) / 100;
  debug.subScores = { sBg: r3(sBg), sSize: r3(sSize), sContig: r3(sContig), sClutter: r3(sClutter) };

  if (cfg.wantMask) {
    debug.landmarkRows = { y0, y1, waistY, bustY0: y0 + Math.round(0.1 * L), bustY1: y0 + Math.round(0.22 * L) };
  }

  if (confidence < 0.45) return fail('low_confidence', confidence, debug);
  return { ok: true, confidence, ratios, debug };
}
