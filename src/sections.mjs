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

// A product's price, in the serious register: the figure, VAT and the setup fee, and, once the terms are set, how to
// stop. monthly and setup are the facts' keys (price.monthly for Toran, teder.monthly for Teder). Left out of the
// public draft until the monthly price is set; a terms line waits for its own facts the same way.
export function priceSection(cfg, { monthly, setup, id = 'price' }) {
  if (!cfg.has(monthly) && !cfg.banner) return '';
  const vat = cfg.get('price.vat');
  const fee = cfg.get(setup);
  const vatLine = vat === 'included' ? 'המחיר כולל מע״מ.' : vat === 'excluded' ? 'המחיר לא כולל מע״מ.' : cfg.ph('price.vat');
  const setupLine = fee == null ? cfg.ph(setup) : fee === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(fee))} דמי הקמה, פעם אחת.`;
  const months = cfg.get('price.commitmentMonths');
  const stops = cfg.get('price.stops');
  let terms = '';
  if ((months != null && stops) || cfg.banner) {
    const stopWords = stops === 'period-end' ? 'החיוב נעצר בסוף החודש שכבר שולם' : stops === 'immediately' ? 'החיוב נעצר מאותו יום' : cfg.ph('price.stops');
    const write = waWords(cfg, 'כותבים לנו');
    terms = months == null
      ? `${cfg.ph('price.commitmentMonths')} כדי להפסיק, ${write}, ו${stopWords}.`
      : months === 0
        ? `אין התחייבות. כדי להפסיק, ${write}, ו${stopWords}.`
        : `ההתחייבות היא ל-${months} חודשים. אחרי זה, כדי להפסיק, ${write}, ו${stopWords}.`;
  }
  const figure = cfg.get(monthly) == null ? cfg.ph(monthly) : esc(cfg.get(monthly).toLocaleString('he-IL'));
  return `
<section class="sec price-sec" id="${id}" aria-labelledby="${id}-h">
<div class="wrap">
<div class="sec-head"><h2 id="${id}-h">כמה זה עולה</h2><p>${vatLine} ${setupLine}</p></div>
<div>
<p class="figure"><span class="num">${figure}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
${terms ? `<p class="terms-line">${terms}</p>` : ''}
</div>
</div>
</section>`;
}
