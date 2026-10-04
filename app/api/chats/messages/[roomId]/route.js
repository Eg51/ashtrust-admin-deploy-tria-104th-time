

// // // app/api/chats/messages/[roomId]/route.js
// // import { NextResponse } from 'next/server';
// // import { getRoomMessages, addMessage, markMessagesAsRead, deleteMessage } from '@/lib/db/chats';
// // import { verifyToken, extractToken } from '@/lib/security';

// // export const runtime = 'nodejs';

// // export async function GET(request, { params }) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);
    
// //     if (!token) {
// //       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
// //     }

// //     // ✅ IMPORTANT: Await params in Next.js 15+
// //     const { roomId } = await params;
// //     const messages = await getRoomMessages(roomId);

// //     const userId = decoded.id || decoded.userId;
// //     await markMessagesAsRead(roomId, userId);

// //     return NextResponse.json({ success: true, data: messages });
// //   } catch (error) {
// //     console.error('Error fetching messages:', error);
// //     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
// //   }
// // }

// // // export async function POST(request, { params }) {
// // //   try {
// // //     const authHeader = request.headers.get('authorization');
// // //     const token = extractToken(authHeader);
    
// // //     if (!token) {
// // //       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
// // //     }

// // //     const decoded = verifyToken(token);
// // //     if (!decoded) {
// // //       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
// // //     }

// // //     // ✅ IMPORTANT: Await params in Next.js 15+
// // //     const { roomId } = await params;
// // //     const body = await request.json();
// // //     const { message, type = 'text', attachmentUrl } = body;

// // //     if (!message && !attachmentUrl) {
// // //       return NextResponse.json({ success: false, error: 'Message or attachment required' }, { status: 400 });
// // //     }

// // //     const userId = decoded.id || decoded.userId;
// // //     const senderRole = decoded.role === 'admin' || decoded.isAdmin ? 'admin' : 'user';

// // //     const newMessage = await addMessage(roomId, {
// // //       senderId: userId,
// // //       senderRole,
// // //       message,
// // //       type,
// // //       attachmentUrl: attachmentUrl || null,
// // //     });

// // //     if (!newMessage) {
// // //       return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
// // //     }

// // //     return NextResponse.json({ success: true, data: newMessage });
// // //   } catch (error) {
// // //     console.error('Error sending message:', error);
// // //     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
// // //   }
// // // }


// // export async function POST(request, { params }) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);
    
// //     if (!token) {
// //       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
// //     }

// //     // ✅ IMPORTANT: Await params in Next.js 15+
// //     const { roomId } = await params;
// //     const body = await request.json();
// //     const { message, type = 'text', attachmentUrl } = body;

// //     if (!message && !attachmentUrl) {
// //       return NextResponse.json({ success: false, error: 'Message or attachment required' }, { status: 400 });
// //     }

// //     const userId = decoded.id || decoded.userId;
// //     const senderRole = decoded.role === 'admin' || decoded.isAdmin ? 'admin' : 'user';
// //     const senderName = decoded.displayName || decoded.username || 'User'; // ✅ ADDED

// //     const newMessage = await addMessage(roomId, {
// //       senderId: userId,
// //       senderName, // ✅ ADDED
// //       senderRole,
// //       message,
// //       type,
// //       attachmentUrl: attachmentUrl || null,
// //     });

// //     if (!newMessage) {
// //       return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
// //     }

// //     return NextResponse.json({ success: true, data: newMessage });
// //   } catch (error) {
// //     console.error('Error sending message:', error);
// //     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
// //   }
// // }
// // /**
// //  * ✅ NEW: DELETE - Delete a specific message
// //  */
// // export async function DELETE(request, { params }) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);
    
// //     if (!token) {
// //       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
// //     }

// //     // ✅ IMPORTANT: Await params in Next.js 15+
// //     const { roomId } = await params;
// //     const body = await request.json();
// //     const { messageId } = body;

// //     if (!messageId) {
// //       return NextResponse.json({ success: false, error: 'Message ID required' }, { status: 400 });
// //     }

// //     // ✅ Check if user is admin or the message sender
// //     const userId = decoded.id || decoded.userId;
// //     const isAdmin = decoded.role === 'admin' || decoded.isAdmin;
    
// //     // Get the room to check ownership
// //     const messages = await getRoomMessages(roomId);
// //     const messageToDelete = messages.find(m => m.id === messageId);
    
// //     if (!messageToDelete) {
// //       return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
// //     }
    
// //     // ✅ Allow admin to delete any message, user can only delete their own
// //     if (!isAdmin && messageToDelete.senderId !== userId) {
// //       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
// //     }

// //     const result = await deleteMessage(roomId, messageId);

// //     if (!result) {
// //       return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
// //     }

// //     return NextResponse.json({ success: true, message: 'Message deleted successfully' });

