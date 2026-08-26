import type { Chapter } from '@/src/state/readerTypes';

/**
 * 提取指定章节的完整文本（含标题，从该章节起始位置到下一章节开头）。
 */
export function getChapterText(content: string, chapters: Chapter[], index: number): string {
  const chapter = chapters[index];
  if (!chapter) return '';
  const end = chapters[index + 1]?.charPos ?? content.length;
  return content.slice(chapter.charPos, end);
}
