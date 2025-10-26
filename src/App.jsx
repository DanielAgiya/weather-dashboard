import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import ForecastCard from "./components/ForecastCard.jsx";

const STORAGE_KEY = "weather:recentSearches";
const DARK_KEY = "weather:darkMode";

export default function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [daily, setDaily] = useState([]); // array of daily forecast objects
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem(DARK_KEY);
      if (saved !== null) return saved === "true";
      // default to system preference
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // apply dark class to document element
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem(DARK_KEY, dark.toString());
  }, [dark]);

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    // Optionally, load last searched city on start
    if (!weather && recent.length > 0) {
      fetchWeather(recent[0]);
    }
    // eslint-disable-next-line
  }, []);

  const saveRecent = (cityName) => {
    setRecent((prev) => {
      const updated = [cityName, ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase())];
      const sliced = updated.slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sliced));
      return sliced;
    });
  };

  const fetchWeather = async (cityName = query) => {
    if (!cityName) return;
    setError("");
    setWeather(null);
    setDaily([]);

    try {
      // current weather
      const cur = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`
      );

      setWeather(cur.data);
      saveRecent(cur.data.name);

      // 5-day / 3-hour forecast endpoint
      const fc = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cur.data.name)}&units=metric&appid=${apiKey}`
      );

      // process into daily forecast: pick one entry per day (prefer midday)
      const list = fc.data.list || [];
      const dailyMap = new Map();

      list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, []);
        }
        dailyMap.get(dayKey).push(item);
      });

      // convert map to array and select midday (12:00) or nearest entry
      const dailyArr = Array.from(dailyMap.entries()).map(([day, items]) => {
        // find the item closest to 12:00
        const targetHour = 12;
        let best = items[0];
        let bestDiff = Math.abs(new Date(items[0].dt * 1000).getHours() - targetHour);
        items.forEach((it) => {
          const hr = new Date(it.dt * 1000).getHours();
          const diff = Math.abs(hr - targetHour);
          if (diff < bestDiff) {
            best = it;
            bestDiff = diff;
          }
        });
        return best;
      });

      // optionally keep next 7 days (API provides ~5 days); slice safely
      setDaily(dailyArr.slice(0, 7));
    } catch (err) {
      console.error(err);
      setError("City not found. Please try again.");
    }
  };

  const handleRefresh = () => {
    if (weather?.name) fetchWeather(weather.name);
  };

  const handleRecentClick = (c) => {
    setQuery(c);
    fetchWeather(c);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">🌤 Weather Dashboard</div>
        <div className="controls">
          <button
            className="btn-ghost"
            onClick={() => {
              setDark((d) => !d);
            }}
            title="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="card">
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={() => fetchWeather(query)}
        />

        <div className="action-buttons" style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => fetchWeather(query)}>Search</button>
          <button className="btn" onClick={handleRefresh} disabled={!weather} style={{ opacity: weather ? 1 : 0.6 }}>
            Refresh
          </button>
        </div>

        {recent.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Recent:</div>
            <div className="recent-list">
              {recent.map((c, i) => (
                <button key={i} onClick={() => handleRecentClick(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <main className="main-grid mt-6">
        <section className="card lg:col-span-2">
          {weather ? (
            <WeatherCard data={weather} />
          ) : (
            <div className="card-center">
              <p className="text-center text-gray-600 dark:text-gray-300">Search a city to see current weather.</p>
            </div>
          )}
        </section>

        <aside className="card">
          <h3 className="text-lg font-semibold mb-3">7-Day Forecast</h3>
          {daily.length > 0 ? (
            <div className="forecast-grid">
              {daily.map((d, idx) => (
                <ForecastCard key={idx} day={d} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No forecast — search a city first.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
