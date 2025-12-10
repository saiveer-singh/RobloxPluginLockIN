# RobloxGen AI Verification System

## Overview

This verification system ensures that only authenticated Roblox users can access the AI generation features, preventing unauthorized access and coin theft.

## How It Works

### 1. VerificationHandler (Roblox Plugin)
- **Location**: `src/VerificationHandler.luau`
- **Purpose**: Generates unique 6-character verification codes every 15 seconds
- **Security Features**:
  - Different codes for each user
  - Codes expire after 15 seconds
  - Firebase integration for secure storage
  - Automatic cleanup of expired codes

### 2. Web Verification Modal
- **Location**: `web/components/VerificationModal.tsx`
- **Purpose**: Allows users to enter verification codes from Roblox
- **Features**:
  - Real-time status polling
  - Auto-detection of verification completion
  - User-friendly interface with instructions

### 3. Verification API
- **Location**: `web/app/api/verify/route.ts`
- **Purpose**: Validates verification codes and manages verification status
- **Security**:
  - Case-insensitive code validation
  - Timestamp-based expiration
  - Firebase authentication with database secret

### 4. Plugin Integration
- **Location**: `src/MainModule.server.luau`
- **Purpose**: Enforces verification before allowing AI features
- **Features**:
  - Blocks access until verified
  - Real-time verification status updates
  - Secure token management

## Firebase Structure

```
/verification/
  /{userId}/
    code: "ABC123"
    userId: "123456789"
    displayName: "PlayerName"
    timestamp: 1703123456
    expires: 1703123416
    verified: true
    verifiedAt: 1703123420
```

## Verification Flow

1. **User joins Roblox game** with plugin installed
2. **VerificationHandler** generates a 6-character code
3. **Code displayed** in Roblox chat: `Your verification code: ABC123 (expires in 15s)`
4. **User opens website** and clicks "Verify Account"
5. **User enters** their Roblox User ID and the verification code
6. **System validates** the code against Firebase
7. **If valid**: User is marked as verified and gains access
8. **If invalid**: User must wait for new code (generated every 15s)

## Security Features

### Anti-Bypass Measures
- **Unique codes per user**: No code sharing between accounts
- **Time-based expiration**: Codes useless after 15 seconds
- **Firebase authentication**: Secure database access with secret key
- **One-time verification**: Each code can only be used once
- **Automatic cleanup**: Expired codes automatically removed

### Rate Limiting
- **Code generation**: Every 15 seconds maximum
- **Verification attempts**: Limited by Firebase rules
- **API calls**: Proper error handling and timeouts

## Installation

### Roblox Plugin
1. Place `VerificationHandler.luau` in `StarterPlayerScripts`
2. Place `MainModule.server.luau` as plugin script
3. Ensure plugin has proper permissions

### Web Interface
1. Verification modal is already integrated
2. API routes handle verification logic
3. Firebase connection configured with database secret

## Usage

### For Users
1. **Join the Roblox game** with the plugin
2. **Wait for verification code** in chat (appears every 15 seconds)
3. **Open the website** and click verification button
4. **Enter your User ID** and the 6-character code
5. **Click "Verify Account"**
6. **Enjoy full access** to AI features

### For Developers
```lua
-- Check verification status
local verificationHandler = require(script.Parent.VerificationHandler)
if verificationHandler.IsVerified() then
    -- User is verified, allow access
    local userId = verificationHandler.GetUserId()
    print("Verified user:", userId)
else
    -- User not verified
    print("Please verify first")
end
```

```typescript
// Check verification status from web
const response = await fetch(`/api/verify?userId=${userId}`);
const data = await response.json();

if (data.verified) {
    // User is verified
    console.log("Verified as:", data.displayName);
} else {
    // User needs to verify
    console.log("Verification required");
}
```

## Troubleshooting

### Common Issues

**"Code not found"**
- Check you're using the latest code (codes expire in 15 seconds)
- Ensure correct User ID is entered
- Wait for next code generation

**"Code expired"**
- Wait for the next code (generated every 15 seconds)
- Enter the code quickly after it appears

**"No active code"**
- Join the Roblox game first to generate codes
- Wait 15 seconds for first code to appear

**"Already verified"**
- Verification is complete! You can now use all features
- If you need to re-verify, contact support

### Debug Information

**Roblox Side**:
```lua
-- Check VerificationHandler status
local verificationHandler = require(script.Parent.VerificationHandler)
print("IsVerified:", verificationHandler.IsVerified())
print("UserId:", verificationHandler.GetUserId())
print("CurrentCode:", verificationHandler.GetCurrentCode())
```

**Web Side**:
```typescript
// Check Firebase directly
const DATABASE_URL = 'https://tissueai-coins-default-rtdb.firebaseio.com';
const DATABASE_SECRET = 'JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg';

const response = await fetch(`${DATABASE_URL}/verification/${userId}.json?auth=${DATABASE_SECRET}`);
const data = await response.json();
console.log("Verification data:", data);
```

## API Reference

### VerificationHandler Luau

#### Methods
- `IsVerified()`: boolean - Returns if user is verified
- `GetUserId()`: string - Returns verified user ID
- `GetCurrentCode()`: string - Returns current verification code

#### Events
- `VerificationStatusChanged`: Fires when verification status changes

### Web API Endpoints

#### GET `/api/verify?userId={userId}`
Returns verification status for a user.

#### POST `/api/verify`
Submits verification code for validation.

**Request Body**:
```json
{
  "userId": "123456789",
  "code": "ABC123"
}
```

**Response**:
```json
{
  "success": true,
  "userId": "123456789",
  "displayName": "PlayerName",
  "verifiedAt": 1703123420
}
```

## Security Notes

- **Database secret** should be kept private
- **HTTPS** required for all communications
- **Input validation** on all user inputs
- **Rate limiting** implemented at Firebase level
- **No sensitive data** stored in client-side code

## Future Enhancements

- [ ] QR code generation for mobile verification
- [ ] Email verification option
- [ ] Multi-factor authentication
- [ ] Verification history tracking
- [ ] Admin dashboard for verification management

---

**This verification system ensures secure access to RobloxGen AI features while maintaining a user-friendly experience.**
