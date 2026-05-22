const state = {
  allCountries: [],          
  filteredCountries: [],     
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  theme: localStorage.getItem('theme') || 'dark',
  currentPage: 1,
  itemsPerPage: 12,
  exchangeRates: {},        
  searchCount: parseInt(localStorage.getItem('searchCount')) || 0,
};

const API = {
  COUNTRIES: 'https://restcountries.com/v3.1/all',
  COUNTRIES_FALLBACK: 'https://studies.cs.helsinki.fi/restcountries/api/all',
  EXCHANGE: 'https://open.er-api.com/v6/latest/USD',
  WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
  WEATHER_KEY: 'YOUR_API_KEY_HERE', 
};

const el = {
  loader:        document.getElementById('loader'),
  globalSearch:  document.getElementById('globalSearch'),
  navItems:      document.querySelectorAll('.nav-item'),
  sections:      document.querySelectorAll('.section'),
  themeToggle:   document.getElementById('themeToggle'),
  themeIcon:     document.getElementById('themeIcon'),
  navClock:      document.getElementById('navClock'),
  statTotal:     document.getElementById('stat-total'),
  statFavs:      document.getElementById('stat-favs'),
  statSearches:  document.getElementById('stat-searches'),
  statTemp:      document.getElementById('stat-temp'),
  featuredGrid:  document.getElementById('featuredGrid'),
  lastSearchBody:document.getElementById('lastSearchBody'),
  badgeTotal:    document.getElementById('badge-total'),
  badgeFav:      document.getElementById('badge-fav'),
  shuffleBtn:    document.getElementById('shuffleBtn'),
  exploreSearch: document.getElementById('exploreSearch'),
  regionFilter:  document.getElementById('regionFilter'),
  sortFilter:    document.getElementById('sortFilter'),
  countriesGrid: document.getElementById('countriesGrid'),
  resultsCount:  document.getElementById('resultsCount'),
  pagination:    document.getElementById('pagination'),
  // Météo
  weatherBtn:    document.getElementById('weatherBtn'),
  weatherResult: document.getElementById('weatherResult'),
  // Devises
  currFrom:      document.getElementById('currFrom'),
  currTo:        document.getElementById('currTo'),
  swapBtn:       document.getElementById('swapBtn'),
  convertBtn:    document.getElementById('convertBtn'),
  currResult:    document.getElementById('currResult'),
  resultText:    document.getElementById('resultText'),
  // Favoris
  favEmpty:      document.getElementById('favEmpty'),
  clearFavBtn:   document.getElementById('clearFavBtn'),
  // Modal
  modalBox:      document.getElementById('modalBox'),
  modalClose:    document.getElementById('modalClose'),
  modalContent:  document.getElementById('modalContent'),
  // Toast
  

document.addEventListener('DOMContentLoaded', () => {
  initTheme();       
  initClock();       
  setupEvents(
  initClock();
  setupEvents();
  loadAllData();
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  el.themeIcon.className = state.theme === 'dark'
    ? 'fa-solid fa-moon'
    : 'fa-solid fa-sun';
}

function initClock() {
  setInterval(() => {
    const now = new Date(); 
    el.navClock.textContent
    el.navClock.textContent = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, 1000);
function setupEvents() {
  el.themeToggle.addEventListener('click', toggleTheme);
  el.navItems.forEach(item => {
    item.addEventListener('click', (event) => {
      event.preventDefault(); 
      const section = item.ge
      const section = item.getAttribute('data-section');
      showSection(section);
    });
  });
  el.globalSearch.addEventListener('input', (e) => {
    showSection('explore');
    el.exploreSearch.value = e.target.value;
    applyFilters();

  el.exploreSearch.addEventListener('input', () => {
    if (el.exploreSearch.value.length > 2) {
      state.searchCount++;
      localStorage.setItem('searchCount', state.searchCount);
      el.statSearches.textContent = state.searchCount;
    }
    applyFilters();
  });
  el.regionFilter.addEventListener('change', applyFilters);
  el.sortFilter.addEventListener('change', applyFilters);
  el.shuffleBtn.addEventListener('click', renderFeatured);
  el.weatherBtn.addEventListener('click', fetchWeather);
  el.weatherInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeather();
  });
  el.convertBtn.addEventListener('click', convertCurrency);
  el.swapBtn.addEventListener('click', swapCurrencies);
  el.clearFavBtn.addEventListener('click', clearAllFavorites);
  el.modalClose.addEventListener('click', closeModal);
  el.modal.addEventListener('click', (e) => {
    if (e.target === el.modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function showSection(sectionId) {
  el.sections.forEach(s => s.classList.remove('active'));
  el.navItems.forEach(n => n.classList.remove('active'));
  const targetSection = document.getElementById(`section-${sectionId}`);
  const targetNav = document.getElementById(`nav-${sectionId}`);

  if (targetSection) targetSection.classList.add('active');
  if (targetNav) targetNav.classList.add('active');
  if (sectionId === 'favorites') renderFavorites();
  if (sectionId === 'currency') renderPopularRates();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadAllData() {
  try {
    const [countriesData, ratesData] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);
    state.allCountries = countriesData;
    state.filteredCountries = [...countriesData];
    state.exchangeRates = ratesData;
    updateDashboardStats();
    renderFeatured();
    renderCountriesGrid();
    populateCurrencySelects();

  } catch (error) {
    console.error('Erreur de chargement:', error);
    showToast('Erreur de chargement des données', 'error');
  } finally {
    el.loader.classList.add('hidden');
  }
}
async function fetchCountries() {
  let response = await fetch(API.COUNTRIES);
  if (!response.ok) {
    console.warn('API principale indisponible, utilisation du fallback...');
    response = await fetch(API.COUNTRIES_FALLBACK);
  }
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return await response.json();
}
async function fetchExchangeRates() {
  try {
    const response = await fetch(API.EXCHANGE);
    if (!response.ok) throw new Error('Exchange API failed');
    const data = await response.json();
    return data.rates;
  } catch (e) {
    console.warn('Exchange API failed, using fallback data');
    return { USD:1, EUR:0.92, GBP:0.79, JPY:150, MAD:10.5, CAD:1.36, AUD:1.53, CHF:0.88 };
  }
}

function updateDashboardStats() {
  el.statTotal.textContent   = state.allCountries.length;
  el.statFavs.textContent    = state.favorites.length;
  el.statSearches.textContent = state.searchCount;
  el.badgeTotal.textContent  = state.allCountries.length;
  el.badgeFav.textContent    = state.favorites.length;

  const lastCca3 = sessionStorage.getItem('lastCountry');
  if (lastCca3) {
    const country = state.allCountries.find(c => c.cca3 === lastCca3);
    if (country) {
      el.lastSearchBody.innerHTML = '';
      el.lastSearchBody.appendChild(createCountryCard(country));
    }
  }
}

function renderFeatured() {
  if (!state.allCountries.length) return;
  el.featuredGrid.innerHTML = '';
  const shuffled = [...state.allCountries].sort(() => Math.random() - 0.5);
  const featured = shuffled.slice(0, 6);
  featured.forEach(country => {
    el.featuredGrid.appendChild(createCountryCard(country));
  });
}

function applyFilters() {
  const term   = el.exploreSearch.value.toLowerCase().trim();
  const region = el.regionFilter.value;
  const sortBy = el.sortFilter.value;
  let filtered = state.allCountries.filter(country => {
    const name    = country.name?.common?.toLowerCase() || '';
    const capital = country.capital?.[0]?.toLowerCase() || '';
    const rgn     = country.region || '';

    const matchSearch = name.includes(term) || capital.includes(term);
    const matchRegion = region === '' || rgn === region;
    return matchSearch && matchRegion;
  });
  filtered.sort((a, b) => {
    if (sortBy === 'name')       return a.name.common.localeCompare(b.name.common);
    if (sortBy === 'population') return (b.population || 0) - (a.population || 0);
    if (sortBy === 'area')       return (b.area || 0) - (a.area || 0);
    return 0;
  });

  state.filteredCountries = filtered;
  state.currentPage = 1;
  renderCountriesGrid();
}
function renderCountriesGrid() {
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end   = start + state.itemsPerPage;
  const pageItems = state.filteredCountries.slice(start, end);

  el.countriesGrid.innerHTML = '';

  if (pageItems.length === 0) {
    el.countriesGrid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-ghost fa-3x"></i><p>Aucun pays trouvé</p></div>`;
    el.resultsCount.textContent = '0 résultats';
    el.pagination.innerHTML = '';
    return;
  }

  el.resultsCount.textContent = `Affichage ${start + 1}–${Math.min(end, state.filteredCountries.length)} sur ${state.filteredCountries.length} pays`;

  pageItems.forEach(country => {
    el.countriesGrid.appendChild(createCountryCard(country));
  });

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(state.filteredCountries.length / state.itemsPerPage);
  el.pagination.innerHTML = '';
  if (total <= 1) return;
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.disabled = state.currentPage === 1;
  prev.onclick = () => { state.currentPage--; renderCountriesGrid(); };
  el.pagination.appendChild(prev);

  const startP = Math.max(1, state.currentPage - 2);
  const endP   = Math.min(total, startP + 4);
  for (let i = startP; i <= endP; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn${i === state.currentPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => { state.currentPage = i; renderCountriesGrid(); };
    el.pagination.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.disabled = state.currentPage === total;
  next.onclick = () => { state.currentPage++; renderCountriesGrid(); };
  el.pagination.appendChild(next);
}

function createCountryCard(country) {
  const isFav    = state.favorites.includes(country.cca3);
  const capital  = country.capital?.[0] || 'N/A';
  const pop      = country.population?.toLocaleString('fr-FR') || 'N/A';
  const flagUrl  = country.flags?.svg || country.flags?.png || '';

  const card = document.createElement('div');
  card.className = 'country-card';

  card.innerHTML = `
    <img src="${flagUrl}" alt="Drapeau ${country.name.common}" class="card-flag" loading="lazy">
    <div class="card-body">
      <h3 class="card-name" title="${country.name.common}">${country.name.common}</h3>
      <div class="card-detail"><i class="fa-solid fa-city"></i> ${capital}</div>
      <div class="card-detail"><i class="fa-solid fa-users"></i> ${pop}</div>
      <div class="card-detail"><i class="fa-solid fa-globe"></i> ${country.region || 'N/A'}</div>
      <div class="card-actions">
        <button class="btn-outline">Détails</button>
        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${country.cca3}">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
    </div>
  `;
  card.querySelector('.btn-outline').addEventListener('click', () => openModal(country));
  card.querySelector('.btn-fav').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(country.cca3);
    const btn = card.querySelector('.btn-fav');
    const nowFav = state.favorites.includes(country.cca3);
    btn.className = `btn-fav${nowFav ? ' active' : ''}`;
    btn.innerHTML = `<i class="${nowFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
  });

  card.addEventListener('click', () => openModal(country));

  return card;
}

function openModal(country) {
  const isFav      = state.favorites.includes(country.cca3);
  const capital    = country.capital?.join(', ') || 'N/A';
  const currencies = country.currencies
    ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ')
    : 'N/A';
  const languages  = country.languages
    ? Object.values(country.languages).join(', ')
    : 'N/A';

  el.modalContent.innerHTML = `
    <img src="${country.flags?.svg}" alt="${country.name.common}" class="modal-flag">
    <h2 class="modal-title">${country.name.common}</h2>
    <div class="modal-badges">
      <span class="modal-badge">${country.region || 'N/A'}</span>
      <span class="modal-badge">${country.subregion || 'N/A'}</span>
    </div>
    <div class="modal-grid">
      <div class="modal-info"><div class="info-label">Capitale</div><div class="info-value">${capital}</div></div>
      <div class="modal-info"><div class="info-label">Population</div><div class="info-value">${country.population?.toLocaleString('fr-FR') || 'N/A'}</div></div>
      <div class="modal-info"><div class="info-label">Superficie (km²)</div><div class="info-value">${country.area?.toLocaleString('fr-FR') || 'N/A'}</div></div>
      <div class="modal-info"><div class="info-label">Devises</div><div class="info-value">${currencies}</div></div>
      <div class="modal-info"><div class="info-label">Langues</div><div class="info-value">${languages}</div></div>
      <div class="modal-info"><div class="info-label">Fuseau horaire</div><div class="info-value">${country.timezones?.[0] || 'N/A'}</div></div>
    </div>
    <div style="margin-top:20px; display:flex; gap:12px;">
      <button class="btn-primary" id="modalFavBtn">
        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        ${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      </button>
      <button class="btn-ghost" id="modalWeatherBtn">
        <i class="fa-solid fa-cloud-sun"></i> Météo
      </button>
    </div>
  `;

  el.modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  sessionStorage.setItem('lastCountry', country.cca3);
  updateDashboardStats();

  document.getElementById('modalFavBtn').addEventListener('click', () => {
    toggleFavorite(country.cca3);
    closeModal();
    openModal(country);
  });
  document.getElementById('modalWeatherBtn').addEventListener('click', () => {
    closeModal();
    showSection('weather');
    el.weatherInput.value = capital.split(',')[0];
    fetchWeather();
  });
}

function closeModal() {
  el.modal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleFavorite(cca3) {
  const idx = state.favorites.indexOf(cca3);

  if (idx === -1) {
    state.favorites.push(cca3);
    showToast('Ajouté aux favoris ❤️', 'success');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Retiré des favoris', 'info');
  }

  localStorage.setItem('favorites', JSON.stringify(state.favorites));

  el.statFavs.textContent  = state.favorites.length;
  el.badgeFav.textContent  = state.favorites.length;
}

function renderFavorites() {
  el.favoritesGrid.innerHTML = '';

  if (state.favorites.length === 0) {
    el.favoritesGrid.style.display = 'none';
    el.favEmpty.style.display = 'flex';
    return;
  }

  el.favoritesGrid.style.display = 'grid';
  el.favEmpty.style.display = 'none';

  state.favorites.forEach(cca3 => {
    const country = state.allCountries.find(c => c.cca3 === cca3);
    if (country) el.favoritesGrid.appendChild(createCountryCard(country));
  });
}

function clearAllFavorites() {
  if (!confirm('Voulez-vous vraiment effacer tous vos favoris ?')) return;

  state.favorites = [];
  localStorage.setItem('favorites', JSON.stringify([]));
  el.statFavs.textContent = 0;
  el.badgeFav.textContent = 0;
  renderFavorites();
  showToast('Favoris effacés', 'info');
}

async function fetchWeather() {
  const city = el.weatherInput.value.trim();
  if (!city) {
    showToast('Veuillez entrer une ville', 'error');
    return;
  }

  el.weatherResult.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
      <p>Récupération de la météo...</p>
    </div>`;

  try {
    const url = `${API.WEATHER}?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${API.WEATHER_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) throw new Error('Clé API invalide');
      if (response.status === 404) throw new Error(`Ville "${city}" introuvable`);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    renderWeather(data);

    el.statTemp.textContent = `${Math.round(data.main.temp)}°C`;

  } catch (error) {
    console.error('Erreur météo:', error.message);

    if (API.WEATHER_KEY === 'YOUR_API_KEY_HERE') {
      renderWeatherDemo(city);
      return;
    }

    el.weatherResult.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation fa-2x" style="color:var(--accent-red)"></i>
        <p>${error.message}</p>
        <small style="color:var(--text-secondary)">Vérifiez votre connexion ou clé API</small>
      </div>`;
    showToast(error.message, 'error');
  }
}

function renderWeatherDemo(city) {
  const mockData = {
    name: city,
    sys: { country: 'Demo' },
    main: { temp: 22 + (city.length % 15), humidity: 55, pressure: 1013, feels_like: 21 },
    wind: { speed: 4.5 },
    weather: [{ description: 'ciel dégagé (démo)', icon: '01d' }]
  };
  renderWeather(mockData);
  showToast('⚠️ Données de démo – configurez votre clé API', 'info');
}

function renderWeather(data) {
  const icon = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  el.weatherResult.innerHTML = `
    <div class="weather-card">
      <div class="weather-main">
        <h2 class="weather-city">${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="Météo" class="weather-icon" style="width:100px">
        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
        <div class="weather-desc">${data.weather[0].description}</div>
      </div>
      <div class="weather-details">
        <div class="w-detail">
          <i class="fa-solid fa-droplet"></i>
          <span class="w-value">${data.main.humidity}%</span>
          <span class="w-label">Humidité</span>
        </div>
        <div class="w-detail">
          <i class="fa-solid fa-wind"></i>
          <span class="w-value">${data.wind.speed} m/s</span>
          <span class="w-label">Vent</span>
        </div>
        <div class="w-detail">
          <i class="fa-solid fa-temperature-arrow-up"></i>
          <span class="w-value">${Math.round(data.main.feels_like)}°C</span>
          <span class="w-label">Ressenti</span>
        </div>
        <div class="w-detail">
          <i class="fa-solid fa-gauge"></i>
          <span class="w-value">${data.main.pressure} hPa</span>
          <span class="w-label">Pression</span>
        </div>
      </div>
    </div>`;
}

function populateCurrencySelects() {
  const currencies = Object.keys(state.exchangeRates);

  [el.currFrom, el.currTo].forEach(select => {
    select.innerHTML = '';
    currencies.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code;
      select.appendChild(option);
    });
  });

  el.currFrom.value = 'USD';
  el.currTo.value   = 'EUR';
}

function convertCurrency() {
  const amount = parseFloat(el.currAmount.value);
  const from   = el.currFrom.value;
  const to     = el.currTo.value;

  if (isNaN(amount) || amount < 0) {
    showToast('Montant invalide', 'error');
    return;
  }
  if (!state.exchangeRates[from] || !state.exchangeRates[to]) {
    showToast('Devise introuvable', 'error');
    return;
  }

  const inUSD   = amount / state.exchangeRates[from];
  const result  = inUSD * state.exchangeRates[to];
  const rate    = (state.exchangeRates[to] / state.exchangeRates[from]).toFixed(4);

  el.resultText.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}   (1 ${from} = ${rate} ${to})`;
  el.currResult.style.display = 'block';
}

function swapCurrencies() {
  [el.currFrom.value, el.currTo.value] = [el.currTo.value, el.currFrom.value];
  convertCurrency();
}

function renderPopularRates() {
  const popular = ['EUR', 'GBP', 'JPY', 'MAD', 'CAD', 'AUD', 'CHF', 'CNY'];
  let container = document.getElementById('popularRatesGrid');
  if (!container || !Object.keys(state.exchangeRates).length) return;

  container.innerHTML = '';
  popular.forEach(code => {
    const rate = state.exchangeRates[code];
    if (!rate) return;
    const div = document.createElement('div');
    div.className = 'pop-rate-card';
    div.innerHTML = `
      <span class="pop-rate-code">${code}</span>
      <span class="pop-rate-value">${rate.toFixed(4)}</span>
      <span class="pop-rate-label">1 USD</span>
    `;
    container.appendChild(div);
  });
}

function showToast(message, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;

  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('closing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
