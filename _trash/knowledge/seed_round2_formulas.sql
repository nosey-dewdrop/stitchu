-- Round 2 deep research (2026-07-02): concrete parametric drafting formulas
-- read directly from FreeSewing source code on Codeberg, each verified 3-0
-- (one 2-0). All ease values are percentages of the body measurement, not fixed cm.

INSERT INTO sources (url, quality, angle) VALUES
('https://www.muellerundsohn.com/en/allgemein/taking-measurements/','primary','drafting systems'),
('https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/front.mjs','primary','freesewing algorithms'),
('https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/brian/src/base.mjs','primary','freesewing algorithms'),
('https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs','primary','freesewing algorithms'),
('https://freesewing.eu/docs/designs/titan/options/','primary','freesewing algorithms');

-- Bodice / body block: Brian (menswear, loose fit)
INSERT INTO drafting_formulas (block, name, formula, system, notes, source_url, verified) VALUES
('bodice','armhole depth (default)','armhole line = waist height - waistToArmpit * (1 - armholeDepth - bicepsEase/2); defaults armholeDepth=2%, bicepsEase=15% => armhole sits ~waistToArmpit * 0.905 above waist','FreeSewing Brian','Legacy alternative: shoulder.y + biceps*(1+bicepsEase)*armholeDepthFactor, factor default 55% (range 50-70%).','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/brian/src/base.mjs',1),
('bodice','chest width','quarter width = chest * (1 + chestEase) / 4; default chestEase = 15% (range -4%..35%)','FreeSewing Brian','Total garment chest = body chest + 15% ease by default (loose block).','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/brian/src/base.mjs',1),
('bodice','neck opening','half-width = neck * (1 + collarEase) / 4.8; collarFactor constant 4.8, collarEase default 5%; back neck cutout depth = neck * 5% (range 2-8%)','FreeSewing Brian','Collar then fitted iteratively (do-while) until drafted curve = neck * (1+collarEase).','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/brian/src/base.mjs',1);

-- Bodice: Bella (womenswear, fitted, bust-darted)
INSERT INTO drafting_formulas (block, name, formula, system, notes, source_url, verified) VALUES
('bodice','back armhole depth','armholeDepth = hpsToWaistBack * 44% + shoulder point drop; adjustable 38-46%','FreeSewing Bella','Proportional to torso length, NOT chest/X + Y cm as in classic Aldrich-style drafting.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs',1),
('bodice','ease defaults (fitted female block)','chest ease 11% (5-20%), waist ease 5% (1-20%), bust span ease 10% (0-20%), shoulder-to-shoulder ease -0.5%','FreeSewing Bella','All percentages of body measurement. Slightly negative shoulder ease by default.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs',1),
('bodice','back waist dart','backWidth = (underbust/4)*(1+chestEase); waistWidth = (waistBack/2)*(1+waistEase); reduction = backWidth - waistWidth; 35% of reduction to center-back seam; dart width = reduction * 0.825; if <= 0, omit dart','FreeSewing Bella','Dart intake derived from suppression, with guard clause for zero/negative.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs',1),
('bodice','back neckline','back neck width = neck * 0.197; back neck cutout depth = neck * 6% (3-9%); back shoulder slope = measured shoulderSlope * 1.23','FreeSewing Bella','','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/bella/src/back.mjs',1);

-- Trousers: Titan
INSERT INTO drafting_formulas (block, name, formula, system, notes, source_url, verified) VALUES
('trousers','crotch fork position','fork X = seatFrontArc * (1 + seatEase) * 1.25 (crotch point extends 25% beyond eased front seat width); fork depth = waistToUpperLeg * (1 + crotchDrop)','FreeSewing Titan','','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/front.mjs',1),
('trousers','vertical structure','upper-leg line at waistToUpperLeg; seat line at waistToSeat; waist width = waistFrontArc * (1 + waistEase)','FreeSewing Titan','Measurement-driven, not seat-fraction-driven like Aldrich/Mueller. Requires richer measurement set.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/front.mjs',1),
('trousers','ease defaults','waist ease 2% (0-10%), seat ease 2% (0-10%), knee ease 6% (1-25%), crotch drop 2% (0-15%), length bonus 2%','FreeSewing Titan','Wearing ease ~2% at waist/seat by default, not a fixed cm value.','https://freesewing.eu/docs/designs/titan/options/',1),
('trousers','crotch curve fitting','iterative: delta = drafted crotch seam length - crossSeamFront; slash-and-spread (rotate waist points by delta/-15 around seatOut) until |delta| < 1mm','FreeSewing Titan','Same convergence philosophy as neckline fitting. No fixed geometric rule.','https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/front.mjs',1),
('trousers','crotch curve shape','crotch seam angle default 25 deg (0-35); curvature (bend) default 80% (45-100%); curve starts 80% of the way into the seam (60-95%) — straight for most of its length','FreeSewing Titan','Curve-start claim verified 2-0.','https://freesewing.eu/docs/designs/titan/options/',1);

-- System-level findings
INSERT INTO findings (topic, claim, evidence, confidence, vote, status, source_urls) VALUES
('drafting_systems',
 'Muller & Sohn derives all secondary measurements (scye depth, back waist length, hip depth...) from just two primary measurements: body height (BH) and chest girth (CG). Structure confirmed, but the actual constants are not public.',
 'Official taking-measurements article confirms derivation structure; no formulas published.',
 'high','3-0','verified',
 '["https://www.muellerundsohn.com/en/allgemein/taking-measurements/"]'),
('pattern_engine',
 'FreeSewing has a full open-source trouser block (Titan) on Codeberg. Together with Brian/Bella, the engine philosophy is consistent: direct body measurements + percentage ease + iterative curve convergence, NOT classical chest-fraction formulas. Stitchu engine should adopt this model.',
 'Titan front.mjs read at code level, formulas extracted verbatim, verified 3-0.',
 'high','3-0','verified',
 '["https://codeberg.org/freesewing/freesewing/src/branch/develop/designs/titan/src/front.mjs"]'),
('drafting_systems',
 'REFUTED: "Muller & Sohn front waist length II = back waist length + 4cm". Genuinely refuted 0-3, do not use.',
 'Lost adversarial verification 0-3.',
 'low','0-3','refuted',
 '["https://www.muellerundsohn.com/en/allgemein/taking-measurements/"]');

UPDATE research_gaps SET status='answered' WHERE question LIKE 'Does FreeSewing Codeberg contain reliable parametric skirt and trouser blocks%';
UPDATE research_gaps SET status='answered' WHERE question LIKE 'Actual drafting formulas%';
INSERT INTO research_gaps (question, status) VALUES
('Skirt block formulas (Titan covers trousers; no verified skirt block claims yet)','open'),
('Classical Aldrich/Armstrong constants for cross-checking FreeSewing percentages (book access needed)','open');
