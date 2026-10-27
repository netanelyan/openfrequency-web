# openfrequency-web

OpenFrequency's public website: the company behind Toran (תורן), a WhatsApp sales agent for Israeli online stores,
and Teder (תדר), a Hebrew TikTok and Instagram slideshow engine. This is the marketing site only; it does not talk to
Toran or Teder.

Static pages, built by one Node script with no dependencies, served by Caddy. The look is Teder's (silver wallpaper,
frosted glass, the system typeface with Heebo behind it); the marks are the brand files in `assets/brand`.

## Toran: live or soon

The first entry in `site.config.json` is the one switch for whether Toran is on sale:

```json
"products": { "toran": "soon" }
```

- `"soon"` (now, until Meta approves WhatsApp): Toran stays on show, marked "בקרוב", and nobody can buy it, start it or
  ask for its demo. Teder comes first and is offered exactly as before. Every page reads the switch: the home page (Toran's
  door with the badge and a link to the waitlist, its lines in the future, the question box's answers about Toran),
  `/toran` (a "בקרוב" bar on top, what it will do, no price, and the waitlist form where the demo form was), `/join`
  (Toran's card shown and not tickable, Teder's steps, price and questions), `/faq` (Teder first, Toran's answers in
  the future, its demo questions out), the menus and footer, the meta and Open Graph lines, `/toran/example` (no price,
  no buttons), the privacy page (a line on what the waitlist keeps), and `npm run support` (Toran opens soon, Teder is
  available, no Toran plans).
- `"live"`: the site as it was before the switch, word for word (`test/site.test.mjs` builds both and checks).

The waitlist form takes a phone or an email and posts to the lead endpoint as `source: "waitlist"`; the owner gets it as
"ליד חדש, רשימת המתנה לתורן", it is handed to no product, and a second sign-up from the same phone or email is thanked
and not saved again. Without JS it lands on `/thanks/waitlist`, which is built only while Toran is soon. The endpoint
itself doesn't read the switch (only `server/lead.mjs` is deployed to the server, not the config): it keeps accepting a
Toran demo post, though no page sends one while Toran is soon.


**The assistant on WhatsApp** has its own switch, `"assistant"` in the same object. It waits for our WhatsApp number to be
connected at Meta, not for Toran's sale. `"soon"` (now): the home page shows Teder's approvals on Teder's own screen (one
click, all at once, a rejection that comes back rewritten, TikTok's drafts), with approving on WhatsApp as one line marked
"בקרוב". `"live"`: the section about approving Teder's slideshows on WhatsApp comes back as it was.

## Sign-up: open or closed

Teder is sold self-serve: a business signs up on openfrequency-accounts, pays there, and sets Teder up itself. The
switch for whether the site sends people there is `signup` in `site.config.json`:

```json
"signup": "closed"
```

- `"closed"` (now, until accounts takes payments and its `OF_SIGNUP=1`): nothing links to sign-up. Teder's ways in are
  the free sample slideshow (the forms on `/teder` and `/join`), which the owner sends by hand, and the terms are as they
  were, with their date `legal.updated`.
- `"open"`: Teder's main buttons, "להצטרף לתדר", go to `https://accounts.openfrequency.co.il/signup?p=teder` (`p` is a
  hint; accounts ignores what it doesn't read) with the price under them: the first screen of `/teder`, its price card,
  Teder's door on the home page, and the top of `/join`. The sample stays as the second way, "רוצים קודם לראות מצגת
  מהחנות שלכם?", down to the same forms, whose buttons then say "לקבל מצגת לדוגמה". `/join` shows sign-up's steps (sign
  up and pay, pick sources, look over the samples, go live); the menu's "הצטרפות" still leads to `/join`, which holds
  both ways. The copy says what a business that set Teder up on its own does (it picks the sources, connects its
  accounts, and cancels in the account), the FAQ adds how to cancel, the support export gives the sign-up address, and
  `/terms` carries the Teder subscription section ("המנוי לתדר": paying, the setup fee, cancelling and deleting online)
  with its own date, `legal.signupUpdated`. That date is the terms version accounts stores on each sign-up
  (`TERMS_VERSION` in openfrequency-accounts `src/accounts/signup.js`), so the two change together. With Toran live,
  `/join` keeps its form first and adds Teder's sign-up after it.

`test/signup.test.mjs` builds both ways and checks them.

## Build

```sh
npm install          # only playwright-core, for screenshots
npm run build        # dist/; stops while any fact in site.config.json is empty, or the copy lint fails
npm run draft        # the same, with each missing fact shown as a visible [placeholder]
npm run serve        # dist/ on http://127.0.0.1:4730
npm run shots        # docs/screenshots: every page at 390px and 1440px, light and dark (add --menu for the phone menu)
npm run og           # assets/og: the share images a sent link shows (OpenFrequency, Toran, Teder), 1200x630
```

## Leads

