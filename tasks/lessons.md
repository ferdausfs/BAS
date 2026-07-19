# Lessons — cross-session rules for future agents

## For bulk class sweeps in large files, use scripted replace with MISS reporting — not 30 sequential edit blocks (2026-07-19)
During BAS0001 Phase 5, `AdminPanel.tsx` (1373 lines) needed the same 3–4 class
patterns (`bg-white rounded-2xl` cards, `border-ink/10 bg-cream` inputs, status
color pairs) replaced in ~60 places, plus one ~85-line single-block edit. A giant
`old_text` block that actually existed in the file failed fuzzy matching ("Context
not found"), and doing 60 small edits one-by-one would have been slow and
drift-prone. The reliable pattern: a small Python script doing
`str.count()` → assert expected count → `str.replace()` for each pattern, printing
`MISS:`/`COUNT MISMATCH` with the pattern prefix when reality disagrees. Every
assumption is verified as it runs, you get a complete audit trail in the output,
and follow-up greps confirm nothing was half-applied. **Fix going forward:** when a
phase calls for the same token swap more than ~5 times in one file, script it with
count assertions instead of sequential edit_file calls; keep single-instance
structural edits (hero cards, headers) as normal edit blocks where review
readability matters. Also: `npm install` on a fresh clone may churn
`package-lock.json` platform metadata — `git checkout -- package-lock.json` before
packaging so the phase ZIP only carries intended files.

## QuickBar-safe screen headers need explicit top/right clearance (2026-07-19)
`QuickBar.tsx` is fixed at `top-4 right-4` on every screen except splash/product/home,
so any non-home screen that also puts its own header action in the top-right corner
(Categories filter button, Wishlist title row, future pushed screens) will visually fight
that floating control unless the screen deliberately reserves space for it. During BAS0001
Phase 2, the clean fix was **screen-level clearance**, not moving the global QuickBar:
use extra top padding (`pt-20` range) and right padding (`pr-18` range) for the screen
header, and avoid placing a second top-right action on the same vertical band unless it
sits clearly below QuickBar.

**Fix going forward:** whenever restyling any non-home screen, check it with QuickBar in
mind first — especially pushed screens (`wishlist`, future account/admin pages) and tab
screens with their own header buttons. Don’t assume the screen looks fine just because its
layout works in isolation; it must coexist with the global floating chrome actually used in
App.tsx.

## Verify claims against the actual file, not just your own log text (2026-07-19)
During BAS0001 Phase 0, `AGENT_LOG.md`/`tasks/todo.md` both stated `index.html`'s
Google Fonts `<link>` had Fraunces/Great Vibes removed and Poppins added — but the
delivered ZIP's `index.html` still had the old link untouched. `src/index.css` and
`tailwind.config.ts` correctly referenced `"Poppins"`, which masked the problem during
a quick self-check (the font-family string looked right everywhere you'd think to
check) — but the font file itself was never loaded, so it would have silently fallen
back to system sans in the browser. Caught only because Claude re-grepped the raw file
before pushing.

**Fix:** Before writing "done" in `AGENT_LOG.md`/`tasks/todo.md` for any claimed file
change, `grep`/`cat` the actual file and confirm the specific claimed string/change is
really there — don't infer it's done because a *related* file (like the CSS that
*consumes* the font) looks correct. Cross-file claims (touching a `<link>` in one file
because a `font-family` changed in another) are exactly where this kind of drift hides.


## Termux command sequencing (2026-07-05)
When giving the user (Termux, one-command-at-a-time) instructions that mix
"copy a file from Downloads into the repo" + "git add" in the same message,
they will sometimes only run the `git add`/`git commit` lines and skip the
`mkdir`/`cp` lines above them — because those look like setup noise, not the
actual action.

**Fix:** Never split "create the file locally" from "git add it" across
multiple bash blocks or multiple lines they might skim past. Either:
1. Give exactly ONE command per message when a prerequisite step (mkdir/cp)
   is required before git add — no multi-line blocks with 3+ unrelated steps, or
2. Bundle the prerequisite and the git command with `&&` so it fails loudly
   as one unit instead of silently no-op'ing (e.g. `mkdir -p tasks && cp ... && git add ...`).
3. Before telling the user to `git add <path>`, confirm in the same message
   that the path will actually exist at that point (don't assume an earlier
   present_files output means the file is already inside their repo clone —
   it's in their Downloads, not the repo, until they cp it).

## Android Downloads folder auto-renames duplicates (2026-07-05)
If a filename already exists in `~/storage/downloads/`, a fresh download of
a same-named file gets silently renamed with a `(1)`, `(2)`... suffix by the
OS/browser — it does NOT overwrite. Any `cp ~/storage/downloads/<name>.md`
command assuming the exact original name will fail with "No such file".

**Fix:**
1. Never assume a just-downloaded file has its original name. First run
   `ls -la ~/storage/downloads/ | grep -i <exact-substring>` (no angle
   brackets, no placeholder tokens — a real substring like `agent_log`) to
   see the actual name before writing any `cp` command.
2. Names with spaces/parentheses (e.g. `AGENT_LOG (1).md`) MUST be quoted
   in the cp command: `cp "~/storage/downloads/AGENT_LOG (1).md" ...` —
   unquoted, the shell splits it into multiple arguments and errors.
3. Never paste a literal placeholder like `<filename_part>` into a real
   command — it causes a bash syntax error (`<` starts a redirect). Always
   substitute a real word before sending the command to the user.
4. Not every file offered via present_files is guaranteed to actually be
   downloaded by the user (they may only tap download on some of several
   files shown). Before a batch `cp && cp && git add` command, verify each
   individual file is present in Downloads rather than assuming all are.

## Swipe/drag gestures on real touch devices need native touch listeners, not Pointer Events alone
A cart-item swipe-to-delete was first built with React's synthetic Pointer
Events (`onPointerDown/Move/Up`) and passed `tsc`/`npm run build` cleanly,
but didn't actually work when swiped on a real device — the mobile browser's
own vertical-scroll gesture recognizer wins the very first touch and cancels
the drag before the pointer handlers can call `preventDefault()`. This is
the same root cause already documented for `ProductScreen.tsx`'s
image-gallery swipe: only a native `addEventListener('touchmove', fn,
{ passive: false })` (attached via `useEffect` on a ref, not React's
synthetic touch/pointer props) can call `preventDefault()` in time to
suppress the browser's default scroll and let a custom horizontal drag win.
**Fix going forward:** for ANY new swipe/drag-to-reveal gesture on a card or
list row, go straight to the native-touch-listener pattern from
`ProductScreen.tsx` (touchstart passive:true → touchmove passive:false with
a horizontal-vs-vertical lock decided after a small movement threshold →
touchend/touchcancel) instead of Pointer Events — Pointer Events look like
they should work and pass every build/type check, but silently fail on
real mobile touch input specifically because of this passive-listener
scroll-priority issue. Don't declare a touch gesture "done" on the strength
of a clean build; it needs to be verified as actually swipeable, and if
that can't be confirmed in this environment, say so explicitly rather than
presenting an untested gesture as finished.


Fixed-position global overlays must be cross-checked against all screens for
competing header elements (carried over from prior sessions).

## cart vs checkout routes
The `cart` route leads to the "My Cart" review page, while `checkout` leads
to the final payment page — these are distinct and must not be conflated.

## Ambiguous shorthand answers to design questions need a stated interpretation, not silent guessing
Asked the user 3 specific yes/no design questions (banner photo, header greeting,
chip active-state). Two answers came back as terse Banglish shorthand ("full
screen dekho", "sob kisu kaj korte hobe") instead of picking one of the given
options. **Fix going forward:** when an answer to an elicitation question is
ambiguous, don't silently pick an interpretation and just start coding — state
the interpretation explicitly in the response before or while implementing
("এটা আমি এভাবে বুঝলাম... তাই এই fix করছি"), so the user can correct course
immediately if the reading was wrong, without waiting for a full ZIP+review
cycle to discover a mismatch.

## Restyling a section is not the same as reordering it
During an earlier Home-screen wireframe pass, "add the missing Exclusive
Offers header" and "match the wireframe's section order" were treated as the
same task and only the first was actually done — the banner kept its original
position below Explore Categories instead of moving above it, even though the
log entry described the work as matching the reference layout. **Fix going
forward:** when a review report calls out a layout/order gap, verify the
*position* of the JSX block in the file, not just whether its internal
content/labels match the reference. A section can be pixel-perfect on its own
and still be in the wrong place in the page flow.

## Search the whole file for existing UI before adding new UI
Added a "store contact" row to `ProductScreen.tsx` to close a wireframe gap,
without grepping the rest of the (1000+ line) file first. A near-identical
card ("Bake Art Style brand card (Check 1 Option 2)") already existed further
down the same file from an earlier session, so the live app showed the same
"Bake Art Style" contact block twice. **Fix going forward:** before adding any
new section/component to an existing screen, `grep -n` the target file for
the feature's likely keywords (brand name, section comment tags like
"Check N", relevant labels) across the *entire* file — not just the section
being edited — to confirm it doesn't already exist elsewhere. This applies
especially to large multi-hundred-line screen files where a `view` of one
section can miss something present later in the same file.

## Token-cascade redesigns: keep legacy CSS-var names, re-point their values; audit inline hexes separately
For a multi-session palette swap (BAS0001 soft-pink redesign), the cocoa/
caramel tokens (`coral`, `blush`, `cream`, `paper`, `ink`, `gold`) are
consumed by ~30 of 62 source files via Tailwind classes (`bg-coral`,
`text-ink`, `glass-strong`, `font-display`). The cheap, safe foundation
(Phase 0) is to **keep the legacy CSS-var names and re-point them at the
new hex values** in `@theme` — that auto-cascades the new palette to every
class consumer with zero JSX churn. Add the NEW explicit semantic tokens
(`primary`/`secondary`/`accent`/`surface`/`text-secondary`/...) alongside,
and let per-phase screen rebuilds migrate from legacy names → semantic
names gradually. **BUT:** this only reaches files using *token classes*.
Files with **inline literal hexes** (`bg-[#A8672E]`,
`style={{color:'#C9963C'}}`) do NOT cascade — they keep rendering the old
color until a later phase restyles that file. So after a token swap,
ALWAYS `grep -rnoE` the old hexes across `src/` and record the per-file
counts in the handoff, mapped to which future phase touches each file
(they almost always line up with the phase file-scope, since a screen
that hardcodes a hex is a screen you'll be restyling anyway). Rule for
every subsequent phase: while restyling a file, replace its inline
old-palette hexes with the new semantic tokens — never leave new tokens
and old hexes side by side in the same file.

## CSS-var re-declarations in `:root` can silently override `@theme`
`src/index.css` had a second `:root {}` block at the very bottom of the
file ("BAKERY WARM SURFACE LAYER") that re-declared `--color-cream`,
`--color-ink`, `--color-ink-200`, `--color-ink-300` with the OLD cocoa
values. Because `:root` comes AFTER `@theme` in source order, those
re-declarations won the cascade and would have silently kept the app on
the old palette no matter what `@theme` said. When swapping tokens, grep
the WHOLE css file for every `--color-*` / `--font-*` re-declaration
outside `@theme` and update-or-remove all of them — `@theme` should be
the single source of truth. Same hazard for duplicate `.class {}` blocks
further down the file overriding the ones you just edited: pick one
definition, delete the rest.


## Dead CSS class definitions count as stragglers in a final consistency pass (2026-07-19)
During BAS0001 Phase 6 (final consistency pass), the grep-zero straggler audit
flagged not just JSX class usages but also DEAD CSS class definitions that no
longer had any JSX consumer. `.glass-strong`/`.glass-deep`/`.glass-tint`/`.glass`/
`.glass-subtle`/`.glass-dark` (renamed to solid surfaces in phases 1–5), `.mesh-warm`,
and unused gradient utilities (`.text-gradient-coral`, `.badge-premium`, `.hairline`,
`.confetti-dots`) all still carried `glass-*` / `linear-gradient` / `radial-gradient`
strings in `src/index.css` even though zero `.tsx` files referenced them — they only
surfaced because the sweep covers the whole `src/` tree, not just `src/**/*.tsx`.
**Fix:** when a phase migrates every consumer of a token/class away, also DELETE the
now-dead CSS class definition (and the `@theme` var if unreferenced) in the same
pass — otherwise a later "grep should return nothing" audit fails on dead code.
Confirm 0 JSX references with `grep -rn "<class>" src` (ALL extensions, not just
`.tsx`) before deleting.

**Companion guard for bulk class-token removal scripts:** when stripping a class
token (e.g. `font-display`) across many files, collapse ONLY internal multi-space
runs with a leading-non-space guard — `re.sub(r'(\S)[ \t]{2,}', r'\1 ', s)` —
NEVER a bare `re.sub(r'\s{2,}',' ',s)`, or you destroy JSX indentation (leading
line whitespace is a horizontal run with no `\S` before it, so the guard skips it).
