# Toran's example pitch page

`index.html` is served at /toran/example. It is the pitch page a store gets from Toran, rendered by
openfrequency-toran for its made-up store, kli-cheres.example ("כלי חרס של נורית"), on 2026-10-23:

- The store went through Toran's real pipeline (discovery, ingest, the page), and the sample chat was answered by
  the real agent through the Claude Code CLI, not the scripted stand-in, so the page's line "התשובות הן מה שתורן
  ענה באמת" holds.
- Then, for this site: a strip on top says it is an example for a store that doesn't exist; the green WhatsApp
  buttons lead to /toran#demo (there is no demo WhatsApp number yet); the price sentence and the "לכתוב לנו"
  button are out (no price and no OpenFrequency number are set yet), and so is the line offering to take the page down; the styles are inlined, the fonts and icons
  are this site's, the product pictures are the ones Toran draws for the made-up store (demo/), and the script keeps only
  the docked button (no tracking).

It is not indexed (the page's own robots meta) and not linked from the menu. To redo it after Toran's page
changes, render the store again and repeat the same edits.
