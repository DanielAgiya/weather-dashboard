import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  // ✅ Import your API key from the .env file
  const apiKey = import.meta.env.VITE_API_KEY;

  // 🔍 Function to fetch weather data
  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
        setError("");
      } else {
        setError("City not found. Please try again.");
        setWeather(null);
      }
    } catch (error) {
      setError("Unable to fetch weather data. Please check your connection.");
      setWeather(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">
        🌤 Weather Dashboard
      </h1>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter city name..."
          className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={fetchWeather}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Weather Display */}
      {weather && (
        <div className="bg-white shadow-md rounded-2xl p-6 text-center w-80 sm:w-96">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-lg text-gray-600 capitalize mb-4">
            {weather.weather[0].description}
          </p>

          <div className="flex justify-center items-center gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-20 h-20"
            />
            <p className="text-5xl font-bold text-blue-700">
              {Math.round(weather.main.temp)}°C
            </p>
          </div>

          <div className="mt-4 text-gray-700">
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>💨 Wind: {weather.wind.speed} km/h</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
