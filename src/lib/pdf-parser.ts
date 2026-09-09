/**
 * PDF text extraction for Nusuk Hajj itinerary PDFs.
 *
 * Uses iOS native PDFKit (via local Expo module) for text extraction.
 * This handles all font encodings correctly without any JS PDF parsing.
 * Falls back to a lightweight regex-based parser for non-standard PDFs.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { extractPdfText } from '../../modules/pdf-text-extractor/src';
import { isNusukItinerary, parseNusukText } from './nusuk-parser';
import { EMPTY_ITINERARY } from './sample-data';
import type { Itinerary } from './types';

export interface PdfParseOutcome {
  itinerary: Itinerary;
  /** Which parser produced the result. */
  source: 'nusuk' | 'fuzzy' | 'empty';
  /** 0–1 — how complete the result is. <0.6 means the user should fill in Settings. */
  confidence: number;
  /** Field paths that we couldn't extract, so the UI can highlight them. */
  missing: string[];
}

const AIRLINE_CODES: Record<string, string> = {
  EK: 'Emirates',
  SV: 'Saudia',
  QR: 'Qatar Airways',
  TK: 'Turkish Airlines',
  BA: 'British Airways',
  MS: 'EgyptAir',
  PK: 'PIA',
  WY: 'Oman Air',
  GF: 'Gulf Air',
  FZ: 'flydubai',
};

function guessAirline(flightCode: string): string {
  const code = flightCode.substring(0, 2);
  return AIRLINE_CODES[code] || code;
}

function extractFlightNumbers(text: string): string[] {
  const matches = text.match(/[A-Z]{2}\d{2,4}/g);
  return matches || [];
}

// --------------------------------------------------------------------------
// Fuzzy parser for non-Nusuk PDFs
// --------------------------------------------------------------------------

function parseItineraryText(text: string): Itinerary {
  const data: Itinerary = JSON.parse(JSON.stringify(EMPTY_ITINERARY));

  const namePatterns = [
    /(?:Pilgrim|Passenger|Name)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /(?:Mr|Mrs|Ms|Miss)[.\s]+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
  ];
  for (const p of namePatterns) {
    const match = text.match(p);
    if (match) {
      data.pilgrim.name = match[1].trim();
      break;
    }
  }

  const pkgMatch = text.match(/(\d{3})\s+(\w+(?:\s\w+)?)\s*(?:package|pkg)/i);
  if (pkgMatch) {
    data.pilgrim.packageNumber = pkgMatch[1];
    data.pilgrim.packageName = pkgMatch[2];
  }

  const typeMatch = text.match(/(B2[CB]|B2B)/i);
  if (typeMatch) data.pilgrim.pilgrimType = typeMatch[1].toUpperCase();

  const guideMatch = text.match(/(?:Guide|Mutawwif)[:\s]+([A-Za-z\s]+?)(?:\n|\r|Phone|Tel)/i);
  if (guideMatch) data.guide.name = guideMatch[1].trim();

  const phoneMatch = text.match(/(?:Guide|Mutawwif)[\s\S]*?(\+?\d[\d\s-]{8,})/i);
  if (phoneMatch) data.guide.phone = phoneMatch[1].trim();

  const campMatch = text.match(/(?:Camp|Mina)[:\s]+([A-Za-z\s]+?)(?:\n|\r|Trans)/i);
  if (campMatch) data.camp.name = campMatch[1].trim();

  const allFlights = extractFlightNumbers(text);
  if (allFlights.length >= 2) {
    data.flights.outbound.flightNumbers = allFlights.slice(0, 2);
    data.flights.outbound.airline = guessAirline(allFlights[0]);
    if (allFlights.length >= 4) {
      data.flights.return.flightNumbers = allFlights.slice(2, 4);
      data.flights.return.airline = guessAirline(allFlights[2]);
    }
  }

  const refMatch = text.match(/(?:Booking|Reference|PNR|Ref)[:\s]+([A-Z0-9]{5,8})/i);
  if (refMatch) {
    data.flights.outbound.bookingRef = refMatch[1];
    data.flights.return.bookingRef = refMatch[1];
  }

  return data;
}

// --------------------------------------------------------------------------
// Main entry point
// --------------------------------------------------------------------------

export async function parsePdfText(fileUri: string): Promise<PdfParseOutcome> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('File not found');

    console.log('[PDF Parser] Reading file:', fileUri);

    // Use native iOS PDFKit for text extraction — handles all font encodings
    console.log('[PDF Parser] Extracting text with native PDFKit...');
    const text = await extractPdfText(fileUri);
    console.log(`[PDF Parser] Extracted text length: ${text.length}`);
    if (text && text.length > 50) {
      console.log('[PDF Parser] Checking if Nusuk itinerary...');
      if (isNusukItinerary(text)) {
        console.log('[PDF Parser] Nusuk itinerary detected, parsing...');
        const nusuk = parseNusukText(text);
        console.log(`[PDF Parser] Nusuk confidence: ${nusuk.confidence}, missing: ${nusuk.missing.join(', ')}`);
        return {
          itinerary: nusuk.itinerary,
          source: 'nusuk',
          confidence: nusuk.confidence,
          missing: nusuk.missing,
        };
      }
      console.log('[PDF Parser] Not a Nusuk itinerary, trying fuzzy parse...');
      const fuzzy = parseItineraryText(text);
      const hasName = !!fuzzy.pilgrim.name;
      const hasFlight = fuzzy.flights.outbound.flightNumbers.length > 0;
      return {
        itinerary: fuzzy,
        source: 'fuzzy',
        confidence: hasName && hasFlight ? 0.4 : hasName || hasFlight ? 0.2 : 0,
        missing: [],
      };
    }
    console.log(`[PDF Parser] Insufficient text extracted (${text.length} chars)`);
    return {
      itinerary: JSON.parse(JSON.stringify(EMPTY_ITINERARY)),
      source: 'empty',
      confidence: 0,
      missing: [],
    };
  } catch (error) {
    console.error('[PDF Parser] parsePdfText error:', error);
    return {
      itinerary: JSON.parse(JSON.stringify(EMPTY_ITINERARY)),
      source: 'empty',
      confidence: 0,
      missing: [],
    };
  }
}
