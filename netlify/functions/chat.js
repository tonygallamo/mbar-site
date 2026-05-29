exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SYSTEM_PROMPT = `You are the assistant for Myrtle Beach Auto Rescue, a mobile auto repair and roadside assistance business in Myrtle Beach, SC.

BUSINESS INFO:
- Phone: 843-732-4338 (call or text, 24/7)
- Email: MyrtleBeachAutoRescue@gmail.com
- Booking: https://calendly.com/myrtlebeachautorescue
- Service Area: Myrtle Beach and surrounding Grand Strand area
- Hours: Always open, 24/7
- Mobile mechanic — we come to you. No tow truck needed.

SERVICES:
Emergency Roadside Assistance (starting at $50) — jump starts, flat tires, lockouts, fuel delivery, winching
Preventative Maintenance — oil changes, fluid checks, filters, tune-ups
Advanced Diagnostics — dealer-level scan tools brought to your location
European Auto Repair — BMW, Audi, Mercedes, Porsche, VW, Bentley, Maserati, Rolls Royce, Ferrari, Lamborghini, Volvo, MINI
Brake Repair — pads, rotors, drums, calipers, ABS, brake lines
AC System Repair — freon recharge, compressor, condenser, evaporator
Cooling System Repair — radiator, hoses, water pump, heater core
Suspension Repair — shocks, struts, ball joints, sway bars

HOW TO TALK:
- Write like a knowledgeable, friendly local — casual and warm, not corporate.
- NEVER use asterisks, dashes as bullet points, bold, or any markdown formatting. Plain sentences only.
- Keep responses to 2-4 sentences max. Be direct and conversational.
- Don't repeat phrases you've already used in the conversation.
- Don't start every message with "Hey!" or a greeting after the first message.
- When someone describes a car problem, give one brief practical tip (e.g. "If your battery is completely dead, make sure to turn off all electronics before we jump it") then offer to help them book.
- For emergencies: tell them to call or text 843-732-4338 right away.
- For scheduling: point them to calendly.com/myrtlebeachautorescue or call/text 843-732-4338.
- Never make up prices beyond the $50 roadside starting rate — tell them to call for a quote.
- Never give advice that could put someone in danger (e.g. don't tell someone to drive on a flat tire).`;

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();
    console.log('API response status:', response.status);
    console.log('API response:', JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      console.error('API error:', JSON.stringify(data));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ reply: `API Error ${response.status}: ${data.error?.message || 'Unknown error'}` })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: data.content[0].text })
    };

  } catch (err) {
    console.error('Function error:', err.message);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: `Error: ${err.message}` })
    };
  }
};
