# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-23

### Added
- Automatic transition from upcoming to live matches based on scheduled start time
- Scheduled API checks trigger automatically when upcoming matches reach start time
- Enhanced live match detection using both `status` and `state` fields
- Support for multiple match states: In Progress, Toss, Innings Break, Stumps, Lunch, Tea, Delay, Rain Delay
- Toss state now treated as live event (shows green indicator, updates every minute)
- Match start time tracking and automatic timer scheduling
- Project documentation: LICENSE, CHANGELOG.md, CODE_OF_CONDUCT.md
- Dependabot configuration for automated dependency updates
- ESLint configuration for code quality with npm scripts (lint, lint:fix)

### Changed
- Live match detection now checks both status messages and match state
- Improved API call efficiency with smart scheduling based on match start times
- Updated README with file structure, linting instructions, and community guidelines

## [1.2.0] - 2025-12-23

### Added
- Cascading API calls: Checks live matches first, then upcoming matches as fallback
- Upcoming matches endpoint support for when no live matches are available
- Smart update frequency: API calls every minute when matches are live, once daily otherwise
- Automatic detection of live match status from match data
- Dynamic interval switching based on live match availability
- Daily check at midnight when no live matches
- Live match indicator with green pulsing dot

### Changed
- Module now hides only when both live and upcoming matches are unavailable
- Optimized API usage to save quota

## [1.1.0] - 2025-12-23

### Added
- Carousel feature for multiple live matches
- Automatic rotation between matches with configurable interval
- Match indicator showing current position (e.g., "Match 1 of 3")
- Module automatically hides when no matches are available
- Module automatically shows when matches become available
- Smart API management: Stops calling API for the rest of the day when no matches found
- Automatic midnight reset: Resumes API calls at midnight
- Suspend/resume functionality for carousel

### Changed
- Replaced node-fetch with built-in fetch API (requires Node.js 18+)
- Handles "No matches today" when API returns 204 or empty response

## [1.0.1] - 2025-12-23

### Changed
- Updated UI to monochrome design (black, white, and gray tones)
- Added grayscale filter to team logos
- Improved spacing between team names and scores
- Enhanced readability with better visual balance

## [1.0.0] - 2025-12-23

### Added
- Initial release
- Live cricket scores from Cricbuzz API via RapidAPI
- Team logo display with dynamic fetching
- Professional scoreboard UI with card-based layout
- Auto-refresh functionality
- Configurable update intervals
- Support for multiple concurrent matches
- Real-time score updates with runs, wickets, and overs
- Match status display (Live, Completed, etc.)
- Error handling and loading states

[1.3.0]: https://github.com/souravj96/MMM-Cricket-Live-Score/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/souravj96/MMM-Cricket-Live-Score/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/souravj96/MMM-Cricket-Live-Score/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/souravj96/MMM-Cricket-Live-Score/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/souravj96/MMM-Cricket-Live-Score/releases/tag/v1.0.0
