import { NextResponse } from 'next/server';
import { addToQueue } from '@/lib/store';
import { MODEL_CONFIGS, generateContent } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { prompt, model = 'x-ai-grok-4.1-fast-free', systemPrompt, userId } = await req.json();
    console.log('Generate request:', { prompt: prompt.substring(0, 100), model, userId });

    if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "No userId provided" }, { status: 400 });

    // Validate model
    if (!MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS]) {
      return NextResponse.json({ error: `Unsupported model: ${model}` }, { status: 400 });
    }

    console.log('Starting AI generation...');
    // Generate actual content
    const result = await generateContent(prompt, model, systemPrompt);
    console.log('AI generation completed');

    // Add to queue for the plugin to pick up
    addToQueue(result.content, userId);

    return NextResponse.json({
      ...result.content,
      model: result.model,
      tokensUsed: result.tokensUsed,
      tokensPerSecond: result.tokensPerSecond,
      duration: result.duration,
      requestType: result.requestType
    });
  } catch (e: unknown) {
    console.error('Generate error:', e);
    const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
