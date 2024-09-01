import * as Carousel from "./Carousel.js";
import * as Api from "./axios.js"; // Import the functions from axios.js

const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

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
    const images = await Api.getBreedImages(breedId);
    const breedInfo = await Api.getBreedInfo(breedId);

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

      console.log(`Image URL: ${image.url}`); // Log the image URL to the console

      const favButton = template.querySelector(".favourite-button");
      favButton.setAttribute("data-img-id", image.id);
      favButton.addEventListener("click", async () => {
        await Api.toggleFavorite(image.id); // Toggle favorite status
        updateFavorites(); // Refresh favorites
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
          <h3>${breedInfo.name}</h3>
          <p><strong>About:</strong> ${breedInfo.description}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching breed details:", error);
  }
}

// Event handler for fetching favorite images
async function updateFavorites() {
  try {
    const favorites = await Api.getFavorites();
    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = "";

    favorites.forEach((favorite) => {
      const template = document
        .getElementById("carouselItemTemplate")
        .content.cloneNode(true);
      const img = template.querySelector("img");
      img.src = favorite.image.url || "https://via.placeholder.com/400"; // Use placeholder if URL is missing

      console.log(`Favorite Image URL: ${favorite.image.url}`); // Log the favorite image URL to the console

      const favButton = template.querySelector(".favourite-button");
      favButton.setAttribute("data-img-id", favorite.image.id);
      favButton.addEventListener("click", async () => {
        await Api.toggleFavorite(favorite.image.id); // Toggle favorite status
        updateFavorites(); // Refresh favorites
      });

      carouselInner.appendChild(template);
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
}

// Add event listener for breed selection change
breedSelect.addEventListener("change", selectNewBreed);

// Add event listener for get favorites button
getFavouritesBtn.addEventListener("click", updateFavorites);

// Initial load of breeds
initialLoad();
