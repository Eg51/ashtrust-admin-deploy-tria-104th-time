// app/api/admin/notifications/route.js
//
// GET     — list all pending notifications (admin only)
// DELETE  — remove one by ?id=..., or all by ?all=true (admin only)

import {
  requireAdmin,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import {
  getAllNotifications,
  deleteNotificationById,
  deleteAllNotifications,
} from '@/lib/db/notifications';

export const runtime = 'nodejs';

// ---- GET: list ------------------------------------------------------------
export async function GET(request) {
  try {
    await requireAdmin(request);

    const notifications = await getAllNotifications();
    return jsonOk({ notifications });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[admin/notifications] GET error:', error);
    return jsonError('Failed to load notifications', 500);
  }
}

// ---- DELETE: one or all ---------------------------------------------------
export async function DELETE(request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const all = url.searchParams.get('all');

    if (all === 'true') {
      const result = await deleteAllNotifications();
      if (!result.success) {
        return jsonError(result.error || 'Failed to clear notifications', 500);
      }
      return jsonOk({ cleared: result.deleted });
    }

    if (!id) {
      return jsonError('id or all=true required', 400);
    }

    const result = await deleteNotificationById(id);
    if (!result.success) {
      return jsonError(result.error || 'Failed to delete notification', 400);
    }
    return jsonOk({ deleted: result.deleted });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[admin/notifications] DELETE error:', error);
    return jsonError('Failed to delete notification', 500);
  }
}