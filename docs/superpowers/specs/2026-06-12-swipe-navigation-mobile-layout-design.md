# Swipe Navigation & Mobile Adaptive Layout Design

## Overview

Add left/right swipe gesture navigation to the novel reader and improve mobile layout sizing for both the Chrome extension (sidepanel) and standalone H5 build.

## 1. Swipe Navigation

### Mechanism

Add touch event handling on the `<article>` element in `ReaderPane.tsx`:

- **touchstart**: Record start X coordinate and timestamp
- **touchmove**: Calculate horizontal offset; if direction is clear (>10px and horizontal > vertical), `preventDefault()` to block scrolling, apply `transform: translateX(offset)` to follow finger, clamp offset to ±30% screen width
- **touchend**: Determine page turn based on offset and velocity:
  - Offset > 20% screen width **or** velocity > 0.5px/ms → trigger page turn
  - Otherwise → snap back to origin
- **Direction**: Swipe left (finger moves left, negative offset) → next page; swipe right (finger moves right, positive offset) → previous page
- **Boundaries**: At first page, prevent further right swipe; at last page, prevent further left swipe
- **Coexistence with click**: Track whether a `touchmove` occurred; if yes, suppress the subsequent `click` event on `touchend`

### Animation

- **During swipe**: Current page `<article>` follows finger via `transform: translateX(offset)`, clipped by `overflow: hidden`
- **Page turn triggered**:
  1. Add `transition: transform 0.3s ease-out` to current page, set `translateX(±100%)` to slide out
  2. Switch page content to target page, new page starts at `translateX(∓100%)` and transitions to `translateX(0)` to slide in
  3. Clear transform and transition after animation completes
- **Page turn not triggered (snap back)**: `transition: transform 0.2s ease-out` back to `translateX(0)`
- **Rapid switch protection**: Ignore new touch events during animation (~300ms) to prevent state corruption
- No double-page DOM rendering — content switches at the turn moment with animation overlay

## 2. Mobile Adaptive Layout

All changes apply only in compact mode (≤600px width). Desktop layout remains unchanged.

### ReaderPane navigation bar
- Height: `h-12` → `h-14` (56px)
- Prev/Next buttons: `px-2 py-1.5 text-sm` → `px-4 py-2.5 text-lg` (touch target ≥44px)
- Page counter: `text-xs` → `text-sm`
- Slider: keep `flex-1`, increase touch height

### ReaderShell titlebar
- Compact: `h-9 text-xs` → `h-11 text-sm`
- Hamburger/Settings buttons: `px-2 py-1` → `px-3 py-2`

### ReaderShell statusbar
- Compact: `h-6 text-[10px]` → `h-8 text-xs`

### Sidebar components
- Search input: `px-2 py-1` → `px-3 py-2`
- Search buttons: `px-2 py-1 text-xs` → `px-3 py-2 text-sm`
- Chapter list items: `px-2 py-1.5` → `px-3 py-2.5`
- Bookshelf items: `p-2` → `p-3`

### Settings panel
- Inputs: `px-3 py-2` → `px-4 py-3`
- Done button: `px-4 py-2` → `px-6 py-3`

## 3. Scope

- Files modified: `ReaderPane.tsx`, `ReaderShell.tsx`, `BookshelfPanel.tsx`, `SearchBox.tsx`, `ChapterOutline.tsx`, `SettingsPanel.tsx`
- No new dependencies
- Both extension and H5 builds benefit (same React components)
- No changes to state management, storage, or build configuration
