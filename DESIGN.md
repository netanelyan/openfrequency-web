---
name: OpenFrequency
description: The public site for Toran and Teder, set in the Teder owner-site world. Hebrew, right to left, phone first.
colors:
  wallpaper-base: "#eeeff2"
  ink: "#1d1d1f"
  ink-secondary: "#424245"
  ink-quiet: "#56565b"
  ink-faint: "#6e6e73"
  action-blue: "#0071e3"
  action-blue-hover: "#0062cc"
  link-blue: "#0060c0"
  interface-blue: "#0066cc"
  on-action: "#ffffff"
  glass-surface: "rgba(255, 255, 255, 0.58)"
  glass-surface-hi: "rgba(255, 255, 255, 0.72)"
  glass-bar: "rgba(250, 250, 252, 0.78)"
  tile: "rgba(255, 255, 255, 0.55)"
  tile-hover: "rgba(255, 255, 255, 0.8)"
  fill: "rgba(118, 118, 128, 0.12)"
  fill-hover: "rgba(118, 118, 128, 0.2)"
  field: "rgba(255, 255, 255, 0.85)"
  field-stroke: "rgba(0, 0, 0, 0.16)"
  hairline: "rgba(0, 0, 0, 0.08)"
  sheet: "#fafafc"
  night: "#1d1d1f"
  night-ink: "#f5f5f7"
  night-ink-quiet: "#c7c7cc"
  toran-green: "#0f7a54"
  teder-violet: "#6a3fd6"
  openfrequency-blue: "#2747d6"
  ok-green: "#19702f"
  warn: "#a44200"
  warn-ground: "#fff4e5"
  bubble-sent: "#d9fdd3"
  bubble-received: "#ffffff"
  chat-ground: "#efeae2"
typography:
  figure:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Hebrew', system-ui, 'Segoe UI', 'Noto Sans Hebrew', Heebo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(88px, 15vw, 216px)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Hebrew', system-ui, 'Segoe UI', 'Noto Sans Hebrew', Heebo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(28px, 4.9vw, 72px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Hebrew', system-ui, 'Segoe UI', 'Noto Sans Hebrew', Heebo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(20px, 1.65vw, 24px)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Hebrew', system-ui, 'Segoe UI', 'Noto Sans Hebrew', Heebo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Hebrew', system-ui, 'Segoe UI', 'Noto Sans Hebrew', Heebo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  surface: "18px"
  inner: "12px"
  pill: "999px"
  mark: "24%"
spacing:
  gutter-phone: "16px"
  gutter: "32px"
  content-max: "1120px"
  content-narrow: "820px"
  header-clearance: "76px"
  section: "clamp(56px, 8vw, 116px)"
  section-head: "clamp(28px, 4vw, 56px)"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-hover}"
    textColor: "{colors.on-action}"
  button-pill:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "50px"
  button-pill-hover:
    backgroundColor: "{colors.fill-hover}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "12px 16px"
    height: "54px"
  header-capsule:
    backgroundColor: "{colors.glass-bar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "60px"
  tile:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
  row:
    backgroundColor: "{colors.tile}"
    rounded: "{rounded.inner}"
    padding: "12px 16px"
  faq-tile-open:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.surface}"
  footer-go-tile:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.surface}"
    padding: "22px"
  chat-bubble-sent:
    backgroundColor: "{colors.bubble-sent}"
    textColor: "{colors.ink}"
    rounded: "12px"
    padding: "7px 11px 19px"
  chat-bubble-received:
    backgroundColor: "{colors.bubble-received}"
    textColor: "{colors.ink}"
    rounded: "12px"
    padding: "7px 11px 19px"
  form-message:
    backgroundColor: "{colors.warn-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "12px 14px"
---

# Design System: OpenFrequency

## Overview

**Creative North Star: "The Product on Duty"**

