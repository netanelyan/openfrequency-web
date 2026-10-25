# Before the site goes live

- [ ] **Fill `site.config.json`.** `npm run build` lists what's missing: the domain, our WhatsApp number (not the demo
      number), how long a demo takes, the two "מי אנחנו" sentences, and the price facts.
- [ ] **WhatsApp, for the lead messages.** In Twilio, register the business number as a WhatsApp sender and get the
      lead template approved (README, "Leads"). Put the account, the two numbers and the template's HX... id in
      `/etc/openfrequency-web/lead.env` on the VPS. Until then leads are saved, not sent (`node server/lead.mjs list` shows them).
- [ ] **Pick the Caddy.** Teder uses the host's Caddy; Toran's `docker-compose.yml` starts its own on 80 and 443. On
      one VPS only one of them can have those ports. `deploy/Caddyfile.example` is written for the host's.
- [ ] **For privacy and terms:** the legal name, the business number (ח.פ or ע.מ), a contact email, and how long
      leads are kept.
- [ ] **First deploy:** the one-time steps at the top of `deploy/deploy.sh`, then
      `DEPLOY_HOST=user@vps ./deploy/deploy.sh`.
- [ ] **As Toran ships:** move lines from `toran.notYet` to `toran.today` in `site.config.json`.
