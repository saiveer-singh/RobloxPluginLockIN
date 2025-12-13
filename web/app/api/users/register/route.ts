import { NextRequest, NextResponse } from 'next/server';

// Use environment variables for secrets
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://tissueai-coins-default-rtdb.firebaseio.com';
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || '';

interface UserAccount {
    username: string;
    passwordHash: string;
    createdAt: number;
    lastLogin: number;
    robloxUserId?: string;
    robloxDisplayName?: string;
    verified?: boolean;
    verifiedAt?: number;
}

// Simple hash function (in production, use bcrypt)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * POST /api/users/register
 * Register a new user account
 */
export async function POST(req: NextRequest) {
    try {
        const { username, password, robloxUserId } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Check if user already exists
        const checkUrl = `${DATABASE_URL}/accounts/${normalizedUsername}.json?auth=${DATABASE_SECRET}`;
        const checkResponse = await fetch(checkUrl);
        const existingUser = await checkResponse.json();

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Create new user
        const passwordHash = simpleHash(password + normalizedUsername);
        const newUser: UserAccount = {
            username: normalizedUsername,
            passwordHash,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            robloxUserId: robloxUserId || undefined,
            verified: false,
        };

        // If robloxUserId provided, check if they're verified
        if (robloxUserId) {
            const verifyUrl = `${DATABASE_URL}/verification/${robloxUserId}.json?auth=${DATABASE_SECRET}`;
            const verifyResponse = await fetch(verifyUrl);
            const verifyData = await verifyResponse.json();

            if (verifyData?.verified) {
                newUser.verified = true;
                newUser.verifiedAt = verifyData.verifiedAt;
                newUser.robloxDisplayName = verifyData.displayName;
            }
        }

        // Save user to Firebase
        const saveUrl = `${DATABASE_URL}/accounts/${normalizedUsername}.json?auth=${DATABASE_SECRET}`;
        const saveResponse = await fetch(saveUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!saveResponse.ok) {
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            username: normalizedUsername,
            verified: newUser.verified,
            robloxDisplayName: newUser.robloxDisplayName
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/users/register?username=xxx&password=xxx
 * Login - verify credentials
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
        const password = searchParams.get('password');

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Get user from Firebase
        const userUrl = `${DATABASE_URL}/accounts/${normalizedUsername}.json?auth=${DATABASE_SECRET}`;
        const userResponse = await fetch(userUrl);
        const user: UserAccount = await userResponse.json();

        if (!user) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Verify password
        const passwordHash = simpleHash(password + normalizedUsername);
        if (user.passwordHash !== passwordHash) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Update last login
        await fetch(userUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastLogin: Date.now() })
        });

        return NextResponse.json({
            success: true,
            username: user.username,
            verified: user.verified,
            robloxUserId: user.robloxUserId,
            robloxDisplayName: user.robloxDisplayName
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
