/** Shared, deterministic procurement logic. Runs in the browser, Node and Deno. */
export type RecordKind = "tender" | "award" | "amendment";
export type Origin = "sample" | "public" | "upload";
export type Stage = "Saved" | "In review" | "Qualified";
export type Source = {
  id: string;
  name: string;
  origin: Origin;
  format: "text" | "csv" | "pdf";
  url?: string;
  noticeUrl?: string;
  capturedAt: string;
  text: string;
  pages?: string[];
  row?: number;
  storagePath?: string;
  checksum?: string;
};
export type Requirement = { text: string; qualification: string; sourceId: string; quote: string };
export type ProcurementRecord = {
  id: string;
  sourceId: string;
  kind: RecordKind;
  origin: Origin;
  reference: string;
  contractId?: string;
  title: string;
  buyer: string;
  supplier?: string;
  supplierKey?: string;
  category: string;
  region: string;
  tags: string[];
  description: string;
  publishedAt?: string;
  closingAt?: string;
  startDate?: string;
  endDate?: string;
  currency: string;
  amount: number | null;
  totalValue: number | null;
  amendment: string;
  status: "open" | "closed" | "awarded" | "cancelled" | "unknown";
  requirements: Requirement[];
  needsReview: boolean;
};
export type Profile = { name: string; capabilities: string[]; regions: string[]; maxValue: number; qualifications: string[] };
export type Citation = { sourceId: string; quote: string; page?: number; row?: number };
export type Claim = { text: string; status: "supported" | "review" | "conflict"; citations: Citation[] };
export type Answer = { question: string; recordIds: string[]; claims: Claim[]; mode: "prepared" | "live"; generatedAt: string; fingerprint: string; model?: string };
export type Workspace = {
  schema: 1;
  id?: string;
  expiresAt: string;
  asOf: string;
  profile: Profile;
  records: ProcurementRecord[];
  sources: Source[];
  saved: Record<string, Stage>;
  notes: Record<string, string>;
  reviewed: Record<string, boolean>;
  aliases: Record<string, string>;
  answers: Answer[];
  scenario: string;
};
export type Run = { id: string; status: "queued" | "processing" | "complete" | "failed"; progress: string; error?: string; attempts: number; created_at: string };
export const LIMITS = { fileBytes: 10 * 1024 * 1024, pdfPages: 50, records: 500, sourceChars: 120_000, sources: 100, questionChars: 1000 };
export const CAPABILITIES = ["Cloud migration", "Data platforms", "Software development", "Cybersecurity", "Document management", "Facilities"];
export const QUALIFICATIONS = ["Reliability status", "Secret clearance", "ISO 27001", "Bilingual delivery"];
export const REGIONS = ["Ontario", "Quebec", "British Columbia", "Alberta", "Canada-wide"];
export const DEFAULT_PROFILE: Profile = { name: "Maple Systems", capabilities: ["Cloud migration", "Data platforms", "Software development"], regions: ["Ontario", "Quebec"], maxValue: 2_000_000, qualifications: ["Reliability status"] };

