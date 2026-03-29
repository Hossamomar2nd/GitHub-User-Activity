import https from "node:https";

const API_ROOT = "https://api.github.com/users";
const USER_AGENT = "github-activity-cli/2.0.0";
const REQUEST_TIMEOUT_MS = 10000;

function getErrorMessage(statusCode, body) {
  if (statusCode === 404) {
    return "User not found.";
  }

  if (statusCode === 403) {
    return "Request forbidden or API rate limit exceeded.";
  }

  if (typeof body?.message === "string" && body.message.trim().length > 0) {
    return body.message;
  }

  return `GitHub API returned HTTP ${statusCode}.`;
}

function requestEvents(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/vnd.github+json",
        },
      },
      (res) => {
        let rawData = "";

        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => {
          const statusCode = res.statusCode ?? 500;
          let parsedBody;

          try {
            parsedBody = rawData.length > 0 ? JSON.parse(rawData) : null;
          } catch {
            reject(new Error("Failed to parse response from GitHub API."));
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(getErrorMessage(statusCode, parsedBody)));
            return;
          }

          if (!Array.isArray(parsedBody)) {
            reject(new Error("Unexpected GitHub API response shape."));
            return;
          }

          resolve(parsedBody);
        });
      },
    );

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error("Request timed out."));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

export async function fetchUserEvents(username) {
  const normalized = username.trim();
  const url = `${API_ROOT}/${encodeURIComponent(normalized)}/events`;
  return requestEvents(url);
}
