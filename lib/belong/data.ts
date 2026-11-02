import caseData from "./case.json";
import scenarioData from "./scenarios.json";
import type { CaseFile, GateId, Scenario } from "./types";

// JSON imports widen string unions, so cast once here; checks.ts and the
// unit tests (scripts/belong-checks.test.mjs) read the same files.
export const FILES = caseData.files as unknown as CaseFile[];
export const SCENARIOS = scenarioData.scenarios as unknown as Scenario[];

export const fileById = (id: string) =>
  FILES.find((file) => file.id === id) ?? FILES[0];

export const GATES: { id: GateId; name: string }[] = [
  { id: "nationality", name: "Treaty nationality" },
  { id: "source", name: "Lawful source" },
  { id: "committed", name: "At risk and committed" },
  { id: "substantial", name: "Substantial" },
  { id: "operating", name: "Real and operating" },
  { id: "direct", name: "Develop and direct" },
];
