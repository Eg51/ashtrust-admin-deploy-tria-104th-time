// proxy.js (root of your project)
import { NextResponse } from 'next/server';
import { getUserById } from './lib/db/users';
import { verifyToken } from './lib/security';
import { validateSession } from './lib/session';

// ---- CORS Configuration ----
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const corsMethods = process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS';
const corsHeaders = process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization';
const corsCredentials = process.env.CORS_CREDENTIALS || 'true';

function handleCORS(request, response) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin);
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', corsCredentials);
  }
  return response;
}

// ---- Public route whitelist ----
function isPublicRoute(pathname) {
  const publicExact = ['/', '/Business'];
  if (publicExact.includes(pathname)) return true;

  const publicPrefixes = [
    '/login',
    '/register',
    '/log-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/api/prices',
    '/api/check-password-reset',
    '/api/change-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check-user',
    '/_next',
  ];

  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
}

// ---- Main middleware ----
export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // 1. OPTIONS preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', corsMethods);
      response.headers.set('Access-Control-Allow-Headers', corsHeaders);
      response.headers.set('Access-Control-Allow-Credentials', corsCredentials);
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }

  // 2. Public routes
  if (isPublicRoute(pathname)) {
    return handleCORS(request, NextResponse.next());
  }

  // 3. Session cookie
  let userId = null;
  const sessionId = request.cookies.get('sessionId')?.value;
  if (sessionId) {
    const validation = await validateSession(sessionId);
    if (validation.valid && validation.session) {
      userId = validation.session.userId;
    }
  }

  // 4. JWT fallback
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded?.id) userId = decoded.id;
      } catch (error) {
        console.error('JWT verification failed:', error);
      }
    }
  }

  // 5. Unauthenticated
  if (!userId) {
    if (pathname.startsWith('/api/')) {
      return handleCORS(
        request,
        NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      );
    }
    return handleCORS(request, NextResponse.redirect(new URL('/log-in', request.url)));
  }

  // 6. Load user
  const user = await getUserById(userId);
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return handleCORS(
        request,
        NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      );
    }
    return handleCORS(request, NextResponse.redirect(new URL('/log-in', request.url)));
  }

  // 7. Admin gate on /me
  if (pathname === '/me' || pathname.startsWith('/me/')) {
    const isAdmin = user.role === 'admin' || user.isAdmin === true;
    if (!isAdmin) {
      return handleCORS(request, NextResponse.redirect(new URL('/Dashboard', request.url)));
    }
  }

  // 8. Active check
  if (!user.isActive) {
    if (pathname.startsWith('/api/')) {
      return handleCORS(
        request,
        NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 403 }
        )
      );
    }
    return handleCORS(request, NextResponse.redirect(new URL('/log-in', request.url)));
  }

  // 9. Forward user headers into the REQUEST
  // Route handlers and server actions read from request.headers.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set('x-user-id', user._id.toString());
  forwardedHeaders.set('x-user-email', user.email || '');
  forwardedHeaders.set('x-user-username', user.username || '');
  forwardedHeaders.set('x-user-firstName', user.firstName || '');
  forwardedHeaders.set('x-user-lastName', user.lastName || '');
  forwardedHeaders.set('x-user-displayName', user.displayName || user.username || '');
  forwardedHeaders.set('x-user-role', user.role || 'user');

  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });

  // 10. CORS
  return handleCORS(request, response);
}

// ---- Config ----
export const config = {
  matcher: [
    '/api/:path*',
    '/Account/:path*',
    '/Dashboard/:path*',
    '/Bills/:path*',
    '/Cards/:path*',
    '/Settings/:path*',
    '/Transfer/:path*',
    '/me/:path*',
    '/Support/:path*',
  ],
};