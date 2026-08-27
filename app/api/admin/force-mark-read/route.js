// app/api/admin/force-mark-read/route.js
import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/security';
import { getChatsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // ✅ 1. Verify Admin Authentication
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

    // ✅ 2. Verify Admin Role
    const isAdmin = decoded.role === 'admin' || decoded.isAdmin;
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // ✅ 3. Get Room ID from Body
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    const adminId = decoded.id || decoded.userId;
    console.log(`🔵 [force-mark-read] Admin ${adminId} forcing read for room ${roomId}`);

    const chatsCollection = await getChatsCollection();
    const roomObjectId = new ObjectId(roomId);

    // ✅ 4. Get the room to find all participants
    const room = await chatsCollection.findOne({ _id: roomObjectId });
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Chat room not found' },
        { status: 404 }
      );
    }

    // ✅ 5. Reset unreadCount for ALL participants
    const unreadReset = {};
    room.participants.forEach(p => {
      unreadReset[`unreadCount.${p.userId}`] = 0;
    });

    // ✅ 6. Mark ALL messages as read for everyone
    // Update the room: reset unread counts and mark all messages as read
    const result = await chatsCollection.updateOne(
      { _id: roomObjectId },
      {
        $set: {
          ...unreadReset,  // Reset all unread counts to 0
          'messages.$[].read': true,  // Mark ALL messages as read
          updatedAt: new Date()
        }
      }
    );

    console.log(`🔵 [force-mark-read] Modified count: ${result.modifiedCount}`);

    return NextResponse.json({
      success: true,
      message: 'All messages marked as read for all participants',
      data: {
        roomId,
        adminId,
        participants: room.participants.map(p => p.userId),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('🔴 Error in force-mark-read:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}