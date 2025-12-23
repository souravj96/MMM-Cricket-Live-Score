# MMM-Cricket-Live-Score

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module to display live cricket scores with team logos in a beautiful scoreboard format.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## Features

- 🏏 **Live Cricket Scores** - Real-time updates from Cricbuzz via RapidAPI
- 🖼️ **Team Logos** - Displays team logos fetched from Cricbuzz
- 📊 **Professional Scoreboard** - Clean, compact design with match status
- 🎠 **Carousel Mode** - Automatically rotates between multiple live matches
- ⚡ **Auto-refresh** - Configurable update intervals
- 🎨 **Modern UI** - Beautiful monochrome card-based layout with smooth animations

## Screenshots

![Cricket Live Score Module](screenshot.png)

## Installation

Navigate to your MagicMirror's `modules` folder and run the following commands:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/souravj96/MMM-Cricket-Live-Score.git
cd MMM-Cricket-Live-Score
npm install
```

### Get RapidAPI Key

1. Go to [RapidAPI Cricbuzz Cricket API](https://rapidapi.com/cricketapilive/api/cricbuzz-cricket/)
2. Sign up or log in to RapidAPI
3. Subscribe to the Cricbuzz Cricket API (free tier available)
4. Copy your API key from the API dashboard

## Updating

To update the module to the latest version, run the following commands:

```bash
cd ~/MagicMirror/modules/MMM-Cricket-Live-Score
git pull
npm install
```

## Configuration

Add the module to your `config/config.js` file:

```javascript
{
  module: "MMM-Cricket-Live-Score",
  position: "top_right", // or any other position
  config: {
    apiKey: "YOUR_RAPIDAPI_KEY_HERE", // Required: Your RapidAPI key
    updateInterval: 60000 // Optional: Update interval in milliseconds (default: 60000 = 1 minute)
  }
},
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **Required** | Your RapidAPI key for Cricbuzz Cricket API |
| `updateInterval` | `number` | `60000` | How often to fetch new data (in milliseconds). Default is 1 minute. |
| `carouselInterval` | `number` | `10000` | Time to show each match in carousel (in milliseconds). Default is 10 seconds. Only applies when multiple matches are available. |

## Usage Example

```javascript
{
  module: "MMM-Cricket-Live-Score",
  position: "top_right",
  config: {
    apiKey: "5139c4b304msh75e2d838fbdc51ep13e78bjsn9b34e36fc005",
    updateInterval: 30000, // Update every 30 seconds
    carouselInterval: 15000 // Show each match for 15 seconds
  }
},
```

## Display Information

The module displays:
- **Series Name** - Tournament or series name
- **Team Logos** - Circular team logos with borders
- **Team Names** - Short team names
- **Scores** - Runs/Wickets (Overs)
- **Match Status** - Current match status (Live, Completed, etc.)

## Features in Detail

### Live Score Updates
- Automatically fetches live cricket matches from Cricbuzz
- **Cascading API calls**:
  1. First checks for **live matches**
  2. If no live matches, checks for **upcoming matches**
  3. If neither available, **hides the module**
- **Smart update frequency**:
  - **Live matches active**: Updates every minute (configurable)
  - **No live matches**: Checks once daily at midnight
- **Automatic transition to live**: 
  - Schedules API checks at upcoming match start times
  - Automatically switches to live updates when match begins
  - No manual intervention required
- **Enhanced live detection**:
  - Detects live state from both status and state fields
  - Supports multiple states: In Progress, Toss, Innings Break, Stumps, Lunch, Tea, Delay
  - Shows green pulsing indicator for active matches
- Displays multiple matches in carousel mode
- **Automatically hides when no matches are available**
- **Automatically shows when matches become available**
- **Intelligent API management**: Minimizes API calls to save quota

### Team Logos
- Fetches team logos dynamically from Cricbuzz API
- Caches images to reduce API calls
- Displays as circular badges with borders

### Match Information
- Shows complete score details: runs, wickets, and overs
- Displays match status (In Progress, Completed, etc.)
- Shows "Yet to bat" for teams that haven't batted

## API Information

This module uses the [Cricbuzz Cricket API](https://rapidapi.com/cricketapilive/api/cricbuzz-cricket/) via RapidAPI.

**Endpoints Used:**
- `/matches/v1/live` - Fetches live match data (checked first)
- `/matches/v1/upcoming` - Fetches upcoming match data (fallback)
- `/img/v1/i1/c{imageId}/i.jpg` - Fetches team logos

**API Call Logic:**
1. Attempts to fetch live matches
2. If no live matches found, fetches upcoming matches
3. If neither available, hides module until next check

## Troubleshooting

### Module not showing up
- Verify the module is in the `modules` folder
- Check that `npm install` was run successfully
- Ensure your API key is correct

### No scores displayed
- Check your API key is valid and has active subscription
- Verify there are live cricket matches happening
- Check browser console (F12) for errors

### Images not loading
- Ensure your RapidAPI subscription includes image access
- Check network connectivity
- Verify API rate limits haven't been exceeded

## Development

### File Structure
```
MMM-Cricket-Live-Score/
├── .github/
│   └── dependabot.yml           # Dependabot configuration
├── MMM-Cricket-Live-Score.js    # Main module file
├── node_helper.js               # Backend helper for API calls
├── cricket-live-score.css       # Styling
├── package.json                 # Dependencies
├── .eslintrc.json               # ESLint configuration
├── .eslintignore                # ESLint ignore rules
├── CHANGELOG.md                 # Version history
├── CODE_OF_CONDUCT.md           # Community guidelines
├── LICENSE                      # MIT License
└── README.md                    # Documentation
```

### Linting

This project uses ESLint to maintain code quality. To run linting:

```bash
# Check for linting errors
npm run lint

# Automatically fix fixable issues
npm run lint:fix
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Before contributing, please:
1. Read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Check the [open issues](https://github.com/souravj96/MMM-Cricket-Live-Score/issues)
3. Run `npm run lint` to ensure code quality
4. Test your changes thoroughly

## Credits

- **Developer**: [Sourav Jana](https://github.com/souravj96)
- **API Provider**: [Cricbuzz Cricket API](https://rapidapi.com/cricketapilive/api/cricbuzz-cricket/) via RapidAPI
- **Framework**: [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

For a detailed list of changes and version history, see [CHANGELOG.md](CHANGELOG.md).

### Latest Version: 1.3.0 (2025-12-23)
- **Automatic transition to live**: Schedules checks at match start times, seamlessly switches to live updates
- **Enhanced live detection**: Uses both status and state fields to detect live matches
- **Multiple match states**: Supports Toss, In Progress, Innings Break, Stumps, Lunch, Tea, Delay states
- **Project documentation**: Added LICENSE, CHANGELOG.md, CODE_OF_CONDUCT.md
- **Development tools**: ESLint configuration, Dependabot for dependency updates
- Smart scheduling with automatic timers for upcoming matches
- Optimized API usage to save quota

For complete version history, see [CHANGELOG.md](CHANGELOG.md).

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/souravj96/MMM-Cricket-Live-Score/issues)
- Check existing issues for solutions

## Acknowledgments

- Thanks to the MagicMirror² community
- Cricbuzz for providing cricket data
- RapidAPI for API infrastructure

## Community

- **Code of Conduct**: Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating
- **Security**: Dependabot is enabled to keep dependencies up to date
- **Quality**: ESLint is configured for consistent code style

---

**Enjoy your live cricket scores on your MagicMirror!** 🏏✨
