

// ===============================
// OpenWeather Configuration
// ===============================
const API_KEY = "ad436d26a1b49548b1dd56514fc46ec9"; // Replace with your own key
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ===============================
// DOM Elements
// ===============================
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const weatherIcon = document.getElementById("weatherIcon");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

// Optional Elements
const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");

// ===============================
// Fetch Weather by City
// ===============================
async function getWeather(city) {

    loading.classList.remove("hidden");
    error.textContent = "";

    const cacheKey = city.toLowerCase();

    // Check Cache
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if (cachedData && Date.now() - cachedData.timestamp < 600000) {
        displayWeather(cachedData.data);
        loading.classList.add("hidden");
        return;
    }

    try {

        const url =
            `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        displayWeather(data);

        cityInput.value = "";

    } catch {

        error.textContent = "City not found. Please try again.";

    } finally {

        loading.classList.add("hidden");

    }

}
async function getWeatherByLocation(lat, lon) {

    loading.classList.remove("hidden");

    try {

        const url =
            `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        displayWeather(data);

    } catch {

        getWeather("London");

    } finally {

        loading.classList.add("hidden");

    }

}
function displayWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    condition.textContent =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    // Optional Details
    if (feelsLike) {
        feelsLike.textContent =
            `${Math.round(data.main.feels_like)}°C`;
    }

    if (windSpeed) {
        windSpeed.textContent =
            `${data.wind.speed} m/s`;
    }

}
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (!city) {
        error.textContent = "Please enter a city.";
        return;
    }

    getWeather(city);

});

cityInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});

window.onload = () => {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                getWeatherByLocation(
                    position.coords.latitude,
                    position.coords.longitude
                );

            },

            () => {

                getWeather("London");

            }

        );

    } else {

        getWeather("London");

    }

};