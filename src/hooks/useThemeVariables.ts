import { useEffect } from 'react';
import { THEMES } from '@/src/constants/themes';
import type { ThemeName } from '@/src/state/readerTypes';

const CSS_VAR_NAMES = {
  bg: '--nr-bg',
  fg: '--nr-fg',
  sidebarBg: '--nr-sidebar-bg',
  sidebarFg: '--nr-sidebar-fg',
  sidebarSelectBg: '--nr-sidebar-select-bg',
  sidebarSelectFg: '--nr-sidebar-select-fg',
  titlebarBg: '--nr-titlebar-bg',
  titlebarFg: '--nr-titlebar-fg',
  statusbarBg: '--nr-statusbar-bg',
  statusbarFg: '--nr-statusbar-fg',
  buttonBg: '--nr-button-bg',
  buttonFg: '--nr-button-fg',
  buttonActiveBg: '--nr-button-active-bg',
  textBg: '--nr-text-bg',
  textFg: '--nr-text-fg',
  textSelectBg: '--nr-text-select-bg',
  scrollbarBg: '--nr-scrollbar-bg',
  scrollbarTrough: '--nr-scrollbar-trough',
  borderColor: '--nr-border-color',
  hoverBg: '--nr-hover-bg',
  inputBg: '--nr-input-bg',
  inputFg: '--nr-input-fg',
  accent: '--nr-accent',
  lineNumberFg: '--nr-line-number-fg',
  separator: '--nr-separator',
  sectionHeaderBg: '--nr-section-header-bg',
  sectionHeaderFg: '--nr-section-header-fg',
  chapterItemFg: '--nr-chapter-item-fg',
  chapterCurrentFg: '--nr-chapter-current-fg',
  chapterCurrentBg: '--nr-chapter-current-bg',
} as const;

export function useThemeVariables(themeName: ThemeName) {
  useEffect(() => {
    const theme = THEMES[themeName];
    const root = document.documentElement;

    for (const [key, variable] of Object.entries(CSS_VAR_NAMES)) {
      root.style.setProperty(variable, theme[key as keyof typeof theme]);
    }
  }, [themeName]);
}
