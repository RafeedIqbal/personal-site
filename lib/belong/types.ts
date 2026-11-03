// Shapes for the fictional E-2 file used on /belong. The data itself lives in
// case.json and scenarios.json; checks.ts reads it with pure functions only.

export type Ccy = "EUR" | "USD";
export type FilingRoute = "consular" | "uscis";

// Belong's nine E-2 gates, as named on its public product screens.
export type GateId =
  | "nationality"
  | "ownership"
  | "committed"
  | "source"
  | "substantial"
  | "operating"
  | "marginality"
  | "direct"
  | "intent";

export type DocKind =
  | "passport"
  | "tax-assessment"
  | "payslips"
  | "sale-contract"
  | "closing-statement"
  | "gift-letter"
  | "statement"
  | "balance-letter"
  | "fx-confirmation"
  | "wire-confirmation"
  | "purchase-agreement"
  | "escrow-agreement"
  | "invoices"
  | "operating-agreement";

export interface SrcRef {
  doc: string;
  line: string;
}

export interface DocLine {
  id: string;
  text: string;
  gloss?: string;
  page?: number;
  tx?: boolean;
}

export interface Doc {
  id: string;
  title: string;
  original?: string;
  lang: "de" | "en";
  gate: GateId;
  kind: DocKind;
  issuer: string;
  date: string;
  pages: number;
  sort: { label: DocKind; confidence: number };
  key?: string;
  lines: DocLine[];
}

export type Origin =
  | "salary"
  | "sale"
  | "gift"
  | "transfer"
  | "wire"
  | "internal"
  | "vendor";

export interface Txn {
  id: string;
  label: string;
  amount: number;
  counterparty: string;
  date: string;
  src: SrcRef;
  evidence?: string[];
  origin: Origin;
  singlePassLabel?: string;
}

export interface Account {
  id: "savings" | "us" | "llc";
  label: string;
  holder: string;
  ccy: Ccy;
  periods: { from: string; to: string }[];
  opening: number;
  closing: number;
  srcClosing: SrcRef;
  srcHolder: SrcRef;
  credits: Txn[];
  debits: Txn[];
}

export interface CaseFile {
  id: string;
  label: string;
  investor: {
    name: string;
    nationality: string;
    route: FilingRoute;
    family: { name: string; relation: "spouse" | "parent" }[];
  };
  enterprise: {
    name: string;
    owners: { name: string; pct: number }[];
    src: SrcRef;
  };
  fx: { rate: number; note: string };
  documents: Doc[];
  accounts: { savings: Account; us: Account; llc: Account };
  wire: { sentEur: number; feeUsd: number; sentUsd: number; src: SrcRef };
  escrow: {
    amount: number;
    releaseOn: string;
    refundOn: string;
    holder: string;
    src: SrcRef;
  };
  purchase: {
    price: number;
    src: SrcRef;
    sellerNote: null | {
      amount: number;
      securedBy: "enterprise-assets" | "personal-assets";
      lender: string;
      src: SrcRef;
    };
  };
}

export type PatchOp =
  | { op: "set"; path: string; value: unknown }
  | { op: "insert"; path: string; index: number; value: unknown };

export type Destination = "frontier" | "domain" | "client" | "attorney";

export type QuestionKind =
  | "re-read"
  | "missing-evidence"
  | "document-meaning"
  | "unexplained-funds"
  | "secured-debt"
  | "commingled"
  | "loan-or-gift";

export type Treatment = "trace" | "exclude";

export interface Scenario {
  id: number;
  chip: string;
  title: string;
  failureType: string;
  injection: string;
  affected: string[];
  patch: PatchOp[];
  router?: { scores: Partial<Record<Destination, number>>; correctionRate: string };
  model?: {
    kind: "frontier" | "domain";
    name: string;
    output: string;
    patch?: PatchOp[];
    raises?: QuestionKind;
    src?: SrcRef;
  };
  packet: { question: string; candidates: string[] };
  client?: { language: string; message: string; gloss: string };
  outcome: string;
  capture: string;
  singlePass: { result: string; draft: string };
  ruling?: {
    options: { id: Treatment; label: string; text: string; effect: string }[];
  };
  replay?: { file: string; affected: string[]; patch: PatchOp[] };
}

export type RuleId =
  | "sort-confidence"
  | "statement-schema"
  | "balance"
  | "continuity"
  | "control"
  | "transfer-match"
  | "origin"
  | "debt"
  | "commitment";

export type HoldKind =
  | "flagged"
  | "unproven"
  | "reserved"
  | "unexplained"
  | "excluded";

export interface CheckResult {
  layer: "sort" | "normalize" | "check";
  rule: RuleId;
  target: string;
  nodes: string[];
  status: "pass" | "fail" | "info";
  detail: string;
  src?: SrcRef;
  extracted?: string;
  reviewer: string;
  question?: QuestionKind;
  amountUsd?: number;
  amountLabel?: string;
  counts?: boolean;
  hold?: HoldKind;
}

export type Finding = CheckResult & {
  status: "fail";
  question: QuestionKind;
  amountUsd: number;
  amountLabel: string;
  counts: boolean;
  hold: HoldKind;
};

export interface Ruling {
  id: string;
  question: QuestionKind;
  treatment: Treatment;
  text: string;
  route: FilingRoute;
  effective: string;
  runId: number;
}

export interface RouteHop {
  to: Destination;
  hard: boolean;
  reason: "reserved" | "ruling" | "scored" | "unsure" | "model-failed";
  question: QuestionKind;
  score?: number;
  ruling?: Ruling;
}

export interface Hold {
  target: string;
  kind: HoldKind;
  amountUsd: number;
  counts: boolean;
}

export interface Tiles {
  intoEnterprise: number;
  qualifying: number;
  atRisk: number;
  notYetDeployed: number;
  weakestControl: number;
}

export interface RunLog {
  closedNoAttorney: number;
  sentToClient: number;
  sentToAttorney: number;
  rulings: number;
}

export type Outcome =
  | "clear"
  | "closed"
  | "waiting-client"
  | "reserved"
  | "awaiting-ruling"
  | "ruling-attached"
  | "ruled";

export interface Settlement {
  results: CheckResult[];
  findings: Finding[];
  primary: Finding | null;
  hops: RouteHop[];
  outcome: Outcome;
  file: CaseFile;
  holds: Hold[];
  flagged: Hold[];
}

// Horizontal fund-flow layout: col 0 (sources) to 4 (spent), y as a 0-1
// fraction of the trail's height.
export interface TrailNode {
  id: string;
  label: string;
  ccy: Ccy;
  amount: number;
  col: number;
  y: number;
}

export interface TrailEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}
