import { useState } from 'react';
import Head from 'next/head';
import AirportTracker from '../components/AirportTracker';
import FlightDetail from '../components/FlightDetail';
import NotifyModal from '../components/NotifyModal';

export default function Home() {
  const [view, setView] = useState('airport'); // 'airport' | 'flight'
  const [searchInput, setSearchInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [notifyFlight, setNotifyFlight] = useState(null);

  const isFlightNumber = (val) => /^[A-Z0-9]{2,3}\d{1,5}$/i.test(val.trim());
  const handleSearch = (e) => {
    e.preventDefault();
    const val = searchInput.trim().toUpperCase();
    if (!val) return;
    setSubmitted(val);
    setView(isFlightNumber(val) ? 'flight' : 'airport');
  };

  return (
    <>
      <Head>
        <title>SkyTrace — Flight Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L25 10V18L14 25L3 18V10L14 3Z" stroke="#00D4FF" strokeWidth="1.5" fill="none" />
                <path d="M14 8L20 12V16L14 20L8 16V12L14 8Z" fill="#00D4FF" fillOpacity="0.3" stroke="#00D4FF" strokeWidth="1" />
                <circle cx="14" cy="14" r="2" fill="#00D4FF" />
              </svg>
              <span className="logo-text">SkyTrace</span>
            </div>
            <span className="tagline">Real-time flight intelligence</span>
          </div>
        </header>

        <main className="main">
          <div className="search-section">
            <p className="search-hint">Enter an airport code (e.g. <code>JFK</code>, <code>DEL</code>) for arrivals & departures, or a flight number (e.g. <code>AI101</code>) for detailed flight info.</p>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Airport code or flight number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="search-btn">
                  Track
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {submitted && (
            <div className="results-area">
              {view === 'airport' ? (
                <AirportTracker
                  code={submitted}
                  onNotify={(flight) => setNotifyFlight(flight)}
                />
              ) : (
                <FlightDetail
                  flightNumber={submitted}
                  onNotify={(flight) => setNotifyFlight(flight)}
                />
              )}
            </div>
          )}
        </main>

        {notifyFlight && (
          <NotifyModal
            flight={notifyFlight}
            onClose={() => setNotifyFlight(null)}
          />
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #050A14;
          color: #E8EDF5;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 212, 255, 0.08) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(0,212,255,0.02) 60px, rgba(0,212,255,0.02) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,212,255,0.02) 60px, rgba(0,212,255,0.02) 61px);
        }
        code {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(0,212,255,0.1);
          color: #00D4FF;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
        }
        .app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }
        .header { border-bottom: 1px solid rgba(0,212,255,0.1); padding: 20px 0; margin-bottom: 40px; }
        .header-inner { display: flex; align-items: center; gap: 16px; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-text { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #fff; }
        .tagline { font-size: 13px; color: rgba(232,237,245,0.4); letter-spacing: 0.5px; }
        .search-section { max-width: 680px; margin: 0 auto 48px; text-align: center; }
        .search-hint { font-size: 14px; color: rgba(232,237,245,0.5); margin-bottom: 20px; line-height: 1.6; }
        .search-form { width: 100%; }
        .search-box {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 12px;
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s;
        }
        .search-box:focus-within { border-color: rgba(0,212,255,0.5); }
        .search-icon { color: rgba(0,212,255,0.5); flex-shrink: 0; }
        .search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #E8EDF5; font-family: 'JetBrains Mono', monospace;
          font-size: 16px; padding: 8px 12px; letter-spacing: 1px;
        }
        .search-input::placeholder { color: rgba(232,237,245,0.2); letter-spacing: 0; font-family: 'Space Grotesk', sans-serif; }
        .search-btn {
          display: flex; align-items: center; gap: 8px;
          background: #00D4FF; color: #050A14;
          border: none; border-radius: 8px;
          padding: 10px 20px; font-family: 'Space Grotesk', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .search-btn:hover { background: #33DDFF; }
        .search-btn:active { transform: scale(0.98); }
        .results-area { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
