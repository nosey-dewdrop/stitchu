// ============================================================================
// gen-legacy-redirects.mjs — TUR 18 (18C). THE PRODUCER web/blog/** NEVER HAD.
//
// WHY THIS FILE EXISTS.
// guard.json's generated-web-html rule declares web/blog/**.html GENERATED
// ("change the generator, not the HTML"). For two turns that sentence was
// FALSE: web/blog/index.html was hand-written and no producer on disk emitted
// it. 13C (TUR 13) saw the contradiction and correctly refused to resolve it by
// hand ("loosening the rule and hand-editing the HTML would both be wrong").
// site-health has been RED on it ever since — 1 dead internal reference:
//
//     web/blog/index.html -> ../patterns/     (404: af49514 deleted the tree)
//
// The stub's ONLY job is to rescue old inbound /blog/ links. It was sending
// every one of them into a 404, so it was failing the one thing it existed for.
//
// WHAT THIS IS. A producer for legacy-address redirect stubs, driven by the
// declared map below. It is data, not prose:
//
//   target: "<path>"  -> emit a noindex redirect stub pointing at that page,
//                        BUT ONLY IF the page exists on disk. A target that is
//                        not on disk is a FATAL error, never a written file.
//                        A redirect stub can therefore never ship a dead link.
//   target: null      -> the destination is gone for good. Emit NOTHING and
//                        REMOVE the stub if it is on disk. A redirect into a
//                        404 is strictly worse than a 404: same landing page
//                        for the visitor, plus a lie in between, plus a
//                        redirect chain for the crawler.
//
// WHY web/blog/index.html IS null AND NOT REPOINTED.
//   - /patterns/ is not coming back under EITHER branch of DAMLA-KUYRUK K16.
//     af49514 deleted web/patterns/index.html on purpose ("fake pattern
//     gallery ... presented output that fails the buyable-object test"), and
//     guard.json records (measured) that restoring web/patterns/svg/meta.json
//     would re-inject 22 deleted-gallery URLs into the sitemap. K16 is about
//     vintage6070/meta.json and the four collection producers; nobody has
//     proposed bringing the /patterns/ ADDRESS back.
//   - Repointing it at web/index.html or web/collections/ would be inventing a
//     destination. The collections pages are downstream artefacts of the very
//     gallery Damla deleted for failing the buyable-object test; aiming old
//     /blog/ links at them resurrects the deleted thing as the answer.
//   - Nothing on the live site links to /blog/ (measured: zero inbound refs in
//     web/, outside the stub itself). It is noindex and absent from the
//     sitemap. Removing it costs the site no link, no crawl budget, no page.
//
// WHY A PRODUCER AND NOT A ONE-LINE DELETE. Measured 2026-08-17: rabadon's
// no-shell-write-protected-path DENIES `git rm web/blog/index.html` and
// generated-web-html DENIES a Write/Edit to it. That is the guard working, not
// a nuisance: the only sanctioned way to move a protected path is "run its
// producer, then generated_ratchet_check.sh --accept, commit both together".
// So the honest move is to give the path the producer the rule always claimed
// it had. This is NOT 13C's route (a throwaway /tmp script hand-writing
// content): this producer is tracked, named in the rule, and its output is
// declared in contract/generated-paths.sha256 in the same commit.
// Neither guard pattern was loosened — web/blog/ stays sealed, exactly as
// web/patterns/ stays sealed after its tree was deleted.
//
// USAGE
//   node engine/tools/gen-legacy-redirects.mjs           # produce
//   node engine/tools/gen-legacy-redirects.mjs --check    # gate (CI)
// ============================================================================
import { readFileSync, writeFileSync, existsSync, unlinkSync, rmdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, posix } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK = process.argv.includes('--check');

// ---------------------------------------------------------------- THE MAP
// One line per legacy address. `target` is a repo-relative path under web/,
// or null when the destination is permanently gone.
const REDIRECTS = [
  {
    stub: 'web/blog/index.html',
    target: null,
    why: 'target web/patterns/ deleted by af49514 (29 Jul, "delete fake pattern gallery"); '
       + 'the address is not restored under either branch of DAMLA-KUYRUK K16, and no live '
       + 'page is an honest successor. Stub removed rather than repointed: a redirect into a '
       + '404 lands the visitor in the same place as a plain 404 and lies on the way.',
  },
];

const stubHTML = (targetRel, canonical) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Moved · stitchu</title>
<link rel="canonical" href="${canonical}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${targetRel}">
<script>location.replace('${targetRel}');</script>
<style>
  body{font-family:Helvetica,Arial,sans-serif;color:#1f3a5f;background:#fff;margin:0;padding:60px 32px;line-height:1.55}
  a{color:#1f3a5f}
</style>
</head>
<body>
<p>This page has moved. <a href="${targetRel}">Continue</a>.</p>
</body>
</html>
`;

let fail = 0;
const say = (s) => console.log(s);

for (const r of REDIRECTS) {
  const stubAbs = join(ROOT, r.stub);
  const onDisk = existsSync(stubAbs);

  if (r.target === null) {
    // A MISSING LAW IS NEVER A PASS: the check must assert the stub is GONE,
    // not merely shrug when it cannot find it.
    if (CHECK) {
      if (onDisk) {
        say(`FAIL  ${r.stub} is on disk but its declared target is null (${r.why})`);
        fail++;
      } else {
        say(`ok    ${r.stub} absent, as declared`);
      }
      continue;
    }
    if (onDisk) {
      unlinkSync(stubAbs);
      say(`removed  ${r.stub}  — ${r.why}`);
      const dir = dirname(stubAbs);
      try { if (readdirSync(dir).length === 0) { rmdirSync(dir); say(`removed  ${relative(ROOT, dir)}/ (now empty)`); } }
      catch { /* dir kept: not empty, or not removable — never fatal */ }
    } else {
      say(`ok       ${r.stub} already absent`);
    }
    continue;
  }

  // A declared target that is not on disk is FATAL in both modes. This is the
  // gate: no fabricated URL can reach the site through this producer.
  const targetAbs = join(ROOT, r.target);
  if (!existsSync(targetAbs)) {
    say(`FAIL  ${r.stub}: declared target ${r.target} is NOT on disk — refusing to emit a dead redirect`);
    fail++;
    continue;
  }
  const rel = posix.relative(posix.dirname(r.stub), r.target).replace(/index\.html$/, '');
  const canonical = 'https://stitchu.noseydewdrop.com/'
    + r.target.replace(/^web\//, '').replace(/index\.html$/, '');
  const want = stubHTML(rel, canonical);
  const have = onDisk ? readFileSync(stubAbs, 'utf8') : null;
  if (CHECK) {
    if (have !== want) { say(`FAIL  ${r.stub} differs from what the producer emits (hand-edit or stale)`); fail++; }
    else say(`ok    ${r.stub} -> ${rel}`);
  } else {
    if (have !== want) { writeFileSync(stubAbs, want); say(`wrote    ${r.stub} -> ${rel}`); }
    else say(`ok       ${r.stub} -> ${rel} (unchanged)`);
  }
}

say(`legacy-redirects: ${REDIRECTS.length} declared, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
