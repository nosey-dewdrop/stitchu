// ============================================================================
// TEZGAH — 2026-07-31
// Cumle -> malzeme -> kalem -> ekranda flat. Kadran oynayinca yeniden cizilir.
// Tek yonlu: durum tek yerde (S), her degisiklik ayni cizim yolundan gecer.
// ============================================================================

let ST = defaultState();
let TOUCHED = new Set();

const $ = (id) => document.getElementById(id);
const famOf = {};
M.forEach(([k, f]) => { famOf[k] = f; });
FLAGS.forEach(([k, f]) => { famOf[k] = f; });

function paint() {
  const t0 = performance.now();
  let svg;
  try { svg = draw(ST); }
  catch (e) { $('stat').textContent = 'cizim hatasi: ' + e.message; return; }
  $('flat').innerHTML = svg;
  const ms = performance.now() - t0;
  const n = (svg.match(/<path/g) || []).length;
  $('stat').textContent = `${n} cizgi · ${ms.toFixed(0)} ms`;
  $('ver').textContent = SIZES[ST.size];
  document.querySelectorAll('[data-k]').forEach((el) => {
    const k = el.dataset.k;
    const row = el.closest('.row');
    if (!row) return;
    const rd = row.querySelector('.read');
    if (rd) rd.textContent = fmt(k, ST[k]);
    row.classList.toggle('touched', TOUCHED.has(k));
  });
}

function fmt(k, v) {
  if (k === 'size') return SIZES[v];
  if (typeof v === 'boolean') return v ? 'var' : 'yok';
  return (Math.abs(v) >= 10 || Number.isInteger(v)) ? String(v) : v.toFixed(2);
}

function set(k, v) { ST[k] = v; TOUCHED.delete(k); paint(); }

function buildDials() {
  const host = $('dials');
  host.innerHTML = '';
  for (const [fam, title, blurb] of FAMILIES) {
    const rows = [];

    if (fam === 'olcu') {
      rows.push(sliderRow(M.find((m) => m[0] === 'size')));
    } else if (fam === 'kalem') {
      rows.push(choiceRow('_ink', 'kalem yogunlugu', INKS));
      rows.push(flagRow(['_asym', 'kalem', 'asimetrik murekkep', true, 'Gercek flat cizimlerde sol ve sag ayni degildir.']));
    }
    if (fam === 'seviye') rows.push(choiceRow('_neckShape', 'yaka egrisi', NECKSHAPES));

    M.forEach((m) => { if (m[1] === fam && m[0] !== 'size') rows.push(sliderRow(m)); });
    FLAGS.forEach((f) => { if (f[1] === fam) rows.push(flagRow(f)); });
    if (!rows.length) continue;

    const sec = document.createElement('section');
    sec.className = 'fam';
    sec.innerHTML = `<h2>${title}</h2><p class="blurb">${blurb}</p>`;
    rows.forEach((r) => sec.appendChild(r));
    host.appendChild(sec);
  }
}

function sliderRow([k, , label, min, max, step, , note]) {
  const el = document.createElement('div');
  el.className = 'row';
  el.innerHTML = `
    <div class="rowhead"><span class="name">${label}</span><span class="read"></span></div>
    <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${ST[k]}">
    ${note ? `<p class="note">${note}</p>` : ''}`;
  const inp = el.querySelector('input');
  inp.addEventListener('input', () => set(k, parseFloat(inp.value)));
  return el;
}

function flagRow([k, , label, , note]) {
  const el = document.createElement('div');
  el.className = 'row flag';
  el.innerHTML = `
    <label><input type="checkbox" data-k="${k}" ${ST[k] ? 'checked' : ''}>
    <span class="name">${label}</span><span class="read"></span></label>
    ${note ? `<p class="note">${note}</p>` : ''}`;
  const inp = el.querySelector('input');
  inp.addEventListener('change', () => set(k, inp.checked));
  return el;
}

