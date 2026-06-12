export type ThemeName =
  | 'Dark+ (default dark)'
  | 'Light+ (default light)'
  | 'Monokai'
  | 'Solarized Dark'
  | 'One Dark Pro'
  | '护眼·米黄'
  | '护眼·淡绿'
  | '护眼·浅棕';

export interface ReaderConfig {
  theme: ThemeName;
  wordsPerPage: number;
  fontFamily: string;
  fontSize: number;
  sidebarVisible: boolean;
  lastOpenedBookId: string | null;
  autoCloseTimeout: number;
}

export interface BookMeta {
  id: string;
  name: string;
  originalFileName: string;
  size: number;
  lastModified: number;
  contentHash: string;
  importedAt: number;
  updatedAt: number;
}

export interface ReadingProgress {
  bookId: string;
  page: number;
  lastOpened: number;
}

export interface Chapter {
  title: string;
  charPos: number;
  page: number;
}

export interface SearchResult {
  position: number;
  page: number;
  keyword: string;
  context: string;
}

export interface BookDerivedData {
  bookId: string;
  chapters: Chapter[];
  totalPages: number;
  contentLength: number;
  wordsPerPage: number;
  updatedAt: number;
}

export interface PersistedState {
  version: number;
  config: ReaderConfig;
  books: BookMeta[];
  progressByBookId: Record<string, ReadingProgress>;
  derivedByBookId: Record<string, BookDerivedData>;
}

export interface ReaderRuntimeState extends PersistedState {
  hydrated: boolean;
  currentBookId: string | null;
  currentContent: string;
  pages: string[];
  chapters: Chapter[];
  currentPage: number;
  searchKeyword: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;
  loading: boolean;
  error: string | null;
}
