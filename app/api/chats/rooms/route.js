// // app/api/chats/rooms/route.js
// import { NextResponse } from 'next/server';
// import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/db/chats';
// import { getUsersCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function GET(request) {
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
//     const rooms = await getUserChatRooms(userId);

//     return NextResponse.json({
//       success: true,
//       data: rooms.map(room => ({
//         ...room,
//         id: room._id.toString(),
//         _id: undefined,
//       })),
//     });

//   } catch (error) {
//     console.error('Error fetching chat rooms:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal error' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
//     let userId = null;
//     let isGuest = false;

//     // ✅ If a valid token exists, use the real user ID
//     if (token) {
//       const decoded = verifyToken(token);
//       if (decoded) {
//         userId = decoded.id || decoded.userId;
//       }
//     }

//     // ✅ If no token, check for a Guest ID in the body
//     if (!userId) {
//       const body = await request.json();
//       if (body.guestId) {
//         userId = body.guestId; // Use the guest ID as the user ID
//         isGuest = true;
//       } else {
//         return NextResponse.json(
//           { success: false, error: 'Authentication required' },
//           { status: 401 }
//         );
//       }
//     }

//     // Get Admin's actual ID from the database
//     const usersCollection = await getUsersCollection();
//     const adminUser = await usersCollection.findOne({ role: 'admin' });

//     if (!adminUser) {
//       return NextResponse.json(
//         { success: false, error: 'Admin user not found' },
//         { status: 404 }
//       );
//     }

//     const adminId = adminUser._id.toString();

//     // Create or fetch the room (Works for both real users and guests)
//     const room = await getOrCreateChatRoom(userId, adminId);

//     return NextResponse.json({
//       success: true,
//       data: { ...room, id: room._id.toString(), _id: undefined },
//     });
    
//   } catch (error) {
//     console.error('Error creating chat room:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }


// // app/api/chats/rooms/route.js
// import { NextResponse } from 'next/server';
// import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/db/chats';
// import { getUsersCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';
// import { ObjectId } from 'mongodb'; // ✅ ADD THIS

// export const runtime = 'nodejs';

// export async function GET(request) {
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
//     const rooms = await getUserChatRooms(userId);

//     return NextResponse.json({
//       success: true,
//       data: rooms.map(room => ({
//         ...room,
//         id: room._id.toString(),
//         _id: undefined,
//       })),
//     });

//   } catch (error) {
//     console.error('Error fetching chat rooms:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal error' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
//     let userId = null;
//     let isGuest = false;

//     // ✅ If a valid token exists, use the real user ID
//     if (token) {
//       const decoded = verifyToken(token);
//       if (decoded) {
//         userId = decoded.id || decoded.userId;
//       }
//     }

//     // ✅ If no token, check for a Guest ID in the body
//     if (!userId) {
//       const body = await request.json();
//       if (body.guestId) {
//         userId = body.guestId; // Use the guest ID as the user ID
//         isGuest = true;
//       } else {
//         return NextResponse.json(
//           { success: false, error: 'Authentication required' },
//           { status: 401 }
//         );
//       }
//     }

//     // ✅ Get the users collection
//     const usersCollection = await getUsersCollection();
    
//     // ✅ Check if current user is an admin
//     const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
//     const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin === true;

//     let adminId = null;
//     let realUserId = userId;

//     if (isAdmin) {
//       // ✅ ADMIN CHATTING: Find a regular user to chat with
//       console.log(`🔵 [rooms] Admin ${userId} is starting a chat`);
      
//       // First try to find a user who already has a room with this admin
//       const existingRooms = await getUserChatRooms(userId);
//       if (existingRooms.length > 0) {
//         // ✅ Use the first existing room's user
//         const room = existingRooms[0];
//         const participant = room.participants.find(p => p.userId !== userId);
//         if (participant) {
//           console.log(`🔵 [rooms] Using existing room with user ${participant.userId}`);
//           return NextResponse.json({
//             success: true,
//             data: { ...room, id: room._id.toString(), _id: undefined },
//           });
//         }
//       }

//       // ✅ Find the first active non-admin user
//       const userToChat = await usersCollection.findOne({ 
//         role: { $ne: 'admin' },
//         isActive: true,
//         _id: { $ne: new ObjectId(userId) }
//       });
      
