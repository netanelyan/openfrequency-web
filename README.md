# openfrequency-web

OpenFrequency's public website: the company behind Toran (תורן), a WhatsApp sales agent for Israeli online stores,
and Teder (תדר), a Hebrew TikTok and Instagram slideshow engine. This is the marketing site only; it does not talk to
Toran or Teder.

Static pages, built by one Node script with no dependencies, served by Caddy. The look is Teder's (silver wallpaper,
frosted glass, the system typeface with Heebo behind it); the marks are the brand files in `assets/brand`.

## Build

```sh
npm install          # only playwright-core, for screenshots
npm run build        # dist/; stops while any fact in site.config.json is empty, or the copy lint fails
npm run draft        # the same, with each missing fact shown as a visible [placeholder]
npm run serve        # dist/ on http://127.0.0.1:4730
npm run shots        # docs/screenshots: every page at 390px and 1440px, light and dark (add --menu for the phone menu)
```

## Leads

The demo form and the Teder waitlist post to `server/lead.mjs`, a small Node server with no dependencies
(`node:sqlite`), behind Caddy at `/api/lead`. Each lead (the store's host name, a WhatsApp number or an email, the
form, the page, the time) is saved to SQLite first, then sent to Telegram; unsent ones are retried every 5 minutes.
One address gets 5 leads an hour, everyone together 200 a day, and a hidden honeypot field catches form-filling
scripts. A post from another origin is refused. IP addresses are used for the limit in memory only.

With JS the form sends itself and shows the thank-you in place; if the endpoint doesn't answer in 8 seconds, it offers
a WhatsApp link with the store's address already typed. Without JS the form posts normally and lands on `/thanks`,
`/thanks/teder` or `/try-again` (which Caddy also serves when the endpoint is down).

```sh
npm test                                        # the endpoint: saving, Telegram, limits, honeypot, origin, Telegram down
npm run draft && node scripts/form-shots.mjs    # the forms in Chrome against the real endpoint, every state
node server/lead.mjs list 50                    # the last 50 leads, on the server
```

Telegram: create a bot with @BotFather (its token is `TELEGRAM_BOT_TOKEN`), send it any message, then open
`https://api.telegram.org/bot<token>/getUpdates` and take `message.chat.id` (`TELEGRAM_CHAT_ID`). Both go in the
server's env file, never in this repo.

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

## Copy

All Hebrew follows the hebrew-voice skill. OpenFrequency speaks as "we"; FAQ questions are in the customer's own
words; the sample chat agent speaks as the store. The build lints every page for what slips back in on later edits:
em and en dashes, a colon in a heading, `!!`, gendered slashes, bureaucratic phrases, a free trial.

## Layout

| Path | What |
| --- | --- |
| `build.mjs` | renders `src/pages` into `dist/`, inlines the CSS, checks the facts and the copy |
| `src/layout.mjs` | the head, the sticky glass header, the dark closing band, the footer |
| `src/style.css` | Teder's tokens (light, dark, Increase Contrast, Reduce Transparency) and the site's components |
| `src/pages/` | one module per page |
| `assets/brand/` | the marks, copied from openfrequency-toran; never redrawn |
| `assets/fonts/` | Heebo (OFL), self-hosted, so no visitor's address goes to Google |
| `assets/photos/` | three archival photographs and a map from Wikimedia Commons, resized; `credits.json` holds each one's source and licence, printed in the footer |
| `src/site.js` | the motion, the duty log's clock and the question box |
| `src/forms.mjs`, `src/form.js` | the two forms, every word they can show, and the script that sends them |
| `server/lead.mjs` | the lead endpoint |
| `deploy/` | the Caddyfile, the endpoint's systemd service and env file, and the deploy script |
| `scripts/` | the local server (it proxies `/api` like Caddy), the screenshots, the form check |
