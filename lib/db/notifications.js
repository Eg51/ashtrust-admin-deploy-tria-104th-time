// import { getCollection } from '../mongodb';

// const COLLECTION = 'notifications';

// // Recognised types. Anything else is rejected.
// export const NOTIFICATION_TYPES = new Set([
//   'login',
//   'register',
//   'purchase',
//   'withdrawal',
//   'message',
//   'password_reset',
//   'settings_update',
// ]);

// // Short label shown on the notification card
// const TYPE_LABELS = {
//   login: 'Log in detected',
//   register: 'New user',
//   purchase: 'Purchase in progress',
//   withdrawal: 'Withdrawal request',
//   message: 'New message',
//   password_reset: 'Reset attempt',
//   settings_update: 'User details updated',
// };

// function labelFor(type) {
//   return TYPE_LABELS[type] || 'Activity';
// }

// /**
//  * Create or bump a notification for a (userId, type) pair.
//  *
//  * If a matching row exists:
//  *   - count is incremented
//  *   - detail / metadata / avatar / username / email are refreshed
//  *   - updatedAt moves forward
//  * If not, a new row is inserted with count = 1.
//  *
//  * @returns {Promise<{ success: boolean, error?: string }>}
//  */
// export async function createOrBumpNotification({
//   type,
//   userId,
//   username,
//   email,
//   avatar,
//   detail,
//   metadata,
// }) {
//   try {
//     if (!type || !NOTIFICATION_TYPES.has(type)) {
//       return { success: false, error: 'Invalid notification type' };
//     }
//     if (!userId) {
//       return { success: false, error: 'userId required' };
//     }

//     const collection = await getCollection(COLLECTION);
//     const now = new Date();

//     const clean = {
//       username: typeof username === 'string' ? username.slice(0, 100) : '',
//       email: typeof email === 'string' ? email.slice(0, 200) : '',
//       avatar: typeof avatar === 'string' ? avatar.slice(0, 200_000) : null,
//       detail: typeof detail === 'string' ? detail.slice(0, 300) : '',
//     };

//     await collection.updateOne(
//       { userId: String(userId), type },
//       {
//         $set: {
//           userId: String(userId),
//           type,
//           label: labelFor(type),
//           username: clean.username,
//           email: clean.email,
//           avatar: clean.avatar,
//           detail: clean.detail,
//           metadata: metadata && typeof metadata === 'object' ? metadata : {},
//           updatedAt: now,
//         },
//         $setOnInsert: {
//           createdAt: now,
//         },
//         $inc: { count: 1 },
//       },
//       { upsert: true }
//     );

//     return { success: true };
//   } catch (error) {
//     console.error('[notifications] createOrBump error:', error);
//     return { success: false, error: 'Failed to create notification' };
//   }
// }

// /**
//  * Return all pending notifications, newest first.
//  * _id is serialized to string to keep the client safe.
//  */
// export async function getAllNotifications() {
//   try {
//     const collection = await getCollection(COLLECTION);
//     const rows = await collection
//       .find({})
//       .sort({ updatedAt: -1 })
//       .limit(100)
//       .toArray();

//     return rows.map((row) => ({
//       ...row,
//       _id: row._id.toString(),
//     }));
//   } catch (error) {
//     console.error('[notifications] getAll error:', error);
//     return [];
//   }
// }

// /**
//  * Delete a single notification by _id.
//  */
// export async function deleteNotificationById(id) {
//   try {
//     if (!id || typeof id !== 'string') {
//       return { success: false, error: 'id required' };
//     }

//     const { ObjectId } = await import('mongodb');
//     if (!ObjectId.isValid(id)) {
//       return { success: false, error: 'invalid id' };
//     }

//     const collection = await getCollection(COLLECTION);
//     const result = await collection.deleteOne({ _id: new ObjectId(id) });

//     return { success: true, deleted: result.deletedCount };
//   } catch (error) {
//     console.error('[notifications] deleteById error:', error);
//     return { success: false, error: 'Failed to delete notification' };
//   }
// }

