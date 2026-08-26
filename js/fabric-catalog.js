// KUMAŞ KATALOĞU — tarayıcı tarafı (F6, 2026-08-27).
//
// The law is contract/fabric-catalog-v1.json. This file is the browser's copy of
// the three presets so a shopper can pick a fabric without measuring anything,
// and it is NOT allowed to drift: fabric_catalog_check reads BOTH files and goes
// red the moment one number differs from the other.
//
// Why a copy and not a generated module: the generated-file surface is pinned by
// contract/generated-paths.sha256 + generated_ratchet_check, and adding a new
// generated path is a bigger change than the twelve numbers below. The gate is
// the guard instead of the generator.
//
// `-1` is UNDECLARED, never 0. A woven with no stretch yarn has no D3107
// recovery measurement at all — that is not "0% recovery", it is "not measured",
// and the engine's negative-ease condition must not fire on it.
export const FABRIC_CATALOG = {
  'cotton-poplin': {
    label: 'cotton poplin (crisp woven)',
    trLabel: 'pamuklu dokuma (poplin)',
    fabric: 'woven',
    fabricStretchPct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 120.0,
    fabricBendingLengthMM: 22.0,
    fabricWidthCM: 112.0,
  },
  'viscose-crepe': {
    label: 'viscose crepe (drapey woven)',
    trLabel: 'viskon/krep (düşümlü dokuma)',
    fabric: 'woven',
    fabricStretchPct: 0.0,
    fabricRecovery15sPct: -1,
    fabricRecovery30minPct: -1,
    fabricGrowthPct: -1,
    fabricWeightGSM: 110.0,
    fabricBendingLengthMM: 13.0,
    fabricWidthCM: 140.0,
  },
  'single-jersey': {
    label: 'single jersey (knit)',
    trLabel: 'single jersey (örme)',
    fabric: 'knit',
    fabricStretchPct: 50.0,
    fabricRecovery15sPct: 78.0,
    fabricRecovery30minPct: 88.0,
    fabricGrowthPct: 2.5,
    fabricWeightGSM: 150.0,
    fabricBendingLengthMM: 11.0,
    fabricWidthCM: 165.0,
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
    if (k === 'label' || k === 'trLabel') continue;
    out[k] = preset[k];
  }
  return out;
}
