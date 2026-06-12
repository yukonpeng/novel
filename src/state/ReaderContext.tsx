import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEFAULT_RUNTIME_STATE } from '@/src/constants/defaults';
import { readTextFile, isTextFile } from '@/src/lib/book/fileReader';
import { sha256Hex } from '@/src/lib/book/hash';
import { paginate } from '@/src/lib/book/pagination';
import { parseChapters } from '@/src/lib/book/parser';
import { searchBook } from '@/src/lib/book/search';
import { deleteBookContent, getBookContent, getPersistedState, saveBookContent, savePersistedState } from '@/src/lib/storage/chromeStorage';
import { readerReducer } from '@/src/state/readerReducer';
import { toPersistedState } from '@/src/state/selectors';
import type { BookDerivedData, BookMeta, ReaderConfig, ReaderRuntimeState } from '@/src/state/readerTypes';

interface ReaderActions {
  hydrate: () => Promise<void>;
  importFiles: (files: File[]) => Promise<void>;
  openBook: (bookId: string) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  renameBook: (bookId: string, name: string) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  updateConfig: (config: Partial<ReaderConfig>) => Promise<void>;
  search: (keyword: string) => void;
  goToSearchResult: (index: number) => Promise<void>;
  clearSearch: () => void;
}

const ReaderContext = createContext<{ state: ReaderRuntimeState; actions: ReaderActions } | null>(null);

function buildDerived(bookId: string, content: string, wordsPerPage: number): BookDerivedData {
  return {
    bookId,
    chapters: parseChapters(content, wordsPerPage),
    totalPages: paginate(content, wordsPerPage).length,
    contentLength: content.length,
    wordsPerPage,
    updatedAt: Date.now(),
  };
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(readerReducer, DEFAULT_RUNTIME_STATE);

  const persist = async (nextState: ReaderRuntimeState) => {
    await savePersistedState(toPersistedState(nextState));
  };

  const actions = useMemo<ReaderActions>(() => ({
    hydrate: async () => {
      const persisted = await getPersistedState();
      dispatch({ type: 'HYDRATE_SUCCESS', payload: persisted });
    },
    importFiles: async (files) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        const validFiles = files.filter(isTextFile);
        if (validFiles.length === 0) throw new Error('请选择 TXT 文本文件');

        for (const file of validFiles) {
          const content = await readTextFile(file);
          if (!content.trim()) throw new Error(`${file.name} 是空文件`);
          const contentHash = await sha256Hex(content);
          const now = Date.now();
          const book: BookMeta = {
            id: crypto.randomUUID(),
            name: file.name.replace(/\.txt$/i, ''),
            originalFileName: file.name,
            size: file.size,
            lastModified: file.lastModified,
            contentHash,
            importedAt: now,
            updatedAt: now,
          };
          const derived = buildDerived(book.id, content, state.config.wordsPerPage);
          await saveBookContent(book.id, content);
          dispatch({ type: 'IMPORT_BOOK_SUCCESS', book, derived });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : '导入失败' });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    openBook: async (bookId) => {
      const content = await getBookContent(bookId);
      const pages = paginate(content, state.config.wordsPerPage);
      const chapters = parseChapters(content, state.config.wordsPerPage);
      const savedPage = state.progressByBookId[bookId]?.page ?? 0;
      const page = Math.max(0, Math.min(savedPage, pages.length - 1));
      dispatch({ type: 'OPEN_BOOK_SUCCESS', bookId, content, pages, chapters, page });
    },
    removeBook: async (bookId) => {
      await deleteBookContent(bookId);
      dispatch({ type: 'REMOVE_BOOK', bookId });
    },
    renameBook: async (bookId, name) => {
      const trimmed = name.trim();
      if (trimmed) dispatch({ type: 'RENAME_BOOK', bookId, name: trimmed });
    },
    setPage: async (page) => {
      const safePage = Math.max(0, Math.min(page, state.pages.length - 1));
      dispatch({ type: 'SET_PAGE', page: safePage });
    },
    updateConfig: async (config) => {
      let pages: string[] | undefined;
      let chapters = undefined;
      let page = undefined;
      let derived = undefined;
      const wordsPerPage = config.wordsPerPage ?? state.config.wordsPerPage;

      if (state.currentBookId && config.wordsPerPage && config.wordsPerPage !== state.config.wordsPerPage) {
        const charPosition = state.currentPage * state.config.wordsPerPage;
        pages = paginate(state.currentContent, wordsPerPage);
        chapters = parseChapters(state.currentContent, wordsPerPage);
        page = Math.max(0, Math.min(Math.floor(charPosition / wordsPerPage), pages.length - 1));
        derived = buildDerived(state.currentBookId, state.currentContent, wordsPerPage);
      }

      dispatch({ type: 'UPDATE_CONFIG', config, pages, chapters, page, derived });
    },
    search: (keyword) => {
      const results = searchBook(state.currentContent, keyword, state.config.wordsPerPage);
      dispatch({ type: 'SET_SEARCH', keyword, results, currentIndex: results.length > 0 ? 0 : -1 });
    },
    goToSearchResult: async (index) => {
      dispatch({ type: 'GO_TO_SEARCH_RESULT', index });
    },
    clearSearch: () => dispatch({ type: 'CLEAR_SEARCH' }),
  }), [state]);

  useEffect(() => {
    void actions.hydrate();
  }, []);

  useEffect(() => {
    if (!state.hydrated || state.currentBookId || state.books.length === 0) return;
    const lastBookId = state.config.lastOpenedBookId ?? Object.values(state.progressByBookId).sort((a, b) => b.lastOpened - a.lastOpened)[0]?.bookId ?? state.books[0]?.id;
    if (lastBookId) void actions.openBook(lastBookId);
  }, [state.hydrated, state.books.length]);

  useEffect(() => {
    if (!state.hydrated) return;
    void persist(state);
  }, [state.version, state.config, state.books, state.progressByBookId, state.derivedByBookId]);

  return <ReaderContext.Provider value={{ state, actions }}>{children}</ReaderContext.Provider>;
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) throw new Error('useReader must be used within ReaderProvider');
  return context;
}