function choiceRow(k, label, opts) {
  const el = document.createElement('div');
  el.className = 'row choice';
  el.innerHTML = `<div class="rowhead"><span class="name">${label}</span></div>
    <div class="opts">${opts.map(([v, t]) =>
      `<button type="button" data-v="${v}" class="${ST[k] === v ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    ST[k] = b.dataset.v;
    el.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    paint();
  }));
  return el;
}

function syncControls() {
  document.querySelectorAll('input[data-k]').forEach((inp) => {
    const k = inp.dataset.k;
    if (inp.type === 'checkbox') inp.checked = !!ST[k]; else inp.value = ST[k];
  });
  document.querySelectorAll('.choice').forEach((row) => {
    row.querySelectorAll('button').forEach((b) => {
      const k = row.querySelector('.name').textContent === 'yaka egrisi' ? '_neckShape' : '_ink';
      b.classList.toggle('on', ST[k] === b.dataset.v);
    });
  });
}

$('askform').addEventListener('submit', (e) => {
  e.preventDefault();
  const txt = $('ask').value.trim();
  if (!txt) return;
  const r = readSentence(txt, defaultState());
  ST = r.state; TOUCHED = r.touched;
  syncControls(); paint();
  const fams = [...new Set([...r.touched].map((k) => famOf[k]).filter(Boolean))];
  $('hint').innerHTML = r.touched.size
    ? `Cumleden <b>${r.touched.size}</b> malzeme okundu (${fams.join(', ')}). Kalan <b>${
        M.length + FLAGS.length - r.touched.size}</b> malzeme varsayilan profilde kaldi ve asagida isaretli degil. Hangisi yanlissa kadrani cek.`
    : 'Bu cumleden hicbir malzeme okunamadi. Hepsi varsayilan profilde.';
});

$('reset').addEventListener('click', () => {
  ST = defaultState(); TOUCHED = new Set();
  syncControls(); paint();
  $('hint').textContent = 'Varsayilan profil. Buradan baslayip kadranlari cek.';
});

$('dl-svg').addEventListener('click', () => {
  const blob = new Blob([draw(ST)], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'stitchu-flat.svg';
  a.click();
  URL.revokeObjectURL(a.href);
});

// ---------------------------------------------------------------------------
// kalip indir — the bridge to a REAL sewing pattern (engine/pattern-bridge).
// The page probes the local service once at load; without it the button stays
// disabled and its title says honestly what is needed. With it, the current
// state ST is POSTed and the answer (spec + svg + png + print pdf + seam
// deed) comes back as one zip.
// ---------------------------------------------------------------------------
function initPatternButton() {
  const btn = $('dl-pattern');
  fetch('/api/health').then((r) => r.ok ? r.json() : Promise.reject())
    .then((j) => {
      if (!j.ok) return;
      btn.disabled = false;
      btn.title = 'gercek dikis kalibi: spec + svg + png + print pdf + dikis tapusu (zip)';
    })
    .catch(() => { /* no local service: button stays disabled, title explains */ });

  btn.addEventListener('click', () => {
    btn.disabled = true;
    const was = btn.textContent;
    btn.textContent = 'kalip uretiliyor…';
    // M3: kalibin yaninda flat de gider — ayni durumdan ayni anda cizilen
    // teknik cizim zip'e flat.svg/flat.png olarak girer (kalip + flat TEK
    // KAYNAKTAN). Servis sarilmis govdeyi de ciplak state'i de kabul eder.
    fetch('/api/pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: ST, flatSvg: draw(ST) }),
    })
      .then((r) => { if (!r.ok) throw new Error('servis ' + r.status); return r.blob(); })
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'stitchu-kalip.zip';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => { $('stat').textContent = 'kalip hatasi: ' + e.message; })
      .finally(() => { btn.disabled = false; btn.textContent = was; });
  });
}

buildDials();
paint();
initPatternButton();
