// Clock and Weather PWA
class ClockWeatherApp {
    constructor() {
        this.clockType = "digital"; // 'digital' or 'analog'
        this.showDate = true;
        this.showSeconds = true; // Track seconds visibility
        this.showWeekday = true;
        this.currentZipCode = "";
        this.wakeLock = null;
        this.prevSeconds = 0; // Track previous seconds value
        this.inactivityTimer = null; // Timer for tracking user inactivity
        this.menuVisible = false; // Track if menu is visible

        this.init();
    }

    init() {
        this.setupClock();
        this.setupWeather();
        this.setupEventListeners();
        this.startClock();
        this.loadSettings();
        this.startScreenSaver();
        this.enableWakeLock();
        this.startWeatherRefresh();
    }

    setupClock() {
        this.digitalClock = document.getElementById("digital-clock");
        this.analogClock = document.getElementById("analog-clock");
        this.timeElement = document.getElementById("time");
        this.dateElement = document.getElementById("date");
        this.secondsElement = document.getElementById("seconds");

        this.hourHand = document.getElementById("hour-hand");
        this.minuteHand = document.getElementById("minute-hand");
        this.secondHand = document.getElementById("second-hand");
    }

    setupWeather() {
        this.zipcodeInput = document.getElementById("zipcode");
        this.updateLocationBtn = document.getElementById("update-location");
        this.temperatureElement = document.getElementById("temperature");
        this.weatherDescriptionElement = document.getElementById(
            "weather-description"
        );
        this.locationElement = document.getElementById("location");
        this.humidityElement = document.getElementById("humidity");
        this.windElement = document.getElementById("wind");
        this.feelsLikeElement = document.getElementById("feels-like");
        this.lastUpdatedElement = document.getElementById("last-updated");

        // Add location button for current location
        this.locationBtn = document.getElementById("current-location");
    }

