import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contradicts, figure, rawFields, recordRows, rowFromHash } from "../lib/publicus/records.ts";

const snapshot = JSON.parse(readFileSync(new URL("../lib/publicus/public-records.json", import.meta.url), "utf8"));
const rows = recordRows(snapshot);

test("awards come first, and row 01 is the award whose row contradicts itself", () => {
  assert.deepEqual(rows.map((row) => row.n), ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  const first = rows[0].record;
  assert.equal(first.buyer, "Business Development Bank of Canada");
  assert.equal(first.title, "PRCP0003463 - Software Symantec DLP / CASB");
  assert.equal(figure(first.amount), "1,073,002.14");
  assert.equal(figure(first.totalValue), "0.00");
  assert.deepEqual(rows.filter((row) => contradicts(row.record)).map((row) => row.n), ["01", "02", "03", "04"]);
  assert.ok(rows.every((row) => row.source), "every row keeps its source CSV text");
});

test("raw rows keep the published field names and drop descriptions, URLs, attachments and codes", () => {
  for (const { source, record } of rows) {
    const keys = rawFields(source.text).map((field) => field.key);
    assert.ok(keys.includes("title-titre-eng"), `${record.id} keeps its title field`);
    assert.ok(keys.every((key) => !/description|noticeURL|attachment|^unspsc/i.test(key)), `${record.id} hides long or personal fields`);
  }
  const award = rawFields(rows[0].source.text);
  assert.equal(award.find((field) => field.key === "contractAmount-montantContrat")?.value, "1073002.14");
  assert.match(award.find((field) => field.key === "totalContractValue-valeurTotaleContrat")?.value ?? "", /^0(\.0+)?$/);
});

test("page and chat links open the matching row", () => {
  assert.equal(rowFromHash("#records"), "01");
  assert.equal(rowFromHash("#cb-01"), "01");
  assert.equal(rowFromHash("#cb-10"), "10");
  for (const hash of ["#cb-00", "#cb-11", "#cb-1", "#explorer", "", "#records-x"]) assert.equal(rowFromHash(hash), null, hash);
});
