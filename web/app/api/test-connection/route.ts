import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test OpenCode API
    const opencodeKey = process.env.OPENCODE_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    // Try to read from file
    let fileKeys = {};
    try {
      const fs = await import('fs');
      const path = await import('path');
      const keysPath = path.join(process.cwd(), 'api-keys.json');
      if (fs.existsSync(keysPath)) {
        const file = fs.readFileSync(keysPath, 'utf8');
        fileKeys = JSON.parse(file);
      }
    } catch (e) {
      console.error('Error reading api-keys.json:', e);
    }

    let result: any = {
      opencodeKeyFromEnv: opencodeKey ? 'Present' : 'Missing',
      openrouterKeyFromEnv: openrouterKey ? 'Present' : 'Missing',
      opencodeKeyFromFile: (fileKeys as any).OPENCODE_API_KEY ? 'Present' : 'Missing',
      openrouterKeyFromFile: (fileKeys as any).OPENROUTER_API_KEY ? 'Present' : 'Missing',
      workingDirectory: process.cwd(),
    };

    // Test a simple API call
    const testApiKey = opencodeKey || (fileKeys as any).OPENCODE_API_KEY;
    if (testApiKey) {
      try {
        const testResponse = await fetch('https://opencode.ai/zen/v1/models', {
          headers: {
            'Authorization': `Bearer ${testApiKey}`,
          },
        });
        result = {
          ...result,
          opencodeApiTest: testResponse.ok ? 'Success' : `Failed: ${testResponse.status}`,
        };
      } catch (e) {
        result = {
          ...result,
          opencodeApiTest: `Error: ${(e as Error).message}`,
        };
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error('Test connection error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
    }, { status: 500 });
  }
}
