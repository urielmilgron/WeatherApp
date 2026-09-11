import API_KEY from './APIConfig.js';

const weatherElement = document.getElementById('weather');
const statusElement = document.getElementById('status');
const reloadButton = document.getElementById('reloadBtn');

const CITY = 'Buenos Aires';
const MIN_LOADING_TIME_MS = 2000;

function setButtonLoading(isLoading) {
    if (!reloadButton) return;

    const buttonLabel = reloadButton.dataset.buttonLabel || 'Actualizar';

    reloadButton.disabled = isLoading;
    reloadButton.classList.toggle('loading', isLoading);
    reloadButton.setAttribute('aria-busy', String(isLoading));
    reloadButton.innerHTML = isLoading
        ? '<span class="spinner" aria-hidden="true"></span><span>Actualizando...</span>'
        : buttonLabel;
}

function setButtonReady(label = 'Actualizar') {
    if (!reloadButton) return;

    reloadButton.dataset.buttonLabel = label;
    setButtonLoading(false);
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
    statusElement.textContent = 'Buscando el pronóstico...';
    weatherElement.classList.add('hidden');
    statusElement.classList.remove('error');
}

function renderError(message) {
    statusElement.textContent = message;
    statusElement.classList.add('error');
    weatherElement.classList.add('hidden');
    setButtonReady('Reintentar');
}

function renderMissingApiKey() {
    renderError('Falta la clave de acceso. Copiá el ejemplo y agregá tu API key local para continuar.');
}

function renderRequestFailure() {
    renderError('No pudimos cargar el clima. Revisá tu conexión y la clave de la API.');
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
            setButtonReady('Reintentar');
            renderMissingApiKey();
            return;
        }

        renderLoading();
        setButtonLoading(true);

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(CITY)}&days=5&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        await waitForMinimumLoading(startTime);
        renderWeather(data);
    } catch (error) {
        await waitForMinimumLoading(startTime);
        renderRequestFailure();
    } finally {
        setButtonReady('Reintentar');
    }
}

reloadButton.addEventListener('click', fetchWeather);
setButtonReady('Actualizar');
fetchWeather();

