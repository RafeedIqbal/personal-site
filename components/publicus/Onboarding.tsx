"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { CAPABILITIES, DEFAULT_PROFILE, QUALIFICATIONS, REGIONS, dateLabel, money } from "@/supabase/functions/_shared/domain";
import type { Profile, Workspace } from "@/supabase/functions/_shared/domain";
import { ALL_FLAGS, ANY_SIZE, BLANK_PROFILE, REVIEW_FLAGS, VALUE_PRESETS, buyerOptions, buyerPreview, capabilitiesFromText, vendorPreview, type Role, type Setup } from "@/lib/publicus/onboarding";
import { Badge, Icon, type IconType } from "./ExplorerUI";

// Everything the explorer does, so a visitor can see the whole tool before answering anything.
const FEATURES: [IconType, string, string][] = [
  ["grid", "For vendors", "Open tenders ranked against a company profile, with the reason behind every point of the score."],
  ["check", "Requirement checks", "Each mandatory requirement checked against your qualifications and linked to the sentence in its source."],
  ["brief", "For government", "Contracts followed through their amendments, with flags for value jumps, ending terms and totals that disagree."],
  ["source", "Sources & imports", "Ten real CanadaBuys records as published, a CSV of your own, or a private workspace with the live feed."],
  ["alert", "Data problems", "A late requirement, a conflicting value or a missing source, added on purpose so you can watch the checks react."],
];
const ROLES: [Role, string, string][] = [
  ["vendor", "I sell to government", "Find open tenders that fit your company and check every requirement before you bid."],
  ["buyer", "I buy for a public body", "Follow your organisation’s contracts through their amendments and see which ones need a look."],
];
const sizeLabel = (value: number) => value >= ANY_SIZE ? "Any size" : money(value, "CAD", true);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

type Props = { workspace: Workspace; setup: Setup | null; finish: (setup: Setup, profile?: Profile) => void; skip: () => void; cancel?: () => void };

