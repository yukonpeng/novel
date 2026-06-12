import type { ThemeName } from '@/src/state/readerTypes';

export interface ReaderTheme {
  bg: string;
  fg: string;
  sidebarBg: string;
  sidebarFg: string;
  sidebarSelectBg: string;
  sidebarSelectFg: string;
  titlebarBg: string;
  titlebarFg: string;
  statusbarBg: string;
  statusbarFg: string;
  buttonBg: string;
  buttonFg: string;
  buttonActiveBg: string;
  textBg: string;
  textFg: string;
  textSelectBg: string;
  scrollbarBg: string;
  scrollbarTrough: string;
  borderColor: string;
  hoverBg: string;
  inputBg: string;
  inputFg: string;
  accent: string;
  lineNumberFg: string;
  separator: string;
  sectionHeaderBg: string;
  sectionHeaderFg: string;
  chapterItemFg: string;
  chapterCurrentFg: string;
  chapterCurrentBg: string;
}

export const THEMES: Record<ThemeName, ReaderTheme> = {
  'Dark+ (default dark)': {
    bg: '#1e1e1e', fg: '#d4d4d4', sidebarBg: '#252526', sidebarFg: '#cccccc', sidebarSelectBg: '#094771', sidebarSelectFg: '#ffffff', titlebarBg: '#323233', titlebarFg: '#cccccc', statusbarBg: '#007acc', statusbarFg: '#ffffff', buttonBg: '#0e639c', buttonFg: '#ffffff', buttonActiveBg: '#1177bb', textBg: '#1e1e1e', textFg: '#d4d4d4', textSelectBg: '#264f78', scrollbarBg: '#1e1e1e', scrollbarTrough: '#1e1e1e', borderColor: '#3c3c3c', hoverBg: '#2a2d2e', inputBg: '#3c3c3c', inputFg: '#cccccc', accent: '#007acc', lineNumberFg: '#858585', separator: '#474747', sectionHeaderBg: '#252526', sectionHeaderFg: '#bbbbbb', chapterItemFg: '#cccccc', chapterCurrentFg: '#ffffff', chapterCurrentBg: '#094771'
  },
  'Light+ (default light)': {
    bg: '#ffffff', fg: '#1e1e1e', sidebarBg: '#f3f3f3', sidebarFg: '#616161', sidebarSelectBg: '#094771', sidebarSelectFg: '#ffffff', titlebarBg: '#dddddd', titlebarFg: '#333333', statusbarBg: '#007acc', statusbarFg: '#ffffff', buttonBg: '#0e639c', buttonFg: '#ffffff', buttonActiveBg: '#1177bb', textBg: '#ffffff', textFg: '#1e1e1e', textSelectBg: '#add6ff', scrollbarBg: '#ffffff', scrollbarTrough: '#ffffff', borderColor: '#e5e5e5', hoverBg: '#e8e8e8', inputBg: '#ffffff', inputFg: '#1e1e1e', accent: '#007acc', lineNumberFg: '#999999', separator: '#cccccc', sectionHeaderBg: '#f3f3f3', sectionHeaderFg: '#616161', chapterItemFg: '#616161', chapterCurrentFg: '#ffffff', chapterCurrentBg: '#094771'
  },
  Monokai: {
    bg: '#272822', fg: '#f8f8f2', sidebarBg: '#1e1f1c', sidebarFg: '#a6a69c', sidebarSelectBg: '#49483e', sidebarSelectFg: '#f8f8f2', titlebarBg: '#2f3029', titlebarFg: '#f8f8f2', statusbarBg: '#414339', statusbarFg: '#a6a69c', buttonBg: '#49483e', buttonFg: '#f8f8f2', buttonActiveBg: '#575842', textBg: '#272822', textFg: '#f8f8f2', textSelectBg: '#49483e', scrollbarBg: '#272822', scrollbarTrough: '#272822', borderColor: '#3e3d32', hoverBg: '#3e3d32', inputBg: '#3e3d32', inputFg: '#f8f8f2', accent: '#a6e22e', lineNumberFg: '#90908a', separator: '#49483e', sectionHeaderBg: '#1e1f1c', sectionHeaderFg: '#a6a69c', chapterItemFg: '#a6a69c', chapterCurrentFg: '#f8f8f2', chapterCurrentBg: '#49483e'
  },
  'Solarized Dark': {
    bg: '#002b36', fg: '#839496', sidebarBg: '#073642', sidebarFg: '#93a1a1', sidebarSelectBg: '#0a4650', sidebarSelectFg: '#fdf6e3', titlebarBg: '#073642', titlebarFg: '#93a1a1', statusbarBg: '#073642', statusbarFg: '#93a1a1', buttonBg: '#073642', buttonFg: '#93a1a1', buttonActiveBg: '#0a4650', textBg: '#002b36', textFg: '#839496', textSelectBg: '#073642', scrollbarBg: '#002b36', scrollbarTrough: '#002b36', borderColor: '#073642', hoverBg: '#073642', inputBg: '#073642', inputFg: '#93a1a1', accent: '#268bd2', lineNumberFg: '#586e75', separator: '#073642', sectionHeaderBg: '#073642', sectionHeaderFg: '#93a1a1', chapterItemFg: '#93a1a1', chapterCurrentFg: '#fdf6e3', chapterCurrentBg: '#0a4650'
  },
  'One Dark Pro': {
    bg: '#282c34', fg: '#abb2bf', sidebarBg: '#21252b', sidebarFg: '#9da5b4', sidebarSelectBg: '#2c313a', sidebarSelectFg: '#d7dae0', titlebarBg: '#282c34', titlebarFg: '#9da5b4', statusbarBg: '#21252b', statusbarFg: '#9da5b4', buttonBg: '#3e4451', buttonFg: '#abb2bf', buttonActiveBg: '#4b5263', textBg: '#282c34', textFg: '#abb2bf', textSelectBg: '#3e4451', scrollbarBg: '#282c34', scrollbarTrough: '#282c34', borderColor: '#3e4451', hoverBg: '#2c313a', inputBg: '#2c313a', inputFg: '#abb2bf', accent: '#61afef', lineNumberFg: '#636d83', separator: '#3e4451', sectionHeaderBg: '#21252b', sectionHeaderFg: '#9da5b4', chapterItemFg: '#9da5b4', chapterCurrentFg: '#d7dae0', chapterCurrentBg: '#2c313a'
  },
  '护眼·米黄': {
    bg: '#F5E6D3', fg: '#5C4033', sidebarBg: '#EDE0D0', sidebarFg: '#5C4033', sidebarSelectBg: '#D4A574', sidebarSelectFg: '#FFFFFF', titlebarBg: '#E8D5C0', titlebarFg: '#5C4033', statusbarBg: '#D4A574', statusbarFg: '#FFFFFF', buttonBg: '#C4956A', buttonFg: '#FFFFFF', buttonActiveBg: '#D4A574', textBg: '#FDF5E6', textFg: '#3C2415', textSelectBg: '#E8D5C0', scrollbarBg: '#E8D5C0', scrollbarTrough: '#E8D5C0', borderColor: '#D4C4B0', hoverBg: '#E8D5C0', inputBg: '#FFFFFF', inputFg: '#3C2415', accent: '#C4956A', lineNumberFg: '#A89080', separator: '#D4C4B0', sectionHeaderBg: '#E8D5C0', sectionHeaderFg: '#5C4033', chapterItemFg: '#5C4033', chapterCurrentFg: '#FFFFFF', chapterCurrentBg: '#D4A574'
  },
  '护眼·淡绿': {
    bg: '#E8F0E8', fg: '#2F4F2F', sidebarBg: '#D8E8D8', sidebarFg: '#2F4F2F', sidebarSelectBg: '#90C090', sidebarSelectFg: '#FFFFFF', titlebarBg: '#D0E0D0', titlebarFg: '#2F4F2F', statusbarBg: '#90C090', statusbarFg: '#FFFFFF', buttonBg: '#6B8E6B', buttonFg: '#FFFFFF', buttonActiveBg: '#90C090', textBg: '#F0FFF0', textFg: '#2F4F2F', textSelectBg: '#D8E8D8', scrollbarBg: '#D8E8D8', scrollbarTrough: '#D8E8D8', borderColor: '#C0D8C0', hoverBg: '#D8E8D8', inputBg: '#FFFFFF', inputFg: '#2F4F2F', accent: '#6B8E6B', lineNumberFg: '#90A890', separator: '#C0D8C0', sectionHeaderBg: '#D0E0D0', sectionHeaderFg: '#2F4F2F', chapterItemFg: '#2F4F2F', chapterCurrentFg: '#FFFFFF', chapterCurrentBg: '#90C090'
  },
  '护眼·浅棕': {
    bg: '#EFE5D5', fg: '#4A3728', sidebarBg: '#E5D9C5', sidebarFg: '#4A3728', sidebarSelectBg: '#C9A87C', sidebarSelectFg: '#FFFFFF', titlebarBg: '#DED0B8', titlebarFg: '#4A3728', statusbarBg: '#C9A87C', statusbarFg: '#FFFFFF', buttonBg: '#B8956E', buttonFg: '#FFFFFF', buttonActiveBg: '#C9A87C', textBg: '#FAF0E6', textFg: '#3D2B1F', textSelectBg: '#E5D9C5', scrollbarBg: '#E5D9C5', scrollbarTrough: '#E5D9C5', borderColor: '#D5C5B0', hoverBg: '#E5D9C5', inputBg: '#FFFFFF', inputFg: '#3D2B1F', accent: '#B8956E', lineNumberFg: '#A89888', separator: '#D5C5B0', sectionHeaderBg: '#DED0B8', sectionHeaderFg: '#4A3728', chapterItemFg: '#4A3728', chapterCurrentFg: '#FFFFFF', chapterCurrentBg: '#C9A87C'
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
