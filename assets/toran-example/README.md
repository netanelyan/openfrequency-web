# Toran's example pitch page

`index.html` is served at /toran/example. It is the pitch page a store gets from Toran, for Toran's made-up store,
kli-cheres.example ("כלי חרס של נורית"):

- The store went through Toran's real pipeline on 2026-10-23 (discovery, ingest, the page), and the sample chat was
  answered by the real agent through the Claude Code CLI, not the scripted stand-in, so the page's line "התשובות הן מה
  שתורן ענה באמת" holds.
- On 2026-11-12 the page was drawn again from Toran's current page (openfrequency-toran `src/pitch/page.ts`, the one
  every store gets today: both plans, the platforms it reads, and "מגיעה אליכם במייל ובתיבה של תורן" where the old one
  promised a WhatsApp alert that Toran does not send) with the same store, products and answers, word for word:
  `node scripts/toran-example.mjs` (Toran's checkout beside this one, Node 24; nothing is fetched and no model is
  called).
- Then, for this site, the script makes the same edits as the first time: a short strip on top says it is an example
  for a made-up store; the green WhatsApp buttons lead to /toran#demo (a made-up store has no demo number); the line
  offering to take the page down is out; the styles are inlined (the family's tokens, the page, the store's colour, the
  accessibility panel), the fonts and icons are this site's, the product pictures are the ones Toran draws for the
  made-up store (demo/), and the script keeps the docked button, the strip's pause button and nothing else (no
  tracking). The link in the store's bubble is at full white, 4.5:1 on the store's colour.
- The plans' prices and conversations and the line under them are marked (data-cfg, data-cfg-conv, data-cfg-notes),
  and the build writes them from site.config.json, so the example shows the site's prices.
- The page is light only, as every page of the site is whatever the device prefers.

It is not indexed (the page's own robots meta) and not linked from the menu. To redo it after Toran's page changes,
run the script again and look at the page: a new part of Toran's page may need an edit of its own here.
