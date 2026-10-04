// app/api/chats/mark-read/route.js
//
// POST — mark all messages in a room as read for the current user.
// Only the participant who owns the unread counter can reset it.

import {
  requireAuth,
  requireRoomAccess,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import { markMessagesAsRead } from '@/lib/db/chats';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId, user } = await requireAuth(request);

    const body = await readJson(request);
    const { roomId } = body || {};

    if (!roomId || typeof roomId !== 'string') {
      throw new ApiError('Room ID required', 400);
    }

    // ✅ Participant check — participant or any admin can reset their own counter
    await requireRoomAccess(roomId, userId, user);
    // const { userId } = await requireAuth(request);

    // const body = await readJson(request);
    // const { roomId } = body || {};

    // if (!roomId || typeof roomId !== 'string') {
    //   throw new ApiError('Room ID required', 400);
    // }

    // // ✅ Participant check — only someone in the room can reset their own counter
    // await requireRoomAccess(roomId, userId);

    await markMessagesAsRead(roomId, userId);

    return jsonOk({ message: 'Messages marked as read' });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('Error marking messages as read:', error);
    return jsonError('Internal server error', 500);
  }
}