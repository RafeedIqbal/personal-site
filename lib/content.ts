export const PROFILE = {
  name: "Rafeed Iqbal",
  email: "rafeediqbal@gmail.com",
  linkedin: "linkedin.com/in/rafeediqbal",
  linkedinUrl: "https://linkedin.com/in/rafeediqbal",
  github: "github.com/RafeedIqbal",
  githubUrl: "https://github.com/RafeedIqbal",
  resumeUrl: "/Rafeed_Iqbal_Resume.pdf",
  title: "Software Engineer & Product Leader",
  tagline: "Building products at the intersection of code and strategy.",
  availability: "open to swe & pm roles — remote or hybrid",
  heroParagraph:
    "Building products at the intersection of code and strategy — from RAG pipelines and SaaS platforms to roadmaps and teams.",
};

export const EDUCATION = {
  school: "McMaster University",
  degree: "B.Eng. Software Engineering",
  years: "2020–2025",
  location: "Hamilton, Canada",
};

export interface Experience {
  date: string;
  role: string;
  company: string;
  location: string;
  bullets: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    date: "2026-01–Present",
    role: "Founding Engineer",
    company: "BaseNote Solutions LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Sole engineer designing and building a multi-tenant SaaS ERP platform for perfumers, spanning inventory management, production workflows, and client storefronts end to end.",
      "Built Blend Engine and Alchemy Engine, RAG-based AI assistants that recommend perfume-oil blends and fragrance-chemical formulations by querying a proprietary knowledge base of in-house chemists' experimental data.",
      "Delivering the pilot Blend Engine application for the company's first licensed client, owning architecture, implementation, and rollout.",
      "Launched a custom Shopify Hydrogen storefront for a white-label perfume client, integrating it with the company's production and fulfilment services.",
    ],
  },
  {
    date: "2025-06–Present",
    role: "Head of Product and Engineering",
    company: "Icon Train Smarter LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Own product and engineering for Icon Training, an AI-powered fitness app where trainers and athletes create AI avatars of themselves that users subscribe to for coaching; led the product from initial MVP to production-ready launch.",
      "Direct frontend and backend teams through Agile sprint cycles as the hub between business goals and technical execution, setting product direction and making architecture and implementation decisions with developers.",
      "Grew the team from 2 to 8 employees, owning full-cycle recruitment from job ad through interviews to contract signing, alongside payroll and day-to-day operations.",
      "Contribute hands-on to delivery by implementing AI-related features and building the company website (icontraining.app).",
    ],
  },
  {
    date: "2023-09–2024-08",
    role: "SAP Analyst, S/4HANA Key User (Co-op)",
    company: "Sanofi Pasteur",
    location: "Toronto, Canada",
    bullets: [
      "Eliminated a growing backlog of 255 S/4HANA–EWM inter-system interface errors, driving it to 0 and cutting average resolution time to under 1 day, through root-cause analysis with AMS and functional experts across supply chain and manufacturing.",
      "Authored documentation for each error class covering cause, prevention, and resolution steps, enabling recurring errors that previously blocked production to be prevented or resolved without escalation.",
      "Resolved a long-running production blocker — inventory stuck in manual stock movements after QA inspection — by tracing it in staging to incorrect storage-temperature settings in bin configuration.",
    ],
  },
  {
    date: "2023-05–2023-08",
    role: "IT Intern",
    company: "Eastern Bank PLC",
    location: "Dhaka, Bangladesh",
    bullets: [
      "Led the Business Intelligence team in reports migrated during a 1,800-report migration from SAP BusinessObjects to a new Oracle ERP, and created processes that streamlined the team's migration workflow.",
      "Contributed to development, product direction, and sprint breakdowns for EBL's new mobile banking app, working alongside app developers and project managers in a rotational program.",
    ],
  },
];

export interface Project {
  slug: string;
  name: string;
  stack: string[];
  description: string;
  githubUrl?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: "id8",
    name: "id8",
    stack: ["Python", "FastAPI", "Next.js", "Google Gemini", "Google Cloud"],
    description:
      "AI-powered application generator that turns natural-language prompts into production-deployed web apps through a 10-stage orchestration pipeline (PRD → design → code → security scan → PR → deploy). Idempotent, resumable state machine built on FastAPI and async SQLAlchemy/PostgreSQL, integrating Google Gemini with the GitHub, Vercel, and Supabase APIs to automate PR creation and deployment.",
    githubUrl: "https://github.com/RafeedIqbal/id8",
  },
  {
    slug: "e-predict",
    name: "e-predict",
    stack: ["Next.js", "Flask", "ML"],
    description:
      "AI-driven energy consumption forecasting tool using machine learning models. Flask backend for data processing and model deployment; Next.js frontend with interactive visualizations for anomaly detection.",
    githubUrl: "https://github.com/RafeedIqbal/E-Predict",
  },
  {
    slug: "syncmaster",
    name: "syncmaster",
    stack: ["TypeScript", "Python", "AWS"],
    description:
      "Documentation management system for the City of Hamilton's PMATS, built by a 5-person capstone team. TypeScript frontend and Python backend with AWS infrastructure provisioned as code and scripted CI/CD pipelines; 1,200+ commits under real contribution, code-review, and testing standards.",
    githubUrl: "https://github.com/RafeedIqbal/SyncMaster",
  },
];

export interface Website {
  slug: string;
  name: string;
  url: string;
  stack: string;
  type: string;
}

export const WEBSITES: Website[] = [
  {
    slug: "rafeed-dev",
    name: "rafeed.dev",
    url: "https://rafeed.dev",
    stack: "Next.js",
    type: "portfolio",
  },
  {
    slug: "icon-training",
    name: "icontraining.app",
    url: "https://icontraining.app",
    stack: "Next.js",
    type: "product",
  },
  {
    slug: "alpac-london",
    name: "alpaclondon.com",
    url: "https://alpaclondon.com/",
    stack: "Shopify Hydrogen",
    type: "e-commerce",
  },
  {
    slug: "arizmi-labs",
    name: "arizmilabs.com",
    url: "https://www.arizmilabs.com/",
    stack: "Next.js",
    type: "consultancy",
  },
  {
    slug: "basenote-solutions",
    name: "basenotesolutions.com",
    url: "https://www.basenotesolutions.com/",
    stack: "Next.js",
    type: "consultancy",
  },
  {
    slug: "riveli-mn",
    name: "rivelimn.com",
    url: "https://rivelimn.com",
    stack: "Next.js, Payload CMS",
    type: "consultancy",
  },
];

export const SKILLS = {
  LANGUAGES: "Python, JavaScript, TypeScript, SQL",
  FRAMEWORKS: "React, Next.js, Flask, Django, FastAPI",
  CLOUD: "AWS, Google Cloud",
  TOOLS: "JIRA, Git, Figma, SAP S/4HANA, Shopify Hydrogen",
  PRODUCT: "Agile, Roadmapping, User Research",
};
