# Clock & Weather PWA

A beautiful Progressive Web App designed for Android tablets in landscape mode, featuring a large clock and weather display.

## Features

### Clock Section (Left Half)
- **Digital Clock**: Large, easy-to-read digital time display
- **Analog Clock**: Classic analog clock with smooth hand movements
- **Date Display**: Shows current date (toggleable)
- **Weekday Display**: Shows current day of the week (toggleable)
- **Settings**: Toggle between digital/analog, show/hide date and weekday

### Weather Section (Right Half)
- **ZIP Code Input**: Enter your ZIP code for local weather
- **Current Weather**: Temperature, description, and location
- **Weather Details**: Humidity, wind speed, and "feels like" temperature
- **Auto-save**: Remembers your last used ZIP code

## Setup Instructions

### 1. Get Weather API Key
1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your API key from your account dashboard
3. Replace `YOUR_API_KEY` in `app.js` with your actual API key

### 2. Create Icons (Optional)
The app expects icons in the `icons/` directory. You can create simple icons or use placeholder images:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 3. Deploy to Web Server
Upload all files to a web server with HTTPS (required for PWA installation).

### 4. Install on Android Tablet
1. Open the app in Chrome on your Android tablet
2. Tap the menu (three dots) in Chrome
3. Select "Add to Home screen" or "Install app"
4. The app will appear on your home screen

## Usage

### Clock Controls
- **Switch to Analog/Digital**: Toggle between digital and analog clock displays
- **Hide/Show Date**: Toggle the date display
- **Hide/Show Weekday**: Toggle the weekday display

### Weather Controls
- **ZIP Code**: Enter your 5-digit ZIP code
- **Update Button**: Click to fetch current weather data
- **Enter Key**: Press Enter in the ZIP code field to update weather

## Technical Details

- **PWA Features**: Offline support, installable, service worker caching
- **Responsive Design**: Optimized for landscape tablet view
- **Local Storage**: Saves user preferences and ZIP code
- **Weather API**: OpenWeatherMap Current Weather API
- **Clock Precision**: Updates every second with smooth animations

## File Structure

```
clock-weather-pwa/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # JavaScript functionality
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── README.md         # This file
└── icons/            # App icons (create these)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
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