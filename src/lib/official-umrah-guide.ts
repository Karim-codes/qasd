import type { OfficialUmrahPageNumber } from './official-umrah-reader';

// Faithful page images of the linked Presidency of Religious Affairs publication.
// The original PDF is retained in assets/guides/en_omrah.pdf for provenance.
export const OFFICIAL_UMRAH_PAGES: Record<OfficialUmrahPageNumber, number> = {
  1: require('../../assets/guides/umrah-page-01.jpg'),
  3: require('../../assets/guides/umrah-page-03.jpg'),
  4: require('../../assets/guides/umrah-page-04.jpg'),
  5: require('../../assets/guides/umrah-page-05.jpg'),
  6: require('../../assets/guides/umrah-page-06.jpg'),
  7: require('../../assets/guides/umrah-page-07.jpg'),
  8: require('../../assets/guides/umrah-page-08.jpg'),
  9: require('../../assets/guides/umrah-page-09.jpg'),
  10: require('../../assets/guides/umrah-page-10.jpg'),
  11: require('../../assets/guides/umrah-page-11.jpg'),
  12: require('../../assets/guides/umrah-page-12.jpg'),
  13: require('../../assets/guides/umrah-page-13.jpg'),
};

export const OFFICIAL_UMRAH_TEXT: string[] = require('../../assets/guides/en_omrah-text.json');

export { officialGuidePage } from './official-umrah-reader';
