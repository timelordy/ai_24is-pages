# Task 1 local workflow: compact mid-level audit

## Scope

- `assets/course.json`
- `assets/task-page.js`
- `assets/starters/work-01-discovery-contract/server.mjs`
- `assets/starters/manifest.json`
- `assets/screenshots/lesson-01/project-running-windows.png`

## Overview

Task 1 now describes one coherent artifact: the vanilla JavaScript starter with tickets `101` through `112`. Students clone or download it, work locally in VS Code with GigaCode, store requirements in `REPORT.md`, and make a local Git commit. GitVerse remains only the public source for the starter and the authentication provider for GigaCode.

## Key components and flow

1. `course.json` is the source of lesson wording, success criteria, and screenshot metadata.
2. `task-page.js` renders that data and keeps the sticky table of contents synchronized with the visible section.
3. The starter archive is assembled in the browser from `manifest.json` and the files under `assets/starters/work-01-discovery-contract`.
4. `server.mjs` serves the local starter on `127.0.0.1:4173`. `pathToFileURL()` makes direct execution work on Windows paths.
5. The Playwright screenshot is generated from the running starter, so the visual checkpoint and downloaded code refer to the same UI and ticket data.

## Concepts worth preserving

- A lesson, downloadable starter, published starter repository, and screenshot form one contract. File names, commands, ports, and sample IDs must change together.
- A public repository can distribute a starter without becoming the place where students perform every learning step.
- Silent `git diff --exit-code` success should be explained as a local verification result, not as a remote platform action.
- Cache-busting versions matter on GitHub Pages because updated JSON and modules may otherwise be mixed with stale browser assets.

## Risks and checks

- The downloaded ZIP is generated client-side, so every manifest URL must exist and paths must be unique.
- The server entry-point check is platform-sensitive; Windows execution was verified after switching to `pathToFileURL()`.
- The screenshot is lazy-loaded inside a collapsed lesson step; Playwright opened Part 9 and verified natural dimensions `1280 × 1258`.
- `npm test` passes all 5 starter tests, the app returns HTTP 200, and fresh browser tabs report no console errors.
