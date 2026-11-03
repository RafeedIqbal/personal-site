// Pure check code for the /belong visualizer. Every tile value and every
// "caught by" label on that page is computed here from the fictional file.
// Kept free of runtime imports so `node --test` can load it directly.
import type {
  Account,
  Ccy,
  CaseFile,
  CheckResult,
  Destination,
  Doc,
  DocKind,
  Finding,
  Hold,
  HoldKind,
  PatchOp,
  QuestionKind,
  RouteHop,
  RuleId,
  Ruling,
  RunLog,
  Scenario,
  Settlement,
  Tiles,
  TrailEdge,
  TrailNode,
  Treatment,
  Txn,
} from "./types";

export const SORT_THRESHOLD = 0.8;
export const LARGE_DEPOSIT = 5000;
export const ROUTER_MIN = 0.6;
export const MATCH_TOLERANCE = 1;
export const RULE_EFFECTIVE = "2026-11-01";

export const LAYERS = [
  { id: "read", name: "Read" },
  { id: "sort", name: "Sort" },
  { id: "normalize", name: "Normalize" },
  { id: "check", name: "Check" },
  { id: "route", name: "Route" },
  { id: "resolve", name: "Resolve" },
  { id: "learn", name: "Learn" },
] as const;

export const RESERVED_QUESTIONS: QuestionKind[] = [
  "secured-debt",
  "commingled",
  "loan-or-gift",
];

export const RULES: Record<
  RuleId,
  { name: string; text: string; citation: string | null }
> = {
  "sort-confidence": {
    name: "Label confidence",
    text: "A document label below 0.80 confidence goes to a second reader.",
    citation: null,
  },
  "statement-schema": {
    name: "Statement schema",
    text: "A document labeled as a statement must have an opening balance, a closing balance and the transactions between them.",
    citation: null,
  },
  balance: {
    name: "Balance",
    text: "Opening balance plus transactions equals closing balance.",
    citation: null,
  },
  continuity: {
    name: "Continuity",
    text: "Statements have no date gaps.",
    citation: null,
  },
  control: {
    name: "Control",
    text: "The account holder matches the investor, because the applicant must show possession and control of the funds.",
    citation: "9 FAM 402.9-6",
  },
  "transfer-match": {
    name: "Transfer match",
    text: "Money sent equals money received, allowing for exchange rate and fees.",
    citation: null,
  },
  origin: {
    name: "Origin",
    text: "Each large deposit has a source document, and gifts and loans trace back to the donor's or lender's own funds.",
    citation: "9 FAM 402.9-6",
  },
  debt: {
    name: "Debt",
    text: "Debt secured by the enterprise's own assets does not count as investment.",
    citation: "9 FAM 402.9-6",
  },
  commitment: {
    name: "Commitment",
    text: "Funds count once spent or irrevocably committed. Uncommitted funds in a bank account do not qualify.",
    citation: "9 FAM 402.9-6",
  },
};

export const KIND_NAMES: Record<DocKind, string> = {
  passport: "passport",
  "tax-assessment": "tax assessment",
  payslips: "payslips",
  "sale-contract": "sale contract",
  "closing-statement": "closing statement",
  "gift-letter": "gift letter",
  statement: "bank statement",
  "balance-letter": "balance letter",
  "fx-confirmation": "conversion confirmation",
  "wire-confirmation": "wire confirmation",
  "purchase-agreement": "purchase agreement",
  "escrow-agreement": "escrow agreement",
  invoices: "invoices",
  "operating-agreement": "operating agreement",
};

const PLAIN_CODE = "Plain-code check, no model";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function money(ccy: Ccy, amount: number): string {
  return `${ccy} ${NUM.format(Math.round(amount))}`;
}

const total = (txns: Txn[]) => txns.reduce((sum, t) => sum + t.amount, 0);
const listOf = (items: string[]) =>
  items.length < 2
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const toUsd = (file: CaseFile, eur: number) => Math.round(eur * file.fx.rate);
const accountsOf = (file: CaseFile): Account[] => [
  file.accounts.savings,
  file.accounts.us,
  file.accounts.llc,
];

