// The home page: OpenFrequency and its two products. The first screen says what we make, with our mark large and
// faint behind it, and opens a door to each product in its own material: Toran's chat answering on glass, Teder's
// real slides playing on its violet. Then Toran answers questions about us, and who we are. Each product has its own
// page (/toran, /teder), and the questions have theirs (/faq).
import { mark, glyphOnly } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { askBox } from '../sections.mjs';
import { priceLine } from './join.mjs';
import { reel } from '../teder.mjs';
import { clients } from '../clients.mjs';

// Toran's door: the sample chat on the customer's phone. The first question it answers from the site; the second
// isn't there, so it tells the customer it's checking, and the question pops up on the owner's phone.
const DOOR_CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח לוקח 3 עד 5 ימי עסקים.'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

const hero = `
<section class="co-hero" aria-labelledby="hero-h">
<div class="co-bg" aria-hidden="true">${glyphOnly('openfrequency')}</div>
<div class="wrap">
<h1 id="hero-h">פלטפורמות יצירת התוכן ושירות הלקוחות <span class="hl">המובילות בארץ</span></h1>
<p class="lede">תדר כותב ומעצב לכם מצגות בעברית לטיקטוק ולאינסטגרם. תורן עונה ללקוחות שלכם בוואטסאפ 24/7, מתוך מה שכתוב באתר.</p>
<div class="doors">
<article class="door toran-door glass" aria-labelledby="door-toran">
<div class="door-top">${mark('toran', 48)}<div><h2 id="door-toran">תורן</h2><p>עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר. מה שלא כתוב שם, הוא שואל אתכם.</p></div></div>
<div class="door-act"><a class="btn primary" href="/toran#demo">לנסות את תורן על החנות שלכם</a><a class="btn" href="/toran">עוד על תורן</a></div>
<div class="phone-sit" data-play>
<div class="phone">${chat({ id: 'door-chat', who: 'החנות שלכם', face: 'ח', msgs: DOOR_CHAT, names: { me: 'לקוח', them: 'החנות' } })}</div>
<p class="pop" data-pop>${mark('toran', 28)}<span class="pop-h"><b>תורן</b><small>בטלפון שלכם, 02:16</small></span><span class="pop-t">לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?</span></p>
</div>
</article>
<article class="door teder-door" aria-labelledby="door-teder">
<div class="door-top"><span class="wave" aria-hidden="true">${glyphOnly('teder')}</span><div><h2 id="door-teder">תדר</h2><p>כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם. כל מצגת יוצאת רק אחרי שמישהו אישר אותה.</p></div></div>
<div class="door-act"><a class="btn light" href="/teder#demo">לנסות את תדר על החנות שלכם</a><a class="btn on-color" href="/teder">עוד על תדר</a></div>
${reel}
</article>
</div>
</div>
</section>`;

const ask = (cfg) => `
<section class="sec ask-sec" id="ask" aria-labelledby="ask-h">
<div class="wrap">
<div class="try-text">
<h2 id="ask-h">תשאלו את תורן עלינו</h2>
<p class="lede">כאן תורן עונה בשביל OpenFrequency, מתוך מה שכתוב באתר הזה. בחנות שלכם הוא יענה ככה מתוך האתר שלכם.</p>
<p>תורן לא ממציא תשובות. כל מה שהוא עונה כתוב באתר, ומה שלא כתוב שם, הוא שואל אתכם.</p>
<p class="ask-note">זו הדגמה בדפדפן, עם תשובות שכתבנו מראש מתוך האתר הזה.</p>
</div>
${askBox}
${cfg.has('price.monthly') && cfg.has('teder.monthly') ? `<template id="ask-price">תורן עולה ${priceLine(cfg, 'price.monthly', 'price.setup')} תדר עולה ${priceLine(cfg, 'teder.monthly', 'teder.setup')}</template>` : ''}
</div>
</section>`;

const about = (cfg) => `
<section class="sec about-sec" id="about" aria-labelledby="about-h">
<div class="wrap narrow">
<h2 id="about-h">מי אנחנו</h2>
<p class="lede">${cfg.t('about.who')} ${cfg.t('about.why')}</p>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  dock: true,
  title: 'OpenFrequency, תורן ותדר',
  description: 'תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם. תורן עונה ללקוחות של החנות בוואטסאפ 24/7, מתוך מה שכתוב באתר.',
  // "Who we are" waits for its two sentences in the public draft.
  body: [hero, clients(), ask(cfg), cfg.has('about.who') || cfg.banner ? about(cfg) : ''].join('\n'),
});
