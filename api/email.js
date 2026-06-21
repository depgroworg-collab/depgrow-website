export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, email, phone, type, size, challenge } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Depgrow Website <onboarding@resend.dev>',
        to: ['depgrow.org@gmail.com'],
        subject: `🔥 New Lead: ${name} — ${business || 'Unknown Business'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px">
            <div style="background:#0E7A5A;padding:20px 24px;border-radius:8px;margin-bottom:24px">
              <h1 style="color:#fff;margin:0;font-size:22px">🔥 New Lead from Depgrow Website</h1>
              <p style="color:#D6F4EC;margin:6px 0 0;font-size:14px">Someone just submitted the Free Revenue Audit form</p>
            </div>

            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin-bottom:16px">
              <h2 style="font-size:16px;color:#111827;margin:0 0 16px">👤 Contact Details</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px;width:140px">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px">Business</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${business || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827"><a href="mailto:${email}" style="color:#0E7A5A">${email || '—'}</a></td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px">Phone</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827"><a href="tel:${phone}" style="color:#0E7A5A">${phone}</a></td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px">Business Type</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${type || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:14px">Team Size</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${size || '—'}</td></tr>
              </table>
            </div>

            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin-bottom:16px">
              <h2 style="font-size:16px;color:#111827;margin:0 0 10px">💬 Biggest Challenge</h2>
              <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;background:#F9FAFB;padding:12px;border-radius:6px;border-left:3px solid #0E7A5A">${challenge || 'Not specified'}</p>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:16px">
              <a href="https://wa.me/${phone.replace(/\D/g,'')}?text=Hi ${encodeURIComponent(name)}, I'm Valluri from Depgrow! I saw you filled our form. Let's chat about growing your business 🚀" 
                 style="display:inline-block;background:#25D366;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                💬 Reply on WhatsApp
              </a>
              <a href="mailto:${email}" 
                 style="display:inline-block;background:#0E7A5A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                📧 Reply via Email
              </a>
            </div>

            <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0">
              Depgrow Website • Auto-notification • ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})} IST
            </p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: 'Email failed', details: data });
    }

    return res.status(200).json({ success: true, emailId: data.id });
  } catch (err) {
    console.error('Email proxy error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
