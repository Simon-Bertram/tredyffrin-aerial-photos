---
name: selected-photos-mobile-navigation
overview: On mobile, render Selected Photos nav arrows below the photo row (out of the swipe area) while keeping them above on desktop; increase arrow contrast, 44 px touch targets on mobile, and explicit touch-pan on the scroller.
todos:
  - id: split-nav-position
    content: "Render <nav> twice in selected-photos.tsx: hidden md:flex in header (desktop), flex md:hidden after scroller (mobile)."
    status: pending
  - id: update-arrow-button
    content: "ArrowButton: bg-surface-container-highest, disabled:bg-surface-container, size-11 md:size-10."
    status: pending
  - id: add-touch-pan
    content: Add touch-pan-x to the scroller div in selected-photos.tsx.
    status: pending
  - id: verify
    content: Lint; verify mobile (arrows below, touch-scroll) and desktop (arrows above, unchanged).
    status: pending
isProject: false
---

# Selected photographs — mobile navigation and touch scrolling

**Status:** Deferred — kept for when you return from exploring a carousel/library option with best-practices built in.

**Primary file:** [apps/web/src/components/selected-photos.tsx](../../apps/web/src/components/selected-photos.tsx)

**Hook (unchanged in this plan):** [apps/web/src/hooks/use-horizontal-snap-scroller.ts](../../apps/web/src/hooks/use-horizontal-snap-scroller.ts)

## Root cause

- The `<nav>` of arrows sits in the same flex header as the "Photo 01 — 06" counter, directly above the photo row. On mobile that places controls near the swipe zone above the photos.
- `ArrowButton` uses `bg-surface-container-low`, barely distinguishable from page `surface`; **prev** starts disabled with `disabled:bg-transparent`, so on mobile (no hover) it disappears.
- Buttons are `size-10` (40 px), under the 44 px touch-target minimum.
- Scroller has `overflow-x-auto`; adding `touch-pan-x` makes horizontal pan explicit and is defensive with mask + `snap-mandatory` on iOS Safari.

## Layout intent

- **Mobile (< md):** counter above, photo row, then arrows below the row (right-aligned to mirror desktop placement).
- **Desktop (md+):** unchanged — counter left, arrows right, both above the row.

## Implementation

### 1. Split `<nav>` into two responsive instances

- Header `<nav>`: add `hidden md:flex` to its className.
- After the scroller `<div>`, add a second `<nav>` with `mt-6 flex md:hidden items-center justify-end gap-2` and the same `aria-label`. Duplicate the two `ArrowButton` instances; wire to the same `handleScrollBy`, `canScrollPrev`, `canScrollNext`, `hasMeasuredScroll`.

Only one `<nav>` is visible per breakpoint (`display: none` on the other), so duplicate landmarks are not exposed to assistive tech.

### 2. `ArrowButton` classes

- `bg-surface-container-low` → `bg-surface-container-highest`
- `disabled:bg-transparent` → `disabled:bg-surface-container`
- `size-10` → `size-11 md:size-10`

Keep existing hover, focus, shadow, and `disabled:text-on-surface-variant/40`.

### 3. Scroller

Append `touch-pan-x` to the scroller `className` alongside `overflow-x-auto`.

## Verification

1. Mobile: counter → row → arrows below; arrows visible; prev disabled but still shaped.
2. Swipe row: scroll + snap; arrow disabled states at ends; arrow tap scrolls by two cards.
3. Desktop: single nav row above photos; no duplicate gap below.
4. Run repo lint for the web app.

## Optional follow-ups (not in core plan)

High leverage, small scope:

- **`overscroll-x-contain`** on the scroller — reduces iOS swipe-back stealing horizontal gestures at the left edge.
- **`active:bg-primary active:text-primary-foreground`** on `ArrowButton` — tap feedback where `:hover` does not apply.
- **`aria-live="polite"`** and **`aria-atomic="true"`** on the photo counter wrapper — announces index changes for screen reader users.

Larger or cross-file:

- **`snap-proximity` on mobile, `snap-mandatory` from `md`** — softer feel on iOS momentum; tradeoff vs crisp paging.
- **`scroll-pl-6 md:scroll-pl-0`** — align snapped cards with section horizontal padding.
- **Responsive images** — `srcset` / `sizes` from Sanity for [buildSelectedPhotos](../../apps/web/src/lib/selected-photos-data.ts) output.
- **`decoding="async"`, `loading` / `fetchpriority` on first card** — LCP-friendly first thumbnail.
- **Semantic list** — `<ul>` + `<li>` wrapping links instead of `role="listitem"` on `<a>`.
- **Narrow viewports** — e.g. `w-[14rem] sm:w-[16rem] md:w-[18rem]` for a consistent "peek" on small phones.
