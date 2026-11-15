// The explorer's first-run setup: who the visitor is, what they want flagged, and the live
// previews shown while they answer. Pure functions with relative `.ts` imports, so the Node
// tests can load this file directly.
import { CAPABILITIES, contracts, inferTags, matchRecord, normalize } from "../../supabase/functions/_shared/domain.ts";
import type { ContractGroup, ProcurementRecord, Profile } from "../../supabase/functions/_shared/domain.ts";

export type Role = "vendor" | "buyer";
export type Setup = { role: Role; buyer?: string; watch: string[] };
export const SETUP_KEY = "publicus-setup-v1";
export const TOUR_KEY = "publicus-tour-v1";

// The flags `contracts()` can raise, in its order. A test checks that this list stays complete.
export const REVIEW_FLAGS = [
  { flag: "Conflicting contract values", detail: "Two versions of the same record report different totals." },
  { flag: "Expires within six months", detail: "The contract ends within 180 days, so a renewal needs planning." },
  { flag: "Contract term has ended", detail: "The end date has passed." },
  { flag: "Contract value increased 20%+", detail: "Amendments raised the value by a fifth or more." },
  { flag: "Repeated amendments", detail: "Three or more amendments to one contract." },
  { flag: "Source review needed", detail: "Fields extracted from a source haven’t been checked yet." },
];
export const ALL_FLAGS: string[] = REVIEW_FLAGS.map(({ flag }) => flag);

export const VALUE_PRESETS = [250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000_000];
export const ANY_SIZE = 10_000_000_000;
export const BLANK_PROFILE: Profile = { name: "", capabilities: [], regions: [], maxValue: 2_000_000, qualifications: [] };

export function readSetup(raw: string | null): Setup | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const { role, buyer, watch } = value as Record<string, unknown>;
    if (role !== "vendor" && role !== "buyer") return null;
    if (!Array.isArray(watch) || !watch.every((flag) => typeof flag === "string" && ALL_FLAGS.includes(flag))) return null;
    const flags = [...new Set(watch as string[])];
    if (role === "vendor") return { role, watch: flags };
    if (typeof buyer !== "string" || !buyer.trim() || buyer.length > 300) return null;
    return { role, buyer, watch: flags };
  } catch {
    return null;
  }
}

// Blocked or full storage only means setup and the tour show again next time.
export function loadSetup(): Setup | null { try { return readSetup(localStorage.getItem(SETUP_KEY)); } catch { return null; } }
export function saveSetup(setup: Setup) { try { localStorage.setItem(SETUP_KEY, JSON.stringify(setup)); } catch { /* See above. */ } }
export function clearSetup() { try { localStorage.removeItem(SETUP_KEY); localStorage.removeItem(TOUR_KEY); } catch { /* See above. */ } }
export function tourSeen() { try { return localStorage.getItem(TOUR_KEY) === "1"; } catch { return false; } }
export function markTourSeen() { try { localStorage.setItem(TOUR_KEY, "1"); } catch { /* See above. */ } }

// The same keyword rules that tag imported records, so a sentence about the company ticks capabilities.
export function capabilitiesFromText(text: string): string[] {
  return text.trim() ? inferTags(text).filter((tag) => CAPABILITIES.includes(tag)) : [];
}

export type PreviewRow = { id: string; title: string; buyer: string; score: number; passes: boolean; issue?: string };
// Sorted by score alone, like the explorer's list, so the preview's order is the order you land on.
export function vendorPreview(records: ProcurementRecord[], profile: Profile, asOf: string) {
  const ranked = records.filter((record) => record.kind === "tender").map((record) => ({ record, match: matchRecord(record, profile, asOf) })).sort((a, b) => b.match.score - a.match.score);
  const rows: PreviewRow[] = ranked.map(({ record, match }) => ({ id: record.id, title: record.title, buyer: record.buyer, score: match.score, passes: match.canQualify, issue: match.issues[0] }));
  const fits = ranked.filter(({ match }) => match.relevant.length > 0 && match.geography && match.withinBudget).length;
  return { rows, total: rows.length, fits, passing: rows.filter((row) => row.passes).length };
}

export const sameBuyer = (a: string, b: string) => normalize(a) === normalize(b);
export const watched = (flags: string[], watch: string[]) => flags.filter((flag) => watch.includes(flag));

export type BuyerOption = { buyer: string; contracts: number; versions: number; tenders: number };
// Buyers with at least one contract, the richest history first.
export function buyerOptions(records: ProcurementRecord[], asOf: string): BuyerOption[] {
  const options = new Map<string, BuyerOption>();
  for (const group of contracts(records, asOf)) {
    const key = normalize(group.latest.buyer);
    const option = options.get(key) ?? { buyer: group.latest.buyer, contracts: 0, versions: 0, tenders: 0 };
    option.contracts++; option.versions += group.versions.length;
    options.set(key, option);
  }
  for (const record of records) if (record.kind === "tender") { const option = options.get(normalize(record.buyer)); if (option) option.tenders++; }
  return [...options.values()].sort((a, b) => b.contracts - a.contracts || b.versions - a.versions || a.buyer.localeCompare(b.buyer));
}

export function buyerPreview(records: ProcurementRecord[], buyer: string, watch: string[], asOf: string) {
  return contracts(records, asOf).filter((group) => sameBuyer(group.latest.buyer, buyer)).map((group) => ({ group, flags: watched(group.flags, watch) }));
}

const supplierOf = (record: ProcurementRecord) => record.supplierKey || normalize(record.supplier || "");
// Other buyers holding a contract with this contract's supplier. Exact keys only, as in the supplier chart.
export function suppliersElsewhere(group: ContractGroup, groups: ContractGroup[]): string[] {
  const supplier = supplierOf(group.latest);
  if (!supplier) return [];
  return [...new Set(groups.filter((other) => other.id !== group.id && supplierOf(other.latest) === supplier && !sameBuyer(other.latest.buyer, group.latest.buyer)).map((other) => other.latest.buyer))];
}
