# stitchu 🧵

you take a photo of a garment. stitchu turns it into a sewing pattern drafted to your own body measurements and prints it true to scale on a4. for anyone who sees a garment and wants to sew it in their own size, without buying a ready-made pattern or fighting the math.

live: https://nosey-dewdrop.github.io/stitchu (free in beta). every change ships with a public [patch note](https://nosey-dewdrop.github.io/stitchu/patches.html).

## how it's engineered: layers that talk 🧠

stitchu is not one model and not one script. it is four layers with strict contracts between them, and i develop the whole project by making those layers talk. every layer has its own job, its own vocabulary, and its own benchmark. when something fails, the architecture can say *which layer the failure was born in*, and that is what gets fixed.

1. **vision layer.** a vision model reads the photo and speaks a fixed drafting vocabulary: garment type, neckline, sleeve, shaping, closures, plus out-of-vocabulary elements it can see but can't name yet. it never draws anything; it only classifies. you confirm or correct the reading.
2. **bridge layer.** translates the vision reading into a typed engine spec. what the engine can't draw yet is never silently dropped: it's surfaced honestly to the user ("closest given, add X by hand").
3. **calculation engine.** a deterministic c++ drafting engine (compiled to webassembly, running entirely in your browser) drafts the pieces to your seven measurements using published pattern-cutting formulas, audited against the standard references (aldrich, joseph-armstrong). same input, same output, byte for byte. that is what makes the millimetre reproducibility claims provable (the same draft every time, not a claim that it fits your body).
4. **output layer.** svg pieces with darts, grainlines and seam allowance, tiled a4 pdf with registration marks and a 3 cm calibration square, fabric estimate, sewing guide.

each boundary is measured separately: the vision layer has an accuracy score against hand-labeled photos, the bridge has a coverage audit, the engine has geometric invariants and a golden reference, the output has print-fit fuzzing. a metric per boundary is the whole method. a boundary without a number does not exist.

## measured, not claimed 📏

two different things get measured here, and it matters which is which. the outside reference (does a real garment become a full pattern) comes first; the internal-consistency numbers (does the engine stay stable and self-agree) come after, labelled as what they are.

**the outside reference: real-product benchmark.** a hand-labeled set of real garment photos, measured live end-to-end. current: **37/54 full patterns and climbing.** the misses are published too, in the patch notes. vision accuracy on critical fields: 94% against hand labels. this is the honest measure of "did a real dress turn into a real pattern"; it is the number that moves when the engine actually learns to draw something new.

**internal consistency (not a fit proof).** the numbers below prove the engine is self-consistent and does not drift between builds. they do NOT prove a garment fits a real body; they prove the geometry closes on itself and stays reproducible. worth publishing, but read them as engineering stability, not fit.

- **validation matrix: 70,200 drafts, all passing.** eu 34-52 plus tall, short, pear, apple and extreme bodies, across the whole spec space. geometric invariants on every draft (seam balance, dart totals, armhole allowance, self-intersection, print fit). ctest 20/20 green. this says every draft is internally valid, not that it fits.
- **seam pair precision: worst pair 0.00 mm.** every seam pair a tailor would actually pin is measured off the drawn geometry, not the intended numbers. an audit once caught the benchmark reading intentions instead of geometry; it reads geometry now. this measures whether two edges that must sew together are the same length, not whether the finished garment fits.
- **web fuzz: 19,780 drafts through the real ui, 0 failures.** extreme bodies, whole spec space, simulated print packer. no piece can be clipped.
- **golden reference pinned in the repo** (23k rows, 0.1 mm tolerance diff). new capabilities are opt-in post-passes: with them off, output stays byte-identical. this is drift protection: a new feature cannot silently change an old pattern.

**the honest limit: this is a muslin-first pattern.** the engine drafts to seven measurements and fills the rest (cup, arm girth, shoulder slope, button size) from documented assumptions, source-bound where a reference supports them and marked unvalidated where none does (see `engine/FORMULAS.md`). so every pattern is a starting block: sew a toile/muslin and check the fit before cutting your real fabric. the invariants above guarantee the draft is buildable and reproducible, not that it fits you off the printer.

## the data flywheel 🗃️

the engine's vocabulary grows by evidence, not by whim. a growing photo corpus is mined for construction terms; term frequency decides which capability the engine learns next (expected gain per unit of work, nothing else). every vision reading is also stored as a labeled example in a versioned label store. labels are treated as a regenerable cache, never as ground truth. that store is training data for an on-device student model, so photo analysis itself is on the path to running fully in the browser. one benchmark set stays hand-labeled and untouched as the human anchor everything else is graded against.

## tech

- engine: c++17, cmake, ctest. single-file wasm bundle via emscripten/embind (~218 kb)
- web: static html/css/js on github pages, no framework. patterns are svg, printing is client-side tiled a4 pdf. measurements live in local storage. nothing about your body is uploaded, by architecture not by policy
- backend: one cloudflare worker that proxies the vision model behind an app token and per-ip rate limits. the browser never holds an api key
- student vision: pytorch training + onnx export, browser target
- knowledge: sqlite database of drafting formulas. a formula only becomes `verified` after adversarial source checking

## why i built it 🌷

ready-made patterns fit nobody exactly, there is no body called small-medium-large. when you see a garment and want to sew it yourself, you either buy an expensive pattern or fight the math. i wanted to close that distance: an engine that sits between the thing you saw and your own body. and measurements are personal data, so none of them go to the cloud.

## repo layout

- `engine/` c++ engine, tests, tools, wasm build, `FORMULAS.md` (the drafting spec)
- `web/` the live site (including `patches.html`, the public changelog)
- `backend/` cloudflare worker (vision proxy)
- `vision-student/` on-device student model training + onnx export
- photo corpora and label stores are local-only and never committed
