# Decision log

## Open questions from the brief

### D-001: Frontend framework and application state

- **Context:** The brief leaves the frontend framework open. The app is a small single-page client that proves the backend works: forms, a paged list, permission-driven navigation and a long-polled result. It is served as static files and must be easy to read and maintain.
- **Options considered:** React with Vite and TypeScript - widely known, builds to static files, but routing and data fetching are separate libraries; Next.js - routing and data fetching built in, but a server runtime and server rendering the app does not need; Vue or Svelte with Vite - smaller, but less widely known; no framework - no dependencies, but routing, state and rendering written by hand. For state: a global store such as Redux or Zustand - one place for everything, but it duplicates what a server-state cache already holds; TanStack Query for server data and a React context for the session.
- **Decision:** React with Vite and strict TypeScript, React Router for routes and permission guards, TanStack Query for all data read from the backend, and a React context for the session (token, current user, `can()`). No global store and no UI kit, only a few small components of our own. The code is organised by feature (auth, profile, users, prompts, llm-model): features never import each other, pages compose them, and ESLint enforces these import rules.
- **Consequences:** The build output is static files served by nginx, so one image fits every environment. Server data has a single source, with caching and invalidation after changes. Each feature can be read on its own. Plain styling looks basic, which the brief accepts.
- **With more time:** Component tests with Testing Library and end-to-end tests against a running backend.

## Additional decisions

### D-002: Toolchain, version pinning and quality checks

- **Context:** The brief leaves open how dependencies are managed and how code quality is checked. Builds must be reproducible, and the checks must give the same result on every machine.
- **Options considered:** Version ranges with a lockfile - installs are pinned, but `npm install` can move direct dependencies; exact versions with a lockfile installed by `npm ci` - every version visible in `package.json`, updates are deliberate. TypeScript 7 - the newest, but typescript-eslint and openapi-typescript do not support it yet; TypeScript 5.9 - supported by every tool in use. A Git hook tool such as husky - checks run automatically, but one more dependency, and hooks can be skipped; a single `npm run check` script.
- **Decision:** Exact versions and the committed lockfile, installed with `npm ci` in the image; Node 24 LTS through `.nvmrc` and `engines`; TypeScript 5.9 in strict mode. ESLint (strict type-checked rules, React hooks rules, import boundaries), Prettier and Vitest run together through `npm run check`, which must pass before every commit.
- **Consequences:** The same commit installs the same packages everywhere, and dependency updates appear as reviewable diffs. Running the checks before a commit is a habit, not enforced by a hook. TypeScript stays one major version behind until the tools support 7.
- **With more time:** A CI pipeline that runs `npm run check` and builds the image on every push, automated dependency updates with a vulnerability scan, and TypeScript 7 once typescript-eslint supports it.

## What I would change with more time
