# stitchu API

Turn body measurements + a garment spec into a real, true-scale sewing pattern —
pattern pieces, a step-by-step construction guide, and a fabric estimate. The
drafting runs on stitchu's own C++ engine (compiled to WebAssembly) inside the
edge worker, so there is **no per-call AI cost** and measurements are never sent
to any third party.

Base URL: `https://stitchu-api.<account>.workers.dev`

## POST /api/draft

Draft a pattern.

### Auth & tiers

| Caller | Header | Limit |
|--------|--------|-------|
| Public (web app) | none | 20/min, 200/day per IP |
| API customer | `x-app-token: <token>` | 20/min per IP (un-capped daily) |

The public tier is open because the engine has no marginal cost; it is throttled
only to keep any single IP from monopolising an isolate.

### Request

```json
{
  "spec": {
    "garment": "dress",
    "shaping": "princess",
    "waistline": "natural",
    "fabric": "woven",
    "neckline": "sweetheart",
    "sleeveStyle": "none",
    "sleeveLength": "short",
    "skirtStyle": "aLine",
    "skirtLength": "midi",
    "topLength": "hip",
    "ruffle": "tiered",
    "keyhole": "keyhole"
  },
  "measurements": {
    "bust": 92, "waist": 74, "hip": 98,
    "shoulder": 39, "backLength": 42, "armLength": 58, "neck": 36
  }
}
```

`spec.garment` is required. Every other spec field is optional and falls back to
the default shown above. Measurements are all seven, in **centimetres**.

#### Accepted spec values

| Field | Values (default first) |
|-------|------------------------|
| `garment` | `dress`, `top`, `skirt` — **required** |
| `shaping` | `princess`, `dart` |
| `waistline` | `natural`, `empire` (dress only) |
| `fabric` | `woven`, `knit` |
| `neckline` | `crew`, `scoop`, `vNeck`, `square`, `boat`, `sweetheart`, `halter` |
| `sleeveStyle` | `none`, `straight`, `balloon` |
| `sleeveLength` | `short`, `elbow`, `long` |
| `skirtStyle` | `aLine`, `straight`, `gathered`, `halfCircle`, `pleated` |
| `skirtLength` | `mini`, `midi`, `maxi` |
| `topLength` | `cropped`, `hip`, `tunic` (top only) |
| `ruffle` | `none`, `single`, `tiered` (hem ruffle) |
| `keyhole` | `none`, `keyhole` (front cut-out) |
| `edgeFinish` | `biasBinding`, `facing` — neckline + armhole finish. Bias binding (a thin trued 45° bias strip, the default) or a facing. A real collar overrides this to a faced neck. |

#### Measurement ranges (cm)

`bust` 60–160, `waist` 45–140, `hip` 60–170, `shoulder` 26–52,
`backLength` 28–55, `armLength` 40–75, `neck` 26–55.

**Optional:** `upperBust` (60–150 cm) — the high/upper bust girth, above the
bust and under the arms. When supplied, the engine runs a full-bust adjustment:
the back and armhole size to the ribcage frame, the front bust gets extra width
and length, and the bust dart grows with the cup — so a fuller bust is far less
likely to ride up and gape. Values ≥ the full bust are clamped. Omit it and the
draft uses a B/C-cup assumption (byte-identical to the 7-measurement draft).

### Response `200`

```json
{
  "apiVersion": "1",
  "spec": { ...normalised spec... },
  "measurements": { ...echoed... },
  "pattern": {
    "garment": "A-line dress",
    "fabricAdviceKey": "woven-structured",
    "fabricMeters140": 7.0,
    "guideSteps": ["Cut ...", "Stay-stitch ...", ...],
    "pieces": [
      {
        "name": "Bodice Center Front",
        "cutInstruction": "cut 1 on fold",
        "commands": [
          { "type": "move", "x": 0, "y": 8 },
          { "type": "line", "x": 61, "y": 0 },
          { "type": "curve", "x": 120, "y": 40, "cp1x": 80, "cp1y": 10, "cp2x": 100, "cp2y": 25 },
          { "type": "close" }
        ],
        "markings": [ ... ],
        "cutLine": [ ... ],
        "grainline": { "fromX": 40, "fromY": 229, "toX": 40, "toY": 390 },
        "seamAllowance": 15
      }
    ]
  }
}
```

Coordinates are in **millimetres**, y grows downward, and every point is a
**flat** key on the command — `x`/`y` for the endpoint, plus `cp1x`/`cp1y`/`cp2x`/`cp2y`
on a `curve`. Command `type` is one of `move`, `line`, `curve`, `close`.
`grainline` is likewise flat: `fromX`/`fromY`/`toX`/`toY`. `commands` is the
sewing line; `cutLine` is the same outline offset outward by `seamAllowance`.
Render each piece at 1 mm = 1 unit for a true-scale pattern.

### Errors

All errors are JSON `{ "error": "<code>", "detail": "<human message>" }`, some
with a `field` pointer or a `reasons` array.

