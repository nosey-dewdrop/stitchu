-- Round 1 deep research (2026-07-02): 24 sources fetched, 109 claims extracted,
-- 25 verified with 3-vote adversarial panel: 22 confirmed, 3 refuted.

INSERT INTO sources (url, quality, angle) VALUES
('https://www.muellerundsohn.com/en/shop/metric-patternmaking-for-dresses-and-blouses/','primary','drafting systems'),
('https://freesewing.dev/tutorials/pattern-design/','primary','freesewing algorithms'),
('https://freesewing.dev/tutorials/pattern-design/part2/constructing-the-neck-opening/','primary','freesewing algorithms'),
('https://github.com/freesewing/freesewing','primary','freesewing algorithms'),
('https://codeberg.org/freesewing/freesewing','primary','freesewing algorithms'),
('https://freesewing.eu/designs/brian/','primary','freesewing algorithms'),
('https://freesewing.eu/designs/bella/','primary','freesewing algorithms'),
('https://freesewing.eu/blog/bella-bodice-block/','primary','freesewing algorithms'),
('https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/fcs2842.pdf','primary','sewing technique'),
('https://www.seamwork.com/online-sewing-classes/learn-to-sew','primary','teaching models'),
('https://closetcorepatterns.com/products/learn-to-sew-clothing-online-sewing-class','primary','teaching models'),
('https://www.seamwork.com/fabric-guides/how-to-choose-the-best-interfacing-for-your-sewing-project','secondary','sewing technique'),
('https://www.threadsmagazine.com/project-guides/learn-to-sew/a-handy-chart-of-fusible-and-sew-in-interfacings','secondary','sewing technique'),
('https://dresspatternmaking.com/patternmaking-basics/analyzing-other-block-making-intro','blog','drafting systems');

INSERT INTO findings (topic, claim, evidence, confidence, vote, status, source_urls) VALUES
('drafting_systems',
 'Muller & Sohn system scope confirmed (bodice blocks, dart manipulation, shaping seams, collars, sleeves) but NO actual formulas, ease values or ratios are publicly available on shop pages; formulas must come from the books or their free tutorial articles.',
 'Official shop page is a contents description only; verifier confirmed no formulas published.',
 'high','3-0','verified',
 '["https://www.muellerundsohn.com/en/shop/metric-patternmaking-for-dresses-and-blouses/"]'),
('pattern_engine',
 'FreeSewing GitHub repo archived (read-only) on 2025-04-02; canonical active code is at codeberg.org/freesewing/freesewing. Any algorithm audit must use Codeberg.',
 'GitHub API returns archived:true; README points to Codeberg; Codeberg active as of 2026-07-01 with identical monorepo structure (core, plugins, designs).',
 'high','3-0','verified',
 '["https://github.com/freesewing/freesewing","https://codeberg.org/freesewing/freesewing"]'),
('teaching',
 'Both Seamwork and Closet Core converge on the same beginner teaching model: small curated skill core applied to 2-3 complete real garments (not isolated drills), explicitly designed to prevent beginner dropout after the first project. Stitchu sewing guide should mirror this.',
 'Seamwork: "80/20 Skills", 12 modules, 2 garments (Quince jacket, Georgia dress). Closet Core: 9-lesson ~5h fundamentals then 3.5h construction of 3 patterns (Fiore skirt, Cielo top/dress, Pietra pants).',
 'high','3-0','verified',
 '["https://www.seamwork.com/online-sewing-classes/learn-to-sew","https://closetcorepatterns.com/products/learn-to-sew-clothing-online-sewing-class"]');

INSERT INTO findings (topic, claim, evidence, confidence, vote, status, source_urls) VALUES
('sewing_technique',
 'REFUTED: "lapped zipper should be the beginner default over centered". Do not encode this rule.',
 'Lost adversarial verification 0-3.',
 'low','0-3','refuted',
 '["https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/fcs2842.pdf"]'),
('sewing_technique',
 'REFUTED: "match interfacing of similar-or-lighter weight than garment fabric, never heavier". Needs fresh research before use.',
 'Lost adversarial verification 1-2.',
 'low','1-2','refuted',
 '["https://www.seamwork.com/fabric-guides/how-to-choose-the-best-interfacing-for-your-sewing-project"]'),
('sewing_technique',
 'REFUTED: "woven interfacing for medium/heavy or delicate fabrics, knit interfacing for knits and drapey wovens, non-woven only for crafts/bags". Needs fresh research before use.',
 'Lost adversarial verification 1-2.',
 'low','1-2','refuted',
 '["https://www.seamwork.com/fabric-guides/how-to-choose-the-best-interfacing-for-your-sewing-project"]');

INSERT INTO blocks (name, origin, garment_scope, measurements, reliability_notes, source_url) VALUES
('Brian','FreeSewing foundational menswear body block',
 'Base for loose/boxy garments only (t-shirts, hoodies extend it via @freesewing/brian). Deliberately unfitted: straight down from chest, zero waist shaping. NOT a fitted bodice.',
 '["biceps","chest","hpsToBust","hpsToWaistBack","neck","shoulderToShoulder","shoulderSlope","waistToArmpit","waistToHips","shoulderToWrist","wrist"]',
 'Verified 3-0. Coverage of many FreeSewing designs inherits from this one block.',
 'https://freesewing.eu/designs/brian/'),
