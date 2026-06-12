import { DEFAULT_RUNTIME_STATE } from '@/src/constants/defaults';
import type { BookDerivedData, BookMeta, Chapter, PersistedState, ReaderConfig, ReaderRuntimeState, SearchResult } from '@/src/state/readerTypes';

export type ReaderAction =
  | { type: 'HYDRATE_SUCCESS'; payload: PersistedState }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'IMPORT_BOOK_SUCCESS'; book: BookMeta; derived: BookDerivedData }
  | { type: 'OPEN_BOOK_SUCCESS'; bookId: string; content: string; pages: string[]; chapters: Chapter[]; page: number }
  | { type: 'REMOVE_BOOK'; bookId: string }
  | { type: 'RENAME_BOOK'; bookId: string; name: string }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'UPDATE_CONFIG'; config: Partial<ReaderConfig>; pages?: string[]; chapters?: Chapter[]; page?: number; derived?: BookDerivedData }
  | { type: 'SET_SEARCH'; keyword: string; results: SearchResult[]; currentIndex: number }
  | { type: 'GO_TO_SEARCH_RESULT'; index: number }
  | { type: 'CLEAR_SEARCH' };

export function readerReducer(state: ReaderRuntimeState, action: ReaderAction): ReaderRuntimeState {
  switch (action.type) {
    case 'HYDRATE_SUCCESS':
      return { ...DEFAULT_RUNTIME_STATE, ...action.payload, hydrated: true };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'IMPORT_BOOK_SUCCESS':
      return {
        ...state,
        books: [...state.books, action.book],
        derivedByBookId: { ...state.derivedByBookId, [action.book.id]: action.derived },
      };
    case 'OPEN_BOOK_SUCCESS':
      return {
        ...state,
        currentBookId: action.bookId,
        currentContent: action.content,
        pages: action.pages,
        chapters: action.chapters,
        currentPage: action.page,
        config: { ...state.config, lastOpenedBookId: action.bookId },
        progressByBookId: {
          ...state.progressByBookId,
          [action.bookId]: { bookId: action.bookId, page: action.page, lastOpened: Date.now() },
        },
        searchKeyword: '',
        searchResults: [],
        currentSearchIndex: -1,
      };
    case 'REMOVE_BOOK': {
      const { [action.bookId]: _progress, ...progressByBookId } = state.progressByBookId;
      const { [action.bookId]: _derived, ...derivedByBookId } = state.derivedByBookId;
      const isCurrent = state.currentBookId === action.bookId;
      return {
        ...state,
        books: state.books.filter((book) => book.id !== action.bookId),
        progressByBookId,
        derivedByBookId,
        currentBookId: isCurrent ? null : state.currentBookId,
        currentContent: isCurrent ? '' : state.currentContent,
        pages: isCurrent ? [''] : state.pages,
        chapters: isCurrent ? [] : state.chapters,
        currentPage: isCurrent ? 0 : state.currentPage,
        config: { ...state.config, lastOpenedBookId: isCurrent ? null : state.config.lastOpenedBookId },
      };
    }
    case 'RENAME_BOOK':
      return {
        ...state,
        books: state.books.map((book) => book.id === action.bookId ? { ...book, name: action.name, updatedAt: Date.now() } : book),
      };
    case 'SET_PAGE':
      if (!state.currentBookId) return state;
      return {
        ...state,
        currentPage: action.page,
        progressByBookId: {
          ...state.progressByBookId,
          [state.currentBookId]: { bookId: state.currentBookId, page: action.page, lastOpened: Date.now() },
        },
      };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.config },
        pages: action.pages ?? state.pages,
        chapters: action.chapters ?? state.chapters,
        currentPage: action.page ?? state.currentPage,
        derivedByBookId: action.derived ? { ...state.derivedByBookId, [action.derived.bookId]: action.derived } : state.derivedByBookId,
      };
    case 'SET_SEARCH':
      return { ...state, searchKeyword: action.keyword, searchResults: action.results, currentSearchIndex: action.currentIndex };
    case 'GO_TO_SEARCH_RESULT': {
      const result = state.searchResults[action.index];
      if (!result) return state;
      return readerReducer({ ...state, currentSearchIndex: action.index }, { type: 'SET_PAGE', page: result.page });
    }
    case 'CLEAR_SEARCH':
      return { ...state, searchKeyword: '', searchResults: [], currentSearchIndex: -1 };
    default:
      return state;
  }
}
