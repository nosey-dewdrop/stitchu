#!/usr/bin/env node
// wallet_fuse_check.mjs — KAPI (KOSU-v8 / G1): kimse Damla'nın parasını harcayamaz.
//
// 27 Ağu 2026'da CANLI Worker'da ÖLÇÜLEN, bu kapı yazılmadan önce:
//   POST /api/analyze  Origin: https://evil.example.com  -> 400 "Invalid request"
//   POST /api/analyze  Origin: (başlık hiç yok, curl)    -> 400 "Invalid request"
//   OPTIONS /api/analyze                                 -> ACAO: *
// 400, handleAnalyze'ın GÖVDE doğrulayıcısıdır; oraya ulaşmak "var olan bütün
// kapılardan geçti" demektir. worker.js'te Origin mantığı YOKTU.
//
// KOSU-v8 § G1 çözüm olarak yalnız "Origin kontrolü reddetmeye çevrilir" yazıyordu.
// O TEK BAŞINA YETMEZ: Origin'i tarayıcı zorlar, curl tek satırda taklit eder.
// Bu yüzden bu kapı üç katmanı da ayrı ayrı sınar ve ÖZELLİKLE Origin'in tek
// başına yeterli olmadığını (madde 4) bir test olarak kilitler — yasak 17'nin
// ("tıklanmamış özellik sevk edilmez") makine tarafındaki karşılığı.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const g = await import(join(root, 'backend/guard.js'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const ok = (m) => console.log('  ok:', m);

const req = (origin, headers = {}) => new Request('https://api.test/api/analyze', {
  method: 'POST',
  headers: { ...(origin ? { Origin: origin } : {}), ...headers },
});

// Bir KV taklidi: gerçek Workers KV gibi string saklar, sayacı görünür tutar.
const fakeKV = (seed = {}) => {
  const store = new Map(Object.entries(seed));
  return {
    store,
    get: async (k) => (store.has(k) ? store.get(k) : null),
    put: async (k, v) => { store.set(k, v); },
  };
};

// ---- 1. ORIGIN (katman 1) --------------------------------------------------
if (g.originAllowed(req('https://evil.example.com'), {})) fail('yabancı Origin kabul edildi');
else ok('yabancı Origin reddedildi');

if (g.originAllowed(req(null), {})) fail('Origin başlığı OLMAYAN çağrı kabul edildi — ölçülen curl yolu bu');
else ok('Origin başlığı olmayan çağrı (curl) reddedildi');

for (const o of ['https://stitchu.noseydewdrop.com', 'https://nosey-dewdrop.github.io']) {
  if (!g.originAllowed(req(o), {})) fail(`canlı yayın adresi ${o} reddedildi — gerçek ziyaretçi 403 yer`);
  else ok(`canlı adres kabul edildi: ${o}`);
}
// DEV_ORIGIN yalnız açıkça verildiğinde açılır, varsayılanda kapalıdır.
if (g.originAllowed(req('http://localhost:8080'), {})) fail('localhost varsayılanda kabul edildi');
else if (!g.originAllowed(req('http://localhost:8080'), { DEV_ORIGIN: 'http://localhost:8080' })) {
  fail('DEV_ORIGIN verildiği hâlde localhost reddedildi');
} else ok('localhost yalnız DEV_ORIGIN ile açılıyor');

// ---- 2. TURNSTILE (katman 2) — curl'ün geçemediği yer ----------------------
const yes = async () => ({ ok: true, json: async () => ({ success: true }) });
const no = async () => ({ ok: true, json: async () => ({ success: false }) });
const boom = async () => { throw new Error('network down'); };

if (await g.turnstilePassed('tok', {}, '1.2.3.4', yes)) {
  fail('TURNSTILE_SECRET bağlı DEĞİLKEN geçti — açık cüzdan');
} else ok('secret yoksa kapalı (fail-closed)');

const SEC = { TURNSTILE_SECRET: 's' };
if (await g.turnstilePassed(undefined, SEC, '1.2.3.4', yes)) fail('token yokken geçti');
else ok('token yoksa reddediliyor');
if (await g.turnstilePassed('', SEC, '1.2.3.4', yes)) fail('boş token geçti');
else ok('boş token reddediliyor');
if (await g.turnstilePassed('x'.repeat(4096), SEC, '1.2.3.4', yes)) fail('4096 baytlık token geçti');
else ok('aşırı uzun token reddediliyor');
if (await g.turnstilePassed('tok', SEC, '1.2.3.4', no)) fail('Cloudflare success:false dediği hâlde geçti');
else ok('success:false reddediliyor');
if (await g.turnstilePassed('tok', SEC, '1.2.3.4', boom)) fail('ağ hatası geçişe çevrildi');
else ok('ağ hatası kapalıya düşüyor');
if (!(await g.turnstilePassed('tok', SEC, '1.2.3.4', yes))) fail('geçerli token reddedildi — gerçek kullanıcı giremez');
else ok('geçerli token kabul ediliyor');

// ---- 3. HARCAMA TAVANI (katman 3) — cüzdanı bağlayan sayı ------------------
if (!(await g.spendBudgetExhausted({}))) fail('KV bağlı DEĞİLKEN harcamaya izin verdi — sayılmayan harcama');
else ok('KV yoksa harcama kapalı (fail-closed)');

