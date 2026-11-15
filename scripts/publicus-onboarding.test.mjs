import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PROFILE, contracts, matchRecord } from "../supabase/functions/_shared/domain.ts";
import { applyScenario, initialWorkspace, SCENARIOS } from "../supabase/functions/_shared/fixtures.ts";
import { ALL_FLAGS, buyerOptions, buyerPreview, capabilitiesFromText, readSetup, suppliersElsewhere, vendorPreview } from "../lib/publicus/onboarding.ts";
import { BUYER_TOUR, VENDOR_TOUR, tourText } from "../lib/publicus/tour.ts";

test("a sentence about the company ticks the capabilities it names", () => {
  assert.deepEqual(capabilitiesFromText("We move councils to the cloud and run analytics for them."), ["Cloud migration", "Data platforms"]);
  assert.deepEqual(capabilitiesFromText("   "), []);
  assert.deepEqual(capabilitiesFromText("Catering and events"), []);
});

test("the vendor preview ranks tenders exactly as the explorer's rules do", () => {
  const w = initialWorkspace();
  const preview = vendorPreview(w.records, DEFAULT_PROFILE, w.asOf);
  const tenders = w.records.filter((r) => r.kind === "tender");
  assert.equal(preview.total, tenders.length);
  for (const row of preview.rows) {
    const match = matchRecord(tenders.find((r) => r.id === row.id), DEFAULT_PROFILE, w.asOf);
    assert.equal(row.score, match.score); assert.equal(row.passes, match.canQualify); assert.equal(row.issue, match.issues[0]);
  }
  assert.deepEqual(preview.rows.map((r) => r.score), [...preview.rows.map((r) => r.score)].sort((a, b) => b - a));
  assert.equal(preview.passing, tenders.filter((r) => matchRecord(r, DEFAULT_PROFILE, w.asOf).canQualify).length);
  // An empty profile fits nothing and passes nothing, so the preview visibly fills in as the visitor answers.
  const blank = vendorPreview(w.records, { name: "", capabilities: [], regions: [], maxValue: 2_000_000, qualifications: [] }, w.asOf);
  assert.equal(blank.fits, 0); assert.equal(blank.passing, 0);
});

test("buyers with contracts are offered, the longest history first", () => {
  const w = initialWorkspace();
  const options = buyerOptions(w.records, w.asOf);
  assert.deepEqual(options.map((o) => o.buyer), ["Town of Cedar Bay", "Cedar Bay Library Network", "Lakeview Regional Council", "Westhaven Transit"]);
  assert.deepEqual(options[0], { buyer: "Town of Cedar Bay", contracts: 1, versions: 4, tenders: 2 });
  assert.ok(!options.some((o) => o.buyer === "Montclair Public Services"), "a buyer with tenders but no contracts has nothing to review");
});

test("the buyer preview keeps only the flags on the watch list", () => {
  const w = initialWorkspace();
  const all = buyerPreview(w.records, "Town of Cedar Bay", ALL_FLAGS, w.asOf);
  assert.equal(all.length, 1);
  assert.deepEqual(all[0].flags, all[0].group.flags);
  assert.ok(all[0].flags.includes("Contract value increased 20%+"));
  const some = buyerPreview(w.records, "town of cedar bay", ["Repeated amendments"], w.asOf);
  assert.deepEqual(some[0].flags, ["Repeated amendments"]);
});

test("the watch list covers every flag the contract rules can raise", () => {
  const raised = new Set();
  for (const { id } of SCENARIOS) {
    const w = applyScenario(initialWorkspace(), id);
    for (const asOf of [w.asOf, "2027-06-01T00:00:00Z", "2030-01-01T00:00:00Z"]) contracts(w.records.map((r) => ({ ...r, needsReview: true })), asOf).forEach((g) => g.flags.forEach((f) => raised.add(f)));
  }
  for (const flag of raised) assert.ok(ALL_FLAGS.includes(flag), `missing from REVIEW_FLAGS: ${flag}`);
  assert.equal(raised.size, ALL_FLAGS.length);
});

test("a stored setup is read back only when its shape is valid", () => {
  assert.deepEqual(readSetup(JSON.stringify({ role: "vendor", watch: ALL_FLAGS })), { role: "vendor", watch: ALL_FLAGS });
  assert.deepEqual(readSetup(JSON.stringify({ role: "buyer", buyer: "Town of Cedar Bay", watch: ["Repeated amendments", "Repeated amendments"] })), { role: "buyer", buyer: "Town of Cedar Bay", watch: ["Repeated amendments"] });
  for (const raw of [null, "", "{", "[]", "null", JSON.stringify({ role: "admin", watch: [] }), JSON.stringify({ role: "buyer", watch: [] }), JSON.stringify({ role: "vendor", watch: ["Made up"] }), JSON.stringify({ role: "vendor" })]) assert.equal(readSetup(raw), null, String(raw));
});

test("the hosting contract's supplier also works for Lakeview", () => {
  const w = initialWorkspace();
  const groups = contracts(w.records, w.asOf);
  const hosting = groups.find((g) => g.latest.contractId === "CB-2024-018");
  assert.deepEqual(suppliersElsewhere(hosting, groups), ["Lakeview Regional Council"]);
  assert.deepEqual(suppliersElsewhere(groups.find((g) => g.latest.contractId === "WT-2025-072"), groups), []);
});

test("both tours cover the same ground, and every step reads on its own", () => {
  for (const steps of [VENDOR_TOUR, BUYER_TOUR]) {
    assert.equal(steps.length, 8);
    assert.deepEqual(steps.slice(-2).map((s) => s.id), ["scenario", "setup"]);
    assert.ok(steps.some((s) => s.advanceOn === "explain"));
    // The data-problem step goes back to the role's own view, where the bottom bar fits on screen.
    assert.equal(steps.find((s) => s.id === "scenario").view, steps[0].view);
    for (const step of steps) {
      assert.ok(tourText(step.title, { company: "Maple Systems", buyer: "Town of Cedar Bay" }).length > 5);
      assert.ok(tourText(step.body, { company: "Maple Systems", buyer: "Town of Cedar Bay" }).endsWith("."));
    }
  }
  assert.equal(tourText(BUYER_TOUR[0].title, { company: "Maple Systems", buyer: "Town of Cedar Bay" }), "Town of Cedar Bay’s contracts");
});
