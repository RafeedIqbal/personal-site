---
name: Publicus application (/publicus)
description: An application to Publicus published as a dated open-data record, with paper, ruled rows, purple header bands and a highlighter for values that need a second look.
colors:
  publicus-purple: "#634086"
  on-purple: "#e6ddf0"
  highlighter: "#f5d547"
  highlighter-tint: "#fbf1c2"
  paper: "#fcfcfb"
  ink: "#1a1820"
  ink-hover: "#3b3644"
  ink-2: "#47434f"
  ink-3: "#66616e"
  rule: "#d9d6de"
  band: "#f4f3f6"
  row-active: "#e9e7ee"
  white: "#ffffff"
  chip: "#ecebef"
  control-rule: "#cfcad6"
  instrument-rule: "#c9c4d0"
  status-green: "#24573f"
  status-green-tint: "#e3f0e8"
  review-ink: "#5c4a0c"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "4.25rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: '"wdth" 85'
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: '"wdth" 85'
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
    fontVariation: '"wdth" 85'
  lede:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  table:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: '"tnum"'
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  band-label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  data:
    fontFamily: "Chivo Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  instrument:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
  control: "2px"
  instrument: "4px"
spacing:
  container-max: "1240px"
  gutter: "32px"
  gutter-tablet: "24px"
  gutter-phone: "16px"
  section-min: "64px"
  section-max: "112px"
  column-gap: "56px"
  cell-y: "10px"
  cell-x: "12px"
  explorer-inset: "28px"
  explorer-inset-phone: "12px"
components:
  masthead:
    backgroundColor: "{colors.publicus-purple}"
    textColor: "{colors.white}"
    typography: "{typography.display}"
    padding: "60px 0 24px"
  table-header:
    backgroundColor: "{colors.publicus-purple}"
    textColor: "{colors.white}"
    typography: "{typography.band-label}"
    padding: "10px 12px"
  table-cell:
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    padding: "10px 12px"
  table-row-banded:
    backgroundColor: "{colors.band}"
  table-row-active:
    backgroundColor: "{colors.row-active}"
  value-disagrees:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.ink}"
    padding: "0 3px"
  raw-row-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.none}"
    padding: "20px 24px 24px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  resource-row:
    textColor: "{colors.ink}"
    height: "48px"
    padding: "10px 0"
  resource-row-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    padding: "10px 16px"
  resource-row-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  explorer-shell:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.instrument}"
    rounded: "{rounded.instrument}"
  explorer-list-heading:
    backgroundColor: "{colors.publicus-purple}"
    textColor: "{colors.white}"
    padding: "10px 18px"
  explorer-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  explorer-button-hover:
    backgroundColor: "{colors.ink-hover}"
  explorer-button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  explorer-button-secondary-hover:
    backgroundColor: "{colors.band}"
  explorer-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  badge:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "3px 7px"
  badge-ok:
    backgroundColor: "{colors.status-green-tint}"
    textColor: "{colors.status-green}"
  badge-review:
    backgroundColor: "{colors.highlighter-tint}"
    textColor: "{colors.review-ink}"
---

# Design System: Publicus application (/publicus)

This file covers the `/publicus` route only: `app/publicus/` and `components/publicus/`. Its tokens are custom properties scoped to the route's wrapper in `app/publicus/publicus.css`, and its fonts load in `app/publicus/layout.tsx`. The main portfolio (graphite and green, `app/globals.css`) and `/belong` keep their own systems and are not described here.

## Overview

**Creative North Star: "The Open-Data Record"**

The page is laid out like a dataset's landing page on an open-data portal. A purple band carries the title and a metadata row (publisher, modified date, contents, format). Under it sit a short introduction, a ruled list of resources, and the records themselves: ten CanadaBuys rows in a table with a purple header. Every row has its own address, and opening one shows that row's raw CSV fields under the table. The rest of the page (work, why Publicus, the explorer, approach, contact) follows as ruled two-column sections.

The material is paper and ink, and colour is rationed by job: purple for header bands, a yellow highlighter for values a reviewer should look at, ink for actions. There are no shadows, gradients or illustrations, and only one animation. Spacing is generous between sections and tight inside tables, with reading text at 17px and table text at 13 to 14px.

