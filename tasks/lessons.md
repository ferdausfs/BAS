# Lessons — cross-session rules for future agents

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

## Cross-checking fixed-position global overlays
Fixed-position global overlays must be cross-checked against all screens for
competing header elements (carried over from prior sessions).

## cart vs checkout routes
The `cart` route leads to the "My Cart" review page, while `checkout` leads
to the final payment page — these are distinct and must not be conflated.

## "Premium" feedback = depth, not just hue variety
When user says a screen "still doesn't feel premium" after a color-differentiation
pass, don't assume more/different hues are the fix. Check whether the element in
question actually has shadow/gradient/border depth like the rest of the app's
`glass-strong`/`shadow-*` treatment — a flat solid-color square (no shadow, no
gradient, no border) will read as flat regardless of how many distinct hues it
uses. Compare the flat element's CSS against a working reference (e.g. SearchBar's
`shadow-[...]`, `.glass-strong`'s layered box-shadow + gradient) before proposing
a new color-only fix.
