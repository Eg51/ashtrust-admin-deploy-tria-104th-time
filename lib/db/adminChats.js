// lib/db/adminChats.js
//
// Shared-inbox helpers for the admin chat widget.
// Every room contains one user + every admin. Admins see ALL rooms.

import { getChatsCollection } from '../mongodb';
import { getUserById } from './users';

/**
 * Return every user room, hydrated with the user's display data, the
 * room's last message, and THIS admin's unread count.
 *
 * @param {string} adminId - the caller (used only for per-admin unread)
 */
export async function getAdminChatRoomsDetailed(adminId) {
  try {
    const chatsCollection = await getChatsCollection();

    // All rooms that have a user participant — this is every room in
    // the shared model. No admin filter, so admin2 sees rooms created
    // before admin2 existed.
    const rooms = await chatsCollection
      .find({ 'participants.role': 'user' })
      .sort({ updatedAt: -1 })
      .toArray();

    const hydrated = await Promise.all(
      rooms.map(async (room) => {
        // Find the USER participant
        const userPart = (room.participants || []).find(
          (p) => p.role === 'user'
        );

        let otherParticipant = {
          userId: userPart?.userId || 'unknown',
          name: userPart?.name || 'User',
          email: '',
          avatar: null,
        };

        // Hydrate from users collection for real (non-guest) users
        if (userPart?.userId && !String(userPart.userId).startsWith('guest_')) {
          try {
            const userDoc = await getUserById(userPart.userId);
            if (userDoc) {
              otherParticipant = {
                userId: userPart.userId,
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

    // Dedupe by user — if multiple rooms exist for the same user
    // (legacy), keep the newest.
    const byUser = new Map();
    for (const r of hydrated) {
      const key = r.otherParticipant.userId;
      const prev = byUser.get(key);
      if (
        !prev ||
        new Date(r.updatedAt).getTime() > new Date(prev.updatedAt).getTime()
      ) {
        byUser.set(key, r);
      }
    }

    return Array.from(byUser.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('[adminChats] getAdminChatRoomsDetailed error:', error);
    return [];
  }
}