import { NextResponse } from 'next/server';
import { addToQueue } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { prompt, model = 'openai-gpt-4o', systemPrompt, userId } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "No userId provided" }, { status: 400 });

    // Dummy response for testing
    const dummyContent = {
      message: `Generated content for: ${prompt}`,
      assets: [
        {
          ClassName: "Part",
          Properties: {
            Name: "GeneratedPart",
            Size: "4,1,4",
            Color: "0.5,0.5,1"
          }
        }
      ],
      reasoning: "This is a dummy response for testing purposes."
    };

    // Add to queue for the plugin to pick up
    addToQueue(dummyContent, userId);

    return NextResponse.json({
      ...dummyContent,
      model: model,
      tokensUsed: 100,
      tokensPerSecond: 10,
      duration: 1.0,
      requestType: "modeling"
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
  }
}
