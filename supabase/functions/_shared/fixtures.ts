import type { Answer, ProcurementRecord, Source, Workspace } from "./domain.ts";
import { DEFAULT_PROFILE, contracts, fingerprint, matchRecord, money } from "./domain.ts";

export const SAMPLE_DATE = "2026-11-14T12:00:00Z";
const source = (id: string, name: string, text: string): Source => ({ id, name, text, origin: "sample", format: "text", capturedAt: SAMPLE_DATE });
const tender = (id: string, title: string, buyer: string, category: string, tags: string[], region: string, value: number | null, closingAt: string, description: string, qualification = "Reliability status"): ProcurementRecord => ({
  id, sourceId: `doc-${id}`, kind: "tender", origin: "sample", reference: `DEMO-${id.toUpperCase()}`, title, buyer, category, region, tags, amount: value, totalValue: value, currency: "CAD", closingAt, publishedAt: "2026-11-09", amendment: "0", description, status: "open", needsReview: false,
  requirements: qualification ? [{ text: `${qualification} is mandatory.`, qualification, sourceId: `doc-${id}`, quote: `${qualification} is mandatory.` }] : [],
});
const tenders = [
  tender("cloud", "Cloud migration & data platform", "Town of Cedar Bay", "IT services", ["Cloud migration", "Data platforms", "Software development"], "Ontario", 1_250_000, "2026-12-04T14:00:00-05:00", "Migrate 42 municipal workloads to Canadian cloud infrastructure and deliver a shared data platform. Includes discovery, migration, staff training and 24 months of support."),
  tender("security", "Managed security operations", "Lakeview Regional Council", "IT services", ["Cybersecurity"], "Ontario", 860_000, "2026-11-27T14:00:00-05:00", "Operate a 24/7 security monitoring service across 1,200 endpoints. Incident response and monthly reporting are included.", "Secret clearance"),
  tender("records", "Digital records modernization", "Cedar Bay Library Network", "Document services", ["Document management", "Software development"], "Ontario", 420_000, "2026-12-11T14:00:00-05:00", "Replace an ageing records catalogue with accessible search, retention controls and a migration of 80,000 document records."),
  tender("portal", "Bilingual resident service portal", "Montclair Public Services", "IT services", ["Software development", "Data platforms"], "Quebec", 680_000, "2026-12-18T14:00:00-05:00", "Build a resident portal for permits and service requests. Integrate the existing case-management system and support French and English.", "Bilingual delivery"),
  tender("facilities", "Civic building maintenance", "Town of Cedar Bay", "Facilities", ["Facilities"], "Ontario", 310_000, "2026-11-30T14:00:00-05:00", "Preventative maintenance and emergency repairs for six civic buildings. Includes mechanical systems and grounds maintenance.", ""),
  tender("west", "Regional analytics platform", "Westhaven Transit", "IT services", ["Data platforms", "Software development"], "British Columbia", 2_750_000, "2026-12-08T14:00:00-05:00", "Unify transit scheduling and ridership data. Delivery includes on-site collaboration in British Columbia.", "ISO 27001"),
];
function award(id: string, contractId: string, title: string, buyer: string, supplier: string, amount: number, publishedAt: string, endDate: string, amendment = "0", supplierKey?: string): ProcurementRecord {
  return { id, sourceId: `doc-${id}`, kind: amendment === "0" ? "award" : "amendment", origin: "sample", reference: `DEMO-${id.toUpperCase()}`, contractId, title, buyer, supplier, supplierKey, category: "IT services", region: "Ontario", tags: ["Cloud migration", "Data platforms"], description: "Managed hosting, data operations and support. Award values include tax. Payment and invoice data are not provided.", amount, totalValue: amount, currency: "CAD", publishedAt, startDate: "2024-03-01", endDate, amendment, status: "awarded", requirements: [], needsReview: false };
}
const awards = [
  award("hosting-0", "CB-2024-018", "Managed hosting & data operations", "Town of Cedar Bay", "Northstar Digital Inc.", 720_000, "2024-02-20", "2027-03-01", "0", "demo-northstar"),
  award("hosting-1", "CB-2024-018", "Managed hosting & data operations", "Town of Cedar Bay", "NORTHSTAR DIGITAL INC", 820_000, "2025-03-05", "2027-03-01", "1", "demo-northstar"),
  award("hosting-2", "CB-2024-018", "Managed hosting & data operations", "Town of Cedar Bay", "Northstar Digital Inc.", 920_000, "2026-02-10", "2027-03-01", "2", "demo-northstar"),
  award("hosting-3", "CB-2024-018", "Managed hosting & data operations", "Town of Cedar Bay", "Northstar Digital Inc.", 1_080_000, "2026-10-12", "2027-03-01", "3", "demo-northstar"),
  award("lakeview", "LV-2025-009", "Cloud services & application support", "Lakeview Regional Council", "Northstar Digital Inc.", 760_000, "2025-01-20", "2028-02-01", "0", "demo-northstar"),
  award("library", "CBL-2024-003", "Document platform hosting", "Cedar Bay Library Network", "Willow Systems", 340_000, "2024-05-01", "2027-01-31"),
  award("transit", "WT-2025-072", "Transit data infrastructure", "Westhaven Transit", "Kestrel Technologies", 1_460_000, "2025-07-12", "2028-08-01"),
];
function documentFor(record: ProcurementRecord): Source {
  return source(record.sourceId, `${record.kind === "tender" ? "Tender notice" : "Contract record"} · ${record.reference}`, [
    "Fictional document prepared for this application demo.", record.title, `Reference: ${record.reference}`, `Buyer: ${record.buyer}`, record.supplier ? `Supplier: ${record.supplier}` : "",
    record.contractId ? `Contract: ${record.contractId}` : "", `Published: ${record.publishedAt}`, `Region: ${record.region}`, `Category: ${record.category}`,
    record.totalValue !== null ? `Total contract value: ${record.currency} ${record.totalValue.toFixed(2)}` : "Contract value: not disclosed",
    record.closingAt ? `Closing date: ${record.closingAt}` : "", record.endDate ? `Contract end date: ${record.endDate}` : "", `Amendment: ${record.amendment}`, record.description,
    ...record.requirements.map((r) => r.text), "Supplier ownership is not documented. Contract value is not actual expenditure.",
  ].filter(Boolean).join("\n"));
}
export function initialWorkspace(): Workspace {
  const records = [...tenders, ...awards];
  return { schema: 1, asOf: SAMPLE_DATE, expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), profile: structuredClone(DEFAULT_PROFILE), records: structuredClone(records), sources: records.map(documentFor), saved: {}, notes: {}, reviewed: {}, aliases: {}, answers: [], scenario: "baseline" };
}
export const SCENARIOS = [
  { id: "baseline", label: "Original records", detail: "A complete sample workspace with six tenders and four contracts." },
  { id: "amendment", label: "A requirement changes", detail: "A later addendum extends the deadline and adds a security requirement." },
  { id: "conflict", label: "Two values disagree", detail: "Two versions of the same amendment report different totals." },
  { id: "missing", label: "The source is missing", detail: "A recommendation loses its supporting document and needs review." },
];
export function applyScenario(workspace: Workspace, scenario: string): Workspace {
  const base = initialWorkspace();
  const externalRecords = workspace.records.filter((r) => r.origin !== "sample");
  const externalSources = workspace.sources.filter((s) => s.origin !== "sample");
  const next = { ...workspace, scenario, records: [...base.records, ...externalRecords], sources: [...base.sources, ...externalSources], reviewed: {} };
  if (scenario === "amendment") {
    const record = next.records.find((r) => r.id === "cloud")!;
    record.amendment = "1"; record.publishedAt = "2026-11-14"; record.closingAt = "2026-12-18T14:00:00-05:00";
    record.requirements.push({ text: "Secret clearance is mandatory.", qualification: "Secret clearance", sourceId: "doc-cloud-addendum", quote: "Secret clearance is mandatory." });
    next.sources.push(source("doc-cloud-addendum", "Cloud migration · Addendum 1", "Fictional addendum to DEMO-CLOUD, published 2026-11-14.\nThe closing date is extended to 2026-12-18T14:00:00-05:00.\nSecret clearance is mandatory.\nAll other conditions remain unchanged."));
  }
  if (scenario === "conflict") {
    const original = next.records.find((r) => r.id === "hosting-3")!;
    const duplicate = { ...original, id: "hosting-conflict", sourceId: "doc-hosting-conflict", totalValue: 1_280_000, amount: 1_280_000 };
    next.records.push(duplicate); next.sources.push(documentFor(duplicate));
  }
  if (scenario === "missing") { next.sources = next.sources.filter((s) => s.id !== "doc-cloud"); next.records.find((r) => r.id === "cloud")!.needsReview = true; }
  for (const [id, stage] of Object.entries(next.saved)) {
    const record = next.records.find((r) => r.id === id);
    if (stage === "Qualified" && record && !matchRecord(record, next.profile, next.asOf).canQualify) next.saved = { ...next.saved, [id]: "In review" };
  }
  return next;
}
export function preparedAnswer(question: string, record: ProcurementRecord, workspace: Workspace): Answer {
  const source = workspace.sources.find((s) => s.id === record.sourceId);
  const citation = source ? [{ sourceId: source.id, quote: record.title, ...(source.row ? { row: source.row } : {}) }] : [];
  const claims: Answer["claims"] = [];
  if (record.kind === "tender") {
    const match = matchRecord(record, workspace.profile, workspace.asOf);
    claims.push({ text: `${record.title} is a ${match.score}% match against the current profile rules. This is a screening score, not a probability of winning.`, status: source ? "supported" : "review", citations: citation });
    for (const req of record.requirements) claims.push({ text: `${req.text} ${match.missing.includes(req) ? "Your profile does not currently list it." : "Your profile lists this qualification."}`, status: "supported", citations: [{ sourceId: req.sourceId, quote: req.quote }] });
    if (match.issues.length) claims.push({ text: `Before qualifying: ${match.issues.join(" ")}`, status: "review", citations: citation });
    else claims.push({ text: "The prepared requirements pass the profile checks. Review the original tender before deciding to bid.", status: "supported", citations: citation });
  } else {
    const group = contracts(workspace.records, workspace.asOf).find((g) => g.versions.some((r) => r.id === record.id))!;
    claims.push({ text: group.conflicting ? "The latest amendment has conflicting values. A consolidated total is withheld until the sources are reconciled." : `The current reported contract value is ${money(group.value, record.currency)}${group.change !== null ? `, ${Math.round(group.change)}% above the original award` : ""}. The dataset contains no invoice or payment evidence.`, status: group.conflicting ? "conflict" : "supported", citations: group.versions.map((r) => ({ sourceId: r.sourceId, quote: `Total contract value: ${r.currency} ${(r.totalValue ?? r.amount ?? 0).toFixed(2)}` })) });
    claims.push({ text: "Vendor names connect this buyer to other contracts in the workspace. A Canadian address does not establish Canadian beneficial ownership.", status: "review", citations: citation });
  }
  return { question, recordIds: [record.id], claims, mode: "prepared", generatedAt: new Date().toISOString(), fingerprint: fingerprint(workspace.records, workspace.profile) };
}
