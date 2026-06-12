import { useEffect, useRef } from 'react';
import { useReader } from '@/src/state/ReaderContext';

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

  const articleRef = useRef<HTMLElement>(null);

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
        style={{ fontFamily: state.config.fontFamily, fontSize: state.config.fontSize }}
        onClick={() => void actions.setPage(state.currentPage + 1)}
        onContextMenu={(event) => { event.preventDefault(); void actions.setPage(state.currentPage - 1); }}
      >
        {highlightText(pageText, state.searchKeyword)}
      </article>
      <div className="flex h-12 shrink-0 items-center gap-2 border-t border-[var(--nr-separator)] bg-[var(--nr-bg)] px-2 sm:gap-4 sm:px-4">
        <button className="shrink-0 rounded bg-[var(--nr-button-bg)] px-2 py-1.5 text-sm text-[var(--nr-button-fg)] hover:bg-[var(--nr-button-active-bg)] sm:px-4" onClick={() => void actions.setPage(state.currentPage - 1)}>←</button>
        <span className="shrink-0 text-center text-xs sm:w-24 sm:text-sm">{state.currentPage + 1}/{state.pages.length}</span>
        <input className="min-w-0 flex-1 accent-[var(--nr-accent)]" type="range" min={1} max={state.pages.length} value={state.currentPage + 1} onChange={(event) => void actions.setPage(Number(event.target.value) - 1)} />
        <button className="shrink-0 rounded bg-[var(--nr-button-bg)] px-2 py-1.5 text-sm text-[var(--nr-button-fg)] hover:bg-[var(--nr-button-active-bg)] sm:px-4" onClick={() => void actions.setPage(state.currentPage + 1)}>→</button>
      </div>
    </div>
  );
}
