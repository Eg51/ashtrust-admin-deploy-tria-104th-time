// // lib/db/users.js
// import { getUsersCollection } from '../mongodb';
// import { ObjectId } from 'mongodb';

// // --- Ensure unique indexes on email and username ---
// // Call this once during app initialization (e.g., in mongodb.js or a startup script)
// export async function ensureUserIndexes() {
//   try {
//     const usersCollection = await getUsersCollection();
//     await usersCollection.createIndex({ email: 1 }, { unique: true });
//     await usersCollection.createIndex({ username: 1 }, { unique: true });
//     console.log('✅ User indexes ensured (email and username)');
//   } catch (error) {
//     console.error('❌ Error creating user indexes:', error);
//   }
// }

// /**
//  * Get user by ID
//  */
// export async function getUserById(userId) {
//   try {
//     const usersCollection = await getUsersCollection();
//     return await usersCollection.findOne({ _id: new ObjectId(userId) });
//   } catch (error) {
//     console.error('Error getting user by ID:', error);
//     return null;
//   }
// }

// /**
//  * Get user by email
//  */
// export async function getUserByEmail(email) {
//   try {
//     const usersCollection = await getUsersCollection();
//     return await usersCollection.findOne({ email: email.toLowerCase() });
//   } catch (error) {
//     console.error('Error getting user by email:', error);
//     return null;
//   }
// }

// /**
//  * ✅ NEW: Get user by username
//  */
// export async function getUserByUsername(username) {
//   try {
//     const usersCollection = await getUsersCollection();
//     return await usersCollection.findOne({ username: username.toLowerCase() });
//   } catch (error) {
//     console.error('Error getting user by username:', error);
//     return null;
//   }
// }

// /**
//  * Create new user – updated to include firstName, lastName, username, displayName
//  */
// export async function createUser(userData) {
//   try {
//     const usersCollection = await getUsersCollection();

//     // Normalize and extract new fields
//     const {
//       firstName,
//       lastName,
//       username,
//       displayName,
//       email,
//       password,
//       phone = '',
//       accountType = 'personal',
//       role = 'user',
//       isActive = true,
//       // ... other fields
//     } = userData;

//     // Ensure we have required fields
//     if (!firstName || !lastName || !username || !email || !password) {
//       throw new Error('Missing required fields: firstName, lastName, username, email, password');
//     }

//     const newUser = {
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       username: username.toLowerCase().trim(),
//       displayName: displayName || username, // fallback to username
//       email: email.toLowerCase().trim(),
//       password, // hashed password should already be provided
//       phone,
//       accountType,
//       role,
//       emailVerified: false,
//       isActive,
//       loginCount: 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     const result = await usersCollection.insertOne(newUser);
//     return { ...newUser, _id: result.insertedId };
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw error;
//   }
// }

// /**
//  * Update user – no changes needed here unless you want to update username/displayName
//  */
// export async function updateUser(userId, updateData) {
//   try {
//     const usersCollection = await getUsersCollection();
//     updateData.updatedAt = new Date();
//     const result = await usersCollection.updateOne(
//       { _id: new ObjectId(userId) },
//       { $set: updateData }
//     );
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('Error updating user:', error);
//     throw error;
//   }
// }

// /**
//  * Get all users (admin only) – exclude password, include new fields
//  */
// export async function getAllUsers(limit = 100) {
//   try {
//     const usersCollection = await getUsersCollection();
//     return await usersCollection
//       .find({}, { projection: { password: 0 } })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .toArray();
//   } catch (error) {
//     console.error('Error getting all users:', error);
//     return [];
//   }
// }

// /**
//  * Delete user
//  */
// export async function deleteUser(userId) {
//   try {
//     const usersCollection = await getUsersCollection();
//     const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
//     return result.deletedCount > 0;
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     throw error;
//   }
// }

