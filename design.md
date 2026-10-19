# Design — Biuno

The shared system for all four language versions. The 2026-10-19 redesign was
explicitly requested by the owner: minimal navigation, headline and subtitle,
then the game itself as the main content. Preserve existing routes and game rules.

## Genre and structure

- Genre: modern-minimal, quiet and functional.
- Game pages: Workbench. One large central play surface; optional expandable instructions above the board and best
  score below, never in a competing sidebar.
- Index pages: Catalogue. A compact game picker with no marketing hero.
- Content pages: Long Document, readable and restrained.
- Navigation: N9 edge-aligned. Biuno left, a native game selector and short
  language selector right. No account claims or promotional badges.
- Footer: Ft2 inline legal links and progress; kept compact at the owner's request.

## Visual system

Royal blue interactions, near-white page, light-grey game surface, dark readable
text. Use `tokens.css` for all colours and fonts. `redesign.css` is the final
presentation layer after the retained original `styles.css`.

Typography is local system sans-serif for both titles and body, with weight
contrast. This deliberately follows the owner's no-external-fonts requirement.
Headings are upright, sentence case, and wrap within their containers.

## Interaction and layout

- Start screens show a large noninteractive game preview, with a real Start button.
- Round results show score and personal best. Play again is on the right; sharing
  and a random other game are secondary actions. On phones Play again occupies
  the first action row, aligned right, with the secondary actions below.
- Sharing uses the native share sheet, then clipboard, then a selectable link in
  a native dialog. Nothing is sent automatically.
- Random game navigation excludes the current game and keeps the current language.
- Native buttons/selects, instant focus rings, at least 44px touch targets.
- No decorative motion or external assets. Sequence highlighting is functional.
- All four locales share this system. Keep local records and sessions compatible.

## Reference observations

Open Online uses a compact top navigation and a central application workspace.
Beleg.org uses blue/near-white surfaces and a prominent functional tool area.
These are public visual references, not copied source or assets. Biuno uses its
own UI and local fonts rather than the reference sites' loaded fonts.

## Readability and simple play

- Main text and game controls use at least 18px; compact navigation and metadata
  use at least 16px. Text colours are darkened and borders are stronger.
- Game symbols are original filled SVG silhouettes. Pipes use thicker strokes.
- Remove decorative arrows. Native dropdown indicators remain functional cues.
- Show one Start round action and an optional How to play disclosure with three
  steps. New browsers begin at Easy; saved difficulty preferences remain intact.
- Opening instructions pauses the round and leaves focus on the disclosure.
- Correct answers advance after 1.6 seconds with a visible message. Incorrect
  answers wait for an explicit Continue so players can review the explanation.
- Picture study has no deadline. Sequence demonstration is slower and clearer.
- During play, keep one shared control row. New round lives in the pause screen.
- Pause, hiding the tab and reload/restore must never lose or double-count an
  automatic transition. Saved records keep the existing storage schema.

## Exports

### tokens.css

```css
/* Hallmark · pre-emit critique: P5 H4 E4 S5 R5 V4
 * genre: modern-minimal · macrostructure: Workbench · theme: custom
 * tone: quiet and functional · anchor hue: royal blue · nav: N9 · footer: Ft2
 * audience: adults 40–65 · use: short browser games · fonts: local system only */
:root {
  --color-paper: oklch(99% 0.003 265);
  --color-surface: oklch(97% 0.006 265);
  --color-paper-2: oklch(94% 0.01 265);
  --color-ink: oklch(25% 0.025 265);
  --color-muted: oklch(36% 0.025 265);
  --color-accent: oklch(45% 0.19 265);
  --color-accent-ink: oklch(99% 0.003 265);
  --color-accent-soft: oklch(92% 0.035 265);
  --color-rule: oklch(65% 0.014 265);
  --color-focus: oklch(32% 0.09 265);
  --color-good: oklch(36% 0.085 155);
  --color-good-soft: oklch(94% 0.025 155);
  --color-error: oklch(42% 0.14 25);
  --color-error-soft: oklch(95% 0.025 25);
  --color-transparent: transparent;
  --color-overlay: oklch(25% 0.025 265 / .35);
  --font-display: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --text-xs: 1rem;
  --text-sm: 1.125rem;
  --text-base: 1.125rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-heading: clamp(2rem, 4vw, 3rem);
  --text-display: clamp(2.6rem, 5.4vw, 4.8rem);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-round: 50%;
  --rule-hair: 1px;
  --dur-fast: 120ms;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in: cubic-bezier(.7, 0, .84, 0);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
}

```

### Tailwind v4 theme

```css
@theme {
  --color-paper: oklch(99% 0.003 265);
  --color-surface: oklch(97% 0.006 265);
  --color-paper-2: oklch(94% 0.01 265);
  --color-ink: oklch(25% 0.025 265);
  --color-muted: oklch(36% 0.025 265);
  --color-accent: oklch(45% 0.19 265);
  --color-accent-ink: oklch(99% 0.003 265);
  --color-accent-soft: oklch(92% 0.035 265);
  --color-rule: oklch(65% 0.014 265);
  --color-focus: oklch(32% 0.09 265);
  --color-good: oklch(36% 0.085 155);
  --color-good-soft: oklch(94% 0.025 155);
  --color-error: oklch(42% 0.14 25);
  --color-error-soft: oklch(95% 0.025 25);
  --color-transparent: transparent;
  --color-overlay: oklch(25% 0.025 265 / .35);
  --font-display: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --text-xs: 1rem;
  --text-sm: 1.125rem;
  --text-base: 1.125rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-heading: clamp(2rem, 4vw, 3rem);
  --text-display: clamp(2.6rem, 5.4vw, 4.8rem);
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in: cubic-bezier(.7, 0, .84, 0);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
}
```

