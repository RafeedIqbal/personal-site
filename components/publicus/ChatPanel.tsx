"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { CHAT_LIMITS, CONTACT_EMAIL, PREPARED, describeContext, factById, type Fact, type Turn } from "@/supabase/functions/_shared/assistant";
import { getExplorerContext, subscribeExplorerContext } from "@/lib/publicus/explorer-context";

type Entry = { id: number; role: "user" | "assistant"; text: string; sources?: string[]; answerable?: boolean };
type Notice = { kind: "offline" | "quota" | "error"; text: string };

const STORE = "publicus-chat-v1";
const live = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const OFFLINE: Notice = { kind: "offline", text: "Typed questions aren’t available right now. The suggested questions still work, or email Rafeed at" };
const QUOTA: Notice = { kind: "quota", text: "Today’s question limit has been reached. Email Rafeed at" };
const FAILED: Notice = { kind: "error", text: "That answer didn’t come through. Try again, or email Rafeed at" };

function load(): Entry[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORE) || "[]");
    return Array.isArray(value) ? value.filter((e): e is Entry => (e?.role === "user" || e?.role === "assistant") && typeof e.text === "string" && typeof e.id === "number") : [];
  } catch { return []; }
}

function Close() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>;
}
function Next() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true"><path d="M2 7h9M7.5 3.5L11 7l-3.5 3.5"/></svg>;
}

