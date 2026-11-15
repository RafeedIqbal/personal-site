"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Papa from "papaparse";
import { CAPABILITIES, CSV_FIELDS, LIMITS, QUALIFICATIONS, REGIONS, contracts, dateLabel, exportBrief, fingerprint, inferMapping, matchRecord, mergeRecords, money, normalize, normalizeCsvRow, safeUrl, validateClaims } from "@/supabase/functions/_shared/domain";
import type { Answer, Citation, ColumnMapping, ProcurementRecord, Profile, Run, Source, Stage, Workspace as WorkspaceData } from "@/supabase/functions/_shared/domain";
import { applyScenario, initialWorkspace, preparedAnswer, PUBLIC_SNAPSHOT, SCENARIOS } from "@/lib/publicus/seed";
import { api, backendConfigured, connectWorkspace, downloadText, readWorkspace, upload, type Session } from "@/lib/publicus/client";
import { setExplorerContext } from "@/lib/publicus/explorer-context";
import { rowFromHash } from "@/lib/publicus/records";
import RecordSheet from "./RecordSheet";

type View = "vendor" | "government" | "sources";
type Dataset = "sample" | "public" | "upload";
const STORAGE_KEY = "publicus-explorer-v1";
function loadLocal(): WorkspaceData {
  if (typeof window === "undefined") return initialWorkspace();
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as WorkspaceData | null;
    if (data?.schema === 1 && Date.parse(data.expiresAt) > Date.now() && Array.isArray(data.records) && data.records.every((r) => typeof r.id === "string" && typeof r.title === "string" && Array.isArray(r.tags) && Array.isArray(r.requirements)) && Array.isArray(data.sources) && data.profile && Array.isArray(data.profile.capabilities) && Array.isArray(data.profile.regions) && Array.isArray(data.profile.qualifications) && data.saved && data.notes && data.reviewed && Array.isArray(data.answers)) return data;
  } catch { /* An unavailable or invalid browser store must not prevent the demo from loading. */ }
  return initialWorkspace();
}
const datasetNames = { sample: "Sample workspace", public: "Public records", upload: "Your uploads" };
function sampleTime(record: ProcurementRecord, workspace: WorkspaceData) { return record.origin === "sample" ? workspace.asOf : new Date().toISOString(); }
type IconType = "grid" | "brief" | "source" | "arrow" | "expand" | "external" | "down" | "up" | "search" | "check" | "alert" | "close";
function Icon({ type, size = 18 }: { type: IconType; size?: number }) {
  const paths: Record<IconType, string> = { grid: "M3 3h6v6H3zM13 3h6v6h-6zM3 13h6v6H3zM13 13h6v6h-6z", brief: "M4 6h14v13H4zM8 6V3h6v3M4 11h14M9 11v3h4v-3", source: "M5 2h9l4 4v14H5zM14 2v5h4M8 11h7M8 15h7", arrow: "M4 11h13M12 6l5 5-5 5", expand: "M3 8V3h5M14 3h5v5M19 14v5h-5M8 19H3v-5", external: "M7 15L15 7M8 7h7v7", down: "M11 4v13M6 12l5 5 5-5", up: "M11 18V5M6 10l5-5 5 5", search: "M9.5 16a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM14.5 14.5L19 19", check: "M5 11.5l4 4 8-9", alert: "M11 5v8M11 16.5v.5", close: "M6 6l10 10M16 6L6 16" };
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]}/></svg>;
}
function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "violet" }) { return <span className={`px-badge px-badge-${tone}`}>{children}</span>; }
function Modal({ title, children, close, size }: { title: string; children: ReactNode; close: () => void; size?: "wide" | "records" }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = ref.current; const previous = document.activeElement as HTMLElement | null; node?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { node?.close(); document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  return <dialog ref={ref} className={`px-modal${size ? ` px-modal-${size}` : ""}`} aria-label={title} onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}><div className="px-modal-head"><h3>{title}</h3><button type="button" className="px-icon-button" aria-label="Close dialog" onClick={close}><Icon type="close"/></button></div>{children}</dialog>;
}

