// pages/api/airport-info.js
// Basic airport info lookup via AviationStack airports endpoint

export default async function handler(req, res) {
  const { code } = req.query;
  const key = process.env.AVIATIONSTACK_KEY;

  if (!key) return res.status(500).json({ error: 'AVIATIONSTACK_KEY not configured.' });
  if (!code) return res.status(400).json({ error: 'Airport code required.' });

  try {
    const url = `http://api.aviationstack.com/v1/airports?access_key=${key}&iata_code=${code.toUpperCase()}&limit=1`;
    const resp = await fetch(url);
    const json = await resp.json();

    if (json.error) throw new Error(json.error.message);

    const airport = json.data && json.data[0];
    if (!airport) return res.status(200).json(null);

    return res.status(200).json({
      name: airport.airport_name,
      city: airport.city_iata_code || airport.city,
      country: airport.country_name,
      iata: airport.iata_code,
      lat: airport.latitude,
      lon: airport.longitude,
      timezone: airport.timezone,
    });
  } catch (err) {
    console.error('[airport-info API]', err.message);
    return res.status(200).json(null);
  }
}
