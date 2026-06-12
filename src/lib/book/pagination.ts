export function paginate(content: string, charsPerPage: number): string[] {
  const safeCharsPerPage = Math.max(1, Math.floor(charsPerPage));
  const totalPages = Math.max(1, Math.ceil(content.length / safeCharsPerPage));
  const pages: string[] = [];

  for (let index = 0; index < totalPages; index += 1) {
    const start = index * safeCharsPerPage;
    const end = Math.min(start + safeCharsPerPage, content.length);
    pages.push(content.slice(start, end));
  }

  return pages;
}
