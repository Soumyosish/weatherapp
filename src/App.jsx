import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cityTime, setCityTime] = useState(null);

  useEffect(() => {
    let timer;
    if (weather && weather.timezone !== undefined) {
      // Update every second
      timer = setInterval(() => {
        // Calculate the current time in the city's timezone
        const now = new Date();
        // Get UTC time in ms, add the city's timezone offset (in seconds)
        const localTime = new Date(now.getTime() + (weather.timezone * 1000 - now.getTimezoneOffset() * 60 * 1000));
        setCityTime(localTime);
      }, 1000);
      // Set immediately as well
      const now = new Date();
      const localTime = new Date(now.getTime() + (weather.timezone * 1000 - now.getTimezoneOffset() * 60 * 1000));
      setCityTime(localTime);
    } else {
      setCityTime(null);
    }
    return () => clearInterval(timer);
  }, [weather]);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city) {
      setError('Please enter a city name.')
      setWeather(null)
      return
    }
    setLoading(true)
    setError('')
    setWeather(null)
    try {
      // Fetch current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      )
      if (!res.ok) {
        throw new Error('City not found')
      }
      const data = await res.json()
      setWeather(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper for country flag
  const getFlagUrl = (countryCode) =>
    `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`

  return (
    <div className="weatherapp-bg">
      <div className="weatherapp-container pro">
        <h1 className="weatherapp-title">Weather App</h1>
        <div className="weatherapp-input-row">
          <input
            type="text"
            className="weatherapp-input"
            placeholder="Enter city name..."
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
          />
          <button
            className="weatherapp-btn"
            onClick={fetchWeather}
            disabled={loading}
          >
            {loading ? <span className="weatherapp-spinner"></span> : 'Get Weather'}
          </button>
        </div>
        {error && <div className="weatherapp-error">{error}</div>}
        {weather && (
          <div className="weatherapp-result pro">
            <div className="weatherapp-header">
              <div className="weatherapp-city">
                <span className="weatherapp-cityname">
                  {weather.name}, {weather.sys.country}
                  <img
                    className="weatherapp-flag"
                    src={getFlagUrl(weather.sys.country)}
                    alt={weather.sys.country}
                  />
                  {weather.weather[0].main.toLowerCase().includes('thunder') && (
                    <span className="weatherapp-thunder-icon" title="Thunderstorm"></span>
                  )}
                </span>
                <span className="weatherapp-coords">[{weather.coord.lat}, {weather.coord.lon}]</span>
              </div>
              <div className="weatherapp-date">
                {cityTime ? `${cityTime.toLocaleDateString('en-GB')}, ${cityTime.toLocaleTimeString()}` : ''}
              </div>
            </div>
            <div className="weatherapp-main">
              <img
                className="weatherapp-icon"
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
              />
              <div className="weatherapp-tempblock">
                <div className="weatherapp-temp">{Math.round(weather.main.temp)}°C</div>
                <div className="weatherapp-desc">{weather.weather[0].description}</div>
                <div className="weatherapp-feels">Feels like: {Math.round(weather.main.feels_like)}°C</div>
              </div>
            </div>
            <div className="weatherapp-details">
              <div><span className="weatherapp-label">Min:</span> {Math.round(weather.main.temp_min)}°C</div>
              <div><span className="weatherapp-label">Max:</span> {Math.round(weather.main.temp_max)}°C</div>
              <div><span className="weatherapp-label">Humidity:</span> {weather.main.humidity}%</div>
              <div><span className="weatherapp-label">Pressure:</span> {weather.main.pressure} hPa</div>
              <div><span className="weatherapp-label">Wind:</span> {weather.wind.speed} m/s</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
