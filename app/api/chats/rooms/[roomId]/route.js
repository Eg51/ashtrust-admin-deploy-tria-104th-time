import { NextResponse } from 'next/server';
import { getRoomMessages, addMessage, markMessagesAsRead, deleteChatRoom} from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';


export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    console.log('🔵 [API GET] Starting...');
    
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // ✅ CRITICAL FIX: Await params (Next.js 15+)
    const { roomId } = await params;
    console.log('🔵 [API GET] roomId:', roomId);

    // ✅ Get messages from database
    const messages = await getRoomMessages(roomId);
    console.log('🔵 [API GET] Messages from DB:', messages.length);
    
    const userId = decoded.id || decoded.userId;
    await markMessagesAsRead(roomId, userId);
    console.log('🔵 [API GET] Messages marked as read');

    return NextResponse.json({ success: true, data: messages });

  } catch (error) {
    console.error('🔴 [API GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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

    // ✅ CRITICAL FIX: Await params (Next.js 15+)
    const { roomId } = await params;
    const body = await request.json();
    const { message, type = 'text', attachmentUrl } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
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
      message: 'Message sent successfully', 
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
export async function DELETE(request, { params }) {
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

    // ✅ Check if user is admin
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { roomId } = await params;
    console.log('🔵 [API DELETE] Deleting room:', roomId);

    const result = await deleteChatRoom(roomId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'chat not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat room deleted successfully'
    });

  } catch (error) {
    console.error('🔴 [API DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}