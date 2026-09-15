// // app/api/chats/mark-read/route.js
// import { NextResponse } from 'next/server';
// import { markMessagesAsRead } from '@/lib/db/chats';
// import { verifyToken, extractToken } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     const userId = decoded.id || decoded.userId;
//     const body = await request.json();
//     const { roomId } = body;

//     if (!roomId) {
//       return NextResponse.json(
//         { success: false, error: 'Room ID required' },
//         { status: 400 }
//       );
//     }

//     await markMessagesAsRead(roomId, userId);

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Messages marked as read' 
//     });

//   } catch (error) {
//     console.error('Error marking messages as read:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

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
    const { userId } = await requireAuth(request);

    const body = await readJson(request);
    const { roomId } = body || {};

    if (!roomId || typeof roomId !== 'string') {
      throw new ApiError('Room ID required', 400);
    }

    // ✅ Participant check — only someone in the room can reset their own counter
    await requireRoomAccess(roomId, userId);

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