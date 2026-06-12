import { DEFAULT_PERSISTED_STATE, STORAGE_VERSION } from '@/src/constants/defaults';
import type { PersistedState } from '@/src/state/readerTypes';

export function migratePersistedState(value: unknown): PersistedState {
  if (!value || typeof value !== 'object') return structuredClone(DEFAULT_PERSISTED_STATE);

  const partial = value as Partial<PersistedState>;

  return {
    version: STORAGE_VERSION,
    config: {
      ...DEFAULT_PERSISTED_STATE.config,
      ...(partial.config ?? {}),
    },
    books: Array.isArray(partial.books) ? partial.books : [],
    progressByBookId: partial.progressByBookId ?? {},
    derivedByBookId: partial.derivedByBookId ?? {},
  };
}
