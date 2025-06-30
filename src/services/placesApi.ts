interface Restaurant {
  name: string;
  address: string;
  rating?: number;
  place_id: string;
  types?: string[];
  vicinity?: string;
}

interface ApiResponse {
  restaurants: Restaurant[];
  error?: string;
}

// Backend API endpoint
const API_BASE_URL = 'https://wheel-a-meal-production.up.railway.app';

export const fetchNearbyRestaurants = async (zipcode: string): Promise<Restaurant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurants?zipcode=${zipcode}`);
    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch restaurants');
    }

    return data.restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

// Fallback mock data in case API fails
export const getMockRestaurants = (): Restaurant[] => [
  { name: "Pizza Palace", address: "123 Main St", rating: 4.5, place_id: "mock_1" },
  { name: "Burger Barn", address: "456 Oak Ave", rating: 4.2, place_id: "mock_2" },
  { name: "Sushi Spot", address: "789 Pine Rd", rating: 4.7, place_id: "mock_3" },
  { name: "Taco Town", address: "321 Elm St", rating: 4.0, place_id: "mock_4" },
  { name: "Pasta Place", address: "654 Maple Dr", rating: 4.3, place_id: "mock_5" },
  { name: "BBQ Joint", address: "987 Cedar Ln", rating: 4.6, place_id: "mock_6" },
  { name: "Thai Time", address: "147 Birch Way", rating: 4.4, place_id: "mock_7" },
  { name: "Deli Delight", address: "258 Spruce Ct", rating: 4.1, place_id: "mock_8" },
]; 