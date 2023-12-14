import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '41251616-25bd2bca1571a95c770fcbb5d';
const API_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 20;

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
const lightbox = new SimpleLightbox('.gallery a', {});

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    Notiflix.Report.Warning('Please enter a search query.');
    return;
  }

  currentPage = 1;

  galleryContainer.innerHTML = '';

  try {
    await performImageSearch(searchQuery);

    loadMoreButton.style.display = 'block';
  } catch (error) {
    console.error('Error during search:', error);
    Notiflix.Report.Failure(
      'An error occurred during the search. Please try again later.'
    );
  }
});

loadMoreButton.addEventListener('click', async function () {
  try {
    currentPage++;

    await performImageSearch();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    lightbox.refresh();
  } catch (error) {
    console.error('Error during "Load more":', error);
    Notiflix.Report.Failure(
      'An error occurred during "Load more". Please try again later.'
    );
  }
});

async function performImageSearch(searchQuery) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      },
    });

    const imageData = response.data.hits;

    if (imageData.length === 0) {
      Notiflix.Report.Info({
        message:
          'Sorry, there are no images matching your search query. Please try again.',
      });
    } else {
      imageData.forEach(image => {
        displayImageCard(image);
      });

      const totalHits = response.data.totalHits || 0;
      Notiflix.Report.Success(`Hooray! We found ${totalHits} images.`);
    }
  } catch (error) {
    console.error('Error during image search:', error);
    throw error; // Propagate the error to be caught by the calling function
  }
}

function displayImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const imageElement = document.createElement('a');
  imageElement.href = image.largeImageURL;
  imageElement.setAttribute('data-lightbox', 'gallery');
  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';
  imageElement.appendChild(img);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('info');

  ['Likes', 'Views', 'Comments', 'Downloads'].forEach(infoItem => {
    const p = document.createElement('p');
    p.classList.add('info-item');
    p.innerHTML = `<b>${infoItem}</b>: ${image[infoItem.toLowerCase()]}`;
    infoContainer.appendChild(p);
  });

  card.appendChild(imageElement);
  card.appendChild(infoContainer);

  galleryContainer.appendChild(card);
}
