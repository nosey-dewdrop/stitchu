// KUMAŞ KATALOĞU — tarayıcı tarafı (F6 kuruldu 2026-08-27; F4-kumas 2026-09-01).
//
// The law is contract/fabric-catalog-v1.json: five fabrics from
// GIRDI/kumaslar.md, every number carrying the seller page that published it
// (weight + bolt width) or a class-typical band value labelled OLCULMEDI
// (stretch). This file is the browser's copy so a shopper can pick a bolt
// without measuring anything, and it is NOT allowed to drift:
// fabric_catalog_check reads BOTH files and goes red the moment one number
// differs from the other.
//
// `-1` is UNDECLARED, never 0. None of the five bolts has a published D3107
// recovery, D2594 growth or D1388 bending length — that is not "0", it is
// "not measured", and the engine's recovery condition and drape sentence must
// not fire on it. fabricStretchLengthwisePct is carried for the contract's
// horizontal/vertical separation; the engine binds only the crosswise number
// (no published lengthwise draft exists — catalog `_yayin_bulunamadi`).
export const FABRIC_CATALOG = {
  'viscose-crepe': {
    label: 'viscose crepe (drapey woven, 140 gsm)',
    trLabel: 'krep — %100 viskon (140 gsm)',
    cls: 'woven',
    fabricStretchPct: 0.0,
    fabricStretchLengthwisePct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 140.0,
    fabricBendingLengthMM: -1,
    fabricWidthCM: 140.0,
  },
  'cotton-modal-jersey': {
    label: 'cotton-modal jersey (stretch knit, 200 gsm)',
    trLabel: 'jarse — pamuk/modal/%5 elastan örme (200 gsm)',
    cls: 'knit',
    fabricStretchPct: 50.0,
    fabricStretchLengthwisePct: 50.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 200.0,
    fabricBendingLengthMM: -1,
    fabricWidthCM: 148.0,
  },
  'viscose-challis': {
    label: 'viscose challis (fluid woven, 110 gsm)',
    trLabel: 'viskon — %100 viskon challis (110 gsm)',
    cls: 'woven',
    fabricStretchPct: 0.0,
    fabricStretchLengthwisePct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 110.0,
    fabricBendingLengthMM: -1,
    fabricWidthCM: 139.7,
  },
  'cotton-lawn': {
    label: 'cotton lawn (light woven, 87 gsm)',
    trLabel: 'pamuklu lawn — %100 pamuk (87 gsm)',
    cls: 'woven',
    fabricStretchPct: 0.0,
    fabricStretchLengthwisePct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 87.0,
    fabricBendingLengthMM: -1,
    fabricWidthCM: 142.0,
  },
  'cotton-velveteen': {
    label: 'cotton velveteen (heavy woven, 230 gsm)',
    trLabel: 'kadife — %100 pamuk velveteen (230 gsm)',
    cls: 'woven',
    fabricStretchPct: 0.0,
    fabricStretchLengthwisePct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 230.0,
    fabricBendingLengthMM: -1,
    fabricWidthCM: 106.7,
  },
};

// Overlay a preset onto a spec. `unset` (or an unknown id) changes NOTHING — the
// old woven/knit word keeps driving and the draft stays what it was before this
// catalog existed.
export function applyFabricPreset(spec) {
  const id = spec && spec.fabricPreset;
  const preset = id && FABRIC_CATALOG[id];
  if (!preset) return spec;
  const out = { ...spec };
  for (const k of Object.keys(preset)) {
    if (k === 'label' || k === 'trLabel' || k === 'cls') continue;
    out[k] = preset[k];
  }
  out.fabric = preset.cls;   // the WORD the engine still needs for sewing choices
  return out;
}
