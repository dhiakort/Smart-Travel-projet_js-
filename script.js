// SMART TRAVEL DASHBOARD 
const state = {
  allCountries: [],          // Tableau de tous les pays (Array)
  filteredCountries: [],     // Pays après filtrage/tri
  // Web Storage 
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  // sessionStorage 
  currentPage: 1,
  itemsPerPage: 12,
  exchangeRates: {},   // Taux de change (Object key:value)
  searchCount: parseInt(localStorage.getItem('searchCount')) || 0,
};
const API = {
  COUNTRIES: 'https://restcountries.com/v3.1/all',
  COUNTRIES_FALLBACK: 'https://studies.cs.helsinki.fi/restcountries/api/all',
  EXCHANGE: 'https://open.er-api.com/v6/latest/USD',
  WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
  WEATHER_KEY: 'YOUR_API_KEY_HERE', 
};
//SÉLECTION DES ÉLÉMENTS DOM (Manipulation DOM)
const el = {
  loader:        document.getElementById('loader'),
  globalSearch:  document.getElementById('globalSearch'),
  navItems:      document.querySelectorAll('.nav-item'), // NodeList (comme un tableau)
  sections:      document.querySelectorAll('.section'),
  navClock:      document.getElementById('navClock'),
  // Dashboard
  statTotal:     document.getElementById('stat-total'),
  statFavs:      document.getElementById('stat-favs'),
  statSearches:  document.getElementById('stat-searches'),
  statTemp:      document.getElementById('stat-temp'),
  featuredGrid:  document.getElementById('featuredGrid'),
  lastSearchBody:document.getElementById('lastSearchBody'),
  badgeTotal:    document.getElementById('badge-total'),
  badgeFav:      document.getElementById('badge-fav'),
  shuffleBtn:    document.getElementById('shuffleBtn'),
  // Explorer
  exploreSearch: document.getElementById('exploreSearch'),
  regionFilter:  document.getElementById('regionFilter'),
  sortFilter:    document.getElementById('sortFilter'),
  countriesGrid: document.getElementById('countriesGrid'),
  resultsCount:  document.getElementById('resultsCount'),
  pagination:    document.getElementById('pagination'),
  // Météo
  weatherInput:  document.getElementById('weatherInput'),
  weatherBtn:    document.getElementById('weatherBtn'),
  weatherResult: document.getElementById('weatherResult'),
  // Devises
  currAmount:    document.getElementById('currAmount'),
  currFrom:      document.getElementById('currFrom'),
  currTo:        document.getElementById('currTo'),
  swapBtn:       document.getElementById('swapBtn'),
  convertBtn:    document.getElementById('convertBtn'),
  currResult:    document.getElementById('currResult'),
  resultText:    document.getElementById('resultText'),
  // Favoris
  favoritesGrid: document.getElementById('favoritesGrid'),
  favEmpty:      document.getElementById('favEmpty'),
  clearFavBtn:   document.getElementById('clearFavBtn'),
  // Modal
  modal:         document.getElementById('modal'),
  modalBox:      document.getElementById('modalBox'),
  modalClose:    document.getElementById('modalClose'),
  modalContent:  document.getElementById('modalContent'),
  // Toast
  toastContainer:document.getElementById('toastContainer'),
};
// 4. POINT D'ENTRÉE : Initialisation quand le DOM est prêt
// ---------------------------------------------------------------
// 'DOMContentLoaded' est un événement déclenché quand le HTML est
// complètement chargé et parsé (sans attendre les images/CSS).
// C'est le bon moment pour commencer à manipuler le DOM.
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initClock();        // Démarrer l'horloge
  setupEvents();      // Attacher tous les écouteurs d'événements
  loadAllData();      // Charger les données depuis les APIs
});