export const creditNode = (credit: Txn) => `credit:${credit.id}`;

export function docById(file: CaseFile, id: string): Doc | undefined {
  return file.documents.find((doc) => doc.id === id);
}

function creditsBackedBy(file: CaseFile, docId: string): Txn[] {
  return file.accounts.savings.credits.filter((credit) =>
    credit.evidence?.includes(docId),
  );
}

function keyLine(doc: Doc) {
  return { doc: doc.id, line: doc.key ?? doc.lines[0].id };
}

// ---------------------------------------------------------------- patches

function step(node: unknown, segment: string): unknown {
  if (Array.isArray(node)) {
    const next = segment.startsWith("#")
      ? node.find((item) => item?.id === segment.slice(1))
      : node[Number(segment)];
    if (next === undefined) throw new Error(`No item "${segment}"`);
    return next;
  }
  if (node && typeof node === "object" && segment in node) {
    return (node as Record<string, unknown>)[segment];
  }
  throw new Error(`No key "${segment}"`);
}

export function applyPatch<T>(source: T, ops: PatchOp[] = []): T {
  const next = structuredClone(source);
  for (const op of ops) {
    const segments = op.path.split(".");
    if (op.op === "insert") {
      const list = segments.reduce(step, next as unknown);
      if (!Array.isArray(list)) throw new Error(`${op.path} is not a list`);
      list.splice(op.index, 0, structuredClone(op.value));
      continue;
    }
    const key = segments.pop() as string;
    const parent = segments.reduce(step, next as unknown);
    if (Array.isArray(parent)) {
      const index = key.startsWith("#")
        ? parent.findIndex((item) => item?.id === key.slice(1))
        : Number(key);
      if (index < 0) throw new Error(`No item "${key}"`);
      parent[index] = structuredClone(op.value);
    } else {
      (parent as Record<string, unknown>)[key] = structuredClone(op.value);
    }
  }
  return next;
}

// Fills {eur:path}, {usd:path} and {eurLabel:Label} from the file, so copy
// that quotes an amount always quotes the file's current value.
export function fill(template: string, file: CaseFile): string {
  return template.replace(
    /\{(eur|usd|eurLabel):([^}]+)\}/g,
    (_, kind: string, arg: string) => {
      if (kind === "eurLabel") {
        const credits = file.accounts.savings.credits.filter(
          (credit) => credit.singlePassLabel === arg,
        );
        return money("EUR", total(credits));
      }
      const value = arg.split(".").reduce(step, file as unknown) as number;
      return money(kind === "eur" ? "EUR" : "USD", value);
    },
  );
}

// ---------------------------------------------------------------- layers

function sortResults(file: CaseFile): CheckResult[] {
  return file.documents.map((doc): CheckResult => {
    const credits = creditsBackedBy(file, doc.id);
    const { label, confidence } = doc.sort;
    const shared = {
      layer: "sort" as const,
      rule: "sort-confidence" as const,
      src: keyLine(doc),
      extracted: `${KIND_NAMES[label]}, ${confidence.toFixed(2)}`,
      reviewer: "Sorting model (simulated)",
    };
    if (confidence >= SORT_THRESHOLD) {
      return {
        ...shared,
        target: `doc:${doc.id}`,
        nodes: [],
        status: "pass",
        detail: `Labeled as a ${KIND_NAMES[label]} at ${confidence.toFixed(2)} confidence.`,
      };
    }
    const eur = total(credits);
    return {
      ...shared,
      target: credits[0] ? creditNode(credits[0]) : `doc:${doc.id}`,
      nodes: credits.map(creditNode),
      status: "fail",
      detail: `${doc.title} is labeled as a ${KIND_NAMES[label]} at ${confidence.toFixed(2)} confidence, below the ${SORT_THRESHOLD.toFixed(2)} threshold.`,
      question: "document-meaning",
      amountUsd: toUsd(file, eur),
      amountLabel: money("EUR", eur),
      counts: true,
      hold: "reserved",
    };
  });
}

