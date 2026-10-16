export type LessonArtwork = 'ihram' | 'haram' | 'entrance' | 'kaaba-close' | 'tawaf-start' | 'tawaf' | 'raml' | 'maqam' | 'zamzam' | 'safa' | 'sai' | 'trim' | 'completion';

type LessonVisual = { artwork: LessonArtwork; caption: string; women?: string; men?: string };

// Source references are recorded per topic below. The source audit is not scholar approval.
// See docs/religious-content-review.md for the pending independent review.
export const UMRAH_LESSON_VISUALS: Record<string, LessonVisual> = {
  ihram: {
    artwork: 'ihram', caption: 'Ihram clothing looks different for men and women.',
    men: 'Wear two unstitched cloths. Keep both shoulders covered before Tawaf.',
    women: 'Wear loose, modest clothing; there is no special colour or two-piece outfit. Do not wear a fitted niqab or gloves in Ihram. Menstruation or post-natal bleeding does not prevent entering Ihram, but wait until you are ritually pure and have bathed before Tawaf. Ask a qualified scholar about your circumstances.',
  },
  'enter-masjid': { artwork: 'entrance', caption: 'Approaching an entrance to al-Masjid al-Haram.' },
  'first-sight': { artwork: 'kaaba-close', caption: 'A pilgrim’s view, close to the Ka’bah.' },
  'tawaf-start': {
    artwork: 'tawaf-start', caption: 'Begin in line with the Black Stone. The green wall light marks the same alignment.',
    women: 'Walk at your normal pace and keep your shoulders covered throughout Tawaf.',
  },
  'tawaf-raml': {
    artwork: 'raml', caption: 'Circuits 1–3: Raml for men if space allows. Circuits 4–7: normal walking. Women walk normally in all seven.',
    women: 'There is no Raml or uncovered shoulder for women. Continue at a normal pace.',
  },
  'tawaf-normal': { artwork: 'tawaf', caption: 'Circuits 4–7 · a normal walking pace.' },
  'tawaf-prayer': { artwork: 'maqam', caption: 'Maqam Ibrahim: recognise its gold-coloured glass enclosure. Pray where there is space.' },
  zamzam: { artwork: 'zamzam', caption: 'A Zamzam drinking point inside the Haram, with taps and drinking cups.' },
  'sai-start': { artwork: 'safa', caption: 'The rock of Safa and the Safa Start sign. This is where Sa’i begins.' },
  'sai-laps': {
    artwork: 'sai', caption: 'Each one-way journey counts as one length.',
    women: 'Walk throughout Sa’i, including between the green markers. The faster pace there is for men.',
  },
  halq: {
    artwork: 'trim', caption: 'Two examples after Sa’i: shaving for men and trimming the ends for women.',
    men: 'Shave or shorten across the whole head. Shaving is generally preferred; shorten instead if Hajj is close, as explained in the source guide.',
    women: 'Gather your hair and trim a fingertip’s length or less from the ends. Women do not shave their heads.',
  },
  complete: { artwork: 'completion', caption: 'An illustration of du’a in Makkah. May Allah accept your Umrah.' },
};

export const UMRAH_GUIDANCE_SOURCE = 'https://risala.prh.gov.sa/storage/contents/117/en_omrah.pdf';
export const HARAM_PHOTO_SOURCE = 'https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg';

export type LessonSource = { page: number; label: string; note?: string; additional?: { title: string; url: string } };

// PDF page numbers match the printed page numbers in this 13-page edition.
export const UMRAH_LESSON_SOURCES: Record<string, LessonSource> = {
  ihram: { page: 4, label: 'Ibn Baz · Umrah guide, pp. 4–6' },
  'enter-masjid': { page: 6, label: 'Ibn Baz · Umrah guide, p. 6' },
  'first-sight': {
    page: 6, label: 'Practical orientation before Tawaf',
    note: 'The booklet proceeds from entering the mosque to beginning Tawaf. This topic does not add a prescribed first-sight ritual.',
    additional: { title: 'Ibn Baz on first-sight du’a', url: 'https://binbaz.org.sa/audios/1976/10-من-حديث-والله-انك-لخير-ارض-الله-واحب-ارض-الله-الى-الله' },
  },
  'tawaf-start': { page: 6, label: 'Ibn Baz · Umrah guide, pp. 6–8', note: 'The green-light image and diagram are wayfinding aids. The booklet identifies the Black Stone as the start.', additional: { title: 'Ibn Baz on going outside the Hijr', url: 'https://binbaz.org.sa/fatwas/4697/ما-حكم-الطواف-من-داخل-الحجر' } },
  'tawaf-raml': { page: 7, label: 'Ibn Baz · Umrah guide, pp. 7–9' },
  'tawaf-normal': { page: 8, label: 'Ibn Baz · Umrah guide, pp. 8–9' },
  'tawaf-prayer': { page: 9, label: 'Ibn Baz · Umrah guide, p. 9' },
  zamzam: {
    page: 9, label: 'Ibn Baz · Drinking Zamzam is recommended',
    note: 'Zamzam is not discussed in this short booklet. The recommendation comes from the separate fatwa below; the drinking-point advice is practical.',
    additional: { title: 'Read the Zamzam fatwa', url: 'https://binbaz.org.sa/fatwas/15860/الشرب-من-ماء-زمزم-سنة' },
  },
  'sai-start': { page: 9, label: 'Ibn Baz · Umrah guide, pp. 9–11' },
  'sai-laps': { page: 10, label: 'Ibn Baz · Umrah guide, pp. 10–11' },
  halq: { page: 11, label: 'Ibn Baz · Umrah guide, pp. 11–12', additional: { title: 'Ibn Baz on shortening across the whole head', url: 'https://binbaz.org.sa/fatwas/16707/حكم-التقصير-في-العمرة' } },
  complete: { page: 11, label: 'Ibn Baz · Umrah guide, pp. 11–12' },
};
