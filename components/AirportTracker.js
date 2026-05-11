import { useState, useEffect } from 'react';

const AVIATIONSTACK_KEY = process.env.NEXT_PUBLIC_AVIATIONSTACK_KEY || 'YOUR_AVIATIONSTACK_KEY';
const OPENWEATHER_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || 'YOUR_OPENWEATHER_KEY';

const STATUS_COLORS = {
  scheduled: { bg: 'rgba(0,212,255,0.12)', color: '#00D4FF', label: 'Scheduled' },
  active: { bg: 'rgba(0,255,150,0.12)', color: '#00FF96', label: 'In Air' },
  landed: { bg: 'rgba(100,200,100,0.12)', color: '#64C864', label: 'Landed' },
  cancelled: { bg: 'rgba(255,80,80,0.12)', color: '#FF5050', label: 'Cancelled' },
  delayed: { bg: 'rgba(255,180,0,0.12)', color: '#FFB400', label: 'Delayed' },
  diverted: { bg: 'rgba(255,130,0,0.12)', color: '#FF8200', label: 'Diverted' },
};

function WeatherBadge({ iataCode }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!iataCode) return;
    fetch(`/api/weather?airport=${iataCode}`)
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => {});
  }, [iataCode]);

  if (!weather) return null;

  return (
    <div className="weather-badge">
      <span className="weather-icon">{weather.icon}</span>
      <span className="weather-temp">{weather.temp}°C</span>
      <span className="weather-desc">{weather.description}</span>
      <style jsx>{`
        .weather-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 4px 10px; font-size: 13px; }
        .weather-icon { font-size: 16px; }
        .weather-temp { font-weight: 600; color: #E8EDF5; }
        .weather-desc { color: rgba(232,237,245,0.5); }
      `}</style>
    </div>
  );
}

