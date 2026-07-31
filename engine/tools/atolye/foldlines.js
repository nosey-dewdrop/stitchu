// ============================================================================
// KAT KATMANI — 2026-08-01 (M3: flat'i profesyonel cizim yogunluguna cikar)
//
// Fizik-gudumlu kat/kirisik cizgileri. Kalem (engine/flat-engine/_engine-full
// .mjs) ve cozucu (cloth-solver.mjs) SALT-OKUNUR — buradan sadece CAGRILIR:
// rectClothGather'in Verlet gevsetmesi kat konumlarini bulur, cizgiler kalemin
// KENDI murekkep diliyle basilir (taper, 'ink'/'st' siniflari, seed'li rng).
// draw() SVG'ye '</svg>' oncesi ek path enjekte eder (bandLoop emsali).
//
// Dort alt katman, hepsi kadranlarla surulur (foldCount/drape/hemWave/ink):
//   A  etek hacim katlari   skirtFull>1.02  cozucu 'skirt' profili, tam boy
//   B  buzgu mikro+sonum    gatherRatio>1.05 dikis kenarinda mikro-kirisik +
//                            asagi sonumlenen dalgalar (cozucu pos grid'inden)
//   C  puf kapak isinlari   capPuff>0.05    kapak dikisine toplanan buzgu
//   D  bel gerilim cizgileri waistNip>0.06  bel pens bolgesi (geometrik;
//                            DURUST NOT: bu katman cozucu kosmaz, gerilim
//                            buzgu degildir — kisa deterministik cizgiler)
//
// CAKISMA KURALI: kalemin kendi drape fold'lari (drapePlan) ve prenses/gore
// dikis cizgileri OKUNUR (ayni seed'le yeniden kurulur, kalem deterministik),
// bizim katlar o u-konumlarinin +-0.07 bandini bos birakir.
//
// DETERMINIZM: Math.random yok; tum rastgelelik p.seed'den turetilen rng().
// Ayni durum -> bayt-ayni SVG (harness iki kosum md5 esitligiyle kanitlar).
// ============================================================================

// kalemin M() dili: sag kanat + scale(-1,1) ayna
function flM(d, cls, cx) {
  return '<path class="' + cls + '" d="' + d + '"/>' +
    '<g transform="translate(' + (2 * cx) + ',0) scale(-1,1)"><path class="' + cls + '" d="' + d + '"/></g>';
}

// kalemin MJ dili: asimetrik murekkepte sol kanat = yansit + ic noktalara
// deterministik mikro-jitter (uclar sabit), genislik +-%10. Ayna degil.
function flInk(pts, w, bias, cx, AS, jr) {
  if (!AS) return flM(taper(pts, w, bias), 'ink', cx);
  const L = pts.map((q, i, a) => (i === 0 || i === a.length - 1)
    ? [2 * cx - q[0], q[1]]
    : [2 * cx - q[0] + (jr() - 0.5) * 2.4, q[1] + (jr() - 0.5) * 1.8]);
  return '<path class="ink" d="' + taper(pts, w, bias) + '"/>' +
    '<path class="ink" d="' + taper(L, w * (0.9 + jr() * 0.2), bias) + '"/>';
}

// kalemin bu parca icin cizdigi fold u-konumlari (yarim-genislik 0..1) —
// drapePlan ayni seed'le ayni plani verir (kalem deterministik, o yuzden
// kaleme dokunmadan nereye cizdigini BILEBILIYORUZ).
function flPenFoldUs(p, k, b, isBack, AS) {
  const right = b.folds.map((r) => r.u);
  let left = right;
  if (AS) {
    const rndL = rng(p.seed * 131 + (isBack ? 977 : 13) + 500009);
    const R2 = drapePlan(p, rndL);
    hemPoints(p, k, R2);            // r.hem atanir; k degismez (kalemle ayni cagri)
    left = R2.map((r) => r.u);
  }
  return { right, left };
}

