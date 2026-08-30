export const runtime = 'nodejs';
// middleware.js (root of your project)
import { NextResponse } from 'next/server';
import { getUserById } from './lib/db/users';
import { verifyToken } from './lib/security';
import { validateSession } from './lib/session';

// ---- CORS Configuration ----
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const corsMethods = process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS';
const corsHeaders = process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization';
const corsCredentials = process.env.CORS_CREDENTIALS || 'true';

/**
 * Handle CORS headers on a response
 */
function handleCORS(request, response) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', corsCredentials);
  }
  // middleware.js - Add this at the end of the middleware function

// ---- 11. Override CSP Headers (Fix CSP Errors) ----
if (process.env.NODE_ENV === 'development') {
  response.headers.set(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob: 'wasm-unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; connect-src *; font-src *;"
  );
}
  return response;
}

/**
 * Check if the route is public (no auth required)
 */
function isPublicRoute(pathname) {
  const publicPaths = [
    '/login',
    '/register',
    '/log-in',
    '/api/check-password-reset',
    '/api/change-password',    
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check-user',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/_next',
  ];
  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Main middleware – CORS + Authentication
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // ---- 1. Handle OPTIONS preflight requests ----
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

  // ---- 2. Skip authentication for public routes ----
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return handleCORS(request, response);
  }

  // ---- 3. Authentication: Try session cookie first ----
  let userId = null;
  const sessionId = request.cookies.get('sessionId')?.value;
  if (sessionId) {
    const validation = await validateSession(sessionId);
    if (validation.valid && validation.session) {
      userId = validation.session.userId;
    }
  }

  // ---- 4. If no session, try JWT from Authorization header ----
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch (error) {
        console.error('JWT verification failed:', error);
      }
    }
  }

  // ---- 5. If no valid authentication ----
  if (!userId) {
    // ✅ FIX: For API routes, return JSON error instead of redirecting
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
      return handleCORS(request, response);
    }
    
    // For non-API routes, redirect to login
    const loginUrl = new URL('/log-in', request.url);
    const response = NextResponse.redirect(loginUrl);
    return handleCORS(request, response);
  }

  // ---- 6. Fetch user from database ----
  const user = await getUserById(userId);
  if (!user) {
    // ✅ FIX: For API routes, return JSON error
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
      return handleCORS(request, response);
    }
    const response = NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
    return handleCORS(request, response);
  }

  // ---- 🆕 7. Admin Route Protection (New) ----
  if (pathname.startsWith('/me')) {
    const isAdmin = user.role === 'admin' || user.isAdmin === true;
    if (!isAdmin) {
      // Redirect non-admin users to the regular user dashboard
      const response = NextResponse.redirect(new URL('/Dashboard', request.url));
      return handleCORS(request, response);
    }
  }

  // ---- 8. Check if user is active ----
  if (!user.isActive) {
    // ✅ FIX: For API routes, return JSON error
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      );
      return handleCORS(request, response);
    }
    const response = NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 403 }
    );
    return handleCORS(request, response);
  }

  // ---- 9. Attach user info to request headers (for App Router) ----
  const response = NextResponse.next();
  response.headers.set('x-user-id', user._id.toString());
  response.headers.set('x-user-email', user.email);
  response.headers.set('x-user-username', user.username);
  response.headers.set('x-user-firstName', user.firstName);
  response.headers.set('x-user-lastName', user.lastName);
  response.headers.set('x-user-displayName', user.displayName || user.username);
  response.headers.set('x-user-role', user.role);

  // ---- 10. Apply CORS headers ----
  return handleCORS(request, response);
}


// ---- Configuration - which routes to run on ----
export const config = {
  matcher: [
    // Apply to all API routes and protected pages
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