The site lives inside the Teder owner-site world, pinned by the owner's brief: a silver wallpaper with no hue of its own, frosted glass with a lit edge, the system typeface with Heebo behind it, pill buttons, and one action blue. Inside that world the page is quiet so the product can be loud. The colour, the detail and the motion belong to working fragments of Toran (marked `data-ui`): a WhatsApp chat with its own bubbles, greens and times; a settings card that changes state; a chat window where Toran answers questions about OpenFrequency itself. Everything around those fragments is silver surfaces of the same tone, five type sizes and generous space.

Depth is rationed. Glass is reserved for what floats (the header capsule) and for the stages a product fragment stands on. Every other surface is a tile one tone step off the wallpaper, with no line and no shadow. The one dark surface in the light theme is the footer panel; the one colour field is Teder's violet. The home page is the company's: a door to each product in its own material, Toran's chat on glass and Teder's real slides on its violet. Behind the home page's headline our own mark stands large, half see-through, pushed toward the left edge. There are no photographs of our own; the only ones are the covers inside Teder's slides.

The page is Hebrew, right to left, phone first, and in light and dark from the same tokens. It honours Increase Contrast and Reduce Transparency by making the glass and tiles nearly solid, and Reduce Motion by showing everything in place.

**Key Characteristics:**
- Hue-less silver wallpaper (a fixed radial plus linear gradient over the wallpaper base)
- Glass only on the header and the product's stages, with a lit 1px rim
- Tiles one tone step off the wallpaper, without lines or shadows
- Five visible type sizes, system stack with Heebo
- One filled action blue per decision, and every other button a grey pill
- Product fragments carry their own interface conventions and sizes
- Credited black-and-white archival photographs

## Colors

A hue-less silver and ink system with one action blue, three brand-mark colours, and the product's own WhatsApp palette kept inside its fragments.

### Primary
- **Action Blue** (action-blue): the filled button of each decision, the open FAQ tile, the footer's go tile, the focus ring (60% mix) and the text caret. Hover goes one step darker (action-blue-hover) so white on it keeps 4.5:1.
- **Link Blue** (link-blue): inline links on the page. **Interface Blue** (interface-blue) is the link colour inside product fragments. In dark both become #2997ff.

### Secondary
- **Toran Green** (toran-green), **Teder Violet** (teder-violet) and **OpenFrequency Blue** (openfrequency-blue) are the brand marks' tile colours, taken from the files in assets/brand. Toran green also marks "answered alone" (dots, the 18% status pill). Teder violet is also the one colour field on the home page.

