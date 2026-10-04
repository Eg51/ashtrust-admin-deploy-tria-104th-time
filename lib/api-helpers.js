// lib/api-helpers.js
//
// Shared helpers for API routes.
// - Standard success/error response shapes
// - Auth resolution (middleware header → cookie session → JWT)
// - Admin gate
// - Chat room participation gate
// - Safe JSON body parsing
// - Route wrapper that converts thrown ApiError to the right response
// - Small input validators

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyToken, extractToken } from './security';
import { validateSession } from './session';
import { getUserById } from './db/users';
import { getChatsCollection } from './mongodb';

// ---- Response helpers ----------------------------------------------------

export function jsonOk(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function jsonError(message, status = 400) {
  return NextResponse.json(
    { success: false, error: typeof message === 'string' ? message : 'Request failed' },
    { status }
  );
}

// ---- Typed error so handlers can throw -----------------------------------

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ---- Cookie parser (for sessionId fallback) ------------------------------

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

// ---- Identity resolution -------------------------------------------------
//
// Order of trust:
//   1. x-user-id header — set by middleware, only present if middleware ran
//   2. sessionId cookie  — validated against the sessions collection
//   3. Bearer JWT        — verified with the shared secret
//
// Returns userId string, or null if none of the three worked.

async function resolveUserId(request) {
  // 1. Middleware-injected header
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) return headerUserId;

  // 2. Cookie session
  const sessionId =
    request.cookies?.get?.('sessionId')?.value ||
    parseCookie(request.headers.get('cookie'), 'sessionId');
  if (sessionId) {
    try {
      const validation = await validateSession(sessionId);
      if (validation?.valid && validation?.session?.userId) {
        return String(validation.session.userId);
      }
    } catch (err) {
      console.error('[api-helpers] session validation failed:', err?.message);
    }
  }

  // 3. Bearer JWT
  const token = extractToken(request.headers.get('authorization'));
  if (token) {
    try {
      const decoded = verifyToken(token);
      const id = decoded?.id || decoded?.userId;
      if (id) return String(id);
    } catch (err) {
      console.error('[api-helpers] JWT verification failed:', err?.message);
    }
  }

  return null;
}

// ---- requireAuth ---------------------------------------------------------

/**
 * Require an authenticated user.
 * @returns {Promise<{ userId: string, user: object }>}
 * @throws {ApiError} 401 if unauthenticated, 404 if user missing, 403 if inactive
 */
export async function requireAuth(request) {
  const userId = await resolveUserId(request);
  if (!userId) throw new ApiError('Authentication required', 401);

  const user = await getUserById(userId);
  if (!user) throw new ApiError('User not found', 404);
  if (user.isActive === false) throw new ApiError('Account is deactivated', 403);

  return { userId: String(user._id), user };
}

// ---- requireAdmin --------------------------------------------------------

/**
 * Require an authenticated admin.
 * @returns {Promise<{ userId: string, user: object }>}
 * @throws {ApiError} 403 if not admin
 */
export async function requireAdmin(request) {
  const { userId, user } = await requireAuth(request);
  const isAdmin = user.role === 'admin' || user.isAdmin === true;
  if (!isAdmin) throw new ApiError('Admin access required', 403);
  return { userId, user };
}

// ---- requireRoomAccess ---------------------------------------------------

/**
 * Require that the caller is a participant in a chat room.
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<object>} the room document
 * @throws {ApiError} 400 invalid id, 404 not found, 403 not a participant
 */
export async function requireRoomAccess(roomId, userId, user = null) {
  if (!roomId || !ObjectId.isValid(roomId)) {
    throw new ApiError('Invalid room id', 400);
  }

  const chats = await getChatsCollection();
  const room = await chats.findOne({ _id: new ObjectId(roomId) });
  if (!room) throw new ApiError('Chat room not found', 404);

  const participants = Array.isArray(room.participants) ? room.participants : [];
  const isParticipant = participants.some(
    (p) => p && String(p.userId) === String(userId)
  );

  // Shared-inbox model: any admin can access any room. This lets a
  // newly-added admin see rooms created before their account existed.
  // The room backfills them as a participant on first access via
  // getOrCreateChatRoom in the rooms route.
  const callerIsAdmin =
    !!user &&
    (user.role === 'admin' ||
      user.role === 'Admin' ||
      user.role === 'Administrator' ||
      user.isAdmin === true);

  if (!isParticipant && !callerIsAdmin) {
    throw new ApiError('Forbidden', 403);
  }

  return room;
}
// export async function requireRoomAccess(roomId, userId) {
//   if (!roomId || !ObjectId.isValid(roomId)) {
//     throw new ApiError('Invalid room id', 400);
//   }

//   const chats = await getChatsCollection();
//   const room = await chats.findOne({ _id: new ObjectId(roomId) });
//   if (!room) throw new ApiError('Chat room not found', 404);

//   const participants = Array.isArray(room.participants) ? room.participants : [];
//   const isParticipant = participants.some(
//     (p) => p && String(p.userId) === String(userId)
//   );

//   if (!isParticipant) throw new ApiError('Forbidden', 403);

//   return room;
// }

// ---- Body parsing --------------------------------------------------------

/**
 * Parse the JSON body, throwing a 400 ApiError if invalid.
 */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError('Invalid JSON body', 400);
  }
}

// ---- Route wrapper -------------------------------------------------------

/**
 * Wrap a route handler so thrown ApiError becomes the right response.
 * Any other thrown error becomes a 500 with a safe message.
 *
 * Usage:
 *   export const POST = guarded(async (request, ctx) => {
 *     const { user } = await requireAuth(request);
 *     // ...
 *     return jsonOk({ data });
 *   });
 */
export function guarded(handler) {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return jsonError(err.message, err.status);
      }
      console.error('[api] unhandled error:', err);
      return jsonError('Internal server error', 500);
    }
  };
}

// ---- Input validators ----------------------------------------------------

/**
 * Assert a value is a non-empty string, optionally bounded in length.
 */
export function assertString(value, field, { min = 1, max = 10000 } = {}) {
  if (typeof value !== 'string') {
    throw new ApiError(`${field} must be a string`, 400);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ApiError(`${field} is required`, 400);
  }
  if (trimmed.length > max) {
    throw new ApiError(`${field} is too long`, 400);
  }
  return trimmed;
}

/**
 * Assert a value is a number (or numeric string), optionally bounded.
 */
export function assertNumber(value, field, { min = -Infinity, max = Infinity } = {}) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (Number.isNaN(num)) {
    throw new ApiError(`${field} must be a number`, 400);
  }
  if (num < min) {
    throw new ApiError(`${field} must be at least ${min}`, 400);
  }
  if (num > max) {
    throw new ApiError(`${field} must be at most ${max}`, 400);
  }
  return num;
}