# Biuno

A static, multilingual collection of nine short browser games. English, German,
Czech and Polish pages are generated as ordinary HTML. The games use vanilla
JavaScript; there is no backend, user account, framework, external font, CDN,
analytics script or advertising dependency.

## Run locally

Requires Node.js 18+ and Python 3 for the optional preview command.

```sh
npm run build
npm test
npm run verify
npm run serve
```

Open http://localhost:4173/en/ (or `/de/`, `/cs/`, `/pl/`). No package installation
is needed to build, run or test the game engines. Serve over HTTP locally; opening
HTML through `file://` does not provide reliable storage or service workers.

## Games

| Game | Round | Modes |
| --- | --- | --- |
| Matching Pairs | One board; 6, 8 or 10 pairs | Three difficulties |
| What Changed? | Five image-replacement questions | 4, 6 or 8 pictures |
| Sequence Memory | Five increasingly long sequences | Three lengths/speeds |
| Minesweeper | Clear every safe cell | 5, 7 or 9 mines on a 6×6 board |
| Sea Battle | Sink three ships | Random, targeted or checkerboard computer search |
| Tic-tac-toe | Three in a row | Random, defensive or perfect opponent |
| Codebreaker | One code; eight attempts | 3, 4 or 5 positions; six symbols |
| Pipe Puzzle | Connect one generated pipe network | 3×3, 4×4 or 5×5; optional hints |
| Mental Math | Ten multiple-choice questions | Three number ranges |

Daily play uses a UTC date and deterministic seed shared across languages, at
standard difficulty. The trio includes one memory game, one logic game and
arithmetic. Ordinary rounds have fresh seeds. No game has a countdown deadline.
All controls are native buttons, usable with touch, mouse, Tab and Enter/Space.
Escape pauses. Switching away pauses an active round; sequence input restarts its
demonstration on resume. Scores are separate by game and difficulty.

## Source layout

- `src/engine.mjs`: deterministic generators, pipe validation, code feedback, scoring.
- `src/game.mjs`: shared round controller and nine game interfaces.
- `src/i18n.mjs`: all four translation dictionaries.
- `src/art.mjs`: native emoji pictures, pipe SVGs and board previews.
- `src/storage.mjs`: versioned local state and records.
- `src/app.mjs`: language navigation, filtering, daily links, progress management.
- `tokens.css`, `styles.css`, `redesign.css`: local system fonts, royal blue/grey
  design and responsive styles. The final presentation layer is `redesign.css`.
- `design.md`: shared game-first design system for all locale pages.
- `scripts/build.mjs`: generates 40 localized pages, metadata and service worker.
- `dist/`: self-contained static hosting output.

Editing source requires rebuilding `dist/`. To set canonical and sitemap origins:

```sh
SITE_ORIGIN=https://biuno.com npm run build
```

The private Sites preview is separate from the requested Biuno.com custom domain.
No DNS or custom-domain changes are performed by this repository. The hosting
manifest records the preview Site identity. Canonicals should use the actual
public origin when publishing to a custom domain.

## Local data and offline use

`localStorage['biuno:v1']` stores small game sessions, settings, records and daily
results. Progress is shared across locale pages on the same origin, but not across
origins, devices or browsers. Blocked storage falls back to an in-memory session.
Progress can be exported/imported as JSON. Import replaces records and omits
unfinished sessions; reset and import offer Undo. Clearing browser data removes
records. No data is sent to a Biuno game backend.

A versioned service worker pre-caches all locale pages and game assets after a
successful visit. Offline use requires successful installation. Content changes
change the cache hash; a fully cached update activates immediately and active
clients reload once to receive the new presentation, preserving saved rounds. The hosting
provider may have separate access authentication and connection logs, explained
on the localized privacy pages. A protected preview may need sign-in initially.

## Naming and research

Games for the Brain was reviewed for mechanics, not copied for code or artwork:

