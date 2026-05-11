import { useState, useEffect } from 'react';

function InfoCard({ label, value, mono, highlight }) {
  return (
    <div className="info-card">
      <span className="ic-label">{label}</span>
      <span className={`ic-value ${mono ? 'mono' : ''} ${highlight ? 'hl' : ''}`}>{value || '—'}</span>
      <style jsx>{`
        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
        .ic-label { font-size: 11px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(232,237,245,0.3); }
        .ic-value { font-size: 18px; font-weight: 600; color: #E8EDF5; }
        .ic-value.mono { font-family: 'JetBrains Mono', monospace; }
        .ic-value.hl { color: #00D4FF; }
      `}</style>
    </div>
  );
}

function ProgressTrack({ status }) {
  const stages = ['Scheduled', 'Boarding', 'Departed', 'In Air', 'Approaching', 'Landed'];
  const statusMap = {
    scheduled: 0, active: 3, landed: 5, cancelled: -1, delayed: 0, diverted: 3,
  };
  const current = statusMap[status?.toLowerCase()] ?? 0;

  if (status?.toLowerCase() === 'cancelled') {
    return (
      <div className="track-wrap">
        <div className="cancelled-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Flight Cancelled
        </div>
        <style jsx>{`.track-wrap { margin: 24px 0; } .cancelled-bar { display: flex; align-items: center; gap: 8px; color: #FF5050; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 8px; padding: 12px 16px; font-weight: 500; }`}</style>
      </div>
    );
  }

  return (
    <div className="track-wrap">
      <div className="stages">
        {stages.map((s, i) => (
          <div key={s} className={`stage ${i <= current ? 'done' : ''} ${i === current ? 'active' : ''}`}>
            <div className="dot" />
            {i < stages.length - 1 && <div className="line" />}
            <span className="stage-label">{s}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .track-wrap { margin: 28px 0; }
        .stages { display: flex; align-items: flex-start; position: relative; overflow-x: auto; padding-bottom: 8px; }
        .stage { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; min-width: 70px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); background: #050A14; transition: all 0.3s; flex-shrink: 0; }
        .stage.done .dot { border-color: #00D4FF; background: rgba(0,212,255,0.2); }
        .stage.active .dot { border-color: #00D4FF; background: #00D4FF; box-shadow: 0 0 12px rgba(0,212,255,0.5); }
        .line { position: absolute; top: 5px; left: 50%; width: 100%; height: 2px; background: rgba(255,255,255,0.08); z-index: 0; }
        .stage.done .line { background: rgba(0,212,255,0.4); }
        .stage-label { font-size: 11px; margin-top: 8px; color: rgba(232,237,245,0.3); text-align: center; font-weight: 500; }
        .stage.done .stage-label { color: rgba(0,212,255,0.7); }
        .stage.active .stage-label { color: #00D4FF; }
      `}</style>
    </div>
  );
}

function WeatherDestCard({ iataCode, label }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!iataCode) return;
    fetch(`/api/weather?airport=${iataCode}`)
      .then(r => r.json())
      .then(setWeather)
      .catch(() => {});
  }, [iataCode]);

  return (
    <div className="wcard">
      <div className="wcard-label">{label} Weather</div>
      <div className="wcard-code">{iataCode}</div>
      {weather ? (
        <>
          <div className="wcard-main">
            <span className="wcard-icon">{weather.icon}</span>
            <span className="wcard-temp">{weather.temp}°C</span>
          </div>
          <div className="wcard-desc">{weather.description}</div>
          <div className="wcard-extra">
            <span>💧 {weather.humidity}%</span>
            <span>💨 {weather.wind} km/h</span>
            <span>👁 {weather.visibility} km</span>
          </div>
        </>
      ) : (
        <div className="wcard-loading">Loading…</div>
      )}
      <style jsx>{`
        .wcard { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; flex: 1; min-width: 180px; }
        .wcard-label { font-size: 11px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(232,237,245,0.3); margin-bottom: 4px; }
        .wcard-code { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 12px; }
        .wcard-main { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .wcard-icon { font-size: 32px; }
        .wcard-temp { font-size: 36px; font-weight: 700; color: #fff; }
        .wcard-desc { font-size: 14px; color: rgba(232,237,245,0.5); margin-bottom: 12px; text-transform: capitalize; }
        .wcard-extra { display: flex; gap: 12px; font-size: 13px; color: rgba(232,237,245,0.4); flex-wrap: wrap; }
        .wcard-loading { color: rgba(232,237,245,0.3); font-size: 14px; }
      `}</style>
    </div>
  );
}

export default function FlightDetail({ flightNumber, onNotify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!flightNumber) return;
    setLoading(true);
    setError(null);
    fetch(`/api/flight-detail?flight=${flightNumber}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [flightNumber]);

  const formatTime = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }
    catch { return iso; }
  };

  if (loading) return (
    <div className="state-box">
      <div className="spinner" />
      <p>Fetching flight details…</p>
      <style jsx>{`.state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px; color: rgba(232,237,245,0.4); } .spinner { width: 36px; height: 36px; border: 2px solid rgba(0,212,255,0.2); border-top-color: #00D4FF; border-radius: 50%; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="state-box">
      <p style={{ color: '#FF5050' }}>{error}</p>
      <style jsx>{`.state-box { display: flex; align-items: center; justify-content: center; padding: 60px; }`}</style>
    </div>
  );

  if (!data) return null;

  const dep = data.departure || {};
  const arr = data.arrival || {};
  const status = data.flight_status || 'scheduled';

  return (
    <div className="detail">
      <div className="detail-hero">
        <div className="hero-left">
          <div className="flight-badge">{data.flight?.iata || flightNumber}</div>
          <div className="airline-info">
            <span className="airline-name">{data.airline?.name || 'Unknown Airline'}</span>
            <span className="aircraft">{data.aircraft?.iata || data.aircraft?.icao || ''}</span>
          </div>
        </div>
        <div className="hero-right">
          <span className="status-pill" data-status={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          <button className="notify-main" onClick={() => onNotify(data)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Set Alert
          </button>
        </div>
      </div>

      <div className="route-display">
        <div className="route-airport">
          <span className="r-iata">{dep.iata || '—'}</span>
          <span className="r-city">{dep.city || dep.airport || ''}</span>
        </div>
        <div className="route-arrow">
          <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
            <path d="M0 8h36M30 3l6 5-6 5" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="route-airport right">
          <span className="r-iata">{arr.iata || '—'}</span>
          <span className="r-city">{arr.city || arr.airport || ''}</span>
        </div>
      </div>

      <ProgressTrack status={status} />

      <div className="info-grid">
        <InfoCard label="Departure" value={formatTime(dep.scheduled)} mono />
        <InfoCard label="Arrival" value={formatTime(arr.scheduled)} mono />
        <InfoCard label="Date" value={formatDate(dep.scheduled)} />
        <InfoCard label="Duration" value={data.flight?.duration ? `${Math.floor(data.flight.duration / 60)}h ${data.flight.duration % 60}m` : '—'} />
        <InfoCard label="Dep Terminal" value={dep.terminal} />
        <InfoCard label="Dep Gate" value={dep.gate} highlight />
        <InfoCard label="Arr Terminal" value={arr.terminal} />
        <InfoCard label="Arr Gate" value={arr.gate} highlight />
        {dep.delay > 0 && <InfoCard label="Delay" value={`${dep.delay} min`} />}
        {data.aircraft?.registration && <InfoCard label="Registration" value={data.aircraft.registration} mono />}
      </div>

      <div className="weather-section">
        <h3 className="section-title">Destination Weather</h3>
        <div className="weather-row">
          {dep.iata && <WeatherDestCard iataCode={dep.iata} label="Origin" />}
          {arr.iata && <WeatherDestCard iataCode={arr.iata} label="Destination" />}
        </div>
      </div>

      <style jsx>{`
        .detail { }
        .detail-hero { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .hero-left { display: flex; align-items: center; gap: 16px; }
        .flight-badge { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: #00D4FF; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); padding: 8px 16px; border-radius: 10px; }
        .airline-name { display: block; font-size: 18px; font-weight: 600; color: #fff; }
        .aircraft { font-size: 13px; color: rgba(232,237,245,0.4); }
        .hero-right { display: flex; align-items: center; gap: 12px; }
        .status-pill { font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; }
        .status-pill[data-status="active"] { background: rgba(0,255,150,0.12); color: #00FF96; }
        .status-pill[data-status="landed"] { background: rgba(100,200,100,0.12); color: #64C864; }
        .status-pill[data-status="cancelled"] { background: rgba(255,80,80,0.12); color: #FF5050; }
        .status-pill[data-status="delayed"] { background: rgba(255,180,0,0.12); color: #FFB400; }
        .status-pill[data-status="scheduled"] { background: rgba(0,212,255,0.12); color: #00D4FF; }
        .notify-main { display: flex; align-items: center; gap: 8px; background: rgba(0,212,255,0.12); border: 1px solid rgba(0,212,255,0.3); color: #00D4FF; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .notify-main:hover { background: rgba(0,212,255,0.2); }
        .route-display { display: flex; align-items: center; gap: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px 28px; margin-bottom: 8px; }
        .route-airport { flex: 1; }
        .route-airport.right { text-align: right; }
        .r-iata { display: block; font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; color: #fff; }
        .r-city { font-size: 14px; color: rgba(232,237,245,0.4); }
        .route-arrow { flex-shrink: 0; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 32px; }
        .section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(232,237,245,0.3); margin-bottom: 16px; }
        .weather-section { }
        .weather-row { display: flex; gap: 12px; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
