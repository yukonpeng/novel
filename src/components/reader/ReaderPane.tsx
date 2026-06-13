import { useEffect, useRef, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
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
  const isFirstPage = state.currentPage <= 0;
  const isLastPage = state.currentPage >= state.pages.length - 1;

  const articleRef = useRef<HTMLElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [transition, setTransition] = useState('');
  const animatingRef = useRef(false);

  const animateToPage = useCallback((direction: 'next' | 'prev') => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const sign = direction === 'next' ? -1 : 1;
    setTransition('transform 0.3s ease-out');
    setSwipeOffset(sign * window.innerWidth);
    setTimeout(() => {
      void actions.setPage(state.currentPage + (direction === 'next' ? 1 : -1));
      setSwipeOffset(0);
      setTransition('none');
      setTimeout(() => {
        setTransition('');
        animatingRef.current = false;
      }, 50);
    }, 300);
  }, [actions, state.currentPage]);

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], active, cancel, swipe, tap }) => {
      if (animatingRef.current) {
        cancel();
        return;
      }

      if (tap) return;

      if (swipe[0]) {
        if (swipe[0] === -1 && !isLastPage) {
          animateToPage('next');
        } else if (swipe[0] === 1 && !isFirstPage) {
          animateToPage('prev');
        } else {
          setSwipeOffset(0);
          setTransition('transform 0.2s ease-out');
          setTimeout(() => setTransition(''), 200);
        }
        return;
      }

      if (active) {
        const maxOffset = window.innerWidth * 0.7;
        let offset = mx;
        if (isFirstPage && offset > 0) offset = offset * 0.3;
        if (isLastPage && offset < 0) offset = offset * 0.3;
        offset = Math.max(-maxOffset, Math.min(maxOffset, offset));
        setSwipeOffset(offset);
        setTransition('');

        const threshold = window.innerWidth * 0.5;
        if (Math.abs(offset) > threshold || Math.abs(vx) > 0.8) {
          if (offset < 0 && !isLastPage) {
            animateToPage('next');
            cancel();
          } else if (offset > 0 && !isFirstPage) {
            animateToPage('prev');
            cancel();
          }
        }
      } else {
        setSwipeOffset(0);
        setTransition('transform 0.2s ease-out');
        setTimeout(() => setTransition(''), 200);
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      threshold: 10,
      swipe: { velocity: 0.6, distance: 160 },
    },
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
        {...bind()}
        className="nr-scrollbar min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-6 leading-8 text-[var(--nr-text-fg)] sm:px-10 sm:py-8 touch-pan-y"
        style={{ fontFamily: state.config.fontFamily, fontSize: state.config.fontSize, transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined, transition: transition || undefined }}
        onClick={() => void actions.setPage(state.currentPage + 1)}
        onContextMenu={(event) => { event.preventDefault(); void actions.setPage(state.currentPage - 1); }}
      >
        {highlightText(pageText, state.searchKeyword)}
      </article>
      <div className="flex h-12 shrink-0 items-center gap-2 border-t border-[var(--nr-separator)] bg-[var(--nr-bg)] px-2 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:gap-4 sm:px-4 compact:h-14 compact:gap-3 compact:px-3">
        <Button variant="default" size="icon" aria-label="上一页" onClick={() => void actions.setPage(state.currentPage - 1)}>
          <ChevronLeft className="h-4 w-4 compact:h-5 compact:w-5" />
        </Button>
        <span className="shrink-0 text-center text-xs sm:w-24 sm:text-sm compact:text-sm">{state.currentPage + 1}/{state.pages.length}</span>
        <input className="min-w-0 flex-1 accent-[var(--nr-accent)]" type="range" min={1} max={state.pages.length} value={state.currentPage + 1} onChange={(event) => void actions.setPage(Number(event.target.value) - 1)} />
        <Button variant="default" size="icon" aria-label="下一页" onClick={() => void actions.setPage(state.currentPage + 1)}>
          <ChevronRight className="h-4 w-4 compact:h-5 compact:w-5" />
        </Button>
      </div>
    </div>
  );
}
