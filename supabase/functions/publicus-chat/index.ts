import { body, cors, HttpError, identity, json } from "../_shared/server.ts";
import { chatQuota, chatSetting, generate } from "../_shared/gemini.ts";
import { buildChatPrompt, CHAT_SYSTEM, chatSchema, parseReply, readChatRequest } from "../_shared/assistant.ts";

// Answers help-chat questions from the fixed fact sheet in _shared/assistant.ts. Synchronous:
// no job queue and nothing stored, with its own daily quota apart from the explorer's.
Deno.serve(async (request: Request) => {
  let headers: Record<string, string> = {};
  try {
    headers = cors(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const user = await identity(request), input = await body(request, 16_000);
    let parsed;
    try { parsed = readChatRequest(input); } catch (error) { throw new HttpError(400, error instanceof Error ? error.message : "Invalid question."); }
    const result = await generate(user.id, buildChatPrompt(parsed.question, parsed.history, parsed.context), chatSchema, { system: CHAT_SYSTEM, quota: chatQuota(user.id), ...chatSetting(), maxTokens: 2000 });
    return json(parseReply(result), headers);
  } catch (error) {
    const known = error instanceof HttpError;
    if (!known) console.error("Publicus chat failure", error instanceof Error ? error.message : "unknown");
    return json({ error: known ? error.message : "The answer couldn’t be generated. Please try again." }, headers, known ? error.status : 502);
  }
});
