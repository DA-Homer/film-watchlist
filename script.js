const API_KEY = '6eb1ff69';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultArea = document.getElementById('result-area');
const watchlistArea = document.getElementById('watchlist-result-area');

let filmDataObj = [];

// Handle user search
if (searchBtn) {
  searchBtn.addEventListener('click', handleSearch)
}
if (searchInput) {
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      handleSearch(resultArea)
    }
  })
}

function handleSearch() {
  const query = searchInput.value.trim().replace(/\s+/g, '+');

  filmDataObj = []
  resultArea.innerHTML = '';
  resultArea.classList.add('show-films');
  resultArea.classList.remove('result-area');
  resultArea.classList.remove('no-result');

  getFilmInfo(query);
    
  searchInput.value = '';
}

// API request
async function getFilmInfo(filmTitle) {
  const getFilm = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${filmTitle}`)
  const filmObj = await getFilm.json()
  
  if (filmObj.Response === 'True') {

    filmDataObj = await Promise.all(filmObj.Search.map(film => {
      return fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${film.imdbID}`)
        .then(res => res.json())
        .then(filmData => {
          return {
            imdbID: filmData.imdbID,
            poster: filmData.Poster,
            title: filmData.Title,
            rating: filmData.imdbRating,
            runtime: filmData.Runtime,
            genre: filmData.Genre,
            plot: filmData.Plot
          }
        })
    }))
    renderFilms(filmDataObj)
  } else {
    renderFilms(filmDataObj)
  }
}

// Render films to html
function renderFilms(filmObj) {
  let renderResults = ``;
  if (filmObj && filmObj.length > 0) {
    filmObj.forEach((film) => {
      renderResults += `
        <div class="film-item">
          <div class="poster-wrapper">
            <img class="film-poster" src="${film.poster}" />
          </div>

          <div class="film-info">
            <div class="title-and-rating">
              <h3 class="film-title">${film.title}</h3>
              <div class="film-rating">
                <i class="fa-solid fa-star"></i>
                <p>${film.rating}</p>
              </div>
            </div>
            <div class="runtime-genre-watchlist">
              <p>${film.runtime}</p>
              <p>${film.genre}</p>
              <button class="add-watchlist" data-imdbid="${film.imdbID}">
                ${watchlistArea
                ? `<i class="fa-solid fa-circle-minus"></i><p>Remove</p>`
                : `<i class="fa-solid fa-circle-plus"></i><p>Watchlist</p>`}
              </button>
            </div>
            <div class="film-plot">
              <p class="plot">${film.plot}</p>
            </div>
          </div>
        </div>
      `
      resultArea ? resultArea.innerHTML = renderResults : watchlistArea.innerHTML = renderResults;
    })
  } else {
    resultArea.classList.add('no-result');
    resultArea.classList.remove('show-films');
    const noResults = `
      <div class="no-result-text">
        <p>Unable to find what you're looking for. Please try another search</p>
      </div>
    `;

    resultArea ? resultArea.innerHTML = noResults : watchlistArea.innerHTML = noResults;
  }
}

// Chick if watchlist.html
if (watchlistArea) {
  renderWatchlist()
}

// Render watchlist.html
async function renderWatchlist() {
  const storedWatchlist = JSON.parse(localStorage.getItem('watchlist'));

  if (!storedWatchlist.length) {
    watchlistArea.classList.add('no-result');
    watchlistArea.classList.remove('show-films');
    watchlistArea.classList.remove('result-area');
    watchlistArea.innerHTML =  `
      <div class="no-result-text">
        <p>No films in watchlist</p>
      </div>
    `;
    return;
  } else {
    watchlistArea.classList.remove('result-area');
    watchlistArea.classList.add('show-films');
  }
    
  // Fetch ID for each film
  const films = await Promise.all(storedWatchlist.map(async id => {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
    const data = await res.json();
    return {
      imdbID: data.imdbID,
      poster: data.Poster,
      title: data.Title,
      rating: data.imdbRating,
      runtime: data.Runtime,
      genre: data.Genre,
      plot: data.Plot
    }
  }))
  renderFilms(films);
}

// Add Watchlist click
if (resultArea) {
  resultArea.addEventListener('click', function(e) {
    const button = e.target.closest('.add-watchlist');
    if (button) {
      const id = button.dataset.imdbid;
      watchlistAdd(id);
    }
  })
}
// Remove Watchlist click
if(watchlistArea) {
  watchlistArea.addEventListener('click', (e) => {
    const button = e.target.closest('.add-watchlist');
    if (button) {
      const id = button.dataset.imdbid;
      watchlistRemove(id)
    }
  })
}

// Add to watchlist
function watchlistAdd(id) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

  if (!watchlist.includes(id)) {
    watchlist.push(id);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  } else {
    alert('Film already in watchlist');
  }
}

// Remove from watchlist
function watchlistRemove(id) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist'));
  watchlist = watchlist.filter(film => film !== id);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  renderWatchlist()
}