const API_KEY = '6eb1ff69';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filmResults = document.getElementById('film-results');

// User Search
if (searchBtn){
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
    filmResults.classList.remove('explore-img');
  });
}

function handleSearch() {
  const query = searchInput.value.trim().replace(/\s+/g, '+');
  if (!query) {
    alert('Please enter a film title before searching');
  } else {
    fetchFilmInfo(query);
    searchInput.value = '';
  };
}

async function fetchFilmInfo(title) {
  const res = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${title}`)
  const data = await res.json()
  let filmObj = [];

  if (data.Response === 'True') {
    const request = data.Search.map(film => {
      const promises = fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${film.imdbID}`)
      .then(res => res.json())
      return promises;
    })

    filmObj = await Promise.all(request)
    makeFilmCard(filmObj)
  } else {
    makeFilmCard(filmObj)
  }
}

function makeFilmCard(arr) {
  let filmCard = ``
  if (arr && arr.length > 0) {
    filmCard += arr.map(film => {
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
                <i class="fa-solid fa-circle-plus"></i> 
                Watchlist
              </button>
            </div>
            <p class="plot">${film.Plot}</p>
          </div>
        </article>
      `
    }).join('')

    filmResults.innerHTML = filmCard;
  } else {
    filmCard = `
      <div class="no-films">
        <p class="no-films-text">Unable to find what you're looking for. Please try another search.
      </div>
    `
    filmResults.innerHTML = filmCard; 
  }
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.watchlist-btn');
  if (btn) {
    const filmId = btn.dataset.filmid;
    addToWatchlist(filmId, btn);
  }
});

function addToWatchlist(filmId, btn) {
  let myWatchlist = JSON.parse(localStorage.getItem('myWatchlist') || '[]');

  if (!myWatchlist.includes(filmId)) {
    myWatchlist.push(filmId);
    localStorage.setItem('myWatchlist', JSON.stringify(myWatchlist));
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added to Watchlist';
  }  else {
    alert('Film already added to Watchlist')
  }
}