// /**
//  * Delete every pending notification. Used by the "Clear all" button.
//  */
// export async function deleteAllNotifications() {
//   try {
//     const collection = await getCollection(COLLECTION);
//     const result = await collection.deleteMany({});
//     return { success: true, deleted: result.deletedCount };
//   } catch (error) {
//     console.error('[notifications] deleteAll error:', error);
//     return { success: false, error: 'Failed to clear notifications' };
//   }
// }
import { getCollection } from '../mongodb';

const COLLECTION = 'notifications';

// Recognised types. Anything else is rejected.
export const NOTIFICATION_TYPES = new Set([
  'login',
  'login_failed',
  'login_blocked',
  'login_inactive',
  'register',
  'purchase',
  'withdrawal',
  'message',
  'password_reset',
  'settings_update',
]);

// Short label shown on the notification card
const TYPE_LABELS = {
  login: 'Log in detected',
  login_failed: 'Wrong password',
  login_blocked: 'Blocked sign-in attempt',
  login_inactive: 'Deactivated account attempt',
  register: 'New user',
  purchase: 'Purchase in progress',
  withdrawal: 'Withdrawal request',
  message: 'New message',
  password_reset: 'Reset attempt',
  settings_update: 'User details updated',
};

function labelFor(type) {
  return TYPE_LABELS[type] || 'Activity';
}

/**
 * Create or bump a notification for a (userId, type) pair.
 *
 * If a matching row exists:
 *   - count is incremented
 *   - detail / metadata / avatar / username / email are refreshed
 *   - updatedAt moves forward
 * If not, a new row is inserted with count = 1.
 *
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function createOrBumpNotification({
  type,
  userId,
  username,
  email,
  avatar,
  detail,
  metadata,
}) {
  try {
    if (!type || !NOTIFICATION_TYPES.has(type)) {
      return { success: false, error: 'Invalid notification type' };
    }
    if (!userId) {
      return { success: false, error: 'userId required' };
    }

    const collection = await getCollection(COLLECTION);
    const now = new Date();

    const clean = {
      username: typeof username === 'string' ? username.slice(0, 100) : '',
      email: typeof email === 'string' ? email.slice(0, 200) : '',
      avatar: typeof avatar === 'string' ? avatar.slice(0, 200_000) : null,
      detail: typeof detail === 'string' ? detail.slice(0, 300) : '',
    };

    await collection.updateOne(
      { userId: String(userId), type },
      {
        $set: {
          userId: String(userId),
          type,
          label: labelFor(type),
          username: clean.username,
          email: clean.email,
          avatar: clean.avatar,
          detail: clean.detail,
          metadata: metadata && typeof metadata === 'object' ? metadata : {},
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
        $inc: { count: 1 },
      },
      { upsert: true }
    );

    return { success: true };
  } catch (error) {
    console.error('[notifications] createOrBump error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

/**
 * Return all pending notifications, newest first.
 * _id is serialized to string to keep the client safe.
 */
export async function getAllNotifications() {
  try {
    const collection = await getCollection(COLLECTION);
    const rows = await collection
      .find({})
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return rows.map((row) => ({
      ...row,
      _id: row._id.toString(),
    }));
  } catch (error) {
    console.error('[notifications] getAll error:', error);
    return [];
  }
}

/**
 * Delete a single notification by _id.
 */
export async function deleteNotificationById(id) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'id required' };
    }

    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return { success: false, error: 'invalid id' };
    }

    const collection = await getCollection(COLLECTION);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return { success: true, deleted: result.deletedCount };
  } catch (error) {
    console.error('[notifications] deleteById error:', error);
    return { success: false, error: 'Failed to delete notification' };
  }
}

/**
 * Delete every pending notification. Used by the "Clear all" button.
 */
export async function deleteAllNotifications() {
  try {
    const collection = await getCollection(COLLECTION);
    const result = await collection.deleteMany({});
    return { success: true, deleted: result.deletedCount };
  } catch (error) {
    console.error('[notifications] deleteAll error:', error);
    return { success: false, error: 'Failed to clear notifications' };
  }
}