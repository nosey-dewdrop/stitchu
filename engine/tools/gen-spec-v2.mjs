#!/usr/bin/env node
// gen-spec-v2.mjs — writes contract/garment-spec-v2.schema.json from the single
// source contract/garment-spec-v2.json. Same K1 discipline as gen-contract.mjs:
// the derivative is generated, never hand-edited, and specv2_check fails the
// suite the moment the file on disk stops matching this output.
//   node engine/tools/gen-spec-v2.mjs           # write
//   node engine/tools/gen-spec-v2.mjs --check   # exit 1 if stale
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { loadContract, buildSchema, SCHEMA_PATH } from './specv2.mjs';

const want = JSON.stringify(buildSchema(loadContract()), null, 2) + '\n';
const check = process.argv.includes('--check');
const got = existsSync(SCHEMA_PATH) ? readFileSync(SCHEMA_PATH, 'utf8') : null;

if (check) {
  if (got !== want) {
    console.error('FAIL: contract/garment-spec-v2.schema.json is stale — run: node engine/tools/gen-spec-v2.mjs');
    process.exit(1);
  }
  console.log('ok: garment-spec-v2.schema.json in sync with contract/garment-spec-v2.json');
} else {
  writeFileSync(SCHEMA_PATH, want);
  console.log(`wrote ${SCHEMA_PATH} (${want.length} bytes)`);
}
