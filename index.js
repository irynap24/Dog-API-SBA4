import * as Carousel from "./Carousel.js";
import * as Api from "./axios.js"; // Import the functions from axios.js

const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
const breedSearch = document.getElementById("breedSearch");
const breedSuggestions = document.getElementById("breedSuggestions");

// Empty array to store favorite images
let favorites = [];

// Function to load breeds into the select element
async function initialLoad() {
  try {
    const breeds = await Api.getBreeds();
    breedSelect.innerHTML = breeds
      .map((breed) => `<option value="${breed.id}">${breed.name}</option>`)
      .join("");

    // Load initial carousel items
    selectNewBreed();
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

// Event handler for breed selection changes
async function selectNewBreed() {
  const breedId = breedSelect.value;
  if (!breedId) return; // Exit if no breed is selected

  try {
    // Fetch images and breed information
    const [images, breedInfo] = await Promise.all([
      Api.getBreedImages(breedId),
      Api.getBreedInfo(breedId),
    ]);

    // Clear existing carousel items and info dump
    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = "";
    infoDump.innerHTML = "";

    // Add new carousel items
    images.forEach((image) => {
      const template = document
        .getElementById("carouselItemTemplate")
        .content.cloneNode(true);
      const img = template.querySelector("img");
      img.src = image.url || "https://via.placeholder.com/400"; // Use placeholder if URL is missing

      const favButton = template.querySelector(".favourite-button");
      favButton.setAttribute("data-img-id", image.id);
      updateHeartColor(favButton, image.id); // Update heart color based on favorite status

      favButton.addEventListener("click", async () => {
        await Api.toggleFavorite(image.id); // Toggle favorite status
        toggleFavoriteStatus(image.id);
        updateHeartColor(favButton, image.id);
      });

      carouselInner.appendChild(template);
    });

    // Initialize or restart the carousel
    const carousel = new bootstrap.Carousel(
      document.getElementById("carouselControls"),
      {
        interval: 2000,
      }
    );
    carousel.cycle();

    // Fetch and display breed information
    infoDump.innerHTML = `
      <div class="row">
        <div class="col-md-12">
          <h3>${breedInfo.name || "Unknown Breed"}</h3>
          <p><strong>Temperament:</strong> ${breedInfo.temperament || "No temperament information available"}</p>
          <p><strong>Weight & Height:</strong> ${breedInfo.weight.imperial || "No weight information available"} lbs, ${breedInfo.height.imperial || "No height information available"} inches tall</p>
          <p><strong>Origin:</strong> ${breedInfo.origin || "No origin information available"}</p>
          <p><strong>Life Span:</strong> ${breedInfo.life_span || "No life span information available"}</p>
          <p><strong>Bred For:</strong> ${breedInfo.bred_for || "No info available"}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching breed details:", error);
  }
}

// Toggle favorite/unfavorite status
function toggleFavoriteStatus(imageId) {
  if (favorites.includes(imageId)) {
    favorites = favorites.filter((id) => id !== imageId);
  } else {
    favorites.push(imageId);
  }
}

// Update heart icon color based on favorite status
function updateHeartColor(button, imageId) {
  if (favorites.includes(imageId)) {
    button.querySelector("svg").style.fill = "red";
  } else {
    button.querySelector("svg").style.fill = "currentColor";
  }
}

// Event handler for fetching favorite images
async function updateFavorites() {
  try {
    const favoritesData = await Api.getFavorites();
    favorites = favoritesData.map(fav => fav.image_id); // Update local favorites state

    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = "";

    favoritesData.forEach((favorite) => {
      const template = document
        .getElementById("carouselItemTemplate")
        .content.cloneNode(true);
      const img = template.querySelector("img");
      img.src = favorite.image.url || "https://via.placeholder.com/400"; // Use placeholder if URL is missing

      const favButton = template.querySelector(".favourite-button");
      favButton.setAttribute("data-img-id", favorite.image.id);
      updateHeartColor(favButton, favorite.image.id); // Update heart color based on favorite status

      favButton.addEventListener("click", async () => {
        await Api.toggleFavorite(favorite.image.id); // Toggle favorite status
        toggleFavoriteStatus(favorite.image.id);
        updateHeartColor(favButton, favorite.image.id);
      });

      carouselInner.appendChild(template);
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
}

// Event listeners
breedSelect.addEventListener("change", selectNewBreed);
getFavouritesBtn.addEventListener("click", updateFavorites);
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap tooltips
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltips.forEach((tooltip) => {
    new bootstrap.Tooltip(tooltip);
  });
  // Initial load of breeds
  initialLoad();
});

// Store all breeds for searching
let allBreeds = [];

// Function to display breed suggestions
function displaySuggestions(breeds) {
  breedSuggestions.innerHTML = breeds
    .map(breed => `
      <a href="#" class="list-group-item list-group-item-action suggestion-item" data-breed-id="${breed.id}">
        ${breed.name}
      </a>
    `)
    .join("");
}

// Fetch breeds and initialize search functionality
async function initializeSearch() {
  try {
    allBreeds = await Api.getBreeds();
    breedSearch.addEventListener("input", handleSearch);
    breedSuggestions.addEventListener("click", handleSuggestionClick);
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

// Handle search input
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filteredBreeds = allBreeds.filter(breed =>
    breed.name.toLowerCase().includes(query)
  );
  displaySuggestions(filteredBreeds);
}

// Handle suggestion click
function handleSuggestionClick(event) {
  const target = event.target.closest(".suggestion-item");
  if (target) {
    const breedId = target.getAttribute("data-breed-id");
    breedSearch.value = target.textContent; // Set the search input value to the selected breed name
    breedSuggestions.innerHTML = ""; // Clear suggestions
    selectBreed(breedId); // Fetch and display selected breed
  }
}

// Function to select and display a breed
async function selectBreed(breedId) {
  try {
    const [images, breedInfo] = await Promise.all([
      Api.getBreedImages(breedId),
      Api.getBreedInfo(breedId),
    ]);

    // Update carousel and info section as needed
    updateCarousel(images);
    displayBreedInfo(breedInfo);
  } catch (error) {
    console.error("Error selecting breed:", error);
  }
}

// Initialize search functionality
initializeSearch();

// Update carousel with new images
function updateCarousel(images) {
  const carouselInner = document.getElementById("carouselInner");
  carouselInner.innerHTML = "";

  images.forEach(image => {
    const template = document
      .getElementById("carouselItemTemplate")
      .content.cloneNode(true);
    const img = template.querySelector("img");
    img.src = image.url || "https://via.placeholder.com/400";

    const favButton = template.querySelector(".favourite-button");
    favButton.setAttribute("data-img-id", image.id);
    updateHeartColor(favButton, image.id); // Ensure heart color is updated

    favButton.addEventListener("click", async () => {
      await Api.toggleFavorite(image.id); // Toggle favorite status
      toggleFavoriteStatus(image.id);
      updateHeartColor(favButton, image.id);
    });

    carouselInner.appendChild(template);
  });

  // Initialize or restart the carousel
  const carousel = new bootstrap.Carousel(
    document.getElementById("carouselControls"),
    {
      interval: 2000,
    }
  );
  carousel.cycle();
}

// Display breed information
function displayBreedInfo(breedInfo) {
  const infoDump = document.getElementById("infoDump");
  infoDump.innerHTML = `
    <div class="info-section">
      <h3 class="info-title">Breed Name</h3>
      <p class="info-content">${breedInfo.name || "Unknown Breed"}</p>
    </div>
    <div class="info-section">
      <h3 class="info-title">Temperament</h3>
      <p class="info-content">${breedInfo.temperament || "No temperament information available"}</p>
    </div>
    <div class="info-section">
      <h3 class="info-title">Weight & Height:</h3>
      <p class="info-content">${breedInfo.weight?.imperial || "No weight information available"} lbs ${breedInfo.height?.imperial || "No height information available"} inches tall</p>
    </div>
    <div class="info-section">
      <h3 class="info-title">Origin:</h3>
      <p class="info-content">${breedInfo.origin || "No origin information available"}</p>
    </div>
    <div class="info-section">
      <h3 class="info-title">Life Span:</h3>
      <p class="info-content">${breedInfo.life_span || "No life span information available"}</p>
    </div>
    <div class="info-section">
      <h3 class="info-title">Bred For:</h3>
      <p class="info-content">${breedInfo.bred_for || "No info available"}</p>
    </div>
  `;
}
