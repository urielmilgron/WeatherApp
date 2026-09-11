import API_KEY from './APIConfig.js';

const weatherElement = document.getElementById('weather');
const statusElement = document.getElementById('status');
const reloadButton = document.getElementById('reloadBtn');
const citySelect = document.getElementById('citySelect');
const countrySelect = document.getElementById('countrySelect');
const mapSurface = document.getElementById('mapSurface');

const DEFAULT_COUNTRY = 'Argentina';
const DEFAULT_CITY = 'Buenos Aires';
const MIN_LOADING_TIME_MS = 2000;

const COUNTRY_CITIES = {
    Argentina: [
        { name: 'Buenos Aires', x: 57, y: 70 },
        { name: 'Córdoba', x: 48, y: 58 },
        { name: 'Rosario', x: 55, y: 64 },
        { name: 'Mendoza', x: 36, y: 52 },
        { name: 'Bariloche', x: 32, y: 30 }
    ],
    España: [
        { name: 'Madrid', x: 58, y: 46 },
        { name: 'Barcelona', x: 62, y: 38 },
        { name: 'Valencia', x: 54, y: 54 },
        { name: 'Sevilla', x: 49, y: 64 }
    ],
    Brasil: [
        { name: 'São Paulo', x: 48, y: 70 },
        { name: 'Rio de Janeiro', x: 52, y: 76 },
        { name: 'Brasília', x: 47, y: 58 },
        { name: 'Salvador', x: 54, y: 82 }
    ]
};

const COUNTRY_SHAPES = {
    Argentina: 'M18 17 L31 12 L42 10 L55 15 L67 18 L74 24 L81 31 L86 40 L88 53 L83 66 L77 75 L71 83 L62 90 L52 94 L41 90 L33 86 L25 78 L18 68 L12 59 L10 47 L12 35 L15 26 Z',
    España: 'M42 19 L52 14 L62 17 L71 24 L76 32 L74 41 L69 49 L73 57 L67 66 L61 74 L52 79 L45 77 L39 70 L32 62 L27 53 L29 42 L34 30 L38 24 Z',
    Brasil: 'M24 23 L36 16 L49 15 L60 20 L70 28 L78 38 L82 49 L80 60 L74 72 L68 80 L60 88 L50 92 L39 88 L30 79 L23 69 L17 58 L14 45 L16 32 L20 27 Z'
};

function getSelectedCountry() {
    return countrySelect?.value || DEFAULT_COUNTRY;
}

function getSelectedCity() {
    return citySelect?.value || DEFAULT_CITY;
}

function buildCityOptions() {
    const country = getSelectedCountry();
    const cities = COUNTRY_CITIES[country] || COUNTRY_CITIES[DEFAULT_COUNTRY];

    citySelect.innerHTML = cities
        .map((city) => `<option value="${city.name}">${city.name}</option>`)
        .join('');

    const fallbackCity = cities.some((city) => city.name === getSelectedCity())
        ? getSelectedCity()
        : cities[0].name;

    citySelect.value = fallbackCity;
}

function renderMap() {
    const country = getSelectedCountry();
    const cities = COUNTRY_CITIES[country] || COUNTRY_CITIES[DEFAULT_COUNTRY];
    const selectedCity = getSelectedCity();

    mapSurface.innerHTML = `
        <svg class="country-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Mapa de ${country}">
            <path class="country-fill" d="${COUNTRY_SHAPES[country] || COUNTRY_SHAPES[DEFAULT_COUNTRY]}" />
        </svg>
        ${cities
            .map((city) => `
                <button
                    class="city-point ${city.name === selectedCity ? 'is-active' : ''}"
                    type="button"
                    data-city="${city.name}"
                    aria-label="Seleccionar ${city.name}"
                    style="left: ${city.x}%; top: ${city.y}%"
                ></button>
            `)
            .join('')}
    `;

    mapSurface.querySelectorAll('.city-point').forEach((button) => {
        button.addEventListener('click', () => {
            citySelect.value = button.dataset.city;
            fetchWeather();
            renderMap();
        });
    });
}

