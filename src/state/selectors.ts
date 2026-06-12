import type { ReaderRuntimeState } from '@/src/state/readerTypes';

export function selectCurrentBook(state: ReaderRuntimeState) {
  return state.books.find((book) => book.id === state.currentBookId) ?? null;
}

export function getBookProgressPercent(state: ReaderRuntimeState, bookId: string): number {
  const progress = state.progressByBookId[bookId];
  const derived = state.derivedByBookId[bookId];
  if (!progress || !derived || derived.totalPages <= 0) return 0;
  return Math.max(0, Math.min(100, ((progress.page + 1) / derived.totalPages) * 100));
}

export function selectCurrentChapterIndex(state: ReaderRuntimeState): number {
  let index = -1;
  for (let i = 0; i < state.chapters.length; i += 1) {
    if (state.chapters[i].page <= state.currentPage) index = i;
    else break;
  }
  return index;
}

export function toPersistedState(state: ReaderRuntimeState) {
  return {
    version: state.version,
    config: state.config,
    books: state.books,
    progressByBookId: state.progressByBookId,
    derivedByBookId: state.derivedByBookId,
  };
}
