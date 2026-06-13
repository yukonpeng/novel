import { useEffect, useRef } from 'react';
import { List } from 'lucide-react';
import { useReader } from '@/src/state/ReaderContext';
import { selectCurrentChapterIndex } from '@/src/state/selectors';

export function ChapterOutline({ onChapterSelect, visible = true }: { onChapterSelect?: () => void; visible?: boolean }) {
  const { state, actions } = useReader();
  const currentIndex = selectCurrentChapterIndex(state);
  const currentChapterRef = useRef<HTMLButtonElement>(null);
  const scrolledForVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      scrolledForVisibleRef.current = false;
      return;
    }
    if (scrolledForVisibleRef.current) return;
    if (currentIndex < 0) return;
    currentChapterRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    scrolledForVisibleRef.current = true;
  }, [visible, currentIndex]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-8 items-center justify-between bg-[var(--nr-section-header-bg)] px-3 text-xs font-semibold text-[var(--nr-section-header-fg)]">
        <span className="flex items-center gap-1.5">
          <List className="h-3.5 w-3.5" />
          章节大纲
        </span>
        <span>{state.chapters.length}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2 nr-scrollbar">
        {state.chapters.length === 0 && <div className="px-2 py-6 text-center text-sm text-[var(--nr-sidebar-fg)]">未识别到章节</div>}
        {state.chapters.map((chapter, index) => (
          <button
            key={`${chapter.charPos}-${chapter.title}`}
            ref={index === currentIndex ? currentChapterRef : undefined}
            className={`mb-1 block w-full truncate rounded px-2 py-1.5 text-left text-sm compact:px-3 compact:py-2.5 ${index === currentIndex ? 'bg-[var(--nr-chapter-current-bg)] text-[var(--nr-chapter-current-fg)]' : 'text-[var(--nr-chapter-item-fg)] hover:bg-[var(--nr-hover-bg)]'}`}
            onClick={() => { void actions.setPage(chapter.page); onChapterSelect?.(); }}
          >
            {chapter.title}
          </button>
        ))}
      </div>
    </section>
  );
}
