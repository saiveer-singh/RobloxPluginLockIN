import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // === SECURITY HEADERS ===

    // Content Security Policy - Strict but allows necessary functionality
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.vercel.app https://*.firebase.com https://*.firebaseio.com wss://*.vercel.app https://generativelanguage.googleapis.com https://api.z.ai https://open.bigmodel.cn https://openrouter.ai https://opencode.ai",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature Policy)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    // HSTS - Enable in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    // === RATE LIMITING FOR API ROUTES ===
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute window
        const maxRequests = 100; // Max requests per window

        const rateLimit = rateLimitMap.get(ip);

        if (rateLimit) {
            if (now > rateLimit.resetTime) {
                // Reset the window
                rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
            } else if (rateLimit.count >= maxRequests) {
                // Rate limit exceeded
                return new NextResponse(
                    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000)),
                        },
                    }
                );
            } else {
                // Increment count
                rateLimit.count++;
            }
        } else {
            // First request from this IP
            rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        }

        // Add rate limit headers
        const currentLimit = rateLimitMap.get(ip);
        if (currentLimit) {
            response.headers.set('X-RateLimit-Limit', String(maxRequests));
            response.headers.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - currentLimit.count)));
            response.headers.set('X-RateLimit-Reset', String(Math.ceil(currentLimit.resetTime / 1000)));
        }
    }

    return response;
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
