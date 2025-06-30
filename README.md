# 🍽️ Wheel a Meal

A fun web application that helps you decide where to eat by spinning a wheel with nearby restaurant options!

## Features

- 🎯 Interactive spinning wheel with smooth animations
- 📍 Location-based restaurant discovery using Google Places API
- 📱 Responsive design that works on mobile and desktop
- ⭐ Restaurant ratings and addresses
- 🎨 Modern, clean UI with Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Places API Setup

To use real restaurant data, you'll need a Google Places API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Geocoding API**
4. Create credentials (API Key) from the Credentials page
5. Create a `.env` file in the root directory with:
   ```
   VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

1. Enter your zipcode in the input field
2. Click "Find Restaurants" to fetch nearby options
3. Click "Spin the Wheel!" to randomly select a restaurant
4. View the selected restaurant's name, address, and rating

## Fallback Mode

If the Google Places API is not configured or fails, the app will automatically use mock restaurant data and display a warning message.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **API**: Google Places API
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] User preferences and favorites
- [ ] Restaurant categories/filters
- [ ] Directions and maps integration
- [ ] Social sharing features