// ================================================================
// 5. HORLOGE TEMPS RÉEL – setInterval (asynchrone, périodique)
// ---------------------------------------------------------------
// setInterval(callback, ms) : exécute une fonction toutes les X ms.
// Ici, on met à jour l'heure chaque seconde.
// ================================================================
function initClock() {
  setInterval(() => {
    const now = new Date(); // Objet Date JavaScript
    // toLocaleTimeString() formate l'heure selon la locale
    el.navClock.textContent = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, 1000); // 1000 ms = 1 seconde
}

// ================================================================
// 6. GESTION DES ÉVÉNEMENTS (Event Listeners)
// ---------------------------------------------------------------
// addEventListener(event, callback) attache un écouteur d'événement.
// On centralise tous les attachements dans une fonction pour
// la lisibilité et la modularité.
// ================================================================
function setupEvents() {
  // ✅ Navigation (itération avec forEach sur une NodeList)
  el.navItems.forEach(item => {
    item.addEventListener('click', (event) => {
      event.preventDefault(); // Empêche le comportement par défaut du lien (<a>)
      const section = item.getAttribute('data-section'); // Lire un attribut HTML
      showSection(section);
    });
  });

  // ✅ Recherche globale dans la navbar (événement 'input')
  el.globalSearch.addEventListener('input', (e) => {
    // On navigue vers l'onglet Explorer si pas déjà là
    showSection('explore');
    el.exploreSearch.value = e.target.value;
    applyFilters(); // Mise à jour en temps réel
  });

  // ✅ Filtres de la section Explorer
  el.exploreSearch.addEventListener('input', () => {
    // Validation : incrémenter le compteur seulement si terme significatif
    if (el.exploreSearch.value.length > 2) {
      state.searchCount++;
      localStorage.setItem('searchCount', state.searchCount);
      el.statSearches.textContent = state.searchCount;
    }
    applyFilters();
  });
  el.regionFilter.addEventListener('change', applyFilters);
  el.sortFilter.addEventListener('change', applyFilters);

  // ✅ Bouton Shuffle (mélanger les pays vedettes)
  el.shuffleBtn.addEventListener('click', renderFeatured);

  // ✅ Météo
  el.weatherBtn.addEventListener('click', fetchWeather);
  // Permettre de valider avec la touche Entrée (événement 'keydown')
  el.weatherInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeather();
  });

  // ✅ Conversion de devises
  el.convertBtn.addEventListener('click', convertCurrency);
  el.swapBtn.addEventListener('click', swapCurrencies);

  // ✅ Favoris
  el.clearFavBtn.addEventListener('click', clearAllFavorites);

  // ✅ Modal : fermeture au clic sur le fond ou le bouton X
  el.modalClose.addEventListener('click', closeModal);
  el.modal.addEventListener('click', (e) => {
    // e.target est l'élément cliqué ; on ferme seulement si c'est le fond
    if (e.target === el.modal) closeModal();
  });
  // Fermeture avec la touche Échap (Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ================================================================
// 7. NAVIGATION ENTRE SECTIONS (Manipulation DOM)
// ---------------------------------------------------------------
// On utilise les classes CSS pour afficher/cacher les sections.
// classList.add(), classList.remove(), classList.toggle() sont les
// méthodes clés pour manipuler les classes CSS d'un élément.
// ================================================================
function showSection(sectionId) {
  // Désactiver toutes les sections
  el.sections.forEach(s => s.classList.remove('active'));
  el.navItems.forEach(n => n.classList.remove('active'));

  // Activer la section cible
  const targetSection = document.getElementById(`section-${sectionId}`);
  const targetNav = document.getElementById(`nav-${sectionId}`);

  if (targetSection) targetSection.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  // Actions spécifiques selon la section
  if (sectionId === 'favorites') renderFavorites();
  if (sectionId === 'currency') renderPopularRates();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// 8. CHARGEMENT DES DONNÉES (async/await + fetch + Promise)
// ---------------------------------------------------------------
// async : déclare une fonction asynchrone qui retourne une Promise
// await : attend la résolution d'une Promise avant de continuer
// fetch() : envoie une requête HTTP vers une URL externe (API REST)
// try/catch : gestion d'erreurs pour les opérations asynchrones
// ================================================================
async function loadAllData() {
  try {
    // Charger les pays et les taux de change EN PARALLÈLE
    // Promise.all() exécute plusieurs Promises simultanément
    // et attend que TOUTES soient résolues
    const [countriesData, ratesData] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);

    // Stocker dans l'état global (structures de données)
    state.allCountries = countriesData;
    state.filteredCountries = [...countriesData]; // Copie du tableau avec spread operator
    state.exchangeRates = ratesData;

    // Mettre à jour l'interface
    updateDashboardStats();
    renderFeatured();
    renderCountriesGrid();
    populateCurrencySelects();

  } catch (error) {
    // ✅ Gestion d'erreur : afficher un message à l'utilisateur
    console.error('Erreur de chargement:', error);
    showToast('Erreur de chargement des données', 'error');
  } finally {
    // 'finally' s'exécute toujours, succès ou erreur
    // Cacher le loader après le chargement
    el.loader.classList.add('hidden');
  }
}

