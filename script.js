// Get the search term and Page number from the URL
const urlParams = new URLSearchParams(window.location.search);

// Use search term from URL or default to "car", will be used in navigateToPage function attached to buttons
const searchText = urlParams.get("search") || "car";

// Use page from URL if available, otherwise default to 1
const pageFromUrl = parseInt(urlParams.get("page"));
const page = pageFromUrl ? Math.max(1, pageFromUrl) : 1;

// Add event listener to the form to update the URL with the search term when submitted
document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const searchTerm = document.getElementById("search").value;
    navigateToPage(1, searchTerm); // Navigate to the first page with the new search term
    displayImages(searchTerm); // Call displayImages with the new search term
  });

// Main Function to display images
displayImages();

// !!!!!!!!!!!!!!!!!

// !!!!!!!!!!!!!!!!!

// ###########################################################################
// Function declarations

// Function to Fetch images from Flickr API
async function getImages(text, page) {
  const res = await fetch(
    `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=71b1966355ddca4fec1345cac864a220&text=${text}&per_page=16&page=${page}&format=json&nojsoncallback=1&extras=url_s`
  );
  const data = await res.json();
  return data.photos;
}

// Function to display images on the page
async function displayImages(searchTerm) {
  const keyword = searchTerm || searchText; // Use search term from parameter or default to "car"

  const photos = await getImages(keyword, page);
  const container = document.getElementById("cardsContainer");
  container.innerHTML = ""; // Clear previous content

  // Create a card for each photo
  photos.photo.forEach((photo) => createImageCard(photo, container));

  createPaginationComponent(photos.total, page);

  document.body.classList.remove("loading"); // Remove loading class
}

// Function to create Image Card component
function createImageCard(photo, container) {
  const card = document.createElement("div");
  card.classList.add("card");

  const img = document.createElement("img");
  img.src = photo.url_s;
  card.appendChild(img);

  card.addEventListener("click", () => {
    window.open(`/singleImage.html?imageUrl=${photo.url_s}`, "_blank"); // Open image in a new tab/window
  });

  // Optionally add title or other details from photo object
  if (photo.title) {
    const cardTitle = document.createElement("figcaption");
    cardTitle.classList.add("card-title");
    cardTitle.classList.add("card-content");
    cardTitle.textContent = photo.title;
    card.appendChild(cardTitle);
  }

  container.appendChild(card);
}

// Function to create pagination buttons
function createPaginationComponent(totalPages, currentPage = 1) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear previous pagination component

  if (totalPages > 1) {
    // First, create pagination button for previous page
    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
      if (currentPage > 1) {
        navigateToPage(currentPage - 1, searchText);
      }
    });
    paginationContainer.appendChild(previousButton);

    // Next, create pagination buttons for page numbers
    const buttons = []; // array to store pagination buttons

    // Always show first two pages
    buttons.push(createPageButton(1));
    buttons.push(createPageButton(2));
    if (totalPages > 3) {
      buttons.push(document.createTextNode("...")); // Ellipsis
    }

    // Show a limited range around the current page (if applicable)
    const showRangeAroundCurrentPage = totalPages > 7;
    if (showRangeAroundCurrentPage) {
      const minPage = Math.max(Math.min(currentPage - 2, totalPages - 4), 3);
      const maxPage = Math.min(Math.max(currentPage + 2, 4), totalPages - 2);
      for (let i = minPage; i <= maxPage; i++) {
        buttons.push(createPageButton(i));
      }
    }

    buttons.push(document.createTextNode("...")); // Ellipsis

    // Always show last two pages (if applicable)
    if (totalPages > 2) {
      buttons.push(createPageButton(totalPages - 1));
      buttons.push(createPageButton(totalPages));
    }

    // Add the created buttons from array to the pagination container
    buttons.forEach((button) => paginationContainer.appendChild(button));

    // Last, create pagination button for next page
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;

    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        navigateToPage(currentPage + 1, searchText);
      }
    });
    paginationContainer.appendChild(nextButton);
  }
}

// Function to create a page button with click handler, used inside createPagination function
function createPageButton(pageNumber) {
  const button = document.createElement("button");
  button.textContent = pageNumber;
  button.disabled = pageNumber === page; // Disable current page button
  if (pageNumber === page) {
    button.classList.add("active");
  }
  button.addEventListener("click", () =>
    navigateToPage(pageNumber, searchText)
  );
  return button;
}

// Function to navigate to a specific page, attached to each pagination button
function navigateToPage(pageNumber, searchTerm = "car") {
  const baseUrl = new URL(window.location.href);
  baseUrl.searchParams.set("page", pageNumber);
  baseUrl.searchParams.set("search", searchTerm); // Update the search term in the URL
  window.location.assign(baseUrl.toString());
}
