# Dev Setup

## Prerequisites

Node.js and npm (any version compatible with Vite 8 / React 19; no `.nvmrc` is pinned in this repo).

## Install

```bash
npm install
```

## Scripts

From `package.json`:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on port `3000` (set in `vite.config.ts`). |
| `npm run build` | Type-checks (`tsc -b`) then builds for production (`vite build`). |
| `npm run lint` | Runs ESLint over the repo. |
| `npm run preview` | Serves the production build locally. |

`.claude/launch.json` also defines a `poker-dev` launch configuration that runs `npm run dev` on port
`3000` — a ready-made entry point for IDEs or agents that read launch configs.

## Tooling

- **Vite 8** via `@vitejs/plugin-react`, plus `@rolldown/plugin-babel` to run the
  [React Compiler](https://react.dev/learn/react-compiler) (`reactCompilerPreset()` in
  `vite.config.ts`). Because of this, don't defensively hand-add `useMemo`/`useCallback` — the compiler
  handles memoization.
- **Tailwind v4** via `@tailwindcss/vite`. Theme tokens (colors, fonts) are defined as CSS custom
  properties in `src/index.css`'s `@theme` block, not in a separate Tailwind config file.
- **TypeScript** project references split across `tsconfig.app.json` (the app) and
  `tsconfig.node.json` (Vite config itself), composed via `tsconfig.json`.

## Conventions observed in this repo

- Functional components only; no class components.
- All state lives in one `useReducer` (`src/engine/useGame.ts`) — no external state library (no Redux,
  Zustand, Context-based store, etc.).
- Tailwind utility classes for styling, using the custom-property theme tokens from `src/index.css`
  rather than Tailwind's default palette.
- Relative imports throughout (`../core/cards`, `./Table`) — no path aliases are configured in
  `tsconfig.app.json`.

## Known gap: no test suite

There are currently no test files anywhere in this repo, and `package.json` defines no test script.
This is a real gap, not an intentional design choice — flagging it here rather than leaving it silent.
Adding a test suite is out of scope for this documentation pass; a natural starting point would be the
pure functions in `src/core/` (`evaluate.ts`, `canonical.ts`, `range.ts`), since they have no React or
DOM dependency and are the most safety-critical (they underlie every verdict the app shows).

## See also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — module structure and state model.
- [DOMAIN.md](./DOMAIN.md) — the poker domain logic these scripts build and lint.
