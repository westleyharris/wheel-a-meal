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

    // Then, search for nearby restaurants
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=restaurant&key=${apiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      return res.status(400).json({ error: `Places API error: ${placesData.status}` });
    }

    if (placesData.status === 'ZERO_RESULTS') {
      return res.json({ restaurants: [] });
    }

    // Transform the API response
    const restaurants = placesData.results.map(place => ({
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