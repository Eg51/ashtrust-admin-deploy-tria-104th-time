// import { NextResponse } from 'next/server';
// import { getChatsCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';
// import { ObjectId } from 'mongodb';

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
//     const { notificationId } = body;

//     if (!notificationId) {
//       return NextResponse.json(
//         { success: false, error: 'Notification ID required' },
//         { status: 400 }
//       );
//     }

//     const chatsCollection = await getChatsCollection();
    
//     // Mark specific message as read
//     const result = await chatsCollection.updateOne(
//       { 'messages.id': notificationId },
//       { 
//         $set: { 
//           'messages.$.read': true 
//         } 
//       }
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'Notification marked as read'
//     });

//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
// app/api/user/notifications/read/route.js
//
// POST — mark a specific chat message as read.
// The caller must be a participant of the room that contains the message.

import { ObjectId } from 'mongodb';
import { getChatsCollection } from '@/lib/mongodb';
import {
  requireAuth,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId } = await requireAuth(request);

    const body = await readJson(request);
    const { notificationId } = body || {};

    if (!notificationId || typeof notificationId !== 'string') {
      throw new ApiError('Notification ID required', 400);
    }

    const chats = await getChatsCollection();

    // ✅ Load the room that contains this message, then verify the caller
    //    is a participant BEFORE marking anything as read.
    const room = await chats.findOne({ 'messages.id': notificationId });
    if (!room) {
      throw new ApiError('Notification not found', 404);
    }

    const participants = Array.isArray(room.participants) ? room.participants : [];
    const isParticipant = participants.some(
      (p) => p && String(p.userId) === String(userId)
    );

    if (!isParticipant) {
      throw new ApiError('Forbidden', 403);
    }

    // Now safe to mark read
    await chats.updateOne(
      { _id: room._id, 'messages.id': notificationId },
      { $set: { 'messages.$.read': true } }
    );

    return jsonOk({ message: 'Notification marked as read' });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('Error marking notification as read:', error);
    return jsonError('Internal server error', 500);
  }
}