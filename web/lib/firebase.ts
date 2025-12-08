import admin from 'firebase-admin';

// Initialize Firebase Admin
let app: admin.app.App;

try {
  app = admin.app();
} catch {
  app = admin.initializeApp({
    databaseURL: 'https://tissueai-coins-default-rtdb.firebaseio.com/',
  });
}

const db = admin.database();

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
    const snapshot = await db.ref(`users/${userId}`).once('value');
    const data = snapshot.val();
    
    if (!data) {
      // Initialize new user with 0 coins
      await db.ref(`users/${userId}`).set({
        userId,
        coins: 0,
        lastUpdated: Date.now()
      });
      return 0;
    }
    
    return data.coins || 0;
  } catch (error) {
    console.error('Error fetching user coins:', error);
    throw new Error('Failed to fetch coin balance');
  }
}

/**
 * Update user's coin balance
 */
export async function updateUserCoins(userId: string, coins: number): Promise<void> {
  try {
    await db.ref(`users/${userId}`).update({
      coins,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating user coins:', error);
    throw new Error('Failed to update coin balance');
  }
}

/**
 * Add coins to user's balance
 */
export async function addCoins(userId: string, amount: number): Promise<number> {
  try {
    const currentCoins = await getUserCoins(userId);
    const newBalance = currentCoins + amount;
    await updateUserCoins(userId, newBalance);
    return newBalance;
  } catch (error) {
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
    const currentCoins = await getUserCoins(userId);
    
    if (currentCoins < amount) {
      return false; // Insufficient coins
    }
    
    const newBalance = currentCoins - amount;
    await updateUserCoins(userId, newBalance);
    return true;
  } catch (error) {
    console.error('Error deducting coins:', error);
    throw new Error('Failed to deduct coins');
  }
}

/**
 * Calculate coin cost based on token usage
 * Default rate: 1 coin per 1000 tokens
 */
export function calculateCoinCost(tokens: number, rate: number = 0.001): number {
  return Math.ceil(tokens * rate);
}
