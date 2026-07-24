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


## Phase-scoped spacing pass: retuning a shared component is only safe if it lives inside the current batch
During BAS0002 Phase L1 (browse batch A: HomeScreen / Categories / Wishlist), the reusable
`SectionHeader` component needed retuning to adopt the L0 `.layout-section-*` rhythm. Before editing
it, `grep` its usages: it turned out `SectionHeader` is imported by **only HomeScreen** (3 uses), so
retuning it was safely inside the L1 batch. If it had also been used by ProductScreen / CartScreen
(later phases), changing it would have leaked unverifiable spacing regressions into screens this run
must not touch. **Fix going forward:** when a phase wants to adopt a foundation primitive via a SHARED
component (SectionHeader, ProductCard, etc.), first `grep -rn` every consumer; if any consumer is
outside the current phase's screen set, either (a) apply the change per-screen inline instead, or
(b) explicitly note the cross-phase effect in `AGENT_LOG.md` and accept it's a convergent change the
final-consistency phase will audit.

## Page-edge padding swaps (px-5 to px-6) must target page-edge wrappers only, never blanket-replace
When bringing screens to the reference's 24px page edge (`.page{padding:0 1.5rem}` -> Tailwind `px-6`),
the SAME class token `px-5` is also used for BUTTON-internal horizontal padding (e.g. `...rounded-[18px]
bg-primary px-5 text-[13px]...`). A blanket `s.replace('px-5','px-6')` therefore silently widens
buttons too. **Fix:** enumerate the exact page-edge substrings (section wrappers, content divs, the
shared header's internal pad) and replace each with a count assertion; keep the button-internal `px-5`
untouched. Always `grep` afterward to confirm zero page-edge `px-5` remain AND the button `px-5` count
is unchanged.

## Hero-floating controls are NOT page-edge wrappers — don't apply px-6 to them
During BAS0002 Phase L2, the floating back/share/heart buttons on ProductScreen sit ON the hero
image (`position:absolute; z-20; px-5`), not in the `.page` content flow. The reference `.p-top`
uses `left:1.4rem; right:1.4rem` (≈22px) on the hero, while `.page` content uses `1.5rem` (24px).
Converting these floating controls from `px-5` to `px-6` would be wrong — they're on the image,
not in the page flow. **Fix:** when doing page-edge padding sweeps, distinguish between content
that flows in the `.page` wrapper and fixed/absolute-positioned overlays on top of imagery. Each
has its own proportion convention from the reference.

## Back/round-action button convention: 44px circle, surface, shadow, NO border
The GroceryApp reference `.back` and `.round-act` are 2.75rem (44px) circles with `background:#fff`
and `box-shadow:var(--shadow)`, and NO border. BAS screens had accumulated various button sizes
(h-9/h-10/h-11) and all had `border border-border`. The L0 `.layout-back`/`.layout-round-action`
foundation defines the convention correctly. During L2, every back/round-action button across the
5 purchase-flow screens was standardized to: `h-11 w-11 rounded-full bg-surface shadow-card` with
NO border. The only exception is the `.round-act.g` ghost variant (for contact buttons on
ProductScreen), which correctly keeps a light border and no shadow. **Fix going forward:** any
new screen or component using back/round-action buttons must follow the L0 convention (44px circle,
surface bg, shadow, no border) — don't reintroduce `border border-border` on floating chrome buttons.

## Card radius convention: rounded-2xl (16px = 1rem) for bordered content cards
The reference uses `border-radius:1rem` for most bordered content cards (`.pcard`, `.citem`,
`.icard`, `.rcard`, `.ocard`, `.paycard`). BAS had accumulated `rounded-[20px]` across many card
instances. During L2, all `rounded-[20px]` was normalized to `rounded-2xl` (16px) across the
purchase-flow screens. The content sheet overlay radius (`rounded-t-[22px]`) and sticky CTA bar
radius (`rounded-t-[22px]`) are a different convention — they match the reference `.phero` /
`.btn-row.bar` radius of `1.4rem` ≈ 22px, which is for overlay sheets and footer bars, not
content cards. **Fix going forward:** use `rounded-2xl` for bordered content cards, and
`rounded-t-[22px]` for overlay sheets and sticky footer bars.

## Hero / permission / success pages get wider reference side-padding — conform to the BAS-wide 24px edge and state the interpretation (2026-07-19)
During BAS0002 Phase L3, `SuccessScreen.tsx` was the only post-purchase screen still using `px-7`(28px)
for its outer side padding; every other BAS screen uses the L0/L1/L2-standard 24px edge (`px-6`). The
GroceryApp reference gives permission/success/hero screens extra room (`.succ-wrap`/`.perm` use
`padding:0 2.2rem` ≈ 35px) — but that does NOT mean BAS should widen those screens. For a multi-session
spacing pass whose goal is *consistent cross-screen rhythm*, conform hero/permission/success pages to
the established BAS-wide 24px page edge (`px-6`) so they match the rest of the app, and explicitly note
the interpretation in `AGENT_LOG.md` (the reference is wider, but consistency won. **Fix going forward:**
when a phase touches a hero/permission/success screen whose reference padding exceeds `.page`, default to
the BAS-wide 24px edge for consistency, document the choice in the log, and only keep the wider padding if
there's a strong screen-specific reason (e.g. a deliberately airy centered hero) — don't silently widen.

## Shared search/dropdown chrome affects more than Home — log the cross-screen footprint (2026-07-19)
During BAS0002 Phase L4, the search dropdown structure lived in the reusable `SearchBar` component,
not only inside `HomeTopBar`. `grep -R "<SearchBar" src` showed it is also used by `CategoriesScreen`,
so retuning input height, round-action sizing, and dropdown row rhythm necessarily affects both Home and
Categories search chrome. **Fix going forward:** before changing shared chrome primitives (SearchBar,
HomeTopBar, section/header helpers), grep all consumers and explicitly record any outside-phase footprint
in `AGENT_LOG.md`; keep the change purely structural/spacing and let the final consistency pass audit the
convergent cross-screen result.

## Final consistency pass: triage straggler greps by CATEGORY, and split "auto-fix" vs "propose" by magnitude (2026-07-19)
During BAS0002 Phase L5 (final pass), broad greps for convention tokens are extremely noisy:
`grep h-10 w-10` / `grep rounded-[20px]` returns dozens of hits, but the convention applies to ONE
category each — the 44px round-action rule is for app-bar back/chrome buttons (NOT steppers, icon
chips, empty-state icons, add buttons, or carousel arrows on imagery), and the `rounded-2xl` content-card
rule is for bordered list/content cards (NOT icon tiles, filter chips, or the deliberately airy
empty-state/hero cards from BAS0001). **Fix:** before changing ANY grep hit, classify it (back-button
chrome? content card? sheet? button-internal padding? hero-floating? icon chip?) and only act on hits
in the convention's actual category. Verify the real back buttons by finding the ArrowLeft/ChevronLeft
icons and reading their parent `<button>`, not by grepping size tokens blind.

**Auto-fix vs propose:** a final pass should AUTO-FIX unambiguous, low-risk convention violations
(e.g. two back-button icons left at 18px while every other is 20px; two non-auth sheets at
`rounded-t-[28/32px]` while 10 in-scope sheets are `rounded-t-[22px]`), but only PROPOSE (don't
auto-apply) high-magnitude changes that touch a deliberate value set in an EARLIER pass on a prominent
SHARED component. Concretely: the shared `ProductCard` is `rounded-[22px]` (set in BAS0001 Phase 1) while
every sibling content card is `rounded-2xl`/16px (reference `.pcard{1rem}`); it survived the L2/L3
`rounded-[20px]→rounded-2xl` sweep precisely because its value was 22px, not 20px. Changing it restyles
every product tile app-wide and overrides a BAS0001 choice, so L5 logged it as a recommendation for Buddy
rather than auto-applying. **Rule:** when a straggler is (a) app-wide in blast radius AND (b) a value a
prior pass deliberately set, surface it with full reasoning and let Buddy decide; reserve auto-fixes for
scoped, unambiguous violations.

**Sheet convention recap (for future audits):** in-scope bottom sheets / sticky bars = `rounded-t-[22px]`
+ 24px (`px-6`) edge. AuthSheet stays `rounded-t-[28px]` (auth flow is out of scope), AdminPanel keeps its
own radii (internal tool). Sheet *close* buttons legitimately come in two styles (NotificationsSheet's 44px
round-action vs the `h-10 w-10 rounded-[14px] bg-secondary` rounded-square used by OccasionSheet /
CategoriesScreen-filter / AuthSheet) — that variance is stylistic, not a spacing/rhythm violation.

## Verify comments against actual logic (2026-07-24)
A code comment claiming a fix was applied (e.g. '// GPU-safe (Fix 4)') is not proof the fix was applied — always diff the actual logic/types against the stated fix before marking an audit item done.

## Full-screen loading states should use shape-matched shimmer skeletons (2026-07-24)
For data-heavy mobile screens, avoid centered bouncing-dot loaders in empty space. Build skeletons that match the final card/list layout (thumbnail blocks, text lines, status pills/timeline dots) and reuse the existing `.shimmer` class so loading states share one visual language app-wide. This reduces perceived layout shift and feels native/premium.

## Search intent state should prioritize results above browse/promotional modules (2026-07-24)
When a screen enters an active search state, suppress non-search browse/promotional modules above the results (categories, banners, helper cards) instead of merely hiding the hero. Search results/no-results should appear immediately after the search chrome so typed intent gets priority. Keep the hidden modules in JSX behind `!hasSearch` rather than deleting them, so normal browse mode is unchanged.

## Bangla-first i18n should be phased with sentence-level keys (2026-07-24)
For the BAS bilingual rollout, default language is Bangla (`bn`) with English (`en`) as secondary. Do not big-bang translate every hard-coded string across Checkout/Admin/ChatBot in one pass; add i18n foundation first, then migrate screen batches. Prefer sentence-level translation keys with interpolation (`orders.summary`, `checkout.errors.invalidPhone`) over tiny word-by-word keys, and keep common Bangali-used English terms (Order, Checkout, Profile, Wallet, Coupon, Delivery, Payment, Search, Tracking, Support, bKash, Nagad) when they read more natural in Bangla mode.

## Runtime i18n bridge is temporary broad coverage, not a replacement for explicit keys (2026-07-24)
For a large existing app with hundreds of hard-coded strings, a runtime text/placeholder/aria-label translator can provide broad Bangla-first coverage quickly while preserving English mode. Treat it as a bridge: keep exact-match maps conservative, verify every phase with typecheck/build, and gradually migrate high-traffic screens to explicit `useT()` sentence-level keys. Product/admin-entered Firestore content still needs localized fields or owner-provided translations; runtime maps only translate known exact UI strings.
