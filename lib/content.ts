import { PROFILE } from "./profile.ts";

// Profile facts and navigation live in ./profile.ts so client components can import them
// without bundling the whole content file. They are re-exported here as the single source.
export { NAV_ITEMS, PROFILE } from "./profile.ts";

export const EDUCATION = {
  school: "McMaster University",
  degree: "B.Eng. Software Engineering",
  years: "2020–2025",
  location: "Hamilton, Canada",
};

export interface Experience {
  date: string;
  impact: string;
  role: string;
  company: string;
  location: string;
  bullets: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    date: "Jul 2026 – Present",
    impact: "Two products built as sole engineer · US$45,000 first pilot",
    role: "Founding Engineer",
    company: "BaseNote Solutions LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Co-founded BaseNote and built Blend for fragrance studios. I work directly with the first licensee on how staff consult with customers and create a custom blend.",
      "Built Alchemy for our own team. It connects a client’s fragrance brief to lab experiments, sourcing, and sales and service orders.",
      "Designed Blend’s assistant to search chemists’ experiments, check live oil inventory, and validate the quantities in a proposed formula.",
      "Closed six gaps between our API and a partner’s storefront in four days. For a separate client, ALPAC London, I launched a Shopify Hydrogen store connected to production and fulfilment.",
    ],
  },
  {
    date: "Jul 2025 – Jun 2026",
    impact: "3,000 early downloads · Team grew from 2 to 10",
    role: "Head of Product and Engineering",
    company: "Icon Train Smarter LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Led the subscription coaching app from Figma designs through the MVP and public launch. Organic sharing brought about 30 paying users and roughly US$600 in monthly recurring revenue in the first few weeks.",
      "Hired across engineering, QA and operations. I set release priorities, led the Flutter and Django teams, and defined how trainers manage clients, review flagged conversations and track earnings.",
      "Rebuilt part of the AI coach’s search. I indexed athletes’ training records, batched updates and added a nightly repair job so missing records could be found again.",
      "Trained developers to turn a specification into a tested change with Claude Code and Codex. We used the same review and testing standards for the resulting code.",
    ],
  },
  {
    date: "Sep 2023 – Aug 2024",
    impact: "255 warehouse interface errors cleared",
    role: "SAP Analyst, S/4HANA Key User (Co-op)",
    company: "Sanofi Pasteur",
    location: "Toronto, Canada",
    bullets: [
      "Cleared the SAP S/4HANA warehouse backlog and brought new errors down to a one-day turnaround.",
      "Traced blocked inspection lots to temperature settings on warehouse bins. Wrote troubleshooting guides used across the company and tested fixes with manufacturing and supply chain teams.",
      "Used warehouse task times to estimate staffing needs and forecasted when supplies would need replenishment from usage, shelf time and transfers between buildings.",
    ],
  },
  {
    date: "May 2023 – Aug 2023",
    impact: "Weekly report conversions rose from 4–5 to 10–15 per analyst",
    role: "IT Intern",
    company: "Eastern Bank PLC",
    location: "Dhaka, Bangladesh",
    bullets: [
      "Automated steps in a planned migration of 1,800 reports from SAP BusinessObjects to Oracle and wrote the team’s migration guide. I converted about 55 reports in three weeks.",
      "Built an internal tool to route IT support requests to the right employee. During the mobile banking rotation, I estimated development time and cost from the proposed app screens.",
    ],
  },
];

export interface Project {
  slug: string;
  name: string;
  stack: string[];
  description: string;
  githubUrl?: string;
  summary?: string;
  category: string;
  contribution: string;
  problem: string;
  approach: string;
  result: string;
  image: PortfolioImage;
  // A featured case with a video shows it in place of the screenshot.
  video?: PortfolioVideo;
  websiteUrl?: string;
  featured?: boolean;
}

export interface PortfolioImage {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}

export interface PortfolioVideo {
  src: string;
  poster: string;
  captions: string;
  label: string;
  duration: string;
  width: number;
  height: number;
}

const screenshot = (
  name: string,
  alt: string,
  label: string,
): PortfolioImage => ({
  src: `/images/${name}.webp`,
  alt,
  label,
  width: 1440,
  height: 900,
});

