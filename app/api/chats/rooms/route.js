// app/api/chats/rooms/route.js
import { NextResponse } from 'next/server';
import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/db/chats';
import { getUsersCollection } from '@/lib/mongodb'; // Import your users collection helper
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
    const body = await request.json();
    const { targetUserId } = body;

    // --- NEW AUTOMATIC ADMIN DETECTION LOGIC ---
    let realTargetId = targetUserId;

    // If the user passed "admin" as the target, the backend fetches the dynamic admin ID
    if (targetUserId === "admin" || !targetUserId) {
      const usersCollection = await getUsersCollection();
      const adminUser = await usersCollection.findOne({ role: 'admin' }); // Or { isAdmin: true } depending on your DB schema
      
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin user not found' },
          { status: 404 }
        );
      }
      realTargetId = adminUser._id.toString();
    }
    // --- END NEW LOGIC ---

    const isAdmin = decoded.role === 'admin' || decoded.isAdmin;
    const adminId = isAdmin ? userId : null;
    const userParticipantId = isAdmin ? realTargetId : userId;

    // Note: We pass userParticipantId and adminId to your existing helper
    const room = await getOrCreateChatRoom(userParticipantId, adminId || realTargetId);

    return NextResponse.json({
      success: true,
      data: {
        ...room,
        id: room._id.toString(),
        _id: undefined,
      },
    });

  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}