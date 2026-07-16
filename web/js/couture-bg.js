// RESKIN 2026-07-16 (patch 2.1): the functional pages (create, privacy) are NOT
// the entry hero — gingham wallpaper is reserved for the landing hero/waitlist.
// Here the ground is a calm white-blue (css/couture.css body.couture background).
// This file is kept (referenced by the pages) but no longer paints a canvas.
// It only clears any stale #couture-bg canvas from a cached earlier version.
(function () {
  const stale = document.getElementById('couture-bg');
  if (stale && stale.tagName === 'CANVAS') stale.remove();
})();
