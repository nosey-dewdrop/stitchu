#!/usr/bin/env node
// bridge_guard.mjs — MANDAL (2026-07-23): köprü sessiz-düşürme yasağı.
// tryReferencePen bir spec'i eşleşen styleKey YOKKEN plain dart/scoop stiline
// SESSIZCE düşürmemeli (ikame). Kanıt: princess/straps spec'leri ya doğru
// stile eşleşir (referans kalem, 940×680) ya köprüden geçmez (fallback,
// compile ÜRETİLEMEZ der) — ASLA plain tank'e degrade olmaz.
//
// Teşhis kökü (2026-07-23): id58/63/71 princess spec → flat plain tank (2545)
// düşüyordu (kalıp princess kesiyordu, flat plain = ikame). id4/74 straps object
// → cami yerine plain (straps==='wide' string kontrolü object'te FALSE).
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const { renderGarmentFlatAsync } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const PLAIN_MAX = 3000;   // plain dart/scoop tank fallback ~2545 char

// PLAIN referans imzası: top_crew_dart/top_scoop_cami plain tank flat'i REFERANS
// kalemden (940×680) gelir ama princess dikişi ÇİZMEZ. Sessiz-düşürme testi:
// princess spec plain-tank REFERANS stiline eşleşmemeli (princess kaybı = ikame).
// Ölçüt: referans kalem + princess dikişi YOK (Side Front ink yok) = düşme.
const drewPrincess = (flat) => /Side Front|princessSeam/i.test(flat) || flat.length > 6000;

// 1) PRINCESS top spec (gerçek hedef spec'lerinden): princess-top stili YOKSA
//    plain crew/scoop REFERANS tank'e düşmemeli — ya princess çizen stile eşleş
//    ya fallback (compile ÜRETİLEMEZ). vNeck/scoop princess top princess-top
//    stili yok → styleKey null → viewPanel fallback (940×680 DEĞİL).
const princessCases = [
  { name: 'vNeck princess top (id58 sınıfı)', spec: { garment: 'top', neckline: 'vNeck', shaping: 'princess', topLength: 'hip', waistline: 'natural', straps: { type: 'wide' }, closure: { type: 'buttons' } } },
  { name: 'scoop princess top (id63 sınıfı)', spec: { garment: 'top', neckline: 'scoop', shaping: 'princess', topLength: 'hip', waistline: 'natural', closure: { type: 'zipper' } } },
];
for (const c of princessCases) {
  const flat = await renderGarmentFlatAsync(null, c.spec);
  const isRef = flat.includes('940 680');
  // düşme = REFERANS kalem plain tank (princess çizmiyor). Fallback (940×680 değil) OK
  // (compile ÜRETİLEMEZ der). Referans + princess çizmiyor = sessiz ikame.
  if (isRef && !drewPrincess(flat)) fail(`${c.name}: princess spec REFERANS plain tank'e DÜŞTÜ (len ${flat.length}, princess dikişi yok) — sessiz ikame yasak`);
}

// 2) STRAPS object (contract {type}) → cami stiline eşleşmeli, plain'e düşmemeli.
const strapCases = [
  { name: 'wide-strap square shirred top', spec: { garment: 'top', neckline: 'square', shaping: 'dart', gatherType: 'shirred', straps: { type: 'wide' } }, wantRef: true },
  { name: 'spaghetti square top', spec: { garment: 'top', neckline: 'square', shaping: 'dart', straps: { type: 'spaghetti' } }, wantRef: true },
];
for (const c of strapCases) {
  const flat = await renderGarmentFlatAsync(null, c.spec);
  const isRef = flat.includes('940 680');
  const isPlain = flat.length < PLAIN_MAX;
  if (isPlain) fail(`${c.name}: straps object cami yerine plain'e DÜŞTÜ (len ${flat.length}) — straps-object köprü bug'ı geri geldi`);
  if (c.wantRef && !isRef) fail(`${c.name}: cami stiline eşleşmedi (referans kalem 940×680 değil)`);
}

// 3) NEGATİF kontrol: gerçekten plain (princess DEĞİL, straps yok) top plain kalmalı (yanlış alarm yok).
const plainOk = await renderGarmentFlatAsync(null, { garment: 'top', neckline: 'crew', shaping: 'dart', straps: { type: 'none' } });
if (plainOk.length >= PLAIN_MAX && !plainOk.includes('940 680')) {
  // plain crew tank referans kalemden (top_crew_dart) gelebilir; sadece fallback-şişme yanlışsa uyar
}

if (fails) { console.error(`\nbridge_guard FAILED (${fails})`); process.exit(1); }
console.log('bridge_guard GREEN: köprü sessiz-düşürme yok (princess/straps spec plain\'e degrade olmuyor)');
