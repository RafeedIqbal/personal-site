// Small, client-safe profile facts. Everything else lives in ./content.ts.
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
  tagline: "Co-founder and sole engineer at BaseNote. Led Icon Training from its first designs to a subscription app with 3,000 early downloads.",
  availability: "Open to software engineering & product roles",
  workPreference: "Remote or hybrid",
  heroParagraph:
    "I co-founded BaseNote and built the software our perfumers use to develop custom fragrances. Before that, I led product and engineering at Icon Training, where we took a coaching app from Figma to 3,000 downloads in its first few weeks.",
  bio: [
    "At Icon, I joined two developers with a set of mockups. We had to work out what a trainer could offer on day one and what was worth paying for as a subscriber. I hired the team, led the release and wrote the code that helps the coach find an athlete’s training history.",
    "At BaseNote, I can sit down with the people who use what I build. A perfumer needs to know whether a formula can actually be made from the oils on the shelf. That shaped Blend’s design. It looks up inventory and past experiments, and the software checks each quantity before the perfumer sees the draft.",
  ],
};

export const NAV_ITEMS = [
  { id: "whoami", label: "Overview", file: "whoami" },
  { id: "projects", label: "Selected work", file: "projects/" },
  { id: "experience", label: "Experience", file: "experience.log" },
  { id: "websites", label: "Websites", file: "websites/" },
  { id: "env", label: "Skills", file: "skills.env" },
  { id: "about", label: "About", file: "about.txt" },
  { id: "contact", label: "Contact", file: "contact.sh" },
];
