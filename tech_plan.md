# Technical Plan: rafeed.dev — Terminal Portfolio

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 (already scaffolded) |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 (already installed) |
| Animation | Framer Motion | ^12 |
| Font | JetBrains Mono via `next/font/google` | — |
| Deployment | Vercel (static) | — |

No backend. No database. No auth. Pure static site.

---

## Version-Sensitive Rules

### Tailwind CSS v4
- Config is done via CSS, not `tailwind.config.js`
- Use `@theme inline { ... }` blocks inside `globals.css` to define custom tokens
- Font loading: use `next/font/google` (NOT `@import url(...)` in CSS — Tailwind v4 breaks on that)

### Next.js 16 + React 19
- App Router only — no `pages/` directory
- No `middleware.ts` needed (no auth/routing logic)
- `"use client"` directive required on all interactive components (terminal input, animations)
- `startTransition` callbacks must return `void` — wrap async calls: `() => { void asyncFn() }`

### Framer Motion + React 19
- Use `motion` from `"framer-motion"` (not legacy `m` import)
- `useInView` hook for scroll-triggered reveals

---

## File Structure

```
id8-src/
  app/
    layout.tsx              # Root layout: font, metadata, dark body bg
    page.tsx                # Single page — renders all sections in order
    globals.css             # Tailwind v4 base, CSS custom props
  components/
    TerminalWindow.tsx      # Chrome wrapper (decorative dots, title bar)
    BootSequence.tsx        # Animated load sequence on first render
    CommandBlock.tsx        # Reusable: `$ command` + output reveal
    InteractiveTerminal.tsx # Input prompt at bottom — user can type commands
    Nav.tsx                 # Sticky sidebar with clickable command shortcuts
  sections/
    Hero.tsx                # whoami — name, title, tagline, social links
    About.tsx               # cat about.txt — bio + education
    Experience.tsx          # cat experience.log — work history
    Projects.tsx            # ls projects/ — project cards
    Skills.tsx              # env — skills list
    Contact.tsx             # contact --help — email/LinkedIn/GitHub
  lib/
    terminal-commands.ts    # Command registry for interactive terminal
    content.ts              # All resume data as typed constants
```

---

## Component Design

### TerminalWindow
```tsx
// Wraps each section in a terminal chrome
// Grayscale dots (●●●) in top-left, section title in title bar
// Border: 1px solid #333, bg: #000
```

### CommandBlock
```tsx
// Props: command: string, children: ReactNode, delay?: number
// Renders: `$ command` line with typewriter effect
// Then reveals children (output) via Framer Motion fade+slide
// Triggered when component enters viewport (useInView)
```

### BootSequence
```tsx
// Shown on first load, covers full screen
// Typewriter lines:
//   "Initializing portfolio..."
//   "Loading rafeed.sh..."
//   "Done."
// Fades out, unmounts after ~2s total
```

### InteractiveTerminal
```tsx
// Sticky at bottom of page
// Input: `visitor@rafeed.dev:~$ [cursor]`
// Supported commands: help, whoami, ls, ls projects/,
//   cat about.txt, cat experience.log, cat projects/[name],
//   env, contact --help, clear
// Output printed inline, scrollable history
// Mobile: hidden (terminal UX is keyboard-dependent)
```

### Nav
```tsx
// Desktop: fixed left sidebar listing commands as clickable links
// Clicking scrolls to section + "runs" the command visually
// Mobile: hidden or collapsed into hamburger
```

---

## Content Data (lib/content.ts)

All resume data typed as constants — single source of truth:

```typescript
export const PROFILE = {
  name: "Rafeed Iqbal",
  email: "rafeediqbal@gmail.com",
  phone: "+1 437-256-8457",
  linkedin: "linkedin.com/in/rafeediqbal",
  github: "github.com/RafeedIqbal",
  title: "Software Engineer & Product Manager",
  tagline: "Building products at the intersection of code and strategy.",
}

export const EDUCATION = { ... }
export const EXPERIENCE: Experience[] = [ ... ]
export const PROJECTS: Project[] = [ ... ]
export const SKILLS = { ... }
```

---

## Interactive Terminal Command Map (lib/terminal-commands.ts)

| Input | Output |
|---|---|
| `help` | Lists all available commands |
| `whoami` | Name, title, one-liner |
| `ls` | Lists all sections as "directories" |
| `ls projects/` | Lists id8, e-predict, syncmaster |
| `cat about.txt` | Bio + education block |
| `cat experience.log` | Full experience list |
| `cat projects/id8` | id8 project detail |
| `cat projects/e-predict` | E-Predict detail |
| `cat projects/syncmaster` | SyncMaster detail |
| `env` | Skills as env vars (e.g. `PYTHON=expert`) |
| `contact --help` | Email, LinkedIn, GitHub |
| `clear` | Clears terminal history |
| `open [url]` | Opens LinkedIn/GitHub in new tab |
| unknown | `command not found: [input]` |

---

## Styling System (globals.css tokens)

```css
@import "tailwindcss";

@theme inline {
  --color-bg: #000000;
  --color-fg: #ffffff;
  --color-muted: #888888;
  --color-border: #333333;
  --color-highlight: #ffffff;
  --font-mono: var(--font-jetbrains-mono);
}

body {
  background: #000000;
  color: #ffffff;
  font-family: var(--font-jetbrains-mono), monospace;
  cursor: text;
}

/* Blinking cursor */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.cursor {
  display: inline-block;
  width: 0.6ch;
  height: 1.1em;
  background: #ffffff;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}
```

---

## Font Loading

```typescript
// app/layout.tsx
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>{children}</body>
    </html>
  )
}
```

---

## Animation Strategy (Framer Motion)

- **Boot sequence**: sequential typewriter using `animate` with `onAnimationComplete` chain
- **Section reveals**: `useInView` + `motion.div` with `initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}`
- **Command typewriter**: character-by-character render using `useState` + `useEffect` interval
- **No parallax, no complex transitions** — keep it snappy and terminal-like

---

## Responsive Behavior

| Screen | Layout |
|---|---|
| Desktop (>1024px) | Left nav sidebar + main content + interactive terminal at bottom |
| Tablet (768–1024px) | No sidebar, scrollable sections, interactive terminal visible |
| Mobile (<768px) | Full-width sections, interactive terminal hidden, tap-to-expand sections |

---

## Dependencies to Install

```bash
npm install framer-motion
```

No other new dependencies needed (Tailwind v4 + Next.js 16 already scaffolded).

---

## Vercel Deployment

- No environment variables needed (fully static)
- `next build` produces standard Next.js output (not `output: 'export'` — keep SSG default for Vercel)
- Site name on Vercel: `rafeed-dev` (lowercase, matches project title)
