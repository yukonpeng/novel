# Swipe Navigation & Mobile Adaptive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add left/right swipe gesture page navigation with follow-finger animation, and enlarge mobile compact-mode UI elements for better touch targets.

**Architecture:** Custom touch event handlers on the ReaderPane article element detect horizontal swipes, apply CSS transform animations, and call existing `actions.setPage()`. Mobile layout uses the existing compact mode flag (≤600px) to apply larger Tailwind classes across all components.

**Tech Stack:** React, TypeScript, Tailwind CSS, native Touch Events API

---

### Task 1: Add swipe gesture hook

**Files:**
- Create: `src/hooks/useSwipeNavigation.ts`

- [ ] **Step 1: Create the useSwipeNavigation hook**

```ts
import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipeNavigation(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  canSwipeLeft: boolean,
  canSwipeRight: boolean,
): { handlers: SwipeHandlers; offsetRef: React.MutableRefObject<number>; animatingRef: React.MutableRefObject<boolean> } {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const movedRef = useRef(false);
  const directionLockedRef = useRef(false);
  const isHorizontalRef = useRef(false);
  const animatingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (animatingRef.current) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    offsetRef.current = 0;
    movedRef.current = false;
    directionLockedRef.current = false;
    isHorizontalRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (animatingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startXRef.current;
    const dy = touch.clientY - startYRef.current;

    if (!directionLockedRef.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      directionLockedRef.current = true;
      isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontalRef.current) return;

    e.preventDefault();
    movedRef.current = true;

    const maxOffset = window.innerWidth * 0.3;
    let offset = dx;
    if (!canSwipeRight && dx > 0) offset = dx * 0.3;
    if (!canSwipeLeft && dx < 0) offset = dx * 0.3;
    offset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    offsetRef.current = offset;
  }, [canSwipeLeft, canSwipeRight]);

  const onTouchEnd = useCallback(() => {
    if (animatingRef.current || !movedRef.current) return;
    const offset = offsetRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = Math.abs(offset) / Math.max(elapsed, 1);
    const threshold = window.innerWidth * 0.2;

    if (offset < -threshold || (offset < 0 && velocity > 0.5)) {
      animatingRef.current = true;
      onSwipeLeft();
    } else if (offset > threshold || (offset > 0 && velocity > 0.5)) {
      animatingRef.current = true;
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    offsetRef,
    animatingRef,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSwipeNavigation.ts
git commit -m "feat: add useSwipeNavigation hook for touch gesture detection"
```

---

### Task 2: Integrate swipe into ReaderPane with animation

**Files:**
- Modify: `src/components/reader/ReaderPane.tsx`

- [ ] **Step 1: Add swipe handlers and animation state to ReaderPane**

Replace the full content of `ReaderPane.tsx` with:

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useReader } from '@/src/state/ReaderContext';
import { useSwipeNavigation } from '@/src/hooks/useSwipeNavigation';

function highlightText(text: string, keyword: string) {
  if (!keyword) return text;
  const parts: Array<string | JSX.Element> = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    const found = text.indexOf(keyword, index);
    if (found === -1) {
      parts.push(text.slice(index));
      break;
    }
    parts.push(text.slice(index, found));
    parts.push(<mark key={key} className="rounded bg-[var(--nr-accent)] px-0.5 text-white">{text.slice(found, found + keyword.length)}</mark>);
    key += 1;
    index = found + keyword.length;
  }

  return parts;
}

