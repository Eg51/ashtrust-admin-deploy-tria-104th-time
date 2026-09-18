// app/api/admin/stats/timeseries/route.js
//
// GET — user signups per day for the last 30 days.
// Admin-only. Feeds the growth line chart on the admin dashboard.
//
// Response:
//   { success: true, data: [{ date: 'YYYY-MM-DD', count: N }, ...] }
//
// Always returns exactly 30 entries (today + 29 days back), zero-filled
// for days with no signups. That keeps the chart x-axis consistent.

import {
  requireAdmin,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import { getUsersCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

const DAYS = 30;

export async function GET(request) {
  try {
    await requireAdmin(request);

    // ---- 1. Compute the 30-day window (UTC, midnight-aligned) -----------
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    // ---- 2. Pre-fill every day with 0 so the chart never has gaps -------
    const buckets = new Map();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      buckets.set(key, 0);
    }

    // ---- 3. Fetch only the createdAt field for the window ---------------
    const users = await getUsersCollection();
    const rows = await users
      .find(
        { createdAt: { $gte: since } },
        { projection: { createdAt: 1, _id: 0 } }
      )
      .toArray();

    // ---- 4. Bucket each user into its day -------------------------------
    for (const row of rows) {
      if (!row.createdAt) continue;
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, buckets.get(key) + 1);
      }
    }

    // ---- 5. Return as array, oldest first -------------------------------
    const data = Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return jsonOk({ data });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[admin/stats/timeseries] error:', error);
    return jsonError('Failed to load timeseries', 500);
  }
}