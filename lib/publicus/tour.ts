// The explorer's guided tour. Each step names the `data-tour` element it highlights and the view
// and pane (on phones) it needs. Every title and body reads on its own, without the screen.
import type { Role } from "./onboarding.ts";

export type View = "vendor" | "government" | "sources";
export type TourContext = { company: string; buyer?: string };
type Text = string | ((context: TourContext) => string);
export type TourStep = {
  id: string;
  target: string;
  view?: View;
  pane?: "list" | "detail";
  title: Text;
  body: Text;
  // The step moves on by itself when the visitor does this.
  advanceOn?: "explain" | "scenario";
  placement?: "right" | "left" | "top" | "bottom";
};

export const tourText = (text: Text, context: TourContext) => typeof text === "function" ? text(context) : text;

const explain = (label: string): TourStep => ({
  id: "explain", target: "explain", pane: "detail", advanceOn: "explain", placement: "left",
  title: "An explanation that cites its sources",
  body: `Try ${label}. Each claim quotes a source document, and code checks that every quote is really there before it’s shown.`,
});
const scenario: TourStep = {
  id: "scenario", target: "scenario", advanceOn: "scenario", placement: "top",
  title: "Break the data on purpose",
  body: "Pick a data problem: a late security requirement, two values that disagree or a missing source. The checks, flags and explanations change with it.",
};
const setup: TourStep = {
  id: "setup", target: "setup", placement: "bottom",
  title: "Make it yours",
  body: "Change your answers or switch sides in Setup. Take the tour, beside it, plays this again.",
};

export const VENDOR_TOUR: TourStep[] = [
  { id: "matches", target: "list", view: "vendor", pane: "list", placement: "right", title: "Your matches, best first", body: ({ company }) => `Open tenders are ranked against ${company}: up to 55 points for matching capabilities, 25 for region and 20 for contract size. The score screens fit. It isn’t a chance of winning.` },
  { id: "requirements", target: "requirements", view: "vendor", pane: "detail", placement: "left", title: "Requirements, checked against you", body: "A tick means your profile holds the qualification and a marker means it doesn’t. Select a requirement to read the exact sentence in its source document." },
  { ...explain("Explain this match"), view: "vendor" },
  { id: "pipeline", target: "next-step", view: "vendor", pane: "detail", placement: "left", title: "Keep track of what you’ll pursue", body: "Give an opportunity a pipeline stage and notes. Export brief, above the list, downloads your saved opportunities as a Markdown brief." },
  { id: "government", target: "list", view: "government", pane: "list", placement: "right", title: "The buyer’s side", body: "For government groups awarded contracts across their amendments and flags the ones that need a look: values that jumped, terms that are ending and totals that disagree." },
  { id: "sources", target: "sources", view: "sources", placement: "bottom", title: "Bring real data", body: "Load ten CanadaBuys records exactly as published, import a CSV of your own, or start a private workspace for the live feed and PDF reading." },
  // Back on the home view, where the bottom bar is on screen and the checks visibly change.
  { ...scenario, view: "vendor" },
  setup,
];

export const BUYER_TOUR: TourStep[] = [
  { id: "contracts", target: "list", view: "government", pane: "list", placement: "right", title: ({ buyer }) => `${buyer}’s contracts`, body: "Each contract is grouped across its amendments, with the most review flags first. Set the filter to All contracts to compare with other buyers." },
  { id: "flags", target: "flags", view: "government", pane: "detail", placement: "left", title: "What needs a look", body: "Flags come from plain rules on values, dates and sources. The ones on your watch list come first. Tick the box once you’ve reviewed them." },
  { id: "timeline", target: "timeline", view: "government", pane: "detail", placement: "left", title: "The contract over time", body: "Every version links to its source. The current value is the latest cumulative total, not a sum of the amendments." },
  { id: "suppliers", target: "suppliers", view: "government", pane: "detail", placement: "left", title: "Who you depend on", body: "Each supplier’s share of reported value in this dataset, and the other buyers that hold contracts with this contract’s supplier." },
  { ...explain("Explain these changes"), view: "government" },
  { id: "vendor", target: "list", view: "vendor", pane: "list", placement: "right", title: "The vendor’s side", body: ({ company }) => `For vendors ranks open tenders against a company profile, here ${company}. Tenders your organisation published are marked Your tender.` },
  { ...scenario, view: "government" },
  setup,
];

export const tourFor = (role: Role) => role === "buyer" ? BUYER_TOUR : VENDOR_TOUR;
