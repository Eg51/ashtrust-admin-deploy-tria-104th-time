// app/api/chats/rooms/[roomId]/route.js
import { NextResponse } from 'next/server';
import { deleteChatRoom } from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
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

    // ✅ Check if user is admin
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // ✅ IMPORTANT: Await params in Next.js 15+
    const { roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      );
    }

    // ✅ Delete the room using the existing function
    const result = await deleteChatRoom(roomId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Room not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat room deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat room:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}