# PRD: rafeed.dev — Personal Portfolio

## Overview
A single-page personal portfolio for **Rafeed Iqbal** targeting PM and SWE roles. The site mimics a terminal/CLI environment — black background, monospace font, command-prompt metaphors — making it visually distinctive and memorable for hiring managers.

## Goals
- Present Rafeed's experience, projects, and skills professionally
- Differentiate through a unique terminal UI aesthetic (strictly black and white)
- Be fast, static, and deployable on Vercel with zero backend

## Sections (rendered as terminal "commands")

| Command | Content |
|---|---|
| `$ whoami` | Hero / intro: name, title, one-liner, links |
| `$ cat about.txt` | Short bio, education (McMaster, B.Eng Software Engineering, 3.4 GPA, 2020-2025) |
| `$ cat experience.log` | 3 roles: Icon Train Smarter (PM), Sanofi Pasteur (Analyst), Eastern Bank (BI Intern) |
| `$ ls projects/` | 3 project cards: id8, E-Predict, SyncMaster |
| `$ env` | Skills: Python, JavaScript, SQL, React, Flask, Django, Next.js, AWS, JIRA |
| `$ contact --help` | Email, LinkedIn, GitHub links |

## Interactive Features
- **Boot sequence**: typing animation on load (`Initializing portfolio...`)
- **Interactive terminal**: users can type commands (`help`, `ls`, `whoami`, `cat about.txt`, etc.) and get real responses
- **Typewriter effect** on section reveals
- **Blinking cursor** throughout
- Navigation via clickable commands in a sticky sidebar or command history

## Design Language
- **Background**: `#000000`
- **Text**: `#ffffff`
- **Accent**: white only — strictly no color
- **Font**: JetBrains Mono (Google Fonts)
- **UI chrome**: macOS-style terminal window (decorative dots in grayscale)
- **Borders/dividers**: `1px solid #333`

## Content (from resume)

### Contact
- rafeediqbal@gmail.com
- +1 437-256-8457
- linkedin.com/in/rafeediqbal
- github.com/RafeedIqbal

### Education
- McMaster University, B.Eng. Software Engineering, 3.4/4.0 GPA, 2020–2025, Hamilton, Canada

### Experience
1. **Icon Train Smarter Ltd** — Product Manager (July 2025–Present, UK Remote)
2. **Sanofi Pasteur** — Co-op Analyst, SAP S4/HANA Key-User (Sep 2023–Aug 2024, Toronto)
3. **Eastern Bank Limited** — Intern, Business Intelligence (May 2023–Aug 2023, Dhaka)

### Projects
1. **id8** (Next.js, FastAPI) — AI platform that transforms natural language prompts into production-deployed full-stack web apps. 10-node state machine pipeline, Next.js 15, FastAPI, PostgreSQL, Google Gemini API.
2. **E-Predict** (Next.js, Flask) — AI-driven energy consumption forecasting with ML models, anomaly detection visualizations.
3. **SyncMaster** (Next.js, AWS) — Web app for City of Hamilton Water Division to digitize workflows. Next.js, TypeScript, DynamoDB, Cognito, Lambda.

### Skills
- Languages: Python, JavaScript, SQL
- Frameworks & Tools: React, Flask, Django, Next.js, AWS, JIRA
- Live sites: id8-landing.vercel.app, www.icontraining.app

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Framer Motion (typewriter + reveal animations)
- Static export — no backend, no database, no auth

## Non-Goals
- No blog, no CMS, no contact form backend, no color
