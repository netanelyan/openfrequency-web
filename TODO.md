# Open before or soon after launch

What is left of the pre-launch audit of 2026-11-11 that needs the owner or the server. Everything else is done:
the config is filled, the site is deployed on the VPS behind the host's Caddy, and the leads reach the owner by email.

- [x] **The business on the legal pages.** Done 2026-11-12 with the owner's answer: the name in Hebrew and the street
      in Ashdod (`legal.name`, `legal.address`). The owner gave no house number; add it to `legal.address` if they do.
- [ ] **The accessibility coordinator.** The name is in since 2026-11-12, with the address. A phone number that answers
      calls is still missing from `/accessibility` ("משהו לא עובד?"). The site's WhatsApp number is on the WhatsApp
      Business Platform, so it is not given as a phone.
- [ ] **Caddy:** a cache header for `/teder/showcase/*`, `/clients/*` and `/og/*` (they are sent with `no-cache`,
      unlike the fonts), in the live Caddyfile and in `deploy/Caddyfile.example`.
- [ ] **docs/screenshots** are from before the redesign: `npm run shots` once the site settles.
- [ ] **As Toran ships:** move lines from `toran.notYet` to `toran.today` in `site.config.json` (they feed our own
      support, `support.json`).
