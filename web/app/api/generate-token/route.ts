import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/store';

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const token = generateToken(userId);
  return NextResponse.json({ token });
}