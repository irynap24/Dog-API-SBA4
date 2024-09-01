import axios from "axios";

// Set default base URL and headers for Axios
axios.defaults.baseURL = "https://api.thedogapi.com/v1/";
axios.defaults.headers.common["x-api-key"] =
  "live_rVj2pMaHsJtmWA93AAhGZi9h3JmR5eqe7E8srROIImIvS0UkJj23V3oy1b38qnQs"; // Replace with your actual API key

// Function to show the progress bar
function showProgressBar() {
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = "0%"; // Start from 0%
  progressBar.style.display = "block"; // Ensure the bar is visible
}

// Function to hide the progress bar
function hideProgressBar() {
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = "0%"; // Reset width
  setTimeout(() => {
    progressBar.style.display = "none"; // Hide after the transition
  }, 400); // Matches the transition duration
}

// Function to update the progress bar based on the ProgressEvent
function updateProgress(event) {
  if (event.lengthComputable) {
    const percentCompleted = Math.round((event.loaded * 100) / event.total);
    document.getElementById("progressBar").style.width = `${percentCompleted}%`;
    console.log("Progress Event:", event);
  }
}

// Add request interceptor to log request start time and reset progress bar
axios.interceptors.request.use(
  (config) => {
    console.log("Request started at:", new Date().toISOString());
    showProgressBar(); // Show progress bar on request start
    config.metadata = { startTime: new Date() }; // Add start time to config
    return config;
  },
  (error) => {
    hideProgressBar(); // Hide progress bar on request error
    return Promise.reject(error);
  }
);

// Add response interceptor to log response time and hide progress bar
axios.interceptors.response.use(
  (response) => {
    const { startTime } = response.config.metadata;
    const endTime = new Date();
    console.log("Response received at:", endTime.toISOString());
    console.log("Time taken:", endTime - startTime, "ms");
    hideProgressBar(); // Hide progress bar on response
    return response;
  },
  (error) => {
    hideProgressBar(); // Hide progress bar on response error
    return Promise.reject(error);
  }
);

// Function to get breeds from the API
export async function getBreeds() {
  try {
    const response = await axios.get("https://api.thedogapi.com/v1/breeds");
    return response.data;
  } catch (error) {
    console.error("Error fetching breeds:", error);
    throw error; // Rethrow error to handle it in the calling function
  }
}

// Function to get images for a specific breed from the API
export async function getBreedImages(breedId) {
  try {
    const response = await axios.get("images/search", {
      params: {
        breed_ids: breedId,
        limit: 5,
      },
      onDownloadProgress: updateProgress, // Pass the progress update function
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching breed images:", error);
    throw error; // Rethrow error to handle it in the calling function
  }
}

// Function to get information about a specific breed from the API
export async function getBreedInfo(breedId) {
  try {
    const response = await axios.get(`breeds/${breedId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching breed information:", error);
    throw error; // Rethrow error to handle it in the calling function
  }
}

// Function to toggle favorite status of an image
export async function toggleFavorite(imageId) {
  try {
    const response = await axios.get("favourites"); // Get all favorites
    const existingFavorite = response.data.find(
      (fav) => fav.image_id === imageId
    );

    if (existingFavorite) {
      await axios.delete(`favourites/${existingFavorite.id}`); // Unfavorite the image
    } else {
      await axios.post("favourites", { image_id: imageId }); // Favorite the image
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error; // Rethrow error to handle it in the calling function
  }
}

// Function to get the list of favorited images
export async function getFavorites() {
  try {
    const response = await axios.get("favourites");
    return response.data;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error; // Rethrow error to handle it in the calling function
  }
}
