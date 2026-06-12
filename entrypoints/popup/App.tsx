import { useEffect, useState } from 'react';
import { getPersistedState } from '@/src/lib/storage/chromeStorage';
import type { BookMeta, PersistedState } from '@/src/state/readerTypes';
import '@/src/styles/globals.css';

export default function App() {
  const [state, setState] = useState<PersistedState | null>(null);

  useEffect(() => {
    void getPersistedState().then(setState);
  }, []);

  const lastBook: BookMeta | undefined = state?.books.find((book) => book.id === state.config.lastOpenedBookId) ?? state?.books[0];
  const progress = lastBook ? state?.progressByBookId[lastBook.id] : undefined;
  const derived = lastBook ? state?.derivedByBookId[lastBook.id] : undefined;
  const percent = progress && derived ? (((progress.page + 1) / derived.totalPages) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-72 bg-[var(--nr-bg)] p-4 text-[var(--nr-fg)]" style={{ minHeight: '140px' }}>
      <h1 className="mb-3 text-base font-semibold">Novel Reader</h1>
      <div className="mb-4 rounded border border-[var(--nr-border-color)] bg-[var(--nr-sidebar-bg)] p-3 text-sm">
        <div className="truncate">{lastBook?.name ?? '暂无书籍'}</div>
        <div className="mt-1 text-xs opacity-70">进度: {percent}%</div>
      </div>
      <button className="w-full rounded bg-[var(--nr-button-bg)] px-3 py-2 text-sm text-[var(--nr-button-fg)]" onClick={() => chrome.runtime.sendMessage({ action: 'openSidePanel' })}>
        打开阅读器
      </button>
    </div>
  );
}
