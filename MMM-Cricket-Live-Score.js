Module.register("MMM-Cricket-Live-Score", {
  defaults: {
    apiKey: "",          // RapidAPI key
    updateInterval: 60 * 1000 // 1 minute
  },

  start() {
    console.log("MMM-Cricket-Live-Score module started");
    this.matches = [];
    this.teamImages = {};
    this.sendSocketNotification("GET_LIVE_MATCHES", this.config);

    setInterval(() => {
      this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
    }, this.config.updateInterval);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "LIVE_MATCHES") {
      this.matches = this.parseMatches(payload);
      this.updateDom();
      
      // Request images for teams
      this.matches.forEach(match => {
        if (match.team1ImageId && !this.teamImages[match.team1ImageId]) {
          this.sendSocketNotification("GET_TEAM_IMAGE", {
            imageId: match.team1ImageId,
            config: this.config
          });
        }
        if (match.team2ImageId && !this.teamImages[match.team2ImageId]) {
          this.sendSocketNotification("GET_TEAM_IMAGE", {
            imageId: match.team2ImageId,
            config: this.config
          });
        }
      });
    } else if (notification === "TEAM_IMAGE") {
      this.teamImages[payload.imageId] = payload.image;
      this.updateDom();
    }
  },

  parseMatches(data) {
    const matches = [];

    if (!data.typeMatches) return matches;

    data.typeMatches.forEach(type => {
      type.seriesMatches?.forEach(series => {
        series.seriesAdWrapper?.matches?.forEach(match => {
          const info = match.matchInfo;
          const score = match.matchScore;

          matches.push({
            title: info.seriesName,
            status: info.status,
            score1: score?.team1Score?.inngs1,
            score2: score?.team2Score?.inngs1,
            team1: info.team1,
            team2: info.team2,
            team1ImageId: info.team1?.imageId,
            team2ImageId: info.team2?.imageId
          });
        });
      });
    });

    return matches;
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "font-family: 'Roboto', sans-serif;";

    if (!this.matches.length) {
      wrapper.innerHTML = "<div style='text-align: center; padding: 10px; opacity: 0.7; font-size: 12px;'>Loading live matches...</div>";
      return wrapper;
    }

    this.matches.forEach(match => {
      const matchDiv = document.createElement("div");
      matchDiv.style.cssText = `
        background: rgba(0, 0, 0, 0.4);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        border-left: 3px solid #4CAF50;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      `;

      const team1Image = match.team1ImageId && this.teamImages[match.team1ImageId] 
        ? `<img src="${this.teamImages[match.team1ImageId]}" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; border: 1px solid #fff;" />`
        : "";
      const team2Image = match.team2ImageId && this.teamImages[match.team2ImageId]
        ? `<img src="${this.teamImages[match.team2ImageId]}" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; border: 1px solid #fff;" />`
        : "";

      // Series title
      const titleHtml = `
        <div style="text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 8px; color: #4CAF50; text-transform: uppercase; letter-spacing: 0.5px;">
          ${match.title}
        </div>
      `;

      // Team 1 score
      const team1Html = match.score1 ? `
        <div style="display: flex; align-items: center; margin-bottom: 5px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team1Image}
          <div style="flex: 1;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team1.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 16px; font-weight: bold; color: #4CAF50;">${match.score1.runs}/${match.score1.wickets}</span>
            <span style="font-size: 11px; color: #aaa; margin-left: 5px;">(${match.score1.overs})</span>
          </div>
        </div>
      ` : `
        <div style="display: flex; align-items: center; margin-bottom: 5px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team1Image}
          <div style="flex: 1;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team1.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #aaa;">Yet to bat</span>
          </div>
        </div>
      `;

      // Team 2 score
      const team2Html = match.score2 ? `
        <div style="display: flex; align-items: center; margin-bottom: 6px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team2Image}
          <div style="flex: 1;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team2.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 16px; font-weight: bold; color: #4CAF50;">${match.score2.runs}/${match.score2.wickets}</span>
            <span style="font-size: 11px; color: #aaa; margin-left: 5px;">(${match.score2.overs})</span>
          </div>
        </div>
      ` : `
        <div style="display: flex; align-items: center; margin-bottom: 6px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team2Image}
          <div style="flex: 1;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team2.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #aaa;">Yet to bat</span>
          </div>
        </div>
      `;

      // Match status
      const statusHtml = `
        <div style="text-align: center; font-size: 10px; color: #FFD700; font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          ${match.status}
        </div>
      `;

      matchDiv.innerHTML = titleHtml + team1Html + team2Html + statusHtml;
      wrapper.appendChild(matchDiv);
    });

    return wrapper;
  },

  getStyles() {
    return ["cricket-live-score.css"];
  }
});
