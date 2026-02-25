export interface PixabayImage {
  id: number;
  previewURL: string;
  largeImageURL: string;
  tags: string;
}

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || '44415518-774f358316136192318055695';

export async function searchPixabayImages(query: string): Promise<PixabayImage[]> {
  if (!PIXABAY_API_KEY || PIXABAY_API_KEY.includes('placeholder')) {
    console.warn('Pixabay API key is missing or invalid.');
    return [];
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=vector&per_page=21&safesearch=true`
    );
    
    if (!response.ok) {
      const text = await response.text();
      // Pixabay returns plain text errors like "[ERROR 400] ..."
      console.error(`Pixabay API error (${response.status}):`, text);
      return [];
    }

    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return [];
  }
}
