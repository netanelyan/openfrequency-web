# Open before or soon after launch

What is left of the pre-launch audit of 2026-11-11 that needs the owner or the server. Everything else is done:
the config is filled, the site is deployed on the VPS behind the host's Caddy, and the leads reach the owner by email.

- [ ] **The business on the legal pages.** The name in Hebrew as the VAT office has it, and the street address in
      Ashdod, for "מי אנחנו" on the terms, the contracts and the privacy page (they say "עוסק מורשה" and the number,
      the name in English and the city). Then `legal` in `site.config.json` gets them, and `who` in
      `src/pages/legal.mjs` says them.
- [ ] **The accessibility coordinator.** A phone number that answers calls, and the name in Hebrew, for
      `/accessibility` ("משהו לא עובד?"). The site's WhatsApp number is on the WhatsApp Business Platform, so it is
      not given as a phone.
- [ ] **Caddy:** a cache header for `/teder/showcase/*`, `/clients/*` and `/og/*` (they are sent with `no-cache`,
      unlike the fonts), in the live Caddyfile and in `deploy/Caddyfile.example`.
- [ ] **docs/screenshots** are from before the redesign: `npm run shots` once the site settles.
- [ ] **As Toran ships:** move lines from `toran.notYet` to `toran.today` in `site.config.json` (they feed our own
      support, `support.json`).
