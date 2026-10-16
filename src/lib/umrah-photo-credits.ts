import type { LessonArtwork } from './umrah-lesson-content';

type PhotoCredit = { subject: string; author: string; source: string; license: string; licenseUrl?: string };

export const UMRAH_PHOTO_CREDITS: Partial<Record<LessonArtwork, PhotoCredit[]>> = {
  haram: [{ subject: 'Haram', author: 'Adli Wahid', source: 'https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }],
  entrance: [{ subject: 'Entrance', author: 'yousefmadari', source: 'https://commons.wikimedia.org/wiki/File:Main_door_haram.jpg', license: 'Public domain' }],
  'kaaba-close': [{ subject: 'Ka’bah', author: 'Omar Chatriwala', source: 'https://commons.wikimedia.org/wiki/File:Tawaf_of_the_Kaaba.jpg', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' }],
  'tawaf-start': [{ subject: 'Black Stone', author: 'Amerrycan Muslim', source: 'https://commons.wikimedia.org/wiki/File:The_Blackstone.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' }],
  maqam: [{ subject: 'Maqam Ibrahim', author: 'Ibrahim.ID', source: 'https://commons.wikimedia.org/wiki/File:Maqam_Ibrahim_2008.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' }],
  zamzam: [{ subject: 'Zamzam', author: 'M sh شراونة محمد', source: 'https://commons.wikimedia.org/wiki/File:ماء_زمزم_في_الحرم_المكي_الشريف.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }],
  safa: [
    { subject: 'Safa', author: 'Swerveut', source: 'https://commons.wikimedia.org/wiki/File:Mount_Safa_Mecca.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
    { subject: 'Safa Start sign', author: 'Kskhh', source: 'https://commons.wikimedia.org/wiki/File:Sa%27yee_To_Go_Safa_start.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  ],
};