//       if (userToChat) {
//         realUserId = userToChat._id.toString();
//         adminId = userId;
//         console.log(`🔵 [rooms] Found user ${realUserId} for admin to chat with`);
//       } else {
//         // ✅ If no user found, create a generic room
//         return NextResponse.json(
//           { success: false, error: 'No users available to chat with' },
//           { status: 404 }
//         );
//       }
//     } else {
//       // ✅ REGULAR USER CHATTING: Find the admin
//       console.log(`🔵 [rooms] User ${userId} is starting a chat`);
      
//       const adminUser = await usersCollection.findOne({ role: 'admin' });

//       if (!adminUser) {
//         return NextResponse.json(
//           { success: false, error: 'Admin user not found' },
//           { status: 404 }
//         );
//       }
//       adminId = adminUser._id.toString();
//       realUserId = userId;
//       console.log(`🔵 [rooms] Found admin ${adminId} for user to chat with`);
//     }

//     // ✅ Create or fetch the room (Works for both real users and guests)
//     const room = await getOrCreateChatRoom(realUserId, adminId);

//     return NextResponse.json({
//       success: true,
//       data: { ...room, id: room._id.toString(), _id: undefined },
//     });
    
//   } catch (error) {
//     console.error('Error creating chat room:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }
// app/api/chats/rooms/route.js
import { NextResponse } from 'next/server';
import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/db/chats';
import { getUsersCollection, getChatsCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

// Fetch all admins, formatted for getOrCreateChatRoom
async function getAllAdminUsers() {
  const usersCollection = await getUsersCollection();
  const admins = await usersCollection
    .find({ role: 'admin' })
    .project({ _id: 1, displayName: 1, username: 1, firstName: 1 })
    .toArray();

  return admins.map((a) => ({
    userId: a._id.toString(),
    name:
      a.displayName ||
      a.username ||
      a.firstName ||
      'Admin',
  }));
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id || decoded.userId;
    const rooms = await getUserChatRooms(userId);

    return NextResponse.json({
      success: true,
      data: rooms.map((room) => ({
        ...room,
        id: room._id.toString(),
        _id: undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    const body = await request.json().catch(() => ({}));

    let userId = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id || decoded.userId;
      }
    }

    if (!userId) {
      if (body.guestId) {
        userId = body.guestId;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const usersCollection = await getUsersCollection();
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin === true;

    // Shared model: EVERY room has every admin as a participant.
    const adminUsers = await getAllAdminUsers();
    if (adminUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No admin available' },
        { status: 404 }
      );
    }

    let realUserId = userId;

    if (isAdmin) {
      // Admin chatting: pick the target user
      if (body.targetUserId) {
        const targetUser = await usersCollection.findOne({
          _id: new ObjectId(body.targetUserId),
          role: { $ne: 'admin' },
        });

        if (!targetUser) {
          return NextResponse.json(
            { success: false, error: 'Target user not found or is admin' },
            { status: 404 }
          );
        }

        realUserId = body.targetUserId;
      } else {
        // Fall back to first existing room, else first active user
        const existingRooms = await getUserChatRooms(userId);
        if (existingRooms.length > 0) {
          const room = existingRooms[0];
          const userPart = room.participants.find((p) => p.role === 'user');
          if (userPart) {
            return NextResponse.json({
              success: true,
              data: { ...room, id: room._id.toString(), _id: undefined },
            });
          }
        }

        const userToChat = await usersCollection.findOne({
          role: { $ne: 'admin' },
          isActive: true,
          _id: { $ne: new ObjectId(userId) },
        });

        if (!userToChat) {
          return NextResponse.json(
            { success: false, error: 'No users available to chat with' },
            { status: 404 }
          );
        }

        realUserId = userToChat._id.toString();
      }
    }
    // Regular user: realUserId stays as userId

    const room = await getOrCreateChatRoom(realUserId, adminUsers);

    return NextResponse.json({
      success: true,
      data: { ...room, id: room._id.toString(), _id: undefined },
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error: ' + error.message },
      { status: 500 }
    );
  }
}