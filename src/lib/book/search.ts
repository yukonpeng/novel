import type { SearchResult } from '@/src/state/readerTypes';

export function searchBook(content: string, keyword: string, wordsPerPage: number, contextRadius = 15): SearchResult[] {
  const trimmed = keyword.trim();
  if (!trimmed || !content) return [];

  const results: SearchResult[] = [];
  let start = 0;

  while (start < content.length) {
    const position = content.indexOf(trimmed, start);
    if (position === -1) break;

    const contextStart = Math.max(0, position - contextRadius);
    const contextEnd = Math.min(content.length, position + trimmed.length + contextRadius);
    let context = content.slice(contextStart, contextEnd).replace(/\n/g, ' ');

    if (contextStart > 0) context = `...${context}`;
    if (contextEnd < content.length) context = `${context}...`;

    results.push({
      position,
      page: Math.floor(position / wordsPerPage),
      keyword: trimmed,
      context,
    });

    start = position + 1;
  }

  return results;
}
