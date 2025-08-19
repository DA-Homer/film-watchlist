const API_KEY = '6eb1ff69';

const watchlistResults = document.getElementById('watchlist-results');

function getWatchlist() {
  return JSON.parse(localStorage.getItem('myWatchlist') || '[]');
}

async function fetchWatchlistFilms() {
  const watchlist = getWatchlist();

  if (watchlist.length === 0) {
    watchlistResults.innerHTML = `
      <div class="no-films">
        <p class="no-films-text">Your watchlist is empty. Search for some films to add!</p>
      </div>
    `;
    return;
  }

  const promises = watchlist.map(id =>
    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
    .then(res => res.json())
  );

  const films = await Promise.all(promises);
  renderWatchlist(films);
}

function renderWatchlist(films) {
  let filmCard = films.map(film => {
    return `
      <article class="film-item">
        <div class="poster-wrapper">
          <img class="poster" src="${film.Poster}" alt="${film.Title} poster" />
        </div>

        <div class="info-wrapper">
          <div class="title-rating">
            <h2 class="title">${film.Title}</h2>
            <div class="rating-star">
              <i class="fa-solid fa-star"></i>
              <p class="rating-number">${film.imdbRating}</p>
            </div>
          </div>
          <div class="info">
            <p class="runtime">${film.Runtime}</p>
            <p class="genre">${film.Genre}</p>
            <button class="watchlist-btn" data-filmid="${film.imdbID}">
              <i class="fa-solid fa-circle-minus"></i> 
              Watchlist
            </button>
          </div>
          <p class="plot">${film.Plot}</p>
        </div>
      </article>
    `
  }).join('')

  watchlistResults.innerHTML = filmCard;
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.watchlist-btn');
  if(btn) {
    const filmId = btn.dataset.filmid;
    removeFromWatchlist(filmId)
  }
});

function removeFromWatchlist(filmId) {
  let myWatchlist = JSON.parse(localStorage.getItem('myWatchlist') || '[]');

  if(myWatchlist.includes(filmId)) {
    const index = myWatchlist.indexOf(filmId);
    myWatchlist.splice(index, 1)
    localStorage.setItem('myWatchlist', JSON.stringify(myWatchlist))
    fetchWatchlistFilms()
  }
}

fetchWatchlistFilms()