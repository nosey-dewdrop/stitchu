// bugra-landmarks — LANDMARK-LANDMARK olcum katmani (bugra-blind-compare'in
// alt modulu). Iki tarafta da kenarlar ADLARIYLA ayrilir, sonra ayni ad ayni
// adla kiyaslanir. Chamfer bir SEKIL mesafesidir; bu dosya SEVK EDILEBILIR
// olcuyu (yaka/omuz/oyuk/yan dikis/etek uzunluklari, yay/kiris) verir.
//
// KAYNAKLAR (ikisi de repoda, uydurma sayi yok):
//  * Bugra tarafi: patterns_real/geometry/seamgraph.json — satin alinmis A0
//    PDF'ten cikarilmis, 1mm yeniden ornekli halkada ADLANDIRILMIS kenarlar
//    (yaka-on, omuz-on, OYUK-on, yan-dikis-*, etek-*, on-orta(CF) ...).
//    cutMM = kesim cizgisi, stitchMM = dikis cizgisi.
//  * Motor tarafi: draftJSON'un KENDI beyan ettigi `edgeRoles` (armhole_front /
//    armhole_back / sleeve_cap / sleeve_underarm / sleeve_hem). Oyuk capa
//    alinir, komsu komutlar ondan TURETILIR — sabit komut indeksi yazilmaz.
//    edgeRoles yoksa parca "landmark ayrimi YAPILAMADI" diye adiyla raporlanir.

// KOR SPEC — TEK KAYNAK. Bugra Locket Top'un SATIS SAYFASINDAKI giysi tarifi
// motorun kendi eksenlerine cevrilmis hali; Bugra'nin mm'lerine BAKILMADAN
// kuruldu. Iki tuketici var (bugra-blind-compare.mjs olcer, KOSU/
// bugra-spec-giysi.mjs cizer) ve satir BIR KEZ yazilir — kopyalanirsa sozluk
// referans sayaci (vocab_reference_check) hakli olarak kirmizi yanar ve iki
// kopya birbirinden kayabilir.
export const KOR_SPEC = {
  garment: 'top', shaping: 'dart', fabric: 'woven',
  neckline: 'crew', collarType: 'peterPan',
  sleeveStyle: 'straight', sleeveCap: 'puffed', sleeveLength: 'short',
  buttonRow: 'functional', placketStyle: 'standard', frontPlacket: true,
  topLength: 'hip',
};

export function bez(p0, c, n = 64) {
  const P = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, m = 1 - t;
    P.push([
      m*m*m*p0[0] + 3*m*m*t*c.cp1x + 3*m*t*t*c.cp2x + t*t*t*c.x,
      m*m*m*p0[1] + 3*m*m*t*c.cp1y + 3*m*t*t*c.cp2y + t*t*t*c.y,
    ]);
  }
  return P;
}
export const polyLen = (P) => {
  let s = 0;
  for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]);
  return s;
};

/** Bir parcanin komut listesini {tip, from, to, len, kiris} kenarlarina ayirir. */
export function splitEdges(cmds) {
  const out = [];
  let cur = null, start = null;
  cmds.forEach((c, i) => {
    if (c.type === 'move') { cur = [c.x, c.y]; start = cur; }
    else if (c.type === 'line') {
      out.push({ i, kind: 'line', from: cur, to: [c.x, c.y],
                 len: Math.hypot(c.x-cur[0], c.y-cur[1]) });
      cur = [c.x, c.y];
    } else if (c.type === 'curve') {
      const P = [cur, ...bez(cur, c)];
      out.push({ i, kind: 'curve', from: cur, to: [c.x, c.y], len: polyLen(P) });
      cur = [c.x, c.y];
    } else if (c.type === 'close' && cur && start) {
      out.push({ i, kind: 'close', from: cur, to: start,
                 len: Math.hypot(start[0]-cur[0], start[1]-cur[1]) });
    }
  });
  for (const e of out) e.kiris = Math.hypot(e.to[0]-e.from[0], e.to[1]-e.from[1]);
  return out;
}

/** Motor govde parcasi (on/arka): oyuk capasindan komsulari TURET.
 *  Donen adlar Bugra seamgraph adlariyla ayni sozlukten: yaka / omuz / OYUK /
 *  yan-dikis / etek / orta. */
