import { NextResponse } from 'next/server';
import { addToQueue } from '@/lib/store';
import { MODEL_CONFIGS, detectRequestType, generateContent, ModelProvider } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { prompt, model = 'x-ai-grok-4.1-fast-free', userId } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "No userId provided" }, { status: 400 });

    // Validate model
    if (!MODEL_CONFIGS[model as ModelProvider]) {
       console.warn(`Model ${model} not found in MODEL_CONFIGS, defaulting to x-ai-grok-4.1-fast-free`);
       // You might want to actually set model to the default here if it's invalid
    }
    const safeModel = MODEL_CONFIGS[model as ModelProvider] ? model : 'x-ai-grok-4.1-fast-free';

    // Call the actual AI generation
    const result = await generateContent(prompt, safeModel as ModelProvider);

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
  } catch (e: any) {
    console.error("Generation error:", e);
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
  }
}