function normalizeResults(file: CaseFile): CheckResult[] {
  return file.documents
    .filter((doc) => doc.sort.label === "statement")
    .map((doc): CheckResult => {
      const credits = creditsBackedBy(file, doc.id);
      const accountNodes = accountsOf(file)
        .filter((account) => account.srcClosing.doc === doc.id)
        .map((account) => `account:${account.id}`);
      const nodes = [...credits.map(creditNode), ...accountNodes];
      const txCount = doc.lines.filter((line) => line.tx).length;
      const missing = [
        !doc.lines.some((line) => line.id === "opening") && "an opening balance",
        !doc.lines.some((line) => line.id === "closing") && "a closing balance",
        txCount === 0 && "transactions",
      ].filter((item): item is string => Boolean(item));
      const shared = {
        layer: "normalize" as const,
        rule: "statement-schema" as const,
        nodes,
        src: keyLine(doc),
        extracted: `${txCount} transaction${txCount === 1 ? "" : "s"}`,
        reviewer: PLAIN_CODE,
      };
      if (missing.length === 0) {
        return {
          ...shared,
          target: `doc:${doc.id}`,
          status: "pass",
          detail: `${doc.title} reads as a statement with ${txCount} transaction${txCount === 1 ? "" : "s"} between its opening and closing balances.`,
        };
      }
      const eur = total(credits);
      return {
        ...shared,
        target: nodes[0] ?? `doc:${doc.id}`,
        status: "fail",
        detail: `${doc.title} is labeled as a bank statement, but it is missing ${listOf(missing)}.`,
        question: "missing-evidence",
        amountUsd: toUsd(file, eur),
        amountLabel: money("EUR", eur),
        counts: true,
        hold: "unproven",
      };
    });
}

function balanceResults(file: CaseFile): CheckResult[] {
  return accountsOf(file).map((account): CheckResult => {
    const { ccy, opening, closing, credits, debits } = account;
    const expected = opening + total(credits) - total(debits);
    const gap = closing - expected;
    const node = `account:${account.id}`;
    const shared = {
      layer: "check" as const,
      rule: "balance" as const,
      target: node,
      nodes: [node],
      src: account.srcClosing,
      reviewer: PLAIN_CODE,
    };
    if (Math.abs(gap) <= MATCH_TOLERANCE) {
      return {
        ...shared,
        status: "pass",
        extracted: `Closing balance ${money(ccy, closing)}`,
        detail: `Opening balance plus transactions comes to ${money(ccy, expected)}, which matches the closing balance.`,
      };
    }
    const amount = Math.abs(gap);
    return {
      ...shared,
      status: "fail",
      extracted: `Credits read: ${credits.map((c) => NUM.format(c.amount)).join(" + ")}. Closing: ${NUM.format(closing)}`,
      detail: `Transactions add up to ${money(ccy, expected)}, but the statement closes at ${money(ccy, closing)}. Gap: ${money(ccy, amount)}.`,
      question: "re-read",
      amountUsd: ccy === "EUR" ? toUsd(file, amount) : amount,
      amountLabel: money(ccy, amount),
      counts: true,
      hold: "unexplained",
    };
  });
}

const DAY = 86_400_000;

function continuityResults(file: CaseFile): CheckResult[] {
  return accountsOf(file).map((account): CheckResult => {
    const periods = [...account.periods].sort((a, b) =>
      a.from.localeCompare(b.from),
    );
    const gap = periods.find(
      (period, i) =>
        i > 0 &&
        Date.parse(period.from) - Date.parse(periods[i - 1].to) !== DAY,
    );
    const node = `account:${account.id}`;
    const shared = {
      layer: "check" as const,
      rule: "continuity" as const,
      target: node,
      nodes: [node],
      src: account.srcClosing,
      extracted: `${periods[0].from} to ${periods[periods.length - 1].to}`,
      reviewer: PLAIN_CODE,
    };
    if (!gap) {
      return {
        ...shared,
        status: "pass",
        detail: `${periods.length} statement period${periods.length === 1 ? "" : "s"} with no date gaps.`,
      };
    }
    const amountUsd =
      account.ccy === "EUR" ? toUsd(file, account.closing) : account.closing;
    return {
      ...shared,
      status: "fail",
      detail: `Statements stop and restart, leaving a gap before ${gap.from}.`,
      question: "missing-evidence",
      amountUsd,
      amountLabel: money(account.ccy, account.closing),
      counts: true,
      hold: "unproven",
    };
  });
}

