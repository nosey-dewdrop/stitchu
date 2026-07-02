-- Fabric profiles (2026-07-02): filled by DIRECT source reading (no agent fan-out).
-- Sources: NMSU Extension G-401 fiber table, SDSU Extension 4-H definitions,
-- UNL Extension NF00-415 Sewing with Knits, UKY Extension CT-MMB.180 (Wayback).
-- Crepe deliberately absent: no authoritative source reachable (Threads Magazine
-- behind Cloudflare); tracked in research_gaps.

INSERT INTO sources (url, quality, angle) VALUES
('https://pubs.nmsu.edu/_g/G401.pdf','primary','fabric profiles'),
('https://extension.sdstate.edu/sites/default/files/2020-03/02-03-02-04-05.pdf','primary','fabric + interfacing'),
('https://digitalcommons.unl.edu/extensionhist/1186','primary','knits / jersey');

INSERT INTO fabrics (name, name_tr, drape, weight, stretch, good_for, bad_for, beginner_difficulty, common_mistakes, source_url) VALUES
('cotton poplin','pamuklu poplin','crisp, holds shape','medium','none',
 '["skirt","dress","top","structured shapes","first projects"]',
 '["slinky flowing designs"]','easy',
 '["skipping preshrink","expecting drape from a crisp fabric"]',
 'https://pubs.nmsu.edu/_g/G401.pdf'),
('linen','keten','somewhat stiff','light-medium','none',
 '["skirt","dress","top","summer garments","structured shapes"]',
 '["wrinkle-free looks","tight fitted styles"]','easy-moderate',
 '["not preshrinking","forgetting it wrinkles by nature"]',
 'https://pubs.nmsu.edu/_g/G401.pdf'),
('viscose/rayon','viskon','very fluid, flowing','light','none woven, distorts easily',
 '["dress","flowing skirts","gathered styles","draped tops"]',
 '["tailored/structured designs","crisp pleats","fitted skirt"]','hard for beginners',
 '["letting it hang off the cutting table (stretches off grain)","skipping staystitching","washing roughly (weak when wet)","not expecting shrink/stretch"]',
 'https://pubs.nmsu.edu/_g/G401.pdf'),
('satin','saten','fluid with sheen','light-medium','none',
 '["eveningwear","flowing dresses","linings"]',
 '["everyday hard-wearing garments (weave shows wear quickly)","beginner first projects","structured skirt/top"]','hard',
 '["choosing satin as a first project (slippery)","expecting durability from a floating weave"]',
 'https://pubs.nmsu.edu/_g/G401.pdf'),
('jersey','jarse','soft, follows the body','light-medium','moderate-high (stable <12.5%, moderate ~30%, super 50%+ per UNL 4-inch test)',
 '["t-shirts","t-dresses","pull-on skirts","leggings","unstructured styles"]',
 '["structured tailored designs","woven-drafted patterns (needs negative ease)"]','moderate',
 '["plain straight stitch (seams pop; use narrow zigzag 1-1.5mm)","regular needle (use ballpoint 75/11-80/12)","hemming before hanging 24h","sliding the iron (stretches fabric)"]',
 'https://digitalcommons.unl.edu/extensionhist/1186');

-- Interfacing: two rounds of harness research produced nothing; direct university reading did.
INSERT INTO findings (topic, claim, evidence, confidence, vote, status, source_urls) VALUES
('sewing_technique',
 'Interfacing selection (university sources, direct read): WOVEN FUSIBLE gives crisp support for collars, cuffs, yokes, pockets, facings and detail areas. KNIT interfacing is a supple stabilizer for dresses, jackets, pants — best with light-to-midweight knits, wovens, sweater knits; excellent with wool, flannel, gabardine. Knit garments need LITTLE interfacing overall: fusible knit only where support is needed (buttonholes, pockets, plackets, necklines), chosen by weight, stretch and desired look.',
 'SDSU Extension 4-H definitions (woven fusible + knit interfacing roles) and UNL NF00-415 (knits use little interfacing; fusible knit for support points). Direct source reading, not adversarially panel-verified — university provenance.',
 'high','direct-read','verified',
 '["https://extension.sdstate.edu/sites/default/files/2020-03/02-03-02-04-05.pdf","https://digitalcommons.unl.edu/extensionhist/1186"]'),
('fabric',
 'Viscose/rayon per NMSU fiber table: weaker than most fibers ESPECIALLY WHEN WET, soft, comfortable, may shrink or stretch unless treated, affected by sunlight, wrinkles easily. Combined with UKY soft-fabric rule: suits flowing/gathered designs, unsuitable for tailored/structured garments. This is the app''s "viskon uyarisi" basis.',
 'NMSU G-401 Table 1 verbatim; UKY CT-MMB.180 silhouette rule.',
 'high','direct-read','verified',
 '["https://pubs.nmsu.edu/_g/G401.pdf"]'),
('fabric',
 'Satin weaves per NMSU: "not very durable and tend to show wear quickly" (loosely woven and satin weaves). Slippery = beginner-hostile per UKY easy-to-sew criteria.',
 'NMSU G-401 verbatim; UKY CT-MMB.180.',
 'high','direct-read','verified',
 '["https://pubs.nmsu.edu/_g/G401.pdf"]');

UPDATE research_gaps SET status='answered' WHERE question LIKE 'Per-fabric profiles%';
UPDATE research_gaps SET status='answered' WHERE question LIKE 'Interfacing selection rules%';
INSERT INTO research_gaps (question, status) VALUES
('Crepe fabric profile: no authoritative source reachable yet (Threads Magazine behind Cloudflare); find a university/textbook source','open');
