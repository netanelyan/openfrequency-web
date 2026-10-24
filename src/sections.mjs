// What more than one page uses: words that open WhatsApp to us, and the question box on the home page.
import { esc, ils, mark } from './lib.mjs';

// Words that open WhatsApp to us; plain words in a draft without the number.
export const waWords = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

// ---------------------------------------------------------------- ask it

// The question box, with Toran answering for OpenFrequency itself. The script answers each question from what this
// site says, the way Toran answers from a store's site, and every suggested question has an answer. Without script,
// the prefilled question keeps its answer, written here.
export const askBox = `
<figure class="chat try" data-ui aria-label="OpenFrequency, שיחה עם תורן">
<div class="chat-top">${mark('openfrequency', 38)}<span><b>OpenFrequency</b><small>תורן עונה</small></span><span class="tag">דוגמה</span></div>
<ol class="msgs" data-ask-out aria-live="polite">
<li class="msg me">מה תורן עושה?<time aria-hidden="true">עכשיו</time></li>
<li class="msg them">תורן עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא שואל אתכם ומעביר את התשובה ללקוח. <a class="lnk" href="/toran">לעמוד של תורן</a><time aria-hidden="true">עכשיו</time></li>
<li class="sys"><span class="ui-s alone">ענה לבד</span>מהעמוד של תורן</li>
</ol>
<div class="ask-ex" data-ask-ex hidden>
<button type="button">כמה זה עולה?</button>
<button type="button">מה זה תדר?</button>
<button type="button">איך מקבלים דמו?</button>
<button type="button">זה עובד עם Wix?</button>
<button type="button">ומה אם הוא טועה?</button>
</div>
<form class="ask-bar" data-ask-form hidden>
<label class="sr" for="ask-q">שאלה לתורן</label>
<input id="ask-q" type="text" placeholder="תכתבו שאלה" autocomplete="off" maxlength="80" enterkeyhint="send">
<button class="send" type="submit" aria-label="לשלוח"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
</form>
</figure>
`;

// ---------------------------------------------------------------- the price

// A product's price, in the serious register, on one card: the product, the monthly figure, VAT and the setup fee,
// the way to try it, and beside them what the price includes. Once the terms are set, how to stop goes under the card.
// monthly and setup are the facts' keys (price.monthly for Toran, teder.monthly for Teder); product is
// { name: 'toran' | 'teder', label, includes: [html], notes?: [html], cta: [href, text] }. Left out of the public draft until the
// monthly price is set; the terms line waits for its own facts the same way.
// Toran only (toran: true) adds the founding offer, the free demo, what Meta charges with a worked example, and what
// happens to the number and the conversations when a store stops.
export function priceSection(cfg, { monthly, setup, product, id = 'price', toran = false }) {
  if (!cfg.has(monthly) && !cfg.banner) return '';
  const vat = cfg.get('price.vat');
  const fee = cfg.get(setup);
  const vatLine = vat === 'included' ? 'כולל מע״מ.' : vat === 'excluded' ? 'לא כולל מע״מ.' : cfg.ph('price.vat');
  const setupLine = fee == null ? cfg.ph(setup) : fee === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(fee))} דמי הקמה, פעם אחת.${toran ? founding(cfg) : ''}`;
  const months = cfg.get('price.commitmentMonths');
  const stops = cfg.get('price.stops');
  let terms = '';
  if ((months != null && stops) || cfg.banner) {
    const stopWords = stops === 'period-end' ? 'החיוב נעצר בסוף החודש שכבר שולם' : stops === 'immediately' ? 'החיוב נעצר מאותו יום' : cfg.ph('price.stops');
    const write = waWords(cfg, 'כותבים לנו');
    const commit = months == null
      ? cfg.ph('price.commitmentMonths')
      : months === 0 ? 'אין התחייבות, משלמים חודש בחודש.' : `ההתחייבות היא ל-${months} חודשים.`;
    const stop = months > 0 ? 'אחרי זה, כדי להפסיק' : 'כדי להפסיק';
    terms = toran && stops === 'period-end'
      ? `${commit} ${stop}, ${write}. תורן עונה עד סוף החודש האחרון ששילמתם. ${afterStop(cfg)}`
      : `${commit} ${stop}, ${write}, ו${stopWords}.`;
  }
  const figure = cfg.get(monthly) == null ? cfg.ph(monthly) : esc(cfg.get(monthly).toLocaleString('he-IL'));
  return `