function flFoldOverlay(s, over) {
  const p = Object.assign(defaults('__live'), over);
  const st = STYLE['__live'];
  const pt = st.parts;
  const inkScale = p.ink === 'minimal' ? 0.35 : p.ink === 'orta' ? 0.75 : 1.0;
  const AS = !!p.inkAsym;
  let o = '';

  [[240, false], [700, true]].forEach(([cx, isBack]) => {
    const rnd = rng(p.seed * 131 + (isBack ? 977 : 13));
    const b = buildHalf(p, cx, isBack, rnd), k = b.k;
    const jr = rng(p.seed * 419 + (isBack ? 601 : 47));   // sol-kanat jitter
    const fr = rng(p.seed * 269 + (isBack ? 877 : 29));   // katman rastgeleligi

    // ---- A: ETEK HACIM KATLARI ------------------------------------------
    if (st.garment !== 'top' && p.skirtFull > 1.02 && k.yHem > k.yEmp + 8) {
      const wTop = k.eX - cx, wHem = k.hX - cx, Hs = k.yHem - k.yEmp;
      const gr = Math.min(2.8, 1 + (p.skirtFull - 1) * 1.2);
      const res = rectClothGather({ finishedW: wTop * 2, clothH: Hs, gatherRatio: gr,
        fabric: SEED_FABRICS.cotton, seed: p.seed + 11, profile: 'skirt' });
      let maxY = 1e-6;
      for (let i = 0; i < res.nx; i++) maxY = Math.max(maxY, res.pos[res.ny - 1][i].y);
      // kacinilacak bolgeler (yarim-genislik u'da): kalem drape fold'lari +
      // prenses dikisi (~0.48) + gore dilim cizgileri
      const pen = flPenFoldUs(p, k, b, isBack, AS);
      const avoid = (u) => {
        const wing = u >= 0.5 ? pen.right : pen.left;
        const uh = Math.abs(2 * u - 1);
        if (uh < 0.045) return true;                              // CF cekirdegi
        if (pt.princessSeam && st.top !== 'band' && Math.abs(uh - 0.48) < 0.05) return true;
        if (pt.gorePanels && st.top !== 'band') {
          const gh = Math.max(1, Math.round((p.goreCount || 6) / 2));
          for (let gi = 1; gi <= gh; gi++) if (Math.abs(uh - gi / gh) < 0.05) return true;
        }
        for (const ru of wing) if (Math.abs(uh - ru) < 0.05) return true;
        return false;
      };
      const cand = [];
      for (let fi = 0; fi < res.folds.length; fi++) {
        const u = res.folds[fi][0][0] / res.finishedW;
        if (u <= 0.02 || u >= 0.98 || avoid(u)) continue;
        if (!AS && u < 0.5) continue;                             // ayna modunda sag kanat
        cand.push(fi);
      }
      const want = Math.max(2, Math.round(p.foldCount * (0.5 + 0.85 * (p.skirtFull - 1)) * inkScale * (AS ? 1 : 0.5)));
      const step = Math.max(1, Math.floor(cand.length / Math.min(cand.length, want)));
      // buzgulu etekte kalem bel bandina tik basiyor -> bizim katlar bandin altindan baslar
      const bandFrac = st.gatheredSkirt ? Math.min(24 * S * 0.5, Hs * 0.22) / Hs : 0;
      let drawn = 0;
      for (let ci = 0; ci < cand.length && drawn < want; ci += step) {
        const fi = cand[ci], f = res.folds[fi];
        const birth = Math.max(bandFrac + 0.02, 0.05 + 0.16 * fr());
        const die = Math.min(0.985, 0.52 + 0.30 * Math.min(1.3, p.drape) + 0.14 * fr());
        const sway = p.hemWave * 2.2 * Math.sin(fi * 1.9 + (isBack ? 1.3 : 0.4));
        const u = f[0][0] / res.finishedW, x0 = f[0][0];
        const pts = [];
        for (let j = 0; j < f.length; j++) {
          const yn = f[j][1] / maxY;
          if (yn < birth || yn > die) continue;
          const wY = wTop + (wHem - wTop) * yn;
          const tEase = (yn - birth) / Math.max(0.01, die - birth);
          // ust ankraj orantili yayilir; cozucunun yanal hareketi SONUMLU sapma
          // olarak eklenir (kumas bitmis genislikten genis, ham x siluetten
          // tasar — ilk kosumda tasti, PNG ile goruldu). Siluet siniri clamp.
          const base = cx + (2 * u - 1) * wY;
          let X = base + (f[j][0] - x0) * 0.26 * (wY / wTop) + sway * tEase * tEase;
          const lim = wY * 0.95;
          if (X > cx + lim) X = cx + lim; else if (X < cx - lim) X = cx - lim;
          pts.push([X, k.yEmp + yn * Hs]);
        }
        if (pts.length < 3) continue;
        const prim = fi % 3 === 0;
        o += AS
          ? '<path class="ink" d="' + taper(pts, prim ? 1.5 : 0.95, prim ? 0.38 : 0.6) + '"/>'
          : flM(taper(pts, prim ? 1.5 : 0.95, prim ? 0.38 : 0.6), 'ink', cx);
        drawn++;
      }
    }

    // ---- B: BUZGU MIKRO-KIRISIK + ASAGI SONUMLENEN DALGALAR --------------
    // B1: fizik-shirr paneli (kalemin kosulunun AYNISI — ayni bolgeye cizilir)
    if (pt.shirr && st.physicsShirr && p.gatherRatio > 1.05 && (!isBack || st.top === 'shoulder')) {
      const half = enforceC1(b.g.slice(), !k.pointed);
      const _pTop = k.panelTop + (pt.casing ? 11 : 6), _pBot = k.yEmp - (st.top === 'band' ? 4.5 * S : 2.5 * S);
      const _pFin = (sampleX(half, _pTop) || k.bX) - k.cx - 3;
      // mikro-kirisik: ikinci cozum (farkli seed) daha KISA + ince tikler,
      // kalemin buyuk tikleri ARASINA duser
      const resM = rectClothGather({ finishedW: _pFin * 2, clothH: (_pBot - _pTop), gatherRatio: p.gatherRatio,
        fabric: SEED_FABRICS.cotton, seed: p.seed + 29, profile: 'shirred' });
      const mStep = p.ink === 'minimal' ? 4 : p.ink === 'orta' ? 2 : 1;
      for (let fi = 0; fi < resM.folds.length; fi += mStep) {
        const f = resM.folds[fi];
        const frac = 0.10 + 0.08 * (0.5 + 0.5 * Math.sin(fi * 2.3 + 1.1));
        const n = Math.max(2, Math.round((f.length - 1) * frac));
        const pts = [];
        for (let j = 0; j <= n; j++) pts.push([k.cx - _pFin + f[j][0], _pTop + f[j][1]]);
        o += AS ? '<path class="ink" d="' + taper(pts, 0.85, 0.8) + '"/>'
                : flM(taper(pts, 0.85, 0.8), 'ink', cx);
      }
      // sonumlenen dalgalar: kalemin cozumunun AYNI grid'i (ayni girdi = ayni
      // Verlet sonucu), kilit bolgesinin ALTINDAKI satirlar — sapma asagi
      // dogru (1-t)^1.5 ile soner
      const resP = rectClothGather({ finishedW: _pFin * 2, clothH: (_pBot - _pTop), gatherRatio: p.gatherRatio,
        fabric: SEED_FABRICS.cotton, seed: p.seed, profile: 'shirred' });
      const jTop = Math.max(2, Math.round((resP.ny - 1) * resP.activeFrac));
      const wStep = p.ink === 'minimal' ? 6 : p.ink === 'orta' ? 4 : 3;
      for (let i = 2; i < resP.nx - 2; i += wStep) {
        const xc = (i / (resP.nx - 1)) * _pFin * 2;
        const pts = [];
        for (let j = jTop; j < resP.ny; j++) {
          const t = (j - jTop) / Math.max(1, resP.ny - 1 - jTop);
          const decay = Math.pow(1 - t, 1.5);
          const Y = Math.min(_pBot, _pTop + resP.pos[j][i].y);
          pts.push([k.cx - _pFin + xc + (resP.pos[j][i].x - xc) * decay, Y]);
        }
        if (pts.length < 3) continue;
        o += AS ? '<path class="ink" d="' + taper(pts, 0.7, 0.7) + '"/>'
                : flM(taper(pts, 0.7, 0.7), 'ink', cx);
      }
    }
    // B2: buzgulu etek (dirndl) — bel bandindaki tiklerden asagi sonumlenen dalgalar
    if (st.gatheredSkirt && st.garment !== 'top') {
      const _gFin = k.eX - cx, Hs2 = k.yHem - k.yEmp;
      const _gBand = Math.min(24 * S * 0.5, Hs2 * 0.22);
      const resG = rectClothGather({ finishedW: _gFin * 2, clothH: Hs2 * 0.55, gatherRatio: (p.gatherRatio || 2),
        fabric: SEED_FABRICS.cotton, seed: p.seed + 17, profile: 'skirt' });
      let maxYG = 1e-6;
      for (let i = 0; i < resG.nx; i++) maxYG = Math.max(maxYG, resG.pos[resG.ny - 1][i].y);
      const gStep = p.ink === 'minimal' ? 4 : p.ink === 'orta' ? 3 : 2;
      for (let fi = 0; fi < resG.folds.length; fi += gStep) {
        const f = resG.folds[fi];
        const u = f[0][0] / resG.finishedW;
        if (!AS && u < 0.5) continue;
        const pts = [];
        for (let j = 0; j < f.length; j++) {
          const yn = f[j][1] / maxYG;                       // 0..1 (cozum boyu)
          const Y = k.yEmp + _gBand + yn * Hs2 * 0.40;      // band alti -> etegin ortasi
          const t = yn, decay = Math.pow(1 - t, 1.3);
          const xc = f[0][0];
          pts.push([cx - _gFin + xc + (f[j][0] - xc) * decay, Y]);
        }
        if (pts.length < 3) continue;
        o += AS ? '<path class="ink" d="' + taper(pts, 0.8, 0.65) + '"/>'
                : flM(taper(pts, 0.8, 0.65), 'ink', cx);
      }
    }

    // ---- C: PUF KAPAK BUZGU ISINLARI -------------------------------------
    if (pt.sleeve && p.capPuff > 0.05 && k.stX != null) {
      const sl = puffSleeve(p, k);
      const cap = sl.g[0];
      // kalemin 5 kapak kirisi nerede (ayni kosul) -> o t'ler bos birakilir
      const tPen = [];
      for (let ci = 1; ci <= 5; ci++) {
        const ct = ci / 6, cp0 = cubic(cap, ct);
        if (cp0[0] >= k.stX + (sl.outX - k.stX) * 0.55) tPen.push(ct);
      }
      // kapak yay uzunlugu (kaba ornekleme) -> cozucu genisligi
      let arc = 0, q0 = cubic(cap, 0);
      for (let i = 1; i <= 20; i++) { const q1 = cubic(cap, i / 20); arc += Math.hypot(q1[0] - q0[0], q1[1] - q0[1]); q0 = q1; }
      const resC = rectClothGather({ finishedW: arc, clothH: arc * 0.35,
        gatherRatio: 1.25 + Math.min(1.2, p.capPuff * 0.30),
        fabric: SEED_FABRICS.cotton, seed: p.seed + 41, profile: 'shirred' });
      const cStep = p.ink === 'minimal' ? 4 : p.ink === 'orta' ? 2 : 1;
      const focus = [(k.stX + sl.outX) / 2, (k.stY + sl.hemY) / 2];
      let ray = 0;
      for (let fi = 0; fi < resC.folds.length; fi++) {
        const t = resC.folds[fi][0][0] / resC.finishedW;
        if (t < 0.30 || t > 0.96) continue;
        if (tPen.some((tc) => Math.abs(t - tc) < 0.055)) continue;
        if ((ray++ % cStep) !== 0) continue;
        const cp = cubic(cap, t);
        let dx = focus[0] - cp[0], dy = focus[1] - cp[1];
        const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const len = (7 + 5 * Math.min(2.5, p.capPuff)) * (0.7 + 0.55 * fr());
        const end = [cp[0] + dx * len, cp[1] + dy * len];
        const pts = samplePts(cp,
          [cp[0] + dx * len * 0.35 - dy * 1.2, cp[1] + dy * len * 0.35 + dx * 1.2],
          [end[0] - dx * len * 0.25, end[1] - dy * len * 0.25], end, 6);
        o += flInk(pts, 0.95, 0.5, cx, AS, jr);
      }
    }

    // ---- D: BEL GERILIM CIZGILERI ---------------------------------------
    if (st.garment !== 'top' && p.waistNip > 0.06) {
      const n = Math.max(2, Math.round((2.4 + p.waistNip * 11) * inkScale));
      for (let i = 0; i < n; i++) {
        const yq = k.yEmp - 6.5 + i * (7.5 / n) + fr() * 1.6;
        const x0 = k.eX - 1 - fr() * 2;
        const len = (k.eX - cx) * (0.15 + 0.10 * fr() + 0.35 * p.waistNip);
        const dipY = (i % 2 ? 1 : -1) * (0.8 + fr() * 1.2);
        const pts = samplePts([x0, yq], [x0 - len * 0.38, yq + dipY * 0.7],
          [x0 - len * 0.75, yq + dipY], [x0 - len, yq + dipY * 0.5], 6);
        o += flInk(pts, 0.85, 0.55, cx, AS, jr);
      }
    }
  });
  return o;
}
