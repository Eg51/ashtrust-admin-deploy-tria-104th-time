import { NextResponse } from 'next/server';
import { getUnreadCount } from '@/lib/db/chats';
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
    const totalUnread = await getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: { totalUnread }
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}