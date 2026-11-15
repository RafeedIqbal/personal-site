// Request validation for publicus-api. Pure functions with no runtime imports beyond
// the shared domain, so Node and Deno tests can both exercise them.
import { HttpError } from "./errors.ts";
import { CAPABILITIES, CSV_FIELDS, QUALIFICATIONS, REGIONS } from "./domain.ts";
import type { ColumnMapping, Profile, Workspace } from "./domain.ts";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function pick(value: unknown, allowed: readonly string[]): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && allowed.includes(item))) return null;
  return [...new Set(value as string[])];
}

// Rebuilds the profile from known keys only, so stray fields are never stored.
export function readProfile(value: unknown): Profile {
  const invalid = new HttpError(400, "Invalid vendor profile.");
  if (!isPlainObject(value)) throw invalid;
  const capabilities = pick(value.capabilities, CAPABILITIES), regions = pick(value.regions, REGIONS), qualifications = pick(value.qualifications, QUALIFICATIONS);
  const { name, maxValue } = value;
  if (typeof name !== "string" || name.length > 100 || typeof maxValue !== "number" || !Number.isFinite(maxValue) || maxValue < 0 || maxValue > 1e10 || !capabilities || !regions || !qualifications) throw invalid;
  return { name, maxValue, capabilities, regions, qualifications };
}

export type WorkspacePatch = Partial<Pick<Workspace, "profile" | "saved" | "notes" | "reviewed">>;

// Saved stages are checked against the workspace's records by the caller.
export function readPatch(value: unknown): WorkspacePatch {
  if (!isPlainObject(value) || !Object.keys(value).length || Object.keys(value).some((key) => !["profile", "saved", "notes", "reviewed"].includes(key))) throw new HttpError(400, "Unsupported workspace change.");
  if (JSON.stringify(value).length > 60_000) throw new HttpError(413, "Workspace notes are too large.");
  const patch: WorkspacePatch = {};
  if ("profile" in value) patch.profile = readProfile(value.profile);
  if ("notes" in value) {
    if (!isPlainObject(value.notes) || Object.values(value.notes).some((note) => typeof note !== "string" || note.length > 2000)) throw new HttpError(400, "Notes must be under 2,000 characters.");
    patch.notes = value.notes as Record<string, string>;
  }
  if ("reviewed" in value) {
    if (!isPlainObject(value.reviewed) || Object.values(value.reviewed).some((state) => typeof state !== "boolean")) throw new HttpError(400, "Invalid review state.");
    patch.reviewed = value.reviewed as Record<string, boolean>;
  }
  if ("saved" in value) {
    if (!isPlainObject(value.saved) || Object.values(value.saved).some((stage) => !["Saved", "In review", "Qualified"].includes(stage as string))) throw new HttpError(400, "Invalid saved opportunity.");
    patch.saved = value.saved as WorkspacePatch["saved"];
  }
  return patch;
}

export function readMapping(value: unknown): ColumnMapping | undefined {
  if (value === undefined) return undefined;
  if (!isPlainObject(value) || Object.entries(value).some(([field, column]) => !(CSV_FIELDS as readonly string[]).includes(field) || typeof column !== "string" || column.length > 200)) throw new HttpError(400, "Invalid column mapping.");
  return value as ColumnMapping;
}

type JobContext = { uploadPrefix: string; recordIds: string[]; connectors: readonly string[] };

// Returns a copy holding only the fields each job kind uses; anything else is dropped,
// so extra keys can neither be stored nor sidestep the idempotency key.
export function readJob(kind: unknown, input: unknown, context: JobContext): { kind: "feed" | "file" | "ask"; input: Record<string, unknown> } {
  if (!isPlainObject(input) || !["feed", "file", "ask"].includes(kind as string)) throw new HttpError(400, "Unknown job.");
  if (kind === "feed") {
    if (typeof input.connector !== "string" || !context.connectors.includes(input.connector)) throw new HttpError(400, "Unknown source connector.");
    return { kind, input: { connector: input.connector } };
  }
  if (kind === "file") {
    const { path, name, recordKind } = input;
    if (typeof path !== "string" || !path.startsWith(context.uploadPrefix) || path.slice(context.uploadPrefix.length).includes("/") || path.length === context.uploadPrefix.length) throw new HttpError(400, "Invalid upload path.");
    if (name !== undefined && (typeof name !== "string" || name.length > 200)) throw new HttpError(400, "Invalid file name.");
    if (recordKind !== undefined && recordKind !== "tender" && recordKind !== "award") throw new HttpError(400, "Invalid record type.");
    const mapping = readMapping(input.mapping);
    return { kind, input: { path, ...(name === undefined ? {} : { name }), ...(mapping ? { mapping } : {}), ...(recordKind ? { recordKind } : {}) } };
  }
  const { question, recordId } = input;
  if (typeof question !== "string" || !question.trim() || question.length > 1000 || typeof recordId !== "string" || !context.recordIds.includes(recordId)) throw new HttpError(400, "Choose a record and ask a question under 1,000 characters.");
  return { kind: "ask", input: { question, recordId } };
}
