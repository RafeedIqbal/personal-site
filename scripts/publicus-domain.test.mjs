import { test } from "node:test";
import assert from "node:assert/strict";
import { contracts, exportBrief, fingerprint, inferMapping, matchRecord, mergeRecords, normalizeCsvRow, parseAmount, sourceDate, validateClaims } from "../supabase/functions/_shared/domain.ts";
import { applyScenario, initialWorkspace, preparedAnswer } from "../supabase/functions/_shared/fixtures.ts";
import { csvPrefix } from "../supabase/functions/_shared/connectors.ts";

test("a changed mandatory requirement invalidates a qualified opportunity", () => {
  const base = initialWorkspace(); base.saved.cloud = "Qualified";
  assert.equal(matchRecord(base.records[0], base.profile, base.asOf).canQualify, true);
  const changed = applyScenario(base, "amendment");
  assert.equal(changed.saved.cloud, "In review");
  assert.equal(changed.records[0].closingAt, "2026-12-18T14:00:00-05:00");
  assert.equal(matchRecord(changed.records[0], changed.profile, changed.asOf).canQualify, false);
  assert.notEqual(fingerprint(changed.records, changed.profile), fingerprint(base.records, base.profile));
  assert.equal(base.records[0].requirements.length, 1, "scenarios must not mutate the original workspace");
});
test("amendments contribute their current cumulative total, not the sum of every version", () => {
  const w = initialWorkspace(), group = contracts(w.records, w.asOf).find((g) => g.latest.contractId === "CB-2024-018");
  assert.equal(group.value, 1080000); assert.equal(group.change, 50); assert.equal(group.amendments, 3);
  assert.equal(contracts(w.records, w.asOf).length, 4);
});
test("conflicting latest values are withheld and not treated as zero", () => {
  const w = applyScenario(initialWorkspace(), "conflict"), group = contracts(w.records, w.asOf).find((g) => g.conflicting);
  assert.equal(group.value, null); assert.equal(group.change, null); assert.ok(group.flags.includes("Conflicting contract values"));
});
test("unrelated buyers and contract IDs never merge by vendor or title", () => {
  const w = initialWorkspace(), award = w.records.find((r) => r.kind === "award");
  assert.equal(contracts([award, { ...award, id: "other-buyer", buyer: "Different buyer" }, { ...award, id: "other-contract", contractId: "different" }], w.asOf).length, 3);
});
test("amendment-only history does not invent an original award baseline", () => {
  const w = initialWorkspace(), amendments = w.records.filter((r) => r.contractId === "CB-2024-018" && r.kind === "amendment");
  const group = contracts(amendments, w.asOf)[0];
  assert.equal(group.value, 1080000); assert.equal(group.change, null);
});
test("a missing source downgrades explanations and blocks qualification", () => {
  const w = applyScenario(initialWorkspace(), "missing"), answer = preparedAnswer("Why?", w.records[0], w);
  const claims = validateClaims(answer.claims, w.sources);
  assert.ok(claims.every((c) => c.status === "review"));
  assert.equal(matchRecord(w.records[0], w.profile, w.asOf).canQualify, false);
});
test("citation checks reject invented text, source IDs, pages and rows", () => {
  const sources = [{ id: "s1", text: "The deadline is December 4.", pages: ["The deadline is December 4."], row: 8 }];
  const claims = [
    { text: "Valid", status: "supported", citations: [{ sourceId: "s1", quote: "deadline is December 4", page: 1, row: 8 }] },
    { text: "Invented", status: "supported", citations: [{ sourceId: "s1", quote: "deadline is December 5" }] },
    { text: "Wrong source", status: "supported", citations: [{ sourceId: "s2", quote: "deadline is December 4" }] },
    { text: "Wrong page", status: "supported", citations: [{ sourceId: "s1", quote: "deadline is December 4", page: 2 }] },
    { text: "Wrong row", status: "supported", citations: [{ sourceId: "s1", quote: "deadline is December 4", row: 9 }] },
  ];
  const checked = validateClaims(claims, sources);
  assert.equal(checked[0].status, "supported"); assert.ok(checked.slice(1).every((c) => c.status === "review" && c.citations.length === 0));
});
test("missing and zero monetary values remain distinct", () => {
  assert.equal(parseAmount(""), null); assert.equal(parseAmount("0"), 0); assert.equal(parseAmount("$1,200.50"), 1200.5); assert.equal(parseAmount("unknown"), null);
});
test("CanadaBuys timestamps use the documented fixed UTC-0500 offset; invalid and ambiguous dates are absent", () => {
  assert.equal(sourceDate("2026-11-14T14:00:00", true), "2026-11-14T14:00:00-05:00");
  assert.equal(sourceDate("2026-11-14T14:00:00"), undefined);
  assert.equal(sourceDate("2026-02-31"), undefined);
  const w = initialWorkspace(), record = { ...w.records[0], closingAt: "2026-11-14T11:59:59Z" };
  assert.equal(matchRecord(record, w.profile, w.asOf).closed, true, "a deadline one second ago is closed");
});
test("CSV mapping preserves bilingual field identities and flags incomplete tender evidence", () => {
  const row = { "title-titre-eng": "Cloud service", "contractingEntityName-nomEntitContractante-eng": "Department", "totalContractValue-valeurTotaleContrat": "0", "contractCurrency-contratMonnaie": "CAD" };
  const source = { id: "public-source", origin: "public" };
  const result = normalizeCsvRow(row, inferMapping(Object.keys(row)), source, 0, "tender");
  assert.equal(result.title, "Cloud service"); assert.equal(result.totalValue, 0); assert.equal(result.needsReview, true); assert.equal(result.status, "unknown");
  assert.equal(mergeRecords([result], [result]).length, 1);
});
test("streamed CSV boundaries preserve quoted newlines and escaped quotes", () => {
  const csv = 'title,description\n"First","line 1\nline 2 with ""quotes"""\nSecond,complete\nThird,incomplete';
  const prefix = csvPrefix(csv, 1);
  assert.equal(prefix.complete, true); assert.equal(prefix.text, 'title,description\n"First","line 1\nline 2 with ""quotes"""\n');
  assert.equal(csvPrefix(csv, 4).rows, 2);
});
test("exports omit stale explanations and retain source references", () => {
  const w = initialWorkspace(); w.saved.cloud = "Saved"; w.answers.push(preparedAnswer("OLD ANSWER", w.records[0], w));
  const changed = applyScenario(w, "amendment"), output = exportBrief(changed, "vendor");
  assert.ok(output.includes("DEMO-CLOUD")); assert.ok(output.includes("Secret clearance".toLowerCase())); assert.ok(!output.includes("OLD ANSWER"));
});
test("dataset-scoped exports keep fresh explanations from the full workspace", () => {
  const w = initialWorkspace(); w.saved.cloud = "Saved";
  w.records.push({ ...w.records[0], id: "public-example", origin: "public" });
  w.answers.push(preparedAnswer("FRESH EXPLANATION", w.records[0], w));
  assert.ok(exportBrief(w, "vendor", w.records.filter((r) => r.origin === "sample")).includes("FRESH EXPLANATION"));
  assert.ok(!exportBrief(w, "government").includes("FRESH EXPLANATION"));
});