// //   } catch (error) {
// //     console.error('Error deleting message:', error);
// //     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
// //   }
// // }
// // app/api/chats/messages/[roomId]/route.js
// //
// // GET    — list messages in a room (participant only)
// // POST   — send a message to a room (participant only, validates attachmentUrl)
// // DELETE — delete a message (author or admin only, atomic)

// import { NextResponse } from 'next/server';
// import { ObjectId } from 'mongodb';
// import {
//   getRoomMessages,
//   addMessage,
//   markMessagesAsRead,
//   deleteMessage,
// } from '@/lib/db/chats';
// import {
//   requireAuth,
//   requireRoomAccess,
//   readJson,
//   jsonOk,
//   jsonError,
//   ApiError,
//   assertString,
// } from '@/lib/api-helpers';

// export const runtime = 'nodejs';

// // ---- Attachment URL allow-list -------------------------------------------
// // Only accept data URLs of these exact types. Rejecting everything else
// // blocks SVG-based stored XSS (data:image/svg+xml,<svg onload=...>).
// const ALLOWED_ATTACHMENT_PREFIXES = [
//   'data:image/jpeg;base64,',
//   'data:image/png;base64,',
//   'data:image/webp;base64,',
// ];

// function isAllowedAttachment(url) {
//   if (typeof url !== 'string') return false;
//   if (url.length > 500_000) return false; // ~500KB data URL cap
//   return ALLOWED_ATTACHMENT_PREFIXES.some((p) => url.startsWith(p));
// }

// // ---- GET: list messages --------------------------------------------------

// export async function GET(request, { params }) {
//   try {
//     const { userId } = await requireAuth(request);

//     const { roomId } = await params;

//     // ✅ Enforce participant-only access before reading anything
//     await requireRoomAccess(roomId, userId);

//     const messages = await getRoomMessages(roomId);

//     // Mark this user's unread counter as read for the room
//     await markMessagesAsRead(roomId, userId);

//     return jsonOk({ data: messages });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('Error fetching messages:', error);
//     return jsonError('Internal server error', 500);
//   }
// }

// // ---- POST: send a message ------------------------------------------------

// export async function POST(request, { params }) {
//   try {
//     const { userId, user } = await requireAuth(request);

//     const { roomId } = await params;

//     // ✅ Participant check
//     await requireRoomAccess(roomId, userId);

//     const body = await readJson(request);
//     const { message, type = 'text', attachmentUrl } = body || {};

//     // Text message: must be a string within a sane length
//     const hasText = typeof message === 'string' && message.trim().length > 0;
//     const hasAttachment = !!attachmentUrl;

//     if (!hasText && !hasAttachment) {
//       throw new ApiError('Message or attachment required', 400);
//     }

//     // Validate attachment URL if present
//     if (hasAttachment && !isAllowedAttachment(attachmentUrl)) {
//       throw new ApiError('Unsupported attachment type', 400);
//     }

//     // Cap text length
//     const cleanMessage = hasText
//       ? message.trim().slice(0, 5000)
//       : '';

//     const senderRole =
//       user.role === 'admin' || user.isAdmin === true ? 'admin' : 'user';
//     const senderName =
//       user.displayName || user.username || 'User';

//     const newMessage = await addMessage(roomId, {
//       senderId: userId,
//       senderName,
//       senderRole,
//       message: cleanMessage,
//       type: hasAttachment ? 'image' : type,
//       attachmentUrl: hasAttachment ? attachmentUrl : null,
//     });

//     if (!newMessage) {
//       throw new ApiError('Failed to send message', 500);
//     }

//     return jsonOk({ data: newMessage });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('Error sending message:', error);
//     return jsonError('Internal server error', 500);
//   }
// }

// // ---- DELETE: delete a message --------------------------------------------

// export async function DELETE(request, { params }) {
//   try {
//     const { userId, user } = await requireAuth(request);

//     const { roomId } = await params;

//     // ✅ Participant check — only participants can act in a room
//     await requireRoomAccess(roomId, userId);

//     const body = await readJson(request);
//     const { messageId } = body || {};

//     if (!messageId || typeof messageId !== 'string') {
//       throw new ApiError('Message ID required', 400);
//     }

//     const isAdmin = user.role === 'admin' || user.isAdmin === true;

//     // Load messages to check ownership
//     const messages = await getRoomMessages(roomId);
//     const target = messages.find((m) => m.id === messageId);

//     if (!target) {
//       throw new ApiError('Message not found', 404);
//     }

//     if (!isAdmin && target.senderId !== userId) {
//       throw new ApiError('Forbidden', 403);
//     }

//     const result = await deleteMessage(roomId, messageId);

//     if (!result) {
//       throw new ApiError('Failed to delete message', 500);
//     }

