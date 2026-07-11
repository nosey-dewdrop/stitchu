# stitchu

*from a photo of a garment to a sewing pattern in your size, printed true-scale on A4.*

### live: https://damlahelloworld.github.io/stitchu/

## what is this?
you see a design you love, you photograph it, stitchu reads it and drafts a pattern to your own measurements — ready to print on regular A4 paper at true scale, tape together and cut. drafting rules that pattern makers keep in their heads, written down in code.

## features
- photo in, pattern out: vision reads the garment, the engine drafts it
- patterns drafted to your measurements, not standard sizes
- true-scale A4 print with assembly marks
- stitch wall of drafted patterns
- one drafting engine shared across web, iOS and android

## technologies
- C++ drafting engine (2805 drafts in the test matrix), compiled to WASM for the web
- Claude vision for reading garment photos
- static web app on GitHub Pages, worker for the vision call

## where this is going
the web flow is live end to end. next: the iOS app on the same engine, and small-scale test stitches.
