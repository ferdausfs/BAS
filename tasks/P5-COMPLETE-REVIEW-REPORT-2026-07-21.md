# BAS Phase 5 — Complete UI/UX & Function Polish Review

**Date:** 2026-07-21  
**Repo:** https://github.com/ferdausfs/BAS  
**Review type:** Pure review only — no code changes  
**Reviewed state:** P3/P4 polish working tree; P5 implementation not started

## Phase 5 Scope

The next premium-focused phase should cover three related areas:

- **P5-1:** ProductCard contrast and edge-case review
- **P5-2:** Low-stock/out-of-stock consistency across browse, card, and product detail
- **P5-3:** Wishlist empty state and saved-product flow

The review found that the Wishlist empty state is already strong, while ProductCard contrast and stock-state communication still need targeted refinement.

---

# P5-1 — ProductCard Contrast & Edge Cases

## Check 1: Image-first card uses one dark gradient for text readability

**File:** `src/components/ProductCard.tsx:71-73`

```tsx
<span className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/0 via-black/5 to-black/75" />
<span className="pointer-events-none absolute inset-x-[-15%] bottom-[-18%] z-[2] h-[56%] bg-[radial-gradient(ellipse_at_center,rgba(246,95,143,.18),rgba(0,0,0,0)_62%)]" />
```

**Finding:** The bottom portion is readable on most images, but the upper half of the card has little or no darkening. The floating badge and heart are separately readable because they have their own surfaces.

**Risk:** On bright white/cream cake photos, the bottom text can still lose contrast where the image is bright and low-detail. On very dark images, the gradient plus text shadow can make the content feel visually heavy.

**Recommendation:** Do not blindly darken every card. Test a small real-device image matrix first:

- bright white frosting/background
- dark chocolate cake
- busy high-detail photo
- pastel cake on a light table
- horizontal Home card at 172px width
- grid/catalog card at 248px height

If a code fix is approved, keep it inside `ProductCard.tsx` and prefer a subtle local readability treatment over a global overlay rewrite.

---

## Check 2: Add button is visually strong, but bright-image behavior needs device review

**File:** `src/components/ProductCard.tsx:127-135`

```tsx
{(product.inStock ?? true) && (
  <button
    type="button"
    onClick={handleAdd}
    className={`flex h-8 min-w-[72px] shrink-0 items-center justify-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-text shadow-card ...`}
  >
    {added ? ... : <>Add <Plus ... /></>}
  </button>
)}
```

**Finding:** The white pill is intentionally prominent and matches the Option-B image-first direction. It should remain visually discoverable on dark cards.

**Risk:** On a very bright image, the white button can visually merge with the cake/background even though it has a shadow. The “Added” success state changes text color but keeps the same white surface.

**Recommendation:** Validate on real mobile viewport before changing. If needed, add only a subtle border or a token-based shadow; do not replace the white-pill direction without a design decision.

---

## Check 3: Floating badge/heart overlap at narrow widths

**File:** `src/components/ProductCard.tsx:75-100`

```tsx
<div className="absolute left-2.5 top-2.5 z-[4] flex flex-col gap-1">
  ... badges ...
</div>

<button className="absolute right-2.5 top-2.5 z-[4] flex h-9 w-9 ...">
  <Heart ... />
</button>
```

**Finding:** Badges stack on the left while the heart stays on the right, which is structurally safe. The risk is horizontal crowding when a product has multiple badges and the image is shown in the 172px horizontal variant.

**Recommendation:** Device-test a card with all three states active: discount + bestseller + new arrival. If collision occurs, cap or compress badge presentation locally. Do not alter ProductCard height or shared card radius in this phase without approval.

---

## P5-1 Scope Proposal

**Preferred in-scope file:**

- `src/components/ProductCard.tsx`

**Out of scope:**

- Product data/store logic
- Home/Categories layout rewrites
- ProductCard radius redesign (`rounded-[24px]` is a deliberate earlier choice)
- Wishlist business logic
- Gesture/touch listeners

**Priority:** P1 visual validation, low code risk after device review.

---

# P5-2 — Low-Stock & Out-of-Stock Consistency

## Check 4: Home and Categories hide out-of-stock items entirely

**Files:** `src/screens/HomeScreen.tsx:48`, `src/screens/CategoriesScreen.tsx:60`

