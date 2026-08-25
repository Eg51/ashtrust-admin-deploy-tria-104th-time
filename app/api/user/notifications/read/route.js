import { NextResponse } from 'next/server';
import { getChatsCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';
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
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const chatsCollection = await getChatsCollection();
    
    // Mark specific message as read
    const result = await chatsCollection.updateOne(
      { 'messages.id': notificationId },
      { 
        $set: { 
          'messages.$.read': true 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}