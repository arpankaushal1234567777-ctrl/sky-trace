// pages/api/weather.js
// Get weather for an airport's city using OpenWeatherMap
// We resolve IATA → city using a small lookup, then call OWM

const WEATHER_ICONS = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

export default async function handler(req, res) {
  const { airport } = req.query;
  const key = process.env.OPENWEATHER_KEY;

  if (!key) return res.status(500).json({ error: 'OPENWEATHER_KEY not configured.' });
  if (!airport) return res.status(400).json({ error: 'Airport code required.' });

  try {
    // First fetch AviationStack airports to resolve lat/lon, or use OWM's city search
    // We use OWM's geo lookup by IATA city fallback directly
    const geoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${airport}&appid=${key}`;

    // Better approach: use OWM's city query since IATA ~= city code often
    // We'll use the direct weather by city query
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${airport}&appid=${key}&units=metric`;
    const weatherResp = await fetch(weatherUrl);

    if (!weatherResp.ok) {
      // Fallback: try searching by airport code as a string
      throw new Error(`Weather not found for ${airport}`);
    }

    const data = await weatherResp.json();

    return res.status(200).json({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      description: data.weather[0].description,
      icon: WEATHER_ICONS[data.weather[0].icon] || '🌡️',
      city: data.name,
    });
  } catch (err) {
    // Return a graceful fallback so UI doesn't break
    console.error('[weather API]', err.message);
    return res.status(200).json({ temp: null, description: 'Unavailable', icon: '🌡️', humidity: null, wind: null, visibility: null });
  }
}
