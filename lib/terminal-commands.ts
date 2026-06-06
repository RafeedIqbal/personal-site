import { PROFILE, EDUCATION, EXPERIENCE, PROJECTS, SKILLS, WEBSITES } from "./content";
import {
  getTerminalGameDefinition,
  getTerminalGamesListText,
  resolveTerminalGameId,
  type TerminalGameId,
} from "./terminal-games";

export interface TerminalGameAction {
  type: "open-library" | "launch" | "close";
  gameId?: TerminalGameId;
}

export interface CommandResult {
  output: string;
  isHtml?: boolean;
  scrollTarget?: string;
  gameAction?: TerminalGameAction;
}

export const AVAILABLE_COMMANDS = [
  "help",
  "whoami",
  "cat about.txt",
  "cat experience.log",
  "ls projects/",
  "ls -la projects/",
  "ls websites/",
  "cat projects/id8",
  "cat projects/e-predict",
  "cat projects/syncmaster",
  "env",
  "contact --help",
  "resume",
  "open resume",
  "games",
  "play hanoi",
  "play tetris",
  "play spaceinvaders",
  "play tic-tac-toe",
  "open linkedin",
  "open github",
  "close game",
  "clear",
  "ls",
];

// Single source of truth for the help card (rendered in InteractiveTerminal).
export const HELP_COMMANDS: { command: string; description: string }[] = [
  { command: "whoami", description: "display identity" },
  { command: "cat about.txt", description: "education & background" },
  { command: "cat experience.log", description: "work history" },
  { command: "ls projects/", description: "list projects" },
  { command: "ls websites/", description: "list deployed websites" },
  { command: "cat projects/<name>", description: "project details" },
  { command: "env", description: "skills & tools" },
  { command: "contact --help", description: "contact information" },
  { command: "resume", description: "download résumé" },
  { command: "games", description: "open terminal arcade" },
  { command: "play tetris", description: "launch a game" },
  { command: "open linkedin", description: "open LinkedIn" },
  { command: "open github", description: "open GitHub" },
  { command: "clear", description: "clear terminal" },
];

export function runCommand(input: string): CommandResult | null {
  const cmd = input.trim().toLowerCase();

  if (!cmd) return null;

  if (cmd === "games" || cmd === "games --help") {
    return {
      output: getTerminalGamesListText(),
      gameAction: { type: "open-library" },
    };
  }

  if (cmd === "close game" || cmd === "exit game" || cmd === "quit game") {
    return {
      output: "Closing terminal arcade.",
      gameAction: { type: "close" },
    };
  }

  if (cmd.startsWith("play ")) {
    const gameId = resolveTerminalGameId(cmd.slice(5));
    if (gameId) {
      const game = getTerminalGameDefinition(gameId);
      return {
        output: `Launching ${game?.title ?? gameId}...\nClick inside the game panel to engage controls.`,
        gameAction: { type: "launch", gameId },
      };
    }
  }

  const directGameId = resolveTerminalGameId(cmd);
  if (directGameId) {
    const game = getTerminalGameDefinition(directGameId);
    return {
      output: `Launching ${game?.title ?? directGameId}...\nClick inside the game panel to engage controls.`,
      gameAction: { type: "launch", gameId: directGameId },
    };
  }

  if (cmd === "whoami") {
    return {
      output: `${PROFILE.name}
${PROFILE.title}
${PROFILE.tagline}`,
      scrollTarget: "whoami",
    };
  }

  if (cmd === "cat about.txt") {
    return {
      output: `EDUCATION
---------
${EDUCATION.school}
${EDUCATION.degree}
GPA: ${EDUCATION.gpa} | ${EDUCATION.years} | ${EDUCATION.location}

BIO
---
Software engineer and product manager with experience building 0-to-1 consumer applications,
leading cross-functional teams, and shipping production systems.
McMaster B.Eng Software Engineering graduate (${EDUCATION.gpa} GPA).`,
      scrollTarget: "about",
    };
  }

  if (cmd === "cat experience.log" || cmd === "tail -n 3 experience.log") {
    const lines = EXPERIENCE.map(
      (e) =>
        `[${e.date}] ${e.role} @ ${e.company} — ${e.location}\n` +
        e.bullets.map((b) => `  • ${b}`).join("\n")
    ).join("\n\n");
    return { output: lines, scrollTarget: "experience" };
  }

  if (cmd === "ls projects/" || cmd === "ls projects" || cmd === "ls -la projects/") {
    return {
      output: PROJECTS.map(
        (p) => `drwxr-xr-x  rafeed  4096  ${p.name}/   [${p.stack.join(", ")}]`
      ).join("\n"),
      scrollTarget: "projects",
    };
  }

  if (cmd === "ls websites/" || cmd === "ls websites" || cmd === "ls -la websites/") {
    return {
      output: WEBSITES.map(
        (website) =>
          `lrwxrwxrwx  rafeed  ${website.url.length}  ${website.name} -> ${website.url}`
      ).join("\n"),
      scrollTarget: "websites",
    };
  }

  for (const project of PROJECTS) {
    if (
      cmd === `cat projects/${project.slug}` ||
      cmd === `cat projects/${project.slug}.md` ||
      cmd === `cd projects/${project.slug}`
    ) {
      const metadata = [
        `Stack:       ${project.stack.join(", ")}`,
        project.githubUrl ? `GitHub:      ${project.githubUrl}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        output: `${project.name.toUpperCase()}
${"=".repeat(project.name.length)}
${metadata}

${project.description}`,
        scrollTarget: "projects",
      };
    }
  }

  if (cmd === "env" || cmd === "env | grep skills") {
    const lines = Object.entries(SKILLS)
      .map(([k, v]) => `${k}="${v}"`)
      .join("\n");
    return { output: lines, scrollTarget: "env" };
  }

  if (cmd === "contact --help" || cmd === "contact") {
    return {
      output: `Usage: contact [OPTIONS]

Options:
  --email      ${PROFILE.email}
  --linkedin   ${PROFILE.linkedin}
  --github     ${PROFILE.github}
  --resume     ${PROFILE.resumeUrl}`,
      scrollTarget: "contact",
    };
  }

  if (cmd === "resume" || cmd === "open resume" || cmd === "cat resume.pdf") {
    if (typeof window !== "undefined") {
      window.open(PROFILE.resumeUrl, "_blank", "noopener,noreferrer");
    }
    return { output: `Opening ${PROFILE.resumeUrl}...`, scrollTarget: "contact" };
  }

  if (cmd === "open linkedin") {
    if (typeof window !== "undefined") {
      window.open(PROFILE.linkedinUrl, "_blank", "noopener,noreferrer");
    }
    return { output: `Opening ${PROFILE.linkedinUrl}...`, scrollTarget: "contact" };
  }

  if (cmd === "open github") {
    if (typeof window !== "undefined") {
      window.open(PROFILE.githubUrl, "_blank", "noopener,noreferrer");
    }
    return { output: `Opening ${PROFILE.githubUrl}...`, scrollTarget: "contact" };
  }

  if (cmd === "clear") {
    return { output: "__CLEAR__" };
  }

  if (cmd === "ls" || cmd === "ls -la") {
    return {
      output: `drwxr-xr-x  about.txt
drwxr-xr-x  experience.log
drwxr-xr-x  projects/
drwxr-xr-x  websites/
drwxr-xr-x  skills.env
drwxr-xr-x  contact.sh`,
    };
  }

  return {
    output: `zsh: command not found: ${input.trim()}\nType 'help' for available commands.`,
  };
}
