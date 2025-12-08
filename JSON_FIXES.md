# JSON Parsing Fixes

## Problem
The AI models were returning responses that weren't valid JSON, causing the error:
```
AI response was not valid JSON
```

## Root Causes Identified

1. **Models not following strict JSON format** - Some models would wrap JSON in markdown code blocks or add explanatory text
2. **Missing JSON validation** - No verification that the response was actually valid JSON
3. **Weak error messages** - Hard to debug what went wrong
4. **No fallback handling** - Application would crash instead of gracefully handling bad responses

## Fixes Applied

### 1. Enhanced System Prompts (lib/ai.ts)

**Added to ALL prompts (Scripting, VFX, Animation, Modeling):**
- ⚠️ Warning emoji to draw attention
- Explicit "MUST respond with ONLY valid JSON"
- "No other text. No markdown. Just pure JSON"
- Examples of correct JSON format
- Detailed formatting rules

**Example:**
```
⚠️ CRITICAL: You MUST respond with ONLY valid JSON. No other text. No markdown. Just pure JSON starting with { and ending with }.

CRITICAL FORMATTING RULES:
1. Your ENTIRE response must be valid JSON
2. Do NOT use markdown code blocks (no ```json or ```)
3. Do NOT include any text before or after the JSON
4. The JSON must start with { and end with }
5. All property values must be properly quoted strings
```

### 2. Improved JSON Cleaning Function (lib/ai.ts)

**Enhanced `cleanJson()` function:**
- Removes markdown code blocks (```json, ```)
- Removes common prefixes ("Here's the JSON:", "JSON:", "Response:")
- Extracts JSON using regex matching `{...}`
- Removes trailing commas
- Validates JSON and attempts to fix common issues
- Returns best attempt even if parsing fails

**Before:**
```typescript
export function cleanJson(text: string): string {
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
}
```

**After:**
- Removes more patterns
- Tests if JSON is valid
- Attempts multiple fixing strategies
- Uses regex to extract JSON object
- Better error recovery

### 3. Enhanced User Prompt (app/api/generate/route.ts)

**Added to every user message:**
```typescript
messages: [
  { 
    role: 'user', 
    content: `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations outside the JSON. Start with { and end with }.`
  }
]
```

This reinforces the JSON requirement on EVERY request.

### 4. Better Error Handling (app/api/generate/route.ts)

**Added comprehensive logging:**
```typescript
onFinish: async ({ text }) => {
  console.log('Raw AI response (first 500 chars):', text.substring(0, 500));
  try {
    const cleanedContent = cleanJson(text);
    console.log('Cleaned JSON (first 500 chars):', cleanedContent.substring(0, 500));
    
    const jsonContent = JSON.parse(cleanedContent);
    console.log('Successfully parsed JSON');
    
    // Validate structure
    if (!jsonContent.assets || !Array.isArray(jsonContent.assets)) {
      jsonContent.assets = [];
    }
    if (!jsonContent.message) {
      jsonContent.message = 'AI response completed';
    }
    
    addToQueue(jsonContent, userId);
  } catch (e) {
    console.error('Error processing final content:', e);
    console.error('Failed text:', text.substring(0, 1000));
    
    // Fallback response
    const fallbackResponse = {
      reasoning: 'Failed to parse AI response',
      message: 'Error: The AI did not return valid JSON. Please try again.',
      assets: [],
      error: e.message,
      rawResponse: text.substring(0, 500)
    };
    addToQueue(fallbackResponse, userId);
  }
}
```

**Benefits:**
- See the exact raw response from AI
- See the cleaned version
- Know exactly where parsing failed
- Fallback response instead of crash
- User gets helpful error message

### 5. Frontend Error Details (app/page.tsx)

**Enhanced error messages:**
```typescript
catch (e) {
  console.error('Failed to parse final JSON:', e);
  console.error('Raw response:', fullText.substring(0, 500));
  console.error('Cleaned response:', cleanJson(fullText).substring(0, 500));
  
  const errorDetails = fullText.length > 200 
    ? `Response preview: ${fullText.substring(0, 200)}...` 
    : `Full response: ${fullText}`;
  
  throw new Error(`AI response was not valid JSON. ${errorDetails}\n\nError: ${e.message}`);
}
```

**Now users see:**
- What the AI actually returned
- How it was cleaned
- Specific parsing error
- Helpful preview of the response

## Testing the Fixes

### 1. Check Server Logs
After making a request, check the Node.js console for:
```
Raw AI response (first 500 chars): ...
Cleaned JSON (first 500 chars): ...
Successfully parsed JSON
Added to queue for user: 1572962
```

### 2. Test with Different Prompts
Try various requests to see if JSON parsing works:
- "Build a low-poly pet model"
- "Create a fire particle effect"
- "Script a jumping mechanic"

### 3. Check Browser Console
If there's still an error, the browser console will show:
- Raw response
- Cleaned response  
- Exact parsing error
- Response preview

## What to Do If It Still Fails

### Option 1: Use a Different Model
Some models are better at following JSON format:
- Try `grok-code` (OpenCode) - Usually very good at JSON
- Try `qwen-qwen3-coder-free` (Qwen) - Designed for code generation
- Avoid general chat models

### Option 2: Enable JSON Mode (if supported)
Some providers support forcing JSON output. We could add:
```typescript
const result = await streamText({
  model: openai(config.modelId),
  experimental_providerOptions: {
    openai: {
      response_format: { type: "json_object" }
    }
  },
  // ...
});
```

### Option 3: Post-Process with Another AI
If the model keeps failing, we could:
1. Get the raw response
2. Send it to another AI to convert to proper JSON
3. Use that JSON

### Option 4: Regex-Based Fallback
Create a regex-based parser that extracts:
- Reasoning from text
- Asset descriptions from text
- Convert to JSON programmatically

## Summary

The fixes make the system much more robust by:
1. ✅ Explicitly telling AI to output JSON (multiple times)
2. ✅ Better cleaning/extraction of JSON from responses
3. ✅ Comprehensive error logging for debugging
4. ✅ Graceful fallback instead of crashes
5. ✅ Helpful error messages for users
6. ✅ Validation and auto-fixing of JSON structure

The AI should now reliably return valid JSON, and if it doesn't, you'll know exactly why and see the actual response for debugging.