The demo forms post to `server/lead.mjs`, a small Node server with no dependencies (`node:sqlite`), behind Caddy at
`/api/lead`. Each lead (the store's host name, the form, the page, the time, and a WhatsApp number for Teder, a
code for Toran, or a phone or an email for Toran's waitlist) is saved to SQLite first, then sent to the owner, from the business number to their own WhatsApp
(through Twilio), to their email (through Resend: `RESEND_API_KEY`, `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO`), or both, and
handed to Toran or Teder; what fails is retried every 5 minutes, and a lead more than 2 days old is not
sent any more, so turning the sender on never sends a backlog. One address gets 5 leads an hour, everyone together 200 a day, and a hidden honeypot field catches
form-filling scripts. A post from another origin is refused. IP addresses are used for the limit in memory only.

Toran's demo form takes the store's address only. It answers with a code (`REQ-XXXXXX`) and a button that opens
WhatsApp to Toran's demo number (`TORAN_DEMO_WA`) with a message holding the code; Toran counts the demo when that
message arrives, from the number that sent it, one per number (openfrequency-toran, `docs/operator.md`, section 3).

With JS the form sends itself and shows the thank-you in place; if the endpoint doesn't answer in 8 seconds, it offers
a WhatsApp link with the store's address already typed. Without JS the form posts normally: a Toran demo goes straight
to WhatsApp with its message, a Teder one lands on `/thanks/teder`, and a failure on `/try-again` (which Caddy also
serves when the endpoint is down).

```sh
npm test                                        # the endpoint (saving, WhatsApp, limits, honeypot, origin, Twilio down,
                                                # the waitlist), and the site built with Toran soon and live,
                                                # and with sign-up closed and open
npm run draft && node scripts/form-shots.mjs    # the demo forms in Chrome against the real endpoint (Toran live only)
node server/lead.mjs list 50                    # the last 50 leads, on the server
```

WhatsApp: in Twilio, register the business number as a WhatsApp sender (Messaging > Senders > WhatsApp senders), and
put the account's `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`, the business number (`LEAD_WA_FROM`) and the owner's
own (`LEAD_WA_TO`) in the server's env file, never in this repo. The business number writes first, so WhatsApp only
delivers a template it approved: make one in Content Template Builder, category Utility, body
`ליד חדש מהאתר: {{1}}. הפרטים המלאים בשרת.`, and set its HX... id as `LEAD_WA_CONTENT_SID`. Until it is approved the
message goes as plain text, which arrives only within 24 hours of the owner's last message to the business number.

## Deploy

On the VPS the pages are static files served by the host's Caddy, and the lead endpoint is one small systemd
service. `deploy/` has the Caddyfile, the service, its env file, and the script:

```sh
DEPLOY_HOST=user@vps ./deploy/deploy.sh
```

It runs the real build and the tests, uploads the pages as a new release and switches to it in one step (the last 5
are kept, so rolling back is one `ln -sfn`), updates the endpoint only if it changed, and checks the live site over
HTTPS. The one-time setup is at the top of the script. Each page carries its own Content-Security-Policy with the
hashes of its inline script and style; Caddy adds the headers a page can't set.

What's left before launch is in `TODO.md`.

## Facts

Every price, number and time the site states lives in `site.config.json`, never in a template. An empty value
(`""` or `null`) means "not decided yet": the real build refuses to run and lists each one, so the site can't ship
with a guess. Each key has a Hebrew label in `FACTS` (`src/lib.mjs`), which is what a draft shows in its place.

Where Toran answers is `toran.channels`. With `toran.channelsFrom` set to `"config"` that list is final: every channel
in it is shown as live on every page, and the build doesn't ask Toran. With `"toran"` the build takes the list from
Toran's own `/channels.json` (its /settings page), shows the rest as "בקרוב", and falls back to `toran.channels` when
Toran doesn't answer.

## Copy

All Hebrew follows the hebrew-voice skill. OpenFrequency speaks as "we"; FAQ questions are in the customer's own
words; the sample chat agent speaks as the store. The build lints every page for what slips back in on later edits:
em and en dashes, a colon in a heading, `!!`, gendered slashes, bureaucratic phrases, a free trial.

## Layout

| Path | What |
| --- | --- |
| `build.mjs` | renders `src/pages` into `dist/`, inlines the CSS, checks the facts and the copy |
| `src/layout.mjs` | the head, the sticky glass header, the footer |
| `src/style.css` | Teder's tokens (light, dark, Increase Contrast, Reduce Transparency) and the site's components |
| `src/pages/` | one module per page: home, `/toran`, `/teder`, `/faq`, and where a form lands without JS |
| `src/teder.mjs` | Teder's real slides (a cover per subject) and its phone, shared by the home page and `/teder` |
| `scripts/showcase.mjs` | Brings the cover of each of Teder's slideshows from `private/showcase` into `assets/teder/showcase`, checking each photo's licence |
| `assets/brand/` | the marks, copied from openfrequency-toran; never redrawn |
| `assets/fonts/` | Heebo (OFL), self-hosted, so no visitor's address goes to Google |
| `src/site.js` | the motion, and the question box (Toran answering about OpenFrequency) |
| `src/forms.mjs`, `src/form.js` | the two forms, every word they can show, and the script that sends them |
| `server/lead.mjs` | the lead endpoint |
| `deploy/` | the Caddyfile, the endpoint's systemd service and env file, and the deploy script |
| `scripts/` | the local server (it proxies `/api` like Caddy), the screenshots, the form check |
