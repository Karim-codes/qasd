// Keep PDF page numbers stable for lesson citations. Page 2 is blank in the
// original; the cover and publisher's back cover are intentional artwork.
export const OFFICIAL_UMRAH_PAGE_NUMBERS = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type OfficialUmrahPageNumber = (typeof OFFICIAL_UMRAH_PAGE_NUMBERS)[number];

export function officialGuidePage(value: unknown): OfficialUmrahPageNumber {
  const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1;
  return OFFICIAL_UMRAH_PAGE_NUMBERS.find(page => page >= number) ?? 13;
}

export function isGuideArtwork(page: OfficialUmrahPageNumber) {
  return page === 1 || page === 13;
}

export type OfficialGuideReaderState = {
  page: OfficialUmrahPageNumber;
  textMode: boolean;
  textScale: number;
};
type ReaderAction = { type: 'next' | 'previous' | 'toggle-view' | 'increase-text' | 'decrease-text' };

export function initialGuideReaderState(page: unknown): OfficialGuideReaderState {
  return { page: officialGuidePage(page), textMode: false, textScale: 1 };
}

export function officialGuideReaderReducer(state: OfficialGuideReaderState, action: ReaderAction): OfficialGuideReaderState {
  if (action.type === 'next' || action.type === 'previous') {
    const index = OFFICIAL_UMRAH_PAGE_NUMBERS.indexOf(state.page);
    const next = Math.max(0, Math.min(OFFICIAL_UMRAH_PAGE_NUMBERS.length - 1, index + (action.type === 'next' ? 1 : -1)));
    // Reading preferences survive page changes, including visits to the covers.
    return { ...state, page: OFFICIAL_UMRAH_PAGE_NUMBERS[next] };
  }
  if (isGuideArtwork(state.page)) return state;
  if (action.type === 'toggle-view') return { ...state, textMode: !state.textMode };
  const textScale = Math.max(1, Math.min(2.5, state.textScale + (action.type === 'increase-text' ? 0.25 : -0.25)));
  // A bitmap cannot reflow. Enlarging switches to real, wrapping text instead
  // of growing the image beyond the screen width.
  return { ...state, textMode: true, textScale };
}

// Remove print line wrapping and the page-number footer without changing the
// author's words. Preserve indented paragraph starts and blank-line breaks.
export function guideTextParagraphs(text: string, sourcePage: number): string[] {
  const lines = text.replace(/\r/g, '').replace(new RegExp(`\\n\\s*${sourcePage}\\s*$`), '').split('\n');
  const paragraphs: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) paragraphs.push(current.join(' ').replace(/(\p{L}-) (?=\p{L})/gu, '$1'));
    current = [];
  };
  for (const line of lines) {
    if (!line.trim()) { flush(); continue; }
    if (/^\s{2,}\S/.test(line)) flush();
    current.push(line.trim());
  }
  flush();
  return paragraphs;
}
