export const CONNECTORS = {
  tenders: { name: "CanadaBuys · open tenders", kind: "tender", url: "https://canadabuys.canada.ca/opendata/pub/openTenderNotice-ouvertAvisAppelOffres.csv" },
  awards: { name: "CanadaBuys · 2026–27 awards", kind: "award", url: "https://canadabuys.canada.ca/opendata/pub/2026-2027-awardNotice-avisAttribution.csv" },
  history: { name: "CanadaBuys · 2026–27 contract history", kind: "award", url: "https://canadabuys.canada.ca/opendata/pub/2026-2027-contractHistory-contratsOctroyes.csv" },
} as const;

// Find a complete CSV record boundary, including quoted newlines and escaped quotes.
export function csvPrefix(text: string, maxRows: number) {
  let quoted = false, rows = 0, end = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; }
    if (text[i] === "\n" && !quoted) { end = i + 1; if (++rows >= maxRows + 1) return { text: text.slice(0, end), complete: true, rows: rows - 1 }; }
  }
  return { text: text.slice(0, end), complete: false, rows: Math.max(0, rows - 1) };
}