export function controlPct(file: CaseFile, account: Account): number {
  const { investor, enterprise } = file;
  if (account.holder === investor.name) return 100;
  if (account.holder === enterprise.name) {
    return (
      enterprise.owners.find((owner) => owner.name === investor.name)?.pct ?? 0
    );
  }
  return 0;
}

function controlResults(file: CaseFile): CheckResult[] {
  return accountsOf(file).map((account): CheckResult => {
    const pct = controlPct(file, account);
    const node = `account:${account.id}`;
    const viaEntity = account.holder === file.enterprise.name;
    const shared = {
      layer: "check" as const,
      rule: "control" as const,
      target: node,
      nodes: [node],
      src: viaEntity ? file.enterprise.src : account.srcHolder,
      extracted: `${account.holder}, ${pct}% control`,
      reviewer: PLAIN_CODE,
    };
    if (pct >= 50) {
      return {
        ...shared,
        status: "pass",
        detail: viaEntity
          ? `Held by ${account.holder}, which ${file.investor.name} owns ${pct}%.`
          : `The account holder, ${account.holder}, is the investor.`,
      };
    }
    const amountUsd =
      account.ccy === "EUR" ? toUsd(file, account.closing) : account.closing;
    return {
      ...shared,
      status: "fail",
      detail: `${account.holder} is not the investor, so control of these funds is not shown.`,
      question: "missing-evidence",
      amountUsd,
      amountLabel: money(account.ccy, account.closing),
      counts: true,
      hold: "unproven",
    };
  });
}

function transferResults(file: CaseFile): CheckResult[] {
  const { wire, fx, escrow, enterprise } = file;
  const { us, llc } = file.accounts;
  const received = total(us.credits.filter((c) => c.origin === "wire"));
  const converted = Math.round(wire.sentEur * fx.rate) - wire.feeUsd;
  const wireIn = us.credits.find((c) => c.origin === "wire");
  const results: CheckResult[] = [];

  const wireGap = Math.max(
    Math.abs(received - wire.sentUsd),
    Math.abs(converted - wire.sentUsd),
  );
  const wireShared = {
    layer: "check" as const,
    rule: "transfer-match" as const,
    target: "edge:wire",
    nodes: ["account:us"],
    src: wireIn?.src ?? wire.src,
    extracted: `Received ${money("USD", received)}`,
    reviewer: PLAIN_CODE,
  };
  if (wireGap <= MATCH_TOLERANCE) {
    results.push({
      ...wireShared,
      status: "pass",
      detail: `${money("EUR", wire.sentEur)} at ${fx.rate.toFixed(2)}, less a ${money("USD", wire.feeUsd)} fee, is ${money("USD", converted)}. The same amount arrived.`,
    });
  } else {
    results.push({
      ...wireShared,
      status: "fail",
      detail: `${money("USD", wire.sentUsd)} was sent and ${money("USD", received)} arrived. ${money("USD", wireGap)} is unexplained.`,
      question: "unexplained-funds",
      amountUsd: wireGap,
      amountLabel: money("USD", wireGap),
      counts: true,
      hold: "unexplained",
    });
  }

  const legs = [
    {
      target: "edge:escrow",
      node: "escrow",
      sent: total(us.debits.filter((d) => d.counterparty === escrow.holder)),
      got: escrow.amount,
      src: escrow.src,
    },
    {
      target: "edge:llc",
      node: "account:llc",
      sent: total(us.debits.filter((d) => d.counterparty === enterprise.name)),
      got: total(llc.credits),
      src: llc.credits[0]?.src ?? llc.srcClosing,
    },
  ];
  for (const leg of legs) {
    const gap = Math.abs(leg.sent - leg.got);
    const shared = {
      layer: "check" as const,
      rule: "transfer-match" as const,
      target: leg.target,
      nodes: [leg.node],
      src: leg.src,
      extracted: `Sent ${money("USD", leg.sent)}, received ${money("USD", leg.got)}`,
      reviewer: PLAIN_CODE,
    };
    results.push(
      gap <= MATCH_TOLERANCE
        ? {
            ...shared,
            status: "pass",
            detail: `${money("USD", leg.sent)} left the investor's US account and the same amount arrived.`,
          }
        : {
            ...shared,
            status: "fail",
            detail: `${money("USD", leg.sent)} was sent but ${money("USD", leg.got)} arrived.`,
            question: "unexplained-funds",
            amountUsd: gap,
            amountLabel: money("USD", gap),
            counts: true,
            hold: "unexplained",
          },
    );
  }
  return results;
}

