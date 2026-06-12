import type { PersistedState, ReaderConfig, ReaderRuntimeState } from '@/src/state/readerTypes';

export const STORAGE_VERSION = 1;

export const DEFAULT_CONFIG: ReaderConfig = {
  theme: 'Dark+ (default dark)',
  wordsPerPage: 800,
  fontFamily: 'Microsoft YaHei',
  fontSize: 14,
  sidebarVisible: true,
  lastOpenedBookId: null,
  autoCloseTimeout: 0,
};

export const DEFAULT_PERSISTED_STATE: PersistedState = {
  version: STORAGE_VERSION,
  config: DEFAULT_CONFIG,
  books: [],
  progressByBookId: {},
  derivedByBookId: {},
};

export const DEFAULT_RUNTIME_STATE: ReaderRuntimeState = {
  ...DEFAULT_PERSISTED_STATE,
  hydrated: false,
  currentBookId: null,
  currentContent: '',
  pages: [''],
  chapters: [],
  currentPage: 0,
  searchKeyword: '',
  searchResults: [],
  currentSearchIndex: -1,
  loading: false,
  error: null,
};
