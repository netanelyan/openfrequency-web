# Teder slides

The cover (first slide) of one slideshow Teder rendered in each subject, written here by `node scripts/showcase.mjs` from the handover in
private/showcase/<pack>/<post>/ (2026-10-23). Each is drawn in one of Teder's four slide styles, so the page shows all four:

- ai-tips: @sheela.tova, ours, style A (editorial card)
- football: @kav.emtza, ours, style B (poster)
- money: @shekel.leshekel, ours, style C (split, light)
- demo: @demo.atzitz, a made-up account that shows what Teder does (openfrequency-teder, examples/packs/demo), style D (native dark)

Each pack has `ig-01.jpg` (Instagram, 640x800) and `tt-01.jpg` (TikTok, 540x960). `showcase.json` holds each
subject, account, topic, the cover's text (the alt text) and who took the cover photo, when there is one.

The covers are drawn by Teder's renderer in each style; their lines were written for the site. Each cover photo is
from Pexels under the Pexels License (a cover may also use Unsplash, or a free Wikimedia Commons licence: public
domain, CC0, CC BY, CC BY-SA), which the script checks before it writes anything; the page credits the photographer,
and names a Commons licence beside it.
