export const PROFILE = {
  name: "Rafeed Iqbal",
  email: "rafeediqbal@gmail.com",
  linkedin: "linkedin.com/in/rafeediqbal",
  linkedinUrl: "https://linkedin.com/in/rafeediqbal",
  github: "github.com/RafeedIqbal",
  githubUrl: "https://github.com/RafeedIqbal",
  resumeUrl: "/Rafeed_Iqbal_Resume.pdf",
  title: "Software Engineer & Product Manager",
  tagline: "Building products at the intersection of code and strategy.",
};

export const EDUCATION = {
  school: "McMaster University",
  degree: "B.Eng. Software Engineering",
  gpa: "3.4/4.0",
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
    date: "2025-07–Present",
    role: "Product Manager",
    company: "Icon Train Smarter Ltd",
    location: "United Kingdom (Remote)",
    bullets: [
      "Spearheaded 0-to-1 development of a scalable mobile fitness application, directing frontend and backend teams through the full product lifecycle.",
      "Established Agile workflows, translating complex product requirements into actionable tasks and tracking deliverables to consistently meet critical release deadlines.",
      "Managed full-cycle recruitment and operations for a team of full-time employees and contractors.",
    ],
  },
  {
    date: "2023-09–2024-08",
    role: "Co-op, Analyst (SAP S4/HANA Key-User)",
    company: "Sanofi Pasteur",
    location: "Toronto, Canada",
    bullets: [
      "Led a process improvement initiative that eliminated a backlog of 255 critical system errors, achieving a 100% reduction.",
      "Conducted root cause analysis to design QA routines and implement new business processes, preventing recurrence of critical errors.",
      "Developed an inventory tracking and forecasting tool, reducing overstocking and shortages.",
    ],
  },
  {
    date: "2023-05–2023-08",
    role: "Intern, Business Intelligence",
    company: "Eastern Bank Limited",
    location: "Dhaka, Bangladesh",
    bullets: [
      "Spearheaded migration of 1800+ reports to new BI software, optimizing the reporting process and improving data accessibility.",
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
    stack: ["Next.js", "FastAPI", "PostgreSQL"],
    description:
      "AI-powered platform that transforms natural language prompts into production-deployed full-stack web applications. Orchestrates a 10-node state machine pipeline handling requirements generation, code generation, security scanning, and automated deployment to Vercel.",
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
    stack: ["Next.js", "AWS", "TypeScript"],
    description:
      "Web app for the City of Hamilton Water Division to digitize workflows, improving documentation management and contractor efficiency. Built with Next.js, TypeScript, DynamoDB, Cognito, and Lambda.",
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
  LANGUAGES: "Python, JavaScript, SQL",
  FRAMEWORKS: "React, Next.js, Flask, Django",
  CLOUD: "AWS (DynamoDB, Cognito, Lambda)",
  TOOLS: "JIRA, Git, Figma, SAP S4/HANA",
  PRODUCT: "Agile, Roadmapping, User Research",
};
