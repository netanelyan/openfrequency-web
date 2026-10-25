// /contact: every way to reach us and the business's details, in the serious register. Grow's payment check (through
// Morning) looks for the phone and the address here. Each fact comes from site.config.json (src/business.mjs).
import { waWords } from '../sections.mjs';
import { mail, phone, address } from '../business.mjs';

export default (cfg) => {
  const rows = [
    ['העסק רשום על שם', `<bdi>${cfg.t('business.legalName')}</bdi>`],
    ['עוסק מורשה (ע.מ)', cfg.t('business.businessId')],
    ['טלפון', phone(cfg)],
    ['מייל', mail(cfg)],
    ...(cfg.get('whatsapp') ? [['וואטסאפ', waWords(cfg, 'לכתוב לנו בוואטסאפ')]] : []),
    ['כתובת', address(cfg)],
  ];
  return {
    path: '/contact',
    title: 'יצירת קשר | OpenFrequency',
    description: 'איך מגיעים אל OpenFrequency: טלפון, מייל, וואטסאפ וכתובת, ומספר העוסק.',
    body: `
<section class="sec legal" aria-labelledby="contact-h">
<div class="wrap narrow">
<h1 id="contact-h">יצירת קשר</h1>
<p class="lede">אפשר להתקשר, לכתוב במייל או בוואטסאפ. אנחנו עונים תוך ${cfg.t('business.replyTime')}.</p>
<dl class="contact-list">
${rows.map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`).join('\n')}
</dl>
<section class="legal-part" aria-labelledby="contact-more">
<h2 id="contact-more">עוד באתר</h2>
<p>דמו לחנות שלכם מבקשים <a href="/join">בעמוד ההצטרפות</a>. המחירים, התשלום והביטול כתובים <a href="/terms">בתקנון</a>, ומה קורה למידע שלכם כתוב <a href="/privacy">במדיניות הפרטיות</a>.</p>
</section>
</div>
</section>`,
  };
};
