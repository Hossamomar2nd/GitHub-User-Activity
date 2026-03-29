import assert from "node:assert/strict";

import { HELP_TEXT, parseArgs, run } from "./src/cli.js";
import { formatEvent, formatRelativeTime, renderEvents } from "./src/format.js";

function testParseArgs() {
  const parsed = parseArgs(["octocat", "--limit", "5", "--json"]);
  assert.deepEqual(parsed, {
    username: "octocat",
    limit: 5,
    json: true,
    help: false,
  });
}

function testRelativeTimeInvalidDate() {
  assert.equal(formatRelativeTime("bad-value"), "unknown time");
}

function testFormatPushEvent() {
  const event = {
    type: "PushEvent",
    created_at: "2026-03-29T19:00:00.000Z",
    repo: { name: "owner/repo" },
    payload: { commits: [{}, {}] },
  };

  const line = formatEvent(event, new Date("2026-03-29T19:05:00.000Z"));
  assert.equal(line, "Pushed 2 commits to owner/repo (5 minutes ago)");
}

function testRenderEvents() {
  const events = [
    {
      type: "WatchEvent",
      created_at: "2026-03-29T19:00:00.000Z",
      repo: { name: "owner/repo-a" },
      payload: {},
    },
    {
      type: "ForkEvent",
      created_at: "2026-03-29T18:00:00.000Z",
      repo: { name: "owner/repo-b" },
      payload: {},
    },
  ];

  const output = renderEvents(events, "octocat", 1, new Date("2026-03-29T19:02:00.000Z"));
  assert.match(output, /Recent activity for "octocat" \(showing 1\):/);
  assert.match(output, /- Starred owner\/repo-a/);
  assert.doesNotMatch(output, /owner\/repo-b/);
}

async function testRunHelp() {
  const out = [];
  const err = [];

  const code = await run(["--help"], {
    writeOut: (message) => out.push(message),
    writeErr: (message) => err.push(message),
  });

  assert.equal(code, 0);
  assert.equal(err.length, 0);
  assert.equal(out[0], HELP_TEXT);
}

async function testRunMissingUsername() {
  const out = [];
  const err = [];

  const code = await run([], {
    writeOut: (message) => out.push(message),
    writeErr: (message) => err.push(message),
  });

  assert.equal(code, 1);
  assert.equal(out.length, 0);
  assert.match(err[0], /Please provide a GitHub username/);
}

async function testRunFormattedOutput() {
  const out = [];
  const err = [];

  const code = await run(["octocat", "-l", "1"], {
    writeOut: (message) => out.push(message),
    writeErr: (message) => err.push(message),
    fetchEvents: async () => [
      {
        type: "WatchEvent",
        created_at: "2026-03-29T19:00:00.000Z",
        repo: { name: "owner/repo" },
        payload: {},
      },
    ],
    now: () => new Date("2026-03-29T19:01:00.000Z"),
  });

  assert.equal(code, 0);
  assert.equal(err.length, 0);
  assert.match(out[0], /Recent activity for "octocat"/);
  assert.match(out[0], /Starred owner\/repo/);
}

async function runAllTests() {
  const tests = [
    testParseArgs,
    testRelativeTimeInvalidDate,
    testFormatPushEvent,
    testRenderEvents,
    testRunHelp,
    testRunMissingUsername,
    testRunFormattedOutput,
  ];

  for (const testFn of tests) {
    await testFn();
  }

  console.log(`Passed ${tests.length} tests.`);
}

runAllTests().catch((error) => {
  console.error(`Test failed: ${error.message}`);
  process.exitCode = 1;
});
