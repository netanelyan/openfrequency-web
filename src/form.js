// The site's one script beyond the header: it sends a form without leaving the page. Without it the forms still
// work, as plain posts that land on /thanks or /try-again. Every word it shows is in the page, in a <template>, so
// the copy lint reads it like the rest.
//   form[data-form="demo"]: data-wa is our WhatsApp number (empty in a draft), data-wa-text the message
//   it starts with, where {store} is the address they typed.
(function () {
  var forms = document.querySelectorAll('form[data-form]');
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
        if (x.body.ok) return done(f, kind, x.body.store || data.store);
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
    var field = key === 'store' ? f.elements.store : key.indexOf('contact') === 0 ? f.elements.contact : null;
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

  // The thank-you takes the form's place and gets the focus, so a screen reader reads it.
  function done(f, kind, store) {
    var node = copy('done-' + kind);
    var s = node.querySelector('[data-store]');
    if (s) s.textContent = store || '';
    f.replaceChildren(node);
    f.classList.add('sent');
    var d = f.querySelector('.done');
    if (d) d.focus();
  }
})();