//     return jsonOk({ message: 'Message deleted successfully' });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('Error deleting message:', error);
//     return jsonError('Internal server error', 500);
//   }
// }
// app/api/chats/messages/[roomId]/route.js
//
// GET    — list messages in a room (participant only)
// POST   — send a message to a room (participant only, validates attachmentUrl)
//          Fires an admin "message" notification when the sender is a user.
// DELETE — delete a message (author or admin only, atomic)

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import {
  getRoomMessages,
  addMessage,
  markMessagesAsRead,
  deleteMessage,
} from '@/lib/db/chats';
import {
  requireAuth,
  requireRoomAccess,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
  assertString,
} from '@/lib/api-helpers';
import { createOrBumpNotification } from '@/lib/db/notifications';

export const runtime = 'nodejs';

// ---- Attachment URL allow-list -------------------------------------------
const ALLOWED_ATTACHMENT_PREFIXES = [
  'data:image/jpeg;base64,',
  'data:image/png;base64,',
  'data:image/webp;base64,',
];

function isAllowedAttachment(url) {
  if (typeof url !== 'string') return false;
  if (url.length > 500_000) return false;
  return ALLOWED_ATTACHMENT_PREFIXES.some((p) => url.startsWith(p));
}

// ---- GET: list messages --------------------------------------------------

// export async function GET(request, { params }) {
//   try {
//     const { userId } = await requireAuth(request);

//     const { roomId } = await params;

//     await requireRoomAccess(roomId, userId);
export async function GET(request, { params }) {
  try {
    const { userId, user } = await requireAuth(request);

    const { roomId } = await params;

    await requireRoomAccess(roomId, userId, user);

    const messages = await getRoomMessages(roomId);

    await markMessagesAsRead(roomId, userId);

    return jsonOk({ data: messages });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('Error fetching messages:', error);
    return jsonError('Internal server error', 500);
  }
}

// ---- POST: send a message ------------------------------------------------

export async function POST(request, { params }) {
  try {
      const { userId, user } = await requireAuth(request);

      const { roomId } = await params;

      await requireRoomAccess(roomId, userId, user);
    // const { userId, user } = await requireAuth(request);

    // const { roomId } = await params;

    // await requireRoomAccess(roomId, userId);
    
    const body = await readJson(request);
    const { message, type = 'text', attachmentUrl } = body || {};

    const hasText = typeof message === 'string' && message.trim().length > 0;
    const hasAttachment = !!attachmentUrl;

    if (!hasText && !hasAttachment) {
      throw new ApiError('Message or attachment required', 400);
    }

    if (hasAttachment && !isAllowedAttachment(attachmentUrl)) {
      throw new ApiError('Unsupported attachment type', 400);
    }

    const cleanMessage = hasText ? message.trim().slice(0, 5000) : '';

    const senderRole =
      user.role === 'admin' || user.isAdmin === true ? 'admin' : 'user';
    const senderName = user.displayName || user.username || 'User';

    const newMessage = await addMessage(roomId, {
      senderId: userId,
      senderName,
      senderRole,
      message: cleanMessage,
      type: hasAttachment ? 'image' : type,
      attachmentUrl: hasAttachment ? attachmentUrl : null,
    });

    if (!newMessage) {
      throw new ApiError('Failed to send message', 500);
    }

    // ✅ Fire admin notification ONLY when the sender is a user (not admin).
    // This keeps admin-to-admin chatter out of the notification queue.
    if (senderRole === 'user') {
      try {
        const preview = hasText
          ? cleanMessage.slice(0, 80)
          : '[image attachment]';

        await createOrBumpNotification({
          type: 'message',
          userId,
          username: senderName,
          email: user.email || '',
          avatar: user.avatar || null,
          detail: preview,
          metadata: {
            roomId,
            messageId: newMessage.id,
            messageType: hasAttachment ? 'image' : type,
            at: new Date().toISOString(),
          },
        });
      } catch (notifErr) {
        console.warn('[chat] notification failed (non-critical):', notifErr?.message);
      }
    }

    return jsonOk({ data: newMessage });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('Error sending message:', error);
    return jsonError('Internal server error', 500);
  }
}

// ---- DELETE: delete a message --------------------------------------------

export async function DELETE(request, { params }) {
  try {
      const { userId, user } = await requireAuth(request);

      const { roomId } = await params;

      await requireRoomAccess(roomId, userId, user);
    // const { userId, user } = await requireAuth(request);

    // const { roomId } = await params;

    // await requireRoomAccess(roomId, userId);

    const body = await readJson(request);
    const { messageId } = body || {};

    if (!messageId || typeof messageId !== 'string') {
      throw new ApiError('Message ID required', 400);
    }

    const isAdmin = user.role === 'admin' || user.isAdmin === true;

    const messages = await getRoomMessages(roomId);
    const target = messages.find((m) => m.id === messageId);

    if (!target) {
      throw new ApiError('Message not found', 404);
    }

    if (!isAdmin && target.senderId !== userId) {
      throw new ApiError('Forbidden', 403);
    }

    const result = await deleteMessage(roomId, messageId);

    if (!result) {
      throw new ApiError('Failed to delete message', 500);
    }

    return jsonOk({ message: 'Message deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('Error deleting message:', error);
    return jsonError('Internal server error', 500);
  }
}