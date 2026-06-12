import { CHAPTER_PATTERNS } from '@/src/constants/chapterPatterns';
import type { Chapter } from '@/src/state/readerTypes';

export function parseChapters(content: string, wordsPerPage: number): Chapter[] {
  if (!content) return [];

  const matches: Array<{ start: number; title: string }> = [];

  for (const pattern of CHAPTER_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
      if (match.index === undefined) continue;
      matches.push({ start: match.index, title: match[0].trim() });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const seen = new Set<number>();
  const unique = matches.filter((match) => {
    if (seen.has(match.start)) return false;
    seen.add(match.start);
    return true;
  });

  return unique.map((match) => ({
    title: match.title,
    charPos: match.start,
    page: Math.floor(match.start / wordsPerPage),
  }));
}
