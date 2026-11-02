// Every external claim on /belong points at one of these. Checked 2026-11-03.
export const SOURCES = {
  jd: { label: "Belong, Founding Engineer job description (PDF)" },
  home: { label: "Belong home page", href: "https://belonglaw.com" },
  e2: { label: "Belong E-2 page", href: "https://belonglaw.com/e-2-businessvisa/" },
  h1b: { label: "Belong cap-exempt H-1B page", href: "https://belonglaw.com/cap-exempt-h1b/" },
  gotv: {
    label: "Geeks of the Valley on Belong's voice agent",
    href: "https://geeksofthevalley.substack.com/p/voice-ai-agents-are-unbundling-professional-d2d",
  },
  gatewayx: { label: "Gateway X", href: "https://www.gateway.xyz/" },
  fam: { label: "9 FAM 402.9, Treaty traders and investors", href: "https://fam.state.gov/fam/09FAM/09FAM040209.html" },
  cfr: { label: "8 CFR 103.2(b)(3), translations", href: "https://www.law.cornell.edu/cfr/text/8/103.2" },
  aba: {
    label: "ABA on Formal Opinion 512",
    href: "https://www.americanbar.org/groups/litigation/resources/newsletters/ethics-professionalism/generative-ai-lawyers-part-2-maintaining-confidentiality/",
  },
  funds: {
    label: "Scott Legal on proving source of funds",
    href: "https://legalservicesincorporated.com/immigration-law/investor-visas/e2-visa/how-do-you-prove-where-the-money-comes-from-the-source-of-funds-requirement-explained-for-e-2-eb-5-visas/",
  },
  scrutiny: {
    label: "Scott Legal on USCIS and consular scrutiny",
    href: "https://legalservicesincorporated.com/immigration-law/investor-visas/e2-visa/e2-visa-source-of-funds-trail/",
  },
  kag: { label: "KAG paper, arXiv 2409.13731", href: "https://arxiv.org/abs/2409.13731v1" },
  ocr: { label: "Codesota document OCR benchmarks", href: "https://codesota.com/tasks/document-ocr" },
} as const;

export type SourceId = keyof typeof SOURCES;
