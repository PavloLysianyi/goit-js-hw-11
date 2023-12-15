import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix';
import { performImageSearch } from './api';

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {});

let currentPage = 1;
const ITEMS_PER_PAGE = 20;
let isLoading = false;
let totalLoadedImages = 0;

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    Notify.warning('Please enter a search query.');
    return;
  }

  currentPage = 1;
  galleryContainer.innerHTML = '';
  loadMoreButton.style.display = 'none';

  try {
    await loadMoreImages(searchQuery);
  } catch (error) {
    console.error('Error during search:', error);
    Notify.failure(
      'An error occurred during the search. Please try again later.'
    );
  }
});

loadMoreButton.addEventListener('click', async function () {
  try {
    await loadMoreImages(searchForm.elements.searchQuery.value);
  } catch (error) {
    console.error('Error during loading more images:', error);
    Notify.failure(
      'An error occurred while loading more images. Please try again later.'
    );
  }
});

async function loadMoreImages(searchQuery) {
  if (isLoading) return;

  isLoading = true;

  const { hits, totalHits } = await performImageSearch(
    searchQuery,
    currentPage,
    ITEMS_PER_PAGE
  );

  if (hits.length === 0) {
    Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    appendImagesToGallery(hits);
    totalLoadedImages += hits.length;

    Notify.success(`Hooray! We found ${totalHits} images.`);
    currentPage++;

    if (totalLoadedImages >= totalHits) {
      loadMoreButton.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      loadMoreButton.style.display = 'block';
    }
  }

  isLoading = false;
}

function appendImagesToGallery(images) {
  const cardsHTML = images.map(image => {
    const infoItems = ['likes', 'views', 'comments', 'downloads'];

    const infoHTML = infoItems
      .map(
        infoItem =>
          `<p class="info-item"><b>${infoItem}</b>: ${image[infoItem]}</p>`
      )
      .join('');

    return `
      <div class="photo-card">
        <a href="${image.largeImageURL}" data-lightbox="gallery">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
        </a>
        <div class="info">
          ${infoHTML}
        </div>
      </div>
    `;
  });

  const allCardsHTML = cardsHTML.join('');
  galleryContainer.insertAdjacentHTML('beforeend', allCardsHTML);
}