export const PROJECTS: Project[] = [
  {
    slug: "palette-knife",
    name: "Palette Knife",
    summary:
      "A Python toolkit for collecting web data through reusable workflows, with a local dashboard for tracking each crawl.",
    stack: ["Python", "SQLite", "TOML", "CSS / XPath"],
    description:
      "A configurable web scraping toolkit built around TOML workflows, CSS/XPath selectors, and custom Python adapters. A durable SQLite queue preserves progress across interruptions, while a local dashboard tracks each crawl. Includes JSON, JSONL, and CSV exports with source metadata, machine-readable CLI output, and a portable agent skill.",
    githubUrl: "https://github.com/RafeedIqbal/palette-knife",
    category: "Open source · Developer tools",
    contribution: "Architecture, development & open-source release",
    problem:
      "One-off scraping scripts are hard to reuse, can lose progress when interrupted, and often separate collected records from their original sources.",
    approach:
      "Built configurable extraction on a persistent SQLite queue, with explicit host limits, per-origin backoff, and Python adapters for custom workflows. Added a local dashboard, consistent exports, and a CLI designed for people and agents.",
    result:
      "An MIT-licensed CLI and local dashboard that preserve crawl progress and export structured JSON, JSONL, and CSV with source provenance.",
    image: screenshot(
      "work/palette-knife",
      "Palette Knife's local demo dashboard showing saved records, completed pages, queue status, and worker controls",
      "Scraping workflow dashboard · Local demo",
    ),
    featured: true,
  },
  {
    slug: "whatsapp-mcp-vault",
    name: "WhatsApp MCP Vault",
    summary:
      "Pair WhatsApp once, then search your synced conversations from ChatGPT or Claude. You control what each assistant can access.",
    stack: ["Go", "MCP", "SQLCipher", "OAuth"],
    description:
      "A work-in-progress fork of Sealjay/mcp-whatsapp that gives one person an encrypted WhatsApp archive. ChatGPT and Claude search it through the same Model Context Protocol (MCP) server, each with its own permissions.",
    githubUrl: "https://github.com/RafeedIqbal/whatsapp-mcp-vault",
    category: "Open source · Work in progress",
    contribution: "Vault design and development · Fork of Sealjay/mcp-whatsapp",
    problem:
      "Looking up a decision from a WhatsApp chat can mean copying a conversation into an assistant, then finding the message again to check the original wording.",
    approach:
      "I extended the Go server to run one vault per person. SQLCipher encrypts the message archive and linked-device database on disk. Each assistant has its own OAuth grant, so you can allow replies in one and keep the other read-only.",
    result:
      "Either assistant can cite a message with a link that opens its text, sender, and timestamp in your vault.",
    image: screenshot(
      "work/whatsapp-mcp-vault",
      "The vault lists ChatGPT with read access and Claude with read and send access, each with a Disconnect button",
      "Connected apps · Local demo",
    ),
    featured: true,
  },
  {
    slug: "bajan",
    name: "Bajan",
    summary:
      "A Bangla-first voice companion for older adults living alone, pairing real-time conversation with profile-based answers and simple, accessible controls.",
    stack: ["Next.js", "TypeScript", "Gemini Live", "Supabase"],
    description:
      "A bilingual voice assistant proof of concept for older adults living alone. Supports live conversations, typed messages, and recorded voice notes, with spoken replies grounded in a structured personal profile. Prescription extraction requires user review, and caregiver calls are simulated.",
    websiteUrl: "https://bajan.arizmilabs.com/login",
    category: "Conversational AI · Proof of concept",
    contribution: "Product design & full-stack development",
    problem:
      "Older adults living alone need an easy way to talk in Bangla, hear back everyday information, and ask for family support.",
    approach:
      "Connected Gemini Live to a Next.js interface and Supabase profiles. Added Bangla and English controls, prescription extraction with user review, and server-side tools with duplicate-call protection.",
    result:
      "A working bilingual proof of concept with live, typed, and recorded voice conversations, profile-based answers, and a demo using sample data. Caregiver calls are simulated.",
    image: screenshot(
      "work/bajan",
      "Bajan's Bangla interface with its companion avatar, voice controls, and conversation panel",
      "Bangla voice companion",
    ),
  },
  {
    slug: "id8",
    name: "id8",
    summary:
      "A prompt-to-deployment workflow that connects planning, code generation, human review, and release in one resumable pipeline.",
    stack: ["Python", "FastAPI", "Next.js", "Google Gemini", "Google Cloud"],
    description:
      "AI-powered application generator that turns natural-language prompts into production-deployed web apps through a 10-stage orchestration pipeline (PRD → design → code → security scan → PR → deploy). Idempotent, resumable state machine built on FastAPI and async SQLAlchemy/PostgreSQL, integrating Google Gemini with the GitHub, Vercel, and Supabase APIs to automate PR creation and deployment.",
    githubUrl: "https://github.com/RafeedIqbal/id8",
    category: "AI developer tools",
    contribution: "Full-stack application orchestration",
    problem:
      "Turning an idea into a deployed application involves disconnected planning, coding, review, and release steps.",
    approach:
      "A 10-stage, resumable pipeline connects requirements, design, code generation, security checks, pull requests, and deployment. Human approval gates keep each major decision reviewable.",
    result:
      "One workflow from natural-language prompt to deployed application, with checkpoints that can resume after interruption.",
    image: screenshot(
      "work/id8",
      "id8 application showing the project workspace and generation pipeline",
      "Application workspace",
    ),
  },
  {
    slug: "e-predict",
    name: "E-Predict",
    stack: ["Next.js", "Flask", "ML"],
    description:
      "AI-driven energy consumption forecasting tool using machine learning models. Flask backend for data processing and model deployment; Next.js frontend with interactive visualizations for anomaly detection.",
    githubUrl: "https://github.com/RafeedIqbal/E-Predict",
    category: "Machine learning",
    contribution: "Forecasting & data visualization",
    problem:
      "Energy consumption data is more useful when people can understand patterns, anticipate demand, and investigate anomalies.",
    approach:
      "A Flask backend handles data processing and machine-learning models, while a Next.js interface makes predictions and anomalies easier to explore.",
    result:
      "An interactive forecasting tool that connects model output to a visual view of electricity consumption.",
    image: screenshot(
      "work/e-predict",
      "E-Predict interface with electricity consumption visualizations",
      "Energy forecasting interface",
    ),
  },
  {
    slug: "syncmaster",
    name: "SyncMaster",
    stack: ["TypeScript", "Python", "AWS"],
    description:
      "Documentation management system for the City of Hamilton's PMATS, built by a 5-person capstone team. TypeScript frontend and Python backend with AWS infrastructure provisioned as code and scripted CI/CD pipelines; 1,200+ commits under real contribution, code-review, and testing standards.",
    githubUrl: "https://github.com/RafeedIqbal/SyncMaster",
    category: "Enterprise software · Capstone",
    contribution: "Development within a five-person team",
    problem:
      "The City of Hamilton’s PMATS needed a structured system for managing project documentation.",
    approach:
      "A five-person capstone team built a TypeScript frontend and Python backend, with AWS infrastructure as code and scripted CI/CD. Code review and testing were part of delivery.",
    result:
      "A documentation management system developed across 1,200+ team commits under real contribution and review standards.",
    image: screenshot(
      "work/syncmaster",
      "SyncMaster project documentation management interface",
      "Document management workspace",
    ),
  },
];

