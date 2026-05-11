import { useState } from 'react';

const DURATION_OPTIONS = [
  { label: '15 min before', value: 15 },
  { label: '30 min before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: 'On status change', value: 0 },
  { label: 'On departure', value: -1 },
  { label: 'On landing', value: -2 },
];

export default function NotifyModal({ flight, onClose }) {
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('sms');
  const [duration, setDuration] = useState(30);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const flightNum = flight?.flight?.iata || flight?.flight?.icao || 'Unknown';
  const dep = flight?.departure?.iata || '';
  const arr = flight?.arrival?.iata || '';

  const handleSubmit = async () => {
    if (!phone.trim()) { setError('Please enter a phone number.'); return; }
    if (!/^\+?[\d\s\-()]{7,20}$/.test(phone)) { setError('Please enter a valid phone number (include country code, e.g. +91XXXXXXXXXX).'); return; }
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          method,
          flightNumber: flightNum,
          departure: dep,
          arrival: arr,
          minutesBefore: duration,
          flightData: flight,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set notification');
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>Flight Alert</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flight-summary">
          <span className="fs-num">{flightNum}</span>
          {dep && arr && <span className="fs-route">{dep} → {arr}</span>}
        </div>

        {success ? (
          <div className="success-state">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF96" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Alert Set!</h3>
            <p>You'll receive a {method === 'sms' ? 'text message' : 'phone call'} at <strong>{phone}</strong> for flight <strong>{flightNum}</strong>.</p>
            <button className="done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input
                type="tel"
                className="field-input"
                placeholder="+91 9999999999"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
              />
              <span className="field-hint">Include country code (e.g. +91 for India, +1 for US)</span>
            </div>

            <div className="field">
              <label className="field-label">Notification Method</label>
              <div className="method-toggle">
                <button
                  className={`method-btn ${method === 'sms' ? 'active' : ''}`}
                  onClick={() => setMethod('sms')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Text (SMS)
                </button>
                <button
                  className={`method-btn ${method === 'call' ? 'active' : ''}`}
                  onClick={() => setMethod('call')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Phone Call
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Notify Me</label>
              <div className="duration-grid">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`dur-btn ${duration === opt.value ? 'active' : ''}`}
                    onClick={() => setDuration(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="submit-btn" onClick={handleSubmit} disabled={sending}>
              {sending ? (
                <>
                  <span className="mini-spin" />
                  Scheduling alert…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  Set Alert via {method === 'sms' ? 'SMS' : 'Phone Call'}
                </>
              )}
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .overlay { position: fixed; inset: 0; background: rgba(5,10,20,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
        .modal { background: #0C1626; border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; width: 100%; max-width: 480px; padding: 24px; animation: scaleIn 0.2s ease; max-height: 90vh; overflow-y: auto; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: #fff; }
        .close-btn { background: none; border: none; color: rgba(232,237,245,0.4); cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s; }
        .close-btn:hover { color: #fff; }
        .flight-summary { display: flex; align-items: center; gap: 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.15); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; }
        .fs-num { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; color: #00D4FF; }
        .fs-route { font-size: 15px; color: rgba(232,237,245,0.6); }
        .field { margin-bottom: 20px; }
        .field-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(232,237,245,0.4); margin-bottom: 8px; }
        .field-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; color: #E8EDF5; font-family: 'JetBrains Mono', monospace; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(0,212,255,0.4); }
        .field-hint { font-size: 12px; color: rgba(232,237,245,0.3); margin-top: 5px; display: block; }
        .method-toggle { display: flex; gap: 8px; }
        .method-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(232,237,245,0.5); font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 500; padding: 11px; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .method-btn.active { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.3); color: #00D4FF; }
        .method-btn:hover:not(.active) { color: #E8EDF5; border-color: rgba(255,255,255,0.15); }
        .duration-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
        .dur-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(232,237,245,0.5); font-family: 'Space Grotesk', sans-serif; font-size: 13px; padding: 9px 12px; border-radius: 7px; cursor: pointer; transition: all 0.15s; text-align: left; }
        .dur-btn.active { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.3); color: #00D4FF; }
        .dur-btn:hover:not(.active) { color: #E8EDF5; }
        .error-msg { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2); color: #FF6B6B; font-size: 13px; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }
        .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #00D4FF; color: #050A14; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; padding: 14px; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; margin-top: 4px; }
        .submit-btn:hover:not(:disabled) { background: #33DDFF; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mini-spin { width: 16px; height: 16px; border: 2px solid rgba(5,10,20,0.3); border-top-color: #050A14; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .success-state { text-align: center; padding: 20px 0; }
        .success-icon { width: 64px; height: 64px; background: rgba(0,255,150,0.1); border: 1px solid rgba(0,255,150,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .success-state h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .success-state p { color: rgba(232,237,245,0.6); font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .success-state strong { color: #E8EDF5; }
        .done-btn { background: rgba(0,255,150,0.12); border: 1px solid rgba(0,255,150,0.25); color: #00FF96; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .done-btn:hover { background: rgba(0,255,150,0.2); }
      `}</style>
    </div>
  );
}
