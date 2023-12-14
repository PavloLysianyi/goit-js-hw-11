import axios from 'axios';

const API_KEY = '41251616-25bd2bca1571a95c770fcbb5d';
const API_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 20;

export async function performImageSearch(searchQuery, page = 1) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: ITEMS_PER_PAGE,
      },
    });

    const imageData = response.data.hits;
    const totalHits = response.data.totalHits || 0;

    return { images: imageData, totalHits };
  } catch (error) {
    console.error('Error during image search:', error);
    throw error;
  }
}