export function ReaderPane() {
  const { state, actions } = useReader();
  const pageText = state.pages[state.currentPage] ?? '';
  const isFirstPage = state.currentPage <= 0;
  const isLastPage = state.currentPage >= state.pages.length - 1;

  const articleRef = useRef<HTMLElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [transition, setTransition] = useState('');
  const swipeMovedRef = useRef(false);

  const onSwipeLeft = useCallback(() => {
    if (isLastPage) return;
    setTransition('transform 0.3s ease-out');
    setSwipeOffset(-window.innerWidth);
    setTimeout(() => {
      void actions.setPage(state.currentPage + 1);
      setSwipeOffset(0);
      setTransition('none');
      setTimeout(() => setTransition(''), 50);
    }, 300);
  }, [actions, state.currentPage, isLastPage]);

  const onSwipeRight = useCallback(() => {
    if (isFirstPage) return;
    setTransition('transform 0.3s ease-out');
    setSwipeOffset(window.innerWidth);
    setTimeout(() => {
      void actions.setPage(state.currentPage - 1);
      setSwipeOffset(0);
      setTransition('none');
      setTimeout(() => setTransition(''), 50);
    }, 300);
  }, [actions, state.currentPage, isFirstPage]);

  const { handlers, offsetRef, animatingRef } = useSwipeNavigation(
    onSwipeLeft,
    onSwipeRight,
    !isLastPage,
    !isFirstPage,
  );

  useEffect(() => {
    articleRef.current?.scrollTo(0, 0);
  }, [state.currentPage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        void actions.setPage(state.currentPage + 1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        void actions.setPage(state.currentPage - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions, state.currentPage]);

  useEffect(() => {
    if (!animatingRef.current) {
      setSwipeOffset(offsetRef.current);
      setTransition('');
    }
  }, [offsetRef.current]);

  // Reset swipeMovedRef on each render
  swipeMovedRef.current = false;

  if (!state.currentBookId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--nr-text-bg)] p-4 text-center text-[var(--nr-text-fg)]">
        <div>
          <div className="text-xl font-semibold sm:text-2xl">导入 TXT 小说开始阅读</div>
          <div className="mt-3 text-sm opacity-70">支持拖拽文件到窗口，自动解析章节、保存进度和主题设置。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--nr-text-bg)]">
      <article
        ref={articleRef}
        className="nr-scrollbar min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-6 leading-8 text-[var(--nr-text-fg)] sm:px-10 sm:py-8"
        style={{ fontFamily: state.config.fontFamily, fontSize: state.config.fontSize, transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined, transition: transition || undefined }}
        onTouchStart={(e) => { swipeMovedRef.current = false; handlers.onTouchStart(e); }}
        onTouchMove={(e) => { swipeMovedRef.current = true; handlers.onTouchMove(e); }}
        onTouchEnd={(e) => { handlers.onTouchEnd(e); }}
        onClick={() => { if (!swipeMovedRef.current) void actions.setPage(state.currentPage + 1); }}
        onContextMenu={(event) => { event.preventDefault(); if (!swipeMovedRef.current) void actions.setPage(state.currentPage - 1); }}
      >
        {highlightText(pageText, state.searchKeyword)}
      </article>
      <div className="flex h-12 shrink-0 items-center gap-2 border-t border-[var(--nr-separator)] bg-[var(--nr-bg)] px-2 sm:gap-4 sm:px-4 compact:h-14 compact:gap-3 compact:px-3">
        <button className="shrink-0 rounded bg-[var(--nr-button-bg)] px-2 py-1.5 text-sm text-[var(--nr-button-fg)] hover:bg-[var(--nr-button-active-bg)] sm:px-4 compact:px-4 compact:py-2.5 compact:text-lg" onClick={() => void actions.setPage(state.currentPage - 1)}>←</button>
        <span className="shrink-0 text-center text-xs sm:w-24 sm:text-sm compact:text-sm">{state.currentPage + 1}/{state.pages.length}</span>
        <input className="min-w-0 flex-1 accent-[var(--nr-accent)]" type="range" min={1} max={state.pages.length} value={state.currentPage + 1} onChange={(event) => void actions.setPage(Number(event.target.value) - 1)} />
        <button className="shrink-0 rounded bg-[var(--nr-button-bg)] px-2 py-1.5 text-sm text-[var(--nr-button-fg)] hover:bg-[var(--nr-button-active-bg)] sm:px-4 compact:px-4 compact:py-2.5 compact:text-lg" onClick={() => void actions.setPage(state.currentPage + 1)}>→</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reader/ReaderPane.tsx
