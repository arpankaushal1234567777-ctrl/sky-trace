# ✈️ SkyTrace — Flight Tracker

Real-time flight tracker built with **Next.js**, powered by AviationStack, OpenWeatherMap, and Twilio.

## Features

- 🛬 **Airport Board** — Live arrivals & departures for any IATA code (JFK, DEL, LHR…)
- 🔍 **Flight Detail** — Enter a flight number (AI101, AA123) for full status, gate, times
- 🌤️ **Destination Weather** — Live temp, wind, humidity for origin & destination airports
- 🔔 **Smart Alerts** — Get notified via SMS or phone call before departure, on status change, or on landing

---

## How to Use

### Airport Mode
Type an IATA airport code in the search bar:
- `JFK` → New York JFK
- `DEL` → Indira Gandhi International
- `LHR` → London Heathrow
- `DXB` → Dubai International

You'll see a live board of arrivals and departures with time, flight number, airline, origin/destination, gate, status, and current weather at each destination.

### Flight Mode
Type a flight number:
- `AI101` → Air India 101
- `EK202` → Emirates 202
- `6E234` → IndiGo 234

You'll see full flight details including the flight progress tracker, both airports' weather, gates, terminals, and delay info.

### Notifications
Click **Notify** on any flight row, or **Set Alert** on the flight detail page. Choose:
- **SMS** or **Phone Call** via Twilio
- Timing: 15/30/60/120 min before departure, on status change, on departure, or on landing

---

## Project Structure

```
skytrace/
├── pages/
│   ├── index.js              # Main UI + search
│   └── api/
│       ├── flights.js        # Arrivals/departures (AviationStack)
│       ├── flight-detail.js  # Single flight lookup
│       ├── airport-info.js   # Airport name/city/country
│       ├── weather.js        # Weather by airport code (OWM)
│       └── notify.js         # Twilio SMS/call dispatch
├── components/
│   ├── AirportTracker.js     # Arrivals/departures table
│   ├── FlightDetail.js       # Full flight info card
│   └── NotifyModal.js        # Alert setup modal
├── .env.example
└── package.json
```

---


---



## Deployed Link

https://skytrace47.vercel.app
