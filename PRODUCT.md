# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Owners of small Israeli online stores, mostly on Shopify, who answer their own customers on WhatsApp and lose
sales when they can't answer at night, on Shabbat, or while busy. They reach this site from a pitch page, a
WhatsApp message or a search, usually on a phone, and decide whether to send us their store's address for a demo.
A second, smaller audience: stores curious about Teder, who can join its waitlist.

## Product Purpose

The public website of OpenFrequency, the company behind two products. Toran (תורן, "the one on duty") is a
WhatsApp agent that answers a store's customers from what is written on the store's own site, and passes what it
doesn't know to the owner on WhatsApp. Teder (תדר, "frequency") writes and designs Hebrew slideshows for TikTok and
Instagram. Success on this site: a store owner sends their store's address for a demo (or joins Teder's waitlist).

## Positioning

Toran answers only from the store's own site and hands off what it doesn't know instead of guessing. In Toran's
eval (150 questions, 5 real Shopify stores) it showed no invented price and passed on all 40 questions the sites
couldn't answer. We read the conversations with each store for its first two weeks.

## Operating Context

The owner tests a demo page like a customer, on our demo WhatsApp number, then connects the store's number through
Meta's WhatsApp Business Platform. Customers write at any hour; the owner answers Toran's handoffs on their own
phone. Meta charges for messages the business starts; replies within 24 hours of a customer's message are free.

## Capabilities and Constraints

- Works today (site.config.json `toran.today`): reads a Shopify store (products, prices, sales, sizes, colours,
  stock, policies); answers in Hebrew and English; says it is checking instead of guessing; a demo page per store.
- Not yet (`toran.notYet`): connecting the store's own number through Meta; passing questions to the owner and
  saving answers; the owner chatting with Toran; the automated messages (cart, paid, shipped, review); order
  lookups; WooCommerce and Wix.
- Teder runs on three of OpenFrequency's own accounts; it opens to stores once there are results to show.
- Stack: static HTML/CSS built by build.mjs, no client framework, one small form script; served by Caddy; a lead
  endpoint in Node with SQLite. Hebrew, right to left, phone first.
- Undecided, held in site.config.json and never guessed: the domain, our WhatsApp number, how long a demo takes,
  the "about us" sentences, every price fact.

## Brand Commitments

- The look is the family of Teder's owner site, pinned by the owner's brief and confirmed on 2026-10-22: a silver
  wallpaper with no hue, frosted glass panes with a lit edge, the system typeface with Heebo behind it, ink
  #1d1d1f / #424245 / #56565b, pill buttons, one action blue #0071E3, light and dark with Teder's tokens.
- The marks are the brand files in assets/brand, never redrawn: OpenFrequency's halftone on #2747D6 (the 5x5
  version at 48px and below), Toran's three dots on #0F7A54, Teder's wave on #6A3FD6.
- Voice: the hebrew-voice skill. OpenFrequency speaks as "we"; FAQ questions in the customer's own words; the sample
  agent speaks as the store. No grids of identical feature cards, no colons in headings, no "לא X" punch lines, no
  "בלי X ובלי Y", no reassurance filler, no free trial anywhere.
- Imagery: credited archival photographs of the world around the product are allowed (confirmed 2026-10-22), never
  shown as our customers, stores or team.

## Evidence on Hand

- Toran's eval results (openfrequency-toran, docs/milestones.md, milestone 3): 150 questions, 5 stores, 0 invented
  prices shown, 40 of 40 unknowns escalated. The agent's real handoff line: "את זה אני לא יודע. אני בודק עם
  החנות, ואחזור אליך כאן."
- No customers, testimonials, logos, press or usage numbers exist. None may be invented. Sample chats and the sample
  day are made up and labelled as examples.

## Product Principles

- Never state a fact we don't have; an empty fact stops the build.
- Say what doesn't work yet, next to what does.
- Show the agent at work rather than describing it.
- One action per screen: send us the store's address.