function originResults(file: CaseFile): CheckResult[] {
  const { savings } = file.accounts;
  return savings.credits
    .filter((credit) => credit.amount >= LARGE_DEPOSIT)
    .map((credit): CheckResult => {
      const docs = (credit.evidence ?? [])
        .map((id) => docById(file, id))
        .filter((doc): doc is Doc => Boolean(doc));
      const node = creditNode(credit);
      const shared = {
        layer: "check" as const,
        rule: "origin" as const,
        target: node,
        nodes: [node],
        src: docs[0] ? keyLine(docs[0]) : credit.src,
        extracted: money("EUR", credit.amount),
        reviewer: PLAIN_CODE,
      };
      const failure = {
        status: "fail" as const,
        amountUsd: toUsd(file, credit.amount),
        amountLabel: money("EUR", credit.amount),
        counts: true,
      };

      if (docs.length === 0) {
        const relation = file.investor.family.find(
          (person) => person.name === credit.counterparty,
        )?.relation;
        if (relation === "spouse") {
          const salary = total(
            savings.credits.filter((c) => c.origin === "salary"),
          );
          return {
            ...shared,
            ...failure,
            src: credit.src,
            detail: `The salary savings split into ${money("EUR", salary)} backed by payslips and ${money("EUR", credit.amount)} from ${credit.counterparty}, the investor's spouse, with no source document.`,
            question: "commingled",
            hold: "reserved",
          };
        }
        return {
          ...shared,
          ...failure,
          src: credit.src,
          detail: `${money("EUR", credit.amount)} from ${credit.counterparty} has no source document.`,
          question: "missing-evidence",
          hold: "unproven",
        };
      }

      if (credit.origin === "gift") {
        const letter = docs.find((doc) => doc.sort.label === "gift-letter");
        const statement = docs.find((doc) => doc.sort.label === "statement");
        const unsure = docs.some((doc) => doc.sort.confidence < SORT_THRESHOLD);
        const traced = statement?.lines.some((line) => line.tx);
        if (letter && traced && !unsure) {
          return {
            ...shared,
            status: "pass",
            src: keyLine(statement as Doc),
            detail: `A gift letter and ${credit.counterparty}'s own statement are on file, so the gift traces to the donor's funds.`,
          };
        }
        return {
          ...shared,
          ...failure,
          detail: `The gift cannot yet be traced to ${credit.counterparty}'s own funds.`,
          question: "missing-evidence",
          hold: "unproven",
        };
      }

      return {
        ...shared,
        status: "pass",
        detail: `Backed by ${listOf(docs.map((doc) => doc.title.toLowerCase()))}.`,
      };
    });
}

