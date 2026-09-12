#!/usr/bin/env node
// gen-design-tokens.mjs — contract/design-tokens.json is the SINGLE SOURCE of
// the visual language. This tool prints the two surfaces that consume it:
//
//   (default)  web/css/tokens.css        — the web's :root token block
//   --swift    App/Stitchu/Tokens.swift  — the same values for the iOS app
//
// Modes:
//   node scripts/gen-design-tokens.mjs             → write web/css/tokens.css
//   node scripts/gen-design-tokens.mjs --swift     → write App/Stitchu/Tokens.swift
//   node scripts/gen-design-tokens.mjs [--swift] --check   → do not write; exit 1 if
//                                       the file on disk differs from the render
//   ... --stdout                                   → print instead of writing
//
// The CSS render is BYTE-IDENTICAL to the tokens.css that shipped before this
// tool existed (proof: `--check` is green on the untouched file, and the gate
// engine/tests/ios_zemin_check.mjs re-runs that comparison on every ctest).
// The Swift file is NEW and does not touch the hand-written Theme.swift.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const CONTRACT = join(root, 'contract/design-tokens.json');

export function loadTokens() {
  return JSON.parse(readFileSync(CONTRACT, 'utf8'));
}

/** Render web/css/tokens.css exactly. */
export function renderCss(spec) {
  const { header, groups, tail, commentColumn } = spec.css;
  const out = [...header, ':root {'];
  groups.forEach((group, i) => {
    if (i > 0) out.push('');
    out.push(`  /* ${group.label} */`);
    for (const t of group.tokens) {
      let line = `  --${t.name}: ${t.value};`;
      if (t.comment) {
        const pad = Math.max(1, commentColumn - 1 - line.length);
        line += ' '.repeat(pad) + `/* ${t.comment} */`;
      }
      out.push(line);
    }
  });
  out.push('}');
  out.push(...tail);
  return `${out.join('\n')}\n`;
}

const hexToSwift = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `0x${h.toUpperCase()}`;
};

// --space-1 → space1, --bb-deep → bbDeep. Digits matter: `space-1` must not
// become `space-1`, which is not a Swift identifier (swiftc caught exactly that).
const camel = (name) => name.replace(/-(.)/g, (_, c) => c.toUpperCase());

/** Render App/Stitchu/Tokens.swift from the same token list. */
export function renderSwift(spec) {
  const colors = [];
  const sizes = [];
  const stacks = [];
  for (const group of spec.css.groups) {
    for (const t of group.tokens) {
      if (t.swift === 'color') colors.push(t);
      else if (t.swift === 'size') sizes.push(t);
      else if (t.swift === 'fontStack') stacks.push(t);
    }
  }
  const L = [];
  L.push('// Tokens.swift — GENERATED. Do not edit.');
  L.push('// Source: contract/design-tokens.json');
  L.push('// Regenerate: node scripts/gen-design-tokens.mjs --swift');
  L.push('//');
  L.push('// These are the SAME values web/css/tokens.css is generated from, so the iOS');
  L.push('// app and the web app cannot drift apart. The hand-written Theme.swift is a');
  L.push('// separate, older surface and is not touched by this generator.');
  L.push('');
  L.push('import CoreGraphics');
  L.push('import SwiftUI');
  L.push('');
  L.push(`enum ${spec.swift.enumName} {`);
  L.push('    // MARK: - Colour');
  L.push('    enum Color {');
  for (const t of colors) {
    if (t.comment) L.push(`        /// ${t.comment}`);
    L.push(`        static let ${camel(t.name)} = SwiftUI.Color(tokenHex: ${hexToSwift(t.value)})`);
  }
  L.push('    }');
  L.push('');
  L.push('    // MARK: - Type');
  L.push('    // The three font stacks the web is allowed to name, in CSS order:');
  L.push('    // try each family and fall through. UIFont(name:) returns nil for a');
  L.push('    // missing family, so the iOS side walks the same list.');
  L.push('    enum Font {');
  for (const [key, value] of Object.entries(spec.fontStacks)) {
    if (key.startsWith('$')) continue;
    const families = value.split(',').map((f) => f.trim().replace(/^["']|["']$/g, ''));
    L.push(`        /// CSS: ${value}`);
    L.push(`        static let ${key}: [String] = [${families.map((f) => JSON.stringify(f)).join(', ')}]`);
  }
  for (const t of stacks) {
    L.push(`        /// --${t.name} (the web body stack) is fontStacks.ui above.`);
  }
  L.push('    }');
  L.push('');
  L.push('    // MARK: - Scale (points; the CSS px values read 1:1 as iOS points)');
  L.push('    enum Size {');
  for (const t of sizes) {
    const px = parseFloat(t.value);
    L.push(`        /// CSS --${t.name}: ${t.value}`);
    L.push(`        static let ${camel(t.name)}: CGFloat = ${px}`);
  }
  L.push('    }');
  L.push('}');
  L.push('');
  L.push('extension SwiftUI.Color {');
  L.push('    /// 0xRRGGBB from the design-token contract, in sRGB.');
  L.push('    init(tokenHex: UInt32) {');
  L.push('        self.init(');
  L.push('            .sRGB,');
  L.push('            red: Double((tokenHex >> 16) & 0xFF) / 255,');
  L.push('            green: Double((tokenHex >> 8) & 0xFF) / 255,');
  L.push('            blue: Double(tokenHex & 0xFF) / 255');
  L.push('        )');
  L.push('    }');
  L.push('}');
  return `${L.join('\n')}\n`;
}

function main(argv) {
  const wantSwift = argv.includes('--swift');
  const check = argv.includes('--check');
  const toStdout = argv.includes('--stdout');
  const spec = loadTokens();
  const text = wantSwift ? renderSwift(spec) : renderCss(spec);
  const target = join(root, wantSwift ? spec.swift.target : spec.css.target);

  if (toStdout) { process.stdout.write(text); return 0; }
  if (check) {
    let onDisk = null;
    try { onDisk = readFileSync(target, 'utf8'); } catch { /* missing */ }
    if (onDisk === text) { console.log(`OK ${target} matches contract/design-tokens.json`); return 0; }
    console.error(`DRIFT ${target} differs from the render of contract/design-tokens.json`);
    return 1;
  }
  writeFileSync(target, text);
  console.log(`wrote ${target} (${text.length} bytes)`);
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith('gen-design-tokens.mjs')) {
  process.exit(main(process.argv.slice(2)));
}
