// spec-validate.js — K1 contract gate (2026-07-19). Validates a vision answer
// against the SEMANTIC schema (contract/garment-spec.schema.json
// $defs.visionReading, embedded in contract.gen.js) BEFORE the bridge consumes
// it. The rule the schema enforces: the model may only speak the garment
// language. An unknown field (a render knob like capPuff/seed smuggled into
// the answer) is STRIPPED, a value outside its enum is NULLED, and every strike
// is reported — the pipeline stays alive, the contract stays closed.
// Deterministic subset interpreter for the schema features the contract uses:
// type, enum (with null), properties, additionalProperties:false, array items,
// maxLength, maxItems.
import { VISION_SCHEMA } from './contract.gen.js?v=139';

function typeOk(schema, v) {
  if (!schema.type) return true;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const t = v === null ? 'null'
    : Array.isArray(v) ? 'array'
      : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number')
        : typeof v;
  return types.includes(t) || (t === 'integer' && types.includes('number'));
}

// Sanitize one object against an object schema. Returns the cleaned object;
// pushes human-readable strikes into `report`.
function sanitizeObject(schema, obj, report, path) {
  const out = {};
  const props = schema.properties || {};
  for (const [key, value] of Object.entries(obj)) {
    const sub = props[key];
    if (!sub) {
      if (schema.additionalProperties === false) {
        report.push(`${path}${key}: unknown field stripped (not in the semantic contract)`);
        continue;
      }
      out[key] = value;
      continue;
    }
    out[key] = sanitizeValue(sub, value, report, `${path}${key}`);
  }
  return out;
}

function sanitizeValue(schema, v, report, path) {
  if (schema.enum) {
    if (schema.enum.includes(v)) return v;
    report.push(`${path}: '${v}' outside the contract enum, nulled`);
    return null;
  }
  if (!typeOk(schema, v)) {
    report.push(`${path}: wrong type (${typeof v}), nulled`);
    return null;
  }
  if (typeof v === 'string' && schema.maxLength && v.length > schema.maxLength) {
    report.push(`${path}: string over ${schema.maxLength} chars, truncated`);
    return v.slice(0, schema.maxLength);
  }
  if (Array.isArray(v)) {
    let arr = v;
    if (schema.maxItems && arr.length > schema.maxItems) {
      report.push(`${path}: over ${schema.maxItems} items, truncated`);
      arr = arr.slice(0, schema.maxItems);
    }
    return schema.items ? arr.map((x, i) => sanitizeValue(schema.items, x, report, `${path}[${i}]`)).filter((x) => x !== null) : arr;
  }
  if (v && typeof v === 'object') return sanitizeObject(schema, v, report, `${path}.`);
  return v;
}

// Validate + sanitize a vision reading. Returns { clean, report }: `clean` is
// safe for the bridge, `report` lists every strike (empty = fully valid).
export function validateVision(seen) {
  const report = [];
  if (!seen || typeof seen !== 'object' || Array.isArray(seen)) {
    return { clean: {}, report: ['vision answer is not an object'] };
  }
  const clean = sanitizeObject(VISION_SCHEMA, seen, report, '');
  return { clean, report };
}
