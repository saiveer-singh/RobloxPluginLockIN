import { NextResponse } from 'next/server';
import { addToQueue } from '@/lib/store';
import { MODEL_CONFIGS, generateContentStream, cleanJson } from '@/lib/ai';

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

    console.log('Starting AI generation stream...');
    const { stream: openAiStream, requestType, modelId } = await generateContentStream(prompt, model, systemPrompt);

    // Accumulate full content for the plugin queue
    let fullContent = '';
    let buffer = '';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // Append new chunk to buffer
        buffer += decoder.decode(chunk, { stream: true });
        
        const lines = buffer.split('\n');
        
        // Process all complete lines (all except the last one)
        // The last item in lines is either an empty string (if buffer ended in \n)
        // or the partial start of the next line.
        buffer = lines.pop() || ''; 
        
        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          if (!line.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(encoder.encode(content));
            }
          } catch (e) {
            console.warn('Error parsing stream chunk:', e);
          }
        }
      },
      async flush(controller) {
        // Process any remaining buffer
        if (buffer.trim() && buffer.startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
           try {
            const json = JSON.parse(buffer.slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(encoder.encode(content));
            }
          } catch (e) {
            console.warn('Error parsing final stream chunk:', e);
          }
        }

        console.log('Stream complete. Processing full content...');
        try {
          const cleanedContent = cleanJson(fullContent);
          const jsonContent = JSON.parse(cleanedContent);
          
          // Add to queue for the plugin to pick up
          addToQueue(jsonContent, userId);
          
        } catch (e) {
          console.error('Error processing final content:', e);
        }
      }
    });

    // Pipe the OpenAI stream through our transformer
    const readable = openAiStream.pipeThrough(transformStream);

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Request-Type': requestType,
        'X-Model-Id': modelId,
      },
    });

  } catch (e: unknown) {
    console.error('Generate error:', e);
    const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
