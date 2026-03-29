# GitHub Activity CLI

`github-activity-cli` is a command line tool that fetches and displays the recent public activity of a GitHub user through the GitHub Events API.

## Requirements

- Node.js `18+`

## Install

```bash
git clone https://github.com/your-username/github-activity-cli.git
cd github-activity-cli
npm install
```

## Usage

```bash
npm start -- <username>
```

Examples:

```bash
npm start -- octocat
npm start -- octocat --limit 5
npm start -- octocat --json
```

You can also run it directly:

```bash
node github-activity.js octocat --limit 3
```

## Options

- `-l, --limit <number>`: limit displayed events (default `10`)
- `--json`: print raw event JSON
- `-h, --help`: show help

## Features

- Improved event formatting for common GitHub event types.
- Better error handling for invalid usernames, API failures, and malformed responses.
- JSON output mode for scripting and automation.
- Automated tests for CLI argument parsing and output formatting.

## Test

```bash
npm test
```

## Project Link

- [roadmap.sh GitHub User Activity](https://roadmap.sh/projects/github-user-activity)
