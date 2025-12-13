import { NextResponse } from 'next/server';

// Use environment variables for secrets - NEVER hardcode!
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://tissueai-coins-default-rtdb.firebaseio.com';
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || '';


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
      // NOTE: Only log codes server-side, never expose to client!
      console.log('Expected (stored):', `"${verificationData.code}"`);
      console.log('Received (upper):', `"${code.toUpperCase()}"`);
      console.log('Received (original):', `"${code}"`);
      return NextResponse.json({
        error: 'Invalid verification code. Please check the code and try again.'
      }, { status: 400 });
    }


    // Check if code has expired - handle clock synchronization issues
    const now = Date.now() / 1000; // Convert to seconds like tick()
    const bufferTime = 5; // 5 second buffer for time synchronization issues
    console.log('Checking expiration...');
    console.log('Current time (seconds):', now);
    console.log('Current time (readable):', new Date(now * 1000).toISOString());
    console.log('Code expires at:', verificationData.expires);
    console.log('Code expires at (readable):', new Date(verificationData.expires * 1000).toISOString());
    console.log('Buffer time:', bufferTime);
    console.log('Effective expiry:', verificationData.expires + bufferTime);
    console.log('Effective expiry (readable):', new Date((verificationData.expires + bufferTime) * 1000).toISOString());
    console.log('Time remaining:', (verificationData.expires + bufferTime) - now);

    // Handle clock synchronization issues:
    // 1. Codes that expire more than 1 hour in the future (Roblox server ahead)
    // 2. Codes that expired up to 12 hours ago (web server ahead)
    const timeDiff = verificationData.expires - now;
    const maxFutureTime = 3600; // 1 hour maximum future time
    const maxPastTime = -43200; // 12 hours maximum past time (-12 * 3600)

    if (timeDiff > maxFutureTime) {
      console.log('=== FUTURE TIMESTAMP DETECTED ===');
      console.log('Code expires too far in the future:', timeDiff, 'seconds');
      console.log('Assuming clock synchronization issue, accepting code');
      console.log('Code is still valid');
    } else if (timeDiff < maxPastTime) {
      console.log('=== CODE TOO FAR IN PAST ===');
      console.log('Code expired too long ago:', Math.abs(timeDiff), 'seconds');
      console.log('This suggests a different code or major clock sync issue');
      const timeAgo = now - verificationData.expires;
      return NextResponse.json({
        error: `Verification code has expired. Code expired ${Math.round(timeAgo)} seconds ago. Please generate a new code.`
      }, { status: 400 });
    } else {
      console.log('Code is within acceptable time range (clock sync issue handled)');
      console.log('Code is still valid');
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
    const bufferTime = 5; // 5 second buffer for time synchronization issues

    // Same future timestamp handling as POST endpoint
    const timeDiff = verificationData.expires - now;
    const maxFutureTime = 3600; // 1 hour maximum future time

    if (timeDiff > maxFutureTime) {
      console.log('=== FUTURE TIMESTAMP DETECTED IN STATUS CHECK ===');
      console.log('Code expires too far in the future:', timeDiff, 'seconds');
      console.log('Assuming clock synchronization issue, treating as active code');
      return NextResponse.json({
        verified: false,
        hasActiveCode: true,
        expires: verificationData.expires
      });
    } else if (verificationData.expires && now <= (verificationData.expires + bufferTime)) {
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
