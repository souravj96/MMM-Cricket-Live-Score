const NodeHelper = require("node_helper");

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
      
      // Handle no content response
      if (response.status === 204) {
        console.log("No live matches (204), checking upcoming matches");
        await this.getUpcomingMatches(config);
        return;
      }

      if (!response.ok) {
        console.error(`Cricbuzz API error: ${response.status} ${response.statusText}`);
        // Try upcoming matches on error
        await this.getUpcomingMatches(config);
        return;
      }

      const text = await response.text();
      
      // Handle empty or null body
      if (!text || text.trim() === "") {
        console.log("No live matches (empty response), checking upcoming matches");
        await this.getUpcomingMatches(config);
        return;
      }
      
      // If API returns HTML, log it
      if (!text.trim().startsWith("{")) {
        console.error("Cricbuzz API returned non-JSON:", text.slice(0, 200));
        await this.getUpcomingMatches(config);
        return;
      }

      const data = JSON.parse(text);
      
      // Check if data is null or has no matches
      if (!data || !data.typeMatches || data.typeMatches.length === 0) {
        console.log("No live matches (no matches in response), checking upcoming matches");
        await this.getUpcomingMatches(config);
        return;
      }

      console.log("Found live matches, displaying them");
      this.sendSocketNotification("LIVE_MATCHES", data);
    } catch (error) {
      console.error("Cricbuzz API error:", error.message || error);
      // Try upcoming matches on error
      await this.getUpcomingMatches(config);
    }
  },

  async getUpcomingMatches(config) {
    try {
      const response = await fetch(
        "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming",
        {
          headers: {
            "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
            "x-rapidapi-key": config.apiKey,
            "User-Agent": "MagicMirror/2.0"
          }
        }
      );
      
      // Handle no content response
      if (response.status === 204) {
        console.log("No upcoming matches (204), hiding module");
        this.sendSocketNotification("NO_MATCHES", null);
        return;
      }

      if (!response.ok) {
        console.error(`Cricbuzz upcoming API error: ${response.status} ${response.statusText}`);
        this.sendSocketNotification("NO_MATCHES", null);
        return;
      }

      const text = await response.text();
      
      // Handle empty or null body
      if (!text || text.trim() === "") {
        console.log("No upcoming matches (empty response), hiding module");
        this.sendSocketNotification("NO_MATCHES", null);
        return;
      }
      
      // If API returns HTML, log it
      if (!text.trim().startsWith("{")) {
        console.error("Cricbuzz upcoming API returned non-JSON:", text.slice(0, 200));
        this.sendSocketNotification("NO_MATCHES", null);
        return;
      }

      const data = JSON.parse(text);
      
      // Check if data is null or has no matches
      if (!data || !data.typeMatches || data.typeMatches.length === 0) {
        console.log("No upcoming matches (no matches in response), hiding module");
        this.sendSocketNotification("NO_MATCHES", null);
        return;
      }

      console.log("Found upcoming matches, displaying them");
      this.sendSocketNotification("LIVE_MATCHES", data);
    } catch (error) {
      console.error("Cricbuzz upcoming API error:", error.message || error);
      this.sendSocketNotification("NO_MATCHES", null);
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
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        this.sendSocketNotification("TEAM_IMAGE", {
          imageId: imageId,
          image: `data:image/jpeg;base64,${base64Image}`
        });
      } else {
        console.error(`Failed to fetch team image ${imageId}: ${response.status}`);
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