-- Round 2 resume (2026-07-02): remaining verifications completed after session limit reset.
-- 104 agents, verified claims below. Two structural FreeSewing claims and the M&S
-- 1cm tolerance rule were refuted; fabric got generic verified rules only.

-- The earlier refutation of the M&S balance formula was superseded: the resume verified
-- the nuanced version 3-0 (it is a chart proportion, not a universal body rule).
UPDATE findings SET
  claim = 'Muller & Sohn treats back/front waist length as balance measurements in fixed chart proportion: front waist length II = back waist length + 4cm PER THEIR STANDARD CHART (chart-dependent, not universal per body). Verified 3-0 on resume after an earlier vaguer version was refuted.',
  evidence = 'Verbatim from free measurement tutorial: "Back and front length are balance measurements. They must be in the tight proportion (e.g. BWL + 4 cm = FWL II etc. - see measurement chart)."',
  confidence = 'high', vote = '3-0', status = 'verified'
WHERE claim LIKE 'REFUTED: "Muller & Sohn front waist length II%';

INSERT INTO findings (topic, claim, evidence, confidence, vote, status, source_urls) VALUES
('drafting_systems',
 'REFUTED: Muller & Sohn "1cm tolerance rule" (measured vs calculated diff > 1cm indicates figure deviation). Lost 0-3, do not use.',
 'Adversarial panel refuted 0-3.',
 'low','0-3','refuted',
 '["https://www.muellerundsohn.com/en/allgemein/taking-measurements/"]'),
('pattern_engine',
 'UNRESOLVED: whether FreeSewing offers a darted straight-skirt block. Claims about the designs directory (89 designs, Sandy as circle skirt) were refuted 0-3. No verified skirt block or sleeve-cap formulas exist yet — Stitchu''s SkirtBlock is our own draft using standard practice + Titan-style percentage ease, and must be validated against a known-good pattern before launch.',
 'Both structural claims lost 0-3 on the designs listing.',
 'medium','0-3','refuted',
 '["https://codeberg.org/freesewing/freesewing/src/branch/develop/designs"]'),
('fabric',
 'Fabric-to-silhouette rule (UKY Extension CT-MMB.180): tailored designs need FIRM fabrics; SOFT fabrics work best with flowing designs that have ease or gathers. Live URL dead - cite Wayback snapshot.',
 'Verbatim: "Tailored style designs/patterns need firm fabrics. Soft fabrics work best with pattern designs that are flowing, ones with ease or gathers."',
 'high','3-0','verified',
 '["http://web.archive.org/web/20240629225624/http://fcs-hes.ca.uky.edu/sites/fcs-hes.ca.uky.edu/files/ct-mmb-180.pdf"]'),
('fabric',
 'Beginner fabric difficulty (UKY Extension): cotton/poly blends A good choice (one of ~10 hints, not THE pick); medium-weight easier than very light/heavy; firm weaves easier than loose or slippery. Slippery satin and loose weaves hardest for beginners (satin part is corroborated inference).',
 'Two 3-0 claims merged, verbatim from "Choosing Easy-to-Sew Fabrics" page 2.',
 'high','3-0','verified',
 '["http://web.archive.org/web/20240629225624/http://fcs-hes.ca.uky.edu/sites/fcs-hes.ca.uky.edu/files/ct-mmb-180.pdf"]'),
('drafting_systems',
 'Classic ease cross-check (dresspatternmaking.com analysis, verifier-level provenance only): Aldrich bodice ~7cm bust ease, Armstrong 5th ed ~8.3cm, both fixed cm — versus FreeSewing''s percentage ease (Brian 15%, Bella 11%). Treat as orientation, not verified formula.',
 'Surfaced during verifier cross-check of Brian chest ease claim; not independently verified.',
 'medium','3-0 (indirect)','verified',
 '["https://dresspatternmaking.com/other/analyzing-other-block-making-intro/ease-bodice-aldrich/"]');

INSERT INTO drafting_formulas (block, name, formula, system, notes, source_url, verified) VALUES
('bodice','front/back balance','front waist length II = back waist length + 4cm (per M&S standard women''s chart; chart-dependent proportion, not universal)','Muller & Sohn','Balance relationship between the two length measurements.','https://www.muellerundsohn.com/en/allgemein/taking-measurements/',1),
('bodice','front neck width','front neck width factor = neck * 0.17 (back = neck * 0.197)','FreeSewing Bella','','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs',1),
('trousers','back fork position','back fork x = seatBackArc * (1 + seatEase) * -1.25 (mirror of front rule)','FreeSewing Titan','','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/back.mjs',1),
('trousers','back cross seam curve','back cross seam: 12 deg default angle (0-20), 65% bend (45-85), 85% curve start; iterative fit vs crossSeamBack, slash-and-spread delta/-15 deg + fork nudge delta/5, max 15 runs, 1mm tolerance','FreeSewing Titan','Front uses 25 deg / 80% / 80%.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/back.mjs',1),
('trousers','leg and waist balance','back leg panel share = 57.5% of total leg width (52.5-62.5%); waist fabric distribution 60% (30-90%)','FreeSewing Titan','Back panel is deliberately wider than front.','https://freesewing.eu/docs/designs/titan/options/',1);

INSERT INTO sources (url, quality, angle) VALUES
('http://web.archive.org/web/20240629225624/http://fcs-hes.ca.uky.edu/sites/fcs-hes.ca.uky.edu/files/ct-mmb-180.pdf','primary','fabric rules'),
('https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/back.mjs','primary','freesewing algorithms'),
('https://dresspatternmaking.com/other/analyzing-other-block-making-intro/ease-bodice-aldrich/','blog','drafting systems');

UPDATE research_gaps SET status='answered'
WHERE question LIKE 'Fabric properties%';
INSERT INTO research_gaps (question, status) VALUES
('Per-fabric profiles (viscose, linen, poplin, satin, crepe, jersey): drape/weight/stretch + beginner pitfalls — only GENERIC firm/soft rules verified so far','open'),
('Interfacing selection rules: two rounds, zero surviving claims — needs Threads chart + university sources read directly','open'),
('Beginner sewing YouTube/blog landscape: zero surviving claims after two rounds','open'),
('Sleeve cap formulas + fitted straight-skirt dart intake: no verified source yet; validate our SkirtBlock against a known-good pattern','open');
