import { NextResponse } from 'next/server';
import { getProjectState } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "No userId provided" }, { status: 400 });
  }

  const tree = getProjectState(userId);
  return NextResponse.json({ tree });
}
