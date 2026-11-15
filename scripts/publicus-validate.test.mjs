import { test } from "node:test";
import assert from "node:assert/strict";
import { HttpError } from "../supabase/functions/_shared/errors.ts";
import { readJob, readPatch, readProfile } from "../supabase/functions/_shared/validate.ts";
import { DEFAULT_PROFILE } from "../supabase/functions/_shared/domain.ts";

const rejects = (fn, status = 400) => assert.throws(fn, (error) => error instanceof HttpError && error.status === status);
const context = { uploadPrefix: "user/workspace/", recordIds: ["cloud", "data"], connectors: ["tenders", "awards"] };

test("profiles are rebuilt from known keys and rejected when missing or malformed", () => {
  const profile = readProfile({ ...DEFAULT_PROFILE, isAdmin: true, capabilities: ["Cloud migration", "Cloud migration"] });
  assert.deepEqual(Object.keys(profile).sort(), ["capabilities", "maxValue", "name", "qualifications", "regions"]);
  assert.deepEqual(profile.capabilities, ["Cloud migration"]);
  rejects(() => readProfile(null));
  rejects(() => readProfile({ ...DEFAULT_PROFILE, regions: ["Atlantis"] }));
  rejects(() => readProfile({ ...DEFAULT_PROFILE, maxValue: Number.POSITIVE_INFINITY }));
  rejects(() => readProfile({ ...DEFAULT_PROFILE, name: "x".repeat(101) }));
});

test("patches accept only plain objects of the right value types", () => {
  assert.deepEqual(readPatch({ notes: { cloud: "Check the addendum" }, reviewed: { g1: true } }), { notes: { cloud: "Check the addendum" }, reviewed: { g1: true } });
  rejects(() => readPatch({ profile: null }));
  rejects(() => readPatch({ notes: "abc" }));
  rejects(() => readPatch({ notes: ["a"] }));
  rejects(() => readPatch({ reviewed: 5 }));
  rejects(() => readPatch({ reviewed: { g1: "yes" } }));
  rejects(() => readPatch({ saved: { cloud: "Won" } }));
  rejects(() => readPatch({ answers: [] }));
  rejects(() => readPatch({}));
  rejects(() => readPatch({ notes: { cloud: "x".repeat(2001) } }));
  rejects(() => readPatch({ notes: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`r${i}`, "x".repeat(1900)])) }), 413);
});

test("jobs keep only the fields their kind uses", () => {
  assert.deepEqual(readJob("feed", { connector: "tenders", extra: "x".repeat(1000) }, context), { kind: "feed", input: { connector: "tenders" } });
  assert.deepEqual(readJob("ask", { question: "Why?", recordId: "cloud", history: [] }, context), { kind: "ask", input: { question: "Why?", recordId: "cloud" } });
  assert.deepEqual(
    readJob("file", { path: "user/workspace/a.csv", name: "a.csv", recordKind: "award", mapping: { title: "Title" }, other: 1 }, context),
    { kind: "file", input: { path: "user/workspace/a.csv", name: "a.csv", recordKind: "award", mapping: { title: "Title" } } },
  );
  rejects(() => readJob("feed", { connector: "constructor" }, context));
  rejects(() => readJob("shell", {}, context));
  rejects(() => readJob("ask", { question: "Why?", recordId: "missing" }, context));
  rejects(() => readJob("ask", { question: " ", recordId: "cloud" }, context));
  rejects(() => readJob("file", { path: "other/workspace/a.csv" }, context));
  rejects(() => readJob("file", { path: "user/workspace/nested/a.csv" }, context));
  rejects(() => readJob("file", { path: "user/workspace/" }, context));
  rejects(() => readJob("file", { path: "user/workspace/a.csv", recordKind: "amendment" }, context));
  rejects(() => readJob("file", { path: "user/workspace/a.csv", mapping: { title: 4 } }, context));
  rejects(() => readJob("file", { path: "user/workspace/a.csv", mapping: JSON.parse('{"__proto__": "title"}') }, context));
  rejects(() => readJob("file", { path: "user/workspace/a.csv", mapping: { owner: "Title" } }, context));
});