export const normalize = (text: string) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export function safeUrl(value?: string): string | undefined {
  if (!value) return;
  try { const url = new URL(value); if (url.protocol === "https:" || url.protocol === "http:") return url.href; } catch { /* Invalid URLs remain absent. */ }
}
export function money(value: number | null | undefined, currency = "CAD", compact = false): string {
  if (value == null || !Number.isFinite(value)) return "Not disclosed";
  if (!/^[A-Z]{3}$/.test(currency)) return `${value.toLocaleString("en-CA")} (currency unknown)`;
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 0 }).format(value);
}
export function dateLabel(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not stated";
  return new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
export function daysUntil(value: string | undefined, asOf: string): number | null {
  if (!value || !Number.isFinite(Date.parse(value)) || !Number.isFinite(Date.parse(asOf))) return null;
  return Math.ceil((Date.parse(value) - Date.parse(asOf)) / 86_400_000);
}
export function matchRecord(record: ProcurementRecord, profile: Profile, asOf: string) {
  const relevant = record.tags.filter((tag) => profile.capabilities.some((cap) => normalize(cap) === normalize(tag)));
  const geography = profile.regions.includes("Canada-wide") || record.region === "Canada-wide" || profile.regions.some((region) => record.region.includes(region));
  const value = record.totalValue ?? record.amount;
  const withinBudget = value === null || (record.currency === "CAD" && value <= profile.maxValue);
  const missing = record.requirements.filter((req) => !profile.qualifications.some((q) => normalize(q) === normalize(req.qualification)));
  const days = daysUntil(record.closingAt, asOf);
  const closed = record.status === "cancelled" || record.status === "closed" || (record.closingAt !== undefined && Date.parse(record.closingAt) <= Date.parse(asOf));
  const score = Math.round((record.tags.length ? relevant.length / record.tags.length : 0) * 55 + (geography ? 25 : 0) + (withinBudget ? 20 : 0));
  const issues: string[] = [];
  if (closed) issues.push("This opportunity is closed or cancelled.");
  if (!geography) issues.push("Delivery region is outside your profile.");
  if (!withinBudget) issues.push(record.currency === "CAD" ? "Above your contract-value limit." : "Compare the contract currency before qualifying.");
  missing.forEach((req) => issues.push(`Your profile does not include ${req.qualification.toLowerCase()}.`));
  if (!relevant.length) issues.push("No capability overlap in the current profile.");
  if (record.needsReview) issues.push("Extracted fields need human review.");
  if (!record.closingAt) issues.push("The closing date is not stated.");
  return { score, relevant, geography, withinBudget, missing, days, closed, issues, canQualify: record.kind === "tender" && issues.length === 0 };
}

export type ContractGroup = { id: string; versions: ProcurementRecord[]; latest: ProcurementRecord; original: ProcurementRecord; value: number | null; change: number | null; amendments: number; days: number | null; flags: string[]; conflicting: boolean };
export function contracts(records: ProcurementRecord[], asOf: string): ContractGroup[] {
  const groups = new Map<string, ProcurementRecord[]>();
  for (const record of records.filter((r) => r.kind !== "tender")) {
    // Never merge two buyers or distinct contracts on a title or a fuzzy vendor match.
    const key = `${normalize(record.buyer)}::${record.contractId || record.reference || record.id}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.entries()].map(([id, versions]) => {
    const sorted = [...versions].sort((a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? "") || numericVersion(a.amendment) - numericVersion(b.amendment));
    const latest = sorted[sorted.length - 1], original = sorted.find((r) => r.kind === "award") ?? sorted[0];
    const comparable = sorted.filter((r) => r.publishedAt === latest.publishedAt && r.amendment === latest.amendment);
    const conflicting = new Set(comparable.map((r) => JSON.stringify([r.totalValue ?? r.amount, r.currency, r.endDate]))).size > 1;
    const value = conflicting ? null : (latest.totalValue ?? (versions.length === 1 ? latest.amount : null));
    const base = original.totalValue ?? original.amount;
    const change = original.kind === "award" && value !== null && base !== null && base > 0 && latest.currency === original.currency ? ((value - base) / base) * 100 : null;
    const amendments = new Set(sorted.filter((r) => r.kind === "amendment").map((r) => r.amendment || r.id)).size;
    const days = daysUntil(latest.endDate, asOf);
    const flags: string[] = [];
    if (conflicting) flags.push("Conflicting contract values");
    if (days !== null && days >= 0 && days <= 180) flags.push("Expires within six months");
    if (days !== null && days < 0) flags.push("Contract term has ended");
    if (change !== null && change >= 20) flags.push("Contract value increased 20%+");
    if (amendments >= 3) flags.push("Repeated amendments");
    if (sorted.some((r) => r.needsReview)) flags.push("Source review needed");
    return { id, versions: sorted, latest, original, value, change, amendments, days, flags, conflicting };
  }).sort((a, b) => b.flags.length - a.flags.length || a.latest.title.localeCompare(b.latest.title));
}
function numericVersion(value: string) { return /^\d+$/.test(value) ? Number(value) : -1; }
export function fingerprint(records: ProcurementRecord[], profile?: Profile): string {
  const text = JSON.stringify([[...records].sort((a, b) => a.id.localeCompare(b.id)), profile]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
export function mergeRecords(current: ProcurementRecord[], incoming: ProcurementRecord[]) {
  const byId = new Map(current.map((r) => [r.id, r]));
  incoming.forEach((r) => byId.set(r.id, r));
  return [...byId.values()];
}
export function validateClaims(claims: Claim[], sources: Source[]): Claim[] {
  return claims.map((claim) => {
    const citations = claim.citations.filter((citation) => {
      const source = sources.find((s) => s.id === citation.sourceId);
      if (!source || !citation.quote || citation.quote.length < 6) return false;
      if (citation.page && (!Number.isInteger(citation.page) || citation.page < 1 || !source.pages?.[citation.page - 1])) return false;
      if (citation.row && source.row !== citation.row) return false;
      const text = citation.page ? source.pages![citation.page - 1] : source.text;
      return normalize(text).includes(normalize(citation.quote));
    });
    // A matching quote proves the citation exists, not the model's interpretation.
    return { ...claim, citations, status: citations.length && citations.length === claim.citations.length ? claim.status : "review" };
  });
}
export function exportBrief(workspace: Workspace, mode: "vendor" | "government", records = workspace.records): string {
  const lines = [`# Procurement brief — ${mode === "vendor" ? workspace.profile.name : "Government review"}`, `As of ${workspace.asOf}. Independent application demo.`, ""];
  if (mode === "vendor") {
    for (const record of records.filter((r) => r.kind === "tender" && workspace.saved[r.id])) {
      const match = matchRecord(record, workspace.profile, workspace.asOf);
      lines.push(`## ${record.title}`, `${record.buyer} | ${workspace.saved[record.id]} | ${record.origin} data`, `Closes: ${dateLabel(record.closingAt)}`, `Profile match: ${match.score}% (rule-based, not a probability)`, ...match.issues.map((s) => `- Review: ${s}`), `Notes: ${workspace.notes[record.id] || "None"}`, sourceLine(record, workspace.sources), "");
    }
  } else {
    for (const contract of contracts(records, workspace.asOf)) lines.push(`## ${contract.latest.title}`, `${contract.latest.buyer} | ${contract.latest.supplier || "Supplier not stated"}`, `Contract value: ${money(contract.value, contract.latest.currency)}. This is not actual spend.`, `End date: ${dateLabel(contract.latest.endDate)}`, ...contract.flags.map((s) => `- ${s}`), `Review: ${workspace.reviewed[contract.id] ? "Reviewed" : "Open"}`, ...contract.versions.map((r) => sourceLine(r, workspace.sources)), "");
  }
  for (const answer of workspace.answers.filter((a) => a.fingerprint === fingerprint(workspace.records, workspace.profile) && a.recordIds?.some((id) => records.some((r) => r.id === id && (mode === "vendor" ? r.kind === "tender" && workspace.saved[id] : r.kind !== "tender"))))) {
    lines.push(`## ${answer.question}`, `Response: ${answer.mode}`, ...answer.claims.flatMap((c) => [`- [${c.status}] ${c.text}`, ...c.citations.map((s) => `  Source ${s.sourceId}${s.page ? `, page ${s.page}` : ""}: ${s.quote}`)]), "");
  }
  return lines.join("\n");
}
function sourceLine(record: ProcurementRecord, sources: Source[]) { const source = sources.find((s) => s.id === record.sourceId); return `Source: ${source?.name ?? "Unavailable"}${source?.row ? `, row ${source.row}` : ""}${safeUrl(source?.url) ? ` — ${source!.url}` : ""} (${record.reference})`; }

export const CSV_FIELDS = ["title", "reference", "buyer", "supplier", "contractId", "amount", "totalValue", "currency", "closingAt", "publishedAt", "endDate", "region", "category", "description", "amendment"] as const;
export type CsvField = typeof CSV_FIELDS[number];
export type ColumnMapping = Partial<Record<CsvField, string>>;
const canadaColumns: Record<CsvField, string[]> = {
  title: ["title-titre-eng", "title-titre-fra", "title", "name"], reference: ["referenceNumber-numeroReference", "solicitationNumber-numeroSollicitation", "reference", "id"],
  buyer: ["contractingEntityName-nomEntitContractante-eng", "contractingEntityName-nomEntitContractante-fra", "buyer", "department"], supplier: ["supplierLegalName-nomLegalFournisseur-eng", "supplierLegalName-nomLegalFournisseur-fra", "supplier", "vendor"],
  contractId: ["contractNumber-numeroContrat", "contractId", "contract_number"], amount: ["contractAmount-montantContrat", "amount", "value"], totalValue: ["totalContractValue-valeurTotaleContrat", "totalValue", "total_value"],
  currency: ["contractCurrency-contratMonnaie", "currency"], closingAt: ["tenderClosingDate-appelOffresDateCloture", "closingAt", "closing_date"], publishedAt: ["amendmentDate-dateModification", "publicationDate-datePublication", "contractAwardDate-dateAttributionContrat", "publishedAt", "date"],
  endDate: ["contractEndDate-dateFinContrat", "expectedContractEndDate-dateFinContratPrevue", "endDate", "end_date"], region: ["regionsOfDelivery-regionsLivraison-eng", "region", "province"],
  category: ["unspscDescription-eng", "gsinDescription-nibsDescription-eng", "category"], description: ["tenderDescription-descriptionAppelOffres-eng", "awardDescription-descriptionAttribution-eng", "description"], amendment: ["amendmentNumber-numeroModification", "amendment", "version"],
};
export function inferMapping(headers: string[]): ColumnMapping { return Object.fromEntries(CSV_FIELDS.map((field) => [field, canadaColumns[field].find((name) => headers.includes(name))]).filter(([, column]) => column)); }
export function parseAmount(value?: string): number | null { if (!value?.trim()) return null; const clean = value.replace(/[$,\s]/g, ""); if (!/^-?\d+(\.\d+)?$/.test(clean)) return null; const number = Number(clean); return Number.isFinite(number) ? number : null; }
export function sourceDate(value?: string, canada = false): string | undefined {
  if (!value?.trim() || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) return;
  const day = value.slice(0, 10);
  if (!Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) return;
  if (!canada && value.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/.test(value)) return;
  const withZone = canada && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value) ? `${value}-05:00` : value;
  return Number.isFinite(Date.parse(withZone)) ? withZone : undefined;
}
export function inferTags(text: string): string[] {
  const keywords: [string, RegExp][] = [["Cloud migration", /cloud|hosting|infrastructure|infonuagi/i], ["Data platforms", /data|analytics|database|donn[ée]es/i], ["Software development", /software|application|digital|logiciel/i], ["Cybersecurity", /cyber|security|s[ée]curit/i], ["Document management", /document|records management|archiv/i], ["Facilities", /building|maintenance|janitorial|construction/i]];
  return keywords.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag);
}
export function plainText(value: string): string {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—" };
  return value.replace(/<[^>]*>/g, " ").replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match).replace(/&#(x[0-9a-f]+|\d+);/gi, (match, code) => { const point = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code); return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : match; });
}
export function normalizeCsvRow(row: Record<string, string>, mapping: ColumnMapping, source: Source, index: number, kind: RecordKind): ProcurementRecord | null {
  const get = (field: CsvField) => (mapping[field] ? row[mapping[field]!] : "")?.trim() ?? "";
  if (!get("title")) return null;
  const canada = Object.keys(row).some((key) => key === "title-titre-eng");
  const published = get("publishedAt") || row["publicationDate-datePublication"] || row["contractAwardDate-dateAttributionContrat"];
  const rawStatus = (row["tenderStatus-appelOffresStatut-eng"] || row["awardStatus-attributionStatut-eng"] || row.status || "").toLowerCase();
  const amendmentType = row["amendmentType-typeModification-eng"] || "";
  const reference = get("reference") || get("contractId") || `row-${index}`;
  return {
    id: `${source.id}:${reference}:${get("amendment") || "0"}:${index}`, sourceId: source.id, kind: kind !== "tender" && (/amendment/i.test(amendmentType) || (/^\d+$/.test(get("amendment")) && Number(get("amendment")) > 0)) ? "amendment" : kind, origin: source.origin,
    reference, contractId: get("contractId") || undefined, title: get("title").slice(0, 300), buyer: get("buyer") || "Buyer not stated", supplier: get("supplier") || undefined,
    category: get("category") || "Unclassified", region: get("region") || "Not stated", tags: inferTags(`${get("title")} ${get("description")} ${get("category")}`), description: plainText(get("description")).slice(0, 8000),
    publishedAt: sourceDate(published, canada), closingAt: sourceDate(get("closingAt"), canada), endDate: sourceDate(get("endDate"), canada), currency: get("currency").toUpperCase(), amount: parseAmount(get("amount")), totalValue: parseAmount(get("totalValue")), amendment: get("amendment") || "0",
    status: /cancel|terminat/.test(rawStatus + amendmentType.toLowerCase()) ? "cancelled" : /closed|expired/.test(rawStatus) ? "closed" : kind === "tender" ? (rawStatus === "open" ? "open" : "unknown") : "awarded",
    requirements: [], needsReview: kind === "tender", // A listing alone cannot prove all mandatory RFP requirements.
  };
}
