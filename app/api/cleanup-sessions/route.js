// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function POST() {
//   try {
//     const { db } = await connectToDatabase();
//     const sessions = db.collection('activity_logs');

//     const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

//     // 1. Delete sessions that have a timeout older than 1 hour
//     const deleteTimedOut = await sessions.deleteMany({
//       timeOut: { $ne: null },
//       updatedAt: { $lt: oneHourAgo }
//     });

//     // 2. Delete "Active" sessions that have not been updated in 1 hour (stale sessions)
//     const deleteStaleActive = await sessions.deleteMany({
//       timeOut: null,
//       updatedAt: { $lt: oneHourAgo }
//     });

//     console.log(`🧹 Cleaned up ${deleteTimedOut.deletedCount} timed-out sessions and ${deleteStaleActive.deletedCount} stale active sessions.`);

//     return NextResponse.json({ 
//       success: true, 
//       deleted: deleteTimedOut.deletedCount + deleteStaleActive.deletedCount 
//     });
//   } catch (error) {
//     console.error('Error cleaning sessions:', error);
//     return NextResponse.json({ success: false, error: 'Failed to clean sessions' }, { status: 500 });
//   }
// }

// app/api/cleanup-sessions/route.js
//
// POST — delete stale session records.
// Auth: requires either an admin caller OR a valid CRON_SECRET.
//
// Two ways to authenticate:
//   1. Admin:      POST with a valid JWT / cookie session for an admin user.
//   2. Cron:       POST with header  Authorization: Bearer <CRON_SECRET>
//                  (use this from an external scheduler)
//
// Deletes from the `sessions` collection — the same collection the rest of
// the app writes to (login, track, logout).

import {
  requireAdmin,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import { getCollection } from '@/lib/mongodb';
import { extractToken } from '@/lib/security';

export const runtime = 'nodejs';

// Stale threshold: anything not touched in the last hour is fair game.
const STALE_MS = 60 * 60 * 1000;

/**
 * True if the request carries a valid CRON_SECRET.
 * Accepts it either as `Authorization: Bearer <secret>` or
 * as `?secret=<secret>`.
 */
function hasValidCronSecret(request) {
  const envSecret = process.env.CRON_SECRET;
  if (!envSecret) return false;

  const headerToken = extractToken(request.headers.get('authorization'));
  if (headerToken && timingSafeEqual(headerToken, envSecret)) return true;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret && timingSafeEqual(querySecret, envSecret)) return true;

  return false;
}

/**
 * Constant-time string compare.
 * Prevents timing attacks against the cron secret.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request) {
  try {
    // ---- Auth: admin OR cron secret -------------------------------------
    let authorized = false;

    if (hasValidCronSecret(request)) {
      authorized = true;
    } else {
      // requireAdmin throws ApiError if not admin — we catch below
      await requireAdmin(request);
      authorized = true;
    }

    if (!authorized) {
      // Defensive — should never reach here if the above logic is correct
      throw new ApiError('Authentication required', 401);
    }

    // ---- Cleanup --------------------------------------------------------
    const sessions = await getCollection('sessions');
    const cutoff = new Date(Date.now() - STALE_MS);

    // 1. Sessions that were properly ended and are older than the cutoff
    const deleteEnded = await sessions.deleteMany({
      timeOut: { $ne: null },
      updatedAt: { $lt: cutoff },
    });

    // 2. Sessions that look "active" but haven't been updated in a while
    //    (user closed tab, browser killed, network died, etc.)
    const deleteStale = await sessions.deleteMany({
      timeOut: null,
      updatedAt: { $lt: cutoff },
    });

    const total = deleteEnded.deletedCount + deleteStale.deletedCount;

    console.log(
      `[cleanup-sessions] removed ${deleteEnded.deletedCount} ended, ${deleteStale.deletedCount} stale (total ${total})`
    );

    return jsonOk({ deleted: total });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[cleanup-sessions] error:', error);
    return jsonError('Failed to clean sessions', 500);
  }
}