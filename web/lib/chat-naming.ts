/**
 * Chat naming utilities using Gemini API
 */

interface ChatNamingResponse {
  title: string;
}

/**
 * Generate a chat title using Gemini API based on the first message
 */
export async function generateChatTitle(
  firstMessage: string, 
  geminiApiKey: string
): Promise<string> {
  if (!geminiApiKey || !firstMessage.trim()) {
    return generateFallbackTitle(firstMessage);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a concise, descriptive title (max 5 words) for this chat conversation. The first message is: "${firstMessage}"

Return ONLY the title, no explanation or extra text. Examples:
- "Leaderboard Script Help"
- "GUI Design Tutorial" 
- "Particle Effect System"
- "DataStore Integration"
- "Weapon Script Creation"

Title:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
            topK: 40,
            topP: 0.95,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return generateFallbackTitle(firstMessage);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const title = data.candidates[0].content.parts[0].text.trim();
      // Clean up any extra formatting
      return title.replace(/^["'`](.*?)/, '$1').replace(/["'`]$/g, '').trim();
    }

    return generateFallbackTitle(firstMessage);
  } catch (error) {
    console.error('Error generating chat title with Gemini:', error);
    return generateFallbackTitle(firstMessage);
  }
}

/**
 * Fallback title generation when Gemini is unavailable
 */
function generateFallbackTitle(message: string): string {
  const trimmed = message.trim();
  
  // Simple patterns for common requests
  const patterns = [
    /create\s+(.+?)\s*(script|gui|system|effect|tool)/i,
    /make\s+(.+?)\s*(script|gui|system|effect|tool)/i,
    /build\s+(.+?)\s*(script|gui|system|effect|tool)/i,
    /design\s+(.+?)\s*(gui|interface|ui)/i,
    /generate\s+(.+?)\s*(code|script)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const title = match[1] || trimmed.substring(0, 30);
      return title.charAt(0).toUpperCase() + title.slice(1).substring(0, 25);
    }
  }

  // Fallback: just truncate and capitalize
  return trimmed.substring(0, 30).charAt(0).toUpperCase() + trimmed.substring(1, 30);
}
