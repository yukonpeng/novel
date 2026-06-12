import { useCallback, useEffect, useRef, useState } from 'react';
import { BookshelfPanel } from '@/src/components/bookshelf/BookshelfPanel';
import { ReaderPane } from '@/src/components/reader/ReaderPane';
import { ChapterOutline } from '@/src/components/reader/ChapterOutline';
import { SearchBox } from '@/src/components/search/SearchBox';
import { SettingsPanel } from '@/src/components/settings/SettingsPanel';
import { useThemeVariables } from '@/src/hooks/useThemeVariables';
import { useReader } from '@/src/state/ReaderContext';
import { selectCurrentBook, selectCurrentChapterIndex } from '@/src/state/selectors';

function useSidePanelAutoClose(timeout: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timeout <= 0) return;
    timerRef.current = setTimeout(() => {
      window.close();
    }, timeout * 1000);
  }, [timeout]);

  useEffect(() => {
    if (timeout <= 0) return;
    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    for (const e of events) window.addEventListener(e, resetTimer, { passive: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const e of events) window.removeEventListener(e, resetTimer);
    };
  }, [timeout, resetTimer]);
}

export function ReaderShell() {
  const { state, actions } = useReader();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentBook = selectCurrentBook(state);
  const currentChapter = state.chapters[selectCurrentChapterIndex(state)];

  useThemeVariables(state.config.theme);
  useSidePanelAutoClose(state.config.autoCloseTimeout);

  const onAuxClick = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { e.preventDefault(); window.close(); }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width <= 600);
    });
    observer.observe(el);
    setCompact(el.clientWidth <= 600);
    return () => observer.disconnect();
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const importFromInput = async (files: FileList | null) => {
    if (!files) return;
    await actions.importFiles(Array.from(files));
  };

  const sidebar = (
    <aside
      className={`flex shrink-0 flex-col border-r border-[var(--nr-separator)] bg-[var(--nr-sidebar-bg)] ${
        compact ? 'absolute inset-y-0 left-0 z-10 w-64 shadow-xl transition-transform duration-200' : 'w-56 md:w-72'
      } ${compact && !drawerOpen ? '-translate-x-full' : 'translate-x-0'}`}
    >
      <div className="flex h-10 items-center justify-between bg-[var(--nr-titlebar-bg)] px-3 text-sm font-semibold text-[var(--nr-titlebar-fg)]">
        <span>探索器</span>
        <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)]" onClick={() => inputRef.current?.click()}>+</button>
      </div>
      <SearchBox />
      <BookshelfPanel />
      <ChapterOutline onChapterSelect={compact ? closeDrawer : undefined} />
    </aside>
  );

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full bg-[var(--nr-bg)] text-[var(--nr-fg)] ${compact ? 'min-w-[280px] min-h-[400px] compact' : 'min-w-[360px] min-h-[500px]'}`}
      onAuxClick={onAuxClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void actions.importFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <input ref={inputRef} type="file" accept=".txt,text/plain" multiple className="hidden" onChange={(event) => void importFromInput(event.target.files)} />

      {compact ? (
        <>
          {drawerOpen && (
            <div className="fixed inset-0 z-10" onClick={closeDrawer} />
          )}
          {sidebar}
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 items-center gap-2 bg-[var(--nr-titlebar-bg)] px-3 text-sm text-[var(--nr-titlebar-fg)]">
              <button className="rounded px-3 py-2 hover:bg-[var(--nr-hover-bg)]" onClick={() => setDrawerOpen(!drawerOpen)}>☰</button>
              <div className="min-w-0 flex-1 truncate">{currentBook?.name ?? '欢迎使用小说阅读器'}</div>
              <button className="rounded px-3 py-2 hover:bg-[var(--nr-hover-bg)]" onClick={() => setSettingsOpen(true)}>设置</button>
            </div>
            {state.error && <div className="bg-red-700 px-3 py-1.5 text-xs text-white">{state.error}</div>}
            <ReaderPane />
            <div className="flex h-8 shrink-0 items-center justify-between gap-1 bg-[var(--nr-statusbar-bg)] px-2 text-xs text-[var(--nr-statusbar-fg)]">
              <span className="truncate">{currentBook?.name ?? ''}</span>
              <span className="shrink-0">{state.currentBookId ? `${(((state.currentPage + 1) / state.pages.length) * 100).toFixed(1)}%` : '拖入 TXT 或点击 + 导入'}</span>
            </div>
          </main>
        </>
      ) : (
        <>
          {state.config.sidebarVisible && sidebar}
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-10 items-center gap-3 bg-[var(--nr-titlebar-bg)] px-4 text-sm text-[var(--nr-titlebar-fg)]">
              <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)]" onClick={() => actions.updateConfig({ sidebarVisible: !state.config.sidebarVisible })}>☰</button>
              <div className="min-w-0 flex-1 truncate">{currentBook?.name ?? '欢迎使用小说阅读器'}</div>
              <div className="hidden max-w-sm truncate text-[var(--nr-accent)] md:block">{currentChapter?.title ?? ''}</div>
              <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)]" onClick={() => setSettingsOpen(true)}>设置</button>
            </div>
            {state.error && <div className="bg-red-700 px-4 py-2 text-sm text-white">{state.error}</div>}
            <ReaderPane />
            <div className="flex h-7 shrink-0 items-center justify-between gap-2 bg-[var(--nr-statusbar-bg)] px-3 text-xs text-[var(--nr-statusbar-fg)]">
              <span className="truncate">{currentBook?.name ?? ''}</span>
              <span className="shrink-0">{state.currentBookId ? `${(((state.currentPage + 1) / state.pages.length) * 100).toFixed(1)}%` : '拖入 TXT 或点击 + 导入'}</span>
            </div>
          </main>
        </>
      )}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
