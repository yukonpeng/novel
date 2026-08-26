import { useEffect, useRef, useState } from 'react';
import { Check, Copy, List } from 'lucide-react';
import { useReader } from '@/src/state/ReaderContext';
import { getChapterText } from '@/src/lib/book/chapter';
import { copyTextToClipboard } from '@/src/lib/clipboard';
import { selectCurrentChapterIndex } from '@/src/state/selectors';

const COPY_FEEDBACK_MS = 1500;

export function ChapterOutline({ onChapterSelect, visible = true }: { onChapterSelect?: () => void; visible?: boolean }) {
  const { state, actions } = useReader();
  const currentIndex = selectCurrentChapterIndex(state);
  const currentChapterRef = useRef<HTMLButtonElement>(null);
  const scrolledForVisibleRef = useRef(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => () => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
  }, []);

  const copyChapter = async (index: number) => {
    const text = getChapterText(state.currentContent, state.chapters, index);
    if (!text) return;
    try {
      await copyTextToClipboard(text);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      setCopiedIndex(index);
      copiedTimerRef.current = setTimeout(() => setCopiedIndex(null), COPY_FEEDBACK_MS);
    } catch {
      setCopiedIndex(null);
    }
  };

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
          <div key={`${chapter.charPos}-${chapter.title}`} className="mb-1 flex items-center gap-1">
            <button
              ref={index === currentIndex ? currentChapterRef : undefined}
              className={`min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-sm compact:px-3 compact:py-2.5 ${index === currentIndex ? 'bg-[var(--nr-chapter-current-bg)] text-[var(--nr-chapter-current-fg)]' : 'text-[var(--nr-chapter-item-fg)] hover:bg-[var(--nr-hover-bg)]'}`}
              onClick={() => { void actions.setPage(chapter.page); onChapterSelect?.(); }}
            >
              {chapter.title}
            </button>
            <button
              aria-label={`复制章节 ${chapter.title}`}
              title="复制本章"
              className={`shrink-0 rounded p-1.5 opacity-60 transition-opacity hover:bg-[var(--nr-hover-bg)] hover:opacity-100 ${
                copiedIndex === index ? 'text-[var(--nr-accent)]' : 'text-[var(--nr-chapter-item-fg)]'
              }`}
              onClick={() => void copyChapter(index)}
            >
              {copiedIndex === index ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
