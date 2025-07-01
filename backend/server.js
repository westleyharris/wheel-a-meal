import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory (for production)
app.use(express.static('dist'));

// API Routes
app.get('/api/restaurants', async (req, res) => {
  const { zipcode } = req.query;
  const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!zipcode) {
    return res.status(400).json({ error: 'Zipcode parameter is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }

  try {
    // First, geocode the zipcode to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      return res.status(400).json({ error: 'Could not find location for this zipcode' });
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;

    // Then, search for nearby restaurants with multiple type filters
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=restaurant&keyword=food&key=${apiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      return res.status(400).json({ error: `Places API error: ${placesData.status}` });
    }

    if (placesData.status === 'ZERO_RESULTS') {
      return res.json({ restaurants: [] });
    }

    // Define business types to exclude (non-restaurant businesses)
    const excludeTypes = [
      'gas_station',
      'convenience_store',
      'liquor_store',
      'pharmacy',
      'bank',
      'atm',
      'car_dealer',
      'car_rental',
      'car_repair',
      'hardware_store',
      'department_store',
      'clothing_store',
      'jewelry_store',
      'shoe_store',
      'book_store',
      'electronics_store',
      'furniture_store',
      'home_goods_store',
      'pet_store',
      'beauty_salon',
      'hair_care',
      'spa',
      'gym',
      'health',
      'hospital',
      'dentist',
      'doctor',
      'veterinary_care',
      'funeral_home',
      'cemetery',
      'church',
      'mosque',
      'synagogue',
      'hindu_temple',
      'school',
      'university',
      'library',
      'museum',
      'movie_theater',
      'bowling_alley',
      'casino',
      'night_club',
      'bar',
      'liquor_store'
    ];

    // Keywords that indicate non-restaurant businesses
    const excludeKeywords = [
      'gas',
      'station',
      'shell',
      'exxon',
      'mobil',
      'chevron',
      'bp',
      'conoco',
      'phillips',
      'marathon',
      'speedway',
      '7-eleven',
      'circle k',
      'quik trip',
      'kum & go',
      'wawa',
      'sheetz',
      'casey\'s',
      'love\'s',
      'pilot',
      'flying j',
      'ta',
      'travelcenters',
      'truck stop',
      'convenience',
      'pharmacy',
      'cvs',
      'walgreens',
      'rite aid',
      'bank',
      'credit union',
      'atm',
      'car wash',
      'auto',
      'mechanic',
      'repair',
      'dealership'
    ];

    // Filter and transform the API response
    const restaurants = placesData.results
      .filter(place => {
        // Check if any of the place types are in our exclude list
        const hasExcludedType = place.types && place.types.some(type => excludeTypes.includes(type));
        
        // Check if the name contains any excluded keywords
        const hasExcludedKeyword = excludeKeywords.some(keyword => 
          place.name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Include only if it doesn't have excluded types or keywords
        return !hasExcludedType && !hasExcludedKeyword;
      })
      .map(place => ({
        name: place.name,
        address: place.vicinity || place.formatted_address || 'Address not available',
        rating: place.rating,
        place_id: place.place_id,
        types: place.types,
        vicinity: place.vicinity
      }));

    res.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/restaurants?zipcode=YOUR_ZIPCODE`);
}); 