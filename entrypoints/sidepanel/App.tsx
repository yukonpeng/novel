import { ReaderProvider } from '@/src/state/ReaderContext';
import { ReaderShell } from '@/src/components/layout/ReaderShell';

export default function App() {
  return (
    <ReaderProvider>
      <ReaderShell />
    </ReaderProvider>
  );
}
