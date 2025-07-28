// Clock and Weather PWA
class ClockWeatherApp {
    constructor() {
        this.clockType = 'digital'; // 'digital' or 'analog'
        this.showDate = true;
        this.showWeekday = true;
        this.currentZipCode = '';
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupWeather();
        this.setupEventListeners();
        this.startClock();
        this.loadSettings();
        this.startScreenSaver();
    }

    setupClock() {
        this.digitalClock = document.getElementById('digital-clock');
        this.analogClock = document.getElementById('analog-clock');
        this.timeElement = document.getElementById('time');
        this.dateElement = document.getElementById('date');
        this.weekdayElement = document.getElementById('weekday');
        
        this.hourHand = document.getElementById('hour-hand');
        this.minuteHand = document.getElementById('minute-hand');
        this.secondHand = document.getElementById('second-hand');
    }

    setupWeather() {
        this.zipcodeInput = document.getElementById('zipcode');
        this.updateLocationBtn = document.getElementById('update-location');
        this.temperatureElement = document.getElementById('temperature');
        this.weatherDescriptionElement = document.getElementById('weather-description');
        this.locationElement = document.getElementById('location');
        this.humidityElement = document.getElementById('humidity');
        this.windElement = document.getElementById('wind');
        this.feelsLikeElement = document.getElementById('feels-like');
        
        // Add location button for current location
        this.locationBtn = document.getElementById('current-location');
    }