<section class="sec price-sec ${product.name}" id="${id}" aria-labelledby="${id}-h">
<div class="wrap">
<div class="sec-head"><h2 id="${id}-h">כמה זה עולה</h2></div>
<div class="price-card glass">
<div class="price-main">
<p class="price-name">${mark(product.name, 36)}<b>${product.label}</b></p>
<p class="figure"><span class="num">${figure}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
<p class="price-notes">${vatLine} ${setupLine}${toran ? ' הדמו בחינם.' : ''}</p>
<a class="btn primary" href="${product.cta[0]}">${product.cta[1]}</a>
</div>
<div class="price-incl">
<h3>מה כלול במחיר</h3>
<ul class="checks">${product.includes.map((x) => `<li>${x}</li>`).join('')}</ul>
${(product.notes || []).map((x) => `<p class="incl-note">${x}</p>`).join('')}
</div>
</div>
${toran ? metaFees(cfg, monthly) : ''}
${terms ? `<p class="terms-line">${terms}</p>` : ''}
</div>
</section>`;
}

// The founding offer, while price.founding.on is true: the first stores pay no setup fee. A sentence that starts with a
// space, to follow the setup fee; product names the product where the sentence stands without it (the price line).
export function founding(cfg, product = '') {
  if (cfg.get('price.founding.on') !== true) return '';
  const n = cfg.get('price.founding.stores');
  return n == null ? ` ${cfg.ph('price.founding.stores')}` : ` ל-${esc(n)} החנויות הראשונות שמצטרפות${product} אין דמי הקמה.`;
}

// What happens after the last paid month: the number, and how long the conversations are kept.
function afterStop(cfg) {
  const days = cfg.get('price.keepDays');
  return `מספר הוואטסאפ של החנות נשאר שלכם, ואנחנו מנתקים אותו מהצד שלנו. את השיחות אנחנו שומרים עוד ${days == null ? cfg.ph('price.keepDays') : esc(days)} יום, כדי שתוכלו לייצא אותן, ואחר כך מוחקים אותן.`;
}

// What Meta charges for the messages, and a month worked out from the config's own numbers. Left out of the public
// draft until every number it needs is set.
const META = ['price.metaFees', 'price.conversationCap', 'price.metaMarketing', 'price.metaUtility', 'price.exampleCarts', 'price.exampleUpdates'];
function metaFees(cfg, monthly) {
  if (!cfg.banner && ![...META, monthly].every((k) => cfg.has(k))) return '';
  const how = cfg.get('price.metaFees');
  const cap = cfg.get('price.conversationCap');
  const capWords = cap == null ? cfg.ph('price.conversationCap') : `${esc(cap.toLocaleString('he-IL'))} שיחות`;
  if (how === 'included') {
    return `<div class="price-meta"><h3>מה ש-Meta גובה על ההודעות</h3><p>כל ההודעות כלולות במחיר החודשי, עד ${capWords} בחודש. את מה ש-Meta גובה עליהן אנחנו משלמים.</p></div>`;
  }
  if (how !== 'marketing-at-cost') return `<div class="price-meta"><p>${cfg.ph('price.metaFees')}</p></div>`;
  const n = (key) => cfg.get(key);
  // An amount, rounded to the agora, or the placeholder of the first fact it is missing.
  const money = (keys, f) => {
    const gap = keys.find((k) => n(k) == null);
    return gap ? cfg.ph(gap) : esc(ils(Math.round(f() * 100) / 100));
  };
  const count = (key) => (n(key) == null ? cfg.ph(key) : esc(n(key).toLocaleString('he-IL')));
  const carts = ['price.exampleCarts', 'price.metaMarketing'];
  const updates = ['price.exampleUpdates', 'price.metaUtility'];
  return `
<div class="price-meta">
<h3>מה ש-Meta גובה על ההודעות</h3>
<p>תשובות ללקוחות ועדכונים על הזמנות כלולים במחיר החודשי, עד ${capWords} בחודש. תזכורות על עגלה נטושה הן הודעות שיווק, ו-Meta גובה על כל אחת מהן בערך ${money(['price.metaMarketing'], () => n('price.metaMarketing'))}. את זה אנחנו מעבירים אליכם במחיר של Meta, בלי תוספת. בחודש הראשון התזכורות עלינו.</p>
<p>לדוגמה, חנות ששולחת בחודש ${count('price.exampleCarts')} תזכורות על עגלה ו-${count('price.exampleUpdates')} עדכונים על הזמנות תשלם בערך ${money([monthly, ...carts], () => n(monthly) + n('price.exampleCarts') * n('price.metaMarketing'))} לאותו חודש${cfg.get('price.vat') === 'excluded' ? ', לפני מע״מ' : ''}: ${money([monthly], () => n(monthly))} המחיר החודשי, ועוד בערך ${money(carts, () => n('price.exampleCarts') * n('price.metaMarketing'))} על התזכורות. העדכונים עולים ב-Meta בערך ${money(updates, () => n('price.exampleUpdates') * n('price.metaUtility'))}, והם כלולים במחיר.</p>
</div>`;
}
