// The site's script: the motion and the question box. Every part checks that its elements are on
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

  // The question box: Toran answering for OpenFrequency, from what this site says. Every suggested question has an
  // answer; anything else gets Toran's real line for a question it can't answer.
  var box = d.getElementById('ask-q'), out = d.querySelector('[data-ask-out]'), ex = d.querySelector('[data-ask-ex]');
  if (box && out) {
    var link = function (href, w) { return ' <a class="lnk" href="' + href + '">' + w + '</a>'; };
    var A = {
      toran: ['תורן עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא שואל אתכם ומעביר את התשובה ללקוח.' + link('/toran', 'לעמוד של תורן'), 'מהעמוד של תורן'],
      teder: ['תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, וכל מצגת עולה רק אחרי שמישהו אישר אותה.' + link('/teder', 'לעמוד של תדר'), 'מהעמוד של תדר'],
      demo: ['שולחים לנו את הכתובת של החנות ומספר וואטסאפ. אנחנו בונים דמו מהמוצרים ומדפי המדיניות שבאתר שלכם, ושולחים לכם לינק. כותבים לו כמו לקוח, ורואים מה הוא עונה.' + link('/toran#demo', 'לנסות את תורן על החנות שלכם'), 'מהעמוד של תורן'],
      store: ['היום תורן עובד עם חנויות על Shopify. החיבור ל-WooCommerce ול-Wix בדרך.', 'מהעמוד של תורן'],
      // The prices come from the page (home.mjs, #ask-price), which the build writes from the config.
      price: [(d.getElementById('ask-price') || { innerHTML: '' }).innerHTML.trim() + link('/join', 'להצטרף'), 'מהעמודים של תורן ושל תדר'],
      wrong: ['תורן לא ממציא תשובות. הוא עונה רק ממה שכתוב באתר של החנות, וכשאין לו תשובה הוא שואל אתכם במקום לנחש. בשבועיים הראשונים אנחנו גם עוברים איתכם על כל שיחה ומתקנים מה שצריך.', 'מהשאלות באתר'],
      number: ['כן. הלקוחות ממשיכים לכתוב לאותו מספר, ואנחנו מחברים אותו ל-WhatsApp Business Platform של Meta יחד איתכם.', 'מהשאלות באתר'],
      install: ['לדמו לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר. כדי לחבר את המספר של החנות צריך חשבון עסקי ב-Meta, ואת החיבור עושים יחד.', 'מהשאלות באתר'],
      night: ['כן. תורן עונה 24/7, ומה שהוא לא יודע מחכה לכם לבוקר.', 'מהעמוד של תורן'],
      who: ['אנחנו OpenFrequency. בנינו את תורן, שעונה ללקוחות של חנויות בוואטסאפ, ואת תדר, שכותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם.', 'מעמוד הבית'],
    };
    var KEEP = 'את זה אני לא יודע. אני בודק עם הצוות, ואחזור אליך כאן.';
    var WHY = 'בחנות אמיתית השאלה הייתה עוברת לבעלים בוואטסאפ. כאן זו הדגמה, אז היא לא נשלחת.';
    var EN = ["Toran answers a store's customers on WhatsApp, from what's on the store's site, in Hebrew or in English." + link('/toran#demo', 'Try Toran on your store'), 'ענה לבד, באנגלית'];
    var has = function (q, words) { return words.some(function (w) { return q.indexOf(w) > -1; }); };
    var answer = function (raw) {
      var q = ' ' + raw.toLowerCase() + ' ';
      if (/[a-z]/.test(q) && !/[֐-׿]/.test(q)) return EN;
      if (has(q, ['טועה', 'טעות', 'ממציא', 'להמציא', 'לא נכון', 'לנחש', 'משקר'])) return A.wrong;
      if (has(q, ['wix', 'woo', 'shopify', 'וויקס', 'ויקס', 'שופיפיי', 'פלטפורמ', 'אתר שלי', 'החנות שלי על'])) return A.store;
      if (has(q, ['עולה', 'מחיר', 'כמה זה', '₪', 'שקל', 'לשלם', 'תשלום', 'חודשי', 'יקר'])) return A.price;
      if (has(q, ['דמו', 'לנסות', 'להתחיל', 'מתחילים'])) return A.demo;
      if (has(q, ['להתקין', 'התקנה', 'קוד באתר'])) return A.install;
      if (has(q, ['המספר', 'מספר של', 'מספר שלי', 'וואטסאפ עסקי'])) return A.number;
      if (has(q, ['לילה', 'בלילה', 'שעות', '24'])) return A.night;
      if (has(q, ['תדר', 'מצגת', 'מצגות', 'טיקטוק', 'אינסטגרם', 'תוכן'])) return A.teder;
      if (has(q, ['תורן', 'וואטסאפ', 'לקוחות', 'שירות'])) return A.toran;
      if (has(q, ['מי אתם', 'openfrequency', 'החברה', 'אתם'])) return A.who;
      return { keep: KEEP, why: WHY };
    };
    var esc = function (s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var add = function (cls, html) {
      var li = d.createElement('li');
      li.className = cls;
      li.innerHTML = html;
      out.appendChild(li);
      out.scrollTop = out.scrollHeight;
      return li;
    };
    // A question goes into the chat as the customer's message; the answer follows Toran's typing dots, with a line
    // under it on where it came from, or why it went to the store. The chat keeps the last few exchanges.
    var send = function (raw) {
      var q = raw.trim();
      if (!q) return;
      while (out.children.length > 9) out.removeChild(out.firstChild);
      add('msg me', esc(q) + '<time aria-hidden="true">עכשיו</time>');
      var a = answer(q), alone = Array.isArray(a);
      var reply = function () {
        add('msg them' + (still ? '' : ' answer-in'), (alone ? a[0] : esc(a.keep)) + '<time aria-hidden="true">עכשיו</time>');
        add('sys', alone ? '<span class="ui-s alone">ענה לבד</span>' + a[1] : '<span class="ui-s yours">לא כתוב באתר</span>' + a.why);
      };
      if (still) return reply();
      var typing = add('msg them typing', '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>');
      setTimeout(function () { typing.remove(); reply(); }, 900);
    };
    var form = d.querySelector('[data-ask-form]');
    if (form) {
      form.hidden = false;
      form.addEventListener('submit', function (e) { e.preventDefault(); send(box.value); box.value = ''; });
    }
    if (ex) {
      ex.hidden = false;
      each('button', function (b) { b.addEventListener('click', function () { send(b.textContent); }); }, ex);
    }
  }

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

  // On a phone, the way to a demo stays at the bottom of the screen once the first screen is behind, and steps aside
  // while a form or the footer is in view.
  var dock = d.querySelector('[data-dock]');
  if (dock && 'IntersectionObserver' in window) {
    var past = false, near = new Set();
    var set = function () { dock.classList.toggle('on', past && !near.size); };
    new IntersectionObserver(function (es) {
      past = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; set();
    }).observe(d.querySelector('main > section'));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) near.add(e.target); else near.delete(e.target); }); set();
    });
    each('.demo, .wait, .close-sec, .foot', function (el) { io.observe(el); });
  }
})();
