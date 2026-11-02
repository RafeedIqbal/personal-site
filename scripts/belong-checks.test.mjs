// Proves the /belong demo numbers come from check code: run each scenario
// through the same functions the page uses and compare with the brief.
import assert from "node:assert/strict";
import { test } from "node:test";
import caseData from "../lib/belong/case.json" with { type: "json" };
import scenarioData from "../lib/belong/scenarios.json" with { type: "json" };
import {
  applyPatch,
  computeTiles,
  computeTilesSinglePass,
  fill,
  findingsOf,
  evaluate,
  makeRuling,
  route,
  settle,
  trail,
} from "../lib/belong/checks.ts";

const [demo1, demo2] = caseData.files;
const scenario = (id) => scenarioData.scenarios.find((s) => s.id === id);
const inject = (id) => applyPatch(demo1, scenario(id).patch);
const BASELINE = {
  intoEnterprise: 186650,
  qualifying: 170400,
  atRisk: 170400,
  notYetDeployed: 16250,
  weakestControl: 100,
};

test("clean file passes every check and opens at the briefed tiles", () => {
  assert.deepEqual(findingsOf(evaluate(demo1)), []);
  assert.deepEqual(computeTiles(demo1), BASELINE);
  assert.deepEqual(computeTilesSinglePass(demo1), BASELINE);
  assert.equal(demo1.documents.length, 17);
});

test("the second file is clean before the replay error", () => {
  assert.deepEqual(findingsOf(evaluate(demo2)), []);
  assert.equal(computeTiles(demo2).qualifying, 124200);
});

test("patches never mutate the source file", () => {
  inject(4);
  assert.equal(demo1.accounts.us.credits[0].amount, 186650);
});

test("1: balance check finds a EUR 27,000 gap and the re-read restores baseline", () => {
  const file = inject(1);
  const s = settle(file, scenario(1));
  assert.equal(s.primary.layer, "check");
  assert.equal(s.primary.rule, "balance");
  assert.equal(s.primary.amountLabel, "EUR 27,000");
  assert.equal(computeTiles(file, s.flagged).qualifying, 170400 - 29700);
  assert.equal(s.hops[0].to, "frontier");
  assert.equal(s.outcome, "closed");
  assert.deepEqual(computeTiles(s.file, s.holds), BASELINE);
  assert.match(fill(scenario(1).singlePass.draft, file), /EUR 69,000/);
});

test("2: schema check catches a confident mislabel and the client is asked", () => {
  const file = inject(2);
  const s = settle(file, scenario(2));
  assert.equal(s.primary.layer, "normalize");
  assert.equal(s.primary.rule, "statement-schema");
  assert.equal(s.hops[0].to, "client");
  assert.equal(s.outcome, "waiting-client");
  assert.deepEqual(s.holds.map((h) => [h.kind, h.amountUsd]), [["unproven", 44000]]);
  assert.equal(computeTiles(s.file, s.holds).qualifying, 126400);
  assert.equal(computeTilesSinglePass(file).qualifying, 170400);
});

test("3: low sort confidence goes to the domain model, then a hard route", () => {
  const s = settle(inject(3), scenario(3));
  assert.equal(s.primary.layer, "sort");
  assert.deepEqual(s.hops.map((h) => [h.to, h.hard]), [["domain", false], ["attorney", true]]);
  assert.deepEqual(s.holds.map((h) => [h.kind, h.amountUsd]), [["reserved", 44000]]);
});

test("4: transfer match shows USD 12,000 unexplained", () => {
  const file = inject(4);
  const s = settle(file, scenario(4));
  assert.equal(s.primary.rule, "transfer-match");
  assert.equal(s.primary.amountUsd, 12000);
  assert.equal(s.hops[0].to, "client");
  assert.equal(computeTiles(s.file, s.holds).qualifying, 170400);
  assert.equal(computeTilesSinglePass(file).qualifying, 182400);
  assert.equal(computeTiles(file).notYetDeployed, 16250);
});

test("5: debt rule keeps a secured seller note out of qualifying", () => {
  const file = inject(5);
  const s = settle(file, scenario(5));
  assert.equal(s.primary.rule, "debt");
  assert.deepEqual(s.hops.map((h) => [h.to, h.hard]), [["attorney", true]]);
  assert.equal(computeTiles(s.file, s.holds).qualifying, 170400);
  assert.equal(computeTilesSinglePass(file).qualifying, 200400);
});

test("6: origin check splits the savings and waits for a ruling", () => {
  const file = inject(6);
  const s = settle(file, scenario(6));
  assert.equal(s.primary.rule, "origin");
  assert.match(s.primary.detail, /EUR 19,000.*EUR 15,000/);
  assert.equal(s.outcome, "awaiting-ruling");
  assert.deepEqual(s.holds.map((h) => [h.kind, h.amountUsd]), [["reserved", 16500]]);
  assert.match(fill(scenario(6).singlePass.draft, file), /EUR 34,000/);
  for (const treatment of ["trace", "exclude"]) {
    const ruled = settle(file, scenario(6), { treatment });
    assert.equal(ruled.outcome, "ruled");
    assert.equal(computeTiles(ruled.file, ruled.holds).qualifying, 153900);
  }
});

test("6 replay: the router attaches the saved ruling on a second file", () => {
  const s6 = scenario(6);
  const ruling = makeRuling(s6, "exclude", demo1, 1, "2026-11-03", 0);
  const file = applyPatch(demo2, s6.replay.patch);
  const before = settle(file, s6);
  assert.equal(before.hops[0].ruling, undefined);
  const s = settle(file, s6, { rulings: [ruling] });
  assert.deepEqual([s.hops[0].to, s.hops[0].hard, s.hops[0].ruling.id], ["attorney", true, "R-1"]);
  assert.equal(s.outcome, "ruling-attached");
  const confirmed = settle(file, s6, { rulings: [ruling], confirmed: true });
  assert.equal(confirmed.outcome, "ruled");
  assert.equal(computeTiles(confirmed.file, confirmed.holds).qualifying, 124200 - 8800);
});

test("packet questions quote the amounts of the file they are about", () => {
  for (const s of scenarioData.scenarios) {
    assert.doesNotMatch(fill(s.packet.question, inject(s.id)), /[{}]/, `scenario ${s.id}`);
  }
  const s6 = scenario(6);
  const second = applyPatch(demo2, s6.replay.patch);
  assert.match(fill(s6.packet.question, second), /EUR 8,000/);
});

test("a statement missing its opening balance fails the schema check", () => {
  const file = applyPatch(demo1, [
    {
      op: "set",
      path: "documents.#d08.lines",
      value: demo1.documents.find((d) => d.id === "d08").lines.filter((l) => l.id !== "opening"),
    },
  ]);
  const [first] = findingsOf(evaluate(file));
  assert.equal(first.rule, "statement-schema");
  assert.match(first.detail, /missing an opening balance/);
});

test("router sends unsure items to an attorney", () => {
  assert.equal(route({ question: "re-read" }, demo1, { frontier: 0.4 }).to, "attorney");
  assert.equal(route({ question: "secured-debt" }, demo1, { client: 0.99 }).to, "attorney");
});

test("every scenario patch applies and every trail edge has both ends", () => {
  for (const s of scenarioData.scenarios) {
    const { nodes, edges } = trail(applyPatch(demo1, s.patch));
    const ids = new Set(nodes.map((n) => n.id));
    for (const edge of edges) assert.ok(ids.has(edge.from) && ids.has(edge.to), edge.id);
  }
});
