# Coin System Setup Guide

This guide explains how to set up and use the coin-based payment system for RobloxGen AI.

## Overview

The coin system allows users to purchase coins via Roblox Developer Products and spend them on AI-generated content. The system uses Firebase Realtime Database to sync coin balances between Roblox and the web application.

## Architecture

1. **Firebase Realtime Database**: Stores user coin balances
2. **Roblox Script**: Handles Developer Product purchases and syncs to Firebase
3. **Web API**: Deducts coins based on token usage
4. **Web UI**: Displays coin balance and costs

## Setup Instructions

### 1. Firebase Setup

The system is already configured to use your Firebase Realtime Database:
- **Database URL**: `https://tissueai-coins-default-rtdb.firebaseio.com/`
- **Rules**: Already configured in your database

Database structure:
```json
{
  "users": {
    "userId123": {
      "userId": "userId123",
      "coins": 1000,
      "lastUpdated": 1234567890
    }
  }
}
```

### 2. Roblox Setup

1. **Create Developer Products** in your Roblox game:
   - Go to Create → Your Game → Monetization → Developer Products
   - Create products for different coin amounts (e.g., 100, 500, 1000, 2500, 10000 coins)
   - Note down the Product IDs

2. **Update the Lua Script** (`web/buyingcoins.lua`):
   ```lua
   local COIN_PRODUCTS = {
       [YOUR_PRODUCT_ID_1] = 100,   -- 100 Coins
       [YOUR_PRODUCT_ID_2] = 500,   -- 500 Coins
       [YOUR_PRODUCT_ID_3] = 1000,  -- 1000 Coins
       [YOUR_PRODUCT_ID_4] = 2500,  -- 2500 Coins
       [YOUR_PRODUCT_ID_5] = 10000  -- 10000 Coins
   }
   ```

3. **Enable HTTP Requests**:
   - In Roblox Studio, go to Game Settings → Security
   - Enable "Allow HTTP Requests"

4. **Place the Script**:
   - Add `buyingcoins.lua` to `ServerScriptService` in your Roblox game
   - The script will automatically initialize when the game starts

### 3. Web Application Setup

The web application is already configured with:

1. **Firebase Admin SDK**: Installed and configured
2. **API Endpoints**:
   - `GET /api/coins?userId=xxx` - Fetch user's coin balance
   - `POST /api/coins` - Add coins (called from Roblox)
   - `POST /api/generate` - Deducts coins automatically

3. **Coin Cost Calculation**:
   - Default rate: **1 coin per 1000 tokens**
   - Example: A generation using 2500 tokens costs 3 coins

## Usage

### For Users

1. **Buy Coins in Roblox**:
   - Join your Roblox game
   - Purchase a Developer Product
   - Coins are automatically added to your account

2. **Use Coins on Website**:
   - Log in to the RobloxGen AI website
   - Your coin balance is displayed in the sidebar
   - Coins are automatically deducted when you generate content
   - Cost is shown after each generation

### For Developers

#### Adjust Coin Cost Rate

Edit `web/lib/firebase.ts`:
```typescript
// Default: 1 coin per 1000 tokens
export function calculateCoinCost(tokens: number, rate: number = 0.001): number {
  return Math.ceil(tokens * rate);
}

// Example: 1 coin per 500 tokens (more expensive)
export function calculateCoinCost(tokens: number, rate: number = 0.002): number {
  return Math.ceil(tokens * rate);
}
```

#### Add Coins Manually (for testing)

Use the coins API endpoint:
```bash
curl -X POST https://your-website.com/api/coins \
  -H "Content-Type: application/json" \
  -d '{"userId": "123456", "amount": 1000}'
```

#### Check User Balance

```bash
curl https://your-website.com/api/coins?userId=123456
```

## Coin System Features

### ✅ Implemented Features

- [x] Firebase Realtime Database integration
- [x] Roblox Developer Product purchase handling
- [x] Automatic coin deduction on content generation
- [x] Real-time balance updates in UI
- [x] Coin cost display per message
- [x] Insufficient coins error handling
- [x] Manual balance refresh button
- [x] Cost estimation hint

### 🎯 Future Enhancements

- [ ] Coin purchase history
- [ ] Refund system for failed generations
- [ ] Premium subscriptions (monthly coins)
- [ ] Bonus coins for referrals
- [ ] Daily login rewards
- [ ] Volume discounts
- [ ] Gift coins to other users

## Troubleshooting

### Coins not updating from Roblox

1. Check if HTTP requests are enabled in Roblox
2. Verify Firebase database URL is correct
3. Check developer console for errors
4. Ensure Developer Product IDs match

### Coins not deducting on website

1. Check browser console for errors
2. Verify userId is being sent with requests
3. Check Firebase connection in server logs
4. Ensure firebase-admin is installed

### Database connection errors

1. Verify Firebase database URL
2. Check database rules allow read/write
3. Ensure firebase-admin is properly initialized

## Security Notes

⚠️ **Important**: The current setup uses Firebase without authentication for simplicity. For production:

1. Add Firebase Authentication
2. Implement server-side validation for purchases
3. Add rate limiting to prevent abuse
4. Use Firebase security rules to restrict access
5. Verify purchases with Roblox API webhooks

## API Reference

### `getUserCoins(userId: string): Promise<number>`
Fetches user's current coin balance from Firebase.

### `addCoins(userId: string, amount: number): Promise<number>`
Adds coins to user's balance and returns new balance.

### `deductCoins(userId: string, amount: number): Promise<boolean>`
Deducts coins from user's balance. Returns false if insufficient coins.

### `calculateCoinCost(tokens: number, rate?: number): number`
Calculates coin cost based on token usage.

## Support

For issues or questions:
1. Check the Firebase database rules
2. Verify Developer Product IDs
3. Check browser/server console for errors
4. Review the coin system logs in Roblox Output

---

**Last Updated**: December 2024
**Version**: 1.0.0