    setupEventListeners() {
        // Clock controls
        document.getElementById('toggle-clock').addEventListener('click', () => this.toggleClockType());
        document.getElementById('toggle-date').addEventListener('click', () => this.toggleDate());
        document.getElementById('toggle-weekday').addEventListener('click', () => this.toggleWeekday());

        // Weather controls
        this.updateLocationBtn.addEventListener('click', () => this.updateWeather());
        this.zipcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateWeather();
            }
        });

        // Current location button
        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        }

        // Click to show options
        document.addEventListener('click', () => this.showOptions());

        // Try to get current location on startup
        this.getCurrentLocation();
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        // Update digital clock (no seconds for larger font)
        this.timeElement.textContent = `${hours}:${minutes}`;
        
        if (this.showDate) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            this.dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
        
        if (this.showWeekday) {
            const options = { weekday: 'long' };
            this.weekdayElement.textContent = now.toLocaleDateString('en-US', options);
        }

        // Update analog clock (with seconds hand)
        const hourAngle = (hours % 12) * 30 + minutes * 0.5;
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;

        this.hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
        this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
        this.secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
    }

    toggleClockType() {
        this.clockType = this.clockType === 'digital' ? 'analog' : 'digital';
        
        if (this.clockType === 'digital') {
            this.digitalClock.classList.remove('hidden');
            this.analogClock.classList.add('hidden');
            document.getElementById('toggle-clock').textContent = 'Switch to Analog';
        } else {
            this.digitalClock.classList.add('hidden');
            this.analogClock.classList.remove('hidden');
            document.getElementById('toggle-clock').textContent = 'Switch to Digital';
        }
        
        this.saveSettings();
    }

    toggleDate() {
        this.showDate = !this.showDate;
        this.dateElement.style.display = this.showDate ? 'block' : 'none';
        document.getElementById('toggle-date').textContent = this.showDate ? 'Hide Date' : 'Show Date';
        this.saveSettings();
    }

    toggleWeekday() {
        this.showWeekday = !this.showWeekday;
        this.weekdayElement.style.display = this.showWeekday ? 'block' : 'none';
        document.getElementById('toggle-weekday').textContent = this.showWeekday ? 'Hide Weekday' : 'Show Weekday';
        this.saveSettings();
    }

    async updateWeather() {
        const zipCode = this.zipcodeInput.value.trim();
        if (!zipCode) {
            alert('Please enter a ZIP code');
            return;
        }

        this.currentZipCode = zipCode;
        localStorage.setItem('zipCode', zipCode);
        
        this.showWeatherLoading();
        
        try {
            // Use a free ZIP code to coordinates service
            const geoResponse = await fetch(`https://api.zippopotam.us/US/${zipCode}`);
            
            if (!geoResponse.ok) {
                throw new Error('ZIP code not found');
            }
            
            const geoData = await geoResponse.json();
            const location = {
                latitude: parseFloat(geoData.places[0].latitude),
                longitude: parseFloat(geoData.places[0].longitude),
                name: geoData.places[0]['place name'],
                admin1: geoData.places[0]['state abbreviation']
            };
            
            // Get weather data using Open-Meteo (no API key required)
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
            
            if (!weatherResponse.ok) {
                throw new Error('Weather data not available');
            }
            
            const weatherData = await weatherResponse.json();
            this.displayWeatherOpenMeteo(weatherData, location);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.displayWeatherError();
        }
    }

    showWeatherLoading() {
        this.temperatureElement.textContent = 'Loading...';
        this.weatherDescriptionElement.textContent = 'Loading weather data...';
        this.locationElement.textContent = this.currentZipCode;
        this.humidityElement.textContent = '--%';
        this.windElement.textContent = '-- mph';
        this.feelsLikeElement.textContent = '--°F';
        
        this.weatherDescriptionElement.classList.add('loading');
    }

    displayWeatherOpenMeteo(weatherData, location) {
        this.weatherDescriptionElement.classList.remove('loading');
        
        const current = weatherData.current;
        const weatherCode = current.weather_code;
        
        // Convert weather code to description
        const weatherDescriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        
        this.temperatureElement.textContent = `${Math.round(current.temperature_2m)}°F`;
        this.weatherDescriptionElement.textContent = weatherDescriptions[weatherCode] || 'Unknown';
        this.locationElement.textContent = location.name || location.admin1 || this.currentZipCode;
        this.humidityElement.textContent = `${current.relative_humidity_2m}%`;
        this.windElement.textContent = `${Math.round(current.wind_speed_10m)} mph`;
        this.feelsLikeElement.textContent = `${Math.round(current.apparent_temperature)}°F`;
    }

    displayWeather(data) {
        this.weatherDescriptionElement.classList.remove('loading');
        
        this.temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
        this.weatherDescriptionElement.textContent = data.weather[0].description;
        this.locationElement.textContent = data.name;
        this.humidityElement.textContent = `${data.main.humidity}%`;
        this.windElement.textContent = `${Math.round(data.wind.speed)} mph`;
        this.feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°F`;
    }

    displayWeatherError() {
        this.weatherDescriptionElement.classList.remove('loading');
        this.temperatureElement.textContent = 'Error';
        this.weatherDescriptionElement.textContent = 'Unable to load weather data';
        this.locationElement.textContent = this.currentZipCode;
        this.humidityElement.textContent = '--%';
        this.windElement.textContent = '-- mph';
        this.feelsLikeElement.textContent = '--°F';
    }

    saveSettings() {
        const settings = {
            clockType: this.clockType,
            showDate: this.showDate,
            showWeekday: this.showWeekday
        };
        localStorage.setItem('clockWeatherSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('clockWeatherSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.clockType = settings.clockType || 'digital';
            this.showDate = settings.showDate !== undefined ? settings.showDate : true;
            this.showWeekday = settings.showWeekday !== undefined ? settings.showWeekday : true;
            
            // Apply settings
            if (this.clockType === 'analog') {
                this.toggleClockType();
            }
            
            if (!this.showDate) {
                this.toggleDate();
            }
            
            if (!this.showWeekday) {
                this.toggleWeekday();
            }
        }
    }

    startScreenSaver() {
        // Move screen every 30 seconds to prevent burn-in
        setInterval(() => {
            const container = document.querySelector('.container');
            if (container) {
                // Simple random movement within a small range
                const xOffset = (Math.random() - 0.5) * 20; // ±10px
                const yOffset = (Math.random() - 0.5) * 20; // ±10px
                
                container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                
                // Reset position after 2 seconds
                setTimeout(() => {
                    container.style.transform = 'translate(0px, 0px)';
                }, 2000);
            }
        }, 30000); // 30 seconds
    }

    showOptions() {
        // Show clock settings and weather input
        const clockSettings = document.querySelector('.clock-settings');
        const locationInput = document.querySelector('.location-input');
        
        if (clockSettings && locationInput) {
            clockSettings.style.display = 'flex';
            locationInput.style.display = 'flex';
            
            // Hide after 5 seconds
            setTimeout(() => {
                clockSettings.style.display = 'none';
                locationInput.style.display = 'none';
            }, 5000);
        }
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by this browser');
            this.fallbackToSavedLocation();
            return;
        }

        // Show loading state
        this.showWeatherLoading();
        this.locationElement.textContent = 'Getting location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.updateWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.log('Error getting location:', error);
                this.locationElement.textContent = 'Location access denied';
                this.fallbackToSavedLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    async updateWeatherByCoordinates(latitude, longitude) {
        try {
            // Get location name from coordinates using reverse geocoding
            const locationResponse = await fetch(`https://api.open-meteo.com/v1/geocoding?latitude=${latitude}&longitude=${longitude}&count=1`);
            const locationData = await locationResponse.json();
            
            if (locationData.results && locationData.results.length > 0) {
                const location = locationData.results[0];
                this.locationElement.textContent = `${location.name}, ${location.country}`;
                
                // Get weather data
                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
                const weatherData = await weatherResponse.json();
                
                this.displayWeatherOpenMeteo(weatherData, location);
            } else {
                this.locationElement.textContent = 'Location not found';
                this.displayWeatherError();
            }
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            this.locationElement.textContent = 'Weather fetch failed';
            this.displayWeatherError();
        }
    }

    fallbackToSavedLocation() {
        // Load saved zip code as fallback
        const savedZipCode = localStorage.getItem('zipCode');
        if (savedZipCode) {
            this.zipcodeInput.value = savedZipCode;
            this.currentZipCode = savedZipCode;
            this.updateWeather();
        } else {
            // Set default location if no saved location
            this.zipcodeInput.value = '10001'; // New York as default
            this.currentZipCode = '10001';
            this.updateWeather();
        }
    }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new ClockWeatherApp();
});

// Handle app installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // You can show an install button here if desired
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
}); 