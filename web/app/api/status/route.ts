import { NextResponse } from 'next/server';
import { getStatus, updateStatus, getUserIdFromToken } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  return NextResponse.json(getStatus(userId));
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  // Plugin sends heartbeat
  updateStatus(true, userId);
  return NextResponse.json({ ok: true });
}