export function motorBodyEdges(piece) {
  const E = splitEdges(piece.commands);
  const role = (piece.edgeRoles ?? []).find((r) => /^armhole_/.test(r.role));
  if (!role) return { ok: false, why: 'edgeRoles icinde armhole_* yok' };
  const k = E.findIndex((e) => e.i >= role.first && e.i <= role.last &&
                              Math.abs(e.to[0] - role.endX) < 1e-6 &&
                              Math.abs(e.to[1] - role.endY) < 1e-6);
  if (k < 0) return { ok: false, why: 'beyan edilen armhole kenari komutlarda bulunamadi' };
  const at = (j) => (j >= 0 && j < E.length ? E[j] : null);
  const named = {
    yaka:      at(k - 2),
    omuz:      at(k - 1),
    OYUK:      at(k),
    'yan-dikis': at(k + 1),
    etek:      at(k + 2),
  };
  // orta (CF/CB) = kalan kenarlarin en uzunu (govdenin katlama/dugme kenari).
  const used = new Set(Object.values(named).filter(Boolean).map((e) => e.i));
  const rest = E.filter((e) => !used.has(e.i) && e.len > 0.5);
  named.orta = rest.sort((a, b) => b.len - a.len)[0] ?? null;
  return { ok: true, E, named };
}

/** Motor kol parcasi: edgeRoles zaten adli (sleeve_cap / underarm / hem). */
export function motorSleeveEdges(piece) {
  const E = splitEdges(piece.commands);
  const roles = piece.edgeRoles ?? [];
  if (!roles.length) return { ok: false, why: 'kolda edgeRoles yok' };
  const pick = (name) => E.filter((e) => roles.some(
    (r) => r.role === name && e.i >= r.first && e.i <= r.last));
  const cap = pick('sleeve_cap');
  const under = pick('sleeve_underarm');
  const hem = pick('sleeve_hem');
  if (!cap.length) return { ok: false, why: 'sleeve_cap rolu yok' };
  const capLen = cap.reduce((a, b) => a + b.len, 0);
  const capChord = Math.hypot(cap.at(-1).to[0] - cap[0].from[0],
                              cap.at(-1).to[1] - cap[0].from[1]);
  let capH = 0;
  for (const e of cap) capH = Math.max(capH, Math.abs(e.to[1] - cap[0].from[1]),
                                             Math.abs(e.from[1] - cap[0].from[1]));
  return { ok: true, E, capLen, capChord, capH,
           underLen: under.reduce((a, b) => a + b.len, 0) / Math.max(1, under.length),
           hemLen: hem.reduce((a, b) => a + b.len, 0) };
}

/** Motor yaka parcasi: rol beyani YOK. Kural (yazili, sabit indeks degil):
 *  iki UZUN kenar boyun ve dis kenardir; ortalama y'si kucuk olan BOYUN
 *  kenaridir (yaka boyun kenari yukarida cizilir), digeri DIS kenar. */
export function motorCollarEdges(piece) {
  const E = splitEdges(piece.commands).filter((e) => e.len > 1);
  if (E.length < 2) return { ok: false, why: 'yakada 2 uzun kenar yok' };
  const two = [...E].sort((a, b) => b.len - a.len).slice(0, 2);
  two.sort((a, b) => (a.from[1] + a.to[1]) - (b.from[1] + b.to[1]));
  return { ok: true, boyun: two[0], dis: two[1],
           uclar: E.filter((e) => e !== two[0] && e !== two[1]) };
}

/** Bugra tarafi: seamgraph kenarlari + 1mm halkadan kiris. */
export function bugraEdges(seamgraph, ring1mm, key, size = '38') {
  const rec = seamgraph.pieces[key]?.[size];
  if (!rec) return null;
  const n = ring1mm.length;
  return rec.edges.map((e) => {
    const a = ring1mm[e.i0 % n], b = ring1mm[e.i1 % n];
    return { ...e, kiris: Math.hypot(b[0]-a[0], b[1]-a[1]) };
  });
}

export function resample(P, step) {
  const Q = [P[0]];
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    let [ax, ay] = P[i-1];
    const [bx, by] = P[i];
    let seg = Math.hypot(bx-ax, by-ay);
    while (acc + seg >= step) {
      const t = (step - acc) / seg;
      const nx = ax + (bx-ax)*t, ny = ay + (by-ay)*t;
      Q.push([nx, ny]); ax = nx; ay = ny;
      seg = Math.hypot(bx-ax, by-ay); acc = 0;
    }
    acc += seg;
  }
  return Q;
}