git commit -m "feat: integrate swipe navigation with follow-finger animation in ReaderPane"
```

---

### Task 3: Add compact variant to Tailwind config

The `compact:` prefix needs to be registered as a custom variant in Tailwind so that `compact:h-14` etc. produce CSS rules matching the compact mode class.

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add compact variant to tailwind.config.ts**

Add a `compact` variant that applies when a parent has the `compact` class. In `tailwind.config.ts`, add to the config:

```ts
// In the plugins array, add:
plugins: [
  plugin(({ addVariant }) => {
    addVariant('compact', '.compact &');
  }),
],
```

Also add the import at top: `import plugin from 'tailwindcss/plugin';`

- [ ] **Step 2: Add compact class to ReaderShell container**

In `ReaderShell.tsx`, add the `compact` class to the outer `<div>` so that all `compact:` Tailwind utilities activate for children:

Change line 89 from:
```
className={`flex h-full w-full bg-[var(--nr-bg)] text-[var(--nr-fg)] ${compact ? 'min-w-[280px] min-h-[400px]' : 'min-w-[360px] min-h-[500px]'}`}
```
to:
```
className={`flex h-full w-full bg-[var(--nr-bg)] text-[var(--nr-fg)] ${compact ? 'min-w-[280px] min-h-[400px] compact' : 'min-w-[360px] min-h-[500px]'}`}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/components/layout/ReaderShell.tsx
git commit -m "feat: add compact Tailwind variant for mobile-specific styles"
```

---

### Task 4: Enlarge mobile layout in ReaderShell

**Files:**
- Modify: `src/components/layout/ReaderShell.tsx`

- [ ] **Step 1: Update compact titlebar, statusbar, and sidebar button sizes**

Replace the compact titlebar div (line 106):
```tsx
<div className="flex h-9 items-center gap-2 bg-[var(--nr-titlebar-bg)] px-3 text-xs text-[var(--nr-titlebar-fg)]">
  <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)]" onClick={() => setDrawerOpen(!drawerOpen)}>☰</button>
  <div className="min-w-0 flex-1 truncate">{currentBook?.name ?? '欢迎使用小说阅读器'}</div>
  <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)]" onClick={() => setSettingsOpen(true)}>设置</button>
</div>
```
with:
```tsx
<div className="flex h-11 items-center gap-2 bg-[var(--nr-titlebar-bg)] px-3 text-sm text-[var(--nr-titlebar-fg)]">
  <button className="rounded px-3 py-2 hover:bg-[var(--nr-hover-bg)]" onClick={() => setDrawerOpen(!drawerOpen)}>☰</button>
  <div className="min-w-0 flex-1 truncate">{currentBook?.name ?? '欢迎使用小说阅读器'}</div>
  <button className="rounded px-3 py-2 hover:bg-[var(--nr-hover-bg)]" onClick={() => setSettingsOpen(true)}>设置</button>
</div>
```

Replace the compact statusbar div (line 113):
```tsx
<div className="flex h-6 shrink-0 items-center justify-between gap-1 bg-[var(--nr-statusbar-bg)] px-2 text-[10px] text-[var(--nr-statusbar-fg)]">
```
with:
```tsx
<div className="flex h-8 shrink-0 items-center justify-between gap-1 bg-[var(--nr-statusbar-bg)] px-2 text-xs text-[var(--nr-statusbar-fg)]">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/ReaderShell.tsx
git commit -m "feat: enlarge compact mode titlebar and statusbar for better touch targets"
```

---

### Task 5: Enlarge mobile layout in sidebar components

**Files:**
- Modify: `src/components/search/SearchBox.tsx`
- Modify: `src/components/reader/ChapterOutline.tsx`
- Modify: `src/components/bookshelf/BookshelfPanel.tsx`

- [ ] **Step 1: Update SearchBox compact styles**

In `SearchBox.tsx`, replace the component return:

```tsx
<div className="flex items-center gap-1 p-2 compact:gap-2 compact:p-3">
  <input
    className="min-w-0 flex-1 rounded bg-[var(--nr-input-bg)] px-2 py-1 text-sm text-[var(--nr-input-fg)] outline-none compact:px-3 compact:py-2"
    placeholder="搜索当前书籍"
    value={state.searchKeyword}
    onChange={(event) => actions.search(event.target.value)}
  />
  <span className="w-12 text-center text-xs text-[var(--nr-accent)] compact:text-sm">{state.searchResults.length ? `${state.currentSearchIndex + 1}/${state.searchResults.length}` : ''}</span>
  <button className="rounded bg-[var(--nr-button-bg)] px-2 py-1 text-xs text-[var(--nr-button-fg)] compact:px-3 compact:py-2 compact:text-sm" onClick={() => go(-1)}>▲</button>
  <button className="rounded bg-[var(--nr-button-bg)] px-2 py-1 text-xs text-[var(--nr-button-fg)] compact:px-3 compact:py-2 compact:text-sm" onClick={() => go(1)}>▼</button>
  <button className="rounded px-2 py-1 text-xs hover:bg-[var(--nr-hover-bg)] compact:px-3 compact:py-2 compact:text-sm" onClick={actions.clearSearch}>×</button>
