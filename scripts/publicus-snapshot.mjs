// Rebuild the checked-in, explicitly dated CanadaBuys snapshot from downloaded official CSVs.
// node scripts/publicus-snapshot.mjs /path/to/tenders.csv /path/to/awards.csv
import fs from "node:fs/promises";
import crypto from "node:crypto";
import Papa from "papaparse";
import { inferMapping, normalizeCsvRow, safeUrl } from "../supabase/functions/_shared/domain.ts";

const capturedAt = new Date().toISOString();
const records = [], sources = [];
for (const [file, kind, url, limit] of [
  [process.argv[2], "tender", "https://canadabuys.canada.ca/opendata/pub/openTenderNotice-ouvertAvisAppelOffres.csv", 6],
  [process.argv[3], "award", "https://canadabuys.canada.ca/opendata/pub/2026-2027-awardNotice-avisAttribution.csv", 4],
]) {
  const parsed = Papa.parse(await fs.readFile(file, "utf8"), { header: true, skipEmptyLines: true });
  const mapping = inferMapping(parsed.meta.fields);
  let count = 0;
  for (const [index, row] of parsed.data.entries()) {
    const title = row[mapping.title] || "";
    if (!/software|cloud|data|information|digital|computer|cyber|network/i.test(title)) continue;
    const retained = Object.fromEntries(Object.entries(row).filter(([key, value]) => value && !/contact|email|telephone|fax|address|postal|zip|street/i.test(key)));
    const text = Object.entries(retained).map(([key, value]) => `${key}: ${value}`).join("\n");
    const checksum = crypto.createHash("sha256").update(text).digest("hex");
    const source = { id: `public-${checksum.slice(0, 24)}`, name: `CanadaBuys · ${title}`, origin: "public", format: "csv", url, noticeUrl: safeUrl(row["noticeURL-URLavis-eng"] || row["noticeURL-URLavis-fra"]), capturedAt, text, row: index + 2, checksum };
    const record = normalizeCsvRow(row, mapping, source, 0, kind);
    if (!record) continue;
    records.push(record); sources.push(source);
    if (++count >= limit) break;
  }
}
if (!records.length) throw new Error("No source records found; keep the previous snapshot.");
await fs.writeFile(new URL("../lib/publicus/public-records.json", import.meta.url), JSON.stringify({ capturedAt, records, sources }, null, 2) + "\n");
console.log(`Captured ${records.length} public records at ${capturedAt}.`);