### DTCG tokens

```json
{
  "color-paper": {
    "$type": "color",
    "$value": "oklch(99% 0.003 265)"
  },
  "color-surface": {
    "$type": "color",
    "$value": "oklch(97% 0.006 265)"
  },
  "color-paper-2": {
    "$type": "color",
    "$value": "oklch(94% 0.01 265)"
  },
  "color-ink": {
    "$type": "color",
    "$value": "oklch(25% 0.025 265)"
  },
  "color-muted": {
    "$type": "color",
    "$value": "oklch(36% 0.025 265)"
  },
  "color-accent": {
    "$type": "color",
    "$value": "oklch(45% 0.19 265)"
  },
  "color-accent-ink": {
    "$type": "color",
    "$value": "oklch(99% 0.003 265)"
  },
  "color-accent-soft": {
    "$type": "color",
    "$value": "oklch(92% 0.035 265)"
  },
  "color-rule": {
    "$type": "color",
    "$value": "oklch(65% 0.014 265)"
  },
  "color-focus": {
    "$type": "color",
    "$value": "oklch(32% 0.09 265)"
  },
  "color-good": {
    "$type": "color",
    "$value": "oklch(36% 0.085 155)"
  },
  "color-good-soft": {
    "$type": "color",
    "$value": "oklch(94% 0.025 155)"
  },
  "color-error": {
    "$type": "color",
    "$value": "oklch(42% 0.14 25)"
  },
  "color-error-soft": {
    "$type": "color",
    "$value": "oklch(95% 0.025 25)"
  },
  "color-transparent": {
    "$type": "color",
    "$value": "transparent"
  },
  "color-overlay": {
    "$type": "color",
    "$value": "oklch(25% 0.025 265 / .35)"
  },
  "font-display": {
    "$type": "fontFamily",
    "$value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
  },
  "font-body": {
    "$type": "fontFamily",
    "$value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
  },
  "space-xs": {
    "$type": "dimension",
    "$value": "4px"
  },
  "space-sm": {
    "$type": "dimension",
    "$value": "8px"
  },
  "space-md": {
    "$type": "dimension",
    "$value": "16px"
  },
  "space-lg": {
    "$type": "dimension",
    "$value": "24px"
  },
  "space-xl": {
    "$type": "dimension",
    "$value": "32px"
  },
  "space-2xl": {
    "$type": "dimension",
    "$value": "48px"
  },
  "space-3xl": {
    "$type": "dimension",
    "$value": "64px"
  },
  "text-xs": {
    "$type": "dimension",
    "$value": "1rem"
  },
  "text-sm": {
    "$type": "dimension",
    "$value": "1.125rem"
  },
  "text-base": {
    "$type": "dimension",
    "$value": "1.125rem"
  },
  "text-lg": {
    "$type": "dimension",
    "$value": "1.25rem"
  },
  "text-xl": {
    "$type": "dimension",
    "$value": "1.5rem"
  },
  "text-heading": {
    "$type": "dimension",
    "$value": "clamp(2rem, 4vw, 3rem)"
  },
  "text-display": {
    "$type": "dimension",
    "$value": "clamp(2.6rem, 5.4vw, 4.8rem)"
  },
  "radius-sm": {
    "$type": "dimension",
    "$value": "4px"
  },
  "radius-md": {
    "$type": "dimension",
    "$value": "8px"
  },
  "radius-round": {
    "$type": "dimension",
    "$value": "50%"
  },
  "rule-hair": {
    "$type": "dimension",
    "$value": "1px"
  },
  "dur-fast": {
    "$type": "duration",
    "$value": "120ms"
  },
  "ease-out": {
    "$type": "cubicBezier",
    "$value": [
      0.16,
      1.0,
      0.3,
      1.0
    ]
  },
  "ease-in": {
    "$type": "cubicBezier",
    "$value": [
      0.7,
      0.0,
      0.84,
      0.0
    ]
  },
  "ease-in-out": {
    "$type": "cubicBezier",
    "$value": [
      0.65,
      0.0,
      0.35,
      1.0
    ]
  }
}
```

### shadcn variables

```css
:root {
  --background: 99% 0.003 265;
  --foreground: 25% 0.025 265;
  --card: 97% 0.006 265;
  --card-foreground: 25% 0.025 265;
  --popover: 99% 0.003 265;
  --popover-foreground: 25% 0.025 265;
  --primary: 45% 0.19 265;
  --primary-foreground: 99% 0.003 265;
  --secondary: 94% 0.01 265;
  --secondary-foreground: 25% 0.025 265;
  --muted: 94% 0.01 265;
  --muted-foreground: 36% 0.025 265;
  --accent: 45% 0.19 265;
  --accent-foreground: 99% 0.003 265;
  --destructive: 42% 0.14 25;
  --destructive-foreground: 99% 0.003 265;
  --border: 65% 0.014 265;
  --input: 65% 0.014 265;
  --ring: 32% 0.09 265;
  --radius: 8px;
}
```