export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), title = useRef<HTMLHeadingElement>(null), input = useRef<HTMLTextAreaElement>(null), body = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<Entry[]>(load);
  const seq = useRef(0);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(live ? null : OFFLINE);
  const context = useSyncExternalStore(subscribeExplorerContext, getExplorerContext, () => undefined);
  const suggestions = PREPARED.filter((p) => !entries.some((entry) => entry.role === "user" && entry.text.toLowerCase() === p.question.toLowerCase()));
  const typing = live && notice?.kind !== "offline" && notice?.kind !== "quota";

  // Desktop: a non-modal panel beside the explorer. Phones: a full-screen modal sheet.
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      const phone = window.matchMedia("(max-width: 759px)").matches;
      node.toggleAttribute("data-sheet", phone);
      if (phone) node.showModal(); else node.show();
      (!phone && input.current ? input.current : title.current)?.focus();
    } else if (!open && node.open) node.close();
  }, [open]);
  // The desktop panel is non-modal, so Escape is handled here; the phone sheet closes through onCancel.
  useEffect(() => {
    if (!open) return;
    const escape = (event: globalThis.KeyboardEvent) => {
      const node = dialog.current;
      if (event.key !== "Escape" || event.defaultPrevented || !node || node.matches(":modal")) return;
      if (node.contains(document.activeElement) || document.activeElement === document.body) { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open, onClose]);
  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify(entries.slice(-20))); } catch { /* Private windows keep the conversation in memory only. */ } }, [entries]);
  // Bring the latest question to the top of the log, so an answer is read from its first line.
  useEffect(() => {
    const questions = body.current?.querySelectorAll<HTMLElement>(".pu-chat-q");
    const last = questions?.[questions.length - 1];
    if (body.current && last) body.current.scrollTop = last.offsetTop - 16;
  }, [entries, pending]);

  async function ask(raw: string) {
    const question = raw.trim().slice(0, CHAT_LIMITS.questionChars);
    if (!question || pending) return;
    seq.current = Math.max(seq.current, entries.at(-1)?.id ?? 0) + 2;
    const id = seq.current, asked: Entry = { id, role: "user", text: question };
    const prepared = PREPARED.find((p) => p.question.toLowerCase() === question.toLowerCase());
    if (prepared) {
      setEntries((list) => [...list, asked, { id: id + 1, role: "assistant", text: prepared.answer, sources: prepared.sources, answerable: true }]);
      setDraft("");
      // The suggestion that was clicked disappears, so keep focus inside the panel.
      if (document.activeElement?.closest(".pu-chat-suggest")) (!dialog.current?.hasAttribute("data-sheet") && input.current ? input.current : title.current)?.focus({ preventScroll: true });
      return;
    }
    if (!typing) return;
    const history: Turn[] = entries.slice(-CHAT_LIMITS.historyTurns).map(({ role, text }) => ({ role, text }));
    setEntries((list) => [...list, asked]);
    setDraft(""); setPending(true); setNotice(null);
    try {
      const { chat } = await import("@/lib/publicus/client");
      const reply = await chat({ question, history, context: getExplorerContext() });
      setEntries((list) => [...list, { id: id + 1, role: "assistant", text: reply.answer, sources: reply.sources, answerable: reply.answerable }]);
    } catch (error) {
      const status = (error as { status?: number }).status;
      setEntries((list) => list.filter((entry) => entry.id !== id));
      setDraft(question);
      const next = status === 429 ? QUOTA : status === 503 || status === 403 ? OFFLINE : FAILED;
      setNotice(next);
      if (next !== FAILED) title.current?.focus(); // The input is about to disappear.
    } finally { setPending(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void ask(draft); }
  function keys(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void ask(draft); }
  }
  function startOver() {
    setEntries([]); setDraft("");
    setNotice((current) => current?.kind === "error" ? null : current);
    (input.current ?? title.current)?.focus();
  }
  // In-page sources close the phone sheet so the section they point to is visible.
  function follow(fact: Fact) { if (fact.href.startsWith("#") && dialog.current?.hasAttribute("data-sheet")) onClose(); }

  return <dialog ref={dialog} className="pu-chat" aria-labelledby="pu-chat-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="pu-chat-head">
      <h2 id="pu-chat-title" ref={title} tabIndex={-1}>Questions about this application</h2>
      <button type="button" className="pu-chat-close" aria-label="Close questions" onClick={onClose}><Close/></button>
    </div>
    <div className="pu-chat-body" ref={body}>
      <p className="pu-chat-intro">Ask about the explorer, how it’s built, or Rafeed’s work. Answers come from this page and his résumé.</p>
      <div role="log" aria-label="Conversation" aria-live="polite"><ol className="pu-chat-log">
        {entries.map((entry) => entry.role === "user"
          ? <li key={entry.id} className="pu-chat-q"><span className="pu-sr">You asked: </span>{entry.text}</li>
          : <li key={entry.id} className="pu-chat-a">
            <span className="pu-sr">Answer: </span>
            {entry.text.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {!!entry.sources?.length && <p className="pu-chat-from"><span>From</span>{entry.sources.map(factById).filter((fact): fact is Fact => Boolean(fact)).map((fact) => fact.href.startsWith("#")
              ? <a key={fact.id} href={fact.href} onClick={() => follow(fact)}>{fact.label}</a>
              : <a key={fact.id} href={fact.href} target="_blank" rel="noopener noreferrer">{fact.label}</a>)}</p>}
            {entry.answerable === false && <p className="pu-chat-mail"><a href={`mailto:${CONTACT_EMAIL}`}>Email Rafeed at {CONTACT_EMAIL}</a></p>}
          </li>)}
      </ol></div>
      {!pending && !!suggestions.length && <ul className="pu-chat-suggest" aria-label="Suggested questions">
        {suggestions.map((p) => <li key={p.question}><button type="button" onClick={() => void ask(p.question)}><span>{p.question}</span><Next/></button></li>)}
      </ul>}
      {pending && <p className="pu-chat-pending" role="status">Checking the record…</p>}
      {notice && <p className={`pu-chat-notice is-${notice.kind}`} role={notice.kind === "offline" && !entries.length ? undefined : "alert"}>{notice.text} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>}
    </div>
    {typing ? <form className="pu-chat-form" onSubmit={submit}>
      {context && <p className="pu-chat-context">Sent with each question: {describeContext(context)}</p>}
      <label className="pu-sr" htmlFor="pu-chat-input">Your question</label>
      <textarea id="pu-chat-input" ref={input} rows={2} maxLength={CHAT_LIMITS.questionChars} value={draft} placeholder="Ask about the explorer or Rafeed’s work" onChange={(event) => setDraft(event.target.value)} onKeyDown={keys}/>
      <div className="pu-chat-actions">
        <span className="pu-chat-count" aria-hidden="true">{draft.length}/{CHAT_LIMITS.questionChars}</span>
        {!!entries.length && <button type="button" className="pu-chat-reset" onClick={startOver}>Start over</button>}
        <button type="submit" className="pu-chat-send" disabled={pending || !draft.trim()}>Ask</button>
      </div>
    </form> : !!entries.length && <div className="pu-chat-form pu-chat-actions"><button type="button" className="pu-chat-reset" onClick={startOver}>Start over</button></div>}
  </dialog>;
}
