// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db/users';
import { verifyToken, extractToken } from '@/lib/security';

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

    // Check if user is admin
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await getAllUsers(100);
    
    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        id: user._id.toString(),
        _id: undefined,
        password: undefined,
      })),
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}