function debtResults(file: CaseFile): CheckResult[] {
  const note = file.purchase.sellerNote;
  if (!note) {
    return [
      {
        layer: "check",
        rule: "debt",
        target: "escrow",
        nodes: ["escrow"],
        status: "pass",
        src: file.purchase.src,
        extracted: `Purchase price ${money("USD", file.purchase.price)}`,
        detail: "The purchase is paid in full from the investor's own funds, with no debt secured by the business.",
        reviewer: PLAIN_CODE,
      },
    ];
  }
  const secured = note.securedBy === "enterprise-assets";
  return [
    {
      layer: "check",
      rule: "debt",
      target: "note:seller",
      nodes: ["note:seller"],
      src: note.src,
      extracted: `${money("USD", note.amount)} note to ${note.lender}`,
      reviewer: PLAIN_CODE,
      ...(secured
        ? {
            status: "fail" as const,
            detail: `A ${money("USD", note.amount)} note to ${note.lender} is secured by the business's own assets, so it does not count as investment.`,
            question: "secured-debt" as const,
            amountUsd: note.amount,
            amountLabel: money("USD", note.amount),
            counts: false,
            hold: "excluded" as const,
          }
        : {
            status: "info" as const,
            detail: `A ${money("USD", note.amount)} note is secured by personal assets. It may count; an attorney confirms.`,
          }),
    },
  ];
}

export function isCommitted(escrow: CaseFile["escrow"]): boolean {
  return escrow.releaseOn === "visa-approval" && escrow.refundOn === "visa-denial";
}

function commitmentResults(file: CaseFile): CheckResult[] {
  const { escrow } = file;
  const { llc } = file.accounts;
  const spent = total(llc.debits);
  const idle = total(llc.credits) - spent;
  const shared = {
    layer: "check" as const,
    rule: "commitment" as const,
    reviewer: PLAIN_CODE,
  };
  const results: CheckResult[] = [];
  if (isCommitted(escrow)) {
    results.push({
      ...shared,
      target: "escrow",
      nodes: ["escrow"],
      status: "pass",
      src: escrow.src,
      extracted: `${money("USD", escrow.amount)}, released on approval`,
      detail: `${money("USD", escrow.amount)} sits in escrow that releases only on visa approval and refunds only on denial, so it is committed.`,
    });
  } else {
    results.push({
      ...shared,
      target: "escrow",
      nodes: ["escrow"],
      status: "fail",
      src: escrow.src,
      extracted: `${money("USD", escrow.amount)}, release terms unclear`,
      detail: "The escrow can be released for reasons other than the visa outcome, so it is not committed.",
      question: "missing-evidence",
      amountUsd: escrow.amount,
      amountLabel: money("USD", escrow.amount),
      counts: true,
      hold: "unproven",
    });
  }
  results.push({
    ...shared,
    target: "spend",
    nodes: ["spend"],
    status: "pass",
    src: llc.debits[0]?.src ?? llc.srcClosing,
    extracted: money("USD", spent),
    detail: `${money("USD", spent)} was paid out for ${listOf(llc.debits.map((d) => d.label.toLowerCase()))}, so it is at risk.`,
  });
  results.push({
    ...shared,
    target: "idle",
    nodes: ["idle"],
    status: "info",
    src: llc.srcClosing,
    extracted: money("USD", idle),
    detail: `${money("USD", idle)} is still in the operating account and not committed, so it does not count yet.`,
  });
  return results;
}

export function evaluate(file: CaseFile): CheckResult[] {
  return [
    ...sortResults(file),
    ...normalizeResults(file),
    ...balanceResults(file),
    ...continuityResults(file),
    ...controlResults(file),
    ...transferResults(file),
    ...originResults(file),
    ...debtResults(file),
    ...commitmentResults(file),
  ];
}

// Failures in pipeline order, one per target: the first finding is the one
// that stops the token, and later layers never double-count the same money.
export function findingsOf(results: CheckResult[]): Finding[] {
  const seen = new Set<string>();
  const findings: Finding[] = [];
  for (const result of results) {
    if (result.status !== "fail" || seen.has(result.target)) continue;
    seen.add(result.target);
    findings.push(result as Finding);
  }
  return findings;
}

export function nodeResults(results: CheckResult[], nodeId: string) {
  return results.filter((result) => result.nodes.includes(nodeId));
}

