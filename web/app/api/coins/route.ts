import { NextRequest } from 'next/server';
import { getUserCoins, addCoins } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coins?userId=xxx
 * Fetch user's coin balance
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const coins = await getUserCoins(userId);

    return new Response(JSON.stringify({ userId, coins }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching coins:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch coin balance' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/coins
 * Add coins to user's balance (called from Roblox after purchase)
 * Body: { userId: string, amount: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount } = body;

    if (!userId || typeof amount !== 'number') {
      return new Response(
        JSON.stringify({ error: 'userId and amount are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'amount must be positive' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const newBalance = await addCoins(userId, amount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId, 
        coinsAdded: amount, 
        newBalance 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error adding coins:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add coins' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
