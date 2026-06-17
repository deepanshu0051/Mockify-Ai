export async function analyzeResumeWithGroq(extractedText) {
  // Truncate to a safe limit to avoid LLM context length limits or excessive token usage
  const safeText = extractedText.substring(0, 15000);

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) and resume analyzer.
You will receive extracted text from a candidate's uploaded PDF. 
Determine if it is a professional resume and extract key details.
Output MUST be strictly valid JSON without any markdown framing or formatting.

Schema:
{
  "isResume": boolean,
  "confidence": number (0-100),
  "name": string | null,
  "email": string | null,
  "phone": string | null,
  "skills": string[],
  "suggestedRole": string | null,
  "summary": string | null
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: safeText }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Groq Error]: ${res.status} ${res.statusText} - Payload:`, errorText);
      throw new Error('AI_API_DOWN');
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (parseErr) {
      // Robust fallback extraction if there's minor deviation in JSON output
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('AI_OUTPUT_PARSE_FAILED');
    }
  } catch (error) {
    if (error.message === 'AI_OUTPUT_PARSE_FAILED' || error.message === 'AI_API_DOWN') throw error;
    console.error('[/lib/groqResumeAnalysis.js] Failed to analyze resume', error);
    throw error;
  }
}