// ---------------------------------------------------------------- tiles

export function weakestControl(file: CaseFile): number {
  return Math.min(...accountsOf(file).map((account) => controlPct(file, account)));
}

export function computeTiles(file: CaseFile, holds: Hold[] = []): Tiles {
  const { escrow } = file;
  const { llc } = file.accounts;
  const toLlc = total(llc.credits);
  const spent = total(llc.debits);
  const atRisk = (isCommitted(escrow) ? escrow.amount : 0) + spent;
  const held = holds
    .filter((hold) => hold.counts)
    .reduce((sum, hold) => sum + hold.amountUsd, 0);
  return {
    intoEnterprise: escrow.amount + toLlc,
    qualifying: Math.max(0, atRisk - held),
    atRisk,
    notYetDeployed: toLlc - spent,
    weakestControl: weakestControl(file),
  };
}

// A generic single-pass pipeline: one model reads the file once and its labels
// are taken as true. No checks run, so debt is counted and nothing is held.
export function computeTilesSinglePass(file: CaseFile): Tiles {
  const base = computeTiles(file);
  const note = file.purchase.sellerNote?.amount ?? 0;
  return {
    ...base,
    intoEnterprise: base.intoEnterprise + note,
    atRisk: base.atRisk + note,
    qualifying: base.atRisk + note,
  };
}

// ---------------------------------------------------------------- routing

export function route(
  finding: Pick<Finding, "question">,
  file: CaseFile,
  scores: Partial<Record<Destination, number>> = {},
  rulings: Ruling[] = [],
): RouteHop {
  const { question } = finding;
  if (RESERVED_QUESTIONS.includes(question)) {
    const ruling = rulings.find(
      (r) => r.question === question && r.route === file.investor.route,
    );
    return {
      to: "attorney",
      hard: true,
      reason: ruling ? "ruling" : "reserved",
      question,
      ruling,
    };
  }
  const [best, score] = (
    Object.entries(scores) as [Destination, number][]
  ).sort((a, b) => b[1] - a[1])[0] ?? ["attorney", 0];
  if (score < ROUTER_MIN) {
    return { to: "attorney", hard: false, reason: "unsure", question, score };
  }
  return { to: best, hard: false, reason: "scored", question, score };
}

const holdOf = (finding: Finding, kind: HoldKind = finding.hold): Hold => ({
  target: finding.target,
  kind,
  amountUsd: finding.amountUsd,
  counts: finding.counts,
});

export function settle(
  file: CaseFile,
  scenario: Scenario | null,
  options: { rulings?: Ruling[]; treatment?: Treatment | null; confirmed?: boolean } = {},
): Settlement {
  const results = evaluate(file);
  const findings = findingsOf(results);
  const primary = findings[0] ?? null;
  const flagged = findings.map((f) => holdOf(f, "flagged"));
  const base = { results, findings, primary, flagged };
  if (!primary || !scenario) {
    return { ...base, hops: [], outcome: "clear", file, holds: [] };
  }

  const rulings = options.rulings ?? [];
  const first = route(primary, file, scenario.router?.scores, rulings);
  const hops = [first];
  const keep = findings.map((f) => holdOf(f));

  if (first.to === "frontier") {
    // The model's answer only counts if the arithmetic agrees with it.
    const corrected = applyPatch(file, scenario.model?.patch);
    const after = settle(corrected, null);
    if (!after.findings.some((f) => f.target === primary.target)) {
      return {
        ...base,
        hops,
        outcome: "closed",
        file: corrected,
        holds: after.findings.map((f) => holdOf(f)),
      };
    }
    hops.push({ to: "attorney", hard: false, reason: "model-failed", question: primary.question });
    return { ...base, hops, outcome: "reserved", file, holds: keep };
  }

  if (first.to === "client") {
    return { ...base, hops, outcome: "waiting-client", file, holds: keep };
  }

  if (first.to === "domain") {
    const raised = scenario.model?.raises;
    if (raised) hops.push(route({ question: raised }, file, undefined, rulings));
    return {
      ...base,
      hops,
      outcome: "reserved",
      file,
      holds: findings.map((f) => holdOf(f, "reserved")),
    };
  }

  if (primary.question === "commingled") {
    const treatment =
      options.treatment ?? (options.confirmed ? first.ruling?.treatment : undefined);
    if (treatment) {
      const kind = treatment === "trace" ? "unproven" : "excluded";
      return {
        ...base,
        hops,
        outcome: "ruled",
        file,
        holds: [holdOf(primary, kind), ...keep.slice(1)],
      };
    }
    return {
      ...base,
      hops,
      outcome: first.ruling ? "ruling-attached" : "awaiting-ruling",
      file,
      holds: findings.map((f) => holdOf(f, "reserved")),
    };
  }

  return { ...base, hops, outcome: "reserved", file, holds: keep };
}

