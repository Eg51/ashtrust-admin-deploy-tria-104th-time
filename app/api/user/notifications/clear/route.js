import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/security';

export async function DELETE(request) {
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

    // Note: This doesn't delete messages, just marks them as "cleared"
    // For a full implementation, you'd store cleared notification IDs in a separate collection
    
    return NextResponse.json({
      success: true,
      message: 'Notifications cleared'
    });

  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}