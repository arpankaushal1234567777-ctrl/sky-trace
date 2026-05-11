export default async function handler(req, res) {
  const { flight } = req.query;
  const key = process.env.AVIATIONSTACK_KEY;

  if (!key) return res.status(500).json({ error: 'AVIATIONSTACK_KEY not configured.' });
  if (!flight) return res.status(400).json({ error: 'Flight number required.' });

  // Use http:// — free plan does not support https://
  const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${flight.toUpperCase()}&limit=1`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('[flight-detail] Non-JSON response:', text.slice(0, 300));
      return res.status(500).json({ error: 'Invalid response from AviationStack' });
    }

    if (json.error) {
      throw new Error(json.error.message || 'AviationStack error');
    }

    const record = json.data && json.data[0];
    if (!record) {
      return res.status(404).json({ error: `No flight found for ${flight}. The flight may not be active right now, or the flight number may be incorrect.` });
    }

    return res.status(200).json(record);

  } catch (err) {
    console.error('[flight-detail]', err.message);
    return res.status(500).json({ error: err.message });
  }
}