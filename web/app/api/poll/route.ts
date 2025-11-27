import { NextResponse } from 'next/server';
import { consumeQueue, updateStatus, getUserIdFromToken } from '@/lib/store';

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

  // Plugin calls this to check for new commands
  // We also take this opportunity to mark the plugin as connected
  updateStatus(true, userId);

  const commands = consumeQueue(userId);
  return NextResponse.json({ commands });
}

