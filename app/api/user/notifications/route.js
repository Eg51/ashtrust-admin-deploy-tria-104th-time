import { NextResponse } from 'next/server';
import { getUserChatRooms } from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';

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
    
    // Get unread messages from all rooms
    const notifications = [];
    rooms.forEach(room => {
      const unreadMessages = room.messages?.filter(msg => 
        msg.senderId !== userId && !msg.read
      ) || [];
      
      unreadMessages.forEach(msg => {
        notifications.push({
          id: msg.id || `msg_${Date.now()}`,
          roomId: room._id.toString(),
          senderId: msg.senderId,
          senderName: msg.senderName || 'User',
          message: msg.message,
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          read: msg.read || false,
        });
      });
    });
    
    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}