export default function Onboarding({ workspace, setup, finish, skip, cancel }: Props) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(setup?.role ?? "vendor");
  // A first setup starts blank so the preview visibly fills in; a later one starts from the current profile.
  const [profile, setProfile] = useState<Profile>(setup ? workspace.profile : BLANK_PROFILE);
  const [description, setDescription] = useState("");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [buyer, setBuyer] = useState(setup?.buyer ?? "");
  const [watch, setWatch] = useState<string[]>(setup?.watch ?? ALL_FLAGS);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // Focus follows the visitor's own step changes, never the first render.
  useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);

  const sample = useMemo(() => workspace.records.filter((record) => record.origin === "sample"), [workspace.records]);
  const matches = useMemo(() => vendorPreview(sample, profile, workspace.asOf), [sample, profile, workspace.asOf]);
  const buyers = useMemo(() => buyerOptions(sample, workspace.asOf), [sample, workspace.asOf]);
  const owned = useMemo(() => buyer ? buyerPreview(sample, buyer, watch, workspace.asOf) : [], [sample, buyer, watch, workspace.asOf]);
  const inferred = capabilitiesFromText(description);
  const total = role === "vendor" ? 3 : 2;
  const presets = [...new Set([...VALUE_PRESETS, profile.maxValue])].sort((a, b) => a - b);
  const sampleName = workspace.profile.name === DEFAULT_PROFILE.name ? `${workspace.profile.name}, the sample company` : workspace.profile.name;

  function go(next: number) { moved.current = true; setError(""); setStep(next); }
  function choose(next: Role) { setRole(next); go(1); }
  function describe(text: string) {
    setDescription(text);
    const picked = capabilitiesFromText(text).filter((capability) => !dismissed.includes(capability) && !profile.capabilities.includes(capability));
    if (picked.length) setProfile({ ...profile, capabilities: [...profile.capabilities, ...picked] });
  }
  function toggle(key: "capabilities" | "regions" | "qualifications", value: string) {
    const has = profile[key].includes(value);
    // Unticking a capability the description suggested keeps it unticked while the visitor types.
    if (key === "capabilities" && has) setDismissed([...dismissed, value]);
    setProfile({ ...profile, [key]: has ? profile[key].filter((item) => item !== value) : [...profile[key], value] });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (role === "vendor" && step === 1 && !profile.name.trim()) return setError("Enter your company’s name.");
    if (role === "vendor" && step === 1 && !profile.capabilities.length) return setError("Pick at least one thing your company delivers.");
    if (role === "vendor" && step === 2 && !profile.regions.length) return setError("Pick at least one region you deliver in.");
    if (role === "buyer" && step === 1 && !buyer) return setError("Choose an organisation.");
    if (step < total) return go(step + 1);
    if (role === "vendor") finish({ role, watch: setup?.watch ?? ALL_FLAGS }, { ...profile, name: profile.name.trim() });
    else finish({ role, buyer, watch });
  }

  const chip = (key: "capabilities" | "regions" | "qualifications", value: string) => <label key={value} className="px-chip"><input type="checkbox" checked={profile[key].includes(value)} onChange={() => toggle(key, value)}/>{value}</label>;
  const headingProps = { ref: heading, tabIndex: -1, id: `${id}-title` };

  return <section className="px-setup" aria-labelledby={`${id}-title`}>
    <div className="px-setup-main">
      {step === 0 ? <>
        <h3 {...headingProps}>Try it as a vendor or as a public buyer</h3>
        <p className="px-setup-lede">Pick a side and answer two or three questions. The explorer then ranks, checks and flags the sample records for you. Everything runs in your browser, and you can change your answers later.</p>
        <div className="px-roles">{ROLES.map(([value, title, text]) => <button key={value} type="button" className={`px-role${setup?.role === value ? " is-current" : ""}`} aria-describedby={`${id}-${value}`} onClick={() => choose(value)}>
          <span className="px-role-title"><strong>{title}</strong>{setup?.role === value && <Badge>Current</Badge>}</span>
          <span id={`${id}-${value}`}>{text}</span>
          <span className="px-role-go" aria-hidden="true"><Icon type="arrow" size={16}/></span>
        </button>)}</div>
        <div className="px-setup-actions">{cancel ? <button type="button" className="px-text-button" onClick={cancel}>Keep my current setup</button> : <button type="button" className="px-text-button" onClick={skip}>Skip and explore as {sampleName}</button>}</div>
      </> : <form onSubmit={submit} noValidate>
        <p className="px-setup-step">Step {step} of {total}</p>
        {role === "vendor" && step === 1 && <>
          <h3 {...headingProps}>Your company</h3>
          <p className="px-setup-lede">Tenders are ranked by how well they fit what you deliver. The preview updates as you answer.</p>
          <label className="px-setup-field">Company name<input value={profile.name} maxLength={100} autoComplete="organization" aria-invalid={error.startsWith("Enter") || undefined} onChange={(event) => setProfile({ ...profile, name: event.target.value })}/></label>
          <label className="px-setup-field">What does your company do? (optional)<textarea rows={2} maxLength={280} placeholder="We move municipal systems to the cloud and build analytics dashboards." value={description} onChange={(event) => describe(event.target.value)}/></label>
          <p className="px-setup-hint" aria-live="polite">{description.trim() ? inferred.length ? `Picked from your description: ${inferred.join(", ")}.` : "Nothing recognised yet. Tick what fits below." : ""}</p>
          <fieldset><legend>What you deliver</legend><div className="px-chips">{CAPABILITIES.map((value) => chip("capabilities", value))}</div></fieldset>
        </>}
        {role === "vendor" && step === 2 && <>
          <h3 {...headingProps}>Where you work</h3>
          <p className="px-setup-lede">Tenders outside your regions or above your limit lose points and won’t pass the checks.</p>
          <fieldset><legend>Regions you deliver in</legend><div className="px-chips">{REGIONS.map((value) => chip("regions", value))}</div></fieldset>
          <fieldset><legend>Largest contract you’d take on</legend><div className="px-chips">{presets.map((value) => <label key={value} className="px-chip"><input type="radio" name={`${id}-size`} checked={profile.maxValue === value} onChange={() => setProfile({ ...profile, maxValue: value })}/>{sizeLabel(value)}</label>)}</div></fieldset>
        </>}
        {role === "vendor" && step === 3 && <>
          <h3 {...headingProps}>Qualifications you hold</h3>
          <p className="px-setup-lede">A tender that requires one you don’t hold stays in your list, but it won’t pass the checks.</p>
          <fieldset><legend>Tick any you hold</legend><div className="px-chips">{QUALIFICATIONS.map((value) => chip("qualifications", value))}</div></fieldset>
        </>}
        {role === "buyer" && step === 1 && <>
          <h3 {...headingProps}>Your organisation</h3>
          <p className="px-setup-lede">Choose one of the public bodies in the fictional sample. The government view will open on its contracts.</p>
          <fieldset><legend className="px-sr">Organisation</legend><div className="px-orgs">{buyers.map((option) => <label key={option.buyer} className="px-org"><input type="radio" name={`${id}-buyer`} checked={buyer === option.buyer} onChange={() => setBuyer(option.buyer)}/><span>{option.buyer}</span><small>{plural(option.contracts, "contract")} · {plural(option.tenders, "tender")}</small></label>)}</div></fieldset>
        </>}
        {role === "buyer" && step === 2 && <>
          <h3 {...headingProps}>What should be flagged?</h3>
          <p className="px-setup-lede">The explorer raises these flags from plain rules. Untick any you don’t want counted as needing attention.</p>
          <fieldset><legend className="px-sr">Review flags</legend><div className="px-flag-options">{REVIEW_FLAGS.map(({ flag, detail }) => <label key={flag} className="px-flag-option"><input type="checkbox" checked={watch.includes(flag)} onChange={() => setWatch(watch.includes(flag) ? watch.filter((item) => item !== flag) : [...watch, flag])}/><span><strong>{flag}</strong><small>{detail}</small></span></label>)}</div></fieldset>
        </>}
        {error && <p className="px-setup-error" role="alert">{error}</p>}
        <div className="px-setup-actions">
          <button type="button" className="px-button px-button-white" onClick={() => go(step - 1)}>Back</button>
          <button type="submit" className="px-button">{step < total ? "Continue" : role === "vendor" ? "See my matches" : "See my contracts"}<Icon type="arrow"/></button>
        </div>
      </form>}
    </div>
    <aside className="px-setup-side" aria-label={step === 0 ? "What’s in the explorer" : "Live preview"}>
      {step === 0 ? <>
        <h4>What’s in the explorer</h4>
        <ul className="px-features">{FEATURES.map(([icon, title, text]) => <li key={title}><Icon type={icon}/><strong>{title}</strong><span>{text}</span></li>)}</ul>
      </> : role === "vendor" ? <>
        <h4>Your matches, as you answer</h4>
        <div className="px-preview">
          <div className="px-list-heading"><span>{profile.name.trim() || "Your company"}</span><span>{plural(matches.total, "open tender")}</span></div>
          <p className="px-preview-summary" aria-live="polite">{matches.fits} fit your work, regions and size · {matches.passing} pass every check</p>
          <ol>{matches.rows.map((row) => <li key={row.id}>
            <div className="px-preview-top"><span>{row.buyer}</span><strong>{row.score}%</strong></div>
            <b>{row.title}</b>
            <div className="px-preview-bar"><span style={{ width: `${row.score}%` }}/></div>
            <Badge tone={row.passes ? "green" : "amber"}>{row.passes ? "Profile checks pass" : "Review needed"}</Badge>
            {!row.passes && row.issue && <small className="px-preview-issue">{row.issue}</small>}
          </li>)}</ol>
        </div>
        <p className="px-small-note">Fictional sample tenders, scored by the same rules as the explorer.</p>
      </> : <>
        <h4>Your contracts, as you answer</h4>
        <div className="px-preview">
          <div className="px-list-heading"><span>{buyer || "Your organisation"}</span><span>{buyer ? plural(owned.length, "contract") : ""}</span></div>
          <p className="px-preview-summary" aria-live="polite">{buyer ? `${plural(owned.length, "contract")} · ${plural(owned.reduce((sum, item) => sum + item.flags.length, 0), "flag")} on your watch list` : "Choose an organisation to see its contracts here."}</p>
          {buyer && <ol>{owned.map(({ group, flags }) => <li key={group.id}>
            <div className="px-preview-top"><span>{group.latest.supplier || "Supplier not stated"}</span><strong>{money(group.value, group.latest.currency, true)}</strong></div>
            <b>{group.latest.title}</b>
            <small className="px-preview-meta">Ends {dateLabel(group.latest.endDate)} · {plural(group.amendments, "amendment")}</small>
            <div className="px-tags">{flags.length ? flags.map((flag) => <Badge key={flag} tone="amber">{flag}</Badge>) : <Badge>No flags on your watch list</Badge>}</div>
          </li>)}</ol>}
        </div>
        <p className="px-small-note">Fictional sample contracts, flagged by the same rules as the explorer.</p>
      </>}
    </aside>
  </section>;
}