export default function Workspace() {
  const [workspace, setWorkspace] = useState<WorkspaceData>(loadLocal);
  const [view, setView] = useState<View>("vendor");
  const [dataset, setDataset] = useState<Dataset>("sample");
  const [selection, setSelection] = useState("cloud");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [source, setSource] = useState<{ id: string; quote?: string; page?: number } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [records, setRecords] = useState<string | null>(() => rowFromHash(window.location.hash));
  const [remote, setRemote] = useState(false);
  const [ai, setAi] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [full, setFull] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const stateRef = useRef(workspace);
  const patchQueue = useRef(Promise.resolve());
  const applyJobSnapshot = useCallback((next: Session) => {
    setRuns(next.runs);
    setWorkspace((current) => ({ ...next.workspace, profile: current.profile, saved: current.saved, notes: current.notes, reviewed: current.reviewed }));
  }, []);

  useEffect(() => { stateRef.current = workspace; }, [workspace]);
  // Links to #records or #cb-NN (the page, the help chat) open the records dialog. The hash is cleared
  // afterwards so the same link works again.
  useEffect(() => {
    const clear = () => history.replaceState(history.state, "", window.location.pathname + window.location.search);
    if (rowFromHash(window.location.hash)) clear();
    const follow = () => { const row = rowFromHash(window.location.hash); if (row) { setRecords(row); clear(); } };
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);
  useEffect(() => {
    let active = true;
    try {
      if (backendConfigured && localStorage.getItem("publicus-connected") === "1") {
        connectWorkspace().then((next) => { if (active) { setWorkspace(next.workspace); setRuns(next.runs); setRemote(true); setAi(next.aiEnabled); } }).catch((e) => { if (active) setError(`Private workspace could not reconnect: ${e.message}`); });
      }
    } catch { /* A blocked browser store leaves the explicit connection button available. */ }
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!remote || !runs.some((run) => run.status === "queued" || run.status === "processing")) return;
    let stopped = false;
    const timer = setInterval(async () => {
      try { const next = await readWorkspace(); if (!stopped) applyJobSnapshot(next); }
      catch (e) { if (!stopped) setError(e instanceof Error ? e.message : "Could not refresh the job."); }
    }, 2500);
    return () => { stopped = true; clearInterval(timer); };
  }, [remote, runs, applyJobSnapshot]);
  useEffect(() => { const changed = () => setFull(document.fullscreenElement === shell.current); document.addEventListener("fullscreenchange", changed); return () => document.removeEventListener("fullscreenchange", changed); }, []);

  const dataRecords = useMemo(() => workspace.records.filter((r) => r.origin === dataset), [workspace.records, dataset]);
  const groups = useMemo(() => contracts(dataRecords, dataset === "sample" ? workspace.asOf : new Date().toISOString()), [dataRecords, dataset, workspace.asOf]);
  const opportunities = useMemo(() => dataRecords.filter((r) => r.kind === "tender").sort((a, b) => matchRecord(b, workspace.profile, sampleTime(b, workspace)).score - matchRecord(a, workspace.profile, sampleTime(a, workspace)).score), [dataRecords, workspace]);
  const displayed = (view === "vendor" ? opportunities : groups.map((group) => group.latest)).filter((record) => {
    const search = normalize(`${record.title} ${record.buyer} ${record.supplier || ""}`);
    if (query && !search.includes(normalize(query))) return false;
    if (filter === "saved") return Boolean(workspace.saved[record.id]);
    if (filter === "fit") return matchRecord(record, workspace.profile, sampleTime(record, workspace)).canQualify;
    if (filter === "flags") return groups.find((g) => g.latest.id === record.id)?.flags.length;
    if (filter === "unreviewed") return !workspace.reviewed[groups.find((g) => g.latest.id === record.id)?.id || ""];
    return true;
  });
  const selected = displayed.find((r) => r.id === selection) || displayed[0];
  const selectedGroup = groups.find((g) => g.latest.id === selected?.id);
  const selectedSource = source && workspace.sources.find((s) => s.id === source.id);
  const latestAnswer = workspace.answers.filter((answer) => answer.recordIds?.includes(selected?.id || "")).at(-1);
  const savedCount = opportunities.filter((r) => workspace.saved[r.id]).length;
  // Tell the help chat what is on screen; values come from the same rules the panel shows.
  useEffect(() => {
    const record = view === "sources" ? undefined : selected;
    const match = record?.kind === "tender" ? matchRecord(record, workspace.profile, sampleTime(record, workspace)) : undefined;
    const group = view === "government" ? selectedGroup : undefined;
    setExplorerContext({
      view, dataset, scenario: SCENARIOS.find((s) => s.id === workspace.scenario)?.label || workspace.scenario,
      clock: dataset === "sample" ? dateLabel(workspace.asOf) : "Today", profile: workspace.profile,
      selected: record && {
        title: record.title, buyer: record.buyer, kind: record.kind, reference: record.contractId || record.reference, origin: record.origin, region: record.region,
        closes: record.closingAt ? dateLabel(record.closingAt) : undefined, requirements: record.requirements.map((r) => r.text),
        match: match && { score: match.score, matched: match.relevant, regionFits: match.geography, valueFits: match.withinBudget, passes: match.canQualify, issues: match.issues },
        contract: group && { value: money(group.value, record.currency), change: group.change === null ? "Not comparable" : `${group.change >= 0 ? "+" : ""}${group.change.toFixed(0)}%`, amendments: group.amendments, endDate: dateLabel(record.endDate), flags: group.flags, conflicting: group.conflicting, supplier: record.supplier },
      },
    });
  }, [view, dataset, workspace, selected, selectedGroup]);

  function update(next: WorkspaceData, persist = true) {
    stateRef.current = next; setWorkspace(next);
    if (!remote) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { setMessage("Browser storage is full or unavailable. Export your brief before leaving."); } }
    if (remote && persist) {
      const patch = { profile: next.profile, saved: next.saved, notes: next.notes, reviewed: next.reviewed };
      patchQueue.current = patchQueue.current.then(async () => { await api("patch", { patch }); }).catch((e) => setError(`${e.message} Your latest edit has not been saved to the server.`));
    }
  }
  async function task(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); } finally { setBusy(false); }
  }
  function chooseView(next: View) { setView(next); setFilter("all"); setQuery(""); setMobileDetail(false); }
  async function connect() {
    await task(async () => { const next = await connectWorkspace(); setWorkspace(next.workspace); setRuns(next.runs); setRemote(true); setAi(next.aiEnabled); try { localStorage.setItem("publicus-connected", "1"); } catch { /* Explicit reconnection still restores server state. */ } setMessage(`Private workspace connected. It expires ${dateLabel(next.workspace.expiresAt)}.${next.workerEnabled ? "" : " Background processing still needs configuration."}`); });
  }
  async function scenario(value: string) {
    await task(async () => { if (remote) { await patchQueue.current; const next = await api<{ workspace: WorkspaceData }>("scenario", { scenario: value }); update(next.workspace, false); } else update(applyScenario(stateRef.current, value)); setDataset("sample"); setFilter("all"); setSelection(value === "conflict" ? "hosting-3" : "cloud"); if (value === "conflict") setView("government"); else setView("vendor"); setMessage(SCENARIOS.find((s) => s.id === value)!.detail); });
  }
  async function loadSnapshot() {
    await task(async () => { if (remote) { const next = await api<{ workspace: WorkspaceData }>("snapshot"); update(next.workspace, false); } else update({ ...workspace, records: mergeRecords(workspace.records, PUBLIC_SNAPSHOT.records), sources: [...workspace.sources.filter((s) => !PUBLIC_SNAPSHOT.sources.some((p) => p.id === s.id)), ...PUBLIC_SNAPSHOT.sources] }); setDataset("public"); setFilter("all"); chooseView("vendor"); setMessage(`Loaded ${PUBLIC_SNAPSHOT.records.length} public records captured ${dateLabel(PUBLIC_SNAPSHOT.capturedAt)}.`); });
  }
  async function enqueue(kind: string, input: Record<string, unknown>) {
    await patchQueue.current;
    await api("enqueue", { kind, input });
    // Fast jobs can finish before this first read, with no polling cycle needed.
    applyJobSnapshot(await readWorkspace()); setMessage("Job queued. You can keep exploring while it runs.");
  }
  function inspect(citation: Citation) { setSource({ id: citation.sourceId, quote: citation.quote, page: citation.page }); }
  function setProfile(profile: Profile) {
    const saved = { ...workspace.saved };
    for (const record of workspace.records) if (saved[record.id] === "Qualified" && !matchRecord(record, profile, sampleTime(record, workspace)).canQualify) saved[record.id] = "In review";
    update({ ...workspace, profile, saved }); setProfileOpen(false); setMessage("Profile updated. Rankings and qualification checks have been recalculated.");
  }
  async function reviewRecord(record: ProcurementRecord) {
    await task(async () => { if (remote) { const next = await api<{ workspace: WorkspaceData }>("review", { recordId: record.id }); update(next.workspace, false); } else update({ ...workspace, records: workspace.records.map((r) => r.id === record.id ? { ...r, needsReview: false } : r) }); setMessage("Source review recorded. Profile and qualification checks still apply."); });
  }
  async function answer(question: string, live: boolean) {
    if (!selected) return;
    await task(async () => { if (live) await enqueue("ask", { question, recordId: selected.id }); else { const next = preparedAnswer(question, selected, workspace); next.claims = validateClaims(next.claims, workspace.sources); update({ ...workspace, answers: [...workspace.answers.slice(-19), next] }, false); } });
  }
  async function reset() {
    await task(async () => { if (remote) { await patchQueue.current; await api("reset"); const next = await connectWorkspace(); setWorkspace(next.workspace); setRuns([]); } else update(initialWorkspace()); localStorage.removeItem(STORAGE_KEY); setDataset("sample"); chooseView("vendor"); setSelection("cloud"); setResetOpen(false); setMessage("Workspace reset. Previous uploads, notes and saved decisions were removed."); });
  }
  async function expand() { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (shell.current?.requestFullscreen) await shell.current.requestFullscreen(); else setMessage("Full screen is unavailable in this browser."); } catch { setMessage("Your browser could not open full screen."); } }

  return <div ref={shell} className={`px-shell ${full ? "px-fullscreen" : ""}`} aria-label="Procurement explorer">
    <div className="px-topbar"><div className="px-brand"><strong>Procurement explorer</strong><Badge tone="violet">Interactive demo</Badge></div><div className="px-top-actions"><span className="px-storage-status"><i className={remote ? "is-connected" : ""}/>{remote ? "Private workspace" : "In this browser"}</span><button className="px-icon-button" onClick={expand} aria-label={full ? "Exit full screen" : "Open full screen"}><Icon type="expand"/></button></div></div>
    <div className="px-navigation"><div className="px-tabs" role="tablist" aria-label="Procurement perspective">{([["vendor", "For vendors", "grid"], ["government", "For government", "brief"], ["sources", "Sources & imports", "source"]] as const).map(([id, label, icon]) => <button key={id} id={`px-tab-${id}`} role="tab" tabIndex={view === id ? 0 : -1} aria-selected={view === id} aria-controls="px-panel" onKeyDown={(event) => { const tabs: View[] = ["vendor", "government", "sources"]; const index = tabs.indexOf(view); const next = event.key === "ArrowRight" ? tabs[(index + 1) % 3] : event.key === "ArrowLeft" ? tabs[(index + 2) % 3] : event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[2] : null; if (next) { event.preventDefault(); chooseView(next); document.getElementById(`px-tab-${next}`)?.focus(); } }} onClick={() => chooseView(id)}><Icon type={icon}/>{label}</button>)}</div><label className="px-dataset"><span className="px-sr">Dataset</span><select value={dataset} onChange={(event) => { setDataset(event.target.value as Dataset); setFilter("all"); setMobileDetail(false); }}>{Object.entries(datasetNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
    {(error || message) && <div className={`px-notice ${error ? "px-error" : ""}`} role={error ? "alert" : "status"}><span>{error || message}</span><button aria-label="Dismiss message" onClick={() => { setError(""); setMessage(""); }}><Icon type="close" size={16}/></button></div>}
    <div id="px-panel" role="tabpanel" aria-labelledby={`px-tab-${view}`}>
      {view !== "sources" ? <>
        <div className="px-workspace-heading"><div><h3>{view === "vendor" ? `Opportunities for ${workspace.profile.name}` : "Contracts in this dataset"}</h3><p>{view === "vendor" ? `Ranked by fit with ${workspace.profile.name}’s capabilities, regions and value limit.` : "Values, amendments and end dates, with rule-based review flags."}</p></div>{view === "vendor" ? <button className="px-button px-button-white" onClick={() => setProfileOpen(true)}>Edit vendor profile</button> : <Badge>{groups.length} distinct contracts</Badge>}</div>
        <div className="px-stats">{view === "vendor" ? <><div><span>Opportunities</span><strong>{opportunities.length}<small>in this dataset</small></strong></div><div><span>Pass profile checks</span><strong>{opportunities.filter((r) => matchRecord(r, workspace.profile, sampleTime(r, workspace)).canQualify).length}<small>ready for a closer look</small></strong></div><div><span>Saved for review</span><strong>{savedCount}<small>in your pipeline</small></strong></div></> : <><div><span>Needs attention</span><strong>{groups.filter((g) => g.flags.length && !workspace.reviewed[g.id]).length}<small>unreviewed contracts</small></strong></div><div><span>Ending within 6 months</span><strong>{groups.filter((g) => g.days !== null && g.days >= 0 && g.days <= 180).length}<small>potential renewal conversations</small></strong></div><div><span>Value conflicts</span><strong>{groups.filter((g) => g.conflicting).length}<small>totals withheld until resolved</small></strong></div></>}</div>
        <div className="px-toolbar"><label className="px-search"><Icon type="search" size={16}/><span className="px-sr">Search records</span><input placeholder={view === "vendor" ? "Search opportunities or buyers…" : "Search contracts, buyers or suppliers…"} value={query} onChange={(event) => setQuery(event.target.value)}/></label><label><span className="px-sr">Filter records</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All {view === "vendor" ? "opportunities" : "contracts"}</option>{view === "vendor" ? <><option value="fit">Pass profile checks</option><option value="saved">Saved opportunities</option></> : <><option value="flags">Has review flags</option><option value="unreviewed">Not reviewed yet</option></>}</select></label><button className="px-button px-button-white" onClick={() => { if (view === "vendor" && !savedCount) { setMessage("Save an opportunity first to include it in your brief."); return; } downloadText(exportBrief(workspace, view as "vendor" | "government", dataRecords), `publicus-${view}-brief.md`); }}>Export brief <Icon type="down" size={14}/></button></div>
        <div className={`px-master-detail ${mobileDetail ? "px-show-detail" : ""}`}>
          <div className="px-record-list" aria-label={view === "vendor" ? "Opportunities" : "Contracts"}><div className="px-list-heading"><span>{displayed.length} {displayed.length === 1 ? "result" : "results"}</span><span>{view === "vendor" ? "Best match first" : "Most review flags first"}</span></div>{displayed.map((record) => { const match = matchRecord(record, workspace.profile, sampleTime(record, workspace)); const group = groups.find((g) => g.latest.id === record.id); return <button key={record.id} className={`px-record ${record.id === selected?.id ? "is-selected" : ""}`} aria-pressed={record.id === selected?.id} onClick={() => { setSelection(record.id); setMobileDetail(true); requestAnimationFrame(() => document.getElementById("px-selected-title")?.focus({ preventScroll: true })); }}><div className="px-record-top"><span>{record.buyer}</span>{view === "vendor" ? <strong className={match.score >= 85 ? "px-match-high" : ""}>{match.score}%<small> match</small></strong> : <span className="px-record-value">{money(group?.value, record.currency, true)}</span>}</div><h4>{record.title}</h4><p>{view === "vendor" ? `${record.region} · Closes ${dateLabel(record.closingAt)}` : record.supplier || "Supplier not stated"}</p><div className="px-record-bottom">{view === "vendor" ? <Badge tone={match.canQualify ? "green" : "amber"}>{match.canQualify ? "Profile checks pass" : "Review needed"}</Badge> : <Badge tone={workspace.reviewed[group!.id] ? "green" : group?.flags.length ? "amber" : "neutral"}>{workspace.reviewed[group!.id] ? "Reviewed" : group?.flags[0] || "No flags in current data"}</Badge>}{workspace.saved[record.id] && view === "vendor" ? <span className="px-saved-marker">{workspace.saved[record.id]}</span> : null}</div></button>; })}{!displayed.length && <div className="px-empty"><Icon type="search" size={28}/><h4>{query || filter !== "all" ? "No matching records" : `No ${view === "vendor" ? "opportunities" : "contracts"} here yet`}</h4><p>{dataset === "public" && !dataRecords.length ? "Load the public snapshot or import a fresh CanadaBuys feed." : dataset === "upload" ? "Import a procurement document from Sources & imports." : "Try a different search or filter."}</p>{dataset !== "sample" && <button className="px-button" onClick={() => chooseView("sources")}>Open sources</button>}</div>}</div>
          <div className="px-detail" aria-label="Selected record"><button className="px-back" onClick={() => { setMobileDetail(false); requestAnimationFrame(() => shell.current?.querySelector<HTMLButtonElement>('.px-record[aria-pressed="true"]')?.focus({ preventScroll: true })); }}>Back to results</button>{selected ? <>
            <div className="px-detail-heading"><div><Badge tone="violet">{selected.origin === "sample" ? "Fictional example" : selected.origin === "public" ? "Public source" : "Your document"}</Badge><span className="px-reference">{selected.contractId || selected.reference}</span></div><h4 id="px-selected-title" tabIndex={-1}>{selected.title}</h4><p>{selected.buyer}</p></div>
            {view === "vendor" ? <VendorDetail record={selected} workspace={workspace} update={update} inspect={inspect} source={() => setSource({ id: selected.sourceId })} review={() => reviewRecord(selected)} busy={busy}/> : selectedGroup && <><dl className="px-fact-grid"><Fact label="Current reported value" value={money(selectedGroup.value, selected.currency)}/><Fact label="Change from original" value={selectedGroup.change === null ? "Not comparable" : `${selectedGroup.change >= 0 ? "+" : ""}${selectedGroup.change.toFixed(0)}%`}/><Fact label="Contract end" value={dateLabel(selected.endDate)}/><Fact label="Recorded amendments" value={String(selectedGroup.amendments)}/></dl><p className="px-small-note">Latest cumulative value, not a sum of amendments. Contract value is not actual expenditure.</p><div className="px-detail-section"><h5>Review signals</h5>{selectedGroup.flags.length ? <ul className="px-issues">{selectedGroup.flags.map((flag) => <li key={flag}><span aria-hidden="true"><Icon type="alert" size={14}/></span>{flag}</li>)}</ul> : <p>No rule-based flags in the available fields. This is not a risk clearance.</p>}<label className="px-check"><input type="checkbox" checked={Boolean(workspace.reviewed[selectedGroup.id])} onChange={(event) => update({ ...workspace, reviewed: { ...workspace.reviewed, [selectedGroup.id]: event.target.checked } })}/> I have reviewed these signals</label></div><div className="px-detail-section"><h5>The contract, over time</h5><ol className="px-timeline">{selectedGroup.versions.map((record) => <li key={record.id}><span className="px-timeline-dot"/><div><small>{dateLabel(record.publishedAt)} · {record.kind === "award" ? "Original award" : `Amendment ${record.amendment}`}</small><strong>{money(record.totalValue ?? record.amount, record.currency)}</strong><button onClick={() => setSource({ id: record.sourceId })}>Open source <span aria-hidden="true"><Icon type="external" size={14}/></span></button></div></li>)}</ol></div><SupplierChart records={groups.map((g) => ({ ...g.latest, totalValue: g.value, amount: g.value }))}/><div className="px-source-bar"><Icon type="source"/><span>Ownership is not established by supplier name or address.</span></div></>}
            <div className="px-detail-section"><h5>A source-backed explanation</h5><p className="px-small-note">{ai ? "Ask about this record. Quotations are checked against source text; interpretation still needs review." : "Explore a prepared explanation calculated from the current records. Connect Gemini for open-ended questions."}</p><div className="px-answer-actions"><button className="px-button px-button-white" disabled={busy} onClick={() => answer(view === "vendor" ? "Why does this opportunity match, and what should I review?" : "What changed in this contract, and what needs review?", false)}>{view === "vendor" ? "Explain this match" : "Explain these changes"}</button></div>{ai && <AskForm busy={busy} ask={(question) => answer(question, true)}/>} {latestAnswer && <AnswerCard answer={latestAnswer} stale={latestAnswer.fingerprint !== fingerprint(workspace.records, workspace.profile)} inspect={inspect}/>}</div>
          </> : <div className="px-empty"><h4>No record selected</h4><p>Pick a record to see its requirements, amendments and source documents.</p></div>}</div>
        </div>
      </> : <Sources workspace={workspace} remote={remote} ai={ai} busy={busy} runs={runs} connect={connect} loadSnapshot={loadSnapshot} showRows={() => setRecords("01")} enqueue={(kind, input) => task(() => enqueue(kind, input))} task={task} update={update} openSource={(id) => setSource({ id })} importComplete={() => { setDataset("upload"); setMessage("CSV records imported. Select Your uploads to explore them."); }} retry={(runId) => task(async () => { await api("retry", { runId }); applyJobSnapshot(await readWorkspace()); })}/>}
    </div>
    <div className="px-bottom"><div className="px-scenario"><span>Scenario</span><label><span className="px-sr">Evidence scenario</span><select disabled={busy} value={workspace.scenario} onChange={(event) => scenario(event.target.value)}>{SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div><div className="px-bottom-right"><span>{dataset === "sample" ? `Sample clock · ${dateLabel(workspace.asOf)}` : "Dates checked against today"}</span><button onClick={() => setRecords("01")}>CanadaBuys rows</button><button onClick={() => setResetOpen(true)}>Reset workspace</button></div></div>
    {profileOpen && <Modal title="Your vendor profile" close={() => setProfileOpen(false)}><ProfileEditor profile={workspace.profile} save={setProfile}/></Modal>}
    {source && <Modal title="Source evidence" close={() => setSource(null)} size="wide">{selectedSource ? <SourceViewer source={selectedSource} citation={source} remote={remote}/> : <div className="px-modal-body"><Badge tone="amber">Source unavailable</Badge><h4>This record has lost its supporting document.</h4><p>The explanation needs review. Restore the original-records scenario to recover the fictional source.</p></div>}</Modal>}
    {records && <Modal title="CanadaBuys rows as published" close={() => setRecords(null)} size="records"><div className="px-modal-body"><RecordSheet key={records} initialRow={records}/></div></Modal>}
    {resetOpen && <Modal title="Reset this workspace?" close={() => setResetOpen(false)}><div className="px-modal-body"><p>This removes your saved opportunities, notes, imported records and uploads, and starts again with the sample data.</p><div className="px-modal-actions"><button className="px-button px-button-white" onClick={() => setResetOpen(false)}>Keep workspace</button><button className="px-button" disabled={busy} onClick={reset}>Reset workspace</button></div></div></Modal>}
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function VendorDetail({ record, workspace, update, inspect, source, review, busy }: { record: ProcurementRecord; workspace: WorkspaceData; update: (w: WorkspaceData) => void; inspect: (c: Citation) => void; source: () => void; review: () => void; busy: boolean }) {
  const match = matchRecord(record, workspace.profile, sampleTime(record, workspace));
  return <><p className="px-description">{record.description || "Open the source record for the full notice."}</p><dl className="px-fact-grid"><Fact label="Reported value" value={money(record.totalValue ?? record.amount, record.currency)}/><Fact label="Closing date" value={dateLabel(record.closingAt)}/><Fact label="Delivery" value={record.region}/><Fact label="Profile match" value={`${match.score}%`}/></dl><div className="px-match-explainer"><span style={{ width: `${match.score}%` }}/></div><p className="px-small-note">Rule-based screening: capabilities 55%, region 25%, value limit 20%. Missing values do not establish affordability. This is not a win probability.</p><div className="px-detail-section"><h5>Requirements & fit</h5><div className="px-tags">{match.relevant.map((tag) => <Badge key={tag} tone="green">{tag}</Badge>)}</div>{record.requirements.map((req, index) => <button className="px-requirement" key={`${req.sourceId}-${index}`} onClick={() => inspect({ sourceId: req.sourceId, quote: req.quote })}><span>{match.missing.includes(req) ? <Icon type="alert" size={16}/> : <Icon type="check" size={16}/>}</span><span>{req.text}</span><small>Source <Icon type="external" size={12}/></small></button>)}{!record.requirements.length && <p className="px-small-note">No mandatory qualifications have been extracted. Check the full tender documents.</p>}{match.issues.length > 0 && <ul className="px-issues">{match.issues.map((issue) => <li key={issue}><span aria-hidden="true"><Icon type="alert" size={14}/></span>{issue}</li>)}</ul>}</div><button className="px-source-bar" onClick={source}><Icon type="source"/><span>Read the original source</span><span aria-hidden="true"><Icon type="external" size={14}/></span></button>{record.needsReview && workspace.sources.some((s) => s.id === record.sourceId) && <button className="px-review-action" disabled={busy} onClick={review}>I’ve checked the extracted fields and full requirements</button>}<div className="px-detail-section"><h5>Your next step</h5><label className="px-stage"><span>Pipeline stage</span><select aria-label="Pipeline stage" value={workspace.saved[record.id] || ""} onChange={(event) => { const saved = { ...workspace.saved }; if (event.target.value) saved[record.id] = event.target.value as Stage; else delete saved[record.id]; update({ ...workspace, saved }); }}><option value="">Not saved</option><option>Saved</option><option>In review</option><option disabled={!match.canQualify}>Qualified</option></select></label><label className="px-note-label">Review notes<textarea maxLength={2000} rows={2} placeholder="What would you verify before pursuing this?" value={workspace.notes[record.id] || ""} onChange={(event) => update({ ...workspace, notes: { ...workspace.notes, [record.id]: event.target.value } })}/></label></div></>;
}
function SupplierChart({ records }: { records: ProcurementRecord[] }) {
  const cad = records.filter((r) => r.currency === "CAD" && r.totalValue !== null && r.totalValue > 0);
  const map = new Map<string, { name: string; value: number; count: number }>();
  for (const record of cad) { const key = record.supplierKey || normalize(record.supplier || record.id); const current = map.get(key) || { name: record.supplier || "Unknown supplier", value: 0, count: 0 }; current.value += record.totalValue!; current.count++; map.set(key, current); }
  const rows = [...map.values()].sort((a, b) => b.value - a.value), total = rows.reduce((sum, row) => sum + row.value, 0);
  return <div className="px-detail-section"><h5>Supplier share of reported value</h5>{rows.slice(0, 4).map((row) => <div className="px-supplier" key={row.name}><div><span>{row.name}</span><b>{Math.round(row.value / total * 100)}%</b></div><div className="px-supplier-bar"><span style={{ width: `${row.value / total * 100}%` }}/></div><small>{money(row.value, "CAD", true)} · {row.count} {row.count === 1 ? "contract" : "contracts"}</small></div>)}<p className="px-small-note">Within this dataset only, across all buyers. CAD contracts with known positive totals; unresolved conflicts excluded. Exact normalized names only, except explicit sample aliases.</p></div>;
}
function AskForm({ busy, ask }: { busy: boolean; ask: (question: string) => void }) {
  const [question, setQuestion] = useState("");
  return <form className="px-ask" onSubmit={(event) => { event.preventDefault(); if (question.trim()) ask(question.trim()); }}><label><span className="px-sr">Ask a question about this record</span><input maxLength={1000} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this record…"/></label><button className="px-button" disabled={busy || !question.trim()} aria-label="Ask Gemini"><Icon type="up" size={16}/></button></form>;
}
function AnswerCard({ answer, stale, inspect }: { answer: Answer; stale: boolean; inspect: (c: Citation) => void }) {
  return <div className="px-answer"><div><Badge tone={stale ? "amber" : "violet"}>{stale ? "Evidence changed · regenerate" : answer.mode === "prepared" ? "Prepared explanation · no AI call" : "Gemini · source-checked quotes"}</Badge></div><h6>{answer.question}</h6>{answer.claims.map((claim, i) => <div className="px-claim" key={i}><p>{claim.text}</p><span className={`px-claim-state ${claim.status}`}>{claim.status === "supported" ? "Quote found" : claim.status === "conflict" ? "Conflicting evidence" : "Needs human review"}</span><div className="px-citations">{claim.citations.map((citation, j) => <button onClick={() => inspect(citation)} key={`${citation.sourceId}-${j}`}>[{i + 1}.{j + 1}] Source{citation.page ? ` · p. ${citation.page}` : citation.row ? ` · row ${citation.row}` : ""} <Icon type="external" size={12}/></button>)}</div></div>)}</div>;
}
function ProfileEditor({ profile, save }: { profile: Profile; save: (p: Profile) => void }) {
  const [draft, setDraft] = useState(profile);
  const toggle = (key: "capabilities" | "regions" | "qualifications", value: string) => setDraft({ ...draft, [key]: draft[key].includes(value) ? draft[key].filter((v) => v !== value) : [...draft[key], value] });
  return <form className="px-modal-body px-profile-form" onSubmit={(event) => { event.preventDefault(); save(draft); }}><p>Change the profile and watch opportunity rankings and qualification checks update.</p><label>Company name<input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })}/></label>{([["capabilities", "What you deliver", CAPABILITIES], ["regions", "Where you work", REGIONS], ["qualifications", "Qualifications you hold", QUALIFICATIONS]] as const).map(([key, label, options]) => <fieldset key={key}><legend>{label}</legend><div className="px-options">{options.map((option) => <label key={option} className="px-check"><input type="checkbox" checked={draft[key].includes(option)} onChange={() => toggle(key, option)}/>{option}</label>)}</div></fieldset>)}<label>Maximum contract value (CAD)<input type="number" min={0} max={10_000_000_000} step={10000} required value={draft.maxValue} onChange={(event) => setDraft({ ...draft, maxValue: Number(event.target.value) })}/></label><div className="px-modal-actions"><button className="px-button" type="submit">Update profile <Icon type="arrow"/></button></div></form>;
}
function SourceViewer({ source, citation, remote }: { source: Source; citation: { quote?: string; page?: number }; remote: boolean }) {
  const [error, setError] = useState("");
  const text = citation.page ? source.pages?.[citation.page - 1] || source.text : source.text;
  const index = citation.quote ? text.toLowerCase().indexOf(citation.quote.toLowerCase()) : -1;
  async function original() { const tab = window.open("about:blank", "_blank"); if (tab) tab.opener = null; try { const result = await api<{ url: string }>("source", { sourceId: source.id }); if (tab) tab.location.href = result.url; else setError("Allow pop-ups to open the original document."); } catch (e) { tab?.close(); setError(e instanceof Error ? e.message : "Original unavailable."); } }
  return <div className="px-modal-body px-evidence"><div className="px-evidence-meta"><Badge tone={source.origin === "sample" ? "violet" : "green"}>{source.origin === "sample" ? "Fictional sample" : source.origin === "public" ? "Public data" : "Private upload"}</Badge><span>Captured {dateLabel(source.capturedAt)}{source.row ? ` · CSV row ${source.row}` : ""}{citation.page ? ` · Page ${citation.page}` : ""}</span></div><h4>{source.name}</h4>{citation.quote && <blockquote>{citation.quote}</blockquote>}{safeUrl(source.noticeUrl) && <a className="px-source-link" href={safeUrl(source.noticeUrl)} target="_blank" rel="noopener noreferrer">Open procurement notice <Icon type="external" size={12}/></a>}{safeUrl(source.url) && <a className="px-source-link" href={safeUrl(source.url)} target="_blank" rel="noopener noreferrer">Open official source <Icon type="external" size={12}/></a>}{remote && source.storagePath && <button className="px-button px-button-white" onClick={original}>Open original upload <Icon type="external" size={14}/></button>}{error && <p role="alert">{error}</p>}<p className="px-small-note">{source.format === "pdf" ? "Extracted PDF text. Check the original document for layout and context." : source.format === "csv" ? "Original field names and retained values from this CSV row." : "Source document text."}</p><pre>{index >= 0 && citation.quote ? <>{text.slice(0, index)}<mark>{text.slice(index, index + citation.quote.length)}</mark>{text.slice(index + citation.quote.length)}</> : text}</pre></div>;
}

