# design rules — damla's bans (every site agent MUST read this before touching web/)

One statement from Damla = a sitewide law. Enforcement is inventory-based
(grep/lint), never eye-based. engine/tools/style-lint.mjs is the machine
guard; run it before every deploy. This file is the human-readable law.

BANNED everywhere, no exceptions without a written allowlist entry:
1. Em dash (—) in any visible text. Split the sentence or use a comma.
2. Single-edge accent bars (border-left/right stripes on quotes/notes).
   Quotes are plain italic. Full 4-side evidence cards are allowed.
3. Pill capsules (fully rounded badges/labels). Badges are flat, sharp-ish.
4. Unpunctuated sentence-headings. A statement heading ends with a period,
   a question with a question mark, a true label stays bare (Patch Notes, Closet).
5. "we/our" in brand copy. The voice is "i". (Addressing the user is fine.)
6. Colored single words, gradient decorations, emoji bullets, cream (krem) tones.
7. Arrow chains (a → b) in prose; write it out. Data tables may use plain
   before/after columns.
8. Hand-editing generator-produced pages (styles/, patterns/). Fix the
   generator, then regenerate; hand edits get silently reverted.

Conventions (positive):
- One shared shell: header/footer/buttons come from shared-*.css only.
  header-diff.mjs must report identical across all page families.
- Button system: .sb-btn.sb-primary (filled navy + inner white dashed frame)
  or .sb-secondary (dashed outline). Nothing else.
- Baby blue world: navy ink #1f3a5f family on white, gingham wallpaper on the
  hero/waitlist entry only, thin gingham band on white pages.
- Didot serif for display headings; punctuation per rule 4.
- Honest copy: every number has a source; misses are published too.