The embedded procurement explorer is working software placed on the record. It shares the palette, rules and type at a denser 13px base, on a white surface with 2px control corners and a 4px shell, so it reads as an instrument sitting on the page.

**Key Characteristics:**
- Paper ground and near-black violet ink, with hairline rules and banded rows.
- Publicus purple on header bands only, always with white text.
- A highlighter on values that disagree and on passages a reviewer has to check.
- Archivo, semi-condensed for headings and normal width for reading; Chivo Mono for anything that is data.
- Square and flat on the page; small corners only inside the explorer.
- One motion: a 220ms top-down clip reveal, used when a raw row opens and when the help chat opens.

## Colors

One brand colour with one job, one reviewer's highlighter, and a family of cool violet-greys on near-white paper.

### Primary
- **Publicus Purple** (#634086): header bands only. It fills the masthead, every table header row (the records table, the vendors and buyers table, the explorer's results heading and source index), the 6px band that takes the header row's place when the records table stacks, and the title band of the help chat, which heads its conversation. It is the route's one nod to Publicus's brand. The share image uses Publicus's deeper purple (#2e1e44) for its record band; the page never does.
- **Lavender Mist** (#e6ddf0): secondary text on purple, such as the metadata terms in the masthead and the counts in explorer headings.

### Secondary
- **Reviewer's Highlighter** (#f5d547): marks what a reviewer has to look at. On the record sheet that means values that disagree, and nothing else: the contract amount and total contract value of an award whose total reads 0.00 while its amount doesn't, in the table and again in the raw row. In the explorer it also marks the exact passage a citation quotes inside the source text and fills the square markers beside review issues. It is the text-selection colour too, so a reader's own selection looks like the same pen.
- **Highlighter Wash** (#fbf1c2): the pale version, for "needs review" badges and the quoted-passage block in the source viewer. Text on it is Review Ink.

### Neutral
- **Record Paper** (#fcfcfb): the page ground, the raw-row panel and the browser theme colour.
- **Ink** (#1a1820): text, headings, the 1px rules that open sections and frame the raw row, solid action fills and focus rings.
- **Ink Pressed** (#3b3644): the hover fill for ink actions.
- **Graphite Violet** (#47434f): secondary text, such as section ledes, captions and explorer helper text.
- **Ash Violet** (#66616e): tertiary text, such as field labels, row numbers, missing values and the licence line.
- **Hairline** (#d9d6de): row and section dividers and image frames.
- **Band** (#f4f3f6): even-row banding, plus explorer hover fills and its footer bar.
- **Active Row** (#e9e7ee): the record whose raw row is open (row 01 until another is chosen).
- **Instrument White** (#ffffff): the explorer's surface, and text on purple and ink.
- **Chip Grey** (#ecebef): neutral badges.
- **Control Rule** (#cfcad6) and **Instrument Rule** (#c9c4d0): borders of explorer inputs and secondary buttons, and of the explorer shell and its scrollbars.

### Status (explorer only)
- **Ledger Green** (#24573f) on **Green Wash** (#e3f0e8): matched requirements, public sources, a connected workspace, high match scores and verified claims.
- **Review Ink** (#5c4a0c): text on Highlighter Wash and on review-issue lines.
- The explorer's single error notice uses a red-brown (#7a3420 on #fbebe4, ruled #ecc9bb). It appears once and is not a token.

### Named Rules
**The Header Band Rule.** Publicus purple fills header bands and nothing else. If an element is not the top of a dataset, a table or a list, it is not purple.

**The Highlighter Rule.** The highlighter means "look here": a value that disagrees, a quoted passage, a review issue. It is never emphasis, decoration, a brand fill or a call to action. A value that merely matters stays ink.

**The Ink Action Rule.** Every action is solid ink with white text and hovers to Ink Pressed. Actions are never purple or yellow.

## Typography

**Display Font:** Archivo at wdth 85, semi-condensed (with system-ui, sans-serif)
**Body Font:** Archivo at normal width (with system-ui, sans-serif)
**Label/Mono Font:** Chivo Mono (with ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** One grotesque in two widths carries the human voice, narrow and tight for headings and normal width for reading. Chivo Mono is the dataset's voice, so anything set in it reads as copied from a file. Both load only on this route, Archivo with its width axis.

### Hierarchy
- **Display** (600, wdth 85, fluid from 2.25rem to 4.25rem, line-height 1.02, -0.025em): the masthead title only, up to about 15em wide.
- **Headline** (600, wdth 85, fluid from 1.75rem to 2.5rem, 1.05, -0.02em): section headings in the left column.
- **Title** (600, wdth 85, fluid from 1.375rem to 1.875rem, 1.12, -0.02em): work-entry headings. Smaller titles use the same face at fixed sizes: approach steps (20px), the raw-row heading (19px) and the question row of the vendors and buyers table (fluid 1.25rem to 1.625rem, -0.015em).
- **Lede** (400, fluid from 1.125rem to 1.3125rem, 1.5): the introduction and the contact paragraph, 52 to 60ch. Section ledes run a step smaller (fluid 1.0625rem to 1.1875rem) in Graphite Violet, up to 62ch.
- **Body** (400, 17px, 1.55; 16px below 760px): entry prose, up to 66ch.
- **Table** (400, 14px, 1.4, tabular numerals): the records table. The vendors and buyers table runs 16px at 1.5.
- **Label** (400, 13px): metadata terms, small print and the licence line. Header bands use **Band Label**, the same 13px at 600.
- **Data** (Chivo Mono 400, 13px, 1.45; 14px in metadata rows): figures, dates, row numbers, IDs, file names and sizes, and raw CSV fields.
- **Instrument** (400, 13px, 1.55): the explorer's base. Explorer headings step up to 18 to 26px, semi-condensed.

### Named Rules
**The Data Voice Rule.** Chivo Mono marks material as data: field names, raw fields shown as published, IDs, dates, file sizes and figures. Headings, prose, labels, names and buttons stay in Archivo. A number inside a sentence may stay in Archivo; words a person wrote never go into mono.

**The Narrow Heading Rule.** Every heading is Archivo at wdth 85 and weight 600, with negative tracking (-0.015em to -0.025em) and balanced wrapping. Reading text is never condensed.

**The Significance Rule.** Size follows significance, not position. A total that disagrees with its own row steps up from 13px to 17px semibold (16px when stacked) as well as taking the highlighter.

## Layout

One centred container, 1240px at most with 32px gutters a side, 24px below 1024px and 16px below 760px. The masthead band runs full bleed with the container inside it.

The first screen stacks a thin link strip (site and route on the left, page links on the right, 15px), the purple masthead with a four-column metadata row under a 1px white rule at 32% opacity, a two-column introduction (paragraph beside a 340px resources list, 72px apart), then the records table.

Every section after the records shares one grid: a 1px ink rule on top, 22px to the content, then a heading column and a content column at 1:3 with a 56px gap. From 1024px up the heading sticks 24px from the top while its section scrolls past. The explorer section is the exception: its heading spans the first row and the explorer takes the full width. Sections sit 64 to 112px apart, fluid.

Work entries nest a second grid, a 200px metadata column (company, role, period, status) beside the entry, divided by hairlines. Screenshots fill the entry column inside a 1px hairline frame, with a caption underneath.

Tables run the full container width with 10px by 12px cells. Below 1024px the records table stacks: the header row is hidden visually but kept for screen readers, a 6px purple band takes its place, and each record becomes a block with its row number in a 2.25rem gutter and label and value pairs beside it (9.5rem labels, 7.5rem below 760px).

Below 1024px every two-column arrangement collapses to one, and the masthead metadata drops to two columns. Below 760px the strip keeps only the résumé and email links, entries put their metadata above the prose in two columns, the raw row's fields go to one column, and the vendors and buyers table hides its row headers.

The explorer insets its content 28px (12px on phones) and splits results and detail 42 to 58 (43 to 57 below 1100px). On phones it shows the list and the detail one at a time, with a back button.

### Named Rules
**The Ruled Column Rule.** Every narrative section opens with a 1px ink rule and puts its heading in the left quarter. No section gets a background panel.

**The Stack Rule.** Records stack below 1024px. Nothing on the page scrolls sideways on a phone.

## Elevation & Depth

Flat. There are no box shadows, text shadows, glows, gradients or blurs anywhere on the route, the explorer included. Depth comes from tone (paper, band, active row, the white instrument), from rules (hairlines between rows, ink rules at section tops and around the raw row) and from one overlap: the raw-row panel moves up 1px to sit on the table's last rule. The only scrim is the explorer dialog's backdrop, ink at 50%.

### Named Rules
**The Flat Record Rule.** When something needs to stand out, give it a rule, a band or the highlighter, never a shadow.

## Shapes

Square on the page. Tables, the raw-row panel, buttons, the resources list, image frames and the skip link have no radius, and markers are square too (review-issue markers, timeline dots, the storage status dot). Corners exist only in the explorer: 2px on its controls (inputs, buttons, badges, citation chips, requirement rows) and 4px on its shell and dialogs.

Rules are 1px. The heavier strokes are the explorer's 2px selected-tab underline, the 2px focus outline and the 6px band on the stacked table. Page arrows are 14px line drawings with square caps; explorer icons are 1.5px strokes with round caps.

### Named Rules
**The Square Record Rule.** Nothing on the page itself is rounded. A radius means you are inside the explorer.

## Components

### Buttons
- **Shape:** square on the page (0px), 2px in the explorer.
- **Primary:** solid Ink with white 600 text, 12px by 20px, at least 48px tall. It carries the contact email action.
- **Hover / Focus:** hover fills Ink Pressed over the route's 220ms curve. Focus is a 2px ink outline 3px out (white on the purple masthead).
- **Resources list:** a ruled list under a 1px ink top rule. Each row is a 48px link with its label on the left and a mono detail or arrow on the right. The first row, Email me, is the primary action: a solid Ink row with 16px side padding.
- **Text links:** inherit ink, with a 1px underline 3px below the text and an arrow icon for outbound or in-page jumps. Record titles in the table use a softer underline (#b9b3c2) that darkens to ink on hover.
- **Explorer:** primary is solid Ink with white 500 text at 13px, 9px by 14px; secondary is white with a Control Rule border and hovers to Band. Tertiary explorer actions are underlined text buttons.

### Chips
- **Style:** explorer badges at 12px, 3px by 7px, 2px corners. Neutral is Chip Grey with Graphite Violet text, which also labels "Interactive demo" and "Fictional example". Citation chips are Band with 12px mono text.
- **State:** ok is Ledger Green on Green Wash; needs review is Review Ink on Highlighter Wash.

### Cards / Containers
- **Corner Style:** square on the page; 4px for the explorer shell and dialogs.
- **Background:** Record Paper for the raw-row panel, Instrument White for the explorer.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Ink around the raw-row panel, 1px Instrument Rule around the explorer, 1px Hairline around explorer panels and source cards.
- **Internal Padding:** raw-row panel 20px top and 24px sides and bottom (16px on phones); explorer panels 22px.

### Inputs / Fields
- **Style:** explorer only. White, 1px Control Rule border, 2px corners, 8px by 10px, 13px text, placeholders in Ash Violet; checkboxes are 16px and tinted ink.
- **Focus:** a 2px ink outline 2px out. The search field outlines its whole wrapper, icon included.
- **Error / Disabled:** disabled controls drop to 45% opacity with a not-allowed cursor.

### Navigation
- **Link strip:** 15px. The site name is 600 with no underline, the route name sits in Ash Violet, and the page links on the right underline on hover.
- **Explorer tabs:** 13px Graphite Violet labels 24px apart. The selected tab is Ink at 600 with a 2px ink underline.
- **Skip link:** a solid ink block that slides in on focus.

### Records Table
The signature component. A purple header row with 13px semibold white labels; a 14px body with tabular numerals; mono row numbers, dates and figures, with figures right-aligned; a hairline under every row and Band on even rows; "Not stated" regions in italic Ash Violet. Each title links to that record's address (`#cb-01` to `#cb-10`). The record whose raw row is open takes Active Row, and with nothing chosen row 01 is active and its raw row shows. Values that disagree carry the highlighter, and the disagreeing total also steps up to 17px semibold. The caption sits below the raw rows: a 64ch note, a right-aligned hint, and the licence line in 13px Ash Violet.

### Raw Row Panel
One record's CSV fields as published. A heading ("Row NN, as published") with the source file and CSV row in mono on the right, then a two-column grid of mono field and value pairs separated by hairlines, inside a 1px ink frame. Only one is open at a time. Choosing a record opens its panel with the route's only animation: a clip reveal from top to bottom over 220ms on an exponential ease-out (cubic-bezier(0.16, 1, 0.3, 1)). Colour changes on hover share that duration and curve. With reduced motion requested, every animation and transition is removed.

### Build Notes
A ruled definition list under the explorer's section lede, saying how the explorer works, its architecture and its stack. Terms sit in a 9rem column in 13px Ash Violet, values in 15px ink up to 66ch, with a Hairline above and between rows; below 760px each term stacks over its value. The architecture row opens with the request path as an ordered list in Chivo Mono (each step is an identifier), joined by Ash Violet arrows that screen readers skip.

### Help Chat
A fixed ink launcher, "Ask a question", 48px tall (44px on phones), at the bottom right of every viewport. It renders only after hydration, and the panel's code loads on first open.
- **Panel:** square and flat, with a 1px Ink border on white. It is 400 by 640px at most, 24px from the corner, and non-modal, so the explorer stays usable beside it. Below 760px it is a full-screen modal sheet with the explorer dialog's 50% ink backdrop. It opens with the route's one clip reveal.
- **Head:** a Publicus purple band with the 17px semi-condensed title "Questions about this application" and a 44px white close button.
- **Conversation:** a log of ruled rows. Questions sit on Band in 600 weight; answers sit on white in 15px paragraphs, each followed by "From" chips (Band, 13px Archivo, square) that link to the page section or the résumé the answer drew on.
- **Suggested questions:** a ruled list under a 1px ink rule, like the resources list, with a 14px arrow. Asked ones drop out of the list.
- **Form:** one 12px Ash Violet line naming the explorer view sent with each question, a square textarea with a Control Rule border, a mono character count, an underlined "Start over" and a solid ink "Ask" button.
- **States:** "Checking the record…" as static Ash Violet text while waiting; a Band notice with the email address when the chat is offline, over its daily limit or failed. When typed questions are unavailable, the textarea is removed and the suggested questions still work.

### Masthead
A full-bleed purple band holding the display title and a metadata row (Publisher, Modified, Contents, Format): 13px Lavender Mist terms over 15px white values, with the date in 14px mono, under a 1px white rule at 32% opacity. Top padding runs 36 to 60px, fluid, with 24px below. It is typeset only.

## Do's and Don'ts

### Do:
- **Do** keep Publicus purple (#634086) on header bands, with white or Lavender Mist (#e6ddf0) text.
- **Do** mark a value that disagrees with the highlighter (#f5d547) in both the table and its raw row, and keep the raw field visible.
- **Do** set field names, raw fields, IDs, dates, file sizes and figures in Chivo Mono, with tabular numerals in tables.
- **Do** open each narrative section with a 1px ink rule and a left-column heading.
- **Do** divide rows with 1px Hairline (#d9d6de) and band even rows with Band (#f4f3f6).
- **Do** give every record an address and open its raw row with the one 220ms clip reveal, removed under reduced motion.
- **Do** make the primary page action solid Ink and at least 48px tall.
- **Do** stack the records table below 1024px as label and value pairs under a 6px purple band.

### Don't:
- **Don't** use purple for text, links, buttons, icons, borders or charts.
- **Don't** use the highlighter for emphasis, decoration, brand fills or calls to action.
- **Don't** add shadows, glows, gradients or blur; depth is rules, bands and tone.
- **Don't** put kicker or eyebrow labels above headings, and don't number sections. Record numbers (01 to 10) and the explorer's provenance badge and reference ID are data, and they stay.
- **Don't** round anything on the page; corners (2px controls, 4px shell) belong to the explorer.
- **Don't** add imagery or illustration to the masthead.
- **Don't** set prose, headings, names or buttons in Chivo Mono.
- **Don't** use Publicus's logo or reproduce its marketing layout.
- **Don't** add a second animation; hover states change colour only, on the same 220ms curve.
