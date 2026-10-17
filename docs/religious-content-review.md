# Religious content: independent review required before launch

Status: **PENDING. No qualified scholar has reviewed or approved Qasd.**

The source audit on 16 October 2026 is an editorial check, not a fatwa or independent scholarly endorsement. The app owner must appoint a qualified scholar experienced in Hajj and Umrah. Do not describe Qasd as scholar approved until the written sign-off is recorded. No scholar has been contacted through this task.

## Source edition

- [Manner of Performing Umrah, by Abdul-Aziz ibn Abdullah ibn Baz](https://risala.prh.gov.sa/storage/contents/117/en_omrah.pdf), distributed by the Presidency of Religious Affairs.
- Original: `assets/guides/en_omrah.pdf`, 13 pages, 469,987 bytes.
- SHA-256: `fdcd46018daacb760ef355403f51545e6d9d18a35e75e10ccc6d27ec515110d1`.
- Page images preserve the original publication, including its title and attribution. English text view is extracted from the same PDF with print line breaks removed. The Quranic verse excerpts on pages 8 and 9 were transcribed from the visible originals because the PDF text layer scrambled the Arabic; they also require the scholar's checks. The original PDF and all page images remain unchanged.
- The booklet attributes itself to a summary issued by Ibn Baz's office on 13/2/1416 AH, Majmu Fatawa wa Maqalat 17/425 (p. 12). PDF and printed page numbers coincide.

## Changes made by the source audit

| Lesson | Primary reference | Editorial change / question for reviewer |
| --- | --- | --- |
| Ihram | Booklet pp. 4–6 | Intention, verbal entry and Talbiyah; distinguish clothing from Ihram. Check women's clothing, menstruation/post-natal bleeding, Miqat timing and the boundaries of this short summary. |
| Enter the Mosque | p. 6 | Right foot and the entry supplication, including seeking refuge. Check Arabic, transliteration and meaning independently. Entrance wayfinding is practical advice. |
| See the Ka'bah | No separate first-sight ritual in booklet | Removed the instruction to stop, raise hands and expect special acceptance. Practical orientation only. [Ibn Baz's commentary](https://binbaz.org.sa/audios/1976/10-من-حديث-والله-انك-لخير-ارض-الله-واحب-ارض-الله-الى-الله) says the narrations about special hand-raising are weak and no special du'a is prescribed. Reviewer to confirm wording and treatment of differences. |
| Black Stone / Tawaf | pp. 6–8; [Ibn Baz fatwa 4697](https://binbaz.org.sa/fatwas/4697/ما-حكم-الطواف-من-داخل-الحجر) | No crowding or harm. Point and say Takbir if unable to touch; no kissing a hand used only to point. Remain outside the Hijr enclosure. The marker image is explicitly an illustration and the diagram is not to scale. Verify green-light alignment and anticlockwise arrows with a guide familiar with the present mosque layout. |
| Raml | pp. 7–9; [Ibn Baz fatwa 12446](https://binbaz.org.sa/fatwas/12446/في-اي-طواف-يكون-الاضطباع) | Men, first three circuits, when space allows; normal pace for the last four. Differentiate Raml from Idtiba throughout seven circuits and covering afterwards. Visual highlights 1–3, not all seven. |
| Normal Tawaf | pp. 8–9 | Normal pace in 4–7; no prescribed individual du'a for every circuit. Check the Yemeni Corner supplication applies throughout Tawaf, not only the Raml circuits. |
| Prayer after Tawaf | p. 9 | Space permitting behind Maqam; elsewhere in the mosque if necessary. Suggested surahs are recommendations, not validity conditions. Check al-Fatihah and the distinction between Quran quotation and a personal du'a. |
| Zamzam | Not in this short booklet | Use [Ibn Baz fatwa 15860](https://binbaz.org.sa/fatwas/15860/الشرب-من-ماء-زمزم-سنة) for recommended drinking. Removed fixed three-sip/Qiblah instructions and the unqualified quotation about what it is drunk for. Do not attribute this lesson to a booklet page that does not discuss it. |
| Safa | pp. 9–11 | Verse on first approaching Safa, then dhikr and personal supplication facing Qiblah. Replaced the abbreviated instruction to just say Takbir three times. Full Arabic/transliteration/translation need specialist checking. |
| Sa'i lengths | pp. 10–11 | Seven one-way lengths, starting Safa and ending Marwa; men's faster section between markers, women walk throughout. Verify mobility accommodations and avoid implying ritual purity is a validity condition for Sa'i. |
| Shave / Trim | pp. 11–12; [fatwa 16707](https://binbaz.org.sa/fatwas/16707/حكم-التقصير-في-العمرة) | Whole-head shortening in Ibn Baz's explanation; shaving generally preferred, shortening preferred when Hajj is close. Women gather and trim a fingertip's length or less. Ask reviewer to explain legitimate differences and individual cases rather than dismiss other views. |
| Completion | pp. 11–12 | Completion follows the actual rites and hair removal. App checkmarks do not certify validity. The raised-hands illustration expresses gratitude, not a prescribed final ritual. |

## Scholar's review scope

Review the complete shipped experience: `src/lib/umrah-steps.ts`, `src/lib/umrah-lesson-content.ts`, every lesson image and diagram, du'a displays and saved du'as, Perform mode/counter prompts/completion labels, `src/app/hajj-guide.tsx` (including its cited narrations), `src/lib/journey.ts`, preparation advice and the original-book reader. Hajj content has **not** been audited in this change and also needs independent review before Qasd launches.

Confirm obligations versus recommendations; evidence and attribution; Arabic/transliteration/translation; differences of scholarly opinion; women-specific instructions including menstruation and post-natal bleeding; mobility and crowding; and when a pilgrim should ask a scholar about their own situation. Review illustrations for unintended religious instructions, especially first sight, Raml, Idtiba, hair removal and completion.

## Record approval and release

Production build/submit scripts and the production EAS build hook fail until a written review is recorded. Development, preview and local app runs remain available for review.

1. Have the independent scholar review the final wording and visuals and resolve all requested corrections. Retain their signed written assessment in the repository, including scope, qualifications, date, exceptions and approval of the final version.
2. After those corrections, run `node scripts/check-religious-review.cjs --fingerprint` to identify the exact source and educational assets reviewed. The fingerprint includes all `src` files because religious wording is spread across screens; changing those files or educational assets invalidates it.
3. The responsible app owner records the actual reviewer, qualifications, review date, evidence-file path and fingerprint in `docs/religious-review.json`, setting status to `approved` only after real approval. Do not use placeholder approval or the editorial source audit as evidence.
4. Run `npm run check:religious-review` before release. The check verifies the approval record and content version; it cannot establish a person's qualifications or authenticate their signature. The owner remains responsible for those checks.

Reviewer: pending. Qualifications: pending. Written assessment: pending. Final content approval: pending.
