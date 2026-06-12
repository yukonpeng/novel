import { THEME_NAMES } from '@/src/constants/themes';
import { useReader } from '@/src/state/ReaderContext';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, actions } = useReader();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
      <div className="w-[90vw] max-w-[420px] rounded-lg border border-[var(--nr-border-color)] bg-[var(--nr-bg)] p-5 text-[var(--nr-fg)] shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--nr-separator)] pb-3">
          <h2 className="text-lg font-semibold">设置</h2>
          <button className="rounded px-2 py-1 hover:bg-[var(--nr-hover-bg)] compact:px-3 compact:py-2" onClick={onClose}>×</button>
        </div>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block">主题风格</span>
          <select className="w-full rounded bg-[var(--nr-input-bg)] px-3 py-2 text-[var(--nr-input-fg)] compact:px-4 compact:py-3" value={state.config.theme} onChange={(event) => void actions.updateConfig({ theme: event.target.value as typeof state.config.theme })}>
            {THEME_NAMES.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block">每页字数: {state.config.wordsPerPage}</span>
          <input className="w-full accent-[var(--nr-accent)]" type="range" min={200} max={3000} step={100} value={state.config.wordsPerPage} onChange={(event) => void actions.updateConfig({ wordsPerPage: Number(event.target.value) })} />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block">字体大小: {state.config.fontSize}</span>
          <input className="w-full accent-[var(--nr-accent)]" type="range" min={10} max={28} value={state.config.fontSize} onChange={(event) => void actions.updateConfig({ fontSize: Number(event.target.value) })} />
        </label>
        <label className="mb-6 block text-sm">
          <span className="mb-1 block">字体名称</span>
          <input className="w-full rounded bg-[var(--nr-input-bg)] px-3 py-2 text-[var(--nr-input-fg)] compact:px-4 compact:py-3" value={state.config.fontFamily} onChange={(event) => void actions.updateConfig({ fontFamily: event.target.value })} />
        </label>
        <label className="mb-6 block text-sm">
          <span className="mb-1 block">无操作自动关闭（0 = 关闭）: {state.config.autoCloseTimeout}s</span>
          <input className="w-full accent-[var(--nr-accent)]" type="range" min={0} max={300} step={5} value={state.config.autoCloseTimeout} onChange={(event) => void actions.updateConfig({ autoCloseTimeout: Number(event.target.value) })} />
        </label>
        <div className="flex justify-end">
          <button className="rounded bg-[var(--nr-button-bg)] px-4 py-2 text-sm text-[var(--nr-button-fg)] compact:px-6 compact:py-3" onClick={onClose}>完成</button>
        </div>
      </div>
    </div>
  );
}
