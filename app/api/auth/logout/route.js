// app/api/auth/logout/route.js
//
// POST /api/auth/logout
//
// Body (optional): { everywhere?: boolean }
//   - everywhere: false (default) — delete only the current session
//   - everywhere: true            — delete all sessions for this user
//
// Behavior:
//   - Deletes the session record on the server
//   - Clears the sessionId cookie
//   - Always returns 200 (logout is idempotent — safe to call when already logged out)

import { NextResponse } from 'next/server';
import { deleteSession, deleteUserSessions } from '@/lib/session';
import { extractToken, verifyToken } from '@/lib/security';

export const runtime = 'nodejs';

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export async function POST(request) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  // ---- 1. Identify session to delete --------------------------------------
  const sessionId =
    request.cookies?.get?.('sessionId')?.value ||
    parseCookie(request.headers.get('cookie'), 'sessionId');

  if (sessionId) {
    try {
      await deleteSession(sessionId);
    } catch (err) {
      console.warn('[logout] failed to delete session:', err?.message);
    }
  }

  // ---- 2. Optional: log out everywhere -----------------------------------
  let body = {};
  try {
    body = await request.json();
  } catch {
    // no body — fine, single-session logout
  }

  if (body?.everywhere === true) {
    const token = extractToken(request.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    const userId = decoded?.id || decoded?.userId;

    if (userId) {
      try {
        await deleteUserSessions(String(userId));
      } catch (err) {
        console.warn('[logout] failed to delete all sessions:', err?.message);
      }
    }
  }

  // ---- 3. Clear the cookie regardless ------------------------------------
  response.cookies.set('sessionId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

// GET variant so a plain link/redirect can log out.
export async function GET(request) {
  return POST(request);
}