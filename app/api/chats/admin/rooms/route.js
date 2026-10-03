// app/api/chats/admin/rooms/route.js
//
// GET — return every chat room the current admin is a participant in,
// hydrated with the other participant's display data, last message,
// and the admin's unread count.
//
// Admin only. Regular users receive 403.

import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/security';
import { getUserById } from '@/lib/db/users';
import { getAdminChatRoomsDetailed } from '@/lib/db/adminChats';

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

    // Re-verify admin status against the DB — never trust the token's
    // role claim alone.
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'admin' || user.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const rooms = await getAdminChatRoomsDetailed(userId);

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('[admin/chats/rooms GET] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}