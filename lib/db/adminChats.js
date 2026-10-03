// lib/db/adminChats.js
//
// Admin-side chat helpers. Kept separate from lib/db/chats.js so the
// existing user-facing helpers stay untouched.

import { getChatsCollection } from '../mongodb';
import { getUserById } from './users';

/**
 * Return every chat room the given admin is a participant in, hydrated
 * with the other participant's display data + the room's last message
 * + the admin's unread count for that room.
 *
 * Shape:
 *   {
 *     id: string,
 *     otherParticipant: { userId, name, email, avatar },
 *     lastMessage: { text, timestamp, senderId } | null,
 *     unreadCount: number,
 *     updatedAt: string,
 *   }[]
 */
export async function getAdminChatRoomsDetailed(adminId) {
  try {
    const chatsCollection = await getChatsCollection();
    const rooms = await chatsCollection
      .find({ 'participants.userId': adminId })
      .sort({ updatedAt: -1 })
      .toArray();

    const hydrated = await Promise.all(
      rooms.map(async (room) => {
        // Find the participant who is NOT the admin
        const other = (room.participants || []).find(
          (p) => p.userId !== adminId
        );

        let otherParticipant = {
          userId: other?.userId || 'unknown',
          name: other?.name || 'User',
          email: '',
          avatar: null,
        };

        // Hydrate from users collection if it's a real user (not a guest)
        if (other?.userId && !String(other.userId).startsWith('guest_')) {
          try {
            const userDoc = await getUserById(other.userId);
            if (userDoc) {
              otherParticipant = {
                userId: other.userId,
                name:
                  userDoc.displayName ||
                  userDoc.username ||
                  `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() ||
                  'User',
                email: userDoc.email || '',
                avatar: userDoc.avatar || null,
              };
            }
          } catch {
            // keep fallback
          }
        }

        const unread = room.unreadCount?.[adminId] || 0;

        return {
          id: room._id.toString(),
          otherParticipant,
          lastMessage: room.lastMessage
            ? {
                text: room.lastMessage.text || '',
                timestamp: room.lastMessage.timestamp,
                senderId: room.lastMessage.senderId,
              }
            : null,
          unreadCount: unread,
          updatedAt: room.updatedAt,
        };
      })
    );

    return hydrated;
  } catch (error) {
    console.error('[adminChats] getAdminChatRoomsDetailed error:', error);
    return [];
  }
}