function Sources({ workspace, remote, ai, busy, runs, connect, loadSnapshot, showRows, enqueue, task, update, openSource, importComplete, retry }: { workspace: WorkspaceData; remote: boolean; ai: boolean; busy: boolean; runs: Run[]; connect: () => void; loadSnapshot: () => void; showRows: () => void; enqueue: (kind: string, input: Record<string, unknown>) => Promise<void>; task: (action: () => Promise<void>) => Promise<void>; update: (w: WorkspaceData, persist?: boolean) => void; openSource: (id: string) => void; importComplete: () => void; retry: (id: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [recordKind, setRecordKind] = useState("tender");
  const [connector, setConnector] = useState("tenders");
  async function selectFile(next: File | null) {
    setFile(null); setHeaders([]); setMapping({}); if (!next) return;
    await task(async () => {
      if (next.size > LIMITS.fileBytes || next.size === 0 || !/\.(csv|pdf|txt)$/i.test(next.name)) throw new Error("Choose a PDF, CSV or TXT file under 10 MB.");
      if (next.name.toLowerCase().endsWith(".csv")) { const parsed = Papa.parse<Record<string, string>>(await next.text(), { header: true, preview: 1, skipEmptyLines: true }); const fields = parsed.meta.fields || []; if (!fields.length) throw new Error("No CSV columns found."); setHeaders(fields); setMapping(inferMapping(fields)); }
      setFile(next);
    });
  }
  async function importFile() {
    if (!file) return;
    await task(async () => {
      if (remote) { if (!file.name.toLowerCase().endsWith(".csv") && !ai) throw new Error("Gemini is not connected yet. Your document has not been uploaded."); const path = await upload(file); await enqueue("file", { path, name: file.name, mapping: headers.length ? mapping : undefined, recordKind }); }
      else {
        if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("PDF and TXT extraction need a private workspace and Gemini. CSV files can be explored locally.");
        const parsed = Papa.parse<Record<string, string>>(await file.text(), { header: true, preview: 120, skipEmptyLines: true });
        if (!mapping.title) throw new Error("Map the title column first.");
        if (parsed.errors.some((e) => e.code === "MissingQuotes" || e.code === "UndetectableDelimiter")) throw new Error("This CSV has invalid quotes or delimiters.");
        const incoming: ProcurementRecord[] = [], sources: Source[] = [];
        for (const [index, row] of parsed.data.entries()) {
          const text = Object.entries(row).map(([key, value]) => `${key}: ${value}`).join("\n");
          if (text.length > LIMITS.sourceChars) throw new Error("A CSV row is too large.");
          const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); const checksum = Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, "0")).join("");
          const source: Source = { id: `upload-${checksum.slice(0, 24)}`, name: `${file.name} · row ${index + 2}`, origin: "upload", format: "csv", capturedAt: new Date().toISOString(), text, row: index + 2, checksum };
          const record = normalizeCsvRow(row, mapping, source, 0, recordKind === "award" ? "award" : "tender");
          if (record) { incoming.push(record); sources.push(source); }
        }
        if (!incoming.length) throw new Error("No records with a title were found.");
        const records = mergeRecords(workspace.records, incoming);
        if (records.length > LIMITS.records) throw new Error("The workspace is limited to 500 records. Reset it to import more.");
        update({ ...workspace, records, sources: [...workspace.sources.filter((s) => !sources.some((n) => n.id === s.id)), ...sources] }); importComplete();
      }
      setFile(null); setHeaders([]);
    });
  }
  return <div className="px-sources"><div className="px-workspace-heading"><div><h3>Where these records come from</h3><p>Use the fictional sample, load the public snapshot, or import a document of your own.</p></div></div><div className="px-source-cards"><section><h4>A public-data starting point</h4><p>Ten CanadaBuys records, captured {dateLabel(PUBLIC_SNAPSHOT.capturedAt)}. Original field names and source rows are preserved.</p><Badge>Snapshot · not a live feed</Badge><div className="px-source-actions"><button disabled={busy} className="px-button px-button-white" onClick={loadSnapshot}>Load public snapshot <Icon type="arrow"/></button><button className="px-text-button" onClick={showRows}>See the rows as published</button></div></section><section><h4>Your private workspace</h4><p>{remote ? `Connected without sign-in. Your workspace and original uploads expire ${dateLabel(workspace.expiresAt)}.` : "A dedicated Supabase backend keeps uploads, notes and jobs together for seven days. No sign-in screen."}</p><Badge tone={remote ? "green" : "neutral"}>{remote ? "Connected" : backendConfigured ? "Ready to connect" : "Backend keys pending"}</Badge><button className="px-button" disabled={busy || remote || !backendConfigured} onClick={connect}>{remote ? "Workspace connected" : "Start private workspace"}<Icon type="arrow"/></button></section></div><div className="px-import-grid"><section className="px-import-panel"><h4>Import a public feed</h4><p>Read the first 120 source rows from an official CanadaBuys CSV. Imports run in a durable queue and retain their source URL.</p><label>Source<select value={connector} onChange={(e) => setConnector(e.target.value)}><option value="tenders">Open tender notices</option><option value="awards">2026–27 award notices</option><option value="history">2026–27 contract history</option></select></label><button className="px-button" disabled={busy || !remote} onClick={() => enqueue("feed", { connector })}>Import current records <Icon type="arrow"/></button><p className="px-small-note">{remote ? "A bounded preview of one federal source, not market-wide coverage. No Gemini call required." : "Connect a private workspace to run live ingestion."}</p></section><section className="px-import-panel"><h4>Bring a document</h4><p>CSV, text-based PDF or TXT. Up to 10 MB, 50 PDF pages and 120 imported CSV rows. Scanned PDFs need OCR first.</p><label className="px-file"><Icon type="source"/><span>{file ? file.name : "Choose a document"}</span><input type="file" accept=".pdf,.csv,.txt" onChange={(event) => selectFile(event.target.files?.[0] || null)}/></label>{headers.length > 0 && <><label>Record type<select value={recordKind} onChange={(e) => setRecordKind(e.target.value)}><option value="tender">Tender notices</option><option value="award">Awards / contract history</option></select></label><details className="px-mapping" open={!mapping.title}><summary>Review column mapping ({Object.keys(mapping).length} fields)</summary>{CSV_FIELDS.map((field) => <label key={field}>{field}{field === "title" ? " *" : ""}<select value={mapping[field] || ""} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value || undefined })}><option value="">Not present</option>{headers.map((header) => <option key={header}>{header}</option>)}</select></label>)}</details></>}<button className="px-button" disabled={busy || !file || (headers.length > 0 && !mapping.title)} onClick={importFile}>{busy ? "Processing…" : "Import document"}<Icon type="arrow"/></button><p className="px-small-note">{remote ? ai ? "PDF/TXT text is sent to Google Gemini for extraction. Use public or non-confidential documents in this demo." : "Gemini key pending. CSV works now; PDF/TXT extraction will become available when connected." : "CSV works locally. PDF/TXT extraction requires the backend and Gemini."}</p></section></div>{runs.length > 0 && <section className="px-runs"><h4>Recent jobs</h4><p className="px-small-note">Queued jobs survive a closed tab. Refreshing this workspace resumes status updates.</p>{runs.map((run) => <div key={run.id}><Badge tone={run.status === "complete" ? "green" : run.status === "failed" ? "amber" : "violet"}>{run.status}</Badge><span>{run.error || run.progress}</span>{run.status === "failed" && <button disabled={busy} onClick={() => retry(run.id)}>Retry</button>}</div>)}</section>}<section className="px-source-index"><div><h4>Source library</h4><span>{workspace.sources.length} retained sources</span></div>{workspace.sources.slice(-40).reverse().map((source) => <button key={source.id} onClick={() => openSource(source.id)}><Icon type="source"/><span><strong>{source.name}</strong><small>{source.origin} · {dateLabel(source.capturedAt)}{source.row ? ` · row ${source.row}` : ""}</small></span><span aria-hidden="true"><Icon type="external" size={14}/></span></button>)}{workspace.sources.length > 40 && <p className="px-small-note">Showing the latest 40 sources. Each record also opens its own source directly.</p>}</section></div>;
}
