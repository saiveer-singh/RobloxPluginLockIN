import { NextResponse } from 'next/server';
import { updateProjectState, getUserIdFromToken } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { token, tree } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!tree) {
      return NextResponse.json({ error: "No tree data provided" }, { status: 400 });
    }

    // Update the server-side state
    updateProjectState(userId, tree);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Sync error:', e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
