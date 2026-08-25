// app/api/user/avatar/route.js
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/db/users';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const currentUserId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    const userId = targetUserId || currentUserId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const isOwn = userId === currentUserId;
    const isAdmin = role === 'admin';
    if (!isOwn && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await getUserById(userId);
    if (!user || !user.avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { avatar: user.avatar, hasAvatar: user.hasAvatar || false },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const currentUserId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || currentUserId;

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isOwn = targetUserId === currentUserId;
    const isAdmin = role === 'admin';
    if (!isOwn && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { updateUser } = await import('@/lib/db/users');
    await updateUser(targetUserId, { avatar: null, hasAvatar: false });

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}