    setupEventListeners() {
        // Clock controls
        document
            .getElementById("toggle-clock")
            .addEventListener("click", () => {
                this.toggleClockType();
                this.resetInactivityTimer();
            });
        document.getElementById("toggle-date").addEventListener("click", () => {
            this.toggleDate();
            this.resetInactivityTimer();
        });
        document
            .getElementById("toggle-seconds")
            .addEventListener("click", () => {
                this.toggleSeconds();
                this.resetInactivityTimer();
            });

        // Weather controls
        this.updateLocationBtn.addEventListener("click", () => {
            this.updateWeather();
            this.resetInactivityTimer();
        });
        this.zipcodeInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.updateWeather();
                this.resetInactivityTimer();
            }
        });

        // Input events to reset inactivity timer
        this.zipcodeInput.addEventListener("input", () =>
            this.resetInactivityTimer()
        );

        // Current location button
        if (this.locationBtn) {
            this.locationBtn.addEventListener("click", () => {
                this.getCurrentLocation();
                this.resetInactivityTimer();
            });
        }

        // User activity events
        document.addEventListener("click", () => {
            this.showOptions();
            this.resetInactivityTimer();
        });
        document.addEventListener("touchstart", () =>
            this.resetInactivityTimer()
        );
        document.addEventListener("mousemove", () =>
            this.resetInactivityTimer()
        );
        document.addEventListener("keypress", () =>
            this.resetInactivityTimer()
        );

        // Try to get current location on startup
        this.getCurrentLocation();
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    startWeatherRefresh() {
        // Initial weather update happens via getCurrentLocation() in setupEventListeners

        // Set up automatic refresh every 5 minutes (300000 ms)
        this.weatherRefreshInterval = setInterval(() => {
            console.log("Auto-refreshing weather data");

            // If we have coordinates from geolocation, use those
            if (this.lastLatitude && this.lastLongitude) {
                this.updateWeatherByCoordinates(
                    this.lastLatitude,
                    this.lastLongitude
                );
            }
            // Otherwise use the last ZIP code if available
            else if (this.currentZipCode) {
                this.updateWeather(false); // Pass false to avoid showing loading indicator
            }
        }, 300000); // 5 minutes
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = parseInt(now.getSeconds());
        const secondsStr = seconds.toString().padStart(2, "0");

        // Update digital clock with hours, minutes and seconds
        document.getElementById(
            "hours-minutes"
        ).textContent = `${hours}:${minutes}`;

        // Only update seconds if they're visible
        if (this.showSeconds) {
            document.getElementById("seconds").textContent = secondsStr;
        }

        if (this.showDate) {
            // Format date as "Mon 7/28/25"
            const day = now.toLocaleDateString("en-US", { weekday: "short" });
            const month = now.getMonth() + 1;
            const date = now.getDate();
            const year = now.getFullYear().toString().slice(-2);
            this.dateElement.textContent = `${day} ${month}/${date}/${year}`;
        }

        // Update analog clock (with seconds hand)
        const hourAngle = (hours % 12) * 30 + minutes * 0.5;
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;

        // Special handling for second hand to prevent counter-clockwise animation
        if (this.prevSeconds === 59 && seconds === 0) {
            // When transitioning from 59 to 0 seconds
            // First, ensure we're at 59 seconds position (354 degrees)
            this.secondHand.style.transition = "none";
            this.secondHand.style.transform = `translateX(-50%) rotate(354deg)`;
            this.secondHand.offsetHeight; // Force reflow

            // Then immediately set to 360 degrees (same as 0 but ensures clockwise movement)
            this.secondHand.style.transform = `translateX(-50%) rotate(360deg)`;
            this.secondHand.offsetHeight; // Force reflow

            // Finally, remove transition, set to 0 degrees, and restore transition
            this.secondHand.style.transition = "none";
            this.secondHand.style.transform = `translateX(-50%) rotate(0deg)`;
            this.secondHand.offsetHeight; // Force reflow
            this.secondHand.style.transition =
                "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)";
        } else {
            // Normal second hand movement
            this.secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
        }

        // Update previous seconds for next tick
        this.prevSeconds = seconds;

        // Handle minute hand
        if (minutes === 0 && seconds === 0) {
            // Same approach for minute hand
            this.minuteHand.style.transition = "none";
            this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
            this.minuteHand.offsetHeight;
            this.minuteHand.style.transition =
                "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)";
        } else {
            this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
        }

        // Handle hour hand
        if (hours % 12 === 0 && minutes === 0 && seconds === 0) {
            // Same approach for hour hand
            this.hourHand.style.transition = "none";
            this.hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
            this.hourHand.offsetHeight;
            this.hourHand.style.transition =
                "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)";
        } else {
            this.hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
        }
    }

    toggleClockType() {
        this.clockType = this.clockType === "digital" ? "analog" : "digital";

        if (this.clockType === "digital") {
            this.digitalClock.classList.remove("hidden");
            this.analogClock.classList.add("hidden");
            document.getElementById("toggle-clock").textContent =
                "Switch to Analog";
        } else {
            this.digitalClock.classList.add("hidden");
            this.analogClock.classList.remove("hidden");
            document.getElementById("toggle-clock").textContent =
                "Switch to Digital";
        }

        this.saveSettings();
    }

    toggleDate() {
        this.showDate = !this.showDate;
        this.dateElement.style.display = this.showDate ? "block" : "none";
        document.getElementById("toggle-date").textContent = this.showDate
            ? "Hide Date"
            : "Show Date";
        this.saveSettings();
    }

    toggleSeconds() {
        this.showSeconds = !this.showSeconds;
        this.secondsElement.style.display = this.showSeconds
            ? "inline"
            : "none";
        document.getElementById("toggle-seconds").textContent = this.showSeconds
            ? "Hide Seconds"
            : "Show Seconds";
        this.saveSettings();
    }

    async updateWeather(showLoading = true) {
        const zipCode = this.zipcodeInput.value.trim();
        if (!zipCode) {
            alert("Please enter a ZIP code");
            return;
        }

        this.currentZipCode = zipCode;
        localStorage.setItem("zipCode", zipCode);

        if (showLoading) {
            this.showWeatherLoading();
        }

        try {
            // Use a free ZIP code to coordinates service
            const geoResponse = await fetch(
                `https://api.zippopotam.us/US/${zipCode}`
            );

            if (!geoResponse.ok) {
                throw new Error("ZIP code not found");
            }

            const geoData = await geoResponse.json();
            const location = {
                latitude: parseFloat(geoData.places[0].latitude),
                longitude: parseFloat(geoData.places[0].longitude),
                name: geoData.places[0]["place name"],
                admin1: geoData.places[0]["state abbreviation"],
            };

            // Get weather data using Open-Meteo (no API key required)
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`
            );

            if (!weatherResponse.ok) {
                throw new Error("Weather data not available");
            }

            const weatherData = await weatherResponse.json();
            this.displayWeatherOpenMeteo(weatherData, location);
        } catch (error) {
            console.error("Weather fetch error:", error);
            this.displayWeatherError();
        }
    }

    showWeatherLoading() {
        this.temperatureElement.textContent = "Loading...";
        this.weatherDescriptionElement.textContent = "Loading weather data...";
        this.locationElement.textContent = this.currentZipCode;
        this.humidityElement.textContent = "--%";
        this.windElement.textContent = "-- mph";
        this.feelsLikeElement.textContent = "--°F";

        this.weatherDescriptionElement.classList.add("loading");
    }

    displayWeatherOpenMeteo(weatherData, location) {
        this.weatherDescriptionElement.classList.remove("loading");

        const current = weatherData.current;
        const weatherCode = current.weather_code;

        // Update last updated timestamp
        this.updateLastUpdatedTime();

        // Convert weather code to description
        const weatherDescriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        };

        this.temperatureElement.textContent = `${Math.round(
            current.temperature_2m
        )}°F`;
        this.weatherDescriptionElement.textContent =
            weatherDescriptions[weatherCode] || "Unknown";
        this.locationElement.textContent =
            location.name || location.admin1 || this.currentZipCode;
        this.humidityElement.textContent = `${current.relative_humidity_2m}%`;
        this.windElement.textContent = `${Math.round(
            current.wind_speed_10m
        )} mph`;
        this.feelsLikeElement.textContent = `${Math.round(
            current.apparent_temperature
        )}°F`;
    }

    displayWeather(data) {
        this.weatherDescriptionElement.classList.remove("loading");

        this.temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
        this.weatherDescriptionElement.textContent =
            data.weather[0].description;
        this.locationElement.textContent = data.name;
        this.humidityElement.textContent = `${data.main.humidity}%`;
        this.windElement.textContent = `${Math.round(data.wind.speed)} mph`;
        this.feelsLikeElement.textContent = `${Math.round(
            data.main.feels_like
        )}°F`;

        // Update last updated timestamp
        this.updateLastUpdatedTime();
    }

    updateLastUpdatedTime() {
        if (this.lastUpdatedElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            this.lastUpdatedElement.textContent = `Updated: ${hours}:${minutes}`;
            this.lastUpdatedElement.style.display = "block";
        }
    }

    displayWeatherError() {
        this.weatherDescriptionElement.classList.remove("loading");
        this.temperatureElement.textContent = "Error";
        this.weatherDescriptionElement.textContent =
            "Unable to load weather data";
        this.locationElement.textContent = this.currentZipCode;
        this.humidityElement.textContent = "--%";
        this.windElement.textContent = "-- mph";
        this.feelsLikeElement.textContent = "--°F";
    }

    saveSettings() {
        const settings = {
            clockType: this.clockType,
            showDate: this.showDate,
            showSeconds: this.showSeconds,
        };
        localStorage.setItem("clockWeatherSettings", JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem("clockWeatherSettings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.clockType = settings.clockType || "digital";
            this.showDate =
                settings.showDate !== undefined ? settings.showDate : true;
            this.showSeconds =
                settings.showSeconds !== undefined
                    ? settings.showSeconds
                    : true;

            // Apply settings
            if (this.clockType === "analog") {
                this.toggleClockType();
            }

            if (!this.showDate) {
                this.toggleDate();
            }

            if (!this.showSeconds) {
                this.toggleSeconds();
            }
        }
    }

    startScreenSaver() {
        // Move screen every 30 seconds to prevent burn-in
        setInterval(() => {
            const container = document.querySelector(".container");
            if (container) {
                // Simple random movement within a small range
                const xOffset = (Math.random() - 0.5) * 20; // ±10px
                const yOffset = (Math.random() - 0.5) * 20; // ±10px

                container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

                // Reset position after 2 seconds
                setTimeout(() => {
                    container.style.transform = "translate(0px, 0px)";
                }, 2000);
            }
        }, 30000); // 30 seconds
    }

    showOptions() {
        // Show clock settings and weather input
        const clockSettings = document.querySelector(".clock-settings");
        const locationInput = document.querySelector(".location-input");

        if (clockSettings && locationInput) {
            clockSettings.style.display = "flex";
            locationInput.style.display = "flex";
            this.menuVisible = true;
        }
    }

    hideOptions() {
        // Hide clock settings and weather input
        const clockSettings = document.querySelector(".clock-settings");
        const locationInput = document.querySelector(".location-input");

        if (clockSettings && locationInput) {
            clockSettings.style.display = "none";
            locationInput.style.display = "none";
            this.menuVisible = false;
        }
    }

    resetInactivityTimer() {
        // Clear existing timer
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        // Set new timer - hide options after 30 seconds of inactivity
        this.inactivityTimer = setTimeout(() => {
            this.hideOptions();
        }, 30000); // 30 seconds
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser");
            this.fallbackToSavedLocation();
            return;
        }

        // Show loading state
        this.showWeatherLoading();
        this.locationElement.textContent = "Getting location...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.updateWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.log("Error getting location:", error);
                this.locationElement.textContent = "Location access denied";
                this.fallbackToSavedLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }

    async updateWeatherByCoordinates(latitude, longitude) {
        // Store coordinates for refresh
        this.lastLatitude = latitude;
        this.lastLongitude = longitude;

        try {
            // Get location name from coordinates using reverse geocoding with Nominatim API
            const locationResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                    headers: {
                        "User-Agent": "ClockWeatherPWA/1.0",
                    },
                }
            );
            const locationData = await locationResponse.json();

            if (locationData && locationData.display_name) {
                // Extract city and country from the address
                const addressParts = locationData.address || {};
                const city =
                    addressParts.city ||
                    addressParts.town ||
                    addressParts.village ||
                    addressParts.hamlet ||
                    "";
                const country = addressParts.country || "";
                const displayLocation = city
                    ? `${city}, ${country}`
                    : locationData.display_name;

                this.locationElement.textContent = displayLocation;

                // Get weather data
                const weatherResponse = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
                );
                const weatherData = await weatherResponse.json();

                // Create location object with the data we have
                const location = {
                    name: city,
                    country: country,
                    latitude: latitude,
                    longitude: longitude,
                };

                this.displayWeatherOpenMeteo(weatherData, location);
            } else {
                this.locationElement.textContent = "Location not found";
                this.displayWeatherError();
            }
        } catch (error) {
            console.error("Error fetching weather by coordinates:", error);
            this.locationElement.textContent = "Weather fetch failed";
            this.displayWeatherError();
        }
    }

    fallbackToSavedLocation() {
        // Load saved zip code as fallback
        const savedZipCode = localStorage.getItem("zipCode");
        if (savedZipCode) {
            this.zipcodeInput.value = savedZipCode;
            this.currentZipCode = savedZipCode;
            this.updateWeather();
        } else {
            // Set default location if no saved location
            this.zipcodeInput.value = "10001"; // New York as default
            this.currentZipCode = "10001";
            this.updateWeather();
        }
    }

    async enableWakeLock() {
        try {
            // Check if Wake Lock API is supported
            if ("wakeLock" in navigator) {
                // Request wake lock
                this.wakeLock = await navigator.wakeLock.request("screen");
                console.log("Wake lock enabled - screen will stay on");
                this.updateWakeLockStatus(true);

                // Handle wake lock release
                this.wakeLock.addEventListener("release", () => {
                    console.log("Wake lock released");
                    this.updateWakeLockStatus(false);
                });

                // Re-request wake lock when page becomes visible again
                document.addEventListener("visibilitychange", async () => {
                    if (
                        document.visibilityState === "visible" &&
                        this.wakeLock === null
                    ) {
                        try {
                            this.wakeLock = await navigator.wakeLock.request(
                                "screen"
                            );
                            console.log("Wake lock re-enabled");
                            this.updateWakeLockStatus(true);
                        } catch (err) {
                            console.log("Failed to re-enable wake lock:", err);
                            this.updateWakeLockStatus(false);
                        }
                    }
                });
            } else {
                console.log("Wake Lock API not supported");
                this.updateWakeLockStatus(false);
            }
        } catch (err) {
            console.log("Failed to enable wake lock:", err);
            this.updateWakeLockStatus(false);
        }
    }

    updateWakeLockStatus(active) {
        const statusElement = document.getElementById("wake-lock-status");
        if (statusElement) {
            if (active) {
                statusElement.textContent = "🔋 Stay Awake";
                statusElement.classList.remove("inactive");
            } else {
                statusElement.textContent = "🔋 Sleep Mode";
                statusElement.classList.add("inactive");
            }
        }
    }

    disableWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log("Wake lock disabled");
        }
    }
}

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    new ClockWeatherApp();
});

// Handle app installation
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // You can show an install button here if desired
});

window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    deferredPrompt = null;
});
