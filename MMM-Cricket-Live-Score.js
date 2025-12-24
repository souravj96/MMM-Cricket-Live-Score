Module.register("MMM-Cricket-Live-Score", {
	defaults: {
		apiKey: "",          // RapidAPI key
		updateInterval: 60 * 1000, // 1 minute
		carouselInterval: 10 * 1000 // 10 seconds - time to show each match
	},

	start () {
		console.log("MMM-Cricket-Live-Score module started");
		this.matches = [];
		this.teamImages = {};
		this.currentMatchIndex = 0;
		this.carouselTimer = null;
		this.updateTimer = null;
		this.midnightTimer = null;
		this.matchStartTimers = []; // Track timers for upcoming match start times
		this.noMatchesDate = null; // Track the date when no matches were found
		this.hasLiveMatches = false; // Track if there are currently live matches
		this.dailyCheckDone = false; // Track if daily check is done

		this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
		this.scheduleUpdate();
		this.scheduleMidnightCheck();
	},

	scheduleMidnightCheck () {
		// Check at midnight to reset noMatchesDate
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		const msUntilMidnight = tomorrow - now;

		// Clear existing timer
		if (this.midnightTimer) {
			clearTimeout(this.midnightTimer);
		}

		// Set timer for midnight
		this.midnightTimer = setTimeout(() => {
			console.log("Midnight reached, resetting daily check flag");
			this.dailyCheckDone = false;
			this.noMatchesDate = null;

			// If no live matches, do a daily check
			if (!this.hasLiveMatches) {
				this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
			}

			// Reschedule for next midnight
			this.scheduleMidnightCheck();
		}, msUntilMidnight);
	},

	scheduleMatchStartChecks (matches) {
		// Clear existing match start timers
		if (this.matchStartTimers && this.matchStartTimers.length > 0) {
			this.matchStartTimers.forEach(timer => clearTimeout(timer));
			this.matchStartTimers = [];
		}

		const now = Date.now();

		matches.forEach(match => {
			if (match.startDate) {
				const startTime = parseInt(match.startDate);
				const timeUntilStart = startTime - now;

				// If match starts in the future (within next 24 hours), schedule a check
				if (timeUntilStart > 0 && timeUntilStart < 24 * 60 * 60 * 1000) {
					console.log(`Scheduling check for match "${match.title}" starting in ${Math.round(timeUntilStart / 1000 / 60)} minutes`);

					const timer = setTimeout(() => {
						console.log(`Match start time reached for "${match.title}", checking for live matches`);
						this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
					}, timeUntilStart);

					this.matchStartTimers.push(timer);
				}
			}
		});
	},

	scheduleUpdate () {
		// Clear existing timer
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}

		// Determine interval based on whether there are live matches
		const interval = this.hasLiveMatches ? this.config.updateInterval : 24 * 60 * 60 * 1000; // 1 minute vs 24 hours

		console.log(`Scheduling updates every ${interval / 1000 / 60} minutes`);

		this.updateTimer = setInterval(() => {
			// If there are live matches, always call API
			if (this.hasLiveMatches) {
				console.log("Live matches active, calling API");
				this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
				return;
			}

			// If no live matches and daily check already done, skip
			if (this.dailyCheckDone) {
				console.log("Daily check already done, skipping API call");
				return;
			}

			// Otherwise, do the daily check
			console.log("Performing daily check for matches");
			this.sendSocketNotification("GET_LIVE_MATCHES", this.config);
		}, interval);
	},

	startCarousel () {
		// Clear existing timer
		if (this.carouselTimer) {
			clearInterval(this.carouselTimer);
		}

		// Only start carousel if there are multiple matches
		if (this.matches && this.matches.length > 1) {
			this.carouselTimer = setInterval(() => {
				this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
				this.updateDom(300); // 300ms animation
			}, this.config.carouselInterval);
		}
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "LIVE_MATCHES") {
			this.matches = this.parseMatches(payload);
			this.currentMatchIndex = 0; // Reset to first match

			// Check if any match is live
			const hasLive = this.matches.some(match => {
				const statusLower = match.status ? match.status.toLowerCase() : "";
				const stateLower = match.state ? match.state.toLowerCase() : "";

				return (
					statusLower.includes("live") ||
          statusLower.includes("in progress") ||
          statusLower.includes("innings break") ||
          stateLower === "in progress" ||
          stateLower === "innings break" ||
          stateLower === "stumps" ||
          stateLower === "lunch" ||
          stateLower === "tea" ||
          stateLower === "delay" ||
          stateLower === "rain delay" ||
          stateLower === "toss"
				);
			});

			// If live status changed, reschedule updates
			if (hasLive !== this.hasLiveMatches) {
				console.log(`Live match status changed: ${hasLive ? "Live matches found" : "No live matches"}`);
				this.hasLiveMatches = hasLive;
				this.scheduleUpdate(); // Reschedule with appropriate interval
			}

			// Mark daily check as done if no live matches
			if (!hasLive) {
				this.dailyCheckDone = true;
			}

			// Schedule checks for upcoming match start times
			this.scheduleMatchStartChecks(this.matches);

			// Show module if it was hidden and reset noMatchesDate
			if (this.matches.length > 0) {
				this.noMatchesDate = null; // Reset since we have matches
				this.show(1000); // Show module with 1 second transition
			}

			this.updateDom();
			this.startCarousel(); // Start carousel for multiple matches

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
		} else if (notification === "NO_MATCHES") {
			this.matches = [];
			this.noMatchesDate = new Date();
			this.hasLiveMatches = false;
			this.dailyCheckDone = true; // Mark daily check as done
			console.log("No matches found, will check again tomorrow");
			this.hide(1000); // Hide module with 1 second transition
		} else if (notification === "TEAM_IMAGE") {
			this.teamImages[payload.imageId] = payload.image;
			this.updateDom();
		}
	},

	parseMatches (data) {
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
						state: info.state, // Include match state
						score1: score?.team1Score?.inngs1,
						score2: score?.team2Score?.inngs1,
						team1: info.team1,
						team2: info.team2,
						team1ImageId: info.team1?.imageId,
						team2ImageId: info.team2?.imageId,
						startDate: info.startDate // Include match start time
					});
				});
			});
		});

		// Check if there are any live matches
		const hasLiveMatch = matches.some(match => {
			const statusLower = match.status ? match.status.toLowerCase() : "";
			const stateLower = match.state ? match.state.toLowerCase() : "";

			return (
				statusLower.includes("live") ||
        statusLower.includes("in progress") ||
        statusLower.includes("innings break") ||
        stateLower === "in progress" ||
        stateLower === "innings break" ||
        stateLower === "stumps" ||
        stateLower === "lunch" ||
        stateLower === "tea" ||
        stateLower === "delay" ||
        stateLower === "rain delay" ||
        stateLower === "toss"
			);
		});

		// If there are live matches, filter out completed ones
		if (hasLiveMatch) {
			return matches.filter(match => {
				const stateLower = match.state ? match.state.toLowerCase() : "";
				return stateLower !== "complete" && stateLower !== "completed";
			});
		}

		return matches;
	},

	getDom () {
		const wrapper = document.createElement("div");
		wrapper.style.cssText = "font-family: 'Roboto', sans-serif; position: relative;";

		// Return empty div if no matches (module will be hidden anyway)
		if (!this.matches || this.matches.length === 0) {
			return wrapper;
		}

		// Get current match to display (carousel)
		const match = this.matches[this.currentMatchIndex];

		// Show match indicator if multiple matches
		if (this.matches.length > 1) {
			const indicator = document.createElement("div");
			indicator.style.cssText = "text-align: center; font-size: 10px; color: #888; margin-bottom: 5px;";
			indicator.innerHTML = `Match ${this.currentMatchIndex + 1} of ${this.matches.length}`;
			wrapper.appendChild(indicator);
		}

		// Display current match only
		const matchDiv = document.createElement("div");
		matchDiv.style.cssText = `
      background: rgba(0, 0, 0, 0.4);
      border-radius: 8px;
      padding: 10px;
      border-left: 3px solid #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    `;

		const team1Image = match.team1ImageId && this.teamImages[match.team1ImageId]
			? `<img src="${this.teamImages[match.team1ImageId]}" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; border: 1px solid #888; filter: grayscale(100%);" />`
			: "";
		const team2Image = match.team2ImageId && this.teamImages[match.team2ImageId]
			? `<img src="${this.teamImages[match.team2ImageId]}" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; border: 1px solid #888; filter: grayscale(100%);" />`
			: "";

		// Check if match is live
		const statusLower = match.status ? match.status.toLowerCase() : "";
		const stateLower = match.state ? match.state.toLowerCase() : "";

		const isLive = (
			statusLower.includes("live") ||
        statusLower.includes("in progress") ||
        statusLower.includes("innings break") ||
        stateLower === "in progress" ||
        stateLower === "innings break" ||
        stateLower === "stumps" ||
        stateLower === "lunch" ||
        stateLower === "tea" ||
        stateLower === "delay" ||
        stateLower === "rain delay" ||
        stateLower === "toss"
		);

		// Live indicator dot
		const liveIndicator = isLive ? `
        <span style="display: inline-block; width: 8px; height: 8px; background-color: #00ff00; border-radius: 50%; margin-right: 5px; animation: pulse 2s infinite;"></span>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        </style>
      ` : "";

		// Series title
		const titleHtml = `
        <div style="text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 8px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">
          ${liveIndicator}${match.title}
        </div>
      `;

		// Team 1 score
		const team1Html = match.score1 ? `
        <div style="display: flex; align-items: center; margin-bottom: 5px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team1Image}
          <div style="flex: 1; padding-right: 15px;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team1.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 16px; font-weight: bold; color: #fff;">${match.score1.runs}/${match.score1.wickets}</span>
            <span style="font-size: 11px; color: #aaa; margin-left: 5px;">(${match.score1.overs})</span>
          </div>
        </div>
      ` : `
        <div style="display: flex; align-items: center; margin-bottom: 5px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team1Image}
          <div style="flex: 1; padding-right: 15px;">
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
          <div style="flex: 1; padding-right: 15px;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team2.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 16px; font-weight: bold; color: #fff;">${match.score2.runs}/${match.score2.wickets}</span>
            <span style="font-size: 11px; color: #aaa; margin-left: 5px;">(${match.score2.overs})</span>
          </div>
        </div>
      ` : `
        <div style="display: flex; align-items: center; margin-bottom: 6px; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          ${team2Image}
          <div style="flex: 1; padding-right: 15px;">
            <span style="font-weight: bold; font-size: 13px; color: #fff;">${match.team2.teamSName}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #aaa;">Yet to bat</span>
          </div>
        </div>
      `;

		// Match status
		const statusHtml = `
        <div style="text-align: center; font-size: 10px; color: #ccc; font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          ${match.status}
        </div>
      `;

		matchDiv.innerHTML = titleHtml + team1Html + team2Html + statusHtml;
		wrapper.appendChild(matchDiv);

		return wrapper;
	},

	getStyles () {
		return ["cricket-live-score.css"];
	},

	suspend () {
		// Stop carousel when module is hidden
		if (this.carouselTimer) {
			clearInterval(this.carouselTimer);
			this.carouselTimer = null;
		}

		// Clear match start timers
		if (this.matchStartTimers && this.matchStartTimers.length > 0) {
			this.matchStartTimers.forEach(timer => clearTimeout(timer));
			this.matchStartTimers = [];
		}
	},

	resume () {
		// Restart carousel when module is shown
		this.startCarousel();

		// Reschedule match start checks
		if (this.matches && this.matches.length > 0) {
			this.scheduleMatchStartChecks(this.matches);
		}
	}
});
