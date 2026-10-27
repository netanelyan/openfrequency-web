// The site's one script beyond the header: it sends a form without leaving the page. Without it the forms still
// work, as plain posts that land on /thanks or /try-again. Every word it shows is in the page, in a <template>, so
// the copy lint reads it like the rest.
//   form[data-form="demo" | "teder" | "join"]: data-wa is our WhatsApp number (empty in a draft), data-wa-text the message
//   it starts with, where {store} is the address they typed.
//   form[data-form="waitlist"]: Toran's waitlist while it is soon, a phone or an email; its thank-you is done-waitlist.
// A Toran demo is answered with a code and a wa.me link to Toran's demo number (server/lead.mjs); the thank-you shows
// the code and a button that opens the link.
(function () {
  var forms = document.querySelectorAll('form[data-form]');
  // /join?p=teder (or toran) ticks that product alone, unless it can't be ticked (Toran, while it is soon).
  var p = new URLSearchParams(location.search).get('p');
  var jf = document.querySelector('form[data-form=join]');
  if (jf && (p === 'teder' || p === 'toran') && !jf.elements[p].disabled) ['toran', 'teder'].forEach(function (k) { if (!jf.elements[k].disabled) jf.elements[k].checked = k === p; });
  // On the join page the WhatsApp number is Teder's, so it shows (and is asked for) only while Teder is ticked, and each
  // line under the button only while its product is.
  if (jf) {
    var sync = function () {
      var teder = jf.elements.teder.checked, contact = jf.elements.contact;
      contact.closest('label').hidden = !teder;
      contact.required = teder;
      jf.elements.store.closest('label').classList.toggle('wide', !teder);
      jf.querySelectorAll('[data-for]').forEach(function (x) { x.hidden = !jf.elements[x.getAttribute('data-for')].checked; });
    };
    jf.addEventListener('change', sync);
    sync();
  }
  for (var i = 0; i < forms.length; i++) forms[i].addEventListener('submit', send);

  function send(e) {
    e.preventDefault();
    var f = e.target, kind = f.getAttribute('data-form');
    var btn = f.querySelector('button[type=submit]'), msg = f.querySelector('.form-msg');
    var data = Object.fromEntries(new FormData(f));
    reset(f, msg);
    btn.setAttribute('aria-busy', 'true');
    // Eight seconds, then it counts as down and the WhatsApp way is offered.
    var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 8000);
    fetch(f.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: ctl.signal,
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; }); })
      .then(function (x) {
        if (x.body.ok) return done(f, x.body, data.store);
        if (x.status >= 500 || !x.body.error) return say(f, msg, 'down', data);
        say(f, msg, x.body.error === 'contact' ? 'contact-' + kind : x.body.error, data);
      })
      .catch(function () { say(f, msg, 'down', data); })
      .then(function () { clearTimeout(timer); btn.removeAttribute('aria-busy'); });
  }

  function copy(id) {
    var t = document.getElementById(id);
    return t ? t.content.cloneNode(true) : null;
  }

  // A message under the button. A field it's about is marked and focused; "down" and "rate" offer WhatsApp.
  function say(f, msg, key, data) {
    msg.replaceChildren(copy('msg-' + key) || copy('msg-bad'));
    var wa = msg.querySelector('[data-wa]');
    if (wa) {
      var n = f.getAttribute('data-wa');
      if (n) wa.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent(f.getAttribute('data-wa-text').replace('{store}', data.store || ''));
      else wa.remove();
    }
    msg.hidden = false;
    var field = key === 'store' ? f.elements.store : key.indexOf('contact') === 0 ? f.elements.contact : key === 'products' ? f.elements.toran : null;
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', msg.id);
      field.focus();
    }
  }

  function reset(f, msg) {
    msg.hidden = true;
    msg.textContent = '';
    ['store', 'contact'].forEach(function (k) {
      var x = f.elements[k];
      if (x) { x.removeAttribute('aria-invalid'); x.removeAttribute('aria-describedby'); }
    });
  }

  // The thank-you takes the form's place and gets the focus, so a screen reader reads it. A Toran demo's shows its code
  // and the button to WhatsApp (left out if the endpoint has no demo number to give), and on the join page the Teder
  // line when Teder was asked for too.
  function done(f, body, typed) {
    var node = copy(body.code ? 'done-code' : body.source === 'waitlist' ? 'done-waitlist' : 'done-teder');
    var s = node.querySelector('[data-store]');
    if (s) s.textContent = body.store || typed || '';
    var c = node.querySelector('[data-code]');
    if (c) c.textContent = body.code;
    var go = node.querySelector('[data-wa-go]');
    if (go && body.wa) go.href = body.wa;
    else if (go) go.remove();
    var t = node.querySelector('[data-teder]');
    if (t) t.hidden = !(body.saved && body.saved.indexOf('teder') >= 0);
    f.replaceChildren(node);
    f.classList.add('sent');
    var d = f.querySelector('.done');
    if (d) d.focus();
  }
})();
