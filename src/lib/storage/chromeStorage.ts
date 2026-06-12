import { DEFAULT_PERSISTED_STATE } from '@/src/constants/defaults';
import { migratePersistedState } from '@/src/lib/storage/migrations';
import type { PersistedState } from '@/src/state/readerTypes';

const STATE_KEY = 'novelReader.state';
const CONTENT_PREFIX = 'novelReader.bookContent.';
const DB_NAME = 'novel-reader';
const DB_VERSION = 1;
const CONTENT_STORE = 'bookContents';

const LS_STATE_KEY = 'novelReader.state';

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

function readFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeToLS(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — silently ignore
  }
}

function openContentDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        db.createObjectStore(CONTENT_STORE, { keyPath: 'bookId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 打开失败'));
  });
}

async function withContentStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openContentDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONTENT_STORE, mode);
    const request = run(transaction.objectStore(CONTENT_STORE));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 操作失败'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error('IndexedDB 事务失败'));
    };
  });
}

export async function getPersistedState(): Promise<PersistedState> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STATE_KEY);
    return migratePersistedState(result[STATE_KEY]);
  }
  return migratePersistedState(readFromLS(LS_STATE_KEY, null));
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STATE_KEY]: state });
  } else {
    writeToLS(LS_STATE_KEY, state);
  }
}

export async function getBookContent(bookId: string): Promise<string> {
  const record = await withContentStore<{ bookId: string; content: string; updatedAt: number } | undefined>('readonly', (store) => store.get(bookId));
  if (record?.content) return record.content;

  if (!hasChromeStorage()) return '';
  const legacyKey = `${CONTENT_PREFIX}${bookId}`;
  const result = await chrome.storage.local.get(legacyKey);
  const legacyContent = result[legacyKey] ?? '';

  if (legacyContent) {
    await saveBookContent(bookId, legacyContent);
    await chrome.storage.local.remove(legacyKey);
  }

  return legacyContent;
}

export async function saveBookContent(bookId: string, content: string): Promise<void> {
  await withContentStore('readwrite', (store) => store.put({ bookId, content, updatedAt: Date.now() }));
}

export async function deleteBookContent(bookId: string): Promise<void> {
  await withContentStore('readwrite', (store) => store.delete(bookId));
  if (hasChromeStorage()) await chrome.storage.local.remove(`${CONTENT_PREFIX}${bookId}`);
}
