export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, email, phone, type, size, challenge } = req.body;

  try {
    // 1. Send notification email to Depgrow owner
    const ownerEmail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Depgrow Leads <onboarding@resend.dev>',
        to: [process.env.OWNER_EMAIL || 'hello@depgrow.in'],
        subject: `🔥 New Lead: ${name} — ${business}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0E7A5A; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="margin:0; font-size: 20px;">🚀 New Lead Alert — Depgrow</h1>
              <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">AI Voice Agent already calling them!</p>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; width: 140px;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${name}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Business</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${business}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${phone}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${email}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Business Type</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${type}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Team Size</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${size}</td></tr>
                <tr><td style="padding: 10px 0; font-size: 14px; color: #6b7280; vertical-align: top;">Challenge</td><td style="padding: 10px 0; font-size: 14px;">${challenge}</td></tr>
              </table>
            </div>
            <div style="background: #D6F4EC; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #0A2E22;">📞 AI Voice Agent has already called this lead — check Vapi dashboard for call status.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!ownerEmail.ok) {
      const err = await ownerEmail.json();
      console.error('Resend owner email error:', err);
    }

    // 2. Send confirmation email to lead (optional but professional)
    if (email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Valluri at Depgrow <onboarding@resend.dev>',
          to: [email],
          subject: `We're calling you now, ${name.split(' ')[0]}! 📞`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #0E7A5A; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin:0; font-size: 22px;">You're all set, ${name.split(' ')[0]}! 🚀</h1>
              </div>
              <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 15px; color: #374151; line-height: 1.7;">Our AI assistant is calling you right now at <strong>${phone}</strong>.</p>
                <p style="font-size: 15px; color: #374151; line-height: 1.7;">It will introduce itself and give you a quick overview of how Depgrow can help <strong>${business}</strong>. If you miss the call, we'll follow up on WhatsApp.</p>
                <div style="background: #f9fafb; border-radius: 10px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Meanwhile, if you have any questions:</p>
                  <p style="margin: 8px 0 0; font-size: 14px;"><a href="https://wa.me/918309553962" style="color: #0E7A5A; text-decoration: none; font-weight: 600;">💬 WhatsApp: +91 83095 53962</a></p>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">— Valluri Satyannarayana<br>Founder, Depgrow</p>
              </div>
            </div>
          `,
        }),
      }).catch(() => {}); // Don't fail if lead email fails
    }

    // 3. Send WhatsApp notification to owner via Twilio Sandbox
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;

    if (twilioSid && twilioAuth) {
      const waMessage = `*New Depgrow Lead!*\n\n*Name:* ${name}\n*Business:* ${business}\n*Phone:* ${phone}\n*Email:* ${email}\n*Type:* ${type}\n*Team Size:* ${size}\n*Challenge:* ${challenge}\n\nAI Voice Agent already called them!`;

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: 'whatsapp:+14155238886',
          To: 'whatsapp:+918309553962',
          Body: waMessage,
        }).toString(),
      }).catch(err => console.error('WhatsApp notification error:', err));
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email API error:', err);
    return res.status(500).json({ success: false, error: 'Email send failed' });
  }
}
