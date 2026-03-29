# Repository Guidelines

## Project Structure & Module Organization
This repository is a Node.js CLI project (ES modules, Node 18+). Keep logic separated by responsibility:
- `github-activity.js`: primary executable entrypoint (`github-activity` bin).
- `src/cli.js`: argument parsing, help text, flow control, exit codes.
- `src/github-api.js`: GitHub API request/timeout/error handling.
- `src/format.js`: event and relative-time formatting for terminal output.
- `test.js`: lightweight test runner using Node built-ins.
- `README.md`: user-facing usage docs.

## Build, Test, and Development Commands
There is no build step; run directly with Node.
- `npm install`: install dependencies (if any are added later).
- `npm start -- <username>`: run the CLI via package script.
- `node github-activity.js octocat --limit 5`: run directly during development.
- `npm test`: execute `test.js` and validate core behavior.

## Coding Style & Naming Conventions
- Use ES module syntax (`import` / `export`), not CommonJS.
- Use 2-space indentation and semicolons (match existing files).
- Prefer `camelCase` for functions/variables and `UPPER_SNAKE_CASE` for constants.
- Use descriptive filenames in `src/` (current pattern: kebab-case, e.g., `github-api.js`).
- Keep CLI behavior deterministic and injectable where practical (for example, `run(argv, dependencies)`).

## Testing Guidelines
- Tests use `node:assert/strict` in `test.js` (no external framework).
- Add focused test functions for parsing, formatting, and error paths.
- Prefer deterministic tests by injecting time/network dependencies.
- Run `npm test` before every commit and ensure output ends with `Passed ... tests.`

## Commit & Pull Request Guidelines
Git history currently favors short, imperative commit messages (for example, `add project URL`, `first commit`). Keep that style:
- One logical change per commit.
- Subject line: concise, imperative, and specific.
- PRs should include:
  - What changed and why.
  - How it was tested (`npm test`, sample CLI command/output).
  - Linked issue/task when applicable.

## Security & Configuration Tips
- Do not hardcode secrets or tokens.
- This CLI targets public GitHub events; handle API errors and rate limits gracefully.
- Keep `User-Agent` and request timeout logic in `src/github-api.js`.
