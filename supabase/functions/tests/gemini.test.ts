import { ask, parseClaims } from "../_shared/gemini.ts";
import { initialWorkspace } from "../_shared/fixtures.ts";

function assert(value: unknown, message: string) { if (!value) throw new Error(message); }
Deno.test("rejects malformed model claims rather than trusting schema alone", () => {
  for (const value of [null, {}, { claims: [] }, { claims: [{ text: "Unsupported", status: "sure", citations: [] }] }, { claims: [{ text: "Wrong page", status: "supported", citations: [{ sourceId: "x", quote: "Something", page: -1 }] }] }]) {
    let rejected = false;
    try { parseClaims(value); } catch { rejected = true; }
    assert(rejected, "Malformed claims should be rejected");
  }
});
Deno.test("mocked Gemini response keeps real evidence and downgrades fabricated quotes", async () => {
  const original = globalThis.fetch;
  Deno.env.set("GEMINI_API_KEY", "local-test-not-a-real-key");
  Deno.env.set("SUPABASE_URL", "http://127.0.0.1:54321");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "local-test-not-a-real-key");
  let modelCalls = 0, reservations = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("/rpc/publicus_reserve")) { reservations++; return Response.json(true); }
    if (!url.startsWith("https://generativelanguage.googleapis.com/")) throw new Error(`Unexpected network request: ${url}`);
    modelCalls++;
    const body = JSON.parse(String(init?.body));
    assert(body.system_instruction.includes("untrusted data"), "Instruction boundary missing");
    assert(body.response_format.mime_type === "application/json", "Structured output missing");
    assert(body.store === false, "Provider interaction storage must be disabled");
    return Response.json({ status: "completed", steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify({ claims: [
      { text: "Reliability status is required.", status: "supported", citations: [{ sourceId: "doc-cloud", quote: "Reliability status is mandatory." }] },
      { text: "An invented requirement.", status: "supported", citations: [{ sourceId: "doc-cloud", quote: "A million years of experience is mandatory." }] },
    ] }) }] }] });
  }) as typeof fetch;
  try {
    const w = initialWorkspace(), record = w.records[0];
    const answer = await ask("test-user", "What is required?", [record], w.sources.filter((s) => s.id === record.sourceId), w);
    assert(answer.claims[0].status === "supported", "Real quotation lost");
    assert(answer.claims[1].status === "review" && !answer.claims[1].citations.length, "Invented quotation accepted");
    assert(answer.mode === "live" && answer.recordIds[0] === "cloud", "Answer provenance missing");
    assert(modelCalls === 1 && reservations === 2, "Both user and global quota must reserve before the request");
  } finally { globalThis.fetch = original; Deno.env.delete("GEMINI_API_KEY"); }
});
