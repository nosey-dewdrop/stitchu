# V7-H — the sleeve refusal printed a fabricated number

## What was broken?

`engine/src/validator.cpp:419` — the convergence-miss refusal for a set-in sleeve.

V7-D (383936e) made the armhole basis dynamic: the message should say whether the
armhole came from DRAWN named edges or from a SCALAR copy. The ternary
`armholeNamed ? "DRAWN" : "SCALAR(unnamed)"` was added to the argument list, but the
word `DRAWN` was left hard-coded in the format string and no `%s` was added.

Result: 6 specifiers, 7 arguments, and every argument after the first shifted by one
slot. A `const char*` was fed to `%.1f`, a `double` to `%d`, an `int` to `%.0f`.
`fmt` is `vsnprintf` + varargs with no format attribute, so the compiler said nothing.

## Where it hid

The branch only opens when convergence misses AND the ease is out of window. None of
the 48 shipped spec x size rows opens it, so no gate — ctest, golden, or
`sleeve_cap_ease_check` — ever printed the string. It was live, reachable, and unseen.

## What was fixed?

1. `engine/src/validator.cpp:419` — `vs DRAWN armhole` became `vs %s armhole`.
   Specifiers and arguments now match 7-to-7. Nothing else about the message changed:
   it still names the basis (DRAWN vs SCALAR(unnamed)), the drawn armhole length, the
   named-edge count, the measured ease, the target, and the missed distance.
2. `engine/src/validator.cpp:24-31` — `fmt` now carries
   `__attribute__((format(printf, 1, 2)))` behind a `STITCHU_PRINTF_LIKE` macro
   (GCC/Clang only, no-op elsewhere). The whole bug class is now a compile error class.

## Proof — `GECE/log/V7-H.fmt.txt`

The guard was TEMPORARILY replaced with `if (true)` so the path fires on every sleeved
draft in `engine_check`, then restored. Same draft, same run, both sides:

BEFORE
```
cap seam 391.0 vs DRAWN armhole 0.0 (-60261330 named edge(s)) + 0% ease = 4.0 — convergence missed by 391.0 mm
```
AFTER
```
cap seam 391.0 vs DRAWN armhole 375.9 (4 named edge(s)) + 4% ease = 391.0 — convergence missed by 0.0 mm
```

The AFTER numbers close: 375.9 x 1.04 = 391.0 = the cap seam, so the miss is 0.0 mm —
which is correct, because the guard was forced open on a draft that actually converged.
The BEFORE line claimed a 0.0 mm armhole, minus sixty million named edges, and a 4.0 mm
target.

Guard proof, same log: reintroducing the old format string now produces 4 `-Wformat`
warnings at the exact argument positions. It used to compile silently.

## Gates

| gate | command | result |
|---|---|---|
| build | `cmake --build engine/build -j8` (Release) | clean, **0** warnings/errors across the whole tree |
| ctest | `ctest --test-dir engine/build --output-on-failure` | 114 tests, 6 failed — `GECE/log/V7-H.ctest.txt` |
| red set | — | `flat_pattern_agree_check · flat_artifact_census · style_check · sizechart_source_check · contract_check · figure_check` — the 6 inherited names, no growth |
| golden | `./engine/build/golden_dump > /tmp/vh.csv && cmp /tmp/vh.csv engine/golden-reference.csv` | byte-identical |
| cap ease | `node engine/tests/sleeve_cap_ease_check.mjs` | `PASS — 48 rows, 0 violations` |
| vocabulary | `bash engine/tests/vocab_reference_check.sh` | `YESIL — 37 axes + 92 words, nothing above baseline` |
| wasm | `bash engine/build-wasm.sh` | rebuilt, `web/vendor/` + `backend/engine/` in the commit (V7-D shipped the buggy string into both) |

## Reported, not touched

The format attribute raised **no** warnings anywhere else in the tree, so it exposed no
other latent format bugs. Only the line this phase introduced was changed.
