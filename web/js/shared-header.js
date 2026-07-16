/* Canonical header behaviour. One EN/TR toggle, one storage key, shared by
   every page. Translates any [data-en]/[data-tr] node and marks the active
   language button. Pages that also run their own app i18n keep doing so; this
   only owns the header toggle + data-en/data-tr text swap. */
(function () {
  var KEY = 'stitchu:lang';
  function getLang() {
    try {
      var s = localStorage.getItem(KEY);
      return (s === 'tr' || s === 'en') ? s : 'en';
    } catch (e) { return 'en'; }
  }
  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }
  function apply(lang) {
    // Translate every [data-en]/[data-tr] node. Preserve the original EN
    // innerHTML (some nodes carry <em>, links) and restore it in EN mode; use
    // textContent for the TR string.
    var nodes = document.querySelectorAll('[data-en],[data-tr]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.dataset.enHtml === undefined) n.dataset.enHtml = n.innerHTML;
      if (lang === 'tr') {
        var tr = n.getAttribute('data-tr');
        if (tr !== null) n.textContent = tr;
      } else {
        n.innerHTML = n.dataset.enHtml;
      }
    }
    // Placeholders (landing waitlist inputs use data-en-ph/data-tr-ph).
    var phs = document.querySelectorAll('[data-en-ph],[data-tr-ph]');
    for (var j = 0; j < phs.length; j++) {
      var p = phs[j];
      var ph = lang === 'tr' ? p.getAttribute('data-tr-ph') : p.getAttribute('data-en-ph');
      if (ph !== null) p.setAttribute('placeholder', ph);
    }
    var en = document.getElementById('lang-en');
    var tr = document.getElementById('lang-tr');
    if (en) { en.classList.toggle('sh-langon', lang !== 'tr'); en.classList.toggle('active', lang !== 'tr'); }
    if (tr) { tr.classList.toggle('sh-langon', lang === 'tr'); tr.classList.toggle('active', lang === 'tr'); }
    document.documentElement.setAttribute('lang', lang);
  }
  function choose(lang) {
    if (getLang() === lang) return;
    setLang(lang);
    // Reload so app-rendered screens (create/closet use data-i18n via their own
    // module, read at render time) switch too, not just the header text.
    window.location.reload();
  }
  function init() {
    apply(getLang());
    var en = document.getElementById('lang-en');
    var tr = document.getElementById('lang-tr');
    if (en) en.addEventListener('click', function () { choose('en'); });
    if (tr) tr.addEventListener('click', function () { choose('tr'); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  window.stitchuLang = { get: getLang, set: setLang };

  /* Root cause #2b — the "page is loading" feeling. On hover/touch of any
     internal link, prefetch the target document so it is already in cache by
     the time the click lands; the navigation then feels instant instead of a
     fresh load. <link rel="prefetch"> is honoured by Safari and Chrome; we also
     drop a Speculation-Rules 'prerender' hint for Chromium (Safari ignores it
     silently). Same-page anchors, downloads and external hosts are skipped, and
     each URL is prefetched at most once. */
  (function prefetchOnIntent() {
    var seen = {};
    function sameOrigin(href) {
      try {
        var u = new URL(href, location.href);
        if (u.origin !== location.origin) return null;
        if (u.pathname === location.pathname && u.search === location.search) return null;
        if (/\.(pdf|zip|svg|png|jpe?g|webp)$/i.test(u.pathname)) return null;
        return u.href;
      } catch (e) { return null; }
    }
    function warm(a) {
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = sameOrigin(a.getAttribute('href') || '');
      if (!href || seen[href]) return;
      seen[href] = 1;
      var l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = href;
      l.as = 'document';
      document.head.appendChild(l);
      // Chromium prerender hint (Safari ignores an unknown script type).
      if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
        var s = document.createElement('script');
        s.type = 'speculationrules';
        s.textContent = JSON.stringify({ prerender: [{ urls: [href] }] });
        document.head.appendChild(s);
      }
    }
    function onIntent(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (a) warm(a);
    }
    document.addEventListener('mouseover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
  })();
})();
