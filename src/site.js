// The site's script: the motion, light or dark, and the accessibility panel. Every part checks that its elements are on
// the page, and every part leaves the page whole without it: the content is in the HTML, visible, and script only
// times its arrival or adds what changes by the minute.
(function () {
  var d = document, root = d.documentElement;
  window.ofSite = true;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('a-still');
  var each = function (sel, fn, scope) { Array.prototype.forEach.call((scope || d).querySelectorAll(sel), fn); };

  // The header lifts once the page scrolls under it; the phone menu closes on a tap outside, a link, or Escape.
  var lift = function () { root.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', lift, { passive: true });
  lift();
  var menu = d.querySelector('.menu');
  if (menu) {
    d.addEventListener('click', function (e) { if (menu.open && (!menu.contains(e.target) || e.target.closest('nav a'))) menu.open = false; });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
  }

  // Light or dark: the header's button (layout.mjs themeButton) turns dark on and off, and the choice is kept in this
  // browser under of-theme, which the head reads before the page paints. Without storage it still works for the visit.
  var theme = d.querySelector('[data-theme-toggle]');
  if (theme) {
    var tColor = d.querySelector('meta[name=theme-color]');
    var tSet = function (dark) {
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      theme.setAttribute('aria-pressed', dark ? 'true' : 'false');
      if (tColor) tColor.setAttribute('content', dark ? '#111113' : '#eeeff2');
    };
    tSet(root.getAttribute('data-theme') === 'dark');
    theme.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') !== 'dark';
      tSet(dark);
      try { localStorage.setItem('of-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
  }

  // The accessibility panel: each switch is a class on <html> (a-big, a-contrast, a-links, a-still), kept in this
  // browser for the next visit; the head puts them back before paint. It closes on Escape or a click outside.
  var a11y = d.querySelector('[data-a11y]');
  if (a11y) {
    var KEY = 'of-a11y', on = {};
    try { on = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { on = {}; }
    var aBtn = a11y.querySelector('.a11y-btn'), aPanel = a11y.querySelector('.a11y-p');
    var aSave = function () { try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (e) {} };
    var aApply = function () {
      each('[data-a]', function (b) {
        var k = b.getAttribute('data-a');
        root.classList.toggle('a-' + k, on[k] === true);
        b.setAttribute('aria-pressed', on[k] === true ? 'true' : 'false');
      }, a11y);
    };
    var aShow = function (open) { aPanel.hidden = !open; aBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    a11y.hidden = false;
    aApply();
    aBtn.addEventListener('click', function () { aShow(aPanel.hidden); });
    a11y.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (b) { var k = b.getAttribute('data-a'); on[k] = on[k] !== true; aApply(); aSave(); }
      if (e.target.closest('[data-a11y-reset]')) { on = {}; aApply(); aSave(); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !aPanel.hidden) { aShow(false); aBtn.focus(); } });
    d.addEventListener('click', function (e) { if (!aPanel.hidden && !a11y.contains(e.target)) aShow(false); });
  }

  // Each part of a section rises once as the section arrives, 80ms after the one before it.
  var seen = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  each('[data-rise]', function (el) {
    Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', i); });
    if (seen) seen.observe(el); else el.classList.add('in');
  });
  each('.fan', function (el) { if (seen) seen.observe(el); else el.classList.add('in'); });

  // On a phone each door on the home page starts shut, its name and a short line; the button on its top row opens it.
  // From 700px the stylesheet shows the door whole whatever the button says.
  each('[data-door]', function (door) {
    var btn = door.querySelector('.door-open');
    if (!btn) return;
    var set = function (open) { door.classList.toggle('shut', !open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.hidden = false;
    set(false);
    btn.addEventListener('click', function () { set(door.classList.contains('shut')); });
  });

  // A chat stage marked data-play plays once as it comes into view: messages arrive in their order, and each answer
  // is preceded by Toran's three typing dots. Messages the layout hides (the second exchange on a phone) sit out.
  var play = function (stage) {
    var items = Array.prototype.slice.call(stage.querySelectorAll('.msgs > li'))
      .filter(function (li) { return getComputedStyle(li).display !== 'none'; })
      .sort(function (a, b) { return (+a.getAttribute('data-o') || 0) - (+b.getAttribute('data-o') || 0); });
    var t = 400;
    items.forEach(function (li) {
      if (li.classList.contains('them')) {
        var typing = d.createElement('li');
        typing.className = 'msg them typing wait-in';
        typing.setAttribute('aria-hidden', 'true');
        typing.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
        li.parentNode.insertBefore(typing, li);
        setTimeout(function () { typing.classList.remove('wait-in'); }, t);
        t += 1000;
        setTimeout(function () { typing.remove(); li.classList.remove('wait-in'); }, t);
        t += 600;
      } else {
        setTimeout(function () { li.classList.remove('wait-in'); }, t);
        t += 800;
      }
    });
    each('[data-pop]', function (p) { setTimeout(function () { p.classList.remove('wait-in'); }, t + 200); }, stage);
  };
  if (!still) each('[data-play]', function (stage) {
    each('.msgs > li, [data-pop]', function (li) { li.classList.add('wait-in'); }, stage);
    if (!('IntersectionObserver' in window)) return play(stage);
    var once = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { once.disconnect(); play(stage); }
    }, { rootMargin: '0px 0px -20% 0px' });
    once.observe(stage);
  });

  // Toran's channels: the stacked windows become tabs. One window shows at a time; the arrow keys move between the
  // tabs (in reading order, so in Hebrew the left arrow goes on), Home and End go to the ends.
  each('[data-channels]', function (box) {
    var list = box.querySelector('[role=tablist]'), tabs = box.querySelectorAll('[role=tab]');
    var pick = function (tab, focus) {
      Array.prototype.forEach.call(tabs, function (t) {
        var on = t === tab, panel = d.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    Array.prototype.forEach.call(tabs, function (t, i) {
      var panel = d.getElementById(t.getAttribute('aria-controls'));
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', t.id);
      panel.tabIndex = 0;
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        var rtl = getComputedStyle(list).direction === 'rtl', n = tabs.length, k = e.key, to = null;
        if (k === (rtl ? 'ArrowLeft' : 'ArrowRight')) to = (i + 1) % n;
        else if (k === (rtl ? 'ArrowRight' : 'ArrowLeft')) to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to === null) return;
        e.preventDefault();
        pick(tabs[to], true);
      });
    });
    list.hidden = false;
    box.classList.add('tabbed');
    pick(box.querySelector('[aria-selected=true]') || tabs[0]);
  });

  // Teder's phone shows its slides like stories: one at a time, a bar filling across the top for each.
  each('[data-reel]', function (reel) {
    var imgs = reel.querySelectorAll('img'), bars = reel.querySelectorAll('.bars i'), i = 0;
    var show = function () {
      Array.prototype.forEach.call(imgs, function (im, k) { im.classList.toggle('on', k === i); });
      Array.prototype.forEach.call(bars, function (b, k) { b.classList.toggle('done', k < i); b.classList.toggle('run', k === i); });
    };
    reel.classList.add('live');
    show();
    if (!still) setInterval(function () { i = (i + 1) % imgs.length; show(); }, 3200);
  });

  // The kinds of store (niches.mjs): a search over them, and up to 820px, where they are a row of chips that scrolls
  // sideways, the one picked brought fully into the row.
  var nsearch = d.querySelector('[data-niche-search]');
  if (nsearch) {
    var nin = nsearch.querySelector('input'), nnone = d.querySelector('[data-niche-none]');
    nsearch.hidden = false;
    nin.addEventListener('input', function () {
      var q = nin.value.trim(), shown = 0;
      each('[data-niche-row]', function (r) { var hit = !q || r.getAttribute('data-words').indexOf(q) >= 0; r.hidden = !hit; if (hit) shown++; });
      nnone.hidden = shown > 0;
    });
    each('.niche-pick', function (r) {
      r.addEventListener('change', function () {
        var chip = d.querySelector('[for="' + r.id + '"]');
        if (chip && window.matchMedia('(max-width: 820px)').matches) chip.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
      });
    });
  }

  // Loading: a tap never sits still (the products do the same). ~120ms after a link to another of our pages, a bar runs
  // along the top and the page becomes the outline of a page, until the next one paints; on a quick connection none of
  // it shows. Other sites, new tabs, anchors on this page and downloads go as they are. Back to a page the browser
  // kept gets it as it was.
  (function () {
    var main = d.getElementById('main');
    if (!main) return;
    var timer = 0, bar = null, scrolled = null;
    var el = function (cls) { var x = d.createElement('div'); x.className = cls; for (var i = 1; i < arguments.length; i++) x.appendChild(arguments[i]); return x; };
    var W = [82, 64, 90, 48, 72];
    var line = function (i, cls) { var x = el('sk' + (cls ? ' ' + cls : '')); x.style.width = W[i % W.length] + '%'; return x; };
    var tile = function (i) { return el('tile glass', line(i), line(i + 1), line(i + 2), line(i + 3)); };
    var skeleton = function () {
      var say = d.createElement('span');
      say.className = 'sk-say';
      say.textContent = 'טוען…';
      var page = el('sk-page wrap', say, line(0, 'h1'), el('sk-lines', line(1), line(2), line(3)), el('sk btn'), el('sk-tiles', tile(0), tile(2)));
      page.setAttribute('role', 'status');
      return page;
    };
    var stop = function () {
      clearTimeout(timer);
      root.classList.remove('is-loading', 'sk-on');
      var sk = main.querySelector('.sk-page');
      if (sk) sk.remove();
      main.removeAttribute('aria-busy');
      if (scrolled != null) scrollTo(0, scrolled);
      scrolled = null;
    };
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /\.(pdf|zip|png|jpe?g|webp|svg|xml|txt)$/i.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      stop();
      timer = setTimeout(function () {
        bar = bar || d.body.appendChild(el('loadbar'));
        root.classList.add('is-loading');
        main.insertBefore(skeleton(), main.firstChild);
        main.setAttribute('aria-busy', 'true');
        root.classList.add('sk-on');
        scrolled = scrollY;
        scrollTo(0, 0);
      }, 120);
    });
    addEventListener('pageshow', function (e) { if (e.persisted) stop(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-loading')) stop(); });
  })();
})();
