// lib/db/chats.js
import { getChatsCollection } from '../mongodb';
import { getUserById } from './users';
import { ObjectId } from 'mongodb';

/**
 * Get or create chat room between a user and ALL admins.
 *
 * Shared model: every room contains the user + every admin as
 * participants. Unread state is tracked per-admin. Any admin can
 * respond. Adding a new admin later gets them into all future rooms
 * automatically — see scripts/add-admins-to-rooms.js for a one-time
 * backfill of existing rooms.
 *
 * @param {string} userId - the regular user's id
 * @param {Array<{userId: string, name?: string}>} adminUsers - array of admin ids+display names
 */
export async function getOrCreateChatRoom(userId, adminUsers) {
  try {
    // Backward compat: allow a single admin id string
    const admins = Array.isArray(adminUsers)
      ? adminUsers
      : [{ userId: adminUsers, name: 'Admin' }];

    const chatsCollection = await getChatsCollection();

    // Match any room that has this user + at least one admin.
    // Room is unique per user — admins are the "shared" side.
    const existing = await chatsCollection.findOne(
      {
        'participants.userId': userId,
        'participants.role': 'admin',
      },
      { sort: { updatedAt: -1 } }
    );

    if (existing) {
      // Backfill any admins who aren't yet participants of this room.
      // This makes the migration optional — the code self-heals.
      const existingAdminIds = new Set(
        (existing.participants || [])
          .filter((p) => p.role === 'admin')
          .map((p) => p.userId)
      );

      const missingAdmins = admins.filter(
        (a) => a.userId && !existingAdminIds.has(a.userId)
      );

      if (missingAdmins.length > 0) {
        const newParticipants = missingAdmins.map((a) => ({
          userId: a.userId,
          role: 'admin',
          name: a.name || 'Admin',
        }));

        const unreadInit = {};
        missingAdmins.forEach((a) => {
          unreadInit[`unreadCount.${a.userId}`] = 0;
        });

        await chatsCollection.updateOne(
          { _id: existing._id },
          {
            $push: { participants: { $each: newParticipants } },
            $set: { ...unreadInit, updatedAt: new Date() },
          }
        );

        return await chatsCollection.findOne({ _id: existing._id });
      }

      return existing;
    }

    // Create a new room with user + all admins
    const user = await getUserById(userId);

    const participants = [
      {
        userId,
        role: 'user',
        name: user?.displayName || user?.username || 'User',
      },
      ...admins
        .filter((a) => a.userId)
        .map((a) => ({
          userId: a.userId,
          role: 'admin',
          name: a.name || 'Admin',
        })),
    ];

    const unreadCount = { [userId]: 0 };
    admins.forEach((a) => {
      if (a.userId) unreadCount[a.userId] = 0;
    });

    const newRoom = {
      participants,
      messages: [],
      lastMessage: null,
      unreadCount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await chatsCollection.insertOne(newRoom);
    return { ...newRoom, _id: result.insertedId };
  } catch (error) {
    console.error('Error getting/creating chat room:', error);
    throw error;
  }
}

/**
 * Add message to chat room.
 * Unread counts use atomic $inc so simultaneous messages can't overwrite
 * each other's counter changes.
 */
export async function addMessage(roomId, messageData) {
  try {
    const chatsCollection = await getChatsCollection();
    const roomObjectId = new ObjectId(roomId);

    const room = await chatsCollection.findOne({ _id: roomObjectId });
    if (!room) {
      console.error('[addMessage] Room not found:', roomId);
      return null;
    }

    if (!Array.isArray(room.messages)) {
      await chatsCollection.updateOne(
        { _id: roomObjectId },
        { $set: { messages: [] } }
      );
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...messageData,
      timestamp: new Date(),
      read: false,
    };

    const unreadInc = {};
    for (const p of room.participants || []) {
      if (p.userId !== messageData.senderId) {
        unreadInc[`unreadCount.${p.userId}`] = 1;
      }
    }

    const update = {
      $push: { messages: newMessage },
      $set: {
        lastMessage: {
          text: messageData.message || '',
          timestamp: new Date(),
          senderId: messageData.senderId,
        },
        updatedAt: new Date(),
      },
    };

    if (Object.keys(unreadInc).length > 0) {
      update.$inc = unreadInc;
    }

    const result = await chatsCollection.updateOne(
      { _id: roomObjectId },
      update
    );

    return result.modifiedCount > 0 ? newMessage : null;
  } catch (error) {
    console.error('[addMessage] Error:', error);
    throw error;
  }
}

/**
 * Get messages for a room — ALL messages, read or unread.
 */
export async function getRoomMessages(roomId) {
  try {
    const chatsCollection = await getChatsCollection();
    const roomObjectId = new ObjectId(roomId);
    const room = await chatsCollection.findOne({ _id: roomObjectId });
    return room?.messages || [];
  } catch (error) {
    console.error('[getRoomMessages] Error:', error);
    return [];
  }
}

/**
 * Mark all messages in a room as read for a specific user.
 * Only resets THAT user's unread counter — other admins keep their own.
 */
export async function markMessagesAsRead(roomId, userId) {
  try {
    const chatsCollection = await getChatsCollection();
    const roomObjectId = new ObjectId(roomId);

    const unreadResult = await chatsCollection.updateOne(
      { _id: roomObjectId },
      {
        $set: {
          [`unreadCount.${userId}`]: 0,
          updatedAt: new Date(),
        },
      }
    );

    const messagesResult = await chatsCollection.updateOne(
      { _id: roomObjectId },
      { $set: { 'messages.$[elem].read': true } },
      { arrayFilters: [{ 'elem.senderId': { $ne: userId } }] }
    );

    return (
      unreadResult.modifiedCount > 0 || messagesResult.modifiedCount > 0
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

/**
 * Get all chat rooms for a user (any role).
 */
export async function getUserChatRooms(userId) {
  try {
    const chatsCollection = await getChatsCollection();
    const rooms = await chatsCollection
      .find({ 'participants.userId': userId })
      .sort({ updatedAt: -1 })
      .toArray();
    return rooms;
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    return [];
  }
}

/**
 * Get unread message count for a user across all rooms.
 */
export async function getUnreadCount(userId) {
  try {
    const chatsCollection = await getChatsCollection();
    const rooms = await chatsCollection
      .find({ 'participants.userId': userId })
      .toArray();

    let totalUnread = 0;
    rooms.forEach((room) => {
      totalUnread += room.unreadCount?.[userId] || 0;
    });

    return totalUnread;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Delete a chat room.
 */
export async function deleteChatRoom(roomId) {
  try {
    const chatsCollection = await getChatsCollection();
    const result = await chatsCollection.deleteOne({
      _id: new ObjectId(roomId),
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('cannot deleting chat:', error);
    throw error;
  }
}

/**
 * Delete a specific message from a room.
 */
export async function deleteMessage(roomId, messageId) {
  try {
    const chatsCollection = await getChatsCollection();
    const roomObjectId = new ObjectId(roomId);

    const room = await chatsCollection.findOne({ _id: roomObjectId });
    if (!room) return null;
    if (!Array.isArray(room.messages)) return false;

    const exists = room.messages.some((m) => m.id === messageId);
    if (!exists) return false;

    const result = await chatsCollection.updateOne(
      { _id: roomObjectId },
      {
        $pull: { messages: { id: messageId } },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('[deleteMessage] Error:', error);
    throw error;
  }
}
// // lib/db/chats.js
// import { getChatsCollection } from '../mongodb';
// import { getUserById } from './users';
// import { ObjectId } from 'mongodb';

// /**
//  * Get or create chat room between admin and user
//  */
// export async function getOrCreateChatRoom(userId, adminId) {
//   try {
//     const chatsCollection = await getChatsCollection();
    
//     let room = await chatsCollection.findOne({
//       'participants.userId': { $all: [userId, adminId] }
//     });
    
//     if (!room) {
//       const user = await getUserById(userId);
//       const admin = await getUserById(adminId);
      
//       const newRoom = {
//         participants: [
//           { userId, role: 'user', name: user?.displayName || user?.username || 'User' },
//           { userId: adminId, role: 'admin', name: admin?.displayName || admin?.username || 'Admin' }
//         ],
//         messages: [], // ✅ FIXED: Initialize messages array
//         lastMessage: null,
//         unreadCount: {
//           [userId]: 0,
//           [adminId]: 0
//         },
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
      
//       const result = await chatsCollection.insertOne(newRoom);
//       room = { ...newRoom, _id: result.insertedId };
//     }
//     return room;
//   } catch (error) {
//     console.error('Error getting/creating chat room:', error);
//     throw error;
//   }
// }

// /**
//  * Add message to chat room – NO expiration
//  */
// export async function addMessage(roomId, messageData) {
//   try {
//     console.log('🔵 [addMessage] Starting...');
//     console.log('🔵 [addMessage] roomId:', roomId);
//     console.log('🔵 [addMessage] messageData:', messageData);
    
//     const chatsCollection = await getChatsCollection();
//     const roomObjectId = new ObjectId(roomId);
    
//     const room = await chatsCollection.findOne({ _id: roomObjectId });
//     if (!room) {
//       console.log('🔴 [addMessage] Room NOT found!');
//       return null;
//     }
    
//     console.log('🔵 [addMessage] Room found. Current messages:', room.messages?.length || 0);
    
//     // ✅ FIXED: Ensure messages array exists before pushing
//     if (!room.messages) {
//       console.log('🔵 [addMessage] messages array missing, creating it...');
//       await chatsCollection.updateOne(
//         { _id: roomObjectId },
//         { $set: { messages: [] } }
//       );
//     }
    
//     const newMessage = {
//       id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
//       ...messageData,
//       timestamp: new Date(),
//       read: false,
//     };
    
//     console.log('🔵 [addMessage] newMessage:', newMessage);
    
//     // ✅ Update unread counts
//     const unreadCount = { ...room.unreadCount };
//     const senderId = messageData.senderId;
    
//     room.participants.forEach(p => {
//       if (p.userId !== senderId) {
//         unreadCount[p.userId] = (unreadCount[p.userId] || 0) + 1;
//       }
//     });
    
//     const result = await chatsCollection.updateOne(
//       { _id: roomObjectId },
//       { 
//         $push: { messages: newMessage },
//         $set: { 
//           lastMessage: {
//             text: messageData.message,
//             timestamp: new Date(),
//             senderId: messageData.senderId
//           },
//           unreadCount: unreadCount,
//           updatedAt: new Date()
//         }
//       }
//     );
    
//     console.log('🔵 [addMessage] Update result:', result);
//     console.log('🔵 [addMessage] Modified count:', result.modifiedCount);
    
//     const saved = result.modifiedCount > 0 ? newMessage : null;
//     console.log('🔵 [addMessage] Saved message:', saved);
    
//     return saved;
//   } catch (error) {
//     console.error('🔴 [addMessage] Error:', error);
//     throw error;
//   }
// }

// /**
//  * Get messages for a room – ALL messages, read OR unread
//  */
// export async function getRoomMessages(roomId) {
//   try {
//     console.log('🔵 [getRoomMessages] Fetching messages for room:', roomId);
    
//     const chatsCollection = await getChatsCollection();
//     const roomObjectId = new ObjectId(roomId);
    
//     const room = await chatsCollection.findOne({ _id: roomObjectId });
    
//     console.log('🔵 [getRoomMessages] Room found:', room ? 'YES' : 'NO');
//     console.log('🔵 [getRoomMessages] Messages in DB:', room?.messages?.length || 0);
    
//     if (room?.messages?.length > 0) {
//       console.log('🔵 [getRoomMessages] First message:', JSON.stringify(room.messages[0], null, 2));
//       console.log('🔵 [getRoomMessages] Last message:', JSON.stringify(room.messages[room.messages.length - 1], null, 2));
//     }
    
//     return room?.messages || [];
//   } catch (error) {
//     console.error('🔴 [getRoomMessages] Error:', error);
//     return [];
//   }
// }

// /**
//  * 🧪 TEST: Return hardcoded messages to test if the issue is in the database
//  */
// export async function getRoomMessagesTest(roomId) {
//   try {
//     console.log('🧪 [TEST] Returning hardcoded messages for room:', roomId);
    
//     // Hardcoded test messages – these should NEVER disappear
//     return [
//       { 
//         id: 'test1', 
//         senderId: 'admin', 
//         message: '🧪 TEST MESSAGE 1 - This should stay forever', 
//         timestamp: new Date().toISOString(),
//         createdAt: new Date().toISOString()
//       },
//       { 
//         id: 'test2', 
//         senderId: 'user', 
//         message: '🧪 TEST MESSAGE 2 - This should also stay', 
//         timestamp: new Date().toISOString(),
//         createdAt: new Date().toISOString()
//       },
//       { 
//         id: 'test3', 
//         senderId: 'admin', 
//         message: '🧪 TEST MESSAGE 3 - If these disappear, issue is in frontend', 
//         timestamp: new Date().toISOString(),
//         createdAt: new Date().toISOString()
//       },
//     ];
//   } catch (error) {
//     console.error('🧪 [TEST] Error:', error);
//     return [];
//   }
// }

// /**
//  * Mark messages as read – CORRECTLY FIXED (No duplicate $set bug)
//  */
// export async function markMessagesAsRead(roomId, userId) {
//   try {
//     console.log(`🔵 [markMessagesAsRead] Marking room ${roomId} as read for user ${userId}`);
    
//     const chatsCollection = await getChatsCollection();
//     const roomObjectId = new ObjectId(roomId);
    
//     // ✅ Step 1: Reset unread count for this user
//     const updateUnreadResult = await chatsCollection.updateOne(
//       { _id: roomObjectId },
//       { 
//         $set: { 
//           [`unreadCount.${userId}`]: 0,
//           updatedAt: new Date()
//         }
//       }
//     );
    
//     console.log(`🔵 [markMessagesAsRead] Unread count reset: ${updateUnreadResult.modifiedCount > 0}`);
    
//     // ✅ Step 2: Mark all messages from OTHER users as read
//     const updateMessagesResult = await chatsCollection.updateOne(
//       { _id: roomObjectId },
//       { 
//         $set: { 'messages.$[elem].read': true }
//       },
//       {
//         arrayFilters: [{ 'elem.senderId': { $ne: userId } }]
//       }
//     );
    
//     console.log(`🔵 [markMessagesAsRead] Messages marked as read: ${updateMessagesResult.modifiedCount > 0}`);
    
//     return updateUnreadResult.modifiedCount > 0 || updateMessagesResult.modifiedCount > 0;
//   } catch (error) {
//     console.error('🔴 Error marking messages as read:', error);
//     return false;
//   }
// }

// /**
//  * Get all chat rooms for a user
//  */
// export async function getUserChatRooms(userId) {
//   try {
//     const chatsCollection = await getChatsCollection();
//     const rooms = await chatsCollection
//       .find({ 'participants.userId': userId })
//       .sort({ updatedAt: -1 })
//       .toArray();
//     return rooms;
//   } catch (error) {
//     console.error('Error getting user chat rooms:', error);
//     return [];
//   }
// }

// /**
//  * Get unread message count for a user
//  */
// export async function getUnreadCount(userId) {
//   try {
//     const chatsCollection = await getChatsCollection();
//     const rooms = await chatsCollection
//       .find({ 'participants.userId': userId })
//       .toArray();
    
//     let totalUnread = 0;
//     rooms.forEach(room => {
//       totalUnread += room.unreadCount?.[userId] || 0;
//     });
    
//     return totalUnread;
//   } catch (error) {
//     console.error('Error getting unread count:', error);
//     return 0;
//   }
// }

// /**
//  * Delete a chat room
//  */
// export async function deleteChatRoom(roomId) {
//   try {
//     const chatsCollection = await getChatsCollection();
//     const result = await chatsCollection.deleteOne({ _id: new ObjectId(roomId) });
//     return result.deletedCount > 0;
//   } catch (error) {
//     console.error('cannot deleting chat:', error);
//     throw error;
//   }
// }

// /**
//  * ✅ NEW: Force mark ALL messages as read for ALL participants (Admin only)
//  * This completely resets unread counts and marks every message as read
//  */
// export async function forceMarkAllAsRead(roomId) {
//   try {
//     console.log(`🔵 [forceMarkAllAsRead] Force marking room ${roomId} as read for ALL participants`);
    
//     const chatsCollection = await getChatsCollection();
//     const roomObjectId = new ObjectId(roomId);

//     // ✅ Get the room to find all participants
//     const room = await chatsCollection.findOne({ _id: roomObjectId });
//     if (!room) {
//       console.log('🔴 [forceMarkAllAsRead] Room not found');
//       return null;
//     }

//     // ✅ Reset unreadCount for ALL participants
//     const unreadReset = {};
//     room.participants.forEach(p => {
//       unreadReset[`unreadCount.${p.userId}`] = 0;
//     });

//     // ✅ Mark ALL messages as read for everyone
//     const result = await chatsCollection.updateOne(
//       { _id: roomObjectId },
//       {
//         $set: {
//           ...unreadReset,  // Reset all unread counts to 0
//           'messages.$[].read': true,  // Mark ALL messages as read
//           updatedAt: new Date()
//         }
//       }
//     );

//     console.log(`🔵 [forceMarkAllAsRead] Modified count: ${result.modifiedCount}`);
//     return result;
//   } catch (error) {
//     console.error('🔴 [forceMarkAllAsRead] Error:', error);
//     throw error;
//   }
// }

// /**
//  * ✅ NEW: Delete a specific message from a room
//  * This function is required for the DELETE endpoint to work
//  */
// export async function deleteMessage(roomId, messageId) {
//   try {
//     console.log(`🔵 [deleteMessage] Deleting message ${messageId} from room ${roomId}`);
    
//     const chatsCollection = await getChatsCollection();
//     const roomObjectId = new ObjectId(roomId);
    
//     // ✅ Verify the room exists
//     const room = await chatsCollection.findOne({ _id: roomObjectId });
//     if (!room) {
//       console.log('🔴 [deleteMessage] Room not found');
//       return null;
//     }
    
//     // ✅ Ensure messages array exists
//     if (!room.messages) {
//       console.log('🔴 [deleteMessage] No messages to delete');
//       return false;
//     }
    
//     // ✅ Check if the message exists
//     const messageExists = room.messages.some(m => m.id === messageId);
//     if (!messageExists) {
//       console.log('🔴 [deleteMessage] Message not found');
//       return false;
//     }
    
//     // ✅ Remove the message using $pull
//     const result = await chatsCollection.updateOne(
//       { _id: roomObjectId },
//       { 
//         $pull: { messages: { id: messageId } },
//         $set: { updatedAt: new Date() }
//       }
//     );
    
//     console.log(`🔵 [deleteMessage] Modified count: ${result.modifiedCount}`);
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('🔴 [deleteMessage] Error:', error);
//     throw error;
//   }
// }

// // ---- Export all functions ----
// export {
//   // All existing exports are preserved
// };