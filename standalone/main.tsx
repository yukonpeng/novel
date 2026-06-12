import { createRoot } from 'react-dom/client';
import { ReaderProvider } from '@/src/state/ReaderContext';
import { ReaderShell } from '@/src/components/layout/ReaderShell';
import '@/src/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <ReaderProvider>
    <ReaderShell />
  </ReaderProvider>,
);