| Status | `error` | When |
|--------|---------|------|
| `400` | `invalid_json` | Body is not valid JSON |
| `403` | `draft_closed` | Public tier disabled (`PUBLIC_DRAFT` off) |
| `413` | `body_too_large` | Request body over 20 KB |
| `422` | `missing_spec` / `missing_measurements` / `missing_field` | A required part is absent |
| `422` | `invalid_value` | A spec field is outside its vocabulary (see `field`) |
| `422` | `invalid_measurement` / `measurement_out_of_range` | A measurement is non-numeric or out of range |
| `422` | `undraftable` | The body + spec cannot be drafted into a sewable pattern; see `reasons[]` |
| `429` | `rate_limited` | Too many requests |
| `500` | `engine_error` | The engine failed to run |

A `422 undraftable` is a **feature**: rather than return a pattern that would
waste a customer's fabric, the API refuses an impossible body or an unsewable
combination and lists exactly why in `reasons`.

### Example

```bash
curl -s https://stitchu-api.<account>.workers.dev/api/draft \
  -H 'content-type: application/json' \
  -d '{"spec":{"garment":"dress","neckline":"halter","skirtStyle":"aLine","skirtLength":"mini"},
       "measurements":{"bust":100,"waist":78,"hip":104,"shoulder":42,"backLength":44,"armLength":60,"neck":38}}'
```

## POST /api/grade

One design, a whole size run. Send a `spec` (same vocabulary as `/api/draft`,
no measurements) and an EU size range; get back the design drafted against every
standard size in the range — the seller/brand deliverable. Same zero-LLM engine
as `/api/draft`; grading a design is drafting it against each standard body, so
there are no separate grade rules to drift out of sync.

### Request

```json
{
  "spec": { "garment": "dress", "neckline": "sweetheart", "shaping": "princess" },
  "from": "EU36",
  "to":   "EU44"
}
```

`spec` follows the same accepted values as `/api/draft` (garment required; the
rest fall back to engine defaults). `from`/`to` are EU sizes from `EU34` to
`EU52` in steps of two; an unknown or omitted label falls back to the full
chart, and a reversed range is ordered automatically.

### Response `200`

```json
{
  "apiVersion": "1",
  "spec": { ... the normalised spec ... },
  "from": "EU36",
  "to":   "EU44",
  "sizes": [
    { "size": "EU36", "draft": { "pattern": { ...same shape as /api/draft... }, "issues": [] } },
    { "size": "EU38", "draft": { "pattern": { ... }, "issues": [] } }
  ]
}
```

Each entry's `draft` is exactly the `/api/draft` payload for that standard body:
`pattern` (pieces, guide, fabric estimate) plus `issues`. A size whose `issues`
is non-empty was drafted but flagged unsewable at that size — a caller shipping
a size run should drop those, exactly as the web app does.

### Errors

Same shape and codes as `/api/draft`. `422 missing_spec` if `spec.garment` is
absent; `422 invalid_value` if a spec field is outside its vocabulary.

### Auth & tiers

| Caller | Header | Limit |
|--------|--------|-------|
| Public (web app) | none | 6/min, 60/day per IP |
| API customer | `x-app-token: <token>` | 20/min per IP (un-capped daily) |

Tighter than draft because one grade fans out to up to ten drafts. Both draft
and grade sleep behind `PUBLIC_DRAFT=on` for the public tier and answer `403
draft_closed`; if the rate-limit KV is unbound the public tier fails **closed**
with `503 draft_closed` rather than serving un-throttled.

### Example

```bash
curl -s https://stitchu-api.<account>.workers.dev/api/grade \
  -H 'content-type: application/json' \
  -d '{"spec":{"garment":"dress","neckline":"sweetheart","shaping":"princess"},"from":"EU34","to":"EU52"}'
```

## POST /api/analyze

Read a garment out of a **photo**, a **written description**, or both, and get
back the reading you then map onto a `/api/draft` spec. This is the only
endpoint with a per-call cost (it calls Claude vision), so it is the only one
gated three ways.

### Auth & tiers

| Caller | Header | Extra requirement | Limit |
|--------|--------|-------------------|-------|
| Public (web app) | none | `Origin` must be a stitchu page **and** the body must carry a valid `turnstileToken` | 3/min, 15/day per IP |
| App / API customer | `x-app-token: <token>` | none | 20/min per IP |

Both tiers also pass a single global daily spend cap (`DAILY_ANALYZE_CAP`,
default 300 analyses); when it is spent the endpoint answers `429
analysis_paused` for everyone, including the token tier. The public tier is off
unless the deploy sets `PUBLIC_ANALYZE=on`.

**Native apps (iOS) must use the `x-app-token` path.** The public tier's first
gate is an `Origin` allow-list of the two web origins, and a request with no
`Origin` header is refused (`403 forbidden_origin`) — a native URLSession sends
none. The second gate is a Turnstile browser challenge an app cannot solve.
Ship the token as a build-time secret (see `App/Stitchu/Secrets.example.txt`,
which becomes a gitignored `Secrets.swift`), never in the repo.

### Request

