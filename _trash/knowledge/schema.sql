-- Stitchu knowledge base
-- Source of truth: this file. stitchu.db is generated from it.
-- Only claims that survived 3-vote adversarial verification enter with status 'verified'.
-- Refuted claims are kept with status 'refuted' so we never accidentally use them.

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  quality TEXT CHECK(quality IN ('primary','secondary','blog','unreliable')),
  angle TEXT,
  notes TEXT
);

CREATE TABLE findings (
  id INTEGER PRIMARY KEY,
  topic TEXT NOT NULL,
  claim TEXT NOT NULL,
  evidence TEXT,
  confidence TEXT CHECK(confidence IN ('high','medium','low')),
  vote TEXT,
  status TEXT DEFAULT 'verified' CHECK(status IN ('verified','refuted','unverified')),
  source_urls TEXT
);

-- Parametric base blocks the engine can learn from or wrap
CREATE TABLE blocks (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  origin TEXT,
  garment_scope TEXT,
  measurements TEXT,
  reliability_notes TEXT,
  source_url TEXT
);

-- Reusable algorithmic techniques for the pattern engine
CREATE TABLE engine_techniques (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code_reference TEXT,
  use_case TEXT,
  source_url TEXT
);

-- Notion rules the app recommends (zippers now, buttons/interfacing later)
CREATE TABLE zipper_rules (
  id INTEGER PRIMARY KEY,
  zipper_type TEXT NOT NULL,
  description TEXT,
  garment_use TEXT,
  construction_notes TEXT,
  source_url TEXT
);

-- How successful courses teach beginners; feeds the in-app teaching content
CREATE TABLE teaching_models (
  id INTEGER PRIMARY KEY,
  provider TEXT NOT NULL,
  course TEXT,
  structure TEXT,
  format TEXT,
  price TEXT,
  key_principle TEXT,
  source_url TEXT
);

-- Fabric intelligence: filled by research round 2
CREATE TABLE fabrics (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_tr TEXT,
  drape TEXT,
  weight TEXT,
  stretch TEXT,
  good_for TEXT,
  bad_for TEXT,
  beginner_difficulty TEXT,
  common_mistakes TEXT,
  source_url TEXT
);

-- Classical drafting formulas: filled by research round 2
CREATE TABLE drafting_formulas (
  id INTEGER PRIMARY KEY,
  block TEXT NOT NULL,
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  system TEXT,
  notes TEXT,
  source_url TEXT,
  verified INTEGER DEFAULT 0
);

CREATE TABLE research_gaps (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','answered'))
);
