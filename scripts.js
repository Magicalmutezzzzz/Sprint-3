const API_KEY = "ad436d26a1b49548b1dd56514fc46ec9"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

function showLoading() {
    loading.classList.remove("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

function changeBackground(weather){

    document.body.classList.remove(
        "clear",
        "clouds",
        "rain",
        "snow",
        "thunderstorm"
    );

    switch(weather.toLowerCase()){

        case "clear":
            document.body.classList.add("clear");
            break;

        case "clouds":
            document.body.classList.add("clouds");
            break;

        case "rain":
        case "drizzle":
            document.body.classList.add("rain");
            break;

        case "snow":
            document.body.classList.add("snow");
            break;

        case "thunderstorm":
            document.body.classList.add("thunderstorm");
            break;

        default:
            document.body.classList.add("clear");
    }
}
function displayWeather(data){

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

    changeBackground(data.weather[0].main);

    if(feelsLike){

        feelsLike.textContent =
            `${Math.round(data.main.feels_like)}°C`;

    }

    if(windSpeed){

        windSpeed.textContent =
            `${data.wind.speed} m/s`;

    }

    if(pressure){

        pressure.textContent =
            `${data.main.pressure} hPa`;

    }

    if(visibility){

        visibility.textContent =
            `${(data.visibility/1000).toFixed(1)} km`;

    }

    if(sunrise){

        sunrise.textContent =
            new Date(data.sys.sunrise*1000)
            .toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit"
            });

    }

    if(sunset){

        sunset.textContent =
            new Date(data.sys.sunset*1000)
            .toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit"
            });

    }

}
async function getWeather(city){

    showLoading();
    error.textContent = "";

    const cacheKey = city.toLowerCase();

    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if(cachedData && (Date.now() - cachedData.timestamp < 600000)){

        displayWeather(cachedData.data);

        hideLoading();

        return;

    }

    try{

        const url =
        `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        if(!response.ok){

            throw new Error(data.message);

        }

        localStorage.setItem(cacheKey,JSON.stringify({

            data:data,

            timestamp:Date.now()

        }));

        displayWeather(data);

        cityInput.value = "";

    }

    catch(err){

        error.textContent =
        "City not found. Please try again.";

    }

    finally{

        hideLoading();

    }

}
async function getWeatherByLocation(lat,lon){

    showLoading();

    error.textContent="";

    try{

        const url =
        `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        if(!response.ok){

            throw new Error("Unable to fetch weather.");

        }

        displayWeather(data);

    }

    catch(err){

        getWeather("London");

    }

    finally{

        hideLoading();

    }

}
function getCurrentLocation(){

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(

            (position)=>{

                getWeatherByLocation(

                    position.coords.latitude,

                    position.coords.longitude

                );

            },

            ()=>{

                getWeather("London");

            }

        );

    }

    else{

        getWeather("London");

    }

}
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {
        error.textContent = "Please enter a city.";
        return;
    }

    getWeather(city);

});
cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const city = cityInput.value.trim();

        if (city !== "") {

            getWeather(city);

        }

    }

});
function refreshCachedWeather() {

    const keys = Object.keys(localStorage);

    keys.forEach(key => {

        try {

            const cache = JSON.parse(localStorage.getItem(key));

            if (!cache || !cache.timestamp) return;

            if (Date.now() - cache.timestamp > 600000) {

                localStorage.removeItem(key);

            }

        } catch {

            localStorage.removeItem(key);

        }

    });

}
window.addEventListener("load", () => {

    refreshCachedWeather();

    getCurrentLocation();

});
console.log("Weather Dashboard Loaded Successfully");