function FlightRow({ flight, type, onNotify }) {
  const isArr = type === 'arrivals';
  const iata = isArr ? flight.departure?.iata : flight.arrival?.iata;
  const time = isArr
    ? (flight.arrival?.scheduled || flight.arrival?.estimated || '—')
    : (flight.departure?.scheduled || flight.departure?.estimated || '—');

  const formatTime = (iso) => {
    if (!iso || iso === '—') return '—';
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  const status = (flight.flight_status || 'scheduled').toLowerCase();
  const sc = STATUS_COLORS[status] || STATUS_COLORS.scheduled;

  return (
    <tr className="flight-row">
      <td className="time-cell">{formatTime(time)}</td>
      <td className="flight-cell">
        <span className="flight-num">{flight.flight?.iata || flight.flight?.icao || '—'}</span>
      </td>
      <td className="airline-cell">{flight.airline?.name || '—'}</td>
      <td className="dest-cell">
        <span className="dest-code">{iata || '—'}</span>
        <span className="dest-name">{isArr ? flight.departure?.airport : flight.arrival?.airport || ''}</span>
        {iata && <WeatherBadge iataCode={iata} />}
      </td>
      <td className="gate-cell">{(isArr ? flight.arrival?.gate : flight.departure?.gate) || <span className="na">—</span>}</td>
      <td className="status-cell">
        <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </td>
      <td className="action-cell">
        <button className="notify-btn" onClick={() => onNotify(flight)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notify
        </button>
      </td>
      <style jsx>{`
        .flight-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
        .flight-row:hover { background: rgba(0,212,255,0.04); }
        .flight-row td { padding: 14px 12px; vertical-align: middle; font-size: 14px; }
        .time-cell { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 500; color: #fff; white-space: nowrap; }
        .flight-num { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: #00D4FF; background: rgba(0,212,255,0.1); padding: 3px 8px; border-radius: 6px; }
        .airline-cell { color: rgba(232,237,245,0.7); }
        .dest-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .dest-code { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #fff; }
        .dest-name { color: rgba(232,237,245,0.4); font-size: 12px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .gate-cell { font-family: 'JetBrains Mono', monospace; color: rgba(232,237,245,0.6); }
        .na { color: rgba(232,237,245,0.2); }
        .status-pill { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
        .action-cell { }
        .notify-btn { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(232,237,245,0.7); font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .notify-btn:hover { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.3); color: #00D4FF; }
      `}</style>
    </tr>
  );
}

export default function AirportTracker({ code, onNotify }) {
  const [tab, setTab] = useState('arrivals');
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [airportInfo, setAirportInfo] = useState(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/flights?type=arrivals&airport=${code}`).then(r => r.json()),
      fetch(`/api/flights?type=departures&airport=${code}`).then(r => r.json()),
      fetch(`/api/airport-info?code=${code}`).then(r => r.json()),
    ])
      .then(([arr, dep, info]) => {
        setArrivals(arr.data || []);
        setDepartures(dep.data || []);
        setAirportInfo(info);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  const flights = tab === 'arrivals' ? arrivals : departures;

  return (
    <div className="tracker">
      <div className="tracker-header">
        <div className="airport-meta">
          <h1 className="airport-code">{code}</h1>
          {airportInfo && (
            <div className="airport-details">
              <span className="airport-name">{airportInfo.name}</span>
              <span className="airport-loc">{airportInfo.city}, {airportInfo.country}</span>
              <WeatherBadge iataCode={code} />
            </div>
          )}
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'arrivals' ? 'active' : ''}`} onClick={() => setTab('arrivals')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16v-2a4 4 0 0 0-4-4H5"/><polyline points="9 14 5 10 9 6"/>
            </svg>
            Arrivals {arrivals.length > 0 && <span className="count">{arrivals.length}</span>}
          </button>
          <button className={`tab ${tab === 'departures' ? 'active' : ''}`} onClick={() => setTab('departures')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="15" y2="12"/><polyline points="11 8 15 12 11 16"/>
            </svg>
            Departures {departures.length > 0 && <span className="count">{departures.length}</span>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <p>Fetching live flight data…</p>
        </div>
      )}

      {error && (
        <div className="state-box error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <div className="state-box">
          <p style={{ color: 'rgba(232,237,245,0.4)' }}>No {tab} found for <strong>{code}</strong>.</p>
        </div>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="table-wrap">
          <table className="flight-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Flight</th>
                <th>Airline</th>
                <th>{tab === 'arrivals' ? 'From' : 'To'}</th>
                <th>Gate</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f, i) => (
                <FlightRow key={i} flight={f} type={tab} onNotify={onNotify} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .tracker { }
        .tracker-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .airport-meta { }
        .airport-code { font-size: 42px; font-weight: 700; letter-spacing: -1px; color: #fff; line-height: 1; }
        .airport-details { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
        .airport-name { font-size: 15px; color: rgba(232,237,245,0.7); }
        .airport-loc { font-size: 13px; color: rgba(232,237,245,0.4); }
        .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 4px; }
        .tab { display: flex; align-items: center; gap: 8px; background: transparent; border: none; color: rgba(232,237,245,0.5); font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 7px; cursor: pointer; transition: all 0.2s; }
        .tab.active { background: rgba(0,212,255,0.15); color: #00D4FF; }
        .tab:hover:not(.active) { color: #E8EDF5; background: rgba(255,255,255,0.05); }
        .count { background: rgba(0,212,255,0.2); color: #00D4FF; font-size: 11px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }
        .state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: rgba(232,237,245,0.4); text-align: center; }
        .state-box.error { color: #FF5050; }
        .spinner { width: 32px; height: 32px; border: 2px solid rgba(0,212,255,0.2); border-top-color: #00D4FF; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-wrap { overflow-x: auto; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
        .flight-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .flight-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .flight-table th { padding: 12px 12px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(232,237,245,0.3); }
      `}</style>
    </div>
  );
}
