// The site's script: the motion and the question box. Every part checks that its elements are on
// the page, and every part leaves the page whole without it: the content is in the HTML, visible, and script only
// times its arrival or adds what changes by the minute.
(function () {
  var d = document, root = d.documentElement;
  window.ofSite = true;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // How it goes: the statement in the middle of the screen sets the state of the held fragment.
  var steps = d.querySelectorAll('.step[data-step]'), states = d.querySelectorAll('.held [data-state]');
  if (steps.length && states.length && 'IntersectionObserver' in window) {
    var pick = function (n) {
      each('.step[data-step]', function (s) { s.classList.toggle('on', s.getAttribute('data-step') === n); });
      each('.held [data-state]', function (s) { s.classList.toggle('on', s.getAttribute('data-state') === n); });
    };
    var mid = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) pick(e.target.getAttribute('data-step')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Array.prototype.forEach.call(steps, function (s) { mid.observe(s); });
  }

  // The question box: Toran answering for OpenFrequency, from what this site says. Every suggested question has an
  // answer; anything else gets Toran's real line for a question it can't answer.
  var box = d.getElementById('ask-q'), out = d.querySelector('[data-ask-out]'), ex = d.querySelector('[data-ask-ex]');
  if (box && out) {
    var link = function (href, w) { return ' <a class="lnk" href="' + href + '">' + w + '</a>'; };
    var A = {
      toran: ['תורן עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא שואל אתכם ומעביר את התשובה ללקוח.' + link('/toran', 'לעמוד של תורן'), 'מהעמוד של תורן'],
      teder: ['תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, וכל מצגת עולה רק אחרי שמישהו אישר אותה.' + link('/teder', 'לעמוד של תדר'), 'מהעמוד של תדר'],
      demo: ['שולחים לנו את הכתובת של החנות ומספר וואטסאפ. אנחנו בונים דמו מהמוצרים ומדפי המדיניות שבאתר שלכם, ושולחים לכם לינק. כותבים לו כמו לקוח, ורואים מה הוא עונה.' + link('/toran#demo', 'לבנות דמו לחנות'), 'מהעמוד של תורן'],
      store: ['היום תורן עובד עם חנויות על Shopify. החיבור ל-WooCommerce ול-Wix בדרך.', 'מהעמוד של תורן'],
      price: ['המחיר החודשי, ומה ש-Meta גובה על הודעות שהחנות שולחת ביוזמתה, כתובים בעמוד של תורן, עם דוגמה במספרים.' + link('/toran#price', 'כמה זה עולה'), 'מהעמוד של תורן'],
      wrong: ['תורן לא ממציא תשובות. הוא עונה רק ממה שכתוב באתר של החנות, וכשאין לו תשובה הוא שואל אתכם במקום לנחש. בשבועיים הראשונים אנחנו גם קוראים איתכם את השיחות ומתקנים.', 'מהשאלות באתר'],
      number: ['כן. הלקוחות ממשיכים לכתוב לאותו מספר, ואנחנו מחברים אותו ל-WhatsApp Business Platform של Meta יחד איתכם.', 'מהשאלות באתר'],
      install: ['לדמו לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר. כדי לחבר את המספר של החנות צריך חשבון עסקי ב-Meta, ואת החיבור עושים יחד.', 'מהשאלות באתר'],
      night: ['כן. תורן עונה 24/7, ומה שהוא לא יודע מחכה לכם לבוקר.', 'מהעמוד של תורן'],
      who: ['אנחנו OpenFrequency. בנינו את תורן, שעונה ללקוחות של חנויות בוואטסאפ, ואת תדר, שכותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם.', 'מעמוד הבית'],
    };
    var KEEP = 'את זה אני לא יודע. אני בודק עם הצוות, ואחזור אליך כאן.';
    var WHY = 'בחנות אמיתית השאלה הייתה עוברת לבעלים בוואטסאפ. כאן זו הדגמה, אז היא לא נשלחת.';
    var EN = ["Toran answers a store's customers on WhatsApp, from what's on the store's site, in Hebrew or in English." + link('/toran#demo', 'Build a demo for your store'), 'ענה לבד, באנגלית'];
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
