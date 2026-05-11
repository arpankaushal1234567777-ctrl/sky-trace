// pages/api/notify.js
// Send SMS or initiate a call via Twilio for flight alerts

import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, method, flightNumber, departure, arrival, minutesBefore, flightData } = req.body;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER; // e.g. "+1XXXXXXXXXX"

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: 'Twilio credentials not configured.' });
  }
  if (!phone) return res.status(400).json({ error: 'Phone number required.' });

  const client = twilio(accountSid, authToken);

  // Build alert message
  const depTime = flightData?.departure?.scheduled
    ? new Date(flightData.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const arrTime = flightData?.arrival?.scheduled
    ? new Date(flightData.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const status = (flightData?.flight_status || 'scheduled').toUpperCase();
  const gate = flightData?.departure?.gate ? `Gate ${flightData.departure.gate}` : 'Gate TBD';

  let alertLabel = '';
  if (minutesBefore > 0) alertLabel = `${minutesBefore} minutes before departure`;
  else if (minutesBefore === 0) alertLabel = 'on status change';
  else if (minutesBefore === -1) alertLabel = 'on departure';
  else if (minutesBefore === -2) alertLabel = 'on landing';

  const message = [
    `✈️ SkyTrace Flight Alert`,
    `Flight: ${flightNumber}`,
    `Route: ${departure} → ${arrival}`,
    `Departure: ${depTime} | Arrival: ${arrTime}`,
    `Status: ${status} | ${gate}`,
    `You will be notified ${alertLabel}.`,
    `Track at skytrace.app`,
  ].join('\n');

  try {
    if (method === 'sms') {
      await client.messages.create({
        body: message,
        from: fromNumber,
        to: phone,
      });
    } else if (method === 'call') {
      // TwiML for voice call — reads out the alert
      const twiml = `
        <Response>
          <Say voice="alice">
            Hello! This is SkyTrace with your flight alert.
            Flight ${flightNumber.split('').join(' ')} from ${departure} to ${arrival}.
            Departure at ${depTime}. Arrival at ${arrTime}.
            Current status: ${status}.
            ${gate}.
            Have a safe flight!
          </Say>
        </Response>
      `.trim();

      await client.calls.create({
        twiml,
        from: fromNumber,
        to: phone,
      });
    } else {
      return res.status(400).json({ error: 'Invalid notification method. Use "sms" or "call".' });
    }

    return res.status(200).json({ success: true, method, phone, flightNumber });
  } catch (err) {
    console.error('[notify API]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