// ----------------------------------------------------------------
// Fonction de récupération des pays avec fallback (plan B)
// Si l'API principale échoue, on essaie une API de secours.
// ----------------------------------------------------------------
async function fetchCountries() {
  // ✅ Fetch + await + vérification de la réponse
  let response = await fetch(API.COUNTRIES);
  if (!response.ok) {
    // Fallback : si l'API principale est down
    console.warn('API principale indisponible, utilisation du fallback...');
    response = await fetch(API.COUNTRIES_FALLBACK);
  }
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  // response.json() retourne une Promise qui résout avec les données parsées
  return await response.json();
}

// ----------------------------------------------------------------
// Récupération des taux de change
// ----------------------------------------------------------------
async function fetchExchangeRates() {
  try {
    const response = await fetch(API.EXCHANGE);
    if (!response.ok) throw new Error('Exchange API failed');
    const data = await response.json();
    // data.rates est un objet : { "EUR": 0.92, "GBP": 0.79, ... }
    return data.rates;
  } catch (e) {
    // Si l'API de devises échoue, utiliser des données statiques de secours
    console.warn('Exchange API failed, using fallback data');
    return { USD:1, EUR:0.92, GBP:0.79, JPY:150, MAD:10.5, CAD:1.36, AUD:1.53, CHF:0.88 };
  }
}

// ================================================================
// 9. DASHBOARD – Statistiques et cartes vedettes
// ================================================================
function updateDashboardStats() {
  // ✅ Manipulation DOM : modifier le textContent de plusieurs éléments
  el.statTotal.textContent   = state.allCountries.length;
  el.statFavs.textContent    = state.favorites.length;
  el.statSearches.textContent = state.searchCount;
  el.badgeTotal.textContent  = state.allCountries.length;
  el.badgeFav.textContent    = state.favorites.length;

  // Afficher le dernier pays visité (depuis sessionStorage)
  const lastCca3 = sessionStorage.getItem('lastCountry');
  if (lastCca3) {
    // Array.find() : cherche le premier élément qui satisfait la condition
    const country = state.allCountries.find(c => c.cca3 === lastCca3);
    if (country) {
      el.lastSearchBody.innerHTML = ''; // Vider le contenu précédent
      el.lastSearchBody.appendChild(createCountryCard(country));
    }
  }
}

// ----------------------------------------------------------------
// Pays vedettes : 6 pays aléatoires
// sort(() => Math.random() - 0.5) : algorithme de mélange simple
// ----------------------------------------------------------------
function renderFeatured() {
  if (!state.allCountries.length) return;
  el.featuredGrid.innerHTML = ''; // Vider la grille

  // Mélanger et prendre les 6 premiers
  const shuffled = [...state.allCountries].sort(() => Math.random() - 0.5);
  const featured = shuffled.slice(0, 6); // slice(début, fin) extrait une portion

  // Pour chaque pays, créer une carte et l'ajouter au DOM
  featured.forEach(country => {
    el.featuredGrid.appendChild(createCountryCard(country));
  });
}

// ================================================================
// 10. EXPLORER LES PAYS – Filtrage, tri, pagination
// ================================================================
function applyFilters() {
  // Récupérer les valeurs des contrôles (lecture du DOM)
  const term   = el.exploreSearch.value.toLowerCase().trim();
  const region = el.regionFilter.value;
  const sortBy = el.sortFilter.value;

  // ✅ Array.filter() : crée un nouveau tableau avec les éléments qui passent le test
  let filtered = state.allCountries.filter(country => {
    // ✅ Validation des données : vérifier que les propriétés existent avant de les utiliser
    const name    = country.name?.common?.toLowerCase() || '';
    const capital = country.capital?.[0]?.toLowerCase() || ''; // Optional chaining ?.
    const rgn     = country.region || '';

    const matchSearch = name.includes(term) || capital.includes(term);
    const matchRegion = region === '' || rgn === region;
    return matchSearch && matchRegion;
  });

  // ✅ Array.sort() : tri en place avec une fonction de comparaison
  filtered.sort((a, b) => {
    if (sortBy === 'name')       return a.name.common.localeCompare(b.name.common);
    if (sortBy === 'population') return (b.population || 0) - (a.population || 0);
    if (sortBy === 'area')       return (b.area || 0) - (a.area || 0);
    return 0; // Pas de changement d'ordre
  });

  state.filteredCountries = filtered;
  state.currentPage = 1; // Revenir à la première page après un filtre
  renderCountriesGrid();
}

