import React from "react";

export default function WeatherCard({ data }) {
  if (!data) return null;
  const { name, main, weather, wind, sys } = data;

  return (
    <div>
      <div className="card-center">
        <div className="city-name">{name}{sys?.country ? `, ${sys.country}` : ""}</div>
        <div className="temp">{Math.round(main.temp)}°C</div>
        <div className="description">{weather[0].description}</div>
        <div className="meta">
          <div>Feels like: {Math.round(main.feels_like)}°C</div>
          <div>Humidity: {main.humidity}%</div>
          <div>Wind: {wind.speed} m/s</div>
        </div>
      </div>
    </div>
  );
}
