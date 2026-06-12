import { useReader } from '@/src/state/ReaderContext';

export function SearchBox() {
  const { state, actions } = useReader();

  const go = (offset: number) => {
    if (state.searchResults.length === 0) return;
    const next = Math.max(0, Math.min(state.currentSearchIndex + offset, state.searchResults.length - 1));
    void actions.goToSearchResult(next);
  };

  return (
    <div className="flex items-center gap-1 p-2">
      <input
        className="min-w-0 flex-1 rounded bg-[var(--nr-input-bg)] px-2 py-1 text-sm text-[var(--nr-input-fg)] outline-none"
        placeholder="搜索当前书籍"
        value={state.searchKeyword}
        onChange={(event) => actions.search(event.target.value)}
      />
      <span className="w-12 text-center text-xs text-[var(--nr-accent)]">{state.searchResults.length ? `${state.currentSearchIndex + 1}/${state.searchResults.length}` : ''}</span>
      <button className="rounded bg-[var(--nr-button-bg)] px-2 py-1 text-xs text-[var(--nr-button-fg)]" onClick={() => go(-1)}>▲</button>
      <button className="rounded bg-[var(--nr-button-bg)] px-2 py-1 text-xs text-[var(--nr-button-fg)]" onClick={() => go(1)}>▼</button>
      <button className="rounded px-2 py-1 text-xs hover:bg-[var(--nr-hover-bg)]" onClick={actions.clearSearch}>×</button>
    </div>
  );
}