```tsx
const availableProducts = useMemo(
  () => safeArray<Product>(products).filter(
    (product) => (product.approved ?? true) && (product.inStock ?? true)
  ),
  [products]
);
```

```tsx
const approvedProducts = useMemo(
  () => safeArray<Product>(products).filter(
    (product) => (product.approved ?? true) && (product.inStock ?? true)
  ),
  [products]
);
```

**Finding:** Out-of-stock products disappear from the main browse surfaces instead of being shown with an unavailable state.

**Gap:** This is clean for conversion, but it creates inconsistent discovery: a user may see a product in an old link, wishlist, or order history but not find it in Home/Categories. There is also no indication that a product is temporarily unavailable.

**Recommendation:** Decide product policy before coding:

- **Conversion-first:** Keep hiding from browse and make direct/wishlist/detail states clearer.
- **Catalog-transparency:** Show out-of-stock cards in a separate lower-priority section with a clear disabled state.

Do not change both screens automatically; this is a product decision with cross-screen impact.

---

## Check 5: ProductCard hides Add but has no explicit out-of-stock badge

**File:** `src/components/ProductCard.tsx:103-107,127-136`

```tsx
{product.inStock !== false && (...low-stock badge...)}
```

```tsx
{(product.inStock ?? true) && (
  <button ...>Add ...</button>
)}
```

**Finding:** The Add button disappears for `inStock === false`, but the card itself does not show “Out of Stock.” If the card is rendered from Wishlist or another direct source, the user may only see a product card with missing CTA.

**Gap:** Missing action can be interpreted as a layout bug rather than an inventory state.

**Recommendation:** Add a clear, non-clickable out-of-stock state only if the product policy keeps unavailable cards visible. Use the existing semantic error/surface tokens; do not invent a new stock model.

---

## Check 6: Product detail has the clearest out-of-stock behavior

**File:** `src/screens/ProductScreen.tsx:312-315,825-874`

```tsx
{product.inStock === false && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-b-[32px]">
    <span className="rounded-full bg-surface shadow-card px-4 py-2 text-[13px] font-bold text-ink">
      Out of Stock
    </span>
  </div>
)}
```

The sticky CTA changes to “Currently out of stock” plus “Notify Me When Available.”

**Assessment:** This is the strongest existing inventory experience and should be treated as the reference behavior.

**Recommendation:** If P5-2 is implemented, translate this behavior’s meaning into cards and Wishlist without copying the entire detail layout.

---

## Check 7: Low-stock language is duplicated and slightly inconsistent

**Files:** `src/components/ProductCard.tsx:104-106`, `src/screens/ProductScreen.tsx:409-414`

ProductCard uses:

```tsx
product.stockCount ? `মাত্র ${product.stockCount}টি!` : 'কম বাকি!'
```

ProductScreen uses:

```tsx
product.stockCount ? `মাত্র ${product.stockCount}টি বাকি!` : 'মাত্র কয়েকটি বাকি!'
```

**Gap:** The same inventory condition communicates different Bengali wording and different visual treatments.

**Recommendation:** Establish one approved wording and threshold interpretation before a shared helper/token change. Keep `stockCount <= 5` behavior unchanged unless product/admin policy says otherwise.

---

## P5-2 Scope Proposal

**Preferred first pass:**

- `src/components/ProductCard.tsx`
- `src/screens/ProductScreen.tsx`
- `src/screens/WishlistScreen.tsx`

**Only expand to Home/Categories after product policy approval.**

**Out of scope:**

- `src/lib/store.ts` inventory model
- Admin stock write logic
- Firestore mapping
- Order/payment behavior
- Touch listeners

**Priority:** P1 functional clarity, medium effort, requires product-policy decision.

---

# P5-3 — Wishlist Empty State & Saved-Product Flow

## Check 8: Logged-out empty state is already premium and purposeful

**File:** `src/screens/WishlistScreen.tsx:144-181`

It provides:

- calm saved-collection framing
- sign-in CTA
- Browse cakes secondary CTA
- clear reason to sign in and sync favourites

**Assessment:** Strong. No redesign is required.

---

## Check 9: Logged-in empty state also has a clear browse CTA

**File:** `src/screens/WishlistScreen.tsx:182-181` (empty-state branch around lines 145-181 in the current file)

The logged-in empty state says “Your wishlist is empty,” explains the heart action, and routes to Categories with “Browse cakes.”

**Assessment:** Strong baseline. Keep the current visual direction and copy unless real-device review identifies density problems.

