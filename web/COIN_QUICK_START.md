# Coin System - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### Step 1: Create Developer Products in Roblox
1. Go to [Roblox Create](https://create.roblox.com/)
2. Select your game → **Monetization** → **Developer Products**
3. Create products:
   - 100 Coins - Price: $0.99 (or your choice)
   - 500 Coins - Price: $4.99
   - 1000 Coins - Price: $9.99
   - 2500 Coins - Price: $19.99
   - 10000 Coins - Price: $49.99
4. **Copy the Product IDs** (you'll need these next)

### Step 2: Configure the Roblox Script
1. Open `web/buyingcoins.lua`
2. Replace the Product IDs on lines 16-22:
```lua
local COIN_PRODUCTS = {
    [YOUR_PRODUCT_ID_1] = 100,   -- Replace with actual ID
    [YOUR_PRODUCT_ID_2] = 500,
    [YOUR_PRODUCT_ID_3] = 1000,
    [YOUR_PRODUCT_ID_4] = 2500,
    [YOUR_PRODUCT_ID_5] = 10000
}
```

### Step 3: Enable HTTP in Roblox
1. Open Roblox Studio
2. Go to **Home** → **Game Settings** (or press Alt+S)
3. **Security** tab
4. Enable **"Allow HTTP Requests"**
5. Click **Save**

### Step 4: Add Script to Game
1. In Roblox Studio, open **ServerScriptService**
2. Right-click → **Insert Object** → **Script**
3. Copy the entire content of `web/buyingcoins.lua`
4. Paste into the new script
5. Name it "CoinPurchaseSystem"

### Step 5: Test It!
1. Publish your game
2. Join the game in Roblox
3. (Optional) Create a test UI button to trigger purchases:
```lua
-- Example test button in a LocalScript
local button = script.Parent -- Your button
button.Activated:Connect(function()
    game:GetService("MarketplaceService"):PromptProductPurchase(
        game.Players.LocalPlayer,
        YOUR_PRODUCT_ID_1  -- Test with 100 coins product
    )
end)
```
4. Buy a product and check Firebase database

## 🔍 How to Verify It's Working

### In Roblox:
1. Join your game
2. Purchase a developer product
3. Check the **Output** window - should see: "Player purchased X coins. New balance: Y"

### In Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your database: `https://tissueai-coins-default-rtdb.firebaseio.com/`
3. Look for `users/YOUR_ROBLOX_ID/coins`

### On Website:
1. Log in to your website
2. Check the sidebar - coin balance should appear
3. Try generating content - coins should deduct

## 💰 Coin Costs

Default rate: **1 coin = 1000 tokens**

Typical costs:
- Simple script: 1-3 coins
- Complex system: 3-7 coins
- VFX effect: 2-4 coins
- Model: 1-3 coins

## 🛠️ Customization

### Change Coin Cost Rate
Edit `web/lib/firebase.ts`:
```typescript
// Make it cheaper: 1 coin = 2000 tokens
export function calculateCoinCost(tokens: number, rate: number = 0.0005)

// Make it more expensive: 1 coin = 500 tokens  
export function calculateCoinCost(tokens: number, rate: number = 0.002)
```

### Add More Product Tiers
Edit `web/buyingcoins.lua`:
```lua
local COIN_PRODUCTS = {
    [ID1] = 100,
    [ID2] = 500,
    [ID3] = 1000,
    [ID4] = 2500,
    [ID5] = 5000,   -- New tier
    [ID6] = 10000,
    [ID7] = 25000,  -- New tier
}
```

## 🚨 Troubleshooting

### "Coins not updating from Roblox"
- ✅ Check HTTP requests are enabled
- ✅ Verify Product IDs match
- ✅ Check Roblox Output for errors
- ✅ Verify Firebase URL is correct

### "Coins not deducting on website"
- ✅ Open browser console (F12)
- ✅ Check for errors
- ✅ Verify you're logged in
- ✅ Confirm Firebase connection

### "Insufficient coins error"
- ✅ This is normal - you need more coins!
- ✅ Purchase coins in Roblox
- ✅ Or manually add for testing (see below)

## 🧪 Testing - Add Free Coins

For testing, you can manually add coins via API:

```bash
# Using curl (replace with your details)
curl -X POST http://localhost:3000/api/coins \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_ROBLOX_ID", "amount": 1000}'

# Or in browser console (on your website)
fetch('/api/coins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'YOUR_ROBLOX_ID', 
    amount: 1000 
  })
}).then(r => r.json()).then(console.log)
```

## 📊 Monitor Usage

### Firebase Console
View real-time updates:
1. Go to Firebase Console
2. Realtime Database
3. Watch `users/` node update live

### Website Analytics
The system tracks:
- Total tokens used (Settings panel)
- Coins spent per message (shown on each AI response)
- Current balance (sidebar)

## 🔐 Security Notes

⚠️ **Development Mode**: Current setup is for development/testing

**For Production**, implement:
- Firebase Authentication
- Server-side purchase verification
- Rate limiting
- Transaction logging
- Fraud detection

See `COIN_SYSTEM_SETUP.md` for production recommendations.

## 📞 Need Help?

1. Check `COIN_SYSTEM_SETUP.md` for detailed documentation
2. Review `CHANGES.md` for implementation details
3. Check Firebase and Roblox console for errors
4. Verify all setup steps completed

---

**Ready to go!** 🚀 Your coin system is now set up and ready for testing.
