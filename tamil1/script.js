let allMovies = [];
let displayedMovies = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let debounceTimeout;
let searchLimit = 25; // Limit the number of search results shown

// Fetch movie data if on the home page
if (document.getElementById("movies-container")) {
  fetch("https://multicinema.in/movielist.json")
    .then((response) => response.json())
    .then((data) => {
      allMovies = data.map((movie) => ({
        id: movie.id,
        title: truncateText(movie.title, 30),
        image: `https://multicinema.in/${movie.pic}`,
        video: `https://pub-c112d6c4191e458db7adfadb97398a27.r2.dev/${movie.src}?target=video`,
        downloadUrl1: movie.downloadUrl1,
      })).filter(movie => movie.title !== "Lucifer");
      displayMovies(searchLimit);
    })
    .catch((error) => console.error("Error fetching JSON:", error));
}

// Fetch favorite movies if on the favorites page
if (document.getElementById("favorites-container")) {
  viewFavorites();
}

// Truncate text function
function truncateText(text, limit) {
  return text.length > limit ? text.substring(0, limit) + "..." : text;
}

// Display movies function
function displayMovies(limit) {
  const container = document.getElementById("movies-container");
  const moviesToDisplay = allMovies.slice(displayedMovies.length, displayedMovies.length + limit);
  displayedMovies = [...displayedMovies, ...moviesToDisplay];

  moviesToDisplay.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <div class="image-container" onclick="playVideo('${movie.id}', '${movie.title}', '${movie.image}', '${movie.video}')">
        <img src="${movie.image}" alt="${movie.title}" />
        <div class="favorite-icon" onclick="toggleFavorite('${movie.title}', event)">
          <span class="material-icons">favorite_border</span>
        </div>
      </div>
      <h3>${movie.title}</h3>
    `;
    container.appendChild(movieCard);

    updateFavoritesIcon(movie.title);
  });

  if (displayedMovies.length >= allMovies.length) {
    document.getElementById("load-more").style.display = "none";
  }
}

// Play video function
function playVideo(id, title, imageUrl, videoUrl) {
  window.location.href = `movie-details.html?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}&image=${encodeURIComponent(imageUrl)}&video=${encodeURIComponent(videoUrl)}`;
}

// Filter movies function with debounce
function filterMovies() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const clearButton = document.querySelector(".clear-icon");
  const container = document.getElementById("movies-container");
  container.innerHTML = "";
  displayedMovies = [];

  if (searchTerm) {
    clearButton.style.display = "block";
    document.body.classList.add("search-active");
  } else {
    clearButton.style.display = "none";
    document.body.classList.remove("search-active");
  }

  // Clear previous debounce timeout if it's still active
  clearTimeout(debounceTimeout);

  // Set new debounce timeout
  debounceTimeout = setTimeout(() => {
    const filteredMovies = allMovies.filter((movie) => movie.title.toLowerCase().includes(searchTerm));
    const moviesToDisplay = filteredMovies.slice(0, searchLimit); // Only show the first 'searchLimit' movies

    moviesToDisplay.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie-card";
      movieCard.innerHTML = `
        <div class="image-container" onclick="playVideo('${movie.id}', '${movie.title}', '${movie.image}', '${movie.video}')">
          <img src="${movie.image}" alt="${movie.title}" />
          <div class="favorite-icon" onclick="toggleFavorite('${movie.title}', event)">
            <span class="material-icons">favorite_border</span>
          </div>
        </div>
        <h3>${movie.title}</h3>
      `;
      container.appendChild(movieCard);

      updateFavoritesIcon(movie.title);
    });
  }, 300); // Debounce delay of 300ms
}

// Clear search function
function clearSearch() {
  const searchBar = document.getElementById("search-bar");
  searchBar.value = "";
  filterMovies();
}

// Toggle favorite function
function toggleFavorite(movieTitle, event) {
  event.stopPropagation();
  const movieIndex = favorites.findIndex((fav) => fav.title === movieTitle);
  if (movieIndex === -1) {
    const movie = allMovies.find((movie) => movie.title === movieTitle);
    favorites.push(movie);
  } else {
    favorites.splice(movieIndex, 1);
  }
  updateFavoritesIcon(movieTitle);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Update favorite icon function
function updateFavoritesIcon(movieTitle) {
  const movieCards = document.querySelectorAll(".movie-card");
  movieCards.forEach((card) => {
    const titleElement = card.querySelector("h3");
    const favoriteIcon = card.querySelector(".favorite-icon span");
    if (titleElement.textContent === movieTitle) {
      if (favorites.some((fav) => fav.title === movieTitle)) {
        favoriteIcon.textContent = "favorite";
        favoriteIcon.parentElement.classList.add("red");
      } else {
        favoriteIcon.textContent = "favorite_border";
        favoriteIcon.parentElement.classList.remove("red");
      }
    }
  });
}

// View favorites function
function viewFavorites() {
  const container = document.getElementById("favorites-container");
  container.innerHTML = "";

  favorites.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card favorite-card";
    movieCard.innerHTML = `
      <div class="image-container" onclick="playVideo('${movie.id}', '${movie.title}', '${movie.image}', '${movie.video}')">
        <img src="${movie.image}" alt="${movie.title}" />
        <div class="favorite-icon" onclick="removeFavorite('${movie.title}', event)">
          <span class="material-icons">delete</span>
        </div>
      </div>
      <h3>${movie.title}</h3>
    `;
    container.appendChild(movieCard);
  });
}

// Remove favorite function
function removeFavorite(movieTitle, event) {
  event.stopPropagation();
  favorites = favorites.filter((fav) => fav.title !== movieTitle);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  viewFavorites();
  updateFavoritesIcon(movieTitle);
}

// Load more movies function
function loadMoreMovies() {
  displayMovies(25);
}

// Navigation function
function navigateTo(page) {
  window.location.href = page;
}
