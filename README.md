# personal-site

Terminal-style personal portfolio built with Next.js 16, React 19, Tailwind CSS v4, and Framer Motion. Near-black with a green accent; single content column with a file-tree sidebar, and an interactive terminal overlay (press `` ` ``) that mirrors the page content — games included.

## Development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: start the local dev server at `http://localhost:3000`
- `npm run build`: create the production build
- `npm run start`: serve the production build locally
- `npm run lint`: run ESLint

## Project Structure

- `app/`: App Router entry points, layout, and global CSS
- `components/`: reusable UI and terminal game components
- `sections/`: page-level content blocks
- `lib/`: typed content and terminal command helpers
- `public/`: static assets (including `Rafeed_Iqbal_Resume.pdf`, the downloadable résumé)

The original résumé source files live at the repo root in `Resume/`.
