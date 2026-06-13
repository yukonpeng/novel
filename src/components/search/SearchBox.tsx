import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useReader } from '@/src/state/ReaderContext';

export function SearchBox() {
  const { state, actions } = useReader();

  const go = (offset: number) => {
    if (state.searchResults.length === 0) return;
    const next = Math.max(0, Math.min(state.currentSearchIndex + offset, state.searchResults.length - 1));
    void actions.goToSearchResult(next);
  };

  const hasKeyword = state.searchKeyword.length > 0;

  return (
    <div className="flex items-center gap-1 p-2 compact:gap-2 compact:p-3">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60" />
        <Input
          className="h-7 pl-7 pr-2 text-sm compact:h-9"
          placeholder="搜索当前书籍"
          value={state.searchKeyword}
          onChange={(event) => actions.search(event.target.value)}
        />
      </div>
      <span className="w-12 text-center text-xs text-[var(--nr-accent)] compact:text-sm">
        {state.searchResults.length ? `${state.currentSearchIndex + 1}/${state.searchResults.length}` : ''}
      </span>
      <Button
        variant="default"
        size="iconSm"
        aria-label="上一个匹配"
        onClick={() => go(-1)}
        disabled={state.searchResults.length === 0}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="default"
        size="iconSm"
        aria-label="下一个匹配"
        onClick={() => go(1)}
        disabled={state.searchResults.length === 0}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label="清除搜索"
        onClick={actions.clearSearch}
        disabled={!hasKeyword}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
