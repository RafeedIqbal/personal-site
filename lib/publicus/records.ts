// The ten CanadaBuys rows shown in the explorer's records dialog. Pure functions with no runtime
// imports, so the Node tests can load this file directly.
import type { ProcurementRecord, Source } from "@/supabase/functions/_shared/domain";

export type RecordRow = { record: ProcurementRecord; n: string; source?: Source };

// CanadaBuys keys are camelCase bilingual pairs (plus a bare "unspsc"). Lines such as "E-Mail:" inside a
// free-text description are not keys, so they stay with the description, which the dialog never shows.
const FIELD = /^(unspsc|[a-z][A-Za-z]*(?:-[A-Za-z]+)+):\s?([\s\S]*)$/;
// Descriptions name contact people; notice URLs, attachments and commodity codes are long and add nothing here.
const OMITTED = /description|noticeURL|attachment|^unspsc/i;

// Awards first: their contract amounts and totals are where the rows disagree with themselves.
export function recordRows(snapshot: { records: ProcurementRecord[]; sources: Source[] }): RecordRow[] {
  const ordered = [...snapshot.records.filter((record) => record.kind === "award"), ...snapshot.records.filter((record) => record.kind !== "award")];
  return ordered.map((record, index) => ({
    record,
    n: String(index + 1).padStart(2, "0"),
    source: snapshot.sources.find((source) => source.id === record.sourceId),
  }));
}

export function rawFields(text: string) {
  const fields: { key: string; value: string }[] = [];
  for (const line of text.replaceAll("\r", "").split("\n")) {
    const match = FIELD.exec(line);
    if (match) fields.push({ key: match[1], value: match[2] });
    else if (fields.length) fields[fields.length - 1].value += `\n${line}`;
  }
  return fields.filter((field) => !OMITTED.test(field.key));
}

// An award whose total contract value is zero while its contract amount is not: the row disagrees with itself.
export function contradicts(record: ProcurementRecord) {
  return record.kind === "award" && record.totalValue === 0 && (record.amount ?? 0) > 0;
}

export function figure(value: number | null) {
  return value === null ? "n/a" : value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Links on the page and in the help chat open the dialog: #records opens row 01, #cb-NN opens row NN.
export function rowFromHash(hash: string, count = 10): string | null {
  if (hash === "#records") return "01";
  const match = /^#cb-(\d\d)$/.exec(hash);
  if (!match) return null;
  const n = Number(match[1]);
  return n >= 1 && n <= count ? match[1] : null;
}
