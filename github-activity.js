const https = require("https");

const username = process.argv[2];

if (!username) {
  console.error("Please provide a GitHub username.");
  process.exit(1);
}

const API_URL = `https://api.github.com/users/${username}/events`;

const options = {
  headers: {
    "User-Agent": "github-activity-cli",
  },
};

https
  .get(API_URL, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const events = JSON.parse(data);

        if (res.statusCode === 200) {
          console.log(`Recent activity for user: ${username}`);
          events.slice(0, 10).forEach((event) => {
            let action = "";
            switch (event.type) {
              case "PushEvent":
                action = `Pushed ${event.payload.commits.length} commits to ${event.repo.name}`;
                break;
              case "IssuesEvent":
                action = `${event.payload.action} an issue in ${event.repo.name}`;
                break;
              case "WatchEvent":
                action = `Starred ${event.repo.name}`;
                break;
              default:
                action = `Performed ${event.type} on ${event.repo.name}`;
            }
            console.log(`- ${action}`);
          });
        } else {
          console.error(`Error: ${events.message || "Failed to fetch data"}`);
        }
      } catch (err) {
        console.error("Error parsing response:", err.message);
      }
    });
  })
  .on("error", (err) => {
    console.error("Request failed:", err.message);
  });
