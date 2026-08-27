import { NextResponse } from 'next/server';
import { getRoomMessages, addMessage, markMessagesAsRead } from '@/lib/db/chats';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
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

    // ✅ IMPORTANT: Await params in Next.js 15+
    const { roomId } = await params;
    const messages = await getRoomMessages(roomId);

    const userId = decoded.id || decoded.userId;
    await markMessagesAsRead(roomId, userId);

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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

    // ✅ IMPORTANT: Await params in Next.js 15+
    const { roomId } = await params;
    const body = await request.json();
    const { message, type = 'text', attachmentUrl } = body;

    if (!message && !attachmentUrl) {
      return NextResponse.json({ success: false, error: 'Message or attachment required' }, { status: 400 });
    }

    const userId = decoded.id || decoded.userId;
    const senderRole = decoded.role === 'admin' || decoded.isAdmin ? 'admin' : 'user';

    const newMessage = await addMessage(roomId, {
      senderId: userId,
      senderRole,
      message,
      type,
      attachmentUrl: attachmentUrl || null,
    });

    if (!newMessage) {
      return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}