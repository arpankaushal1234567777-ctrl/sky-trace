export default async function handler(req, res) {
  const { type, airport } = req.query;
  const key = process.env.AVIATIONSTACK_KEY;

  if (!key) {
    return res.status(500).json({ error: 'AVIATIONSTACK_KEY not configured.', data: [] });
  }
  if (!airport) {
    return res.status(400).json({ error: 'Airport code required.', data: [] });
  }

  const param = type === 'arrivals' ? 'arr_iata' : 'dep_iata';

  // Use http:// — AviationStack free plan does not support https://
  const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&${param}=${airport.toUpperCase()}&limit=50`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[flights] Non-JSON response:', text.slice(0, 300));
      return res.status(500).json({ error: 'Invalid response from AviationStack', data: [] });
    }

    if (data.error) {
      console.error('[flights] API error:', data.error);
      return res.status(500).json({ error: data.error.message || 'AviationStack error', data: [] });
    }

    return res.status(200).json({ data: data.data || [] });

  } catch (err) {
    console.error('[flights]', err.message);
    return res.status(500).json({ error: err.message, data: [] });
  }
}