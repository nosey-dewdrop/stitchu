// Couture backdrop for the app pages: the same vişne poplin gingham the
// landing draws, so create/closet/privacy live in one world. The functional
// UI sits on a white pattern-paper sheet above this canvas (css/couture.css).
(function () {
  const cv = document.createElement('canvas');
  cv.id = 'couture-bg';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const SHADE = { l: [172, 60, 76], d: [110, 30, 44] };
  function draw() {
    const W = Math.max(200, Math.round(innerWidth * 0.4));
    const H = Math.max(200, Math.round(innerHeight * 0.4));
    cv.width = W; cv.height = H;
    const img = ctx.createImageData(W, H), d = img.data;
    const C = Math.max(3, Math.round(W * 0.012));
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = (y * W + x) * 4, ty = y / H;
        const b = SHADE, f = 0.55 - ty * 0.07;
        let r = b.l[0] * (0.5 + f) + b.d[0] * (0.5 - f);
        let g = b.l[1] * (0.5 + f) + b.d[1] * (0.5 - f);
        let bl = b.l[2] * (0.5 + f) + b.d[2] * (0.5 - f);
        const lgt = ((x % (C * 2)) < C ? 1 : 0) + ((y % (C * 2)) < C ? 1 : 0);
        if (lgt) { const w = lgt === 2 ? 0.42 : 0.20; r += (212 - r) * w; g += (150 - g) * w; bl += (158 - bl) * w; }
        const th = ((x & 1) ? -0.05 : 0.03) + ((y & 1) ? -0.05 : 0.03);
        d[p] = r * (1 + th); d[p + 1] = g * (1 + th); d[p + 2] = bl * (1 + th); d[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  draw();
  addEventListener('resize', draw);
})();
