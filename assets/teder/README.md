# Teder slides

The cover (first slide) of one slideshow Teder rendered in each subject, written here by `node scripts/showcase.mjs` from the handover in
private/showcase/<pack>/<post>/ (2026-10-23). Each is drawn in one of Teder's four slide styles, so the page shows all four:

- ai-tips: @sheela.tova, ours, style A (editorial card)
- football: @kav.emtza, ours, style B (poster)
- money: @shekel.leshekel, ours, style C (split, light)
- demo: @demo.atzitz, a made-up account that shows what Teder does (openfrequency-teder, examples/packs/demo), style D (native dark)

Each pack has `ig-01.jpg` (Instagram, 640x800) and `tt-01.jpg` (TikTok, 540x960). `showcase.json` holds each
subject, account, topic, the cover's text (the alt text) and who took the cover photo, when there is one.

The slides are our own output, written by Teder's pipeline for their style (dry, nothing published). A cover photo, when
a slideshow has one, is from Pexels or Unsplash under their licences, or from Wikimedia Commons under a free licence
(public domain, CC0, CC BY, CC BY-SA), which the script checks before it writes anything; the page credits the
photographer, and names a Commons licence beside it. These four have no cover photo: the writer asked for none, or the
check refused the one found, so each stands on its style's own ground.
