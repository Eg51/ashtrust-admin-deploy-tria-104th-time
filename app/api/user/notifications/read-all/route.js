import { NextResponse } from 'next/server';
import { getUserChatRooms } from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';
import { getChatsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    const chatsCollection = await getChatsCollection();
    
    // Mark all messages as read for this user
    const result = await chatsCollection.updateMany(
      { 'participants.userId': userId },
      { 
        $set: { 
          'messages.$[elem].read': true 
        } 
      },
      {
        arrayFilters: [{ 'elem.senderId': { $ne: userId } }]
      }
    );

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}