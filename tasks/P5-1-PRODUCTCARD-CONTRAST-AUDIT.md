# BAS P5-0 — ProductCard Contrast Audit

**Date:** 2026-07-21  
**Repo:** https://github.com/ferdausfs/BAS  
**Commit reviewed:** `da29a9e` — P4-2 Settings honesty complete  
**Review type:** Review-only; no `src/` code changes

## Important limitation

This environment cannot hold a real Android phone or capture physical-device photos. The matrix below is therefore a static code/layout audit plus a device-test checklist, not a claim that the cards were visually verified on a physical device. The final recommendation deliberately avoids an unverified CSS change.

## ProductCard rendering facts

- Shared component: `src/components/ProductCard.tsx`
- Grid/catalog card height: 248px
- Horizontal card width: 172px
- Card uses deliberate `rounded-[24px]` styling; no radius change is proposed.
- Text is white over the image with a bottom black gradient and text shadow.
- Add action is a white pill; badges and heart have their own surfaces.

## Contrast matrix

| Image / placement | Bottom text readability risk | Add button visibility risk | Badge crowding risk | Static assessment |
|---|---|---|---|---|
| Bright white frosting / light background | Medium: white title/price can approach the image where gradient is still light | High: white pill may merge with white frosting despite shadow | Low to medium | First real-device test case |
| Dark chocolate cake | Low for text; gradient may feel heavy | Low: white pill is clear | Low | Likely acceptable as-is |
| Busy high-detail photo | Medium: text-shadow helps but fine detail can compete | Medium | Medium if all badges are enabled | Test with discount + bestseller + New together |
| Pastel cake on a light table | Medium to high | High | Low to medium | Most important contrast case |
| Home horizontal card, 172px | Medium: narrow width compresses title and badges | Medium to high | High with three stacked badges | Check badge stack and title clamp |
| Grid/catalog card, 248px | Low to medium | Medium | Medium | More breathing room than horizontal card |

## Code evidence

### Readability overlays — `src/components/ProductCard.tsx:71-73`

```tsx
<span className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/0 via-black/5 to-black/75" />
<span className="pointer-events-none absolute inset-x-[-15%] bottom-[-18%] z-[2] h-[56%] bg-[radial-gradient(ellipse_at_center,rgba(246,95,143,.18),rgba(0,0,0,0)_62%)]" />
```

The bottom has a strong fade to black, but the upper area is intentionally image-first and receives little darkening.

### Text and title clamp — `src/components/ProductCard.tsx:102-124`

```tsx
<div className="absolute inset-x-0 bottom-0 z-[3] px-3 pb-3 text-white [text-shadow:0_2px_12px_rgba(0,0,0,.44)]">
  ...
  <h3 className="line-clamp-1 ... text-white">{product.name}</h3>
```

The title is protected from overflow with `line-clamp-1`; the visual risk is contrast, not layout overflow.

### White Add pill — `src/components/ProductCard.tsx:127-135`

```tsx
<button
  ...
  className="flex h-8 min-w-[72px] shrink-0 items-center justify-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-text shadow-card ..."
>
  ...
</button>
```

The button is strong on dark imagery but may blend into bright cake photography.

### Badge and heart surfaces — `src/components/ProductCard.tsx:75-100`

Badges use dark translucent surfaces, New uses a white surface, and the heart uses a white circular surface. The left badge stack and right heart are structurally separated but should be checked at the 172px horizontal width.

## Real-device test checklist

On a real mobile viewport, test these combinations:

1. White/cream cake with light background — inspect title, price, and Add pill.
2. Dark chocolate cake — check that the bottom overlay does not feel unnecessarily heavy.
3. Busy decorated cake — enable discount, bestseller, and new badges together.
4. Pastel cake on a white table — verify price and Add pill boundaries.
5. Home horizontal card — verify badge stack, heart, one-line title, and price/action row.
6. Categories/Wishlist grid card — verify that card height and overlay feel balanced.
7. Added state — confirm `Added` remains readable and does not shift the action row.
8. Missing image fallback — confirm the overlay still supports text on fallback imagery.

## Recommendation

**Keep current ProductCard CSS for now.** The static structure is deliberate and already has:

- bottom readability gradient
- text shadow
- independent badge/heart surfaces
- clamped title/subtitle
- fixed card height per variant
- no silent layout collapse

Do not add a border or globally darken the image until a real-device test demonstrates a repeatable failure. If testing confirms a bright-image issue, the lowest-risk follow-up would be a small local border/shadow adjustment to the Add pill or a narrowly scoped readability treatment—not a global ProductCard rewrite.

## P5-1 handoff

- P5-1 implementation is **not approved by this audit**; only device validation is recommended next.
- P5-2 inventory consistency should be treated as a separate policy decision.
- P5-3 Wishlist empty states are already strong; only stale/out-of-stock saved-item messaging needs coordination with P5-2.

## Verification

- `git diff -- src/`: empty; this phase made no source-code changes.
- `npm run build`: passed — `✓ built in 5.97s`.
