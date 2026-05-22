# 🌍 Smart Travel Dashboard — Documentation Technique

> **Projet pédagogique JavaScript** — Maîtrise du développement web côté client

---

## 📋 Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Structure du projet](#structure-du-projet)
3. [Fonctionnalités](#fonctionnalités)
4. [Concepts JavaScript démontrés](#concepts-javascript-démontrés)
5. [APIs utilisées](#apis-utilisées)
6. [Installation et lancement](#installation-et-lancement)
7. [Explication du code source](#explication-du-code-source)
8. [Questions d'examen probables et réponses](#questions-dexamen-probables-et-réponses)

---

## Présentation du projet

**Smart Travel Dashboard** est une application web **100% côté client** (HTML + CSS + JavaScript Vanilla) permettant d'explorer les pays du monde, consulter la météo en temps réel, convertir des devises et gérer une liste de favoris.

Elle a été conçue pour démontrer **toutes les compétences fondamentales** du développement JavaScript moderne :

| Compétence | Où dans le code |
|---|---|
| Manipulation du DOM | `createCountryCard()`, `renderCountriesGrid()`, `openModal()` |
| Gestion des événements | `setupEvents()` — lignes 60–100 |
| Structures de données | `state` object, `Array.filter()`, `Array.sort()`, `Object.keys()` |
| Modularité du code | Fonctions séparées par responsabilité |
| Validation des données | `fetchWeather()`, `convertCurrency()`, `applyFilters()` |
| Web Storage | `localStorage` (favoris, thème) + `sessionStorage` (dernier pays) |
| Fetch API + REST | `fetchCountries()`, `fetchExchangeRates()`, `fetchWeather()` |
| Async / Await | `loadAllData()`, `fetchCountries()`, `fetchWeather()` |

---

## Structure du projet

```
projet_js/
│
├── index.html     → Structure HTML de l'application (5 sections, 1 modal)
├── style.css      → Design : variables CSS, glassmorphism, responsive
├── script.js      → Logique complète (~300 lignes de code + commentaires)
└── README.md      → Documentation technique (ce fichier)
```

### Rôle de chaque fichier

| Fichier | Responsabilité |
|---|---|
| `index.html` | Définit la structure (squelette) de la page. Contient les IDs référencés en JS. |
| `style.css` | Gère l'apparence : variables CSS, animations, responsive design. |
| `script.js` | Toute la logique : données, événements, appels API, rendu dynamique. |

---

## Fonctionnalités

### 1. 🏠 Dashboard
- Statistiques dynamiques (nombre de pays, favoris, recherches)
- 6 pays vedettes tirés aléatoirement à chaque clic sur "Mélanger"
- Affichage du dernier pays visité (via `sessionStorage`)

### 2. 🌐 Explorer les pays
- **Recherche en temps réel** par nom ou capitale (événement `input`)
- **Filtrage** par région géographique (événement `change`)
- **Tri** par nom, population ou superficie (`Array.sort()`)
- **Pagination** : 12 pays par page avec navigation

### 3. ⛅ Météo en direct
- Requête vers **OpenWeatherMap API** (clé API requise)
- Affichage : température, ressenti, humidité, vent, pression
- **Fallback** : données de démo si pas de clé API
- Validation du champ de saisie avant la requête

### 4. 💱 Convertisseur de devises
- Taux de change live via **ExchangeRate-API** (sans clé)
- Conversion bidirectionnelle avec bouton d'inversion
- Validation des données (montant négatif, devise invalide)

### 5. ❤️ Favoris
- Ajout/suppression depuis n'importe quelle carte pays
- Persistance via **localStorage** (survive au rechargement)
- Confirmation avant suppression totale

---

## Concepts JavaScript démontrés

### ✅ 1. Manipulation du DOM

```javascript
// Sélectionner un élément par son ID
const loader = document.getElementById('loader');

// Sélectionner plusieurs éléments (retourne une NodeList)
const navItems = document.querySelectorAll('.nav-item');

// Créer un élément dynamiquement
const card = document.createElement('div');
card.className = 'country-card';
card.innerHTML = `<h3>${country.name.common}</h3>`;

// Ajouter au DOM
document.getElementById('grid').appendChild(card);

// Modifier les classes CSS
loader.classList.add('hidden');
modal.classList.toggle('active');

// Modifier un attribut HTML
document.documentElement.setAttribute('data-theme', 'dark');
```

---

### ✅ 2. Gestion des événements

```javascript
// Événement clic
button.addEventListener('click', () => { ... });

// Événement clavier
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchWeather();
});

// Événement saisie (temps réel)
searchInput.addEventListener('input', applyFilters);

// Événement sur le document entier
document.addEventListener('DOMContentLoaded', () => {
  // Le HTML est chargé, on peut manipuler le DOM
  loadAllData();
});

// Stopper la propagation d'un événement
btn.addEventListener('click', (e) => {
  e.stopPropagation(); // N'atteint pas les parents
});
```

---

### ✅ 3. Structures de données JavaScript

```javascript
// Object : état global de l'application
const state = {
  allCountries: [],       // Array
  favorites: [],          // Array
  exchangeRates: {},      // Object (key:value)
  currentPage: 1,         // Number
  theme: 'dark',          // String
};

// Array.filter() : créer un sous-tableau
const europe = countries.filter(c => c.region === 'Europe');

// Array.sort() : trier
countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

// Array.find() : trouver le premier match
const france = countries.find(c => c.cca3 === 'FRA');

// Array.forEach() : itérer
countries.forEach(country => renderCard(country));

// Array.slice() : extraire une portion (pagination)
const page1 = countries.slice(0, 12);

// Object.keys() : liste des clés
const currencies = Object.keys(rates); // ['USD', 'EUR', 'GBP', ...]

// Object.values() : liste des valeurs
const langNames = Object.values(country.languages);

// Spread operator : copier un tableau
const copy = [...state.allCountries];

// Destructuring : extraire des valeurs
const [countriesData, ratesData] = await Promise.all([...]);
```

---

### ✅ 4. Organisation et modularité du code

Le code est organisé en **fonctions à responsabilité unique** :

```
Initialisation → initTheme(), initClock(), setupEvents(), loadAllData()
Données        → fetchCountries(), fetchExchangeRates(), fetchWeather()
Dashboard      → updateDashboardStats(), renderFeatured()
Exploration    → applyFilters(), renderCountriesGrid(), renderPagination()
Composants     → createCountryCard(), openModal(), closeModal()
Favoris        → toggleFavorite(), renderFavorites(), clearAllFavorites()
Devises        → convertCurrency(), swapCurrencies(), populateCurrencySelects()
Utilitaires    → showToast()
```

---

### ✅ 5. Validation et contrôle des données

```javascript
// Validation avant requête HTTP
function fetchWeather() {
  const city = input.value.trim();
  if (!city) { showToast('Veuillez entrer une ville', 'error'); return; }
  // ...
}

// Optional chaining ?. pour éviter les erreurs sur propriétés manquantes
const capital = country.capital?.[0] || 'N/A';
const flag    = country.flags?.svg || '';

// Vérification du type
if (isNaN(amount) || amount < 0) { ... }

// Vérification de l'existence
if (!state.exchangeRates[from]) { showToast('Devise invalide'); return; }

// Fallback (valeur par défaut)
const pop = country.population?.toLocaleString('fr-FR') || 'N/A';
```

---

### ✅ 6. Web Storage

```javascript
// ─── localStorage (PERMANENT) ───
// Sauvegarder (doit être une chaîne → JSON.stringify pour les objets)
localStorage.setItem('favorites', JSON.stringify(['FRA', 'MAR']));
localStorage.setItem('theme', 'dark');
localStorage.setItem('searchCount', 42);

// Récupérer
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const theme     = localStorage.getItem('theme') || 'dark';
const count     = parseInt(localStorage.getItem('searchCount')) || 0;

// Supprimer
localStorage.removeItem('searchCount');

// ─── sessionStorage (SESSION uniquement) ───
// Effacé quand l'onglet/navigateur est fermé
sessionStorage.setItem('lastCountry', 'FRA');
const last = sessionStorage.getItem('lastCountry'); // → 'FRA'
```

**Différence clé :**
| | `localStorage` | `sessionStorage` |
|---|---|---|
| Durée | Permanent | Jusqu'à fermeture de l'onglet |
| Usage | Favoris, thème | Dernier pays visité |

---

### ✅ 7. Fetch API + REST

```javascript
// Requête GET simple
const response = await fetch('https://restcountries.com/v3.1/all');

// Vérification du succès
if (!response.ok) throw new Error(`HTTP ${response.status}`);

// Conversion en JSON (retourne une Promise)
const data = await response.json();

// Requête avec paramètres (query string)
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${KEY}`;
const response = await fetch(url);

// Codes de statut HTTP courants
// 200 → OK
// 401 → Non autorisé (clé API invalide)
// 404 → Ressource non trouvée
// 500 → Erreur serveur
```

---

### ✅ 8. Gestion asynchrone (Promise, async/await)

```javascript
// async : la fonction retourne toujours une Promise
async function loadAllData() {

  // Promise.all() : exécuter PLUSIEURS requêtes EN PARALLÈLE
  // Attend que TOUTES soient résolues avant de continuer
  const [countries, rates] = await Promise.all([
    fetchCountries(),       // Promise 1
    fetchExchangeRates()    // Promise 2
  ]);

  // try/catch/finally : gérer les erreurs asynchrones
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderData(data);
  } catch (error) {
    // Exécuté si fetch() ou response.json() échouent
    console.error('Erreur:', error.message);
    showToast('Erreur réseau', 'error');
  } finally {
    // Toujours exécuté (succès ou erreur)
    hideLoader();
  }
}

// Différence : Promise classique vs async/await
// Ancien style (Promise.then)
fetch(url).then(r => r.json()).then(data => render(data)).catch(err => console.error(err));

// Nouveau style (async/await) — plus lisible
const response = await fetch(url);
const data = await response.json();
render(data);
```

---

## APIs utilisées

### 1. REST Countries API
- **URL** : `https://restcountries.com/v3.1/all`
- **Type** : REST, réponse JSON
- **Clé API** : ❌ Non requise (gratuite)
- **Données** : nom, capitale, population, superficie, drapeau, devises, langues, fuseau horaire

### 2. OpenWeatherMap API
- **URL** : `https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={KEY}`
- **Type** : REST, réponse JSON
- **Clé API** : ✅ Requise (gratuite sur openweathermap.org)
- **Données** : température, humidité, vent, pression

### 3. ExchangeRate-API
- **URL** : `https://open.er-api.com/v6/latest/USD`
- **Type** : REST, réponse JSON
- **Clé API** : ❌ Non requise
- **Données** : taux de change de 150+ devises par rapport au USD

---

## Installation et lancement

### Étape 1 — Cloner ou télécharger le projet
```bash
git clone https://github.com/votre-username/smart-travel-dashboard.git
cd smart-travel-dashboard
```

### Étape 2 — (Optionnel) Configurer la clé API Météo
Dans `script.js`, ligne ~32, remplacez :
```javascript
WEATHER_KEY: 'YOUR_API_KEY_HERE',
```
Par votre clé obtenue gratuitement sur [openweathermap.org](https://openweathermap.org/api)

### Étape 3 — Lancer l'application
**Option A** : Ouvrir directement `index.html` dans un navigateur moderne (Chrome, Firefox, Edge)

**Option B** : Avec VS Code Live Server (recommandé)
1. Installer l'extension **Live Server** dans VS Code
2. Clic droit sur `index.html` → **Open with Live Server**
3. L'application s'ouvre sur `http://127.0.0.1:5500`

> ⚠️ Ne fonctionne PAS avec Internet Explorer. Utilisez Chrome, Firefox ou Edge.

---

## Explication du code source

### Flux d'exécution (lecture du code)

```
index.html chargé
     │
     ▼
DOMContentLoaded (événement)
     │
     ├──► initTheme()       → Lire localStorage → appliquer data-theme sur <html>
     ├──► initClock()       → setInterval (1s) → mettre à jour l'heure
     ├──► setupEvents()     → Attacher tous les addEventListener()
     └──► loadAllData()     → async : fetch pays + devises en parallèle
               │
               ├──► fetchCountries()      → fetch API → state.allCountries = [...]
               ├──► fetchExchangeRates()  → fetch API → state.exchangeRates = {...}
               │
               ├──► updateDashboardStats()  → modifier DOM (stat-total, badges...)
               ├──► renderFeatured()        → 6 pays aléatoires → appendChild()
               ├──► renderCountriesGrid()   → grille de pays paginée
               └──► populateCurrencySelects() → remplir les <select> de devises
```

### Cycle de vie d'une recherche de pays

```
Utilisateur tape dans #exploreSearch
          │
          ▼
addEventListener('input', ...) se déclenche
          │
          ▼
applyFilters()
    ├── Lire : exploreSearch.value, regionFilter.value, sortFilter.value
    ├── Array.filter() → filteredCountries = [...]
    ├── Array.sort()   → trier filteredCountries
    └── renderCountriesGrid() → vider le DOM + créer nouvelles cartes
```

### Cycle de vie d'un favori

```
Clic sur ❤️
    │
    ▼
toggleFavorite(cca3)
    ├── Array.indexOf(cca3) → -1 = absent, sinon index
    ├── push() ou splice()  → modifier state.favorites
    ├── JSON.stringify()    → convertir en texte
    ├── localStorage.setItem('favorites', ...) → sauvegarder
    └── Mettre à jour les badges (DOM)
```

---

## Questions d'examen probables et réponses

**Q1 : Quelle est la différence entre localStorage et sessionStorage ?**
> `localStorage` est **permanent** : les données survivent à la fermeture du navigateur. `sessionStorage` est **temporaire** : les données sont effacées quand l'onglet est fermé. Dans ce projet, les favoris et le thème sont dans `localStorage`, le dernier pays visité est dans `sessionStorage`.

**Q2 : Pourquoi utilise-t-on `async/await` au lieu de `.then()` ?**
> `async/await` rend le code asynchrone aussi lisible que du code synchrone. Il évite le "callback hell" (imbrication de `.then()`) et facilite la gestion d'erreurs avec `try/catch`.

**Q3 : Qu'est-ce que `Promise.all()` et pourquoi l'utiliser ?**
> `Promise.all()` exécute plusieurs Promises en **parallèle** et attend que toutes soient résolues. C'est plus rapide que d'enchaîner les `await` l'un après l'autre.

**Q4 : Comment fonctionne `Array.filter()` ?**
> Elle crée un **nouveau tableau** contenant uniquement les éléments pour lesquels la fonction de rappel retourne `true`. L'original n'est pas modifié.

**Q5 : Pourquoi utiliser `e.stopPropagation()` ?**
> Quand on clique sur le bouton ❤️ d'une carte, l'événement "remonte" (`bubbles`) vers la carte entière qui ouvrirait le modal. `stopPropagation()` empêche cette remontée.

**Q6 : Qu'est-ce que le DOM ?**
> Le DOM (Document Object Model) est la représentation en mémoire de la page HTML sous forme d'arbre d'objets. JavaScript le manipule via `document.getElementById()`, `createElement()`, `innerHTML`, etc.

**Q7 : Pourquoi `JSON.stringify()` avant `localStorage.setItem()` ?**
> `localStorage` ne stocke que des **chaînes de caractères**. `JSON.stringify()` convertit un tableau ou un objet en chaîne JSON. `JSON.parse()` fait l'inverse au moment de la lecture.

**Q8 : Comment la pagination fonctionne-t-elle ?**
> On utilise `Array.slice(start, end)` pour extraire la portion du tableau correspondant à la page courante : `slice((page-1) * 12, page * 12)`. Chaque clic sur un bouton de page met à jour `state.currentPage` et rappelle `renderCountriesGrid()`.

**Q9 : Qu'est-ce que l'optional chaining `?.` ?**
> C'est un opérateur qui évite les erreurs si une propriété est `null` ou `undefined`. `country.capital?.[0]` retourne `undefined` si `capital` n'existe pas, au lieu de lancer une erreur.

**Q10 : Comment fonctionne le thème dark/light ?**
> On ajoute l'attribut `data-theme="light"` sur l'élément `<html>`. En CSS, le sélecteur `[data-theme="light"]` remplace les variables CSS (couleurs). Le choix est sauvegardé dans `localStorage` pour être restauré à la prochaine visite.