---

## Check 10: Category-filter empty state has a correct recovery action

**File:** `src/screens/WishlistScreen.tsx:126-142`

```tsx
<button
  type="button"
  onClick={() => setActiveCat('all')}
  ...
>
  <RotateCcw ... />
  Show all saved cakes
</button>
```

**Assessment:** Correct recovery action. This is already better than a dead-end empty state.

---

## Check 11: Wishlist can expose stale/out-of-stock saved products

**File:** `src/screens/WishlistScreen.tsx:25-28`

```tsx
const saved = useMemo(
  () => safeArray<Product>(products).filter(
    (product) => (product.approved ?? true) && wishlist.includes(product.id)
  ),
  [products, wishlist]
);
```

**Finding:** Wishlist intentionally does not filter `inStock`. This lets users retain saved cakes, which is useful, but currently delegates the unavailable state to ProductCard where the Add CTA simply disappears.

**Recommended fix:** Coordinate P5-2 with Wishlist so saved-but-unavailable items are explicit, not silently missing an Add button. Preserve the ability to keep an unavailable saved item; do not automatically remove it from the user’s collection.

---

## Check 12: Wishlist removal transition is thoughtful but timer-based

**File:** `src/screens/WishlistScreen.tsx:35-44`

```tsx
setTimeout(() => {
  toggleWish(id);
  ...
}, 220);
```

**Assessment:** The soft fade is premium and low risk. The only edge case is rapid navigation/unmount during the 220ms timer.

**Recommendation:** Do not change in the first P5 pass unless a real-device test reproduces a stale update. Avoid expanding P5 into general async state cleanup.

---

## P5-3 Scope Proposal

**Preferred scope:**

- Review-only first; no empty-state redesign needed.
- If P5-2 changes ProductCard, verify Wishlist as a consumer.
- Add only explicit unavailable-state treatment if approved.

**Out of scope:**

- Replacing the current empty-state copy/design
- New wishlist backend synchronization
- Timer architecture refactor
- ProductCard radius redesign

**Priority:** P2. Mostly already polished; changes should be driven by stock-state consistency.

---

# Complete P5 Priority Table

| Phase | Concept | Finding | Priority | Effort | Recommendation |
|---|---|---|---:|---:|---|
| P5-1 | ProductCard contrast | Needs real-device matrix; do not blindly darken | P1 | Low | Validate first, then scoped fix |
| P5-2 | Inventory consistency | Card/detail/browse behavior differs | P1 | Medium | Decide catalog policy, then align states |
| P5-3 | Wishlist | Empty states are already strong; stale stock state is the gap | P2 | Low/medium | Coordinate with P5-2 only |

## Recommended implementation order

1. **P5-1 device contrast audit** on ProductCard with no code change initially.
2. Decide **P5-2 inventory policy**: hide from browse or show unavailable state.
3. Implement only the approved stock-state changes and verify Wishlist as a consumer.
4. Leave current Wishlist empty-state design intact unless testing reveals a concrete issue.

---

# Global Constraints for P5

- Do not touch native `touchmove` listener blocks.
- Do not blanket-normalize `rounded-[24px]` ProductCard styling.
- Do not change inventory schema or AdminPanel behavior without a separate approved phase.
- Use existing semantic tokens; no new color system.
- Preserve the existing `Notify Me When Available` behavior on ProductScreen.
- Run type-check against the known 30-error baseline and run `npm run build` after any implementation.

## Final Recommendation

P5 should begin with a **ProductCard contrast/device audit**, followed by an explicit inventory-state decision. The Wishlist empty state is already premium; the real remaining opportunity is making saved out-of-stock products and card-level inventory states communicate clearly instead of silently removing or hiding actions.

**Review status:** Complete and ready for approval before code changes.


## Implementation outcome

Following the review, the approved low-risk P5 work was completed:

- P5-0 contrast audit was documented without claiming unavailable physical-device testing.
- P5-1 ProductCard now shows an explicit `Out of Stock` badge and uses unified low-stock wording.
- P5-2/P5-3 Wishlist keeps unavailable saved products and provides a notification action using the existing `bakeart-alerts` storage key.
- The existing Wishlist empty states, removal transition, ProductCard radius, Home/Categories filtering policy, and ProductScreen notify flow were preserved.

The remaining manual item is real-device visual validation of bright-image contrast.
