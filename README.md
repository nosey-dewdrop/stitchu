# stitchu

**A deterministic FIXED-SIZE (EU34-48) pattern CAD engine.** Give it a body and a recipe, and it drafts a sewing pattern the way industrial CAD does — not as a picture that gets nudged until it looks right, but as a formula-driven construction document that regenerates exactly when the measurements change. Every point, curve, dart and seam is computed by a C++ kernel from published pattern-cutting formulas. Same recipe, same body, same millimetres — byte for byte.

Not made-to-measure, and that is a decision with evidence behind it: ZOZO, unspun and Fayma all died on MTM and Lekala hit a quality ceiling, because a girth does not determine a shape — two bodies with the same bust can need different patterns. stitchu sells graded fixed sizes. The run is EU34-48 because that is exactly the range for which the body contract publishes a front/back split (contract/layers/shape-ratios.json); EU50 and EU52 have no published ratio and are not claimed.

The moat is not a chat box. Take the AI away and what remains is a real CAD: a recipe model, a deterministic geometry kernel, and an industry-standard interchange path. Below is what that kernel can already do, each capability proven by running it — not asserted.

## What can it already export to the factory floor?

The engine drafts to a recipe, then carries that geometry all the way to production-grade artefacts. Every item below was independently re-derived from a clean build against standard third-party tools (`ezdxf`, `shapely`, `poppler`); the machine-checked proof is in [`reports/gate/endustri-2026-07-28.txt`](reports/gate/endustri-2026-07-28.txt).

- **Industry interchange — DXF-AAMA/ASTM.** The kernel's own pattern-piece geometry exports to DXF R12 with `$INSUNITS=4` (mm) and the AAMA/ASTM layer convention (1 = boundary, 8 = seam, 7 = grainline, 11 = internal/dart, 4 = notch, 15 = text). Opened in `ezdxf 1.4.4`; the boundary was flattened through the *same* 24-step cubic-Bézier path as the kernel and compared vertex-for-vertex: **max error 0.000e+00 mm across 50 vertices.** The DXF is the kernel's millimetres, not a drawing of them. (`engine/src/dxf.{hpp,cpp}`, ctest `dxf_check`)
- **Size grading — a full EU34–52 run from one recipe.** One design grades into a whole size series by re-drafting the recipe against each standard body: **10/10 sizes validator-clean, seams still match, growth is monotonic, dart topology stays fixed.** The growth is *not* a fixed step — it jumps +20.40 → +30.60 mm at EU48, following the EU chart's own +4 cm → +6 cm change. That is the proof it grades a body, not relabels one pattern as a fake series. (ctest `recipe_grade_check`)
- **Nesting / marker layout.** Cut pieces pack onto a fabric width and the overlap is checked by an independent geometry engine, not our own script: `shapely 2.1.2` pairwise intersection area = **0.000000 mm²**, and the layout fits inside the roll width. The detector is not blind — its smoke test sees a half-shifted overlapping copy and does *not* false-positive on far-apart copies. (`engine/src/nest.{hpp,cpp}`, ctest `nest_check` + external `nest_marker_check`)
- **Tech-pack — a machine-readable production package.** One recipe grades across the full size run into a single manifest (`stitchu.techpack/1`: size table + cut list + fabric weight + marker efficiency + a graded DXF per size) plus a human-readable PDF spec. The weight math (`metres × 1.40 × gsm`) and efficiency math (`area ÷ (width × roll)`) were cross-checked by hand to within rounding, the PDF opens in `poppler` (2 pages), and a tampered efficiency value **fails the verifier loudly** — so the check actually measures, it doesn't rubber-stamp. (`engine/tools/tech-pack.cpp`, ctest `tech_pack_check` + external `techpack-verify.py`)

## How is the pattern a document, not a picture?

The core architecture is a CAD model, not a pipeline. A pattern is a **recipe**: a formula-driven sequence of operations bound to a measurement table (Valentina file logic). The screen shows a rendering of the recipe; when a measurement changes, everything regenerates. SVG and PDF are only export formats.

