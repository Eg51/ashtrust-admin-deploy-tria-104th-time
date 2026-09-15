

// app/api/track/route.js
//
// POST — record a session activity ping from the client.
// - Requires authentication (cookie session, middleware header, or Bearer JWT)
// - Upserts by sessionId (one row per session, updated on each ping)
// - Stores "in" / "out" action explicitly
// - timeIn is written once ($setOnInsert), so "out" pings don't clobber it
// - visitCount only increments on "in" events
// - Country lookup is cached in-memory to avoid hammering the geo service

import {
  requireAuth,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import { getCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

// ---- Country lookup (best-effort, in-memory cache) -----------------------

const countryCache = new Map(); // ip -> country | 'Unknown Location'
const COUNTRY_CACHE_MAX = 500;

async function getCountryFromIP(ip) {
  if (
    !ip ||
    ip === '0.0.0.0' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('127.')
  ) {
    return 'Local Network';
  }

  if (countryCache.has(ip)) return countryCache.get(ip);

  const services = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      parse: (d) => d.country_name || d.country || null,
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${ip}?fields=country`,
      parse: (d) => d.country || null,
    },
    {
      name: 'ipinfo.io',
      url: `https://ipinfo.io/${ip}/json`,
      parse: (d) => d.country || d.country_name || null,
    },
  ];

  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const country = service.parse(data);
        if (country) {
          if (countryCache.size >= COUNTRY_CACHE_MAX) {
            countryCache.delete(countryCache.keys().next().value);
          }
          countryCache.set(ip, country);
          return country;
        }
      }
    } catch {
      // try next service
    }
  }

  // Cache negative result too (avoid retrying a dead service on every ping)
  if (countryCache.size >= COUNTRY_CACHE_MAX) {
    countryCache.delete(countryCache.keys().next().value);
  }
  countryCache.set(ip, 'Unknown Location');
  return 'Unknown Location';
}

// ---- POST ---------------------------------------------------------------

export async function POST(request) {
  try {
    const { userId, user } = await requireAuth(request);

    // Body is optional — an empty body is a valid "in" ping
    let body = {};
    try {
      body = await readJson(request);
    } catch {
      body = {};
    }

    const {
      sessionId,
      deviceInfo,
      timeIn,
      timeOut,
      timeSpent,
      avatar,
      path,
      eventType,
      action,
    } = body || {};

    // ---- IP + country ---------------------------------------------------
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
    const ip =
      cfConnectingIP ||
      forwardedFor.split(',')[0].trim() ||
      '0.0.0.0';
    const country = await getCountryFromIP(ip);

    // ---- Canonical identity from the DB, not the request body ----------
    const finalUsername =
      user.username || user.displayName || user.firstName || 'Unknown';
    const finalEmail = user.email || 'No email';
    const finalDisplayName =
      user.displayName || user.username || finalUsername;
    const finalAvatar = user.avatar || avatar || null;

    const finalSessionId =
      typeof sessionId === 'string' && sessionId.length > 0
        ? sessionId
        : `session_${userId}_${Date.now()}`;

    // Explicit action, with fallback inference for older callers
    const finalAction =
      action === 'out'
        ? 'out'
        : action === 'in'
          ? 'in'
          : timeOut
            ? 'out'
            : 'in';

    // ---- Upsert by sessionId -------------------------------------------
    const sessions = await getCollection('sessions');

    // visitCount only counts "in" events (one visit = one count)
    const incStage =
      finalAction === 'in' ? { $inc: { visitCount: 1 } } : {};

    await sessions.updateOne(
      { sessionId: finalSessionId },
      {
        $set: {
          userId,
          sessionId: finalSessionId,
          email: finalEmail,
          username: finalUsername,
          displayName: finalDisplayName,
          avatar: finalAvatar,
          ip,
          country,
          deviceInfo:
            typeof deviceInfo === 'string'
              ? deviceInfo.slice(0, 500)
              : 'Unknown Device',
          timeOut:
            finalAction === 'out'
              ? timeOut || new Date().toISOString()
              : null,
          timeSpent:
            typeof timeSpent === 'string'
              ? timeSpent.slice(0, 50)
              : '0s',
          action: finalAction,
          lastAction: finalAction,
          path: typeof path === 'string' ? path.slice(0, 200) : '/',
          eventType:
            typeof eventType === 'string'
              ? eventType.slice(0, 50)
              : 'page_view',
          updatedAt: new Date(),
          lastUpdated: new Date().toISOString(),
        },
        $setOnInsert: {
          // timeIn is written ONCE — "out" pings don't clobber session start
          timeIn: timeIn || new Date().toISOString(),
          createdAt: new Date(),
          firstVisit: new Date().toISOString(),
        },
        ...incStage,
      },
      { upsert: true }
    );

    return jsonOk({
      data: {
        sessionId: finalSessionId,
        userId,
        username: finalUsername,
        email: finalEmail,
        country,
        action: finalAction,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[track] error:', error);
    return jsonError('Failed to track session', 500);
  }
}