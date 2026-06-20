export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `You are the AI agent for Depgrow, an AI automation agency. You help potential clients understand what Depgrow builds and encourage them to book a free strategy call.

WHAT DEPGROW BUILDS:
- Revenue Capture System (₹60,000 one-time): AI voice agent 24/7, WhatsApp & SMS bot, CRM sync, lead qualification
- Ops Efficiency System (₹1,00,000 one-time): 3-5 workflow automations, n8n/Make, reporting dashboard, team training
- Web Capture System (₹50,000 one-time): High-converting landing page, lead capture, WhatsApp triggers, analytics

Individual solutions from ₹14,999: instant lead follow-up, inbound AI receptionist, appointment booking bot, WhatsApp sequences, outbound AI caller, CRM auto-population, and more.

KEY FACTS:
- Live in 2 weeks
- Fixed price, no surprises
- No need to replace existing software
- ROI measured in hours saved and revenue generated
- Free 30-min strategy call available

Be friendly, concise, and helpful. End responses with a nudge to book the free call. Keep replies under 100 words. If someone asks something outside your knowledge, invite them to book a call.`,
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Anthropic API error:", data);
      return res.status(r.status).json({ error: "Upstream API error", details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Chat proxy error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
