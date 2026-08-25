import { NextResponse } from 'next/server';
import { addMessage } from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, message, type = 'text', attachmentUrl } = body;

    if (!roomId || !message) {
      return NextResponse.json(
        { success: false, error: 'Room ID and message are required' },
        { status: 400 }
      );
    }

    const userId = decoded.id || decoded.userId;
    const senderName = decoded.name || 'User';
    const senderRole = decoded.role === 'admin' || decoded.isAdmin ? 'admin' : 'user';

    const newMessage = await addMessage(roomId, {
      senderId: userId,
      senderName,
      senderRole,
      message,
      type,
      attachmentUrl: attachmentUrl || null,
    });

    if (!newMessage) {
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: newMessage 
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}