### Neutral
- **Wallpaper Base** (wallpaper-base): the page's base under the silver gradient (dark #111113). It is also the browser theme colour.
- **Ink** (ink): headings and body (dark #f5f5f7). **Ink Secondary** (ink-secondary): inactive nav, definitions. **Ink Quiet** (ink-quiet): the quiet text, which covers captions, table heads, footer labels and dimmed step text (5.7:1). **Ink Faint** (ink-faint): placeholders, message times, typing dots and neutral status dots only.
- **Tile** and **Fill**: translucent white tiles one step off the wallpaper; grey fills for pills and segmented controls. Their dark values are white at 6% and 10%, and grey at 24% and 32%.
- **Sheet** (sheet): the solid surface for the open phone menu, chat headers, UI cards and the menu sheet (dark #1e1e20).
- **Night** (night): the footer panel, with Night Ink and Night Ink Quiet on it (dark #000000).

### Product palette (inside data-ui only)
- **Sent Bubble**, **Received Bubble** and **Chat Ground** are WhatsApp's own colours (dark #144d37, #2c2c2e, #0b141a). They never leave a chat fragment.
- **OK Green** (ok-green) is for success lines. **Warn** on **Warn Ground** is for form errors, "fixed" status and the draft banner.

### Product names
Toran and Teder are Hebrew words, so in a sentence they are set as names, quietly (`.pn`): bold in running text, and in a heading a thin underline in the product's colour. The build does it (`markNames` in `src/lib.mjs`), so new copy needs nothing. A name standing alone, the nav, buttons, links and the product fragments are left as they are.

### Named Rules
**The No Hue Wallpaper Rule.** The wallpaper and every tile are hue-less silver. Colour arrives only with the product's fragments, the brand marks, the action blue and the one violet field.

**The One Blue Per Decision Rule.** Each decision gets one filled action-blue button. Every other button is a grey pill. The open FAQ tile and the footer's go tile are the only other blue fills.

**The Mark Colour Rule.** A mark's tile colour is the product's own and never the accent. The marks are the brand files and are never redrawn.

## Typography

**Display Font:** the system display stack (SF Pro Display, SF Hebrew, Segoe UI, Noto Sans Hebrew), with Heebo self-hosted as the Hebrew and Latin fallback
**Body Font:** the system text stack (SF Pro Text, SF Hebrew), with the same fallbacks
**Wordmark Font:** Space Mono 700, self-hosted (Latin only), for the name OpenFrequency where it is the logo: the header, the footer brand and the footer wordmark

**Character:** the owner's brief pins the platform's own typeface. Hierarchy therefore comes from size, weight 700 against 400, and tight negative tracking on the large sizes, not from a contrasting face.

### Hierarchy
- **Figure** (700, clamp 88–216px, 0.86, -0.035em, tabular): the price only.
- **Display** (700, clamp 28–72px, 1.04, -0.012em, balanced wrap): every h1 and h2 and the typed question line. The footer wordmark is the same size class in Space Mono.
- **Lead** (600, clamp 20–24px, 1.3; 1.45 for 400 lede paragraphs): h3, FAQ questions, lede and about paragraphs, the close line. Ledes are 34–50ch.
- **Body** (400, 17px from 900px and 16px below, 1.6): running text, up to 46–62ch.
- **Small** (400 or 600, 14px): captions, labels, table heads, the legal line and credits.

Product fragments keep their interface sizes (11–15px) inside `data-ui`. Those sizes are not part of the page scale.

### Named Rules
**The Five Sizes Rule.** Outside product fragments, visible text uses only figure, display, lead, body and small.

**The No Colon Heading Rule.** Headings are whole Hebrew sentences or phrases, never "label: statement", and never split by a colon.

## Layout

The content column is content-max wide (narrow pages use content-narrow), centred, with a 16px gutter that becomes 32px from 700px. Sections sit clamp(56–116px) apart. A section head sits clamp(28–56px) above its content, and nothing inside a section is that far apart. The breakpoints are 700px (tablet), 900px (desk: nav pill, side-by-side sections, sticky held stage and photo) and 1000px (hero split). From 900px the scrollbar gutter is stable on both edges so the right-to-left margins stay equal.

Compositions are asymmetric two-column grids from 900px. Common ratios are 0.34fr to 1fr for a heading or facts column against content, 1fr to 1.05fr for text against a stage. Sticky elements (the held stage, the FAQ group headings) sit at the header clearance plus 24px. On a phone, the hero puts the chat straight after the headline, before the text and form, so the first screen shows Toran answering.

Facts come only from site.config.json. In a draft build, a missing fact renders as an amber dashed placeholder with a draft banner above the header, and the real build stops instead.

## Elevation & Depth

This is a hybrid system: flat tonal tiles by default, with glass and shadow kept for what floats or frames the product.

### Shadow Vocabulary
- **Glass stage** (`box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 12px 32px -14px rgba(0,0,0,.14), inset 0 0 0 1px rgba(255,255,255,.7), inset 0 1px 0 rgba(255,255,255,.95)`) over a 180° gradient from glass-surface-hi to glass-surface, with `backdrop-filter: saturate(1.6) blur(24px)`.
- **Header at rest** (`0 2px 10px rgba(0,0,0,.05)` plus the inset edge and rim). Once the page scrolls it lifts to **Float** (`0 8px 30px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06)`), which the open phone menu also uses.
- **Message** (`0 1px 0.5px rgba(0,0,0,.13)`): WhatsApp's own bubble shadow, inside chats only.
- **Dialog** (`0 30px 60px -20px rgba(0,0,0,.6)`): the demo dialog on the night field.

### Named Rules
**The Glass Means Something Rule.** Glass goes on the header and on the stages product fragments stand on. Nothing else is glass, and glass is never nested in glass (the open menu is solid sheet).

**The No Line, No Shadow Tile Rule.** Tiles, rows and table stripes are separated by one tone step alone.

## Shapes

Surfaces have one radius: 18px for tiles, glass stages, photo frames, chats, the violet field, FAQ tiles and footer tiles. Inner elements use 12px: fields, rows, table stripes, form messages and bubbles. Buttons, the header, the nav and status pills are full pills. Icon buttons and status dots are circles. Brand marks are rounded squares at 24% (circles when used as a chat avatar). Photographs are clipped by their frame's radius.

## Components

### Buttons
- **Shape:** full pill, 50px tall (40px small), 26px inline padding (16px small), 600 weight.
- **Primary:** action blue with white text, one per decision. Hover goes to action-blue-hover.
- **Grey pill:** the fill colour with ink text. Hover goes to fill-hover. Suggestion chips use tile-hover.
- **Press:** `scale(0.97)` over 160ms on the out curve. Disabled or busy buttons drop to 55% opacity.
- **On the violet field:** a white pill with deep violet text (#3d1f9a).

### Inputs / Fields
- **Style:** at least 54px tall, field ground, 1px field-stroke, 12px radius, 17px text. Labels sit above in small 600.
- **Focus:** the border goes action blue with a 4px ring of 22% blue. Invalid fields take the warn border.
- **Form message:** a warn-ground strip with a 12px radius holding the reason and a WhatsApp way out. On success the form is replaced by a "done" block with a heading.

### Navigation
- **Header capsule:** sticky, 10px from the top, a 60px glass pill. The OpenFrequency mark and name sit at the start and the small primary demo button at the end.
- **Desk (900px+):** a centred segmented nav on fill, with 38px pill links. The current link is a solid segment with a 1px shadow.
- **Phone:** a 44px menu button opens a solid sheet (22px radius) with 52px links at 18px. It closes on an outside tap, a link or Escape.

### Cards / Containers
- **Tile:** the tile colour at 18px, with no line or shadow.
- **Rows:** two-ended rows with odd rows on tile at a 12px radius. Dots mark who answers: Toran green answered alone, action blue passed to you, faint not yet.
- **Eval table:** a real table with tabular figures and odd rows striped on tile at 12% radius corners. Zeros are OK green. On a phone it stays a table with short heads.
- **FAQ tiles:** details tiles with lead questions and a drawn plus that turns to minus. An open tile fills action blue with white text.
- **Header:** the glass capsule. From 900px the pages sit in the middle, each product behind its 22px mark, a hairline before the rest; the current page is ink with a short bar under it. On a phone the menu is a solid sheet: the two products as 68px rows with their marks and what each does, then the other pages as two pills, then the demo.
- **Footer:** one night panel at the content width, radius 24px: who we are, the products with their marks, the site's pages, and how to reach us, in four columns from 1000px; then the legal line over a hairline, and the wordmark at 12.6cqi in 7% white, cut by the panel's bottom edge.
- **Closing field:** a full-bleed night section with the demo dialog (sheet, 18px) open beside the line.
- **Teder field:** one violet field at 18px holding the wave mark and the waitlist form.

### Product Fragments (signature, data-ui)
- **Chat:** a WhatsApp conversation as one phone shows it, with a sheet header (avatar or mark, name, a "דוגמה" tag), the chat ground, and sent and received bubbles with a 3px tail corner and times. It plays in once on arrival: messages appear in order (opacity plus 8px rise, 350–450ms), and each reply is preceded by Toran's three typing dots. Every chat is invented and says so.
- **Held stage:** "how it goes." Three statements scroll past a sticky glass stage whose UI card changes state. The statement in view goes to ink and the others to quiet. States cross-fade with a 16px rise over 350–500ms. Without script or with reduced motion, each state sits under its statement.
- **Question box:** a chat window beside its heading: the made-up store's header, the doodled ground, a row of questions to tap and an input bar with a round send button in Toran's green. A question goes in as the customer's message, the answer follows Toran's typing dots, and a centred system line under it says "answered alone" (with the page it came from) or "passed to you" (with why). The window keeps the last few exchanges.
- **Phone:** a dark frame with 46px top corners, an island, and the screen inside, cut off by the bottom edge of its door. Toran's door holds the sample chat; Teder's plays the cover of each subject like stories, a bar filling across the top of each over 3.2s, with two of them fanned behind it.
- **Pop:** a notification card that sticks out over a phone's edge, sheet-coloured with an 18px radius and a soft shadow: what reaches the owner. On Toran's phone it drops in after the chat has played (the question Toran couldn't answer); on Teder's it's the slide waiting for approval.
- **Doodled ground:** every chat's ground carries a faint tile of line drawings (a bag, a heart, a star, a box, a bubble, a clock), as WhatsApp's does, at about 7% under the ground colour.
- **Dock:** below 700px, on the home page and /toran, the demo button sits on a frosted bar at the bottom of the screen once the first screen is behind, and slides away while a form or the footer is in view.

### Motion
- **Easing:** out `cubic-bezier(0.23, 1, 0.32, 1)` everywhere. In-out `cubic-bezier(0.77, 0, 0.175, 1)` is reserved.
- **Rise:** parts of a `data-rise` group fade up 22px once (700ms opacity, 900ms transform), 80ms apart.
- **Ambient:** typing dots (1.2s) and the now-row beat (2.4s).
- **Without motion:** content is visible by default, and reduced motion removes every transition and animation.

### Imagery
Teder is shown by its own output: the opening slide of one slideshow in each subject, never a whole slideshow, so a visitor looking for an AI example doesn't have to go through a football one. Three are from our accounts (@sheela.tova on AI, @kav.emtza on football, @shekel.leshekel on money) and one from a made-up account (@demo.atzitz on houseplants, marked חשבון לדוגמה). `node scripts/showcase.mjs` brings the covers in from private/showcase, names each by its subject, refuses any photo not under the Pexels or Unsplash licence, and writes assets/teder/showcase (TikTok 9:16 for the phone, Instagram 4:5 for the page) with showcase.json. On /teder each cover is a glass card: the subject on top after a violet dot, the slide with 12px corners, the slideshow's topic, then the handle and a credit for the cover's photographer. Four across on a wide screen, two on a phone.

## Do's and Don'ts

### Do:
- **Do** keep the wallpaper and tiles hue-less, and let colour enter through product fragments, brand marks, the action blue and the single violet field.
- **Do** give each decision exactly one filled action-blue pill, and make every other button a grey pill.
- **Do** put glass only on the header and the stages that hold product fragments, with the lit edge (inset 1px edge plus 1px top rim).
- **Do** separate tiles, rows and table stripes by one tone step, at 18px for surfaces and 12px for inner elements.
- **Do** keep visible text to the five sizes, and let fragments keep their interface sizes inside `data-ui`.
- **Do** label every made-up chat, day and store as an example, and take every fact from site.config.json.
- **Do** make motion play once, on the out curve, with content visible by default and nothing moving under reduced motion.
- **Do** provide solid fallbacks for Increase Contrast, Reduce Transparency and browsers without backdrop blur.

### Don't:
- **Don't** add lines or shadows to tiles, or nest glass inside glass.
- **Don't** use a brand mark's colour as the accent, or redraw a mark.
- **Don't** put colons in headings.
- **Don't** present the archival photographs as customers, stores or the team, or show them in colour.
- **Don't** build the category's hero plus three identical feature cards plus logos plus pricing cards. Show the product working instead.
- **Don't** let WhatsApp's greens and chat ground leave a chat fragment.
- **Don't** invent customers, testimonials, logos or numbers, and don't offer a free trial.
