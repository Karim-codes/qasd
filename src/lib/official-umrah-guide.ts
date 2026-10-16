// Faithful page images of the linked Presidency of Religious Affairs publication.
// The original PDF is retained in assets/guides/en_omrah.pdf for provenance.
export const OFFICIAL_UMRAH_PAGES = [
  require('../../assets/guides/umrah-page-01.jpg'),
  require('../../assets/guides/umrah-page-02.jpg'),
  require('../../assets/guides/umrah-page-03.jpg'),
  require('../../assets/guides/umrah-page-04.jpg'),
  require('../../assets/guides/umrah-page-05.jpg'),
  require('../../assets/guides/umrah-page-06.jpg'),
  require('../../assets/guides/umrah-page-07.jpg'),
  require('../../assets/guides/umrah-page-08.jpg'),
  require('../../assets/guides/umrah-page-09.jpg'),
  require('../../assets/guides/umrah-page-10.jpg'),
  require('../../assets/guides/umrah-page-11.jpg'),
  require('../../assets/guides/umrah-page-12.jpg'),
  require('../../assets/guides/umrah-page-13.jpg'),
] as const;

export const OFFICIAL_UMRAH_TEXT: string[] = require('../../assets/guides/en_omrah-text.json');

export function officialGuidePage(value: unknown) {
  const page = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1;
  return Math.max(1, Math.min(OFFICIAL_UMRAH_PAGES.length, page));
}