{
  const kv = fakeKV();
  const env = { RATE_LIMIT: kv, DAILY_ANALYZE_CAP: '3' };
  const verdicts = [];
  for (let i = 0; i < 5; i += 1) verdicts.push(await g.spendBudgetExhausted(env, 0));
  if (JSON.stringify(verdicts) !== JSON.stringify([false, false, false, true, true])) {
    fail(`tavan 3'te tutmadı: ${JSON.stringify(verdicts)}`);
  } else ok('tavan tam 3 çağrıda kapandı, 4. ve 5. reddedildi');
  if (kv.store.get('spend:0') !== '3') fail(`sayaç ${kv.store.get('spend:0')}, 3 bekleniyordu`);
  else ok('sayaç KV\'de spend:0 = 3');
}
{
  // Gün dönünce sayaç sıfırdan başlar (ayrı anahtar), dünkü tavan bugünü kilitlemez.
  const kv = fakeKV({ 'spend:0': '999' });
  const env = { RATE_LIMIT: kv, DAILY_ANALYZE_CAP: '3' };
  if (await g.spendBudgetExhausted(env, 86400000)) fail('dünün sayacı bugünü kilitledi');
  else ok('gün dönünce sayaç sıfırlanıyor');
}
{
  // Tavan verilmezse varsayılan uygulanır — sınırsız DEĞİL.
  const kv = fakeKV({ 'spend:0': String(g.DEFAULT_DAILY_CAP) });
  if (!(await g.spendBudgetExhausted({ RATE_LIMIT: kv }, 0))) {
    fail(`DAILY_ANALYZE_CAP verilmeyince varsayılan ${g.DEFAULT_DAILY_CAP} uygulanmadı`);
  } else ok(`varsayılan tavan ${g.DEFAULT_DAILY_CAP} uygulanıyor`);
}

// ---- 4. KATMANLAR BAĞIMSIZ MI: Origin TEK BAŞINA yetmez -------------------
// Bu koşunun asıl dersi. Doğru Origin'i taklit eden bir curl katman 1'i geçer;
// eğer katman 2 ve 3 de geçseydi kaçak açık kalırdı. Kapı bunu şart koşar.
{
  const forged = req('https://stitchu.noseydewdrop.com');
  if (!g.originAllowed(forged, {})) fail('kurgu bozuk: taklit Origin katman 1\'i geçmeliydi');
  else if (await g.turnstilePassed('forged-token', {}, '1.2.3.4', yes)) {
    fail('Origin taklidi TEK BAŞINA yetti — KOSU-v8 G1 reçetesi kaçağı kapatmıyor');
  } else ok('doğru Origin taklit edilse bile katman 2 durduruyor');
}

// ---- 5. CORS: '*' bir daha asla -------------------------------------------
{
  const seen = g.withCors(new Response('{}'), req('https://stitchu.noseydewdrop.com'), {});
  if (seen.headers.get('Access-Control-Allow-Origin') !== 'https://stitchu.noseydewdrop.com') {
    fail('bilinen Origin yansıtılmadı — gerçek sayfa cevabı okuyamaz');
  } else ok('bilinen Origin yansıtılıyor');
  if (seen.headers.get('Vary') !== 'Origin') fail('Vary: Origin yok — önbellek bir sitenin iznini başkasına servis edebilir');
  else ok('Vary: Origin var');

  const stranger = g.withCors(new Response('{}'), req('https://evil.example.com'), {});
  const acao = stranger.headers.get('Access-Control-Allow-Origin');
  if (acao !== null) fail(`yabancı Origin'e ACAO verildi: ${acao}`);
  else ok('yabancı Origin\'e ACAO verilmiyor');

  const anon = g.withCors(new Response('{}'), req(null), {});
  if (anon.headers.get('Access-Control-Allow-Origin') !== null) fail('Origin\'siz çağrıya ACAO verildi');
  else ok('Origin\'siz çağrıya ACAO verilmiyor');
}

// ---- 6. worker.js gerçekten bu muhafızları KULLANIYOR mu -------------------
// Borç 73 dersi (yasak 16): basılmayan önlem önlem değildir. Kapı, guard.js'i
// tek başına doğrulasa ve worker.js onu çağırmasa, bu dosya ölü kod olurdu.
{
  const fs = await import('node:fs');
  const src = fs.readFileSync(join(root, 'backend/worker.js'), 'utf8');
  for (const needle of ['originAllowed(', 'turnstilePassed(', 'spendBudgetExhausted(', 'withCors(']) {
    if (!src.includes(needle)) fail(`worker.js ${needle} çağırmıyor — muhafız ölü kod`);
    else ok(`worker.js çağırıyor: ${needle}`);
  }
  if (/'Access-Control-Allow-Origin':\s*'\*'/.test(src)) fail("worker.js'te ACAO '*' geri gelmiş");
  else ok("worker.js'te ACAO '*' yok");
  // Turnstile, tavan DÜŞÜRÜLMEDEN önce sınanmalı: doğrulanmamış bir sel,
  // sırf reddedilerek günün bütçesini yakamamalı.
  if (src.indexOf('turnstilePassed(') > src.indexOf('spendBudgetExhausted(')) {
    fail('tavan Turnstile\'dan ÖNCE düşürülüyor — reddedilen çağrılar bütçe yakar');
  } else ok('Turnstile tavandan önce sınanıyor');
}

console.log(fails === 0 ? '\nwallet_fuse_check: GECTI' : `\nwallet_fuse_check: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