function updateSelectedLocation() {
    buildCityOptions();
    renderMap();
}

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

function renderLoading(city = getSelectedCity()) {
    if (!statusElement) return;

    statusElement.textContent = `Actualizando el pronóstico de ${city}...`;
    weatherElement.classList.add('hidden');
    statusElement.classList.remove('error');
}

function renderError(message) {
    if (!statusElement) return;

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
    if (!data || !data.current || !data.forecast || !Array.isArray(data.forecast.forecastday)) {
        renderRequestFailure();
        return;
    }

    const current = data.current;
    const forecastDays = data.forecast.forecastday.slice(0, 5);
    const cityName = data.location?.name || getSelectedCity();

    if (!statusElement) return;

    statusElement.textContent = `Pronóstico actualizado para ${cityName}`;
    statusElement.classList.remove('error');

    weatherElement.innerHTML = `
        <div class="current">
            <div>
                <p class="city">${data.location?.name || cityName}</p>
                <p class="temp">${Math.round(current.temp_c)}°C</p>
                <p class="meta">Sensación térmica: ${Math.round(current.feelslike_c)}°C</p>
            </div>
            <div class="condition">
                <img src="https:${current.condition?.icon || '//cdn.weatherapi.com/weather/64x64/day/113.png'}" alt="${current.condition?.text || 'Clima'}">
                <p>${current.condition?.text || 'Sin descripción'}</p>
            </div>
        </div>

        <div class="weather-stats">
            <div class="stat-card">
                <span class="stat-label">Humedad</span>
                <strong>${current.humidity ?? '--'}%</strong>
            </div>
            <div class="stat-card">
                <span class="stat-label">Viento</span>
                <strong>${Math.round(current.wind_kph ?? 0)} km/h</strong>
            </div>
            <div class="stat-card">
                <span class="stat-label">Máx.</span>
                <strong>${Math.round(forecastDays[0]?.day?.maxtemp_c ?? current.temp_c)}°C</strong>
            </div>
            <div class="stat-card">
                <span class="stat-label">Mín.</span>
                <strong>${Math.round(forecastDays[0]?.day?.mintemp_c ?? current.temp_c)}°C</strong>
            </div>
        </div>

        <div class="forecast">
            ${forecastDays.map((day) => `
                <article class="day-card">
                    <p class="day-name">${new Date(day.date).toLocaleDateString('es-AR', { weekday: 'short' })}</p>
                    <img src="https:${day.day?.condition?.icon || '//cdn.weatherapi.com/weather/64x64/day/113.png'}" alt="${day.day?.condition?.text || 'Clima'}">
                    <p class="day-temp">${Math.round(day.day?.maxtemp_c ?? 0)}°</p>
                    <p>${Math.round(day.day?.mintemp_c ?? 0)}°</p>
                </article>
            `).join('')}
        </div>
    `;

    weatherElement.classList.remove('hidden');
}

async function fetchWeather() {
    const startTime = Date.now();
    const city = getSelectedCity();
    const country = getSelectedCountry();
    let shouldUseRetryLabel = false;

    try {
        if (!API_KEY || API_KEY.includes('[ACÁ') || API_KEY.includes('[')) {
            shouldUseRetryLabel = true;
            renderMissingApiKey();
            return;
        }

        renderLoading(`${city}, ${country}`);
        setButtonLoading(true);

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(`${city}, ${country}`)}&days=5&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        await waitForMinimumLoading(startTime);
        renderWeather(data);
        shouldUseRetryLabel = false;
    } catch (error) {
        await waitForMinimumLoading(startTime);
        shouldUseRetryLabel = true;
        renderRequestFailure();
    } finally {
        setButtonReady(shouldUseRetryLabel ? 'Reintentar' : 'Actualizar');
    }
}

countrySelect?.addEventListener('change', () => {
    updateSelectedLocation();
    fetchWeather();
});

citySelect?.addEventListener('change', () => {
    renderMap();
    fetchWeather();
});

reloadButton.addEventListener('click', fetchWeather);
setButtonReady('Actualizar');
buildCityOptions();
renderMap();
fetchWeather();