export const PROFESSIONAL_WORK: Project[] = [
  {
    slug: "basenote",
    name: "BaseNote",
    category: "Fragrance technology",
    featured: true,
    stack: ["Django", "PostgreSQL", "LangGraph"],
    summary:
      "Two products for perfumers, built from the first client and lab requirements.",
    description:
      "Blend helps studios design custom fragrances. Alchemy runs the lab and order workflows at BaseNote.",
    contribution: "Co-founder and sole engineer",
    problem:
      "A studio needs a blend it can make from the oils on hand. Our own perfumers also need to follow a customer brief from the first trial to a finished order.",
    approach:
      "I built both MVPs. Blend searches inventory and chemists’ experiments and checks the formula in code. In Alchemy, our staff record lab trials, source materials and manage orders.",
    result:
      "A fragrance studio bought a US$45,000 Blend pilot licence. BaseNote uses Alchemy internally for custom fragrance work.",
    websiteUrl: "https://www.basenotesolutions.com/private-label",
    image: screenshot(
      "sites/basenote-solutions",
      "BaseNote Solutions private-label fragrance website",
      "Private-label fragrance website",
    ),
    video: {
      src: "/videos/blend-alchemy-demo.mp4",
      poster: "/images/work/basenote-demo.webp",
      captions: "/videos/blend-alchemy-demo.en.vtt",
      label: "Blend & Alchemy product demo",
      duration: "2:59",
      width: 1920,
      height: 1080,
    },
  },
  {
    slug: "icon",
    name: "Icon Training",
    category: "AI fitness coaching",
    featured: true,
    stack: ["Flutter", "Django", "PostgreSQL"],
    summary:
      "Took a subscription coaching app from its first designs to its first paying users.",
    description:
      "Trainers and athletes offer subscribers an AI coach that can draw on their training history.",
    contribution: "Head of Product and Engineering",
    problem:
      "Two developers had Figma screens. Trainers needed a way to manage subscribers, and the coach needed to find the right athlete’s records.",
    approach:
      "I grew the team from two people to ten, led the mobile and backend releases, specified the trainer dashboard, and wrote the search and recovery jobs behind the coach.",
    result:
      "About 3,000 downloads, 30 paying subscribers and US$600 in monthly recurring revenue in the first few weeks after launch.",
    websiteUrl: "https://icontraining.app",
    image: screenshot(
      "sites/icon-training",
      "Icon Training’s public product website presenting its AI-powered fitness coaching app",
      "Icon Training product website",
    ),
  },
];

