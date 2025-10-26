import React from "react";

export default function ForecastCard({ day }) {
  if (!day) return null;
  const date = new Date(day.dt * 1000);
  const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const temp = Math.round(day.main.temp);
  const desc = day.weather[0].description;
  const icon = day.weather[0].icon;

  return (
    <div className="card card-center">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={desc} className="w-16 h-16" />
      <div className="text-lg font-semibold">{temp}°C</div>
      <div className="description text-sm">{desc}</div>
    </div>
  );
}
