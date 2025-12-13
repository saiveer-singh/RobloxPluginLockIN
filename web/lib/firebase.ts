// Firebase Realtime Database REST API implementation
import { COIN_RATIOS } from './models';
import type { ModelProvider } from './models';

// Use environment variables for secrets - NEVER hardcode!
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://tissueai-coins-default-rtdb.firebaseio.com';
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || '';


export interface UserCoins {
  userId: string;
  coins: number;
  lastUpdated: number;
}

/**
 * Get user's coin balance from Firebase
 */
export async function getUserCoins(userId: string): Promise<number> {
  try {
    console.log('=== FIREBASE GET REQUEST ===');
    console.log('UserId:', userId);
    console.log('URL:', `${DATABASE_URL}/users/${userId}.json?auth=${DATABASE_SECRET}`);

    const response = await fetch(`${DATABASE_URL}/users/${userId}.json?auth=${DATABASE_SECRET}`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (!data) {
      console.log('No data found, initializing new user with 0 coins');
      // Initialize new user with 0 coins
      const initResponse = await fetch(`${DATABASE_URL}/users/${userId}.json?auth=${DATABASE_SECRET}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          coins: 0,
          lastUpdated: Date.now()
        })
      });
      console.log('Init response status:', initResponse.status);
      console.log('Init response ok:', initResponse.ok);
      return 0;
    }

    const coins = data.coins || 0;
    console.log('User coins found:', coins);
    return coins;
  } catch (error) {
    console.error('=== FIREBASE GET ERROR ===');
    console.error('Error fetching user coins:', error);
    console.error('Make sure Firebase URL is correct and auth token is valid');
    throw new Error('Failed to fetch coin balance');
  }
}

/**
 * Update user's coin balance
 */
export async function updateUserCoins(userId: string, coins: number): Promise<void> {
  try {
    console.log('=== FIREBASE UPDATE REQUEST ===');
    console.log('UserId:', userId);
    console.log('Coins:', coins);
    console.log('URL:', `${DATABASE_URL}/users/${userId}.json?auth=${DATABASE_SECRET}`);

    const response = await fetch(`${DATABASE_URL}/users/${userId}.json?auth=${DATABASE_SECRET}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        coins,
        lastUpdated: Date.now()
      })
    });

    console.log('Update response status:', response.status);
    console.log('Update response ok:', response.ok);

    const responseText = await response.text();
    console.log('Update response text:', responseText);

    if (!response.ok) {
      console.error('=== FIREBASE UPDATE ERROR ===');
      console.error(`Firebase update failed: ${response.status} ${response.statusText} - ${responseText}`);
      if (response.status === 401) {
        console.error('ERROR: Invalid Firebase auth token!');
      } else if (response.status === 404) {
        console.error('ERROR: Firebase database URL not found!');
      } else if (response.status >= 500) {
        console.error('ERROR: Firebase server error!');
      }
      throw new Error(`Firebase update failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    console.log('=== FIREBASE UPDATE SUCCESS ===');
  } catch (error) {
    console.error('=== FIREBASE UPDATE ERROR ===');
    console.error('Error updating user coins:', error);
    console.error('Make sure Firebase URL is correct and auth token is valid');
    throw new Error('Failed to update coin balance');
  }
}

/**
 * Add coins to user's balance
 */
export async function addCoins(userId: string, amount: number): Promise<number> {
  try {
    console.log('=== ADDING COINS ===');
    console.log('UserId:', userId);
    console.log('Amount:', amount);

    const currentCoins = await getUserCoins(userId);
    const newBalance = currentCoins + amount;
    console.log('Current coins:', currentCoins);
    console.log('New balance:', newBalance);

    await updateUserCoins(userId, newBalance);
    return newBalance;
  } catch (error) {
    console.error('=== ADD COINS ERROR ===');
    console.error('Error adding coins:', error);
    throw new Error('Failed to add coins');
  }
}

/**
 * Deduct coins from user's balance
 * Returns false if insufficient coins, true if successful
 */
export async function deductCoins(userId: string, amount: number): Promise<boolean> {
  try {
    console.log('=== DEDUCTING COINS ===');
    console.log('UserId:', userId);
    console.log('Amount:', amount);

    const currentCoins = await getUserCoins(userId);
    console.log('Current coins:', currentCoins);

    if (currentCoins < amount) {
      console.log('Insufficient coins!');
      return false; // Insufficient coins
    }

    const newBalance = currentCoins - amount;
    console.log('New balance after deduction:', newBalance);
    await updateUserCoins(userId, newBalance);
    return true;
  } catch (error) {
    console.error('=== DEDUCT COINS ERROR ===');
    console.error('Error deducting coins:', error);
    throw new Error('Failed to deduct coins');
  }
}

/**
 * Calculate coin cost based on token usage and model
 * Uses model-specific coin ratios for more accurate pricing
 */
export function calculateCoinCost(tokens: number, model: ModelProvider = 'gpt-5-nano'): number {
  const ratio = COIN_RATIOS[model] || 1.0; // Default to 1 coin per 1k tokens
  const coinsNeeded = (tokens / 1000) * ratio;
  return Math.ceil(coinsNeeded);
}

/**
 * Get coin ratio for a specific model (tokens per coin)
 */
export function getTokensPerCoin(model: ModelProvider): number {
  const ratio = COIN_RATIOS[model] || 1.0;
  return Math.ceil(1000 / ratio); // Tokens per coin
}

/**
 * Get cost description for a model
 */
export function getCostDescription(model: ModelProvider): string {
  const ratio = COIN_RATIOS[model] || 1.0;
  const tokensPerCoin = Math.ceil(1000 / ratio);
  return `1 coin ≈ ${tokensPerCoin.toLocaleString()} tokens`;
}