export const SELECTED_WORK = [...PROFESSIONAL_WORK, ...PROJECTS];

export interface Website {
  slug: string;
  name: string;
  url: string;
  stack: string;
  type: string;
  description: string;
  image: PortfolioImage;
  featured?: boolean;
}

export const WEBSITES: Website[] = [
  {
    slug: "rafeed-dev",
    name: "rafeed.dev",
    url: PROFILE.siteUrl,
    stack: "Next.js",
    type: "portfolio",
    description:
      "A terminal-inspired home for my work in software and product.",
    image: screenshot(
      "sites/rafeed-dev",
      "Rafeed Iqbal’s terminal-inspired portfolio overview",
      "Portfolio website",
    ),
  },
  {
    slug: "icon-training",
    name: "icontraining.app",
    url: "https://icontraining.app",
    stack: "Next.js",
    type: "product",
    description:
      "Introducing the people, AI coaching, and training experience behind Icon.",
    image: screenshot(
      "sites/icon-training",
      "Icon Training website homepage",
      "Product website",
    ),
  },
  {
    slug: "alpac-london",
    featured: true,
    name: "alpaclondon.com",
    url: "https://alpaclondon.com/",
    stack: "Shopify Hydrogen",
    type: "e-commerce",
    description:
      "A custom fragrance storefront connected to production and fulfilment.",
    image: screenshot(
      "sites/alpac-london",
      "ALPAC London fragrance storefront homepage",
      "Commerce website",
    ),
  },
  {
    slug: "arizmi-labs",
    featured: true,
    name: "arizmilabs.com",
    url: "https://www.arizmilabs.com/",
    stack: "Next.js",
    type: "consultancy",
    description:
      "A website for a consultancy that designs and builds new products.",
    image: screenshot(
      "sites/arizmi-labs",
      "Arizmi Labs website presenting its product development services",
      "Arizmi Labs website",
    ),
  },
  {
    slug: "basenote-solutions",
    name: "basenotesolutions.com",
    url: "https://www.basenotesolutions.com/private-label",
    stack: "Next.js",
    type: "consultancy",
    description:
      "A guided introduction to creating and launching a private-label fragrance brand.",
    image: screenshot(
      "sites/basenote-solutions",
      "BaseNote Solutions private-label fragrance website",
      "Private-label fragrance website",
    ),
  },
  {
    slug: "riveli-mn",
    featured: true,
    name: "rivelimn.com",
    url: "https://rivelimn.com",
    stack: "Next.js, Payload CMS",
    type: "consultancy",
    description:
      "A website for a brand and growth strategy consultancy.",
    image: screenshot(
      "sites/riveli-mn",
      "Rive and Limn brand and growth strategy website",
      "Rive & Limn website",
    ),
  },
];

export const SKILLS = {
  LANGUAGES: "Python, JavaScript, TypeScript, SQL",
  FRAMEWORKS: "React, Next.js, Flask, Django, FastAPI",
  CLOUD: "AWS, Google Cloud",
  TOOLS: "JIRA, Git, Figma, SAP S/4HANA, Shopify Hydrogen",
  PRODUCT: "Agile, Roadmapping, User Research",
};

export const CAPABILITIES = [
  {
    title: "Software engineering",
    description:
      "Build the interface, API, and operational workflows around a product.",
    tools:
      "TypeScript, JavaScript, Python, React, Next.js, Django, FastAPI, Flask",
    evidence: "ERP and storefront delivery at BaseNote",
    href: "#work-basenote",
  },
  {
    title: "AI & data",
    description:
      "Turn knowledge and model output into features people can use.",
    tools: "RAG, Google Gemini, machine learning, SQL",
    evidence: "See the id8 application workflow",
    href: "#work-id8",
  },
  {
    title: "Delivery & infrastructure",
    description:
      "Connect development to repeatable builds, reviews, and releases.",
    tools: "AWS, Google Cloud, Git, CI/CD, Shopify Hydrogen",
    evidence: "Infrastructure as code and team delivery on SyncMaster",
    href: "#work-syncmaster",
  },
  {
    title: "Product leadership",
    description:
      "Shape the roadmap, grow the team, and keep delivery close to the problem.",
    tools: "Roadmapping, user research, Agile, JIRA, Figma",
    evidence: "Product and engineering leadership at Icon",
    href: "#work-icon",
  },
];
