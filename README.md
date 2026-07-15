# stitchu 🧵

you take a photo of a garment. stitchu turns it into a sewing pattern drafted to your own body measurements and prints it true to scale on a4. for anyone who sees a garment and wants to sew it in their own size, without buying a ready-made pattern or fighting the math.

live: https://nosey-dewdrop.github.io/stitchu (web v27)

## how it works and what i used for it

1. you enter your 7 body measurements (bust, waist, hip, shoulder, back length, arm length, neck). they stay local, nothing is uploaded.
2. you upload a garment photo. a cloudflare worker calls claude vision, which classifies the garment into a fixed drafting vocabulary (garment type, neckline, sleeve, skirt, waistline, fabric behavior). you confirm or correct the reading.
3. a drafting engine written in c++ and compiled to webassembly, running entirely in your browser, drafts the pattern pieces to your measurements. it uses published pattern formulas (freesewing, muller & sohn, winifred aldrich, every constant is sourced in `engine/FORMULAS.md`).
4. output: svg pattern pieces with darts, grainlines and drawn seam allowance, a tiled a4 pdf with a 3 cm calibration square, a fabric yardage estimate and a step by step sewing guide.

the drafting vocabulary: princess and dart shaping, natural, empire and babydoll waistlines, woven and knit, 5 skirt styles, set-in and balloon sleeves, layered ruffles, sweetheart, keyhole, halter.

## measurement and accuracy, benchmark not claims 📏

- **validation matrix: 70,200 drafts, all passing.** eu 34-52 plus tall, short, pear, apple and extreme bodies, across the whole spec space. every draft passes geometric invariants (side seam balance, dart totals, armhole allowance, self intersection, print fit). 8/8 ctest green.
- **seam pair precision: worst pair 0.00 mm.** `tools/precision-report.js` measures every seam pair a tailor would actually pin and fails anything above 1.0 mm. it found two real gaps (shoulder pair 8-10 mm, empire side seam ~2 mm) and both are now zero.
- **web fuzz: 19,555 drafts, 0 failures.** `tools/web-fuzz.js` walks the whole spec space through the ui with extreme body measurements and simulates the print packer. no piece can be clipped.
- **golden reference pinned in the repo** (`engine/golden-reference.csv`, 23k rows). `golden-diff.py` compares the deterministic output at 0.1 mm tolerance.
- **vision accuracy: opus teacher at 86%** against hand labels. zero-shot clip stayed at 44% and siglip at 65%, a dead end. the plan is to distill opus into an onnx student that runs in the browser.

## tech

- engine: c++17, cmake, ctest. single-file wasm bundle via emscripten/embind (~218 kb)
- web: static html/css/js on github pages, no framework. patterns are svg, printing is client-side tiled a4 pdf. measurements and wardrobe live in local storage/indexeddb
- backend: one cloudflare worker that proxies claude vision behind an app token and per-ip rate limits. the browser never holds an api key
- vision experiments: node + @xenova/transformers (onnx)
- knowledge: sqlite database of drafting formulas. a formula only becomes `verified` after adversarial source checking

## why i built it ❤️

ready-made patterns fit nobody exactly, there is no body called small-medium-large. when you see a garment and want to sew it yourself, you either buy an expensive pattern or fight the math. i wanted to close that distance: an engine that sits between the thing you saw and your own body. and measurements are personal data, so none of them go to the cloud.

## repo layout

- `engine/` c++ engine, tests, tools, wasm build, `FORMULAS.md` (the drafting spec)
- `web/` the live site
- `backend/` cloudflare worker (vision proxy)
- `vision/` owning the vision model (eval + distillation corpus)
- `knowledge/` verified drafting formula database
- `App/` the original swift ios app, kept as reference. the c++ core will feed ios/android later
- `docs/ARCHITECTURE.md` layers, data flow, design decisions

details in `PROJECT.md` and `PLAN.md`.
