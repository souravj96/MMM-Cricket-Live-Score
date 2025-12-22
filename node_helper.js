const NodeHelper = require("node_helper");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-CricbuzzLive helper started");
  },

  async getLiveMatches(config) {
    try {
      const response = await fetch(
        "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
        {
          headers: {
            "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
            "x-rapidapi-key": config.apiKey,
            "User-Agent": "MagicMirror/2.0"
          }
        }
      );

      const text = await response.text();
      
      // If API returns HTML, log it
      if (!text.trim().startsWith("{")) {
        console.error("Cricbuzz API returned non-JSON:", text.slice(0, 200));
        return;
      }

      const data = JSON.parse(text);
      this.sendSocketNotification("LIVE_MATCHES", data);
    } catch (error) {
      console.error("Cricbuzz API error:", error);
    }
  },

  async getTeamImage(imageId, config) {
    try {
      const response = await fetch(
        `https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${imageId}/i.jpg`,
        {
          headers: {
            "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
            "x-rapidapi-key": config.apiKey,
            "User-Agent": "MagicMirror/2.0"
          }
        }
      );

      if (response.ok) {
        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        this.sendSocketNotification("TEAM_IMAGE", {
          imageId: imageId,
          image: `data:image/jpeg;base64,${base64Image}`
        });
      }
    } catch (error) {
      console.error("Error fetching team image:", error);
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_LIVE_MATCHES") {
      this.getLiveMatches(payload);
    } else if (notification === "GET_TEAM_IMAGE") {
      this.getTeamImage(payload.imageId, payload.config);
    }
  }
});