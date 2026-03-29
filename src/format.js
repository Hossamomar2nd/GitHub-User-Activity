function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatRelativeTime(timestamp, now = new Date()) {
  const eventTime = new Date(timestamp);
  if (Number.isNaN(eventTime.getTime())) {
    return "unknown time";
  }

  const deltaSeconds = Math.max(
    0,
    Math.floor((now.getTime() - eventTime.getTime()) / 1000),
  );

  if (deltaSeconds < 60) {
    return "just now";
  }

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [label, value] of units) {
    const amount = Math.floor(deltaSeconds / value);
    if (amount > 0) {
      return `${amount} ${amount === 1 ? label : `${label}s`} ago`;
    }
  }

  return "just now";
}

export function formatEvent(event, now = new Date()) {
  const repoName = event?.repo?.name ?? "unknown repository";
  const eventType = event?.type ?? "UnknownEvent";
  const action = event?.payload?.action;

  let description;

  switch (eventType) {
    case "PushEvent": {
      const commitCount = event?.payload?.commits?.length ?? 0;
      description = `Pushed ${pluralize(commitCount, "commit")} to ${repoName}`;
      break;
    }
    case "IssuesEvent":
      description = `${action ?? "Updated"} an issue in ${repoName}`;
      break;
    case "IssueCommentEvent":
      description = `${action ?? "Updated"} an issue comment in ${repoName}`;
      break;
    case "PullRequestEvent":
      description = `${action ?? "Updated"} a pull request in ${repoName}`;
      break;
    case "WatchEvent":
      description = `Starred ${repoName}`;
      break;
    case "ForkEvent":
      description = `Forked ${repoName}`;
      break;
    case "CreateEvent":
      description = `Created ${event?.payload?.ref_type ?? "resource"} in ${repoName}`;
      break;
    case "DeleteEvent":
      description = `Deleted ${event?.payload?.ref_type ?? "resource"} in ${repoName}`;
      break;
    case "ReleaseEvent":
      description = `${action ?? "Updated"} a release in ${repoName}`;
      break;
    default:
      description = `Performed ${eventType} in ${repoName}`;
      break;
  }

  return `${description} (${formatRelativeTime(event?.created_at, now)})`;
}

export function renderEvents(events, username, limit, now = new Date()) {
  if (events.length === 0) {
    return `No recent public activity found for "${username}".`;
  }

  const lines = [`Recent activity for "${username}" (showing ${limit}):`];
  for (const event of events.slice(0, limit)) {
    lines.push(`- ${formatEvent(event, now)}`);
  }

  return lines.join("\n");
}
