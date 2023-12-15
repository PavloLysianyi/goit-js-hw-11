import axios from 'axios';

const API_KEY = '41251616-25bd2bca1571a95c770fcbb5d';
const API_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 20;

export async function performImageSearch(
  searchQuery,
  page = 1,
  perPage = ITEMS_PER_PAGE
) {
  try {
    const { data } = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: perPage,
      },
    });

    return data;
  } catch (error) {
    console.error('Error during image search:', error);
    throw error;
  }
}