// What a finished run adds to the run log. Counts demo events only.
export function logFor(settlement: Settlement): RunLog {
  const { hops, outcome } = settlement;
  return {
    closedNoAttorney: outcome === "closed" ? 1 : 0,
    sentToClient: hops.some((hop) => hop.to === "client") ? 1 : 0,
    sentToAttorney: hops.some((hop) => hop.to === "attorney") ? 1 : 0,
    rulings: 0,
  };
}

export function makeRuling(
  scenario: Scenario,
  treatment: Treatment,
  file: CaseFile,
  runId: number,
  effective: string,
  count: number,
): Ruling {
  const option = scenario.ruling?.options.find((o) => o.id === treatment);
  return {
    id: `R-${count + 1}`,
    question: "commingled",
    treatment,
    text: option?.text ?? "",
    route: file.investor.route,
    effective,
    runId,
  };
}

// ---------------------------------------------------------------- trail

export function trail(file: CaseFile): { nodes: TrailNode[]; edges: TrailEdge[] } {
  const { savings, us, llc } = file.accounts;
  const { escrow } = file;
  const note = file.purchase.sellerNote;
  const spent = total(llc.debits);
  const toLlc = total(llc.credits);
  const credits = savings.credits;

  const nodes: TrailNode[] = credits.map((credit, i) => ({
    id: creditNode(credit),
    label: credit.label,
    ccy: "EUR",
    amount: credit.amount,
    col: 0,
    y: (i + 0.5) / credits.length,
  }));
  nodes.push(
    { id: "account:savings", label: "Savings, Germany", ccy: "EUR", amount: savings.closing, col: 1, y: 0.5 },
    { id: "account:us", label: "US account", ccy: "USD", amount: total(us.credits), col: 2, y: note ? 0.36 : 0.5 },
    { id: "escrow", label: "Purchase escrow", ccy: "USD", amount: escrow.amount, col: 3, y: 0.25 },
    { id: "account:llc", label: "LLC operating", ccy: "USD", amount: toLlc, col: 3, y: 0.72 },
    { id: "spend", label: "Equipment, lease", ccy: "USD", amount: spent, col: 4, y: 0.55 },
    { id: "idle", label: "Not yet deployed", ccy: "USD", amount: toLlc - spent, col: 4, y: 0.87 },
  );
  if (note) {
    nodes.push({ id: "note:seller", label: "Seller note", ccy: "USD", amount: note.amount, col: 2, y: 0.82 });
  }

  const edges: TrailEdge[] = credits.map((credit) => ({
    id: `edge:${credit.id}`,
    from: creditNode(credit),
    to: "account:savings",
  }));
  edges.push(
    { id: "edge:wire", from: "account:savings", to: "account:us" },
    { id: "edge:escrow", from: "account:us", to: "escrow" },
    { id: "edge:llc", from: "account:us", to: "account:llc" },
    { id: "edge:spend", from: "account:llc", to: "spend" },
    { id: "edge:idle", from: "account:llc", to: "idle", dashed: true },
  );
  if (note) edges.push({ id: "edge:note", from: "note:seller", to: "escrow" });
  return { nodes, edges };
}
