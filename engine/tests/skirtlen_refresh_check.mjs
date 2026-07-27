#!/usr/bin/env node
// skirtlen_refresh_check.mjs — MANDAL (2026-07-27): foto-anı gövde bug'ı.
// Bulgu (json-el adli raporu): create.js skirtLengthMM'i fotoğraf yüklendiği
// ANDAKİ values ile hesaplıyordu (çoğu zaman EU38 demo); kullanıcı SONRA kendi
// ölçüsünü girince mm YENİDEN hesaplanmıyordu — foto oranı x YANLIŞ gövde.
// Fix: tek yeniden-türetme kuralı vision-bridge.refreshSkirtLengthMM; create.js
// showSpec'e her girişte (ölçü sihirbazı bitti, profil değişti) onu çağırır.
// Bu test (a) kuralın kendisini, (b) create.js'in kabloyu GERÇEKTEN taktığını
// (kaynak mandalı) kilitler.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const { pickSkirtLengthMM, refreshSkirtLengthMM } = await import(join(root, 'web/js/vision-bridge.js'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

const SEEN = { garment: 'dress', waistline: 'natural', ratios: { lengthToWidth: 2.2 } };
const DEMO = { bust: 88, backLength: 40 };    // EU38 demo gövdesi (create.js DEMO_BODY)
const USER = { bust: 102, backLength: 44 };   // kullanıcının gerçek ölçüsü

// a) POLİTİKA: aynı foto, gövde değişince mm DEĞİŞMELİ (oran x güncel gövde).
const atDemo = refreshSkirtLengthMM(0, SEEN, DEMO, false);
const atUser = refreshSkirtLengthMM(atDemo, SEEN, USER, false);
if (atDemo !== pickSkirtLengthMM(SEEN, DEMO)) fail('refresh demo gövdede pick ile aynı değil');
if (atUser !== pickSkirtLengthMM(SEEN, USER)) fail('refresh kullanıcı gövdesinde pick ile aynı değil');
if (!(atDemo > 0) || !(atUser > 0)) fail(`mm hesaplanamadı (demo ${atDemo}, user ${atUser})`);
if (atDemo === atUser) fail(`gövde değişti ama mm değişmedi (${atDemo}) — foto-anı donması geri geldi`);

// elle mini/midi/maxi seçimi (handPicked) mm'i düşürür ve DÜŞÜK TUTAR:
// ölçü tekrar düzenlense de foto mm'i hortlamaz (kullanıcı emri kazanır).
if (refreshSkirtLengthMM(0, SEEN, USER, true) !== 0) fail('handPicked iken foto mm hortladı — kullanıcı emri çiğnendi');
// foto yokken mevcut değer korunur (manuel akış foto koduna bulaşmaz).
if (refreshSkirtLengthMM(0, null, USER, false) !== 0) fail('foto yokken mm uyduruldu');

// b) KAYNAK MANDALI: create.js kabloyu gerçekten takmış olmalı. (DOM modülü
// node'da koşulamıyor; bu mandal en azından üç bağlantı noktasının sökülmesini
// yakalar — bağlantı adları değişirse bilinçli güncellenir.)
const createSrc = readFileSync(join(root, 'web/js/create.js'), 'utf8');
const showSpecBody = createSrc.slice(createSrc.indexOf('function showSpec()'));
if (!/spec\.skirtLengthMM = refreshSkirtLengthMM\(/.test(showSpecBody.slice(0, 800))) {
  fail('create.js showSpec girişinde refreshSkirtLengthMM çağrısı yok — ölçü değişince mm tazelenmiyor');
}
if (!/photoSeen = seen/.test(createSrc)) {
  fail('create.js foto okumasını (photoSeen) saklamıyor — sonradan tazeleme imkansız');
}
if (!/skirtLength'\)\s*\{\s*spec\.skirtLengthMM = 0;\s*photoLenHandPicked = true/.test(createSrc.replace(/'/g, "'"))
    && !/photoLenHandPicked = true/.test(createSrc)) {
  fail('create.js elle boy seçiminde handPicked mandalı yok');
}

if (fails) { console.error(`\nskirtlen_refresh_check FAILED (${fails})`); process.exit(1); }
console.log(`skirtlen_refresh_check GREEN: mm gövdeyi izliyor (demo ${atDemo} -> user ${atUser}), elle seçim düşük kalıyor, create.js kablosu takılı`);
