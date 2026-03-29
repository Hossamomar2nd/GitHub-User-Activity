import { fetchUserEvents } from "./github-api.js";
import { renderEvents } from "./format.js";

const DEFAULT_LIMIT = 10;

const HELP_TEXT = `Usage:
  github-activity <username> [options]

Options:
  -l, --limit <number>  Number of events to show (default: 10)
  --json                Print raw events as JSON
  -h, --help            Show help text

Examples:
  github-activity octocat
  github-activity octocat --limit 5
  github-activity octocat --json`;

function toPositiveInteger(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }
  return number;
}

export function parseArgs(argv) {
  let username = "";
  let limit = DEFAULT_LIMIT;
  let json = false;
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--help" || token === "-h") {
      help = true;
      continue;
    }

    if (token === "--json") {
      json = true;
      continue;
    }

    if (token === "--limit" || token === "-l") {
      const nextValue = argv[i + 1];
      const parsedLimit = toPositiveInteger(nextValue);

      if (parsedLimit === null) {
        throw new Error("--limit must be a positive integer.");
      }

      limit = parsedLimit;
      i += 1;
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }

    if (username.length > 0) {
      throw new Error("Only one username can be provided.");
    }

    username = token;
  }

  return { username, limit, json, help };
}

function defaultWriteOut(message) {
  process.stdout.write(`${message}\n`);
}

function defaultWriteErr(message) {
  process.stderr.write(`${message}\n`);
}

export async function run(argv, dependencies = {}) {
  const writeOut = dependencies.writeOut ?? defaultWriteOut;
  const writeErr = dependencies.writeErr ?? defaultWriteErr;
  const fetchEvents = dependencies.fetchEvents ?? fetchUserEvents;
  const now = dependencies.now ?? (() => new Date());

  let parsed;

  try {
    parsed = parseArgs(argv);
  } catch (error) {
    writeErr(`Error: ${error.message}`);
    writeErr(HELP_TEXT);
    return 1;
  }

  if (parsed.help) {
    writeOut(HELP_TEXT);
    return 0;
  }

  if (!parsed.username) {
    writeErr("Error: Please provide a GitHub username.");
    writeErr(HELP_TEXT);
    return 1;
  }

  try {
    const events = await fetchEvents(parsed.username);
    const visibleEvents = events.slice(0, parsed.limit);

    if (parsed.json) {
      writeOut(JSON.stringify(visibleEvents, null, 2));
      return 0;
    }

    writeOut(renderEvents(visibleEvents, parsed.username, parsed.limit, now()));
    return 0;
  } catch (error) {
    writeErr(`Error: ${error.message}`);
    return 1;
  }
}

export { HELP_TEXT };