</div>
```

- [ ] **Step 2: Update ChapterOutline compact styles**

In `ChapterOutline.tsx`, replace the chapter button className:

```tsx
className={`mb-1 block w-full truncate rounded px-2 py-1.5 text-left text-sm compact:px-3 compact:py-2.5 ${index === currentIndex ? 'bg-[var(--nr-chapter-current-bg)] text-[var(--nr-chapter-current-fg)]' : 'text-[var(--nr-chapter-item-fg)] hover:bg-[var(--nr-hover-bg)]'}`}
```

- [ ] **Step 3: Update BookshelfPanel compact styles**

In `BookshelfPanel.tsx`, replace the book item div (line 21):

```tsx
<div key={book.id} className={`group mb-2 rounded border border-transparent p-2 text-sm compact:p-3 ${active ? 'bg-[var(--nr-sidebar-select-bg)] text-[var(--nr-sidebar-select-fg)]' : 'text-[var(--nr-sidebar-fg)] hover:bg-[var(--nr-hover-bg)]'}`}>
```

And the rename input (line 24):

```tsx
<input className="w-full rounded bg-[var(--nr-input-bg)] px-2 py-1 text-[var(--nr-input-fg)] compact:px-3 compact:py-2" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/search/SearchBox.tsx src/components/reader/ChapterOutline.tsx src/components/bookshelf/BookshelfPanel.tsx
git commit -m "feat: enlarge compact mode sidebar components for better touch targets"
```

---

### Task 6: Enlarge mobile layout in SettingsPanel

**Files:**
- Modify: `src/components/settings/SettingsPanel.tsx`

- [ ] **Step 1: Update SettingsPanel compact styles**

Replace the settings content with compact-enlarged versions:

- Select inputs: `px-3 py-2` → add `compact:px-4 compact:py-3`
- Text inputs: `px-3 py-2` → add `compact:px-4 compact:py-3`
- Done button: `px-4 py-2` → add `compact:px-6 compact:py-3`
- Close button: `px-2 py-1` → add `compact:px-3 compact:py-2`

Specifically, update these lines:

Line 16 select:
```tsx
<select className="w-full rounded bg-[var(--nr-input-bg)] px-3 py-2 text-[var(--nr-input-fg)] compact:px-4 compact:py-3"
```

Line 30 font input:
```tsx
<input className="w-full rounded bg-[var(--nr-input-bg)] px-3 py-2 text-[var(--nr-input-fg)] compact:px-4 compact:py-3"
```

Line 12 close button:
```tsx
<button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)] compact:px-3 compact:py-2" onClick={onClose}>×</button>
```

Line 37 done button:
```tsx
<button className="rounded bg-[var(--nr-button-bg)] px-4 py-2 text-sm text-[var(--nr-button-fg)] compact:px-6 compact:py-3" onClick={onClose}>完成</button>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/SettingsPanel.tsx
git commit -m "feat: enlarge compact mode settings panel for better touch targets"
```

---

### Task 7: Manual testing and verification

- [ ] **Step 1: Build extension and standalone**

```bash
cd D:/codes/thinks/novel-reader-extension && npm run build
```

Then also build standalone:
```bash
npx vite build --config vite.config.standalone.ts
```

- [ ] **Step 2: Test in browser (mobile simulation)**

1. Open the standalone build in Chrome
2. Toggle device toolbar (Ctrl+Shift+M) to simulate mobile
3. Load a TXT file
4. Verify swipe left/right turns pages with follow-finger animation
5. Verify buttons and controls are larger in compact view
6. Verify desktop view is unchanged

- [ ] **Step 3: Test edge cases**

1. Swipe right on first page — should not navigate, shows rubber-band resistance
2. Swipe left on last page — same
3. Fast swipe — should trigger page turn even with small offset
4. Click article area — should still turn to next page (no swipe conflict)
5. Right-click article area — should still turn to previous page

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
