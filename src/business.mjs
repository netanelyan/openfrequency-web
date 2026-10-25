// Who we are, as a business: the legal name, ע.מ, phone, email and address from site.config.json (business). Grow's
// payment check (through Morning) looks for them on the site, so the footer of every page carries them, and /contact
// and the legal pages say them in full. Each is a [placeholder] in a draft and a build error for real.
import { esc } from './lib.mjs';

export const mail = (cfg) => {
  const v = cfg.get('business.email');
  return v == null ? cfg.ph('business.email') : `<a href="mailto:${esc(v)}" dir="ltr">${esc(v)}</a>`;
};

export const phone = (cfg) => {
  const v = cfg.get('business.phone');
  return v == null ? cfg.ph('business.phone') : `<a href="tel:${esc(String(v).replace(/[^\d+]/g, ''))}" dir="ltr">${esc(v)}</a>`;
};

export const address = (cfg) => `${cfg.t('business.address.street')}, ${cfg.t('business.address.city')}`;

// In a sentence: OpenFrequency, the business behind it, its number and where it is.
export const who = (cfg) =>
  `OpenFrequency, עסק של <bdi>${cfg.t('business.legalName')}</bdi>, עוסק מורשה מספר ${cfg.t('business.businessId')}, ${address(cfg)}`;

// The details one after another, for the footer and /contact: [key, label, html].
export const details = (cfg) => [
  ['business.legalName', 'שם העסק', `<bdi>${cfg.t('business.legalName')}</bdi>`],
  ['business.businessId', 'ע.מ', cfg.t('business.businessId')],
  ['business.phone', 'טלפון', phone(cfg)],
  ['business.email', 'מייל', mail(cfg)],
  ['business.address.street', 'כתובת', address(cfg)],
];
