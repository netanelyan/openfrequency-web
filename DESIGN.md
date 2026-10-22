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

The site lives inside the Teder owner-site world, pinned by the owner's brief: a silver wallpaper with no hue of its own, frosted glass with a lit edge, the system typeface with Heebo behind it, pill buttons, and one action blue. Inside that world the page is quiet so the product can be loud. The colour, the detail and the motion belong to working fragments of Toran (marked `data-ui`): a WhatsApp chat with its own bubbles, greens and times; a settings card that changes state; a duty log with the present minute on it. Everything around those fragments is silver surfaces of the same tone, five type sizes and generous space.

Depth is rationed. Glass is reserved for what floats (the header capsule) and for the stages a product fragment stands on. Every other surface is a tile one tone step off the wallpaper, with no line and no shadow. The one dark surface in the light theme is the closing field; the one colour field is Teder's violet. The home page is the company's: a door to each product in its own material, Toran's chat on glass and Teder's real slides on its violet. One credited black-and-white archival photograph (a 1971 switchboard on duty) stands for the meaning of Toran's name on its page, never for its customers.

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
- **Sheet** (sheet): the solid surface for the open phone menu, chat headers, UI cards and the closing dialog (dark #1e1e20).
- **Night** (night): the closing field, with Night Ink and Night Ink Quiet on it (dark #000000).

### Product palette (inside data-ui only)
- **Sent Bubble**, **Received Bubble** and **Chat Ground** are WhatsApp's own colours (dark #144d37, #2c2c2e, #0b141a). They never leave a chat fragment.
- **OK Green** (ok-green) is for success lines and the eval's zeros. **Warn** on **Warn Ground** is for form errors, "fixed" status and the draft banner.

### Named Rules
**The No Hue Wallpaper Rule.** The wallpaper and every tile are hue-less silver. Colour arrives only with the product's fragments, the brand marks, the action blue and the one violet field.

**The One Blue Per Decision Rule.** Each decision gets one filled action-blue button. Every other button is a grey pill. The open FAQ tile and the footer's go tile are the only other blue fills.

**The Mark Colour Rule.** A mark's tile colour is the product's own and never the accent. The marks are the brand files and are never redrawn.

## Typography

**Display Font:** the system display stack (SF Pro Display, SF Hebrew, Segoe UI, Noto Sans Hebrew), with Heebo self-hosted as the Hebrew and Latin fallback
**Body Font:** the system text stack (SF Pro Text, SF Hebrew), with the same fallbacks

**Character:** the owner's brief pins the platform's own typeface. Hierarchy therefore comes from size, weight 700 against 400, and tight negative tracking on the large sizes, not from a contrasting face.

### Hierarchy
- **Figure** (700, clamp 88–216px, 0.86, -0.035em, tabular): the price only.
- **Display** (700, clamp 28–72px, 1.04, -0.012em, balanced wrap): every h1 and h2, the typed question line, the footer clock and wordmark.
- **Lead** (600, clamp 20–24px, 1.3; 1.45 for 400 lede paragraphs): h3, FAQ questions, lede and about paragraphs, the close line. Ledes are 34–50ch.
- **Body** (400, 17px from 900px and 16px below, 1.6): running text, up to 46–62ch.
- **Small** (400 or 600, 14px): captions, labels, table heads, the legal line and credits.

Product fragments keep their interface sizes (11–15px) inside `data-ui`. Those sizes are not part of the page scale.

### Named Rules
**The Five Sizes Rule.** Outside product fragments, visible text uses only figure, display, lead, body and small.

**The No Colon Heading Rule.** Headings are whole Hebrew sentences or phrases, never "label: statement", and never split by a colon.

## Layout

The content column is content-max wide (narrow pages use content-narrow), centred, with a 16px gutter that becomes 32px from 700px. Sections sit clamp(56–116px) apart. A section head sits clamp(28–56px) above its content, and nothing inside a section is that far apart. The breakpoints are 700px (tablet), 900px (desk: nav pill, side-by-side sections, sticky held stage and photo) and 1000px (hero split). From 900px the scrollbar gutter is stable on both edges so the right-to-left margins stay equal.

Compositions are asymmetric two-column grids from 900px. Common ratios are 0.34fr to 1fr for a heading or facts column against content, 1fr to 1.05fr for text against a stage, and a 12-column board for the footer. Sticky elements (the held stage, the day photo, the FAQ heading) sit at the header clearance plus 24px. On a phone, the hero puts the chat straight after the headline, before the text and form, so the first screen shows Toran answering.

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

**The No Line, No Shadow Tile Rule.** Tiles, rows, table stripes and the footer board are separated by one tone step alone.

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
- **Rows and the duty log:** two-ended rows with odd rows on tile at a 12px radius. Dots mark who answers: Toran green answered alone, action blue passed to you, faint not yet. The log's present minute is a 12% blue row whose dot beats.
- **Eval table:** a real table with tabular figures and odd rows striped on tile at 12% radius corners. Zeros are OK green. On a phone it stays a table with short heads.
- **FAQ tiles:** details tiles with lead questions and a drawn plus that turns to minus. An open tile fills action blue with white text.
- **Footer board:** a grid of tiles (12 columns from 700px, two below). It holds a night tile with the wordmark at display size, an action-blue go tile with a drawn arrow that slides 6px on hover, a clock tile and a links tile.
- **Closing field:** a full-bleed night section with the demo dialog (sheet, 18px) open beside the line.
- **Teder field:** one violet field at 18px holding the wave mark and the waitlist form.

### Product Fragments (signature, data-ui)
- **Chat:** a WhatsApp conversation as one phone shows it, with a sheet header (avatar or mark, name, a "דוגמה" tag), the chat ground, and sent and received bubbles with a 3px tail corner and times. It plays in once on arrival: messages appear in order (opacity plus 8px rise, 350–450ms), and each reply is preceded by Toran's three typing dots. Every chat is invented and says so.
- **Held stage:** "how it goes." Three statements scroll past a sticky glass stage whose UI card changes state. The statement in view goes to ink and the others to quiet. States cross-fade with a 16px rise over 350–500ms. Without script or with reduced motion, each state sits under its statement.
- **Question box:** the headline is an input at display size. Answers render as a chat with an "answered alone" or "passed to you" status pill.

### Motion
- **Easing:** out `cubic-bezier(0.23, 1, 0.32, 1)` everywhere. In-out `cubic-bezier(0.77, 0, 0.175, 1)` is reserved.
- **Rise:** parts of a `data-rise` group fade up 22px once (700ms opacity, 900ms transform), 80ms apart.
- **Photo reveal:** a frame opens from the top with a clip-path over 1.2s. Drift photos settle from scale 1.08 over 2.4s.
- **Ambient:** typing dots (1.2s) and the now-row beat (2.4s).
- **Without motion:** content is visible by default, and reduced motion removes every transition and animation.

### Imagery
Teder is shown by its own output: opening slides Teder made for our three accounts (@sheela.tova, @kav.emtza, @shekel.leshekel), resized from openfrequency-teder into assets/teder, fanned three at a time in the home page's Teder door and run as a sideways-scrolling row with scroll-snap in its section, 12px corners. One credited black-and-white archival photograph from Wikimedia Commons, a 1971 switchboard on duty, appears on /toran's day on duty, in grayscale with contrast 1.04 inside an 18px frame, captioned and credited at the foot of the page. It is never presented as our customer, store or team.

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