('Bella','FreeSewing womenswear bodice block, parametric port of a real Italian commercial industry base block (anonymous collaborator)',
 'Drafting block, not a wearable pattern. Full bust-darted construction.',
 '["highBust","chest","underbust","waist","waistBack","bustSpan","neck","hpsToBust","hpsToWaistFront","hpsToWaistBack","shoulderToShoulder","shoulderSlope"]',
 'Verified 3-0 with explicit designer warning: designed for slim Italian sizing, "really not suitable for a very wide sizing range". Treat as narrow-validated. Replaced Breanna, FreeSewing''s failed from-scratch sloper.',
 'https://freesewing.eu/designs/bella/');

INSERT INTO engine_techniques (name, description, code_reference, use_case, source_url) VALUES
('Fractional measurement point placement',
 'Place pattern points as direct fractions of body measurements; curve control points at half the X/Y deltas between anchors.',
 'points.right = new Point(measurements.head / 10, 0); points.bottom = new Point(0, measurements.head / 12)',
 'Any block drafting step; cheap, deterministic, testable.',
 'https://freesewing.dev/tutorials/pattern-design/part2/constructing-the-neck-opening/'),
('Iterative path-length convergence',
 'When no closed-form formula exists for a curved opening, draft the curve, measure its path length, scale coordinates by a tweak factor (x0.99 if too long, x1.02 if too short) and loop until within 1mm of target length. Canonical technique for necklines and armholes. FreeSewing units are millimeters.',
 'do { ...draft...; delta = paths.quarterNeck.length() - target; if (delta > 0) tweak *= 0.99; else tweak *= 1.02; } while (Math.abs(delta) > 1)',
 'Neckline and armhole fitting in the Stitchu engine.',
 'https://freesewing.dev/tutorials/pattern-design/part2/constructing-the-neck-opening/'),
('Cubic Bezier curves for pattern lines',
 'All curved pattern edges drawn as cubic Bezier segments between drafted points; SVG-native, exports cleanly to PDF.',
 'FreeSewing core Path API',
 'SVG rendering + PDFKit export pipeline.',
 'https://freesewing.dev/tutorials/pattern-design/');

INSERT INTO zipper_rules (zipper_type, description, garment_use, construction_notes, source_url) VALUES
('conventional','One end open. Recommended length 7-9 inches (18-23 cm) for pants and skirts.','pants, skirts, dresses with seam openings','Standard insertion in an open seam.','https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/fcs2842.pdf'),
('separating','Both ends open, garment opens fully.','jackets, coats, blouses','','https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/fcs2842.pdf'),
('invisible','Only the pull shows on the right side; coil hidden in the seam.','dresses, skirts, fitted garments','INVERTED sew order: leave the seam below the zipper unstitched until AFTER the zipper is installed. Special invisible foot rides the coil (conventional zipper foot can substitute). On stretch fabrics stabilize the seam allowance with lightweight nonwoven interfacing first. Exposed zipper in a no-seam opening: interfacing 2in wide, 1in longer than opening.','https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/fcs2842.pdf');

INSERT INTO teaching_models (provider, course, structure, format, price, key_principle, source_url) VALUES
('Seamwork','Learn to Sew',
 '12 self-paced streaming video modules; technique modules (seams, curves, fullness, sleeves) feed directly into building 2 complete garments (Quince jacket, Georgia dress).',
 'project-based sew-along video','subscription',
 '"80/20 Skills": a small subset of sewing skills learnable quickly; frames beginner dropout after the first project as THE problem; structure over trial-and-error.',
 'https://www.seamwork.com/online-sewing-classes/learn-to-sew'),
('Closet Core Patterns','Learn to Sew Clothing',
 'Fundamentals-first: ~5h / 9 lessons (machine, stitches, seam finishes, fabric+interfacing selection, pattern reading, measuring/fitting, cutting, hand sewing), then 3.5h construction of 3 included patterns (Fiore skirt, Cielo top+dress, Pietra pants) covering zippers, pockets, facings, waistbands, hems, darts, sleeves, buttons.',
 'self-paced video, lifetime access','from $89 one-time',
 'Fundamentals then real garments; 3 projects collectively cover the entire core beginner technique set.',
 'https://closetcorepatterns.com/products/learn-to-sew-clothing-online-sewing-class');

INSERT INTO research_gaps (question, status) VALUES
('Actual drafting formulas (ease values, dart intake, armhole depth, crotch curve) for bodice/skirt/sleeve/trouser blocks from Aldrich, Joseph-Armstrong, Muller & Sohn free articles','in_progress'),
('Fabric properties (drape, weight, stretch) to garment type mapping for viscose, linen, cotton, satin, crepe, jersey + verified beginner mistakes','in_progress'),
('Correct interfacing selection rules (round 1 candidates refuted)','in_progress'),
('Which YouTube channels/blogs dominate beginner sewing education and which formats work','in_progress'),
('Does FreeSewing Codeberg contain reliable parametric skirt and trouser blocks; community feedback on wide size ranges','in_progress');
