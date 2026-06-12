import { useState } from 'react';
import { useReader } from '@/src/state/ReaderContext';
import { getBookProgressPercent } from '@/src/state/selectors';

export function BookshelfPanel() {
  const { state, actions } = useReader();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  return (
    <section className="border-b border-[var(--nr-separator)]">
      <div className="flex h-8 items-center justify-between bg-[var(--nr-section-header-bg)] px-3 text-xs font-semibold text-[var(--nr-section-header-fg)]">
        <span>书籍列表</span>
        <span>{state.books.length}</span>
      </div>
      <div className="max-h-72 overflow-auto p-2 nr-scrollbar">
        {state.books.length === 0 && <div className="px-2 py-6 text-center text-sm text-[var(--nr-sidebar-fg)]">暂无书籍，拖入 TXT 开始阅读</div>}
        {state.books.map((book) => {
          const active = book.id === state.currentBookId;
          return (
            <div key={book.id} className={`group mb-2 rounded border border-transparent p-2 text-sm compact:p-3 ${active ? 'bg-[var(--nr-sidebar-select-bg)] text-[var(--nr-sidebar-select-fg)]' : 'text-[var(--nr-sidebar-fg)] hover:bg-[var(--nr-hover-bg)]'}`}>
              {renamingId === book.id ? (
                <form onSubmit={(event) => { event.preventDefault(); void actions.renameBook(book.id, name); setRenamingId(null); }}>
                  <input className="w-full rounded bg-[var(--nr-input-bg)] px-2 py-1 text-[var(--nr-input-fg)] compact:px-3 compact:py-2" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
                </form>
              ) : (
                <button className="block w-full truncate text-left" onClick={() => void actions.openBook(book.id)}>{book.name}</button>
              )}
              <div className="mt-1 flex items-center justify-between text-xs opacity-80">
                <span>进度: {getBookProgressPercent(state, book.id).toFixed(0)}%</span>
                <span className="hidden gap-1 group-hover:flex">
                  <button onClick={() => { setRenamingId(book.id); setName(book.name); }}>重命名</button>
                  <button onClick={() => void actions.removeBook(book.id)}>删除</button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
