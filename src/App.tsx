import { useState } from 'react'
import './App.css'
import { fetchNearbyRestaurants, getMockRestaurants } from './services/placesApi'
import { Wheel } from 'react-custom-roulette'

interface Restaurant {
  name: string;
  address: string;
  rating?: number;
  place_id: string;
  types?: string[];
  vicinity?: string;
}

function App() {
  const [zipcode, setZipcode] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [useMockData, setUseMockData] = useState(false)
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)

  const fetchRestaurants = async (inputZipcode: string) => {
    setIsLoading(true)
    setError('')
    setUseMockData(false)
    try {
      const restaurantData = await fetchNearbyRestaurants(inputZipcode)
      if (restaurantData.length === 0) {
        setError('No restaurants found near this zipcode. Try a different location.')
        return
      }
      setRestaurants(restaurantData)
    } catch {
      setError('Failed to fetch restaurants from Google Places API. Using mock data instead.')
      setUseMockData(true)
      setRestaurants(getMockRestaurants())
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipcode.trim()) {
      fetchRestaurants(zipcode)
    }
  }

  // Prepare data for react-custom-roulette
  const data = restaurants.map(r => ({ option: r.name }))

  const handleSpin = () => {
    if (restaurants.length === 0 || isSpinning) return
    const randomIndex = Math.floor(Math.random() * restaurants.length)
    setPrizeNumber(randomIndex)
    setMustSpin(true)
    setIsSpinning(true)
    setSelectedRestaurant(null)
  }

  const handleStopSpinning = () => {
    setIsSpinning(false)
    setMustSpin(false)
    setSelectedRestaurant(restaurants[prizeNumber])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span role="img" aria-label="plate">🍽️</span> Wheel a Meal
          </h1>
          <p className="text-gray-700 text-xl font-medium mt-2">
            Enter your zipcode and spin to discover your next meal!
          </p>
        </div>

        {/* Zipcode Input */}
        <div className="mb-8 flex flex-col items-center">
          <form onSubmit={handleSubmit} className="flex flex-row gap-2 w-full max-w-md">
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="Enter your zipcode..."
              className="zipcode-input flex-1"
              maxLength={5}
              pattern="[0-9]{5}"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="spin-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Finding...' : 'Find Restaurants'}
            </button>
          </form>
          {error && (
            <p className="text-red-500 text-center mt-2">{error}</p>
          )}
        </div>

        {/* Restaurant Count */}
        {restaurants.length > 0 && (
          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg">
              Found {restaurants.length} restaurants near {zipcode}
            </p>
            {useMockData && (
              <p className="text-orange-600 text-sm mt-1">
                ⚠️ Using mock data (API unavailable)
              </p>
            )}
          </div>
        )}

        {/* Wheel Section */}
        {restaurants.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 340, height: 340 }}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data}
                backgroundColors={["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#38bdf8", "#fb7185", "#facc15", "#4ade80", "#818cf8", "#fcd34d"]}
                textColors={["#222", "#fff"]}
                fontSize={18}
                outerBorderColor="#fff"
                outerBorderWidth={8}
                innerBorderColor="#e5e7eb"
                innerBorderWidth={4}
                radiusLineColor="#fff"
                radiusLineWidth={2}
                onStopSpinning={handleStopSpinning}
                spinDuration={0.7}
                pointerProps={{ style: { fill: '#f87171' } }}
              />
            </div>
            {/* Spin Button below the wheel */}
            <button
              className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl"
              onClick={handleSpin}
              disabled={isSpinning}
              aria-label="Spin the wheel"
            >
              {isSpinning ? 'Spinning...' : '🎯 Spin the Wheel!'}
            </button>
          </div>
        )}

        {/* Selected Restaurant Result */}
        {selectedRestaurant && (
          <div className="mt-10 p-6 bg-white rounded-2xl shadow-2xl max-w-md mx-auto border-2 border-indigo-100">
            <h2 className="text-2xl font-extrabold text-purple-700 mb-2 text-center flex items-center justify-center gap-2">
              <span role="img" aria-label="party">🎉</span> You're going to:
            </h2>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedRestaurant.name}
              </h3>
              <p className="text-gray-600 mb-3 flex items-center justify-center gap-1">
                <span role="img" aria-label="pin">📍</span> {selectedRestaurant.address}
              </p>
              {selectedRestaurant.rating && (
                <p className="text-yellow-500 font-semibold flex items-center justify-center gap-1">
                  <span role="img" aria-label="star">⭐</span> {selectedRestaurant.rating}/5
                </p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {restaurants.length === 0 && !isLoading && (
          <div className="text-center mt-12 text-gray-500">
            <p className="text-lg">
              Enter your zipcode above to start discovering restaurants!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
