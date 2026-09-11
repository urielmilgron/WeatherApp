import API_KEY from './APIConfig.js';

const weatherElement = document.getElementById('weather');
const statusElement = document.getElementById('status');
const reloadButton = document.getElementById('reloadBtn');

const CITY = 'Buenos Aires';
const MIN_LOADING_TIME_MS = 2000;

function setButtonLoading(isLoading) {
    if (!reloadButton) return;

    reloadButton.disabled = isLoading;
    reloadButton.classList.toggle('loading', isLoading);
    reloadButton.setAttribute('aria-busy', String(isLoading));
    reloadButton.innerHTML = isLoading
        ? '<span class="spinner" aria-hidden="true"></span><span>Actualizando...</span>'
        : 'Actualizar';
}

function waitForMinimumLoading(startTime) {
    const elapsed = Date.now() - startTime;
    const remaining = MIN_LOADING_TIME_MS - elapsed;

    if (remaining > 0) {
        return new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return Promise.resolve();
}

function renderLoading() {
    statusElement.textContent = 'Cargando pronóstico...';
    weatherElement.classList.add('hidden');
    statusElement.classList.remove('error');
}

function renderError(message) {
    statusElement.textContent = message;
    statusElement.classList.add('error');
    weatherElement.classList.add('hidden');
    setButtonLoading(false);
}

function renderMissingApiKey() {
    renderError('Error: falta la API key. Copiá example-ApiConfig.js a ApiConfig.js y agregá tu clave local.');
}

function renderWeather(data) {
    const current = data.current;
    const forecastDays = data.forecast.forecastday.slice(0, 5);

    statusElement.textContent = 'Pronóstico actualizado';
    statusElement.classList.remove('error');

    weatherElement.innerHTML = `
        <div class="current">
            <div>
                <p class="city">${data.location.name}</p>
                <p class="temp">${Math.round(current.temp_c)}°C</p>
            </div>
            <div class="condition">
                <img src="https:${current.condition.icon}" alt="${current.condition.text}">
                <p>${current.condition.text}</p>
            </div>
        </div>

        <div class="forecast">
            ${forecastDays.map((day) => `
                <article class="day-card">
                    <p class="day-name">${new Date(day.date).toLocaleDateString('es-AR', { weekday: 'short' })}</p>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p class="day-temp">${Math.round(day.day.maxtemp_c)}°</p>
                    <p>${Math.round(day.day.mintemp_c)}°</p>
                </article>
            `).join('')}
        </div>
    `;

    weatherElement.classList.remove('hidden');
}

async function fetchWeather() {
    const startTime = Date.now();

    try {
        if (!API_KEY || API_KEY.includes('[ACÁ') || API_KEY.includes('[')) {
            setButtonLoading(false);
            renderMissingApiKey();
            return;
        }

        renderLoading();
        setButtonLoading(true);

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(CITY)}&days=5&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error('No se pudo obtener el pronóstico.');
        }

        const data = await response.json();
        await waitForMinimumLoading(startTime);
        renderWeather(data);
    } catch (error) {
        await waitForMinimumLoading(startTime);
        renderError('Error: no se pudo cargar el clima. Revisá la configuración de la API.');
    } finally {
        setButtonLoading(false);
    }
}

reloadButton.addEventListener('click', fetchWeather);
setButtonLoading(false);
fetchWeather();

