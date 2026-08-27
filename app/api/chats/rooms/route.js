// app/api/chats/rooms/route.js
import { NextResponse } from 'next/server';
import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/db/chats';
import { getUsersCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

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
      data: rooms.map(room => ({
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
    let userId = null;
    let isGuest = false;

    // ✅ If a valid token exists, use the real user ID
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id || decoded.userId;
      }
    }

    // ✅ If no token, check for a Guest ID in the body
    if (!userId) {
      const body = await request.json();
      if (body.guestId) {
        userId = body.guestId; // Use the guest ID as the user ID
        isGuest = true;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Get Admin's actual ID from the database
    const usersCollection = await getUsersCollection();
    const adminUser = await usersCollection.findOne({ role: 'admin' });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const adminId = adminUser._id.toString();

    // Create or fetch the room (Works for both real users and guests)
    const room = await getOrCreateChatRoom(userId, adminId);

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