// /**
//  * Search users by first name, last name, username, or email
//  */
// export async function searchUsers(searchTerm) {
//   try {
//     const usersCollection = await getUsersCollection();
//     const regex = new RegExp(searchTerm, 'i');
//     return await usersCollection
//       .find({
//         $or: [
//           { firstName: regex },
//           { lastName: regex },
//           { username: regex },
//           { displayName: regex },
//           { email: regex }
//         ]
//       }, { projection: { password: 0 } })
//       .limit(20)
//       .toArray();
//   } catch (error) {
//     console.error('Error searching users:', error);
//     return [];
//   }
// }



// lib/db/users.js
import { getUsersCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

// --- Ensure unique indexes on email and username ---
// Call this once during app initialization (e.g., in mongodb.js or a startup script)
export async function ensureUserIndexes() {
  try {
    const usersCollection = await getUsersCollection();
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ User indexes ensured (email and username)');
  } catch (error) {
    console.error('❌ Error creating user indexes:', error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const usersCollection = await getUsersCollection();
    return await usersCollection.findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  try {
    const usersCollection = await getUsersCollection();
    return await usersCollection.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username) {
  try {
    const usersCollection = await getUsersCollection();
    return await usersCollection.findOne({ username: username.toLowerCase() });
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

/**
 * Create new user – updated to include firstName, lastName, username, displayName, hasAvatar
 */
export async function createUser(userData) {
  try {
    const usersCollection = await getUsersCollection();

    const {
      firstName,
      lastName,
      username,
      displayName,
      email,
      password,
      address = '',
      phone = '',
      accountType = 'personal',
      role = 'user',
      isActive = true,
      hasAvatar = false,
    } = userData;

    if (!firstName || !lastName || !username || !email || !password) {
      throw new Error('Missing required fields: firstName, lastName, phone, address, username, email, password');
    }

    const newUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.toLowerCase().trim(),
      displayName: displayName || username,
      email: email.toLowerCase().trim(),
      password,
      address,
      phone,
      accountType,
      role,
      emailVerified: false,
      isActive,
      hasAvatar: false,
      avatar: null,
      loginCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user – now handles hasAvatar
 */
export async function updateUser(userId, updateData) {
  try {
    const usersCollection = await getUsersCollection();
    
    const allowedFields = [
      'firstName',
      'lastName',
      'username',
      'displayName',
      'email',
      'phone',
      'address',        
      'accountType',
      'role',
      'isActive',
      'hasAvatar',
      'avatar',
      'emailVerified',
      'loginCount',
      'password',
      'loginAttempts',
      'lockUntil',
    ];
    
    const sanitizedData = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        sanitizedData[key] = updateData[key];
      }
    }
    
    sanitizedData.updatedAt = new Date();
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: sanitizedData }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Update user's avatar status specifically
 */
export async function updateUserAvatar(userId, hasAvatar) {
  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          hasAvatar: hasAvatar,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw error;
  }
}

/**
 * Get all users (admin only) – exclude password, include hasAvatar
 */
export async function getAllUsers(limit = 100) {
  try {
    const usersCollection = await getUsersCollection();
    return await usersCollection
      .find(
        {}, 
        { 
          projection: { 
            password: 0 
          } 
        }
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Get all users with avatars (for admin)
 */
export async function getUsersWithAvatars(limit = 100) {
  try {
    const usersCollection = await getUsersCollection();
    return await usersCollection
      .find(
        { hasAvatar: true },
        { 
          projection: { 
            password: 0 
          } 
        }
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error getting users with avatars:', error);
    return [];
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Search users by first name, last name, username, or email
 */
export async function searchUsers(searchTerm) {
  try {
    const usersCollection = await getUsersCollection();
    const regex = new RegExp(searchTerm, 'i');
    return await usersCollection
      .find(
        {
          $or: [
            { firstName: regex },
            { lastName: regex },
            { username: regex },
            { displayName: regex },
            { email: regex },
            {address: regex}
          ]
        }, 
        { 
          projection: { 
            password: 0 
          } 
        }
      )
      .limit(20)
      .toArray();
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}