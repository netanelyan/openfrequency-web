# Before the site goes live

- [ ] **Fill `site.config.json`.** `npm run build` lists what's missing: the domain, our WhatsApp number (not the demo
      number), how long a demo takes, the two "מי אנחנו" sentences, and the price facts.
- [ ] **WhatsApp, for the lead messages.** In Twilio, register the business number as a WhatsApp sender and get the
      lead template approved (README, "Leads"). Put the account, the two numbers and the template's HX... id in
      `/etc/openfrequency-web/lead.env` on the VPS. Until then leads are saved, not sent (`node server/lead.mjs list` shows them).
- [ ] **Pick the Caddy.** Teder uses the host's Caddy; Toran's `docker-compose.yml` starts its own on 80 and 443. On
      one VPS only one of them can have those ports. `deploy/Caddyfile.example` is written for the host's.
- [x] **The business, for Grow's payment check (through Morning).** Fill `business` in `site.config.json`: the legal
      name, the ע.מ, the phone, the email, the street and city, and how long we take to reply (`replyTime`, said on
      /contact). They show in every page's footer, on /contact and in the legal pages; `npm run build` lists the empty ones.
- [x] **The setup fee when a store cancels.** Write the policy, one sentence, in `price.setupRefund`. The terms show it
      under "ביטול" as written; nothing else on the site says it.
- [x] **Review the legal pages.** /terms (תקנון ותנאי שימוש), /privacy, /security and /accessibility, then set
      `legal.draft` to `false` to take the "טיוטה לבדיקה" label off them, and set `legal.updated` to that day.
- [x] **Step 6, the legal pages:** terms, privacy, security and accessibility, labelled "טיוטה לבדיקה" while
      `legal.draft` is true, and /contact with the business's details; the footer links to all of them.
- [ ] **Step 6, still to build:** the 404 page, the share image, sitemap.xml (with /contact, /terms and /privacy in it)
      and robots.txt (with /s/ disallowed).
- [ ] **First deploy:** the one-time steps at the top of `deploy/deploy.sh`, then
      `DEPLOY_HOST=user@vps ./deploy/deploy.sh`.
- [ ] **As Toran ships:** move lines from `toran.notYet` to `toran.today` in `site.config.json`.
