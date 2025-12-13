import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { addToQueue } from '@/lib/store';
import { detectRequestType, getSystemPrompt, cleanJson, generateContent } from '@/lib/ai';
import { MODEL_CONFIGS } from '@/lib/models';
import { getUserCoins, deductCoins, calculateCoinCost } from '@/lib/firebase';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, model = 'grok-code', systemPrompt, userId } = await req.json();
    console.log('Generate request:', { prompt: prompt?.substring(0, 100), model, userId });

    if (!prompt) {
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "No userId provided" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check user's coin balance before generating
    const userCoins = await getUserCoins(userId);
    console.log('User coin balance:', userCoins);

    // Validate model
    const config = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unsupported model: ${model}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Detect request type for appropriate system prompt
    const requestType = detectRequestType(prompt);
    console.log('Detected request type:', requestType);

    // Get API key based on provider
    let apiKey: string | undefined;
    if (config.provider === 'openrouter') {
      apiKey = process.env.OPENROUTER_API_KEY;
      // Try reading from file if not in env
      if (!apiKey) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const keysPath = path.join(process.cwd(), 'api-keys.json');
          if (fs.existsSync(keysPath)) {
            const fileKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
            apiKey = fileKeys.OPENROUTER_API_KEY;
          }
        } catch (e) {
          console.error('Error reading API key from file:', e);
        }
      }
    } else if (config.provider === 'opencode') {
      apiKey = process.env.OPENCODE_API_KEY;
      if (!apiKey) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const keysPath = path.join(process.cwd(), 'api-keys.json');
          if (fs.existsSync(keysPath)) {
            const fileKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
            apiKey = fileKeys.OPENCODE_API_KEY;
          }
        } catch (e) {
          console.error('Error reading API key from file:', e);
        }
      }
    } else if (config.provider === 'zhipuai') {
      apiKey = process.env.ZHIPUAI_API_KEY || process.env.ZAI_API_KEY;
      if (!apiKey) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          // Try both cwd and cwd/web paths for the api-keys.json
          let keysPath = path.join(process.cwd(), 'api-keys.json');
          if (!fs.existsSync(keysPath)) {
            keysPath = path.join(process.cwd(), 'web', 'api-keys.json');
          }
          if (fs.existsSync(keysPath)) {
            const fileKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
            apiKey = fileKeys.ZHIPUAI_API_KEY || fileKeys.ZAI_API_KEY;
          }
        } catch (e) {
          console.error('Error reading Z.AI API key from file:', e);
        }
      }
    }

    if (!apiKey) {
      console.error(`API key not found for provider: ${config.provider}`);
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API')));
      return new Response(JSON.stringify({
        error: `API key not found for provider: ${config.provider}. Please check your api-keys.json file.`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Using API key for ${config.provider}:`, apiKey.substring(0, 10) + '...');

    // Create provider based on config
    let openai;
    if (config.provider === 'openrouter') {
      openai = createOpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
    } else if (config.provider === 'zhipuai') {
      openai = createOpenAI({
        apiKey,
        baseURL: 'https://api.z.ai/api/paas/v4',
      });
    } else {
      openai = createOpenAI({
        apiKey,
        baseURL: 'https://opencode.ai/zen/v1',
      });
    }

    // Get full system prompt
    const fullSystemPrompt = getSystemPrompt(requestType, systemPrompt);

    if (config.provider === 'opencode' || config.provider === 'zhipuai') {
      // Use non-streaming for opencode as it may not support OpenAI-compatible streaming
      console.log('Using non-streaming for opencode model:', config.modelId);
      try {
        const userContent = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations outside the JSON. Start with { and end with }.`;
        const result = await generateContent(userContent, model, systemPrompt);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonContent = result.content as any;

        // Validate the structure
        if (!jsonContent.assets || !Array.isArray(jsonContent.assets)) {
          console.warn('JSON missing assets array, adding empty array');
          jsonContent.assets = [];
        }
        if (!jsonContent.message) {
          console.warn('JSON missing message, using default');
          jsonContent.message = 'AI response completed';
        }

        // Calculate coin cost and deduct
        const coinCost = calculateCoinCost(result.tokensUsed);
        const deducted = await deductCoins(userId, coinCost);

        if (!deducted) {
          return new Response(JSON.stringify({
            error: `Insufficient coins. Required: ${coinCost}, Available: ${userCoins}`
          }), {
            status: 402, // Payment Required
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log(`Deducted ${coinCost} coins from user ${userId} for ${result.tokensUsed} tokens`);

        // Add to queue for the plugin to pick up
        addToQueue(jsonContent, userId);
        console.log('Added to queue for user:', userId);

        // Get updated balance
        const remainingCoins = await getUserCoins(userId);

        // Return the result as JSON with token usage info
        const responseData = {
          ...jsonContent,
          tokensUsed: result.tokensUsed,
          tokensPerSecond: result.tokensPerSecond,
          duration: result.duration,
          requestType: result.requestType,
          model: config.modelId,
          coinCost,
          remainingCoins
        };

        return new Response(JSON.stringify(responseData), {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Type': requestType,
            'X-Model-Id': config.modelId,
            'X-Tokens-Used': result.tokensUsed.toString(),
            'X-Coin-Cost': coinCost.toString(),
          },
        });
      } catch (error) {
        console.error('Non-streaming error:', error);
        const fallbackResponse = {
          reasoning: 'Failed to generate AI response',
          message: 'Error: Failed to generate content. Please try again.',
          assets: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        addToQueue(fallbackResponse, userId);
        return new Response(JSON.stringify(fallbackResponse), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Use streaming for other providers
      console.log('Streaming with model:', config.modelId);

      try {
        console.log('Starting stream with model:', config.modelId, 'provider:', config.provider);
        const result = await streamText({
          model: openai(config.modelId),
          system: fullSystemPrompt,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations outside the JSON. Start with { and end with }.`
            }
          ],
          temperature: 0.7,
          onFinish: async ({ text, usage }) => {
            // Parse and queue the result for the plugin
            console.log('Stream finished. Raw AI response length:', text.length);
            console.log('Raw AI response (first 500 chars):', text.substring(0, 500));
            console.log('Token usage:', usage);

            if (!text || !text.trim()) {
              console.error('AI returned empty response!');
              const errorResponse = {
                reasoning: 'AI returned empty response',
                message: 'Error: The AI returned an empty response. Please try again.',
                assets: [],
                error: 'Empty response from AI'
              };
              addToQueue(errorResponse, userId);
              return;
            }

            try {
              const cleanedContent = cleanJson(text);
              console.log('Cleaned JSON (first 500 chars):', cleanedContent.substring(0, 500));

              const jsonContent = JSON.parse(cleanedContent);
              console.log('Successfully parsed JSON');

              // Validate the structure
              if (!jsonContent.assets || !Array.isArray(jsonContent.assets)) {
                console.warn('JSON missing assets array, adding empty array');
                jsonContent.assets = [];
              }
              if (!jsonContent.message) {
                console.warn('JSON missing message, using default');
                jsonContent.message = 'AI response completed';
              }

              // Add token usage info
              jsonContent.tokensUsed = usage?.totalTokens || 0;
              jsonContent.model = config.modelId;
              jsonContent.requestType = requestType;

              // Calculate coin cost and deduct
              const coinCost = calculateCoinCost(jsonContent.tokensUsed);
              const deducted = await deductCoins(userId, coinCost);

              if (deducted) {
                const remainingCoins = await getUserCoins(userId);
                jsonContent.coinCost = coinCost;
                jsonContent.remainingCoins = remainingCoins;
                console.log(`Deducted ${coinCost} coins from user ${userId} for ${jsonContent.tokensUsed} tokens`);
              } else {
                console.warn(`Failed to deduct ${coinCost} coins from user ${userId} - insufficient balance`);
                jsonContent.coinError = 'Insufficient coins for this request';
              }

              // Add to queue for the plugin to pick up
              addToQueue(jsonContent, userId);
              console.log('Added to queue for user:', userId);
            } catch (e) {
              console.error('Error processing final content:', e);
              console.error('Failed text (first 1000 chars):', text.substring(0, 1000));

              // Create a fallback response
              const fallbackResponse = {
                reasoning: 'Failed to parse AI response',
                message: 'Error: The AI did not return valid JSON. Please try again.',
                assets: [],
                error: e instanceof Error ? e.message : 'Unknown error',
                rawResponse: text.substring(0, 500)
              };
              addToQueue(fallbackResponse, userId);
            }
          },
        });

        // Return the stream with metadata
        return result.toTextStreamResponse({
          headers: {
            'X-Request-Type': requestType,
            'X-Model-Id': config.modelId,
          },
        });
      } catch (streamError) {
        console.error('Stream error:', streamError);
        return new Response(JSON.stringify({
          error: 'Failed to initialize AI stream. Please check your API key and model configuration.',
          details: streamError instanceof Error ? streamError.message : 'Unknown stream error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

  } catch (e: unknown) {
    console.error('Generate error (detailed):', e);
    if (e instanceof Error) {
      console.error('Error stack:', e.stack);
    }

    const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' && e instanceof Error ? e.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