function renderCountriesGrid() {
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end   = start + state.itemsPerPage;
  // Array.slice() extrait une portion du tableau (pour la pagination)
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

// ----------------------------------------------------------------
// Pagination : boutons de navigation
// ----------------------------------------------------------------
function renderPagination() {
  const total = Math.ceil(state.filteredCountries.length / state.itemsPerPage);
  el.pagination.innerHTML = '';
  if (total <= 1) return;

  // Bouton Précédent
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.disabled = state.currentPage === 1;
  prev.onclick = () => { state.currentPage--; renderCountriesGrid(); };
  el.pagination.appendChild(prev);

  // Numéros de pages
  const startP = Math.max(1, state.currentPage - 2);
  const endP   = Math.min(total, startP + 4);
  for (let i = startP; i <= endP; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn${i === state.currentPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => { state.currentPage = i; renderCountriesGrid(); };
    el.pagination.appendChild(btn);
  }

  // Bouton Suivant
  const next = document.createElement('button');
  next.className = 'page-btn';
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.disabled = state.currentPage === total;
  next.onclick = () => { state.currentPage++; renderCountriesGrid(); };
  el.pagination.appendChild(next);
}

// ================================================================
// 11. CARTE DE PAYS – Fabrique de composant DOM
// ---------------------------------------------------------------
// createCountryCard() est une "factory function" : elle crée et
// retourne un élément DOM prêt à être inséré dans la page.
// ================================================================
function createCountryCard(country) {
  const isFav    = state.favorites.includes(country.cca3);
  const capital  = country.capital?.[0] || 'N/A';
  const pop      = country.population?.toLocaleString('fr-FR') || 'N/A';
  const flagUrl  = country.flags?.svg || country.flags?.png || '';

  // ✅ Manipulation DOM : créer un élément HTML avec JavaScript
  const card = document.createElement('div');
  card.className = 'country-card';

  // ✅ innerHTML : injecter du HTML dynamique (template literal avec backticks)
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

  // Attacher les événements aux boutons de la carte
  card.querySelector('.btn-outline').addEventListener('click', () => openModal(country));
  card.querySelector('.btn-fav').addEventListener('click', (e) => {
    e.stopPropagation(); // ⚡ Empêche la propagation de l'événement vers la carte parente
    toggleFavorite(country.cca3);
    // Mettre à jour le bouton de cette carte spécifiquement
    const btn = card.querySelector('.btn-fav');
    const nowFav = state.favorites.includes(country.cca3);
    btn.className = `btn-fav${nowFav ? ' active' : ''}`;
    btn.innerHTML = `<i class="${nowFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
  });

  // Clic sur la carte entière → ouvrir le modal
  card.addEventListener('click', () => openModal(country));

  return card;
}

// ================================================================
// 12. MODAL DÉTAIL PAYS (Manipulation DOM avancée)
// ================================================================
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

  // Activer le modal (modifier le DOM pour l'afficher)
  el.modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Bloquer le scroll de la page

  // ✅ sessionStorage : mémoriser le dernier pays vu (session uniquement)
  sessionStorage.setItem('lastCountry', country.cca3);
  updateDashboardStats();

  // Événements dans le modal
  document.getElementById('modalFavBtn').addEventListener('click', () => {
    toggleFavorite(country.cca3);
    closeModal(); // Fermer et rouvrir pour rafraîchir l'état
    openModal(country);
  });
  document.getElementById('modalWeatherBtn').addEventListener('click', () => {
    closeModal();
    showSection('weather');
    el.weatherInput.value = capital.split(',')[0]; // Prendre la première capitale
    fetchWeather();
  });
}

function closeModal() {
  el.modal.classList.remove('active');
  document.body.style.overflow = ''; // Réactiver le scroll
}

// ================================================================
// 13. FAVORIS – Web Storage (localStorage)
// ---------------------------------------------------------------
// localStorage : stockage permanent (survive à la fermeture du navigateur)
// Les données sont stockées en JSON (chaîne de caractères).
// JSON.stringify() : convertit un objet/tableau JS en chaîne JSON
// JSON.parse() : reconvertit une chaîne JSON en objet/tableau JS
// ================================================================
function toggleFavorite(cca3) {
  // ✅ Array.indexOf() : retourne l'index ou -1 si absent
  const idx = state.favorites.indexOf(cca3);

  if (idx === -1) {
    // Pas encore favori → ajouter
    state.favorites.push(cca3); // push() ajoute à la fin du tableau
    showToast('Ajouté aux favoris ❤️', 'success');
  } else {
    // Déjà favori → retirer
    state.favorites.splice(idx, 1); // splice(index, nbÀSupprimer) retire des éléments
    showToast('Retiré des favoris', 'info');
  }

  // ✅ Web Storage : sauvegarder le tableau mis à jour
  localStorage.setItem('favorites', JSON.stringify(state.favorites));

  // Mettre à jour les badges et compteurs
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

  // Pour chaque favori (CCA3 code), trouver le pays dans le tableau global
  state.favorites.forEach(cca3 => {
    const country = state.allCountries.find(c => c.cca3 === cca3);
    if (country) el.favoritesGrid.appendChild(createCountryCard(country));
  });
}

function clearAllFavorites() {
  // ✅ Validation : demander confirmation avant une action destructive
  if (!confirm('Voulez-vous vraiment effacer tous vos favoris ?')) return;

  state.favorites = [];
  localStorage.setItem('favorites', JSON.stringify([]));
  el.statFavs.textContent = 0;
  el.badgeFav.textContent = 0;
  renderFavorites();
  showToast('Favoris effacés', 'info');
}

// ================================================================
// 15. MÉTÉO – Fetch API + Async/Await + Gestion d'erreur
// ================================================================
async function fetchWeather() {
  // ✅ Validation des données d'entrée
  const city = el.weatherInput.value.trim();
  if (!city) {
    showToast('Veuillez entrer une ville', 'error');
    return;
  }

  // Afficher un indicateur de chargement pendant la requête
  el.weatherResult.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
      <p>Récupération de la météo...</p>
    </div>`;

  try {
    // ✅ Fetch vers une API externe (requête GET HTTP)
    const url = `${API.WEATHER}?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${API.WEATHER_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Si la clé API est invalide ou la ville introuvable
      if (response.status === 401) throw new Error('Clé API invalide');
      if (response.status === 404) throw new Error(`Ville "${city}" introuvable`);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json(); // Convertir la réponse en objet JS
    renderWeather(data);

    // Mettre à jour la stat de température sur le dashboard
    el.statTemp.textContent = `${Math.round(data.main.temp)}°C`;

  } catch (error) {
    // ✅ Gestion d'erreur : afficher un message clair à l'utilisateur
    console.error('Erreur météo:', error.message);

    // Si la clé API n'a pas été configurée, afficher des données de demo
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

// ----------------------------------------------------------------
// Données de démonstration si pas de clé API
// ----------------------------------------------------------------
function renderWeatherDemo(city) {
  // Simuler des données météo pour la démo
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

// ----------------------------------------------------------------
// Affichage des données météo dans le DOM
// ----------------------------------------------------------------
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

// ================================================================
// 16. CONVERTISSEUR DE DEVISES
// ================================================================
function populateCurrencySelects() {
  // Object.keys() : retourne un tableau des clés d'un objet
  const currencies = Object.keys(state.exchangeRates);

  // Vider et repeupler les listes déroulantes
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
  // ✅ Validation des données d'entrée
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

  // Formule : convertir d'abord en USD (base), puis vers la cible
  const inUSD   = amount / state.exchangeRates[from];
  const result  = inUSD * state.exchangeRates[to];
  const rate    = (state.exchangeRates[to] / state.exchangeRates[from]).toFixed(4);

  el.resultText.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}   (1 ${from} = ${rate} ${to})`;
  el.currResult.style.display = 'block';
}

function swapCurrencies() {
  // Échanger les valeurs de deux selects
  [el.currFrom.value, el.currTo.value] = [el.currTo.value, el.currFrom.value];
  convertCurrency(); // Recalculer
}

function renderPopularRates() {
  // Afficher des taux populaires dans la section devises
  const popular = ['EUR', 'GBP', 'JPY', 'MAD', 'CAD', 'AUD', 'CHF', 'CNY'];
  let container = document.getElementById('popularRatesGrid');
  if (!container || !Object.keys(state.exchangeRates).length) return;

  container.innerHTML = '';
  // Object.entries() retourne des paires [clé, valeur]
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

// ================================================================
// 17. NOTIFICATIONS TOAST (Manipulation DOM dynamique)
// ---------------------------------------------------------------
// Un "toast" est un petit message qui apparaît brièvement à l'écran.
// On crée l'élément dynamiquement, on l'ajoute au DOM, puis on le
// retire automatiquement après 3 secondes.
// ================================================================
function showToast(message, type = 'info') {
  // Mapping des icônes par type
  const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

  // Créer l'élément toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;

  // Ajouter au conteneur dans le DOM
  el.toastContainer.appendChild(toast);

  // Retirer automatiquement après 3 secondes
  setTimeout(() => {
    toast.classList.add('closing'); // Animation de sortie
    setTimeout(() => toast.remove(), 300); // Supprimer du DOM
  }, 3000);
}
