# Clock & Weather PWA

A beautiful Progressive Web App designed for tablets, featuring a large clock and weather display with a clean, minimal dark interface.

## Features

### Clock Section (Left Half)
- **Digital Clock**: Large, easy-to-read digital time display (HH:MM format)
- **Analog Clock**: Classic analog clock with smooth hand movements including seconds
- **Date Display**: Shows current date (toggleable)
- **Weekday Display**: Shows current day of the week (toggleable)
- **Settings**: Toggle between digital/analog, show/hide date and weekday

### Weather Section (Right Half)
- **ZIP Code Input**: Enter your ZIP code for local weather
- **Current Weather**: Temperature, description, and location
- **Weather Details**: Humidity, wind speed, and "feels like" temperature
- **Auto-save**: Remembers your last used ZIP code

### Interface Features
- **Dark Mode**: Clean black background with white text
- **Large Fonts**: Optimized for tablet viewing from a distance
- **Click to Show Options**: Tap screen to reveal controls for 5 seconds
- **Screen Saver**: Subtle movement every 30 seconds to prevent burn-in
- **Minimal Design**: No visible controls by default for clean appearance

## Quick Start

### 1. Deploy to GitHub Pages (Recommended)
1. Create a new repository on GitHub
2. Push this code to your repository
3. Enable GitHub Pages in repository settings
4. Your PWA will be available at `https://YOUR_USERNAME.github.io/REPO_NAME/`

### 2. Install on Your Tablet
- **Android**: Open in Chrome → Three dots → "Add to Home screen"
- **iPad**: Open in Safari → Share button → "Add to Home Screen"

## Usage

### Clock Controls
- **Switch to Analog/Digital**: Toggle between digital and analog clock displays
- **Hide/Show Date**: Toggle the date display
- **Hide/Show Weekday**: Toggle the weekday display

### Weather Controls
- **ZIP Code**: Enter your 5-digit ZIP code
- **Update Button**: Click to fetch current weather data
- **Enter Key**: Press Enter in the ZIP code field to update weather

### Interface Controls
- **Click Screen**: Tap anywhere to show options for 5 seconds
- **Automatic Hide**: Options disappear automatically after 5 seconds

## Technical Details

- **PWA Features**: Offline support, installable, service worker caching
- **Responsive Design**: Optimized for tablet view with large fonts
- **Local Storage**: Saves user preferences and ZIP code
- **Weather API**: Free Open-Meteo API (no API key required)
- **Clock Precision**: Updates every second with smooth animations
- **Screen Protection**: Automatic movement to prevent display burn-in

## File Structure

```
clock-weather-pwa/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # JavaScript functionality
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── README.md         # This file
└── DEPLOYMENT.md     # Deployment instructions
```

## Browser Compatibility

- Chrome (recommended for PWA installation)
- Firefox
- Safari
- Edge

## Notes

- The app requires HTTPS for PWA installation
- Weather data requires an internet connection
- Clock functionality works offline
- Settings are saved locally in the browser 

## PWA Troubleshooting

In case you don't see https://kennethchoe.github.io/clock-weather-pwa but see https://kennethchoe.github.io/, follow these steps. Confirmed working on Android Chrome.

1. Open https://kennethchoe.github.io/clock-weather-pwa on Chrome.
2. Click ... and turn on Desktop site mode.
3. Click ... and select Add to home screen.
4. You see Install option. Select that.