- [Mastercards](https://www.gamesforthebrain.com/game/mastercards/): matching pairs.
- [Mastermind](https://www.gamesforthebrain.com/game/mastermind/): image replacement.
- [Memocoly](https://www.gamesforthebrain.com/game/memocoly/): sequence recall.
- [Guess the Colors](https://www.gamesforthebrain.com/game/guesscolors/): code deduction.
- [Rotate²](https://www.gamesforthebrain.com/game/rotate2/): pipe rotation.
- [NumberHunt](https://www.gamesforthebrain.com/game/numberhunt/): arithmetic.

Names describe familiar mechanics instead of adopting reference-site branding.
The pairing game is localized as Pexeso in Czech and Paare finden in German.
`memory®` is identified as a registered mark by Ravensburger; Mastermind is marketed
by Hasbro and has an active Canadian game-software registration. These preliminary
findings are not a comprehensive German/EU trademark clearance. No verified
keyword-volume comparison was available, and no search-traffic advantage is claimed.
The site makes no IQ-measurement or medical cognitive-improvement claims.

## Verification

`npm test` exercises all nine generators, repeated-symbol code feedback,
450 generated pipe boards, 1,500 arithmetic questions, daily selection and locale
coverage. `npm run verify` checks generated HTML, locale alternates, local links
and offline versioning.

Optional browser acceptance uses Playwright and installed Chrome/Chromium:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROME_PATH='/path/to/chrome' node tests/browser.cjs
```

It audits all 52 locale routes at 320, 375, 414, 768 and 1280px, completes all six
games through their UI, exercises mismatch/pause/resume and locale persistence,
progress export/reset/undo, offline navigation and denied storage. Screenshots
and machine-readable results go to ignored `artifacts/`. Physical devices and
Safari/Firefox need separate testing; desktop Chromium emulation is not equivalent.

The imprint uses the operator name, address and email supplied by the owner. Other
business details should only be added if they apply and are confirmed by the owner.

## Game-first redesign

Game pages now use a compact wordmark/game/language navigation bar, a title and
subtitle, and one large central play surface. Instructions expand below the board;
the personal best sits below it. Start screens show an inert board preview instead of repeating
the full instructions. On results, Play again is on the right, with Share with
friends and Play another game as secondary actions. Random selection excludes
the current game and retains the current language. Share opens the native share
sheet when available, falls back to copying the game URL, and finally offers a
selectable URL in a native dialog. No sharing happens without pressing the button.

`npm run test:redesign` (with the same Playwright environment as above) checks
these controls in all four languages, fresh replay seeds, preserved best scores,
native sharing, clipboard and dialog fallbacks, share cancellation and navigation.

## Readability refinement

Game icons are original filled silhouettes, and pipes have thicker strokes.
Main game text and controls use at least 18px, with at least 16px for compact
navigation and metadata. Darkened text colours and stronger borders improve
contrast. Decorative arrow glyphs are removed; native select indicators remain.

How to play is an optional native disclosure below the board, with three clear
steps. Opening it during play pauses the round and keeps keyboard focus on the
disclosure. New browser profiles start at Easy; saved preferences are preserved.

Correct answers advance after 1.6 seconds, without another click. Incorrect answers
stay visible until the player chooses to continue. Picture study remains untimed.
Sequence demonstrations are slower. During play, a single control row contains
Pause and the current game's necessary action; New round is in the pause screen.

`npm run test:readability` verifies these flows, including pausing and restoring
pending automatic transitions, solid icons, large controls and measured text
contrast of at least 7:1 for the main palette pairs. This is browser acceptance,
not a claim of usability testing with older participants or full WCAG certification.


The familiar-games update adds Minesweeper (safe first neighbourhood, flood reveal,
flags), Sea Battle (automatic fleets and a computer opponent), and Tic-tac-toe
(random, defensive and perfect-play opponents). All have three difficulty levels,
resumable rounds, local records and replay/share/random-game controls. Sea Battle
uses the generic name to avoid presenting this independent game as a Hasbro product.

Game pictures are native colour emoji; Sequence Memory uses four coloured,
numbered pads. Instructions, sourced background and a task-specific explanation
of the skills used are native disclosures below the game. No claims of general
cognitive improvement are made. SEO titles and visible about headings include
localized “play [game] online” language. Microanimations respect reduced motion.
`npm run test:classics` completes all three additions in four languages, checks
flags, opponent pause/restore, replay, matching disclosure borders and pad colours.
