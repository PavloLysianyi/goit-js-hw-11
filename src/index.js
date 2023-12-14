import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix';
import { performImageSearch } from './api';

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {});

let currentPage = 1;
const ITEMS_PER_PAGE = 20;

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    Notify.warning('Please enter a search query.');
    return;
  }

  currentPage = 1;

  galleryContainer.innerHTML = '';

  try {
    const { images, totalHits } = await performImageSearch(
      searchQuery,
      currentPage,
      ITEMS_PER_PAGE
    );

    if (images.length === 0) {
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      appendImagesToGallery(images);
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }
  } catch (error) {
    console.error('Error during search:', error);
    Notify.failure(
      'An error occurred during the search. Please try again later.'
    );
  }
});

window.addEventListener('scroll', async function () {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 100) {
    try {
      currentPage++;

      const { images } = await performImageSearch(
        searchForm.elements.searchQuery.value,
        currentPage,
        ITEMS_PER_PAGE
      );

      if (images.length > 0) {
        appendImagesToGallery(images);

        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });

        lightbox.refresh();
      }
    } catch (error) {
      console.error('Error during infinite scroll:', error);
      Notify.failure(
        'An error occurred during infinite scroll. Please try again later.'
      );
    }
  }
});

function appendImagesToGallery(images) {
  const fragment = document.createDocumentFragment();

  images.map(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });

  galleryContainer.appendChild(fragment);
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const infoItems = ['Likes', 'Views', 'Comments', 'Downloads'];

  card.innerHTML = `
    <a href="${image.largeImageURL}" data-lightbox="gallery">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
    </a>
    <div class="info">
      ${infoItems
        .map(
          infoItem =>
            `<p class="info-item"><b>${infoItem}</b>: ${
              image[infoItem.toLowerCase()]
            }</p>`
        )
        .join('')}
    </div>
  `;

  return card;
}