1. **Recipe data model** — the pattern is a saved, editable construction document: named points, curves and dart operations whose coordinates are formulas over the measurement table, never stored numbers. Contract: [`docs/RECETE-SPEC.md`](docs/RECETE-SPEC.md).
2. **Deterministic kernel** — a C++ engine (compiled to WebAssembly, running entirely in the browser) is the single source of every number: geometry, seam-length equalisation, notches, grainlines. Zero guessing.
3. **Canvas** — a live drawing surface; change a measurement and the piece redraws. (Kapı 2, the taste gate, is judged by Damla — no claim made here.)
4. **Generative layer** — prompt/photo → *writes a recipe* (it never measures numbers or draws coordinates; it composes from the vocabulary). Take the LLM out and a complete CAD remains.

The recipe path is proven independent of the engine's built-in draft: a pinned golden subset is reproduced byte-for-byte by a *second, independent* generation path, so the proof is a real re-derivation and not the engine re-playing its own calls (`recipe_golden_check`, `recipe_check`).

## Where's the rigour — what numbers back all this?

These numbers are the discipline, not a sales sheet. They exist so the product is actually correct, and they read as engineering rigour under the moat above — a boundary without a number does not exist.

- **Clean-build test suite: 77/77 green**, re-run twice from a fresh `build-forensic` clone-like directory; the six industry gates also ran together 6/6. No existing test was broken.
- **Seam-pair precision: worst pair 0.00 mm.** Every seam pair a tailor would actually pin is measured off the *drawn geometry*, not the intended numbers. (An earlier audit caught the benchmark reading intentions instead of geometry; it reads geometry now.)
- **DXF millimetre parity: 0.000e+00 mm** over 50 boundary vertices, measured against a standard third-party parser, not our own exporter.
- **Golden reference pinned in the repo.** New capabilities are opt-in; with them off, output stays byte-identical. This is drift protection: a new feature cannot silently change an old pattern.
- **Real-product benchmark, published honestly:** the engine drafts **27 of 54** real garment photos end-to-end under the strict counting method (37/54 under the older, looser count), and the misses are published in the patch notes. This is the outside reference — the number that only moves when the engine genuinely learns to draw something new — and it is kept in context, not headlined.

**The honest limit:** this is a muslin-first pattern. The engine drafts to seven measurements and fills the rest (cup, arm girth, shoulder slope) from documented assumptions. The invariants above guarantee the draft is *buildable and reproducible*, not that it fits off the printer — sew a toile first. The taste/vein judgement of a pattern is still Damla's call, not a machine's.

## What's next?

- **3D drape preview (in progress, honest scope).** A geometric mass-spring preview off the pattern geometry already runs deterministically (Z-spread is body-driven: EU38 143 mm vs. pear 238 mm; penetration detector is not blind). It is a **geometric preview, not a physics engine / CLO3D** — that boundary is stated in `drape.hpp` and its report. It is a capability toward the canvas, not a shipped feature.
- Deeper canvas editing, project/file management, and marker optimisation (nesting proves overlap = 0 today; *optimal* packing is future work).

## Tech

- **engine:** C++17, CMake, ctest. Single-file WASM bundle via emscripten/embind.
- **web:** static HTML/CSS/JS on GitHub Pages, no framework. Patterns are SVG; printing is client-side tiled A4 PDF. Measurements live in local storage — nothing about your body is uploaded, by architecture.
- **backend:** one Cloudflare Worker that proxies the vision model behind an app token and per-IP rate limits. The browser never holds an API key.
- **interchange:** DXF-AAMA/ASTM export, per-size graded DXF, machine-readable tech-pack manifest + PDF spec.

## Repo layout

- `engine/` — C++ kernel, tests, tools, WASM build (`src/dxf`, `src/nest`, `src/recipe`, `tools/tech-pack.cpp`)
- `recipes/` — recipe documents (the CAD source of truth)
- `docs/RECETE-SPEC.md` — the recipe data model contract
- `web/` — the live site (`stitchu.noseydewdrop.com`)
- `backend/` — Cloudflare Worker (vision proxy)
- `reports/gate/` — machine-checked proof artefacts for every capability above
- Photo corpora and purchased/copyrighted sources are local-only and never committed.