```json
{
  "image": "<base64 JPEG bytes, no data: prefix>",
  "mediaType": "image/jpeg",
  "text": "uzun kollu, dizaltı, düğmeli midi elbise",
  "turnstileToken": "<public tier only>"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `image` | base64 string | Optional. Strip the `data:image/jpeg;base64,` prefix. The web client downscales to a 1024 px longest edge at JPEG q0.8 first. |
| `mediaType` | string | Optional, default `image/jpeg`. One of `image/jpeg`, `image/png`, `image/webp`, `image/gif`; anything else falls back to `image/jpeg`. |
| `text` | string | Optional, trimmed, **max 500 characters**. |
| `turnstileToken` | string | Required on the public tier only. |

`image` or `text` must be present — **at least one**. When both arrive, the
words outrank the photo for any field the words actually state; fields the
words do not mention are still read from the picture.

### Response `200`

The endpoint returns the Anthropic Messages response **verbatim**, with
Anthropic's own status code. The garment reading is a JSON object inside the
first text block:

```json
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "model": "claude-opus-4-8",
  "content": [{ "type": "text", "text": "{\"garment\":\"dress\",\"neckline\":\"sweetheart\", ...}" }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 1620, "output_tokens": 380 }
}
```

So a client does `JSON.parse(data.content[0].text)`; the web client slices from
the first `{` to the last `}` before parsing, which survives a stray prose
wrapper, and an iOS client should do the same. The parsed object's fields —
`garment`, `neckline`, `sleeveStyle`, `sleeveLength`, `skirtStyle`, `length`,
`topLength`, `shaping`, `waistline`, `fabric`, `hemRuffle`, `keyhole`,
`fabricName`, `closure`, `collar`, `straps`, `cupSeams`, `sleeveHead`, `yoke`,
`backDetail`, `ratios`, `outOfVocab`, `details` — are the vision reading. The
exact schema the model is held to lives in `backend/analyze-core.js` and is
locked by `engine/tests/prompt_spec_check.mjs`. `garment` is never null;
anything a dress/skirt/top pattern cannot start from comes back as `other`.

Mapping that reading onto a `/api/draft` spec is the caller's job: `length` maps
to `skirtLength`, `hemRuffle` to `ruffle`, `keyhole` true/false to
`"keyhole"`/`"none"`, and `garment: "other"` is not draftable.

### Errors

Two error shapes exist on this endpoint and a client must handle both: the
newer `{ "error": "<code>", "detail": "<message>" }` and the older
`{ "error": "<human sentence>" }`. Branch on the HTTP status first.

| Status | Body | When |
|--------|------|------|
| `400` | `{"error":"Invalid request"}` | Body is not valid JSON |
| `400` | `{"error":"invalid_request","detail":"send an image, a text description, or both"}` | Neither `image` nor `text` |
| `401` | `{"error":"Unauthorized"}` | `x-app-token` sent but wrong, or `APP_TOKEN` unset |
| `403` | `{"error":"forbidden_origin"}` | No app token and the `Origin` is not a stitchu page |
| `403` | `{"error":"Photo analysis is not open yet"}` | `PUBLIC_ANALYZE` is off |
| `403` | `{"error":"verification_failed","detail":"Could not verify this request came from a browser."}` | Turnstile refused (public tier) |
| `413` | `{"error":"Image too large"}` | `content-length` over 2,800,000 bytes (public tier) |
| `413` | `{"error":"text_too_long","detail":"text is limited to 500 characters"}` | `text` over 500 characters |
| `429` | `{"error":"Rate limit exceeded. Please wait."}` | Per-IP fuse (3/min or 15/day public; 20/min token) |
| `429` | `{"error":"analysis_paused","detail":"..."}` | The global daily spend cap is spent — retrying sooner will not help |
| other | Anthropic's body | Upstream failures are passed through with Anthropic's status |

A `429` therefore means two different things and they need two different
sentences to the user: "slow down" for the fuse, "closed until tomorrow" for
`analysis_paused`.

### Example

```bash
curl -s https://stitchu-api.<account>.workers.dev/api/analyze \
  -H 'content-type: application/json' \
  -H "x-app-token: $STITCHU_APP_TOKEN" \
  -d "{\"image\":\"$(base64 -i dress.jpg | tr -d '\n')\",\"mediaType\":\"image/jpeg\"}"
```

Text only, no photo:

```bash
curl -s https://stitchu-api.<account>.workers.dev/api/analyze \
  -H 'content-type: application/json' \
  -H "x-app-token: $STITCHU_APP_TOKEN" \
  -d '{"text":"sweetheart yaka, prenses dikişli, midi A kesim elbise"}'
```

## Endpoints this document does not cover

`/api/wall`, `/api/wall/stitch`, `/api/wall/note` (the public stitch wall, off
unless `PUBLIC_WALL=on`) and `/api/waitlist` are internal to the website and are
not part of the app/API contract. They are declared in
`contract/design-tokens.json` under `api.undocumented`, so the gate
`engine/tests/ios_zemin_check.mjs` can tell "deliberately unpublished" apart
from "somebody opened an undocumented endpoint".
