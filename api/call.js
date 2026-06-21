export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, business } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  // Clean phone number — add +91 if not present
  let cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone.replace(/^0/, '');
  }

  try {
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
      },
      body: JSON.stringify({
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        assistantId: process.env.VAPI_ASSISTANT_ID,
        customer: {
          number: cleanPhone,
          name: name || 'Valued Customer'
        },
        assistantOverrides: {
          variableValues: {
            customerName: name || 'there',
            businessType: business || 'your business'
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vapi error:', data);
      return res.status(response.status).json({ error: 'Call failed', details: data });
    }

    return res.status(200).json({ success: true, callId: data.id });
  } catch (err) {
    console.error('Call proxy error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
