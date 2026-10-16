# Learning and navigation review

Implementation is ready for the owner's device review. No device usability study or navigation experiment has been run by Codex.

## Reading and continuation

Continue learning opens the first unreviewed topic in ritual order. Resume reading returns to the last-opened topic, even if reviewed. Resume is shown as a separate secondary action when its destination differs. All reviewed means no next unreviewed topic; the guide offers revisiting instead. Browsing and review never mark a ritual as performed.

Regression scenario: review the first three topics, open Completing Umrah and return home. Expect `3 of 12 topics reviewed`, the next unreviewed topic Black Stone Start, and a separate Resume reading action for Completing Umrah. Repeat with zero reviews, holes in the reviewed sequence, stale saved IDs and all 12 reviewed.

## Reader footer

Learning now combines two approaches for comparison on device: a persistent single-row reviewed/previous/next control and a full next-topic card in the scroll content at the end. The old learning footer used a completion row plus a 64-point next card and spacing; the compact footer normally uses a 44-point control row plus 10 points padding, excluding device safe area. Allow rows to grow for larger accessibility fonts.

Owner/device checks: compare the old screenshots and the updated Maqam, Zamzam and Raml lessons on a small iPhone with normal and large text. Confirm more guidance is visible, all content can be reached, review toggles persist, previous/next work from either pane and the final card returns to Guide. Perform mode retains its existing completion/counter navigation pending separate observation during ritual rehearsal.

## Guest and unbooked states

Journey and Flights already show guest states when no trip exists. Both now offer preparation and the guide; adding a trip is optional. A saved route with dates but no airline/flight numbers/booking reference/times now explains that no flight details have been added and provides preparation access. Planned travel dates are not treated as proof of booking. Partially entered flight information should remain editable.

## Proposed navigation study — no tab restructuring yet

Compare the current `Home | Guide | Journey | Flights | Settings` with `Home | Prepare | Guide | My Trip` and a settings/profile button before changing it. Keep the new native glass bar during both variants so visual style does not bias the comparison.

Recruit first-time pilgrims in at least three situations: browsing without bookings, planning with incomplete travel details and preparing with a saved itinerary. Ask each to find the packing/preparation checklist, learn Tawaf, resume a lesson, find a flight, edit trip details and change a setting. Alternate variant order. Record first tap, successful completion, backtracking and user explanation of My Trip versus Prepare. Ask whether unbooked users understand the optional trip state. Choose labels and permanent destinations from those observations; no study outcome is claimed here.
