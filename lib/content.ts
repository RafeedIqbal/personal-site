export const PROFILE = {
  name: "Rafeed Iqbal",
  siteUrl: "https://www.rafeed.dev",
  email: "rafeediqbal@gmail.com",
  linkedin: "linkedin.com/in/rafeediqbal",
  linkedinUrl: "https://linkedin.com/in/rafeediqbal",
  github: "github.com/RafeedIqbal",
  githubUrl: "https://github.com/RafeedIqbal",
  resumeUrl: "/Rafeed_Iqbal_Resume.pdf",
  title: "Software Engineer & Product Leader",
  tagline: "Building products at the intersection of code and strategy.",
  availability: "Open to software engineering & product roles",
  workPreference: "Remote or hybrid",
  heroParagraph:
    "I build software and lead the product work around it. From AI assistants and operational platforms to the teams that bring them to life.",
  bio: "I’m a software engineer and product leader who enjoys working across the whole product: understanding the problem, designing the system, and getting it into people’s hands. Today, that means building fragrance technology at BaseNote and leading product and engineering at Icon Training.",
};

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
    date: "Jan 2026 – Present",
    impact: "From architecture to rollout",
    role: "Founding Engineer",
    company: "BaseNote Solutions LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Sole engineer building a multi-tenant ERP for perfumers, connecting inventory, production, and client storefronts.",
      "Built Blend Engine and Alchemy Engine: RAG assistants grounded in the in-house chemists’ experimental data.",
      "Own architecture, implementation, and pilot rollout for the first licensed client; launched a Shopify Hydrogen storefront connected to production and fulfilment.",
    ],
  },
  {
    date: "Jun 2025 – Present",
    impact: "Grew the team from 2 to 8",
    role: "Head of Product and Engineering",
    company: "Icon Train Smarter LTD",
    location: "United Kingdom (Remote)",
    bullets: [
      "Led an AI fitness coaching product from MVP to production-ready launch, connecting product direction with frontend and backend delivery.",
      "Grew the team from 2 to 8, owning recruitment, sprint planning, and day-to-day operations.",
      "Contribute directly to AI features and the company website, alongside architecture and implementation decisions.",
    ],
  },
  {
    date: "Sep 2023 – Aug 2024",
    impact: "255 interface errors resolved",
    role: "SAP Analyst, S/4HANA Key User (Co-op)",
    company: "Sanofi Pasteur",
    location: "Toronto, Canada",
    bullets: [
      "Reduced a backlog of 255 S/4HANA–EWM interface errors to zero and brought average resolution time below one day.",
      "Documented causes, prevention, and fixes so recurring production issues could be handled without escalation.",
      "Traced a persistent stock-movement blocker to incorrect storage-temperature settings and resolved it with functional experts.",
    ],
  },
  {
    date: "May 2023 – Aug 2023",
    impact: "Enterprise reporting & mobile banking",
    role: "IT Intern",
    company: "Eastern Bank PLC",
    location: "Dhaka, Bangladesh",
    bullets: [
      "Led the BI team in reports migrated during a 1,800-report move from SAP BusinessObjects to Oracle ERP, and improved the migration workflow.",
      "Contributed to development, product direction, and sprint planning for the bank’s new mobile app.",
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
    featured: true,
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
    stack: ["Multi-tenant SaaS", "RAG", "Shopify Hydrogen"],
    description:
      "Connecting fragrance creation with the systems that turn it into a product: AI assistants, inventory, production, and storefronts.",
    contribution: "Founding engineer · Architecture through rollout",
    problem:
      "Perfumers need their formulation knowledge, inventory, production workflows, and customer experience to work together.",
    approach:
      "Build the ERP and storefronts as one connected platform, with Blend Engine and Alchemy Engine using retrieval to ground recommendations in the chemists’ experimental data.",
    result:
      "End-to-end ownership of the platform and first licensed-client pilot, alongside a launched Shopify Hydrogen storefront integrated with production and fulfilment.",
    websiteUrl: "https://www.basenotesolutions.com/private-label",
    image: screenshot(
      "sites/basenote-solutions",
      "BaseNote Solutions private-label fragrance website",
      "Private-label fragrance website",
    ),
  },
  {
    slug: "icon",
    name: "Icon Training",
    category: "AI fitness coaching",
    featured: true,
    stack: ["AI features", "Product strategy", "Next.js"],
    description:
      "Helping trainers and athletes scale their coaching through AI avatars, while building the team and product behind the experience.",
    contribution: "Head of Product and Engineering",
    problem:
      "Taking an AI coaching app beyond its MVP required product direction, coordinated engineering, and a team that could deliver it.",
    approach:
      "Connect business goals to sprint planning and architecture decisions. Recruit across product and engineering, and contribute directly to AI features and the website.",
    result:
      "Led the product to a production-ready launch and grew the team from 2 to 8 employees.",
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
    name: "arizmilabs.com",
    url: "https://www.arizmilabs.com/",
    stack: "Next.js",
    type: "consultancy",
    description:
      "A digital home for a team that designs and builds new products.",
    image: screenshot(
      "sites/arizmi-labs",
      "Arizmi Labs website presenting its product development services",
      "Consultancy website",
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
    name: "rivelimn.com",
    url: "https://rivelimn.com",
    stack: "Next.js, Payload CMS",
    type: "consultancy",
    description:
      "Brand, customer experience, and growth strategy in a focused web experience.",
    image: screenshot(
      "sites/riveli-mn",
      "Rive and Limn brand and growth strategy website",
      "Consultancy website",
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
    evidence: "Fragrance assistants, id8, and energy forecasting",
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

export const NAV_ITEMS = [
  { id: "whoami", label: "Overview", file: "whoami" },
  { id: "projects", label: "Selected work", file: "projects/" },
  { id: "experience", label: "Experience", file: "experience.log" },
  { id: "websites", label: "Websites", file: "websites/" },
  { id: "env", label: "Skills", file: "skills.env" },
  { id: "about", label: "About", file: "about.txt" },
  { id: "contact", label: "Contact", file: "contact.sh" },
];
