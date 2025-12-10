import { NextResponse } from 'next/server';

const DATABASE_URL = 'https://tissueai-coins-default-rtdb.firebaseio.com';
const DATABASE_SECRET = 'JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg';

interface VerificationData {
  code: string;
  userId: string;
  displayName: string;
  timestamp: number;
  expires: number;
  verified?: boolean;
  verifiedAt?: number;
}

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ 
        error: 'userId and code are required' 
      }, { status: 400 });
    }

    console.log('=== VERIFICATION REQUEST ===');
    console.log('UserId:', userId);
    console.log('Code:', code);

    // Get verification data from Firebase (with no-cache headers and random buster)
    const randomBuster = Math.random().toString(36).substring(7);
    const verificationUrl = `${DATABASE_URL}/verification/${userId}.json?auth=${DATABASE_SECRET}&buster=${randomBuster}`;
    console.log('Fetching verification data from:', verificationUrl);

    const response = await fetch(verificationUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch verification data:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch verification data' 
      }, { status: 500 });
    }

    const verificationData: VerificationData = await response.json();
    console.log('Raw response JSON:', verificationData);

    if (!verificationData) {
      console.log('=== NO VERIFICATION DATA FOUND ===');
      console.log('UserId:', userId);
      console.log('Response was null/undefined');
      return NextResponse.json({
        error: 'No verification code found. Please generate a new code in Roblox.'
      }, { status: 404 });
    }

    if (!verificationData.code) {
      console.log('=== VERIFICATION DATA MISSING CODE ===');
      console.log('UserId:', userId);
      console.log('Full data received:', JSON.stringify(verificationData, null, 2));
      return NextResponse.json({
        error: 'No verification code found. Please generate a new code in Roblox first.'
      }, { status: 400 });
    }

    console.log('Verification data is valid');
    console.log('Stored code:', verificationData.code);
    console.log('Code length:', verificationData.code.length);
    console.log('Expires timestamp:', verificationData.expires);

    // Check if code matches
    console.log('Comparing codes...');
    console.log('Stored code:', verificationData.code);
    console.log('Input code:', code);
    console.log('Input code uppercased:', code.toUpperCase());
    console.log('Codes match:', verificationData.code === code.toUpperCase());

    if (verificationData.code !== code.toUpperCase()) {
      console.log('=== CODE MISMATCH DETECTED ===');
      console.log('Expected (stored):', `"${verificationData.code}"`);
      console.log('Received (upper):', `"${code.toUpperCase()}"`);
      console.log('Received (original):', `"${code}"`);
      return NextResponse.json({
        error: `Invalid verification code. Expected: ${verificationData.code}, Got: ${code.toUpperCase()}`
      }, { status: 400 });
    }

    // Check if code has expired - add generous buffer for time sync issues
    const now = Date.now() / 1000; // Convert to seconds like tick()
    const bufferTime = 300; // 5 minute buffer for time synchronization issues
    console.log('Checking expiration...');
    console.log('Current time (seconds):', now);
    console.log('Current time (readable):', new Date(now * 1000).toISOString());
    console.log('Code expires at:', verificationData.expires);
    console.log('Code expires at (readable):', new Date(verificationData.expires * 1000).toISOString());
    console.log('Buffer time:', bufferTime);
    console.log('Effective expiry:', verificationData.expires + bufferTime);
    console.log('Effective expiry (readable):', new Date((verificationData.expires + bufferTime) * 1000).toISOString());
    console.log('Time remaining:', (verificationData.expires + bufferTime) - now);

    if (now > (verificationData.expires + bufferTime)) {
      console.log('=== CODE EXPIRED ===');
      console.log('Code expired. Now:', now, 'Expires:', verificationData.expires, 'With buffer:', verificationData.expires + bufferTime);
      const timeAgo = now - verificationData.expires;
      return NextResponse.json({
        error: `Verification code has expired. Code expired ${Math.round(timeAgo)} seconds ago. Please generate a new code.`
      }, { status: 400 });
    }

    console.log('Code is still valid');

    // Mark as verified
    const updateUrl = `${DATABASE_URL}/verification/${userId}.json?auth=${DATABASE_SECRET}`;
    const updateData = {
      ...verificationData,
      verified: true,
      verifiedAt: now
    };

    console.log('Updating verification status:', updateData);

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      console.error('Failed to update verification status:', updateResponse.status, updateResponse.statusText);
      return NextResponse.json({ 
        error: 'Failed to complete verification' 
      }, { status: 500 });
    }

    console.log('=== VERIFICATION SUCCESS ===');
    console.log('UserId:', userId);
    console.log('DisplayName:', verificationData.displayName);

    return NextResponse.json({
      success: true,
      userId: verificationData.userId,
      displayName: verificationData.displayName,
      verifiedAt: now
    });

  } catch (error) {
    console.error('=== VERIFICATION ERROR ===');
    console.error('Error during verification:', error);
    return NextResponse.json({ 
      error: 'Internal server error during verification' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId parameter is required' 
      }, { status: 400 });
    }

    console.log('=== VERIFICATION STATUS CHECK ===');
    console.log('UserId:', userId);

    // Get verification data from Firebase
    const verificationUrl = `${DATABASE_URL}/verification/${userId}.json?auth=${DATABASE_SECRET}`;
    
    const response = await fetch(verificationUrl);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch verification status' 
      }, { status: 500 });
    }

    const verificationData: VerificationData = await response.json();

    if (!verificationData) {
      return NextResponse.json({ 
        verified: false,
        message: 'No verification data found'
      });
    }

    // Check if currently verified
    if (verificationData.verified) {
      return NextResponse.json({
        verified: true,
        displayName: verificationData.displayName,
        verifiedAt: verificationData.verifiedAt
      });
    }

    // Check if there's an active code
    const now = Date.now() / 1000;
    if (verificationData.expires && now <= verificationData.expires) {
      return NextResponse.json({
        verified: false,
        hasActiveCode: true,
        expires: verificationData.expires
      });
    }

    return NextResponse.json({
      verified: false,
      hasActiveCode: false,
      message: 'No active verification code'
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
