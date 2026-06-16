import { Minus, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { THEME_NAMES } from '@/src/constants/themes';
import { useReader } from '@/src/state/ReaderContext';

function Stepper({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4 text-sm">
      <div className="mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="icon"
          aria-label="减少"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums compact:text-lg">{value}</span>
        <Button
          variant="default"
          size="icon"
          aria-label="增加"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, actions } = useReader();

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block">主题风格</span>
          <Select
            value={state.config.theme}
            onValueChange={(value) => void actions.updateConfig({ theme: value as typeof state.config.theme })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_NAMES.map((theme) => (
                <SelectItem key={theme} value={theme}>{theme}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <Stepper
          label={`每页字数: ${state.config.wordsPerPage}`}
          value={state.config.wordsPerPage}
          min={50}
          max={3000}
          step={50}
          onChange={(v) => void actions.updateConfig({ wordsPerPage: v })}
        />
        <Stepper
          label={`字体大小: ${state.config.fontSize}`}
          value={state.config.fontSize}
          min={10}
          max={28}
          step={1}
          onChange={(v) => void actions.updateConfig({ fontSize: v })}
        />

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block">字体名称</span>
          <Input
            value={state.config.fontFamily}
            onChange={(event) => void actions.updateConfig({ fontFamily: event.target.value })}
          />
        </label>

        <Stepper
          label={`自动关闭: ${state.config.autoCloseTimeout}s`}
          value={state.config.autoCloseTimeout}
          min={0}
          max={300}
          step={5}
          onChange={(v) => void actions.updateConfig({ autoCloseTimeout: v })}
        />

        <DialogFooter>
          <Button onClick={onClose}>完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
